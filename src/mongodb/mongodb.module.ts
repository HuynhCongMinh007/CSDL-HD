import { DynamicModule, Global, Module } from '@nestjs/common';
import { MongoClient } from 'mongodb';

export interface MongoModuleOptions {
  uri: string;
  dbName?: string;
}

export const MONGO_CLIENT = 'MONGO_CLIENT';
export const MONGO_DB = 'MONGO_DB';

@Global()
@Module({})
export class MongodbModule {
  static forRoot(options: MongoModuleOptions): DynamicModule {
    const mongoClientProvider = {
      provide: MONGO_CLIENT,
      useFactory: async () => {
        if (!options.uri) {
          throw new Error('MongoModule options.uri is required');
        }
        const client = new MongoClient(options.uri);
        await client.connect();
        return client;
      },
    };

    const mongoDbProvider = {
      provide: MONGO_DB,
      inject: [MONGO_CLIENT],
      useFactory: (client: MongoClient) => client.db(options.dbName || 'test'),
    };

    return {
      module: MongodbModule,
      providers: [mongoClientProvider, mongoDbProvider],
      exports: [MONGO_CLIENT, MONGO_DB],
      global: true,
    };
  }
}
