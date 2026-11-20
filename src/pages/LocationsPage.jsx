import { equipmentDate } from '../utils/equipment';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronRight, EllipsisVertical, MapPin, Pencil, Plus, Trash2, X } from 'lucide-react';
import Dialog from '../components/Dialog';
import { useAuth, useData } from '../context/DataContext';
import { canManagePage } from '../constants/permissions';
import { EquipmentField, equipmentFieldClass } from './equipment/EquipmentFields';
import './equipment/equipment.css';

const parentTypes = { ZONE: 'PLANT', LINE: 'ZONE' };
const typeLabels = { PLANT: 'Nhà máy', ZONE: 'Khu vực', LINE: 'Dây chuyền' };
const codePrefixes = { PLANT: 'P', ZONE: 'Z', LINE: 'L' };

function LocationForm({ location, locations, onCancel, onSave }) {
  const [form, setForm] = useState(() => location || {
    name: '',
    location_type: '',
    parent_id: '',
    description: '',
  });

  function change(event) {
    const { name, value } = event.target;
    setForm(previous => ({ ...previous, [name]: value, ...(name === 'location_type' ? { parent_id: '' } : {}) }));
  }

  function submit(event) {
    event.preventDefault();
    const name = form.name.trim();
    if (!name) {
      event.currentTarget.elements.name.setCustomValidity('Nhập tên vị trí để tiếp tục.');
      event.currentTarget.reportValidity();
      return;
    }
    const prefix = codePrefixes[form.location_type];
    let sequence = 1;
    while (locations.some(item => item.code === prefix + '-' + String(sequence).padStart(3, '0'))) sequence += 1;
    const code = location?.code || prefix + '-' + String(sequence).padStart(3, '0');
    onSave({
      code,
      name,
      location_type: form.location_type,
      parent_id: form.parent_id ? Number(form.parent_id) : null,
      description: (form.description ?? '').trim(),
    });
  }

  const isParent = location && locations.some(item => item.parent_id === location.id);
  const availableParents = locations.filter(item => item.id !== location?.id && item.location_type === parentTypes[form.location_type]);

  return (
    <form onSubmit={submit}>
      <div className="location-form-fields">
        <EquipmentField label="Tên vị trí">
          <input className={equipmentFieldClass} required name="name" value={form.name} onChange={event => { event.target.setCustomValidity(''); change(event); }} placeholder="Nhập tên vị trí" />
        </EquipmentField>
        <EquipmentField label="Cấp bậc vị trí">
          <select className={equipmentFieldClass} required name="location_type" value={form.location_type} onChange={change} disabled={isParent}>
            <option value="">Chọn cấp bậc vị trí</option>
            {Object.entries(typeLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </EquipmentField>
        <EquipmentField label="Vị trí cha">
          <select className={equipmentFieldClass} name="parent_id" value={form.parent_id || ''} onChange={change} required={Boolean(parentTypes[form.location_type])} disabled={!parentTypes[form.location_type]}>
            <option value="">Chọn vị trí cha</option>
            {availableParents.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </EquipmentField>
        <EquipmentField label="Mô tả">
          <textarea className={equipmentFieldClass} name="description" value={form.description || ''} onChange={change} rows={4} placeholder="Nhập mô tả tại đây..." />
        </EquipmentField>
      </div>
      <div className="risova-form-actions">
        <button type="button" onClick={onCancel}>Hủy</button>
        <button type="submit">Lưu vị trí</button>
      </div>
    </form>
  );
}

function LocationDrawer({ location, parent, assets, onClose, onSelectAsset }) {
  const [showAssets, setShowAssets] = useState(false);
  return (
    <aside className="location-drawer" aria-labelledby="location-detail-title">
      <div className="location-drawer-head">
        <h2 id="location-detail-title">Chi tiết vị trí</h2>
        <button type="button" className="risova-icon-button" aria-label="Đóng chi tiết vị trí" onClick={onClose}><X size={20} /></button>
      </div>
      <div className="location-drawer-body">
        <div className="equipment-title-row">
          <span className="equipment-list-icon"><MapPin size={20} /></span>
          <strong>{location.name}</strong>
        </div>
        <dl className="equipment-detail-fields">
          <div><dt>Mã vị trí</dt><dd>{location.code}</dd></div>
          <div><dt>Loại vị trí</dt><dd>{typeLabels[location.location_type]}</dd></div>
          <div><dt>Vị trí cha</dt><dd>{parent?.name || '—'}</dd></div>
          <div><dt>Mô tả</dt><dd>{location.description || '—'}</dd></div>
          <div>
            <dt>Thiết bị</dt>
            <dd><button type="button" className="equipment-table-link" aria-expanded={showAssets} onClick={() => setShowAssets(previous => !previous)}>{assets.length} thiết bị</button></dd>
          </div>
          {showAssets && (
            <ul className="location-drawer-assets">
              {assets.map(asset => (
                <li key={asset.id}>
                  {onSelectAsset
                    ? <button type="button" className="equipment-table-link" onClick={() => onSelectAsset(asset)}>{asset.name}</button>
                    : asset.name}
                </li>
              ))}
              {!assets.length && <li>Chưa có thiết bị.</li>}
            </ul>
          )}
          <div><dt>Ngày tạo</dt><dd>{equipmentDate(location.created_at)}</dd></div>
        </dl>
      </div>
    </aside>
  );
}

function LocationTreeNode({ location, childrenById, assetsById, selectedId, openMenuId, canManage, onSelect, onMenu, onEdit, onDelete, visited }) {
  if (visited.has(location.id)) return null;
  const branch = new Set([...visited, location.id]);
  const children = childrenById.get(location.id) || [];
  const assets = assetsById.get(location.id) || [];
  const expandedMenu = openMenuId === location.id;
  return (
    <li>
      <div className="location-node">
        {location.location_type === 'PLANT' ? <MapPin size={25} /> : <ChevronRight size={20} />}
        <button type="button" className="location-node-label" onClick={() => onSelect(location)} aria-expanded={selectedId === location.id}>
          <strong>{location.name} ({location.code})</strong>
          <small>{typeLabels[location.location_type]}</small>
        </button>
        <button type="button" className="location-node-count" onClick={() => onSelect(location)} aria-label={assets.length + ' thiết bị tại ' + location.name}>{assets.length} thiết bị</button>
        {canManage && (
          <div className="location-node-menu">
            <button type="button" className="risova-icon-button" aria-expanded={expandedMenu} aria-label={'Tùy chọn ' + location.name} onClick={() => onMenu(expandedMenu ? null : location.id)}><EllipsisVertical size={18} /></button>
            {expandedMenu && (
              <div className="location-node-menu-items">
                <button type="button" onClick={() => onEdit(location)}><Pencil size={16} /> Sửa</button>
                <button type="button" className="text-red-600" onClick={() => onDelete(location)}><Trash2 size={16} /> Xóa</button>
              </div>
            )}
          </div>
        )}
      </div>
      {!!children.length && (
        <ul>
          {children.map(child => <LocationTreeNode key={child.id} location={child} childrenById={childrenById} assetsById={assetsById} selectedId={selectedId} openMenuId={openMenuId} canManage={canManage} onSelect={onSelect} onMenu={onMenu} onEdit={onEdit} onDelete={onDelete} visited={branch} />)}
        </ul>
      )}
    </li>
  );
}

export default function LocationsPage({ onSelectAsset }) {
  const { currentUser } = useAuth();
  const { data, createLocation, updateLocation, deleteLocation } = useData();
  const canManage = canManagePage(currentUser?.role, 'locations');
  const [params, setParams] = useSearchParams();
  const [openMenuId, setOpenMenuId] = useState(null);
  const [form, setForm] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const selectedLocation = data.locations.find(item => String(item.id) === params.get('location'));
  const childrenById = new Map();
  const knownIds = new Set(data.locations.map(item => item.id));
  for (const item of data.locations) {
    const parentId = knownIds.has(item.parent_id) ? item.parent_id : null;
    const group = childrenById.get(parentId) || [];
    group.push(item);
    childrenById.set(parentId, group);
  }
  const assetsById = new Map();
  for (const asset of data.assets) {
    if (asset.is_archived) continue;
    let id = asset.location_id;
    const seen = new Set();
    while (id != null && !seen.has(id)) {
      seen.add(id);
      const group = assetsById.get(id) || [];
      group.push(asset);
      assetsById.set(id, group);
      id = data.locations.find(item => item.id === id)?.parent_id;
    }
  }

  useEffect(() => {
    if (openMenuId == null) return undefined;
    const closeOnClick = event => {
      if (!event.target.closest('.location-node-menu')) setOpenMenuId(null);
    };
    const closeOnEscape = event => {
      if (event.key === 'Escape') setOpenMenuId(null);
    };
    document.addEventListener('pointerdown', closeOnClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [openMenuId]);

  function openLocation(location) {
    setOpenMenuId(null);
    setParams({ location: String(location.id) });
  }

  function save(values) {
    if (form.location) updateLocation(form.location.id, values);
    else createLocation(values);
    setForm(null);
  }

  function remove() {
    if (deleteLocation(pendingDelete.id) && selectedLocation?.id === pendingDelete.id) setParams({});
    setPendingDelete(null);
  }

  return (
    <div className="risova-page space-y-6">
      <div className="equipment-detail-header">
        <div>
          <h1>Cấu trúc vị trí</h1>
          <p className="text-slate-500">Quản lý phân cấp Nhà máy → Xưởng → Dây chuyền.</p>
        </div>
        {canManage && <button type="button" className="equipment-button equipment-button-primary" onClick={() => setForm({})}><Plus size={17} /> Thêm vị trí</button>}
      </div>

      <section className="equipment-card location-tree" aria-label="Cấu trúc vị trí">
        <ul>
          {(childrenById.get(null) || []).map(location => (
            <LocationTreeNode
              key={location.id}
              location={location}
              childrenById={childrenById}
              assetsById={assetsById}
              selectedId={selectedLocation?.id}
              openMenuId={openMenuId}
              canManage={canManage}
              onSelect={openLocation}
              onMenu={setOpenMenuId}
              onEdit={item => { setOpenMenuId(null); setForm({ location: item }); }}
              onDelete={item => { setOpenMenuId(null); setPendingDelete(item); }}
              visited={new Set()}
            />
          ))}
        </ul>
        {!data.locations.length && <p className="risova-empty-state">Chưa có vị trí.</p>}
      </section>

      {selectedLocation && (
        <LocationDrawer
          key={selectedLocation.id}
          location={selectedLocation}
          parent={data.locations.find(item => item.id === selectedLocation.parent_id)}
          assets={assetsById.get(selectedLocation.id) || []}
          onClose={() => setParams({})}
          onSelectAsset={onSelectAsset}
        />
      )}
      {canManage && form && (
        <Dialog title={form.location ? 'Chỉnh sửa vị trí' : 'Thêm vị trí mới'} onClose={() => setForm(null)} width={484}>
          <LocationForm location={form.location} locations={data.locations} onCancel={() => setForm(null)} onSave={save} />
        </Dialog>
      )}
      {canManage && pendingDelete && (
        <Dialog title="Xóa vị trí" onClose={() => setPendingDelete(null)} width={440}>
          <p>Bạn có muốn xóa vị trí <strong>{pendingDelete.name}</strong>?</p>
          <div className="risova-form-actions">
            <button type="button" onClick={() => setPendingDelete(null)}>Hủy</button>
            <button type="button" className="equipment-button-danger" onClick={remove}>Xóa</button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

