import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Bật CORS cho phép frontend truy cập
  app.enableCors();

  // Bật Validation Pipe để DTO hoạt động
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Cấu hình Swagger
  const config = new DocumentBuilder()
    .setTitle('API Đồ án Quản trị CSDL Hiện đại')
    .setDescription('Tài liệu Swagger API cho backend')
    .setVersion('1.0')
    .addTag('restaurants')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT || 3000);
  console.log(`🚀 Server đang chạy tại: http://localhost:${process.env.PORT || 3000}`);
  console.log(`📚 Swagger Docs đang chạy tại: http://localhost:${process.env.PORT || 3000}/api/docs`);
}
bootstrap();