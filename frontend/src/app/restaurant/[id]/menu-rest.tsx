"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Search, Heart, Share2, Star, Clock, Plus, Check } from 'lucide-react';
import { TopDish, RestaurantProfile, RestaurantMenu, MenuCategory, MenuItem } from '../../../lib/type/restaurant';

interface RestaurantMenuClientProps {
  profile: RestaurantProfile;
  menu: RestaurantMenu;
  topDishes: TopDish[];
}

export default function RestaurantMenuClient({ profile, menu, topDishes }: RestaurantMenuClientProps) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>(
    menu?.categories?.[0]?.category_id || ''
  );

  const { basic_info, brand_info, performance_metrics } = profile;

  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const scrollToCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    const element = document.getElementById(categoryId);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 120; // offset for sticky header
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 overflow-x-hidden font-sans">
      <div className="max-w-6xl mx-auto bg-white min-h-screen shadow-2xl relative sm:border-x sm:border-slate-200">

        {/* Header Image & Actions */}
        <div className="relative h-64 md:h-96 w-full bg-slate-200">
          <img
            src={brand_info?.cover_photo_url}
            alt={basic_info?.restaurant_name}
            className="w-full h-full object-cover"
          />
          {/* Top actions */}
          <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent pt-6 md:pt-8">
            <button onClick={() => router.back()} className="p-2 md:p-3 bg-black/40 hover:bg-black/60 transition-colors rounded-full text-white backdrop-blur-md">
              <ChevronLeft size={24} />
            </button>
            <div className="flex gap-3 md:gap-4">
              <button className="p-2 md:p-3 bg-black/40 hover:bg-black/60 transition-colors rounded-full text-white backdrop-blur-md"><Search size={20} /></button>
              <button className="p-2 md:p-3 bg-black/40 hover:bg-black/60 transition-colors rounded-full text-white backdrop-blur-md"><Heart size={20} /></button>
              <button className="p-2 md:p-3 bg-black/40 hover:bg-black/60 transition-colors rounded-full text-white backdrop-blur-md"><Share2 size={20} /></button>
            </div>
          </div>
        </div>

        {/* Info Card - Overlapping the image */}
        <div className="relative -mt-16 md:-mt-24 mx-4 md:mx-8 bg-white rounded-2xl shadow-lg border border-slate-100 p-5 md:p-8 z-10">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              {performance_metrics?.is_favorite_partner && (
                <div className="inline-flex items-center gap-1 bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded mb-3 shadow-sm">
                  <Check size={14} strokeWidth={3} /> Yêu thích
                </div>
              )}
              <h1 className="text-2xl md:text-4xl font-extrabold leading-tight mb-3 text-slate-800">{basic_info?.restaurant_name}</h1>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm md:text-base text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Star className="text-yellow-400 fill-yellow-400" size={18} />
                  <span className="font-semibold text-slate-900">{performance_metrics?.average_rating}</span>
                  <span>({performance_metrics?.total_reviews > 999 ? '999+' : performance_metrics?.total_reviews} Bình luận)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={18} />
                  <span>{profile?.operational_info?.estimated_delivery_time || 20} phút</span>
                </div>
              </div>
            </div>
            {/* Desktop right side promos */}
            <div className="hidden md:flex flex-col gap-2 min-w-[250px]">
              <div className="text-sm font-semibold text-slate-700">Ưu đãi hôm nay:</div>
              <div className="flex flex-wrap gap-2">
                {['Giảm 50%', 'Đơn từ 55k', 'Freeship'].map((promo, idx) => (
                  <span key={idx} className="border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-medium px-2.5 py-1.5 rounded-md">
                    {promo}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Promos for Mobile Only */}
        <div className="mt-4 px-4 py-3 bg-white md:hidden">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-emerald-600 text-sm">🛵</span>
            <span className="text-sm font-medium">Giao ngay</span>
            <span className="text-[13px] text-slate-500 ml-2">Dự kiến 21:15</span>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-red-500 text-sm font-bold">🏵️</span>
            <span className="text-sm font-medium">Ưu đãi cho bạn</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {['Giảm 50%', 'Đơn từ 55k', 'Freeship', 'Giảm 20k'].map((promo, idx) => (
              <div key={idx} className="shrink-0 border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs px-2 py-1 rounded">
                {promo}
              </div>
            ))}
          </div>
        </div>

        {/* Top Dishes (Món phổ biến) */}
        {topDishes && topDishes.length > 0 && (
          <div className="mt-4 md:mt-8 bg-white pt-4 pb-6 md:px-4">
            <h2 className="text-lg md:text-2xl font-bold text-slate-800 px-4 md:px-4 mb-4">Món phổ biến</h2>
            <div className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide">
              {topDishes.slice(0, 6).map((dish: TopDish, idx: number) => {
                let dishName = dish.dish_name;
                let soldCount = dish.sales;

                return (
                  <div key={idx} className="shrink-0 w-[140px] md:w-[180px] group cursor-pointer border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="relative h-28 md:h-36 bg-slate-200 overflow-hidden">
                      <img src={dish.image_url || `https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=400&fit=crop&q=80`} alt={dishName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute top-0 left-0 bg-yellow-400 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-br-lg shadow-sm">
                        {soldCount} đã bán
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm md:text-base font-medium line-clamp-2 leading-snug h-[40px] md:h-[48px] text-slate-700 group-hover:text-emerald-600 transition-colors">{dishName}</h3>
                      <div className="mt-3 flex justify-between items-center">
                        <span className="text-sm md:text-base font-bold text-emerald-600">{formatPrice(dish.discount_price || dish.base_price || 45000)}</span>
                        <button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg p-1.5 md:p-2 shadow-sm transition-colors"><Plus size={16} /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sticky Category Tabs */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-y border-slate-200 flex overflow-x-auto scrollbar-hide mt-4 md:mt-6 shadow-sm px-2 md:px-6">
          {menu?.categories?.map((cat: MenuCategory) => (
            <button
              key={cat.category_id}
              onClick={() => scrollToCategory(cat.category_id)}
              className={`shrink-0 px-4 md:px-6 py-4 text-sm md:text-base font-medium whitespace-nowrap border-b-2 transition-all ${activeCategory === cat.category_id ? 'border-emerald-600 text-emerald-600 font-bold' : 'border-transparent text-slate-600 hover:text-emerald-500'
                }`}
            >
              {cat.category_name}
            </button>
          ))}
        </div>

        {/* Menu Categories */}
        <div className="bg-white px-4 md:px-8 pb-12">
          {menu?.categories?.map((cat: MenuCategory) => (
            <div key={cat.category_id} id={cat.category_id} className="pt-8 pb-4 scroll-mt-28">
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-6">{cat.category_name} <span className="font-normal text-slate-400 text-base md:text-lg ml-2">({cat.menu_items?.length || 0})</span></h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6">
                {cat.menu_items?.map((item: MenuItem) => (
                  <div key={item.item_id} className="flex gap-4 p-3 md:p-4 border border-slate-100 rounded-2xl hover:shadow-md transition-shadow bg-white group cursor-pointer">
                    <div className="w-[100px] h-[100px] md:w-[120px] md:h-[120px] shrink-0 bg-slate-100 rounded-xl overflow-hidden relative shadow-inner">
                      <img src={item.image_url || "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300&h=300&fit=crop"} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      {item.label === 'best_seller' && (
                        <div className="absolute top-0 left-0 bg-red-500 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-br-lg">Yêu thích</div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col py-1">
                      <h3 className="font-bold text-slate-800 text-base md:text-lg leading-tight group-hover:text-emerald-600 transition-colors">{item.name}</h3>
                      <div className="text-xs md:text-sm text-slate-500 mt-1.5 line-clamp-2">{item.description || 'Món ăn hương vị thơm ngon tuyệt hảo được tuyển chọn kỹ lưỡng.'}</div>
                      <div className="text-[11px] md:text-xs text-slate-400 mt-2 font-medium">100+ đã bán | 2 lượt thích</div>
                      <div className="mt-auto pt-3 flex justify-between items-center">
                        <span className="font-extrabold text-emerald-600 text-base md:text-lg">{formatPrice(item.base_price)}</span>
                        {item.status === 'available' ? (
                          <button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg p-2 transition-colors shadow-sm active:scale-95">
                            <Plus size={18} />
                          </button>
                        ) : (
                          <span className="text-xs md:text-sm text-slate-500 font-semibold bg-slate-100 px-3 py-1.5 rounded-md">Hết món</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
