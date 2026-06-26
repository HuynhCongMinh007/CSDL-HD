import { Injectable, Inject } from '@nestjs/common';
import neo4j, { Driver } from 'neo4j-driver';
import { GetComboSuggestionDto } from './dto/get-combo-suggestion.dto';

@Injectable()
export class RestaurantService {
  constructor(@Inject('NEO4J_DRIVER') private readonly driver: Driver) {}

  async getComboSuggestions(queryDto: GetComboSuggestionDto) {
    const { dishId, limit } = queryDto;
    const session = this.driver.session();

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
}
