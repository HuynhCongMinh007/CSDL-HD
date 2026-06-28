import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import neo4j, { Driver } from 'neo4j-driver';
import { GetComboSuggestionDto } from './dto/get-combo-suggestion.dto';
import { SearchDto } from './dto/search.dto';
import {
  RestaurantRepository,
  RestaurantSearchResult,
} from 'src/infrastructure/mongodb/repositories/restaurant.repository';
import { RedisService } from '../../infrastructure/redis/redis.service';

@Injectable()
export class RestaurantService {
  constructor(
    @Inject('NEO4J_DRIVER') private readonly neo4jDriver: Driver,
    private readonly restaurantRepository: RestaurantRepository,
    private readonly redisService: RedisService,
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

  async getRestaurantProfile(restaurantId: string) {
    const data = await this.redisService.get(`rest:${restaurantId}:profile`);
    if (!data) {
      throw new NotFoundException('Restaurant profile not found');
    }
    return JSON.parse(data);
  }

  async getRestaurantMenu(restaurantId: string) {
    const data = await this.redisService.get(`rest:${restaurantId}:menu`);
    if (!data) {
      throw new NotFoundException('Restaurant menu not found');
    }
    return JSON.parse(data);
  }

  async getTopDishes(restaurantId: string, date: string) {
    const data = await this.redisService.zrevrangeWithScores(`rest:${restaurantId}:top_dishes:${date}`, 0, 9);
    if (!data || data.length === 0) {
      throw new NotFoundException('Top dishes not found for the given date');
    }

    // Lấy thông tin menu để map hình ảnh và giá
    let menuData: any = null;
    try {
      const menuRaw = await this.redisService.get(`rest:${restaurantId}:menu`);
      if (menuRaw) {
        menuData = JSON.parse(menuRaw);
      }
    } catch (e) {
      console.warn('Could not fetch menu for mapping top dishes');
    }

    const itemMap = new Map<string, any>();
    if (menuData && menuData.categories) {
      menuData.categories.forEach((cat: any) => {
        if (cat.menu_items) {
          cat.menu_items.forEach((item: any) => {
            itemMap.set(item.item_id, item);
          });
        }
      });
    }

    return data.map(item => {
      // The dish format in ZSET is usually "dishId:Dish Name"
      const [dish_id, ...nameParts] = item.value.split(':');
      const menuItem = itemMap.get(dish_id);

      return {
        dish_id,
        dish_name: nameParts.join(':'),
        sales: item.score,
        image_url: menuItem?.image_url || null,
        base_price: menuItem?.base_price || 0,
        discount_price: menuItem?.discount_price || 0,
      };
    });
  }
}