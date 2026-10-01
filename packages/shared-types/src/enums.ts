/**
 * Core domain enums shared across `apps/web`, `apps/api`, and the Mastra agent tools.
 *
 * Single source of truth: any change here propagates at compile-time to the frontend,
 * the NestJS backend, the BullMQ workers, and the agent tool schemas (see doc 01 §4.3).
 *
 * Persisted representation: every enum is stored as its **string value**, never as a
 * numeric ordinal. This keeps rows readable in raw SQL and makes SQLite -> PostgreSQL
 * migration lossless (see doc 08 §7).
 */

// ============================================================
// Auth & Tenancy
// ============================================================

/** User RBAC Roles */
export enum UserRole {
  MEMBER = "MEMBER",
  ADMIN = "ADMIN",
  SUPERADMIN = "SUPERADMIN"
}

/** Lifecycle of a user's membership within a single organization. */
export enum MembershipStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED"
}

// ============================================================
// Meeting Lifecycle
// ============================================================

/** Meeting Lifecycle States */
export enum MeetingStatus {
  SCHEDULED = "SCHEDULED",
  BOT_JOINING = "BOT_JOINING",
  RECORDING = "RECORDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED"
}

/** Conferencing provider the bot runner dials into. */
export enum MeetingPlatform {
  ZOOM = "ZOOM",
  GOOGLE_MEET = "GOOGLE_MEET",
  MS_TEAMS = "MS_TEAMS",
  WEBEX = "WEBEX",
  OTHER = "OTHER"
}

/** A participant's relationship to a meeting. */
export enum ParticipantRole {
  HOST = "HOST",
  ATTENDEE = "ATTENDEE",
  BOT = "BOT"
}

/** Lifecycle of a raw audio object in RustFS S3. */
export enum RecordingStatus {
  UPLOADING = "UPLOADING",
  UPLOADED = "UPLOADED",
  FAILED = "FAILED",
  PURGED = "PURGED"
}

/** Lifecycle of the Whisper diarization job for a recording. */
export enum TranscriptStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED"
}

/**
 * Meeting category assigned post-MOM by the Laya meeting auto-tagger.
 * See doc 07 §2D "Meeting Auto-Tagger".
 */
export enum MeetingType {
  STANDUP = "STANDUP",
  SPRINT_REVIEW = "SPRINT_REVIEW",
  CLIENT_CALL = "CLIENT_CALL",
  ONE_ON_ONE = "ONE_ON_ONE",
  BRAINSTORM = "BRAINSTORM",
  ALL_HANDS = "ALL_HANDS"
}

// ============================================================
// Laya Decision Model
// ============================================================

/** Per-utterance classification produced by the Laya post-transcription classifier. */
export enum UtteranceType {
  ACTION_ITEM = "ACTION_ITEM",
  DECISION = "DECISION",
  QUESTION = "QUESTION",
  INFORMATION = "INFORMATION"
}

/** Which tool the Laya query router selected before the LLM was invoked. */
export enum ChatRoute {
  MEETING_SEARCH = "MEETING_SEARCH",
  TASK_LOOKUP = "TASK_LOOKUP",
  CRM_QUERY = "CRM_QUERY",
  CALENDAR_CHECK = "CALENDAR_CHECK",
  GENERAL_CHAT = "GENERAL_CHAT"
}

// ============================================================
// MOM (Minutes of Meeting)
// ============================================================

/** Lifecycle of the Mastra MOM synthesis workflow output. */
export enum MomStatus {
  PENDING = "PENDING",
  GENERATING = "GENERATING",
  READY = "READY",
  FAILED = "FAILED"
}

/** Triage state of an extracted action item. */
export enum ActionItemStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
  CANCELLED = "CANCELLED"
}

// ============================================================
// Twenty CRM Custom Data Engine
// ============================================================

/** Twenty CRM Custom Object Field Types */
export enum CustomFieldType {
  TEXT = "TEXT",
  NUMBER = "NUMBER",
  SELECT = "SELECT",
  MULTI_SELECT = "MULTI_SELECT",
  DATE = "DATE",
  RELATION = "RELATION",
  URL = "URL",
  EMAIL = "EMAIL",
  PHONE = "PHONE",
  BOOLEAN = "BOOLEAN"
}

/** Cardinality of a `RELATION` field between two custom objects. */
export enum RelationKind {
  ONE_TO_ONE = "ONE_TO_ONE",
  ONE_TO_MANY = "ONE_TO_MANY",
  MANY_TO_ONE = "MANY_TO_ONE",
  MANY_TO_MANY = "MANY_TO_MANY"
}

// ============================================================
// Kanban & Task OS
// ============================================================

/** Kanban Task Statuses */
export enum TaskStatus {
  BACKLOG = "BACKLOG",
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  IN_REVIEW = "IN_REVIEW",
  DONE = "DONE"
}

/** Kanban Task Priorities */
export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT"
}

/** Whether a task was typed by a human or extracted from a meeting by Kara. */
export enum TaskSource {
  MANUAL = "MANUAL",
  AI_EXTRACTED = "AI_EXTRACTED"
}

/** Audit verb recorded in `task_activity_log`. */
export enum TaskActivityAction {
  CREATED = "CREATED",
  UPDATED = "UPDATED",
  STATUS_CHANGED = "STATUS_CHANGED",
  ASSIGNED = "ASSIGNED",
  UNASSIGNED = "UNASSIGNED",
  COMMENTED = "COMMENTED",
  MOVED = "MOVED",
  DELETED = "DELETED"
}

// ============================================================
// AI & Vector Domain
// ============================================================

/** Author of a row in `chat_messages`. */
export enum ChatRole {
  USER = "USER",
  ASSISTANT = "ASSISTANT",
  SYSTEM = "SYSTEM",
  TOOL = "TOOL"
}

/** Lifecycle of a transcript chunk on its way into ChromaDB / Qdrant. */
export enum EmbeddingStatus {
  PENDING = "PENDING",
  INDEXED = "INDEXED",
  FAILED = "FAILED",
  STALE = "STALE"
}
