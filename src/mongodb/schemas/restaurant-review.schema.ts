export const RestaurantReviewSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Review_Schema',
  description: 'Collection độc lập lưu trữ đánh giá vô hạn của khách hàng dành cho Quán và Món ăn',
  bsonType: 'object',
  required: [
    'review_id',
    'review_type',
    'order_id',
    'customer_id',
    'restaurant_id',
    'rating_star',
    'created_at',
  ],
  properties: {
    review_id: {
      bsonType: 'string',
      description: 'Mã định danh duy nhất của lượt đánh giá',
    },
    review_type: {
      enum: ['restaurant', 'dish'],
      description: "Đa hình: Xác định đây là đánh giá chung cho quán hay cho một món ăn cụ thể",
    },
    order_id: {
      bsonType: 'string',
      description: 'Mã định danh đơn hàng phát sinh đánh giá',
    },
    restaurant_id: {
      bsonType: 'string',
      description: 'Khóa tham chiếu đến Collection restaurants',
    },
    customer_id: {
      bsonType: 'string',
      description: 'Mã định danh của khách hàng',
    },
    dish_id: {
      bsonType: 'string',
      description: "Khóa tham chiếu đến Món ăn. BẮT BUỘC có dữ liệu nếu review_type là 'dish'",
    },
    rating_star: {
      bsonType: 'int',
      minimum: 1,
      maximum: 5,
      description: 'Thang điểm chất lượng từ 1 đến 5 sao',
    },
    comment: {
      bsonType: 'string',
      description: 'Nội dung nhận xét của khách',
    },
    attached_media: {
      bsonType: 'array',
      items: { bsonType: 'string' },
      description: 'Danh sách URL hình ảnh/video đính kèm',
    },
    merchant_reply: {
      bsonType: 'string',
      description: 'Nội dung chủ quán phản hồi',
    },
    replied_at: {
      bsonType: 'date',
      description: 'Thời điểm chủ quán gửi phản hồi',
    },
    status: {
      enum: ['published', 'hidden', 'reported_by_merchant'],
      description: 'Trạng thái hiển thị, phục vụ luồng khiếu nại đánh giá sai sự thật',
    },
    created_at: {
      bsonType: 'date',
      description: 'Thời điểm khách hàng gửi đánh giá',
    },
  },
};
