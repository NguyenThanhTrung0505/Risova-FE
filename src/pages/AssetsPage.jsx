import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useData } from '../context/DataContext';
import {
  Layers,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  QrCode,
  AlertTriangle,
  Clock,
  CheckCircle,
  X,
  Gauge,
  Calendar,
  Building2,
  Download
} from 'lucide-react';

export default function AssetsPage({ onSelectAssetForWo, onOpenQrScanner, selectedAssetFromExternal, onClearSelectedAsset }) {
  const { data, ENUMS, createAsset, updateAsset } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedAsset, setSelectedAsset] = useState(selectedAssetFromExternal || null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Sync external asset selection (e.g. from QR scanner)
  useEffect(() => {
    if (selectedAssetFromExternal) {
      setSelectedAsset(selectedAssetFromExternal);
    }
  }, [selectedAssetFromExternal]);

  // Handle Download QR PNG
  const handleDownloadQr = () => {
    if (!selectedAsset) return;
    const canvas = document.getElementById(`qr-canvas-${selectedAsset.asset_code}`);
    if (!canvas) return;
    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `QR_${selectedAsset.asset_code}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // Form state for creating asset
  const [formData, setFormData] = useState({
    asset_code: '',
    name: '',
    location_id: 1,
    priority: 'MEDIUM',
    required_specialty_id: 1,
    status: 'ACTIVE',
    current_meter: 0,
    meter_unit: 'HOURS',
    manufacturer: '',
    model: '',
    serial_number: '',
    purchase_price: 50000000,
    description: ''
  });

  const filteredAssets = data.assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          asset.asset_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || asset.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.asset_code) {
      alert('Vui lòng nhập đầy đủ mã và tên thiết bị!');
      return;
    }
    createAsset(formData);
    setShowCreateModal(false);
    setFormData({
      asset_code: '',
      name: '',
      location_id: 1,
      priority: 'MEDIUM',
      required_specialty_id: 1,
      status: 'ACTIVE',
      current_meter: 0,
      meter_unit: 'HOURS',
      manufacturer: '',
      model: '',
      serial_number: '',
      purchase_price: 50000000,
      description: ''
    });
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-page-title font-bold text-[#112D4E]">
            Danh mục Thiết bị & Tài sản (Assets)
          </h1>
          <p className="text-body text-[#64748B] mt-0.5">
            Quản lý toàn bộ {data.assets.length} thiết bị, máy móc và dây chuyền tại Nhà máy Bắc Ninh
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenQrScanner}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 hover:border-[#3F72AF] text-[#112D4E] rounded-lg font-semibold text-sm shadow-xs transition cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-[#3F72AF]" />
            <span>Quét mã QR</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#3F72AF] hover:bg-[#325d91] text-white rounded-lg font-semibold text-sm shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Thêm thiết bị mới</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo mã hoặc tên thiết bị..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-[#64748B] shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Trạng thái:
          </span>
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${
              statusFilter === 'ALL' ? 'bg-[#3F72AF] text-white font-semibold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({data.assets.length})
          </button>
          {Object.entries(ENUMS.ASSET_STATUSES).map(([key, info]) => {
            const count = data.assets.filter(a => a.status === key).length;
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 flex items-center gap-1.5 ${
                  statusFilter === key ? 'bg-[#3F72AF] text-white font-semibold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{info.label}</span>
                <span className="text-[10px] opacity-75 font-mono">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Assets Grid / Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold uppercase text-[#64748B] tracking-wider">
                <th className="py-3.5 px-4">Mã thiết bị</th>
                <th className="py-3.5 px-4">Tên thiết bị</th>
                <th className="py-3.5 px-4">Khu vực / Phân xưởng</th>
                <th className="py-3.5 px-4">Mức ưu tiên</th>
                <th className="py-3.5 px-4">Chỉ số vận hành</th>
                <th className="py-3.5 px-4">Sức khỏe</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredAssets.map(asset => {
                const statusMeta = ENUMS.ASSET_STATUSES[asset.status] || { label: asset.status, color: '#64748B', bg: '#F1F5F9' };
                const priorityMeta = ENUMS.PRIORITIES[asset.priority] || { label: asset.priority, color: '#64748B', bg: '#F1F5F9' };
                const loc = data.locations.find(l => l.id === asset.location_id);

                return (
                  <tr
                    key={asset.id}
                    className="hover:bg-slate-50/80 transition cursor-pointer"
                    onClick={() => setSelectedAsset(asset)}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-[#3F72AF]">
                      {asset.asset_code}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#112D4E]">
                      {asset.name}
                      {asset.details?.model && (
                        <div className="text-[11px] font-normal text-slate-500">
                          {asset.details.manufacturer} - {asset.details.model}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {loc ? loc.name : 'Chưa phân bổ'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        style={{ color: priorityMeta.color, backgroundColor: priorityMeta.bg }}
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                      >
                        {priorityMeta.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {asset.current_meter?.toLocaleString('vi-VN')} {asset.meter_unit}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              asset.health_score < 40 ? 'bg-red-500' : asset.health_score < 75 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${asset.health_score}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-[11px]">{asset.health_score}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        style={{ color: statusMeta.color, backgroundColor: statusMeta.bg }}
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                      >
                        {statusMeta.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedAsset(asset)}
                          className="p-1.5 text-slate-400 hover:text-[#3F72AF] hover:bg-slate-100 rounded-md transition"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (onSelectAssetForWo) onSelectAssetForWo(asset);
                          }}
                          className="px-2.5 py-1 bg-sky-50 text-[#3F72AF] hover:bg-[#3F72AF] hover:text-white rounded-md text-[11px] font-semibold transition"
                          title="Tạo phiếu việc"
                        >
                          + Giao việc
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Asset Detail Modal */}
      {selectedAsset && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => {
            setSelectedAsset(null);
            if (onClearSelectedAsset) onClearSelectedAsset();
          }}
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#3F72AF] flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#112D4E]">{selectedAsset.name}</h3>
                  <span className="text-xs font-mono text-slate-500 font-semibold">{selectedAsset.asset_code}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedAsset(null);
                  if (onClearSelectedAsset) onClearSelectedAsset();
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Quick Status Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Trạng thái</span>
                  <div className="font-semibold text-xs mt-0.5 text-[#112D4E]">
                    {ENUMS.ASSET_STATUSES[selectedAsset.status]?.label}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Ưu tiên</span>
                  <div className="font-semibold text-xs mt-0.5 text-[#112D4E]">
                    {ENUMS.PRIORITIES[selectedAsset.priority]?.label}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Đồng hồ đo</span>
                  <div className="font-semibold text-xs font-mono mt-0.5 text-[#112D4E]">
                    {selectedAsset.current_meter} {selectedAsset.meter_unit}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Điểm sức khỏe</span>
                  <div className="font-bold text-xs mt-0.5 text-[#3F72AF]">
                    {selectedAsset.health_score}/100 điểm
                  </div>
                </div>
              </div>

              {/* Technical Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#112D4E] border-b pb-1">
                  Thông số kỹ thuật nhà sản xuất
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">Hãng sản xuất:</span>
                    <p className="font-semibold text-[#112D4E]">{selectedAsset.details?.manufacturer || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Model máy:</span>
                    <p className="font-semibold text-[#112D4E]">{selectedAsset.details?.model || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Số Serial:</span>
                    <p className="font-semibold font-mono text-[#112D4E]">{selectedAsset.details?.serial_number || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Giá mua đầu tư:</span>
                    <p className="font-semibold text-[#112D4E]">{selectedAsset.details?.purchase_price ? `${selectedAsset.details.purchase_price.toLocaleString('vi-VN')} đ` : 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Ngày lắp đặt:</span>
                    <p className="font-semibold text-[#112D4E]">{selectedAsset.installed_date || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Hết hạn bảo hành:</span>
                    <p className="font-semibold text-[#112D4E]">{selectedAsset.warranty_expiry || 'N/A'}</p>
                  </div>
                </div>
                {selectedAsset.details?.description && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {selectedAsset.details.description}
                  </p>
                )}
              </div>

              {/* Real QR Code & Download Section */}
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 shrink-0">
                    <QRCodeCanvas
                      id={`qr-canvas-${selectedAsset.asset_code}`}
                      value={selectedAsset.qr_code_url || `https://risova.vn/qr/${selectedAsset.asset_code}`}
                      size={100}
                      level="H"
                      includeMargin={true}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs font-bold text-[#112D4E] flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-[#3F72AF]" />
                      <span>Tem mã QR: {selectedAsset.asset_code}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Quét bằng Camera hoặc tải ảnh lên để nhận diện nhanh
                    </p>
                    <span className="font-mono text-[11px] text-[#3F72AF] block">
                      {selectedAsset.qr_code_url || `https://risova.vn/qr/${selectedAsset.asset_code}`}
                    </span>

                    <button
                      type="button"
                      onClick={handleDownloadQr}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#3F72AF] hover:bg-[#325d91] text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer mt-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>⬇ Tải ảnh QR (PNG)</span>
                    </button>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                  <button
                    onClick={() => {
                      const nextStatus = selectedAsset.status === 'ACTIVE' ? 'MAINTENANCE' : 'ACTIVE';
                      updateAsset(selectedAsset.id, { status: nextStatus });
                      setSelectedAsset(prev => ({ ...prev, status: nextStatus }));
                    }}
                    className="px-3.5 py-1.5 bg-white border border-slate-200 hover:border-[#3F72AF] text-[#112D4E] rounded-lg text-xs font-semibold shadow-xs transition"
                  >
                    Đổi: {selectedAsset.status === 'ACTIVE' ? 'Bảo trì' : 'Hoạt động'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Asset Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-base font-bold text-[#112D4E]">Thêm thiết bị mới vào hệ thống</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#112D4E] mb-1">Mã thiết bị (*)</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: CNC-03"
                    value={formData.asset_code}
                    onChange={(e) => setFormData({ ...formData, asset_code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#112D4E] mb-1">Tên thiết bị (*)</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Máy tiện CNC Doosan"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#112D4E] mb-1">Khu vực / Phân xưởng</label>
                  <select
                    value={formData.location_id}
                    onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
                  >
                    {data.locations.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name} ({loc.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#112D4E] mb-1">Mức ưu tiên</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
                  >
                    <option value="CRITICAL">Khẩn cấp (CRITICAL)</option>
                    <option value="HIGH">Cao (HIGH)</option>
                    <option value="MEDIUM">Trung bình (MEDIUM)</option>
                    <option value="LOW">Thấp (LOW)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#112D4E] mb-1">Hãng sản xuất</label>
                  <input
                    type="text"
                    placeholder="VD: Atlas Copco, Fanuc"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#112D4E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#112D4E] mb-1">Model máy</label>
                  <input
                    type="text"
                    placeholder="VD: GA-75 VSD+"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#112D4E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#112D4E] mb-1">Mô tả công năng</label>
                <textarea
                  rows="2"
                  placeholder="Ghi chú về vị trí, dây chuyền, công suất..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#112D4E]"
                ></textarea>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#3F72AF] hover:bg-[#325d91] text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer"
                >
                  Lưu thiết bị
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

