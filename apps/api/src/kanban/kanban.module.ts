import { Module } from "@nestjs/common";
import { KanbanService } from "./kanban.service.js";
import { KanbanController } from "./kanban.controller.js";

@Module({
  providers: [KanbanService],
  controllers: [KanbanController],
  exports: [KanbanService],
})
export class KanbanModule {}
