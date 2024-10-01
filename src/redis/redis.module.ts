// src/redis.module.ts
import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async (configService: ConfigService) => {
        return new Redis({
          host: configService.get('REDIS_HOST'),
          password: configService.get('REDIS_PASSWORD'),
          port: parseInt(configService.get('REDIS_PORT'), 10),
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
