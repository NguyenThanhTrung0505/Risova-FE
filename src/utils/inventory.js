export function availableStock(part) {
  return Math.max(0, Number(part.quantity_in_stock || 0) - Number(part.reserved_quantity || 0));
}

