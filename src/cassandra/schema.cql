CREATE TABLE customer_order_history (
    customer_id    text,
    ordered_at     timestamp,
    order_id       text,
    restaurant_id  text,
    restaurant_name text,    -- snapshot tên cửa hàng tại thời điểm đặt
    items          text,     -- snapshot danh sách món (JSON)
    total_amount   double,
    payment_method text,
    order_status   text,
    completed_at   timestamp,
    cancelled_at   timestamp,
    PRIMARY KEY (customer_id, ordered_at, order_id)
) WITH CLUSTERING ORDER BY (ordered_at DESC);