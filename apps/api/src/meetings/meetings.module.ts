import { Module } from "@nestjs/common";
import { MeetingsService } from "./meetings.service.js";
import { MeetingsController } from "./meetings.controller.js";
import { AttendeeWebhookController } from "./attendee-webhook.controller.js";

@Module({
  providers: [MeetingsService],
  controllers: [MeetingsController, AttendeeWebhookController],
  exports: [MeetingsService],
})
export class MeetingsModule {}
