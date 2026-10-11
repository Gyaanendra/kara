import { Global, Module } from "@nestjs/common";
import { getDb, closeDb } from "@kara/db";
import type { KaraDatabase } from "@kara/db";

export const DRIZZLE = "DRIZZLE_CONNECTION";

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      useFactory: (): KaraDatabase => {
        return getDb();
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DatabaseModule {}
