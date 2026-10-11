import { relations } from "drizzle-orm";
import {
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import {
  ChatRole,
  ChatRoute,
  EmbeddingStatus,
  MeetingStatus,
} from "@kara/shared-types";

import { bool, createdAt, deletedAt, orgId, pgVector, primaryId, updatedAt } from "../columns.js";
import { organizations, users } from "./auth.js";
import { meetings, transcripts, utterances } from "./meetings.js";

export interface ChatCitation {
  meetingId: string;
  meetingTitle: string;
  meetingTimestampMs: number;
  utteranceId?: string;
  speaker?: string;
  snippet: string;
}

export interface ChatToolCall {
  route: ChatRoute;
  toolName: string;
  input: Record<string, unknown>;
  outputPreview?: string;
  durationMs?: number;
}

export const chatSessions = pgTable(
  "chat_sessions",
  {
    id: primaryId("cht"),
    orgId: orgId().references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    title: text("title"),
    route: text("route").$type<ChatRoute>(),
    messageCount: integer("message_count").notNull().default(0),

    isPinned: bool("is_pinned").notNull().default(false),
    isArchived: bool("is_archived").notNull().default(false),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true, mode: "date" }),

    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: deletedAt(),
  },
  (t) => [
    index("chat_sessions_user_last_message_idx").on(t.userId, t.lastMessageAt),
    index("chat_sessions_org_idx").on(t.orgId),
  ],
);

export const chatMessages = pgTable(
  "chat_messages",
  {
    id: primaryId("msg"),
    orgId: orgId().references(() => organizations.id, { onDelete: "cascade" }),
    sessionId: text("session_id")
      .notNull()
      .references(() => chatSessions.id, { onDelete: "cascade" }),

    role: text("role").$type<ChatRole>().notNull(),
    content: text("content").notNull(),

    route: text("route").$type<ChatRoute>(),
    routeConfidence: doublePrecision("route_confidence"),

    citations: jsonb("citations").$type<ChatCitation[]>(),
    toolCalls: jsonb("tool_calls").$type<ChatToolCall[]>(),
    tokenUsage: jsonb("token_usage").$type<Record<string, number>>(),

    model: text("model"),
    latencyMs: integer("latency_ms"),
    errorMessage: text("error_message"),

    createdAt: createdAt(),
  },
  (t) => [
    index("chat_messages_session_created_idx").on(t.sessionId, t.createdAt),
    index("chat_messages_role_idx").on(t.sessionId, t.role),
  ],
);

export const vectorDocuments = pgTable(
  "vector_documents",
  {
    id: primaryId("vec"),
    orgId: orgId().references(() => organizations.id, { onDelete: "cascade" }),
    meetingId: text("meeting_id")
      .notNull()
      .references(() => meetings.id, { onDelete: "cascade" }),
    transcriptId: text("transcript_id").references(() => transcripts.id, {
      onDelete: "cascade",
    }),
    utteranceId: text("utterance_id").references(() => utterances.id, {
      onDelete: "set null",
    }),

    collection: text("collection").notNull().default("kara_transcripts"),
    externalVectorId: text("external_vector_id"),
    chunkIndex: integer("chunk_index").notNull().default(0),
    chunkText: text("chunk_text").notNull(),
    tokenCount: integer("token_count"),

    // Denormalized temporal guardrail filter columns
    meetingTimestampMs: doublePrecision("meeting_timestamp_ms").notNull(),
    meetingStatus: text("meeting_status").$type<MeetingStatus>().notNull(),
    speaker: text("speaker"),

    // Native pgvector column (1536 dimensions for standard text embedding models)
    embedding: pgVector("embedding", { dimensions: 1536 }),

    embeddingStatus: text("embedding_status")
      .$type<EmbeddingStatus>()
      .notNull()
      .default(EmbeddingStatus.PENDING),
    embeddingModel: text("embedding_model"),
    indexedAt: timestamp("indexed_at", { withTimezone: true, mode: "date" }),
    errorMessage: text("error_message"),

    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("vector_documents_meeting_chunk_unique").on(t.meetingId, t.chunkIndex),
    index("vector_documents_meeting_status_ts_idx").on(t.meetingStatus, t.meetingTimestampMs),
    index("vector_documents_embedding_status_idx").on(t.embeddingStatus),
    index("vector_documents_collection_idx").on(t.collection),
  ],
);

export const chatSessionsRelations = relations(chatSessions, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [chatSessions.orgId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [chatSessions.userId],
    references: [users.id],
  }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  session: one(chatSessions, {
    fields: [chatMessages.sessionId],
    references: [chatSessions.id],
  }),
}));

export const vectorDocumentsRelations = relations(vectorDocuments, ({ one }) => ({
  meeting: one(meetings, {
    fields: [vectorDocuments.meetingId],
    references: [meetings.id],
  }),
  transcript: one(transcripts, {
    fields: [vectorDocuments.transcriptId],
    references: [transcripts.id],
  }),
  utterance: one(utterances, {
    fields: [vectorDocuments.utteranceId],
    references: [utterances.id],
  }),
}));
