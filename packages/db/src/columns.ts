import { boolean, text, timestamp, customType } from "drizzle-orm/pg-core";
import { randomUUID } from "node:crypto";

/**
 * Shared column builders used by every table in `@kara/db`.
 * Targets PostgreSQL 18 Native.
 */

/** Generates `<prefix>_<24 hex chars>` — e.g. `meet_9f2c4a1b8d3e5f60718293a4`. */
export function prefixedId(prefix: string): string {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 24)}`;
}

/** Text primary key with application-generated prefixed id. */
export const primaryId = (prefix: string) =>
  text("id")
    .primaryKey()
    .$defaultFn(() => prefixedId(prefix));

/** `created_at` — timestamp with timezone, defaulting to now. */
export const createdAt = () =>
  timestamp("created_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull();

/** `updated_at` — timestamp with timezone, refreshed by Drizzle on update. */
export const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date());

/** `deleted_at` — nullable soft-delete marker. */
export const deletedAt = () =>
  timestamp("deleted_at", { withTimezone: true, mode: "date" });

/** Tenant discriminator present on every domain table. */
export const orgId = () =>
  text("org_id").notNull();

/** Boolean column. */
export const bool = (name: string) =>
  boolean(name);

/**
 * Vector representation. Stored as JSONB array for zero-dependency portability
 * across standard vanilla PostgreSQL installations on Windows.
 */
export const pgVector = customType<{
  data: number[];
  driverData: string;
  config: { dimensions?: number };
}>({
  dataType() {
    return "jsonb";
  },
  toDriver(value: number[]): string {
    return JSON.stringify(value);
  },
  fromDriver(value: unknown): number[] {
    if (Array.isArray(value)) return value as number[];
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return value.replace(/[\[\]]/g, "").split(",").map(Number);
      }
    }
    return [];
  },
});
