import { Module } from "@nestjs/common";
import { AiController } from "./ai.controller.js";
import { AiService } from "./ai.service.js";
import { LayaService } from "./laya.service.js";
import { DeepgramService } from "./deepgram.service.js";
import { GroqService } from "./groq.service.js";
import { SubHelperService } from "./mastra/services/sub-helper.service.js";

@Module({
  controllers: [AiController],
  providers: [AiService, LayaService, DeepgramService, GroqService, SubHelperService],
  exports: [AiService, LayaService, DeepgramService, GroqService, SubHelperService],
})
export class AiModule {}
