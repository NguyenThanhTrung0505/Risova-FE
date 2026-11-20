import { usePagination } from '../hooks/usePagination';
import { SKILL_LEVELS } from '../constants/personnel';
import { useState } from 'react';
import { CalendarClock, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import Dialog from '../components/Dialog';
import Pagination from '../components/Pagination';
import PersonnelEditor from '../components/PersonnelEditor';
import { useAuth, useData } from '../context/DataContext';

const tabs = [
  { id: 'users', label: 'Người dùng' },
  { id: 'specialties', label: 'Chuyên môn' },
  { id: 'work_shifts', label: 'Ca làm việc' },
];

const columns = {
  users: ['Mã nhân viên', 'Họ và tên', 'Email', 'Số điện thoại', 'Vai trò', 'Chuyên môn', 'Trạng thái tài khoản', 'Trạng thái làm việc'],
  specialties: ['STT', 'Tên chuyên môn', 'Số nhân viên', 'Trạng thái', 'Ngày tạo', 'Ngày sửa', 'Hành động'],
  work_shifts: ['STT', 'Tên ca', 'Số nhân viên', 'Giờ bắt đầu', 'Giờ kết thúc', 'Ngày tạo', 'Ngày sửa', 'Hành động'],
};

const accountFilters = [['true', 'Hoạt động'], ['false', 'Đã khóa']];
const availabilityFilters = [['true', 'Sẵn sàng'], ['false', 'Đang bận']];

const selectClass = 'min-w-0 max-w-full border border-slate-200 px-3 py-2 text-xs text-slate-500';
const primaryButton = 'inline-flex items-center justify-center gap-2 rounded-md bg-[#3F72AF] px-4 py-2 text-sm font-semibold text-white hover:bg-[#305b8e]';

function Badge({ active, yes, no }) {
  return <span className={`risova-status-badge ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
    {active ? yes : no}
  </span>;
}

function Filter({ label, value, onChange, options }) {
  return <select aria-label={label} value={value} onChange={event => onChange(event.target.value)} className={selectClass}>
    <option value="ALL">{label}</option>
    {options.map(([key, name]) => <option key={key} value={key}>{name}</option>)}
  </select>;
}

function PersonDetail({ user, canManage, onEdit, onClose }) {
  const { data, ENUMS } = useData();
  const role = ENUMS.USER_ROLES[user.role]?.label || user.role;
  const specialty = data.specialties.find(item => String(item.id) === String(user.specialty_id));
  const shift = data.work_shifts.find(item => String(item.id) === String(user.work_shift_id));
  const fields = [
    ['Mã nhân viên', user.employee_code],
    ['Họ và tên', user.full_name],
    ['Email', user.email],
    ['Số điện thoại', user.phone],
    ['Vai trò', role],
    ['Chuyên môn', specialty?.name],
    ['Mức độ chuyên môn', SKILL_LEVELS[user.skill_level]],
    ['Ca làm việc', shift?.name],
    ['Ngày làm việc', formatDate(user.work_date)],
    ['Trạng thái tài khoản', <Badge active={user.is_active !== false} yes="Hoạt động" no="Đã khóa" />],
    ['Trạng thái làm việc', <Badge active={user.is_available} yes="Sẵn sàng" no="Đang bận" />],
  ];

  return <Dialog title="Chi tiết người dùng" width={640} onClose={onClose}>
    <div className="risova-person-detail">
      <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
        {fields.map(([label, value]) => <div key={label} className={label === 'Vai trò' ? 'sm:col-span-2' : undefined}>
          <dt className="text-xs font-semibold text-slate-500">{label}</dt>
          <dd className="mb-0 break-words text-sm font-semibold">{value || '—'}</dd>
        </div>)}
      </dl>
      <div className="risova-form-actions">
        <button type="button" onClick={onClose}>Đóng</button>
        {canManage && <button type="button" className="is-primary" onClick={onEdit}>Chỉnh sửa</button>}
      </div>
    </div>
  </Dialog>;
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : '';
}

function CategoryEditor({ collection, item, onClose }) {
  const { data, savePersonnel } = useData();
  const isShift = collection === 'work_shifts';
  const label = isShift ? 'ca làm việc' : 'chuyên môn';
  const [form, setForm] = useState(() => ({ name: '', is_active: true, start_time: '', end_time: '', ...item }));
  const [error, setError] = useState('');

  function submit(event) {
    event.preventDefault();
    const name = form.name.trim();
    if (!name) {
      setError(`Vui lòng nhập tên ${label}.`);
      return;
    }
    if (data[collection].some(entry => entry.id !== item?.id && entry.name.toLocaleLowerCase('vi') === name.toLocaleLowerCase('vi'))) {
      setError(`Tên ${label} đã tồn tại.`);
      return;
    }
    if (isShift && form.start_time.slice(0, 5) === form.end_time.slice(0, 5)) {
      setError('Giờ bắt đầu và giờ kết thúc phải khác nhau.');
      return;
    }
    const timestamp = new Date().toISOString();
    const dates = item ? { updated_at: timestamp } : { created_at: timestamp };
    savePersonnel(collection, { ...form, ...dates, name });
    onClose();
  }

  function change(event) {
    const { name, value } = event.target;
    setForm(previous => ({ ...previous, [name]: name === 'is_active' ? value === 'true' : value }));
    setError('');
  }

  const title = `${item ? 'Chỉnh sửa' : isShift ? 'Tạo' : 'Thêm'} ${label}`;
  return <Dialog title={title} width={598} onClose={onClose}>
    <form className="risova-personnel-category" onSubmit={submit}>
      <div className="space-y-4">
        <div>
          <label htmlFor="personnel-category-name">{isShift ? 'Tên ca' : 'Tên chuyên môn'}</label>
          <input id="personnel-category-name" name="name" placeholder="..." value={form.name} onChange={change} required />
        </div>
        {isShift ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="shift-start">Giờ bắt đầu</label>
            <input id="shift-start" name="start_time" type="time" value={form.start_time?.slice(0, 5) || ''} onChange={change} required />
          </div>
          <div>
            <label htmlFor="shift-end">Giờ kết thúc</label>
            <input id="shift-end" name="end_time" type="time" value={form.end_time?.slice(0, 5) || ''} onChange={change} required />
          </div>
        </div> : item && <div>
          <label htmlFor="personnel-category-status">Trạng thái</label>
          <select id="personnel-category-status" name="is_active" value={String(form.is_active !== false)} onChange={change}>
            <option value="true">Hoạt động</option>
            <option value="false">Đã khóa</option>
          </select>
        </div>}
      </div>
      {error && <p role="alert" className="mb-0 mt-3 text-xs text-red-600">{error}</p>}
      <div className="risova-form-actions !justify-center">
        <button type="button" onClick={onClose}>Hủy</button>
        <button type="submit">{item ? 'Lưu' : isShift ? 'Tạo ca' : 'Thêm'}</button>
      </div>
    </form>
  </Dialog>;
}

function ShiftMembers({ shift, onClose, onAdd }) {
  const { data, ENUMS, updateUser, addToast } = useData();
  const users = data.users.filter(user => String(user.work_shift_id) === String(shift.id));
  const [removeUser, setRemoveUser] = useState(null);

  return <Dialog title={`Nhân sự trong ${shift.name.toLowerCase()}`} width={650} onClose={onClose}>
    <p className="mb-4 flex items-center gap-2 text-slate-500"><CalendarClock size={15} />{shift.start_time?.slice(0, 5)} – {shift.end_time?.slice(0, 5)}</p>
    {users.length ? <ul className="divide-y divide-slate-100 rounded-md border border-slate-200 p-0">
      {users.map(user => <li key={user.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div><strong>{user.full_name}</strong><span className="ml-2 text-xs text-slate-500">{ENUMS.USER_ROLES[user.role]?.label || user.role}</span></div>
        {onAdd && (removeUser === user.id
          ? <div className="flex gap-3 text-xs">
            <button type="button" onClick={() => setRemoveUser(null)}>Hủy</button>
            <button type="button" className="text-red-600" onClick={() => { updateUser(user.id, { work_shift_id: null, work_date: '' }); setRemoveUser(null); addToast('Đã bỏ phân ca cho nhân sự.'); }}>Xác nhận bỏ phân ca</button>
          </div>
          : <button type="button" className="text-xs text-red-600" onClick={() => setRemoveUser(user.id)}>Bỏ phân ca</button>)}
      </li>)}
    </ul> : <p className="risova-empty-state">Ca làm việc chưa có nhân sự.</p>}
    <div className="risova-form-actions">
      <button type="button" onClick={onClose}>Đóng</button>
      {onAdd && <button type="button" className="is-primary" onClick={onAdd}>Thêm nhân sự vào ca</button>}
    </div>
  </Dialog>;
}

function ShiftAssignment({ shift, onClose }) {
  const { data, updateUser, addToast } = useData();
  const [userId, setUserId] = useState('');
  const users = data.users.filter(user => user.is_active !== false && String(user.work_shift_id) !== String(shift.id));

  function submit(event) {
    event.preventDefault();
    const user = users.find(item => String(item.id) === userId);
    if (!user) return;
    updateUser(user.id, { work_shift_id: shift.id });
    addToast(`Đã phân ca cho ${user.full_name}.`);
    onClose();
  }

  return <Dialog title="Thêm nhân viên" width={598} onClose={onClose}>
    <form className="risova-personnel-category" onSubmit={submit}>
      <div className="space-y-4">
        <div>
          <label htmlFor="shift-assignment-user">Mã nhân viên</label>
          <select id="shift-assignment-user" value={userId} onChange={event => setUserId(event.target.value)} required>
            <option value="">...</option>
            {users.map(user => <option key={user.id} value={user.id}>{user.employee_code} · {user.full_name}</option>)}
          </select>
        </div>
      </div>
      <div className="risova-form-actions !justify-center">
        <button type="button" onClick={onClose}>Hủy</button>
        <button type="submit" disabled={!users.length}>Thêm</button>
      </div>
    </form>
  </Dialog>;
}

export default function UsersPage() {
  const { currentUser } = useAuth();
  const { data, ENUMS, removePersonnel } = useData();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('ALL');
  const [specialty, setSpecialty] = useState('ALL');
  const [shift, setShift] = useState('ALL');
  const [availability, setAvailability] = useState('ALL');
  const [accountStatus, setAccountStatus] = useState('ALL');
  const tab = tabs.find(item => item.id === params.get('tab'))?.id || 'users';
  const selected = data[tab].find(item => String(item.id) === params.get('id'));
  const mode = params.get('dialog');
  const canManage = ['MANAGER', 'ADMIN'].includes(currentUser.role);
  const canEditSelected = canManage && (tab !== 'users' || selected?.role !== 'ADMIN' || currentUser.role === 'ADMIN');

  const filtered = data[tab].filter(item => {
    const value = tab === 'users' ? [item.full_name, item.email, item.employee_code, item.phone].join(' ') : item.name;
    return value.toLocaleLowerCase('vi').includes(search.trim().toLocaleLowerCase('vi')) && (
      tab === 'specialties' ? accountStatus === 'ALL' || String(item.is_active !== false) === accountStatus : tab !== 'users' || (
      (role === 'ALL' || item.role === role) &&
      (specialty === 'ALL' || String(item.specialty_id) === specialty) &&
      (shift === 'ALL' || String(item.work_shift_id) === shift) &&
      (availability === 'ALL' || String(Boolean(item.is_available)) === availability) &&
      (accountStatus === 'ALL' || String(item.is_active !== false) === accountStatus)
      )
    );
  });
  const pagination = usePagination(filtered, [tab, search, role, specialty, shift, availability, accountStatus].join('|'));

  function selectTab(id) {
    setSearch('');
    setAccountStatus('ALL');
    setParams(id === 'users' ? {} : { tab: id });
  }

  function showDialog(dialog, record, replace = false) {
    setParams(previous => {
      const next = new URLSearchParams(previous);
      if (dialog) next.set('dialog', dialog);
      else next.delete('dialog');
      if (record) next.set('id', record.id);
      else next.delete('id');
      return next;
    }, { replace, preventScrollReset: true });
  }
  const closeDialog = () => showDialog(null, null, true);

  function renderRow(item, index) {
    if (tab === 'users') {
      return <tr key={item.id} className="border-b border-slate-100">
        <td className="px-4 font-semibold"><button type="button" onClick={() => showDialog('detail', item)} className="hover:text-[#3F72AF]">{item.employee_code}</button></td>
        <td className="px-4"><button type="button" className="text-left hover:text-[#3F72AF]" onClick={() => showDialog('detail', item)}>{item.full_name}</button></td>
        <td className="px-4 text-slate-500">{item.email}</td>
        <td className="px-4 text-slate-500">{item.phone || '—'}</td>
        <td className="px-4 text-slate-500">{ENUMS.USER_ROLES[item.role]?.label || item.role}</td>
        <td className="px-4 text-slate-500">{data.specialties.find(entry => String(entry.id) === String(item.specialty_id))?.name || '—'}</td>
        <td className="px-4"><Badge active={item.is_active !== false} yes="Hoạt động" no="Đã khóa" /></td>
        <td className="px-4"><Badge active={item.is_available} yes="Sẵn sàng" no="Đang bận" /></td>
      </tr>;
    }

    const isShift = tab === 'work_shifts';
    const count = data.users.filter(user => String(isShift ? user.work_shift_id : user.specialty_id) === String(item.id)).length;
    return <tr key={item.id} className="border-b border-slate-100">
      <td className="px-4 font-semibold">{(pagination.page - 1) * 10 + index + 1}</td>
      {isShift ? <>
        <td className="px-4 font-semibold"><button type="button" className="text-left hover:text-[#3F72AF]" onClick={() => showDialog('members', item)}>{item.name}</button></td>
        <td className="px-4"><button type="button" aria-label={`Xem ${count} nhân sự trong ${item.name}`} className="text-[#3F72AF] hover:underline" onClick={() => showDialog('members', item)}>{count}</button></td>
        <td className="px-4 text-slate-500">{item.start_time?.slice(0, 5) || '—'}</td>
        <td className="px-4 text-slate-500">{item.end_time?.slice(0, 5) || '—'}</td>
      </> : <>
        <td className="px-4">{item.name}</td>
        <td className="px-4 text-slate-500">{count}</td>
        <td className="px-4"><Badge active={item.is_active !== false} yes="Hoạt động" no="Đã khóa" /></td>
      </>}
      <td className="px-4 text-slate-500">{formatDate(item.created_at) || '—'}</td>
      <td className="px-4 text-slate-500">{item.updated_at === item.created_at ? 'Chưa có' : formatDate(item.updated_at) || 'Chưa có'}</td>
      <td className="px-4">
        {canManage && <div className="flex items-center justify-center gap-1">
          {isShift && <button type="button" className="risova-personnel-row-action text-emerald-600" aria-label={`Thêm nhân sự vào ${item.name}`} onClick={() => showDialog('assign', item)}><Plus size={18} /></button>}
          <button type="button" className="risova-personnel-row-action text-[#3F72AF]" aria-label={`Chỉnh sửa ${item.name}`} onClick={() => showDialog('edit', item)}><Pencil size={16} /></button>
          <button type="button" className="risova-personnel-row-action text-red-500" aria-label={`Xóa ${item.name}`} onClick={() => showDialog('delete', item)}><Trash2 size={17} /></button>
        </div>}
      </td>
    </tr>;
  }

  const pageTitles = {
    users: ['Nhân sự', 'Theo dõi nhân sự hiện có'],
    specialties: ['Quản lý chuyên môn', 'Nhóm kỹ năng dùng để phân công công việc bảo trì.'],
    work_shifts: ['Ca làm việc', 'Thiết lập ca và phân công nhân sự trực vận hành'],
  };
  const [pageTitle, pageDescription] = pageTitles[tab];

  return <div className="risova-page risova-personnel-page">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h1>{pageTitle}</h1><p className="text-slate-500">{pageDescription}</p></div>
      {canManage && (tab !== 'users' || currentUser.role === 'ADMIN') && <button type="button" className={primaryButton} onClick={() => showDialog('create')}>
        <Plus size={16} />{tab === 'specialties' ? 'Thêm chuyên môn' : tab === 'work_shifts' ? 'Tạo ca mới' : 'Tạo tài khoản'}
      </button>}
    </div>

    <div className="risova-tabs" role="tablist" aria-label="Quản lý nhân sự">
      {tabs.map(item => <button type="button" id={`personnel-tab-${item.id}`} key={item.id} role="tab" aria-selected={tab === item.id} aria-controls="personnel-panel" onClick={() => selectTab(item.id)}>{item.label}</button>)}
    </div>

    <section className="risova-data-table risova-personnel-table" id="personnel-panel" role="tabpanel" aria-labelledby={`personnel-tab-${tab}`}>
      <div className={`risova-table-toolbar flex flex-wrap items-center gap-2 ${tab !== 'users' ? 'risova-personnel-short-toolbar' : ''}`}>
        <div className="relative min-w-0 flex-1 basis-40">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input aria-label="Tìm nhân sự hoặc danh mục" placeholder="Tìm theo mã, tên..." value={search} onChange={event => setSearch(event.target.value)} className="w-full border border-slate-200 py-2 pl-9 pr-3 text-xs" />
        </div>
        {tab === 'users' ? <>
          <Filter label="Tất cả vai trò" value={role} onChange={setRole} options={Object.entries(ENUMS.USER_ROLES).map(([key, item]) => [key, item.label])} />
          <Filter label="Tất cả chuyên môn" value={specialty} onChange={setSpecialty} options={data.specialties.map(item => [item.id, item.name])} />
          <Filter label="Ca làm việc" value={shift} onChange={setShift} options={data.work_shifts.map(item => [item.id, item.name])} />
          <Filter label="Trạng thái tài khoản" value={accountStatus} onChange={setAccountStatus} options={accountFilters} />
          <Filter label="Trạng thái làm việc" value={availability} onChange={setAvailability} options={availabilityFilters} />
        </> : tab === 'specialties' && <Filter label="Tất cả trạng thái" value={accountStatus} onChange={setAccountStatus} options={accountFilters} />}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full whitespace-nowrap text-center">
          <thead><tr>{columns[tab].map(name => <th key={name} className="px-4">{name}</th>)}</tr></thead>
          <tbody>{pagination.items.map(renderRow)}</tbody>
        </table>
        {!filtered.length && <p className="risova-empty-state">Không tìm thấy kết quả phù hợp.</p>}
      </div>
      <Pagination {...pagination} />
    </section>

    {tab === 'users' && selected && mode === 'detail' && <PersonDetail user={selected} canManage={canEditSelected} onEdit={() => showDialog('edit', selected, true)} onClose={closeDialog} />}
    {tab === 'users' && canManage && (mode === 'create' || (mode === 'edit' && selected && canEditSelected)) && <PersonnelEditor person={selected} onClose={closeDialog} canSetRole={currentUser.role === 'ADMIN'} />}
    {tab !== 'users' && canManage && (mode === 'create' || (mode === 'edit' && selected)) && <CategoryEditor collection={tab} item={selected} onClose={closeDialog} />}
    {tab === 'work_shifts' && selected && mode === 'members' && <ShiftMembers shift={selected} onClose={closeDialog} onAdd={canManage ? () => showDialog('assign', selected, true) : undefined} />}
    {tab === 'work_shifts' && selected && mode === 'assign' && canManage && <ShiftAssignment shift={selected} onClose={closeDialog} />}
    {tab !== 'users' && selected && mode === 'delete' && canManage && <Dialog title={`Xóa ${tab === 'specialties' ? 'chuyên môn' : 'ca làm việc'}`} width={510} onClose={closeDialog}>
      <p className="mb-0">Bạn có muốn xóa <strong>{selected.name}</strong>?</p>
      <div className="risova-form-actions !justify-center">
        <button type="button" onClick={closeDialog}>Hủy</button>
        <button type="button" className="!border-red-600 bg-red-600 text-white" onClick={() => { removePersonnel(tab, selected.id); closeDialog(); }}>Xóa</button>
      </div>
    </Dialog>}
  </div>;
}
