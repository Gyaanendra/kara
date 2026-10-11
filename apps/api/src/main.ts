import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { Logger } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  app.enableCors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  Logger.log(`Kara NestJS 11 Core API running on http://localhost:${port}/api`, "Bootstrap");
}
bootstrap();
