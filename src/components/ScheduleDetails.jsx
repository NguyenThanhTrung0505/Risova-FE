import { usePagination } from '../hooks/usePagination';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, CalendarClock, Pause, Pencil, Play, Plus, Search, Trash2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import Dialog from './Dialog';
import Pagination from './Pagination';
import { scheduleTypeLabels } from '../constants/schedules';

const date = value => value ? new Date(value).toLocaleDateString('vi-VN') : 'Chưa cập nhật';
const number = value => Number(value || 0).toLocaleString('vi-VN');
function Fields({ fields }) { return <dl className="wo-timeline">{fields.map(([label, value]) => <div className="wo-field" key={label}><dt>{label}</dt><dd>{value ?? '—'}</dd></div>)}</dl>; }

function ScheduleParts({ schedule }) {
  const { data, updateMaintenanceSchedule } = useData();
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(false);
  const [partId, setPartId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const parts = (schedule.parts || []).map(item => ({ ...data.spare_parts.find(part => part.id === item.part_id), ...item }));
  const filtered = parts.filter(item => [item.name, item.part_code].join(' ').toLowerCase().includes(search.toLowerCase()));
  const pages = usePagination(filtered, search + '|' + schedule.id);
  const total = parts.reduce((sum, part) => sum + Number(part.unit_price || 0) * part.quantity_needed, 0);
  return <section className="risova-data-table"><div className="risova-table-toolbar">
    <div className="flex justify-between items-center mb-4"><h2 className="text-sm font-semibold">Danh mục vật tư thiết bị ({parts.length})</h2><button className="wo-primary inline-flex gap-2 items-center" onClick={() => setAdding(true)}><Plus size={16} />Thêm vật tư</button></div>
    <div className="flex flex-wrap justify-between items-center gap-3"><div className="relative w-full max-w-md"><Search size={16} className="absolute left-3 top-3 text-slate-400" /><input className="w-full border border-[#DBE2EF] rounded-md pl-9 pr-3 py-2 text-xs" aria-label="Tìm vật tư bảo trì" placeholder="Tìm theo tên, mã,..." value={search} onChange={event => setSearch(event.target.value)} /></div><strong className="text-sm">Tổng tiền: {number(total)} đ</strong></div>
  </div><div className="overflow-x-auto"><table className="w-full text-left whitespace-nowrap"><thead><tr>{['Mã vật tư', 'Tên vật tư', 'Đơn vị', 'Số lượng', 'Đơn giá', 'Số tiền', ''].map((label, index) => <th className="px-4" key={index}>{label}</th>)}</tr></thead><tbody>{pages.items.map(item => <tr key={item.part_id} className="border-b border-slate-100"><td className="px-4"><Link className="wo-link" to={'/inventory?part=' + item.part_id}>{item.part_code}</Link></td><td className="px-4">{item.name}</td><td className="px-4">{item.unit}</td><td className="px-4">{number(item.quantity_needed)}</td><td className="px-4">{number(item.unit_price)} đ</td><td className="px-4">{number(item.unit_price * item.quantity_needed)} đ</td><td className="px-4"><button aria-label={'Gỡ ' + item.name} onClick={() => updateMaintenanceSchedule(schedule.id, { parts: schedule.parts.filter(part => part.part_id !== item.part_id) })}><Trash2 size={15} className="text-red-500" /></button></td></tr>)}{!filtered.length && <tr><td colSpan={7} className="risova-empty-state">Chưa có vật tư phù hợp.</td></tr>}</tbody></table></div><Pagination {...pages} />
    {adding && <Dialog title="Thêm vật tư bảo trì" width={480} onClose={() => setAdding(false)}><form className="space-y-4" onSubmit={event => { event.preventDefault(); const id = Number(partId); const existing = schedule.parts || []; const next = existing.some(part => part.part_id === id) ? existing.map(part => part.part_id === id ? { ...part, quantity_needed: Number(part.quantity_needed) + Number(quantity) } : part) : [...existing, { part_id: id, quantity_needed: Number(quantity) }]; updateMaintenanceSchedule(schedule.id, { parts: next }); setAdding(false); }}><div><label htmlFor="schedule-part">Vật tư</label><select id="schedule-part" required value={partId} onChange={event => setPartId(event.target.value)}><option value="">Chọn vật tư</option>{data.spare_parts.filter(item => !item.is_archived && item.is_active !== false).map(item => <option key={item.id} value={item.id}>{item.part_code} · {item.name}</option>)}</select></div><div><label htmlFor="schedule-part-quantity">Số lượng</label><input id="schedule-part-quantity" type="number" required min="0.01" step="any" value={quantity} onChange={event => setQuantity(event.target.value)} /></div><div className="risova-form-actions"><button type="button" onClick={() => setAdding(false)}>Hủy</button><button type="submit">Thêm vật tư</button></div></form></Dialog>}
  </section>;
}

export default function ScheduleDetails({ schedule, tab, onChangeTab, onBack, onEdit, onGenerate, ordersView }) {
  const { data, updateMaintenanceSchedule } = useData();
  const [removeOpen, setRemoveOpen] = useState(false);
  const [referenceTime] = useState(() => Date.now());
  const asset = data.assets.find(item => item.id === schedule.asset_id);
  const location = data.locations.find(item => item.id === asset?.location_id);
  const specialty = data.specialties.find(item => item.id === schedule.assigned_specialty_id);
  const unit = asset?.meter_unit === 'CYCLES' ? 'chu kỳ' : asset?.meter_unit === 'KM' ? 'km' : 'giờ';
  const timed = schedule.schedule_type !== 'METER_BASED';
  const metered = schedule.schedule_type !== 'TIME_BASED';
  const orders = data.work_orders.filter(item => item.schedule_id === schedule.id);
  const daysLeft = schedule.next_due_date ? Math.ceil((new Date(schedule.next_due_date) - referenceTime) / 86400000) : null;
  const meterLeft = schedule.next_due_meter == null ? null : schedule.next_due_meter - Number(asset?.current_meter || 0);
  const remaining = [timed && daysLeft != null && number(daysLeft) + ' ngày', metered && meterLeft != null && number(meterLeft) + ' ' + unit].filter(Boolean).join(' / ');
  return <>
    <button className="wo-back" onClick={onBack}><ArrowLeft size={15} />Bảo trì định kỳ</button>
    <header className="wo-detail-heading"><span className="wo-heading-icon"><CalendarClock size={28} /></span><div><h1>{schedule.title}</h1><div className="wo-badges"><span className={'risova-status-badge ' + (schedule.is_active === false ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-600')}>{schedule.is_active === false ? 'Tạm dừng' : 'Đang hoạt động'}</span><span className="risova-status-badge bg-[#DBE2EF] text-[#3F72AF]">{scheduleTypeLabels[schedule.schedule_type]}</span></div></div><div className="wo-heading-actions"><button onClick={onEdit}><Pencil size={16} />Chỉnh sửa</button><button onClick={() => updateMaintenanceSchedule(schedule.id, { is_active: schedule.is_active === false, paused_at: schedule.is_active === false ? null : new Date().toISOString() })}>{schedule.is_active === false ? <Play size={16} /> : <Pause size={16} />}{schedule.is_active === false ? 'Tiếp tục' : 'Tạm dừng'}</button><button className="is-danger" onClick={() => setRemoveOpen(true)}><Trash2 size={16} />Xóa</button></div></header>
    <nav className="risova-tabs" aria-label="Chi tiết lịch bảo trì">{[['overview', 'Tổng quan'], ['orders', 'Lịch sử bảo trì'], ['parts', 'Vật tư']].map(([key, label]) => <button key={key} aria-selected={key === tab} onClick={() => onChangeTab(key)}>{label}</button>)}</nav>
    {tab === 'overview' && <>
      <div className="wo-detail-grid"><section className="wo-card"><h2>Thông tin thiết bị</h2><div className="wo-asset-info"><img className="wo-asset-image" style={{ height: 222 }} src={asset?.details?.image_url || (asset?.asset_code === 'CV-01' ? '/conveyor-cv01.jpg' : '/machine-cnc.jpg')} alt={asset?.name || 'Thiết bị bảo trì'} /><div className="grid grid-cols-2 gap-4"><Fields fields={[
        ['Thiết bị', <><Link className="wo-link" to={'/equipment?asset=' + schedule.asset_id}>Xem chi tiết <ArrowUpRight size={14} /></Link><div>{asset?.name}</div></>], ['Vị trí lắp đặt', location?.name], ['Tổng WO', orders.length + ' lần'], ['Thời gian dự kiến', number(schedule.estimated_duration_hours) + ' giờ'],
      ]} /><Fields fields={[[ 'Model', asset?.details?.model], ['Thời gian còn lại', remaining || 'Chưa cấu hình'], ['Chuyên môn', specialty?.name || 'Chưa phân công']]} /></div></div></section><section className="wo-card"><h2>Nhật ký thời gian</h2><Fields fields={[[ 'Tạo bảo trì', date(schedule.created_at)], ['Cập nhật bảo trì', date(schedule.updated_at)], ['Tạm dừng bảo trì', date(schedule.paused_at)]]} /></section></div>
      <div className="schedule-config-grid">{timed && <section className="wo-card"><h2>Cấu hình bảo trì (Theo thời gian)</h2><Fields fields={[[ 'Chu kỳ', number(schedule.frequency_days) + ' ngày'], ['Ngày gần nhất', date(schedule.last_completed_date)], ['Ngày đến hạn', date(schedule.next_due_date)], ['Ngưỡng tạo WO', number(schedule.generate_lead_days) + ' ngày'], ['Ngày tạo WO', schedule.next_due_date ? date(new Date(new Date(schedule.next_due_date).getTime() - Number(schedule.generate_lead_days || 0) * 86400000)) : 'Chưa cấu hình']]} /></section>}{metered && <section className="wo-card"><h2>Cấu hình bảo trì (Theo mức sử dụng)</h2><Fields fields={[[ 'Chu kỳ', number(schedule.meter_interval) + ' ' + unit], ['Chỉ số gần nhất', number(schedule.last_pm_meter) + ' ' + unit], ['Chỉ số đến hạn', number(schedule.next_due_meter) + ' ' + unit], ['Ngưỡng tạo WO', number(schedule.generate_lead_meter) + ' ' + unit], ['Chỉ số tạo WO', number(Number(schedule.next_due_meter) - Number(schedule.generate_lead_meter || 0)) + ' ' + unit]]} /></section>}</div>
      {schedule.notes && <section className="wo-card"><h2>Ghi chú</h2><p>{schedule.notes}</p></section>}
      {onGenerate && schedule.is_active !== false && <button className="wo-primary inline-flex items-center gap-2" onClick={() => onGenerate(schedule)}><Plus size={16} />Tạo lệnh việc từ lịch bảo trì</button>}
    </>}
    {tab === 'orders' && ordersView}
    {tab === 'parts' && <ScheduleParts schedule={schedule} />}
    {removeOpen && <Dialog title="Xóa lịch bảo trì" width={440} onClose={() => setRemoveOpen(false)}><p>Lịch “{schedule.title}” sẽ ngừng hoạt động và chuyển vào lưu trữ.</p><div className="risova-form-actions"><button onClick={() => setRemoveOpen(false)}>Hủy</button><button className="is-primary" onClick={() => { updateMaintenanceSchedule(schedule.id, { is_active: false, is_archived: true }); onBack(); }}>Xóa lịch bảo trì</button></div></Dialog>}
  </>;
}
