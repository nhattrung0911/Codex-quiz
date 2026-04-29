import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { loadEnv } from './shared/env';

async function bootstrap() {
  const env = loadEnv();
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: env.WEB_ORIGIN,
    credentials: true
  });
  await app.listen(env.PORT);
}

void bootstrap();
