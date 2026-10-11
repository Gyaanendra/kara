import { Module } from "@nestjs/common";
import { AiController } from "./ai.controller.js";
import { AiService } from "./ai.service.js";
import { LayaService } from "./laya.service.js";
import { DeepgramService } from "./deepgram.service.js";
import { GroqService } from "./groq.service.js";

@Module({
  controllers: [AiController],
  providers: [AiService, LayaService, DeepgramService, GroqService],
  exports: [AiService, LayaService, DeepgramService, GroqService],
})
export class AiModule {}
