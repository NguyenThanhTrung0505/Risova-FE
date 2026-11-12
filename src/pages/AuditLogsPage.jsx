import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import {
  FileText,
  Search,
  Filter,
  Shield,
  Clock,
  Terminal,
  User,
  Globe
} from 'lucide-react';

export default function AuditLogsPage() {
  const { data } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filteredLogs = (data.audit_logs || []).filter(log => {
    const matchesSearch = log.entity_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.action?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <div>
        <h1 className="text-page-title font-bold text-[#112D4E]">
          Nhật ký Kiểm toán Hệ thống (Audit Logs)
        </h1>
        <p className="text-body text-[#64748B] mt-0.5">
          Ghi nhận toàn bộ thao tác thêm, sửa, cập nhật trạng thái lệnh việc, xuất kho phụ tùng và địa chỉ IP
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo người dùng, mã lệnh việc, thao tác..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-[#112D4E]"
          >
            <option value="ALL">Mọi loại hành động (ALL)</option>
            <option value="CREATE_WORK_ORDER">Tạo lệnh việc (CREATE_WORK_ORDER)</option>
            <option value="UPDATE_STATUS">Đổi trạng thái (UPDATE_STATUS)</option>
            <option value="ISSUE_INVENTORY">Xuất vật tư (ISSUE_INVENTORY)</option>
            <option value="UPDATE_CHECKLIST">Cập nhật Checklist (UPDATE_CHECKLIST)</option>
            <option value="CLOSE_WORK_ORDER">Nghiệm thu đóng phiếu (CLOSE_WORK_ORDER)</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold uppercase text-[#64748B] tracking-wider">
                <th className="py-3.5 px-4">Thời gian</th>
                <th className="py-3.5 px-4">Người thực hiện</th>
                <th className="py-3.5 px-4">Hành động</th>
                <th className="py-3.5 px-4">Đối tượng tác động</th>
                <th className="py-3.5 px-4">Chi tiết thay đổi</th>
                <th className="py-3.5 px-4 text-right">Địa chỉ IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString('vi-VN')}
                  </td>
                  <td className="py-3 px-4 font-bold text-[#112D4E] whitespace-nowrap">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {log.user_name}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-blue-50 text-[#3F72AF]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-800 whitespace-nowrap">
                    {log.entity_type} : <span className="text-[#3F72AF]">{log.entity_id}</span>
                  </td>
                  <td className="py-3 px-4 max-w-sm">
                    <div className="font-mono text-[11px] bg-slate-50 p-1.5 rounded border border-slate-200 truncate">
                      {log.new_value ? JSON.stringify(log.new_value) : 'Khởi tạo'}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-500 whitespace-nowrap">
                    {log.ip_address || '192.168.1.1'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

