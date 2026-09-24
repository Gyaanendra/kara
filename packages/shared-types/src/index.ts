import { z } from "zod";

// Meeting Lifecycle States
export enum MeetingStatus {
  SCHEDULED = "SCHEDULED",
  BOT_JOINING = "BOT_JOINING",
  RECORDING = "RECORDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED"
}

// User RBAC Roles
export enum UserRole {
  MEMBER = "MEMBER",
  ADMIN = "ADMIN",
  SUPERADMIN = "SUPERADMIN"
}

// Twenty CRM Custom Object Field Types
export enum CustomFieldType {
  TEXT = "TEXT",
  NUMBER = "NUMBER",
  SELECT = "SELECT",
  MULTI_SELECT = "MULTI_SELECT",
  DATE = "DATE",
  RELATION = "RELATION",
  BOOLEAN = "BOOLEAN"
}

// Kanban Task Statuses
export enum TaskStatus {
  BACKLOG = "BACKLOG",
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  IN_REVIEW = "IN_REVIEW",
  DONE = "DONE"
}

// Kanban Task Priorities
export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT"
}

// Non-hallucinatory past meeting query schema
export const PastMeetingSearchSchema = z.object({
  query: z.string().min(1),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(20).default(5),
});

export type PastMeetingSearchInput = z.infer<typeof PastMeetingSearchSchema>;

// Task Creation Schema (for AI Agent and API)
export const CreateTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  assigneeId: z.string().optional(),
  meetingId: z.string().optional(),
  dueDate: z.string().datetime().optional(),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;

