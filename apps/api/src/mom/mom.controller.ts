import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { MomService, CreateMomDto } from "./mom.service.js";
import { CurrentTenant, TenantContext } from "../auth/tenant.decorator.js";
import { ActionItemStatus } from "@kara/shared-types";

@Controller("moms")
export class MomController {
  constructor(private readonly momService: MomService) {}

  @Get("meeting/:meetingId")
  async getMom(
    @CurrentTenant() tenant: TenantContext,
    @Param("meetingId") meetingId: string,
  ) {
    return this.momService.getMomByMeeting(tenant.orgId, meetingId);
  }

  @Post()
  async createMom(@CurrentTenant() tenant: TenantContext, @Body() dto: CreateMomDto) {
    return this.momService.createOrUpdateMom(tenant.orgId, dto);
  }

  @Patch("action-items/:id/status")
  async updateActionItemStatus(
    @CurrentTenant() tenant: TenantContext,
    @Param("id") id: string,
    @Body("status") status: ActionItemStatus,
  ) {
    return this.momService.updateActionItemStatus(tenant.orgId, id, status);
  }

  @Post("action-items/:id/promote")
  async promoteToTask(
    @CurrentTenant() tenant: TenantContext,
    @Param("id") id: string,
    @Body("boardId") boardId: string,
    @Body("columnId") columnId: string,
  ) {
    return this.momService.promoteToTask(tenant.orgId, id, boardId, columnId);
  }
}
