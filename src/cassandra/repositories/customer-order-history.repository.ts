import { Injectable, Inject } from '@nestjs/common';
import { Client } from 'cassandra-driver';
import { CASSANDRA_CLIENT} from '../cassandra.module';
import { OrderHistoryRow } from '../entities/order-history-row.entity';

@Injectable()
export class CustomerOrderHistoryRepository {
  private readonly tableName = 'customer_order_history';

  constructor(
    @Inject(CASSANDRA_CLIENT) private readonly client: Client,
  ) {}

/*   
   * Get all orders for a customer, sorted by ordered_at DESC
   * @param customerId Customer ID
   * @returns Array of order history records
   
  async getOrdersByCustomerId(customerId: string): Promise<OrderHistoryRow[]> {
    const query = `
      SELECT 
        customer_id,
        ordered_at,
        order_id,
        restaurant_id,
        restaurant_name,
        items,
        total_amount,
        payment_method,
        order_status,
        completed_at,
        cancelled_at
      FROM ${this.tableName}
      WHERE customer_id = ?
      ORDER BY ordered_at DESC;
    `;

    try {
      const result = await this.client.execute(query, [customerId], {
        prepare: true,
      });
      return this.mapRowsToOrderHistory(result.rows);
    } catch (error) {
      throw new Error(
        `Lỗi khi truy vấn lịch sử đơn hàng của khách hàng ${customerId}: ${(error as Error).message}`,
      );
    }
  } */
async getRecentOrdersByCustomerId(
  customerId: string,
  limit: number = 10,
  lastOrderedAt?: Date,  // Token để lấy trang tiếp theo
  lastOrderId?: string,  // Token phụ để phân biệt các đơn hàng cùng thời gian
  sort: string = 'desc'
): Promise<{ rows: OrderHistoryRow[], nextToken: { orderedAt: Date, orderId: string } | null }> {
  let query = `
    SELECT 
      customer_id,
      ordered_at,
      order_id,
      restaurant_id,
      restaurant_name,
      items,
      total_amount,
      payment_method,
      order_status,
      completed_at,
      cancelled_at
    FROM ${this.tableName}
    WHERE customer_id = ?
  `;

  const params: any[] = [customerId];
  
  // Thêm điều kiện token
  if (lastOrderedAt && lastOrderId) {
    if (sort === 'desc') {
      query += ` AND (ordered_at, order_id) < (?, ?)`;
      params.push(lastOrderedAt, lastOrderId);
    } else {
      query += ` AND (ordered_at, order_id) > (?, ?)`;
      params.push(lastOrderedAt, lastOrderId);
    }
  }
  
  query += ` ORDER BY ordered_at ${sort === 'asc' ? 'ASC' : 'DESC'} LIMIT ?`;
  params.push(limit + 1); // Lấy thêm 1 bản ghi để xác định có trang tiếp theo không

  try {
    const result = await this.client.execute(query, params, { prepare: true });
    const rows = this.mapRowsToOrderHistory(result.rows);
    
    // Kiểm tra có trang tiếp theo không
    let nextToken = null;
    if (rows.length > limit) {
      const lastRow = rows.pop(); // Bỏ bản ghi cuối
      if (lastRow)
        nextToken = {
          orderedAt: lastRow.ordered_at,
          orderId: lastRow.order_id,
        };
    }
    
    return { rows, nextToken };
  } catch (error) {
    throw new Error(
      `Lỗi khi truy vấn đơn hàng của khách hàng ${customerId}: ${(error as Error).message}`,
    );
  }
}

/*   /**
   * Get orders for a customer within a date range
   * @param customerId Customer ID
   * @param startDate Start date (inclusive)
   * @param endDate End date (inclusive)
   * @returns Array of order history records
   
  async getOrdersByDateRange(
    customerId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<OrderHistoryRow[]> {
    const query = `
      SELECT 
        customer_id,
        ordered_at,
        order_id,
        restaurant_id,
        restaurant_name,
        items,
        total_amount,
        payment_method,
        order_status,
        completed_at,
        cancelled_at
      FROM ${this.tableName}
      WHERE customer_id = ?
        AND ordered_at >= ?
        AND ordered_at <= ?
      ORDER BY ordered_at DESC;
    `;

    try {
      const result = await this.client.execute(
        query,
        [customerId, endDate, startDate], // Note: Cassandra DESC order, so end first
        { prepare: true },
      );
      return this.mapRowsToOrderHistory(result.rows);
    } catch (error) {
      throw new Error(
        `Lỗi khi truy vấn lịch sử đơn hàng từ ${startDate} đến ${endDate}: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Get order by customer ID and order ID
   * @param customerId Customer ID
   * @param orderedAt Timestamp of order
   * @returns Single order history record or null
   
  async getOrderByCustomerAndTime(
    customerId: string,
    orderedAt: Date,
  ): Promise<OrderHistoryRow | null> {
    const query = `
      SELECT 
        customer_id,
        ordered_at,
        order_id,
        restaurant_id,
        restaurant_name,
        items,
        total_amount,
        payment_method,
        order_status,
        completed_at,
        cancelled_at
      FROM ${this.tableName}
      WHERE customer_id = ?
        AND ordered_at = ?;
    `;

    try {
      const result = await this.client.execute(query, [customerId, orderedAt], {
        prepare: true,
      });

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToOrderHistory(result.rows[0]);
    } catch (error) {
      throw new Error(
        `Lỗi khi truy vấn đơn hàng của khách hàng ${customerId} tại thời điểm ${orderedAt}: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Count total orders for a customer
   * @param customerId Customer ID
   * @returns Total count of orders
  

  /**
   * Get orders by status for a customer
   * @param customerId Customer ID
   * @param status Order status (e.g., 'completed', 'cancelled', 'pending')
   * @returns Array of order history records with matching status
   
  async getOrdersByStatus(
    customerId: string,
    status: string,
  ): Promise<OrderHistoryRow[]> {
    const orders = await this.getOrdersByCustomerId(customerId);
    return orders.filter((order) => order.order_status === status);
  }

  /**
   * Insert a new order record into customer order history
   * @param orderData Order data to insert
   
  async insertOrderHistory(orderData: Partial<OrderHistoryRow>): Promise<void> {
    const query = `
      INSERT INTO ${this.tableName} (
        customer_id,
        ordered_at,
        order_id,
        restaurant_id,
        restaurant_name,
        items,
        total_amount,
        payment_method,
        order_status,
        completed_at,
        cancelled_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    try {
      await this.client.execute(
        query,
        [
          orderData.customer_id,
          orderData.ordered_at,
          orderData.order_id,
          orderData.restaurant_id,
          orderData.restaurant_name,
          orderData.items,
          orderData.total_amount,
          orderData.payment_method,
          orderData.order_status,
          orderData.completed_at || null,
          orderData.cancelled_at || null,
        ],
        { prepare: true },
      );
    } catch (error) {
      throw new Error(
        `Lỗi khi thêm lịch sử đơn hàng: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Update order status in customer order history
   * @param customerId Customer ID
   * @param orderedAt Order timestamp
   * @param newStatus New status
   * @param completedAt Optional completion timestamp
   * @param cancelledAt Optional cancellation timestamp
   
  async updateOrderStatus(
    customerId: string,
    orderedAt: Date,
    newStatus: string,
    completedAt?: Date,
    cancelledAt?: Date,
  ): Promise<void> {
    const query = `
      UPDATE ${this.tableName}
      SET 
        order_status = ?,
        completed_at = ?,
        cancelled_at = ?
      WHERE customer_id = ?
        AND ordered_at = ?;
    `;

    try {
      await this.client.execute(
        query,
        [newStatus, completedAt || null, cancelledAt || null, customerId, orderedAt],
        { prepare: true },
      );
    } catch (error) {
      throw new Error(
        `Lỗi khi cập nhật trạng thái đơn hàng: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Delete an order record from customer order history
   * @param customerId Customer ID
   * @param orderedAt Order timestamp
   
  async deleteOrderHistory(
    customerId: string,
    orderedAt: Date,
  ): Promise<void> {
    const query = `
      DELETE FROM ${this.tableName}
      WHERE customer_id = ?
        AND ordered_at = ?;
    `;

    try {
      await this.client.execute(query, [customerId, orderedAt], {
        prepare: true,
      });
    } catch (error) {
      throw new Error(
        `Lỗi khi xóa lịch sử đơn hàng: ${(error as Error).message}`,
      );
    }
  } */

  /**
   * Map Cassandra row to OrderHistoryRow interface
   */
  private mapRowToOrderHistory(row: any): OrderHistoryRow {
    return {
      customer_id: row.customer_id,
      ordered_at: row.ordered_at,
      order_id: row.order_id,
      restaurant_id: row.restaurant_id,
      restaurant_name: row.restaurant_name,
      items: row.items,
      total_amount: row.total_amount,
      payment_method: row.payment_method,
      order_status: row.order_status,
      completed_at: row.completed_at,
      cancelled_at: row.cancelled_at,
    };
  }

    async countOrdersByCustomerId(customerId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) as order_count
      FROM ${this.tableName}
      WHERE customer_id = ?;
    `;

    try {
      const result = await this.client.execute(query, [customerId], {
        prepare: true,
      });
      const row = result.rows[0];
      return row ? row.order_count.toNumber() : 0;
    } catch (error) {
      throw new Error(
        `Lỗi khi đếm số đơn hàng của khách hàng ${customerId}: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Map multiple Cassandra rows to OrderHistoryRow array
   */
  private mapRowsToOrderHistory(rows: any[]): OrderHistoryRow[] {
    return rows.map((row) => this.mapRowToOrderHistory(row));
  }
}
