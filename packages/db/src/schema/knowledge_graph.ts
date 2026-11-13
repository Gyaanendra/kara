import { relations } from "drizzle-orm";
import { doublePrecision, index, pgTable, text } from "drizzle-orm/pg-core";

import { createdAt, orgId, primaryId, updatedAt } from "../columns.js";
import { organizations } from "./auth.js";
import { meetings } from "./meetings.js";

/**
 * Knowledge-graph triplets: entityA -[relation]-> entityB, harvested from
 * transcripts and directory data. The graph is the shared ground truth the
 * workforce-directory Sub-Helper traverses.
 */
export const entityRelationships = pgTable(
  "entity_relationships",
  {
    id: primaryId("egr"),
    orgId: orgId().references(() => organizations.id, { onDelete: "cascade" }),
    entityA: text("entity_a").notNull(),
    relation: text("relation").notNull(),
    entityB: text("entity_b").notNull(),
    context: text("context"),
    meetingId: text("meeting_id").references(() => meetings.id, {
      onDelete: "set null",
    }),
    confidence: doublePrecision("confidence").notNull().default(1),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("entity_relationships_entity_a_idx").on(t.entityA),
    index("entity_relationships_entity_b_idx").on(t.entityB),
    index("entity_relationships_org_idx").on(t.orgId),
    index("entity_relationships_relation_idx").on(t.relation),
  ],
);

export const entityRelationshipsRelations = relations(entityRelationships, ({ one }) => ({
  organization: one(organizations, {
    fields: [entityRelationships.orgId],
    references: [organizations.id],
  }),
  meeting: one(meetings, {
    fields: [entityRelationships.meetingId],
    references: [meetings.id],
  }),
}));
