import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useAuth, useData } from '../context/DataContext';
import Dialog from './Dialog';

export default function CreateWorkOrderModal({ isOpen, onClose, initialData = null }) {
  if (!isOpen) return null;
  return <CreateForm onClose={onClose} initialData={initialData} />;
}

function CreateForm({ onClose, initialData }) {
  const { data, ENUMS, createWorkOrder } = useData();
  const { currentUser } = useAuth();
  const [form, setForm] = useState(() => ({ title: '', asset_id: data.assets.find(asset => !asset.is_archived)?.id || '', wo_type: 'REPAIR', priority: 'MEDIUM', description: '', scheduled_start: '', scheduled_end: '', assigned_to: '', estimated_cost: '', labor_hours: '', parts: [], ...initialData }));
  const [partId, setPartId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const change = (key, value) => { setForm(previous => ({ ...previous, [key]: value })); setError(''); };
  const available = part => Math.max(0, Number(part.quantity_in_stock) - Number(part.reserved_quantity || 0));
  const field = (key, label, type = 'text', options) => <div key={key}><label htmlFor={'create-wo-' + key}>{label}</label>{options ? <select id={'create-wo-' + key} required={key === 'asset_id'} value={form[key]} onChange={event => change(key, event.target.value)}><option value="">Chọn...</option>{options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select> : <input id={'create-wo-' + key} type={type} required={key === 'title'} min={type === 'number' ? 0 : undefined} step={type === 'number' ? 'any' : undefined} value={form[key]} onChange={event => change(key, event.target.value)} />}</div>;
  function addPart() {
    const part = data.spare_parts.find(item => item.id === Number(partId));
    const amount = Number(quantity);
    if (!part || !Number.isFinite(amount) || amount <= 0) { setError('Chọn vật tư và nhập số lượng lớn hơn 0.'); return; }
    const existing = form.parts.find(item => item.part_id === part.id);
    const total = Number(existing?.quantity_needed || 0) + amount;
    if (total > available(part)) { setError('Số lượng vượt quá tồn kho khả dụng.'); return; }
    change('parts', existing ? form.parts.map(item => item.part_id === part.id ? { ...item, quantity_needed: total } : item) : [...form.parts, { part_id: part.id, quantity_needed: amount }]);
    setQuantity(1);
  }
  return <Dialog title="Thêm lệnh việc" width={1000} onClose={onClose}><form className="space-y-5" onSubmit={event => {
    event.preventDefault();
    if (!form.title.trim()) { setError('Vui lòng nhập tiêu đề công việc.'); return; }
    if (form.scheduled_start && form.scheduled_end && form.scheduled_end < form.scheduled_start) { setError('Thời gian kết thúc phải sau thời gian bắt đầu.'); return; }
    if (form.parts.some(item => { const part = data.spare_parts.find(part => part.id === item.part_id); return !part || Number(item.quantity_needed) > available(part); })) { setError('Một số vật tư không đủ tồn kho khả dụng.'); return; }
    createWorkOrder({ ...form, title: form.title.trim(), due_date: form.scheduled_end?.slice(0, 10) || undefined }, currentUser);
    onClose();
  }}>
    {field('title', 'Tiêu đề công việc')}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">{field('priority', 'Mức độ ưu tiên', 'text', Object.entries(ENUMS.PRIORITIES).map(([key, item]) => [key, item.label]))}{field('asset_id', 'Thiết bị', 'text', data.assets.filter(item => !item.is_archived).map(item => [item.id, item.name]))}</div>
    {field('description', 'Mô tả công việc')}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">{field('scheduled_start', 'Thời gian bắt đầu dự kiến', 'datetime-local')}{field('scheduled_end', 'Thời gian kết thúc dự kiến', 'datetime-local')}{field('assigned_to', 'Kỹ thuật viên phụ trách', 'text', data.users.filter(item => item.is_active !== false && ['TECHNICIAN', 'MANAGER'].includes(item.role)).map(item => [item.id, item.full_name]))}{field('estimated_cost', 'Chi phí dự kiến', 'number')}</div>
    <details className="border border-slate-200 rounded-md p-3"><summary className="text-xs text-slate-500 cursor-pointer">Loại công việc, giờ lao động và vật tư</summary><div className="space-y-4 mt-4"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{field('wo_type', 'Loại công việc', 'text', Object.entries(ENUMS.WO_TYPES).map(([key, item]) => [key, item.label]))}{field('labor_hours', 'Giờ lao động dự kiến', 'number')}</div><div className="grid grid-cols-[1fr_90px_auto] gap-2"><select aria-label="Vật tư giữ chỗ" value={partId} onChange={event => setPartId(event.target.value)}><option value="">Chọn vật tư</option>{data.spare_parts.filter(part => part.is_active !== false && !part.is_archived).map(part => <option key={part.id} value={part.id}>{part.name} · Khả dụng: {available(part)} {part.unit}</option>)}</select><input aria-label="Số lượng vật tư" type="number" min="0.01" step="any" value={quantity} onChange={event => setQuantity(event.target.value)} /><button type="button" onClick={addPart} aria-label="Thêm vật tư giữ chỗ"><Plus size={18} /></button></div>{form.parts.map(item => <div className="flex justify-between items-center text-xs" key={item.part_id}><span>{data.spare_parts.find(part => part.id === item.part_id)?.name} × {item.quantity_needed}</span><button type="button" aria-label="Gỡ vật tư" onClick={() => change('parts', form.parts.filter(part => part.part_id !== item.part_id))}><Trash2 size={15} /></button></div>)}</div></details>
    {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
    <div className="risova-form-actions"><button type="button" onClick={onClose}>Hủy</button><button type="submit">Tạo mới</button></div>
  </form></Dialog>;
}
