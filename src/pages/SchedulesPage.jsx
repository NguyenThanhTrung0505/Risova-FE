import React, { useState } from 'react';
import { useAuth, useData } from '../context/DataContext';
import {
  CalendarClock,
  Plus,
  Clock,
  Calendar,
  Gauge,
  CheckCircle,
  AlertCircle,
  Wrench,
  ArrowRight,
  X
} from 'lucide-react';

export default function SchedulesPage({ onGenerateWoFromSchedule }) {
  const { data, ENUMS, createMaintenanceSchedule } = useData();
  const [filterType, setFilterType] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [form, setForm] = useState({
    title: '',
    asset_id: 1,
    schedule_type: 'TIME_BASED',
    assigned_specialty_id: 1,
    frequency_days: 30,
    estimated_duration_hours: 2.0,
    meter_interval: 2000
  });

  const filteredSchedules = data.maintenance_schedules.filter(s => {
    return filterType === 'ALL' || s.schedule_type === filterType;
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.title) return;
    createMaintenanceSchedule(form);
    setShowCreateModal(false);
    setForm({
      title: '',
      asset_id: 1,
      schedule_type: 'TIME_BASED',
      assigned_specialty_id: 1,
      frequency_days: 30,
      estimated_duration_hours: 2.0,
      meter_interval: 2000
    });
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-page-title font-bold text-[#112D4E]">
            Kế hoạch Bảo trì Định kỳ (Preventive Maintenance)
          </h1>
          <p className="text-body text-[#64748B] mt-0.5">
            Lập lịch theo chu kỳ Thời gian (TIME_BASED), Chỉ số đồng hồ (METER_BASED) hoặc Kết hợp (HYBRID)
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#3F72AF] hover:bg-[#325d91] text-white rounded-lg font-semibold text-sm shadow-sm transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Thêm kế hoạch bảo dưỡng</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b pb-2">
        <button
          onClick={() => setFilterType('ALL')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
            filterType === 'ALL' ? 'bg-[#3F72AF] text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Tất cả kế hoạch ({data.maintenance_schedules.length})
        </button>
        {Object.entries(ENUMS.SCHEDULE_TYPES).map(([k, v]) => (
          <button
            key={k}
            onClick={() => setFilterType(k)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              filterType === k ? 'bg-[#3F72AF] text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Schedules Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredSchedules.map(schedule => {
          const asset = data.assets.find(a => a.id === schedule.asset_id);
          const typeMeta = ENUMS.SCHEDULE_TYPES[schedule.schedule_type] || { label: schedule.schedule_type };

          const isOverdue = schedule.badge_color === 'danger';
          const isDue = schedule.badge_color === 'warning';

          return (
            <div
              key={schedule.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-[#3F72AF]">
                    {typeMeta.label}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      isOverdue
                        ? 'bg-red-100 text-red-600'
                        : isDue
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {schedule.status_label || 'Đang theo dõi'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#112D4E]">
                  {schedule.title}
                </h3>

                <div className="text-xs text-slate-600 space-y-1.5 pt-1">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-slate-400" />
                    <span>Thiết bị: <strong>{asset ? asset.name : schedule.asset_code}</strong> ({schedule.asset_code})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Thời gian ước tính: <strong>{schedule.estimated_duration_hours} giờ</strong></span>
                  </div>

                  {schedule.meter_interval && (
                    <div className="flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-slate-400" />
                      <span>Định mức đồng hồ: <strong>{schedule.meter_interval.toLocaleString('vi-VN')} giờ chạy</strong></span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>Hạn bảo dưỡng kế tiếp: <strong className="font-mono">{new Date(schedule.next_due_date).toLocaleDateString('vi-VN')}</strong></span>
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t mt-5 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#3F72AF]">
                  {schedule.display_date}
                </span>

                <button
                  onClick={() => {
                    if (onGenerateWoFromSchedule) {
                      onGenerateWoFromSchedule(schedule);
                    }
                  }}
                  className="px-3.5 py-1.5 bg-[#3F72AF] hover:bg-[#325d91] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <span>Sinh Lệnh việc</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Schedule Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <h3 className="text-base font-bold text-[#112D4E]">Thêm kế hoạch bảo trì định kỳ (PM)</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#112D4E] mb-1">Tiêu đề kế hoạch (*)</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Bảo dưỡng cấp 1.000 giờ máy CNC"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#112D4E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#112D4E] mb-1">Thiết bị bảo trì</label>
                <select
                  value={form.asset_id}
                  onChange={e => setForm({ ...form, asset_id: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#112D4E]"
                >
                  {data.assets.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.asset_code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#112D4E] mb-1">Loại lịch trình</label>
                  <select
                    value={form.schedule_type}
                    onChange={e => setForm({ ...form, schedule_type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#112D4E]"
                  >
                    <option value="TIME_BASED">Theo thời gian định kỳ</option>
                    <option value="METER_BASED">Theo chỉ số đồng hồ</option>
                    <option value="HYBRID">Kết hợp (Cái nào đến trước)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#112D4E] mb-1">Ước tính (giờ)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={form.estimated_duration_hours}
                    onChange={e => setForm({ ...form, estimated_duration_hours: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#112D4E]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#3F72AF] hover:bg-[#325d91] text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  Lưu kế hoạch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

