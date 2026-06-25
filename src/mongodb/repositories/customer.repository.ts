import { Inject, Injectable } from '@nestjs/common';
import { Db, Collection, ObjectId } from 'mongodb';

@Injectable()
export class CustomerRepository {

  private readonly collection: Collection<any>;

  constructor(
    @Inject('MONGO_DB')
    private readonly db: Db,
  ) {
    this.collection =
      this.db.collection('customers');
  }

  async getDefaultLocation(id: string): Promise<[number, number] | null> {
    const customer = await this.collection.findOne(
      { _id: new ObjectId(id), 'addresses.is_default': true },
      {
        projection: {
          'addresses.$': 1,
        },
      },
    );

    const coordinates = customer?.addresses?.[0]?.location?.coordinates;
    return Array.isArray(coordinates) && coordinates.length === 2 ? coordinates as [number, number] : null;
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
  } */
}