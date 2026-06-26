import { Injectable, Inject } from '@nestjs/common';
import neo4j, { Driver } from 'neo4j-driver';
import { GetComboSuggestionDto } from './dto/get-combo-suggestion.dto';
import { SearchDto } from './dto/search.dto';
import {
  RestaurantRepository,
  RestaurantSearchResult,
} from 'src/mongodb/repositories/restaurant.repository';

@Injectable()
export class RestaurantService {
  constructor(
    @Inject('NEO4J_DRIVER') private readonly neo4jDriver: Driver,
    private readonly restaurantRepository: RestaurantRepository,
  ) {}

  async getComboSuggestions(queryDto: GetComboSuggestionDto) {
    const { dishId, limit } = queryDto;
    const session = this.neo4jDriver.session();

    const cypherQuery = `
      MATCH (d1:Dish {dish_id: $dishId})-[rel:BOUGHT_TOGETHER]-(d2:Dish)
      RETURN d2.dish_id AS id, d2.name AS name, rel.frequency AS frequency
      ORDER BY frequency DESC
      LIMIT $limit;
    `;

    try {
      const result = await session.run(cypherQuery, {
        dishId,
        limit: neo4j.int(Number(limit)),
      });

      const data = result.records.map(record => ({
        dish_id: record.get('id'),
        dish_name: record.get('name'),
        times_bought_together: record.get('frequency').toNumber(),
      }));

      return {
        success: true,
        message: `Đã tìm thấy ${data.length} món ăn tối ưu nhất để gợi ý tạo combo`,
        data,
      };
    } finally {
      await session.close();
    }
  }

  async search(searchDto: SearchDto) {
    const { q, limit = 20, page = 1, customerId } = searchDto;
    try {
      const [restaurantsByNameResult, restaurantsByDishResult] = await Promise.all([
        this.restaurantRepository.findRestaurantByName(q, customerId, page, limit),
        this.restaurantRepository.findDishByName(q, customerId, page, limit),
      ]);

      const mergedMap = new Map<string, RestaurantSearchResult & { matchType: 'restaurant_name' | 'dish_name' | 'both' }>();

      restaurantsByNameResult.data.forEach((restaurant) => {
        mergedMap.set(restaurant.restaurant_id, {
          ...restaurant,
          matchType: 'restaurant_name',
        });
      });

      restaurantsByDishResult.data.forEach((restaurant) => {
        const existing = mergedMap.get(restaurant.restaurant_id);
        if (existing) {
          mergedMap.set(restaurant.restaurant_id, {
            ...existing,
            top_dishes: restaurant.top_dishes,
            matchType: 'both',
          });
        } else {
          mergedMap.set(restaurant.restaurant_id, {
            ...restaurant,
            matchType: 'dish_name',
          });
        }
      });

      let data = Array.from(mergedMap.values());
      
      // Tính tổng số items từ cả hai kết quả
      const totalItems = Math.max(
        restaurantsByNameResult.pagination.total_items,
        restaurantsByDishResult.pagination.total_items
      );

      return {
        success: true,
        message: `Đã tìm thấy ${data.length} nhà hàng phù hợp với từ khóa "${q}"`,
        data,
        pagination: {
          current_page: Math.max(page, 1),
          page_size: limit,
          total_items: totalItems,
          total_pages: Math.ceil(totalItems / limit * 2),
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Lỗi khi tìm kiếm: ${(error as Error).message}`,
        data: [],
        pagination: {
          current_page: Math.max(page, 1),
          page_size: limit,
          total_items: 0,
          total_pages: 0,
        },
      };
    }
  }
}