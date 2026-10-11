import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { KanbanService, CreateTaskDto, ReorderTaskDto } from "./kanban.service.js";
import { CurrentTenant, TenantContext } from "../auth/tenant.decorator.js";

@Controller("kanban")
export class KanbanController {
  constructor(private readonly kanbanService: KanbanService) {}

  @Get("boards")
  async getBoards(@CurrentTenant() tenant: TenantContext) {
    return this.kanbanService.getBoards(tenant.orgId);
  }

  @Post("tasks")
  async createTask(@CurrentTenant() tenant: TenantContext, @Body() dto: CreateTaskDto) {
    return this.kanbanService.createTask(tenant.orgId, tenant.userId!, dto);
  }

  @Patch("tasks/:id")
  async updateTask(
    @CurrentTenant() tenant: TenantContext,
    @Param("id") id: string,
    @Body() patch: Partial<CreateTaskDto>,
  ) {
    return this.kanbanService.updateTask(tenant.orgId, id, patch);
  }

  @Post("tasks/reorder")
  async reorderTask(@CurrentTenant() tenant: TenantContext, @Body() dto: ReorderTaskDto) {
    return this.kanbanService.reorderTask(tenant.orgId, tenant.userId!, dto);
  }

  @Post("tasks/:id/comments")
  async addComment(
    @CurrentTenant() tenant: TenantContext,
    @Param("id") id: string,
    @Body("content") content: string,
  ) {
    return this.kanbanService.addComment(tenant.orgId, tenant.userId!, id, content);
  }
}
