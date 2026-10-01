import { z } from "zod";

import { TaskPriority, TaskStatus } from "./enums.js";

// Re-export every domain enum. Consumers keep importing from `@kara/shared-types`
// exactly as before; the enum definitions simply live in `./enums.ts` now.
export * from "./enums.js";

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
