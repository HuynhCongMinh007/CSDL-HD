import { Module } from '@nestjs/common';
import { RestaurantController } from './restaurant.controller';
import { RestaurantService } from './restaurant.service';
import { Neo4jModule } from '../../infrastructure/neo4j/neo4j.module';
import { MongodbModule } from '../../infrastructure/mongodb/mongodb.module';
import { RestaurantRepository } from '../../infrastructure/mongodb/repositories/restaurant.repository';
import { CustomerRepository } from '../../infrastructure/mongodb/repositories/customer.repository';

@Module({
  imports: [Neo4jModule, MongodbModule],
  controllers: [RestaurantController],
  providers: [RestaurantService, RestaurantRepository, CustomerRepository],
})
export class RestaurantModule { }
