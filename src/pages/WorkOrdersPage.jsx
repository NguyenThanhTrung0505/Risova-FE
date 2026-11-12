import React, { useState } from 'react';
import { useAuth, useData } from '../context/DataContext';
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  Pause,
  CheckSquare,
  Square,
  Package,
  ArrowRight,
  User,
  Calendar,
  X,
  FileCheck,
  Send,
  Trash2
} from 'lucide-react';

export default function WorkOrdersPage({ onOpenCreateWo, selectedWoFromExternal, onClearSelectedWo }) {
  const { currentUser } = useAuth();
  const {
    data,
    ENUMS,
    updateWorkOrderStatus,
    toggleChecklist,
    issuePartForWorkOrder,
    consumePartForWorkOrder
  } = useData();

  const [activeStatusTab, setActiveStatusTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedWo, setSelectedWo] = useState(selectedWoFromExternal || null);
  const [resolutionNoteInput, setResolutionNoteInput] = useState('');

  // Permission checks by role
  const canIssuePart = currentUser?.role === 'INVENTORY_STAFF' || currentUser?.role === 'MANAGER';
  const isManager = currentUser?.role === 'MANAGER';

  // Synchronize when external selection changes
  React.useEffect(() => {
    if (selectedWoFromExternal) {
      setSelectedWo(selectedWoFromExternal);
    }
  }, [selectedWoFromExternal]);

  // Keep selectedWo synced with global state
  const activeWo = selectedWo ? data.work_orders.find(w => w.id === selectedWo.id) || selectedWo : null;

  const filteredOrders = data.work_orders.filter(wo => {
    const matchesSearch = wo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          wo.wo_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          wo.asset_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = activeStatusTab === 'ALL' || wo.status === activeStatusTab;
    const matchesPriority = priorityFilter === 'ALL' || wo.priority === priorityFilter;
    const matchesType = typeFilter === 'ALL' || wo.wo_type === typeFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  const handleStatusChange = (woId, newStatus) => {
    updateWorkOrderStatus(woId, newStatus, currentUser, resolutionNoteInput);
    setResolutionNoteInput('');
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-page-title font-bold text-[#112D4E]">
            Quản lý Lệnh làm việc (Work Orders)
          </h1>
          <p className="text-body text-[#64748B] mt-0.5">
            Theo dõi tiến độ, checklist kiểm tra kỹ thuật và điều phối phụ tùng bảo trì
          </p>
        </div>

        <button
          onClick={onOpenCreateWo}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#3F72AF] hover:bg-[#325d91] text-white rounded-lg font-semibold text-sm shadow-sm transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Tạo phiếu giao việc mới</span>
        </button>
      </div>

      {/* Status Workflow Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        <button
          onClick={() => setActiveStatusTab('ALL')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold shrink-0 transition ${
            activeStatusTab === 'ALL'
              ? 'bg-[#112D4E] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Tất cả lệnh ({data.work_orders.length})
        </button>
        {Object.entries(ENUMS.WO_STATUSES).map(([key, info]) => {
          const count = data.work_orders.filter(w => w.status === key).length;
          return (
            <button
              key={key}
              onClick={() => setActiveStatusTab(key)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1.5 transition ${
                activeStatusTab === key
                  ? 'bg-[#3F72AF] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{info.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeStatusTab === key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo mã WO, tên lệnh việc, thiết bị..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-[#112D4E]"
          >
            <option value="ALL">Mọi mức ưu tiên</option>
            {Object.entries(ENUMS.PRIORITIES).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-[#112D4E]"
          >
            <option value="ALL">Mọi loại hình (PM / EM / Sửa chữa)</option>
            {Object.entries(ENUMS.WO_TYPES).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Work Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold uppercase text-[#64748B] tracking-wider">
                <th className="py-3.5 px-4">Mã WO</th>
                <th className="py-3.5 px-4">Tiêu đề lệnh việc</th>
                <th className="py-3.5 px-4">Thiết bị</th>
                <th className="py-3.5 px-4">Phân loại</th>
                <th className="py-3.5 px-4">Mức ưu tiên</th>
                <th className="py-3.5 px-4">Checklist</th>
                <th className="py-3.5 px-4">Người thực hiện</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Hạn hoàn thành</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map(wo => {
                const pri = ENUMS.PRIORITIES[wo.priority] || { label: wo.priority, color: '#64748B', bg: '#F1F5F9' };
                const stat = ENUMS.WO_STATUSES[wo.status] || { label: wo.status, color: '#64748B', bg: '#F1F5F9' };
                const typ = ENUMS.WO_TYPES[wo.wo_type] || { label: wo.wo_type, color: '#3F72AF', bg: '#DBE2EF' };
                const technician = data.users.find(u => u.id === wo.assigned_to);

                const totalSteps = wo.checklists?.length || 0;
                const completedSteps = wo.checklists?.filter(c => c.is_completed).length || 0;

                return (
                  <tr
                    key={wo.id}
                    onClick={() => setSelectedWo(wo)}
                    className="hover:bg-slate-50/90 transition cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-[#3F72AF] whitespace-nowrap">
                      {wo.wo_code}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#112D4E] max-w-xs">
                      <div className="truncate group-hover:text-[#3F72AF] transition">
                        {wo.title}
                      </div>
                      <div className="text-[11px] text-slate-500 font-normal line-clamp-1">
                        {wo.description}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#112D4E] whitespace-nowrap">
                      {wo.asset_code}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        style={{ color: typ.color, backgroundColor: typ.bg }}
                        className="px-2 py-0.5 rounded text-[10px] font-bold"
                      >
                        {typ.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        style={{ color: pri.color, backgroundColor: pri.bg }}
                        className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                      >
                        {pri.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="font-mono text-[11px] text-slate-600">
                          {completedSteps}/{totalSteps}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-700">
                      {technician ? technician.full_name : 'Chưa phân công'}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        style={{ color: stat.color, backgroundColor: stat.bg }}
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                      >
                        {stat.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-500 whitespace-nowrap">
                      {wo.due_date || '2025-06-20'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL / DRAWER */}
      {activeWo && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => {
            setSelectedWo(null);
            if (onClearSelectedWo) onClearSelectedWo();
          }}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-start justify-between sticky top-0 bg-white z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-bold text-[#3F72AF] bg-blue-50 px-2 py-0.5 rounded">
                    {activeWo.wo_code}
                  </span>
                  <span
                    style={{
                      color: ENUMS.PRIORITIES[activeWo.priority]?.color,
                      backgroundColor: ENUMS.PRIORITIES[activeWo.priority]?.bg
                    }}
                    className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                  >
                    {ENUMS.PRIORITIES[activeWo.priority]?.label}
                  </span>
                  <span
                    style={{
                      color: ENUMS.WO_STATUSES[activeWo.status]?.color,
                      backgroundColor: ENUMS.WO_STATUSES[activeWo.status]?.bg
                    }}
                    className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                  >
                    {ENUMS.WO_STATUSES[activeWo.status]?.label}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#112D4E]">{activeWo.title}</h3>
                <p className="text-xs text-slate-500">
                  Thiết bị: <strong className="text-[#112D4E]">{activeWo.asset_name} ({activeWo.asset_code})</strong>
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedWo(null);
                  if (onClearSelectedWo) onClearSelectedWo();
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              {/* Description & Root Cause */}
              <div className="space-y-3">
                <div className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed">
                  <span className="font-bold text-[#112D4E] block mb-1">Mô tả sự cố & nhiệm vụ:</span>
                  {activeWo.description}
                </div>

                {activeWo.root_cause && (
                  <div className="text-xs text-slate-700 bg-amber-50/60 p-3.5 rounded-xl border border-amber-200">
                    <span className="font-bold text-amber-900 block mb-1">Nguyên nhân gốc rễ (Root Cause):</span>
                    {activeWo.root_cause}
                  </div>
                )}

                {activeWo.resolution_notes && (
                  <div className="text-xs text-slate-700 bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200">
                    <span className="font-bold text-emerald-900 block mb-1">Giải pháp & Kết quả nghiệm thu:</span>
                    {activeWo.resolution_notes}
                  </div>
                )}
              </div>

              {/* INTERACTIVE CHECKLIST */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#112D4E] flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-[#3F72AF]" />
                    <span>Checklist công việc kỹ thuật ({activeWo.checklists?.filter(c => c.is_completed).length || 0}/{activeWo.checklists?.length || 0})</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">Bấm để đánh dấu hoàn thành</span>
                </div>

                <div className="space-y-2">
                  {(activeWo.checklists || []).map((step) => (
                    <div
                      key={step.id}
                      onClick={() => toggleChecklist(activeWo.id, step.id, '', currentUser)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                        step.is_completed
                          ? 'bg-emerald-50/50 border-emerald-200 text-slate-800'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <button className="mt-0.5 shrink-0 text-[#3F72AF]">
                        {step.is_completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400" />
                        )}
                      </button>

                      <div className="flex-1 text-xs">
                        <div className={`font-semibold ${step.is_completed ? 'line-through text-slate-500' : 'text-[#112D4E]'}`}>
                          Bước {step.step_number}: {step.task_description}
                        </div>
                        {step.note && (
                          <div className="text-[11px] text-slate-500 mt-0.5 italic">
                            Ghi chú: {step.note}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SPARE PARTS RESERVATION & ALLOCATION */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#112D4E] flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-[#3F72AF]" />
                    <span>Vật tư phụ tùng điều phối (Spare Parts)</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">Giữ chỗ & Xuất kho</span>
                </div>

                {activeWo.parts && activeWo.parts.length > 0 ? (
                  <div className="space-y-2">
                    {activeWo.parts.map(part => {
                      const partMeta = ENUMS.WO_PART_STATUSES[part.status] || { label: part.status, color: '#3B82F6', bg: '#EFF6FF' };
                      return (
                        <div
                          key={part.id}
                          className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="font-bold text-[#112D4E]">
                              {part.part_name} <span className="font-mono text-slate-500 font-normal">[{part.part_code}]</span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Cần dùng: <strong>{part.quantity_needed}</strong> • Đã xuất: <strong>{part.quantity_issued || 0}</strong> • Đã lắp: <strong>{part.quantity_consumed || 0}</strong>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              style={{ color: partMeta.color, backgroundColor: partMeta.bg }}
                              className="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                            >
                              {partMeta.label}
                            </span>

                            {/* Action to Issue Part from Inventory */}
                            {part.status === 'RESERVED' && (
                              canIssuePart ? (
                                <button
                                  onClick={() => issuePartForWorkOrder(activeWo.id, part.part_id, part.quantity_needed, currentUser)}
                                  className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer transition"
                                >
                                  Xuất kho ngay
                                </button>
                              ) : (
                                <span
                                  className="px-2.5 py-1 bg-slate-100 text-slate-400 rounded-lg text-[11px] font-medium cursor-not-allowed border border-slate-200"
                                  title="Chỉ Thủ kho (INVENTORY_STAFF) hoặc Quản lý (MANAGER) mới có quyền xuất kho"
                                >
                                  Chỉ Thủ kho/Quản lý xuất
                                </span>
                              )
                            )}

                            {/* Action to Consume Part */}
                            {part.status === 'ISSUED' && (
                              <button
                                onClick={() => consumePartForWorkOrder(activeWo.id, part.part_id)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer transition"
                              >
                                Xác nhận đã lắp
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
                    Lệnh việc này không yêu cầu giữ chỗ phụ tùng thay thế.
                  </div>
                )}
              </div>

              {/* Status Update Actions */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#112D4E]">
                  Cập nhật tiến độ & Chuyển trạng thái
                </h4>

                <input
                  type="text"
                  placeholder="Ghi chú hoàn thành hoặc nguyên nhân (tùy chọn)..."
                  value={resolutionNoteInput}
                  onChange={(e) => setResolutionNoteInput(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-[#112D4E]"
                />

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {activeWo.status !== 'IN_PROGRESS' && activeWo.status !== 'COMPLETED' && activeWo.status !== 'CLOSED' && (
                    <button
                      onClick={() => handleStatusChange(activeWo.id, 'IN_PROGRESS')}
                      className="px-3.5 py-1.5 bg-[#3F72AF] hover:bg-[#325d91] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" /> Bắt đầu thực hiện
                    </button>
                  )}

                  {activeWo.status === 'IN_PROGRESS' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(activeWo.id, 'ON_HOLD')}
                        className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Pause className="w-3.5 h-3.5" /> Tạm dừng lệnh
                      </button>

                      <button
                        onClick={() => handleStatusChange(activeWo.id, 'COMPLETED')}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Hoàn thành công việc
                      </button>
                    </>
                  )}

                  {activeWo.status === 'COMPLETED' && (
                    isManager ? (
                      <button
                        onClick={() => handleStatusChange(activeWo.id, 'CLOSED')}
                        className="px-4 py-1.5 bg-slate-800 hover:bg-black text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm transition"
                      >
                        <FileCheck className="w-3.5 h-3.5" /> Nghiệm thu & Đóng phiếu
                      </button>
                    ) : (
                      <span
                        className="px-3 py-1.5 bg-slate-100 text-slate-400 rounded-lg text-xs font-medium cursor-not-allowed flex items-center gap-1 border border-slate-200"
                        title="Chỉ Quản lý (MANAGER) mới có quyền nghiệm thu và đóng phiếu"
                      >
                        <FileCheck className="w-3.5 h-3.5" /> Chờ Quản lý nghiệm thu
                      </span>
                    )
                  )}

                  {activeWo.status !== 'CANCELLED' && activeWo.status !== 'CLOSED' && (
                    isManager ? (
                      <button
                        onClick={() => handleStatusChange(activeWo.id, 'CANCELLED')}
                        className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold ml-auto cursor-pointer transition"
                      >
                        Hủy bỏ lệnh (Giải phóng kho)
                      </button>
                    ) : (
                      <span
                        className="px-2.5 py-1 text-slate-400 text-[11px] ml-auto italic"
                        title="Chỉ Quản lý mới có quyền hủy lệnh"
                      >
                        (Hủy lệnh: Quyền Quản lý)
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

