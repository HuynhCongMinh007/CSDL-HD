import json
import random
from datetime import datetime, timedelta
from faker import Faker
import pandas as pd
import re

fake = Faker("vi_VN")

# Đọc file CSV
df = pd.read_csv("test.csv")

# Lọc các dòng có tọa độ hợp lệ (khác 0)
# Chuyển đổi cột sang numeric, coi giá trị không hợp lệ là NaN
df["Restaurant_latitude"] = pd.to_numeric(df["Restaurant_latitude"], errors="coerce")
df["Restaurant_longitude"] = pd.to_numeric(df["Restaurant_longitude"], errors="coerce")

# Lọc các dòng có tọa độ hợp lệ (không NaN và khác 0)
valid_df = df[
    (df["Restaurant_latitude"].notna())
    & (df["Restaurant_longitude"].notna())
    & (df["Restaurant_latitude"] != 0)
    & (df["Restaurant_longitude"] != 0)
    & (df["Restaurant_latitude"].abs() < 90)  # Vĩ độ hợp lệ
    & (df["Restaurant_longitude"].abs() < 180)  # Kinh độ hợp lệ
]

print(f"Total rows: {len(df)}")
print(f"Valid coordinate rows: {len(valid_df)}")

# Nếu không có dữ liệu hợp lệ, dùng fallback coordinates
if len(valid_df) == 0:
    print("No valid coordinates found. Using fallback coordinates in Vietnam range.")
    # Tạo fallback coordinates trong phạm vi Việt Nam
    fallback_coords = []
    for _ in range(len(df)):
        lat = 10.7 + random.uniform(0, 1.0)  # ~10.7-11.7
        lng = 106.6 + random.uniform(0, 0.8)  # ~106.6-107.4
        fallback_coords.append((lat, lng))
    coords_list = fallback_coords
else:
    coords_list = list(
        zip(
            valid_df["Restaurant_latitude"].values,
            valid_df["Restaurant_longitude"].values,
        )
    )


def generate_operating_hours():
    """Sinh giờ hoạt động ngẫu nhiên"""
    days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
    hours = []
    open_hour = random.randint(6, 11)
    close_hour = random.randint(20, 23)
    for day in days:
        if random.random() > 0.15:  # 85% các ngày mở cửa
            hours.append(
                {
                    "day_of_week": day,
                    "open_time": f"{open_hour:02d}:00",
                    "close_time": f"{close_hour:02d}:00",
                }
            )
    return (
        hours
        if hours
        else [{"day_of_week": "mon", "open_time": "08:00", "close_time": "22:00"}]
    )


def generate_menu(food_type):
    """
    Sinh menu với categories cố định theo loại thức ăn
    Topping list cố định theo food_type
    Các trường khác (items, giá, status, v.v.) được random
    """

    # Topping list cố định theo loại thức ăn
    TOPPING_MENU = {
        "Cơm": [
            "Trứng ốp la",
            "Chả trứng hấp",
            "Thịt kho",
            "Dưa chua",
            "Canh rau muống",
            "Canh chua cá",
        ],
        "Mì - Phở - Bún - Hủ tiếu": [
            "Giò heo",
            "Thịt bò tái",
            "Thịt gà xé",
            "Chả cá",
            "Trứng chần",
            "Rau sống",
            "Giá đỗ",
        ],
        "Cà phê": [
            "Kem tươi",
            "Sữa đặc",
            "Sữa tươi",
            "Bạc hà",
            "Caramel",
            "Socola",
        ],
        "Trà sữa": [
            "Trân châu đen",
            "Trân châu trắng",
            "Thạch phô mai",
            "Thạch trái cây",
            "Pudding trứng",
            "Kem cheese",
        ],
    }

    # Cấu trúc menu cố định theo loại thức ăn
    MENU_TEMPLATES = {
        "Cơm": {
            "categories": [
                {
                    "category_name": "Cơm phần",
                    "items": [
                        "Cơm tấm sườn bì chả",
                        "Cơm gà xối mỡ",
                        "Cơm chiên hải sản",
                        "Cơm bò lúc lắc",
                        "Cơm cá kho tộ",
                        "Cơm tay cầm",
                    ],
                },
                {
                    "category_name": "Món thêm",
                    "items": [
                        "Chả trứng hấp",
                        "Trứng ốp la",
                        "Dưa chua",
                        "Canh chua cá",
                        "Canh rau muống",
                        "Chả giò",
                    ],
                },
                {
                    "category_name": "Đồ uống",
                    "items": [
                        "Trà đá",
                        "Nước mía",
                        "Nước ngọt",
                        "Soda chanh",
                        "Cà phê sữa đá",
                        "Nước ép trái cây",
                    ],
                },
            ]
        },
        "Mì - Phở - Bún - Hủ tiếu": {
            "categories": [
                {
                    "category_name": "Mì",
                    "items": [
                        "Mì xào hải sản",
                        "Mì Quảng",
                        "Mì gói trứng",
                        "Mì vịt tiềm",
                        "Mì xào bò",
                        "Mì hoành thánh",
                    ],
                },
                {
                    "category_name": "Phở",
                    "items": [
                        "Phở bò tái chín",
                        "Phở gà",
                        "Phở thập cẩm",
                        "Phở sốt vang",
                        "Phở cuốn",
                        "Phở chua",
                    ],
                },
                {
                    "category_name": "Bún",
                    "items": [
                        "Bún bò Huế",
                        "Bún riêu cua",
                        "Bún chả Hà Nội",
                        "Bún thịt nướng",
                        "Bún mắm",
                        "Bún ốc",
                    ],
                },
                {
                    "category_name": "Hủ tiếu",
                    "items": [
                        "Hủ tiếu Nam Vang",
                        "Hủ tiếu bò kho",
                        "Hủ tiếu hải sản",
                        "Hủ tiếu sa tế",
                        "Hủ tiếu khô trộn",
                        "Hủ tiếu Mỹ Tho",
                    ],
                },
            ]
        },
        "Bánh mì": {
            "categories": [
                {
                    "category_name": "Bánh mì",
                    "items": [
                        "Bánh mì thịt nướng",
                        "Bánh mì chả lụa",
                        "Bánh mì xíu mại",
                        "Bánh mì gà xé",
                        "Bánh mì pate",
                        "Bánh mì cá hộp",
                    ],
                },
                {
                    "category_name": "Đồ uống",
                    "items": [
                        "Trà đá",
                        "Nước mía",
                        "Nước ngọt",
                        "Soda chanh",
                        "Cà phê sữa đá",
                        "Sinh tố",
                    ],
                },
            ]
        },
        "Cà phê": {
            "categories": [
                {
                    "category_name": "Cà phê phin",
                    "items": [
                        "Phin cà phê đen đá",
                        "Phin cà phê sữa đá",
                        "Phin bạc xỉu",
                        "Phin cà phê nóng",
                        "Phin cà phê muối",
                        "Phin cà phê sữa nóng",
                    ],
                },
                {
                    "category_name": "Cà phê máy",
                    "items": [
                        "Espresso",
                        "Americano",
                        "Cappuccino",
                        "Latte",
                        "Mocha",
                        "Caramel Macchiato",
                    ],
                },
                {
                    "category_name": "Trà",
                    "items": [
                        "Trà đào cam sả",
                        "Trà chanh mật ong",
                        "Trà sen vàng",
                        "Trà hoa cúc",
                        "Trà gừng",
                        "Trà ô long",
                    ],
                },
                {
                    "category_name": "Freeze",
                    "items": [
                        "Chocolate Freeze",
                        "Matcha Freeze",
                        "Caramel Freeze",
                        "Cookies & Cream Freeze",
                        "Mocha Freeze",
                        "Strawberry Freeze",
                    ],
                },
                {
                    "category_name": "Thức uống khác",
                    "items": [
                        "Nước ép cam",
                        "Nước ép dứa",
                        "Sinh tố xoài",
                        "Sinh tố bơ",
                        "Soda chanh dây",
                        "Nước ép cà rốt",
                    ],
                },
            ]
        },
        "Trà sữa": {
            "categories": [
                {
                    "category_name": "Trà sữa nền",
                    "items": [
                        "Trà sữa hồng trà",
                        "Trà sữa ô long",
                        "Trà sữa matcha",
                        "Trà sữa thái xanh",
                        "Trà sữa bạc hà",
                        "Trà sữa lài",
                    ],
                },
                {
                    "category_name": "Trà sữa topping",
                    "items": [
                        "Trà sữa trân châu đường đen",
                        "Trà sữa pudding trứng",
                        "Trà sữa thạch phô mai",
                        "Trà sữa trân châu trắng",
                        "Trà sữa kem cheese",
                        "Trà sữa bánh flan",
                    ],
                },
                {
                    "category_name": "Trà trái cây",
                    "items": [
                        "Trà đào cam sả",
                        "Trà vải hồng",
                        "Trà chanh dây",
                        "Trà táo bạc hà",
                        "Trà dâu tây",
                        "Trà đào chanh",
                    ],
                },
                {
                    "category_name": "Sữa tươi",
                    "items": [
                        "Sữa tươi trân châu đường đen",
                        "Sữa tươi kem cheese",
                        "Sữa tươi cacao",
                        "Sữa tươi matcha",
                        "Sữa tươi dâu",
                        "Sữa tươi lài",
                    ],
                },
                {
                    "category_name": "Milo & Matcha",
                    "items": [
                        "Milo dầm trân châu",
                        "Milo dầm kem cheese",
                        "Milo dầm bánh flan",
                        "Matcha latte nóng",
                        "Matcha latte đá",
                        "Matcha latte kem cheese",
                    ],
                },
            ]
        },
        "Lẩu - Nướng": {
            "categories": [
                {
                    "category_name": "Lẩu",
                    "items": [
                        "Lẩu thái chua cay",
                        "Lẩu bò nhúng dấm",
                        "Lẩu hải sản",
                        "Lẩu gà lá giang",
                        "Lẩu cá kèo",
                        "Lẩu mắm miền Tây",
                    ],
                },
                {
                    "category_name": "Nướng",
                    "items": [
                        "Thịt bò nướng ngói",
                        "Gà nướng mật ong",
                        "Hải sản nướng BBQ",
                        "Sườn nướng sa tế",
                        "Ba chỉ nướng Hàn Quốc",
                        "Tôm nướng muối ớt",
                    ],
                },
                {
                    "category_name": "Món ăn kèm",
                    "items": [
                        "Rau sống",
                        "Bún tươi",
                        "Bánh tráng nướng",
                        "Khoai lang chiên",
                        "Ngô chiên",
                        "Mì tôm",
                    ],
                },
                {
                    "category_name": "Đồ uống",
                    "items": [
                        "Trà đá",
                        "Nước ngọt",
                        "Bia",
                        "Rượu vang",
                        "Nước suối",
                        "Soda",
                    ],
                },
            ]
        },
        "Ăn vặt": {
            "categories": [
                {
                    "category_name": "Xiên que",
                    "items": [
                        "Xiên cá viên",
                        "Xiên bò viên",
                        "Xiên xúc xích",
                        "Xiên hồ lô",
                        "Xiên tôm viên",
                        "Xiên chả cá",
                    ],
                },
                {
                    "category_name": "Viên chiên",
                    "items": [
                        "Cá viên chiên",
                        "Bò viên chiên",
                        "Tôm viên chiên",
                        "Xúc xích chiên",
                        "Phô mai que",
                        "Khoai tây chiên",
                    ],
                },
                {
                    "category_name": "Bánh tráng",
                    "items": [
                        "Bánh tráng trộn",
                        "Bánh tráng nướng",
                        "Bánh tráng cuốn bơ",
                        "Bánh tráng me",
                        "Bánh tráng mắm ruốc",
                        "Bánh tráng sữa",
                    ],
                },
                {
                    "category_name": "Các món cuốn",
                    "items": [
                        "Gỏi cuốn tôm thịt",
                        "Nem cuốn",
                        "Cuốn diếp",
                        "Cuốn cá hồi",
                        "Cuốn bò lá lốt",
                        "Chả giò",
                    ],
                },
                {
                    "category_name": "Món khác",
                    "items": [
                        "Xoài lắc",
                        "Bắp xào",
                        "Chuối nướng nước cốt dừa",
                        "Trứng cút lộn xào me",
                        "Khoai lang chiên",
                        "Hạt dẻ nướng",
                    ],
                },
            ]
        },
        "Thức ăn nhanh": {
            "categories": [
                {
                    "category_name": "Pizza",
                    "items": [
                        "Pizza hải sản",
                        "Pizza phô mai",
                        "Pizza xúc xích",
                        "Pizza gà BBQ",
                        "Pizza bò bằm",
                        "Pizza chay",
                    ],
                },
                {
                    "category_name": "Burger",
                    "items": [
                        "Burger bò phô mai",
                        "Burger gà giòn",
                        "Burger cá",
                        "Burger tôm",
                        "Burger chay",
                        "Burger đặc biệt",
                    ],
                },
                {
                    "category_name": "Pasta",
                    "items": [
                        "Mì Ý sốt bò bằm",
                        "Mì Ý sốt kem nấm",
                        "Mì Ý sốt hải sản",
                        "Mì Ý sốt cà chua",
                        "Mì Ý sốt carbonara",
                        "Mì Ý sốt pesto",
                    ],
                },
                {
                    "category_name": "Gà rán",
                    "items": [
                        "Gà rán truyền thống",
                        "Gà rán sốt cay",
                        "Gà rán mật ong",
                        "Gà rán phô mai",
                        "Cánh gà chiên nước mắm",
                        "Đùi gà rán giòn",
                    ],
                },
                {
                    "category_name": "Món khác",
                    "items": [
                        "Khoai tây chiên",
                        "Hotdog",
                        "Sandwich",
                        "Salad gà",
                        "Bánh tart trứng",
                        "Nuggets gà",
                    ],
                },
            ]
        },
        "Nhậu": {
            "categories": [
                {
                    "category_name": "Món chính",
                    "items": [
                        "Cơm tấm sườn",
                        "Phở bò",
                        "Bún bò Huế",
                        "Cơm rang dương châu",
                        "Mì xào hải sản",
                        "Cơm gà xối mỡ",
                        "Bún chả",
                        "Cháo lòng",
                    ],
                },
                {
                    "category_name": "Khai vị",
                    "items": [
                        "Gỏi cuốn tôm thịt",
                        "Nem rán",
                        "Chả giò",
                        "Salad bò",
                        "Nộm hoa chuối",
                        "Súp cua",
                    ],
                },
                {
                    "category_name": "Đồ uống",
                    "items": [
                        "Trà đá",
                        "Cà phê đen",
                        "Cà phê sữa",
                        "Nước ép cam",
                        "Sinh tố xoài",
                        "Nước dừa",
                        "Soda chanh",
                    ],
                },
                {
                    "category_name": "Món tráng miệng",
                    "items": [
                        "Chè ba màu",
                        "Bánh flan",
                        "Kem dừa",
                        "Trái cây trộn",
                        "Sữa chua",
                        "Chè khúc bạch",
                    ],
                },
                {
                    "category_name": "Combo",
                    "items": [
                        "Combo cơm tấm + trà",
                        "Combo phở + nước ngọt",
                        "Combo bún bò + chè",
                        "Combo mì xào + trà đá",
                        "Combo gỏi cuốn + kem",
                    ],
                },
            ]
        },
    }

    # Lấy template theo loại thức ăn, nếu không có thì dùng template mặc định
    template = MENU_TEMPLATES.get(food_type, MENU_TEMPLATES["Cơm"])

    menu_categories = []
    for i, cat_template in enumerate(template["categories"]):
        cat_name = cat_template["category_name"]
        item_names = cat_template["items"]

        # Random số lượng món trong category (2 đến số lượng có sẵn)
        num_items = random.randint(2, min(6, len(item_names)))
        selected_items = random.sample(item_names, num_items)

        items = []
        for j, item_name in enumerate(selected_items):
            base_price = random.randint(15000, 200000)

            # Random item_type: combo thường chỉ ở category Combo hoặc random 20%
            if cat_name == "Combo" or (j == 0 and random.random() > 0.8):
                item_type = "combo"
            else:
                item_type = "dish"

            item_id = f"item_{i}_{j}_{random.randint(10000, 99999)}"
            items.append(
                {
                    "item_id": item_id,
                    "item_type": item_type,
                    "name": item_name,
                    "description": (
                        fake.sentence(nb_words=5) if random.random() > 0.3 else None
                    ),
                    "image_url": (
                        f"https://picsum.photos/seed/dish-${item_id}/400/300"
                        if random.random() > 0.3
                        else None
                    ),
                    "base_price": float(base_price),
                    "discount_price": (
                        float(base_price * random.uniform(0.7, 0.95))
                        if random.random() > 0.5
                        else None
                    ),
                    "status": random.choices(
                        [
                            "available",
                            "available",
                            "available",
                            "out_of_today",
                            "discontinued",
                        ],
                        weights=[0.7, 0.1, 0.1, 0.05, 0.05],
                    )[0],
                    "label": random.choices(
                        [
                            "best_seller",
                            "new",
                            "signature",
                            "normal",
                            "normal",
                            "normal",
                        ],
                        weights=[0.2, 0.1, 0.1, 0.3, 0.15, 0.15],
                    )[0],
                    "parent_category": cat_name if item_type == "combo" else None,
                    "items_list": (
                        [
                            f"item_{i}_{k}_{random.randint(10000,99999)}"
                            for k in range(random.randint(1, 3))
                        ]
                        if item_type == "combo"
                        else []
                    ),
                }
            )

        menu_categories.append(
            {
                "category_id": f"cat_{i}_{random.randint(10000, 99999)}",
                "category_name": cat_name,
                "display_order": i,
                "availability_schedule": (
                    random.sample(
                        ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
                        k=random.randint(3, 7),
                    )
                    if random.random() > 0.2
                    else ["mon", "tue", "wed", "thu", "fri"]
                ),
                "is_active": (
                    random.choice([True, True, True, False])
                    if random.random() > 0.15
                    else True
                ),
                "menu_items": items,
            }
        )

    # Tạo option groups với topping list cố định theo food_type
    option_groups = []

    # Lấy topping list cho food_type, nếu không có thì dùng topping mặc định
    toppings = TOPPING_MENU.get(food_type, TOPPING_MENU["Cơm"])

    # Random số lượng topping (2 đến 4)
    num_toppings = random.randint(2, min(4, len(toppings)))
    selected_toppings = random.sample(toppings, num_toppings)

    # Random số lượng option groups (0-2)
    num_groups = random.choices([0, 1, 2], weights=[0.3, 0.5, 0.2])[0]

    for g in range(num_groups):
        topping_list = []
        for topping_name in selected_toppings:
            topping_list.append(
                {
                    "name": topping_name,
                    "extra_price": float(random.randint(3000, 15000)),
                    "status": random.choices(
                        ["available", "available", "out_of_today"],
                        weights=[0.8, 0.1, 0.1],
                    )[0],
                }
            )

        option_groups.append(
            {
                "group_id": f"opt_{g}_{random.randint(10000, 99999)}",
                "option_group_name": random.choice(["Topping", "Thêm món", "Gia vị"]),
                "selection_type": random.choice(["radio", "checkbox"]),
                "is_required": random.choice([True, False]),
                "topping_list": topping_list,
                "linked_entities": [],
            }
        )

    return {"categories": menu_categories, "option_groups": option_groups}


def generate_restaurant_document(index, coords):
    """Tạo 1 document restaurant profile"""
    lat, lng = coords

    # Tạo tên nhà hàng
    restaurant_types = ["Quán", "Nhà hàng", "Cửa hàng", "Tiệm", "Food House"]
    food_types = [
        "Cơm tấm",
        "Mì - Phở - Bún - Hủ tiếu",
        "Bánh mì",
        "Cà phê",
        "Trà sữa",
        "Lẩu - Nướng",
        "Ăn vặt",
        "Thức ăn nhanh",
        "Nhậu",
    ]
    street_names = [
        "Nguyễn Trãi",
        "Lê Lợi",
        "Trần Hưng Đạo",
        "Phạm Ngũ Lão",
        "Nguyễn Huệ",
        "Hai Bà Trưng",
        "Võ Văn Tần",
        "Lý Tự Trọng",
    ]

    food_type = random.choice(food_types)
    restaurant_name = (
        f"{random.choice(restaurant_types)} {food_type} {random.choice(street_names)}"
    )

    # Tạo restaurant_id
    timestamp = int(datetime.now().timestamp()) - random.randint(0, 86400 * 365)

    restaurant_id = f"rest_{timestamp}_{index:05d}"
    doc = {
        "restaurant_id": restaurant_id,
        "basic_info": {
            "restaurant_name": restaurant_name,
            "phone_number": fake.phone_number(),
            "email_contact": fake.email(),
            "address": {
                "address_line": fake.street_address(),
                "ward": f"Phường {random.randint(1, 25)}",
                "city": f"Quận {random.randint(1, 12)}",
            },
            "location": {"type": "Point", "coordinates": [float(lng), float(lat)]},
        },
        "brand_info": {
            "avatar_url": f"https://picsum.photos/seed/rest-${restaurant_id}/200/200",
            "cover_photo_url": f"https://picsum.photos/seed/rest-${restaurant_id}/1200/400",
            "front_store_image": f"https://picsum.photos/seed/rest-${restaurant_id}/600/400",
            "search_tags": random.sample(
                [
                    "Ăn vặt",
                    "Giá rẻ",
                    "Món ngon",
                    "Đặc sản",
                    "Gần đây",
                    "Nổi tiếng",
                    "Quán cũ",
                    "Sạch sẽ",
                    "Phục vụ nhanh",
                ],
                k=random.randint(2, 4),
            ),
            "description": fake.paragraph(nb_sentences=2),
            "slogan": random.choice(
                [
                    "Ngon - Bổ - Rẻ",
                    "Chất lượng hàng đầu",
                    "Hương vị truyền thống",
                    "Tươi ngon mỗi ngày",
                    "Đậm đà hương vị",
                    "Ăn là ghiền",
                ]
            ),
            "ranking_status": random.choice(["favorite", "normal", "new_partner"]),
        },
        "operational_info": {
            "store_type": random.choice(["fnb", "mart", "fresh", "street_food"]),
            "operating_hours": generate_operating_hours(),
            "is_open_now": random.choice([True, False]),
            "parking_fee": random.choice([0, 5000, 10000, 15000, 20000]),
            "estimated_delivery_time": random.randint(15, 50),
            "status": random.choice(
                ["active", "active", "active", "inactive", "pending_approval"]
            ),
        },
        "legal_financial_info": {
            "representative_name": fake.name(),
            "representative_role": random.choice(
                ["CEO", "Manager", "Owner", "Director"]
            ),
            "representative_email": fake.email(),
            "identity_number": f"{random.randint(100000000, 999999999)}",
            "identity_front_img": f"https://picsum.photos/seed/rest-${restaurant_id}/400/300",
            "identity_back_img": f"https://picsum.photos/seed/rest-${restaurant_id}/400/300",
            "tax_id": f"{random.randint(1000000000, 9999999999)}",
            "business_license_img": f"https://picsum.photos/seed/rest-${restaurant_id}/400/300",
            "bank_details": {
                "bank_name": random.choice(
                    [
                        "Vietcombank",
                        "Techcombank",
                        "MB Bank",
                        "VPBank",
                        "Sacombank",
                        "ACB",
                        "BIDV",
                    ]
                ),
                "bank_branch": f"Chi nhánh {random.choice(['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ'])}",
                "bank_account_number": f"{random.randint(100000000, 999999999)}",
            },
            "commission_rate": float(
                random.choice([0.05, 0.08, 0.1, 0.12, 0.15, 0.18])
            ),
            "settlement_cycle": random.choice(
                ["daily", "weekly", "bi_weekly", "monthly"]
            ),
        },
        "performance_metrics": {
            "average_rating": float(round(random.uniform(2.5, 5.0), 1)),
            "total_reviews": random.randint(5, 5000),
            "is_favorite_partner": random.choice([True, False]),
            "cancellation_rate": float(round(random.uniform(0, 0.15), 2)),
            "fast_confirmation_rate": float(round(random.uniform(0.6, 0.98), 2)),
            "average_daily_orders": float(round(random.uniform(3, 150), 0)),
            "ranking_history": [
                {
                    "month_year": f"{random.randint(2024, 2026)}-{str(random.randint(1,12)).zfill(2)}",
                    "achieved_favorite": random.choice([True, False]),
                }
                for _ in range(random.randint(0, 5))
            ],
            "updated_at": datetime.now() - timedelta(days=random.randint(1, 30)),
        },
        "menu": generate_menu(food_type),
        "created_at": datetime.now() - timedelta(days=random.randint(30, 730)),
        "updated_at": datetime.now() - timedelta(days=random.randint(1, 30)),
    }

    return doc


# Tạo dữ liệu cho số lượng dòng trong file
num_records = len(df)
print(f"Generating {num_records} records...")

# Nếu có ít tọa độ hơn số dòng, lặp lại
if len(coords_list) < num_records:
    # Mở rộng danh sách tọa độ bằng cách lặp lại
    while len(coords_list) < num_records:
        coords_list.extend(coords_list[: num_records - len(coords_list)])
    coords_list = coords_list[:num_records]

documents = []
for i in range(num_records):
    doc = generate_restaurant_document(i, coords_list[i % len(coords_list)])
    documents.append(doc)

    if (i + 1) % 500 == 0:
        print(f"Generated {i + 1}/{num_records} records...")

# Xuất ra file JS với câu lệnh MongoDB
output_file = "restaurant_profiles_insert.js"

with open(output_file, "w", encoding="utf-8") as f:
    f.write("// ============================================================\n")
    f.write("// Auto-generated MongoDB insert script\n")
    f.write(f"// Total: {num_records} documents\n")
    f.write("// Generated at: " + datetime.now().strftime("%Y-%m-%d %H:%M:%S") + "\n")
    f.write("// ============================================================\n\n")

    # Ghi thành từng batch để tránh quá tải
    batch_size = 100
    for i in range(0, len(documents), batch_size):
        batch = documents[i : i + batch_size]
        f.write(
            f"// Batch {i//batch_size + 1}: documents {i+1} to {min(i+batch_size, len(documents))}\n"
        )
        f.write("db.Restaurant.insertMany([\n")
        for j, doc in enumerate(batch):
            json_str = json.dumps(doc, default=str, indent=2, ensure_ascii=False)
            # Thêm dấu phẩy nếu không phải document cuối cùng trong batch
            if j < len(batch) - 1:
                f.write(json_str + ",\n")
            else:
                f.write(json_str + "\n")
        f.write("]);\n\n")

        print(
            f"Batch {i//batch_size + 1}/{((len(documents)-1)//batch_size + 1)} completed"
        )

# Xuất thêm file JSON để dễ import
json_output = "restaurant_profiles.json"
with open(json_output, "w", encoding="utf-8") as f:
    json.dump(documents, f, default=str, indent=2, ensure_ascii=False)

print(f"\n✅ Generated {num_records} documents")
print(f"📁 MongoDB script: {output_file}")
print(f"📁 JSON file: {json_output}")

# In thống kê
print("\n📊 Statistics:")
print(f"  - Total restaurants: {num_records}")
print(f"  - Valid coordinates used: {len(set(coords_list))}")
print(
    f"  - Average menu categories: {sum(len(d['menu']['categories']) for d in documents[:100]) / min(100, len(documents)):.1f}"
)
