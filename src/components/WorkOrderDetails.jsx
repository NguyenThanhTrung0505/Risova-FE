import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Check, Pencil, Trash2, Upload, UserRound, Wrench } from 'lucide-react';
import { useAuth, useData } from '../context/DataContext';
import { canManagePage } from '../constants/permissions';
import Dialog from './Dialog';
import EditWorkOrderDialog from './EditWorkOrderDialog';

const date = value => value && !Number.isNaN(new Date(value).getTime())
  ? new Date(value).toLocaleString('vi-VN') : 'Chưa cập nhật';
const money = value => Number(value || 0).toLocaleString('vi-VN') + ' đ';

function Field({ label, children, wide = false }) {
  return <div className={wide ? 'wo-field wo-field-wide' : 'wo-field'}><dt>{label}</dt><dd>{children ?? '—'}</dd></div>;
}

export default function WorkOrderDetails({ order, onBack }) {
  const { data, ENUMS, updateWorkOrder, updateWorkOrderStatus, toggleChecklist, issuePartForWorkOrder, consumePartForWorkOrder } = useData();
  const { currentUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [taskId, setTaskId] = useState(null);
  const [draftStatus, setDraftStatus] = useState(null);
  const status = draftStatus ?? order.status;
  const [removeOpen, setRemoveOpen] = useState(false);
  const canManage = canManagePage(currentUser?.role, 'work-orders');
  const canIssue = canManage && ['ADMIN', 'MANAGER', 'INVENTORY_STAFF'].includes(currentUser?.role);
  const canExecute = canManage;
  const asset = data.assets.find(item => item.id === order.asset_id);
  const location = data.locations.find(item => item.id === asset?.location_id);
  const failure = data.failure_codes.find(item => item.id === Number(order.failure_code_id));
  const task = order.checklists?.find(item => item.id === taskId);
  const person = id => data.users.find(item => item.id === id)?.full_name || 'Chưa phân công';
  const checklist = [...(order.checklists || [])].sort((a, b) => a.step_number - b.step_number);
  const completed = checklist.filter(item => item.is_completed).length;
  const statusMeta = ENUMS.WO_STATUSES[order.status] || {};
  const priorityMeta = ENUMS.PRIORITIES[order.priority] || {};
  const statusLabel = key => key === 'COMPLETED' ? 'Chờ nghiệm thu' : ENUMS.WO_STATUSES[key]?.label;
  const downtime = order.actual_start && order.actual_end
    ? Math.max(0, (new Date(order.actual_end) - new Date(order.actual_start)) / 3600000).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + ' giờ' : 'Chưa cập nhật';

  return <div className="wo-detail">
    <button type="button" className="wo-back" onClick={onBack}><ArrowLeft size={15} />Danh sách lệnh việc</button>
    <header className="wo-detail-heading">
      <span className="wo-heading-icon"><Wrench size={28} /></span>
      <div><h1>{order.title}</h1><div className="wo-badges"><span className="risova-status-badge" style={{ color: statusMeta.color, background: statusMeta.bg }}>{statusLabel(order.status)}</span><span className="risova-status-badge" style={{ color: priorityMeta.color, background: priorityMeta.bg }}>{priorityMeta.label}</span></div></div>
      {canManage && <div className="wo-heading-actions"><button type="button" onClick={() => setEditing(true)}><Pencil size={16} />Chỉnh sửa</button><button type="button" className="is-danger" onClick={() => setRemoveOpen(true)}><Trash2 size={16} />Xóa</button></div>}
    </header>
    <div className="wo-progress">
      <nav className="risova-tabs" aria-label="Trạng thái lệnh việc">
        {Object.keys(ENUMS.WO_STATUSES).map(key => <button type="button" key={key} aria-pressed={status === key} aria-selected={status === key}
          disabled={!canManage} onClick={() => setDraftStatus(key)}>{statusLabel(key)}</button>)}
      </nav>
      {canManage && <button type="button" className="wo-primary" disabled={status === order.status} onClick={() => { updateWorkOrderStatus(order.id, status, currentUser); setDraftStatus(null); }}>Cập nhật</button>}
    </div>
    <div className="wo-detail-grid">
      <section className="wo-card wo-content"><h2>Nội dung công việc</h2>
        <div className="wo-asset-info">
          <img className="wo-asset-image" src={asset?.details?.image_url || (asset?.asset_code === 'CV-01' ? '/conveyor-cv01.jpg' : '/machine-cnc.jpg')} alt={asset?.name || order.asset_name} />
          <dl className="wo-fields">
            <Field label="Mã lệnh">{order.wo_code}</Field><Field label="Loại">{ENUMS.WO_TYPES[order.wo_type]?.label || order.wo_type}</Field>
            <Field label="Thiết bị"><Link to={'/equipment?asset=' + order.asset_id} className="wo-link">Xem chi tiết <ArrowUpRight size={14} /></Link><span>{asset?.name || order.asset_name} ({order.asset_code})</span></Field><Field label="Model">{asset?.details?.model}</Field>
            <Field label="Vị trí lắp đặt" wide>{location?.name || asset?.location_name}</Field>
            <Field label="Bắt đầu dự kiến">{date(order.scheduled_start)}</Field><Field label="Kết thúc dự kiến">{date(order.scheduled_end)}</Field>
            <Field label="Giờ lao động">{Number(order.labor_hours || 0).toLocaleString('vi-VN')} giờ</Field><Field label="Chi phí">{money(order.actual_cost ?? order.estimated_cost)}</Field>
          </dl>
        </div>
        <div className="wo-people">{[['Người báo hỏng', order.reported_by], ['Kỹ thuật viên phụ trách', order.assigned_to], ['Người nghiệm thu', order.verified_by]].map(([label, id]) => <div key={label}><span className="wo-person-icon"><UserRound size={20} /></span><dl><Field label={label}>{person(id)}</Field></dl></div>)}</div>
      </section>
      <section className="wo-card wo-checklist"><h2>Checklist</h2><p>{completed}/{checklist.length} mục hoàn thành</p><div className="wo-task-list">{checklist.map(item => <button key={item.id} type="button" className={item.is_completed ? 'is-completed' : ''} onClick={() => setTaskId(item.id)}>{item.task_description}</button>)}{!checklist.length && <p>Chưa có nhiệm vụ.</p>}</div></section>
      <section className="wo-card"><h2>Phân tích và xử lý</h2><dl className="wo-analysis-fields">
        <Field label="Mô tả công việc" wide>{order.description || 'Chưa có mô tả'}</Field>
        <Field label="Mã lỗi">{order.failure_code || (failure ? failure.code + ' – ' + failure.name : 'Chưa xác định')}</Field><Field label="Nhóm lỗi">{order.failure_group || failure?.category}</Field><Field label="Thời gian máy dừng">{downtime}</Field>
        <Field label="Nguyên nhân gốc rễ" wide>{order.root_cause || 'Chưa xác định'}</Field><Field label="Phương án xử lý" wide>{order.resolution_notes || 'Chưa cập nhật'}</Field>
      </dl></section>
      <section className="wo-card"><h2>Nhật ký thời gian</h2><dl className="wo-timeline"><Field label="Tạo lệnh việc">{date(order.created_at)}</Field><Field label="Cập nhật lệnh việc">{date(order.updated_at)}</Field><Field label="Đóng lệnh việc">{date(order.closed_at)}</Field></dl></section>
      {!!order.parts?.length && <section className="wo-card wo-parts"><h2>Vật tư phụ tùng</h2><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr><th>Vật tư</th><th>Cần dùng</th><th>Đã xuất</th><th>Đã dùng</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{order.parts.map(part => <tr key={part.id}><td><strong>{part.part_name}</strong><small>{part.part_code}</small></td><td>{part.quantity_needed}</td><td>{part.quantity_issued || 0}</td><td>{part.quantity_consumed || 0}</td><td>{ENUMS.WO_PART_STATUSES[part.status]?.label || part.status}</td><td>{part.status === 'RESERVED' && canIssue && <button className="wo-link" onClick={() => issuePartForWorkOrder(order.id, part.part_id, part.quantity_needed, currentUser)}>Xuất kho</button>}{part.status === 'ISSUED' && canExecute && <button className="wo-link" onClick={() => consumePartForWorkOrder(order.id, part.part_id, part.quantity_issued, currentUser)}>Xác nhận đã dùng</button>}</td></tr>)}</tbody></table></div></section>}
    </div>
    {task && <Dialog placement="workspace-left" width={360} title="Chi tiết nhiệm vụ" onClose={() => setTaskId(null)}>
      <h3 className="wo-task-title"><span className="wo-person-icon"><Check size={18} /></span>{task.task_description}</h3>
      <dl className="wo-timeline"><Field label="Hướng dẫn">{task.instructions || task.task_description}</Field><Field label="Ảnh nghiệm thu">{task.image_url ? <img className="wo-task-image" src={task.image_url} alt="Ảnh nghiệm thu nhiệm vụ" /> : <span className="wo-image-placeholder"><Upload size={52} strokeWidth={1.3} /><span>Chưa có ảnh nghiệm thu</span></span>}</Field><Field label="Ghi chú">{task.note || 'Chưa có ghi chú'}</Field><Field label="Hoàn thành bởi">{task.completed_by ? person(task.completed_by) : 'Chưa cập nhật'}</Field><Field label="Thời gian hoàn thành">{date(task.completed_at)}</Field></dl>
      <button type="button" className={'wo-completion ' + (task.is_completed ? 'is-completed' : '')} disabled={!canExecute} onClick={() => toggleChecklist(order.id, task.id, task.note, currentUser)}>{task.is_completed ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}</button>
    </Dialog>}
    {editing && <EditWorkOrderDialog order={order} onClose={() => setEditing(false)} />}
    {removeOpen && <Dialog title="Xóa lệnh việc" width={440} onClose={() => setRemoveOpen(false)}><p>Lệnh {order.wo_code} sẽ được chuyển vào lưu trữ. Vật tư đang giữ chỗ sẽ được trả về kho khả dụng.</p><div className="risova-form-actions"><button onClick={() => setRemoveOpen(false)}>Quay lại</button><button className="is-primary" onClick={() => { updateWorkOrderStatus(order.id, 'CANCELLED', currentUser); updateWorkOrder(order.id, { is_archived: true }); setRemoveOpen(false); onBack(); }}>Xóa lệnh việc</button></div></Dialog>}
  </div>;
}
