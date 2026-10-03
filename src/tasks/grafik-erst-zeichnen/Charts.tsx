import { memo, useRef, type KeyboardEvent, type PointerEvent } from 'react';
import { de } from '../kit/numbers';
import { SKETCH_CODES } from './content';
import type { BarsView, BoxView, HistView, PointsView, Truth, View } from './domain';

const INK = '#242822', MUTED = '#62695e', GREEN = '#1a4d3e', RED = '#8b2e2e', BAR = '#5b7c6f';
/** Neutrale Farben für Gruppen; geordnete Kategorien bekommen eine Skala mit Reihenfolge (zufrieden grün, unzufrieden rot). */
const NOMINAL = ['#5b7c6f', '#c9a05a', '#6f7f94', '#a38b6d', '#9aa3b0'];
const ORDERED = ['#1a4d3e', '#5b8c6f', '#a9c4a0', '#e6cfa8', '#c98b6a', '#8b2e2e'];
const colorsFor = (n: number, ordered: boolean) => Array.from({ length: n }, (_, i) => ordered && n <= ORDERED.length
  ? ORDERED[Math.round(i * (ORDERED.length - 1) / Math.max(n - 1, 1))]
  : NOMINAL[i % NOMINAL.length]);
const fmt = (x: number) => Math.round(x).toLocaleString('de-DE');

/* ---------- Teil 1 · Skizze ---------- */

const SK = { W: 560, H: 230, left: 12, right: 12, top: 12, bottom: 34 };
const skCol = (SK.W - SK.left - SK.right) / SKETCH_CODES.length;
const skPlot = SK.H - SK.top - SK.bottom;

/** Zeichenfeld: Balken mit Maus oder Finger hochziehen; mit Tab und Pfeiltasten geht es auch. */
export function SketchPad({ heights, onChange, disabled }: { heights: number[]; onChange: (next: number[]) => void; disabled: boolean }) {
  const ref = useRef<SVGSVGElement>(null);
  const last = useRef<{ col: number; value: number } | null>(null);
  // Während eines Zuges kommen Ereignisse schneller, als React neu zeichnet: Der Zwischenstand lebt hier.
  const draft = useRef(heights);
  const setFrom = (e: PointerEvent<SVGSVGElement>, fresh: boolean) => {
    const box = ref.current?.getBoundingClientRect();
    if (!box || disabled) return;
    const x = (e.clientX - box.left) / box.width * SK.W, y = (e.clientY - box.top) / box.height * SK.H;
    const col = Math.min(SKETCH_CODES.length - 1, Math.max(0, Math.floor((x - SK.left) / skCol)));
    const value = Math.round(Math.min(100, Math.max(0, (SK.H - SK.bottom - y) / skPlot * 100)));
    // Schnelle Bewegungen überspringen Spalten: dazwischen gerade verbinden.
    const from = fresh || !last.current ? { col, value } : last.current;
    const base = fresh ? heights : draft.current, next = [...base];
    const lo = Math.min(from.col, col), hi = Math.max(from.col, col);
    for (let c = lo; c <= hi; c++) next[c] = hi === lo ? value : Math.round(from.value + (value - from.value) * (c - from.col) / (col - from.col));
    last.current = { col, value };
    draft.current = next;
    if (next.some((h, i) => h !== base[i])) onChange(next);
  };
  const key = (col: number) => (e: KeyboardEvent<SVGRectElement>) => {
    const steps: Record<string, number> = { ArrowUp: 5, ArrowRight: 5, ArrowDown: -5, ArrowLeft: -5, PageUp: 20, PageDown: -20 };
    let value = heights[col];
    if (e.key in steps) value += steps[e.key];
    else if (e.key === 'Home') value = 0;
    else if (e.key === 'End') value = 100;
    else return;
    e.preventDefault();
    onChange(heights.map((h, i) => (i === col ? Math.min(100, Math.max(0, value)) : h)));
  };
  return <svg ref={ref} viewBox={`0 0 ${SK.W} ${SK.H}`} className={`grafik-pad${disabled ? ' locked' : ''}`}
    role="group" aria-label="Zeichenfeld: Lebenszufriedenheit von 0 bis 10"
    onPointerDown={e => { if (disabled) return; e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); setFrom(e, true); }}
    onPointerMove={e => { if (e.buttons && !disabled) { e.preventDefault(); setFrom(e, false); } }}
    onPointerUp={e => { if (last.current && !disabled) setFrom(e, false); last.current = null; }}>
    <line x1={SK.left} x2={SK.W - SK.right} y1={SK.H - SK.bottom} y2={SK.H - SK.bottom} stroke={INK} />
    {SKETCH_CODES.map((code, i) => {
      const h = heights[i] / 100 * skPlot, x = SK.left + i * skCol;
      return <g key={code}>
        <rect x={x + 4} y={SK.top} width={skCol - 8} height={skPlot} fill={disabled ? 'transparent' : '#f4f5ee'} rx={3} className="grafik-pad-col"
          tabIndex={disabled ? -1 : 0} role="slider" aria-label={`Wert ${code}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={heights[i]}
          aria-readonly={disabled || undefined} onKeyDown={disabled ? undefined : key(i)} />
        <rect x={x + 6} y={SK.H - SK.bottom - h} width={skCol - 12} height={h} fill={disabled ? '#9aa79c' : BAR} rx={2} pointerEvents="none" />
        <text x={x + skCol / 2} y={SK.H - 12} textAnchor="middle">{code}</text>
      </g>;
    })}
    {heights.every(h => h === 0) && <text x={SK.W / 2} y={SK.top + skPlot / 2} textAnchor="middle" className="hint" pointerEvents="none">Balken mit Maus oder Finger hochziehen</text>}
  </svg>;
}

/** Nach dem Aufdecken: echte Verteilung als Balken, die eigene Skizze als gestrichelter Umriss, beides in Prozent. */
export function SketchOverlay({ truth, sketch }: { truth: Truth; sketch: number[] | null }) {
  const max = Math.max(...truth.shares, ...(sketch ?? [0]), 0.01);
  const y = (share: number) => SK.H - SK.bottom - share / (max * 1.12) * skPlot;
  const label = SKETCH_CODES.map((c, i) => `${c}: ${de(truth.shares[i] * 100, 0)} %${sketch ? ` (Skizze ${de(sketch[i] * 100, 0)} %)` : ''}`).join(', ');
  return <figure className="grafik-figure">
    <svg viewBox={`0 0 ${SK.W} ${SK.H}`} role="img" aria-label={`Lebenszufriedenheit, Anteile der Befragten. ${label}`}>
      <line x1={SK.left} x2={SK.W - SK.right} y1={SK.H - SK.bottom} y2={SK.H - SK.bottom} stroke={INK} />
      {SKETCH_CODES.map((code, i) => {
        const x = SK.left + i * skCol;
        return <g key={code}>
          <rect x={x + 6} y={y(truth.shares[i])} width={skCol - 12} height={SK.H - SK.bottom - y(truth.shares[i])} fill={GREEN} opacity={0.85} rx={2} />
          {sketch && <rect x={x + 3} y={y(sketch[i])} width={skCol - 6} height={SK.H - SK.bottom - y(sketch[i])} fill="none" stroke={RED} strokeWidth={2} strokeDasharray="5 3" />}
          <text x={x + skCol / 2} y={y(truth.shares[i]) - 5} textAnchor="middle" className="value">{de(truth.shares[i] * 100, 0)}</text>
          <text x={x + skCol / 2} y={SK.H - 12} textAnchor="middle">{code}</text>
        </g>;
      })}
    </svg>
    <figcaption><span><i style={{ background: GREEN }} aria-hidden="true" />ALLBUS 2023 (Prozent der Befragten)</span><span><i className="dashed" aria-hidden="true" />deine Skizze</span></figcaption>
  </figure>;
}

/* ---------- Teil 2 · Silhouetten ---------- */

export function Silhouette({ bars, label }: { bars: number[]; label: string }) {
  const W = 240, H = 90, max = Math.max(...bars, 1), w = W / Math.max(bars.length, 1);
  return <svg viewBox={`0 0 ${W} ${H}`} className="grafik-silhouette" role="img" aria-label={`${label}: ${bars.length} Balken ohne Beschriftung`}>
    {bars.map((b, i) => <rect key={i} x={i * w + (bars.length > 20 ? 0.15 : 3)} y={H - 2 - b / max * (H - 8)} width={Math.max(0.6, w - (bars.length > 20 ? 0.3 : 6))} height={b / max * (H - 8)} fill={INK} />)}
    <line x1={0} x2={W} y1={H - 1.5} y2={H - 1.5} stroke={MUTED} />
  </svg>;
}

/* ---------- Teil 3 · Bauplan ---------- */

const P = { W: 600, H: 300, left: 66, right: 14, top: 14, bottom: 58 };
const pw = P.W - P.left - P.right, ph = P.H - P.top - P.bottom;
const short = (s: string, n = 14) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

function Legend({ groups, colors, name }: { groups: string[]; colors: string[]; name: string }) {
  if (groups.length < 2) return null;
  return <figcaption><strong>{name}:</strong>{groups.map((g, i) => <span key={g}><i style={{ background: colors[i] }} aria-hidden="true" />{g}</span>)}</figcaption>;
}

function Axes({ yMax, yLabel, percent }: { yMax: number; yLabel: string; percent?: boolean }) {
  const ticks = [0, 0.5, 1].map(f => f * yMax);
  return <g>
    <line x1={P.left} x2={P.left} y1={P.top} y2={P.top + ph} stroke={INK} />
    <line x1={P.left} x2={P.left + pw} y1={P.top + ph} y2={P.top + ph} stroke={INK} />
    {ticks.map(t => <g key={t}>
      <line x1={P.left - 4} x2={P.left} y1={P.top + ph - t / yMax * ph} y2={P.top + ph - t / yMax * ph} stroke={INK} />
      <text x={P.left - 7} y={P.top + ph - t / yMax * ph + 4} textAnchor="end">{percent ? `${Math.round(t * 100)} %` : fmt(t)}</text>
    </g>)}
    <text x={12} y={P.top + ph / 2} transform={`rotate(-90 12 ${P.top + ph / 2})`} textAnchor="middle">{yLabel}</text>
  </g>;
}

function Bars({ v }: { v: BarsView }) {
  const colors = v.groups.length > 1 ? colorsFor(v.groups.length, v.ordered) : [BAR];
  const totals = v.counts.map(r => r.reduce((a, b) => a + b, 0));
  const yMax = v.position === 'fill' ? 1 : v.position === 'dodge' ? Math.max(...v.counts.flat(), 1) : Math.max(...totals, 1);
  const slot = pw / v.categories.length, bw = Math.min(70, slot * 0.8);
  const many = v.categories.length > 12;
  return <>
    <svg viewBox={`0 0 ${P.W} ${P.H}`} role="img" aria-label={`Balken: ${v.categories.map((c, i) => `${c} ${fmt(totals[i])}`).join(', ')}`}>
      <Axes yMax={yMax} yLabel={v.position === 'fill' ? 'Anteil' : 'Anzahl'} percent={v.position === 'fill'} />
      {v.counts.map((row, ci) => {
        const x0 = P.left + ci * slot + (slot - bw) / 2;
        let acc = 0;
        // ggplot2 stapelt die erste Kategorie oben.
        const order = row.map((_, gi) => gi).reverse();
        return <g key={ci}>
          {v.position === 'dodge'
            ? row.map((c, gi) => { const w = bw / row.length, h = c / yMax * ph; return <rect key={gi} x={x0 + gi * w} y={P.top + ph - h} width={Math.max(0.5, w - 1)} height={h} fill={colors[gi]} />; })
            : order.map(gi => {
              const value = v.position === 'fill' ? row[gi] / Math.max(totals[ci], 1) : row[gi], h = value / yMax * ph;
              acc += h;
              return <rect key={gi} x={x0} y={P.top + ph - acc} width={bw} height={h} fill={colors[gi]} />;
            })}
          {(!many || ci % Math.ceil(v.categories.length / 12) === 0) && <text x={x0 + bw / 2} y={P.top + ph + 18} textAnchor="middle">{short(v.categories[ci], many ? 6 : 14)}</text>}
        </g>;
      })}
      <text x={P.left + pw / 2} y={P.H - 8} textAnchor="middle" className="axis-name">{v.xName}</text>
    </svg>
    <Legend groups={v.groups} colors={colors} name={v.fillName} />
  </>;
}

function Histogram({ v }: { v: HistView }) {
  const colors = v.groups.length > 1 ? colorsFor(v.groups.length, v.ordered) : [BAR];
  const totals = v.counts.map(r => r.reduce((a, b) => a + b, 0)), yMax = Math.max(...totals, 1);
  const lo = v.breaks[0], hi = v.breaks[v.breaks.length - 1], sx = (x: number) => P.left + (x - lo) / (hi - lo) * pw;
  const ticks = [lo, (lo + hi) / 2, hi].map(t => Math.round(t));
  return <>
    <svg viewBox={`0 0 ${P.W} ${P.H}`} role="img" aria-label={`Histogramm mit ${v.counts.length} Klassen von ${fmt(lo)} bis ${fmt(hi)}`}>
      <Axes yMax={yMax} yLabel="Anzahl" />
      {v.counts.map((row, bi) => {
        let acc = 0;
        return <g key={bi}>{row.map((_, gi) => gi).reverse().map(gi => {
          const h = row[gi] / yMax * ph; acc += h;
          return <rect key={gi} x={sx(v.breaks[bi]) + 0.5} y={P.top + ph - acc} width={Math.max(0.5, sx(v.breaks[bi + 1]) - sx(v.breaks[bi]) - 1)} height={h} fill={colors[gi]} />;
        })}</g>;
      })}
      {ticks.map(t => <text key={t} x={sx(t)} y={P.top + ph + 18} textAnchor="middle">{t}</text>)}
      <text x={P.left + pw / 2} y={P.H - 8} textAnchor="middle" className="axis-name">{v.xName}</text>
    </svg>
    <Legend groups={v.groups} colors={colors} name={v.fillName} />
  </>;
}

function Boxplot({ v }: { v: BoxView }) {
  const span = v.max - v.min || 1, value = (x: number) => (x - v.min) / span;
  const slot = (v.horizontal ? ph : pw) / v.boxes.length, thick = Math.min(60, slot * 0.6);
  const label = v.boxes.map(b => `${b.label}: Median ${de(b.median)}, Quartile ${de(b.q1)} bis ${de(b.q3)}, n = ${fmt(b.n)}`).join('; ');
  return <svg viewBox={`0 0 ${P.W} ${P.H}`} role="img" aria-label={`Boxplot. ${label}`}>
    <line x1={P.left} x2={P.left} y1={P.top} y2={P.top + ph} stroke={INK} />
    <line x1={P.left} x2={P.left + pw} y1={P.top + ph} y2={P.top + ph} stroke={INK} />
    {v.boxes.map((b, i) => {
      const c = (v.horizontal ? P.top : P.left) + i * slot + slot / 2;
      // Werteachse: vertikal von unten nach oben, horizontal von links nach rechts.
      const at = (x: number) => (v.horizontal ? P.left + value(x) * pw : P.top + ph - value(x) * ph);
      const seg = (a: number, z: number, k: number, w = 1) => (v.horizontal
        ? <line x1={at(a)} x2={at(z)} y1={k} y2={k} stroke={INK} strokeWidth={w} />
        : <line x1={k} x2={k} y1={at(a)} y2={at(z)} stroke={INK} strokeWidth={w} />);
      const rect = v.horizontal
        ? <rect x={at(b.q1)} y={c - thick / 2} width={at(b.q3) - at(b.q1)} height={thick} fill="#fff" stroke={INK} />
        : <rect x={c - thick / 2} y={at(b.q3)} width={thick} height={at(b.q1) - at(b.q3)} fill="#fff" stroke={INK} />;
      const mid = v.horizontal
        ? <line x1={at(b.median)} x2={at(b.median)} y1={c - thick / 2} y2={c + thick / 2} stroke={INK} strokeWidth={3} />
        : <line x1={c - thick / 2} x2={c + thick / 2} y1={at(b.median)} y2={at(b.median)} stroke={INK} strokeWidth={3} />;
      return <g key={b.label}>
        {seg(b.lo, b.q1, c)}{seg(b.q3, b.hi, c)}{rect}{mid}
        {b.outliers.slice(0, 400).map(o => <circle key={o} cx={v.horizontal ? at(o) : c} cy={v.horizontal ? c : at(o)} r={2.2} fill={INK} />)}
        {v.horizontal
          ? <text x={P.left - 6} y={c + 4} textAnchor="end">{short(b.label, 8)}</text>
          : <text x={c} y={P.top + ph + 18} textAnchor="middle">{short(b.label)} (n = {fmt(b.n)})</text>}
      </g>;
    })}
    {[v.min, (v.min + v.max) / 2, v.max].map(t => v.horizontal
      ? <text key={t} x={P.left + value(t) * pw} y={P.top + ph + 18} textAnchor="middle">{fmt(t)}</text>
      : <text key={t} x={P.left - 7} y={P.top + ph - value(t) * ph + 4} textAnchor="end">{fmt(t)}</text>)}
    <text x={P.left + pw / 2} y={P.H - 8} textAnchor="middle" className="axis-name">{v.horizontal ? v.valueName : v.catName}</text>
    {!v.horizontal && <text x={12} y={P.top + ph / 2} transform={`rotate(-90 12 ${P.top + ph / 2})`} textAnchor="middle">{v.valueName}</text>}
  </svg>;
}

function Points({ v }: { v: PointsView }) {
  const ext = (a: number[], t: [number, string][]) => [Math.min(...a, ...t.map(x => x[0])) - 0.5, Math.max(...a, ...t.map(x => x[0])) + 0.5];
  const [x0, x1] = ext(v.xs, v.xTicks), [y0, y1] = ext(v.ys, v.yTicks);
  const sx = (x: number) => P.left + (x - x0) / (x1 - x0) * pw, sy = (y: number) => P.top + ph - (y - y0) / (y1 - y0) * ph;
  const every = (t: [number, string][], n: number) => t.filter((_, i) => i % Math.ceil(t.length / n) === 0);
  return <svg viewBox={`0 0 ${P.W} ${P.H}`} role="img" aria-label={`${v.jitter ? 'Gestreute ' : ''}Punkte: ${v.xs.length} Personen, x ${v.xName}, y ${v.yName}`}>
    <line x1={P.left} x2={P.left} y1={P.top} y2={P.top + ph} stroke={INK} />
    <line x1={P.left} x2={P.left + pw} y1={P.top + ph} y2={P.top + ph} stroke={INK} />
    <g fill={INK} fillOpacity={v.jitter ? 0.18 : 0.5}>
      {v.xs.map((x, i) => <circle key={i} cx={sx(x)} cy={sy(v.ys[i])} r={v.jitter ? 2 : 2.4} />)}
    </g>
    {every(v.xTicks, 10).map(([t, l]) => <text key={t} x={sx(t)} y={P.top + ph + 18} textAnchor="middle">{short(l, 10)}</text>)}
    {every(v.yTicks, 8).map(([t, l]) => <text key={t} x={P.left - 7} y={sy(t) + 4} textAnchor="end">{short(l, 7)}</text>)}
    <text x={P.left + pw / 2} y={P.H - 8} textAnchor="middle" className="axis-name">{v.xName}</text>
    <text x={12} y={P.top + ph / 2} transform={`rotate(-90 12 ${P.top + ph / 2})`} textAnchor="middle">{v.yName}</text>
  </svg>;
}

/** Was ggplot2 aus dem Bauplan zeichnen würde. memo: Tippen in der Bildunterschrift zeichnet die 5.000 Punkte nicht neu. */
export const PlanChart = memo(function PlanChart({ view }: { view: View }) {
  return <figure className="grafik-figure grafik-plan">
    {view.kind === 'bars' && <Bars v={view} />}
    {view.kind === 'histogram' && <Histogram v={view} />}
    {view.kind === 'boxplot' && <Boxplot v={view} />}
    {view.kind === 'points' && <Points v={view} />}
  </figure>;
});

/* ---------- Teil 4 · Achse ---------- */

export function AxisBars({ west, east, start, top }: { west: number; east: number; start: number; top: number }) {
  const W = 420, H = 260, left = 50, upper = 14, bottom = 36, plot = H - upper - bottom;
  const y = (v: number) => upper + plot - (v - start) / (top - start) * plot;
  const ticks = [start, (start + top) / 2, top];
  return <figure className="grafik-figure grafik-axis">
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Mittlere Lebenszufriedenheit, Achse von ${de(start)} bis ${de(top)}: West ${de(west, 2)}, Ost ${de(east, 2)}`}>
      <line x1={left} x2={left} y1={upper} y2={upper + plot} stroke={INK} />
      <line x1={left} x2={W - 10} y1={upper + plot} y2={upper + plot} stroke={INK} />
      {ticks.map(t => <g key={t}><line x1={left - 4} x2={left} y1={y(t)} y2={y(t)} stroke={INK} /><text x={left - 7} y={y(t) + 4} textAnchor="end">{de(t, 2)}</text></g>)}
      {[['West', west], ['Ost', east]].map(([label, v], i) => {
        const x = left + 40 + i * 170;
        return <g key={label as string}>
          <rect x={x} y={y(v as number)} width={110} height={upper + plot - y(v as number)} fill={BAR} />
          <text x={x + 55} y={y(v as number) - 6} textAnchor="middle" className="value">{de(v as number, 2)}</text>
          <text x={x + 55} y={H - 12} textAnchor="middle">{label}</text>
        </g>;
      })}
      {start > 0 && <text x={W - 12} y={upper + 4} textAnchor="end" className="warn">Achse beginnt bei {de(start)}</text>}
    </svg>
  </figure>;
}
