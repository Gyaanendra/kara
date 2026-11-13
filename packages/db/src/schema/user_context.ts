import { relations } from "drizzle-orm";
import { index, jsonb, pgTable, text } from "drizzle-orm/pg-core";

import { createdAt, orgId, primaryId, updatedAt } from "../columns.js";
import { organizations, users } from "./auth.js";

export type UserContextType = "preferences" | "ongoing_projects" | "memory_notes";

/** Kara's long-term memory about a user: preferences, projects, explicit notes. */
export const userContexts = pgTable(
  "user_contexts",
  {
    id: primaryId("ctx"),
    orgId: orgId().references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    contextType: text("context_type").$type<UserContextType>().notNull(),
    contextData: jsonb("context_data").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("user_contexts_user_type_idx").on(t.userId, t.contextType),
    index("user_contexts_org_idx").on(t.orgId),
  ],
);

export const userContextsRelations = relations(userContexts, ({ one }) => ({
  organization: one(organizations, {
    fields: [userContexts.orgId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [userContexts.userId],
    references: [users.id],
  }),
}));
