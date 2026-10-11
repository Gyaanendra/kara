import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { DRIZZLE } from "../database/database.module.js";
import { schema, eq, and } from "@kara/db";
import type { KaraDatabase } from "@kara/db";
import { TranscriptStatus, UtteranceType } from "@kara/shared-types";

export class BatchUtteranceInput {
  speakerLabel!: string;
  speakerName?: string;
  speakerUserId?: string;
  startMs!: number;
  endMs!: number;
  text!: string;
  sequence!: number;
  type?: UtteranceType;
}

export class IngestTranscriptBatchDto {
  meetingId!: string;
  recordingId?: string;
  language?: string;
  wordCount?: number;
  utteranceCount?: number;
  confidence?: number;
  utterances!: BatchUtteranceInput[];
}

@Injectable()
export class TranscriptsService {
  constructor(@Inject(DRIZZLE) private readonly db: KaraDatabase) {}

  async getTranscriptByMeeting(orgId: string, meetingId: string) {
    const transcript = await this.db.query.transcripts.findFirst({
      where: and(eq(schema.transcripts.orgId, orgId), eq(schema.transcripts.meetingId, meetingId)),
      with: {
        utterances: {
          orderBy: (u, { asc }) => [asc(u.sequence)],
        },
      },
    });

    if (!transcript) {
      throw new NotFoundException(`Transcript for meeting ${meetingId} not found`);
    }
    return transcript;
  }

  async ingestBatch(orgId: string, dto: IngestTranscriptBatchDto) {
    return this.db.transaction(async (tx) => {
      let [transcript] = await tx
        .insert(schema.transcripts)
        .values({
          orgId,
          meetingId: dto.meetingId,
          recordingId: dto.recordingId,
          language: dto.language ?? "en",
          status: TranscriptStatus.COMPLETED,
          wordCount: dto.wordCount ?? dto.utterances.reduce((acc, u) => acc + u.text.split(" ").length, 0),
          utteranceCount: dto.utteranceCount ?? dto.utterances.length,
          confidence: dto.confidence ?? 0.95,
          processingCompletedAt: new Date(),
        })
        .onConflictDoNothing()
        .returning();

      if (!transcript) {
        transcript = (await tx.query.transcripts.findFirst({
          where: and(eq(schema.transcripts.orgId, orgId), eq(schema.transcripts.meetingId, dto.meetingId)),
        })) as any;
      }

      const transcriptId = transcript.id;

      if (dto.utterances.length > 0) {
        const rows = dto.utterances.map((u) => ({
          orgId,
          meetingId: dto.meetingId,
          transcriptId,
          speakerLabel: u.speakerLabel,
          speakerName: u.speakerName,
          speakerUserId: u.speakerUserId,
          startMs: u.startMs,
          endMs: u.endMs,
          sequence: u.sequence,
          text: u.text,
          type: u.type ?? UtteranceType.INFORMATION,
        }));

        await tx.insert(schema.utterances).values(rows).onConflictDoNothing();
      }

      return {
        transcriptId,
        insertedUtterances: dto.utterances.length,
        status: TranscriptStatus.COMPLETED,
      };
    });
  }
}
