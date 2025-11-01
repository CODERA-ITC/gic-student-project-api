import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './lib/interceptor/logging.interceptor';
import { HttpExceptionFilter } from './lib/filters/http-exception.filter';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

import 'dotenv/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Global validation pipe
  const logger = new Logger('Bootstrap');

  const configService = app.get(ConfigService);

  try {
    const dataSource = app.get(DataSource);
    if (dataSource.isInitialized) {
      Logger.log('✅ Database connection established successfully');
      logger.log(
        `📊 Database: ${configService.get('DATABASE_NAME')} on ${configService.get('DATABASE_HOST')}:${configService.get('DATABASE_PORT')}`,
      );
    }
  } catch (error) {
    logger.error('❌ Failed to connect to database', error);
  }
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      skipMissingProperties: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Nest Simple Auth API')
    .setDescription(
      'Simple NestJS project with JWT Auth, User, and Project modules',
    )
    .setVersion('1.0')
    .addBearerAuth() // Enable JWT in Swagger UI
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  logger.log(
    '🚀 Application is running with ' + process.env.NODE_ENV + ' environment',
  );
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
