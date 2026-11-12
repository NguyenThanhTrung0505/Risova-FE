import React from 'react';
import { useAuth, useData } from '../context/DataContext';
import {
  Users,
  ShieldCheck,
  Wrench,
  Package,
  UserCheck,
  Phone,
  Mail,
  Clock,
  Briefcase,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export default function UsersPage() {
  const { currentUser, loginAsRole } = useAuth();
  const { data, ENUMS } = useData();

  const getRoleIcon = (role) => {
    switch (role) {
      case 'MANAGER':
        return <ShieldCheck className="w-5 h-5 text-[#3F72AF]" />;
      case 'TECHNICIAN':
        return <Wrench className="w-5 h-5 text-amber-600" />;
      case 'INVENTORY_STAFF':
        return <Package className="w-5 h-5 text-purple-600" />;
      default:
        return <UserCheck className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-page-title font-bold text-[#112D4E]">
            Đội ngũ Kỹ thuật & Nhân sự Nhà máy (Users & Shifts)
          </h1>
          <p className="text-body text-[#64748B] mt-0.5">
            Quản trị 4 vai trò tiêu chuẩn: Quản lý (MANAGER), Kỹ thuật viên (TECHNICIAN), Thủ kho (INVENTORY_STAFF), Vận hành (STAFF)
          </p>
        </div>
      </div>

      {/* Users Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.users.map(user => {
          const isCurrent = currentUser?.id === user.id;
          const roleMeta = ENUMS.USER_ROLES[user.role] || { label: user.role };

          return (
            <div
              key={user.id}
              className={`bg-white rounded-2xl p-6 border transition-all duration-200 shadow-sm flex flex-col justify-between ${
                isCurrent ? 'border-[#3F72AF] ring-2 ring-blue-500/10' : 'border-slate-200 hover:shadow-md'
              }`}
            >
              <div className="space-y-4">
                {/* User Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#112D4E] text-white flex items-center justify-center font-bold text-base shadow-sm">
                      {user.avatar_initials}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#112D4E] flex items-center gap-2">
                        <span>{user.full_name}</span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#3F72AF]">
                            Đang đăng nhập
                          </span>
                        )}
                      </h3>
                      <span className="text-xs font-mono text-slate-500">{user.employee_code}</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    {getRoleIcon(user.role)}
                  </div>
                </div>

                {/* Role Pill */}
                <div>
                  <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-[#3F72AF] border border-blue-100">
                    {roleMeta.label}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1 italic">
                    {roleMeta.desc}
                  </p>
                </div>

                {/* Contact and Availability */}
                <div className="space-y-2 pt-2 border-t text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{user.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {user.is_available ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-700 font-semibold">Đang trong ca trực sẵn sàng tiếp nhận việc</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-amber-700 font-semibold">Đang bận xử lý hiện trường</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-4 border-t mt-4 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Đăng nhập lần cuối: {new Date(user.last_login_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </span>

                {!isCurrent && (
                  <button
                    onClick={() => loginAsRole(user.role)}
                    className="px-3 py-1 bg-slate-100 hover:bg-[#3F72AF] hover:text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    Đăng nhập vai trò này
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

