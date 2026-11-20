export const equipmentFieldClass = 'w-full min-w-0 rounded-md border border-[#DBE2EF] bg-white px-3 py-2 text-[13px] text-[#112D4E]';

export function EquipmentField({ label, children, span = false }) {
  return (
    <label className={`block min-w-0 ${span ? 'sm:col-span-2' : ''}`}>
      <span className="mb-1.5 block text-[13px] font-medium text-[#112D4E]">{label}</span>
      {children}
    </label>
  );
}

export function EquipmentBadge({ status, fallback, className = '' }) {
  return (
    <span className={`risova-status-badge ${className}`} style={{ color: status?.color, backgroundColor: status?.bg }}>
      {status?.label || fallback}
    </span>
  );
}

export function EquipmentHealth({ score }) {
  const percentage = Number.isFinite(Number(score)) ? Math.min(100, Math.max(0, Number(score))) : 0;
  return (
    <div className="equipment-health" aria-label={`Sức khỏe ${percentage}%`}>
      <span aria-hidden="true"><i style={{ width: `${percentage}%` }} /></span>
      <span>{percentage}%</span>
    </div>
  );
}

