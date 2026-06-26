"use client";

import React, { useState } from 'react';
import { Coffee, Utensils, Search, Plus, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';

interface RecommendedDish {
  dish_id: string;
  dish_name: string;
  times_bought_together: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: RecommendedDish[];
}

const SAMPLE_DISHES = [
  { id: '1', name: 'Trà Sữa Olong Phúc Long', icon: Coffee },
  { id: 'D_COMTAM_01', name: 'Cơm Tấm Sườn Bì Chả', icon: Utensils },
  { id: '3', name: 'Gà Rán KFC', icon: Utensils },
];

export default function MerchantDashboard() {
  const [selectedDishId, setSelectedDishId] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendedDish[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectDish = async (dishId: string) => {
    setSelectedDishId(dishId);
    setLoading(true);
    setError(null);
    setRecommendations([]);

    try {
      const result = await api.get<ApiResponse>('/api/v1/recommendations/combo-suggestions', {
        params: { dishId, limit: 3 }
      });
      console.log('API result:', result);

      if (result.success) {
        setRecommendations(result.data);
      } else {
        throw new Error(result.message || 'Lỗi khi lấy dữ liệu gợi ý từ hệ thống');
      }
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCombo = (dishName: string) => {
    alert(`Tạo thành công Combo với món: ${dishName}!`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-10 border-b border-slate-200 pb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
              <TrendingUp className="text-emerald-600 w-8 h-8" />
              MERCHANT DASHBOARD
            </h1>
            <p className="text-slate-500 mt-2 text-sm md:text-base tracking-wide font-medium">
              TẠO COMBO TỰ ĐỘNG (NEO4J RECSYS)
            </p>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Dish Selection */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xl shadow-slate-200/50">
            <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <Search className="w-5 h-5 text-amber-500" />
              Chọn Món Gốc (Sample Data)
            </h2>
            
            <div className="space-y-4">
              {SAMPLE_DISHES.map((dish) => {
                const Icon = dish.icon;
                const isSelected = selectedDishId === dish.id;
                return (
                  <div
                    key={dish.id}
                    onClick={() => handleSelectDish(dish.id)}
                    className={`cursor-pointer p-4 rounded-xl border transition-all duration-300 flex items-center gap-4
                      ${isSelected 
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-md shadow-emerald-500/10' 
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                      }
                    `}
                  >
                    <div className={`p-3 rounded-lg transition-colors ${isSelected ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">{dish.name}</h3>
                      <p className="text-sm opacity-70">ID: {dish.id}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Recommendations */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xl shadow-slate-200/50 min-h-[400px] flex flex-col">
            <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Gợi ý Món Bán Kèm (Graph Result)
            </h2>

            <div className="flex-1 flex flex-col">
              {/* Initial State */}
              {!selectedDishId && !loading && !error && (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                  <Search className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-lg">Hãy chọn một món ăn bên trái để xem gợi ý</p>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="flex-1 flex flex-col items-center justify-center text-emerald-600">
                  <Loader2 className="w-12 h-12 mb-4 animate-spin" />
                  <p className="animate-pulse font-medium text-lg">Đang truy vấn đồ thị Neo4j...</p>
                </div>
              )}

              {/* Error State */}
              {error && !loading && (
                <div className="flex-1 flex flex-col items-center justify-center text-red-500 p-6 text-center bg-red-50 rounded-xl border border-red-100">
                  <AlertCircle className="w-12 h-12 mb-4" />
                  <p className="font-medium">{error}</p>
                </div>
              )}

              {/* Results State */}
              {!loading && !error && recommendations.length > 0 && (
                <div className="space-y-4">
                  {recommendations.map((item, index) => (
                    <div 
                      key={index}
                      className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-slate-50 hover:border-slate-300 transition-colors gap-4"
                    >
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-slate-900 mb-2">
                          {item.dish_name}
                        </h3>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full text-xs text-amber-700 border border-amber-200 font-medium">
                          <TrendingUp className="w-3 h-3" />
                          Tần suất đặt chung: {item.times_bought_together} lần
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleCreateCombo(item.dish_name)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-medium text-sm shadow-md shadow-emerald-600/20 w-full sm:w-auto justify-center"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Thêm nhanh vào Combo</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty Results State */}
              {!loading && !error && selectedDishId && recommendations.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                  <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
                  <p className="text-lg">Không có dữ liệu mua kèm cho món này.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
