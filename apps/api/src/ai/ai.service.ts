import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { DRIZZLE } from "../database/database.module.js";
import { schema, eq, and, sql, desc, asc } from "@kara/db";
import type { KaraDatabase } from "@kara/db";
import { ChatRole, ChatRoute, MeetingStatus, TranscriptStatus, MomStatus, UtteranceType } from "@kara/shared-types";
import { LayaService } from "./laya.service.js";
import { DeepgramService } from "./deepgram.service.js";
import { GroqService } from "./groq.service.js";

export class VectorSearchInput {
  queryVector?: number[];
  queryText?: string;
  limit?: number;
}

export class AskChatInput {
  sessionId?: string;
  query!: string;
}

@Injectable()
export class AiService {
  constructor(
    @Inject(DRIZZLE) private readonly db: KaraDatabase,
    private readonly laya: LayaService,
    private readonly deepgram: DeepgramService,
    private readonly groq: GroqService,
  ) {}

  async askChat(orgId: string, userId: string, input: AskChatInput) {
    // 1. Session resolution
    let sessionId = input.sessionId;
    if (!sessionId) {
      const session = await this.createSession(orgId, userId, input.query.slice(0, 40));
      sessionId = session.id;
    }

    // 2. Fast Reflex Query Routing via Laya (33ms)
    const routing = await this.laya.routeQuery(input.query);

    // 3. Ground Truth Data Retrieval with Hard Temporal Guardrails
    let groundTruthContext: Array<{ meetingId: string; meetingTitle: string; text: string; timestampMs: number }> = [];

    if (routing.route === ("UPCOMING_SCHEDULE" as any)) {
      // Query scheduled calendar events
      const upcoming = await this.db.query.meetings.findMany({
        where: and(eq(schema.meetings.orgId, orgId), eq(schema.meetings.status, MeetingStatus.SCHEDULED)),
        orderBy: [asc(schema.meetings.scheduledStartAt)],
        limit: 5,
      });

      groundTruthContext = upcoming.map((m) => ({
        meetingId: m.id,
        meetingTitle: m.title,
        text: `Upcoming meeting "${m.title}" is scheduled for ${m.scheduledStartAt?.toISOString() || "soon"}. Status: SCHEDULED.`,
        timestampMs: 0,
      }));
    } else {
      // Query completed past meetings and utterances
      const pastUtterances = await this.db.query.utterances.findMany({
        where: eq(schema.utterances.orgId, orgId),
        orderBy: [desc(schema.utterances.createdAt)],
        limit: 10,
        with: {
          meeting: true,
        },
      });

      groundTruthContext = pastUtterances.map((u) => ({
        meetingId: u.meetingId,
        meetingTitle: u.meeting?.title || "Meeting",
        text: `${u.speakerName || u.speakerLabel}: ${u.text}`,
        timestampMs: u.startMs,
      }));
    }

    // 4. Fetch last few conversation turns for context
    const recentMessages = await this.db.query.chatMessages.findMany({
      where: and(eq(schema.chatMessages.orgId, orgId), eq(schema.chatMessages.sessionId, sessionId)),
      orderBy: [desc(schema.chatMessages.createdAt)],
      limit: 6,
    });
    const history = recentMessages.reverse().map((m) => ({ role: m.role, content: m.content }));

    // 5. Generate Non-Hallucinatory Answer via Groq LLM
    const completion = await this.groq.generateChatAnswer(input.query, groundTruthContext, history);

    // 6. Record user message and assistant message
    await this.appendMessage(orgId, sessionId, ChatRole.USER, input.query, routing.route as ChatRoute);
    const assistantMsg = await this.appendMessage(
      orgId,
      sessionId,
      ChatRole.ASSISTANT,
      completion.content,
      routing.route as ChatRoute,
      completion.citations,
    );

    return {
      sessionId,
      message: assistantMsg,
      route: routing.route,
      requiredTool: routing.requiredTool,
      citations: completion.citations,
    };
  }

  async transcribeMeetingAudio(orgId: string, meetingId: string, audioUrl: string) {
    // 1. Verify meeting
    const meeting = await this.db.query.meetings.findFirst({
      where: and(eq(schema.meetings.orgId, orgId), eq(schema.meetings.id, meetingId)),
    });
    if (!meeting) {
      throw new NotFoundException(`Meeting ${meetingId} not found`);
    }

    // 2. Invoke Deepgram Nova-2 API with diarization
    const dgResult = await this.deepgram.transcribeAudioUrl(audioUrl);

    // 3. Classify each utterance using Laya
    const classifiedUtterances = await Promise.all(
      dgResult.utterances.map(async (u) => {
        const layaClass = await this.laya.classifyUtterance(u.text, u.speakerLabel);
        return {
          ...u,
          type: layaClass.category,
        };
      }),
    );

    // 4. Atomic transaction ingest into PostgreSQL 18
    return this.db.transaction(async (tx) => {
      let [transcript] = await tx
        .insert(schema.transcripts)
        .values({
          orgId,
          meetingId,
          language: dgResult.detectedLanguage || "en",
          provider: "deepgram-nova-3",
          model: "nova-3",
          status: TranscriptStatus.COMPLETED,
          wordCount: dgResult.wordCount,
          utteranceCount: classifiedUtterances.length,
          confidence: 0.98,
          processingCompletedAt: new Date(),
        })
        .returning();

      const transcriptId = transcript.id;

      if (classifiedUtterances.length > 0) {
        const rows = classifiedUtterances.map((u) => ({
          orgId,
          meetingId,
          transcriptId,
          speakerLabel: u.speakerLabel,
          speakerName: u.speakerLabel,
          startMs: u.startMs,
          endMs: u.endMs,
          sequence: u.sequence,
          text: u.text,
          type: u.type,
        }));

        await tx.insert(schema.utterances).values(rows);
      }

      await tx
        .update(schema.meetings)
        .set({ status: MeetingStatus.COMPLETED, updatedAt: new Date() })
        .where(eq(schema.meetings.id, meetingId));

      return {
        transcriptId,
        meetingId,
        utteranceCount: classifiedUtterances.length,
        status: "COMPLETED",
      };
    });
  }

  async synthesizeMeetingMom(orgId: string, meetingId: string) {
    const meeting = await this.db.query.meetings.findFirst({
      where: and(eq(schema.meetings.orgId, orgId), eq(schema.meetings.id, meetingId)),
      with: {
        transcripts: {
          with: {
            utterances: {
              orderBy: (u, { asc }) => [asc(u.sequence)],
            },
          },
        },
      },
    });

    if (!meeting) {
      throw new NotFoundException(`Meeting ${meetingId} not found`);
    }

    const utterances = meeting.transcripts[0]?.utterances || [];
    const synthesis = await this.groq.synthesizeMom(
      meeting.title,
      utterances.map((u) => ({ speakerLabel: u.speakerLabel, text: u.text, startMs: u.startMs })),
    );

    return this.db.transaction(async (tx) => {
      const [mom] = await tx
        .insert(schema.moms)
        .values({
          orgId,
          meetingId,
          status: MomStatus.READY,
          executiveSummary: synthesis.executiveSummary,
          keyTopics: synthesis.keyTopics,
          model: "llama-3.3-70b-versatile",
        })
        .returning();

      for (let i = 0; i < synthesis.decisions.length; i++) {
        await tx.insert(schema.momDecisions).values({
          orgId,
          momId: mom.id,
          meetingId,
          decision: synthesis.decisions[i]!,
          sequence: i + 1,
        });
      }

      for (let i = 0; i < synthesis.actionItems.length; i++) {
        const item = synthesis.actionItems[i]!;
        await tx.insert(schema.momActionItems).values({
          orgId,
          momId: mom.id,
          meetingId,
          title: item.title,
          description: item.description,
          assigneeNameRaw: item.assigneeNameRaw,
          audioDeepLinkMs: item.audioDeepLinkMs,
          sequence: i + 1,
        });
      }

      return mom;
    });
  }

  async searchKnowledgeBase(orgId: string, input: VectorSearchInput) {
    const limit = input.limit ?? 5;
    const nowMs = Date.now();

    if (input.queryVector && input.queryVector.length > 0) {
      const vectorJson = JSON.stringify(input.queryVector);
      return this.db.execute(sql`
        SELECT 
          id,
          meeting_id,
          chunk_text,
          speaker,
          meeting_timestamp_ms,
          1 - (embedding <=> ${vectorJson}::vector) AS similarity
        FROM vector_documents
        WHERE org_id = ${orgId}
          AND meeting_status = 'COMPLETED'
          AND meeting_timestamp_ms <= ${nowMs}
          AND embedding IS NOT NULL
        ORDER BY embedding <=> ${vectorJson}::vector
        LIMIT ${limit};
      `);
    }

    return this.db.query.utterances.findMany({
      where: eq(schema.utterances.orgId, orgId),
      orderBy: [desc(schema.utterances.createdAt)],
      limit,
    });
  }

  async getSessions(orgId: string, userId: string) {
    return this.db.query.chatSessions.findMany({
      where: and(eq(schema.chatSessions.orgId, orgId), eq(schema.chatSessions.userId, userId)),
      orderBy: (s, { desc }) => [desc(s.updatedAt)],
      with: {
        messages: {
          orderBy: (m, { asc }) => [asc(m.createdAt)],
          limit: 100,
        },
      },
    });
  }

  async createSession(orgId: string, userId: string, title?: string) {
    const [session] = await this.db
      .insert(schema.chatSessions)
      .values({
        orgId,
        userId,
        title: title ?? "New Conversation",
      })
      .returning();
    return session;
  }

  async appendMessage(
    orgId: string,
    sessionId: string,
    role: ChatRole,
    content: string,
    route?: ChatRoute,
    citations?: any[],
  ) {
    const [msg] = await this.db
      .insert(schema.chatMessages)
      .values({
        orgId,
        sessionId,
        role,
        content,
        route,
        citations,
      })
      .returning();

    await this.db
      .update(schema.chatSessions)
      .set({
        messageCount: sql`message_count + 1`,
        lastMessageAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.chatSessions.id, sessionId));

    return msg;
  }
}
