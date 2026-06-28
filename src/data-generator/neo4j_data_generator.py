# neo4j_data_generator.py

import json
import random
from datetime import datetime, timedelta
from collections import defaultdict

# from neo4j import GraphDatabase
import pandas as pd

# ==================== CẤU HÌNH ====================
NEO4J_CONFIG = {
    "uri": "bolt://localhost:7687",
    "user": "neo4j",
    "password": "password",  # Thay đổi theo cấu hình của bạn
}


# ==================== TẢI DỮ LIỆU ====================
def load_data():
    """Tải dữ liệu từ các file đã generate"""
    data = {}

    # Load orders history
    try:
        with open("customer_order_history.csv", "r", encoding="utf-8") as f:
            import csv

            reader = csv.DictReader(f)
            data["orders"] = list(reader)
        print(f"✅ Loaded {len(data['orders'])} orders")
    except FileNotFoundError:
        print("⚠️ customer_order_history.csv not found")
        data["orders"] = []

    # Load restaurants
    try:
        with open("restaurant_profiles.json", "r", encoding="utf-8") as f:
            data["restaurants"] = json.load(f)
        print(f"✅ Loaded {len(data['restaurants'])} restaurants")
    except FileNotFoundError:
        print("⚠️ restaurant_profiles.json not found")
        data["restaurants"] = []

    # Load customers
    try:
        with open("customers.json", "r", encoding="utf-8") as f:
            data["customers"] = json.load(f)
        print(f"✅ Loaded {len(data['customers'])} customers")
    except FileNotFoundError:
        print("⚠️ customers.json not found")
        data["customers"] = []

    return data


# ==================== NEO4J DATA GENERATOR ====================
class Neo4jDataGenerator:
    def __init__(self, data):
        self.data = data
        self.orders = data.get("orders", [])
        self.restaurants = data.get("restaurants", [])
        self.customers = data.get("customers", [])

        # Maps để tra cứu nhanh
        self.restaurant_map = {r["restaurant_id"]: r for r in self.restaurants}
        self.customer_map = {c["customer_id"]: c for c in self.customers}

        # Thống kê
        self.stats = {
            "users": 0,
            "restaurants": 0,
            "dishes": 0,
            "viewed_edges": 0,
            "cart_edges": 0,
            "ordered_edges": 0,
            "bought_together_edges": 0,
            "owns_edges": 0,
        }

        # Cache để deduplicate
        self.dish_cache = {}
        self.user_cache = set()
        self.restaurant_cache = set()

        # Bought together analysis
        self.bought_together = defaultdict(lambda: defaultdict(int))

        # Parse orders
        self.parse_orders()

    def parse_orders(self):
        """Parse orders from CSV data"""
        self.parsed_orders = []

        for order in self.orders:
            try:
                # Parse items từ JSON string
                items_str = order.get("items", "[]")
                if isinstance(items_str, str):
                    items = json.loads(items_str)
                else:
                    items = items_str

                # Parse datetime
                ordered_at = order.get("ordered_at")
                if ordered_at:
                    if isinstance(ordered_at, str):
                        ordered_at = datetime.fromisoformat(
                            ordered_at.replace("Z", "+00:00")
                        )

                parsed_order = {
                    "customer_id": order.get("customer_id"),
                    "order_id": order.get("order_id"),
                    "restaurant_id": order.get("restaurant_id"),
                    "restaurant_name": order.get("restaurant_name"),
                    "items": items,
                    "total_amount": float(order.get("total_amount", 0)),
                    "payment_method": order.get("payment_method"),
                    "order_status": order.get("order_status"),
                    "ordered_at": ordered_at,
                    "completed_at": order.get("completed_at"),
                    "cancelled_at": order.get("cancelled_at"),
                }
                self.parsed_orders.append(parsed_order)

                # Collect all dishes from orders
                for item in items:
                    if isinstance(item, dict):
                        dish_id = item.get("item_id")
                        dish_name = item.get("name", f"Dish_{dish_id}")
                        if dish_id and dish_id not in self.dish_cache:
                            self.dish_cache[dish_id] = {
                                "dish_id": dish_id,
                                "name": dish_name,
                            }

                # Collect users
                if order.get("customer_id"):
                    self.user_cache.add(order["customer_id"])

                # Collect restaurants
                if order.get("restaurant_id"):
                    self.restaurant_cache.add(order["restaurant_id"])

            except Exception as e:
                print(f"⚠️ Error parsing order: {e}")
                continue

        print(f"✅ Parsed {len(self.parsed_orders)} orders")
        print(f"   Found {len(self.dish_cache)} unique dishes")
        print(f"   Found {len(self.user_cache)} unique users")
        print(f"   Found {len(self.restaurant_cache)} unique restaurants")

    def analyze_bought_together(self):
        """Analyze dishes that are often bought together"""
        print("\n🔄 Analyzing bought-together patterns...")

        for order in self.parsed_orders:
            if order["order_status"] != "completed":
                continue

            items = order.get("items", [])
            dish_ids = []
            for item in items:
                if isinstance(item, dict):
                    dish_id = item.get("item_id")
                    if dish_id:
                        dish_ids.append(dish_id)

            # Count pairs
            for i in range(len(dish_ids)):
                for j in range(i + 1, len(dish_ids)):
                    dish1 = dish_ids[i]
                    dish2 = dish_ids[j]
                    if dish1 and dish2:
                        self.bought_together[dish1][dish2] += 1
                        self.bought_together[dish2][dish1] += 1

        # Filter pairs that appear together at least twice
        filtered_pairs = {}
        for dish1, pairs in self.bought_together.items():
            for dish2, freq in pairs.items():
                if freq >= 2:  # Chỉ lấy những cặp xuất hiện ít nhất 2 lần
                    key = tuple(sorted([dish1, dish2]))
                    if key not in filtered_pairs:
                        filtered_pairs[key] = freq

        self.bought_together_pairs = filtered_pairs
        print(f"   Found {len(filtered_pairs)} bought-together pairs (frequency >= 2)")
        return filtered_pairs

    def generate_cypher(self, output_file="neo4j_import.cypher"):
        """Generate Cypher statements for Neo4j import"""

        # Analyze bought-together first
        self.analyze_bought_together()

        print("\n📝 Generating Cypher statements...")

        with open(output_file, "w", encoding="utf-8") as f:
            f.write("// ============================================================\n")
            f.write("// NEO4J DATA IMPORT - CYPHER STATEMENTS\n")
            f.write(f"// Generated: {datetime.now().isoformat()}\n")
            f.write(
                "// ============================================================\n\n"
            )

            # ============ CREATE CONSTRAINTS ============
            f.write("// ============ CREATE CONSTRAINTS ============\n\n")
            f.write(
                "CREATE CONSTRAINT IF NOT EXISTS FOR (u:User) REQUIRE u.user_id IS UNIQUE;\n"
            )
            f.write(
                "CREATE CONSTRAINT IF NOT EXISTS FOR (r:Restaurant) REQUIRE r.restaurant_id IS UNIQUE;\n"
            )
            f.write(
                "CREATE CONSTRAINT IF NOT EXISTS FOR (d:Dish) REQUIRE d.dish_id IS UNIQUE;\n\n"
            )

            # ============ CREATE RESTAURANTS ============
            f.write("// ============ CREATE RESTAURANTS ============\n\n")
            for restaurant in self.restaurants:
                restaurant_id = restaurant.get("restaurant_id")
                name = restaurant.get("basic_info", {}).get(
                    "restaurant_name", "Unknown"
                )
                f.write(
                    f"MERGE (r:Restaurant {{restaurant_id: '{restaurant_id}', name: '{name.replace("'", "''")}'}});\n"
                )
                self.stats["restaurants"] += 1

            f.write("\n")

            # ============ CREATE DISHES ============
            f.write("// ============ CREATE DISHES ============\n\n")
            for dish_id, dish_info in self.dish_cache.items():
                name = dish_info.get("name", f"Dish_{dish_id}").replace("'", "''")
                f.write(f"MERGE (d:Dish {{dish_id: '{dish_id}', name: '{name}'}});\n")
                self.stats["dishes"] += 1

            f.write("\n")

            # ============ CREATE USERS ============
            f.write("// ============ CREATE USERS ============\n\n")

            # Từ customers
            for customer in self.customers:
                customer_id = customer.get("customer_id")
                if customer_id:
                    f.write(f"MERGE (u:User {{user_id: '{customer_id}'}});\n")
                    self.stats["users"] += 1

            # Từ orders (nếu có customer chưa có trong customers)
            for order in self.parsed_orders:
                customer_id = order.get("customer_id")
                if customer_id and customer_id not in self.customer_map:
                    f.write(f"MERGE (u:User {{user_id: '{customer_id}'}});\n")
                    self.stats["users"] += 1

            f.write("\n")

            # ============ CREATE OWNS RELATIONSHIPS ============
            f.write(
                "// ============ CREATE OWNS RELATIONSHIPS (Restaurant -> Dish) ============\n\n"
            )

            # Tạo mapping restaurant -> dishes từ orders
            restaurant_dishes = defaultdict(set)
            for order in self.parsed_orders:
                restaurant_id = order.get("restaurant_id")
                if not restaurant_id:
                    continue
                items = order.get("items", [])
                for item in items:
                    if isinstance(item, dict):
                        dish_id = item.get("item_id")
                        if dish_id:
                            restaurant_dishes[restaurant_id].add(dish_id)

            for restaurant_id, dish_ids in restaurant_dishes.items():
                for dish_id in dish_ids:
                    f.write(
                        f"""MATCH (r:Restaurant {{restaurant_id: '{restaurant_id}'}})
MATCH (d:Dish {{dish_id: '{dish_id}'}})
MERGE (r)-[:OWNS {{is_active: true}}]->(d);
"""
                    )
                    self.stats["owns_edges"] += 1

            f.write("\n")

            # ============ CREATE RELATIONSHIPS FROM ORDERS ============
            f.write(
                "// ============ CREATE USER-DISH RELATIONSHIPS FROM ORDERS ============\n\n"
            )

            # Group orders by customer
            customer_orders = defaultdict(list)
            for order in self.parsed_orders:
                customer_id = order.get("customer_id")
                if customer_id:
                    customer_orders[customer_id].append(order)

            # Process each customer
            for customer_id, orders in customer_orders.items():
                # Track dish interactions
                dish_views = defaultdict(int)
                dish_carts = set()
                dish_orders = defaultdict(int)

                for order in orders:
                    status = order.get("order_status")
                    items = order.get("items", [])

                    for item in items:
                        if not isinstance(item, dict):
                            continue
                        dish_id = item.get("item_id")
                        if not dish_id:
                            continue

                        if status in ["completed", "delivered", "pending", "confirmed"]:
                            # ORDERED relationship
                            quantity = item.get("quantity", 1)
                            dish_orders[dish_id] += quantity
                        elif status == "cancelled":
                            # ADDED_TO_CART (cancelled orders)
                            dish_carts.add(dish_id)

                        # VIEWED (all orders imply view)
                        dish_views[dish_id] += 1

                # Create VIEWED relationships
                for dish_id, count in dish_views.items():
                    if count > 0:
                        f.write(f"""MATCH (u:User {{user_id: '{customer_id}'}})
MATCH (d:Dish {{dish_id: '{dish_id}'}})
MERGE (u)-[v:VIEWED]->(d)
SET v.timestamp = datetime(),
    v.count = coalesce(v.count, 0) + {count};
""")
                        self.stats["viewed_edges"] += 1

                # Create ADDED_TO_CART relationships
                for dish_id in dish_carts:
                    f.write(f"""MATCH (u:User {{user_id: '{customer_id}'}})
MATCH (d:Dish {{dish_id: '{dish_id}'}})
MERGE (u)-[c:ADDED_TO_CART]->(d)
SET c.timestamp = datetime();
""")
                    self.stats["cart_edges"] += 1

                # Create ORDERED relationships
                for dish_id, total_orders in dish_orders.items():
                    f.write(f"""MATCH (u:User {{user_id: '{customer_id}'}})
MATCH (d:Dish {{dish_id: '{dish_id}'}})
MERGE (u)-[o:ORDERED]->(d)
SET o.total_orders = coalesce(o.total_orders, 0) + {total_orders};
""")
                    self.stats["ordered_edges"] += 1

            f.write("\n")

            # ============ CREATE BOUGHT_TOGETHER RELATIONSHIPS ============
            f.write(
                "// ============ CREATE BOUGHT_TOGETHER RELATIONSHIPS ============\n\n"
            )

            for pair, frequency in self.bought_together_pairs.items():
                dish1, dish2 = pair
                if frequency >= 2:  # Chỉ tạo cho cặp có frequency >= 2
                    f.write(f"""MATCH (d1:Dish {{dish_id: '{dish1}'}})
MATCH (d2:Dish {{dish_id: '{dish2}'}})
MERGE (d1)-[b:BOUGHT_TOGETHER]->(d2)
SET b.frequency = coalesce(b.frequency, 0) + {frequency};
""")
                    self.stats["bought_together_edges"] += 1

            f.write("\n")

            # ============ CREATE INDEXES ============
            f.write("// ============ CREATE INDEXES ============\n\n")
            f.write("CREATE INDEX IF NOT EXISTS FOR (u:User) ON (u.user_id);\n")
            f.write(
                "CREATE INDEX IF NOT EXISTS FOR (r:Restaurant) ON (r.restaurant_id);\n"
            )
            f.write("CREATE INDEX IF NOT EXISTS FOR (d:Dish) ON (d.dish_id);\n")
            f.write("CREATE INDEX IF NOT EXISTS FOR (d:Dish) ON (d.name);\n")
            f.write(
                "CREATE INDEX IF NOT EXISTS FOR ()-[v:VIEWED]-() ON (v.timestamp);\n"
            )
            f.write(
                "CREATE INDEX IF NOT EXISTS FOR ()-[o:ORDERED]-() ON (o.total_orders);\n"
            )

        print(f"✅ Cypher statements exported to {output_file}")
        self.print_stats()

    def print_stats(self):
        """Print statistics"""
        print("\n📊 Neo4j Data Statistics:")
        print(f"  👤 Users: {self.stats['users']}")
        print(f"  🏪 Restaurants: {self.stats['restaurants']}")
        print(f"  🍽️ Dishes: {self.stats['dishes']}")
        print(f"  👁️ VIEWED relationships: {self.stats['viewed_edges']}")
        print(f"  🛒 ADDED_TO_CART relationships: {self.stats['cart_edges']}")
        print(f"  ✅ ORDERED relationships: {self.stats['ordered_edges']}")
        print(
            f"  🔗 BOUGHT_TOGETHER relationships: {self.stats['bought_together_edges']}"
        )
        print(f"  🏷️ OWNS relationships: {self.stats['owns_edges']}")


# ==================== NEO4J IMPORTER ====================
class Neo4jImporter:
    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self.driver.close()

    def execute_cypher_file(self, cypher_file="neo4j_import.cypher"):
        """Execute Cypher file in Neo4j"""
        with open(cypher_file, "r", encoding="utf-8") as f:
            statements = f.read()

        # Split statements by semicolon
        queries = [q.strip() for q in statements.split(";") if q.strip()]

        print(f"\n🔌 Executing {len(queries)} Cypher statements in Neo4j...")

        with self.driver.session() as session:
            for i, query in enumerate(queries):
                try:
                    session.run(query)
                    if (i + 1) % 100 == 0:
                        print(f"  Executed {i + 1}/{len(queries)} statements...")
                except Exception as e:
                    print(f"❌ Error at statement {i + 1}: {e}")
                    print(f"   Query: {query[:100]}...")
                    return False

        print("✅ All statements executed successfully!")
        return True

    def verify_data(self):
        """Verify data in Neo4j"""
        with self.driver.session() as session:
            # Count nodes
            result = session.run("MATCH (u:User) RETURN count(u) as count")
            users = result.single()["count"]

            result = session.run("MATCH (r:Restaurant) RETURN count(r) as count")
            restaurants = result.single()["count"]

            result = session.run("MATCH (d:Dish) RETURN count(d) as count")
            dishes = result.single()["count"]

            # Count relationships
            result = session.run("MATCH ()-[v:VIEWED]->() RETURN count(v) as count")
            viewed = result.single()["count"]

            result = session.run(
                "MATCH ()-[c:ADDED_TO_CART]->() RETURN count(c) as count"
            )
            cart = result.single()["count"]

            result = session.run("MATCH ()-[o:ORDERED]->() RETURN count(o) as count")
            ordered = result.single()["count"]

            result = session.run(
                "MATCH ()-[b:BOUGHT_TOGETHER]->() RETURN count(b) as count"
            )
            bought_together = result.single()["count"]

            result = session.run("MATCH ()-[o:OWNS]->() RETURN count(o) as count")
            owns = result.single()["count"]

            print("\n📊 Neo4j Verification:")
            print(f"  👤 Users: {users}")
            print(f"  🏪 Restaurants: {restaurants}")
            print(f"  🍽️ Dishes: {dishes}")
            print(f"  👁️ VIEWED: {viewed}")
            print(f"  🛒 ADDED_TO_CART: {cart}")
            print(f"  ✅ ORDERED: {ordered}")
            print(f"  🔗 BOUGHT_TOGETHER: {bought_together}")
            print(f"  🏷️ OWNS: {owns}")


# ==================== SAMPLE QUERIES ====================
def generate_sample_queries(filename="neo4j_sample_queries.cypher"):
    """Generate sample Cypher queries for analysis"""
    queries = """
// ============================================================
// SAMPLE CYPHER QUERIES FOR NEO4J ANALYSIS
// ============================================================

// 1. Top 10 most popular dishes (most ORDERED)
MATCH (u:User)-[o:ORDERED]->(d:Dish)
RETURN d.name, sum(o.total_orders) as total_orders
ORDER BY total_orders DESC LIMIT 10;

// 2. Top 10 users with most orders
MATCH (u:User)-[o:ORDERED]->(d:Dish)
RETURN u.user_id, sum(o.total_orders) as total_orders
ORDER BY total_orders DESC LIMIT 10;

// 3. Dishes frequently bought together
MATCH (d1:Dish)-[b:BOUGHT_TOGETHER]->(d2:Dish)
RETURN d1.name, d2.name, b.frequency
ORDER BY b.frequency DESC LIMIT 20;

// 4. Most viewed dishes
MATCH (u:User)-[v:VIEWED]->(d:Dish)
RETURN d.name, sum(v.count) as total_views
ORDER BY total_views DESC LIMIT 10;

// 5. Conversion funnel: View -> Cart -> Order
MATCH (u:User)-[v:VIEWED]->(d:Dish)
OPTIONAL MATCH (u)-[c:ADDED_TO_CART]->(d)
OPTIONAL MATCH (u)-[o:ORDERED]->(d)
RETURN d.name, 
       count(DISTINCT u) as viewers,
       count(DISTINCT CASE WHEN c IS NOT NULL THEN u END) as cart_users,
       count(DISTINCT CASE WHEN o IS NOT NULL THEN u END) as order_users;

// 6. Recommendations: Users who bought this dish also bought...
MATCH (d1:Dish)-[:BOUGHT_TOGETHER]-(d2:Dish)
WHERE d1.name = 'Cơm tấm sườn'
RETURN d2.name, count(*) as frequency
ORDER BY frequency DESC LIMIT 10;

// 7. Restaurants with most active dishes
MATCH (r:Restaurant)-[:OWNS]->(d:Dish)
WHERE d.is_active = true
RETURN r.name, count(d) as dish_count
ORDER BY dish_count DESC LIMIT 10;

// 8. User behavior patterns
MATCH (u:User)-[v:VIEWED]->(d:Dish)
WITH u, count(v) as views
MATCH (u)-[o:ORDERED]->()
WITH u, views, count(o) as orders
RETURN u.user_id, views, orders,
       CASE 
           WHEN views > 0 AND orders > 0 THEN views / orders
           ELSE NULL
       END as view_to_order_ratio
ORDER BY view_to_order_ratio ASC LIMIT 10;

// 9. Dish popularity by month
MATCH (u:User)-[o:ORDERED]->(d:Dish)
RETURN d.name, 
       date().year as year,
       date().month as month,
       sum(o.total_orders) as monthly_orders
ORDER BY year DESC, month DESC, monthly_orders DESC LIMIT 20;

// 10. Restaurant dish diversity
MATCH (r:Restaurant)-[:OWNS]->(d:Dish)
RETURN r.name, 
       count(d) as total_dishes,
       count(DISTINCT d.name) as unique_dishes
ORDER BY total_dishes DESC LIMIT 10;
"""

    with open(filename, "w", encoding="utf-8") as f:
        f.write(queries)

    print(f"✅ Sample queries exported to {filename}")


# ==================== MAIN ====================
def main():
    print("=" * 70)
    print("🔄 NEO4J DATA GENERATOR")
    print("=" * 70)

    # 1. Load data
    print("\n📂 Loading data...")
    data = load_data()

    if not data["orders"] and not data["restaurants"] and not data["customers"]:
        print("❌ No data found!")
        return

    # 2. Generate Neo4j data
    print("\n🔄 Generating Neo4j data...")
    generator = Neo4jDataGenerator(data)
    generator.generate_cypher("neo4j_import.cypher")

    # 3. Generate sample queries
    # generate_sample_queries()

    # 4. Ask if user wants to import
    # print("\n" + "=" * 70)
    # print("📋 Next Steps:")
    # print("=" * 70)
    # print("\nOption 1: Import using Cypher file (recommended)")
    # print("  1. Open Neo4j Browser (http://localhost:7474)")
    # print("  2. Copy and paste the content of 'neo4j_import.cypher'")
    # print("  3. Run the statements")
    # print("\nOption 2: Import using Neo4j Admin")
    # print("  cat neo4j_import.cypher | cypher-shell -u neo4j -p password")
    # print("\nOption 3: Import using Python (if Neo4j is running)")

    # choice = input("\nDo you want to import data to Neo4j now? (y/n): ").strip().lower()

    # if choice == "y":
    #     print("\n🔌 Connecting to Neo4j...")
    #     importer = Neo4jImporter(
    #         NEO4J_CONFIG["uri"], NEO4J_CONFIG["user"], NEO4J_CONFIG["password"]
    #     )

    #     try:
    #         if importer.execute_cypher_file("neo4j_import.cypher"):
    #             importer.verify_data()
    #     except Exception as e:
    #         print(f"❌ Error: {e}")
    #         print("\n⚠️  Make sure Neo4j is running and credentials are correct.")
    #         print("   To start Neo4j Docker:")
    #         print(
    #             "   docker run -d --name neo4j -p 7474:7474 -p 7687:7687 -e NEO4J_AUTH=neo4j/password neo4j:latest"
    #         )
    #     finally:
    #         importer.close()

    print("\n✅ Done!")
    print("\n📁 Output files:")
    print("  📄 neo4j_import.cypher - Cypher statements for import")
    # print("  📄 neo4j_sample_queries.cypher - Sample queries for analysis")


if __name__ == "__main__":
    main()
