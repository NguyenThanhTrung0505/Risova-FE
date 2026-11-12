import React from 'react';
import { useData } from '../context/DataContext';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Activity,
  Layers,
  Award
} from 'lucide-react';

export default function ReportsPage() {
  const { data } = useData();

  // Metrics
  const kpis = [
    { label: 'Hiệu suất thiết bị tổng thể (OEE)', value: '87.4%', change: '+2.1%', isGood: true, sub: 'Mục tiêu: > 85%' },
    { label: 'Thời gian trung bình giữa 2 sự cố (MTBF)', value: '428 giờ', change: '+35 giờ', isGood: true, sub: 'Hoạt động liên tục ổn định' },
    { label: 'Thời gian sửa chữa trung bình (MTTR)', value: '2.4 giờ', change: '-0.6 giờ', isGood: true, sub: 'Tốc độ khắc phục nhanh' },
    { label: 'Tỷ lệ bảo trì đúng hạn (PM Compliance)', value: '95.8%', change: '+1.4%', isGood: true, sub: 'Theo dõi 24 đợt bảo dưỡng' }
  ];

  const costBreakdown = [
    { month: 'T1', labor: 14.5, parts: 22.0 },
    { month: 'T2', labor: 12.0, parts: 18.5 },
    { month: 'T3', labor: 16.0, parts: 29.0 },
    { month: 'T4', labor: 13.5, parts: 21.0 },
    { month: 'T5', labor: 15.0, parts: 25.5 },
    { month: 'T6', labor: 11.8, parts: 19.2 }
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <div>
        <h1 className="text-page-title font-bold text-[#112D4E]">
          Báo cáo Phân tích Độ tin cậy & Hiệu suất CMMS
        </h1>
        <p className="text-body text-[#64748B] mt-0.5">
          Thống kê các chỉ số vận hành trọng yếu MTTR, MTBF, OEE và phân tích chi phí bảo trì Nhà máy Bắc Ninh
        </p>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#64748B]">{kpi.label}</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {kpi.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-[#112D4E] mt-2">{kpi.value}</div>
            </div>
            <div className="text-[11px] text-slate-400 mt-3 pt-2 border-t">
              {kpi.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Analysis Chart */}
        <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-card-title font-bold text-[#112D4E]">Chi phí bảo trì 6 tháng gần nhất</h3>
              <p className="text-caption text-[#64748B]">Chi phí nhân công và vật tư thay thế (Triệu VNĐ)</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#3F72AF]"></span> Phụ tùng</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#DBE2EF]"></span> Nhân công</span>
            </div>
          </div>

          <div className="h-56 flex items-end justify-between gap-4 pt-6 border-b border-slate-200 px-4">
            {costBreakdown.map((item, idx) => {
              const maxVal = 50;
              const partsHeight = `${(item.parts / maxVal) * 100}%`;
              const laborHeight = `${(item.labor / maxVal) * 100}%`;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div className="text-[10px] font-bold text-slate-500 mb-1 opacity-0 group-hover:opacity-100 transition">
                    {(item.parts + item.labor).toFixed(1)} tr
                  </div>
                  <div className="w-full max-w-[36px] flex flex-col items-center justify-end h-full">
                    <div style={{ height: partsHeight }} className="w-full bg-[#3F72AF] rounded-t-sm"></div>
                    <div style={{ height: laborHeight }} className="w-full bg-[#DBE2EF]"></div>
                  </div>
                  <span className="text-xs font-bold text-[#112D4E] mt-2">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Work Order Breakdown by Category */}
        <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-card-title font-bold text-[#112D4E]">Phân bổ Loại lệnh việc (Work Order Mix)</h3>
            <p className="text-caption text-[#64748B]">Tỷ lệ chuẩn công nghiệp khuyến nghị: &gt; 80% Bảo trì định kỳ (PM)</p>

            <div className="mt-6 space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-[#3F72AF]">Bảo trì định kỳ (PM)</span>
                  <span className="font-bold">65% (Lý tưởng: 80%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#3F72AF] h-full rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-amber-600">Sửa chữa phục hồi (Repair)</span>
                  <span className="font-bold">25%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-red-600">Sự cố khẩn cấp (Emergency)</span>
                  <span className="font-bold">10% (Cần giảm &lt; 5%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full rounded-full" style={{ width: '10%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 mt-6 flex items-center gap-3">
            <Award className="w-6 h-6 text-[#3F72AF] shrink-0" />
            <p className="text-xs text-slate-700 leading-snug">
              Hệ thống IoT phát hiện sớm bất thường giúp giảm <strong>38%</strong> các ca dừng máy khẩn cấp đột xuất trong tháng vừa qua.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

