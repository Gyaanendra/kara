import { relations } from "drizzle-orm";
import {
  doublePrecision,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import {
  TaskActivityAction,
  TaskPriority,
  TaskSource,
  TaskStatus,
} from "@kara/shared-types";

import { bool, createdAt, deletedAt, orgId, primaryId, updatedAt } from "../columns.js";
import { organizations, users } from "./auth.js";
import { meetings, utterances } from "./meetings.js";
import { momActionItems } from "./mom.js";

export const kanbanBoards = pgTable(
  "kanban_boards",
  {
    id: primaryId("brd"),
    orgId: orgId().references(() => organizations.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    isDefault: bool("is_default").notNull().default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: deletedAt(),
  },
  (t) => [
    index("kanban_boards_org_idx").on(t.orgId),
  ],
);

export const kanbanColumns = pgTable(
  "kanban_columns",
  {
    id: primaryId("col"),
    orgId: orgId().references(() => organizations.id, { onDelete: "cascade" }),
    boardId: text("board_id")
      .notNull()
      .references(() => kanbanBoards.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    statusMapping: text("status_mapping").$type<TaskStatus>().notNull(),
    colorHex: text("color_hex"),
    position: doublePrecision("position").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("kanban_columns_board_pos_idx").on(t.boardId, t.position),
  ],
);

export const tasks = pgTable(
  "tasks",
  {
    id: primaryId("tsk"),
    orgId: orgId().references(() => organizations.id, { onDelete: "cascade" }),
    boardId: text("board_id")
      .notNull()
      .references(() => kanbanBoards.id, { onDelete: "cascade" }),
    columnId: text("column_id")
      .notNull()
      .references(() => kanbanColumns.id, { onDelete: "cascade" }),

    title: text("title").notNull(),
    description: text("description"),
    status: text("status").$type<TaskStatus>().notNull().default(TaskStatus.TODO),
    priority: text("priority").$type<TaskPriority>().notNull().default(TaskPriority.MEDIUM),

    assigneeUserId: text("assignee_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    creatorUserId: text("creator_user_id").references(() => users.id, {
      onDelete: "set null",
    }),

    dueDate: timestamp("due_date", { withTimezone: true, mode: "date" }),
    position: doublePrecision("position").notNull().default(0),

    source: text("source").$type<TaskSource>().notNull().default(TaskSource.MANUAL),
    sourceMeetingId: text("source_meeting_id").references(() => meetings.id, {
      onDelete: "set null",
    }),
    sourceActionItemId: text("source_action_item_id").references(
      () => momActionItems.id,
      { onDelete: "set null" },
    ),
    sourceUtteranceId: text("source_utterance_id").references(() => utterances.id, {
      onDelete: "set null",
    }),
    sourceAudioDeepLinkMs: doublePrecision("source_audio_deep_link_ms"),

    labels: jsonb("labels").$type<string[]>(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),

    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: deletedAt(),
  },
  (t) => [
    index("tasks_board_column_pos_idx").on(t.boardId, t.columnId, t.position),
    index("tasks_org_status_idx").on(t.orgId, t.status),
    index("tasks_assignee_idx").on(t.assigneeUserId),
    index("tasks_source_meeting_idx").on(t.sourceMeetingId),
  ],
);

export const taskComments = pgTable(
  "task_comments",
  {
    id: primaryId("cmt"),
    orgId: orgId().references(() => organizations.id, { onDelete: "cascade" }),
    taskId: text("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    authorUserId: text("author_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: deletedAt(),
  },
  (t) => [
    index("task_comments_task_idx").on(t.taskId),
  ],
);

export const taskActivityLog = pgTable(
  "task_activity_log",
  {
    id: primaryId("log"),
    orgId: orgId().references(() => organizations.id, { onDelete: "cascade" }),
    taskId: text("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    actorUserId: text("actor_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    action: text("action").$type<TaskActivityAction>().notNull(),
    diff: jsonb("diff").$type<Record<string, unknown>>(),
    createdAt: createdAt(),
  },
  (t) => [
    index("task_activity_log_task_idx").on(t.taskId),
  ],
);

export const kanbanBoardsRelations = relations(kanbanBoards, ({ many }) => ({
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
  creator: one(users, {
    fields: [tasks.creatorUserId],
    references: [users.id],
  }),
  sourceMeeting: one(meetings, {
    fields: [tasks.sourceMeetingId],
    references: [meetings.id],
  }),
  comments: many(taskComments),
  activities: many(taskActivityLog),
}));
