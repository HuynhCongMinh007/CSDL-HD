import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { Db } from 'mongodb';
import { CustomerSchema } from './schemas/customer.schema';
import { RestaurantProfileSchema } from './schemas/restaurant.schema';
// import { RestaurantReviewSchema } from './schemas/restaurant-review.schema';
// import { OrderSchema } from './schemas/order.schema';
// import { OrderReviewSchema } from './schemas/order-review.schema';

@Injectable()
export class MongoInitService implements OnModuleInit {
  constructor(@Inject('MONGO_DB') private readonly db: Db) {}

  private async ensureCollection(name: string, schema: object) {
    const cols = await this.db.listCollections({ name }).toArray();
    const validator = { $jsonSchema: schema };

    if (cols.length === 0) {
      await this.db.createCollection(name, {
        validator,
        validationLevel: 'moderate',
        validationAction: 'error',
      });
      return;
    }

    // Update existing collection validator (safe best-effort)
    try {
      await this.db.command({
        collMod: name,
        validator,
        validationLevel: 'moderate',
        validationAction: 'error',
      });
    } catch (err) {
      // Non-fatal: log and continue
      // eslint-disable-next-line no-console
      console.warn(`Could not update validator for collection ${name}:`, (err as Error).message || err);
    }
  }

  private async ensureIndexes() {
    await this.db.collection('restaurants').createIndex({ 'basic_info.location': '2dsphere' });
    await this.db.collection('restaurants').createIndex({ 'basic_info.restaurant_name': 'text', 'brand_info.search_tags': 'text' });
    await this.db.collection('customers').createIndex(
      { 'addresses.location': '2dsphere' },
      { name: 'idx_addresses_location_2dsphere', background: true },
    );
  }

  async onModuleInit() {
    // Ensure collections and validators exist for known schemas
    await this.ensureCollection('customers', CustomerSchema);
    await this.ensureCollection('restaurants', RestaurantProfileSchema);
    //await this.ensureCollection('orders', OrderSchema);
    //await this.ensureCollection('reviews', RestaurantReviewSchema);
    //await this.ensureCollection('order_reviews', OrderReviewSchema);
    await this.ensureIndexes();
  }
}