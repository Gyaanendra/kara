import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { DRIZZLE } from "../database/database.module.js";
import { schema, eq, and, desc } from "@kara/db";
import type { KaraDatabase } from "@kara/db";
import { MeetingStatus, MeetingType, MeetingPlatform } from "@kara/shared-types";

export class CreateMeetingDto {
  title!: string;
  description?: string;
  platform?: MeetingPlatform;
  meetingUrl?: string;
  scheduledStartAt!: string | Date;
  scheduledEndAt?: string | Date;
}

@Injectable()
export class MeetingsService {
  constructor(@Inject(DRIZZLE) private readonly db: KaraDatabase) {}

  async listMeetings(orgId: string, status?: MeetingStatus, type?: MeetingType) {
    return this.db.query.meetings.findMany({
      where: and(
        eq(schema.meetings.orgId, orgId),
        status ? eq(schema.meetings.status, status) : undefined,
        type ? eq(schema.meetings.meetingType, type) : undefined,
      ),
      orderBy: [desc(schema.meetings.scheduledStartAt)],
      with: {
        host: true,
        participants: true,
        transcripts: true,
      },
      limit: 50,
    });
  }

  async getMeetingById(orgId: string, meetingId: string) {
    const meeting = await this.db.query.meetings.findFirst({
      where: and(
        eq(schema.meetings.orgId, orgId),
        eq(schema.meetings.id, meetingId),
      ),
      with: {
        host: true,
        participants: true,
        recordings: true,
        transcripts: {
          with: {
            utterances: {
              orderBy: (u, { asc }) => [asc(u.sequence)],
              limit: 500,
            },
          },
        },
      },
    });

    if (!meeting) {
      throw new NotFoundException(`Meeting ${meetingId} not found`);
    }

    const mom = await this.db.query.moms.findFirst({
      where: and(
        eq(schema.moms.orgId, orgId),
        eq(schema.moms.meetingId, meetingId),
      ),
      with: {
        decisions: true,
        actionItems: true,
      },
    });

    return { ...meeting, mom };
  }

  async createMeeting(orgId: string, userId: string, dto: CreateMeetingDto) {
    const [meeting] = await this.db
      .insert(schema.meetings)
      .values({
        orgId,
        hostUserId: userId,
        title: dto.title,
        description: dto.description,
        platform: dto.platform ?? MeetingPlatform.GOOGLE_MEET,
        meetingUrl: dto.meetingUrl,
        status: MeetingStatus.SCHEDULED,
        scheduledStartAt: new Date(dto.scheduledStartAt),
        scheduledEndAt: dto.scheduledEndAt ? new Date(dto.scheduledEndAt) : undefined,
      })
      .returning();

    return meeting;
  }

  async updateStatus(orgId: string, meetingId: string, status: MeetingStatus, errorMsg?: string) {
    const now = new Date();
    const updatePayload: Record<string, unknown> = {
      status,
      updatedAt: now,
    };

    if (status === MeetingStatus.RECORDING) {
      updatePayload.actualStartAt = now;
      updatePayload.botJoinedAt = now;
    } else if (status === MeetingStatus.COMPLETED) {
      updatePayload.actualEndAt = now;
      updatePayload.botLeftAt = now;
    } else if (status === MeetingStatus.FAILED && errorMsg) {
      updatePayload.botErrorMessage = errorMsg;
      updatePayload.botLeftAt = now;
    }

    const [updated] = await this.db
      .update(schema.meetings)
      .set(updatePayload)
      .where(and(eq(schema.meetings.orgId, orgId), eq(schema.meetings.id, meetingId)))
      .returning();

    if (!updated) {
      throw new NotFoundException(`Meeting ${meetingId} not found`);
    }
    return updated;
  }
}
