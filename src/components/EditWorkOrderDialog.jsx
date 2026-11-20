import { useState } from 'react';
import { useAuth, useData } from '../context/DataContext';
import Dialog from './Dialog';
import { readEquipmentImage } from '../utils/equipmentImage';
import { workOrderReasonFields } from '../utils/workOrders';

const tabs = ['Nội dung công việc', 'Phân tích và xử lý', 'Checklist'];
const localDateTime = value => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = number => String(number).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function EditWorkOrderDialog({ order, onClose }) {
  const { data, ENUMS, updateWorkOrder, updateWorkOrderStatus } = useData();
  const { currentUser } = useAuth();
  const [error, setError] = useState('');
  const [readingImage, setReadingImage] = useState(false);
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState({
    ...order,
    assigned_to: order.assigned_to || '',
    verified_by: order.verified_by || '',
    description: order.description || '',
    ...Object.fromEntries(['scheduled_start', 'scheduled_end', 'actual_start', 'actual_end'].map(key => [key, localDateTime(order[key])])),
    checklists: (order.checklists || []).map(step => ({ ...step, completed_at: localDateTime(step.completed_at) })),
  });
  const [stepIndex, setStepIndex] = useState(0);
  const change = (key, value) => { setForm(previous => ({ ...previous, [key]: value })); setError(''); };
  const step = form.checklists[stepIndex];
  const reasonField = workOrderReasonFields[form.status];
  const changeStep = (key, value) => change('checklists', form.checklists.map((item, index) => index === stepIndex ? { ...item, [key]: value } : item));

  function field(label, key, type = 'text', options) {
    const id = 'work-order-' + key;
    return <div key={key}>
      <label htmlFor={id}>{label}</label>
      {options ? <select id={id} value={form[key] ?? ''} onChange={event => change(key, event.target.value)}>
        <option value="">Chọn...</option>
        {options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
      </select> : <input id={id} type={type} required={key === 'title'} min={type === 'number' ? 0 : undefined} step={type === 'number' ? 'any' : undefined} value={form[key] ?? ''} onChange={event => change(key, event.target.value)} />}
    </div>;
  }
  const people = data.users.map(user => [user.id, user.full_name]);

  return <Dialog title="Chỉnh sửa lệnh việc" onClose={onClose} width={1000}>
    <div className="risova-tabs mb-5" role="tablist" aria-label="Chỉnh sửa lệnh việc">
      {tabs.map((label, index) => <button type="button" role="tab" key={label} aria-selected={index === tab} onClick={() => setTab(index)}>{label}</button>)}
    </div>
    <form className="space-y-4" onSubmit={event => {
      event.preventDefault();
      if (!form.title.trim() || !form.asset_id || !form.status) { setError('Vui lòng nhập tiêu đề, thiết bị và trạng thái.'); return; }
      if ((form.scheduled_start && form.scheduled_end && form.scheduled_end < form.scheduled_start) || (form.actual_start && form.actual_end && form.actual_end < form.actual_start)) { setError('Thời gian kết thúc phải sau thời gian bắt đầu.'); return; }
      const { status, ...updates } = form;
      updateWorkOrder(order.id, {
        ...updates, title: form.title.trim(), asset_id: Number(form.asset_id),
        assigned_to: form.assigned_to ? Number(form.assigned_to) : null,
        verified_by: form.verified_by ? Number(form.verified_by) : null,
        failure_code_id: form.failure_code_id ? Number(form.failure_code_id) : null,
        labor_hours: Number(form.labor_hours || 0), estimated_cost: Number(form.estimated_cost || 0),
      });
      if (status !== order.status) updateWorkOrderStatus(order.id, status, currentUser, form[workOrderReasonFields[status]] || '');
      onClose();
    }}>
      {tab === 0 && <>
        {field('Tiêu đề công việc', 'title')}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field('Loại công việc', 'wo_type', 'text', Object.entries(ENUMS.WO_TYPES).map(([key, item]) => [key, item.label]))}
          {field('Mức độ ưu tiên', 'priority', 'text', Object.entries(ENUMS.PRIORITIES).map(([key, item]) => [key, item.label]))}
          {field('Trạng thái', 'status', 'text', Object.entries(ENUMS.WO_STATUSES).map(([key, item]) => [key, item.label]))}
          {field('Thiết bị', 'asset_id', 'text', data.assets.map(asset => [asset.id, asset.name]))}
          {field('Thời gian bắt đầu', 'scheduled_start', 'datetime-local')}
          {field('Thời gian kết thúc', 'scheduled_end', 'datetime-local')}
          {field('Giờ công', 'labor_hours', 'number')}
          {field('Chi phí dự kiến', 'estimated_cost', 'number')}
          {field('Kỹ thuật viên phụ trách', 'assigned_to', 'text', people)}
          {field('Người nghiệm thu', 'verified_by', 'text', people)}
        </div>
      </>}
      {tab === 1 && <>
        {field('Mô tả công việc', 'description')}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field('Mã lỗi', 'failure_code_id', 'text', (data.failure_codes || []).map(item => [item.id, item.name || item.code]))}
          {field('Nhóm lỗi', 'failure_group', 'text', [...new Set(data.failure_codes.map(item => item.category))].filter(Boolean).map(category => [category, category]))}
          {field('Thời gian máy dừng', 'actual_start', 'datetime-local')}
          {field('Thời gian máy hoạt động lại', 'actual_end', 'datetime-local')}
        </div>
        {reasonField ? field('Lý do', reasonField) : <>{field('Nguyên nhân gốc rễ', 'root_cause')}{field('Phương án xử lý', 'resolution_notes')}</>}
      </>}
      {tab === 2 && <>
        <div><label htmlFor="checklist-task">Tên nhiệm vụ</label>
          <select id="checklist-task" value={stepIndex} onChange={event => setStepIndex(Number(event.target.value))}>
            {form.checklists.map((item, index) => <option key={item.id} value={index}>{item.task_description}</option>)}
          </select>
        </div>
        {step ? <>
          <div><label htmlFor="step-instructions">Hướng dẫn</label><input id="step-instructions" value={step.instructions || ''} onChange={event => changeStep('instructions', event.target.value)} /></div>
          <div><label htmlFor="step-image">Ảnh nghiệm thu</label><input id="step-image" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={async event => {
            const file = event.target.files[0];
            if (!file) return;
            setReadingImage(true);
            try { changeStep('image_url', await readEquipmentImage(file)); } catch (issue) { setError(issue.message); } finally { setReadingImage(false); }
          }} /></div>
          {step.image_url && <img src={step.image_url} alt="Ảnh nghiệm thu đã chọn" className="max-h-28 rounded" />}
          <div><label htmlFor="step-position">Vị trí hiển thị</label><input id="step-position" type="number" min="1" value={step.step_number || stepIndex + 1} onChange={event => changeStep('step_number', Number(event.target.value))} /></div>
          <div><label htmlFor="step-note">Ghi chú</label><input id="step-note" value={step.note || ''} onChange={event => changeStep('note', event.target.value)} /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label htmlFor="step-person">Người thực hiện</label><select id="step-person" value={step.completed_by || ''} onChange={event => changeStep('completed_by', Number(event.target.value))}><option value="">Chọn người thực hiện</option>{people.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></div>
            <div><label htmlFor="step-completed">Thời gian hoàn thành</label><input id="step-completed" type="datetime-local" value={step.completed_at || ''} onChange={event => changeStep('completed_at', event.target.value)} /></div>
          </div>
        </> : <p className="text-sm text-slate-500">Lệnh việc chưa có nhiệm vụ trong checklist.</p>}
      </>}
      {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
      <div className="risova-form-actions"><button type="button" onClick={onClose}>Hủy</button><button type="submit" disabled={readingImage}>Lưu thay đổi</button></div>
    </form>
  </Dialog>;
}
