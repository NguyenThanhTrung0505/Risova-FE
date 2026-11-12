import React, { useState } from 'react';
import { useAuth } from '../context/DataContext';
import { Eye, EyeOff, ShieldCheck, Wrench, Package, UserCheck } from 'lucide-react';
import RisovaLogo from '../components/RisovaLogo';

export default function AuthPage({ onLoginSuccess }) {
  const { loginWithCredentials, loginAsRole } = useAuth();
  const [email, setEmail] = useState('minhanh.manager@risova.vn');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    loginWithCredentials(email, password);
    if (onLoginSuccess) onLoginSuccess();
  };

  const handleRoleQuickLogin = (roleCode) => {
    loginAsRole(roleCode);
    if (onLoginSuccess) onLoginSuccess();
  };

  return (
    <div className="relative min-h-screen w-full bg-[#112D4E] flex items-center justify-center p-4 overflow-hidden blueprint-grid">
      {/* Blueprint grid decorative lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-12 left-0 right-0 h-[1px] bg-sky-300"></div>
        <div className="absolute bottom-12 left-0 right-0 h-[1px] bg-sky-300"></div>
        <div className="absolute top-0 bottom-0 left-24 w-[1px] bg-sky-300"></div>
        <div className="absolute top-0 bottom-0 right-24 w-[1px] bg-sky-300"></div>
      </div>

      {/* Industrial Gears SVGs - Left side */}
      <div className="absolute left-[-40px] md:left-4 top-1/2 -translate-y-1/2 opacity-25 pointer-events-none text-sky-300 hidden sm:block">
        <svg width="280" height="280" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="100" cy="100" r="70" strokeDasharray="4 4" />
          <circle cx="100" cy="100" r="45" />
          <circle cx="100" cy="100" r="20" />
          {/* Gear teeth */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => (
            <rect
              key={deg}
              x="92"
              y="15"
              width="16"
              height="20"
              rx="3"
              transform={`rotate(${deg} 100 100)`}
              stroke="currentColor"
            />
          ))}
        </svg>

        <svg width="180" height="180" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.5" className="absolute -bottom-16 left-32">
          <circle cx="100" cy="100" r="60" strokeDasharray="3 3" />
          <circle cx="100" cy="100" r="35" />
          <circle cx="100" cy="100" r="15" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
            <rect
              key={deg}
              x="93"
              y="25"
              width="14"
              height="18"
              rx="2"
              transform={`rotate(${deg} 100 100)`}
              stroke="currentColor"
            />
          ))}
        </svg>
      </div>

      {/* Industrial Gears SVGs - Right side */}
      <div className="absolute right-[-40px] md:right-4 top-1/2 -translate-y-1/2 opacity-25 pointer-events-none text-sky-300 hidden sm:block">
        <svg width="280" height="280" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="100" cy="100" r="70" strokeDasharray="4 4" />
          <circle cx="100" cy="100" r="45" />
          <circle cx="100" cy="100" r="20" />
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => (
            <rect
              key={deg}
              x="92"
              y="15"
              width="16"
              height="20"
              rx="3"
              transform={`rotate(${deg} 100 100)`}
              stroke="currentColor"
            />
          ))}
        </svg>

        <svg width="190" height="190" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.5" className="absolute -top-14 right-28">
          <circle cx="100" cy="100" r="60" strokeDasharray="3 3" />
          <circle cx="100" cy="100" r="35" />
          <circle cx="100" cy="100" r="15" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
            <rect
              key={deg}
              x="93"
              y="25"
              width="14"
              height="18"
              rx="2"
              transform={`rotate(${deg} 100 100)`}
              stroke="currentColor"
            />
          ))}
        </svg>
      </div>

      {/* Center Login Container */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Floating Logo Badge */}
        <div className="mb-[-34px] z-20 w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-[#112D4E]">
          <div className="flex flex-col items-center justify-center">
            <svg
              className="w-10 h-10 text-[#3F72AF]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18h6" />
              <path d="M10 21h4" />
              <path d="M12 2a6 6 0 0 0-6 6c0 2.2 1.2 4.1 3 5.1V16a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-2.9c1.8-1 3-2.9 3-5.1a6 6 0 0 0-6-6z" stroke="#3F72AF" />
              <path d="M8.5 8h1.8l1.2-2.5 1.5 5 1.2-2.5h1.3" stroke="#0284C7" strokeWidth="2" />
            </svg>
            <span className="text-[11px] font-bold text-[#112D4E] tracking-tight">Risova</span>
          </div>
        </div>

        {/* White Card */}
        <div className="w-full bg-white rounded-2xl shadow-2xl p-8 pt-12 border border-slate-100">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-[#112D4E] tracking-tight">
              Đăng nhập hệ thống
            </h1>
            <p className="text-xs text-[#64748B] mt-1">
              Quản lý bảo trì và tài sản doanh nghiệp tập trung
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-[#112D4E] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email"
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:border-transparent transition bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#112D4E] mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  required
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-slate-300 text-sm text-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:border-transparent transition bg-slate-50/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <a
                href="#forgot"
                onClick={(e) => { e.preventDefault(); alert('Vui lòng liên hệ quản trị viên IT qua email it-support@risova.vn để đặt lại mật khẩu.'); }}
                className="text-[13px] font-medium text-[#3F72AF] hover:underline"
              >
                Quên mật khẩu?
              </a>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#3F72AF] hover:bg-[#325d91] text-white rounded-lg font-semibold text-sm shadow-md shadow-blue-500/20 transition duration-150 ease-in-out cursor-pointer"
            >
              Đăng nhập
            </button>
          </form>

          {/* Quick Demo Login Section */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                Đăng nhập nhanh Demo
              </span>
              <span className="text-[10px] text-slate-400">Chọn vai trò</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleRoleQuickLogin('MANAGER')}
                className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:border-[#3F72AF] hover:bg-sky-50/50 text-left transition group cursor-pointer"
              >
                <div className="w-7 h-7 rounded-md bg-blue-100 text-[#3F72AF] flex items-center justify-center shrink-0 group-hover:bg-[#3F72AF] group-hover:text-white transition">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-[12px] font-semibold text-[#112D4E] truncate">Minh Anh</div>
                  <div className="text-[10px] text-slate-500 truncate">Quản lý (Manager)</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleQuickLogin('TECHNICIAN')}
                className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:border-[#3F72AF] hover:bg-sky-50/50 text-left transition group cursor-pointer"
              >
                <div className="w-7 h-7 rounded-md bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition">
                  <Wrench className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-[12px] font-semibold text-[#112D4E] truncate">Lê Thu Hà</div>
                  <div className="text-[10px] text-slate-500 truncate">Kỹ thuật viên</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleQuickLogin('INVENTORY_STAFF')}
                className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:border-[#3F72AF] hover:bg-sky-50/50 text-left transition group cursor-pointer"
              >
                <div className="w-7 h-7 rounded-md bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition">
                  <Package className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-[12px] font-semibold text-[#112D4E] truncate">Phạm Gia Huy</div>
                  <div className="text-[10px] text-slate-500 truncate">Thủ kho vật tư</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleQuickLogin('STAFF')}
                className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:border-[#3F72AF] hover:bg-sky-50/50 text-left transition group cursor-pointer"
              >
                <div className="w-7 h-7 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-[12px] font-semibold text-[#112D4E] truncate">Nguyễn H. Nam</div>
                  <div className="text-[10px] text-slate-500 truncate">Vận hành máy</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-xs text-slate-400">
          Risova Enterprise CMMS © 2025 • Chuẩn hóa bảo trì nhà máy 4.0
        </div>
      </div>
    </div>
  );
}

