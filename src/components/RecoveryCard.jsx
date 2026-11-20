import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthGearsBackground from './auth/AuthGearsBackground';

export default function RecoveryCard({ title, subtitle, backTo, children, centered = false }) {
  return <main className="risova-auth">
    <AuthGearsBackground />
    <section className="risova-recovery-card" aria-labelledby="recovery-title">
    <Link className="risova-recovery-back" to={backTo}><ArrowLeft size={17} />Quay lại</Link>
    <div className="risova-recovery-content"><h1 id="recovery-title" className={centered ? 'text-center' : ''}>{title}</h1>
      {subtitle && <p>{subtitle}</p>}{children}
    </div>
  </section></main>;
}
