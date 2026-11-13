import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Agent } from "@mastra/core/agent";
import { getDb, schema, eq, and } from "@kara/db";
import { allMastraTools } from "../tools/index.js";

export class HelperTaskRequestDto {
  helperSlug!: string;
  taskPrompt!: string;
  contextSlice?: Record<string, unknown>;
}

export interface HelperExecutionResult {
  helperSlug: string;
  helperName: string;
  status: "COMPLETED" | "FAILED";
  result: any;
  toolOutputs?: Record<string, any>;
  durationMs: number;
}

@Injectable()
export class SubHelperService {
  private readonly logger = new Logger(SubHelperService.name);

  /**
   * List all registered sub-helpers for an organization.
   */
  async listHelpers(orgId: string) {
    const db = getDb();
    const rows = await db.query.subHelpers.findMany({
      where: and(
        eq(schema.subHelpers.orgId, orgId),
        eq(schema.subHelpers.isActive, true),
      ),
    });
    return rows;
  }

  /**
   * Fetch a specific sub-helper definition.
   */
  async getHelperBySlug(orgId: string, slug: string) {
    const db = getDb();
    const helper = await db.query.subHelpers.findFirst({
      where: and(
        eq(schema.subHelpers.orgId, orgId),
        eq(schema.subHelpers.slug, slug),
        eq(schema.subHelpers.isActive, true),
      ),
    });
    if (!helper) {
      throw new NotFoundException(`Sub-helper with slug "${slug}" not found in organization ${orgId}`);
    }
    return helper;
  }

  /**
   * Register a new dynamic custom Sub-Helper with a custom tool bundle.
   */
  async createCustomHelper(
    orgId: string,
    data: {
      slug: string;
      name: string;
      description?: string;
      systemPromptSlice: string;
      assignedTools: string[];
      model?: string;
      temperature?: number;
    },
  ) {
    const db = getDb();
    const [inserted] = await db
      .insert(schema.subHelpers)
      .values({
        orgId,
        slug: data.slug,
        name: data.name,
        description: data.description || null,
        systemPromptSlice: data.systemPromptSlice,
        assignedTools: data.assignedTools,
        model: data.model || "llama-3.3-70b-versatile",
        temperature: data.temperature ?? 0.1,
        isBuiltIn: false,
        isActive: true,
      })
      .returning();

    this.logger.log(`Created custom Sub-Helper: "${inserted.name}" (${inserted.slug}) for org ${orgId}`);
    return inserted;
  }

  /**
   * Update assigned tools for a Sub-Helper.
   */
  async updateHelperTools(orgId: string, slug: string, assignedTools: string[]) {
    const db = getDb();
    const helper = await this.getHelperBySlug(orgId, slug);
    const [updated] = await db
      .update(schema.subHelpers)
      .set({
        assignedTools,
        updatedAt: new Date(),
      })
      .where(eq(schema.subHelpers.id, helper.id))
      .returning();

    return updated;
  }

  /**
   * Execute a focused task slice with a sandboxed Sub-Helper.
   * Isolates tool executions and memory bounds to prevent context loss in Kara Chief.
   */
  async executeHelperTask(
    orgId: string,
    request: HelperTaskRequestDto,
  ): Promise<HelperExecutionResult> {
    const startTime = Date.now();
    const helperDef = await this.getHelperBySlug(orgId, request.helperSlug);

    this.logger.log(
      `[Kara AI] Dispatching task to Sub-Helper "${helperDef.name}" (${helperDef.slug}) with ${helperDef.assignedTools.length} assigned tools`,
    );

    // Resolve assigned tools from the Mastra tools registry
    const toolMap: Record<string, any> = {};
    for (const toolName of helperDef.assignedTools) {
      if (toolName in allMastraTools) {
        toolMap[toolName] = (allMastraTools as Record<string, any>)[toolName];
      } else {
        this.logger.warn(`Assigned tool "${toolName}" is not registered in allMastraTools`);
      }
    }

    try {
      const toolOutputs: Record<string, any> = {};

      // If the helper is candidate-evaluator and context includes resume/github
      if (helperDef.slug === "candidate-evaluator" && request.contextSlice) {
        const { resumeText, githubUrl, fullName, email } = request.contextSlice as any;
        if (resumeText && allMastraTools.resumeParserTool) {
          const parsed = (await (allMastraTools.resumeParserTool as any).execute({
            resumeText,
            fullName,
            email,
          })) as any;
          toolOutputs.parsedResume = parsed;

          const targetGithub = githubUrl || parsed?.githubUrl;
          if (targetGithub && allMastraTools.githubScraperTool) {
            const githubData = await (allMastraTools.githubScraperTool as any).execute({
              githubUrl: targetGithub,
            });
            toolOutputs.githubProfile = githubData;
          }

          if (allMastraTools.objectiveScoringTool) {
            const scored = await (allMastraTools.objectiveScoringTool as any).execute({
              orgId,
              fullName: fullName || parsed?.fullName,
              email: email || parsed?.email,
              resumeText,
              githubUrl: targetGithub,
              skillsCount: parsed?.detectedSkills?.length || 5,
            });
            toolOutputs.scoring = scored;
          }
        }
      }

      // If the helper is meeting-researcher and context includes query/meetingId
      if (helperDef.slug === "meeting-researcher" && request.contextSlice) {
        const { query, meetingId } = request.contextSlice as any;
        if (meetingId && allMastraTools.getUtterancesTool) {
          toolOutputs.utterances = await (allMastraTools.getUtterancesTool as any).execute({
            meetingId,
            limit: 15,
          });
        } else if (query && allMastraTools.searchMeetingsTool) {
          toolOutputs.searchResults = await (allMastraTools.searchMeetingsTool as any).execute({
            orgId,
            query,
            limit: 5,
          });
        }
      }

      // If the helper is workforce-directory and context includes query/entity
      if (helperDef.slug === "workforce-directory" && request.contextSlice) {
        const { query, department, entity } = request.contextSlice as any;
        if (allMastraTools.directoryLookupTool) {
          toolOutputs.directory = await (allMastraTools.directoryLookupTool as any).execute({
            orgId,
            query,
            department,
            limit: 10,
          });
        }
        if (entity && allMastraTools.entityGraphTool) {
          toolOutputs.knowledgeGraph = await (allMastraTools.entityGraphTool as any).execute({
            orgId,
            entity,
            limit: 10,
          });
        }
      }

      // If the helper is task-executor and context includes task details
      if (helperDef.slug === "task-executor" && request.contextSlice) {
        const { title, description, priority, meetingId } = request.contextSlice as any;
        if (title && allMastraTools.kanbanCreateTool) {
          toolOutputs.createdTask = await (allMastraTools.kanbanCreateTool as any).execute({
            orgId,
            title,
            description,
            priority,
            meetingId,
          });
        }
      }

      // If the helper is document-generator and context includes variables
      if (helperDef.slug === "document-generator" && request.contextSlice) {
        const { templateType, recipientName, recipientEmail, variables } = request.contextSlice as any;
        if (recipientName && recipientEmail && allMastraTools.documentRendererTool) {
          toolOutputs.generatedDoc = await (allMastraTools.documentRendererTool as any).execute({
            orgId,
            templateType: templateType || "offer_letter",
            recipientName,
            recipientEmail,
            variables: variables || {},
          });
        }
      }

      // If GROQ_API_KEY is available and worker agent is initialized, synthesize
      let agentSynthesis: any = null;
      if (process.env.GROQ_API_KEY && Object.keys(toolMap).length > 0) {
        try {
          const modelId = (helperDef.model.includes("/")
            ? helperDef.model
            : `groq/${helperDef.model}`) as `${string}/${string}`;

          const workerAgent = new Agent({
            id: helperDef.slug,
            name: helperDef.name,
            instructions: `${helperDef.systemPromptSlice}\nExecute task: ${request.taskPrompt}`,
            model: {
              id: modelId,
            },
            tools: toolMap,
          });

          const response = await workerAgent.generate(
            `Context:\n${JSON.stringify({ ...request.contextSlice, ...toolOutputs }, null, 2)}\n\nPrompt:\n${request.taskPrompt}`,
          );
          agentSynthesis = response?.text || null;
        } catch (agentErr) {
          this.logger.warn(`Worker agent LLM invocation skipped/fallback: ${agentErr}`);
        }
      }

      return {
        helperSlug: helperDef.slug,
        helperName: helperDef.name,
        status: "COMPLETED",
        result: agentSynthesis || {
          summary: `Sub-Helper "${helperDef.name}" processed task slice successfully.`,
          toolsInvoked: Object.keys(toolOutputs),
        },
        toolOutputs,
        durationMs: Date.now() - startTime,
      };
    } catch (err: any) {
      this.logger.error(`Sub-Helper execution failed for "${helperDef.slug}": ${err.message}`, err.stack);
      return {
        helperSlug: helperDef.slug,
        helperName: helperDef.name,
        status: "FAILED",
        result: { error: err.message },
        durationMs: Date.now() - startTime,
      };
    }
  }
}
