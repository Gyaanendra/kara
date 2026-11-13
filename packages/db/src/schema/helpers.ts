import { relations } from "drizzle-orm";
import { doublePrecision, index, jsonb, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";

import { bool, createdAt, orgId, primaryId, updatedAt } from "../columns.js";
import { organizations } from "./auth.js";

export type SubHelperStatus = "IDLE" | "ACTIVE" | "THINKING" | "FAILED";

/**
 * Dynamic Sub-Helper registry. Every row is a focused worker persona the unified
 * Kara AI agent can dispatch to. `assignedTools` names must match tool registry
 * keys exported from the API's Mastra tool bundle.
 */
export const subHelpers = pgTable(
  "sub_helpers",
  {
    id: primaryId("hlp"),
    orgId: orgId().references(() => organizations.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    systemPromptSlice: text("system_prompt_slice").notNull(),
    assignedTools: jsonb("assigned_tools").$type<string[]>().notNull().default([]),
    model: text("model").notNull().default("llama-3.3-70b-versatile"),
    temperature: doublePrecision("temperature").notNull().default(0.1),
    isBuiltIn: bool("is_built_in").notNull().default(true),
    isActive: bool("is_active").notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("sub_helpers_org_slug_unique").on(t.orgId, t.slug),
    index("sub_helpers_org_active_idx").on(t.orgId, t.isActive),
  ],
);

export const subHelpersRelations = relations(subHelpers, ({ one }) => ({
  organization: one(organizations, {
    fields: [subHelpers.orgId],
    references: [organizations.id],
  }),
}));
