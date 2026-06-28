// ============================================================
// SAMPLE CQL QUERIES FOR TESTING
// ============================================================

USE food_delivery;


-- 1. Get all orders for a customer (sorted by time DESC)
SELECT * FROM customer_order_history 
WHERE customer_id = 'cust_1756878733_00000'
LIMIT 20;


-- 2. Get orders in date range
SELECT * FROM customer_order_history 
WHERE customer_id = 'cust_1756878733_00000'
  AND ordered_at >= '2026-05-26T14:46:04.525204'
  AND ordered_at <= '2026-06-25T14:46:04.525243'
LIMIT 20;


-- 3. Get completed orders only
SELECT * FROM customer_order_history 
WHERE customer_id = 'cust_1756878733_00000'
  AND order_status = 'completed'
LIMIT 20;


-- 4. Count orders by status (using ALLOW FILTERING - not recommended for production)
SELECT order_status, COUNT(*) 
FROM customer_order_history 
WHERE customer_id = 'cust_1756878733_00000'
GROUP BY order_status;


-- 5. Get a specific order
SELECT * FROM customer_order_history 
WHERE customer_id = 'cust_1756878733_00000'
  AND order_id = 'ORD_1781855097_3536';


-- 6. Get orders with items (parse JSON in application)
SELECT order_id, items, total_amount 
FROM customer_order_history 
WHERE customer_id = 'cust_1756878733_00000'
  AND order_status = 'completed'
LIMIT 10;

