import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const logger = new Logger('Main');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    cors: true,
  });
  const configService = app.get(ConfigService);
  const prefix = configService.get('API_PREFIX') || 'api';
  app.setGlobalPrefix(prefix);
  app.useGlobalPipes(new ValidationPipe());
  const config = new DocumentBuilder()
    .setTitle('Login')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      in: 'header',
      name: 'Authorization',
    })
    .addSecurity('Authorization', {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`documentation`, app, document, {
    useGlobalPrefix: true,
  });
  await app.listen(configService.get('APP_PORT') || 3000);
}
bootstrap()
  .then(() => logger.log(`API Started`))
  .catch((error) => {
    logger.error(error);
  });
