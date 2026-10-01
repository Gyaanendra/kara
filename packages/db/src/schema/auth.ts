import { relations } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { MembershipStatus, UserRole } from "@kara/shared-types";

import { bool, createdAt, deletedAt, orgId, primaryId, updatedAt } from "../columns.js";

/** Subscription tiers. Kept as a literal union so `text().$type<OrgPlan>()` stays narrow. */
export type OrgPlan = "FREE" | "TEAM" | "BUSINESS" | "ENTERPRISE";

/**
 * Enum columns use `.$type<Enum>()` rather than `{ enum: [...] }`.
 *
 * On SQLite the `enum` config is a type-inference helper only — it emits no DDL (there
 * is no `CREATE TYPE`, and drizzle-kit writes a plain `TEXT` column either way). The
 * only real enforcement is compile-time, which `$type` provides directly while also
 * accepting a TypeScript enum object. When the PostgreSQL port lands (doc 08 §7),
 * these become `pgEnum` (or `text` + `CHECK`) and gain database-level enforcement.
 */

/** Tenant root. Every other domain table hangs off an organization. */
export const organizations = sqliteTable(
  "organizations",
  {
    id: primaryId("org"),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    domain: text("domain"),
    logoUrl: text("logo_url"),
    plan: text("plan").$type<OrgPlan>().notNull().default("FREE"),
    settings: text("settings", { mode: "json" }).$type<Record<string, unknown>>(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: deletedAt(),
  },
  (t) => [
    uniqueIndex("organizations_slug_unique").on(t.slug),
    index("organizations_domain_idx").on(t.domain),
  ],
);

export const users = sqliteTable(
  "users",
  {
    id: primaryId("usr"),
    email: text("email").notNull(),
    name: text("name").notNull(),
    avatarUrl: text("avatar_url"),
    /** Null for SSO-only accounts; argon2id hash when using credential login. */
    passwordHash: text("password_hash"),
    /** Platform-wide default role. Per-org authority lives on `org_memberships.role`. */
    role: text("role").$type<UserRole>().notNull().default(UserRole.MEMBER),
    timezone: text("timezone").notNull().default("UTC"),
    isActive: bool("is_active").notNull().default(true),
    lastSeenAt: integer("last_seen_at", { mode: "timestamp_ms" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: deletedAt(),
  },
  (t) => [
    uniqueIndex("users_email_unique").on(t.email),
    index("users_role_idx").on(t.role),
    index("users_is_active_idx").on(t.isActive),
  ],
);

/**
 * Join table granting a user access to an organization.
 * The `(org_id, user_id)` unique index is what makes membership idempotent when an
 * invite webhook is retried.
 */
export const orgMemberships = sqliteTable(
  "org_memberships",
  {
    id: primaryId("mem"),
    orgId: orgId().references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").$type<UserRole>().notNull().default(UserRole.MEMBER),
    status: text("status").$type<MembershipStatus>().notNull().default(MembershipStatus.ACTIVE),
    invitedById: text("invited_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    joinedAt: integer("joined_at", { mode: "timestamp_ms" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("org_memberships_org_user_unique").on(t.orgId, t.userId),
    index("org_memberships_user_idx").on(t.userId),
    index("org_memberships_org_status_idx").on(t.orgId, t.status),
  ],
);

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const organizationsRelations = relations(organizations, ({ many }) => ({
  memberships: many(orgMemberships),
}));

export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(orgMemberships),
}));

export const orgMembershipsRelations = relations(orgMemberships, ({ one }) => ({
  organization: one(organizations, {
    fields: [orgMemberships.orgId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [orgMemberships.userId],
    references: [users.id],
  }),
  invitedBy: one(users, {
    fields: [orgMemberships.invitedById],
    references: [users.id],
  }),
}));
