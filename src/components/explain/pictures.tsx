import { useRef, type KeyboardEvent, type PointerEvent } from 'react';
import type { Series, PairStats, Pairs } from '../../explain/math';
import { num, signed } from '../../explain/format';

type Bounds = { min: number; max: number };
const clamp = (v: number, b: Bounds) => Math.min(b.max, Math.max(b.min, Math.round(v)));

/** SVG-Koordinaten aus einem Zeigerereignis. */
function svgPoint(svg: SVGSVGElement, e: PointerEvent) {
  const pt = svg.createSVGPoint();
  pt.x = e.clientX; pt.y = e.clientY;
  const m = svg.getScreenCTM();
  return m ? pt.matrixTransform(m.inverse()) : { x: 0, y: 0 };
}

function stepKey(e: KeyboardEvent, b: Bounds, value: number): number | null {
  if (e.key === 'ArrowRight' || e.key === 'ArrowUp') return clamp(value + 1, b);
  if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') return clamp(value - 1, b);
  if (e.key === 'Home') return b.min;
  if (e.key === 'End') return b.max;
  return null;
}

/** Zahlenstrahl mit einer Zeile je Person (Werkstätten Mittel und Streuung). */
export function NumberLine({ values, s, step, kind, who, names, bounds, onChange, onWho }: {
  values: number[]; s: Series; step: number; kind: 'mittel' | 'streuung'; who: number; names: readonly string[]; bounds: Bounds;
  onChange: (v: number[]) => void; onWho: (i: number) => void;
}) {
  const svg = useRef<SVGSVGElement>(null), drag = useRef<number | null>(null);
  const X = (v: number) => 50 + (v - bounds.min) / (bounds.max - bounds.min) * 540, Y = (i: number) => 30 + i * 28, AXIS = 178;
  const set = (i: number, v: number) => { if (v !== values[i]) onChange(values.map((x, k) => k === i ? v : x)); };
  const move = (e: PointerEvent<SVGSVGElement>) => {
    if (drag.current === null || !svg.current) return;
    set(drag.current, clamp((svgPoint(svg.current, e).x - 50) / 540 * (bounds.max - bounds.min) + bounds.min, bounds));
  };
  const m = s.mean, band = kind === 'streuung' && step >= 6 && s.sd > 0;
  return (
    <svg ref={svg} className="xw-svg xw-drag" viewBox="0 0 640 214" role="group" aria-label="Zahlenstrahl mit den fünf Beispielpersonen"
      onPointerMove={move} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}>
      {band && <g>
        <rect className="xw-band" x={Math.max(40, X(m - s.sd))} y={18} width={Math.min(600, X(m + s.sd)) - Math.max(40, X(m - s.sd))} height={150} />
        <text className="xw-t" x={Math.max(40, X(m - s.sd))} y={172} textAnchor="middle">x̄ − s</text>
        <text className="xw-t" x={Math.min(600, X(m + s.sd))} y={172} textAnchor="middle">x̄ + s</text>
      </g>}
      {values.map((_, i) => <g key={`row${i}`}><line className="xw-guide" x1={40} x2={600} y1={Y(i)} y2={Y(i)} /><text className="xw-t" x={16} y={Y(i) + 4}>{names[i]}</text></g>)}
      <line className="xw-mean" x1={X(m)} x2={X(m)} y1={16} y2={AXIS} />
      <text className="xw-t" x={X(m)} y={11} textAnchor="middle">x̄ = {num(m)}</text>
      {step >= 2 && s.dev.map((d, i) => Math.abs(d) > 1e-9 && <g key={`dev${i}`}>
        <line className={d > 0 ? 'xw-pos' : 'xw-neg'} strokeWidth={i === who ? 4.5 : 3} x1={X(m)} x2={X(values[i])} y1={Y(i)} y2={Y(i)} />
        <text className="xw-t" x={(X(m) + X(values[i])) / 2} y={Y(i) - 6} textAnchor="middle">{signed(d)}</text>
      </g>)}
      <line className="xw-axis" x1={50} x2={590} y1={AXIS} y2={AXIS} />
      {Array.from({ length: bounds.max - bounds.min + 1 }, (_, k) => bounds.min + k).map(v => <g key={`tick${v}`}>
        <line className="xw-axis" x1={X(v)} x2={X(v)} y1={AXIS - 4} y2={AXIS + 4} /><text className="xw-t" x={X(v)} y={208} textAnchor="middle">{v}</text>
      </g>)}
      {kind === 'mittel' && step >= 2 && <polygon className="xw-fulcrum" points={`${X(m)},${AXIS + 2} ${X(m) - 9},${AXIS + 16} ${X(m) + 9},${AXIS + 16}`} />}
      {values.map((v, i) => (
        <g key={`dot${i}`} className={`xw-dot${i === who ? ' sel' : ''}`} tabIndex={0} role="slider"
          aria-label={`Person ${names[i]}`} aria-valuemin={bounds.min} aria-valuemax={bounds.max} aria-valuenow={v}
          onPointerDown={e => { drag.current = i; onWho(i); svg.current?.setPointerCapture(e.pointerId); }}
          onKeyDown={e => { const next = stepKey(e, bounds, v); if (next !== null) { e.preventDefault(); onWho(i); set(i, next); } }}>
          <circle cx={X(v)} cy={Y(i)} r={i === who ? 13 : 11} />
          <text x={X(v)} y={Y(i) + 4} textAnchor="middle">{v}</text>
        </g>
      ))}
    </svg>
  );
}

/** Quadrate der Abweichungen, Quadratsumme, typisches Quadrat und seine Seite s. */
export function Squares({ s, step, who, names }: { s: Series; step: number; who: number; names: readonly string[] }) {
  const k = 18, base = 150;
  let x = 40;
  const parts = s.dev.map((d, i) => {
    const side = Math.abs(d) * k, at = x;
    x += side < 1 ? 26 : side + 14;
    if (side < 1) return <g key={i}><text className="xw-t" x={at + 6} y={base} textAnchor="middle">0</text><text className="xw-t" x={at + 6} y={base + 16} textAnchor="middle">{names[i]}</text></g>;
    const grid = [];
    for (let j = 1; j * k < side - 0.5; j++) grid.push(<g key={j}><line className="xw-grid" x1={at + j * k} x2={at + j * k} y1={base - side} y2={base} /><line className="xw-grid" x1={at} x2={at + side} y1={base - j * k} y2={base - j * k} /></g>);
    return <g key={i}>
      <rect className={`xw-square${i === who ? ' sel' : ''}`} x={at} y={base - side} width={side} height={side} />
      {grid}
      {side >= 30 && <text className="xw-t xw-strong" x={at + side / 2} y={base - side / 2 + 5} textAnchor="middle">{num(s.sq[i])}</text>}
      <text className="xw-t" x={at + side / 2} y={base + 16} textAnchor="middle">{names[i]}</text>
    </g>;
  });
  const tx = Math.max(x + 30, 470), side = s.sd * k;
  return (
    <svg className="xw-svg" viewBox="0 0 640 206" role="img" aria-label={`Abweichungsquadrate mit den Flächen ${s.sq.map(q => num(q)).join(', ')}`}>
      {parts}
      {step >= 4 && <g><line className="xw-axis" x1={40} x2={x - 14} y1={base + 24} y2={base + 24} /><text className="xw-t xw-strong" x={(40 + x - 14) / 2} y={base + 42} textAnchor="middle">Quadratsumme {num(s.ss)}</text></g>}
      {step >= 5 && side > 0 && <g>
        <rect className="xw-square xw-typical" x={tx} y={base - side} width={side} height={side} />
        <text className="xw-t" x={tx + side / 2} y={base - side - 8} textAnchor="middle">{num(s.ss)} / 4 = {num(s.variance)}</text>
        <text className="xw-t" x={tx + side / 2} y={base + 42} textAnchor="middle">typisches Quadrat</text>
        {step >= 6 && <g><line className="xw-side" x1={tx} x2={tx + side} y1={base} y2={base} /><text className="xw-t xw-strong" x={tx + side / 2} y={base + 18} textAnchor="middle">s ≈ {num(s.sd)}</text></g>}
      </g>}
    </svg>
  );
}

/** Streudiagramm mit Achsenkreuz, Abweichungsrechtecken und Vergleich mit sₓ · sᵧ. */
export function Rectangles({ data, s, step, who, names, bounds, onChange, onWho }: {
  data: Pairs; s: PairStats; step: number; who: number; names: readonly string[]; bounds: Bounds;
  onChange: (d: Pairs) => void; onWho: (i: number) => void;
}) {
  const svg = useRef<SVGSVGElement>(null), drag = useRef<number | null>(null);
  const u = 300 / (bounds.max - bounds.min), X = (v: number) => 50 + (v - bounds.min) * u, Y = (v: number) => 330 - (v - bounds.min) * u;
  const mx = s.x.mean, my = s.y.mean;
  const set = (i: number, x: number, y: number) => {
    if (x === data.x[i] && y === data.y[i]) return;
    onChange({ x: data.x.map((v, k) => k === i ? x : v), y: data.y.map((v, k) => k === i ? y : v) });
  };
  const move = (e: PointerEvent<SVGSVGElement>) => {
    if (drag.current === null || !svg.current) return;
    const p = svgPoint(svg.current, e);
    set(drag.current, clamp((p.x - 50) / u + bounds.min, bounds), clamp((330 - p.y) / u + bounds.min, bounds));
  };
  const key = (e: KeyboardEvent, i: number) => {
    const x = data.x[i], y = data.y[i];
    const next = e.key === 'ArrowRight' ? [x + 1, y] : e.key === 'ArrowLeft' ? [x - 1, y] : e.key === 'ArrowUp' ? [x, y + 1] : e.key === 'ArrowDown' ? [x, y - 1] : null;
    if (!next) return;
    e.preventDefault(); onWho(i); set(i, clamp(next[0], bounds), clamp(next[1], bounds));
  };
  const ticks = Array.from({ length: bounds.max - bounds.min + 1 }, (_, k) => bounds.min + k);
  const scale = Math.max(1, s.pos, -s.neg), bar = (v: number) => Math.abs(v) / scale * 200;
  const typical = Math.sqrt(Math.abs(s.cov)) * u, maxSide = Math.sqrt(s.sxy) * u;
  return (
    <svg ref={svg} className="xw-svg xw-drag" viewBox="0 0 640 372" role="group" aria-label="Streudiagramm mit den fünf Beispielpersonen"
      onPointerMove={move} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}>
      {ticks.map(t => <g key={`t${t}`}>
        <line className="xw-guide" x1={X(t)} x2={X(t)} y1={Y(bounds.max)} y2={Y(bounds.min)} />
        <line className="xw-guide" x1={X(bounds.min)} x2={X(bounds.max)} y1={Y(t)} y2={Y(t)} />
        <text className="xw-t" x={X(t)} y={346} textAnchor="middle">{t}</text>
        <text className="xw-t" x={36} y={Y(t) + 4} textAnchor="end">{t}</text>
      </g>)}
      <text className="xw-t" x={200} y={366} textAnchor="middle">Vertrauen in den Bundestag (x)</text>
      <text className="xw-t" x={12} y={180} textAnchor="middle" transform="rotate(-90 12 180)">Bundesregierung (y)</text>
      {step >= 3 && data.x.map((x, i) => Math.abs(s.prod[i]) > 1e-9 && (
        <rect key={`r${i}`} className={`${s.prod[i] > 0 ? 'xw-rect-pos' : 'xw-rect-neg'}${i === who ? ' sel' : ''}`}
          x={Math.min(X(x), X(mx))} y={Math.min(Y(data.y[i]), Y(my))} width={Math.abs(X(x) - X(mx))} height={Math.abs(Y(data.y[i]) - Y(my))} />
      ))}
      <line className="xw-mean" x1={X(mx)} x2={X(mx)} y1={Y(bounds.max)} y2={Y(bounds.min)} />
      <line className="xw-mean" x1={X(bounds.min)} x2={X(bounds.max)} y1={Y(my)} y2={Y(my)} />
      <text className="xw-t" x={X(mx)} y={Y(bounds.max) - 6} textAnchor="middle">x̄ = {num(mx)}</text>
      <text className="xw-t" x={X(bounds.max) + 4} y={Y(my) + 4}>ȳ = {num(my)}</text>
      {step >= 3 && <g>
        <text className="xw-t xw-pos-t" x={X(bounds.max) - 8} y={Y(bounds.max) + 16} textAnchor="end">beide darüber: +</text>
        <text className="xw-t xw-pos-t" x={X(bounds.min) + 8} y={Y(bounds.min) - 8}>beide darunter: +</text>
      </g>}
      {step >= 2 && data.x.map((x, i) => <g key={`d${i}`} className={i === who ? 'xw-devs sel' : 'xw-devs'}>
        <line x1={X(x)} x2={X(mx)} y1={Y(data.y[i])} y2={Y(data.y[i])} />
        <line x1={X(x)} x2={X(x)} y1={Y(data.y[i])} y2={Y(my)} />
      </g>)}
      {step >= 3 && data.x.map((x, i) => Math.abs(s.prod[i]) > 1e-9 && Math.abs(X(x) - X(mx)) > 24 && Math.abs(Y(data.y[i]) - Y(my)) > 18 &&
        <text key={`a${i}`} className="xw-t xw-strong" x={(X(x) + X(mx)) / 2} y={(Y(data.y[i]) + Y(my)) / 2 + 4} textAnchor="middle">{signed(s.prod[i])}</text>)}
      {data.x.map((x, i) => (
        <g key={`p${i}`} className={`xw-dot${i === who ? ' sel' : ''}`} tabIndex={0} role="slider"
          aria-label={`Person ${names[i]}`} aria-valuetext={`Bundestag ${x}, Bundesregierung ${data.y[i]}`} aria-valuemin={bounds.min} aria-valuemax={bounds.max} aria-valuenow={x}
          onPointerDown={e => { drag.current = i; onWho(i); svg.current?.setPointerCapture(e.pointerId); }} onKeyDown={e => key(e, i)}>
          <circle cx={X(x)} cy={Y(data.y[i])} r={i === who ? 13 : 11} />
          <text x={X(x)} y={Y(data.y[i]) + 4} textAnchor="middle">{names[i]}</text>
        </g>
      ))}
      {step >= 4 && <g>
        <text className="xw-t xw-strong" x={400} y={30}>Plus- und Minusflächen</text>
        <rect className="xw-rect-pos" x={400} y={42} width={Math.max(2, bar(s.pos))} height={16} /><text className="xw-t" x={404 + bar(s.pos)} y={55}>plus {num(s.pos)}</text>
        <rect className="xw-rect-neg" x={400} y={64} width={Math.max(2, bar(s.neg))} height={16} /><text className="xw-t" x={404 + bar(s.neg)} y={77}>minus {num(s.neg)}</text>
        <text className="xw-t xw-strong" x={400} y={100}>Summe {num(s.cp)}</text>
      </g>}
      {step >= 5 && <g>
        {step >= 6 && maxSide > 0 && <rect className="xw-max" x={420} y={330 - maxSide} width={maxSide} height={maxSide} />}
        {typical > 0 && <rect className={s.cov >= 0 ? 'xw-rect-pos' : 'xw-rect-neg'} x={420} y={330 - typical} width={typical} height={typical} />}
        <text className="xw-t" x={420} y={Math.min(330 - Math.max(typical, step >= 6 ? maxSide : 0), 320) - 8}>{num(s.cp)} / 4 = {num(s.cov)}</text>
        <text className="xw-t" x={420} y={346}>{step >= 6 ? (s.r === null ? 'r nicht definiert' : `${num(s.cov)} von höchstens ${num(s.sxy)}: r = ${num(s.r)}`) : 'typisches Rechteck'}</text>
      </g>}
    </svg>
  );
}
