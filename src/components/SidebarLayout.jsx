import { useEffect, useRef, useState } from 'react';
import { useAuth, useData } from '../context/DataContext';
import {
  Layers, MapPin, ClipboardList, Package,
  Users, BarChart3, Search, Bell, ChevronDown, LogOut,
  CheckCircle2, AlertTriangle, X, RotateCcw, QrCode, Menu, ChevronRight,
  CircleHelp, UserRound, Component, CalendarDays, ChartNoAxesCombined, FileSearch
} from 'lucide-react';
import RisovaLogo from './RisovaLogo';
import SidebarThemeBulb from './SidebarThemeBulb';
import CommandPalette from './CommandPalette';
import FactoryPulsePill from './FactoryPulsePill';
import { useLocation, useNavigate } from 'react-router-dom';
import { ALL_ROLES, canAccessPage } from '../constants/permissions';

const groups = [
  { label: 'Tổng quan', items: [['dashboard', 'Bảng điều khiển', Component]] },
  { label: 'Vận hành', items: [
    ['assets', 'Thiết bị', Layers], ['locations', 'Địa điểm', MapPin],
    ['work-orders', 'Lệnh làm việc', ClipboardList], ['schedules', 'Bảo trì định kỳ', CalendarDays]
  ] },
  { label: 'Nguồn lực', items: [
    ['inventory', 'Kho vật tư', Package], ['iot', 'Giám sát IoT', ChartNoAxesCombined], ['users', 'Nhân sự', Users]
  ] },
  { label: 'Phân tích', items: [['reports', 'Báo cáo', BarChart3], ['audit', 'Nhật ký', FileSearch]] }
];
const titles = Object.fromEntries(groups.flatMap(group => group.items.map(([id, label]) => [id, label])));

export default function SidebarLayout({ activeTab, setActiveTab, onOpenCreateWo, onOpenQrScanner, children }) {
  const { currentUser, loginAsRole, logout } = useAuth();
  const location = useLocation();
  const routeNavigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const role = currentUser?.role;
  const canViewIot = canAccessPage(role, 'iot');
  const menuGroups = groups
    .map(group => ({ ...group, items: group.items.filter(([id]) => canAccessPage(role, id)) }))
    .filter(group => group.items.length > 0);
  const detailLabels = { assets: 'Thiết bị', locations: 'Vị trí', schedules: 'Bảo trì', inventory: 'Kho vật tư', 'work-orders': 'Lệnh việc' };
  const hasDetail = ['asset', 'location', 'schedule', 'part', 'order'].some(key => params.has(key));
  const pageLabel = activeTab === 'profile' ? 'Hồ sơ'
    : hasDetail ? (detailLabels[activeTab] || titles[activeTab]) + ' / Chi tiết'
    : activeTab === 'inventory' && params.get('view') === 'transactions' ? 'Kho vật tư / Giao dịch kho'
    : activeTab === 'users' && params.get('tab') === 'specialties' ? 'Chuyên môn'
    : activeTab === 'users' && params.get('tab') === 'work_shifts' ? 'Ca làm việc'
    : activeTab === 'iot' && params.get('view') === 'thresholds' ? 'Quản lý ngưỡng'
    : activeTab === 'iot' && params.get('view') === 'alerts' ? 'Cảnh báo IoT'
    : activeTab === 'work-orders' && params.get('view') === 'archive' ? 'Lưu trữ lệnh việc'
    : titles[activeTab];
  const { data, ENUMS, resetToDefault, addToast } = useData();
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('risova_theme_mode') === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });
  const shellRef = useRef(null);
  const searchRef = useRef(null);
  const unreadAlerts = (data.alerts || []).filter(alert => alert.status === 'OPEN');
  const query = searchQuery.trim().toLocaleLowerCase('vi');
  const searchGroups = [
    { title: 'Thiết bị', tab: 'assets', items: data.assets, name: 'name', code: 'asset_code', icon: Layers },
    { title: 'Lệnh làm việc', tab: 'work-orders', items: data.work_orders, name: 'title', code: 'wo_code', icon: ClipboardList },
    { title: 'Vật tư', tab: 'inventory', items: data.spare_parts, name: 'name', code: 'part_code', icon: Package }
  ].filter(group => canAccessPage(role, group.tab)).map(group => ({ ...group, matches: query ? group.items.filter(item =>
    (item[group.name] + ' ' + item[group.code]).toLocaleLowerCase('vi').includes(query)
  ).slice(0, 5) : [] }));
  const resultCount = searchGroups.reduce((count, group) => count + group.matches.length, 0);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('risova_theme_mode', theme);
    } catch {
      // Ignore storage errors
    }
    return () => {
      delete document.documentElement.dataset.theme;
    };
  }, [theme]);

  useEffect(() => {
    const handleKey = event => {
      if (event.key === 'Escape') {
        setOpenMenu(null);
        setMobileOpen(false);
        setSearchOpen(false);
        setCommandOpen(false);
        setHelpOpen(false);
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpenMenu(null);
        setSearchOpen(false);
        setCommandOpen(previous => !previous);
      }
    };
    const handleOutside = event => {
      if (!event.target.closest('[data-popover]')) setOpenMenu(null);
      if (!event.target.closest('.risova-search')) setSearchOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    document.addEventListener('pointerdown', handleOutside);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('pointerdown', handleOutside);
    };
  }, []);

  const navigate = tab => {
    setActiveTab(tab);
    setMobileOpen(false);
    setOpenMenu(null);
    setSearchOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  const toggleMenu = name => setOpenMenu(previous => previous === name ? null : name);
  const openSearchResult = (group, item) => {
    const routes = { assets: '/equipment?asset=', 'work-orders': '/work-orders?order=', inventory: '/inventory?part=' };
    routeNavigate(routes[group.tab] + item.id);
    setSearchOpen(false);
    setSearchQuery('');
  };
  const switchRole = nextRole => {
    loginAsRole(nextRole);
    setOpenMenu(null);
    if (!canAccessPage(nextRole, activeTab)) {
      setActiveTab('dashboard');
    }
    const roleLabel = ENUMS.USER_ROLES[nextRole]?.label || nextRole;
    addToast?.(`Đã chuyển sang vai trò ${roleLabel}`, 'info');
  };
  const avatar = <span className="risova-avatar">{currentUser?.avatar_initials || 'MA'}</span>;
  const userInfo = <span className="risova-user-info">
    <strong>{currentUser?.full_name}</strong>
    <small>{ENUMS.USER_ROLES[currentUser?.role]?.label || currentUser?.role}</small>
  </span>;

  return (
    <div className="risova-app" ref={shellRef}>
      <a className="risova-skip-link" href="#main-content">Đến nội dung chính</a>
      {mobileOpen && <button className="risova-sidebar-backdrop" aria-label="Đóng điều hướng" onClick={() => setMobileOpen(false)} />}
      <aside id="main-navigation" className={['risova-navigation', mobileOpen && 'is-open'].filter(Boolean).join(' ')}>
        <div className="risova-navigation-brand">
          <RisovaLogo isDarkBg />
          <button className="risova-icon-button risova-mobile-close" aria-label="Đóng điều hướng" onClick={() => setMobileOpen(false)}><X size={20} /></button>
        </div>
        <nav className="risova-navigation-groups" aria-label="Điều hướng chính">
          {menuGroups.map(group => <div className="risova-navigation-group" key={group.label}>
            <p className="risova-navigation-label">{group.label}</p>
            {group.items.map(([id, label, Icon]) => <button
              key={id}
              className={['risova-navigation-item', activeTab === id && 'is-active'].filter(Boolean).join(' ')}
              aria-current={activeTab === id ? 'page' : undefined}
              onClick={() => navigate(id)}
            ><Icon size={18} strokeWidth={1.8} fill={id === 'assets' ? 'currentColor' : 'none'} /><span>{label}</span></button>)}
          </div>)}
        </nav>
        <SidebarThemeBulb
          isDark={theme === 'dark'}
          onToggle={() => setTheme(previous => (previous === 'dark' ? 'light' : 'dark'))}
        />
        <div className="risova-navigation-account" data-popover>
          <button className="risova-account-button" onClick={() => toggleMenu('account')} aria-expanded={openMenu === 'account'}>
            {avatar}{userInfo}<ChevronDown size={16} />
          </button>
          {openMenu === 'account' && <div className="risova-popover risova-account-menu">
            <div className="risova-popover-heading"><strong>{currentUser?.full_name}</strong><small>{currentUser?.email}</small></div>
            <button className="risova-menu-item" onClick={() => navigate('profile')}><UserRound size={16} />Hồ sơ của bạn</button>
            <button className="risova-menu-item" onClick={() => { setHelpOpen(true); setOpenMenu(null); }}><CircleHelp size={16} />Trợ giúp sử dụng</button>
            <div className="risova-menu-divider" />
            <p className="risova-menu-caption">Chuyển vai trò trải nghiệm</p>
            {ALL_ROLES.map(roleCode => <button
              key={roleCode} className="risova-menu-item"
              onClick={() => switchRole(roleCode)}
            ><span>{ENUMS.USER_ROLES[roleCode]?.label || roleCode}</span>{role === roleCode && <CheckCircle2 size={15} />}</button>)}
            <div className="risova-menu-divider" />
            <button className="risova-menu-item" onClick={() => {
              if (window.confirm('Khôi phục dữ liệu mẫu? Các thay đổi trong bản demo sẽ được thay thế.')) {
                resetToDefault(); setOpenMenu(null);
              }
            }}><RotateCcw size={16} />Khôi phục dữ liệu mẫu</button>
            <button className="risova-menu-item is-danger" onClick={logout}><LogOut size={16} />Đăng xuất</button>
          </div>}
        </div>
      </aside>

      <div className="risova-workspace">
        <header className="risova-topbar">
          <button className="risova-icon-button risova-mobile-toggle" aria-label="Mở điều hướng" aria-expanded={mobileOpen} aria-controls="main-navigation" onClick={() => setMobileOpen(true)}><Menu size={22} /></button>
          <div className="risova-breadcrumb"><span>Không gian làm việc /</span><strong>{pageLabel}</strong></div>
          <div className="risova-search">
            <Search size={17} />
            <input ref={searchRef} aria-label="Tìm thiết bị, phiếu công việc, vật tư" placeholder="Tìm thiết bị, phiếu công việc, vật tư" value={searchQuery}
              onChange={event => { setSearchQuery(event.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)} />
            {searchQuery ? (
              <button aria-label="Xóa tìm kiếm" onClick={() => { setSearchQuery(''); searchRef.current?.focus(); }}><X size={15} /></button>
            ) : (
              <button
                type="button"
                className="risova-cmd-trigger"
                onClick={() => setCommandOpen(true)}
                title="Mở bảng lệnh nhanh (Ctrl+K)"
              >
                Ctrl K
              </button>
            )}
            {searchOpen && query && <div className="risova-popover risova-search-results">
              <div className="risova-popover-heading"><strong>Kết quả tìm kiếm</strong><small>{resultCount} kết quả cho “{searchQuery}”</small></div>
              {searchGroups.map(group => group.matches.length > 0 && <div key={group.tab}>
                <p className="risova-menu-caption">{group.title}</p>
                {group.matches.map(item => <button className="risova-search-result" key={item.id} onClick={() => openSearchResult(group, item)}>
                  <group.icon size={18} /><span><strong>{item[group.name]}</strong><small>{item[group.code]}</small></span><ChevronRight size={15} />
                </button>)}
              </div>)}
              {!resultCount && <p className="risova-empty-state">Không tìm thấy kết quả phù hợp.</p>}
            </div>}
          </div>
          <div className="risova-topbar-actions">
            <FactoryPulsePill
              isOpen={openMenu === 'pulse'}
              onToggle={() => toggleMenu('pulse')}
              onClose={() => setOpenMenu(null)}
              onNavigate={navigate}
            />
            {canAccessPage(role, 'assets') && <button className="risova-icon-button risova-qr-button" onClick={onOpenQrScanner} aria-label="Quét mã QR thiết bị" title="Quét mã QR thiết bị"><QrCode size={19} /></button>}
            <div className="relative" data-popover>
              <button className="risova-icon-button risova-notification-button" aria-label={'Thông báo, ' + unreadAlerts.length + ' cảnh báo mới'} aria-expanded={openMenu === 'notifications'} onClick={() => toggleMenu('notifications')}>
                <Bell size={22} strokeWidth={1.7} />{unreadAlerts.length > 0 && <span className="risova-notification-dot">{unreadAlerts.length}</span>}
              </button>
              {openMenu === 'notifications' && <div className="risova-popover risova-notifications">
                <div className="risova-popover-heading"><strong>Thông báo <span className="risova-count">{unreadAlerts.length}</span></strong>{canViewIot && <button onClick={() => navigate('iot')}>Xem tất cả</button>}</div>
                {(data.alerts || []).slice(0, 5).map(alert => <button key={alert.id} className="risova-notification-item" onClick={() => canViewIot ? navigate('iot') : setOpenMenu(null)}>
                  <span className={alert.level === 'DANGER' ? 'risova-alert-icon is-danger' : 'risova-alert-icon'}><AlertTriangle size={17} /></span>
                  <span><strong>{alert.title}</strong><small>{alert.description}</small></span>
                </button>)}
                {!data.alerts?.length && <p className="risova-empty-state">Bạn chưa có thông báo mới.</p>}
              </div>}
            </div>
            <div className="relative" data-popover>
              <button className="risova-topbar-profile" onClick={() => toggleMenu('profile')} aria-label="Menu tài khoản" aria-expanded={openMenu === 'profile'}>{avatar}{userInfo}</button>
              {openMenu === 'profile' && <div className="risova-popover" style={{ right: 0, top: 'calc(100% + 14px)', width: 240, padding: 5 }}>
                <button className="risova-menu-item" onClick={() => navigate('profile')}><UserRound size={16} />Hồ sơ của bạn</button>
                <button className="risova-menu-item" onClick={() => routeNavigate('/auth/reset-password', { state: { fromProfile: true } })}><RotateCcw size={16} />Đổi mật khẩu</button>
                <div className="risova-menu-divider" />
                <p className="risova-menu-caption">Chuyển vai trò trải nghiệm</p>
                {ALL_ROLES.map(roleCode => <button
                  key={roleCode} className="risova-menu-item"
                  onClick={() => switchRole(roleCode)}
                ><span>{ENUMS.USER_ROLES[roleCode]?.label || roleCode}</span>{role === roleCode && <CheckCircle2 size={15} />}</button>)}
                <div className="risova-menu-divider" />
                <button className="risova-menu-item is-danger" onClick={logout}><LogOut size={16} />Đăng xuất</button>
              </div>}
            </div>
          </div>
        </header>
        <main id="main-content" tabIndex={-1} className="risova-content" key={activeTab}>{children}</main>
      </div>
      {commandOpen && (
        <CommandPalette
          isOpen={commandOpen}
          onClose={() => setCommandOpen(false)}
          onNavigate={navigate}
          onOpenCreateWo={onOpenCreateWo}
          onOpenQrScanner={onOpenQrScanner}
          isDark={theme === 'dark'}
          onToggleTheme={() => setTheme(previous => (previous === 'dark' ? 'light' : 'dark'))}
          onSwitchRole={switchRole}
          menuGroups={menuGroups}
        />
      )}
      {helpOpen && <div className="risova-dialog-backdrop" onClick={() => setHelpOpen(false)}>
        <section className="risova-help-dialog" role="dialog" aria-modal="true" aria-labelledby="help-title" onClick={event => event.stopPropagation()}>
          <div className="risova-dialog-heading"><h2 id="help-title">Trợ giúp sử dụng</h2><button className="risova-icon-button" aria-label="Đóng trợ giúp" onClick={() => setHelpOpen(false)}><X size={20} /></button></div>
          <p>Chọn một mục ở thanh điều hướng để quản lý thiết bị, lệnh làm việc, lịch bảo trì và kho vật tư.</p>
          <p>Dùng ô tìm kiếm hoặc phím <kbd>Ctrl K</kbd> để tìm nhanh. Nhấn vào một dòng trong bảng để xem chi tiết.</p>
          <p>Trong menu tài khoản, bạn có thể chuyển vai trò để trải nghiệm các nghiệp vụ tương ứng.</p>
        </section>
      </div>}
    </div>
  );
}
