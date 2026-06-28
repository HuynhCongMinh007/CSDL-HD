Thank you very much DeepSeek, you are a great Data Sample Generator.

## Dataset tham khảo bao gồm:
Tệp test.csv chứa các location và order-datetime mẫu.
Dựa trên Food Delivery Dataset trên Kaggle: https://www.kaggle.com/datasets/gauravmalik26/food-delivery-dataset

## MongoDB data sample bao gồm:
- Code generate: restaurant-data-generator.py (collection restaurants), customer-data-generator.py (collection customers)
    Chạy 2 tệp này là sẽ ra 2 tệp phía dưới.
- Tệp json data: restaurant_profile.json (collection restaurants), customers.json (collection customers)
    Cách nap data: Trong MongoDB Compass, sau khi tạo mới collection, bấm vào ADD DATA -> Import JSON or CSV file rồi chọn tệp tương ứng với collection là được.
- Tệp .js db.collection.insertMany(): restaurant_profile_insert.js (collection restaurants), customers_insert.js (collection customers)
    Cách nạp data: Chạy trong MongoDB Shell:
    // Kết nối đến MongoDB
    mongosh

    // Hoặc nếu MongoDB đang chạy trên Docker
    docker exec -it <tên mongodb-container> mongosh

    // Trong MongoDB Shell, chọn database (nhớ tạo database trước)
    use food_delivery

    // Chạy file script
    load("restaurant_profiles_insert.js")
    load("customers_insert.js")

    // Kiểm tra dữ liệu đã insert
    db.Restaurants.countDocuments()
    db.Customers.countDocuments()
Thời gian chạy (load hết data) ước tính: 30 giây

## Cassandra data sample bao gồm:
- Code generate: customer-order-history-data-generator.py
- Tệp .cql chứa các lệnh Cassandra insert data: insert_orders.py
- Tệp .csv data: customer_order_history.csv
- Tệp sample query: sample_queries.cql (chỉ mang tính tham khảo)
Cách nạp data: Trong terminal docker, copy file .cql vào container rồi chạy:
docker cp insert_orders.cql <tên cassandra-container> :/tmp/insert_orders.cql
docker exec -i <tên cassandra-container> cqlsh -f /tmp/insert_orders.cql
Thời gian chạy ước tính: **12 giờ**

## Neo4J data sample bao gồm:
- Code generate: neo4j_data_generator.py
- Tệp .cypher chứa các lệnh Cypher insert data: neo4j_import.cypher
Cách nạp data: Trong terminal docker, copy file .cypher vào container rồi chạy:
docker cp neo4j_import.cypher <tên neo4j container>:/tmp/neo4j_import.cypher
docker exec -it <tên neo4j container> cypher-shell -u <tên username> -p <mật khẩu> -f /tmp/neo4j_import.cypher
Thời gian chạy ước tính: **12 giờ**

## Khuyến cáo
Không nên sắp xếp và thay đổi thư mục của các tệp trong thư mục này vì code .py có sử dụng đường dẫn tương đối bắt đầu từ thư mục gốc này để đọc các tệp data và tổng hợp.
Các tệp data có tại https://drive.google.com/drive/folders/1qyyMTT7Tkz9L4BPS93_F5Th_sqvoWFCY?usp=sharing