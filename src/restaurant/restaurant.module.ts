import { Module } from '@nestjs/common';
import { RestaurantController } from './restaurant.controller';
import { RestaurantService } from './restaurant.service';
import { Neo4jModule } from '../neo4j/neo4j.module';

@Module({
  imports: [Neo4jModule], // Import Neo4jModule để có thể inject NEO4J_DRIVER
  controllers: [RestaurantController],
  providers: [RestaurantService],
})
export class RestaurantModule {}
