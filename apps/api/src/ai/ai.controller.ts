import { Body, Controller, Get, Param, Patch, Post, Res } from "@nestjs/common";
import type { Response } from "express";
import { AiService, VectorSearchInput, AskChatInput } from "./ai.service.js";
import { CurrentTenant, TenantContext } from "../auth/tenant.decorator.js";
import { ChatRole, ChatRoute } from "@kara/shared-types";
import { HelperTaskRequestDto } from "./mastra/services/sub-helper.service.js";

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

  /**
   * Real-time Server-Sent Events (SSE) streaming chat endpoint.
   * Emits reflex routing events, Sub-Helper dispatches, tokens, and citations in real time.
   */
  @Post("chat/stream")
  async streamChat(
    @CurrentTenant() tenant: TenantContext,
    @Body() input: AskChatInput,
    @Res() res: Response,
  ) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    try {
      await this.aiService.streamChat(
        tenant.orgId,
        tenant.userId!,
        input,
        (event: any) => {
          res.write(`data: ${JSON.stringify(event)}\n\n`);
        },
      );
    } catch (err: any) {
      res.write(`data: ${JSON.stringify({ type: "error", error: err.message })}\n\n`);
    } finally {
      res.end();
    }
  }

  // --- Sub-Helper Registry & Execution Endpoints ---

  @Get("sub-helpers")
  async listSubHelpers(@CurrentTenant() tenant: TenantContext) {
    return this.aiService.listSubHelpers(tenant.orgId);
  }

  @Post("sub-helpers")
  async createSubHelper(
    @CurrentTenant() tenant: TenantContext,
    @Body()
    body: {
      slug: string;
      name: string;
      description?: string;
      systemPromptSlice: string;
      assignedTools: string[];
      model?: string;
      temperature?: number;
    },
  ) {
    return this.aiService.createSubHelper(tenant.orgId, body);
  }

  @Patch("sub-helpers/:slug/tools")
  async updateSubHelperTools(
    @CurrentTenant() tenant: TenantContext,
    @Param("slug") slug: string,
    @Body("assignedTools") assignedTools: string[],
  ) {
    return this.aiService.updateSubHelperTools(tenant.orgId, slug, assignedTools);
  }

  @Post("sub-helpers/execute")
  async executeSubHelper(
    @CurrentTenant() tenant: TenantContext,
    @Body() request: HelperTaskRequestDto,
  ) {
    return this.aiService.executeSubHelper(tenant.orgId, request);
  }

  // --- Audio Transcription & MOM Synthesis ---

  @Post("transcribe/:meetingId")
  async transcribeMeeting(
    @CurrentTenant() tenant: TenantContext,
    @Param("meetingId") meetingId: string,
    @Body("audioUrl") audioUrl: string,
  ) {
    return this.aiService.transcribeMeetingAudio(
      tenant.orgId,
      meetingId,
      audioUrl || "https://api.rustfs.vihar.in/sample.webm",
    );
  }

  @Post("synthesize-mom/:meetingId")
  async synthesizeMom(
    @CurrentTenant() tenant: TenantContext,
    @Param("meetingId") meetingId: string,
  ) {
    return this.aiService.synthesizeMeetingMom(tenant.orgId, meetingId);
  }

  // --- Chat Session History ---

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
