import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { MeetingsService, CreateMeetingDto } from "./meetings.service.js";
import { CurrentTenant, TenantContext } from "../auth/tenant.decorator.js";
import { MeetingStatus, MeetingType } from "@kara/shared-types";

@Controller("meetings")
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Get()
  async listMeetings(
    @CurrentTenant() tenant: TenantContext,
    @Query("status") status?: MeetingStatus,
    @Query("type") type?: MeetingType,
  ) {
    return this.meetingsService.listMeetings(tenant.orgId, status, type);
  }

  @Get(":id")
  async getMeeting(@CurrentTenant() tenant: TenantContext, @Param("id") id: string) {
    return this.meetingsService.getMeetingById(tenant.orgId, id);
  }

  @Post()
  async createMeeting(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateMeetingDto,
  ) {
    return this.meetingsService.createMeeting(tenant.orgId, tenant.userId!, dto);
  }

  @Patch(":id/status")
  async updateStatus(
    @CurrentTenant() tenant: TenantContext,
    @Param("id") id: string,
    @Body("status") status: MeetingStatus,
    @Body("errorMessage") errorMessage?: string,
  ) {
    return this.meetingsService.updateStatus(tenant.orgId, id, status, errorMessage);
  }
}
