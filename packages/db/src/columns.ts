import { integer, text } from "drizzle-orm/sqlite-core";
import { randomUUID } from "node:crypto";

/**
 * Shared column builders used by every table in `@kara/db`.
 *
 * Conventions (see doc 08 §2 for the full rationale):
 *  - **IDs** are opaque text primary keys with a human-readable type prefix, so a raw
 *    SQL dump stays legible (`meet_a1b2c3...` rather than `42`). Docs 05/06 use the
 *    same shorthand (`obj_deal`, `meet_12893`).
 *  - **Timestamps** are stored as unix **milliseconds** (matching the vector metadata
 *    shape in doc 04 §3, e.g. `1727184000000`). Never store ISO strings: SQLite has no
 *    native date type and ms integers sort and range-scan correctly under a B-tree.
 *  - **Soft deletes** use a nullable `deleted_at`. Every read path must filter
 *    `isNull(table.deletedAt)` unless explicitly auditing.
 */

/** Generates `<prefix>_<24 hex chars>` — e.g. `meet_9f2c4a1b8d3e5f60718293a4`. */
export function prefixedId(prefix: string): string {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 24)}`;
}

/**
 * Text primary key with an application-generated prefixed id.
 * Using a client-side id (not AUTOINCREMENT) lets the API, bot webhooks, and seed
 * scripts mint ids without a round-trip, which keeps the recording pipeline write-once.
 */
export const primaryId = (prefix: string) =>
  text("id")
    .primaryKey()
    .$defaultFn(() => prefixedId(prefix));

/** `created_at` — unix ms, set once on insert. */
export const createdAt = () =>
  integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date());

/**
 * `updated_at` — unix ms, set on insert and refreshed by Drizzle on `update()`.
 * Note: `$onUpdate` only fires for Drizzle-issued UPDATEs. Raw SQL writes (seed
 * scripts, manual migrations) must set this column explicitly.
 */
export const updatedAt = () =>
  integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date());

/** `deleted_at` — unix ms, NULL while the row is live (soft-delete marker). */
export const deletedAt = () =>
  integer("deleted_at", { mode: "timestamp_ms" });

/**
 * Tenant discriminator present on every domain table. Every query in the API layer
 * must be scoped by `org_id`; this is the column the composite indexes lead with.
 */
export const orgId = () =>
  text("org_id").notNull();

/** Boolean stored as SQLite INTEGER 0/1 (doc 08 §7 notes the PG port to `boolean`). */
export const bool = (name: string) =>
  integer(name, { mode: "boolean" });
