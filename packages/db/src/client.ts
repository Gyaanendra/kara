import postgres from "postgres";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as dotenv from "dotenv";
import * as path from "path";

// Auto-load root .env and local .env
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import * as schema from "./schema/index.js";

export type KaraDatabase = PostgresJsDatabase<typeof schema> & {
  $client: postgres.Sql;
};

export { schema };

export interface CreateDbOptions {
  url?: string;
  maxConnections?: number;
}

export function createDb(options: CreateDbOptions = {}): KaraDatabase {
  const url =
    options.url ??
    process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@localhost:5432/kara_dev?schema=public";

  const client = postgres(url, {
    max: options.maxConnections ?? 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  return drizzle(client, { schema }) as KaraDatabase;
}

let singleton: KaraDatabase | undefined;

export function getDb(): KaraDatabase {
  singleton ??= createDb();
  return singleton;
}

export async function closeDb(): Promise<void> {
  if (!singleton) return;
  await singleton.$client.end();
  singleton = undefined;
}
