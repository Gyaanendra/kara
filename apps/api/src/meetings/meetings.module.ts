import { Module } from "@nestjs/common";
import { MeetingsService } from "./meetings.service.js";
import { MeetingsController } from "./meetings.controller.js";

@Module({
  providers: [MeetingsService],
  controllers: [MeetingsController],
  exports: [MeetingsService],
})
export class MeetingsModule {}
