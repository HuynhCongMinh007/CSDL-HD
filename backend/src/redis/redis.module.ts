import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('REDIS_HOST') || '127.0.0.1';
        const port = configService.get<number>('REDIS_PORT') || 6380;
        const password = configService.get<string>('REDIS_PASSWORD') || undefined;

        return new Redis({
          host,
          port,
          password,
        });
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: ['REDIS_CLIENT', RedisService],
})
export class RedisModule { }
