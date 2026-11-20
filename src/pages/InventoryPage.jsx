import { usePagination } from '../hooks/usePagination';
import { availableStock } from '../utils/inventory';
import { useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, Ellipsis, Package, Pause, Pencil, Play, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useAuth, useData } from '../context/DataContext';
import { canManagePage } from '../constants/permissions';
import Pagination from '../components/Pagination';
import { BulkPartForm, PartEditForm, StockForm } from '../components/InventoryForms';
import OperationsDialog from '../components/OperationsDialog';

const partColumns = ['Mã vật tư', 'Tên vật tư', 'Đơn vị', 'Tồn kho', 'Khả dụng', 'Ngưỡng tối thiểu', 'Đã giữ chỗ', 'Đơn giá', 'Trạng thái'];
const primaryButton = 'inline-flex items-center justify-center gap-2 rounded-md border border-[#3F72AF] bg-[#3F72AF] px-4 py-2 text-sm font-medium text-white hover:bg-[#325d91]';
const secondaryButton = 'inline-flex items-center justify-center gap-2 rounded-md border border-[#DBE2EF] bg-white px-4 py-2 text-sm font-medium text-[#112D4E] hover:bg-slate-50';
const control = 'rounded border border-slate-200 bg-white px-3 py-2 text-[13px] text-[#112D4E]';
const transactions = {
  RECEIPT: { label: 'Nhập kho', color: 'bg-emerald-100 text-emerald-700' },
  RETURN: { label: 'Trả kho', color: 'bg-sky-100 text-sky-700' },
  ISSUE: { label: 'Xuất kho', color: 'bg-red-200 text-red-700' },
  ADJUSTMENT: { label: 'Điều chỉnh', color: 'bg-amber-100 text-amber-700' }
};

function number(value) {
  return Number(value || 0).toLocaleString('vi-VN');
}

function stockStatus(part) {
  if (part.is_active === false) return { id: 'INACTIVE', label: 'Tạm ngừng', color: 'bg-[#DBE2EF] text-slate-600' };
  if (part.is_low_stock || availableStock(part) <= part.min_stock_level) return { id: 'LOW', label: 'Tồn thấp', color: 'bg-red-200 text-red-700' };
  return { id: 'AVAILABLE', label: 'Đủ hàng', color: 'bg-emerald-100 text-emerald-700' };
}

function StatusBadge({ part }) {
  const status = stockStatus(part);
  return <span className={'risova-status-badge ' + status.color}>{status.label}</span>;
}

function Headers({ columns }) {
  return <thead><tr>{columns.map(label => <th key={label} scope="col" className="px-4">{label}</th>)}</tr></thead>;
}

function SearchField({ value, onChange, label }) {
  return <div className="relative min-w-40 flex-1 max-w-[465px]">
    <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
    <input aria-label={label} placeholder="Tìm theo tên, mã,..." value={value} onChange={event => onChange(event.target.value)} className={control + ' w-full pl-11'} />
  </div>;
}

function TransactionHistory({ items, inDetail = false }) {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('ALL');
  const query = search.trim().toLowerCase();
  const filtered = items.filter(item => {
    const searchMatch = [item.part_name, item.part_code, item.wo_code, item.note].join(' ').toLowerCase().includes(query);
    return searchMatch && (type === 'ALL' || item.transaction_type === type);
  });
  const pagination = usePagination(filtered, query + '|' + type);
  const columns = [
    'Mã vật tư',
    ...(!inDetail ? ['Tên vật tư'] : []),
    'Loại giao dịch', 'Tham chiếu', 'Người thực hiện', 'Số lượng', 'Thời gian',
  ];
  return (
    <section className={'risova-data-table operations-transaction-table ' + (inDetail ? '' : 'is-page')}>
      {inDetail && <div className="operations-table-heading"><h2>Lịch sử giao dịch ({items.length})</h2></div>}
      <div className="risova-table-toolbar flex flex-wrap gap-3">
        <SearchField label="Tìm giao dịch kho" value={search} onChange={setSearch} />
        <select aria-label="Loại giao dịch kho" value={type} onChange={event => setType(event.target.value)} className={control}>
          <option value="ALL">Loại giao dịch</option>
          {Object.entries(transactions).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <Headers columns={columns} />
          <tbody>
            {pagination.items.map(transaction => {
              const status = transactions[transaction.transaction_type];
              const created = new Date(transaction.created_at);
              const dateOptions = { timeZone: 'Asia/Ho_Chi_Minh' };
              return (
                <tr key={transaction.id} className="border-b border-slate-100 text-slate-600">
                  <td className="px-4 font-semibold text-[#112D4E]">{transaction.part_code}</td>
                  {!inDetail && <td className="px-4">{transaction.part_name || '—'}</td>}
                  <td className="px-4"><span className={'risova-status-badge ' + (status?.color || 'bg-slate-100 text-slate-600')}>{status?.label || transaction.transaction_type}</span></td>
                  <td className="px-4 max-w-64 truncate" title={transaction.note}>{transaction.wo_code || transaction.note || '—'}</td>
                  <td className="px-4">{transaction.performed_by_name || 'Thủ kho'}</td>
                  <td className="px-4">{number(transaction.quantity)}</td>
                  <td className="px-4">
                    <time dateTime={transaction.created_at}>{created.toLocaleDateString('sv-SE', dateOptions)}<br />{created.toLocaleTimeString('vi-VN', dateOptions)}</time>
                  </td>
                </tr>
              );
            })}
            {!pagination.total && <tr><td colSpan={columns.length} className="text-center text-slate-500">Chưa có giao dịch phù hợp.</td></tr>}
          </tbody>
        </table>
      </div>
      <Pagination {...pagination} />
    </section>
  );
}

function InventoryDetail({ part, history, canManage, onOpenModal, onToggleActive }) {
  const [showActions, setShowActions] = useState(false);
  const cards = [
    ['Tồn kho', number(part.quantity_in_stock), part.unit],
    ['Đã giữ chỗ', number(part.reserved_quantity), part.unit],
    ['Khả dụng', number(availableStock(part)), part.unit],
    ['Ngưỡng tối thiểu', number(part.min_stock_level), part.unit],
    ['Đơn giá', number(part.unit_price) + ' đ', ''],
  ];
  return (
    <>
      <header className="operations-detail-heading">
        <div className="flex items-center gap-4">
          <span className="grid size-[52px] shrink-0 place-items-center rounded-md bg-[#DBE2EF] text-[#3F72AF]"><Package size={28} /></span>
          <div><h1>{part.name} ({part.part_code})</h1><div className="mt-1"><StatusBadge part={part} /></div></div>
        </div>
        {canManage && (
          <div className="operations-detail-actions">
            <button type="button" className={secondaryButton} onClick={() => onOpenModal('EDIT')}><Pencil size={16} /> Chỉnh sửa</button>
            <button type="button" className={secondaryButton + ' disabled:opacity-50'} onClick={() => onOpenModal('ISSUE')} disabled={part.is_active === false}><ArrowUpFromLine size={17} /> Xuất kho</button>
            <button type="button" className={primaryButton + ' disabled:opacity-50'} onClick={() => onOpenModal('RECEIPT')} disabled={part.is_active === false}><ArrowDownToLine size={17} /> Nhập kho</button>
            <div className="relative" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setShowActions(false); }}>
              <button type="button" className={secondaryButton + ' !px-3'} aria-label="Thao tác vật tư" aria-expanded={showActions} onClick={() => setShowActions(previous => !previous)}>
                <Ellipsis size={19} />
              </button>
              {showActions && (
                <div className="risova-popover absolute right-0 top-full mt-2 w-52 p-2">
                  <button type="button" className="risova-menu-item" onClick={() => { setShowActions(false); onToggleActive(); }}>
                    {part.is_active === false ? <Play size={16} /> : <Pause size={16} />}
                    {part.is_active === false ? 'Tiếp tục sử dụng' : 'Tạm ngừng'}
                  </button>
                  <button type="button" className="risova-menu-item is-danger" onClick={() => { setShowActions(false); onOpenModal('DELETE'); }}><Trash2 size={16} /> Xóa</button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
      <section className="rounded-xl border border-slate-200 bg-white px-7 pt-5 pb-7">
        <h2 className="mb-3 text-base font-semibold text-[#112D4E]">Thông tin tồn kho</h2>
        <dl className="operations-stock-cards mb-0">
          {cards.map(([label, value, unit]) => <div key={label}><dt>{label}</dt><dd className="mb-0">{value}</dd><small>{unit}</small></div>)}
        </dl>
      </section>
      <TransactionHistory key={part.id} items={history} inDetail />
    </>
  );
}

export default function InventoryPage() {
  const { currentUser } = useAuth();
  const { data, createSparePart, updateSparePart, adjustStock } = useData();
  const [params, setParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [modal, setModal] = useState(null);
  const canManage = canManagePage(currentUser?.role, 'inventory');
  const showTransactions = params.get('view') === 'transactions';
  const availableParts = data.spare_parts.filter(part => !part.is_archived);
  const selectedPart = availableParts.find(part => String(part.id) === params.get('part'));
  const allTransactions = data.inventory_transactions || [];
  const partTransactions = selectedPart ? allTransactions.filter(transaction => transaction.part_id === selectedPart.id) : [];
  const query = searchTerm.trim().toLowerCase();
  const filteredParts = availableParts.filter(part =>
    [part.part_code, part.name].join(' ').toLowerCase().includes(query) &&
    (statusFilter === 'ALL' || stockStatus(part).id === statusFilter)
  );
  const pagination = usePagination(filteredParts, [query, statusFilter].join('|'));
  const summary = [
    ['Tổng giá trị tồn kho', number(availableParts.reduce((sum, part) => sum + Number(part.quantity_in_stock || 0) * Number(part.unit_price || 0), 0)) + ' đ'],
    ['Tổng mã vật tư', availableParts.length],
    ['Dưới mức tối thiểu', availableParts.filter(part => stockStatus(part).id === 'LOW').length, 'text-red-500'],
  ];

  function openPart(part) {
    setParams({ part: String(part.id) });
    window.scrollTo(0, 0);
  }

  function showList(viewHistory = false) {
    setSearchTerm('');
    setModal(null);
    setParams(viewHistory ? { view: 'transactions' } : {});
    window.scrollTo(0, 0);
  }

  function saveStock({ type, quantity, note }) {
    if (adjustStock(selectedPart.id, quantity, note, type, currentUser)) setModal(null);
  }

  return (
    <div className="risova-page space-y-6">
      {selectedPart ? (
        <InventoryDetail
          key={selectedPart.id}
          part={selectedPart}
          history={partTransactions}
          canManage={canManage}
          onOpenModal={setModal}
          onToggleActive={() => updateSparePart(selectedPart.id, { is_active: selectedPart.is_active === false }, currentUser)}
        />
      ) : (
        <>
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1>{showTransactions ? 'Giao dịch kho' : 'Kho phụ tùng và vật tư'}</h1>
              <p className="text-slate-500">
                {showTransactions ? 'Lịch sử nhập, xuất, hoàn trả và điều chỉnh tồn kho.' : 'Theo dõi tồn kho, mức khả dụng, dự trữ và lịch sử giao dịch.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {showTransactions ? (
                <button type="button" className={primaryButton + ' min-w-32'} onClick={() => showList()}>Quay lại</button>
              ) : (
                <>
                  <button type="button" className="inline-flex items-center gap-2 bg-white px-4 py-2 text-[#112D4E] hover:bg-slate-50" onClick={() => showList(true)}><RefreshCw size={16} /> Giao dịch kho</button>
                  {canManage && <button type="button" className={primaryButton} onClick={() => setModal('CREATE')}><Plus size={16} /> Thêm vật tư</button>}
                </>
              )}
            </div>
          </header>
          {showTransactions ? <TransactionHistory items={allTransactions} /> : (
            <>
              <dl className="mb-0 grid max-w-[970px] grid-cols-2 gap-5 sm:grid-cols-3">
                {summary.map(([label, value, tone]) => (
                  <div key={label} className="rounded-xl border border-slate-200 bg-white px-6 py-4">
                    <dt className="text-xs font-normal text-slate-500">{label}</dt>
                    <dd className={'mt-2 mb-0 text-xl font-bold ' + (tone || 'text-[#112D4E]')}>{value}</dd>
                  </div>
                ))}
              </dl>
              <section className="risova-data-table operations-parts-table">
                <div className="risova-table-toolbar flex flex-wrap gap-3">
                  <SearchField label="Tìm vật tư" value={searchTerm} onChange={setSearchTerm} />
                  <select aria-label="Trạng thái tồn kho" value={statusFilter} onChange={event => setStatusFilter(event.target.value)} className={control}>
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="AVAILABLE">Đủ hàng</option>
                    <option value="LOW">Tồn thấp</option>
                    <option value="INACTIVE">Tạm ngừng</option>
                  </select>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left whitespace-nowrap">
                    <Headers columns={partColumns} />
                    <tbody>
                      {pagination.items.map(part => (
                        <tr key={part.id} className="cursor-pointer border-b border-slate-100 text-slate-600" onClick={() => openPart(part)}>
                          <td className="px-4">
                            <button type="button" className="font-semibold text-[#112D4E] hover:text-[#3F72AF]" onClick={event => { event.stopPropagation(); openPart(part); }}>{part.part_code}</button>
                          </td>
                          <td className="px-4">{part.name}</td>
                          <td className="px-4">{part.unit}</td>
                          <td className="px-4">{number(part.quantity_in_stock)}</td>
                          <td className="px-4">{number(availableStock(part))}</td>
                          <td className="px-4">{number(part.min_stock_level)}</td>
                          <td className="px-4">{number(part.reserved_quantity)}</td>
                          <td className="px-4">{number(part.unit_price)} đ</td>
                          <td className="px-4"><StatusBadge part={part} /></td>
                        </tr>
                      ))}
                      {!pagination.total && <tr><td colSpan={partColumns.length} className="text-center text-slate-500">Không tìm thấy vật tư phù hợp.</td></tr>}
                    </tbody>
                  </table>
                </div>
                <Pagination {...pagination} />
              </section>
            </>
          )}
        </>
      )}
      {canManage && modal === 'CREATE' && !selectedPart && (
        <BulkPartForm parts={data.spare_parts} onClose={() => setModal(null)} onSave={parts => { createSparePart(parts, currentUser); setModal(null); }} />
      )}
      {canManage && modal === 'EDIT' && selectedPart && (
        <PartEditForm part={selectedPart} onClose={() => setModal(null)} onSave={updates => {
          if (updateSparePart(selectedPart.id, updates, currentUser)) setModal(null);
        }} />
      )}
      {canManage && selectedPart && selectedPart.is_active !== false && ['RECEIPT', 'ISSUE'].includes(modal) && (
        <StockForm part={selectedPart} type={modal} onClose={() => setModal(null)} onSave={saveStock} />
      )}
      {canManage && selectedPart && modal === 'DELETE' && (
        <OperationsDialog title="Xóa vật tư" width={470} position="middle" onClose={() => setModal(null)}>
          <p>Xóa {selectedPart.name} khỏi danh mục vật tư?</p>
          <div className="operations-dialog-actions">
            <button type="button" onClick={() => setModal(null)}>Hủy</button>
            <button type="button" className="is-danger" onClick={() => {
              if (updateSparePart(selectedPart.id, { is_archived: true, is_active: false }, currentUser)) showList();
            }}>Xóa</button>
          </div>
        </OperationsDialog>
      )}
    </div>
  );
}

