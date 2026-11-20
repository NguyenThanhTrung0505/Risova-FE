import { ChevronLeft, ChevronRight } from 'lucide-react';


export default function Pagination({ page, pageCount, total, onPageChange }) {
  const pages = [...new Set([1, page - 1, page, page + 1, pageCount])].filter(value => value > 0 && value <= pageCount).sort((a, b) => a - b);
  return <div className="risova-pagination">
    <span aria-live="polite">Trang {page}/{pageCount}<span className="hidden sm:inline"> · {total} kết quả</span></span>
    <nav className="risova-pagination-actions" aria-label="Phân trang">
      <button aria-label="Trang trước" disabled={page === 1} onClick={() => onPageChange(page - 1)}><ChevronLeft size={15} /></button>
      {pages.map((value, index) => <span className="inline-flex items-center gap-1" key={value}>
        {index > 0 && value - pages[index - 1] > 1 && <span aria-hidden="true" className="px-1">…</span>}
        <button aria-label={'Trang ' + value} aria-current={page === value ? 'page' : undefined} onClick={() => onPageChange(value)}>{value}</button>
      </span>)}
      <button aria-label="Trang tiếp" disabled={page === pageCount} onClick={() => onPageChange(page + 1)}><ChevronRight size={15} /></button>
    </nav>
  </div>;
}
