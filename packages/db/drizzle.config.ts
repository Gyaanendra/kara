import { defineConfig } from "drizzle-kit";

/**
 * drizzle-kit configuration for the SQLite development target.
 *
 * `DATABASE_URL` is the same variable the runtime uses (`.env.example`), so a
 * migration and the application always agree on which file they are talking to.
 *
 * Commands (run from `packages/db`):
 *   pnpm db:generate   # diff schema -> new .sql migration in ./drizzle
 *   pnpm db:migrate    # apply pending migrations
 *   pnpm db:push       # dev-only: push schema directly, no migration files
 *   pnpm db:studio     # browse the data
 *
 * PostgreSQL migration path is documented in docs/08 §7.
 */
export default defineConfig({
  dialect: "sqlite",
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  },
  strict: true,
  verbose: true,
});
