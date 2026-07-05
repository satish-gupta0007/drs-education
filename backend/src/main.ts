import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Cookie parser middleware
  app.use(cookieParser());

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );

  // CORS with credentials support
  app.enableCors({
    origin: [
      'http://localhost:4200',
      'http://localhost:8100',
      'https://admin.drseducation.in',
      'capacitor://localhost',
      'ionic://localhost',
    ],
    credentials: true, // Allow cookies
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Static file serving for uploads
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Swagger docs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('DRS Education API')
    .setDescription('Complete REST API — NestJS + MongoDB')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swaggerConfig));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 API running at:  http://localhost:${port}/api/v1`);
  logger.log(`📚 Swagger Docs:    http://localhost:${port}/api/docs`);
}
bootstrap();
