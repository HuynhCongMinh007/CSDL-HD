import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Neo4jModule } from './neo4j/neo4j.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { CustomerModule } from './customer/customer.module';
import { MongodbModule } from './mongodb/mongodb.module';
import { CassandraModule } from './cassandra/cassandra.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    Neo4jModule,
    RestaurantModule,
    CustomerModule,
    MongodbModule.forRoot({
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
      dbName: process.env.MONGODB_DB || 'restaurant_db',
    }),
    CassandraModule,
  ],
})
export class AppModule {}