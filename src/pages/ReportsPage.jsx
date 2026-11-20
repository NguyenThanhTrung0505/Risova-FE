import { useState } from 'react';
import { Download, Search } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useData } from '../context/DataContext';

const money = value => Number(value || 0).toLocaleString('vi-VN') + ' đ';
export default function ReportsPage({ title = 'Báo cáo và phân tích', subtitle = 'Chi phí, tiến độ và hiệu suất vận hành của hệ thống thiết bị.', headerAction = null }) {
  const { data } = useData();
  const dates = data.work_orders.map(order => (order.created_at || order.due_date || '').slice(0,10)).filter(Boolean).sort();
  const initialRange = {from:dates[0] || '',to:dates.at(-1) || '',location:'ALL'};
  const [draft, setDraft] = useState(initialRange);
  const [filters, setFilters] = useState(initialRange);
  const [error, setError] = useState('');
  const withinRange = date => (!filters.from || String(date).slice(0,10) >= filters.from) && (!filters.to || String(date).slice(0,10) <= filters.to);
  const assets = data.assets.filter(asset => filters.location === 'ALL' || String(asset.location_id) === filters.location);
  const orders = data.work_orders.filter(order => withinRange(order.created_at || order.due_date) && assets.some(asset => asset.id === order.asset_id));
  const completed = orders.filter(order => ['COMPLETED','CLOSED'].includes(order.status));
  const overdue = orders.filter(order => order.due_date && new Date(order.due_date + 'T23:59:59') < new Date() && !['COMPLETED','CLOSED','CANCELLED'].includes(order.status));
  const totalHours = orders.reduce((sum,order) => sum + Number(order.labor_hours || 0),0);
  const totalCost = orders.reduce((sum,order) => sum + Number(order.actual_cost || order.estimated_cost || 0),0);
  const chartData = orders.map(order => ({name:order.wo_code.split('-').at(-1),cost:Number(order.actual_cost || order.estimated_cost || 0) / 1e6,hours:Number(order.labor_hours || 0)}));
  const usageData = data.spare_parts.map(part => ({
    name:part.part_code,
    quantity:(data.inventory_transactions || []).filter(transaction => transaction.part_id === part.id && transaction.transaction_type === 'ISSUE' && withinRange(transaction.created_at) && (filters.location === 'ALL' || orders.some(order => order.id === transaction.work_order_id))).reduce((sum,transaction) => sum + Number(transaction.quantity || 0),0)
  }));
  const rows = assets.map(asset => {
    const work = orders.filter(order => order.asset_id === asset.id);
    return {...asset,orderCount:work.length,hours:work.reduce((sum,order) => sum + Number(order.labor_hours || 0),0),cost:work.reduce((sum,order) => sum + Number(order.actual_cost || order.estimated_cost || 0),0)};
  });
  const exportCsv = () => {
    const cell = value => '"' + String(value).replace(/"/g,'""') + '"';
    const csv = [['Thiết bị','Mã thiết bị','Sức khỏe (%)','Số lệnh việc','Giờ công bảo trì','Chi phí (đ)'],...rows.map(row => [row.name,row.asset_code,row.health_score,row.orderCount,row.hours,row.cost])].map(row => row.map(cell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF' + csv],{type:'text/csv;charset=utf-8;'}));
    const link = document.createElement('a');
    link.href = url;link.download = 'risova-bao-cao-' + (filters.to || 'tong-hop') + '.csv';link.click();setTimeout(() => URL.revokeObjectURL(url),1000);
  };
  return <div className="risova-page space-y-5">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div><h1>{title}</h1><p className="text-slate-500">{subtitle}</p></div>
      <div className="flex flex-wrap gap-2">
        {headerAction}
        <button onClick={exportCsv} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded text-xs"><Download size={15} />Tải CSV</button>
      </div>
    </div>
    <form className="bg-white border border-slate-200 rounded-lg p-4" onSubmit={event => {event.preventDefault();if(draft.from && draft.to && draft.from > draft.to){setError('Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.');return;}setFilters({...draft});setError('');}}>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto] gap-4 items-end">
        <div><label htmlFor="report-from" className="block text-[11px] text-slate-500 mb-1">Từ ngày</label><input id="report-from" type="date" value={draft.from} onChange={event => setDraft({...draft,from:event.target.value})} className="w-full px-3 py-2 border border-slate-200 text-xs" /></div>
        <div><label htmlFor="report-to" className="block text-[11px] text-slate-500 mb-1">Đến ngày</label><input id="report-to" type="date" value={draft.to} onChange={event => setDraft({...draft,to:event.target.value})} className="w-full px-3 py-2 border border-slate-200 text-xs" /></div>
        <div><label htmlFor="report-location" className="block text-[11px] text-slate-500 mb-1">Phạm vi báo cáo</label><select id="report-location" value={draft.location} onChange={event => setDraft({...draft,location:event.target.value})} className="w-full px-3 py-2 border border-slate-200 text-xs"><option value="ALL">Toàn nhà máy</option>{data.locations.map(location => <option key={location.id} value={location.id}>{location.name}</option>)}</select></div>
        <button type="submit" className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#3F72AF] text-white text-xs rounded h-9"><Search size={14} />Xem báo cáo</button>
      </div>
      {error && <p role="alert" className="text-xs text-red-500 mt-2">{error}</p>}
    </form>
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {[['Tỷ lệ hoàn thành', (orders.length ? Math.round(completed.length / orders.length * 100) : 0) + '%',completed.length + '/' + orders.length + ' lệnh việc'],['Lệnh quá hạn',overdue.length,'Cần ưu tiên xử lý'],['Giờ công bảo trì',totalHours.toLocaleString('vi-VN') + ' giờ','Tổng giờ công của lệnh việc'],['Chi phí bảo trì',(totalCost / 1e6).toLocaleString('vi-VN',{maximumFractionDigits:1}) + ' tr đ','Thực tế hoặc dự toán khi chưa quyết toán']].map(([label,value,description]) => <div key={label} className="bg-white border border-slate-200 rounded-lg p-4"><p className="text-xs text-slate-500">{label}</p><strong className="block mt-2 text-2xl font-semibold">{value}</strong><p className="text-[10px] text-slate-400 mt-1">{description}</p></div>)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5 min-w-0">
        <h2 className="text-sm font-semibold mb-5">Chi phí & thời gian theo lệnh việc</h2>
        {chartData.length ? <div className="h-72 w-full" role="img" aria-label="Biểu đồ chi phí và giờ công theo lệnh việc"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{top:10,right:5,left:-20,bottom:0}}><CartesianGrid vertical={false} stroke="#edf0f5" /><XAxis dataKey="name" tick={{fontSize:11,fill:'#7f8d9e'}} axisLine={false} tickLine={false} /><YAxis yAxisId="cost" tick={{fontSize:10,fill:'#7f8d9e'}} axisLine={false} tickLine={false} /><YAxis yAxisId="hours" orientation="right" hide /><Tooltip contentStyle={{fontSize:12,borderRadius:6,borderColor:'#dbe2ef'}} /><Legend wrapperStyle={{fontSize:11,paddingTop:12}} /><Bar yAxisId="cost" dataKey="cost" name="Chi phí (triệu đ)" fill="#5075aa" radius={[2,2,0,0]} maxBarSize={34} /><Bar yAxisId="hours" dataKey="hours" name="Giờ công (giờ)" fill="#e4a43a" radius={[2,2,0,0]} maxBarSize={34} /></BarChart></ResponsiveContainer></div> : <p className="risova-empty-state">Chưa có lệnh việc trong khoảng thời gian này.</p>}
      </div>
      <div className="bg-white border border-slate-200 rounded-lg p-5 min-w-0">
        <h2 className="text-sm font-semibold mb-5">Tiêu thụ vật tư</h2>
        <div className="h-72 w-full" role="img" aria-label="Số lượng vật tư đã xuất kho"><ResponsiveContainer width="100%" height="100%"><LineChart data={usageData} margin={{top:10,right:5,left:-25,bottom:0}}><CartesianGrid vertical={false} stroke="#edf0f5" /><XAxis dataKey="name" tick={{fontSize:9,fill:'#7f8d9e'}} tickFormatter={value => value.length > 9 ? value.slice(0,8) + '…' : value} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} tick={{fontSize:10,fill:'#7f8d9e'}} axisLine={false} tickLine={false} /><Tooltip contentStyle={{fontSize:11,borderRadius:6,borderColor:'#dbe2ef'}} /><Line type="monotone" dataKey="quantity" name="Số lượng xuất" stroke="#60b58b" strokeWidth={2} dot={{r:3,fill:'white'}} /></LineChart></ResponsiveContainer></div>
      </div>
    </div>
    <section className="bg-white border border-slate-200 rounded-lg p-5">
      <h2 className="text-sm font-semibold">Hiệu suất thiết bị</h2><p className="text-xs text-slate-400 mt-1 mb-4">Tổng hợp công việc và chi phí trong phạm vi báo cáo.</p>
      <div className="overflow-x-auto"><table className="w-full text-left whitespace-nowrap"><thead><tr>{['Thiết bị','Sức khỏe','Số lệnh việc','Giờ công','Chi phí'].map(label => <th key={label} className="px-4">{label}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.id} className="border-b border-slate-100"><td className="px-4 font-medium">{row.asset_code} · {row.name}</td><td className="px-4 text-slate-500">{row.health_score}%</td><td className="px-4 text-slate-500">{row.orderCount}</td><td className="px-4 text-slate-500">{row.hours.toLocaleString('vi-VN')} giờ</td><td className="px-4 text-slate-500">{money(row.cost)}</td></tr>)}</tbody></table>{!rows.length && <p className="risova-empty-state">Không có thiết bị trong phạm vi đã chọn.</p>}</div>
    </section>
  </div>;
}
