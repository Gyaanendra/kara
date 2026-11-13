import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { Logger } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow requests with no origin (like mobile apps, curl, server-side) or localhost origins
      if (!origin || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all during development
      }
    },
    credentials: true,
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
      "x-org-id",
      "x-attendee-signature",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  Logger.log(`Kara NestJS 11 Core API running on http://localhost:${port}/api`, "Bootstrap");
}
bootstrap();
