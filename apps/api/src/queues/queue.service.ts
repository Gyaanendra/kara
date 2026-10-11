import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Queue } from "bullmq";

@Injectable()
export class QueueService implements OnModuleInit {
  private readonly logger = new Logger(QueueService.name);
  private botQueue?: Queue;
  private transcribeQueue?: Queue;
  private momQueue?: Queue;
  private ragQueue?: Queue;
  private isConnected = false;

  onModuleInit() {
    try {
      const connection = {
        host: process.env.REDIS_HOST || "localhost",
        port: Number(process.env.REDIS_PORT || 6379),
        maxRetriesPerRequest: null,
        enableOfflineQueue: false,
        retryStrategy: (times: number) => {
          if (times > 3) {
            this.logger.warn("Redis is currently offline. Background job queuing is suspended until Redis starts.");
            return null; // Stop retrying endlessly
          }
          return Math.min(times * 1000, 3000);
        },
      };

      this.botQueue = new Queue("bot-dispatch", { connection });
      this.transcribeQueue = new Queue("transcription", { connection });
      this.momQueue = new Queue("mom-synthesis", { connection });
      this.ragQueue = new Queue("rag-indexing", { connection });

      // Attach silent error listeners so offline Redis doesn't spam unhandled EventEmitter errors
      [this.botQueue, this.transcribeQueue, this.momQueue, this.ragQueue].forEach((q) => {
        q.on("error", () => {
          // Handled quietly; warning already logged via retryStrategy
        });
      });

      this.isConnected = true;
    } catch (err) {
      this.logger.warn(`Could not initialize Redis queues: ${err}`);
    }
  }

  async dispatchBot(meetingId: string, meetingUrl: string) {
    if (!this.botQueue || !this.isConnected) {
      this.logger.warn(`Redis offline: skipped bot dispatch for meeting ${meetingId}`);
      return null;
    }
    this.logger.log(`Enqueuing bot dispatch for meeting ${meetingId}`);
    return this.botQueue.add("join-meeting", { meetingId, meetingUrl });
  }

  async enqueueTranscription(meetingId: string, recordingS3Key: string) {
    if (!this.transcribeQueue || !this.isConnected) {
      this.logger.warn(`Redis offline: skipped transcription for meeting ${meetingId}`);
      return null;
    }
    this.logger.log(`Enqueuing transcription for meeting ${meetingId}`);
    return this.transcribeQueue.add("transcribe-recording", { meetingId, recordingS3Key });
  }

  async enqueueMomSynthesis(meetingId: string, transcriptId: string) {
    if (!this.momQueue || !this.isConnected) {
      this.logger.warn(`Redis offline: skipped MOM synthesis for meeting ${meetingId}`);
      return null;
    }
    this.logger.log(`Enqueuing MOM synthesis for meeting ${meetingId}`);
    return this.momQueue.add("synthesize-mom", { meetingId, transcriptId });
  }

  async enqueueRagIndexing(meetingId: string, transcriptId: string) {
    if (!this.ragQueue || !this.isConnected) {
      this.logger.warn(`Redis offline: skipped RAG indexing for meeting ${meetingId}`);
      return null;
    }
    this.logger.log(`Enqueuing RAG indexing for meeting ${meetingId}`);
    return this.ragQueue.add("index-vectors", { meetingId, transcriptId });
  }
}
