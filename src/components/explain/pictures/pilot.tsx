import { useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode, type RefObject } from 'react';
import type { Series, PairStats, Pairs } from '../../explain/math';
import { num, signed } from '../../explain/format';

type Bounds = { min: number; max: number };
const clamp = (v: number, b: Bounds) => Math.min(b.max, Math.max(b.min, Math.round(v)));

/**
 * Misst die verfügbare Breite, damit die Zeichnungen in Bildschirmpixeln gezeichnet werden:
 * Schrift und Punkte bleiben so auch im schmalen Inspector und auf dem Telefon lesbar.
 */
function useWidth(fallback = 640): [RefObject<HTMLDivElement | null>, number] {
  const ref = useRef<HTMLDivElement>(null), [width, setWidth] = useState(fallback);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => setWidth(Math.max(300, Math.min(640, Math.round(el.clientWidth || fallback))));
    read();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(read);
    observer.observe(el);
    return () => observer.disconnect();
  }, [fallback]);
  return [ref, width];
}

/** Ziehen per Zeiger: Erfassung beim Drücken, Ende bei Loslassen, Abbruch oder Verlust der Erfassung. */
function useDrag(onMove: (i: number, p: { x: number; y: number }) => void) {
  const svg = useRef<SVGSVGElement>(null), drag = useRef<number | null>(null);
  const point = (e: PointerEvent) => {
    const s = svg.current!, pt = s.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const m = s.getScreenCTM();
    return m ? pt.matrixTransform(m.inverse()) : pt;
  };
  const end = () => { drag.current = null; };
  return {
    svg,
    start: (i: number, e: PointerEvent) => { drag.current = i; svg.current?.setPointerCapture(e.pointerId); },
    handlers: {
      onPointerMove: (e: PointerEvent<SVGSVGElement>) => { if (drag.current !== null && svg.current) onMove(drag.current, point(e)); },
      onPointerUp: end, onPointerCancel: end, onLostPointerCapture: end,
    },
  };
}

function Dot({ x, y, label, selected, children, bounds, valueNow, valueText, describedBy, roleDescription, onPointerDown, onKeyDown }: {
  x: number; y: number; label: string; selected: boolean; children: ReactNode; bounds: Bounds; valueNow: number;
  valueText?: string; describedBy?: string; roleDescription?: string;
  onPointerDown: (e: PointerEvent) => void; onKeyDown: (e: KeyboardEvent) => void;
}) {
  return (
    <g className={`xw-dot${selected ? ' sel' : ''}`} tabIndex={0} role="slider" aria-label={label}
      aria-valuemin={bounds.min} aria-valuemax={bounds.max} aria-valuenow={valueNow} aria-valuetext={valueText}
      aria-describedby={describedBy} aria-roledescription={roleDescription} onPointerDown={onPointerDown} onKeyDown={onKeyDown}>
      <circle className="xw-hit" cx={x} cy={y} r={20} />
      <circle cx={x} cy={y} r={selected ? 13 : 11} />
      <text x={x} y={y + 4} textAnchor="middle">{children}</text>
    </g>
  );
}

/** Zahlenstrahl mit einer Zeile je Person (Werkstätten Mittel und Streuung). */
export function NumberLine({ values, s, step, kind, who, names, bounds, onChange, onWho }: {
  values: number[]; s: Series; step: number; kind: 'mittel' | 'streuung'; who: number; names: readonly string[]; bounds: Bounds;
  onChange: (v: number[]) => void; onWho: (i: number) => void;
}) {
  const [box, W] = useWidth();
  const left = 44, right = W - 26, X = (v: number) => left + (v - bounds.min) / (bounds.max - bounds.min) * (right - left), Y = (i: number) => 32 + i * 28, AXIS = 178;
  const set = (i: number, v: number) => { if (v !== values[i]) onChange(values.map((x, k) => k === i ? v : x)); };
  const { svg, start, handlers } = useDrag((i, p) => set(i, clamp((p.x - left) / (right - left) * (bounds.max - bounds.min) + bounds.min, bounds)));
  const m = s.mean, band = kind === 'streuung' && step >= 6 && s.sd > 0;
  const lo = Math.max(left - 8, X(m - s.sd)), hi = Math.min(right + 8, X(m + s.sd));
  return (
    <div ref={box}>
      <svg ref={svg} className="xw-svg xw-drag" width={W} height={214} viewBox={`0 0 ${W} 214`} role="group" aria-label="Zahlenstrahl mit den fünf Beispielpersonen" {...handlers}>
        {band && <g>
          <rect className="xw-band" x={lo} y={18} width={hi - lo} height={150} />
          <text className="xw-t" x={lo} y={172} textAnchor="middle">x̄ − s</text>
          <text className="xw-t" x={hi} y={172} textAnchor="middle">x̄ + s</text>
        </g>}
        {values.map((_, i) => <g key={`row${i}`}><line className="xw-guide" x1={left - 10} x2={right + 10} y1={Y(i)} y2={Y(i)} /><text className="xw-t" x={10} y={Y(i) + 4}>{names[i]}</text></g>)}
        <line className="xw-mean" x1={X(m)} x2={X(m)} y1={16} y2={AXIS} />
        <text className="xw-t" x={X(m)} y={11} textAnchor="middle">x̄ = {num(m)}</text>
        {step >= 2 && s.dev.map((d, i) => Math.abs(d) > 1e-9 && <g key={`dev${i}`}>
          <line className={d > 0 ? 'xw-pos' : 'xw-neg'} strokeWidth={i === who ? 4.5 : 3} x1={X(m)} x2={X(values[i])} y1={Y(i)} y2={Y(i)} />
          <text className="xw-t" x={(X(m) + X(values[i])) / 2} y={Y(i) - 6} textAnchor="middle">{signed(d)}</text>
        </g>)}
        <line className="xw-axis" x1={left} x2={right} y1={AXIS} y2={AXIS} />
        {Array.from({ length: bounds.max - bounds.min + 1 }, (_, k) => bounds.min + k).map(v => <g key={`tick${v}`}>
          <line className="xw-axis" x1={X(v)} x2={X(v)} y1={AXIS - 4} y2={AXIS + 4} /><text className="xw-t" x={X(v)} y={208} textAnchor="middle">{v}</text>
        </g>)}
        {kind === 'mittel' && step >= 2 && <polygon className="xw-fulcrum" points={`${X(m)},${AXIS + 2} ${X(m) - 9},${AXIS + 16} ${X(m) + 9},${AXIS + 16}`} />}
        {values.map((v, i) => (
          <Dot key={`dot${i}`} x={X(v)} y={Y(i)} label={`Person ${names[i]}`} selected={i === who} valueNow={v} bounds={bounds}
            onPointerDown={e => { onWho(i); start(i, e); }}
            onKeyDown={e => {
              const next = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? clamp(v + 1, bounds) : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? clamp(v - 1, bounds)
                : e.key === 'Home' ? bounds.min : e.key === 'End' ? bounds.max : null;
              if (next !== null) { e.preventDefault(); onWho(i); set(i, next); }
            }}>{v}</Dot>
        ))}
      </svg>
    </div>
  );
}

/** Quadrate der Abweichungen, Quadratsumme, typisches Quadrat und seine Seite s. */
export function Squares({ s, step, who, names }: { s: Series; step: number; who: number; names: readonly string[] }) {
  const [box, W] = useWidth();
  const sumSides = s.dev.reduce((a, d) => a + Math.abs(d), 0);
  const k = Math.min(18, Math.max(6, (W - 150) / Math.max(1, sumSides + s.sd)));
  const tallest = Math.max(s.sd, ...s.dev.map(Math.abs)) * k, base = tallest + 34, H = base + 52;
  let x = 30;
  const parts = s.dev.map((d, i) => {
    const side = Math.abs(d) * k, at = x;
    x += side < 1 ? 26 : side + 12;
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
  const side = s.sd * k, tx = Math.min(W - side - 16, Math.max(x + 24, W - side - 70));
  // Beschriftungen am typischen Quadrat nicht über den Rand schieben.
  const cx = Math.min(W - 62, Math.max(62, tx + side / 2));
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Abweichungsquadrate mit den Flächen ${s.sq.map(q => num(q)).join(', ')}`}>
        {parts}
        {step >= 4 && <g><line className="xw-axis" x1={30} x2={x - 12} y1={base + 24} y2={base + 24} /><text className="xw-t xw-strong" x={(30 + x - 12) / 2} y={base + 42} textAnchor="middle">Quadratsumme {num(s.ss)}</text></g>}
        {step >= 5 && side > 0 && <g>
          <rect className="xw-square xw-typical" x={tx} y={base - side} width={side} height={side} />
          <text className="xw-t" x={cx} y={base - side - 8} textAnchor="middle">{num(s.ss)} / 4 = {num(s.variance)}</text>
          <text className="xw-t" x={cx} y={base + 42} textAnchor="middle">typisches Quadrat</text>
          {step >= 6 && <g><line className="xw-side" x1={tx} x2={tx + side} y1={base} y2={base} /><text className="xw-t xw-strong" x={cx} y={base + 18} textAnchor="middle">s ≈ {num(s.sd)}</text></g>}
        </g>}
      </svg>
    </div>
  );
}

/** Streudiagramm mit Achsenkreuz, Abweichungsrechtecken und Vergleich mit dem Rechteck sₓ × sᵧ. */
export function Rectangles({ data, s, step, who, names, bounds, onChange, onWho }: {
  data: Pairs; s: PairStats; step: number; who: number; names: readonly string[]; bounds: Bounds;
  onChange: (d: Pairs) => void; onWho: (i: number) => void;
}) {
  const [box, W] = useWidth();
  const wide = W >= 560, plot = wide ? 300 : W - 72, L = 50, T = 36, B = T + plot;
  const u = plot / (bounds.max - bounds.min), X = (v: number) => L + (v - bounds.min) * u, Y = (v: number) => B - (v - bounds.min) * u;
  const px = wide ? 410 : 20, py = wide ? T : B + 62;
  const mx = s.x.mean, my = s.y.mean;
  const set = (i: number, x: number, y: number) => {
    if (x === data.x[i] && y === data.y[i]) return;
    onChange({ x: data.x.map((v, k) => k === i ? x : v), y: data.y.map((v, k) => k === i ? y : v) });
  };
  const { svg, start, handlers } = useDrag((i, p) => set(i, clamp((p.x - L) / u + bounds.min, bounds), clamp((B - p.y) / u + bounds.min, bounds)));
  const key = (e: KeyboardEvent, i: number) => {
    const x = data.x[i], y = data.y[i];
    const next = e.key === 'ArrowRight' ? [x + 1, y] : e.key === 'ArrowLeft' ? [x - 1, y] : e.key === 'ArrowUp' ? [x, y + 1] : e.key === 'ArrowDown' ? [x, y - 1] : null;
    if (!next) return;
    e.preventDefault(); onWho(i); set(i, clamp(next[0], bounds), clamp(next[1], bounds));
  };
  const ticks = Array.from({ length: bounds.max - bounds.min + 1 }, (_, k) => bounds.min + k);
  const barMax = wide ? 120 : W - 190, scale = Math.max(1, s.pos, -s.neg), bar = (v: number) => Math.abs(v) / scale * barMax;
  // Durchschnittliches Rechteck mit dem Seitenverhältnis sₓ : sᵧ; seine Fläche ist |sₓᵧ|, die des äußeren sₓ · sᵧ.
  const ratio = s.x.sd > 0 && s.y.sd > 0 ? Math.sqrt(Math.abs(s.cov) / s.sxy) : 0;
  const outerW = s.x.sd * u, outerH = s.y.sd * u, innerW = outerW * ratio, innerH = outerH * ratio;
  // Unter dem Waagebalken (endet bei py + 76) Platz für das größtmögliche Rechteck lassen.
  const base = wide ? B - 10 : py + 110 + outerH, H = wide ? B + 48 : (step >= 4 ? base + 30 : B + 44);
  return (
    <div ref={box}>
      <svg ref={svg} className="xw-svg xw-drag" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="group" aria-label="Streudiagramm mit den fünf Beispielpersonen" {...handlers}>
        <desc id="xw-rect-help">Pfeiltasten links und rechts ändern das Vertrauen in den Bundestag, oben und unten das Vertrauen in die Bundesregierung.</desc>
        {ticks.map(t => <g key={`t${t}`}>
          <line className="xw-guide" x1={X(t)} x2={X(t)} y1={Y(bounds.max)} y2={Y(bounds.min)} />
          <line className="xw-guide" x1={X(bounds.min)} x2={X(bounds.max)} y1={Y(t)} y2={Y(t)} />
          <text className="xw-t" x={X(t)} y={B + 16} textAnchor="middle">{t}</text>
          <text className="xw-t" x={L - 10} y={Y(t) + 4} textAnchor="end">{t}</text>
        </g>)}
        <text className="xw-t" x={L + plot / 2} y={B + 34} textAnchor="middle">Vertrauen in den Bundestag (x)</text>
        <text className="xw-t" x={12} y={T + plot / 2} textAnchor="middle" transform={`rotate(-90 12 ${T + plot / 2})`}>Bundesregierung (y)</text>
        {step >= 3 && data.x.map((x, i) => Math.abs(s.prod[i]) > 1e-9 && (
          <rect key={`r${i}`} className={`${s.prod[i] > 0 ? 'xw-rect-pos' : 'xw-rect-neg'}${i === who ? ' sel' : ''}`}
            x={Math.min(X(x), X(mx))} y={Math.min(Y(data.y[i]), Y(my))} width={Math.abs(X(x) - X(mx))} height={Math.abs(Y(data.y[i]) - Y(my))} />
        ))}
        <line className="xw-mean" x1={X(mx)} x2={X(mx)} y1={Y(bounds.max)} y2={Y(bounds.min)} />
        <line className="xw-mean" x1={X(bounds.min)} x2={X(bounds.max)} y1={Y(my)} y2={Y(my)} />
        <text className="xw-t" x={X(mx)} y={T - 18} textAnchor="middle">x̄ = {num(mx)}</text>
        <text className="xw-t" x={X(bounds.max) - 4} y={Y(my) - 5} textAnchor="end">ȳ = {num(my)}</text>
        <text className="xw-t xw-pos-t" x={X(bounds.max) - 6} y={T + 14} textAnchor="end">beide über dem Durchschnitt{step >= 3 ? ': +' : ''}</text>
        <text className="xw-t xw-pos-t" x={X(bounds.min) + 6} y={B - 6}>beide darunter{step >= 3 ? ': +' : ''}</text>
        {step >= 3 && <g>
          <text className="xw-t xw-neg-t" x={X(bounds.min) + 6} y={T + 14}>−</text>
          <text className="xw-t xw-neg-t" x={X(bounds.max) - 6} y={B - 6} textAnchor="end">−</text>
        </g>}
        {step >= 2 && data.x.map((x, i) => <g key={`d${i}`} className={i === who ? 'xw-devs sel' : 'xw-devs'}>
          <line x1={X(x)} x2={X(mx)} y1={Y(data.y[i])} y2={Y(data.y[i])} />
          <line x1={X(x)} x2={X(x)} y1={Y(data.y[i])} y2={Y(my)} />
        </g>)}
        {step === 2 && (() => {
          const i = who, x = data.x[i], y = data.y[i];
          return <g>
            {Math.abs(s.x.dev[i]) > 1e-9 && <text className="xw-t xw-strong" x={(X(x) + X(mx)) / 2} y={Y(y) + (s.y.dev[i] >= 0 ? -8 : 16)} textAnchor="middle">{signed(s.x.dev[i])}</text>}
            {Math.abs(s.y.dev[i]) > 1e-9 && <text className="xw-t xw-strong" x={X(x) + (s.x.dev[i] >= 0 ? 8 : -8)} y={(Y(y) + Y(my)) / 2 + 4} textAnchor={s.x.dev[i] >= 0 ? 'start' : 'end'}>{signed(s.y.dev[i])}</text>}
          </g>;
        })()}
        {step >= 3 && data.x.map((x, i) => {
          if (Math.abs(s.prod[i]) < 1e-9) return null;
          const big = Math.abs(X(x) - X(mx)) > 26 && Math.abs(Y(data.y[i]) - Y(my)) > 18;
          return <text key={`a${i}`} className="xw-t xw-strong" x={(X(x) + X(mx)) / 2} y={(Y(data.y[i]) + Y(my)) / 2 + 4} textAnchor="middle">{big ? signed(s.prod[i]) : s.prod[i] > 0 ? '+' : '−'}</text>;
        })}
        {data.x.map((x, i) => (
          <Dot key={`p${i}`} x={X(x)} y={Y(data.y[i])} label={`Person ${names[i]}`} selected={i === who} valueNow={x} bounds={bounds}
            valueText={`Bundestag ${x}, Bundesregierung ${data.y[i]}`} describedBy="xw-rect-help" roleDescription="verschiebbarer Punkt"
            onPointerDown={e => { onWho(i); start(i, e); }} onKeyDown={e => key(e, i)}>{names[i]}</Dot>
        ))}
        {step >= 4 && <g>
          <text className="xw-t xw-strong" x={px} y={py + 6}>Plus- und Minusflächen</text>
          <rect className="xw-rect-pos" x={px} y={py + 16} width={Math.max(2, bar(s.pos))} height={16} /><text className="xw-t" x={px + 6 + bar(s.pos)} y={py + 29}>Plusflächen {num(s.pos)}</text>
          <rect className="xw-rect-neg" x={px} y={py + 38} width={Math.max(2, bar(s.neg))} height={16} /><text className="xw-t" x={px + 6 + bar(s.neg)} y={py + 51}>Minusflächen {num(s.neg)}</text>
          <text className="xw-t xw-strong" x={px} y={py + 76}>verrechnet {num(s.cp)}</text>
        </g>}
        {step >= 5 && <g>
          {step >= 6 && outerW > 0 && outerH > 0 && <rect className="xw-max" x={px + 10} y={base - outerH} width={outerW} height={outerH} />}
          {innerW > 0 && <rect className={s.cov >= 0 ? 'xw-rect-pos' : 'xw-rect-neg'} x={px + 10} y={base - innerH} width={innerW} height={innerH} />}
          <text className="xw-t" x={px + 10} y={base - Math.max(innerH, step >= 6 ? outerH : 0) - 8}>{num(s.cp)} / 4 = {num(s.cov)}</text>
          <text className="xw-t" x={px + 10} y={base + 18}>{step >= 6 ? (s.r === null ? 'r nicht definiert' : `${num(s.cov)} von höchstens ${num(s.sxy)}: r ≈ ${num(s.r)}`) : 'durchschnittliche Fläche'}</text>
        </g>}
      </svg>
    </div>
  );
}
