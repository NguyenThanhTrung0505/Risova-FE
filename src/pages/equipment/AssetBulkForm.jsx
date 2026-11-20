import { equipmentDate } from '../../utils/equipment';
import { useRef, useState } from 'react';
import { Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { readEquipmentImage } from '../../utils/equipmentImage';
import { equipmentFieldClass } from './EquipmentFields';

const blankRow = {
  name: '', location_id: '', priority: 'MEDIUM', parent_asset_id: '', required_specialty_id: '',
  installed_date: '', warranty_months: '', manufacturer: '', model: '', serial_number: '',
  purchase_price: '', description: '', image_url: '', document_url: '',
};

const columns = [
  ['name', 'Tên thiết bị'], ['location_id', 'Vị trí'], ['priority', 'Độ ưu tiên'],
  ['parent_asset_id', 'Thuộc máy'], ['required_specialty_id', 'Chuyên môn'], ['installed_date', 'Ngày lắp'],
  ['warranty_months', 'Bảo hành'], ['manufacturer', 'Nhà sản xuất'], ['model', 'Model'], ['serial_number', 'Số serial'],
  ['purchase_price', 'Giá'], ['description', 'Mô tả'], ['image_url', 'Tải ảnh'], ['document_url', 'Link tài liệu'],
];

function warrantyDate(installedDate, months) {
  if (!installedDate || !months) return '';
  const date = new Date(installedDate + 'T00:00:00Z');
  if (Number.isNaN(date.getTime())) return '';
  date.setUTCMonth(date.getUTCMonth() + Number(months));
  return date.toISOString().slice(0, 10);
}

export default function AssetBulkForm({ onCancel, onSave }) {
  const { data, ENUMS } = useData();
  const nextId = useRef(2);
  const [rows, setRows] = useState([{ id: 1, values: { ...blankRow }, snapshot: null, editing: true, reading: false }]);
  const [error, setError] = useState('');
  const total = rows.reduce((sum, row) => sum + Number(row.values.purchase_price || 0), 0);
  const choices = {
    location_id: data.locations.filter(item => item.is_active !== false).map(item => [item.id, item.name]),
    priority: Object.entries(ENUMS.PRIORITIES).map(([key, item]) => [key, item.label]),
    parent_asset_id: data.assets.filter(item => !item.is_archived).map(item => [item.id, item.asset_code]),
    required_specialty_id: data.specialties.map(item => [item.id, item.name]),
  };

  function addRow() {
    const id = nextId.current++;
    setRows(previous => [...previous, { id, values: { ...blankRow }, snapshot: null, editing: true, reading: false }]);
  }

  function updateRow(id, updater) {
    setRows(previous => previous.map(row => row.id === id ? updater(row) : row));
  }

  function change(rowId, key, value) {
    updateRow(rowId, row => ({ ...row, values: { ...row.values, [key]: value } }));
    if (error) setError('');
  }

  function removeRow(id) {
    if (rows.length === 1) updateRow(id, row => ({ ...row, values: { ...blankRow }, snapshot: null, editing: true }));
    else setRows(previous => previous.filter(row => row.id !== id));
  }

  function acceptRow(row) {
    if (!row.values.name.trim() || !row.values.location_id) {
      setError('Nhập tên và chọn vị trí cho thiết bị.');
      return;
    }
    updateRow(row.id, item => ({ ...item, editing: false, snapshot: { ...item.values } }));
    setError('');
  }

  async function chooseImage(rowId, event) {
    const field = event.target;
    if (!field.files?.length) return;
    updateRow(rowId, row => ({ ...row, reading: true }));
    try {
      const imageUrl = await readEquipmentImage(field.files[0]);
      change(rowId, 'image_url', imageUrl);
    } catch (issue) {
      field.value = '';
      setError(issue.message);
    } finally {
      updateRow(rowId, row => ({ ...row, reading: false }));
    }
  }

  function submit(event) {
    event.preventDefault();
    if (rows.some(row => !row.values.name.trim() || !row.values.location_id)) {
      setError('Nhập tên và chọn vị trí cho tất cả thiết bị.');
      return;
    }
    const existingCodes = new Set(data.assets.map(item => item.asset_code));
    let sequence = 1;
    const assets = rows.map(({ values }) => {
      let code;
      do { code = 'AST-' + String(sequence++).padStart(3, '0'); } while (existingCodes.has(code));
      const { warranty_months, ...fields } = values;
      return {
        ...fields,
        name: fields.name.trim(),
        asset_code: code,
        location_id: Number(fields.location_id),
        purchase_price: Number(fields.purchase_price || 0),
        parent_asset_id: fields.parent_asset_id ? Number(fields.parent_asset_id) : null,
        warranty_expiry: warrantyDate(fields.installed_date, warranty_months),
      };
    });
    onSave(assets);
  }

  function cell(row, key, label) {
    const value = row.values[key];
    if (!row.editing) {
      if (choices[key]) return choices[key].find(([choice]) => String(choice) === String(value))?.[1] || '—';
      if (key === 'image_url') return value ? 'Đã tải' : 'Chưa tải';
      if (key === 'document_url') return value ? 'Đã thêm' : 'Chưa có';
      if (key === 'purchase_price') return Number(value || 0).toLocaleString('vi-VN') + ' đ';
      if (key === 'warranty_months') return value ? value + ' tháng' : '—';
      if (key === 'installed_date') return equipmentDate(value);
      return value || '—';
    }
    if (choices[key]) {
      return (
        <select aria-label={label} className={equipmentFieldClass} value={value} required={key === 'location_id'} onChange={event => change(row.id, key, event.target.value)}>
          {key !== 'priority' && <option value="">Chọn</option>}
          {choices[key].map(([choice, text]) => <option key={choice} value={choice}>{text}</option>)}
        </select>
      );
    }
    if (key === 'image_url') return <input aria-label={label} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={event => chooseImage(row.id, event)} />;
    const numeric = key === 'purchase_price' || key === 'warranty_months';
    const type = numeric ? 'number' : { installed_date: 'date', document_url: 'url' }[key] || 'text';
    return <input aria-label={label} className={equipmentFieldClass} type={type} min={numeric ? 0 : undefined} max={key === 'warranty_months' ? 1200 : undefined} required={key === 'name'} placeholder={label} value={value} pattern={key === 'document_url' ? 'https?://.+' : undefined} onChange={event => change(row.id, key, event.target.value)} />;
  }

  return (
    <form onSubmit={submit}>
      <div className="mb-3 flex flex-wrap items-center justify-end gap-4">
        <strong>Tổng tiền: {total.toLocaleString('vi-VN')} đ</strong>
        <button type="button" className="equipment-button equipment-button-primary" onClick={addRow}><Plus size={16} /> Thêm dòng</button>
      </div>
      <div className="overflow-x-auto rounded-md border border-[#DBE2EF]">
        <table className="equipment-bulk-table w-full">
          <thead><tr><th>STT</th>{columns.map(([key, label]) => <th key={key} scope="col">{label}</th>)}<th>Hành động</th></tr></thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id} className={row.editing ? 'bg-slate-50' : ''}>
                <td>{index + 1}</td>
                {columns.map(([key, label]) => <td key={key}>{cell(row, key, label)}</td>)}
                <td>
                  <div className="equipment-bulk-actions">
                    {row.editing ? (
                      <>
                        <button type="button" aria-label={'Lưu dòng ' + (index + 1)} disabled={row.reading} onClick={() => acceptRow(row)}><Save size={15} /></button>
                        <button type="button" aria-label={'Hủy dòng ' + (index + 1)} onClick={() => row.snapshot ? updateRow(row.id, item => ({ ...item, values: { ...item.snapshot }, editing: false })) : removeRow(row.id)}><X size={15} /></button>
                      </>
                    ) : (
                      <>
                        <button type="button" aria-label={'Sửa dòng ' + (index + 1)} onClick={() => updateRow(row.id, item => ({ ...item, editing: true }))}><Pencil size={15} /></button>
                        <button type="button" aria-label={'Xóa dòng ' + (index + 1)} onClick={() => removeRow(row.id)}><Trash2 size={15} className="text-red-600" /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {error && <p className="mt-3 text-red-600" role="alert">{error}</p>}
      <div className="risova-form-actions">
        <button type="button" onClick={onCancel}>Hủy</button>
        <button type="submit" disabled={rows.some(row => row.reading)}>Thêm thiết bị</button>
      </div>
    </form>
  );
}
