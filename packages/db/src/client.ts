import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

import * as schema from "./schema/index.js";

/** Fully-typed Drizzle handle carrying the whole Kara schema. */
export type KaraDatabase = BetterSQLite3Database<typeof schema> & {
  $client: Database.Database;
};

export { schema };

export interface CreateDbOptions {
  /** Defaults to `process.env.DATABASE_URL`, then `file:./dev.db`. */
  url?: string;
  /**
   * Read-only handles are used by verification scripts so they can never
   * accidentally mutate a developer's database.
   */
  readonly?: boolean;
}

/**
 * Applies the pragmas that make SQLite safe for a multi-process workload.
 *
 * These are not optional tuning — doc 03 §1 documents the previous prototype dying on
 * `OperationalError: database is locked` because several workers wrote concurrently.
 *
 *  - `journal_mode = WAL`   readers never block the writer; the API can serve list
 *                           views while a BullMQ worker bulk-inserts a transcript.
 *  - `busy_timeout = 5000`  instead of failing instantly, a writer waits up to 5s for
 *                           the lock. This is the single most important line here.
 *  - `synchronous = NORMAL` safe under WAL, and much faster for the large batch
 *                           inserts in the transcription pipeline.
 *  - `foreign_keys = ON`    SQLite disables FK enforcement per-connection by default;
 *                           without this the `onDelete: "cascade"` rules are inert.
 */
function applyPragmas(sqlite: Database.Database, readonly: boolean): void {
  if (readonly) {
    sqlite.pragma("query_only = ON");
    return;
  }
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("synchronous = NORMAL");
  sqlite.pragma("busy_timeout = 5000");
  sqlite.pragma("foreign_keys = ON");
}

/** Strips the `file:` scheme that `.env` uses for parity with the Postgres URL form. */
function resolveFilename(url: string): string {
  if (url.startsWith("file:")) {
    return url.slice("file:".length);
  }
  throw new Error(
    `Unsupported DATABASE_URL "${url}". This build targets SQLite only; expected a ` +
      `"file:./dev.db" style URL. See docs/08 §7 for the PostgreSQL migration path.`,
  );
}

/**
 * Opens a new connection. Prefer {@link getDb} in application code so that the API
 * process reuses one handle instead of opening a connection per request.
 */
export function createDb(options: CreateDbOptions = {}): KaraDatabase {
  const url = options.url ?? process.env.DATABASE_URL ?? "file:./dev.db";
  const sqlite = new Database(resolveFilename(url), {
    readonly: options.readonly ?? false,
  });
  applyPragmas(sqlite, options.readonly ?? false);
  return drizzle(sqlite, { schema });
}

let singleton: KaraDatabase | undefined;

/** Process-wide singleton. Lazily created on first call. */
export function getDb(): KaraDatabase {
  singleton ??= createDb();
  return singleton;
}

/** Closes the singleton handle and drops the cache — used in tests and shutdown hooks. */
export function closeDb(): void {
  if (!singleton) return;
  // `$client` is Drizzle's escape hatch to the underlying driver instance.
  singleton.$client.close();
  singleton = undefined;
}
