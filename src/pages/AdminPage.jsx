import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import PersonnelEditor from '../components/PersonnelEditor';
import { isAdmin } from '../constants/permissions';
import { useAuth } from '../context/DataContext';
import ReportsPage from './ReportsPage';

export default function AdminPage() {
  const { currentUser } = useAuth();
  const [params, setParams] = useSearchParams();

  if (!isAdmin(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  return <>
    <ReportsPage
      title="Quản trị hệ thống"
      subtitle="Chỉ số được tính trực tiếp từ dữ liệu trong phiên hiện tại"
      headerAction={<Link className="inline-flex items-center gap-2 rounded-md bg-[#3F72AF] px-4 py-2 text-xs font-semibold text-white no-underline hover:bg-[#305b8e]" to="/admin?dialog=create"><UserPlus size={15} />Tạo tài khoản</Link>}
    />
    {params.get('dialog') === 'create' && <PersonnelEditor canSetRole={isAdmin(currentUser.role)} onClose={() => setParams({}, { replace: true })} />}
  </>;
}
