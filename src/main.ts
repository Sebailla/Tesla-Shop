import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap')

  app.enableCors()

  app.setGlobalPrefix('api/v1')

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidUnknownValues: true,
      /* transform: true,
      transformOptions: {
        enableImplicitConversion: true
      } */
    })
  )


  await app.listen(process.env.PORT ?? 3000);
  logger.log(`App running on port: ${process.env.PORT}`)
}
bootstrap();
