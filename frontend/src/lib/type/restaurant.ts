export interface TopDish {
  dish_id: string;
  dish_name: string;
  sales: number;
  image_url?: string;
  base_price?: number;
  discount_price?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface RestaurantProfile {
  restaurant_id: string;
  basic_info: {
    restaurant_name: string;
    phone_number: string;
    email_contact: string;
    address: {
      address_line: string;
      ward: string;
      city: string;
    };
  };
  brand_info: {
    avatar_url: string;
    cover_photo_url: string;
    front_store_image: string;
    search_tags: string[];
    description: string;
    slogan: string;
    ranking_status: string;
  };
  operational_info: {
    store_type: string;
    is_open_now: boolean;
    parking_fee: number;
    estimated_delivery_time: number;
    status: string;
  };
  performance_metrics: {
    average_rating: number;
    total_reviews: number;
    is_favorite_partner: boolean;
  };
}

export interface MenuItem {
  item_id: string;
  item_type: string;
  name: string;
  description: string;
  image_url: string;
  base_price: number;
  discount_price: number;
  status: string;
  label: string;
}

export interface MenuCategory {
  category_id: string;
  category_name: string;
  display_order: number;
  is_active: boolean;
  menu_items: MenuItem[];
}

export interface RestaurantMenu {
  categories: MenuCategory[];
}
