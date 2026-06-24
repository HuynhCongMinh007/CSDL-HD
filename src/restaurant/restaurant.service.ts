import { Injectable, Inject } from '@nestjs/common';
import neo4j, { Driver } from 'neo4j-driver';
import { GetComboSuggestionDto } from './dto/get-combo-suggestion.dto';
import { SearchDto } from './dto/search.dto';
import { MONGO_DB } from 'src/mongodb/mongodb.module';
import { CASSANDRA_CLIENT } from 'src/cassandra/cassandra.module';
import { Db } from 'mongodb';
import { Client } from 'cassandra-driver';
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
    const { q, limit } = searchDto;
    try {
      const [restaurantsByName, restaurantsByDish] = await Promise.all([
        this.restaurantRepository.findRestaurantByName(q),
        this.restaurantRepository.findDishByName(q),
      ]);

      const mergedMap = new Map<string, RestaurantSearchResult & { matchType: 'restaurant_name' | 'dish_name' | 'both' }>();

      restaurantsByName.forEach((restaurant) => {
        mergedMap.set(restaurant.restaurant_id, {
          ...restaurant,
          matchType: 'restaurant_name',
        });
      });

      restaurantsByDish.forEach((restaurant) => {
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
      if (limit) {
        data = data.slice(0, limit);
      }

      return {
        success: true,
        message: `Đã tìm thấy ${data.length} nhà hàng phù hợp với từ khóa "${q}"`,
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: `Lỗi khi tìm kiếm: ${(error as Error).message}`,
        data: [],
      };
    }
  }
}