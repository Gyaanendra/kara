import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { getDb, schema, eq, and, sql, desc, ilike } from "@kara/db";

export const searchMeetingsTool = createTool({
  id: "searchMeetingsTool",
  description: "Search historical and scheduled meetings by query keyword, date range, or status.",
  inputSchema: z.object({
    orgId: z.string().describe("The active organization ID"),
    query: z.string().optional().describe("Keyword search matching title or description"),
    status: z.enum(["SCHEDULED", "BOT_JOINING", "RECORDING", "PROCESSING", "COMPLETED", "FAILED"]).optional(),
    limit: z.number().default(5).describe("Max meetings to return"),
  }),
  execute: async (input: any) => {
    const params = input?.context || input || {};
    const db = getDb();
    const conditions = [eq(schema.meetings.orgId, params.orgId)];

    if (params.status) {
      conditions.push(eq(schema.meetings.status, params.status as any));
    }
    if (params.query) {
      conditions.push(ilike(schema.meetings.title, `%${params.query}%`));
    }

    const rows = await db.query.meetings.findMany({
      where: and(...conditions),
      orderBy: [desc(schema.meetings.scheduledStartAt)],
      limit: params.limit || 5,
    });

    return {
      count: rows.length,
      meetings: rows.map((m) => ({
        id: m.id,
        title: m.title,
        status: m.status,
        platform: m.platform,
        scheduledStartAt: m.scheduledStartAt?.toISOString(),
        description: m.description,
      })),
    };
  },
});

export const getUtterancesTool = createTool({
  id: "getUtterancesTool",
  description: "Retrieve chronological diarized utterances and spoken transcript chunks with audio milliseconds.",
  inputSchema: z.object({
    meetingId: z.string().describe("ID of the meeting to fetch utterances for"),
    limit: z.number().default(20),
  }),
  execute: async (input: any) => {
    const params = input?.context || input || {};
    const db = getDb();
    const rows = await db.query.utterances.findMany({
      where: eq(schema.utterances.meetingId, params.meetingId),
      orderBy: [schema.utterances.startMs],
      limit: params.limit || 20,
    });

    return {
      meetingId: params.meetingId,
      count: rows.length,
      utterances: rows.map((u) => ({
        id: u.id,
        speaker: u.speakerName || u.speakerLabel,
        startMs: u.startMs,
        endMs: u.endMs,
        text: u.text,
        type: u.type,
      })),
    };
  },
});

export const audioScrubTool = createTool({
  id: "audioScrubTool",
  description: "Generate an exact timestamp citation and audio deep link in [Meeting Title @ MM:SS] format.",
  inputSchema: z.object({
    meetingTitle: z.string(),
    timestampMs: z.number(),
    speaker: z.string().optional(),
    quote: z.string(),
  }),
  execute: async (input: any) => {
    const params = input?.context || input || {};
    const totalSec = Math.floor(params.timestampMs / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const timeFormatted = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

    return {
      citation: `[${params.meetingTitle} @ ${timeFormatted}]`,
      timestampMs: params.timestampMs,
      displayTime: timeFormatted,
      speaker: params.speaker || "Unknown",
      quote: params.quote,
    };
  },
});

