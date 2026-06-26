import Link from 'next/link';
import { PATHS } from '../../lib/config/paths';
import { ChefHat, ArrowRight } from 'lucide-react';

export default function SimpleHomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-900 font-sans">
      <div className="max-w-2xl text-center space-y-8">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full mb-2 shadow-sm border border-emerald-200">
          <ChefHat size={48} />
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Demo Đồ Án <br />
          <span className="text-emerald-600">Quản Trị CSDL Hiện Đại</span>
        </h1>

        <p className="text-lg text-slate-600 leading-relaxed max-w-xl mx-auto">
          Hệ thống mô phỏng ứng dụng đặt đồ ăn sử dụng Redis và Neo4j để tối ưu truy vấn và gợi ý món ăn (Combo) thông minh.
        </p>

        <div className="pt-8">
          <Link
            href={PATHS.RESTAURANT_DEMO}
            className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all font-bold text-lg shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] hover:-translate-y-1"
          >
            Đến Trang Cửa Hàng
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
