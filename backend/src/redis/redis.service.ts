import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async zrevrangeWithScores(key: string, start: number, stop: number): Promise<{ value: string; score: number }[]> {
    const results = await this.redisClient.zrevrange(key, start, stop, 'WITHSCORES');
    const parsedResults: { value: string; score: number }[] = [];
    for (let i = 0; i < results.length; i += 2) {
      parsedResults.push({
        value: results[i],
        score: parseFloat(results[i + 1]),
      });
    }
    return parsedResults;
  }
}
