import { readEquipmentImage } from '../../utils/equipmentImage';
import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { EquipmentField, equipmentFieldClass } from './EquipmentFields';


export default function AssetForm({ asset, onCancel, onSave }) {
  const { data, ENUMS } = useData();
  const [values, setValues] = useState(() => ({ ...asset, ...asset.details }));
  const [error, setError] = useState('');
  const [reading, setReading] = useState(false);

  function change(event) {
    const { name, value } = event.target;
    setValues(previous => ({ ...previous, [name]: value }));
    if (error) setError('');
  }

  function submit(event) {
    event.preventDefault();
    const code = values.asset_code.trim().toUpperCase();
    const name = values.name.trim();
    if (!code || !name) {
      setError('Nhập mã và tên thiết bị để tiếp tục.');
      return;
    }
    if (data.assets.some(item => item.id !== asset.id && item.asset_code.toUpperCase() === code)) {
      setError('Mã thiết bị đã được sử dụng.');
      return;
    }
    onSave({
      ...values,
      asset_code: code,
      name,
      location_id: Number(values.location_id),
      required_specialty_id: values.required_specialty_id ? Number(values.required_specialty_id) : null,
      purchase_price: values.purchase_price === '' ? null : Number(values.purchase_price),
    });
  }

  async function upload(event) {
    const field = event.target;
    if (!field.files?.length) return;
    setReading(true);
    try {
      const image_url = await readEquipmentImage(field.files[0]);
      setValues(previous => ({ ...previous, image_url }));
      setError('');
    } catch (issue) {
      field.value = '';
      setError(issue.message);
    } finally {
      setReading(false);
    }
  }

  function input(name, options = {}) {
    return <input className={equipmentFieldClass} name={name} value={values[name] ?? ''} onChange={change} {...options} />;
  }

  function select(name, options, placeholder) {
    return (
      <select className={equipmentFieldClass} name={name} value={values[name] ?? ''} onChange={change} required={name === 'location_id'}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
      </select>
    );
  }

  return (
    <form className="equipment-form" onSubmit={submit}>
      <div className="equipment-fields">
        <EquipmentField label="Tên thiết bị *">{input('name', { required: true })}</EquipmentField>
        <EquipmentField label="Mã thiết bị *">{input('asset_code', { required: true })}</EquipmentField>
        <EquipmentField label="Vị trí">{select('location_id', data.locations.map(location => [location.id, location.name]), 'Chọn vị trí')}</EquipmentField>
        <EquipmentField label="Giá thiết bị">{input('purchase_price', { type: 'number', min: 0, step: 1 })}</EquipmentField>
        <EquipmentField label="Trạng thái">{select('status', Object.entries(ENUMS.ASSET_STATUSES).map(([key, item]) => [key, item.label]))}</EquipmentField>
        <EquipmentField label="Mức độ ưu tiên">{select('priority', Object.entries(ENUMS.PRIORITIES).map(([key, item]) => [key, item.label]))}</EquipmentField>
        <EquipmentField label="Nhà sản xuất">{input('manufacturer')}</EquipmentField>
        <EquipmentField label="Model">{input('model')}</EquipmentField>
        <EquipmentField label="Số serial">{input('serial_number')}</EquipmentField>
        <EquipmentField label="Ngày đưa vào vận hành">{input('installed_date', { type: 'date' })}</EquipmentField>
        <EquipmentField label="Chuyên môn">{select('required_specialty_id', data.specialties.map(item => [item.id, item.name]), 'Chọn chuyên môn')}</EquipmentField>
        <EquipmentField label="Bảo hành chính hãng">{input('warranty_expiry', { type: 'date' })}</EquipmentField>
        <EquipmentField label="Link tài liệu" span>{input('document_url', { type: 'url', pattern: 'https?://.+' })}</EquipmentField>
        <EquipmentField label="Mô tả" span>{input('description')}</EquipmentField>
        <EquipmentField label="Upload ảnh mới" span>
          <input className={equipmentFieldClass} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={upload} />
        </EquipmentField>
      </div>

      {error && <p className="mt-3 text-sm text-red-600" role="alert">{error}</p>}
      <div className="risova-form-actions equipment-centered-actions">
        <button type="button" onClick={onCancel}>Hủy</button>
        <button type="submit" disabled={reading}>Lưu</button>
      </div>
    </form>
  );
}

