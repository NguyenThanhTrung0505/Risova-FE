import { equipmentDate, meterUnits } from '../../utils/equipment';
import { usePagination } from '../../hooks/usePagination';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Box, Download, MapPin, Pencil, Plus, QrCode, Search, ShieldCheck, Trash2, UserRound } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useAuth, useData } from '../../context/DataContext';
import { canAccessPage, canCreateOnPage, canManagePage } from '../../constants/permissions';
import Dialog from '../../components/Dialog';
import Pagination from '../../components/Pagination';
import { EquipmentBadge, equipmentFieldClass } from './EquipmentFields';
import AssetTelemetry from './AssetTelemetry';

const viewTabs = {
  overview: 'Tổng quan',
  history: 'Lịch sử bảo trì',
  parts: 'Vật tư',
  telemetry: 'Dữ liệu IoT',
};

export function AssetQrDialog({ asset, onClose }) {
  const canvas = useRef(null);
  const value = asset.qr_code_url || `https://risova.vn/qr/${asset.asset_code}`;
  const { details = {} } = asset;
  const year = asset.installed_date ? new Date(asset.installed_date).getFullYear() : '2021';

  function download() {
    if (!canvas.current) return;
    const link = document.createElement('a');
    link.href = canvas.current.toDataURL('image/png');
    link.download = `QR_${asset.asset_code}.png`;
    link.click();
  }

  return (
    <Dialog title="Mã QR" onClose={onClose} width={540}>
      <div className="equipment-qr">
        <div className="equipment-qr-sheet">
          <QRCodeCanvas ref={canvas} value={value} size={156} level="H" marginSize={2} title={`Mã QR của ${asset.name}`} />
        </div>
        <div className="space-y-3 text-sm text-[#66788a]">
          <p>NAME: <strong className="text-[#112d4e]">{asset.name}</strong></p>
          <p>SERIAL: <strong className="text-[#112d4e]">{details.serial_number || '—'}</strong></p>
          <p>MODEL: <strong className="text-[#112d4e]">{details.model || '—'}</strong></p>
          <p>MANUFACTURER: <strong className="text-[#112d4e]">{details.manufacturer || '—'}</strong></p>
          <p>YEAR OF OPERATION: <strong className="text-[#112d4e]">{year}</strong></p>
        </div>
      </div>
      <div className="risova-form-actions">
        <button type="button" onClick={onClose}>Hủy</button>
        <button type="button" className="is-primary inline-flex items-center justify-center gap-1.5" onClick={download}><Download size={15} /> Tải mã</button>
      </div>
    </Dialog>
  );
}

function DetailFields({ items }) {
  return (
    <dl className="equipment-detail-fields">
      {items.map(([label, value]) => (
        <div key={label}><dt>{label}</dt><dd>{value || '—'}</dd></div>
      ))}
    </dl>
  );
}

function MaintenanceHistory({ records, users, enums, onSelectWorkOrder, heading = 'Lịch sử bảo trì', action, fullView = false }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState('ALL');

  const query = search.trim().toLowerCase();
  const filtered = fullView
    ? records.filter(order => {
        const matchesSearch = [order.wo_code, order.title].join(' ').toLowerCase().includes(query);
        return matchesSearch
          && (statusFilter === 'ALL' || order.status === statusFilter)
          && (priorityFilter === 'ALL' || order.priority === priorityFilter)
          && (typeFilter === 'ALL' || order.wo_type === typeFilter)
          && (assigneeFilter === 'ALL' || String(order.assigned_to) === assigneeFilter);
      })
    : records;
  const pagination = usePagination(filtered, [query, statusFilter, priorityFilter, typeFilter, assigneeFilter, records.length].join('|'));
  const rows = fullView ? pagination.items : filtered;

  return (
    <section className={'equipment-card ' + (fullView ? 'equipment-tab-card' : '')}>
      <div className="equipment-card-heading">
        <h2>{fullView ? `${heading} (${records.length})` : heading}</h2>
        {action}
      </div>
      {fullView && (
        <div className="equipment-filters mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input aria-label="Tìm lịch sử bảo trì" placeholder="Tìm theo tên, mã,..." value={search} onChange={event => setSearch(event.target.value)} className={equipmentFieldClass + ' !pl-9'} />
          </div>
          <select aria-label="Trạng thái" value={statusFilter} onChange={event => setStatusFilter(event.target.value)} className={equipmentFieldClass}>
            <option value="ALL">Tất cả trạng thái</option>
            {Object.entries(enums.WO_STATUSES).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}
          </select>
          <select aria-label="Ưu tiên" value={priorityFilter} onChange={event => setPriorityFilter(event.target.value)} className={equipmentFieldClass}>
            <option value="ALL">Mọi ưu tiên</option>
            {Object.entries(enums.PRIORITIES).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}
          </select>
          <select aria-label="Loại việc" value={typeFilter} onChange={event => setTypeFilter(event.target.value)} className={equipmentFieldClass}>
            <option value="ALL">Mọi loại việc</option>
            {Object.entries(enums.WO_TYPES).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}
          </select>
          <select aria-label="Người phụ trách" value={assigneeFilter} onChange={event => setAssigneeFilter(event.target.value)} className={equipmentFieldClass}>
            <option value="ALL">Người phụ trách</option>
            {users.map(user => <option key={user.id} value={user.id}>{user.full_name}</option>)}
          </select>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr>
              <th>Mã lệnh</th>
              <th>Tên công việc</th>
              <th>Loại</th>
              <th>Ưu tiên</th>
              <th>Trạng thái</th>
              <th>Người phụ trách</th>
              <th>Ngày giao</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(order => (
              <tr key={order.id}>
                <td>{onSelectWorkOrder ? <button type="button" className="equipment-table-link" onClick={() => onSelectWorkOrder(order)}>{order.wo_code}</button> : order.wo_code}</td>
                <td className="text-slate-600">{order.title}</td>
                <td className="text-slate-500">{enums.WO_TYPES[order.wo_type]?.label || order.wo_type}</td>
                <td><EquipmentBadge status={enums.PRIORITIES[order.priority]} fallback={order.priority} /></td>
                <td><EquipmentBadge status={enums.WO_STATUSES[order.status]} fallback={order.status} /></td>
                <td className="text-slate-500">{users.find(user => user.id === order.assigned_to)?.full_name || '—'}</td>
                <td className="text-slate-500">{equipmentDate(order.created_at || order.closed_at || order.actual_end)}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={7} className="risova-empty-state">Chưa có lịch sử bảo trì cho thiết bị này.</td></tr>}
          </tbody>
        </table>
      </div>
      {fullView && <Pagination {...pagination} />}
    </section>
  );
}

function AssetSpareParts({ asset, orders, canManage, canViewInventory }) {
  const { data, updateAsset } = useData();
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(false);
  const [partId, setPartId] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Merge parts explicitly saved on asset with parts used in its work orders
  const partQuantities = new Map();
  if (Array.isArray(asset.parts)) {
    for (const item of asset.parts) {
      partQuantities.set(item.part_id, (partQuantities.get(item.part_id) || 0) + Number(item.quantity_needed || 1));
    }
  } else {
    for (const order of orders) {
      for (const item of order.parts || []) {
        partQuantities.set(item.part_id, (partQuantities.get(item.part_id) || 0) + Number(item.quantity_needed || 1));
      }
    }
  }

  const parts = Array.from(partQuantities.entries())
    .map(([id, qty]) => {
      const found = data.spare_parts.find(item => item.id === id);
      return found ? { ...found, quantity_needed: qty } : null;
    })
    .filter(Boolean);

  const filtered = parts.filter(part => [part.part_code, part.name].join(' ').toLowerCase().includes(search.trim().toLowerCase()));
  const pages = usePagination(filtered, search + '|' + asset.id + '|' + parts.length);
  const total = parts.reduce((sum, part) => sum + Number(part.unit_price || 0) * Number(part.quantity_needed || 0), 0);
  const number = val => Number(val || 0).toLocaleString('vi-VN');

  function handleAddPart(event) {
    event.preventDefault();
    const id = Number(partId);
    if (!id) return;
    const currentList = Array.from(partQuantities.entries()).map(([pId, qty]) => ({ part_id: pId, quantity_needed: qty }));
    const next = currentList.some(p => p.part_id === id)
      ? currentList.map(p => p.part_id === id ? { ...p, quantity_needed: Number(p.quantity_needed) + Number(quantity) } : p)
      : [...currentList, { part_id: id, quantity_needed: Number(quantity) }];
    updateAsset(asset.id, { parts: next });
    setAdding(false);
    setPartId('');
    setQuantity(1);
  }

  function handleRemovePart(id) {
    const currentList = Array.from(partQuantities.entries())
      .filter(([pId]) => pId !== id)
      .map(([pId, qty]) => ({ part_id: pId, quantity_needed: qty }));
    updateAsset(asset.id, { parts: currentList });
  }

  return (
    <section className="equipment-card equipment-tab-card">
      <div className="equipment-card-heading">
        <h2>Danh mục vật tư thiết bị ({parts.length})</h2>
        {canManage && (
          <button type="button" className="equipment-button equipment-button-primary" onClick={() => setAdding(true)}>
            <Plus size={16} /> Thêm vật tư
          </button>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input aria-label="Tìm vật tư thiết bị" placeholder="Tìm theo tên, mã,..." value={search} onChange={event => setSearch(event.target.value)} className={equipmentFieldClass + ' !pl-9'} />
        </div>
        <strong className="text-sm text-[#112D4E]">Tổng tiền: {number(total)} đ</strong>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr>
              <th>Mã vật tư</th>
              <th>Tên vật tư</th>
              <th>Đơn vị</th>
              <th>Số lượng</th>
              <th>Đơn giá</th>
              <th>Số tiền</th>
              {canManage && <th></th>}
            </tr>
          </thead>
          <tbody>
            {pages.items.map(part => (
              <tr key={part.id}>
                <td className="font-semibold text-[#112D4E]">
                  {canViewInventory
                    ? <Link className="hover:text-[#3F72AF]" to={'/inventory?part=' + part.id}>{part.part_code}</Link>
                    : part.part_code}
                </td>
                <td className="text-slate-600">{part.name}</td>
                <td className="text-slate-500">{part.unit}</td>
                <td className="text-slate-500">{number(part.quantity_needed)}</td>
                <td className="text-slate-500">{number(part.unit_price)} đ</td>
                <td className="text-slate-500">{number(Number(part.unit_price || 0) * Number(part.quantity_needed || 0))} đ</td>
                {canManage && (
                  <td className="text-right">
                    <button type="button" aria-label={'Xóa ' + part.name} onClick={() => handleRemovePart(part.id)}>
                      <Trash2 size={15} className="text-red-500" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {!filtered.length && <tr><td colSpan={canManage ? 7 : 6} className="risova-empty-state">Chưa có phụ tùng liên quan.</td></tr>}
          </tbody>
        </table>
      </div>
      <Pagination {...pages} />
      {adding && canManage && (
        <Dialog title="Thêm vật tư thiết bị" width={480} onClose={() => setAdding(false)}>
          <form className="space-y-4" onSubmit={handleAddPart}>
            <div>
              <label htmlFor="asset-part-select">Vật tư</label>
              <select id="asset-part-select" required value={partId} onChange={event => setPartId(event.target.value)}>
                <option value="">Chọn vật tư</option>
                {data.spare_parts.filter(item => !item.is_archived && item.is_active !== false).map(item => (
                  <option key={item.id} value={item.id}>{item.part_code} · {item.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="asset-part-qty">Số lượng</label>
              <input id="asset-part-qty" type="number" required min="1" step="any" value={quantity} onChange={event => setQuantity(event.target.value)} />
            </div>
            <div className="risova-form-actions">
              <button type="button" onClick={() => setAdding(false)}>Hủy</button>
              <button type="submit">Thêm vật tư</button>
            </div>
          </form>
        </Dialog>
      )}
    </section>
  );
}

export default function AssetDetails({ asset, tab, setTab, onBack, onEdit, onQr, onSelectAssetForWo, onSelectWorkOrder }) {
  const { currentUser } = useAuth();
  const { data, ENUMS, deleteAsset } = useData();
  const role = currentUser?.role;
  const canManage = canManagePage(role, 'assets');
  const canViewIot = canAccessPage(role, 'iot');
  const canViewInventory = canAccessPage(role, 'inventory');
  const canCreateWo = canCreateOnPage(role, 'work-orders');
  const visibleTabs = Object.entries(viewTabs).filter(([key]) => key !== 'telemetry' || canViewIot);
  const effectiveTab = tab === 'telemetry' && !canViewIot ? 'overview' : tab;
  const [removeOpen, setRemoveOpen] = useState(false);
  const { details = {} } = asset;
  const location = data.locations.find(item => item.id === asset.location_id);
  const specialty = data.specialties.find(item => item.id === asset.required_specialty_id);
  const parent = data.assets.find(item => item.id === asset.parent_asset_id);
  const orders = data.work_orders.filter(item => item.asset_id === asset.id);
  const schedule = data.maintenance_schedules.find(item => item.asset_id === asset.id && item.is_active !== false);
  const lastMaintenance = orders
    .filter(item => ['COMPLETED', 'CLOSED'].includes(item.status))
    .map(item => item.closed_at || item.actual_end || item.due_date)
    .filter(Boolean)
    .sort()
    .at(-1);

  return (
    <div className="risova-page equipment-detail-page">
      <div>
        <button type="button" className="equipment-return" onClick={onBack}><ArrowLeft size={16} /> Thiết bị</button>
        <header className="equipment-detail-header">
          <div className="equipment-title-row">
            <span className="equipment-title-icon"><Box size={24} /></span>
            <div>
              <h1>{asset.name}</h1>
              <div className="equipment-title-meta">
                <span>{asset.asset_code}</span>
                <EquipmentBadge status={ENUMS.ASSET_STATUSES[asset.status]} fallback={asset.status} />
                <EquipmentBadge status={ENUMS.PRIORITIES[asset.priority]} fallback={asset.priority} />
                {location && <span className="inline-flex items-center gap-1"><MapPin size={13} />{location.name}</span>}
              </div>
            </div>
          </div>
          <div className="equipment-page-actions">
            <button type="button" className="equipment-button" onClick={onQr}><QrCode size={16} /> Xem mã QR</button>
            {canManage && <button type="button" className="equipment-button equipment-button-primary" onClick={onEdit}><Pencil size={15} /> Chỉnh sửa</button>}
            {canManage && <button type="button" className="equipment-button equipment-button-danger" onClick={() => setRemoveOpen(true)}><Trash2 size={16} /> Xóa</button>}
          </div>
        </header>
      </div>

      <nav className="risova-tabs equipment-tabs" role="tablist" aria-label="Chi tiết thiết bị">
        {visibleTabs.map(([key, label]) => (
          <button key={key} type="button" aria-selected={effectiveTab === key} role="tab" onClick={() => setTab(key)}>{label}</button>
        ))}
      </nav>

      {effectiveTab === 'overview' && (
        <div className="equipment-overview">
          <section className="equipment-card equipment-overview-main">
            <h2>Thông tin thiết bị</h2>
            <div className="equipment-overview-info">
              <img className="equipment-asset-photo" src={details.image_url || (asset.asset_code === 'CV-01' ? '/conveyor-cv01.jpg' : '/machine-cnc.jpg')} alt={asset.name} />
              <DetailFields items={[
                ['Mã thiết bị', asset.asset_code], ['Số serial', details.serial_number],
                ['Nhà sản xuất', details.manufacturer], ['Model', details.model],
                ['Ngày đưa vào vận hành', equipmentDate(asset.installed_date)], ['Giá thiết bị', details.purchase_price == null ? '' : `${Number(details.purchase_price).toLocaleString('vi-VN')} đ`],
                ['Vị trí lắp đặt', location?.name], ['Thiết bị cha', parent?.name], ['Mô tả thiết bị', details.description],
              ]} />
            </div>
            <div className="equipment-overview-foot">{[[UserRound, 'Chuyên môn', specialty?.name || 'Chưa có'], [ShieldCheck, 'Bảo hành chính hãng', equipmentDate(asset.warranty_expiry)], [Download, 'Tài liệu thiết bị', details.document_url ? <a className="equipment-table-link" href={details.document_url} target="_blank" rel="noreferrer">Nhấn vào đây</a> : 'Chưa có tài liệu']].map(([Icon, label, value]) => <div className="flex items-center gap-2" key={label}><span className="equipment-title-icon"><Icon size={20} /></span><dl className="equipment-detail-fields !block"><div><dt>{label}</dt><dd>{value}</dd></div></dl></div>)}</div>
          </section>
          <section className="equipment-card equipment-overview-side">
            <h2>Chỉ số sức khỏe</h2>
            <div className="equipment-health-ring" aria-label={`Sức khỏe ${asset.health_score} trên 100 điểm`}><strong>{asset.health_score}</strong><span>/100 điểm</span></div>
            <DetailFields items={[
              ['Tổng giờ chạy', `${Number(asset.current_meter || 0).toLocaleString('vi-VN')} ${meterUnits[asset.meter_unit] || asset.meter_unit || ''}`],
              ['Chu kỳ bảo dưỡng', schedule ? [schedule.frequency_days && schedule.frequency_days + ' ngày', schedule.meter_interval && schedule.meter_interval + ' ' + (meterUnits[asset.meter_unit] || '')].filter(Boolean).join(' / ') || 'Chưa cấu hình' : 'Chưa cấu hình'],
              ['Bảo dưỡng tiếp theo', equipmentDate(schedule?.next_due_date)], ['Bảo trì lần cuối', equipmentDate(lastMaintenance)],
            ]} />
          </section>
        </div>
      )}
      {effectiveTab === 'history' && (
        <MaintenanceHistory
          fullView
          records={orders}
          users={data.users}
          enums={ENUMS}
          onSelectWorkOrder={onSelectWorkOrder}
          action={canCreateWo && onSelectAssetForWo && <button type="button" className="equipment-button equipment-button-primary" onClick={() => onSelectAssetForWo(asset)}><Plus size={16} /> Tạo lệnh việc</button>}
        />
      )}
      {effectiveTab === 'parts' && <AssetSpareParts asset={asset} orders={orders} canManage={canManage} canViewInventory={canViewInventory} />}
      {effectiveTab === 'telemetry' && canViewIot && <AssetTelemetry asset={asset} />}
      {effectiveTab === 'overview' && <MaintenanceHistory heading="Lệnh việc gần đây" action={canCreateWo && onSelectAssetForWo && <button type="button" className="equipment-button equipment-button-primary" onClick={() => onSelectAssetForWo(asset)}><Plus size={16} /> Tạo lệnh việc</button>} records={[...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 3)} users={data.users} enums={ENUMS} onSelectWorkOrder={onSelectWorkOrder} />}
      {removeOpen && canManage && <Dialog title="Xóa thiết bị" width={440} onClose={() => setRemoveOpen(false)}><p>Thiết bị {asset.asset_code} sẽ chuyển sang trạng thái đã thanh lý và được lưu trữ.</p><div className="risova-form-actions"><button onClick={() => setRemoveOpen(false)}>Hủy</button><button className="is-primary" onClick={() => { deleteAsset(asset.id); onBack(); }}>Xóa thiết bị</button></div></Dialog>}
    </div>
  );
}
