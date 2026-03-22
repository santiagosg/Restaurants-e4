import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Enable CORS
  app.enableCors();

  // Prefix all routes with api/v1
  app.setGlobalPrefix('api/v1');

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Restaurants API')
    .setDescription('API para la gestión de restaurantes, reservas, menú y reseñas')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Ingresa el token JWT (Bearer {token})',
        in: 'header',
      },
      'JWT',
    )
    .addTag('Authentication', 'Gestión de autenticación y usuarios')
    .addTag('Users', 'Gestión de perfiles de usuario')
    .addTag('Roles', 'Gestión de roles y permisos')
    .addTag('Restaurants', 'Gestión de restaurantes')
    .addTag('Menu Categories', 'Gestión de categorías de menú')
    .addTag('Products', 'Gestión de productos del menú')
    .addTag('Bookings', 'Gestión de reservas')
    .addTag('Reviews', 'Gestión de reseñas')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
