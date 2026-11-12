import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import {
  MapPin,
  Building,
  Factory,
  Layers,
  Plus,
  ChevronRight,
  FolderTree,
  Boxes,
  X
} from 'lucide-react';

export default function LocationsPage() {
  const { data, ENUMS, createLocation } = useData();
  const [selectedLocId, setSelectedLocId] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    location_type: 'ZONE',
    parent_id: 1,
    description: ''
  });

  // Build tree
  const plant = data.locations.find(l => l.location_type === 'PLANT') || data.locations[0];
  const zones = data.locations.filter(l => l.location_type === 'ZONE');
  const lines = data.locations.filter(l => l.location_type === 'LINE');

  const selectedLoc = data.locations.find(l => l.id === selectedLocId) || plant;

  // Assets inside selected location
  const locAssets = data.assets.filter(a => a.location_id === selectedLoc.id);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      alert('Vui lòng nhập tên và mã địa điểm!');
      return;
    }
    createLocation(formData);
    setShowCreateModal(false);
    setFormData({
      code: '',
      name: '',
      location_type: 'ZONE',
      parent_id: 1,
      description: ''
    });
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-page-title font-bold text-[#112D4E]">
            Địa điểm & Sơ đồ Phân cấp Nhà máy (Locations)
          </h1>
          <p className="text-body text-[#64748B] mt-0.5">
            Cấu trúc 3 cấp chuẩn Enterprise CMMS: Nhà máy (PLANT) → Phân xưởng (ZONE) → Dây chuyền (LINE)
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#3F72AF] hover:bg-[#325d91] text-white rounded-lg font-semibold text-sm shadow-sm transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Thêm địa điểm</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Location Tree Navigation */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#112D4E] pb-2 border-b">
            <FolderTree className="w-4 h-4 text-[#3F72AF]" />
            <span>Cây sơ đồ mặt bằng xưởng</span>
          </div>

          <div className="space-y-2">
            {/* Plant Level */}
            {plant && (
              <div
                onClick={() => setSelectedLocId(plant.id)}
                className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                  selectedLocId === plant.id
                    ? 'bg-blue-50/80 border-[#3F72AF] text-[#3F72AF] font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-[#112D4E]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Factory className="w-5 h-5 text-[#3F72AF]" />
                  <div>
                    <div className="text-xs font-bold">{plant.name}</div>
                    <span className="text-[10px] uppercase font-mono tracking-wider opacity-75">
                      {plant.code} • CẤP NHÀ MÁY
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </div>
            )}

            {/* Zone Level */}
            <div className="pl-4 space-y-2 border-l-2 border-slate-200 ml-3">
              {zones.map(zone => {
                const zoneLines = lines.filter(l => l.parent_id === zone.id);
                const isZoneSelected = selectedLocId === zone.id;

                return (
                  <div key={zone.id} className="space-y-1.5">
                    <div
                      onClick={() => setSelectedLocId(zone.id)}
                      className={`p-2.5 rounded-lg border transition cursor-pointer flex items-center justify-between ${
                        isZoneSelected
                          ? 'bg-sky-50 border-[#3F72AF] text-[#3F72AF] font-bold'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-[#112D4E]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-slate-500" />
                        <div>
                          <div className="text-xs font-semibold">{zone.name}</div>
                          <span className="text-[10px] font-mono text-slate-400">[{zone.code}]</span>
                        </div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                        {data.assets.filter(a => a.location_id === zone.id).length} máy
                      </span>
                    </div>

                    {/* Line Level under Zone */}
                    {zoneLines.length > 0 && (
                      <div className="pl-3 space-y-1 border-l-2 border-sky-100 ml-2">
                        {zoneLines.map(line => {
                          const isLineSelected = selectedLocId === line.id;
                          return (
                            <div
                              key={line.id}
                              onClick={() => setSelectedLocId(line.id)}
                              className={`p-2 rounded-md text-xs transition cursor-pointer flex items-center justify-between ${
                                isLineSelected
                                  ? 'bg-[#3F72AF] text-white font-semibold'
                                  : 'text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                <span>{line.name}</span>
                              </div>
                              <span className="text-[10px] font-mono opacity-80">
                                {data.assets.filter(a => a.location_id === line.id).length} máy
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Location Details & Assets inside */}
        <div className="lg:col-span-2 space-y-5">
          {/* Location Summary Card */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#3F72AF] bg-blue-50 px-2 py-0.5 rounded">
                  {ENUMS.LOCATION_TYPES[selectedLoc.location_type]?.label || selectedLoc.location_type}
                </span>
                <h2 className="text-xl font-bold text-[#112D4E] mt-2">
                  {selectedLoc.name}
                </h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Mã định danh: {selectedLoc.code}
                </p>
              </div>

              <div className="text-right">
                <span className="text-2xl font-bold text-[#3F72AF]">
                  {locAssets.length}
                </span>
                <div className="text-[11px] text-[#64748B]">Thiết bị trực thuộc</div>
              </div>
            </div>

            <p className="text-xs text-slate-600 mt-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
              {selectedLoc.description || 'Chưa có thông tin mô tả chi tiết khu vực này.'}
            </p>
          </div>

          {/* Assets in Location Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
            <h3 className="text-sm font-bold text-[#112D4E] mb-3 flex items-center gap-2">
              <Boxes className="w-4 h-4 text-[#3F72AF]" />
              <span>Danh sách thiết bị lắp đặt tại {selectedLoc.name} ({locAssets.length})</span>
            </h3>

            {locAssets.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-bold uppercase text-[#64748B]">
                      <th className="pb-2.5 pr-4">Mã</th>
                      <th className="pb-2.5 px-4">Tên thiết bị</th>
                      <th className="pb-2.5 px-4">Ưu tiên</th>
                      <th className="pb-2.5 px-4">Trạng thái</th>
                      <th className="pb-2.5 pl-4 text-right">Chỉ số đo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {locAssets.map(asset => {
                      const stat = ENUMS.ASSET_STATUSES[asset.status] || { label: asset.status, color: '#64748B', bg: '#F1F5F9' };
                      const pri = ENUMS.PRIORITIES[asset.priority] || { label: asset.priority, color: '#64748B', bg: '#F1F5F9' };

                      return (
                        <tr key={asset.id} className="hover:bg-slate-50 transition">
                          <td className="py-2.5 pr-4 font-bold font-mono text-[#3F72AF]">
                            {asset.asset_code}
                          </td>
                          <td className="py-2.5 px-4 font-semibold text-[#112D4E]">
                            {asset.name}
                          </td>
                          <td className="py-2.5 px-4">
                            <span style={{ color: pri.color, backgroundColor: pri.bg }} className="px-2 py-0.5 rounded text-[10px] font-bold">
                              {pri.label}
                            </span>
                          </td>
                          <td className="py-2.5 px-4">
                            <span style={{ color: stat.color, backgroundColor: stat.bg }} className="px-2 py-0.5 rounded text-[10px] font-bold">
                              {stat.label}
                            </span>
                          </td>
                          <td className="py-2.5 pl-4 text-right font-mono text-slate-500">
                            {asset.current_meter} {asset.meter_unit}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                Chưa có thiết bị nào được gán vào khu vực này.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Location Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <h3 className="text-base font-bold text-[#112D4E]">Thêm địa điểm / Phân xưởng</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#112D4E] mb-1">Mã địa điểm (*)</label>
                <input
                  type="text"
                  required
                  placeholder="VD: ZONE-D, LINE-03"
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#112D4E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#112D4E] mb-1">Tên địa điểm (*)</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Phân xưởng Sơn & Xử lý bề mặt"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#112D4E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#112D4E] mb-1">Cấp địa điểm</label>
                  <select
                    value={formData.location_type}
                    onChange={e => setFormData({ ...formData, location_type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#112D4E]"
                  >
                    <option value="ZONE">Phân xưởng (ZONE)</option>
                    <option value="LINE">Dây chuyền (LINE)</option>
                    <option value="PLANT">Nhà máy (PLANT)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#112D4E] mb-1">Thuộc cấp trên</label>
                  <select
                    value={formData.parent_id}
                    onChange={e => setFormData({ ...formData, parent_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#112D4E]"
                  >
                    {data.locations.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#112D4E] mb-1">Mô tả vị trí</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Vị trí tòa nhà, diện tích, ghi chú..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#112D4E]"
                ></textarea>
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
                  Lưu địa điểm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

