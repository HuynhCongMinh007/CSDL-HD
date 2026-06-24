import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { CustomerOrderHistoryRepository } from '../cassandra/repositories/customer-order-history.repository';
import { CassandraModule } from '../cassandra/cassandra.module';

@Module({
  imports: [CassandraModule],
  controllers: [CustomerController],
  providers: [CustomerService, CustomerOrderHistoryRepository],
})
export class CustomerModule {}
