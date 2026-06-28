export const RestaurantProfileSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'RestaurantProfile_Schema',
  description: 'Collection lưu trữ hồ sơ gốc của cửa hàng, tích hợp nhúng Thực đơn và Chỉ số',
  bsonType: 'object',
  required: [
    'restaurant_id',
    'basic_info',
    'brand_info',
    'operational_info',
    'legal_financial_info',
    'performance_metrics',
    'menu',
  ],
  properties: {
    restaurant_id: {
      bsonType: 'string',
      description: 'Mã định danh duy nhất của cửa hàng trên toàn hệ thống',
    },
    basic_info: {
      bsonType: 'object',
      description: 'Nhóm Định danh cơ bản & Vị trí',
      required: ['restaurant_name', 'phone_number', 'location'],
      properties: {
        restaurant_name: {
          bsonType: 'string',
          description: 'Tên quán - Món đặc trưng - Tên đường',
        },
        phone_number: { bsonType: 'string' },
        email_contact: { bsonType: 'string' },
        address: {
          bsonType: 'object',
          properties: {
            address_line: { bsonType: 'string' },
            ward: { bsonType: 'string' },
            city: { bsonType: 'string' },
          },
        },
        location: {
          bsonType: 'object',
          description: 'Định vị không gian GeoJSON (Chuyển đổi từ latitude/longitude gốc)',
          required: ['type', 'coordinates'],
          properties: {
            type: { enum: ['Point'] },
            coordinates: {
              bsonType: 'array',
              minItems: 2,
              maxItems: 2,
              items: { bsonType: 'double' },
              description: '[Kinh độ (Longitude), Vĩ độ (Latitude)]',
            },
          },
        },
      },
    },
    brand_info: {
      bsonType: 'object',
      description: 'Nhóm Thương hiệu & Hiển thị',
      properties: {
        avatar_url: { bsonType: 'string' },
        cover_photo_url: { bsonType: 'string' },
        front_store_image: { bsonType: 'string' },
        search_tags: {
          bsonType: 'array',
          items: { bsonType: 'string' },
          description: "Ví dụ: ['Cơm tấm', 'Giá rẻ']",
        },
        description: { bsonType: 'string' },
        slogan: { bsonType: 'string' },
        ranking_status: { enum: ['favorite', 'normal', 'new_partner'] },
      },
    },
    operational_info: {
      bsonType: 'object',
      description: 'Nhóm Vận hành & Logic điều phối',
      properties: {
        store_type: { enum: ['fnb', 'mart', 'fresh', 'street_food'] },
        operating_hours: {
          bsonType: 'array',
          description: 'Lịch hoạt động theo ngày',
          items: {
            bsonType: 'object',
            properties: {
              day_of_week: {
                enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
              },
              open_time: {
                bsonType: 'string',
                description: 'Format: HH:mm',
              },
              close_time: {
                bsonType: 'string',
                description: 'Format: HH:mm',
              },
            },
          },
        },
        is_open_now: {
          bsonType: 'bool',
          description: 'Cờ lưu trạng thái fallback. Khuyến nghị check realtime qua Redis.',
        },
        parking_fee: { bsonType: 'double' },
        estimated_delivery_time: {
          bsonType: 'int',
          description: 'Tính bằng phút',
        },
        status: { enum: ['active', 'inactive', 'pending_approval', 'banned'] },
      },
    },
    legal_financial_info: {
      bsonType: 'object',
      description: 'Nhóm Pháp lý & Tài chính (Dữ liệu nhạy cảm)',
      properties: {
        representative_name: { bsonType: 'string' },
        representative_role: { bsonType: 'string' },
        representative_email: { bsonType: 'string' },
        identity_number: { bsonType: 'string' },
        identity_front_img: { bsonType: 'string' },
        identity_back_img: { bsonType: 'string' },
        tax_id: { bsonType: 'string' },
        business_license_img: { bsonType: 'string' },
        bank_details: {
          bsonType: 'object',
          properties: {
            bank_name: { bsonType: 'string' },
            bank_branch: { bsonType: 'string' },
            bank_account_number: { bsonType: 'string' },
          },
        },
        commission_rate: { bsonType: 'double' },
        settlement_cycle: { enum: ['daily', 'weekly', 'bi_weekly', 'monthly'] },
      },
    },
    performance_metrics: {
      bsonType: 'object',
      description: 'Nhóm Chỉ số Xếp hạng & Hiệu suất (Cập nhật bởi Cron Job)',
      properties: {
        average_rating: {
          bsonType: 'double',
          minimum: 1,
          maximum: 5,
        },
        total_reviews: { bsonType: 'int' },
        is_favorite_partner: { bsonType: 'bool' },
        cancellation_rate: {
          bsonType: 'double',
          description: 'Tỷ lệ đơn hủy (%)',
        },
        fast_confirmation_rate: {
          bsonType: 'double',
          description: 'Tỷ lệ xác nhận nhanh (%)',
        },
        average_daily_orders: { bsonType: 'double' },
        ranking_history: {
          bsonType: 'array',
          description: 'Lưu lịch sử 5 tháng gần nhất',
          items: {
            bsonType: 'object',
            properties: {
              month_year: { bsonType: 'string' },
              achieved_favorite: { bsonType: 'bool' },
            },
          },
        },
        updated_at: { bsonType: 'date' },
      },
    },
    menu: {
      bsonType: 'object',
      description: 'Cấu trúc Thực đơn lồng ghép toàn phần',
      properties: {
        categories: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            properties: {
              category_id: { bsonType: 'string' },
              category_name: { bsonType: 'string' },
              display_order: { bsonType: 'int' },
              availability_schedule: { bsonType: 'array' },
              is_active: { bsonType: 'bool' },
              menu_items: {
                bsonType: 'array',
                description: 'Mảng Đa hình: Chứa cả Món ăn lẻ (Dish) và Combo',
                items: {
                  bsonType: 'object',
                  required: [
                    'item_id',
                    'item_type',
                    'name',
                    'base_price',
                    'status',
                  ],
                  properties: {
                    item_id: {
                      bsonType: 'string',
                      description: 'Tương đương dish_id hoặc combo_id',
                    },
                    item_type: { enum: ['dish', 'combo'] },
                    name: { bsonType: 'string' },
                    description: { bsonType: 'string' },
                    image_url: { bsonType: 'string' },
                    base_price: { bsonType: 'double' },
                    discount_price: { bsonType: 'double' },
                    status: {
                      enum: ['available', 'out_of_today', 'discontinued'],
                    },
                    label: {
                      enum: ['best_seller', 'new', 'signature', 'normal'],
                    },
                    parent_category: {
                      bsonType: 'string',
                      description: 'Chỉ dùng cho Combo để nhóm',
                    },
                    items_list: {
                      bsonType: 'array',
                      description: 'Chỉ dùng cho Combo: Chứa danh sách các dish_id con bên trong',
                    },
                  },
                },
              },
            },
          },
        },
        option_groups: {
          bsonType: 'array',
          description: 'Danh sách Tùy chọn & Topping',
          items: {
            bsonType: 'object',
            properties: {
              group_id: { bsonType: 'string' },
              option_group_name: { bsonType: 'string' },
              selection_type: { enum: ['radio', 'checkbox'] },
              is_required: { bsonType: 'bool' },
              topping_list: {
                bsonType: 'array',
                items: {
                  bsonType: 'object',
                  properties: {
                    name: { bsonType: 'string' },
                    extra_price: { bsonType: 'double' },
                    status: { enum: ['available', 'out_of_today'] },
                  },
                },
              },
              linked_entities: {
                bsonType: 'array',
                items: { bsonType: 'string' },
                description: 'Chứa danh sách item_id (Món hoặc Combo) được áp dụng Group này',
              },
            },
          },
        },
      },
    },
    created_at: { bsonType: 'date' },
    updated_at: { bsonType: 'date' },
  },
};
