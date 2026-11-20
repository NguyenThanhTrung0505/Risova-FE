import { usePagination } from '../../hooks/usePagination';
import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useAuth, useData } from '../../context/DataContext';
import { canManagePage } from '../../constants/permissions';
import Pagination from '../../components/Pagination';
import MeasurementDialog from '../../components/MeasurementDialog';
import { metricLabels } from '../../constants/telemetry';
import { equipmentFieldClass } from './EquipmentFields';

export default function AssetTelemetry({ asset }) {
  const { currentUser } = useAuth();
  const { data } = useData();
  const canManageIot = canManagePage(currentUser?.role, 'iot');
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('');
  const [from, setFrom] = useState('');
  const [until, setUntil] = useState('');
  const [adding, setAdding] = useState(false);
  const records = data.telemetry_logs.filter(item => item.asset_id === asset.id);
  const filtered = records.filter(item => (metricLabels[item.metric_type] || item.metric_type).toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi'))
    && (!source || item.source === source) && (!from || item.recorded_at.slice(0, 10) >= from) && (!until || item.recorded_at.slice(0, 10) <= until))
    .sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at));
  const pages = usePagination(filtered, [search, source, from, until, asset.id].join('|'));
  return <section className="equipment-card equipment-tab-card">
    <div className="equipment-card-heading"><h2>Dữ liệu đo được ({records.length})</h2>{canManageIot && <button className="equipment-button equipment-button-primary" onClick={() => setAdding(true)}><Plus size={16} />Dữ liệu</button>}</div>
    <div className="equipment-filters"><div className="relative"><Search className="absolute top-3 left-3 text-slate-400" size={15} /><input className={equipmentFieldClass + ' !pl-9'} aria-label="Tìm theo chỉ số" placeholder="Tìm theo chỉ số,..." value={search} onChange={event => setSearch(event.target.value)} /></div>
      <select className={equipmentFieldClass} aria-label="Nguồn dữ liệu" value={source} onChange={event => setSource(event.target.value)}><option value="">Nguồn dữ liệu</option><option value="IOT_SENSOR">Cảm biến IoT</option><option value="MANUAL">Nhập thủ công</option></select>
      <input className={equipmentFieldClass} type="date" aria-label="Từ ngày" value={from} max={until || undefined} onChange={event => setFrom(event.target.value)} /><input className={equipmentFieldClass} type="date" aria-label="Đến ngày" value={until} min={from || undefined} onChange={event => setUntil(event.target.value)} />
    </div>
    <div className="overflow-x-auto"><table className="w-full text-left whitespace-nowrap"><thead><tr><th>Chỉ số</th><th>Giá trị</th><th>Đơn vị</th><th>Nguồn dữ liệu</th><th>Thời gian</th></tr></thead><tbody>{pages.items.map(item => <tr key={item.id}><td className="font-semibold">{metricLabels[item.metric_type] || item.metric_type}</td><td>{item.value}</td><td>{item.unit}</td><td>{item.source === 'IOT_SENSOR' ? 'Cảm biến IoT' : 'Nhập thủ công'}</td><td>{new Date(item.recorded_at).toLocaleString('vi-VN')}</td></tr>)}{!filtered.length && <tr><td colSpan={5} className="risova-empty-state">Chưa có dữ liệu phù hợp.</td></tr>}</tbody></table></div>
    <Pagination {...pages} />
    {adding && <MeasurementDialog assetId={asset.id} onClose={() => setAdding(false)} />}
  </section>;
}
