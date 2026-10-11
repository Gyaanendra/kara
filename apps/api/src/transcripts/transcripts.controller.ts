import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { TranscriptsService, IngestTranscriptBatchDto } from "./transcripts.service.js";
import { CurrentTenant, TenantContext } from "../auth/tenant.decorator.js";

@Controller("transcripts")
export class TranscriptsController {
  constructor(private readonly transcriptsService: TranscriptsService) {}

  @Get("meeting/:meetingId")
  async getTranscript(
    @CurrentTenant() tenant: TenantContext,
    @Param("meetingId") meetingId: string,
  ) {
    return this.transcriptsService.getTranscriptByMeeting(tenant.orgId, meetingId);
  }

  @Post("batch")
  async ingestBatch(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: IngestTranscriptBatchDto,
  ) {
    return this.transcriptsService.ingestBatch(tenant.orgId, dto);
  }
}
