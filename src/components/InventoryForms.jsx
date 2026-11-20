import { availableStock } from '../utils/inventory';
import { useId, useRef, useState } from 'react';
import { Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import OperationsDialog from './OperationsDialog';

function formatMoney(value) {
  return Number(value || 0).toLocaleString('vi-VN') + ' đ';
}

const fields = [
  ['name', 'Tên vật tư', 'text'],
  ['unit', 'Đơn vị', 'text'],
  ['quantity_in_stock', 'Số lượng', 'number'],
  ['min_stock_level', 'Ngưỡng tối thiểu', 'number'],
  ['unit_price', 'Đơn giá', 'number'],
  ['source', 'Nguồn nhập', 'text'],
];

const emptyRow = {
  name: '',
  unit: '',
  quantity_in_stock: '',
  min_stock_level: '',
  unit_price: '',
  source: '',
};


function sanitizePart(row) {
  return {
    name: row.name.trim(),
    unit: row.unit.trim(),
    quantity_in_stock: Number(row.quantity_in_stock),
    min_stock_level: Number(row.min_stock_level),
    unit_price: Number(row.unit_price),
    source: (row.source || '').trim(),
  };
}

function invalidPart(part) {
  return !part.name || !part.unit || ['quantity_in_stock', 'min_stock_level', 'unit_price'].some(field => !Number.isFinite(part[field]) || part[field] < 0);
}

export function BulkPartForm({ parts, onSave, onClose }) {
  const [rows, setRows] = useState([{ id: 1, values: { ...emptyRow }, editing: true }]);
  const [error, setError] = useState('');
  const rowId = useRef(1);

  function addRow() {
    rowId.current += 1;
    setRows(previous => [...previous, { id: rowId.current, values: { ...emptyRow }, editing: true }]);
    setError('');
  }

  function updateRow(id, updates) {
    setRows(previous => previous.map(row => row.id === id ? { ...row, ...updates } : row));
    setError('');
  }

  function saveRow(row, index) {
    const values = sanitizePart(row.values);
    if (invalidPart(values)) {
      setError('Dòng ' + (index + 1) + ' cần có tên, đơn vị và các số không âm.');
      return;
    }
    updateRow(row.id, { values, editing: false, saved: values });
  }

  function cancelRow(row) {
    if (row.saved) updateRow(row.id, { values: row.saved, editing: false });
    else {
      setRows(previous => previous.filter(item => item.id !== row.id));
      setError('');
    }
  }

  function submit(event) {
    event.preventDefault();
    if (!rows.length) {
      setError('Thêm ít nhất một dòng vật tư.');
      return;
    }
    const names = new Set(parts.map(part => part.part_code.toUpperCase()));
    let codeNumber = 1;
    const values = [];
    for (const row of rows) {
      const part = sanitizePart(row.values);
      if (invalidPart(part)) {
        setError('Dòng ' + (values.length + 1) + ' cần có tên, đơn vị và các số không âm.');
        return;
      }
      let code;
      do {
        code = 'VT-' + String(codeNumber).padStart(3, '0');
        codeNumber += 1;
      } while (names.has(code));
      names.add(code);
      values.push({ ...part, part_code: code });
    }
    onSave(values);
  }

  const total = rows.reduce((sum, row) => sum + (Number(row.values.quantity_in_stock) || 0) * (Number(row.values.unit_price) || 0), 0);
  const columns = ['STT', 'Tên vật tư', 'Đơn vị', 'Số lượng', 'Ngưỡng tối thiểu', 'Đơn giá', 'Số tiền', 'Nguồn nhập', 'Hành động'];
  return (
    <OperationsDialog title="Thêm vật tư" width={1210} position="wide" onClose={onClose}
      headerAction={<button type="button" onClick={addRow} className="inline-flex items-center gap-2 rounded-lg bg-[#3F72AF] px-5 py-2 text-white"><Plus size={17} /> Thêm dòng</button>}
    >
      <form onSubmit={submit}>
        <p className="mb-6 text-right font-semibold">Tổng tiền: {formatMoney(total)}</p>
        <div className="overflow-x-auto">
          <table className="operations-bulk-table">
            <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id} data-editing={row.editing}>
                  <td className="font-semibold">{index + 1}</td>
                  {fields.map(([field, label, type]) => (
                    <PartRowCell key={field} row={row} index={index} field={field} label={label} type={type} onChange={value => updateRow(row.id, { values: { ...row.values, [field]: value } })} />
                  ))}
                  <td>
                    <div className="flex items-center gap-1">
                      {row.editing ? (
                        <>
                          <button type="button" title="Lưu dòng" aria-label={'Lưu dòng ' + (index + 1)} onClick={() => saveRow(row, index)} className="text-[#3F72AF]"><Save size={17} /></button>
                          <button type="button" title="Hủy sửa dòng" aria-label={'Hủy sửa dòng ' + (index + 1)} onClick={() => cancelRow(row)} className="text-slate-500"><X size={17} /></button>
                        </>
                      ) : (
                        <>
                          <button type="button" title="Sửa dòng" aria-label={'Sửa dòng ' + (index + 1)} onClick={() => updateRow(row.id, { editing: true })} className="text-[#3F72AF]"><Pencil size={17} /></button>
                          <button type="button" title="Xóa dòng" aria-label={'Xóa dòng ' + (index + 1)} onClick={() => setRows(previous => previous.filter(item => item.id !== row.id))} className="text-red-500"><Trash2 size={17} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!rows.length && <tr><td colSpan={columns.length} className="py-4 text-center text-slate-500">Chọn Thêm dòng để nhập vật tư.</td></tr>}
            </tbody>
          </table>
        </div>
        {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
        <div className="operations-dialog-actions">
          <button type="button" onClick={onClose}>Hủy</button>
          <button type="submit">Thêm vật tư</button>
        </div>
      </form>
    </OperationsDialog>
  );
}

function PartRowCell({ row, index, field, label, type, onChange }) {
  const amount = Number(row.values.quantity_in_stock || 0) * Number(row.values.unit_price || 0);
  return (
    <>
      {field === 'source' && <td className="whitespace-nowrap text-slate-600">{formatMoney(amount)}</td>}
      <td className={field === 'name' ? 'min-w-44' : 'min-w-20'}>
        {row.editing ? (
          <input
            aria-label={label + ' dòng ' + (index + 1)}
            type={type}
            min={type === 'number' ? '0' : undefined}
            step={type === 'number' ? 'any' : undefined}
            value={row.values[field]}
            onChange={event => onChange(event.target.value)}
          />
        ) : <span className="text-slate-600">{row.values[field] || (type === 'number' ? '0' : '—')}</span>}
      </td>
    </>
  );
}

export function PartEditForm({ part, onSave, onClose }) {
  const id = useId();
  const [form, setForm] = useState(part);
  const [error, setError] = useState('');
  const editableFields = [
    ['name', 'Tên vật tư *', 'text'],
    ['unit', 'Đơn vị', 'text'],
    ['quantity_in_stock', 'Tồn kho ban đầu', 'number'],
    ['min_stock_level', 'Mức tối thiểu', 'number'],
    ['unit_price', 'Đơn giá', 'number'],
  ];
  function submit(event) {
    event.preventDefault();
    const updates = sanitizePart(form);
    if (invalidPart(updates)) {
      setError('Nhập tên vật tư, đơn vị và các số không âm.');
      return;
    }
    if (updates.quantity_in_stock < (part.reserved_quantity || 0)) {
      setError('Tồn kho không được thấp hơn số lượng đã giữ chỗ.');
      return;
    }
    onSave(updates);
  }
  return (
    <OperationsDialog title="Chỉnh sửa vật tư" onClose={onClose}>
      <form onSubmit={submit}>
        <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
          {editableFields.map(([field, label, type]) => (
            <div key={field}>
              <label htmlFor={id + field}>{label}</label>
              <input id={id + field} type={type} min={type === 'number' ? '0' : undefined} step={type === 'number' ? 'any' : undefined}
                value={form[field] ?? ''} placeholder="..." required={field === 'name'}
                onChange={event => { setForm(previous => ({ ...previous, [field]: event.target.value })); setError(''); }}
              />
            </div>
          ))}
        </div>
        {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
        <div className="operations-dialog-actions">
          <button type="button" onClick={onClose}>Hủy</button>
          <button type="submit">Lưu thay đổi</button>
        </div>
      </form>
    </OperationsDialog>
  );
}

export function StockForm({ part, type, onSave, onClose }) {
  const id = useId();
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const issuing = type === 'ISSUE';

  function submit(event) {
    event.preventDefault();
    const amount = Number(quantity);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Số lượng phải lớn hơn 0.');
      return;
    }
    if (issuing && amount > availableStock(part)) {
      setError('Số lượng xuất không được vượt quá tồn khả dụng (' + availableStock(part).toLocaleString('vi-VN') + ' ' + part.unit + ').');
      return;
    }
    onSave({ type, quantity: amount, note: note.trim() });
  }

  return (
    <OperationsDialog title={issuing ? 'Xuất kho vật tư' : 'Nhập kho'} onClose={onClose} width={600} position="middle">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <div className="flex flex-wrap justify-between gap-2">
            <label htmlFor={id + '-quantity'}>Số lượng ({part.unit})</label>
            <span className="font-medium">Tổng tiền: {formatMoney(Number(quantity) * Number(part.unit_price || 0))}</span>
          </div>
          <input type="number" id={id + '-quantity'} step="any" min="0" placeholder="..." required value={quantity} onChange={event => { setQuantity(event.target.value); setError(''); }} />
        </div>
        <div>
          <label htmlFor={id + '-note'}>{issuing ? 'Tham chiếu' : 'Nguồn nhập'}</label>
          <input id={id + '-note'} value={note} onChange={event => setNote(event.target.value)} placeholder="..." />
        </div>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <div className="operations-dialog-actions">
          <button type="button" onClick={onClose}>Hủy</button>
          <button type="submit">{issuing ? 'Xác nhận' : 'Nhập kho'}</button>
        </div>
      </form>
    </OperationsDialog>
  );
}

