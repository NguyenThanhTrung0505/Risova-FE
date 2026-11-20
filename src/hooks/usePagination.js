import { useState } from 'react';

export function usePagination(items, filterKey = '', pageSize = 10) {
  const [selection, setSelection] = useState({ key: filterKey, page: 1 });
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const page = selection.key === filterKey ? Math.min(selection.page, pageCount) : 1;
  return {
    items: items.slice((page - 1) * pageSize, page * pageSize),
    page,
    pageCount,
    total: items.length,
    onPageChange: next => setSelection({ key: filterKey, page: Math.max(1, Math.min(next, pageCount)) })
  };
}

