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
  MeetingPlatform,
  MeetingStatus,
  MeetingType,
  ParticipantRole,
  RecordingStatus,
  TranscriptStatus,
  UtteranceType,
} from "@kara/shared-types";

import { bool, createdAt, deletedAt, orgId, primaryId, updatedAt } from "../columns.js";
import { organizations, users } from "./auth.js";

/**
 * Enum columns use `.$type<Enum>()` — see the note in `auth.ts`. On SQLite the `enum`
 * config is a type-inference helper that emits no DDL, so `$type` is equivalent while
 * also accepting a TypeScript enum object.
 */

/**
 * A calendar event or ad-hoc call. This is the table the entire non-hallucinatory
 * guarantee in doc 04 rests on: `status` + `actual_end_at` are the two columns the
 * agent tools filter on, and `meetings_org_status_end_idx` is the index that makes
 * those filters a range scan rather than a full table scan.
 */
export const meetings = sqliteTable(
  "meetings",
  {
    id: primaryId("meet"),
    orgId: orgId().references(() => organizations.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    externalId: text("external_id"),
    platform: text("platform").$type<MeetingPlatform>().notNull().default(MeetingPlatform.OTHER),
    status: text("status").$type<MeetingStatus>().notNull().default(MeetingStatus.SCHEDULED),
    /** Assigned post-MOM by the Laya meeting auto-tagger (doc 07 §2D). */
    meetingType: text("meeting_type").$type<MeetingType>(),

    scheduledStartAt: integer("scheduled_start_at", { mode: "timestamp_ms" }).notNull(),
    scheduledEndAt: integer("scheduled_end_at", { mode: "timestamp_ms" }),
    actualStartAt: integer("actual_start_at", { mode: "timestamp_ms" }),
    actualEndAt: integer("actual_end_at", { mode: "timestamp_ms" }),

    joinUrl: text("join_url"),
    calendarEventId: text("calendar_event_id"),
    calendarProvider: text("calendar_provider"),
    hostUserId: text("host_user_id").references(() => users.id, {
      onDelete: "set null",
    }),

    // Bot lifecycle — written only by authenticated bot webhooks (doc 03 §3).
    botDispatchedAt: integer("bot_dispatched_at", { mode: "timestamp_ms" }),
    botJoinedAt: integer("bot_joined_at", { mode: "timestamp_ms" }),
    botLeftAt: integer("bot_left_at", { mode: "timestamp_ms" }),
    botFailureReason: text("bot_failure_reason"),

    durationSeconds: integer("duration_seconds"),
    isRecorded: bool("is_recorded").notNull().default(false),

    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: deletedAt(),
  },
  (t) => [
    // Driver for `getPastMeetings` / `getUpcomingSchedule` (doc 04 §2A).
    index("meetings_org_status_end_idx").on(t.orgId, t.status, t.actualEndAt),
    index("meetings_org_scheduled_start_idx").on(t.orgId, t.scheduledStartAt),
    index("meetings_host_user_idx").on(t.hostUserId),
    index("meetings_calendar_event_idx").on(t.calendarEventId),
    index("meetings_meeting_type_idx").on(t.orgId, t.meetingType),
  ],
);

/** Raw audio object in RustFS S3. One meeting may have several (e.g. re-connects). */
export const recordings = sqliteTable(
  "recordings",
  {
    id: primaryId("rec"),
    orgId: orgId().references(() => organizations.id, { onDelete: "cascade" }),
    meetingId: text("meeting_id")
      .notNull()
      .references(() => meetings.id, { onDelete: "cascade" }),

    s3Bucket: text("s3_bucket").notNull(),
    s3Key: text("s3_key").notNull(),
    s3Region: text("s3_region"),
    s3Endpoint: text("s3_endpoint"),
    mimeType: text("mime_type").notNull().default("audio/webm"),
    fileSizeBytes: integer("file_size_bytes"),
    durationSeconds: integer("duration_seconds"),
    sampleRate: integer("sample_rate"),
    channels: integer("channels"),
    /** S3 multipart ETag — used to dedupe replayed upload webhooks. */
    checksum: text("checksum"),

    status: text("status").$type<RecordingStatus>().notNull().default(RecordingStatus.UPLOADING),
    uploadedAt: integer("uploaded_at", { mode: "timestamp_ms" }),

    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("recordings_meeting_idx").on(t.meetingId),
    uniqueIndex("recordings_s3_key_unique").on(t.s3Bucket, t.s3Key),
    index("recordings_status_idx").on(t.status),
  ],
);

/** One diarized transcript document per recording. */
export const transcripts = sqliteTable(
  "transcripts",
  {
    id: primaryId("trn"),
    orgId: orgId().references(() => organizations.id, { onDelete: "cascade" }),
    meetingId: text("meeting_id")
      .notNull()
      .references(() => meetings.id, { onDelete: "cascade" }),
    recordingId: text("recording_id").references(() => recordings.id, {
      onDelete: "set null",
    }),

    language: text("language").notNull().default("en"),
    provider: text("provider").notNull().default("groq-whisper"),
    model: text("model"),
    status: text("status").$type<TranscriptStatus>().notNull().default(TranscriptStatus.PENDING),

    wordCount: integer("word_count"),
    utteranceCount: integer("utterance_count"),
    /** Mean diarization confidence across utterances, 0..1. */
    confidence: real("confidence"),
    /** Untouched provider response, retained for re-processing without re-download. */
    rawPayload: text("raw_payload", { mode: "json" }).$type<Record<string, unknown>>(),

    processingStartedAt: integer("processing_started_at", { mode: "timestamp_ms" }),
    processingCompletedAt: integer("processing_completed_at", { mode: "timestamp_ms" }),
    errorMessage: text("error_message"),

    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("transcripts_meeting_idx").on(t.meetingId),
    index("transcripts_status_idx").on(t.status),
  ],
);

/**
 * A single speaker turn. `start_ms`/`end_ms` are offsets from the start of the
 * recording — this is exactly what the UI deep-links to from a task ("Origin:
 * Product Strategy Sync, 14:32", doc 06 §2).
 */
export const utterances = sqliteTable(
  "utterances",
  {
    id: primaryId("utt"),
    orgId: orgId().references(() => organizations.id, { onDelete: "cascade" }),
    meetingId: text("meeting_id")
      .notNull()
      .references(() => meetings.id, { onDelete: "cascade" }),
    transcriptId: text("transcript_id")
      .notNull()
      .references(() => transcripts.id, { onDelete: "cascade" }),

    /** Diarization label (`SPEAKER_00`); resolved to a real user when possible. */
    speakerLabel: text("speaker_label").notNull(),
    speakerUserId: text("speaker_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    speakerName: text("speaker_name"),

    startMs: integer("start_ms").notNull(),
    endMs: integer("end_ms").notNull(),
    text: text("text").notNull(),
    /** Monotonic ordering within the transcript; the cursor for streaming readers. */
    sequence: integer("sequence").notNull(),

    // Laya post-transcription classifier output (doc 07 §2D).
    type: text("type").$type<UtteranceType>().notNull().default(UtteranceType.INFORMATION),
    typeConfidence: real("type_confidence"),

    // Laya content guard output — flagged rows are excluded from RAG indexing.
    isSensitive: bool("is_sensitive").notNull().default(false),
    sensitivityReason: text("sensitivity_reason"),

    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("utterances_transcript_sequence_unique").on(t.transcriptId, t.sequence),
    index("utterances_meeting_start_idx").on(t.meetingId, t.startMs),
    index("utterances_type_idx").on(t.meetingId, t.type),
    index("utterances_speaker_user_idx").on(t.speakerUserId),
  ],
);

/** Join table linking users (and external attendees) to a meeting. */
export const meetingParticipants = sqliteTable(
  "meeting_participants",
  {
    id: primaryId("par"),
    orgId: orgId().references(() => organizations.id, { onDelete: "cascade" }),
    meetingId: text("meeting_id")
      .notNull()
      .references(() => meetings.id, { onDelete: "cascade" }),
    /** NULL for external attendees who have no Kara account. */
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),

    role: text("role").$type<ParticipantRole>().notNull().default(ParticipantRole.ATTENDEE),
    displayName: text("display_name").notNull(),
    email: text("email"),

    joinedAt: integer("joined_at", { mode: "timestamp_ms" }),
    leftAt: integer("left_at", { mode: "timestamp_ms" }),
    attendanceSeconds: integer("attendance_seconds"),
    isBot: bool("is_bot").notNull().default(false),

    createdAt: createdAt(),
  },
  (t) => [
    // SQLite treats NULLs as distinct in UNIQUE indexes, so any number of external
    // (user_id IS NULL) attendees can coexist on one meeting.
    uniqueIndex("meeting_participants_meeting_user_unique").on(t.meetingId, t.userId),
    index("meeting_participants_user_idx").on(t.userId),
    index("meeting_participants_role_idx").on(t.meetingId, t.role),
  ],
);

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const meetingsRelations = relations(meetings, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [meetings.orgId],
    references: [organizations.id],
  }),
  host: one(users, {
    fields: [meetings.hostUserId],
    references: [users.id],
  }),
  recordings: many(recordings),
  transcripts: many(transcripts),
  utterances: many(utterances),
  participants: many(meetingParticipants),
}));

export const recordingsRelations = relations(recordings, ({ one, many }) => ({
  meeting: one(meetings, {
    fields: [recordings.meetingId],
    references: [meetings.id],
  }),
  transcripts: many(transcripts),
}));

export const transcriptsRelations = relations(transcripts, ({ one, many }) => ({
  meeting: one(meetings, {
    fields: [transcripts.meetingId],
    references: [meetings.id],
  }),
  recording: one(recordings, {
    fields: [transcripts.recordingId],
    references: [recordings.id],
  }),
  utterances: many(utterances),
}));

export const utterancesRelations = relations(utterances, ({ one }) => ({
  meeting: one(meetings, {
    fields: [utterances.meetingId],
    references: [meetings.id],
  }),
  transcript: one(transcripts, {
    fields: [utterances.transcriptId],
    references: [transcripts.id],
  }),
  speaker: one(users, {
    fields: [utterances.speakerUserId],
    references: [users.id],
  }),
}));

export const meetingParticipantsRelations = relations(meetingParticipants, ({ one }) => ({
  meeting: one(meetings, {
    fields: [meetingParticipants.meetingId],
    references: [meetings.id],
  }),
  user: one(users, {
    fields: [meetingParticipants.userId],
    references: [users.id],
  }),
}));
