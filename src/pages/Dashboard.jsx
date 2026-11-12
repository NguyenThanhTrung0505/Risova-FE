import React, { useState } from 'react';
import { useAuth, useData } from '../context/DataContext';
import {
  Plus,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle,
  Package,
  Wrench,
  ShieldAlert,
  ChevronRight,
  Calendar
} from 'lucide-react';

export default function Dashboard({ onNavigate, onOpenCreateWo, onSelectWo }) {
  const { currentUser } = useAuth();
  const { data, ENUMS } = useData();
  const [hoveredBar, setHoveredBar] = useState(null);

  // 1. DYNAMIC KPI CALCULATIONS
  const activeAssetsCount = data.assets.filter(a => a.status === 'ACTIVE').length;
  const totalAssetsCount = data.assets.length;
  const readinessRate = totalAssetsCount > 0 ? ((activeAssetsCount / totalAssetsCount) * 100).toFixed(1) : '94.7';

  // Work orders processing & critical
  const processingWos = data.work_orders.filter(w => w.status !== 'CLOSED' && w.status !== 'CANCELLED');
  const criticalWos = processingWos.filter(w => w.priority === 'CRITICAL' || w.wo_type === 'EMERGENCY');

  // Active alerts
  const activeAlerts = (data.alerts || []).filter(a => a.status !== 'RESOLVED');
  const unackAlerts = activeAlerts.filter(a => a.status === 'OPEN');

  // Low stock spare parts
  const lowStockParts = (data.spare_parts || []).filter(p => p.is_low_stock || p.quantity_in_stock <= p.min_stock_level);

  // 2. CRITICAL HEALTH DEVICES DATA FROM DYNAMIC ASSETS
  const healthData = [
    { code: 'AC-04', name: 'Máy nén khí trục vít AC-04', score: data.assets.find(a => a.asset_code === 'AC-04')?.health_score ?? 32 },
    { code: 'CV-01', name: 'Băng tải cấp liệu CV-01', score: data.assets.find(a => a.asset_code === 'CV-01')?.health_score ?? 65 },
    { code: 'RB-03', name: 'Robot hàn tự động RB-03', score: data.assets.find(a => a.asset_code === 'RB-03')?.health_score ?? 95 },
    { code: 'MDB-01', name: 'Tủ điện phân phối chính MDB-01', score: data.assets.find(a => a.asset_code === 'MDB-01')?.health_score ?? 90 },
    { code: 'CT-02', name: 'Tháp giải nhiệt làm mát CT-02', score: data.assets.find(a => a.asset_code === 'CT-02')?.health_score ?? 88 },
    { code: 'P-08', name: 'Bơm cấp nước tuần hoàn P-08', score: data.assets.find(a => a.asset_code === 'P-08')?.health_score ?? 80 }
  ];

  // 3. WORK ORDER STATUS DISTRIBUTION FOR DONUT CHART (DYNAMIC)
  const assignedCount = data.work_orders.filter(w => w.status === 'ASSIGNED').length;
  const openCount = data.work_orders.filter(w => w.status === 'OPEN').length;
  const completedCount = data.work_orders.filter(w => w.status === 'COMPLETED' || w.status === 'CLOSED').length;
  const inProgressCount = data.work_orders.filter(w => w.status === 'IN_PROGRESS' || w.status === 'ON_HOLD').length;
  const totalStats = assignedCount + openCount + completedCount + inProgressCount;
  const safeTotal = totalStats > 0 ? totalStats : 1;

  const donutData = [
    { key: 'ASSIGNED', label: 'Đã giao', count: assignedCount, color: '#3F72AF', percent: assignedCount / safeTotal },
    { key: 'OPEN', label: 'Mới mở', count: openCount, color: '#3B82F6', percent: openCount / safeTotal },
    { key: 'IN_PROGRESS', label: 'Đang thực hiện', count: inProgressCount, color: '#F59E0B', percent: inProgressCount / safeTotal },
    { key: 'COMPLETED', label: 'Đã hoàn thành', count: completedCount, color: '#10B981', percent: completedCount / safeTotal }
  ];

  let cumulativeAngle = 0;
  const donutSlices = donutData.map(slice => {
    const startAngle = cumulativeAngle;
    const angle = slice.percent * 360;
    cumulativeAngle += angle;
    return { ...slice, startAngle, angle };
  });

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  };

  const describeArc = (x, y, radius, startAngle, endAngle) => {
    // If angle is practically full circle
    const diff = endAngle - startAngle;
    if (diff >= 359.9) {
      return `M ${x - radius} ${y} A ${radius} ${radius} 0 1 0 ${x + radius} ${y} A ${radius} ${radius} 0 1 0 ${x - radius} ${y}`;
    }
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = diff <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };

  // 4. DYNAMIC LISTS
  const upcomingSchedules = (data.maintenance_schedules || []).slice(0, 3);
  const recentAlerts = (data.alerts || []).slice(0, 3);
  const recentActivities = (data.activities || []).slice(0, 4);
  const myWorkOrders = (data.work_orders || []).slice(0, 4);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      {/* 1. WELCOME HEADER & QUICK ACTION BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-page-title font-bold text-[#112D4E] tracking-tight">
            Xin chào, {currentUser?.full_name || 'Minh Anh'}
          </h1>
          <p className="text-body text-[#64748B] mt-0.5">
            Tổng quan vận hành Nhà máy Bắc Ninh - Cập nhật lúc {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}, {new Date().toLocaleDateString('vi-VN')}
          </p>
        </div>

        <button
          onClick={onOpenCreateWo}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3F72AF] hover:bg-[#325d91] text-white rounded-lg font-semibold text-sm shadow-md shadow-blue-500/20 transition duration-150 ease-in-out cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Tạo phiếu giao việc</span>
        </button>
      </div>

      {/* 2. FOUR KPI CARDS (DỮ LIỆU ĐỘNG 100%) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Thiết bị đang hoạt động */}
        <div
          onClick={() => onNavigate('assets')}
          className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <span className="text-body font-semibold text-[#112D4E]">
              Thiết bị đang hoạt động
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#DBE2EF] text-[#3F72AF]">
              {readinessRate}% Sẵn sàng
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#112D4E]">
              {activeAssetsCount}/{totalAssetsCount}
            </span>
            <span className="text-xs text-[#64748B]">thiết bị khả dụng</span>
          </div>
        </div>

        {/* KPI 2: Phiếu giao việc */}
        <div
          onClick={() => onNavigate('work-orders')}
          className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <span className="text-body font-semibold text-[#112D4E]">
              Phiếu giao việc
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#DBE2EF] text-[#3F72AF]">
              +{processingWos.length} phiếu đang xử lý
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-sm font-semibold text-[#112D4E]">
              {processingWos.length} phiếu đang xử lý /{' '}
              <span className={criticalWos.length > 0 ? "text-red-500 font-bold" : "text-slate-500 font-bold"}>
                {criticalWos.length} khẩn cấp
              </span>
            </span>
          </div>
        </div>

        {/* KPI 3: Cảnh báo nguy hiểm */}
        <div
          onClick={() => onNavigate('iot')}
          className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <span className="text-body font-semibold text-[#112D4E]">
              Cảnh báo nguy hiểm
            </span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
              activeAlerts.length > 0 ? 'bg-red-100 text-[#EF4444]' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {activeAlerts.length} cảnh báo
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xs text-[#64748B]">
              {unackAlerts.length} cảnh báo chưa xác nhận
            </span>
          </div>
        </div>

        {/* KPI 4: Vật tư tồn kho thấp */}
        <div
          onClick={() => onNavigate('inventory')}
          className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <span className="text-body font-semibold text-[#112D4E]">
              Vật tư tồn kho thấp
            </span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
              lowStockParts.length > 0 ? 'bg-amber-100 text-amber-700' : 'bg-[#DBE2EF] text-[#3F72AF]'
            }`}>
              {lowStockParts.length} vật tư
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xs text-[#64748B]">
              {lowStockParts.length > 0 ? 'Cần xem xét đặt hàng' : 'Mức tồn kho an toàn'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. ROW 2: TÌNH TRẠNG LỆNH VIỆC (DONUT ĐỘNG) & BẢO TRÌ SẮP TỚI (ĐỘNG) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tình trạng lệnh việc */}
        <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="text-card-title font-semibold text-[#112D4E]">
                Tình trạng lệnh việc
              </h2>
              <p className="text-caption text-[#64748B]">
                Phân bố phiếu giao việc theo trạng thái hiện tại (Tổng: {totalStats})
              </p>
            </div>
            <button
              onClick={() => onNavigate('work-orders')}
              className="text-xs font-semibold text-[#3F72AF] hover:underline cursor-pointer"
            >
              Xem tất cả
            </button>
          </div>

          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6 py-4">
            {/* Donut Chart SVG */}
            <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {donutSlices.map((slice, i) => {
                  if (slice.count === 0) return null;
                  const strokeWidth = 24;
                  const radius = 38;
                  const path = describeArc(50, 50, radius, slice.startAngle, slice.startAngle + slice.angle - (donutSlices.filter(s => s.count > 0).length > 1 ? 1 : 0));
                  return (
                    <path
                      key={i}
                      d={path}
                      fill="none"
                      stroke={slice.color}
                      strokeWidth={strokeWidth}
                      className="transition-all duration-300 hover:opacity-85 cursor-pointer"
                    />
                  );
                })}
              </svg>

              {/* Inside center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-[#112D4E]">{totalStats}</span>
                <span className="text-[11px] text-[#64748B]">Lệnh việc</span>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#3F72AF]"></span>
                <span className="text-xs text-[#112D4E]">Đã giao: <strong>{assignedCount}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#3B82F6]"></span>
                <span className="text-xs text-[#112D4E]">Mới mở: <strong>{openCount}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#F59E0B]"></span>
                <span className="text-xs text-[#112D4E]">Đang thực hiện: <strong>{inProgressCount}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#10B981]"></span>
                <span className="text-xs text-[#112D4E]">Đã hoàn thành: <strong>{completedCount}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Bảo trì sắp tới (Render động từ data.maintenance_schedules) */}
        <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-card-title font-semibold text-[#112D4E]">
                Bảo trì sắp tới
              </h2>
              <p className="text-caption text-[#64748B]">
                Trong 7 ngày tới ({upcomingSchedules.length} kế hoạch)
              </p>
            </div>
            <button
              onClick={() => onNavigate('schedules')}
              className="text-xs font-semibold text-[#3F72AF] hover:underline cursor-pointer"
            >
              Xem tất cả
            </button>
          </div>

          <div className="space-y-3.5 flex-1 justify-center flex flex-col">
            {upcomingSchedules.length > 0 ? (
              upcomingSchedules.map((schedule) => {
                const isOverdue = schedule.badge_color === 'danger' || schedule.status_label === 'Quá hạn';
                const isDue = schedule.badge_color === 'warning' || schedule.status_label === 'Đến hạn';

                return (
                  <div
                    key={schedule.id}
                    onClick={() => onNavigate('schedules')}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-300 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-12 h-12 rounded-lg border flex flex-col items-center justify-center font-bold shrink-0 ${
                        isOverdue
                          ? 'bg-red-50 border-red-200 text-red-600'
                          : isDue
                          ? 'bg-amber-50 border-amber-200 text-amber-600'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                      }`}>
                        <span className="text-base leading-none">
                          {schedule.display_date ? schedule.display_date.split(' ')[0] : '20'}
                        </span>
                        <span className="text-[10px] uppercase font-semibold">
                          {schedule.display_date ? schedule.display_date.split(' ')[1] || 'TH6' : 'TH6'}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#112D4E]">
                          {schedule.title}
                        </h4>
                        <p className="text-caption text-[#64748B]">
                          {schedule.asset_code} | {schedule.estimated_duration_hours || 2} giờ
                        </p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      isOverdue
                        ? 'bg-red-100 text-[#EF4444]'
                        : isDue
                        ? 'bg-amber-100 text-[#F59E0B]'
                        : 'bg-emerald-100 text-[#10B981]'
                    }`}>
                      {schedule.status_label || 'Sắp tới'}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">
                Không có lịch bảo trì sắp tới.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. ROW 3: SỨC KHỎE THIẾT BỊ TRỌNG YẾU (BAR CHART) & CẢNH BÁO IOT GẦN ĐÂY (ĐỘNG) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sức khỏe thiết bị trọng yếu */}
        <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm flex flex-col">
          <div className="mb-4">
            <h2 className="text-card-title font-semibold text-[#112D4E]">
              Sức khỏe thiết bị trọng yếu
            </h2>
            <p className="text-caption text-[#64748B]">
              Điểm sức khỏe tổng hợp từ bảo trì và IoT (Cập nhật tự động)
            </p>
          </div>

          {/* Bar Chart Container */}
          <div className="flex-1 flex flex-col justify-end pt-4 pb-2">
            <div className="h-48 flex items-end justify-between gap-3 px-2 border-b border-slate-200 relative">
              {/* Horizontal grid lines */}
              <div className="absolute inset-x-0 bottom-0 border-b border-slate-100"></div>
              <div className="absolute inset-x-0 bottom-12 border-b border-slate-100/80"></div>
              <div className="absolute inset-x-0 bottom-24 border-b border-slate-100/80"></div>
              <div className="absolute inset-x-0 bottom-36 border-b border-slate-100/80"></div>
              <div className="absolute inset-x-0 top-0 border-b border-slate-100/80"></div>

              {/* Y Axis Labels */}
              <div className="absolute -left-6 top-0 bottom-0 flex flex-col justify-between text-[10px] text-slate-400 font-mono">
                <span>100</span>
                <span>75</span>
                <span>50</span>
                <span>25</span>
                <span>0</span>
              </div>

              {/* Bars */}
              {healthData.map((item, idx) => {
                const heightPercent = `${Math.min(100, Math.max(10, item.score))}%`;
                const isCritical = item.score < 40;

                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative z-10 cursor-pointer"
                    onMouseEnter={() => setHoveredBar(item)}
                    onMouseLeave={() => setHoveredBar(null)}
                    onClick={() => onNavigate('assets')}
                  >
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-[#112D4E] text-white text-[11px] font-semibold py-1 px-2 rounded pointer-events-none transition duration-150 whitespace-nowrap shadow-md z-30">
                      {item.score} điểm
                    </div>

                    {/* Bar */}
                    <div
                      style={{ height: heightPercent }}
                      className={`w-full max-w-[42px] rounded-t-md transition-all duration-300 ${
                        isCritical
                          ? 'bg-[#3F72AF]/70 hover:bg-[#3F72AF]'
                          : 'bg-[#3F72AF] hover:bg-[#325d91]'
                      }`}
                    ></div>
                  </div>
                );
              })}
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between gap-3 px-2 pt-2 text-xs font-semibold text-[#112D4E]">
              {healthData.map((item, idx) => (
                <div key={idx} className="flex-1 text-center truncate">
                  {item.code}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cảnh báo IoT gần đây (Render động từ data.alerts) */}
        <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-card-title font-semibold text-[#112D4E]">
                Cảnh báo IoT gần đây
              </h2>
              <p className="text-caption text-[#64748B]">
                Các thông số vượt ngưỡng theo thời gian thực
              </p>
            </div>
            <button
              onClick={() => onNavigate('iot')}
              className="text-xs font-semibold text-[#3F72AF] hover:underline cursor-pointer"
            >
              Mở giám sát
            </button>
          </div>

          <div className="space-y-3.5 flex-1 flex flex-col justify-center">
            {recentAlerts.length > 0 ? (
              recentAlerts.map((alert) => {
                const isDanger = alert.level === 'DANGER';
                return (
                  <div
                    key={alert.id}
                    onClick={() => onNavigate('iot')}
                    className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ${
                      isDanger
                        ? 'bg-red-50/60 border-red-100 hover:border-red-200'
                        : 'bg-amber-50/60 border-amber-100 hover:border-amber-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        isDanger ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        <Activity className={`w-5 h-5 ${isDanger ? 'animate-pulse' : ''}`} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#112D4E]">
                          {alert.title}
                        </h4>
                        <p className="text-caption text-[#64748B] line-clamp-1">
                          {alert.description}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${
                      isDanger ? 'bg-red-100 text-[#EF4444]' : 'bg-amber-100 text-[#F59E0B]'
                    }`}>
                      {isDanger ? 'Nguy hiểm' : 'Cảnh báo'}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">
                Hệ thống IoT đang hoạt động trong ngưỡng an toàn bình thường.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. ROW 4: LỆNH VIỆC CỦA TÔI & HOẠT ĐỘNG GẦN ĐÂY (ĐỘNG 100%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lệnh việc của tôi (2 cols on lg) */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-card-title font-semibold text-[#112D4E]">
                Lệnh việc của tôi
              </h2>
              <p className="text-caption text-[#64748B]">
                Ưu tiên công việc cần xử lý trong ca
              </p>
            </div>
            <button
              onClick={() => onNavigate('work-orders')}
              className="text-xs font-semibold text-[#3F72AF] hover:underline cursor-pointer"
            >
              Xem danh sách
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold uppercase text-[#64748B] tracking-wider">
                  <th className="pb-3 pr-4">Lệnh việc</th>
                  <th className="pb-3 px-4">Thiết bị</th>
                  <th className="pb-3 px-4">Ưu tiên</th>
                  <th className="pb-3 px-4">Trạng thái</th>
                  <th className="pb-3 pl-4 text-right">Hạn xử lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {myWorkOrders.map((wo) => {
                  const pri = ENUMS.PRIORITIES[wo.priority] || { label: wo.priority, color: '#64748B', bg: '#F1F5F9' };
                  const stat = ENUMS.WO_STATUSES[wo.status] || { label: wo.status, color: '#64748B', bg: '#F1F5F9' };

                  return (
                    <tr
                      key={wo.id}
                      onClick={() => onSelectWo(wo)}
                      className="hover:bg-slate-50/80 transition cursor-pointer group"
                    >
                      <td className="py-3.5 pr-4 font-semibold">
                        <div className="text-[#3F72AF] group-hover:underline font-mono">
                          {wo.wo_code}
                        </div>
                        <div className="text-[11px] text-[#64748B] font-normal truncate max-w-[200px]">
                          {wo.title}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#112D4E]">
                        {wo.asset_code}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          style={{ color: pri.color, backgroundColor: pri.bg }}
                          className="px-2 py-0.5 rounded-full text-[11px] font-semibold inline-block whitespace-nowrap"
                        >
                          {pri.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          style={{ color: stat.color, backgroundColor: stat.bg }}
                          className="px-2 py-0.5 rounded-full text-[11px] font-semibold inline-block whitespace-nowrap"
                        >
                          {stat.label}
                        </span>
                      </td>
                      <td className="py-3.5 pl-4 text-right font-mono text-slate-500 whitespace-nowrap">
                        {wo.due_date || '2025-06-20'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Hoạt động gần đây (Render động từ data.activities) */}
        <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm flex flex-col">
          <div className="mb-4">
            <h2 className="text-card-title font-semibold text-[#112D4E]">
              Hoạt động gần đây
            </h2>
            <p className="text-caption text-[#64748B]">
              Nhật ký vận hành mới nhất ({recentActivities.length})
            </p>
          </div>

          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {recentActivities.length > 0 ? (
              recentActivities.map((act) => {
                let iconEl = <Activity className="w-4 h-4" />;
                let iconBg = 'bg-amber-100 text-[#F59E0B]';

                if (act.type === 'WO_COMPLETE') {
                  iconEl = <CheckCircle className="w-4 h-4" />;
                  iconBg = 'bg-emerald-100 text-[#10B981]';
                } else if (act.type === 'INV_ISSUE' || act.type === 'INV_RECEIPT') {
                  iconEl = <Package className="w-4 h-4" />;
                  iconBg = 'bg-blue-100 text-[#3F72AF]';
                } else if (act.type === 'WO_CREATE' || act.type === 'WO_UPDATE') {
                  iconEl = <Wrench className="w-4 h-4" />;
                  iconBg = 'bg-purple-100 text-purple-600';
                }

                return (
                  <div key={act.id} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${iconBg}`}>
                      {iconEl}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#112D4E] leading-tight truncate">
                        {act.title}
                      </p>
                      <p className="text-[11px] text-[#64748B] mt-0.5 leading-snug line-clamp-1">
                        {act.detail}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 inline-block">
                        {act.time_ago || 'Vừa xong'}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-slate-400 text-center py-4">
                Chưa có hoạt động mới được ghi nhận.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
