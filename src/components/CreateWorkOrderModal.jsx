import React, { useState, useEffect } from 'react';
import { useAuth, useData } from '../context/DataContext';
import { X, Plus, Trash2, Package, Wrench, ShieldAlert } from 'lucide-react';

export default function CreateWorkOrderModal({ isOpen, onClose, initialData = null }) {
  const { currentUser } = useAuth();
  const { data, ENUMS, createWorkOrder } = useData();

  const [form, setForm] = useState({
    asset_id: data.assets[0]?.id || 1,
    title: '',
    wo_type: 'REPAIR',
    priority: 'HIGH',
    assigned_to: 2, // Lê Thu Hà
    due_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    description: '',
    labor_hours: 2.5,
    estimated_cost: 1500000,
    parts: []
  });

  const [selectedPartId, setSelectedPartId] = useState(data.spare_parts[0]?.id || 1);
  const [partQty, setPartQty] = useState(1);

  // Sync initialData when passed (e.g. from IoT Emergency trigger)
  useEffect(() => {
    if (initialData) {
      setForm(prev => ({
        ...prev,
        asset_id: initialData.asset_id || prev.asset_id,
        title: initialData.title || prev.title,
        wo_type: initialData.wo_type || prev.wo_type,
        priority: initialData.priority || prev.priority,
        description: initialData.description || prev.description
      }));
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleAddPart = () => {
    const partInfo = data.spare_parts.find(p => p.id === Number(selectedPartId));
    if (!partInfo) return;

    if (form.parts.some(p => p.part_id === partInfo.id)) {
      alert('Vật tư này đã được thêm vào danh sách!');
      return;
    }

    setForm(prev => ({
      ...prev,
      parts: [...prev.parts, { part_id: partInfo.id, quantity_needed: Number(partQty) }]
    }));
    setPartQty(1);
  };

  const handleRemovePart = (partId) => {
    setForm(prev => ({
      ...prev,
      parts: prev.parts.filter(p => p.part_id !== partId)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title) {
      alert('Vui lòng nhập tiêu đề lệnh làm việc!');
      return;
    }

    createWorkOrder(form, currentUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#3F72AF] flex items-center justify-center font-bold">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#112D4E]">Tạo Phiếu giao việc mới (Work Order)</h3>
              <p className="text-xs text-slate-500">Phân công kỹ thuật viên và đăng ký phụ tùng giữ chỗ</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1 overflow-y-auto">
          {/* Asset and Title */}
          <div>
            <label className="block text-xs font-bold text-[#112D4E] mb-1">Thiết bị bảo trì (*)</label>
            <select
              value={form.asset_id}
              onChange={e => setForm({ ...form, asset_id: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#112D4E] font-medium"
            >
              {data.assets.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.asset_code}) - {a.priority}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#112D4E] mb-1">Tiêu đề lệnh việc (*)</label>
            <input
              type="text"
              required
              placeholder="VD: Căn chỉnh vòng bi trục nén, Khắc phục rung chấn..."
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#112D4E]"
            />
          </div>

          {/* Type and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#112D4E] mb-1">Loại hình lệnh việc</label>
              <select
                value={form.wo_type}
                onChange={e => setForm({ ...form, wo_type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#112D4E]"
              >
                <option value="PREVENTIVE">Bảo trì định kỳ (PM)</option>
                <option value="REPAIR">Sửa chữa phục hồi (Repair)</option>
                <option value="EMERGENCY">Sự cố khẩn cấp (Emergency)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#112D4E] mb-1">Mức ưu tiên</label>
              <select
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#112D4E]"
              >
                <option value="CRITICAL">Khẩn cấp (CRITICAL)</option>
                <option value="HIGH">Cao (HIGH)</option>
                <option value="MEDIUM">Trung bình (MEDIUM)</option>
                <option value="LOW">Thấp (LOW)</option>
              </select>
            </div>
          </div>

          {/* Assigned tech & Due date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#112D4E] mb-1">Kỹ thuật viên phụ trách</label>
              <select
                value={form.assigned_to}
                onChange={e => setForm({ ...form, assigned_to: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#112D4E]"
              >
                {data.users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} ({ENUMS.USER_ROLES[u.role]?.label})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#112D4E] mb-1">Hạn xử lý (Due Date)</label>
              <input
                type="date"
                value={form.due_date}
                onChange={e => setForm({ ...form, due_date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#112D4E]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#112D4E] mb-1">Mô tả chi tiết sự cố & chỉ dẫn</label>
            <textarea
              rows="3"
              placeholder="Ghi chú hiện tượng, quy trình an toàn cần tuân thủ..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#112D4E]"
            ></textarea>
          </div>

          {/* Spare Parts Reservation */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#112D4E] flex items-center gap-1.5">
                <Package className="w-4 h-4 text-[#3F72AF]" />
                <span>Đề xuất vật tư giữ chỗ (RESERVED)</span>
              </span>
              <span className="text-[11px] text-slate-500">Tự động giữ chỗ kho</span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedPartId}
                onChange={e => setSelectedPartId(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-[#112D4E]"
              >
                {data.spare_parts.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.part_code}) - Tồn: {p.quantity_in_stock} {p.unit}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                value={partQty}
                onChange={e => setPartQty(e.target.value)}
                className="w-20 px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-center text-[#112D4E]"
                placeholder="SL"
              />

              <button
                type="button"
                onClick={handleAddPart}
                className="px-3 py-1.5 bg-[#3F72AF] text-white rounded-lg text-xs font-semibold hover:bg-[#325d91] cursor-pointer shrink-0"
              >
                + Thêm
              </button>
            </div>

            {/* Selected Parts List */}
            {form.parts.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {form.parts.map(p => {
                  const part = data.spare_parts.find(sp => sp.id === p.part_id);
                  return (
                    <div key={p.part_id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs">
                      <span className="font-semibold text-[#112D4E]">
                        {part?.name} ({part?.part_code})
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#3F72AF]">
                          x{p.quantity_needed} {part?.unit}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemovePart(p.part_id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#3F72AF] hover:bg-[#325d91] text-white rounded-lg text-xs font-semibold shadow-md cursor-pointer"
            >
              Phát hành lệnh làm việc
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

