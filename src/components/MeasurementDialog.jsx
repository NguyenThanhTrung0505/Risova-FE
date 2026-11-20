import { useState } from 'react';
import { useAuth, useData } from '../context/DataContext';
import Dialog from './Dialog';
import { metricLabels, metricUnits } from '../constants/telemetry';

export default function MeasurementDialog({ assetId, onClose }) {
  const { data, simulateIoTMeasurement } = useData();
  const { currentUser } = useAuth();
  const [form, setForm] = useState({ asset_id: assetId || data.assets[0]?.id || '', metric_type: 'TEMPERATURE', value: '', unit: '°C' });
  function changeSelection(key, value) {
    const next = { ...form, [key]: value };
    const threshold = data.asset_thresholds.find(item => item.asset_id === Number(next.asset_id) && item.metric_type === next.metric_type);
    setForm({ ...next, unit: threshold?.unit || metricUnits[next.metric_type] });
  }
  return <Dialog title="Thêm dữ liệu" width={480} onClose={onClose}><form className="space-y-4" onSubmit={event => {
    event.preventDefault();
    simulateIoTMeasurement(Number(form.asset_id), form.metric_type, Number(form.value), form.unit.trim(), 'MANUAL', currentUser.id);
    onClose();
  }}>
    <div><label htmlFor="reading-asset">Thiết bị *</label><select id="reading-asset" required value={form.asset_id} onChange={event => changeSelection('asset_id', event.target.value)}>{data.assets.filter(item => !item.is_archived).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
    <div><label htmlFor="reading-metric">Chỉ số</label><select id="reading-metric" value={form.metric_type} onChange={event => changeSelection('metric_type', event.target.value)}>{Object.entries(metricLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div>
    <div><label htmlFor="reading-value">Giá trị</label><input id="reading-value" type="number" required step="any" placeholder="..." value={form.value} onChange={event => setForm({ ...form, value: event.target.value })} /></div>
    <div><label htmlFor="reading-unit">Đơn vị</label><input id="reading-unit" required placeholder="..." value={form.unit} onChange={event => setForm({ ...form, unit: event.target.value })} /></div>
    <div className="risova-form-actions"><button type="button" onClick={onClose}>Hủy</button><button type="submit">Thêm dữ liệu</button></div>
  </form></Dialog>;
}
