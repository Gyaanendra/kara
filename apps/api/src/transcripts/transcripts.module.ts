import { Module } from "@nestjs/common";
import { TranscriptsService } from "./transcripts.service.js";
import { TranscriptsController } from "./transcripts.controller.js";

@Module({
  providers: [TranscriptsService],
  controllers: [TranscriptsController],
  exports: [TranscriptsService],
})
export class TranscriptsModule {}
