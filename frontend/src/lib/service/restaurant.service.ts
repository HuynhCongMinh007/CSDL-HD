import { api } from '../../../lib/api';
import { ApiResponse, TopDish } from '../type/restaurant';
import { ENDPOINTS } from '../config/endpoints';

export const RestaurantService = {
  getProfile: async (restaurantId: string): Promise<ApiResponse<any>> => {
    return await api.get<ApiResponse<any>>(ENDPOINTS.RESTAURANT.PROFILE(restaurantId));
  },

  getMenu: async (restaurantId: string): Promise<ApiResponse<any>> => {
    return await api.get<ApiResponse<any>>(ENDPOINTS.RESTAURANT.MENU(restaurantId));
  },

  getTopDishes: async (restaurantId: string): Promise<ApiResponse<TopDish[]>> => {

    const result = await api.get<ApiResponse<TopDish[]>>(ENDPOINTS.RESTAURANT.TOP_DISHES(restaurantId));
    return result;
  }
};
