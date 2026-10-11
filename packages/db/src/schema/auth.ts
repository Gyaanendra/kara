import { relations } from "drizzle-orm";
import { index, pgTable, text, uniqueIndex, timestamp, jsonb } from "drizzle-orm/pg-core";
import { MembershipStatus, UserRole } from "@kara/shared-types";

import { bool, createdAt, deletedAt, orgId, primaryId, updatedAt } from "../columns.js";

export type OrgPlan = "FREE" | "TEAM" | "BUSINESS" | "ENTERPRISE";

/** Tenant root. Every other domain table hangs off an organization. */
export const organizations = pgTable(
  "organizations",
  {
    id: primaryId("org"),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    domain: text("domain"),
    logoUrl: text("logo_url"),
    plan: text("plan").$type<OrgPlan>().notNull().default("FREE"),
    settings: jsonb("settings").$type<Record<string, unknown>>(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: deletedAt(),
  },
  (t) => [
    uniqueIndex("organizations_slug_unique").on(t.slug),
    index("organizations_domain_idx").on(t.domain),
  ],
);

export const users = pgTable(
  "users",
  {
    id: primaryId("usr"),
    email: text("email").notNull(),
    name: text("name").notNull(),
    avatarUrl: text("avatar_url"),
    passwordHash: text("password_hash"),
    role: text("role").$type<UserRole>().notNull().default(UserRole.MEMBER),
    timezone: text("timezone").notNull().default("UTC"),
    isActive: bool("is_active").notNull().default(true),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true, mode: "date" }),
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

export const orgMemberships = pgTable(
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
    joinedAt: timestamp("joined_at", { withTimezone: true, mode: "date" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("org_memberships_org_user_unique").on(t.orgId, t.userId),
    index("org_memberships_user_idx").on(t.userId),
    index("org_memberships_org_status_idx").on(t.orgId, t.status),
  ],
);

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
