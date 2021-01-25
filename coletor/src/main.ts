import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as compression from 'compression';

(async function () {
  const app = await NestFactory.create(AppModule);
  app.use(compression());

  const config = new DocumentBuilder()
    .setTitle('Coletor ')
    .setDescription(
      'É possível solicitar a coleta, verificar se já há uma coleta em execução e recuperar os dados coletado.',
    )
    .setVersion('1.0')
    .addTag('coletor')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
})();
