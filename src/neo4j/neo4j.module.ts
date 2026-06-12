import { Module, Global } from '@nestjs/common';
import { Neo4jDriverProvider } from './neo4j.provider';

@Global() // Tùy chọn: giúp các module khác dùng chung kết nối mà không cần import Neo4jModule liên tục
@Module({
  providers: [Neo4jDriverProvider],
  exports: [Neo4jDriverProvider], // Export để các module khác có thể inject NEO4J_DRIVER
})
export class Neo4jModule {}
