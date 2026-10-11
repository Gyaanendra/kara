import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { DRIZZLE } from "../database/database.module.js";
import { schema, eq, and } from "@kara/db";
import type { KaraDatabase } from "@kara/db";
import { TaskActivityAction, TaskPriority, TaskSource, TaskStatus } from "@kara/shared-types";

export class CreateTaskDto {
  boardId!: string;
  columnId!: string;
  title!: string;
  description?: string;
  priority?: TaskPriority;
  assigneeUserId?: string;
  dueDate?: string | Date;
  labels?: string[];
  position?: number;
}

export class ReorderTaskDto {
  taskId!: string;
  targetColumnId!: string;
  newPosition!: number;
}

@Injectable()
export class KanbanService {
  constructor(@Inject(DRIZZLE) private readonly db: KaraDatabase) {}

  async getBoards(orgId: string) {
    return this.db.query.kanbanBoards.findMany({
      where: eq(schema.kanbanBoards.orgId, orgId),
      with: {
        columns: {
          orderBy: (c, { asc }) => [asc(c.position)],
          with: {
            tasks: {
              orderBy: (t, { asc }) => [asc(t.position)],
              with: {
                assignee: true,
              },
            },
          },
        },
      },
    });
  }

  async createTask(orgId: string, userId: string, dto: CreateTaskDto) {
    const col = await this.db.query.kanbanColumns.findFirst({
      where: and(eq(schema.kanbanColumns.orgId, orgId), eq(schema.kanbanColumns.id, dto.columnId)),
    });
    if (!col) {
      throw new NotFoundException(`Column ${dto.columnId} not found`);
    }

    const [task] = await this.db
      .insert(schema.tasks)
      .values({
        orgId,
        boardId: dto.boardId,
        columnId: dto.columnId,
        title: dto.title,
        description: dto.description,
        status: col.statusMapping,
        priority: dto.priority ?? TaskPriority.MEDIUM,
        assigneeUserId: dto.assigneeUserId,
        creatorUserId: userId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        labels: dto.labels,
        position: dto.position ?? 1000,
        source: TaskSource.MANUAL,
      })
      .returning();

    return task;
  }

  async updateTask(orgId: string, taskId: string, patch: Partial<CreateTaskDto>) {
    const [updated] = await this.db
      .update(schema.tasks)
      .set({
        ...patch,
        dueDate: patch.dueDate ? new Date(patch.dueDate) : undefined,
        updatedAt: new Date(),
      })
      .where(and(eq(schema.tasks.orgId, orgId), eq(schema.tasks.id, taskId)))
      .returning();

    if (!updated) {
      throw new NotFoundException(`Task ${taskId} not found`);
    }
    return updated;
  }

  async reorderTask(orgId: string, userId: string, dto: ReorderTaskDto) {
    const targetCol = await this.db.query.kanbanColumns.findFirst({
      where: and(eq(schema.kanbanColumns.orgId, orgId), eq(schema.kanbanColumns.id, dto.targetColumnId)),
    });
    if (!targetCol) {
      throw new NotFoundException(`Target column ${dto.targetColumnId} not found`);
    }

    const [updated] = await this.db
      .update(schema.tasks)
      .set({
        columnId: dto.targetColumnId,
        status: targetCol.statusMapping,
        position: dto.newPosition,
        updatedAt: new Date(),
      })
      .where(and(eq(schema.tasks.orgId, orgId), eq(schema.tasks.id, dto.taskId)))
      .returning();

    await this.db.insert(schema.taskActivityLog).values({
      orgId,
      taskId: dto.taskId,
      actorUserId: userId,
      action: TaskActivityAction.MOVED,
      diff: { columnId: dto.targetColumnId, position: dto.newPosition },
    });

    return updated;
  }

  async addComment(orgId: string, userId: string, taskId: string, content: string) {
    const [comment] = await this.db
      .insert(schema.taskComments)
      .values({
        orgId,
        taskId,
        authorUserId: userId,
        content,
      })
      .returning();

    return comment;
  }
}
