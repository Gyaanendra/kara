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
  ChatRole,
  ChatRoute,
  EmbeddingStatus,
  MeetingStatus,
} from "@kara/shared-types";

import { bool, createdAt, deletedAt, orgId, primaryId, updatedAt } from "../columns.js";
import { organizations, users } from "./auth.js";
import { meetings, transcripts, utterances } from "./meetings.js";

/** Enum columns use `.$type<Enum>()` — see the note in `auth.ts`. */

/**
 * A citation surfaced as a clickable pill in the chat UI (doc 07 Phase 7).
 * Every assistant claim must carry at least one of these — that is the
 * citation-enforcement rule from doc 04 §3 made structural.
 */
export interface ChatCitation {
  meetingId: string;
  meetingTitle: string;
  /** Unix ms — what the UI converts to the "MM:SS" deep-link. */
  meetingTimestampMs: number;
  utteranceId?: string;
  speaker?: string;
  snippet: string;
}

/** A single Laya route decision plus the tool invocation it produced. */
export interface ChatToolCall {
  route: ChatRoute;
  toolName: string;
  input: Record<string, unknown>;
  /** Truncated tool output, kept for the debug drawer rather than for replay. */
  outputPreview?: string;
  durationMs?: number;
}

/** A conversation thread between a user and Kara. */
export const chatSessions = sqliteTable(
  "chat_sessions",
  {
    id: primaryId("cht"),
    orgId: orgId().references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    title: text("title"),
    /** Route chosen for the most recent turn — drives the query-route badge. */
    route: text("route").$type<ChatRoute>(),
    messageCount: integer("message_count").notNull().default(0),

    isPinned: bool("is_pinned").notNull().default(false),
    isArchived: bool("is_archived").notNull().default(false),
    lastMessageAt: integer("last_message_at", { mode: "timestamp_ms" }),

    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: deletedAt(),
  },
  (t) => [
    index("chat_sessions_user_last_message_idx").on(t.userId, t.lastMessageAt),
    index("chat_sessions_org_idx").on(t.orgId),
  ],
);

/**
 * One message in a session.
 *
 * `route` + `routeConfidence` record what Laya decided *before* the LLM ran
 * (doc 07 §2D "Query Router"). Persisting it lets the UI show the route badge and
 * lets us measure router accuracy offline without re-running inference.
 */
export const chatMessages = sqliteTable(
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
    routeConfidence: real("route_confidence"),

    citations: text("citations", { mode: "json" }).$type<ChatCitation[]>(),
    toolCalls: text("tool_calls", { mode: "json" }).$type<ChatToolCall[]>(),
    tokenUsage: text("token_usage", { mode: "json" }).$type<Record<string, number>>(),

    model: text("model"),
    /** End-to-end wall time, including Laya routing and vector retrieval. */
    latencyMs: integer("latency_ms"),
    errorMessage: text("error_message"),

    createdAt: createdAt(),
  },
  (t) => [
    index("chat_messages_session_created_idx").on(t.sessionId, t.createdAt),
    index("chat_messages_role_idx").on(t.sessionId, t.role),
  ],
);

/**
 * Relational mirror of the vector payload described in doc 04 §3.
 *
 * ChromaDB/Qdrant own the vectors; this table owns the *provenance*. Two reasons it
 * exists rather than trusting collection metadata alone:
 *  1. `meeting_status` and `meeting_timestamp_ms` are denormalized here so the
 *     indexer can re-derive the hard filter (`status = COMPLETED AND ts <= now`)
 *     without a join, and so a meeting flipping to `CANCELLED` can mark its chunks STALE.
 *  2. It gives the UI a way to list "what is indexed for this meeting" and to force
 *     a re-index, neither of which vector stores expose ergonomically.
 *
 * `external_vector_id` is the id inside the vector store; deleting a row here is what
 * a re-index uses to know which vectors to replace.
 */
export const vectorDocuments = sqliteTable(
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

    /** Vector store collection / namespace, e.g. `kara_transcripts`. */
    collection: text("collection").notNull().default("kara_transcripts"),
    externalVectorId: text("external_vector_id"),
    chunkIndex: integer("chunk_index").notNull().default(0),
    chunkText: text("chunk_text").notNull(),
    tokenCount: integer("token_count"),

    // Denormalized filter columns — see class doc comment above.
    meetingTimestampMs: integer("meeting_timestamp_ms").notNull(),
    meetingStatus: text("meeting_status").$type<MeetingStatus>().notNull(),
    speaker: text("speaker"),

    embeddingStatus: text("embedding_status")
      .$type<EmbeddingStatus>()
      .notNull()
      .default(EmbeddingStatus.PENDING),
    embeddingModel: text("embedding_model"),
    indexedAt: integer("indexed_at", { mode: "timestamp_ms" }),
    errorMessage: text("error_message"),

    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("vector_documents_meeting_chunk_unique").on(t.meetingId, t.chunkIndex),
    // Drives the temporal guardrail query in doc 04 §3.
    index("vector_documents_meeting_status_ts_idx").on(t.meetingStatus, t.meetingTimestampMs),
    index("vector_documents_embedding_status_idx").on(t.embeddingStatus),
    index("vector_documents_collection_idx").on(t.collection),
  ],
);

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

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
