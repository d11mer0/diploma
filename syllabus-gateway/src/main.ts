import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ВИПРАВЛЕНО: Розширене налаштування CORS
  app.enableCors({
    origin: '*', // На етапі розробки дозволяємо запити з будь-якого джерела
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization', 
    // Це дуже важливо для скачування файлів, щоб фронтенд міг прочитати назву файлу з заголовка
    exposedHeaders: 'Content-Disposition', 
  });

  // Налаштування Swagger
  const config = new DocumentBuilder()
    .setTitle('Syllabus Gateway API')
    .setDescription('API для аналізу силабусів та мапінгу на компетенції e-CF')
    .setVersion('1.0')
    // Налаштовуємо підтримку JWT авторизації в Swagger
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Введіть ваш Access Token',
        in: 'header',
      },
      'access-token', // Назва для посилання на цю схему
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Документація буде доступна за адресою /api
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
