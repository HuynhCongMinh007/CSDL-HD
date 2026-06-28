import { Controller, Get, Param, Query, UseFilters, ValidationPipe, UsePipes } from '@nestjs/common';
import { Neo4jExceptionFilter } from '../../common/filters/neo4j-exception.filter';
import { OrderHistoryDto } from './dto/order-history.dto';
import { CustomerService } from './customer.service';
import { ApiTags, ApiParam } from '@nestjs/swagger';

@Controller('api/v1')
@UseFilters(Neo4jExceptionFilter)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) { }

  @ApiTags('Customer')
  @Get('customers/:customerId/orders/history')
  @ApiParam({
    name: 'customerId',
    example: 'cust_123',
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async getOrderHistory(
    @Param('customerId') customerId: string,
    @Query() queryDto: OrderHistoryDto,
  ) {
    return this.customerService.getOrderHistory(customerId, queryDto);
  }

}
