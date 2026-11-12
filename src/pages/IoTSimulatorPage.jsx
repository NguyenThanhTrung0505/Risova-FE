import React, { useState } from 'react';
import { useAuth, useData } from '../context/DataContext';
import {
  Activity,
  AlertTriangle,
  Zap,
  Radio,
  Sliders,
  CheckCircle,
  Clock,
  ShieldAlert,
  Flame,
  Gauge,
  Thermometer,
  Vibrate,
  ArrowRight,
  Plus
} from 'lucide-react';

export default function IoTSimulatorPage({ onTriggerEmergencyWo }) {
  const { currentUser } = useAuth();
  const {
    data,
    ENUMS,
    simulateIoTMeasurement,
    acknowledgeAlert,
    resolveAlert
  } = useData();

  // Local interactive slider values for simulation
  const [sliderValues, setSliderValues] = useState({
    1: 108.4, // AC-04 Oil Temp
    2: 7.2,   // CV-01 Vibration
    4: 67.5,  // MDB-01 Busbar Temp
    3: 48.0   // RB-03 Motor Temp
  });

  const sensorConfigs = [
    {
      assetId: 1,
      assetCode: 'AC-04',
      assetName: 'Máy nén khí trục vít AC-04',
      metric: 'TEMPERATURE',
      metricLabel: 'Nhiệt độ dầu nén trục vít',
      unit: '°C',
      min: 40,
      max: 130,
      step: 0.2,
      warnLimit: 95.0,
      dangerLimit: 105.0,
      icon: Flame,
      location: 'Trạm Kỹ thuật Trung tâm (Utility)'
    },
    {
      assetId: 2,
      assetCode: 'CV-01',
      assetName: 'Băng tải cấp liệu CV-01',
      metric: 'VIBRATION',
      metricLabel: 'Độ rung động cơ & gối trục',
      unit: 'mm/s',
      min: 0.5,
      max: 12.0,
      step: 0.1,
      warnLimit: 5.0,
      dangerLimit: 7.0,
      icon: Vibrate,
      location: 'Phân xưởng Ép nhựa & Đúc phụ tùng'
    },
    {
      assetId: 4,
      assetCode: 'MDB-01',
      assetName: 'Tủ điện phân phối chính MDB-01',
      metric: 'TEMPERATURE',
      metricLabel: 'Nhiệt độ điểm tiếp xúc thanh cái Pha S',
      unit: '°C',
      min: 25,
      max: 95,
      step: 0.5,
      warnLimit: 55.0,
      dangerLimit: 65.0,
      icon: Thermometer,
      location: 'Trạm Biến áp Trung tâm'
    },
    {
      assetId: 3,
      assetCode: 'RB-03',
      assetName: 'Robot hàn tự động RB-03',
      metric: 'MOTOR_TEMP',
      metricLabel: 'Nhiệt độ cuộn dây động cơ khớp J2',
      unit: '°C',
      min: 25,
      max: 100,
      step: 0.5,
      warnLimit: 60.0,
      dangerLimit: 75.0,
      icon: Gauge,
      location: 'Phân xưởng Gia công Cơ khí & CNC'
    }
  ];

  const handleSliderDrag = (config, val) => {
    const num = parseFloat(val);
    setSliderValues(prev => ({ ...prev, [config.assetId]: num }));
  };

  const handleSliderRelease = (config) => {
    const currentVal = sliderValues[config.assetId];
    simulateIoTMeasurement(config.assetId, config.metric, currentVal, config.unit);
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-page-title font-bold text-[#112D4E]">
              Giám sát Đo lường IoT & Bộ mô phỏng Cảm biến (Simulator)
            </h1>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              REALTIME
            </span>
          </div>
          <p className="text-body text-[#64748B] mt-0.5">
            Kéo thanh trượt để thử nghiệm kịch bản nhiệt độ / độ rung vượt ngưỡng cảnh báo và kích hoạt tạo lệnh việc khẩn cấp
          </p>
        </div>
      </div>

      {/* 1. IOT SENSOR SIMULATOR DASHBOARD CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sensorConfigs.map(config => {
          const val = sliderValues[config.assetId] || config.min;
          const isDanger = val >= config.dangerLimit;
          const isWarning = val >= config.warnLimit && !isDanger;
          const Icon = config.icon;

          return (
            <div
              key={config.assetId}
              className={`rounded-2xl p-6 border transition-all duration-300 bg-white shadow-sm relative overflow-hidden ${
                isDanger
                  ? 'border-red-400 ring-2 ring-red-400/20 bg-red-50/20'
                  : isWarning
                  ? 'border-amber-400 ring-1 ring-amber-300 bg-amber-50/15'
                  : 'border-slate-200'
              }`}
            >
              {/* Header inside card */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold shrink-0 transition ${
                      isDanger
                        ? 'bg-red-500 text-white animate-bounce-short'
                        : isWarning
                        ? 'bg-amber-500 text-white'
                        : 'bg-blue-100 text-[#3F72AF]'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#112D4E] flex items-center gap-2">
                      <span>{config.assetName}</span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {config.assetCode}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">{config.location}</p>
                  </div>
                </div>

                {/* Status Beacon */}
                <div className="text-right">
                  {isDanger ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white shadow-sm animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      NGUY HIỂM
                    </span>
                  ) : isWarning ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      CẢNH BÁO
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                      <CheckCircle className="w-3.5 h-3.5" />
                      AN TOÀN
                    </span>
                  )}
                </div>
              </div>

              {/* Metric Label & Big Reading */}
              <div className="mt-5 flex items-baseline justify-between border-b pb-3">
                <span className="text-xs font-semibold text-slate-600">
                  {config.metricLabel}
                </span>
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-3xl font-extrabold font-mono transition ${
                      isDanger
                        ? 'text-red-600 animate-pulse'
                        : isWarning
                        ? 'text-amber-600'
                        : 'text-[#112D4E]'
                    }`}
                  >
                    {val.toFixed(1)}
                  </span>
                  <span className="text-sm font-bold text-slate-500 font-mono">
                    {config.unit}
                  </span>
                </div>
              </div>

              {/* Interactive Slider Input */}
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                  <span>Tối thiểu: {config.min}{config.unit}</span>
                  <span className="text-amber-600">Ngưỡng cảnh báo: &gt; {config.warnLimit}{config.unit}</span>
                  <span className="text-red-600">Ngưỡng nguy hiểm: &gt; {config.dangerLimit}{config.unit}</span>
                </div>

                <input
                  type="range"
                  min={config.min}
                  max={config.max}
                  step={config.step}
                  value={val}
                  onChange={(e) => handleSliderDrag(config, e.target.value)}
                  onMouseUp={() => handleSliderRelease(config)}
                  onTouchEnd={() => handleSliderRelease(config)}
                  className={`w-full h-2 rounded-lg appearance-none cursor-pointer transition ${
                    isDanger ? 'accent-red-600' : isWarning ? 'accent-amber-500' : 'accent-[#3F72AF]'
                  }`}
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400 italic">
                    Nhả chuột để áp dụng giá trị cảm biến
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSliderRelease(config)}
                    className="px-2.5 py-1 rounded bg-slate-100 hover:bg-[#3F72AF] hover:text-white text-slate-700 text-[11px] font-semibold transition cursor-pointer"
                  >
                    Ghi nhận & Kiểm tra ngưỡng
                  </button>
                </div>
              </div>

              {/* Emergency Action Banner if Danger */}
              {isDanger && (
                <div className="mt-4 p-3 bg-red-100/90 border border-red-300 rounded-xl flex items-center justify-between gap-3 animate-fade-in">
                  <div className="text-xs text-red-900 font-semibold flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Thông số vượt quá giới hạn thiết kế!</span>
                  </div>

                  <button
                    onClick={() => {
                      if (onTriggerEmergencyWo) {
                        onTriggerEmergencyWo({
                          asset_id: config.assetId,
                          title: `Xử lý sự cố ${config.metricLabel} vượt ngưỡng (${val}${config.unit})`,
                          wo_type: 'EMERGENCY',
                          priority: 'CRITICAL',
                          description: `Cảm biến IoT đo được giá trị ${val}${config.unit} tại thiết bị ${config.assetCode}, vượt quá ngưỡng nguy hiểm cho phép (${config.dangerLimit}${config.unit}). Cần kỹ thuật viên can thiệp khẩn cấp.`
                        });
                      }
                    }}
                    className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer transition"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Tạo WO Khẩn cấp ngay!</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 2. REALTIME ALERTS MANAGEMENT TABLE */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b">
          <div>
            <h3 className="text-card-title font-bold text-[#112D4E] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span>Nhật ký Cảnh báo IoT Thời gian thực ({data.alerts.length})</span>
            </h3>
            <p className="text-caption text-[#64748B]">
              Danh sách sự kiện cảnh báo được kích hoạt tự động từ hệ thống cảm biến
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold uppercase text-[#64748B] tracking-wider">
                <th className="py-3 px-4">Thời gian</th>
                <th className="py-3 px-4">Tên cảnh báo</th>
                <th className="py-3 px-4">Thiết bị</th>
                <th className="py-3 px-4">Giá trị đo / Ngưỡng</th>
                <th className="py-3 px-4">Mức độ</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-right">Hành động xử lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.alerts.map(alert => {
                const isCrit = alert.level === 'DANGER';
                const asset = data.assets.find(a => a.id === alert.asset_id);

                return (
                  <tr key={alert.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {new Date(alert.triggered_at).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#112D4E]">
                      {alert.title}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#3F72AF]">
                      {asset ? `${asset.name} (${asset.asset_code})` : `Asset #${alert.asset_id}`}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">
                      <span className={isCrit ? 'text-red-600' : 'text-amber-600'}>
                        {alert.trigger_value}
                      </span>{' '}
                      <span className="text-slate-400 font-normal">
                        (Ngưỡng: &gt; {alert.threshold_val})
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isCrit ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {ENUMS.ALERT_LEVELS[alert.level]?.label || alert.level}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        alert.status === 'OPEN'
                          ? 'bg-red-100 text-red-600'
                          : alert.status === 'ACKNOWLEDGED'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {ENUMS.ALERT_STATUSES[alert.status]?.label || alert.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {alert.status === 'OPEN' && (
                          <button
                            onClick={() => acknowledgeAlert(alert.id, currentUser)}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-md text-[11px] font-semibold transition cursor-pointer"
                          >
                            Tiếp nhận
                          </button>
                        )}

                        {alert.status !== 'RESOLVED' && (
                          <button
                            onClick={() => resolveAlert(alert.id)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md text-[11px] font-semibold transition cursor-pointer"
                          >
                            Giải quyết xong
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (onTriggerEmergencyWo) {
                              onTriggerEmergencyWo({
                                asset_id: alert.asset_id,
                                title: `Khẩn cấp: ${alert.title} vượt ngưỡng`,
                                wo_type: 'EMERGENCY',
                                priority: 'CRITICAL',
                                description: alert.description
                              });
                            }
                          }}
                          className="px-2.5 py-1 bg-[#3F72AF] hover:bg-[#325d91] text-white rounded-md text-[11px] font-semibold transition cursor-pointer"
                        >
                          + Giao việc
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

