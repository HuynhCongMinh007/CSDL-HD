import { Global, Module } from '@nestjs/common';
import { Client, auth } from 'cassandra-driver';

export const CASSANDRA_CLIENT = 'CASSANDRA_CLIENT';
export const CASSANDRA_SESSION = 'CASSANDRA_SESSION';

@Global()
@Module({
  providers: [
    {
      provide: CASSANDRA_CLIENT,
      useFactory: async () => {
        const contactPoints = process.env.CASSANDRA_CONTACT_POINTS?.split(',').map(item => item.trim());
        const localDataCenter = process.env.CASSANDRA_LOCAL_DATACENTER;
        const username = process.env.CASSANDRA_USERNAME;
        const password = process.env.CASSANDRA_PASSWORD;

        if (!contactPoints || contactPoints.length === 0) {
          throw new Error('CASSANDRA_CONTACT_POINTS is not defined');
        }
        if (!localDataCenter) {
          throw new Error('CASSANDRA_LOCAL_DATACENTER is not defined');
        }

        const authProvider = username && password
          ? new auth.PlainTextAuthProvider(username, password)
          : undefined;

        const client = new Client({
          contactPoints,
          localDataCenter,
          authProvider,
          keyspace: process.env.CASSANDRA_KEYSPACE,
        });

        try {
          await client.connect();
        } catch (e: any) {
          console.warn('Failed to connect to Cassandra (ignored for mock setup):', e.message);
        }
        return client;
      },
    },
    {
      provide: CASSANDRA_SESSION,
      inject: [CASSANDRA_CLIENT],
      useFactory: (client: Client) => client,
    },
  ],
  exports: [CASSANDRA_CLIENT, CASSANDRA_SESSION],
})
export class CassandraModule {}

