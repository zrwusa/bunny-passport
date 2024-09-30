// src/main.ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import { ValidationPipe } from "@nestjs/common";
import { ExceptionI18nFilter, I18nInterceptor } from "./common";
import { TranslationService } from "./translation.service";
import * as session from "express-session";
import RedisStore from "connect-redis";
import { Redis } from "ioredis";

// import { BunnyLogger } from './common/logging/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // logger: new BunnyLogger(),
  });
  const configService = app.get(ConfigService);

  // TODO cors should be configured in which file?
  // app.enableCors({
  //   origin: 'http://localhost:8080',
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  //   allowedHeaders: 'Content-Type, Authorization',
  //   credentials: true,
  // });

  const redisClient = app.get<Redis>('REDIS_CLIENT'); // Get a Redis client instance

  const redisSession = session({
    store: new RedisStore({ client: redisClient }), // Use Redis to store sessions
    secret: configService.get('JWT_SECRET'), // Replace with your secret
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Should be true in production environment
      httpOnly: true, // Prevent client-side JavaScript from accessing cookies
      sameSite: 'lax', // Set 'lax', 'strict' or 'none' as required
    },
  });

  // Use session middleware and configure Redis as storage
  app.use(redisSession);

  const frontEndOrigin = `${configService.get('FRONT_END_PROTOCOL')}://${configService.get('FRONT_END_DOMAIN')}:${configService.get('FRONT_END_PORT')}`;

  app.enableCors({
    origin: frontEndOrigin, // Allowed frontend domains
    credentials: true, // Allow cookies to be sent on cross-domain requests
  });

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
        scopes: ['profile', 'email'],
      },
    },
  });

  await app.listen(configService.get('PORT') || 8080);
}

bootstrap().then();
