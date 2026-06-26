import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Neo4jModule } from './neo4j/neo4j.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    Neo4jModule,
    RedisModule,
    RestaurantModule,
  ],
})
export class AppModule {}