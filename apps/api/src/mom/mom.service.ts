import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { DRIZZLE } from "../database/database.module.js";
import { schema, eq, and } from "@kara/db";
import type { KaraDatabase } from "@kara/db";
import { ActionItemStatus, MomStatus, TaskPriority, TaskSource, TaskStatus } from "@kara/shared-types";

export class CreateMomDecisionDto {
  decision!: string;
  rationale?: string;
  sequence?: number;
}

export class CreateMomActionItemDto {
  title!: string;
  description?: string;
  assigneeUserId?: string;
  assigneeNameRaw?: string;
  dueDate?: string | Date;
  audioDeepLinkMs?: number;
  sequence?: number;
}

export class CreateMomDto {
  meetingId!: string;
  executiveSummary!: string;
  keyTopics?: string[];
  sentiment?: string;
  decisions!: CreateMomDecisionDto[];
  actionItems!: CreateMomActionItemDto[];
}

@Injectable()
export class MomService {
  constructor(@Inject(DRIZZLE) private readonly db: KaraDatabase) {}

  async getMomByMeeting(orgId: string, meetingId: string) {
    const mom = await this.db.query.moms.findFirst({
      where: and(eq(schema.moms.orgId, orgId), eq(schema.moms.meetingId, meetingId)),
      with: {
        decisions: { orderBy: (d, { asc }) => [asc(d.sequence)] },
        actionItems: { orderBy: (a, { asc }) => [asc(a.sequence)] },
      },
    });

    if (!mom) {
      throw new NotFoundException(`MOM for meeting ${meetingId} not found`);
    }
    return mom;
  }

  async createOrUpdateMom(orgId: string, dto: CreateMomDto) {
    return this.db.transaction(async (tx) => {
      const [mom] = await tx
        .insert(schema.moms)
        .values({
          orgId,
          meetingId: dto.meetingId,
          status: MomStatus.READY,
          executiveSummary: dto.executiveSummary,
          keyTopics: dto.keyTopics ?? [],
          sentiment: dto.sentiment ?? "neutral",
        })
        .onConflictDoUpdate({
          target: [schema.moms.meetingId],
          set: {
            executiveSummary: dto.executiveSummary,
            keyTopics: dto.keyTopics ?? [],
            status: MomStatus.READY,
            updatedAt: new Date(),
          },
        })
        .returning();

      if (dto.decisions.length > 0) {
        await tx.insert(schema.momDecisions).values(
          dto.decisions.map((d, idx) => ({
            orgId,
            momId: mom.id,
            meetingId: dto.meetingId,
            decision: d.decision,
            rationale: d.rationale,
            sequence: d.sequence ?? idx + 1,
          })),
        );
      }

      if (dto.actionItems.length > 0) {
        await tx.insert(schema.momActionItems).values(
          dto.actionItems.map((a, idx) => ({
            orgId,
            momId: mom.id,
            meetingId: dto.meetingId,
            title: a.title,
            description: a.description,
            assigneeUserId: a.assigneeUserId,
            assigneeNameRaw: a.assigneeNameRaw,
            dueDate: a.dueDate ? new Date(a.dueDate) : undefined,
            audioDeepLinkMs: a.audioDeepLinkMs,
            sequence: a.sequence ?? idx + 1,
          })),
        );
      }

      return mom;
    });
  }

  async updateActionItemStatus(orgId: string, actionItemId: string, status: ActionItemStatus) {
    const [updated] = await this.db
      .update(schema.momActionItems)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(schema.momActionItems.orgId, orgId), eq(schema.momActionItems.id, actionItemId)))
      .returning();

    if (!updated) {
      throw new NotFoundException(`Action item ${actionItemId} not found`);
    }
    return updated;
  }

  async promoteToTask(orgId: string, actionItemId: string, boardId: string, columnId: string) {
    const actionItem = await this.db.query.momActionItems.findFirst({
      where: and(eq(schema.momActionItems.orgId, orgId), eq(schema.momActionItems.id, actionItemId)),
    });

    if (!actionItem) {
      throw new NotFoundException(`Action item ${actionItemId} not found`);
    }

    const [task] = await this.db
      .insert(schema.tasks)
      .values({
        orgId,
        boardId,
        columnId,
        title: actionItem.title,
        description: actionItem.description,
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        assigneeUserId: actionItem.assigneeUserId,
        dueDate: actionItem.dueDate,
        source: TaskSource.AI_EXTRACTED,
        sourceMeetingId: actionItem.meetingId,
        sourceActionItemId: actionItem.id,
        sourceAudioDeepLinkMs: actionItem.audioDeepLinkMs,
      })
      .returning();

    await this.db
      .update(schema.momActionItems)
      .set({ promotedTaskId: task.id, status: ActionItemStatus.IN_PROGRESS })
      .where(eq(schema.momActionItems.id, actionItemId));

    return task;
  }
}
