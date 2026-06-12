import { ConfigService } from '@nestjs/config';
import neo4j from 'neo4j-driver';

export const Neo4jDriverProvider = {
  provide: 'NEO4J_DRIVER',
  useFactory: (configService: ConfigService) => {
    return neo4j.driver(
      configService.get<string>('NEO4J_URI')!,
      neo4j.auth.basic(
        configService.get<string>('NEO4J_USERNAME')!,
        configService.get<string>('NEO4J_PASSWORD')!,
      ),
    );
  },
  inject: [ConfigService],
};
