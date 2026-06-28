import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// --- Infrastructure Modules ---
import { Neo4jModule } from './infrastructure/neo4j/neo4j.module';
import { MongodbModule } from './infrastructure/mongodb/mongodb.module';
import { CassandraModule } from './infrastructure/cassandra/cassandra.module';
import { RedisModule } from './infrastructure/redis/redis.module';

// --- Business Modules ---
import { RestaurantModule } from './modules/restaurant/restaurant.module';
import { CustomerModule } from './modules/customer/customer.module';

@Module({
  imports: [
    // 1. Core / Configuration
    ConfigModule.forRoot({ isGlobal: true }),

    // 2. Infrastructure (Databases, Cache, etc.)
    Neo4jModule,
    MongodbModule.forRoot({
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
      dbName: process.env.MONGODB_DB || 'restaurant_db',
    }),
    CassandraModule,
    RedisModule,

    // 3. Business Modules (Domains / Features)
    RestaurantModule,
    CustomerModule,
  ],
})
export class AppModule { }