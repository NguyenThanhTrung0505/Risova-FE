export const meterUnits = { HOURS: 'Giờ', CYCLES: 'Chu kỳ', KM: 'Km' };

export function equipmentDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('vi-VN');
}
