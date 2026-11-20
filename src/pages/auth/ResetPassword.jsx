import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import RecoveryCard from '../../components/RecoveryCard';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [passwords, setPasswords] = useState({ password: '', confirm: '' });
  const [visible, setVisible] = useState({ password: false, confirm: false });
  const [error, setError] = useState('');
  return <RecoveryCard title="Đặt lại mật khẩu" centered backTo={state?.fromProfile ? '/profile' : '/auth/verify-otp'}>
    <form onSubmit={event => { event.preventDefault(); if (passwords.password !== passwords.confirm) { setError('Mật khẩu xác nhận không khớp.'); return; } navigate(state?.fromProfile ? '/profile' : '/auth/login'); }}>
      {[['password', 'Mật khẩu', 'Nhập mật khẩu mới'], ['confirm', 'Nhập lại mật khẩu', 'Nhập lại mật khẩu']].map(([key, label, placeholder]) => <div className="risova-auth-field" key={key}><label htmlFor={'recovery-' + key}>{label}</label><div className="risova-password-input"><input id={'recovery-' + key} name={key} type={visible[key] ? 'text' : 'password'} autoComplete="new-password" minLength={6} required placeholder={placeholder} value={passwords[key]} onChange={event => { setPasswords({ ...passwords, [key]: event.target.value }); setError(''); }} /><button type="button" aria-label={(visible[key] ? 'Ẩn ' : 'Hiện ') + label.toLowerCase()} aria-pressed={visible[key]} onClick={() => setVisible({ ...visible, [key]: !visible[key] })}>{visible[key] ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>)}
      {error && <p className="risova-auth-message" role="alert">{error}</p>}
      <button className="risova-auth-submit" type="submit">Đổi mật khẩu</button>
    </form>
  </RecoveryCard>;
}
