/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from '@api/root';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const globalPrefix = 'api';

  app.setGlobalPrefix(globalPrefix);
  app.enableShutdownHooks();
  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
