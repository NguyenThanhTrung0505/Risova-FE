import React, { useState } from 'react';
import { useAuth, useData } from '../context/DataContext';
import {
  LayoutDashboard,
  Layers,
  MapPin,
  ClipboardList,
  CalendarClock,
  Package,
  Activity,
  Users,
  BarChart3,
  FileText,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  Radio,
  CheckCircle2,
  AlertTriangle,
  X,
  Plus,
  RotateCcw,
  QrCode
} from 'lucide-react';
import RisovaLogo from './RisovaLogo';

export default function SidebarLayout({ activeTab, setActiveTab, onOpenCreateWo, onOpenQrScanner, children }) {
  const { currentUser, loginAsRole, logout } = useAuth();
  const { data, ENUMS, resetToDefault } = useData();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Unread alerts count
  const unreadAlerts = (data.alerts || []).filter(a => a.status === 'OPEN');

  const menuGroups = [
    {
      group: 'Tổng quan',
      items: [
        { id: 'dashboard', label: 'Bảng điều khiển', icon: LayoutDashboard }
      ]
    },
    {
      group: 'Vận hành',
      items: [
        { id: 'assets', label: 'Thiết bị', icon: Layers, count: data.assets?.length },
        { id: 'locations', label: 'Địa điểm', icon: MapPin },
        { id: 'work-orders', label: 'Lệnh làm việc', icon: ClipboardList, badge: data.work_orders?.filter(w => w.status === 'IN_PROGRESS' || w.status === 'OPEN').length },
        { id: 'schedules', label: 'Bảo trì định kỳ', icon: CalendarClock }
      ]
    },
    {
      group: 'Nguồn lực',
      items: [
        { id: 'inventory', label: 'Kho vật tư', icon: Package, badge: data.spare_parts?.filter(p => p.is_low_stock).length ? 'Cảnh báo' : null },
        { id: 'iot', label: 'Giám sát IoT', icon: Activity, pulse: unreadAlerts.length > 0 },
        { id: 'users', label: 'Nhân sự', icon: Users }
      ]
    },
    {
      group: 'Phân tích',
      items: [
        { id: 'reports', label: 'Báo cáo', icon: BarChart3 },
        { id: 'audit', label: 'Nhật ký kiểm toán', icon: FileText }
      ]
    }
  ];

  // Breadcrumb mapping
  const breadcrumbLabels = {
    dashboard: 'Bảng điều khiển',
    assets: 'Thiết bị & Tài sản',
    locations: 'Địa điểm & Phân cấp xưởng',
    'work-orders': 'Lệnh làm việc (Work Orders)',
    schedules: 'Kế hoạch bảo trì định kỳ',
    inventory: 'Kho phụ tùng & Vật tư',
    iot: 'Giám sát IoT & Cảm biến thời gian thực',
    users: 'Đội ngũ kỹ thuật & Nhân sự',
    reports: 'Báo cáo & Phân tích hiệu suất',
    audit: 'Nhật ký kiểm toán hệ thống'
  };

  // Quick search filtered items
  const filteredAssets = searchQuery.trim() ? data.assets.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.asset_code.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const filteredWos = searchQuery.trim() ? data.work_orders.filter(w => 
    w.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    w.wo_code.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const filteredParts = searchQuery.trim() ? data.spare_parts.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.part_code.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  return (
    <div className="min-h-screen bg-[#F9F7F7] flex text-[#112D4E] font-sans">
      {/* 1. LEFT SIDEBAR */}
      <aside className="w-64 bg-[#112D4E] shrink-0 flex flex-col min-h-screen sticky top-0 h-screen z-30 select-none shadow-xl border-r border-slate-800">
        {/* Brand / Logo Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <RisovaLogo size="md" isDarkBg={true} />
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          {menuGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#7F96B0] mb-2">
                {group.group}
              </div>
              {group.items.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition duration-150 cursor-pointer ${
                      isActive
                        ? 'bg-[#3F72AF] text-white shadow-md font-semibold'
                        : 'text-[#DBE2EF] hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#DBE2EF]'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {/* Badges */}
                    {item.pulse && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                    )}

                    {item.badge && !item.pulse && (
                      <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-white/20 text-white font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer with Factory Status */}
        <div className="p-3.5 border-t border-white/10 bg-[#0c223b]/60">
          <div className="flex items-center justify-between text-xs text-[#7F96B0]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              Nhà máy Bắc Ninh
            </span>
            <span className="text-[11px] font-mono text-emerald-400 font-semibold">IoT LIVE</span>
          </div>
        </div>
      </aside>

      {/* 2. MAIN APP CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400 font-normal">Không gian làm việc</span>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-[#112D4E]">
              {breadcrumbLabels[activeTab] || 'Bảng điều khiển'}
            </span>
          </div>

          {/* Search Bar */}
          <div className="relative w-80 max-w-md hidden md:block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm thiết bị, phiếu công việc, vật tư..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchModal(true);
              }}
              onFocus={() => setShowSearchModal(true)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-[#112D4E] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setShowSearchModal(false); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Header Right Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Quick QR Scanner Button */}
            <button
              onClick={onOpenQrScanner}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-[#112D4E] text-xs font-semibold rounded-lg border border-slate-200 transition cursor-pointer"
              title="Quét mã QR thiết bị"
            >
              <QrCode className="w-3.5 h-3.5 text-[#3F72AF]" />
              <span className="hidden sm:inline">Quét QR</span>
            </button>

            {/* Quick Create WO Button in Header */}
            <button
              onClick={onOpenCreateWo}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-[#3F72AF] hover:bg-[#325d91] text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tạo phiếu việc</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 relative transition cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {unreadAlerts.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-40">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#112D4E] uppercase tracking-wider">
                      Cảnh báo & Thông báo ({unreadAlerts.length})
                    </span>
                    <button
                      onClick={() => { setActiveTab('iot'); setShowNotifications(false); }}
                      className="text-xs text-[#3F72AF] hover:underline"
                    >
                      Xem tất cả
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {data.alerts && data.alerts.length > 0 ? (
                      data.alerts.slice(0, 4).map(alert => (
                        <div
                          key={alert.id}
                          onClick={() => { setActiveTab('iot'); setShowNotifications(false); }}
                          className="p-3 hover:bg-slate-50 transition cursor-pointer flex items-start gap-2.5"
                        >
                          <div className={`p-1.5 rounded-md mt-0.5 ${alert.level === 'DANGER' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-[#112D4E] truncate">{alert.title}</p>
                            <p className="text-[11px] text-slate-500 line-clamp-1">{alert.description}</p>
                            <span className="text-[10px] text-slate-400 mt-1 inline-block">
                              {new Date(alert.triggered_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-400">Không có thông báo mới</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[#3F72AF] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {currentUser.avatar_initials || 'MA'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-[#112D4E] leading-tight">
                    {currentUser.full_name}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium leading-tight">
                    {ENUMS.USER_ROLES[currentUser.role]?.label || currentUser.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Role switch / Logout menu */}
              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-40">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-[#112D4E]">{currentUser.full_name}</p>
                    <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-[#3F72AF]">
                      {ENUMS.USER_ROLES[currentUser.role]?.label}
                    </span>
                  </div>

                  <div className="px-3 py-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1">
                      Chuyển đổi vai trò Demo
                    </p>
                    <button
                      onClick={() => { loginAsRole('MANAGER'); setShowRoleMenu(false); }}
                      className={`w-full text-left px-2 py-1.5 rounded-md text-xs flex items-center justify-between ${currentUser.role === 'MANAGER' ? 'bg-blue-50 text-[#3F72AF] font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      <span>Quản lý (Minh Anh)</span>
                      {currentUser.role === 'MANAGER' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => { loginAsRole('TECHNICIAN'); setShowRoleMenu(false); }}
                      className={`w-full text-left px-2 py-1.5 rounded-md text-xs flex items-center justify-between ${currentUser.role === 'TECHNICIAN' ? 'bg-blue-50 text-[#3F72AF] font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      <span>Kỹ thuật viên (Lê Thu Hà)</span>
                      {currentUser.role === 'TECHNICIAN' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => { loginAsRole('INVENTORY_STAFF'); setShowRoleMenu(false); }}
                      className={`w-full text-left px-2 py-1.5 rounded-md text-xs flex items-center justify-between ${currentUser.role === 'INVENTORY_STAFF' ? 'bg-blue-50 text-[#3F72AF] font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      <span>Thủ kho (Phạm Gia Huy)</span>
                      {currentUser.role === 'INVENTORY_STAFF' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => { loginAsRole('STAFF'); setShowRoleMenu(false); }}
                      className={`w-full text-left px-2 py-1.5 rounded-md text-xs flex items-center justify-between ${currentUser.role === 'STAFF' ? 'bg-blue-50 text-[#3F72AF] font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      <span>Vận hành máy (Nguyễn H. Nam)</span>
                      {currentUser.role === 'STAFF' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1 mt-1 px-3 space-y-1">
                    <button
                      onClick={() => {
                        if (window.confirm('Bạn có chắc chắn muốn khôi phục toàn bộ dữ liệu mẫu ban đầu của Nhà máy Bắc Ninh?')) {
                          resetToDefault();
                          setShowRoleMenu(false);
                        }
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-md text-xs text-[#3F72AF] hover:bg-blue-50 flex items-center gap-2 cursor-pointer font-medium transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[#3F72AF]" />
                      <span>Khôi phục dữ liệu gốc (Reset Demo)</span>
                    </button>

                    <button
                      onClick={() => { logout(); setShowRoleMenu(false); }}
                      className="w-full text-left px-2 py-1.5 rounded-md text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer font-medium transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Đăng xuất tài khoản</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Quick Search Modal / Overlay */}
        {showSearchModal && searchQuery.trim() && (
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setShowSearchModal(false)}>
            <div className="max-w-xl mx-auto mt-20 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">
                  Kết quả tìm kiếm cho: "{searchQuery}"
                </span>
                <button onClick={() => setShowSearchModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 max-h-96 overflow-y-auto space-y-4">
                {/* Assets Result */}
                {filteredAssets.length > 0 && (
                  <div>
                    <div className="text-xs font-bold text-slate-400 mb-2 uppercase">Thiết bị ({filteredAssets.length})</div>
                    <div className="space-y-1">
                      {filteredAssets.map(a => (
                        <div
                          key={a.id}
                          onClick={() => { setActiveTab('assets'); setShowSearchModal(false); }}
                          className="p-2 hover:bg-slate-100 rounded-lg flex items-center justify-between cursor-pointer"
                        >
                          <div>
                            <span className="font-semibold text-xs text-[#112D4E]">{a.name}</span>
                            <span className="ml-2 font-mono text-[11px] text-slate-500">[{a.asset_code}]</span>
                          </div>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                            {ENUMS.ASSET_STATUSES[a.status]?.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Work Orders Result */}
                {filteredWos.length > 0 && (
                  <div>
                    <div className="text-xs font-bold text-slate-400 mb-2 uppercase">Lệnh làm việc ({filteredWos.length})</div>
                    <div className="space-y-1">
                      {filteredWos.map(w => (
                        <div
                          key={w.id}
                          onClick={() => { setActiveTab('work-orders'); setShowSearchModal(false); }}
                          className="p-2 hover:bg-slate-100 rounded-lg flex items-center justify-between cursor-pointer"
                        >
                          <div>
                            <span className="font-bold text-xs text-[#3F72AF] mr-2">{w.wo_code}</span>
                            <span className="text-xs text-[#112D4E]">{w.title}</span>
                          </div>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            {ENUMS.WO_STATUSES[w.status]?.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Spare parts */}
                {filteredParts.length > 0 && (
                  <div>
                    <div className="text-xs font-bold text-slate-400 mb-2 uppercase">Vật tư ({filteredParts.length})</div>
                    <div className="space-y-1">
                      {filteredParts.map(p => (
                        <div
                          key={p.id}
                          onClick={() => { setActiveTab('inventory'); setShowSearchModal(false); }}
                          className="p-2 hover:bg-slate-100 rounded-lg flex items-center justify-between cursor-pointer"
                        >
                          <span className="font-semibold text-xs text-[#112D4E]">{p.name} ({p.part_code})</span>
                          <span className="text-xs font-mono text-slate-600">Tồn: {p.quantity_in_stock} {p.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {filteredAssets.length === 0 && filteredWos.length === 0 && filteredParts.length === 0 && (
                  <div className="py-6 text-center text-xs text-slate-500">
                    Không tìm thấy kết quả phù hợp với từ khóa này.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content body */}
        <main className="flex-1 p-6 md:p-8 bg-[#F9F7F7]">
          {children}
        </main>
      </div>
    </div>
  );
}

