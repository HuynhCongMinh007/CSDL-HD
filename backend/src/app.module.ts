import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Neo4jModule } from './neo4j/neo4j.module';
import { RestaurantModule } from './restaurant/restaurant.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    Neo4jModule,
    RestaurantModule,
  ],
})
export class AppModule {}