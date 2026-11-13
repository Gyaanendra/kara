import { Body, Controller, Headers, HttpCode, HttpStatus, Logger, Post } from "@nestjs/common";
import { getDb, schema, eq, and, or } from "@kara/db";
import {
  MeetingStatus,
  UtteranceType,
  MeetingPlatform,
  TranscriptStatus,
} from "@kara/shared-types";
import { normalizeSpeakerName } from "./speaker-normalizer.js";

@Controller("webhooks/attendee")
export class AttendeeWebhookController {
  private readonly logger = new Logger(AttendeeWebhookController.name);

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() payload: any,
    @Headers("x-attendee-signature") signature?: string,
  ) {
    this.logger.log(`Received Attendee webhook event: ${payload?.event}`);
    const db = getDb();

    const event = payload?.event;
    const data = payload?.data || {};

    // 1. Bot status change event
    if (event === "bot.status_change" || event === "bot.state_change") {
      const botId = data.bot_id || data.id;
      const eventId = data.event_id || data.meeting_id;
      const statusCode = data.status?.code || data.state;
      const errorMessage = data.status?.error_message || data.error;

      let meetingStatus: MeetingStatus = MeetingStatus.RECORDING;
      if (["joining_call", "queued", "in_waiting_room"].includes(statusCode)) {
        meetingStatus = MeetingStatus.BOT_JOINING;
      } else if (["in_call_recording", "recording_resumed"].includes(statusCode)) {
        meetingStatus = MeetingStatus.RECORDING;
      } else if (["transcribing", "processing"].includes(statusCode)) {
        meetingStatus = MeetingStatus.PROCESSING;
      } else if (["completed", "call_ended", "recording_succeeded"].includes(statusCode)) {
        meetingStatus = MeetingStatus.COMPLETED;
      } else if (["failed", "bot_rejected", "meeting_error", "recording_failed"].includes(statusCode)) {
        meetingStatus = MeetingStatus.FAILED;
      }

      // Find meeting
      const whereConditions = [];
      if (botId) whereConditions.push(eq(schema.meetings.nativeMeetingId, botId));
      if (eventId) {
        whereConditions.push(eq(schema.meetings.calendarEventId, eventId));
        whereConditions.push(eq(schema.meetings.id, eventId));
      }

      const meeting = whereConditions.length > 0
        ? await db.query.meetings.findFirst({
            where: or(...whereConditions),
          })
        : null;

      if (meeting) {
        await db
          .update(schema.meetings)
          .set({
            status: meetingStatus,
            botErrorMessage: errorMessage || null,
            botJoinedAt: meetingStatus === MeetingStatus.RECORDING ? new Date() : meeting.botJoinedAt,
            actualEndAt: meetingStatus === MeetingStatus.COMPLETED ? new Date() : meeting.actualEndAt,
            updatedAt: new Date(),
          })
          .where(eq(schema.meetings.id, meeting.id));

        this.logger.log(`[bot.status_change] Updated meeting ${meeting.id} to status ${meetingStatus}`);
      }

      return { success: true, processed: true, status: meetingStatus };
    }

    // 2. Diarized transcript update event
    if (event === "transcript.update" || event === "bot.transcript") {
      const meetingId = data.meeting_id || data.event_id;
      const rawUtterances = data.utterances || data.segments || [];

      const transcriptConditions = [];
      if (meetingId) {
        transcriptConditions.push(eq(schema.meetings.id, meetingId));
        transcriptConditions.push(eq(schema.meetings.calendarEventId, meetingId));
        transcriptConditions.push(eq(schema.meetings.nativeMeetingId, meetingId));
      }

      const meeting = transcriptConditions.length > 0
        ? await db.query.meetings.findFirst({
            where: or(...transcriptConditions),
          })
        : null;

      if (!meeting) {
        return { success: false, error: "Meeting not found for transcript" };
      }

      // Fetch company members to normalize speaker names
      const members = await db.query.companyMembers.findMany({
        where: eq(schema.companyMembers.orgId, meeting.orgId),
      });

      // Get or create transcript record
      let transcript = await db.query.transcripts.findFirst({
        where: eq(schema.transcripts.meetingId, meeting.id),
      });

      if (!transcript) {
        const [newTranscript] = await db
          .insert(schema.transcripts)
          .values({
            orgId: meeting.orgId,
            meetingId: meeting.id,
            status: TranscriptStatus.COMPLETED,
          })
          .returning();
        transcript = newTranscript;
      }

      // Process utterances with speaker normalization
      let seq = 0;
      for (const u of rawUtterances) {
        const rawSpeaker = u.speaker_name || u.speaker || `Speaker ${u.speaker_id ?? 0}`;
        const norm = normalizeSpeakerName(rawSpeaker, members);

        await db.insert(schema.utterances).values({
          orgId: meeting.orgId,
          meetingId: meeting.id,
          transcriptId: transcript.id,
          speakerLabel: `Speaker ${u.speaker_id ?? 0}`,
          speakerName: norm.canonicalName,
          speakerUserId: norm.memberId || null,
          startMs: Math.round(u.start_time ? u.start_time * 1000 : u.start_ms || 0),
          endMs: Math.round(u.end_time ? u.end_time * 1000 : u.end_ms || 0),
          text: u.text || u.transcript || "",
          sequence: ++seq,
          type: (u.type as UtteranceType) || UtteranceType.INFORMATION,
        });
      }

      return {
        success: true,
        meetingId: meeting.id,
        utterancesIngested: rawUtterances.length,
      };
    }

    // 3. Calendar events update
    if (event === "calendar.events_update" || event === "calendar.sync") {
      const items = data.events || [];
      const orgId = data.org_id || "org_acme_corp";
      let syncedCount = 0;

      for (const item of items) {
        if (!item.id || !item.title) continue;

        const existing = await db.query.meetings.findFirst({
          where: and(
            eq(schema.meetings.orgId, orgId),
            eq(schema.meetings.calendarEventId, item.id),
          ),
        });

        if (existing) {
          await db
            .update(schema.meetings)
            .set({
              title: item.title,
              description: item.description || null,
              meetingUrl: item.meeting_url || null,
              scheduledStartAt: item.start_time ? new Date(item.start_time) : existing.scheduledStartAt,
              scheduledEndAt: item.end_time ? new Date(item.end_time) : existing.scheduledEndAt,
              updatedAt: new Date(),
            })
            .where(eq(schema.meetings.id, existing.id));
        } else {
          const host = await db.query.users.findFirst();
          if (host) {
            await db.insert(schema.meetings).values({
              orgId,
              hostUserId: host.id,
              title: item.title,
              description: item.description || null,
              platform: item.platform || MeetingPlatform.GOOGLE_MEET,
              meetingUrl: item.meeting_url || null,
              calendarEventId: item.id,
              calendarProvider: item.provider || "google",
              scheduledStartAt: item.start_time ? new Date(item.start_time) : new Date(),
              scheduledEndAt: item.end_time ? new Date(item.end_time) : null,
              status: MeetingStatus.SCHEDULED,
            });
            syncedCount++;
          }
        }
      }

      return { success: true, synced: syncedCount };
    }

    return { success: true, received: true, event };
  }
}
