import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  const config = new DocumentBuilder()
    .setTitle('Tesla Shop API')
    .setDescription('Tesla Shop endpoints')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/documents', app, documentFactory);


  await app.listen(process.env.PORT ?? 3000);
  logger.log(`App running on port: ${process.env.PORT}`)
}
bootstrap();
