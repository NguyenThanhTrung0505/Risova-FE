import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RecoveryCard from '../../components/RecoveryCard';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  return <RecoveryCard title="Đặt lại mật khẩu" backTo="/auth/login" subtitle="Nhập địa chỉ email của bạn và chúng tôi sẽ gửi mã khôi phục để bạn đặt lại mật khẩu">
    <form onSubmit={event => { event.preventDefault(); navigate('/auth/verify-otp', { state: { email: email.trim() } }); }}>
      <div className="risova-auth-field"><label htmlFor="recovery-email">Địa chỉ Email</label><input id="recovery-email" type="email" name="email" autoComplete="email" required placeholder="Nhập email của bạn" value={email} onChange={event => setEmail(event.target.value)} /></div>
      <button className="risova-auth-submit" type="submit">Gửi mã khôi phục</button>
    </form>
  </RecoveryCard>;
}
