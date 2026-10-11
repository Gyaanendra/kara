import { Module } from "@nestjs/common";
import { MomService } from "./mom.service.js";
import { MomController } from "./mom.controller.js";

@Module({
  providers: [MomService],
  controllers: [MomController],
  exports: [MomService],
})
export class MomModule {}
