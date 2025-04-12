import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500', 'https://godwintrav.github.io/passphrase-project-frontend/'],
  methods: ['GET', 'POST'],
  credentials: true,
  });

  // Enable global validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,  // Strips out properties that are not in the DTO
    forbidNonWhitelisted: true,  // Throws error if non-whitelisted properties are found
    transform: true,  // Automatically transforms payload to the DTO class type
  }));
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
