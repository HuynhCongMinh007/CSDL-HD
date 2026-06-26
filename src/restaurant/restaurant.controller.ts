import { Controller, Get, Query, UseFilters, ValidationPipe, UsePipes } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { GetComboSuggestionDto } from './dto/get-combo-suggestion.dto';
import { SearchDto } from './dto/search.dto';
import { Neo4jExceptionFilter } from '../common/filters/neo4j-exception.filter';
import { ApiQuery } from '@nestjs/swagger';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

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
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
  })
  @ApiQuery({
    name: 'customerId',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 20,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
  })
  async searchRestaurants(@Query() searchDto: SearchDto) {
    return this.restaurantService.search(searchDto);
  }
}
