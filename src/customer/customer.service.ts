import { Injectable } from '@nestjs/common';
import { OrderHistoryDto } from './dto/order-history.dto';
import { CustomerOrderHistoryRepository } from '../cassandra/repositories/customer-order-history.repository';

@Injectable()
export class CustomerService {
  constructor(
    private readonly customerOrderHistoryRepository: CustomerOrderHistoryRepository,
  ) {}

  async getOrderHistory(customerId: string, queryDto: OrderHistoryDto) {
    const limit = queryDto.limit && queryDto.limit > 0 ? queryDto.limit : 10;
    const sort = queryDto.sort === 'asc' ? 'asc' : 'desc';

    const lastOrderedAt = queryDto.lastOrderedAt ? new Date(queryDto.lastOrderedAt) : undefined;
    const lastOrderId = queryDto.lastOrderId || undefined;

    const {rows, nextToken} = await this.customerOrderHistoryRepository.getRecentOrdersByCustomerId(
      customerId,
          limit,
    lastOrderedAt,
    lastOrderId,
    sort
    );

    const total = await this.customerOrderHistoryRepository.countOrdersByCustomerId(customerId);

    return {
      success: true,
      message: `Lấy lịch sử đơn hàng của khách hàng ${customerId} thành công.`,
      data: rows,
      pagination: {
      limit,
      total,
      returned: rows.length,
      sort,
      nextToken, // Trả về token để frontend dùng cho trang tiếp theo
      hasNextPage: !!nextToken,
      },
    };
  }
}