import { Module } from "@nestjs/common";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { DatabaseModule } from "./database/database.module.js";
import { AuthModule } from "./auth/auth.module.js";
import { MeetingsModule } from "./meetings/meetings.module.js";
import { TranscriptsModule } from "./transcripts/transcripts.module.js";
import { MomModule } from "./mom/mom.module.js";
import { CrmModule } from "./crm/crm.module.js";
import { KanbanModule } from "./kanban/kanban.module.js";
import { StorageModule } from "./storage/storage.module.js";
import { QueueModule } from "./queues/queue.module.js";
import { AiModule } from "./ai/ai.module.js";

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    MeetingsModule,
    TranscriptsModule,
    MomModule,
    CrmModule,
    KanbanModule,
    StorageModule,
    QueueModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
