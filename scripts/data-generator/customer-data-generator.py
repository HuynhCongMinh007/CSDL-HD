import json
import random
from datetime import datetime, timedelta
from faker import Faker
import pandas as pd

fake = Faker("vi_VN")

# Đọc file CSV
df = pd.read_csv("test.csv")

# Xử lý tọa độ
df["Delivery_location_latitude"] = pd.to_numeric(
    df["Delivery_location_latitude"], errors="coerce"
)
df["Delivery_location_longitude"] = pd.to_numeric(
    df["Delivery_location_longitude"], errors="coerce"
)

# Lọc tọa độ hợp lệ
valid_df = df[
    (df["Delivery_location_latitude"].notna())
    & (df["Delivery_location_longitude"].notna())
    & (df["Delivery_location_latitude"] != 0)
    & (df["Delivery_location_longitude"] != 0)
    & (df["Delivery_location_latitude"].abs() < 90)
    & (df["Delivery_location_longitude"].abs() < 180)
]

print(f"Total rows: {len(df)}")
print(f"Valid delivery coordinates: {len(valid_df)}")

# Lưu tọa độ
coords_list = list(
    zip(
        valid_df["Delivery_location_latitude"].values,
        valid_df["Delivery_location_longitude"].values,
    )
)

if len(coords_list) == 0:
    # Fallback coordinates
    coords_list = [
        (10.7 + random.uniform(0, 1.0), 106.6 + random.uniform(0, 0.8))
        for _ in range(len(df))
    ]

# Mở rộng tọa độ
while len(coords_list) < len(df) * 4:
    coords_list.extend(coords_list[: len(df) * 4 - len(coords_list)])
coords_list = coords_list[: len(df) * 4]

# Các hằng số
CITIES = [
    "Hà Nội",
    "TP.HCM",
    "Đà Nẵng",
    "Hải Phòng",
    "Cần Thơ",
    "Đà Lạt",
    "Nha Trang",
    "Vũng Tàu",
    "Huế",
    "Buôn Ma Thuột",
]
WARD_SUFFIXES = ["Phường", "Xã", "Thị trấn"]


def generate_address(index, coords, is_default=False):
    lat, lng = coords
    ward_num = random.randint(1, 30)
    ward_type = random.choice(WARD_SUFFIXES)
    city = random.choice(CITIES)

    return {
        "address_id": f"addr_{int(datetime.now().timestamp())}_{index}_{random.randint(10000, 99999)}",
        "receiver_name": fake.name(),
        "receiver_phone": fake.phone_number(),
        "address_line": f"{random.randint(1, 999)} {fake.street_name()}",
        "ward": f"{ward_type} {ward_num}",
        "city": city,
        "location": {"type": "Point", "coordinates": [float(lng), float(lat)]},
        "label": "home" if is_default else random.choice(["home", "work", "other"]),
        "is_default": is_default,
        "created_at": datetime.now() - timedelta(days=random.randint(1, 365)),
        "updated_at": datetime.now() - timedelta(days=random.randint(1, 30)),
    }


def generate_customer(index):
    # Thông tin cơ bản
    first_name = fake.first_name()
    last_name = fake.last_name()
    full_name = f"{last_name} {first_name}"
    phone = fake.phone_number()
    email = f"{last_name.lower()}.{first_name.lower()}{random.randint(10, 999)}@{random.choice(['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'])}"

    # Số lượng địa chỉ: 1-4 (phân phối)
    num_addresses = random.choices([1, 2, 3, 4], weights=[0.35, 0.35, 0.2, 0.1])[0]

    addresses = []
    for i in range(num_addresses):
        coord_idx = (index + i * 13 + random.randint(0, 5)) % len(coords_list)
        addr = generate_address(i, coords_list[coord_idx], is_default=(i == 0))
        addresses.append(addr)

    # Ngày tháng
    created_at = datetime.now() - timedelta(days=random.randint(1, 730))
    updated_at = created_at + timedelta(
        days=random.randint(1, min(30, (datetime.now() - created_at).days))
    )
    last_login = (
        updated_at + timedelta(days=random.randint(0, 5))
        if random.random() > 0.2
        else None
    )

    # Status
    status = random.choices(
        ["active", "inactive", "banned"], weights=[0.8, 0.15, 0.05]
    )[0]

    customer_id = f"cust_{int(created_at.timestamp())}_{index:05d}"
    return {
        "customer_id": customer_id,
        "full_name": full_name,
        "phone_number": phone,
        "email": email,
        "password_hash": f"$2b$10${''.join(random.choices('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789./', k=53))}",
        "avatar_url": (
            f"https://picsum.photos/seed/cust-${customer_id}/200/200"
            if random.random() > 0.35
            else None
        ),
        "gender": random.choices(
            ["male", "female", "undisclosed"], weights=[0.48, 0.47, 0.05]
        )[0],
        "date_of_birth": (
            fake.date_of_birth(minimum_age=18, maximum_age=70)
            if random.random() > 0.15
            else None
        ),
        "status": status,
        "addresses": addresses,
        "created_at": created_at,
        "updated_at": updated_at,
        "last_login_at": last_login,
    }


# Tạo dữ liệu
num_records = len(df)
print(f"\nGenerating {num_records} customer records...")

documents = []
for i in range(num_records):
    doc = generate_customer(i)
    documents.append(doc)
    if (i + 1) % 500 == 0:
        print(f"  Progress: {i + 1}/{num_records}")

# Xuất file
output_file = "customers_insert.js"

with open(output_file, "w", encoding="utf-8") as f:
    f.write("// ============================================================\n")
    f.write("// MongoDB insert script - Customer Collection\n")
    f.write(f"// Total: {num_records} documents\n")
    f.write(f'// Generated: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}\n')
    f.write("// ============================================================\n\n")

    batch_size = 100
    for i in range(0, len(documents), batch_size):
        batch = documents[i : i + batch_size]
        f.write(f"// Batch {i//batch_size + 1}\n")
        f.write("db.Customer.insertMany([\n")
        for j, doc in enumerate(batch):
            json_str = json.dumps(doc, default=str, indent=2, ensure_ascii=False)
            f.write(json_str + (",\n" if j < len(batch) - 1 else "\n"))
        f.write("]);\n\n")
        print(f"  Batch {i//batch_size + 1} written")

# JSON output
json_output = "customers.json"
with open(json_output, "w", encoding="utf-8") as f:
    json.dump(documents, f, default=str, indent=2, ensure_ascii=False)

# Thống kê
total_addresses = sum(len(d["addresses"]) for d in documents)
active_users = sum(1 for d in documents if d["status"] == "active")
male = sum(1 for d in documents if d["gender"] == "male")
female = sum(1 for d in documents if d["gender"] == "female")

print(f"\n✅ Done! Generated {num_records} customers")
print(f"\n📊 Statistics:")
print(f"  📁 MongoDB script: {output_file}")
print(f"  📁 JSON file: {json_output}")
print(f"  👤 Total customers: {num_records}")
print(f"  📍 Total addresses: {total_addresses}")
print(f"  📊 Avg addresses/customer: {total_addresses/num_records:.2f}")
print(f"  ✅ Active users: {active_users} ({active_users/num_records*100:.1f}%)")
print(f"  👨 Male: {male} ({male/num_records*100:.1f}%)")
print(f"  👩 Female: {female} ({female/num_records*100:.1f}%)")
