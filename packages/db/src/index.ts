/**
 * `@kara/db` — the Kara persistence layer.
 *
 * Two things are exported:
 *  - the schema (`meetings`, `tasks`, `crmRecords`, ... and their relations), so the
 *    API layer can build type-safe queries;
 *  - the connection factory (`getDb`, `createDb`, `closeDb`).
 *
 * Usage:
 * ```ts
 * import { getDb, tasks, eq } from "@kara/db";
 *
 * const db = getDb();
 * const open = await db.select().from(tasks).where(eq(tasks.status, "TODO"));
 * ```
 *
 * Phase 3 of doc 07 will add the seed script and typed query helpers on top of this.
 */

export * from "./schema/index.js";
export * from "./client.js";
