// Bilder der Brücke „Mit 200 Befragten“ (Spezifikation Lehrdatensatz 5.3): Punktdiagramm einer Spalte,
// Streudiagramm zweier Spalten und die Rechenbeiträge aller Befragten. Was ein Schritt zeigt, sagt `BridgePicture`
// (src/explain/types.ts). Ein Klick wählt die nächstgelegene Person; per Tastatur wählt die Personenliste daneben.
import type { MouseEvent } from 'react';
import type { BridgePicture, SampleColumn } from '../../../explain/types';
import { num, signed } from '../../../explain/format';
import { Axis, linear, useWidth } from './kit';

/** Gut lesbare Achsenwerte (1, 2, 5 mal Zehnerpotenz), höchstens etwa sechs. */
export function niceTicks(lo: number, hi: number, count = 6): number[] {
  if (!(hi > lo)) return [lo];
  const raw = (hi - lo) / count, pow = 10 ** Math.floor(Math.log10(raw)), step = [1, 2, 5, 10].map(k => k * pow).find(s => s >= raw) ?? 10 * pow;
  const out: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(Number(v.toFixed(10)));
  return out;
}

const pad = (lo: number, hi: number) => { const d = (hi - lo) * 0.06 || 1; return [lo - d, hi + d] as [number, number]; };
const unitTitle = (c: SampleColumn) => c.unit ? `${c.title} (${c.unit})` : c.title;

/** Nächste Person zu einem Klick, in Bildschirmpixeln. */
function nearest(e: MouseEvent<SVGSVGElement>, points: { x: number; y: number }[]): number | null {
  const svg = e.currentTarget, m = svg.getScreenCTM();
  if (!m || !points.length) return null;
  const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
  let best = 0, dist = Infinity;
  points.forEach((q, i) => { const d = (q.x - p.x) ** 2 + (q.y - p.y) ** 2; if (d < dist) { dist = d; best = i; } });
  return dist <= 30 ** 2 ? best : null;
}

/** Punktdiagramm der 200 Werte: gleiche Werte stapeln sich, x̄ gestrichelt, die gewählte Person hervorgehoben. */
function DotPlot({ values, names, who, pic, col, onWho }: { values: number[]; names: readonly string[]; who: number; pic: BridgePicture; col: SampleColumn; onWho: (i: number) => void }) {
  const [box, W] = useWidth();
  const band = pic.band, center = typeof pic.center === 'number' ? pic.center : undefined;
  const [lo, hi] = pad(Math.min(...values, band?.[0] ?? Infinity), Math.max(...values, band?.[1] ?? -Infinity));
  const left = 24, right = W - 24, X = linear([lo, hi], [left, right]), DOT = 6;
  // Stapel je Bildschirmspalte von 7 px
  const stack = new Map<number, number>(), level = values.map(v => { const b = Math.round(X(v) / 7); const k = stack.get(b) ?? 0; stack.set(b, k + 1); return k; });
  const tallest = Math.max(1, ...stack.values()), base = 34 + tallest * DOT, H = base + 48;
  const points = values.map((v, i) => ({ x: X(v), y: base - 4 - level[i] * DOT }));
  const me = points[who], d = center === undefined ? 0 : values[who] - center;
  return (
    <div ref={box}>
      <svg className="xw-svg xw-sample-plot" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={`Punktdiagramm: ${values.length} Werte von ${col.title}${center !== undefined ? `, Mittelwert ${num(center)}` : ''}${band ? `, Band von ${num(band[0])} bis ${num(band[1])}` : ''}. ${names[who]} hat ${num(values[who])}.`}
        onClick={e => { const i = nearest(e, points); if (i !== null) onWho(i); }}>
        {band && <g>
          <rect className="xw-band" x={X(band[0])} y={18} width={Math.max(0, X(band[1]) - X(band[0]))} height={base - 14} />
          <text className="xw-t" x={X(band[0])} y={H - 4} textAnchor="middle">x̄ − s</text>
          <text className="xw-t" x={X(band[1])} y={H - 4} textAnchor="middle">x̄ + s</text>
        </g>}
        {points.map((p, i) => i !== who && <circle key={i} className="xw-s-dot" cx={p.x} cy={p.y} r={2.6} />)}
        {center !== undefined && <g>
          <line className="xw-mean" x1={X(center)} x2={X(center)} y1={14} y2={base + 2} />
          <text className="xw-t" x={Math.min(right - 30, Math.max(left + 30, X(center)))} y={11} textAnchor="middle">x̄ = {num(center)}</text>
        </g>}
        {pic.deviation && center !== undefined && Math.abs(d) > 1e-9 && <line className={d > 0 ? 'xw-pos' : 'xw-neg'} strokeWidth={3} x1={X(center)} x2={me.x} y1={me.y} y2={me.y} />}
        <circle className="xw-s-dot sel" cx={me.x} cy={me.y} r={5.5} />
        <text className="xw-t xw-strong xw-halo" x={Math.min(right - 20, Math.max(left + 20, me.x))} y={me.y - 10} textAnchor="middle">{names[who]}</text>
        <Axis scale={X} ticks={niceTicks(lo, hi)} at={base + 4} from={left} to={right} format={v => num(v)} labelGap={18} />
        <text className="xw-t" x={(left + right) / 2} y={base + 40} textAnchor="middle">{unitTitle(col)}</text>
      </svg>
    </div>
  );
}

/** Streudiagramm der 200 Wertepaare mit Achsenkreuz aus x̄ und ȳ, Plus- und Minusflächen und dem Rechteck der gewählten Person. */
function Scatter({ values, values2, names, who, pic, col, col2, onWho }: { values: number[]; values2: number[]; names: readonly string[]; who: number; pic: BridgePicture; col: SampleColumn; col2: SampleColumn; onWho: (i: number) => void }) {
  const [box, W] = useWidth();
  const [x0, x1] = pad(Math.min(...values), Math.max(...values)), [y0, y1] = pad(Math.min(...values2), Math.max(...values2)), yTicks = niceTicks(y0, y1, 5);
  // Platz links nach der breitesten Zahl der y-Achse (rund 8 px je Zeichen), damit der gedrehte Achsentitel sie nicht überdeckt (IB36).
  const left = Math.max(50, 32 + 8 * Math.max(...yTicks.map(v => num(v).length))), right = W - 16, top = 22, plotH = Math.min(300, Math.max(220, (right - left) * 0.7)), bottom = top + plotH, H = bottom + 46;
  const X = linear([x0, x1], [left, right]), Y = linear([y0, y1], [bottom, top]);
  const center = Array.isArray(pic.center) ? pic.center : undefined;
  // Gleiche Antworten leicht versetzt, damit Stapel sichtbar bleiben (gerechnet wird mit den echten Werten).
  const jitter = (i: number) => ((i * 7) % 5 - 2) * 1.1;
  const points = values.map((v, i) => ({ x: X(v) + jitter(i), y: Y(values2[i]) + jitter(i + 2) }));
  const sign = (i: number) => center ? (values[i] - center[0]) * (values2[i] - center[1]) : 0;
  const me = points[who], prod = sign(who);
  return (
    <div ref={box}>
      <svg className="xw-svg xw-sample-plot" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={`Streudiagramm: ${values.length} Befragte, ${col.title} und ${col2.title}. ${names[who]} hat ${num(values[who])} und ${num(values2[who])}.`}
        onClick={e => { const i = nearest(e, points); if (i !== null) onWho(i); }}>
        {pic.deviation && center && Math.abs(prod) > 1e-9 && <rect className={`${prod > 0 ? 'xw-rect-pos' : 'xw-rect-neg'} sel`}
          x={Math.min(me.x, X(center[0]))} y={Math.min(me.y, Y(center[1]))} width={Math.abs(me.x - X(center[0]))} height={Math.abs(me.y - Y(center[1]))} />}
        {points.map((p, i) => i !== who && <circle key={i} className={`xw-s-dot${pic.quadrants ? sign(i) > 1e-9 ? ' pos' : sign(i) < -1e-9 ? ' neg' : '' : ''}`} cx={p.x} cy={p.y} r={2.6} />)}
        {center && <g>
          <line className="xw-mean" x1={X(center[0])} x2={X(center[0])} y1={top} y2={bottom} />
          <line className="xw-mean" x1={left} x2={right} y1={Y(center[1])} y2={Y(center[1])} />
          <text className="xw-t" x={X(center[0]) + 4} y={top + 12}>x̄</text>
          <text className="xw-t" x={right - 4} y={Y(center[1]) - 5} textAnchor="end">ȳ</text>
        </g>}
        {pic.quadrants && center && <g>
          <text className="xw-t xw-pos-t" x={right - 6} y={top + 14} textAnchor="end">beide darüber: +</text>
          <text className="xw-t xw-pos-t" x={left + 6} y={bottom - 6}>beide darunter: +</text>
          <text className="xw-t xw-neg-t" x={left + 6} y={top + 16}>−</text>
          <text className="xw-t xw-neg-t" x={right - 6} y={bottom - 6} textAnchor="end">−</text>
        </g>}
        <circle className="xw-s-dot sel" cx={me.x} cy={me.y} r={5.5} />
        <text className="xw-t xw-strong xw-halo" x={Math.min(right - 20, Math.max(left + 20, me.x))} y={me.y - 10} textAnchor="middle">{names[who]}</text>
        <Axis scale={X} ticks={niceTicks(x0, x1)} at={bottom} from={left} to={right} format={v => num(v)} labelGap={16} />
        <Axis scale={Y} ticks={yTicks} at={left} from={top} to={bottom} orient="left" format={v => num(v)} />
        <text className="xw-t" x={(left + right) / 2} y={bottom + 38} textAnchor="middle">{unitTitle(col)} (x)</text>
        <text className="xw-t" x={12} y={(top + bottom) / 2} textAnchor="middle" transform={`rotate(-90 12 ${(top + bottom) / 2})`}>{col2.title} (y)</text>
      </svg>
    </div>
  );
}

/** Rechenbeiträge aller Befragten, der Größe nach: Wer trägt viel bei? Die gewählte Person und der größte Beitrag sind beschriftet. */
function Contributions({ values, names, who, label, onWho }: { values: number[]; names: readonly string[]; who: number; label: string; onWho: (i: number) => void }) {
  const [box, W] = useWidth();
  const order = values.map((_, i) => i).sort((a, b) => values[b] - values[a]);
  const left = 16, right = W - 16, bw = (right - left) / values.length, max = Math.max(1e-9, ...values.map(Math.abs));
  const hasNeg = values.some(v => v < -1e-9), up = hasNeg ? 60 : 100, zero = 24 + up, H = zero + (hasNeg ? 60 : 0) + 30;
  const h = (v: number) => Math.abs(v) / max * up;
  const points = order.map((i, k) => ({ x: left + (k + 0.5) * bw, y: values[i] >= 0 ? zero - h(values[i]) / 2 : zero + h(values[i]) / 2 }));
  const at = (i: number) => order.indexOf(i), top = order[0];
  const tag = (i: number, strong: boolean) => {
    const k = at(i), x = Math.min(right - 48, Math.max(left + 48, left + (k + 0.5) * bw)), v = values[i];
    // Über einem hohen Balken steht das Etikett darüber, sonst unter der Nulllinie (dort ist Platz).
    const y = v >= 0 ? (h(v) > up * 0.5 ? zero - h(v) - 6 : zero + 18) : zero + h(v) + 16;
    return <text className={`xw-t xw-halo${strong ? ' xw-strong' : ''}`} x={x} y={Math.max(14, y)} textAnchor="middle">{names[i]}: {hasNeg ? signed(v) : num(v)}</text>;
  };
  return (
    <div ref={box}>
      <p className="xw-note xw-plot-caption">{label}</p>
      <svg className="xw-svg xw-sample-plot" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={`${label}. Größter Beitrag: ${names[top]} mit ${num(values[top])}. ${names[who]}: ${num(values[who])}.`}
        onClick={e => { const k = nearest(e, points); if (k !== null) onWho(order[k]); }}>
        {order.map((i, k) => <rect key={i} className={`${values[i] >= 0 ? 'xw-bar-pos' : 'xw-bar-neg'}${i === who ? ' sel' : ''}`}
          x={left + k * bw} y={values[i] >= 0 ? zero - h(values[i]) : zero} width={Math.max(0.6, bw - 0.4)} height={Math.max(0.5, h(values[i]))} />)}
        <line className="xw-axis" x1={left} x2={right} y1={zero} y2={zero} />
        {top !== who && tag(top, false)}
        {tag(who, true)}
      </svg>
    </div>
  );
}

/** Bild der Brücke für einen Schritt: Punkt- oder Streudiagramm, darunter bei Bedarf die Rechenbeiträge. */
export function SamplePicture({ kind, values, values2, names, who, pic, col, col2, onWho }: {
  kind: 'series' | 'pairs'; values: number[]; values2?: number[]; names: readonly string[]; who: number; pic: BridgePicture;
  col: SampleColumn; col2?: SampleColumn; onWho: (i: number) => void;
}) {
  return <>
    {kind === 'pairs' && values2 && col2
      ? <Scatter values={values} values2={values2} names={names} who={who} pic={pic} col={col} col2={col2} onWho={onWho} />
      : <DotPlot values={values} names={names} who={who} pic={pic} col={col} onWho={onWho} />}
    {pic.contributions && <Contributions values={pic.contributions.values} names={names} who={who} label={pic.contributions.label} onWho={onWho} />}
  </>;
}
