import { equipmentDate } from '../utils/equipment';
import { usePagination } from '../hooks/usePagination';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Plus, QrCode, Search } from 'lucide-react';
import { useAuth, useData } from '../context/DataContext';
import { canManagePage } from '../constants/permissions';
import Pagination from '../components/Pagination';
import Dialog from '../components/Dialog';
import AssetDetails, { AssetQrDialog } from './equipment/AssetDetails';
import AssetForm from './equipment/AssetForm';
import AssetBulkForm from './equipment/AssetBulkForm';
import { EquipmentBadge, EquipmentHealth, equipmentFieldClass } from './equipment/EquipmentFields';
import './equipment/equipment.css';

const detailTabs = ['overview', 'history', 'parts', 'telemetry'];

export default function AssetsPage({
  onSelectAssetForWo,
  onOpenQrScanner,
  onSelectWorkOrder,
  selectedAssetFromExternal,
  onClearSelectedAsset,
}) {
  const { currentUser } = useAuth();
  const { data, ENUMS, createAsset, updateAsset } = useData();
  const canManage = canManagePage(currentUser?.role, 'assets');
  const [params, setParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [showQrCode, setShowQrCode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const routeAssetId = params.get('asset');
  const assetId = selectedAssetFromExternal?.id ?? routeAssetId;
  const selectedAsset = data.assets.find(asset => String(asset.id) === String(assetId));
  const requestedTab = params.get('view');
  const tab = routeAssetId === String(assetId) && detailTabs.includes(requestedTab) ? requestedTab : 'overview';

  const query = searchTerm.trim().toLocaleLowerCase('vi');
  const filteredAssets = data.assets.filter(asset => {
    const matchesSearch = [asset.name, asset.asset_code].some(text => text.toLocaleLowerCase('vi').includes(query));
    return !asset.is_archived && matchesSearch
      && (statusFilter === 'ALL' || asset.status === statusFilter)
      && (priorityFilter === 'ALL' || asset.priority === priorityFilter)
      && (locationFilter === 'ALL' || String(asset.location_id) === locationFilter);
  });
  const pagination = usePagination(filteredAssets, [query, statusFilter, priorityFilter, locationFilter].join('|'));

  const lastMaintenance = new Map();
  for (const order of data.work_orders) {
    if (!['COMPLETED', 'CLOSED'].includes(order.status)) continue;
    const date = order.closed_at || order.actual_end || order.due_date;
    if (date && date > (lastMaintenance.get(order.asset_id) || '')) lastMaintenance.set(order.asset_id, date);
  }

  function openAsset(asset, nextTab = 'overview', replace = false) {
    setParams({ asset: String(asset.id), view: nextTab }, { replace });
  }

  function closeAsset() {
    onClearSelectedAsset?.();
    setParams({});
    setShowQrCode(false);
    setEditMode(false);
  }

  function saveAsset(values) {
    const { manufacturer, model, serial_number, purchase_price, purchase_date, description, image_url, document_url } = values;
    updateAsset(selectedAsset.id, {
      asset_code: values.asset_code,
      name: values.name,
      location_id: values.location_id,
      priority: values.priority,
      required_specialty_id: values.required_specialty_id || null,
      status: values.status,
      parent_asset_id: values.parent_asset_id,
      current_meter: values.current_meter,
      meter_unit: values.meter_unit,
      installed_date: values.installed_date || null,
      warranty_expiry: values.warranty_expiry || null,
      qr_code_url: selectedAsset.asset_code === values.asset_code
        ? selectedAsset.qr_code_url
        : 'https://risova.vn/qr/' + values.asset_code,
      details: { manufacturer, model, serial_number, purchase_price, purchase_date, description, image_url, document_url },
    });
    setEditMode(false);
  }

  if (selectedAsset) {
    return (
      <>
        <AssetDetails
          asset={selectedAsset}
          tab={tab}
          setTab={nextTab => openAsset(selectedAsset, nextTab)}
          onBack={closeAsset}
          onEdit={() => setEditMode(true)}
          onQr={() => setShowQrCode(true)}
          onSelectAssetForWo={onSelectAssetForWo}
          onSelectWorkOrder={order => {
            onClearSelectedAsset?.();
            onSelectWorkOrder(order);
          }}
        />
        {showQrCode && <AssetQrDialog asset={selectedAsset} onClose={() => setShowQrCode(false)} />}
        {editMode && canManage && (
          <Dialog title="Chỉnh sửa thiết bị" onClose={() => setEditMode(false)} width={700}>
            <AssetForm asset={selectedAsset} onCancel={() => setEditMode(false)} onSave={saveAsset} />
          </Dialog>
        )}
      </>
    );
  }

  return (
    <div className="risova-page space-y-6">
      <div className="equipment-detail-header">
        <div>
          <h1>Quản lý thiết bị</h1>
          <p className="text-slate-500">Theo dõi vòng đời, tình trạng và lịch sử bảo trì của toàn bộ tài sản.</p>
        </div>
        <div className="equipment-page-actions">
          {onOpenQrScanner && <button type="button" className="equipment-button" onClick={onOpenQrScanner}><QrCode size={16} /> Quét mã QR</button>}
          {canManage && <button type="button" className="equipment-button equipment-button-primary" onClick={() => setParams({ view: 'create' })}><Plus size={17} /> Thêm thiết bị</button>}
        </div>
      </div>

      <section className="risova-data-table">
        <div className="risova-table-toolbar grid gap-3 md:grid-cols-[minmax(140px,1fr)_auto_auto_minmax(120px,190px)]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input aria-label="Tìm thiết bị" placeholder="Tìm theo tên, mã..." value={searchTerm} onChange={event => setSearchTerm(event.target.value)} className={equipmentFieldClass + ' !pl-9'} />
          </div>
          <select aria-label="Trạng thái thiết bị" value={statusFilter} onChange={event => setStatusFilter(event.target.value)} className={equipmentFieldClass}>
            <option value="ALL">Tất cả trạng thái</option>
            {Object.entries(ENUMS.ASSET_STATUSES).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}
          </select>
          <select aria-label="Ưu tiên thiết bị" value={priorityFilter} onChange={event => setPriorityFilter(event.target.value)} className={equipmentFieldClass}>
            <option value="ALL">Độ ưu tiên</option>
            {Object.entries(ENUMS.PRIORITIES).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}
          </select>
          <select aria-label="Vị trí thiết bị" value={locationFilter} onChange={event => setLocationFilter(event.target.value)} className={equipmentFieldClass}>
            <option value="ALL">Vị trí</option>
            {data.locations.map(location => <option key={location.id} value={location.id}>{location.name}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead><tr><th className="px-4">Thiết bị</th><th className="px-4">Vị trí</th><th className="px-4">Ưu tiên</th><th className="px-4">Trạng thái</th><th className="px-4">Sức khỏe</th><th className="px-4">Bảo trì lần cuối</th></tr></thead>
            <tbody>
              {pagination.items.map(asset => {
                const location = data.locations.find(item => item.id === asset.location_id);
                return (
                  <tr key={asset.id} className="border-b border-slate-100 cursor-pointer" onClick={() => openAsset(asset)}>
                    <td className="px-4">
                      <div className="flex items-center gap-3">
                        <span className="equipment-list-icon"><Box size={18} /></span>
                        <div>
                          <button type="button" className="equipment-table-link" onClick={event => { event.stopPropagation(); openAsset(asset); }}>{asset.name}</button>
                          <div className="text-[11px] text-slate-500 mt-0.5">{asset.asset_code}{asset.details?.model ? ' · ' + asset.details.model : ''}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 text-slate-500">{location?.name || 'Chưa phân bổ'}</td>
                    <td className="px-4"><EquipmentBadge status={ENUMS.PRIORITIES[asset.priority]} fallback={asset.priority} /></td>
                    <td className="px-4"><EquipmentBadge status={ENUMS.ASSET_STATUSES[asset.status]} fallback={asset.status} /></td>
                    <td className="px-4"><EquipmentHealth score={asset.health_score} /></td>
                    <td className="px-4 text-xs text-slate-500">{equipmentDate(lastMaintenance.get(asset.id))}</td>
                  </tr>
                );
              })}
              {!filteredAssets.length && <tr><td colSpan={6} className="risova-empty-state">Không tìm thấy thiết bị phù hợp.</td></tr>}
            </tbody>
          </table>
        </div>
        <Pagination {...pagination} />
      </section>
      {canManage && params.get('view') === 'create' && <Dialog title="Thêm thiết bị" width={1420} onClose={closeAsset}><AssetBulkForm onCancel={closeAsset} onSave={assets => { assets.forEach(createAsset); closeAsset(); }} /></Dialog>}
    </div>
  );
}

