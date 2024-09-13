// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { ExceptionI18nFilter } from './common/filters/exception.filter';
import { TranslationService } from './translation.service';
import { I18nInterceptor } from './common/interceptors/i18n.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // TODO cors should be configured in which file?
  // app.enableCors({
  //   origin: 'http://localhost:8080',
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  //   allowedHeaders: 'Content-Type, Authorization',
  //   credentials: true,
  // });
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new ExceptionI18nFilter(app.get(TranslationService)));
  app.useGlobalInterceptors(new I18nInterceptor(app.get(TranslationService)));
  const config = new DocumentBuilder()
    .setTitle('Bunny Nest API')
    .setDescription('The user API documentation')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    })
    .addOAuth2({
      type: 'oauth2',
      flows: {
        authorizationCode: {
          authorizationUrl: configService.get(
            'GOOGLE_OAUTH2_AUTHORIZATION_URL',
          ),
          tokenUrl: configService.get('GOOGLE_OAUTH2_TOKEN_URL'),
          scopes: {
            profile: 'Access your profile',
            email: 'Access your email',
          },
        },
      },
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      requestInterceptor: (request) => {
        request.headers['accept-language'] = 'zh'; // Can be set as default language or as required
        return request;
      },
      oauth2RedirectUrl: configService.get('SWAGGER_OAUTH2_REDIRECT_URL'),
      initOAuth: {
        clientId: configService.get('GOOGLE_CLIENT_ID'),
        clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      },
    },
  });

  await app.listen(configService.get('PORT') || 8080);
}

bootstrap().then();
