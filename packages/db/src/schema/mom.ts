import { relations } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { ActionItemStatus, MomStatus, TaskPriority } from "@kara/shared-types";

import { createdAt, orgId, primaryId, updatedAt } from "../columns.js";
import { organizations, users } from "./auth.js";
import { meetings, utterances } from "./meetings.js";

/** Enum columns use `.$type<Enum>()` — see the note in `auth.ts`. */

/**
 * Minutes of Meeting — exactly one per meeting, produced by the Mastra
 * `mom-synthesis` workflow (doc 07 Phase 4). `status` lets the UI show a skeleton
 * while generation is in flight rather than blocking on the LLM.
 */
export const moms = sqliteTable(
  "moms",
  {
    id: primaryId("mom"),
    orgId: orgId().references(() => organizations.id, { onDelete: "cascade" }),
    meetingId: text("meeting_id")
      .notNull()
      .references(() => meetings.id, { onDelete: "cascade" }),

    status: text("status").$type<MomStatus>().notNull().default(MomStatus.PENDING),
    title: text("title").notNull(),
    /** Markdown body rendered in the MOM "Summary" tab. */
    summary: text("summary"),
    executiveSummary: text("executive_summary"),
    sentiment: text("sentiment"),

    topics: text("topics", { mode: "json" }).$type<string[]>(),
    keywords: text("keywords", { mode: "json" }).$type<string[]>(),

    model: text("model"),
    promptVersion: text("prompt_version"),
    tokenUsage: text("token_usage", { mode: "json" }).$type<Record<string, number>>(),

    generatedAt: integer("generated_at", { mode: "timestamp_ms" }),
    errorMessage: text("error_message"),

    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    // One MOM per meeting — makes the synthesis job idempotent under BullMQ retries.
    uniqueIndex("moms_meeting_unique").on(t.meetingId),
    index("moms_status_idx").on(t.status),
  ],
);

/** A key decision extracted from the transcript, with its supporting verbatim quote. */
export const momDecisions = sqliteTable(
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

    statement: text("statement").notNull(),
    /** Verbatim transcript text that justifies the decision — the anti-hallucination proof. */
    contextQuote: text("context_quote"),
    sourceUtteranceId: text("source_utterance_id").references(() => utterances.id, {
      onDelete: "set null",
    }),
    decidedByUserId: text("decided_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    decidedAt: integer("decided_at", { mode: "timestamp_ms" }),
    confidence: real("confidence"),
    sequence: integer("sequence").notNull().default(0),

    createdAt: createdAt(),
  },
  (t) => [
    index("mom_decisions_mom_idx").on(t.momId, t.sequence),
    index("mom_decisions_meeting_idx").on(t.meetingId),
  ],
);

/**
 * An extracted action item. Note the link to a Kanban task is stored on the *task*
 * side (`tasks.source_action_item_id`), not here — that keeps this module free of a
 * circular import with `kanban.ts` and gives the relationship a single owner.
 */
export const momActionItems = sqliteTable(
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
    /** Name exactly as heard, kept when diarization could not be resolved to a user. */
    assigneeNameRaw: text("assignee_name_raw"),
    dueDate: integer("due_date", { mode: "timestamp_ms" }),

    priority: text("priority").$type<TaskPriority>().notNull().default(TaskPriority.MEDIUM),
    status: text("status").$type<ActionItemStatus>().notNull().default(ActionItemStatus.OPEN),

    sourceUtteranceId: text("source_utterance_id").references(() => utterances.id, {
      onDelete: "set null",
    }),
    confidence: real("confidence"),
    sequence: integer("sequence").notNull().default(0),

    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("mom_action_items_mom_idx").on(t.momId, t.sequence),
    index("mom_action_items_assignee_idx").on(t.assigneeUserId, t.status),
    index("mom_action_items_meeting_idx").on(t.meetingId),
  ],
);

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const momsRelations = relations(moms, ({ one, many }) => ({
  meeting: one(meetings, {
    fields: [moms.meetingId],
    references: [meetings.id],
  }),
  decisions: many(momDecisions),
  actionItems: many(momActionItems),
}));

export const momDecisionsRelations = relations(momDecisions, ({ one }) => ({
  mom: one(moms, { fields: [momDecisions.momId], references: [moms.id] }),
  meeting: one(meetings, {
    fields: [momDecisions.meetingId],
    references: [meetings.id],
  }),
  sourceUtterance: one(utterances, {
    fields: [momDecisions.sourceUtteranceId],
    references: [utterances.id],
  }),
  decidedBy: one(users, {
    fields: [momDecisions.decidedByUserId],
    references: [users.id],
  }),
}));

export const momActionItemsRelations = relations(momActionItems, ({ one }) => ({
  mom: one(moms, { fields: [momActionItems.momId], references: [moms.id] }),
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
