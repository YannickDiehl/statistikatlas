// Bilder des Bereichs B10 „Mittelwerte vergleichen“ für alle Vorlagen. Schlüssel = `picture` der Erklärung, Bausteine und
// `forWorkshop`/`forCard`/`forSentence`/`forTable` aus ./kit.tsx.
// Eigene Stile in src/explain/areas/b10-mittelwerte.css (lädt main.tsx automatisch). Anleitung: src/explain/AUTHORING.md.
import type { Pairs } from '../../../explain/math';
import { num, signed } from '../../../explain/format';
import type { PairedStats } from '../../../explain/content/b10-mittelwerte/paired-difference';
import { Axis, clamp, DragPoint, forWorkshop, keyStep, linear, MarkLine, useDrag, useWidth, type Bounds, type Picture } from './kit';

/** Ganzzahlige Ticks von `from` bis `to` in Schritten von `by`. */
const ticks = (from: number, to: number, by: number) => Array.from({ length: Math.floor((to - from) / by) + 1 }, (_, k) => from + k * by);

/**
 * Gepaarte Differenzen: oben je Person beide Tests mit dem Pfeil der Veränderung (beide Punkte ziehbar), unten die fünf
 * Veränderungen mit ihrer Mitte d̄ (ab Schritt 2), dem Band d̄ ± s (Schritt 3), d̄ ± SE (Schritt 4) und dem Abstand zu 0 (Schritt 5).
 */
function PairsPicture({ data, s, step, who, names, bounds, onChange, onWho }: {
  data: Pairs; s: PairedStats; step: number; who: number; names: readonly string[]; bounds: Bounds;
  onChange: (d: Pairs) => void; onWho: (i: number) => void;
}) {
  const [box, W] = useWidth();
  const left = 44, right = W - 26, X = linear([bounds.min, bounds.max], [left, right]);
  const rowY = (i: number) => 36 + i * 30, AXIS = rowY(names.length - 1) + 26;
  const set = (i: number, which: 'x' | 'y', v: number) => {
    if (data[which][i] === v) return;
    onChange({ ...data, [which]: data[which].map((old, k) => k === i ? v : old) });
  };
  const { svg, start, handlers } = useDrag((k, p) => set(k >> 1, k & 1 ? 'y' : 'x', clamp(X.invert(p.x), bounds)));
  // Unteres Feld: die Veränderungen auf ihrer eigenen Achse, mindestens von −6 bis +6.
  const lim = Math.max(6, Math.ceil(Math.max(...s.d.map(Math.abs)))), top = AXIS + 66, D = linear([-lim, lim], [left, right]);
  const dotY = (i: number) => top + 28 - 12 * s.d.slice(0, i).filter(v => v === s.d[i]).length;
  const H = step >= 2 ? top + 104 : AXIS + 48;
  const lo = (v: number) => Math.max(left, Math.min(right, D(v)));
  return (
    <div ref={box}>
      <svg ref={svg} className="xw-svg xw-drag" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="group" aria-label="Erster und zweiter Wissenstest der fünf Beispielpersonen mit ihren Veränderungen" {...handlers}>
        <desc id="b10-paare-help">Pfeiltasten ändern die gelösten Aufgaben, Pos1 und Ende springen an die Grenzen.</desc>
        {names.map((n, i) => <g key={`row${i}`}>
          <line className="xw-guide" x1={left - 10} x2={right + 10} y1={rowY(i)} y2={rowY(i)} />
          <text className="xw-t" x={10} y={rowY(i) + 4}>{n}</text>
        </g>)}
        {s.d.map((d, i) => d !== 0 && <g key={`arrow${i}`}>
          <line className={d > 0 ? 'xw-pos' : 'xw-neg'} strokeWidth={i === who ? 4.5 : 3} x1={X(data.x[i])} x2={X(data.y[i])} y1={rowY(i)} y2={rowY(i)} />
          <text className="xw-t" x={(X(data.x[i]) + X(data.y[i])) / 2} y={rowY(i) - 8} textAnchor="middle">{signed(d)}</text>
        </g>)}
        <Axis scale={X} ticks={ticks(bounds.min, bounds.max, 2)} at={AXIS} from={left} to={right} labelGap={20} title="gelöste Aufgaben" />
        {names.flatMap((n, i) => (['x', 'y'] as const).map((which, k) => {
          const v = data[which][i];
          return <DragPoint key={`${which}${i}`} x={X(v)} y={rowY(i)} label={`Person ${n}, ${which === 'x' ? 'erster' : 'zweiter'} Test`} selected={i === who}
            valueNow={v} bounds={bounds} valueText={`${v} Aufgaben`} describedBy="b10-paare-help"
            onPointerDown={e => { onWho(i); start(i * 2 + k, e); }}
            onKeyDown={e => { const next = keyStep(e, v, bounds); if (next !== null) { e.preventDefault(); onWho(i); set(i, which, next); } }}>{k + 1}</DragPoint>;
        }))}
        {step >= 2 && <g>
          <text className="xw-t xw-strong" x={10} y={top - 18}>Die fünf Veränderungen dᵢ</text>
          {step >= 3 && s.sd > 0 && <g>
            <rect className="xw-band" x={lo(s.mean - s.sd)} y={top - 4} width={lo(s.mean + s.sd) - lo(s.mean - s.sd)} height={44} />
            <text className="xw-t" x={lo(s.mean - s.sd)} y={top + 56} textAnchor="middle">d̄ − s</text>
            <text className="xw-t" x={lo(s.mean + s.sd)} y={top + 56} textAnchor="middle">d̄ + s</text>
          </g>}
          {step >= 4 && s.se > 0 && <g>
            <line className="xw-side" x1={lo(s.mean - s.se)} x2={lo(s.mean + s.se)} y1={top + 44} y2={top + 44} />
            <text className="xw-t xw-strong" x={lo(s.mean + s.se) + 6} y={top + 48}>± SE</text>
          </g>}
          <MarkLine x={D(s.mean)} from={top} to={top + 40} label={`d̄ = ${num(s.mean)}`} />
          {step >= 5 && <g>
            <line className="xw-axis" strokeWidth={2} x1={D(0)} x2={D(0)} y1={top} y2={top + 40} />
            <text className="xw-t xw-strong" x={left} y={top + 92}>{s.t === null ? 't nicht definiert: Die Veränderungen streuen nicht.' : `d̄ liegt ${num(Math.abs(s.t))} Standardfehler ${s.t >= 0 ? 'über' : 'unter'} 0: t ≈ ${num(s.t)}`}</text>
          </g>}
          {s.d.map((d, i) => <circle key={`d${i}`} className={`b10-dot${i === who ? ' sel' : ''}`} cx={D(d)} cy={dotY(i)} r={i === who ? 7 : 5.5} />)}
          <Axis scale={D} ticks={ticks(-lim, lim, lim > 10 ? 4 : 2)} at={top + 40} from={left} to={right} labelGap={step >= 3 ? 34 : 18} format={v => v > 0 ? `+${v}` : String(v).replace('-', '−')} />
        </g>}
      </svg>
    </div>
  );
}

export const pictures: Record<string, Picture> = {
  'b10-paare': forWorkshop(p => <PairsPicture data={p.data} s={p.s} step={p.step} who={p.who} names={p.workshop.names} bounds={p.workshop.bounds} onChange={p.setData} onWho={p.pickWho} />),
};
