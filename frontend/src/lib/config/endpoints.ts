export const ENDPOINTS = {
  RESTAURANT: {
    PROFILE: (restaurantId: string) => `/restaurant/${restaurantId}/profile`,
    MENU: (restaurantId: string) => `/restaurant/${restaurantId}/menu`,
    TOP_DISHES: (restaurantId: string) => `/restaurant/${restaurantId}/top-dishes`,
  },
};
