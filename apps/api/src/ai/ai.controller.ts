import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { AiService, VectorSearchInput, AskChatInput } from "./ai.service.js";
import { CurrentTenant, TenantContext } from "../auth/tenant.decorator.js";
import { ChatRole, ChatRoute } from "@kara/shared-types";

@Controller("ai")
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post("search")
  async searchKnowledgeBase(
    @CurrentTenant() tenant: TenantContext,
    @Body() input: VectorSearchInput,
  ) {
    return this.aiService.searchKnowledgeBase(tenant.orgId, input);
  }

  @Post("chat/ask")
  async askChat(
    @CurrentTenant() tenant: TenantContext,
    @Body() input: AskChatInput,
  ) {
    return this.aiService.askChat(tenant.orgId, tenant.userId!, input);
  }

  @Post("transcribe/:meetingId")
  async transcribeMeeting(
    @CurrentTenant() tenant: TenantContext,
    @Param("meetingId") meetingId: string,
    @Body("audioUrl") audioUrl: string,
  ) {
    return this.aiService.transcribeMeetingAudio(tenant.orgId, meetingId, audioUrl || "https://api.rustfs.vihar.in/sample.webm");
  }

  @Post("synthesize-mom/:meetingId")
  async synthesizeMom(
    @CurrentTenant() tenant: TenantContext,
    @Param("meetingId") meetingId: string,
  ) {
    return this.aiService.synthesizeMeetingMom(tenant.orgId, meetingId);
  }

  @Get("chat/sessions")
  async getSessions(@CurrentTenant() tenant: TenantContext) {
    return this.aiService.getSessions(tenant.orgId, tenant.userId!);
  }

  @Post("chat/sessions")
  async createSession(
    @CurrentTenant() tenant: TenantContext,
    @Body("title") title?: string,
  ) {
    return this.aiService.createSession(tenant.orgId, tenant.userId!, title);
  }

  @Post("chat/sessions/:id/messages")
  async appendMessage(
    @CurrentTenant() tenant: TenantContext,
    @Param("id") sessionId: string,
    @Body("role") role: ChatRole,
    @Body("content") content: string,
    @Body("route") route?: ChatRoute,
    @Body("citations") citations?: any[],
  ) {
    return this.aiService.appendMessage(tenant.orgId, sessionId, role, content, route, citations);
  }
}
