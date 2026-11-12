import React, { useState } from 'react';
import { useAuth, useData } from '../context/DataContext';
import {
  Package,
  Plus,
  Search,
  Filter,
  ArrowDownRight,
  ArrowUpRight,
  AlertTriangle,
  History,
  TrendingDown,
  DollarSign,
  Boxes,
  X,
  FileSpreadsheet
} from 'lucide-react';

export default function InventoryPage() {
  const { currentUser } = useAuth();
  const { data, ENUMS, createSparePart, adjustStock } = useData();

  const [activeTab, setActiveTab] = useState('PARTS'); // 'PARTS' or 'HISTORY'
  const [searchTerm, setSearchTerm] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedPartForAdjust, setSelectedPartForAdjust] = useState(null);

  // Role permissions
  const canManageInventory = currentUser?.role === 'INVENTORY_STAFF' || currentUser?.role === 'MANAGER';

  // Forms
  const [newPartForm, setNewPartForm] = useState({
    part_code: '',
    name: '',
    unit: 'Cái',
    quantity_in_stock: 10,
    min_stock_level: 5,
    unit_price: 250000,
    category: 'Cơ khí'
  });

  const [adjustForm, setAdjustForm] = useState({
    type: 'RECEIPT',
    quantity: 1,
    reason: ''
  });

  // Calculate totals
  const totalItems = data.spare_parts.length;
  const lowStockCount = data.spare_parts.filter(p => p.is_low_stock).length;
  const totalValue = data.spare_parts.reduce((sum, p) => sum + (p.quantity_in_stock * p.unit_price), 0);

  const filteredParts = data.spare_parts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.part_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLowStock = !showLowStockOnly || p.is_low_stock;
    return matchesSearch && matchesLowStock;
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newPartForm.name || !newPartForm.part_code) return;
    createSparePart(newPartForm);
    setShowCreateModal(false);
    setNewPartForm({
      part_code: '',
      name: '',
      unit: 'Cái',
      quantity_in_stock: 10,
      min_stock_level: 5,
      unit_price: 250000,
      category: 'Cơ khí'
    });
  };

  const handleAdjustSubmit = (e) => {
    e.preventDefault();
    if (!selectedPartForAdjust) return;
    adjustStock(selectedPartForAdjust.id, adjustForm.quantity, adjustForm.reason, adjustForm.type, currentUser);
    setShowAdjustModal(false);
    setSelectedPartForAdjust(null);
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-page-title font-bold text-[#112D4E]">
            Kho Vật tư & Phụ tùng Bảo trì (Spare Parts)
          </h1>
          <p className="text-body text-[#64748B] mt-0.5">
            Quản lý tồn kho thực tế, phụ tùng đã giữ chỗ theo lệnh việc và lịch sử xuất nhập
          </p>
        </div>

        {canManageInventory ? (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#3F72AF] hover:bg-[#325d91] text-white rounded-lg font-semibold text-sm shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Thêm phụ tùng mới</span>
          </button>
        ) : (
          <span
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-400 rounded-lg font-semibold text-xs border border-slate-200 cursor-not-allowed"
            title="Chỉ Thủ kho (INVENTORY_STAFF) hoặc Quản lý (MANAGER) mới có quyền thêm phụ tùng"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Thêm phụ tùng (Chỉ Thủ kho/QL)</span>
          </span>
        )}
      </div>

      {/* 3 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#64748B]">Tổng danh mục phụ tùng</span>
            <div className="text-2xl font-bold text-[#112D4E] mt-1">{totalItems} mã vật tư</div>
            <span className="text-[11px] text-slate-500">Phục vụ toàn bộ nhà máy</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#3F72AF] flex items-center justify-center font-bold">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-red-600">Cảnh báo tồn kho thấp</span>
            <div className="text-2xl font-bold text-red-600 mt-1">{lowStockCount} vật tư</div>
            <span className="text-[11px] text-slate-500">Dưới ngưỡng an toàn Min</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#64748B]">Tổng giá trị tồn kho</span>
            <div className="text-xl font-bold text-[#112D4E] mt-1">
              {(totalValue / 1000000).toFixed(1)} triệu đ
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold">Tồn kho khả dụng an toàn</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('PARTS')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'PARTS'
              ? 'bg-[#3F72AF] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Danh mục phụ tùng ({data.spare_parts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'HISTORY'
              ? 'bg-[#3F72AF] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Lịch sử giao dịch nhập/xuất ({data.inventory_transactions?.length || 0})</span>
        </button>
      </div>

      {/* TAB 1: SPARE PARTS TABLE */}
      {activeTab === 'PARTS' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm theo mã hoặc tên phụ tùng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
              />
            </div>

            <button
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                showLowStockOnly
                  ? 'bg-red-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Chỉ hiển thị tồn thấp ({lowStockCount})</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold uppercase text-[#64748B] tracking-wider">
                    <th className="py-3.5 px-4">Mã phụ tùng</th>
                    <th className="py-3.5 px-4">Tên vật tư</th>
                    <th className="py-3.5 px-4">Đơn vị</th>
                    <th className="py-3.5 px-4 text-center">Tồn kho thực</th>
                    <th className="py-3.5 px-4 text-center">Đang giữ chỗ</th>
                    <th className="py-3.5 px-4 text-center">Khả dụng</th>
                    <th className="py-3.5 px-4 text-center">Mức tối thiểu</th>
                    <th className="py-3.5 px-4 text-right">Đơn giá</th>
                    <th className="py-3.5 px-4 text-center">Trạng thái</th>
                    <th className="py-3.5 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredParts.map(part => {
                    const available = Math.max(0, part.quantity_in_stock - (part.reserved_quantity || 0));
                    return (
                      <tr key={part.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-mono font-bold text-[#3F72AF]">
                          {part.part_code}
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#112D4E]">
                          {part.name}
                          {part.category && (
                            <span className="block text-[10px] text-slate-400 font-normal">{part.category}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{part.unit}</td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-[#112D4E]">
                          {part.quantity_in_stock}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-blue-600">
                          {part.reserved_quantity || 0}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-emerald-600">
                          {available}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-slate-400">
                          {part.min_stock_level}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-[#112D4E]">
                          {part.unit_price?.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="py-3 px-4 text-center">
                          {part.is_low_stock ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600">
                              Cần đặt hàng
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                              Bình thường
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {canManageInventory ? (
                            <button
                              onClick={() => {
                                setSelectedPartForAdjust(part);
                                setShowAdjustModal(true);
                              }}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-[#3F72AF] hover:text-white rounded-md text-[11px] font-semibold transition cursor-pointer"
                            >
                              Nhập/Xuất
                            </button>
                          ) : (
                            <span
                              className="px-2 py-1 text-slate-400 text-[11px] italic cursor-not-allowed"
                              title="Chỉ Thủ kho hoặc Quản lý mới có quyền điều chỉnh kho"
                            >
                              Chỉ xem
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INVENTORY TRANSACTIONS HISTORY */}
      {activeTab === 'HISTORY' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold uppercase text-[#64748B] tracking-wider">
                  <th className="py-3.5 px-4">Thời gian</th>
                  <th className="py-3.5 px-4">Mã giao dịch</th>
                  <th className="py-3.5 px-4">Phụ tùng</th>
                  <th className="py-3.5 px-4">Loại giao dịch</th>
                  <th className="py-3.5 px-4 text-center">Số lượng</th>
                  <th className="py-3.5 px-4">Người thực hiện</th>
                  <th className="py-3.5 px-4">Lệnh việc liên quan</th>
                  <th className="py-3.5 px-4">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data.inventory_transactions || []).map(txn => {
                  const txnMeta = ENUMS.INVENTORY_TXN_TYPES[txn.transaction_type] || { label: txn.transaction_type, color: '#3F72AF' };

                  return (
                    <tr key={txn.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {new Date(txn.created_at).toLocaleString('vi-VN')}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        TXN-{txn.id.toString().slice(-5)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#112D4E]">
                        {txn.part_name} <span className="text-slate-400 font-mono">[{txn.part_code}]</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          style={{ color: txnMeta.color }}
                          className="font-bold flex items-center gap-1"
                        >
                          {txn.transaction_type === 'RECEIPT' && <ArrowDownRight className="w-3.5 h-3.5 text-emerald-500" />}
                          {txn.transaction_type === 'ISSUE' && <ArrowUpRight className="w-3.5 h-3.5 text-red-500" />}
                          <span>{txnMeta.label}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold">
                        {txn.transaction_type === 'ISSUE' ? `-${txn.quantity}` : `+${txn.quantity}`}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {txn.performed_by_name || 'Thủ kho'}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#3F72AF]">
                        {txn.wo_code || '---'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                        {txn.note}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {showAdjustModal && selectedPartForAdjust && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs" onClick={() => setShowAdjustModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <div>
                <h3 className="text-base font-bold text-[#112D4E]">Thao tác xuất / nhập kho</h3>
                <p className="text-xs text-slate-500">{selectedPartForAdjust.name} ({selectedPartForAdjust.part_code})</p>
              </div>
              <button onClick={() => setShowAdjustModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#112D4E] mb-1">Loại giao dịch</label>
                <select
                  value={adjustForm.type}
                  onChange={e => setAdjustForm({ ...adjustForm, type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#112D4E]"
                >
                  <option value="RECEIPT">Nhập kho bổ sung (+)</option>
                  <option value="ISSUE">Xuất kho trực tiếp (-)</option>
                  <option value="RETURN">Nhập trả lại kho (+)</option>
                  <option value="ADJUSTMENT">Điều chỉnh kiểm kê kho</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#112D4E] mb-1">Số lượng ({selectedPartForAdjust.unit})</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustForm.quantity}
                  onChange={e => setAdjustForm({ ...adjustForm, quantity: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#112D4E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#112D4E] mb-1">Lý do / Số phiếu chứng từ</label>
                <input
                  type="text"
                  placeholder="VD: Nhập theo PO-2025-01, Xuất bảo dưỡng đột xuất..."
                  value={adjustForm.reason}
                  onChange={e => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#112D4E]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#3F72AF] hover:bg-[#325d91] text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  Xác nhận giao dịch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Part Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <h3 className="text-base font-bold text-[#112D4E]">Thêm phụ tùng mới vào danh mục kho</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#112D4E] mb-1">Mã phụ tùng (*)</label>
                <input
                  type="text"
                  required
                  placeholder="VD: OIL-SEAL-45, V-BELT-B52"
                  value={newPartForm.part_code}
                  onChange={e => setNewPartForm({ ...newPartForm, part_code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#112D4E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#112D4E] mb-1">Tên phụ tùng (*)</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Phớt dầu trục động cơ 45x62x8"
                  value={newPartForm.name}
                  onChange={e => setNewPartForm({ ...newPartForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#112D4E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#112D4E] mb-1">Đơn vị tính</label>
                  <input
                    type="text"
                    value={newPartForm.unit}
                    onChange={e => setNewPartForm({ ...newPartForm, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#112D4E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#112D4E] mb-1">Danh mục</label>
                  <input
                    type="text"
                    value={newPartForm.category}
                    onChange={e => setNewPartForm({ ...newPartForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#112D4E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#112D4E] mb-1">Tồn kho ban đầu</label>
                  <input
                    type="number"
                    value={newPartForm.quantity_in_stock}
                    onChange={e => setNewPartForm({ ...newPartForm, quantity_in_stock: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#112D4E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#112D4E] mb-1">Mức Min</label>
                  <input
                    type="number"
                    value={newPartForm.min_stock_level}
                    onChange={e => setNewPartForm({ ...newPartForm, min_stock_level: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#112D4E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#112D4E] mb-1">Đơn giá (đ)</label>
                  <input
                    type="number"
                    value={newPartForm.unit_price}
                    onChange={e => setNewPartForm({ ...newPartForm, unit_price: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#112D4E]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#3F72AF] hover:bg-[#325d91] text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  Lưu phụ tùng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

