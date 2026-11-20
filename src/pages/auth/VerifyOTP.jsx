import { useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import RecoveryCard from '../../components/RecoveryCard';

export default function VerifyOTP() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [digits, setDigits] = useState(Array(6).fill(''));
  const [message, setMessage] = useState('');
  const inputs = useRef([]);
  function fill(value, index) {
    const numbers = value.replace(/\D/g, '').slice(0, 6 - index);
    setDigits(previous => {
      const next = [...previous];
      if (!numbers) next[index] = '';
      else [...numbers].forEach((number, offset) => { next[index + offset] = number; });
      return next;
    });
    if (numbers) inputs.current[Math.min(5, index + numbers.length)]?.focus();
    setMessage('');
  }
  return <RecoveryCard title="Nhập mã" backTo="/auth/forgot-password" subtitle={'Hãy nhập mã chúng tôi đã gửi vào email ' + (state?.email || 'của bạn')}>
    <form onSubmit={event => { event.preventDefault(); if (digits.join('').length !== 6) { setMessage('Vui lòng nhập đủ 6 chữ số.'); return; } navigate('/auth/reset-password', { state }); }}>
      <div className="risova-otp-inputs" role="group" aria-label="Mã xác thực gồm sáu chữ số">{digits.map((digit, index) => <input key={index} ref={element => { inputs.current[index] = element; }} type="text" inputMode="numeric" autoComplete={index === 0 ? 'one-time-code' : 'off'} aria-label={'Chữ số thứ ' + (index + 1)} value={digit} onChange={event => fill(event.target.value, index)} onPaste={event => { event.preventDefault(); fill(event.clipboardData.getData('text'), index); }} onFocus={event => event.target.select()} onKeyDown={event => { if (event.key === 'Backspace' && !digit && index > 0) inputs.current[index - 1]?.focus(); if (event.key === 'ArrowLeft' && index > 0) inputs.current[index - 1]?.focus(); if (event.key === 'ArrowRight' && index < 5) inputs.current[index + 1]?.focus(); }} />)}</div>
      {message && <p className="risova-auth-message" role="status">{message}</p>}
      <button className="risova-auth-submit" type="submit">Xác thực</button>
      <button className="risova-recovery-resend" type="button" onClick={() => { setDigits(Array(6).fill('')); setMessage('Vui lòng kiểm tra mã khôi phục trong email của bạn.'); inputs.current[0]?.focus(); }}>Gửi lại mã</button>
      <Link className="risova-recovery-other" to="/auth/forgot-password">Thử với email khác</Link>
    </form>
  </RecoveryCard>;
}
