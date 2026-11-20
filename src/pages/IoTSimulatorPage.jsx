import { usePagination } from '../hooks/usePagination';
import { useSearchParams } from 'react-router-dom';
import MeasurementDialog from '../components/MeasurementDialog';
import MonitorViews from '../components/MonitorViews';
import Pagination from '../components/Pagination';
import Dialog from '../components/Dialog';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { useAuth, useData } from '../context/DataContext';
import { canManagePage } from '../constants/permissions';
import {
  AlertTriangle,
  Zap,
  Radio,
  Sliders,
  CheckCircle,
  ShieldAlert,
  Flame,
  Gauge,
  Thermometer,
  Vibrate,
  Plus
} from 'lucide-react';

export default function IoTSimulatorPage({ onTriggerEmergencyWo, onSelectWorkOrder }) {
  const { currentUser } = useAuth();
  const { data, simulateIoTMeasurement } = useData();
  const canManage = canManagePage(currentUser?.role, 'iot');

  const [params, setParams] = useSearchParams();
  const view = params.get('view');
  const setView = value => setParams(value ? { view: value } : {});
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [assetFilter, setAssetFilter] = useState('ALL');
  const metricLabels = {TEMPERATURE:'Nhiệt độ',VIBRATION:'Độ rung động cơ',PRESSURE:'Áp suất',MOTOR_TEMP:'Nhiệt độ động cơ'};
  const filteredReadings = (data.telemetry_logs || []).filter(log => {const asset = data.assets.find(item => item.id === log.asset_id); return [asset?.name,asset?.asset_code].join(' ').toLowerCase().includes(searchTerm.toLowerCase()) && (sourceFilter === 'ALL' || sourceFilter === log.source) && (assetFilter === 'ALL' || String(log.asset_id) === assetFilter);}).sort((a,b) => new Date(b.recorded_at) - new Date(a.recorded_at));
  const pagination = usePagination(filteredReadings,[searchTerm,sourceFilter,assetFilter].join('|'));
  const latestReading = [...(data.telemetry_logs || [])].sort((a,b) => new Date(b.recorded_at) - new Date(a.recorded_at))[0];

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

  if (view === 'alerts' || view === 'thresholds') return <MonitorViews mode={view} onBack={() => setView(null)} onModeChange={setView} onSelectWorkOrder={onSelectWorkOrder} />;

  return (
    <div className="risova-page space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1>Cảm biến thiết bị</h1><p className="text-slate-500">Dữ liệu đo trực tiếp từ cảm biến. Cảnh báo là bản ghi riêng được sinh khi vượt ngưỡng.</p></div>
        <div className="flex items-center flex-wrap gap-3"><button onClick={() => setView('alerts')} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#DBE2EF] rounded text-xs font-semibold text-[#112D4E]"><AlertTriangle size={16} />Xem cảnh báo</button><button onClick={() => setView('thresholds')} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#DBE2EF] rounded text-xs font-semibold text-[#112D4E]"><Sliders size={16} />Quản lý ngưỡng</button>{canManage && <button onClick={() => setView('measurement')} className="inline-flex items-center gap-2 px-4 py-2 bg-[#3F72AF] text-white rounded text-xs font-semibold"><Plus size={15} />Thêm dữ liệu</button>}</div>
      </div>
      <div className="grid grid-cols-2 gap-4 max-w-xl">
        <div className="bg-white border border-slate-200 rounded-lg px-5 py-4"><p className="text-xs text-slate-500">Cảm biến trực tuyến</p><strong className="block mt-2 text-xl font-semibold">{new Set((data.telemetry_logs || []).map(log => log.asset_id)).size}/{data.assets.length}</strong></div>
        <div className="bg-white border border-slate-200 rounded-lg px-5 py-4"><p className="text-xs text-slate-500">Bản ghi gần nhất</p><strong className="block mt-2 text-xl font-semibold">{latestReading ? new Date(latestReading.recorded_at).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Ho_Chi_Minh'}) : '—'}</strong></div>
      </div>
      <section className="risova-data-table">
        <div className="risova-table-toolbar flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input aria-label="Tìm chỉ số thiết bị" placeholder="Tìm theo mã, tên thiết bị..." value={searchTerm} onChange={event => setSearchTerm(event.target.value)} className="w-full pl-9 pr-3 py-2 border border-slate-200 text-xs" /></div>
          <select aria-label="Nguồn chỉ số" value={sourceFilter} onChange={event => setSourceFilter(event.target.value)} className="px-3 py-2 border border-slate-200 text-xs text-slate-500"><option value="ALL">Tất cả nguồn</option><option value="IOT_SENSOR">Cảm biến IoT</option><option value="MANUAL">Nhập thủ công</option></select>
          <select aria-label="Thiết bị cảm biến" value={assetFilter} onChange={event => setAssetFilter(event.target.value)} className="px-3 py-2 border border-slate-200 text-xs text-slate-500"><option value="ALL">Tất cả thiết bị</option>{data.assets.map(asset => <option key={asset.id} value={asset.id}>{asset.name}</option>)}</select>
        </div>
        <div className="overflow-x-auto"><table className="w-full text-left whitespace-nowrap"><thead><tr>{['Mã thiết bị','Tên thiết bị','Chỉ số','Giá trị','Đơn vị','Nguồn','Thời gian'].map(label => <th key={label} className="px-4">{label}</th>)}</tr></thead><tbody>
          {pagination.items.map(log => {
            const asset = data.assets.find(item => item.id === log.asset_id);
            const threshold = data.asset_thresholds.find(item => item.asset_id === log.asset_id && item.metric_type === log.metric_type);
            return <tr key={log.id} className="border-b border-slate-100"><td className="px-4 font-semibold">{asset?.asset_code || '—'}</td><td className="px-4 text-slate-500">{asset?.name || 'Thiết bị chưa xác định'}</td><td className="px-4 text-slate-500">{metricLabels[log.metric_type] || log.metric_type}</td><td className={'px-4 font-medium ' + (threshold && log.value >= threshold.danger_limit ? 'text-red-500' : threshold && log.value >= threshold.warning_limit ? 'text-amber-600' : 'text-slate-600')}>{log.value}</td><td className="px-4 text-slate-500">{log.unit}</td><td className="px-4 text-slate-500"><span className="inline-flex items-center gap-2">{log.source === 'IOT_SENSOR' ? <><Radio size={15} className="text-[#3F72AF]" />IoT</> : data.users.find(user => user.id === log.recorded_by)?.full_name || 'Nhập thủ công'}</span></td><td className="px-4 text-xs text-slate-500">{new Date(log.recorded_at).toLocaleString('vi-VN')}</td></tr>;
          })}
          {!filteredReadings.length && <tr><td colSpan={7} className="text-center py-12 text-slate-400">Không tìm thấy chỉ số phù hợp.</td></tr>}
        </tbody></table></div>
        <Pagination {...pagination} />
      </section>
      {canManage && <button onClick={() => setView('simulator')} className="text-xs text-slate-400 hover:text-[#3F72AF] inline-flex items-center gap-2"><Sliders size={14} />Mở mô phỏng cảm biến</button>}

      {canManage && view === 'measurement' && <MeasurementDialog onClose={() => setView(null)} />}

      {canManage && view === 'simulator' && <Dialog title="Mô phỏng cảm biến" onClose={() => setView(null)} width={1100}>
      {/* 1. IOT SENSOR SIMULATOR DASHBOARD CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sensorConfigs.map(baseConfig => {
          const threshold = data.asset_thresholds.find(item => item.asset_id === baseConfig.assetId && item.metric_type === baseConfig.metric);
          const config = {...baseConfig,warnLimit:threshold?.warning_limit ?? baseConfig.warnLimit,dangerLimit:threshold?.danger_limit ?? baseConfig.dangerLimit};
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
                  aria-label={config.metricLabel}
                  onPointerUp={() => handleSliderRelease(config)}
                  onKeyUp={event => {if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)) handleSliderRelease(config);}}
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
                        setView(null);
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

      </Dialog>}

    </div>
  );
}
