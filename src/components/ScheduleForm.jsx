import { scheduleTypeLabels } from '../constants/schedules';
import { useId, useState } from 'react';
import Dialog from './Dialog';


const blankSchedule = {
  title: '',
  schedule_type: 'TIME_BASED',
  assigned_specialty_id: '',
  frequency_days: 30,
  meter_interval: 2000,
  generate_lead_days: 7,
  generate_lead_meter: 100,
  estimated_duration_hours: 2,
  notes: '',
  is_active: true,
};

function defaultDueDate() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return [year, month, day].join('-');
}

export default function ScheduleForm({ schedule, assets, specialties, onSave, onClose }) {
  const id = useId();
  const [form, setForm] = useState(() => ({
    ...blankSchedule,
    asset_id: assets[0]?.id || '',
    ...schedule,
    notes: schedule?.notes ?? schedule?.description ?? '',
    next_due_date: schedule ? schedule.next_due_date?.slice(0, 10) || '' : defaultDueDate(),
    next_due_meter: schedule?.next_due_meter ?? '',
  }));
  const [error, setError] = useState('');
  const timed = form.schedule_type !== 'METER_BASED';
  const metered = form.schedule_type !== 'TIME_BASED';
  const asset = assets.find(item => String(item.id) === String(form.asset_id));
  const meterUnit = asset?.meter_unit === 'HOURS' ? 'giờ' : asset?.meter_unit === 'CYCLES' ? 'chu kỳ' : 'đơn vị';

  function change(field, value) {
    setForm(previous => ({ ...previous, [field]: value }));
    setError('');
  }

  function submit(event) {
    event.preventDefault();
    if (!form.title.trim() || !asset) {
      setError('Vui lòng nhập tên lịch bảo trì và chọn thiết bị.');
      return;
    }
    onSave({
      title: form.title.trim(),
      asset_id: asset.id,
      schedule_type: form.schedule_type,
      assigned_specialty_id: form.assigned_specialty_id ? Number(form.assigned_specialty_id) : null,
      frequency_days: timed ? Number(form.frequency_days) : null,
      next_due_date: timed ? form.next_due_date || null : null,
      generate_lead_days: timed ? Number(form.generate_lead_days) : null,
      meter_interval: metered ? Number(form.meter_interval) : null,
      next_due_meter: metered ? Number(form.next_due_meter || Number(asset.current_meter || 0) + Number(form.meter_interval)) : null,
      generate_lead_meter: metered ? Number(form.generate_lead_meter) : null,
      estimated_duration_hours: Number(form.estimated_duration_hours),
      is_active: form.is_active !== false,
      notes: form.notes.trim(),
    });
  }

  return (
    <Dialog title={schedule ? 'Chỉnh sửa bảo trì định kỳ' : 'Tạo bảo trì định kỳ'} onClose={onClose} width={922}>
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label htmlFor={id + '-title'}>Tên lịch bảo trì</label>
          <input id={id + '-title'} value={form.title} onChange={event => change('title', event.target.value)} placeholder="..." required />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor={id + '-asset'}>Thiết bị *</label>
            <select id={id + '-asset'} value={form.asset_id} onChange={event => change('asset_id', event.target.value)} required>
              <option value="">...</option>
              {assets.map(item => <option key={item.id} value={item.id}>{item.asset_code} · {item.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor={id + '-type'}>Loại lịch</label>
            <select id={id + '-type'} value={form.schedule_type} onChange={event => change('schedule_type', event.target.value)} required>
              {Object.entries(scheduleTypeLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor={id + '-duration'}>Thời gian làm việc dự kiến</label>
            <input id={id + '-duration'} type="number" min="0" step="any" placeholder="..." value={form.estimated_duration_hours ?? ''} onChange={event => change('estimated_duration_hours', event.target.value)} />
          </div>
          <div>
            <label htmlFor={id + '-specialty'}>Chuyên môn</label>
            <select id={id + '-specialty'} value={form.assigned_specialty_id || ''} onChange={event => change('assigned_specialty_id', event.target.value)}>
              <option value="">...</option>
              {specialties.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor={id + '-frequency'}>Chu kỳ theo thời gian</label>
            <input id={id + '-frequency'} type="number" min="1" placeholder="...." disabled={!timed} value={timed ? (form.frequency_days ?? 30) : ''} onChange={event => change('frequency_days', event.target.value)} required={timed} />
          </div>
          <div>
            <label htmlFor={id + '-interval'}>Chu kỳ theo mức độ sử dụng ({meterUnit})</label>
            <input id={id + '-interval'} type="number" min="1" step="any" placeholder="...." disabled={!metered} value={metered ? (form.meter_interval ?? 2000) : ''} onChange={event => change('meter_interval', event.target.value)} required={metered} />
          </div>
          {schedule && (
            <>
              <div>
                <label htmlFor={id + '-last-date'}>Ngày gần nhất</label>
                <input id={id + '-last-date'} type="date" disabled={!timed} value={form.last_completed_date?.slice(0, 10) || form.next_due_date || ''} onChange={event => change('last_completed_date', event.target.value)} />
              </div>
              <div>
                <label htmlFor={id + '-last-meter'}>Chỉ số gần nhất</label>
                <input id={id + '-last-meter'} type="number" min="0" step="any" placeholder="..." disabled={!metered} value={form.last_pm_meter ?? ''} onChange={event => change('last_pm_meter', event.target.value)} />
              </div>
            </>
          )}
          <div>
            <label htmlFor={id + '-lead-days'}>Ngưỡng tạo WO (theo thời gian)</label>
            <input id={id + '-lead-days'} type="number" min="0" placeholder="..." disabled={!timed} value={timed ? (form.generate_lead_days ?? 7) : ''} onChange={event => change('generate_lead_days', event.target.value)} />
          </div>
          <div>
            <label htmlFor={id + '-lead-meter'}>Ngưỡng tạo WO (theo mức độ sử dụng)</label>
            <input id={id + '-lead-meter'} type="number" min="0" step="any" placeholder="..." disabled={!metered} value={metered ? (form.generate_lead_meter ?? 100) : ''} onChange={event => change('generate_lead_meter', event.target.value)} />
          </div>
        </div>
        {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
        <div className="risova-form-actions">
          <button type="button" onClick={onClose}>Hủy</button>
          <button type="submit">{schedule ? 'Lưu thay đổi' : 'Tạo mới'}</button>
        </div>
      </form>
    </Dialog>
  );
}
