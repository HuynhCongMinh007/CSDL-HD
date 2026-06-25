import { Inject, Injectable } from '@nestjs/common';
import { Db, Collection } from 'mongodb';
import { CustomerRepository } from './customer.repository';

export interface RestaurantSearchResult {
  restaurant_id: string;
  basic_info: {
    restaurant_name?: string;
    [key: string]: any;
  };
  brand_info: {
    avatar_url?: string;
    [key: string]: any;
  };
  performance_metric: {
    average_rating?: number;
    [key: string]: any;
  };
  top_dishes: Array<{
    item_id: string;
    discount_price?: number;
    image_url?: string;
  }>;
  distance?: number;
}

@Injectable()
export class RestaurantRepository {

  private readonly collection: Collection<any>;

  constructor(
    @Inject('MONGO_DB')
    private readonly db: Db,
    private readonly customerRepository: CustomerRepository,
  ) {
    this.collection = this.db.collection('restaurants');
  }
/*
  async create(customer: any) {
    return this.collection.insertOne(
      customer,
    );
  }

  async findById(id: string) {
    return this.collection.findOne({
      _id: new ObjectId(id),
    });
  }

  async findAll() {
    return this.collection.find().toArray();
  }
*/

  async findRestaurantByName(name: string, customerId?: string): Promise<RestaurantSearchResult[]> {
    const customerLocation = customerId
      ? await this.customerRepository.getDefaultLocation(customerId)
      : null;

    if (customerLocation) {
      const pipeline = [
        {
          $geoNear: {
            near: { type: 'Point', coordinates: customerLocation },
            distanceField: 'distance',
            query: { 'basic_info.restaurant_name': { $regex: name, $options: 'i' } },
            spherical: true,
          },
        },
        {
          $project: {
            restaurant_id: 1,
            basic_info: 1,
            'brand_info.avatar_url': 1,
            'performance_metric.average_rating': 1,
            menu: 1,
            distance: 1,
          },
        },
      ];

      const docs = await this.collection.aggregate(pipeline).toArray();
      return docs.map((doc) => this.mapToSearchResult(doc));
    }

    return this.collection
      .find(
        {
          'basic_info.restaurant_name': { $regex: name, $options: 'i' },
        },
        {
          projection: {
            restaurant_id: 1,
            basic_info: 1,
            'brand_info.avatar_url': 1,
            'performance_metric.average_rating': 1,
            menu: 1,
          },
        },
      )
      .map((doc) => this.mapToSearchResult(doc))
      .toArray();
  }

  async findDishByName(name: string, customerId?: string): Promise<RestaurantSearchResult[]> {
    const customerLocation = customerId
      ? await this.customerRepository.getDefaultLocation(customerId)
      : null;

    if (customerLocation) {
      return this.collection
        .aggregate<RestaurantSearchResult>([
          {
            $geoNear: {
              near: { type: 'Point', coordinates: customerLocation },
              distanceField: 'distance',
              query: {
                'menu.categories.menu_items.name': { $regex: name, $options: 'i' },
              },
              spherical: true,
            },
          },
          { $unwind: '$menu.categories' },
          { $unwind: '$menu.categories.menu_items' },
          {
            $match: {
              'menu.categories.menu_items.name': { $regex: name, $options: 'i' },
            },
          },
          {
            $group: {
              _id: '$restaurant_id',
              restaurant_id: { $first: '$restaurant_id' },
              basic_info: { $first: '$basic_info' },
              brand_info: { $first: '$brand_info' },
              performance_metric: { $first: '$performance_metric' },
              distance: { $first: '$distance' },
              matched_items: {
                $push: {
                  item_id: '$menu.categories.menu_items.item_id',
                  discount_price: '$menu.categories.menu_items.discount_price',
                  image_url: '$menu.categories.menu_items.image_url',
                },
              },
            },
          },
          {
            $project: {
              restaurant_id: 1,
              basic_info: 1,
              brand_info: { avatar_url: '$brand_info.avatar_url' },
              performance_metric: { average_rating: '$performance_metric.average_rating' },
              distance: 1,
              top_dishes: {
                $slice: [
                  {
                    $map: {
                      input: {
                        $slice: ['$matched_items', 6],
                      },
                      as: 'item',
                      in: {
                        item_id: '$$item.item_id',
                        discount_price: '$$item.discount_price',
                        image_url: '$$item.image_url',
                      },
                    },
                  },
                  6,
                ],
              },
            },
          },
        ])
        .toArray();
    }

    return this.collection
      .aggregate<RestaurantSearchResult>([
        { $unwind: '$menu.categories' },
        { $unwind: '$menu.categories.menu_items' },
        {
          $match: {
            'menu.categories.menu_items.name': {
              $regex: name,
              $options: 'i',
            },
          },
        },
        {
          $group: {
            _id: '$restaurant_id',
            restaurant_id: { $first: '$restaurant_id' },
            basic_info: { $first: '$basic_info' },
            brand_info: { $first: '$brand_info' },
            performance_metric: { $first: '$performance_metric' },
            matched_items: {
              $push: {
                item_id: '$menu.categories.menu_items.item_id',
                discount_price: '$menu.categories.menu_items.discount_price',
                image_url: '$menu.categories.menu_items.image_url',
              },
            },
          },
        },
        {
          $project: {
            restaurant_id: 1,
            basic_info: 1,
            brand_info: { avatar_url: '$brand_info.avatar_url' },
            performance_metric: { average_rating: '$performance_metric.average_rating' },
            top_dishes: {
              $slice: [
                {
                  $map: {
                    input: {
                      $slice: ['$matched_items', 6],
                    },
                    as: 'item',
                    in: {
                      item_id: '$$item.item_id',
                      discount_price: '$$item.discount_price',
                      image_url: '$$item.image_url',
                    },
                  },
                },
                6,
              ],
            },
          },
        },
      ])
      .toArray();
  }

  private mapToSearchResult(doc: any): RestaurantSearchResult {
    const top_dishes = [] as RestaurantSearchResult['top_dishes'];

    if (doc.menu?.categories) {
      for (const category of doc.menu.categories) {
        if (!category?.menu_items) {
          continue;
        }

        for (const item of category.menu_items) {
          if (item?.item_id) {
            top_dishes.push({
              item_id: item.item_id,
              discount_price: item.discount_price,
              image_url: item.image_url,
            });

            if (top_dishes.length >= 6) {
              break;
            }
          }
        }

        if (top_dishes.length >= 6) {
          break;
        }
      }
    }

    return {
      restaurant_id: doc.restaurant_id,
      basic_info: doc.basic_info || {},
      brand_info: {
        avatar_url: doc.brand_info?.avatar_url,
      },
      performance_metric: {
        average_rating: doc.performance_metric?.average_rating,
      },
      top_dishes,
      distance: typeof doc.distance === 'number' ? doc.distance : undefined,
    };
  }
/*
  async update(id: string, data: any) {
    return this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: data },
    );
  }

  async delete(id: string) {
    return this.collection.deleteOne({
      _id: new ObjectId(id),
    });
  }
*/
}