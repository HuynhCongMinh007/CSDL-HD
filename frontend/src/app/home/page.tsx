import Link from 'next/link';
import { Store, TrendingUp, Users, ArrowRight, ChefHat, Zap } from 'lucide-react';

export default function OnboardHomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500/30">
      {/* Navigation / Header */}
      <nav className="border-b border-slate-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2.5 rounded-xl shadow-lg shadow-emerald-600/20">
              <Store className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              NeoFood Merchant
            </span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
            <span className="hover:text-emerald-600 cursor-pointer transition-colors">Về chúng tôi</span>
            <span className="hover:text-emerald-600 cursor-pointer transition-colors">Giải pháp AI</span>
            <span className="hover:text-emerald-600 cursor-pointer transition-colors">Hỗ trợ đối tác</span>
          </div>
          <div>
            <Link 
              href="/" 
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all font-medium text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              Vào Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 py-20 md:py-32 flex flex-col items-center text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-100 rounded-full blur-[120px] -z-10 pointer-events-none" />
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 mb-8 text-sm font-medium">
          <Zap className="w-4 h-4" />
          Powered by Neo4j Recommendation Engine
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-tight max-w-4xl">
          Tối đa hóa doanh thu <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500">
            với AI & Dữ liệu đồ thị
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-12 leading-relaxed">
          Nền tảng quản lý nhà hàng hiện đại dành riêng cho đối tác của ứng dụng giao đồ ăn. 
          Giúp bạn không chỉ quản lý đơn hàng mà còn tự động tạo ra các gói Combo siêu hời 
          dựa trên phân tích hành vi của hàng triệu khách hàng thực tế.
        </p>

        <Link 
          href="/" 
          className="group relative inline-flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full transition-all font-bold text-lg shadow-[0_0_40px_rgba(16,185,129,0.2)] hover:shadow-[0_0_60px_rgba(16,185,129,0.4)] hover:-translate-y-1"
        >
          <ChefHat className="w-6 h-6" />
          Trải nghiệm tính năng Tạo Combo
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-200">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Hệ sinh thái công cụ toàn diện</h2>
          <p className="text-slate-600">Mọi thứ bạn cần để bùng nổ doanh số trên nền tảng giao đồ ăn</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-white border border-slate-200 hover:shadow-xl hover:border-slate-300 transition-all shadow-sm">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
              <Store className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Quản lý Cửa hàng</h3>
            <p className="text-slate-600 leading-relaxed">
              Cập nhật thực đơn, giá cả và trạng thái hoạt động của nhà hàng theo thời gian thực. Giao diện trực quan và dễ sử dụng.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-emerald-50/50 border border-emerald-200 relative overflow-hidden group hover:shadow-xl transition-all shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 relative z-10">
              <TrendingUp className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3 relative z-10">Neo4j AI Combo</h3>
            <p className="text-slate-600 leading-relaxed relative z-10">
              Công nghệ AI tự động phân tích đồ thị người dùng để gợi ý các món thường được mua kèm, giúp bạn tạo Combo tăng giá trị trung bình trên mỗi đơn hàng (AOV).
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200 hover:shadow-xl hover:border-slate-300 transition-all shadow-sm">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-6">
              <Users className="w-7 h-7 text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Thấu hiểu Khách hàng</h3>
            <p className="text-slate-600 leading-relaxed">
              Nhận báo cáo chi tiết về chân dung khách hàng, độ tuổi, và các khung giờ đặt hàng nhiều nhất để tối ưu hóa chiến dịch marketing.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 text-center text-slate-500 bg-white">
        <p>© 2026 NeoFood Merchant. Một sản phẩm ứng dụng Đồ thị tri thức & Hệ gợi ý.</p>
      </footer>
    </div>
  );
}
