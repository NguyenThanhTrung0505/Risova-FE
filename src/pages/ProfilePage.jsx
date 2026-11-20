import { useState } from 'react';
import { useAuth, useData } from '../context/DataContext';
import '../styles/people.css';

export default function ProfilePage() {
  const { currentUser } = useAuth();
  return <ProfileForm key={currentUser.id} />;
}

function ProfileForm() {
  const { currentUser, updateProfile } = useAuth();
  const { data, ENUMS, addToast } = useData();
  const [form, setForm] = useState(() => ({
    full_name: currentUser.full_name || '',
    email: currentUser.email || '',
    phone: currentUser.phone || '',
    specialty_id: currentUser.specialty_id || '',
  }));
  const [error, setError] = useState('');
  const specialty = data.specialties.find(item => String(item.id) === String(currentUser.specialty_id));
  const role = ENUMS.USER_ROLES[currentUser.role]?.label || currentUser.role;
  const isActive = currentUser.is_active !== false;

  function change(event) {
    const { name, value } = event.target;
    setForm(previous => ({ ...previous, [name]: value }));
    setError('');
  }

  function save(event) {
    event.preventDefault();
    const name = form.full_name.trim();
    const email = form.email.trim();
    if (!name) {
      setError('Vui lòng nhập họ và tên.');
      return;
    }
    if (data.users.some(user => user.id !== currentUser.id && user.email?.toLowerCase() === email.toLowerCase())) {
      setError('Email này đã được sử dụng.');
      return;
    }
    updateProfile({
      full_name: name,
      email,
      phone: form.phone.trim(),
      specialty_id: form.specialty_id ? Number(form.specialty_id) : null,
      avatar_initials: name.split(/\s+/).slice(-2).map(word => word[0]).join('').toUpperCase(),
    });
    addToast('Đã cập nhật hồ sơ cá nhân.');
  }

  return <div className="risova-page risova-personal-profile">
    <div><h1>Hồ sơ của bạn</h1><p>Quản lý thông tin cá nhân</p></div>
    <section className="risova-personal-summary" aria-label="Thông tin tài khoản">
      <span className="risova-avatar" aria-hidden="true">{currentUser.avatar_initials}</span>
      <div className="risova-personal-identity"><h2>{currentUser.full_name}</h2><p>{role}{specialty && ` · Chuyên môn ${specialty.name}`}</p></div>
      <span className={`risova-status-badge ${isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{isActive ? 'Đang hoạt động' : 'Đã khóa'}</span>
    </section>
    <form className="risova-personal-form" onSubmit={save}>
      <div className="risova-personal-fields">
        <div><label htmlFor="profile-name">Họ và tên</label><input id="profile-name" name="full_name" autoComplete="name" required value={form.full_name} onChange={change} /></div>
        <div><label htmlFor="profile-email">Email</label><input id="profile-email" name="email" type="email" autoComplete="email" required value={form.email} onChange={change} /></div>
        <div><label htmlFor="profile-phone">Số điện thoại</label><input id="profile-phone" name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={change} /></div>
        <div>
          <label htmlFor="profile-specialty">Chuyên môn</label>
          <select id="profile-specialty" name="specialty_id" value={form.specialty_id} onChange={change}>
            <option value="">Chọn chuyên môn</option>
            {data.specialties.filter(item => item.is_active !== false || String(item.id) === String(currentUser.specialty_id)).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </div>
      </div>
      {error && <p role="alert" className="mt-3 text-xs text-red-600">{error}</p>}
      <footer><button type="submit">Lưu thay đổi</button></footer>
    </form>
  </div>;
}
