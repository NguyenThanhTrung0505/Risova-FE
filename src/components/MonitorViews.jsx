import { usePagination } from '../hooks/usePagination';
import { useState } from 'react';
import { ArrowLeft, Plus, Search } from 'lucide-react';
import { useAuth, useData } from '../context/DataContext';
import { canManagePage } from '../constants/permissions';
import Dialog from './Dialog';
import Pagination from './Pagination';

const metrics = { TEMPERATURE: 'Nhiệt độ', VIBRATION: 'Độ rung động cơ', PRESSURE: 'Áp suất', MOTOR_TEMP: 'Nhiệt độ động cơ' };
export default function MonitorViews({ mode, onBack, onModeChange, onSelectWorkOrder }) {
  const { data, createThreshold, updateThreshold, acknowledgeAlert, resolveAlert, ENUMS } = useData();
  const { currentUser } = useAuth();
  const canManage = canManagePage(currentUser?.role, 'iot');
  const [query, setQuery] = useState('');
  const [locationId, setLocationId] = useState('');
  const [assetId, setAssetId] = useState('');
  const [level, setLevel] = useState('');
  const [status, setStatus] = useState('');
  const [editor, setEditor] = useState(null);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const thresholds = mode === 'thresholds';
  const items = (thresholds ? data.asset_thresholds : data.alerts).filter(item => {
    const asset = data.assets.find(asset => asset.id === item.asset_id);
    const metricLabel = metrics[item.metric_type] || item.title || '';
    return [asset?.name, asset?.asset_code, metricLabel].join(' ').toLowerCase().includes(query.toLowerCase())
      && (!locationId || String(asset?.location_id) === locationId)
      && (!assetId || String(item.asset_id) === assetId)
      && (!level || item.level === level) && (!status || item.status === status);
  });
  const pages = usePagination(items, [query, locationId, assetId, level, status, mode].join('|'));
  const field = (label, key, type = 'text') => <div><label htmlFor={'threshold-' + key}>{label}</label><input id={'threshold-' + key} type={type} required step={type === 'number' ? 'any' : undefined} placeholder="..." value={editor[key]} onChange={event => setEditor({ ...editor, [key]: event.target.value })} /></div>;
  const control = 'border border-slate-200 rounded px-3 py-2 text-xs bg-white';
  const selectedAsset = selected ? data.assets.find(asset => asset.id === selected.asset_id) : null;
  const selectedThreshold = selected ? data.asset_thresholds.find(item => item.asset_id === selected.asset_id && item.metric_type === selected.metric_type) : null;
  const selectedWo = selected ? data.work_orders.find(order => order.id === selected.work_order_id) || data.work_orders.find(order => order.asset_id === selected.asset_id) : null;
  return <div className="risova-page space-y-5">
    <div className="flex flex-wrap justify-between items-center gap-4">
      <div><button className="inline-flex gap-2 items-center text-xs text-slate-400 mb-3" onClick={onBack}><ArrowLeft size={15} />Giám sát IoT</button><h1 className="text-page-title">{thresholds ? 'Quản lý ngưỡng giám sát' : 'Cảnh báo IoT'}</h1><p className="text-xs text-slate-500 mt-1">{thresholds ? 'Cấu hình giới hạn cảnh báo theo từng thiết bị và chỉ số.' : 'Danh sách cảnh báo được sinh từ phép kiểm tra ngưỡng trên telemetry.'}</p></div>
      <div className="flex gap-3">
        <button className={control} onClick={() => { onModeChange(thresholds ? 'alerts' : 'thresholds'); setQuery(''); setLocationId(''); setLevel(''); setStatus(''); }}>{thresholds ? 'Xem cảnh báo' : 'Quản lý ngưỡng'}</button>
        <button className={control} onClick={onBack}>Dữ liệu telemetry</button>
        {thresholds && canManage && <button className="bg-[#3F72AF] text-white rounded px-4 py-2 text-xs inline-flex gap-2 items-center" onClick={() => { setEditor({ asset_id: data.assets[0]?.id, metric_type: 'TEMPERATURE', unit: '°C', warning_limit: '', danger_limit: '' }); setError(''); }}><Plus size={15} />Thêm ngưỡng</button>}
      </div>
    </div>
    <section className="risova-data-table">
      <div className="risova-table-toolbar flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-40"><Search size={15} className="absolute top-3 left-3 text-slate-400" /><input className={'pl-9 w-full ' + control} placeholder={thresholds ? 'Tìm theo mã, tên thiết bị, chỉ số...' : 'Tìm theo mã, tên thiết bị...'} aria-label="Tìm thiết bị giám sát" value={query} onChange={event => setQuery(event.target.value)} /></div>
        {thresholds ? (
          <>
            <select className={control} aria-label="Vị trí" value={locationId} onChange={event => setLocationId(event.target.value)}><option value="">Tất cả vị trí</option>{data.locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}</select>
            <select className={control} aria-label="Thiết bị" value={assetId} onChange={event => setAssetId(event.target.value)}><option value="">Tất cả thiết bị</option>{data.assets.map(asset => <option key={asset.id} value={asset.id}>{asset.asset_code}</option>)}</select>
          </>
        ) : (
          <>
            <select className={control} aria-label="Mức độ" value={level} onChange={event => setLevel(event.target.value)}><option value="">Mọi mức độ</option>{Object.entries(ENUMS.ALERT_LEVELS).map(([key,item]) => <option key={key} value={key}>{item.label}</option>)}</select>
            <select className={control} aria-label="Trạng thái" value={status} onChange={event => setStatus(event.target.value)}><option value="">Mọi trạng thái</option>{Object.entries(ENUMS.ALERT_STATUSES).map(([key,item]) => <option key={key} value={key}>{item.label}</option>)}</select>
            <select className={control} aria-label="Thiết bị" value={assetId} onChange={event => setAssetId(event.target.value)}><option value="">Mọi thiết bị</option>{data.assets.map(asset => <option key={asset.id} value={asset.id}>{asset.asset_code}</option>)}</select>
          </>
        )}
      </div>
      <div className="overflow-x-auto"><table className="w-full text-left whitespace-nowrap">
        <thead><tr>{(thresholds ? ['Mã thiết bị','Tên thiết bị','Chỉ số','Đơn vị','Ngưỡng cảnh báo','Ngưỡng nguy hiểm', ...(canManage ? [''] : [])] : ['Mã thiết bị','Tên thiết bị','Chỉ số','Giá trị','Ngưỡng','Mức độ','Trạng thái','Thời gian']).map((label,index) => <th className="px-4" key={index}>{label}</th>)}</tr></thead>
        <tbody>{pages.items.map(item => {
          const asset = data.assets.find(asset => asset.id === item.asset_id);
          return <tr key={item.id} className="border-b border-slate-100">
            <td className="px-4 font-medium">{thresholds ? (canManage ? <button onClick={() => setEditor({ ...item })}>{asset?.asset_code}</button> : asset?.asset_code) : <button onClick={() => setSelected(item)}>{asset?.asset_code}</button>}</td>
            <td className="px-4 text-slate-500">{asset?.name}</td><td className="px-4 text-slate-500">{metrics[item.metric_type] || item.title}</td>
            {thresholds ? <><td className="px-4">{item.unit}</td><td className="px-4">{item.warning_limit}</td><td className="px-4">{item.danger_limit}</td>{canManage && <td className="px-4"><button className="text-[#3F72AF]" onClick={() => setEditor({ ...item })}>Chỉnh sửa</button></td>}</> : <><td className="px-4">{item.trigger_value}</td><td className="px-4">{item.threshold_val}</td><td className="px-4"><span className={'risova-status-badge ' + (item.level === 'DANGER' ? 'bg-red-100 text-red-500' : 'bg-amber-100 text-amber-600')}>{ENUMS.ALERT_LEVELS[item.level]?.label}</span></td><td className="px-4"><button className="text-[#3F72AF]" onClick={() => setSelected(item)}>{ENUMS.ALERT_STATUSES[item.status]?.label}</button></td><td className="px-4 text-slate-500">{new Date(item.triggered_at).toLocaleString('vi-VN')}</td></>}
          </tr>;
        })}</tbody>
      </table>{!items.length && <p className="risova-empty-state">Không có kết quả phù hợp.</p>}</div>
      <Pagination {...pages} />
    </section>
    {canManage && editor && <Dialog title={editor.id ? 'Chỉnh sửa ngưỡng' : 'Thêm ngưỡng'} width={480} onClose={() => setEditor(null)}>
      <form className="space-y-4" onSubmit={event => {
        event.preventDefault();
        if (Number(editor.warning_limit) >= Number(editor.danger_limit)) { setError('Ngưỡng nguy hiểm phải lớn hơn ngưỡng cảnh báo.'); return; }
        const values = { ...editor, asset_id: Number(editor.asset_id), warning_limit: Number(editor.warning_limit), danger_limit: Number(editor.danger_limit) };
        if (editor.id) updateThreshold(editor.id, values);
        else createThreshold(values);
        setEditor(null);
      }}>
        <div><label htmlFor="threshold-device">Thiết bị *</label><select id="threshold-device" value={editor.asset_id} onChange={event => setEditor({ ...editor, asset_id: event.target.value })}>{data.assets.map(asset => <option key={asset.id} value={asset.id}>{asset.name}</option>)}</select></div>
        <div><label htmlFor="threshold-metric">Chỉ số</label><select id="threshold-metric" value={editor.metric_type} onChange={event => setEditor({ ...editor, metric_type: event.target.value })}>{Object.entries(metrics).map(([key,label]) => <option key={key} value={key}>{label}</option>)}</select></div>
        {field('Đơn vị','unit')}{field('Ngưỡng cảnh báo','warning_limit','number')}{field('Ngưỡng nguy hiểm','danger_limit','number')}
        {error && <p role="alert" className="text-red-500 text-xs">{error}</p>}
        <div className="risova-form-actions"><button type="button" onClick={() => setEditor(null)}>Hủy</button><button type="submit">{editor.id ? 'Lưu' : 'Thêm'}</button></div>
      </form>
    </Dialog>}
    {selected && <Dialog title="Chi tiết cảnh báo" width={640} onClose={() => setSelected(null)}>
      <div className="space-y-3">
        <div>
          <dt className="text-xs font-bold text-[#66788a]">Thiết bị</dt>
          <dd className="text-sm font-semibold text-[#112d4e] mt-1">{selectedAsset ? `${selectedAsset.asset_code} - ${selectedAsset.name}` : '—'}</dd>
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
          <div>
            <dt className="text-xs font-bold text-[#66788a]">Chỉ số</dt>
            <dd className="text-sm font-semibold text-[#112d4e] mt-1">{metrics[selected.metric_type] || selected.title}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-[#66788a]">Giá trị</dt>
            <dd className={'text-sm font-semibold mt-1 ' + (selected.level === 'DANGER' ? 'text-[#ef4444]' : 'text-[#f59e0b]')}>{selected.trigger_value}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-[#66788a]">Ngưỡng cảnh báo</dt>
            <dd className="text-sm font-semibold text-[#f59e0b] mt-1">{selectedThreshold ? `${selectedThreshold.warning_limit}${selectedThreshold.unit || ''}` : selected.threshold_val}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-[#66788a]">Ngưỡng nguy hiểm</dt>
            <dd className="text-sm font-semibold text-[#ef4444] mt-1">{selectedThreshold ? `${selectedThreshold.danger_limit}${selectedThreshold.unit || ''}` : selected.threshold_val}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-[#66788a]">Mức độ</dt>
            <dd className={'text-sm font-semibold mt-1 ' + (selected.level === 'DANGER' ? 'text-[#ef4444]' : 'text-[#f59e0b]')}>{selected.level}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-[#66788a]">Thời gian</dt>
            <dd className="text-sm font-semibold text-[#112d4e] mt-1">{new Date(selected.triggered_at).toLocaleString('vi-VN')}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-[#66788a]">Người xác nhận</dt>
            <dd className="text-sm font-semibold text-[#66788a] mt-1">{data.users.find(user => user.id === selected.acknowledged_by)?.full_name || 'Chưa có'}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-[#66788a]">Thời gian xác nhận</dt>
            <dd className="text-sm font-semibold text-[#66788a] mt-1">{selected.acknowledged_at ? new Date(selected.acknowledged_at).toLocaleString('vi-VN') : 'Chưa có'}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-[#66788a]">Thời gian hoàn thành</dt>
            <dd className="text-sm font-semibold text-[#66788a] mt-1">{selected.resolved_at ? new Date(selected.resolved_at).toLocaleString('vi-VN') : 'Chưa có'}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-[#66788a]">Work Order</dt>
            <dd className="text-sm font-semibold text-[#112d4e] mt-1">{selectedWo?.wo_code || 'Chưa có'}</dd>
          </div>
        </dl>
      </div>
      <div className="border-t border-[#dbe2ef] pt-4 mt-5 space-y-3">
        <div className="flex gap-3">
          {canManage && <button type="button" className="flex-1 rounded-lg bg-[#3f72af] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#325d91]" onClick={() => { acknowledgeAlert(selected.id, currentUser); setSelected(null); }}>Xác nhận cảnh báo</button>}
          <button type="button" className="flex-1 rounded-lg border border-[#dbe2ef] bg-white px-4 py-2.5 text-sm font-semibold text-[#112d4e] hover:bg-slate-50 disabled:opacity-50" disabled={!selectedWo} onClick={() => { if (selectedWo) { setSelected(null); onSelectWorkOrder?.(selectedWo); } }}>Xem Work Order</button>
        </div>
        {canManage && <button type="button" className="w-full rounded-lg bg-[#dbe2ef] px-4 py-2.5 text-sm font-semibold text-[#3f72af] hover:bg-[#cdd7ea]" onClick={() => { resolveAlert(selected.id); setSelected(null); }}>Đánh dấu đã xử lý</button>}
      </div>
    </Dialog>}
  </div>;
}
