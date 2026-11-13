import { relations } from "drizzle-orm";
import { index, integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

import { bool, createdAt, orgId, primaryId, updatedAt } from "../columns.js";
import { organizations } from "./auth.js";

export type PresenceStatus = "online" | "away" | "busy" | "offline";

/** Canonical employee directory used to resolve speaker labels and owners. */
export const companyMembers = pgTable(
  "company_members",
  {
    id: primaryId("mbr"),
    orgId: orgId().references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    jobTitle: text("job_title"),
    department: text("department"),
    bio: text("bio"),
    skills: text("skills"),
    isAdmin: bool("is_admin").notNull().default(false),
    isActive: bool("is_active").notNull().default(true),
    avatarUrl: text("avatar_url"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("company_members_org_email_unique").on(t.orgId, t.email),
    index("company_members_org_department_idx").on(t.orgId, t.department),
    index("company_members_name_idx").on(t.name),
  ],
);

/**
 * Heartbeat-driven presence map keyed by email (mirrors the reference bot's
 * user_presence table; emails arrive before user accounts may exist).
 */
export const userPresence = pgTable(
  "user_presence",
  {
    userEmail: text("user_email").primaryKey(),
    userName: text("user_name"),
    orgId: orgId().references(() => organizations.id, { onDelete: "cascade" }),
    status: text("status").$type<PresenceStatus>().notNull().default("online"),
    lastHeartbeatAt: timestamp("last_heartbeat_at", { withTimezone: true, mode: "date" }).defaultNow(),
    activeSessionsCount: integer("active_sessions_count").notNull().default(1),
    updatedAt: updatedAt(),
  },
  (t) => [index("user_presence_org_status_idx").on(t.orgId, t.status)],
);

export const companyMembersRelations = relations(companyMembers, ({ one }) => ({
  organization: one(organizations, {
    fields: [companyMembers.orgId],
    references: [organizations.id],
  }),
}));
