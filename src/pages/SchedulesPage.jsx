import { usePagination } from '../hooks/usePagination';
import ScheduleDetails from '../components/ScheduleDetails';
import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import Pagination from '../components/Pagination';
import ScheduleForm from '../components/ScheduleForm';
import { scheduleTypeLabels } from '../constants/schedules';
import { useData } from '../context/DataContext';

const primaryButton = 'inline-flex items-center justify-center gap-2 rounded border border-[#3F72AF] bg-[#3F72AF] px-4 py-2 text-sm font-medium text-white hover:bg-[#325d91]';

const control = 'rounded border border-slate-200 bg-white px-3 py-2 text-[13px] text-[#112D4E]';

function dateLabel(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' });
}

function amountLabel(value, unit) {
  if (value == null) return '—';
  return Number(value).toLocaleString('vi-VN') + ' ' + unit;
}

function meterUnit(asset) {
  if (asset?.meter_unit === 'CYCLES') return 'chu kỳ';
  if (asset?.meter_unit === 'KILOMETERS' || asset?.meter_unit === 'KM') return 'km';
  return 'giờ';
}

function cycleLabel(schedule, asset) {
  const cycles = [];
  if (schedule.schedule_type !== 'METER_BASED' && schedule.frequency_days != null) {
    cycles.push(amountLabel(schedule.frequency_days, 'ngày'));
  }
  if (schedule.schedule_type !== 'TIME_BASED' && schedule.meter_interval != null) {
    cycles.push(amountLabel(schedule.meter_interval, meterUnit(asset)));
  }
  return cycles.join(' / ') || '—';
}

function ScheduleState({ schedule }) {
  return (
    <span className={'risova-status-badge ' + (schedule.is_active === false ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-700')}>
      {schedule.is_active === false ? 'Tạm dừng' : 'Đang hoạt động'}
    </span>
  );
}

function ScheduleOrders({ orders, statuses, priorities, woTypes, users, onSelectOrder, onGenerate, schedule }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState('ALL');
  const query = search.trim().toLowerCase();
  const filtered = orders.filter(order => {
    const matchesSearch = [order.wo_code, order.title].join(' ').toLowerCase().includes(query);
    return matchesSearch
      && (statusFilter === 'ALL' || order.status === statusFilter)
      && (priorityFilter === 'ALL' || order.priority === priorityFilter)
      && (assigneeFilter === 'ALL' || String(order.assigned_to) === assigneeFilter);
  });
  const pagination = usePagination(filtered, [schedule.id, query, statusFilter, priorityFilter, assigneeFilter].join('|'));
  return (
    <section className="risova-data-table">
      <div className="risova-table-toolbar space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-[#112D4E]">Lịch sử bảo trì ({orders.length})</h2>
          {onGenerate && (
            <button type="button" onClick={() => onGenerate(schedule)} className={primaryButton}>
              <Plus size={16} /> Tạo lệnh việc
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-48 flex-1">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input aria-label="Tìm lịch sử bảo trì" placeholder="Tìm theo tên, mã,..." value={search} onChange={event => setSearch(event.target.value)} className={control + ' w-full pl-9'} />
          </div>
          <select aria-label="Trạng thái" value={statusFilter} onChange={event => setStatusFilter(event.target.value)} className={control}>
            <option value="ALL">Tất cả trạng thái</option>
            {Object.entries(statuses).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}
          </select>
          <select aria-label="Ưu tiên" value={priorityFilter} onChange={event => setPriorityFilter(event.target.value)} className={control}>
            <option value="ALL">Mọi ưu tiên</option>
            {Object.entries(priorities).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}
          </select>
          <select aria-label="Người phụ trách" value={assigneeFilter} onChange={event => setAssigneeFilter(event.target.value)} className={control}>
            <option value="ALL">Người phụ trách</option>
            {users.map(user => <option key={user.id} value={user.id}>{user.full_name}</option>)}
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead><tr>
            {['Mã lệnh', 'Tên công việc', 'Loại', 'Ưu tiên', 'Trạng thái', 'Người phụ trách', 'Ngày giao'].map(label => <th key={label} scope="col" className="px-4">{label}</th>)}
          </tr></thead>
          <tbody>
            {pagination.items.map(order => {
              const status = statuses[order.status];
              const priority = priorities[order.priority];
              const assignee = users.find(u => u.id === order.assigned_to);
              return (
                <tr key={order.id} className="border-b border-slate-100">
                  <td className="px-4 font-semibold text-[#112D4E]">
                    {onSelectOrder ? <button type="button" className="hover:text-[#3F72AF]" onClick={() => onSelectOrder(order)}>{order.wo_code}</button> : order.wo_code}
                  </td>
                  <td className="px-4 text-slate-600">{order.title}</td>
                  <td className="px-4 text-slate-500">{woTypes[order.wo_type]?.label || order.wo_type}</td>
                  <td className="px-4"><span className="risova-status-badge" style={{ color: priority?.color, background: priority?.bg }}>{priority?.label || order.priority}</span></td>
                  <td className="px-4"><span className="risova-status-badge" style={{ color: status?.color, background: status?.bg }}>{status?.label || order.status}</span></td>
                  <td className="px-4 text-slate-500">{assignee?.full_name || '—'}</td>
                  <td className="px-4 text-slate-500">{dateLabel(order.created_at || order.due_date)}</td>
                </tr>
              );
            })}
            {!filtered.length && <tr><td colSpan={7} className="text-center text-slate-500">Chưa có lệnh việc phát sinh từ lịch bảo trì này.</td></tr>}
          </tbody>
        </table>
      </div>
      <Pagination {...pagination} />
    </section>
  );
}

export default function SchedulesPage({ onGenerateWoFromSchedule, onSelectWorkOrder }) {
  const { data, ENUMS, createMaintenanceSchedule, updateMaintenanceSchedule } = useData();
  const [params, setParams] = useSearchParams();
  const [filterType, setFilterType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [specialtyFilter, setSpecialtyFilter] = useState('ALL');
  const [modal, setModal] = useState(null);
  const selectedSchedule = data.maintenance_schedules.find(schedule => String(schedule.id) === params.get('schedule'));
  const tab = ['orders', 'parts'].includes(params.get('tab')) ? params.get('tab') : 'overview';
  const searchQuery = searchTerm.trim().toLowerCase();

  const filteredSchedules = data.maintenance_schedules.filter(schedule => {
    const asset = data.assets.find(item => item.id === schedule.asset_id);
    const matchesType = filterType === 'ALL' || schedule.schedule_type === filterType;
    const matchesStatus = statusFilter === 'ALL' || (schedule.is_active !== false ? 'ACTIVE' : 'PAUSED') === statusFilter;
    const matchesSpecialty = specialtyFilter === 'ALL' || String(schedule.assigned_specialty_id) === specialtyFilter;
    const matchesQuery = [schedule.title, schedule.asset_code, asset?.name].join(' ').toLowerCase().includes(searchQuery);
    return !schedule.is_archived && matchesType && matchesStatus && matchesSpecialty && matchesQuery;
  });
  const pagination = usePagination(filteredSchedules, [searchQuery, statusFilter, filterType, specialtyFilter].join('|'));

  function showSchedule(schedule) {
    setParams(schedule ? { schedule: String(schedule.id) } : {});
    setModal(null);
    window.scrollTo(0, 0);
  }

  function saveSchedule(values) {
    if (modal === 'edit' && selectedSchedule) updateMaintenanceSchedule(selectedSchedule.id, values);
    else createMaintenanceSchedule(values);
    setModal(null);
  }

  return (
    <div className="risova-page space-y-6">
      {selectedSchedule ? (
        <ScheduleDetails
          schedule={selectedSchedule}
          data={data}
          enums={ENUMS}
          tab={tab}
          onChangeTab={next => setParams(next !== 'overview' ? { schedule: String(selectedSchedule.id), tab: next } : { schedule: String(selectedSchedule.id) }, { replace: true })}
          onBack={() => showSchedule()}
          onEdit={() => setModal('edit')}
          onGenerate={onGenerateWoFromSchedule}
          ordersView={<ScheduleOrders orders={data.work_orders.filter(order => order.schedule_id === selectedSchedule.id)} statuses={ENUMS.WO_STATUSES} priorities={ENUMS.PRIORITIES} woTypes={ENUMS.WO_TYPES} users={data.users} onSelectOrder={onSelectWorkOrder} onGenerate={onGenerateWoFromSchedule} schedule={selectedSchedule} />}
        />
      ) : (
        <>
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1>Bảo trì phòng ngừa</h1>
              <p className="text-slate-500">Quản lý lịch định kỳ theo thời gian, đồng hồ và kết hợp.</p>
            </div>
            <button type="button" onClick={() => setModal('create')} className={primaryButton}>
              <Plus size={16} /> Tạo lịch bảo trì
            </button>
          </header>
          <section className="risova-data-table">
            <div className="risova-table-toolbar flex flex-wrap gap-3">
              <div className="relative min-w-48 flex-1">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input aria-label="Tìm lịch bảo trì" placeholder="Tìm theo tên, mã, thiết bị..." value={searchTerm} onChange={event => setSearchTerm(event.target.value)} className={control + ' w-full pl-9'} />
              </div>
              <select aria-label="Trạng thái lịch bảo trì" value={statusFilter} onChange={event => setStatusFilter(event.target.value)} className={control}>
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Đang hoạt động</option>
                <option value="PAUSED">Tạm dừng</option>
              </select>
              <select aria-label="Loại lịch bảo trì" value={filterType} onChange={event => setFilterType(event.target.value)} className={control}>
                <option value="ALL">Mọi loại lịch</option>
                {Object.entries(scheduleTypeLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
              <select aria-label="Chuyên môn phụ trách" value={specialtyFilter} onChange={event => setSpecialtyFilter(event.target.value)} className={control}>
                <option value="ALL">Chuyên môn phụ trách</option>
                {data.specialties.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead><tr>
                  {['Tên lịch bảo trì', 'Thiết bị', 'Loại lịch', 'Chu kỳ', 'Bảo trì tiếp theo', 'Trạng thái'].map(label => <th key={label} scope="col" className="px-4">{label}</th>)}
                  <th scope="col" className="px-4"><span className="sr-only">Thao tác</span></th>
                </tr></thead>
                <tbody>
                  {pagination.items.map(schedule => (
                    <tr key={schedule.id} className="border-b border-slate-100">
                      <td className="px-4"><button type="button" className="font-semibold text-[#112D4E] hover:text-[#3F72AF]" onClick={() => showSchedule(schedule)}>{schedule.title}</button></td>
                      <td className="px-4 text-slate-500">{schedule.asset_code}</td>
                      <td className="px-4 text-slate-500">{scheduleTypeLabels[schedule.schedule_type] || schedule.schedule_type}</td>
                      <td className="px-4 text-slate-500">{cycleLabel(schedule, data.assets.find(item => item.id === schedule.asset_id))}</td>
                      <td className="px-4 text-slate-500">{schedule.next_due_date ? dateLabel(schedule.next_due_date) : 'Theo mức đo'}</td>
                      <td className="px-4"><ScheduleState schedule={schedule} /></td>
                      <td className="px-4 text-right">
                        {onGenerateWoFromSchedule && schedule.is_active !== false && <button type="button" onClick={() => onGenerateWoFromSchedule(schedule)} className="text-xs font-medium text-[#3F72AF] hover:underline">Sinh WO</button>}
                      </td>
                    </tr>
                  ))}
                  {!pagination.total && <tr><td colSpan={7} className="text-center text-slate-500">Không tìm thấy lịch bảo trì phù hợp.</td></tr>}
                </tbody>
              </table>
            </div>
            <Pagination {...pagination} />
          </section>
        </>
      )}
      {(modal === 'create' || (modal === 'edit' && selectedSchedule)) && (
        <ScheduleForm
          schedule={modal === 'edit' ? selectedSchedule : undefined}
          assets={data.assets}
          specialties={data.specialties}
          onSave={saveSchedule}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

