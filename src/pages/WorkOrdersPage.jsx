import { usePagination } from '../hooks/usePagination';
import { useSearchParams } from 'react-router-dom';
import Pagination from '../components/Pagination';
import WorkOrderDetails from '../components/WorkOrderDetails';
import { useState } from 'react';
import { useData } from '../context/DataContext';
import { Archive, Plus, Search } from 'lucide-react';
import { archivedWorkOrderStatuses } from '../utils/workOrders';

export default function WorkOrdersPage({ onOpenCreateWo }) {
  const [params, setParams] = useSearchParams();
  const archived = params.get('view') === 'archive';
  const setArchived = value => { setActiveStatusTab('ALL'); setParams(value ? { view: 'archive' } : {}); };
  const { data, ENUMS } = useData();

  const [activeStatusTab, setActiveStatusTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState('ALL');
  const statusFilter = archived && !archivedWorkOrderStatuses.includes(activeStatusTab) ? 'ALL' : activeStatusTab;
  const openOrder = order => setParams({ ...(archived ? { view: 'archive' } : {}), order: String(order.id) });
  const activeWo = data.work_orders.find(order => String(order.id) === params.get('order')) || null;
  const closeDetail = () => setParams(archived ? { view: 'archive' } : {});

  const filteredOrders = data.work_orders.filter(wo => {
    const matchesSearch = wo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          wo.wo_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          wo.asset_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || wo.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || wo.priority === priorityFilter;
    const matchesType = typeFilter === 'ALL' || wo.wo_type === typeFilter;
    return (!archived || archivedWorkOrderStatuses.includes(wo.status)) && matchesSearch && matchesStatus && matchesPriority && matchesType && (assigneeFilter === 'ALL' || String(wo.assigned_to) === assigneeFilter);
  });

  const pagination = usePagination(filteredOrders, [searchTerm, activeStatusTab, priorityFilter, typeFilter, assigneeFilter, archived].join('|'));

  return (
    <div className="risova-page space-y-6">
      {!activeWo && <>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-page-title font-bold text-[#112D4E]">
            {archived ? 'Lưu trữ lệnh việc' : 'Quản lý lệnh việc'}
          </h1>
          <p className="text-body text-[#64748B] mt-0.5">
            {archived ? 'Tra cứu các lệnh việc đã đóng hoặc đã hủy.' : 'Lập kế hoạch, phân công và theo dõi công việc bảo trì.'}
          </p>
        </div>

        <div className="flex gap-3 items-center"><button className={archived ? 'wo-primary min-w-32' : 'inline-flex items-center gap-2 bg-white px-4 py-2 rounded text-xs text-[#112D4E]'} onClick={() => setArchived(!archived)}>{!archived && <Archive size={16} />}{archived ? "Quay lại" : "Lưu trữ"}</button>{!archived && <button
          onClick={onOpenCreateWo}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#3F72AF] hover:bg-[#325d91] text-white rounded-lg font-semibold text-sm shadow-sm transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Tạo lệnh việc</span>
        </button>}</div>
      </div>

      <section className="risova-data-table">
        <div className="risova-table-toolbar flex flex-col xl:flex-row gap-3">
          <div className="relative flex-1 min-w-40"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input aria-label="Tìm lệnh việc" placeholder="Tìm theo tên, mã, thiết bị..." value={searchTerm} onChange={event => setSearchTerm(event.target.value)} className="w-full pl-9 pr-3 py-2 border border-slate-200 text-xs" /></div>
          <div className="flex flex-wrap gap-2">
            <select aria-label="Trạng thái lệnh việc" value={statusFilter} onChange={event => setActiveStatusTab(event.target.value)} className="px-3 py-2 border border-slate-200 text-xs text-slate-500"><option value="ALL">Tất cả trạng thái</option>{Object.entries(ENUMS.WO_STATUSES).filter(([key]) => !archived || archivedWorkOrderStatuses.includes(key)).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select>
            <select aria-label="Ưu tiên lệnh việc" value={priorityFilter} onChange={event => setPriorityFilter(event.target.value)} className="px-3 py-2 border border-slate-200 text-xs text-slate-500"><option value="ALL">Mọi ưu tiên</option>{Object.entries(ENUMS.PRIORITIES).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select>
            <select aria-label="Loại lệnh việc" value={typeFilter} onChange={event => setTypeFilter(event.target.value)} className="px-3 py-2 border border-slate-200 text-xs text-slate-500"><option value="ALL">Mọi loại việc</option>{Object.entries(ENUMS.WO_TYPES).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select>
            <select aria-label="Người phụ trách" value={assigneeFilter} onChange={event => setAssigneeFilter(event.target.value)} className="px-3 py-2 border border-slate-200 text-xs text-slate-500"><option value="ALL">Người phụ trách</option>{data.users.map(user => <option key={user.id} value={user.id}>{user.full_name}</option>)}</select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead><tr><th className="px-4">Mã lệnh</th><th className="px-4">Tên công việc</th><th className="px-4">Thiết bị</th><th className="px-4">Loại</th><th className="px-4">Ưu tiên</th><th className="px-4">Trạng thái</th><th className="px-4">Người phụ trách</th><th className="px-4">Hạn xử lý</th></tr></thead>
            <tbody>
              {pagination.items.map(order => {
                const priority = ENUMS.PRIORITIES[order.priority] || {};
                const status = ENUMS.WO_STATUSES[order.status] || {};
                const user = data.users.find(item => item.id === order.assigned_to);
                return <tr key={order.id} className="border-b border-slate-100 cursor-pointer" onClick={() => openOrder(order)}>
                  <td className="px-4"><button onClick={event => { event.stopPropagation(); openOrder(order); }} className="font-semibold text-[#112D4E] hover:text-[#3F72AF]">{order.wo_code}</button></td>
                  <td className="px-4 text-slate-600"><span className="block max-w-64 truncate">{order.title}</span></td>
                  <td className="px-4 text-slate-500">{order.asset_code}</td>
                  <td className="px-4 text-slate-500">{ENUMS.WO_TYPES[order.wo_type]?.label || order.wo_type}</td>
                  <td className="px-4"><span className="risova-status-badge" style={{color:priority.color,backgroundColor:priority.bg}}>{priority.label || order.priority}</span></td>
                  <td className="px-4"><span className="risova-status-badge" style={{color:status.color,backgroundColor:status.bg}}>{status.label || order.status}</span></td>
                  <td className="px-4 text-slate-500">{user?.full_name || 'Chưa phân công'}</td>
                  <td className="px-4 text-slate-500">{order.due_date ? new Date(order.due_date).toLocaleDateString('vi-VN') : 'Chưa đặt hạn'}</td>
                </tr>;
              })}
              {!filteredOrders.length && <tr><td colSpan={8} className="text-center py-12 text-slate-400">Không tìm thấy lệnh việc phù hợp.</td></tr>}
            </tbody>
          </table>
        </div>
        <Pagination {...pagination} />
      </section>

      </>}
      {activeWo && <WorkOrderDetails key={activeWo.id} order={activeWo} onBack={closeDetail} />}
    </div>
  );
}

