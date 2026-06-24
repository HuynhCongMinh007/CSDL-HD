import { Controller, Get, Query, UseFilters, ValidationPipe, UsePipes } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { GetComboSuggestionDto } from './dto/get-combo-suggestion.dto';
import { SearchDto } from './dto/search.dto';
import { Neo4jExceptionFilter } from '../common/filters/neo4j-exception.filter';

@Controller('api/v1')
@UseFilters(Neo4jExceptionFilter)
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Get('recommendations/combo-suggestions')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getComboSuggestions(@Query() queryDto: GetComboSuggestionDto) {
    return this.restaurantService.getComboSuggestions(queryDto);
  }

  @Get('search')
  async searchRestaurants(@Query() searchDto: SearchDto) {
    return this.restaurantService.search(searchDto);
  }
}
