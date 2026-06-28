import json
import random
import csv
from datetime import datetime, timedelta
from uuid import uuid4
from faker import Faker
import pandas as pd

fake = Faker("vi_VN")

# ==================== CẤU HÌNH ====================
CONFIG = {
    "orders_per_customer_range": (3, 25),  # Số đơn hàng mỗi khách
    "order_status_weights": {
        "completed": 0.70,
        "cancelled": 0.15,
        "pending": 0.10,
        "failed": 0.05,
    },
    "payment_methods": ["cash", "credit_card", "e_wallet", "bank_transfer"],
    "date_range_days": 365,  # Dữ liệu trong 1 năm
}


# ==================== TẢI DỮ LIỆU ====================
def load_data():
    """Tải dữ liệu restaurant và customer đã generate"""
    try:
        with open("restaurant_profiles.json", "r", encoding="utf-8") as f:
            restaurants = json.load(f)
        print(f"✅ Loaded {len(restaurants)} restaurants")
    except FileNotFoundError:
        print("⚠️ restaurant_profiles.json not found. Creating sample restaurants...")
        restaurants = create_sample_restaurants()

    try:
        with open("customers.json", "r", encoding="utf-8") as f:
            customers = json.load(f)
        print(f"✅ Loaded {len(customers)} customers")
    except FileNotFoundError:
        print("⚠️ customers.json not found. Creating sample customers...")
        customers = create_sample_customers()

    return restaurants, customers


def create_sample_restaurants():
    """Tạo sample restaurants nếu không có file"""
    restaurants = []
    food_types = ["Cơm", "Phở", "Bún", "Cà phê", "Trà sữa", "Lẩu", "Ăn vặt"]
    for i in range(50):
        restaurants.append(
            {
                "restaurant_id": f"rest_{i:05d}",
                "basic_info": {
                    "restaurant_name": f"Quán {random.choice(food_types)} {fake.street_name()}",
                    "location": {
                        "coordinates": [
                            106.6 + random.uniform(0, 0.5),
                            10.7 + random.uniform(0, 0.5),
                        ]
                    },
                },
                "menu": {
                    "categories": [
                        {
                            "category_name": "Món chính",
                            "menu_items": [
                                {
                                    "item_id": f"item_{j}",
                                    "name": f"Món {j+1}",
                                    "base_price": random.randint(30000, 150000),
                                }
                                for j in range(random.randint(3, 8))
                            ],
                        }
                    ]
                },
            }
        )
    return restaurants


def create_sample_customers():
    """Tạo sample customers nếu không có file"""
    customers = []
    for i in range(200):
        customers.append(
            {
                "customer_id": f"cust_{i:05d}",
                "full_name": fake.name(),
                "phone_number": fake.phone_number(),
                "status": random.choices(
                    ["active", "inactive", "banned"], weights=[0.8, 0.15, 0.05]
                )[0],
                "addresses": [
                    {
                        "address_id": f"addr_{i}_0",
                        "address_line": fake.street_address(),
                        "location": {
                            "coordinates": [
                                106.6 + random.uniform(0, 0.5),
                                10.7 + random.uniform(0, 0.5),
                            ]
                        },
                        "is_default": True,
                    }
                ],
            }
        )
    return customers


# ==================== GENERATE ORDER HISTORY ====================
class OrderHistoryGenerator:
    def __init__(self, restaurants, customers):
        self.restaurants = restaurants
        self.customers = customers
        self.restaurant_map = {r["restaurant_id"]: r for r in restaurants}

        # Thống kê
        self.stats = {
            "total_orders": 0,
            "status_distribution": {},
            "total_revenue": 0,
            "avg_order_value": 0,
        }

    def get_restaurant_menu(self, restaurant):
        """Lấy menu của nhà hàng"""
        menu = restaurant.get("menu", {})
        categories = menu.get("categories", [])

        all_items = []
        for cat in categories:
            items = cat.get("menu_items", [])
            for item in items:
                all_items.append(
                    {
                        "item_id": item.get(
                            "item_id", f"item_{random.randint(10000, 99999)}"
                        ),
                        "name": item.get("name", "Món ăn"),
                        "price": float(
                            item.get("base_price", random.randint(20000, 150000))
                        ),
                        "category": cat.get("category_name", "Unknown"),
                    }
                )

        # Nếu không có items, tạo random
        if not all_items:
            for i in range(random.randint(3, 8)):
                all_items.append(
                    {
                        "item_id": f"item_{i}",
                        "name": f"Món {i+1}",
                        "price": float(random.randint(20000, 150000)),
                        "category": "Món chính",
                    }
                )

        return all_items

    def generate_order_items(self, menu_items):
        """Tạo danh sách items cho đơn hàng"""
        if not menu_items:
            return []

        # Chọn 1-4 món
        num_items = random.randint(1, min(4, len(menu_items)))
        selected_items = random.sample(menu_items, num_items)

        items = []
        total = 0
        for item in selected_items:
            quantity = random.randint(1, 3)
            price = item["price"]
            subtotal = price * quantity
            items.append(
                {
                    "item_id": item["item_id"],
                    "name": item["name"],
                    "quantity": quantity,
                    "price": price,
                    "subtotal": subtotal,
                }
            )
            total += subtotal

        return items, total

    def generate_order_status(self):
        """Tạo trạng thái đơn hàng"""
        statuses = []
        weights = []
        for status, weight in CONFIG["order_status_weights"].items():
            statuses.append(status)
            weights.append(weight)
        return random.choices(statuses, weights=weights)[0]

    def generate_order(self, customer, restaurant, order_date):
        """Tạo một đơn hàng"""
        customer_id = customer["customer_id"]
        restaurant_id = restaurant["restaurant_id"]
        restaurant_name = restaurant.get("basic_info", {}).get(
            "restaurant_name", "Unknown Restaurant"
        )

        # Lấy menu và tạo items
        menu_items = self.get_restaurant_menu(restaurant)
        items, total_amount = self.generate_order_items(menu_items)

        # Nếu không có items, tạo random
        if not items:
            items = [
                {
                    "item_id": f"item_{random.randint(10000, 99999)}",
                    "name": f"Món {random.randint(1, 10)}",
                    "quantity": 1,
                    "price": float(random.randint(20000, 150000)),
                    "subtotal": float(random.randint(20000, 150000)),
                }
            ]
            total_amount = items[0]["subtotal"]

        # Convert items to JSON string
        items_json = json.dumps(items, ensure_ascii=False)

        # Tạo trạng thái
        status = self.generate_order_status()

        # Tính toán thời gian
        completed_at = None
        cancelled_at = None
        if status == "completed":
            # Hoàn thành sau 20-90 phút
            minutes = random.randint(20, 90)
            completed_at = order_date + timedelta(minutes=minutes)
        elif status == "cancelled":
            # Hủy sau 5-30 phút
            minutes = random.randint(5, 30)
            cancelled_at = order_date + timedelta(minutes=minutes)

        # Tạo order_id
        order_id = f"ORD_{int(order_date.timestamp())}_{random.randint(1000, 9999)}"

        # Payment method
        payment_method = random.choice(CONFIG["payment_methods"])

        # Xây dựng order record
        order = {
            "customer_id": customer_id,
            "ordered_at": order_date,
            "order_id": order_id,
            "restaurant_id": restaurant_id,
            "restaurant_name": restaurant_name,
            "items": items_json,
            "total_amount": float(total_amount),
            "payment_method": payment_method,
            "order_status": status,
            "completed_at": completed_at,
            "cancelled_at": cancelled_at,
        }

        # Cập nhật thống kê
        self.stats["total_orders"] += 1
        self.stats["status_distribution"][status] = (
            self.stats["status_distribution"].get(status, 0) + 1
        )
        if status == "completed":
            self.stats["total_revenue"] += total_amount

        return order

    def generate_orders_for_customer(self, customer):
        """Tạo nhiều đơn hàng cho một customer"""
        orders = []

        # Xác định số lượng đơn hàng dựa trên status
        num_orders = random.randint(
            CONFIG["orders_per_customer_range"][0],
            CONFIG["orders_per_customer_range"][1],
        )

        # Active users có nhiều đơn hơn
        if customer.get("status") == "active":
            num_orders = int(num_orders * random.uniform(1.2, 1.8))
        elif customer.get("status") == "inactive":
            num_orders = int(num_orders * random.uniform(0.3, 0.6))
        elif customer.get("status") == "banned":
            num_orders = random.randint(0, 3)

        num_orders = max(0, min(num_orders, 50))  # Giới hạn 50 đơn

        if num_orders == 0:
            return orders

        # Chọn ngẫu nhiên các nhà hàng
        num_restaurants = min(num_orders, len(self.restaurants))
        selected_restaurants = random.sample(self.restaurants, num_restaurants)

        # Phân bố thời gian trong khoảng date_range_days
        end_date = datetime.now()
        start_date = end_date - timedelta(days=CONFIG["date_range_days"])

        for i in range(num_orders):
            # Chọn nhà hàng
            restaurant = selected_restaurants[i % len(selected_restaurants)]

            # Tạo ngày đặt hàng - đơn hàng gần đây có xác suất cao hơn
            if i < num_orders * 0.3:  # 30% đơn hàng gần đây (30 ngày)
                days_ago = random.randint(0, 30)
            elif i < num_orders * 0.6:  # 30% đơn hàng trong 3 tháng
                days_ago = random.randint(31, 90)
            else:  # 40% đơn hàng cũ hơn
                days_ago = random.randint(91, CONFIG["date_range_days"])

            order_date = end_date - timedelta(days=days_ago)

            # Tạo đơn hàng
            order = self.generate_order(customer, restaurant, order_date)
            if order:
                orders.append(order)

        # Sắp xếp theo thời gian giảm dần
        return sorted(orders, key=lambda x: x["ordered_at"], reverse=True)

    def generate_all_orders(self):
        """Generate orders cho tất cả customers"""
        all_orders = []
        total_customers = len(self.customers)

        print(f"\n🔄 Generating orders for {total_customers} customers...")
        print(
            f"   (Each customer: {CONFIG['orders_per_customer_range'][0]}-{CONFIG['orders_per_customer_range'][1]} orders)"
        )

        for idx, customer in enumerate(self.customers):
            orders = self.generate_orders_for_customer(customer)
            all_orders.extend(orders)

            if (idx + 1) % 50 == 0:
                print(f"  Processed {idx + 1}/{total_customers} customers...")
                print(f"  Total orders so far: {len(all_orders)}")

        print(f"\n✅ Generated {len(all_orders)} orders total")
        self.print_stats()

        return all_orders

    def print_stats(self):
        """In thống kê"""
        print("\n📊 Order Statistics:")
        print(f"  Total orders: {self.stats['total_orders']}")
        print(f"  Total revenue (completed): {self.stats['total_revenue']:,.0f} VND")
        if self.stats["total_orders"] > 0:
            completed_orders = self.stats["status_distribution"].get("completed", 0)
            if completed_orders > 0:
                print(
                    f"  Average order value: {self.stats['total_revenue'] / completed_orders:,.0f} VND"
                )
        print("  Status distribution:")
        for status, count in sorted(
            self.stats["status_distribution"].items(), key=lambda x: -x[1]
        ):
            pct = (
                count / self.stats["total_orders"] * 100
                if self.stats["total_orders"] > 0
                else 0
            )
            bar = "█" * int(pct / 2) + "░" * (50 - int(pct / 2))
            print(f"    {status:12s} {bar} {count} ({pct:.1f}%)")


# ==================== EXPORT TO CSV ====================
def export_orders_to_csv(orders, filename="customer_order_history.csv"):
    """Export orders to CSV format for Cassandra"""
    if not orders:
        print("No orders to export")
        return

    # Prepare data for CSV
    csv_data = []
    for order in orders:
        row = {
            "customer_id": order["customer_id"],
            "ordered_at": (
                order["ordered_at"].isoformat()
                if isinstance(order["ordered_at"], datetime)
                else order["ordered_at"]
            ),
            "order_id": order["order_id"],
            "restaurant_id": order["restaurant_id"],
            "restaurant_name": order["restaurant_name"],
            "items": order["items"],  # JSON string
            "total_amount": order["total_amount"],
            "payment_method": order["payment_method"],
            "order_status": order["order_status"],
            "completed_at": (
                order["completed_at"].isoformat() if order.get("completed_at") else None
            ),
            "cancelled_at": (
                order["cancelled_at"].isoformat() if order.get("cancelled_at") else None
            ),
        }
        csv_data.append(row)

    # Write CSV
    with open(filename, "w", newline="", encoding="utf-8") as f:
        fieldnames = [
            "customer_id",
            "ordered_at",
            "order_id",
            "restaurant_id",
            "restaurant_name",
            "items",
            "total_amount",
            "payment_method",
            "order_status",
            "completed_at",
            "cancelled_at",
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(csv_data)

    print(f"✅ Orders exported to {filename}")


# ==================== EXPORT TO JSON ====================
def export_orders_to_json(orders, filename="orders_history.json"):
    """Export orders to JSON file"""
    # Convert datetime objects
    orders_serializable = []
    for order in orders:
        order_copy = order.copy()
        for key in ["ordered_at", "completed_at", "cancelled_at"]:
            if key in order_copy and isinstance(order_copy[key], datetime):
                order_copy[key] = order_copy[key].isoformat()
        orders_serializable.append(order_copy)

    with open(filename, "w", encoding="utf-8") as f:
        json.dump(orders_serializable, f, indent=2, ensure_ascii=False)

    print(f"✅ Orders exported to {filename}")


# ==================== GENERATE CQL INSERT STATEMENTS ====================
def generate_cql_inserts(orders, filename="insert_orders.cql"):
    """Generate CQL INSERT statements for Cassandra"""
    with open(filename, "w", encoding="utf-8") as f:
        f.write("// Auto-generated CQL INSERT statements\n")
        f.write(f"// Total: {len(orders)} orders\n")
        f.write(f"// Generated: {datetime.now().isoformat()}\n\n")

        # Không cần USE nếu đã chỉ định keyspace trong lệnh cqlsh
        # Hoặc thêm USE nhưng phải đảm bảo keyspace tồn tại
        f.write("// Make sure keyspace exists:\n")
        f.write(
            "// CREATE KEYSPACE IF NOT EXISTS food_delivery WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};\n\n"
        )

        # Sửa lỗi BEGIN BATCH syntax
        batch_size = 50
        for i in range(0, len(orders), batch_size):
            batch = orders[i : i + batch_size]
            f.write("BEGIN BATCH\n")  # Không có dấu ; sau BEGIN BATCH

            for order in batch:
                customer_id = order["customer_id"]
                ordered_at = (
                    order["ordered_at"].isoformat()
                    if isinstance(order["ordered_at"], datetime)
                    else order["ordered_at"]
                )
                order_id = order["order_id"]
                restaurant_id = order["restaurant_id"]
                restaurant_name = order["restaurant_name"].replace("'", "''")
                items = order["items"].replace("'", "''")
                total_amount = order["total_amount"]
                payment_method = order["payment_method"]
                order_status = order["order_status"]

                completed_at = (
                    f"'{order['completed_at'].isoformat()}'"
                    if order.get("completed_at")
                    else "null"
                )
                cancelled_at = (
                    f"'{order['cancelled_at'].isoformat()}'"
                    if order.get("cancelled_at")
                    else "null"
                )

                f.write(f"""INSERT INTO customer_order_history (
    customer_id, ordered_at, order_id, restaurant_id, restaurant_name,
    items, total_amount, payment_method, order_status, completed_at, cancelled_at
) VALUES (
    '{customer_id}',
    '{ordered_at}',
    '{order_id}',
    '{restaurant_id}',
    '{restaurant_name}',
    '{items}',
    {total_amount},
    '{payment_method}',
    '{order_status}',
    {completed_at},
    {cancelled_at}
);
""")

            f.write("APPLY BATCH;\n\n")

    print(f"✅ CQL INSERT statements exported to {filename}")


# ==================== GENERATE SAMPLE QUERIES ====================
def generate_sample_queries(orders, filename="sample_queries.cql"):
    """Generate sample CQL queries for testing"""
    if not orders:
        return

    sample_customer = orders[0]["customer_id"]
    sample_order = orders[0]["order_id"]

    with open(filename, "w", encoding="utf-8") as f:
        f.write("// ============================================================\n")
        f.write("// SAMPLE CQL QUERIES FOR TESTING\n")
        f.write("// ============================================================\n\n")

        f.write("USE food_delivery;\n\n")

        # Get orders by customer
        f.write(f"""
-- 1. Get all orders for a customer (sorted by time DESC)
SELECT * FROM customer_order_history 
WHERE customer_id = '{sample_customer}'
LIMIT 20;

""")

        # Get orders by date range
        f.write(f"""
-- 2. Get orders in date range
SELECT * FROM customer_order_history 
WHERE customer_id = '{sample_customer}'
  AND ordered_at >= '{(datetime.now() - timedelta(days=30)).isoformat()}'
  AND ordered_at <= '{datetime.now().isoformat()}'
LIMIT 20;

""")

        # Get completed orders
        f.write(f"""
-- 3. Get completed orders only
SELECT * FROM customer_order_history 
WHERE customer_id = '{sample_customer}'
  AND order_status = 'completed'
LIMIT 20;

""")

        # Count orders by status
        f.write(f"""
-- 4. Count orders by status (using ALLOW FILTERING - not recommended for production)
SELECT order_status, COUNT(*) 
FROM customer_order_history 
WHERE customer_id = '{sample_customer}'
GROUP BY order_status;

""")

        # Get a single order
        f.write(f"""
-- 5. Get a specific order
SELECT * FROM customer_order_history 
WHERE customer_id = '{sample_customer}'
  AND order_id = '{sample_order}';

""")

        # Get orders with items
        f.write(f"""
-- 6. Get orders with items (parse JSON in application)
SELECT order_id, items, total_amount 
FROM customer_order_history 
WHERE customer_id = '{sample_customer}'
  AND order_status = 'completed'
LIMIT 10;

""")

    print(f"✅ Sample queries exported to {filename}")


# ==================== MAIN ====================
def main():
    print("=" * 70)
    print("🍽️  CUSTOMER ORDER HISTORY GENERATOR")
    print("=" * 70)

    # 1. Tải dữ liệu
    print("\n📂 Loading data...")
    restaurants, customers = load_data()

    if not restaurants or not customers:
        print(
            "❌ No data available. Please generate restaurant and customer data first."
        )
        return

    # 2. Generate orders
    print("\n🔄 Generating order history...")
    generator = OrderHistoryGenerator(restaurants, customers)
    orders = generator.generate_all_orders()

    if not orders:
        print("❌ No orders generated")
        return

    # 3. Export to CSV (for Cassandra import)
    print("\n💾 Exporting data...")
    export_orders_to_csv(orders)

    # 4. Export to JSON
    export_orders_to_json(orders)

    # 5. Generate CQL INSERT statements
    generate_cql_inserts(orders)

    # 6. Generate sample queries
    generate_sample_queries(orders)

    # 7. Print summary
    print("\n" + "=" * 70)
    print("✅ GENERATION COMPLETE!")
    print("=" * 70)
    print("\n📁 Output files:")
    print("  📄 customer_order_history.csv  - Data in CSV format")
    print("  📄 orders_history.json         - Data in JSON format")
    print("  📄 insert_orders.cql           - CQL INSERT statements")
    print("  📄 sample_queries.cql          - Sample CQL queries")
    print("\n📋 To import into Cassandra:")
    print("  Option 1: Use CQL file")
    print("    cqlsh -f insert_orders.cql")
    print("  Option 2: Use COPY command")
    print(
        "    COPY food_delivery.customer_order_history FROM 'customer_order_history.csv' WITH HEADER=true;"
    )
    print("\n🎯 Sample query:")
    print("  SELECT * FROM food_delivery.customer_order_history")
    print(f"  WHERE customer_id = '{orders[0]['customer_id']}' LIMIT 10;")
    print("=" * 70)


if __name__ == "__main__":
    main()
