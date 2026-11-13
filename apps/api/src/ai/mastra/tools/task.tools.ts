import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { getDb, schema, eq, and, asc } from "@kara/db";
import { TaskPriority, TaskSource, TaskStatus, UtteranceType } from "@kara/shared-types";

export const extractActionItemsTool = createTool({
  id: "extractActionItemsTool",
  description:
    "Retrieve or structure action items from a meeting transcript, including assignees, audio deep-link millisecond offsets, and priority.",
  inputSchema: z.object({
    orgId: z.string().describe("Active organization ID"),
    meetingId: z.string().describe("Meeting ID to extract items from"),
  }),
  execute: async (input: any) => {
    const db = getDb();

    // Check if MOM action items already synthesized
    const mom = await db.query.moms.findFirst({
      where: and(
        eq(schema.moms.meetingId, input.meetingId),
        eq(schema.moms.orgId, input.orgId),
      ),
      with: {
        actionItems: true,
      },
    });

    if (mom && mom.actionItems.length > 0) {
      return {
        meetingId: input.meetingId,
        source: "mom_action_items",
        count: mom.actionItems.length,
        items: mom.actionItems.map((a) => ({
          id: a.id,
          title: a.title,
          description: a.description,
          assigneeName: a.assigneeNameRaw,
          audioDeepLinkMs: a.audioDeepLinkMs,
          status: a.status,
          promotedTaskId: a.promotedTaskId,
        })),
      };
    }

    // Fallback: search utterances tagged with ACTION_ITEM
    const utterances = await db.query.utterances.findMany({
      where: and(
        eq(schema.utterances.meetingId, input.meetingId),
        eq(schema.utterances.type, UtteranceType.ACTION_ITEM),
      ),
      limit: 10,
    });

    return {
      meetingId: input.meetingId,
      source: "diarized_utterances",
      count: utterances.length,
      items: utterances.map((u) => ({
        id: u.id,
        title: u.text.slice(0, 80),
        description: u.text,
        assigneeName: u.speakerName || u.speakerLabel,
        audioDeepLinkMs: u.startMs,
        status: "PENDING",
      })),
    };
  },
});

export const kanbanCreateTool = createTool({
  id: "kanbanCreateTool",
  description: "Create and dispatch an actionable task onto the organization Kanban board.",
  inputSchema: z.object({
    orgId: z.string(),
    title: z.string().describe("Clear, concise task title"),
    description: z.string().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
    assigneeUserId: z.string().optional(),
    meetingId: z.string().optional().describe("Associated meeting source ID"),
    sourceAudioDeepLinkMs: z.number().optional().describe("Exact millisecond offset in meeting audio"),
    dealValue: z.number().optional().describe("Associated CRM deal or impact value"),
  }),
  execute: async (input: any) => {
    const db = getDb();

    // 1. Locate board
    let board = await db.query.kanbanBoards.findFirst({
      where: and(
        eq(schema.kanbanBoards.orgId, input.orgId),
        eq(schema.kanbanBoards.isDefault, true),
      ),
    });

    if (!board) {
      board = await db.query.kanbanBoards.findFirst({
        where: eq(schema.kanbanBoards.orgId, input.orgId),
      });
    }

    if (!board) {
      const [newBoard] = await db
        .insert(schema.kanbanBoards)
        .values({
          orgId: input.orgId,
          title: "Executive Workspace Board",
          isDefault: true,
        })
        .returning();
      board = newBoard;
    }

    // 2. Locate first column (e.g. TODO)
    let column = await db.query.kanbanColumns.findFirst({
      where: eq(schema.kanbanColumns.boardId, board.id),
      orderBy: [asc(schema.kanbanColumns.position)],
    });

    if (!column) {
      const [newCol] = await db
        .insert(schema.kanbanColumns)
        .values({
          orgId: input.orgId,
          boardId: board.id,
          title: "To Do",
          statusMapping: TaskStatus.TODO,
          position: 1000,
        })
        .returning();
      column = newCol;
    }

    // 3. Insert task
    const [task] = await db
      .insert(schema.tasks)
      .values({
        orgId: input.orgId,
        boardId: board.id,
        columnId: column.id,
        title: input.title,
        description: input.description || null,
        priority: (input.priority as TaskPriority) || TaskPriority.MEDIUM,
        status: TaskStatus.TODO,
        assigneeUserId: input.assigneeUserId || null,
        source: input.meetingId ? TaskSource.AI_EXTRACTED : TaskSource.MANUAL,
        sourceMeetingId: input.meetingId || null,
        sourceAudioDeepLinkMs: input.sourceAudioDeepLinkMs || null,
        metadata: input.dealValue ? { dealValue: input.dealValue } : null,
      })
      .returning();

    return {
      success: true,
      task: {
        id: task.id,
        title: task.title,
        boardId: task.boardId,
        columnId: task.columnId,
        priority: task.priority,
        status: task.status,
      },
    };
  },
});

export const twentyCrmSyncTool = createTool({
  id: "twentyCrmSyncTool",
  description:
    "Synchronize executive intelligence, deals, or client obligations into the Twenty CRM schema.",
  inputSchema: z.object({
    orgId: z.string(),
    objectSlug: z.string().default("deals").describe("Target CRM object slug (e.g. 'deals', 'companies')"),
    recordData: z.record(z.string(), z.any()).describe("JSON payload representing the CRM record fields"),
    createdById: z.string().optional(),
  }),
  execute: async (input: any) => {
    const db = getDb();

    // 1. Find CRM Object
    const crmObj = await db.query.crmObjects.findFirst({
      where: and(
        eq(schema.crmObjects.orgId, input.orgId),
        eq(schema.crmObjects.slug, input.objectSlug),
      ),
    });

    if (!crmObj) {
      return {
        success: false,
        error: `CRM object "${input.objectSlug}" not found in organization ${input.orgId}`,
      };
    }

    // 2. Insert CRM Record
    const [record] = await db
      .insert(schema.crmRecords)
      .values({
        orgId: input.orgId,
        objectId: crmObj.id,
        data: input.recordData,
        createdById: input.createdById || null,
      })
      .returning();

    return {
      success: true,
      recordId: record.id,
      objectSlug: input.objectSlug,
      data: record.data,
    };
  },
});
