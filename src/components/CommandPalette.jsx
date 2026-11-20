import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Layers,
  Lightbulb,
  Moon,
  Package,
  Plus,
  QrCode,
  Search,
  UserCheck,
  X,
} from 'lucide-react';
import { useAuth, useData } from '../context/DataContext';
import { ALL_ROLES, canAccessPage, canCreateOnPage } from '../constants/permissions';
import './CommandPalette.css';

export default function CommandPalette({
  isOpen = true,
  onClose,
  onNavigate,
  onOpenCreateWo,
  onOpenQrScanner,
  isDark,
  onToggleTheme,
  onSwitchRole,
  menuGroups,
}) {
  const { currentUser } = useAuth();
  const { data, ENUMS } = useData();
  const routeNavigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef(null);
  const itemRefs = useRef([]);

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
  }, [isOpen]);

  const role = currentUser?.role;
  const q = query.trim().toLocaleLowerCase('vi');

  const { groups, flatItems } = useMemo(() => {
    const matches = (...fields) => {
      if (!q) return true;
      return fields
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('vi')
        .includes(q);
    };

    const grouped = [];

    // 1. Thao tác nhanh (RBAC-aware)
    const quickActions = [];
    if (canCreateOnPage(role, 'work-orders') && onOpenCreateWo) {
      quickActions.push({
        id: 'act-create-wo',
        label: 'Tạo phiếu giao việc mới',
        sub: 'Mở biểu mẫu tạo lệnh bảo trì nhanh',
        badge: 'Thao tác',
        icon: Plus,
        run: () => onOpenCreateWo(),
      });
    }
    if (canAccessPage(role, 'assets') && onOpenQrScanner) {
      quickActions.push({
        id: 'act-qr-scan',
        label: 'Quét mã QR thiết bị',
        sub: 'Nhận diện nhanh bằng camera hoặc file ảnh',
        badge: 'QR',
        icon: QrCode,
        run: () => onOpenQrScanner(),
      });
    }
    quickActions.push({
      id: 'act-theme-toggle',
      label: isDark ? 'Bật đèn · Chuyển sang nền sáng' : 'Tắt đèn · Chuyển sang nền tối',
      sub: 'Điều chỉnh bóng đèn góc dưới trái thanh điều hướng',
      badge: isDark ? 'Tối -> Sáng' : 'Sáng -> Tối',
      icon: isDark ? Lightbulb : Moon,
      run: () => onToggleTheme?.(),
    });

    const filteredActions = quickActions.filter((item) => matches(item.label, item.sub, item.badge));
    if (filteredActions.length) {
      grouped.push({ title: 'Thao tác nhanh', items: filteredActions });
    }

    // 2. Chuyển trang nhanh (from RBAC menuGroups)
    const navItems = (menuGroups || [])
      .flatMap((group) =>
        group.items.map(([id, label, Icon]) => ({
          id: `nav-${id}`,
          label,
          sub: `Đi tới mục ${group.label}`,
          badge: 'Trang',
          icon: Icon,
          run: () => onNavigate?.(id),
        }))
      )
      .filter((item) => matches(item.label, item.sub))
      .slice(0, q ? 8 : 5);

    if (navItems.length) {
      grouped.push({ title: 'Điều hướng trang', items: navItems });
    }

    // 3. Thiết bị
    const assetItems = canAccessPage(role, 'assets')
      ? (data.assets || [])
          .filter((asset) => matches(asset.name, asset.asset_code, asset.status))
          .slice(0, q ? 6 : 3)
          .map((asset) => {
            const score = Number(asset.health_score ?? 100);
            return {
              id: `asset-${asset.id}`,
              label: asset.name,
              sub: asset.asset_code,
              badge: `${score}% sức khỏe`,
              badgeTone: score < 50 ? 'is-bad' : score < 80 ? 'is-warn' : 'is-good',
              icon: Layers,
              run: () => routeNavigate(`/equipment?asset=${asset.id}`),
            };
          })
      : [];

    if (assetItems.length) {
      grouped.push({ title: 'Thiết bị', items: assetItems });
    }

    // 4. Lệnh làm việc
    const woItems = canAccessPage(role, 'work-orders')
      ? (data.work_orders || [])
          .filter((wo) => matches(wo.title, wo.wo_code, wo.status))
          .slice(0, q ? 5 : 2)
          .map((wo) => ({
            id: `wo-${wo.id}`,
            label: wo.title,
            sub: wo.wo_code,
            badge: ENUMS.WO_STATUSES?.[wo.status]?.label || wo.status,
            icon: ClipboardList,
            run: () => routeNavigate(`/work-orders?order=${wo.id}`),
          }))
      : [];

    if (woItems.length) {
      grouped.push({ title: 'Lệnh làm việc', items: woItems });
    }

    // 5. Kho vật tư (chỉ khi tìm kiếm hoặc vai trò có quyền)
    const partItems =
      canAccessPage(role, 'inventory') && q
        ? (data.spare_parts || [])
            .filter((part) => matches(part.name, part.part_code))
            .slice(0, 5)
            .map((part) => ({
              id: `part-${part.id}`,
              label: part.name,
              sub: part.part_code,
              badge: `Tồn: ${part.quantity_in_stock}`,
              badgeTone:
                part.quantity_in_stock <= part.min_stock_level ? 'is-warn' : 'is-good',
              icon: Package,
              run: () => routeNavigate(`/inventory?part=${part.id}`),
            }))
        : [];

    if (partItems.length) {
      grouped.push({ title: 'Kho vật tư', items: partItems });
    }

    // 6. Chuyển vai trò trải nghiệm (hiển thị khi tìm hoặc nằm cuối danh sách)
    const roleItems = ALL_ROLES.map((roleCode) => ({
      id: `role-${roleCode}`,
      label: `Chuyển vai trò: ${ENUMS.USER_ROLES?.[roleCode]?.label || roleCode}`,
      sub: role === roleCode ? 'Vai trò đang sử dụng' : 'Trải nghiệm góc nhìn & phân quyền',
      badge: role === roleCode ? 'Đang dùng' : roleCode,
      badgeTone: role === roleCode ? 'is-good' : '',
      icon: UserCheck,
      run: () => onSwitchRole?.(roleCode),
    })).filter((item) => (q ? matches(item.label, item.sub, item.badge) : true));

    if (roleItems.length && q) {
      grouped.push({ title: 'Vai trò trải nghiệm', items: roleItems.slice(0, 5) });
    }

    const flat = [];
    const hydratedGroups = grouped.map((group) => ({
      ...group,
      items: group.items.map((item) => {
        const flatIdx = flat.length;
        flat.push(item);
        return { ...item, flatIdx };
      }),
    }));

    return { groups: hydratedGroups, flatItems: flat };
  }, [
    q,
    role,
    isDark,
    menuGroups,
    data.assets,
    data.work_orders,
    data.spare_parts,
    ENUMS.WO_STATUSES,
    ENUMS.USER_ROLES,
    onOpenCreateWo,
    onOpenQrScanner,
    onToggleTheme,
    onNavigate,
    onSwitchRole,
    routeNavigate,
  ]);

  if (!isOpen) return null;

  const safeSelected = flatItems.length ? Math.min(selectedIndex, flatItems.length - 1) : 0;

  const executeItem = (item) => {
    if (!item) return;
    onClose?.();
    item.run?.();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose?.();
      return;
    }
    if (!flatItems.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const next = (safeSelected + 1) % flatItems.length;
      setSelectedIndex(next);
      itemRefs.current[next]?.scrollIntoView({ block: 'nearest' });
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const prev = (safeSelected - 1 + flatItems.length) % flatItems.length;
      setSelectedIndex(prev);
      itemRefs.current[prev]?.scrollIntoView({ block: 'nearest' });
    } else if (event.key === 'Enter') {
      event.preventDefault();
      executeItem(flatItems[safeSelected]);
    }
  };

  return (
    <div
      className="risova-cmd-backdrop"
      role="presentation"
      onClick={() => onClose?.()}
    >
      <section
        className="risova-cmd-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Bảng lệnh nhanh Risova"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="risova-cmd-input-row">
          <Search size={18} aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Tìm nhanh thiết bị, lệnh việc, vật tư hoặc thao tác (VD: AC-04, đèn, Admin)..."
            aria-label="Tìm nhanh lệnh hoặc dữ liệu"
          />
          {query && (
            <button
              type="button"
              className="risova-cmd-clear"
              aria-label="Xóa từ khóa"
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
                inputRef.current?.focus();
              }}
            >
              <X size={15} />
            </button>
          )}
          <span className="risova-cmd-esc">Esc</span>
        </div>

        <div className="risova-cmd-list">
          {groups.length ? (
            groups.map((group) => (
              <div className="risova-cmd-group" key={group.title}>
                <p className="risova-cmd-group-label">{group.title}</p>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isSelected = item.flatIdx === safeSelected;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      ref={(el) => {
                        itemRefs.current[item.flatIdx] = el;
                      }}
                      className={`risova-cmd-item${isSelected ? ' is-selected' : ''}`}
                      onMouseEnter={() => setSelectedIndex(item.flatIdx)}
                      onClick={() => executeItem(item)}
                    >
                      <span className="risova-cmd-item-icon" aria-hidden="true">
                        <Icon size={16} />
                      </span>
                      <span className="risova-cmd-item-body">
                        <strong>{item.label}</strong>
                        {item.sub && <small>{item.sub}</small>}
                      </span>
                      {item.badge && (
                        <span className={`risova-cmd-badge ${item.badgeTone || ''}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          ) : (
            <p className="risova-cmd-empty">
              Không tìm thấy kết quả cho “{query}”.
            </p>
          )}
        </div>

        <div className="risova-cmd-footer">
          <span>↑↓ Di chuyển · Enter Chọn · Esc Đóng</span>
          <span>Ctrl + K · Risova Quick Launcher</span>
        </div>
      </section>
    </div>
  );
}
