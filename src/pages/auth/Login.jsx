import { useNavigate } from 'react-router-dom';
import AuthPage from '../AuthPage';

export default function Login() {
  const navigate = useNavigate();
  return <AuthPage onLoginSuccess={() => navigate('/')} />;
}
