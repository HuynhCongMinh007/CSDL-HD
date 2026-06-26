import { Controller, Get, Param, Query, UseFilters, ValidationPipe, UsePipes, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { RestaurantService } from './restaurant.service';
import { GetComboSuggestionDto } from './dto/get-combo-suggestion.dto';
import { Neo4jExceptionFilter } from '../common/filters/neo4j-exception.filter';

@ApiTags('Restaurants')
@Controller('api/v1')
@UseFilters(Neo4jExceptionFilter)
export class RestaurantController {
  private readonly logger = new Logger(RestaurantController.name);

  constructor(private readonly restaurantService: RestaurantService) {}

  @ApiOperation({ summary: 'Lấy gợi ý combo món ăn' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách combo gợi ý dựa trên tiêu chí.' })
  @Get('recommendations/combo-suggestions')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getComboSuggestions(@Query() queryDto: GetComboSuggestionDto) {
    this.logger.log(`[getComboSuggestions] Bắt đầu lấy gợi ý combo - Query: ${JSON.stringify(queryDto)}`);
    const start = Date.now();
    try {
      const result = await this.restaurantService.getComboSuggestions(queryDto);
      this.logger.log(`[getComboSuggestions] Lấy gợi ý combo thành công - Thời gian xử lý: ${Date.now() - start}ms`);
      return result;
    } catch (error: any) {
      this.logger.error(`[getComboSuggestions] Lỗi khi lấy gợi ý combo - Error: ${error.message}`, error.stack);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Lấy thông tin hồ sơ nhà hàng' })
  @ApiParam({ name: 'id', description: 'ID của nhà hàng', example: '123' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin cửa hàng thành công.' })
  @Get('restaurant/:id/profile')
  async getRestaurantProfile(@Param('id') id: string) {
    this.logger.log(`[getRestaurantProfile] Bắt đầu lấy profile nhà hàng - ID: ${id}`);
    const start = Date.now();
    try {
      const data = await this.restaurantService.getRestaurantProfile(id);
      this.logger.log(`[getRestaurantProfile] Lấy profile nhà hàng thành công - Thời gian xử lý: ${Date.now() - start}ms`);
      return {
        success: true,
        message: 'Lấy thông tin cửa hàng thành công',
        data,
      };
    } catch (error: any) {
      this.logger.error(`[getRestaurantProfile] Lỗi khi lấy profile nhà hàng ID: ${id} - Error: ${error.message}`, error.stack);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Lấy danh sách thực đơn của nhà hàng' })
  @ApiParam({ name: 'id', description: 'ID của nhà hàng', example: '123' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin thực đơn thành công.' })
  @Get('restaurant/:id/menu')
  async getRestaurantMenu(@Param('id') id: string) {
    this.logger.log(`[getRestaurantMenu] Bắt đầu lấy thực đơn nhà hàng - ID: ${id}`);
    const start = Date.now();
    try {
      const data = await this.restaurantService.getRestaurantMenu(id);
      this.logger.log(`[getRestaurantMenu] Lấy thực đơn nhà hàng thành công - Thời gian xử lý: ${Date.now() - start}ms`);
      return {
        success: true,
        message: 'Lấy thông tin thực đơn thành công',
        data,
      };
    } catch (error: any) {
      this.logger.error(`[getRestaurantMenu] Lỗi khi lấy thực đơn nhà hàng ID: ${id} - Error: ${error.message}`, error.stack);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Lấy top món ăn bán chạy trong ngày của nhà hàng' })
  @ApiParam({ name: 'id', description: 'ID của nhà hàng', example: '123' })
  @ApiQuery({ name: 'date', description: 'Ngày cần xem (YYYY-MM-DD)', required: false, example: '2026-06-26' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách top món ăn bán chạy thành công.' })
  @Get('restaurant/:id/top-dishes')
  async getTopDishes(
    @Param('id') id: string,
    @Query('date') date: string,
  ) {
    // Nếu không truyền date, lấy mặc định ngày 2026-06-26 hoặc ngày hiện tại tuỳ logic
    const queryDate = date || '2026-06-26';
    this.logger.log(`[getTopDishes] Bắt đầu lấy top món ăn bán chạy - ID: ${id}, Date: ${queryDate}`);
    const start = Date.now();
    try {
      const data = await this.restaurantService.getTopDishes(id, queryDate);
      this.logger.log(`[getTopDishes] Lấy top món ăn bán chạy thành công - Thời gian xử lý: ${Date.now() - start}ms`);
      return {
        success: true,
        message: 'Lấy danh sách top món ăn bán chạy thành công',
        data,
      };
    } catch (error: any) {
      this.logger.error(`[getTopDishes] Lỗi khi lấy top món ăn bán chạy nhà hàng ID: ${id} - Error: ${error.message}`, error.stack);
      throw error;
    }
  }
}
