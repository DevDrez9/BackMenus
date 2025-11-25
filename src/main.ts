import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';

async function bootstrap() {
  // 1. Especificamos que usamos Express explícitamente para poder usar useStaticAssets
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 2. Habilitar CORS (Para que tu Frontend en React/Vue/Angular pueda hacer peticiones)
  app.enableCors({
    origin: [
      // Dominios de Producción
      'https://dashboardmenus.ratelapps.com',
      'https://menufacil.ratelapps.com',
      'https://mimenu.ratelapps.com',
      'http://dashboardmenus.ratelapps.com',
      'http://menufacil.ratelapps.com',
      'http://mimenu.ratelapps.com',
      
      // Dominios de Desarrollo (Opcional: mantenlos si haces pruebas locales contra este back)
      'http://localhost:5173', 
      'http://localhost:5174',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 3. Aumentar el límite de tamaño para recibir imágenes en Base64 (10MB)
   app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // 4. Validaciones globales (DTOs)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina datos que no estén en el DTO
      forbidNonWhitelisted: true, // Lanza error si envían datos extra
      transform: true, // Convierte tipos automáticamente (ej: string "10" a number 10)
    }),
  );

  // 5. Servir la carpeta de 'uploads' públicamente
  // Las imágenes serán accesibles en http://localhost:3000/uploads/nombre.webp
// --- DIAGNÓSTICO DE RUTA ---
  // Definimos la ruta usando la raíz del proceso actual
  const uploadsPath = join(process.cwd(), 'uploads');
  
  console.log('------------------------------------------------');
  console.log('📂 SIRVIENDO ARCHIVOS ESTÁTICOS DESDE:', uploadsPath);
  
  // Verificamos si la carpeta existe realmente
  if (fs.existsSync(uploadsPath)) {
    console.log('✅ La carpeta existe.');
    const files = fs.readdirSync(uploadsPath);
    console.log(`📄 Archivos encontrados: ${files.length}`);
    if (files.length > 0) console.log(`   Ejemplo: ${files[0]}`);
  } else {
    console.error('❌ LA CARPETA NO EXISTE. Créala o sube un archivo primero.');
  }
  console.log('------------------------------------------------');

  // Configuración final
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/', 
  });

   const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  


  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();