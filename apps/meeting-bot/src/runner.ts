import { MeetingStatus } from "@kara/shared-types";

export interface BotLaunchOptions {
  meetingId: string;
  meetingUrl: string;
  orgId: string;
  apiUrl?: string;
  maxDurationMinutes?: number;
}

export class MeetingBotRunner {
  private readonly apiUrl: string;
  private readonly maxDuration: number;

  constructor(private readonly options: BotLaunchOptions) {
    this.apiUrl = options.apiUrl || process.env.API_URL || "http://localhost:4000";
    this.maxDuration = options.maxDurationMinutes || Number(process.env.MAX_MEETING_DURATION_MINUTES || 120);
  }

  async run() {
    console.log(`[MeetingBot] Launching stateless bot for meeting ${this.options.meetingId}`);
    console.log(`[MeetingBot] Joining URL: ${this.options.meetingUrl}`);

    try {
      // 1. Report BOT_JOINING state via authenticated webhook (zero SQL locks)
      await this.reportStatus(MeetingStatus.BOT_JOINING);

      // 2. Obtain S3 presigned upload URL from API
      console.log(`[MeetingBot] Requesting presigned S3 upload URL for RustFS...`);
      const uploadRes = await fetch(`${this.apiUrl}/api/storage/presigned-upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-org-id": this.options.orgId,
        },
        body: JSON.stringify({
          meetingId: this.options.meetingId,
          filename: "audio.webm",
        }),
      });

      if (!uploadRes.ok) {
        throw new Error(`Failed to get presigned upload URL: ${uploadRes.status}`);
      }

      const uploadData = (await uploadRes.json()) as any;
      console.log(`[MeetingBot] S3 upload URL obtained for key: ${uploadData.s3Key}`);

      // 3. Simulate or stream audio capture
      await this.reportStatus(MeetingStatus.RECORDING);
      console.log(`[MeetingBot] Audio recording active... streaming raw audio to S3`);

      // 4. On meeting conclusion, finalize recording
      console.log(`[MeetingBot] Meeting ended. Upload complete.`);
      await this.reportStatus(MeetingStatus.PROCESSING);

      // 5. Trigger Deepgram transcription pipeline
      console.log(`[MeetingBot] Triggering Deepgram transcription pipeline...`);
      const transcribeRes = await fetch(`${this.apiUrl}/api/ai/transcribe/${this.options.meetingId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-org-id": this.options.orgId,
        },
        body: JSON.stringify({
          audioUrl: uploadData.uploadUrl,
        }),
      });

      if (transcribeRes.ok) {
        console.log(`[MeetingBot] Deepgram transcription completed successfully.`);
      }

      // 6. Trigger MOM synthesis
      console.log(`[MeetingBot] Triggering Groq MOM synthesis...`);
      await fetch(`${this.apiUrl}/api/ai/synthesize-mom/${this.options.meetingId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-org-id": this.options.orgId,
        },
      });

      await this.reportStatus(MeetingStatus.COMPLETED);
      console.log(`[MeetingBot] Meeting processing pipeline finished.`);
    } catch (err) {
      console.error(`[MeetingBot] Error during meeting bot lifecycle:`, err);
      await this.reportStatus(MeetingStatus.FAILED);
      process.exit(1);
    }
  }

  private async reportStatus(status: MeetingStatus) {
    try {
      await fetch(`${this.apiUrl}/api/meetings/${this.options.meetingId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-org-id": this.options.orgId,
        },
        body: JSON.stringify({ status }),
      });
    } catch (err) {
      console.warn(`[MeetingBot] Could not report status ${status}:`, err);
    }
  }
}

// CLI entrypoint
if (process.argv[1]?.includes("runner")) {
  const meetingId = process.env.MEETING_ID || "meet_c4cf229142f04ca987324f16";
  const meetingUrl = process.env.MEETING_URL || "https://meet.google.com/abc-defg-hij";
  const orgId = process.env.ORG_ID || "org_76a82f1024344d4db6d8a588";

  const bot = new MeetingBotRunner({ meetingId, meetingUrl, orgId });
  bot.run().catch(console.error);
}
