import { relations } from "drizzle-orm";
import { index, integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { ActionItemStatus, MomStatus } from "@kara/shared-types";

import { createdAt, orgId, primaryId, updatedAt } from "../columns.js";
import { organizations, users } from "./auth.js";
import { meetings, utterances } from "./meetings.js";

export const moms = pgTable(
  "moms",
  {
    id: primaryId("mom"),
    orgId: orgId().references(() => organizations.id, { onDelete: "cascade" }),
    meetingId: text("meeting_id")
      .notNull()
      .references(() => meetings.id, { onDelete: "cascade" }),

    status: text("status").$type<MomStatus>().notNull().default(MomStatus.PENDING),

    executiveSummary: text("executive_summary"),
    keyTopics: jsonb("key_topics").$type<string[]>(),
    sentiment: text("sentiment"),
    model: text("model"),
    generationDurationMs: integer("generation_duration_ms"),
    rawOutput: jsonb("raw_output").$type<Record<string, unknown>>(),
    errorMessage: text("error_message"),

    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("moms_meeting_idx").on(t.meetingId),
    index("moms_status_idx").on(t.status),
  ],
);

export const momDecisions = pgTable(
  "mom_decisions",
  {
    id: primaryId("dec"),
    orgId: orgId().references(() => organizations.id, { onDelete: "cascade" }),
    momId: text("mom_id")
      .notNull()
      .references(() => moms.id, { onDelete: "cascade" }),
    meetingId: text("meeting_id")
      .notNull()
      .references(() => meetings.id, { onDelete: "cascade" }),

    decision: text("decision").notNull(),
    rationale: text("rationale"),
    sourceUtteranceId: text("source_utterance_id").references(() => utterances.id, {
      onDelete: "set null",
    }),
    contextQuote: text("context_quote"),
    sequence: integer("sequence").notNull().default(0),

    createdAt: createdAt(),
  },
  (t) => [
    index("mom_decisions_mom_idx").on(t.momId),
    index("mom_decisions_meeting_idx").on(t.meetingId),
  ],
);

export const momActionItems = pgTable(
  "mom_action_items",
  {
    id: primaryId("act"),
    orgId: orgId().references(() => organizations.id, { onDelete: "cascade" }),
    momId: text("mom_id")
      .notNull()
      .references(() => moms.id, { onDelete: "cascade" }),
    meetingId: text("meeting_id")
      .notNull()
      .references(() => meetings.id, { onDelete: "cascade" }),

    title: text("title").notNull(),
    description: text("description"),

    assigneeUserId: text("assignee_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    assigneeNameRaw: text("assignee_name_raw"),
    dueDate: timestamp("due_date", { withTimezone: true, mode: "date" }),

    status: text("status").$type<ActionItemStatus>().notNull().default(ActionItemStatus.OPEN),

    sourceUtteranceId: text("source_utterance_id").references(() => utterances.id, {
      onDelete: "set null",
    }),
    audioDeepLinkMs: integer("audio_deep_link_ms"),

    promotedTaskId: text("promoted_task_id"),

    sequence: integer("sequence").notNull().default(0),

    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("mom_action_items_mom_idx").on(t.momId),
    index("mom_action_items_meeting_idx").on(t.meetingId),
    index("mom_action_items_assignee_idx").on(t.assigneeUserId),
    index("mom_action_items_status_idx").on(t.status),
  ],
);

export const momsRelations = relations(moms, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [moms.orgId],
    references: [organizations.id],
  }),
  meeting: one(meetings, {
    fields: [moms.meetingId],
    references: [meetings.id],
  }),
  decisions: many(momDecisions),
  actionItems: many(momActionItems),
}));

export const momDecisionsRelations = relations(momDecisions, ({ one }) => ({
  mom: one(moms, {
    fields: [momDecisions.momId],
    references: [moms.id],
  }),
  meeting: one(meetings, {
    fields: [momDecisions.meetingId],
    references: [meetings.id],
  }),
  sourceUtterance: one(utterances, {
    fields: [momDecisions.sourceUtteranceId],
    references: [utterances.id],
  }),
}));

export const momActionItemsRelations = relations(momActionItems, ({ one }) => ({
  mom: one(moms, {
    fields: [momActionItems.momId],
    references: [moms.id],
  }),
  meeting: one(meetings, {
    fields: [momActionItems.meetingId],
    references: [meetings.id],
  }),
  assignee: one(users, {
    fields: [momActionItems.assigneeUserId],
    references: [users.id],
  }),
  sourceUtterance: one(utterances, {
    fields: [momActionItems.sourceUtteranceId],
    references: [utterances.id],
  }),
}));
