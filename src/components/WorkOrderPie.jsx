import { useState } from 'react';

export default function WorkOrderPie({ orders, onSelectSlice }) {
  const [hoveredLabel, setHoveredLabel] = useState(null);

  const slices = [
    { label: 'Đã giao', count: orders.filter(order => order.status === 'ASSIGNED').length, color: '#5075aa' },
    { label: 'Mới mở', count: orders.filter(order => order.status === 'OPEN').length, color: '#4285f4' },
    { label: 'Đã hoàn thành', count: orders.filter(order => ['COMPLETED', 'CLOSED'].includes(order.status)).length, color: '#60b58b' },
    { label: 'Đang thực hiện', count: orders.filter(order => ['IN_PROGRESS', 'ON_HOLD'].includes(order.status)).length, color: '#e7a638' }
  ];
  const total = slices.reduce((sum, slice) => sum + slice.count, 0);
  const point = (angle, radius) => ({ x: 220 + Math.cos(angle) * radius, y: 132 + Math.sin(angle) * radius });

  if (!total) return <div className="risova-empty-state">Chưa có lệnh việc để thống kê.</div>;

  let angle = -Math.PI * 0.8;
  const computed = slices
    .filter(slice => slice.count > 0)
    .map(slice => {
      const start = angle;
      const sweep = (slice.count / total) * Math.PI * 2;
      const midAngle = start + sweep / 2;
      angle += sweep;
      const a = point(start, 94);
      const b = point(angle, 94);
      const countPos = point(midAngle, 58);
      const labelPos = point(midAngle, 113);
      const d = ['M', 220, 132, 'L', a.x, a.y, 'A', 94, 94, 0, sweep > Math.PI ? 1 : 0, 1, b.x, b.y, 'Z'].join(' ');
      const canNudge = sweep < Math.PI * 1.99;
      return {
        ...slice,
        percent: Math.round((slice.count / total) * 100),
        d,
        countPos,
        labelPos,
        nudgeX: canNudge ? Math.cos(midAngle) * 7 : 0,
        nudgeY: canNudge ? Math.sin(midAngle) * 7 : 0,
      };
    });

  const activeSlice = computed.find(slice => slice.label === hoveredLabel) || null;

  return (
    <div className="risova-pie-wrap">
      <svg className="risova-pie-chart" viewBox="0 0 460 270" role="img" aria-label={'Phân bố ' + total + ' lệnh việc theo trạng thái'}>
        {computed.map(slice => {
          const isActive = slice.label === hoveredLabel;
          const isDimmed = Boolean(hoveredLabel) && !isActive;
          return (
            <g
              key={slice.label}
              className={'risova-pie-slice' + (isActive ? ' is-active' : '')}
              style={{
                transform: isActive ? `translate(${slice.nudgeX}px, ${slice.nudgeY}px)` : 'translate(0px, 0px)',
                opacity: isDimmed ? 0.72 : 1,
                cursor: onSelectSlice ? 'pointer' : 'default',
              }}
              onMouseEnter={() => setHoveredLabel(slice.label)}
              onMouseLeave={() => setHoveredLabel(null)}
              onClick={() => onSelectSlice?.(slice)}
            >
              <title>{`${slice.label}: ${slice.count} phiếu (${slice.percent}%)`}</title>
              {slice.count === total ? <circle cx="220" cy="132" r="94" fill={slice.color} /> : <path d={slice.d} fill={slice.color} />}
              <text x={slice.countPos.x} y={slice.countPos.y} dy="0.35em" textAnchor="middle" fill="white" fontSize="13" fontWeight="500">{slice.count}</text>
              <text
                x={slice.labelPos.x}
                y={slice.labelPos.y}
                dy="0.35em"
                textAnchor={Math.abs(slice.labelPos.x - 220) < 20 ? 'middle' : slice.labelPos.x > 220 ? 'start' : 'end'}
                fill={slice.color}
                fontSize="12"
                fontWeight={isActive ? '700' : '400'}
              >
                {slice.label}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="risova-pie-readout" aria-live="polite">
        {activeSlice ? (
          <span className="risova-pie-readout-pill">
            <span className="risova-pie-readout-dot" style={{ background: activeSlice.color }} />
            <strong>{activeSlice.label}:</strong> {activeSlice.count} phiếu ({activeSlice.percent}%)
          </span>
        ) : (
          <span className="risova-pie-hint">Di chuột vào từng phần để xem tỷ lệ</span>
        )}
      </div>
    </div>
  );
}
