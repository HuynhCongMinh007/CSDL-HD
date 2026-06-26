import { RestaurantService } from '../../../lib/service/restaurant.service';
import RestaurantMenuClient from './menu-rest';

async function getRestaurantData() {
  const targetId = 'res_mocchau_001';

  try {
    const [profileRes, menuRes, topDishesRes] = await Promise.all([
      RestaurantService.getProfile(targetId),
      RestaurantService.getMenu(targetId),
      RestaurantService.getTopDishes(targetId)
    ]);

    return {
      profile: profileRes?.data || null,
      menu: menuRes?.data || null,
      topDishes: topDishesRes?.data || []
    };
  } catch (error) {
    console.error("Fetch error:", error);
    return { profile: null, menu: null, topDishes: [] };
  }
}

export default async function RestaurantPage() {
  const data = await getRestaurantData();

  if (!data.profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-red-500 font-medium">
        Không tìm thấy nhà hàng hoặc lỗi kết nối (Backend không phản hồi).
      </div>
    );
  }

  return (
    <RestaurantMenuClient
      profile={data.profile}
      menu={data.menu}
      topDishes={data.topDishes}
    />
  );
}
