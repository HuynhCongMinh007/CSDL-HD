import { Controller, Get, Param, Query, UseFilters, ValidationPipe, UsePipes } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { GetComboSuggestionDto } from './dto/get-combo-suggestion.dto';
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

  @Get('restaurant/:id/profile')
  async getRestaurantProfile(@Param('id') id: string) {
    const data = await this.restaurantService.getRestaurantProfile(id);
    return {
      success: true,
      message: 'Lấy thông tin cửa hàng thành công',
      data,
    };
  }

  @Get('restaurant/:id/menu')
  async getRestaurantMenu(@Param('id') id: string) {
    const data = await this.restaurantService.getRestaurantMenu(id);
    return {
      success: true,
      message: 'Lấy thông tin thực đơn thành công',
      data,
    };
  }

  @Get('restaurant/:id/top-dishes')
  async getTopDishes(
    @Param('id') id: string,
    @Query('date') date: string,
  ) {
    // Nếu không truyền date, lấy mặc định ngày 2026-06-26 hoặc ngày hiện tại tuỳ logic
    const queryDate = date || '2026-06-26';
    const data = await this.restaurantService.getTopDishes(id, queryDate);
    return {
      success: true,
      message: 'Lấy danh sách top món ăn bán chạy thành công',
      data,
    };
  }
}
