import { SKILL_LEVELS } from '../constants/personnel';
import { useId, useState } from 'react';
import { useData } from '../context/DataContext';
import Dialog from './Dialog';
import '../styles/people.css';

const emptyUser = {
  full_name: '',
  email: '',
  phone: '',
  employee_code: '',
  role: '',
  specialty_id: '',
  skill_level: '',
  work_date: '',
  work_shift_id: '',
  is_active: true,
  is_available: true,
};


export default function PersonnelEditor({ person, onClose, canSetRole = false }) {
  const { data, ENUMS, savePersonnel } = useData();
  const [form, setForm] = useState(() => ({ ...emptyUser, ...person }));
  const [error, setError] = useState('');
  const formId = useId();
  const roles = Object.entries(ENUMS.USER_ROLES).filter(([key]) => canSetRole || key !== 'ADMIN' || form.role === 'ADMIN');

  function change(event) {
    const { name, value } = event.target;
    setForm(previous => ({ ...previous, [name]: value }));
    setError('');
  }

  function submit(event) {
    event.preventDefault();
    const name = form.full_name.trim();
    const email = form.email.trim();

    if (!name) {
      setError('Vui lòng nhập tên nhân viên.');
      return;
    }
    if (data.users.some(user => user.id !== person?.id && user.email?.toLowerCase() === email.toLowerCase())) {
      setError('Email này đã được sử dụng.');
      return;
    }
    savePersonnel('users', {
      ...form,
      full_name: name,
      email,
      phone: form.phone?.trim() || '',
      specialty_id: form.specialty_id ? Number(form.specialty_id) : null,
      work_shift_id: form.work_shift_id ? Number(form.work_shift_id) : null,
      is_active: String(form.is_active) === 'true',
      is_available: String(form.is_available) === 'true',
      created_at: form.created_at || new Date().toISOString(),
    });
    onClose();
  }

  const fields = [
    { name: 'full_name', label: 'Tên nhân viên', required: true, autoComplete: 'name' },
    { name: 'email', label: 'Email', required: true, type: 'email', autoComplete: 'email' },
    { name: 'phone', label: 'Số điện thoại', type: 'tel', autoComplete: 'tel' },
    { name: 'role', label: 'Vai trò', required: true, options: [['', '...'], ...roles.map(([key, value]) => [key, value.label])] },
    { name: 'specialty_id', label: 'Chuyên môn', options: [['', '...'], ...data.specialties.filter(item => item.is_active !== false || String(item.id) === String(form.specialty_id)).map(item => [item.id, item.name])] },
    { name: 'skill_level', label: 'Mức độ chuyên môn', options: [['', '...'], ...Object.entries(SKILL_LEVELS)] },
    { name: 'work_date', label: 'Ngày làm việc', type: 'date' },
    { name: 'work_shift_id', label: 'Ca làm việc', options: [['', '...'], ...data.work_shifts.map(item => [item.id, item.name])] },
  ];
  const editFields = ['specialty_id', 'skill_level', 'work_shift_id', 'work_date'].map(name => fields.find(field => field.name === name));
  editFields.push({ name: 'is_available', label: 'Trạng thái làm việc', options: [['true', 'Sẵn sàng'], ['false', 'Đang bận']] });

  return <Dialog title={person ? 'Chỉnh sửa người dùng' : 'Tạo tài khoản'} width={person ? 552 : 922} onClose={onClose}>
    <form className={person ? 'risova-personnel-edit' : 'risova-personnel-create'} onSubmit={submit}>
      <div className={`risova-personnel-editor-fields grid grid-cols-1 ${person ? '' : 'sm:grid-cols-2'}`}>
        {(person ? editFields : fields).map(({ name, label, options, type = 'text', required = false, autoComplete }) => {
          const id = `${formId}-${name}`;
          return <div key={name}>
            <label htmlFor={id}>{label}</label>
            {options
              ? <select id={id} name={name} value={String(form[name] ?? '')} required={required} onChange={change}>
                {options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
              </select>
              : <input id={id} name={name} type={type} value={form[name] || ''} placeholder={type !== 'date' ? '...' : undefined} required={required} autoComplete={autoComplete} onChange={change} />}
          </div>;
        })}
      </div>
      {error && <p role="alert" className="mb-0 mt-3 text-xs text-red-600">{error}</p>}
      <div className="risova-form-actions !justify-center">
        <button type="button" onClick={onClose}>Hủy</button>
        <button type="submit">{person ? 'Lưu' : 'Lưu thay đổi'}</button>
      </div>
    </form>
  </Dialog>;
}
