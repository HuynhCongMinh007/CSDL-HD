export const OrderSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Order_Schema',
  description: 'Collection lưu trữ thông tin đơn hàng của khách hàng',
  bsonType: 'object',
  required: [
    'customer_id',
    'restaurant_id',
    'items',
    'subtotal',
    'delivery_fee',
    'total_amount',
    'delivery_address',
    'payment_method',
    'status',
    'created_at',
  ],
  properties: {
    _id: {
      bsonType: 'objectId',
      description: 'Mã định danh duy nhất của đơn hàng',
    },
    customer_id: {
      bsonType: 'objectId',
      description: 'Tham chiếu đến khách hàng đặt đơn',
    },
    restaurant_id: {
      bsonType: 'objectId',
      description: 'Tham chiếu đến cửa hàng',
    },
    driver_id: {
      bsonType: ['objectId', 'null'],
      description: 'Tài xế được phân công giao hàng',
    },
    items: {
      bsonType: 'array',
      description: 'Danh sách món ăn trong đơn hàng (lưu snapshot thông tin món tại thời điểm đặt)',
      minItems: 1,
      items: {
        bsonType: 'object',
        required: ['item_id', 'name', 'quantity', 'price_at_order'],
        properties: {
          item_id: {
            bsonType: 'objectId',
            description: 'ID của món ăn hoặc combo',
          },
          name: {
            bsonType: 'string',
            description: 'Tên món ăn tại thời điểm đặt',
          },
          quantity: {
            bsonType: 'int',
            minimum: 1,
            description: 'Số lượng món',
          },
          price_at_order: {
            bsonType: 'double',
            minimum: 0,
            description: 'Giá món tại thời điểm đặt',
          },
          notes: {
            bsonType: 'string',
            description: "Ghi chú cho món (Ví dụ: 'Không hành')",
          },
          options: {
            bsonType: 'array',
            description: 'Danh sách Topping chọn kèm',
            items: {
              bsonType: 'object',
              properties: {
                name: {
                  bsonType: 'string',
                  description: 'Tên topping',
                },
                price: {
                  bsonType: 'double',
                  minimum: 0,
                  description: 'Giá topping',
                },
              },
            },
          },
        },
      },
    },
    subtotal: {
      bsonType: 'double',
      minimum: 0,
      description: 'Tổng tiền món ăn trước phí và giảm giá',
    },
    delivery_fee: {
      bsonType: 'double',
      minimum: 0,
      description: 'Phí giao hàng',
    },
    discount_amount: {
      bsonType: 'double',
      minimum: 0,
      description: 'Tổng giá trị khuyến mãi được áp dụng',
    },
    total_amount: {
      bsonType: 'double',
      minimum: 0,
      description: 'Tổng tiền thanh toán cuối cùng',
    },
    voucher_code: {
      bsonType: 'array',
      description: 'Mảng các mã giảm giá sử dụng cho đơn hàng',
      items: {
        bsonType: 'object',
        properties: {
          code: {
            bsonType: 'string',
            description: 'Mã giảm giá',
          },
          type: {
            bsonType: 'string',
            enum: ['percentage', 'fixed', 'shipping'],
            description: 'Loại voucher: percentage (%), fixed (giá trị cố định), shipping (miễn phí ship)',
          },
          discount_value: {
            bsonType: 'double',
            minimum: 0,
            description: 'Giá trị giảm',
          },
        },
      },
    },
    delivery_address: {
      bsonType: 'object',
      description: 'Thông tin địa chỉ giao hàng được lưu dưới dạng snapshot',
      required: ['address_line', 'ward', 'city'],
      properties: {
        address_line: {
          bsonType: 'string',
          description: 'Địa chỉ chi tiết (số nhà, tên đường)',
        },
        ward: {
          bsonType: 'string',
          description: 'Phường/Xã',
        },
        city: {
          bsonType: 'string',
          description: 'Thành phố/Quận',
        },
        location: {
          bsonType: 'object',
          description: 'Định vị không gian GeoJSON (Tọa độ giao hàng)',
          properties: {
            type: {
              enum: ['Point'],
            },
            coordinates: {
              bsonType: 'array',
              minItems: 2,
              maxItems: 2,
              items: {
                bsonType: 'double',
              },
              description: '[Kinh độ (Longitude), Vĩ độ (Latitude)]',
            },
          },
        },
        receiver_name: {
          bsonType: 'string',
          description: 'Tên người nhận',
        },
        receiver_phone: {
          bsonType: 'string',
          description: 'Số điện thoại người nhận',
        },
      },
    },
    payment_method: {
      bsonType: 'string',
      enum: ['cash', 'bank_transfer', 'e_wallet', 'credit_card'],
      description: 'Phương thức thanh toán',
    },
    payment_status: {
      bsonType: 'string',
      enum: ['pending', 'paid', 'failed', 'refunded'],
      description: 'Trạng thái thanh toán',
    },
    status: {
      bsonType: 'string',
      enum: [
        'pending',
        'confirmed',
        'preparing',
        'waiting_driver',
        'delivering',
        'completed',
        'cancelled',
      ],
      description: 'Trạng thái hiện tại của đơn hàng',
    },
    cancel_reason: {
      bsonType: ['string', 'null'],
      description: 'Lý do hủy đơn (nếu có)',
    },
    cancelled_by: {
      bsonType: ['string', 'null'],
      enum: ['customer', 'merchant', 'driver', 'system', null],
      description: 'Đối tượng thực hiện hủy đơn',
    },
    created_at: {
      bsonType: 'date',
      description: 'Thời điểm tạo đơn',
    },
    estimated_delivery_time: {
      bsonType: 'date',
      description: 'Thời gian giao hàng dự kiến',
    },
    actual_delivery_time: {
      bsonType: ['date', 'null'],
      description: 'Thời gian giao hàng thực tế',
    },
    note: {
      bsonType: 'string',
      description: 'Ghi chú từ khách hàng',
    },
    status_log: {
      bsonType: 'array',
      description: 'Lịch sử thay đổi trạng thái đơn hàng',
      items: {
        bsonType: 'object',
        required: ['status', 'changed_at', 'performed_by'],
        properties: {
          status: {
            bsonType: 'string',
            enum: [
                'pending',
                'confirmed',
                'preparing',
                'waiting_driver',
                'delivering',
                'completed',
                'cancelled',
            ],
            description: 'Trạng thái chuyển đổi',
          },
          changed_at: {
            bsonType: 'date',
            description: 'Thời điểm ghi nhận hệ thống',
          },
          performed_by: {
            bsonType: 'string',
            enum: ['customer', 'merchant', 'driver', 'system'],
            description: 'Định danh Actor thực hiện hành động',
          },
          note: {
            bsonType: 'string',
            description: 'Ghi chú thêm cho lần chuyển trạng thái',
          },
        },
      },
    },
    updated_at: {
      bsonType: 'date',
      description: 'Thời điểm cập nhật cuối cùng của đơn hàng',
    },
  },
};
