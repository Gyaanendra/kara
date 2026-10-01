import { relations } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import {
  TaskActivityAction,
  TaskPriority,
  TaskSource,
  TaskStatus,
} from "@kara/shared-types";

import { bool, createdAt, deletedAt, orgId, primaryId, updatedAt } from "../columns.js";
import { organizations, users } from "./auth.js";
import { meetings, utterances } from "./meetings.js";
import { moms, momActionItems } from "./mom.js";

/** Enum columns use `.$type<Enum>()` — see the note in `auth.ts`. */

/** A board. Boards may be org-wide, per-project, or scoped to a single meeting. */
export const kanbanBoards = sqliteTable(
  "kanban_boards",
  {
    id: primaryId("brd"),
    orgId: orgId().references(() => organizations.id, { onDelete: "cascade" }),
    /** Set when this board was auto-created for a meeting's action items. */
    meetingId: text("meeting_id").references(() => meetings.id, {
      onDelete: "set null",
    }),

    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    isDefault: bool("is_default").notNull().default(false),
    position: real("position").notNull().default(0),

    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: deletedAt(),
  },
  (t) => [
    uniqueIndex("kanban_boards_org_slug_unique").on(t.orgId, t.slug),
    index("kanban_boards_meeting_idx").on(t.meetingId),
  ],
);

/**
 * An ordered column. `status` maps the column onto the canonical `TaskStatus` enum so
 * that a card dragged into "Blocked-ish" still has a machine-readable status, and the
 * Laya `TASK_LOOKUP` route can filter without knowing the user's column names.
 */
export const kanbanColumns = sqliteTable(
  "kanban_columns",
  {
    id: primaryId("col"),
    orgId: orgId().references(() => organizations.id, { onDelete: "cascade" }),
    boardId: text("board_id")
      .notNull()
      .references(() => kanbanBoards.id, { onDelete: "cascade" }),

    name: text("name").notNull(),
    status: text("status").$type<TaskStatus>().notNull().default(TaskStatus.TODO),
    color: text("color"),
    /** REAL so a card can be dropped *between* two columns without renumbering. */
    position: real("position").notNull().default(0),
    wipLimit: integer("wip_limit"),

    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("kanban_columns_board_position_idx").on(t.boardId, t.position),
  ],
);

/**
 * A task card. `position` is a REAL to support fractional reordering on drag-and-drop
 * (doc 07 Phase 7 uses `@dnd-kit`), avoiding a full-column rewrite per drop.
 *
 * The four `source_*` columns are what make doc 06 §2 possible: a card always knows
 * which meeting/utterance it came from, so the UI can offer "replay the exact seconds
 * where this was decided".
 */
export const tasks = sqliteTable(
  "tasks",
  {
    id: primaryId("tsk"),
    orgId: orgId().references(() => organizations.id, { onDelete: "cascade" }),
    boardId: text("board_id").references(() => kanbanBoards.id, {
      onDelete: "set null",
    }),
    columnId: text("column_id").references(() => kanbanColumns.id, {
      onDelete: "set null",
    }),

    title: text("title").notNull(),
    description: text("description"),
    status: text("status").$type<TaskStatus>().notNull().default(TaskStatus.BACKLOG),
    priority: text("priority").$type<TaskPriority>().notNull().default(TaskPriority.MEDIUM),
    position: real("position").notNull().default(0),

    assigneeUserId: text("assignee_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdById: text("created_by_id").references(() => users.id, {
      onDelete: "set null",
    }),

    startDate: integer("start_date", { mode: "timestamp_ms" }),
    dueDate: integer("due_date", { mode: "timestamp_ms" }),
    completedAt: integer("completed_at", { mode: "timestamp_ms" }),
    estimatePoints: integer("estimate_points"),
    labels: text("labels", { mode: "json" }).$type<string[]>(),

    // Provenance — doc 06 §2 and the AI/Manual filter in doc 07 Phase 7.
    source: text("source").$type<TaskSource>().notNull().default(TaskSource.MANUAL),
    sourceMeetingId: text("source_meeting_id").references(() => meetings.id, {
      onDelete: "set null",
    }),
    sourceMomId: text("source_mom_id").references(() => moms.id, {
      onDelete: "set null",
    }),
    sourceActionItemId: text("source_action_item_id").references(
      () => momActionItems.id,
      { onDelete: "set null" },
    ),
    sourceUtteranceId: text("source_utterance_id").references(() => utterances.id, {
      onDelete: "set null",
    }),

    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: deletedAt(),
  },
  (t) => [
    index("tasks_board_column_position_idx").on(t.boardId, t.columnId, t.position),
    index("tasks_org_status_idx").on(t.orgId, t.status),
    // Serves "what's due today?" and "what's blocked?" (`listTasks` agent tool).
    index("tasks_assignee_due_idx").on(t.assigneeUserId, t.dueDate),
    index("tasks_source_meeting_idx").on(t.sourceMeetingId),
    index("tasks_org_priority_idx").on(t.orgId, t.priority, t.status),
  ],
);

/** Threaded comment. `authorUserId` NULL means the comment was authored by Kara. */
export const taskComments = sqliteTable(
  "task_comments",
  {
    id: primaryId("cmt"),
    orgId: orgId().references(() => organizations.id, { onDelete: "cascade" }),
    taskId: text("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    authorUserId: text("author_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    parentCommentId: text("parent_comment_id"),

    body: text("body").notNull(),
    isAiGenerated: bool("is_ai_generated").notNull().default(false),

    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: deletedAt(),
  },
  (t) => [
    index("task_comments_task_idx").on(t.taskId, t.createdAt),
    index("task_comments_parent_idx").on(t.parentCommentId),
  ],
);

/**
 * Append-only audit trail. Deliberately has no `updated_at`/`deleted_at`: rows are
 * never mutated, which is what makes it usable as the drag-and-drop undo source and
 * as the "who moved this and when" answer.
 */
export const taskActivityLog = sqliteTable(
  "task_activity_log",
  {
    id: primaryId("log"),
    orgId: orgId().references(() => organizations.id, { onDelete: "cascade" }),
    taskId: text("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    /** NULL when the change was made by an agent tool rather than a human. */
    actorUserId: text("actor_user_id").references(() => users.id, {
      onDelete: "set null",
    }),

    action: text("action").$type<TaskActivityAction>().notNull(),
    field: text("field"),
    fromValue: text("from_value"),
    toValue: text("to_value"),
    metadata: text("metadata", { mode: "json" }).$type<Record<string, unknown>>(),

    createdAt: createdAt(),
  },
  (t) => [
    index("task_activity_log_task_idx").on(t.taskId, t.createdAt),
    index("task_activity_log_actor_idx").on(t.actorUserId),
  ],
);

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const kanbanBoardsRelations = relations(kanbanBoards, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [kanbanBoards.orgId],
    references: [organizations.id],
  }),
  meeting: one(meetings, {
    fields: [kanbanBoards.meetingId],
    references: [meetings.id],
  }),
  columns: many(kanbanColumns),
  tasks: many(tasks),
}));

export const kanbanColumnsRelations = relations(kanbanColumns, ({ one, many }) => ({
  board: one(kanbanBoards, {
    fields: [kanbanColumns.boardId],
    references: [kanbanBoards.id],
  }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  board: one(kanbanBoards, {
    fields: [tasks.boardId],
    references: [kanbanBoards.id],
  }),
  column: one(kanbanColumns, {
    fields: [tasks.columnId],
    references: [kanbanColumns.id],
  }),
  assignee: one(users, {
    fields: [tasks.assigneeUserId],
    references: [users.id],
  }),
  createdBy: one(users, {
    fields: [tasks.createdById],
    references: [users.id],
  }),
  sourceMeeting: one(meetings, {
    fields: [tasks.sourceMeetingId],
    references: [meetings.id],
  }),
  sourceMom: one(moms, {
    fields: [tasks.sourceMomId],
    references: [moms.id],
  }),
  sourceActionItem: one(momActionItems, {
    fields: [tasks.sourceActionItemId],
    references: [momActionItems.id],
  }),
  sourceUtterance: one(utterances, {
    fields: [tasks.sourceUtteranceId],
    references: [utterances.id],
  }),
  comments: many(taskComments),
  activity: many(taskActivityLog),
}));

export const taskCommentsRelations = relations(taskComments, ({ one }) => ({
  task: one(tasks, { fields: [taskComments.taskId], references: [tasks.id] }),
  author: one(users, {
    fields: [taskComments.authorUserId],
    references: [users.id],
  }),
}));

export const taskActivityLogRelations = relations(taskActivityLog, ({ one }) => ({
  task: one(tasks, { fields: [taskActivityLog.taskId], references: [tasks.id] }),
  actor: one(users, {
    fields: [taskActivityLog.actorUserId],
    references: [users.id],
  }),
}));
