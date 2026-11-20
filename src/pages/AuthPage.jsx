import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/DataContext';
import RisovaLogo from '../components/RisovaLogo';
import AuthGearsBackground from '../components/auth/AuthGearsBackground';
import RisovaIntroSplash from '../components/auth/RisovaIntroSplash';
import LoginAuthTransition from '../components/auth/LoginAuthTransition';
import { unlockIntroAudio } from '../components/auth/risovaIntroAudio';

export default function AuthPage({ onLoginSuccess }) {
  const {
    loginWithCredentials,
    loginAsRole,
    verifyCredentials,
    getUserForRole,
  } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return true;
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const [introRunId, setIntroRunId] = useState(0);
  const [authTransition, setAuthTransition] = useState(null);
  const [txSequence, setTxSequence] = useState(0);

  const submit = (event) => {
    event.preventDefault();
    if (authTransition) return;
    unlockIntroAudio();
    setError('');
    const nextId = txSequence + 1;
    setTxSequence(nextId);
    const result = verifyCredentials(email, password);
    if (result.ok) {
      setAuthTransition({
        id: nextId,
        outcome: 'success',
        userName: result.user.full_name,
        errorMessage: '',
        commit: () => {
          loginWithCredentials(email, password);
          onLoginSuccess?.();
        },
      });
    } else {
      setAuthTransition({
        id: nextId,
        outcome: 'error',
        userName: '',
        errorMessage: result.error,
        commit: () => {
          setError(result.error);
        },
      });
    }
  };

  const handleQuickRoleLogin = (role, label) => {
    if (authTransition) return;
    unlockIntroAudio();
    setError('');
    const nextId = txSequence + 1;
    setTxSequence(nextId);
    const demoUser = getUserForRole(role);
    setAuthTransition({
      id: nextId,
      outcome: 'success',
      userName: demoUser?.full_name || label,
      errorMessage: '',
      commit: () => {
        loginAsRole(role);
        onLoginSuccess?.();
      },
    });
  };

  const isAuthenticating = Boolean(authTransition);

  return <div className="risova-auth">
    {showIntro && <RisovaIntroSplash key={introRunId} onComplete={() => setShowIntro(false)} />}
    {authTransition && (
      <LoginAuthTransition
        key={authTransition.id}
        outcome={authTransition.outcome}
        userName={authTransition.userName}
        errorMessage={authTransition.errorMessage}
        onComplete={() => {
          const pending = authTransition;
          setAuthTransition(null);
          pending.commit();
        }}
      />
    )}
    <AuthGearsBackground />
    <div className="risova-auth-content">
      <div className="risova-auth-logo"><RisovaLogo iconOnly /></div>
      <section className="risova-auth-card" aria-labelledby="login-title">
        <h1 id="login-title">Đăng nhập hệ thống</h1>
        <p>Quản lý bảo trì và tài sản doanh nghiệp tập trung</p>
        <form onSubmit={submit} noValidate>
          <div className="risova-auth-field"><label htmlFor="login-email">Email</label><input id="login-email" name="email" type="email" autoComplete="username" required placeholder="Nhập email" value={email} onChange={event => setEmail(event.target.value)} /></div>
          <div className="risova-auth-field"><label htmlFor="login-password">Mật khẩu</label><div className="risova-password-input"><input id="login-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required placeholder="Nhập mật khẩu" value={password} onChange={event => setPassword(event.target.value)} /><button type="button" aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></div>
          <div className="risova-forgot-password"><Link to="/auth/forgot-password">Quên mật khẩu?</Link></div>
          {error && <p role="alert" className="risova-auth-message mb-3">{error}</p>}
          <button type="submit" className="risova-auth-submit" disabled={isAuthenticating}>Đăng nhập</button>
        </form>
      </section>
      <details className="risova-demo-access"><summary>Trải nghiệm nhanh theo vai trò</summary><div>{[['ADMIN','Quản trị viên'],['MANAGER','Quản lý'],['TECHNICIAN','Kỹ thuật viên'],['INVENTORY_STAFF','Thủ kho'],['STAFF','Nhân viên vận hành']].map(([role,label]) => <button type="button" key={role} disabled={isAuthenticating} onClick={() => handleQuickRoleLogin(role, label)}>{label}</button>)}</div></details>
      <p className="risova-auth-footer">
        Risova · Enterprise CMMS
        {' · '}
        <button
          type="button"
          className="risova-auth-replay-btn"
          onClick={() => {
            unlockIntroAudio();
            setIntroRunId((id) => id + 1);
            setShowIntro(true);
          }}
        >
          Xem lại hiệu ứng mở đầu
        </button>
      </p>
    </div>
  </div>;
}
