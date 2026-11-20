/**
 * Pure transparent SVG generators for technical blueprint gears
 * matching the Risova login background composition.
 */

const STROKE = '#a8cdef';
const STROKE_SOFT = '#8cb6de';
const FILL_SOFT = 'rgba(154, 198, 236, 0.22)';

function buildGearPath({
  cx,
  cy,
  teeth = 12,
  outerR = 140,
  rootR = 114,
  toothTopRatio = 0.26,
  toothRootRatio = 0.44,
  rotationDeg = 0,
}) {
  const step = (Math.PI * 2) / teeth;
  const offset = (rotationDeg * Math.PI) / 180;
  const pts = [];

  for (let i = 0; i < teeth; i += 1) {
    const base = i * step - Math.PI / 2 + offset;
    const a1 = base - step * (toothRootRatio * 0.5);
    const a2 = base - step * (toothTopRatio * 0.5);
    const a3 = base + step * (toothTopRatio * 0.5);
    const a4 = base + step * (toothRootRatio * 0.5);

    pts.push(
      [cx + rootR * Math.cos(a1), cy + rootR * Math.sin(a1)],
      [cx + outerR * Math.cos(a2), cy + outerR * Math.sin(a2)],
      [cx + outerR * Math.cos(a3), cy + outerR * Math.sin(a3)],
      [cx + rootR * Math.cos(a4), cy + rootR * Math.sin(a4)]
    );
  }

  return (
    pts
      .map(
        ([x, y], idx) =>
          `${idx === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
      )
      .join(' ') + ' Z'
  );
}

function buildRadialCircles({ cx, cy, count, orbitR, holeR, strokeWidth = 2.2, opacity = 0.9 }) {
  let out = '';
  for (let i = 0; i < count; i += 1) {
    const angle = (i * Math.PI * 2) / count - Math.PI / 2;
    const x = (cx + orbitR * Math.cos(angle)).toFixed(2);
    const y = (cy + orbitR * Math.sin(angle)).toFixed(2);
    out += `<circle cx="${x}" cy="${y}" r="${holeR}" fill="none" stroke="${STROKE}" stroke-width="${strokeWidth}" opacity="${opacity}" />`;
  }
  return out;
}

/** Large hollow outline gear (mid-side) */
function renderHollowOutlineGear({ cx, cy, scale = 1, rotationDeg = 8 }) {
  const outerR = 112 * scale;
  const rootR = 90 * scale;
  const path = buildGearPath({
    cx,
    cy,
    teeth: 12,
    outerR,
    rootR,
    toothTopRatio: 0.25,
    toothRootRatio: 0.42,
    rotationDeg,
  });

  return `<g>
    <path d="${path}" fill="none" stroke="${STROKE}" stroke-width="${(2.3 * scale).toFixed(2)}" stroke-linejoin="round" />
    <circle cx="${cx}" cy="${cy}" r="${(73 * scale).toFixed(2)}" fill="none" stroke="${STROKE}" stroke-width="${(2.1 * scale).toFixed(2)}" />
    <circle cx="${cx}" cy="${cy}" r="${(62 * scale).toFixed(2)}" fill="none" stroke="${STROKE_SOFT}" stroke-width="${(1.8 * scale).toFixed(2)}" opacity="0.85" />
  </g>`;
}

/** Large perforated technical gear with circular lightening holes */
function renderPerforatedGear({ cx, cy, scale = 1, rotationDeg = 0 }) {
  const outerR = 138 * scale;
  const rootR = 118 * scale;
  const path = buildGearPath({
    cx,
    cy,
    teeth: 18,
    outerR,
    rootR,
    toothTopRatio: 0.24,
    toothRootRatio: 0.42,
    rotationDeg,
  });
  const holes = buildRadialCircles({
    cx,
    cy,
    count: 8,
    orbitR: 88 * scale,
    holeR: 13.5 * scale,
    strokeWidth: (2.1 * scale).toFixed(2),
  });

  return `<g>
    <path d="${path}" fill="none" stroke="${STROKE}" stroke-width="${(2.4 * scale).toFixed(2)}" stroke-linejoin="round" />
    <circle cx="${cx}" cy="${cy}" r="${(109 * scale).toFixed(2)}" fill="none" stroke="${STROKE_SOFT}" stroke-width="${(1.8 * scale).toFixed(2)}" opacity="0.82" />
    ${holes}
    <circle cx="${cx}" cy="${cy}" r="${(58 * scale).toFixed(2)}" fill="none" stroke="${STROKE}" stroke-width="${(2.2 * scale).toFixed(2)}" />
    <circle cx="${cx}" cy="${cy}" r="${(45 * scale).toFixed(2)}" fill="none" stroke="${STROKE_SOFT}" stroke-width="${(1.8 * scale).toFixed(2)}" opacity="0.85" />
    <circle cx="${cx}" cy="${cy}" r="${(20 * scale).toFixed(2)}" fill="none" stroke="${STROKE_SOFT}" stroke-width="${(1.6 * scale).toFixed(2)}" opacity="0.7" />
  </g>`;
}

/** Small enclosed gear with outer blueprint circle, axle, and 4 inner detail holes */
function renderMiniDetailedGear({ cx, cy, scale = 1, rotationDeg = 15 }) {
  const outerR = 54 * scale;
  const rootR = 42 * scale;
  const path = buildGearPath({
    cx,
    cy,
    teeth: 12,
    outerR,
    rootR,
    toothTopRatio: 0.3,
    toothRootRatio: 0.46,
    rotationDeg,
  });
  const holes = buildRadialCircles({
    cx,
    cy,
    count: 4,
    orbitR: 25 * scale,
    holeR: 5.2 * scale,
    strokeWidth: (1.9 * scale).toFixed(2),
  });

  return `<g>
    <circle cx="${cx}" cy="${cy}" r="${(78 * scale).toFixed(2)}" fill="none" stroke="${STROKE}" stroke-width="${(2.0 * scale).toFixed(2)}" opacity="0.82" />
    <path d="${path}" fill="${FILL_SOFT}" stroke="${STROKE}" stroke-width="${(2.2 * scale).toFixed(2)}" stroke-linejoin="round" />
    <circle cx="${cx}" cy="${cy}" r="${(34 * scale).toFixed(2)}" fill="none" stroke="${STROKE}" stroke-width="${(2.0 * scale).toFixed(2)}" />
    ${holes}
    <circle cx="${cx}" cy="${cy}" r="${(12 * scale).toFixed(2)}" fill="none" stroke="${STROKE}" stroke-width="${(2.2 * scale).toFixed(2)}" />
    <circle cx="${cx}" cy="${cy}" r="${(4 * scale).toFixed(2)}" fill="${STROKE}" opacity="0.8" />
  </g>`;
}

/** Thick blueprint gear with concentric hub & bolt details (bottom corners & inner bottom) */
function renderSolidHubGear({ cx, cy, scale = 1, rotationDeg = 0 }) {
  const outerR = 132 * scale;
  const rootR = 102 * scale;
  const path = buildGearPath({
    cx,
    cy,
    teeth: 12,
    outerR,
    rootR,
    toothTopRatio: 0.32,
    toothRootRatio: 0.48,
    rotationDeg,
  });
  const bolts = buildRadialCircles({
    cx,
    cy,
    count: 4,
    orbitR: 62 * scale,
    holeR: 7.5 * scale,
    strokeWidth: (2.2 * scale).toFixed(2),
  });

  return `<g>
    <path d="${path}" fill="${FILL_SOFT}" stroke="${STROKE}" stroke-width="${(2.6 * scale).toFixed(2)}" stroke-linejoin="round" />
    <circle cx="${cx}" cy="${cy}" r="${(84 * scale).toFixed(2)}" fill="none" stroke="${STROKE}" stroke-width="${(2.4 * scale).toFixed(2)}" />
    ${bolts}
    <circle cx="${cx}" cy="${cy}" r="${(40 * scale).toFixed(2)}" fill="none" stroke="${STROKE}" stroke-width="${(2.4 * scale).toFixed(2)}" />
    <circle cx="${cx}" cy="${cy}" r="${(18 * scale).toFixed(2)}" fill="none" stroke="${STROKE_SOFT}" stroke-width="${(2.0 * scale).toFixed(2)}" opacity="0.85" />
  </g>`;
}

function wrapSvg(body, width = 560, height = 560, mirrored = false) {
  const inner = mirrored
    ? `<g transform="translate(${width}, 0) scale(-1, 1)">${body}</g>`
    : body;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" fill="none">${inner}</svg>`;
}

export function svgToDataUrl(svgString) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
}

// Upper-side cluster: outer edge perforated gear + small enclosed detailed gear + mid hollow outline gear
const upperSideBody = [
  renderPerforatedGear({ cx: -12, cy: 175, scale: 1.02, rotationDeg: 5 }),
  renderMiniDetailedGear({ cx: 205, cy: 170, scale: 1.0, rotationDeg: 14 }),
  renderHollowOutlineGear({ cx: 192, cy: 405, scale: 1.06, rotationDeg: 10 }),
].join('');

// Bottom cluster: huge corner solid gear + bottom perforated gear + inner-bottom small solid gear
const bottomCornerBody = [
  renderSolidHubGear({ cx: 8, cy: 448, scale: 1.28, rotationDeg: 12 }),
  renderPerforatedGear({ cx: 274, cy: 452, scale: 1.04, rotationDeg: 3 }),
  renderSolidHubGear({ cx: 472, cy: 476, scale: 0.66, rotationDeg: 18 }),
].join('');

export const AUTH_GEAR_CLUSTERS = {
  leftUpper: svgToDataUrl(wrapSvg(upperSideBody, 560, 560, false)),
  rightUpper: svgToDataUrl(wrapSvg(upperSideBody, 560, 560, true)),
  leftBottom: svgToDataUrl(wrapSvg(bottomCornerBody, 580, 520, false)),
  rightBottom: svgToDataUrl(wrapSvg(bottomCornerBody, 580, 520, true)),
};
