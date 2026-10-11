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

export const meetings = pgTable(
  "meetings",
  {
    id: primaryId("meet"),
    orgId: orgId().references(() => organizations.id, { onDelete: "cascade" }),
    hostUserId: text("host_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    title: text("title").notNull(),
    description: text("description"),
    platform: text("platform").$type<MeetingPlatform>().notNull().default(MeetingPlatform.GOOGLE_MEET),
    meetingUrl: text("meeting_url"),
    nativeMeetingId: text("native_meeting_id"),
    passcode: text("passcode"),

    status: text("status").$type<MeetingStatus>().notNull().default(MeetingStatus.SCHEDULED),
    meetingType: text("meeting_type").$type<MeetingType>(),
    typeConfidence: doublePrecision("type_confidence"),

    scheduledStartAt: timestamp("scheduled_start_at", { withTimezone: true, mode: "date" }).notNull(),
    scheduledEndAt: timestamp("scheduled_end_at", { withTimezone: true, mode: "date" }),
    actualStartAt: timestamp("actual_start_at", { withTimezone: true, mode: "date" }),
    actualEndAt: timestamp("actual_end_at", { withTimezone: true, mode: "date" }),

    botJoinedAt: timestamp("bot_joined_at", { withTimezone: true, mode: "date" }),
    botLeftAt: timestamp("bot_left_at", { withTimezone: true, mode: "date" }),
    botErrorMessage: text("bot_error_message"),

    calendarProvider: text("calendar_provider"),
    calendarEventId: text("calendar_event_id"),

    metadata: jsonb("metadata").$type<Record<string, unknown>>(),

    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: deletedAt(),
  },
  (t) => [
    index("meetings_org_status_start_idx").on(t.orgId, t.status, t.scheduledStartAt),
    index("meetings_host_idx").on(t.hostUserId),
    index("meetings_calendar_event_idx").on(t.calendarEventId),
    index("meetings_meeting_type_idx").on(t.orgId, t.meetingType),
  ],
);

export const recordings = pgTable(
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
    checksum: text("checksum"),

    status: text("status").$type<RecordingStatus>().notNull().default(RecordingStatus.UPLOADING),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true, mode: "date" }),

    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("recordings_meeting_idx").on(t.meetingId),
    uniqueIndex("recordings_s3_key_unique").on(t.s3Bucket, t.s3Key),
    index("recordings_status_idx").on(t.status),
  ],
);

export const transcripts = pgTable(
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
    provider: text("provider").notNull().default("deepgram-nova-3"),
    model: text("model"),
    status: text("status").$type<TranscriptStatus>().notNull().default(TranscriptStatus.PENDING),

    wordCount: integer("word_count"),
    utteranceCount: integer("utterance_count"),
    confidence: doublePrecision("confidence"),
    rawPayload: jsonb("raw_payload").$type<Record<string, unknown>>(),

    processingStartedAt: timestamp("processing_started_at", { withTimezone: true, mode: "date" }),
    processingCompletedAt: timestamp("processing_completed_at", { withTimezone: true, mode: "date" }),
    errorMessage: text("error_message"),

    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("transcripts_meeting_idx").on(t.meetingId),
    index("transcripts_status_idx").on(t.status),
  ],
);

export const utterances = pgTable(
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

    speakerLabel: text("speaker_label").notNull(),
    speakerUserId: text("speaker_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    speakerName: text("speaker_name"),

    startMs: integer("start_ms").notNull(),
    endMs: integer("end_ms").notNull(),
    text: text("text").notNull(),
    sequence: integer("sequence").notNull(),

    type: text("type").$type<UtteranceType>().notNull().default(UtteranceType.INFORMATION),
    typeConfidence: doublePrecision("type_confidence"),

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

export const meetingParticipants = pgTable(
  "meeting_participants",
  {
    id: primaryId("par"),
    orgId: orgId().references(() => organizations.id, { onDelete: "cascade" }),
    meetingId: text("meeting_id")
      .notNull()
      .references(() => meetings.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),

    role: text("role").$type<ParticipantRole>().notNull().default(ParticipantRole.ATTENDEE),
    displayName: text("display_name").notNull(),
    email: text("email"),

    joinedAt: timestamp("joined_at", { withTimezone: true, mode: "date" }),
    leftAt: timestamp("left_at", { withTimezone: true, mode: "date" }),
    attendanceSeconds: integer("attendance_seconds"),
    isBot: bool("is_bot").notNull().default(false),

    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("meeting_participants_meeting_user_unique").on(t.meetingId, t.userId),
    index("meeting_participants_user_idx").on(t.userId),
    index("meeting_participants_role_idx").on(t.meetingId, t.role),
  ],
);

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
