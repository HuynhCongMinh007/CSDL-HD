export interface OrderHistoryRow {
  customer_id: string;
  ordered_at: Date;
  order_id: string;
  restaurant_id: string;
  restaurant_name: string;
  items: string; // JSON string
  total_amount: number;
  payment_method: string;
  order_status: string;
  completed_at?: Date;
  cancelled_at?: Date;
}