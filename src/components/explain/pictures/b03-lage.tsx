// Bilder des Bereichs B3 „Lage und Verteilung“ für alle Vorlagen. Schlüssel = `picture` der Erklärung, Bausteine und
// `forWorkshop`/`forCard`/`forSentence`/`forTable` aus ./kit.tsx.
// Eigene Stile in src/explain/areas/b03-lage.css (lädt main.tsx automatisch). Anleitung: src/explain/AUTHORING.md.
import { rangeWithTop, LERNZEIT } from '../../../explain/content/b03-lage/range';
import { formWithTop, FORM } from '../../../explain/content/b03-lage/shape';
import { niceTicks } from './sample';
import type { Reihe as ReiheStats } from '../../../explain/content/b03-lage/reihe';
import type { Haeufigkeit } from '../../../explain/content/b03-lage/haeufigkeit';
import { OPTIONEN, type Mehrfach } from '../../../explain/content/b03-lage/mehrfach';
import type { KeyboardEvent } from 'react';
import { num, pct } from '../../../explain/format';
import { labelOf } from '../../../explain/content/b03-lage/lage';
import { Axis, clamp, DragPoint, forCard, forWorkshop, keyStep, linear, useDrag, useWidth, type Bounds, type Picture } from './kit';

/** Punktdiagramm: gleiche (in Pixeln nahe) Werte stapeln sich; liefert die Punkte und die Höhe des höchsten Stapels. */
function stacked(values: readonly number[], X: (v: number) => number, dot: number) {
  const stack = new Map<number, number>();
  const level = values.map(v => { const b = Math.round(X(v) / dot); const k = stack.get(b) ?? 0; stack.set(b, k + 1); return k; });
  return { level, tallest: Math.max(1, ...stack.values()) };
}

/** Klammer über einem Bereich mit Beschriftung (Spannweite, Interquartilsabstand). */
function Bracket({ from, to, y, label, className }: { from: number; to: number; y: number; label: string; className: string }) {
  return (
    <g className={className}>
      <line x1={from} x2={to} y1={y} y2={y} />
      <line x1={from} x2={from} y1={y - 6} y2={y + 6} />
      <line x1={to} x2={to} y1={y - 6} y2={y + 6} />
      <text className="xw-t xw-halo" x={(from + to) / 2} y={y - 9} textAnchor="middle">{label}</text>
    </g>
  );
}

/** Spannweite: die 200 Lernzeiten, der größte Wert vom Regler verschoben; Klammern für Spannweite und mittlere Hälfte. */
function Spannweite({ top }: { top: number }) {
  const [box, W] = useWidth();
  const r = rangeWithTop(top), left = 24, right = W - 24, X = linear([0, 60], [left, right]), DOT = 5;
  const { level, tallest } = stacked(r.xs, X, DOT);
  const top0 = 78, base = top0 + tallest * DOT, H = base + 50;
  const maxAt = r.xs.indexOf(r.max);
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={`Punktdiagramm der 200 Lernzeiten von ${num(r.min)} bis ${num(r.max)} Stunden. Spannweite ${num(r.range)} Stunden, mittlere Hälfte von ${num(r.q1)} bis ${num(r.q3)} Stunden, ${num(r.iqr)} Stunden breit.`}>
        <rect className="xw-band" x={X(r.q1)} y={top0 - 4} width={X(r.q3) - X(r.q1)} height={base - top0 + 4} />
        {r.xs.map((v, i) => i !== maxAt && <circle key={i} className="xw-s-dot" cx={X(v)} cy={base - 3 - level[i] * DOT} r={2.4} />)}
        <circle className="xw-s-dot sel" cx={X(r.max)} cy={base - 3 - level[maxAt] * DOT} r={5} />
        <Bracket className="b03-bracket b03-range" from={X(r.min)} to={X(r.max)} y={26} label={`Spannweite ${num(r.range)} h`} />
        <Bracket className="b03-bracket" from={X(r.q1)} to={X(r.q3)} y={60} label={`mittlere Hälfte ${num(r.iqr)} h`} />
        <Axis scale={X} ticks={[0, 10, 20, 30, 40, 50, 60]} at={base + 4} from={left} to={right} labelGap={18} />
        <text className="xw-t" x={(left + right) / 2} y={base + 42} textAnchor="middle">Lernzeit in den letzten sieben Tagen (h)</text>
      </svg>
    </div>
  );
}

/** Schiefe: die 200 Haushaltseinkommen, das höchste vom Regler verschoben; Median und Mittelwert als Linien. */
function Schiefe({ top }: { top: number }) {
  const [box, W] = useWidth();
  const f = formWithTop(top), left = 24, right = W - 24, hi = Math.max(9000, f.max * 1.03), X = linear([0, hi], [left, right]), DOT = 5;
  const { level, tallest } = stacked(f.xs, X, DOT);
  const top0 = 64, base = top0 + tallest * DOT, H = base + 50;
  const maxAt = f.xs.indexOf(f.max), mx = X(f.mean), md = X(f.median), at = (x: number) => Math.min(right - 112, Math.max(left, x + 5));
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={`Punktdiagramm der 200 Haushaltseinkommen bis ${num(f.max)} € im Monat. Median ${num(f.median)} €, Mittelwert ${num(f.mean)} €, Schiefe ${num(f.skew)}.`}>
        {f.xs.map((v, i) => i !== maxAt && <circle key={i} className="xw-s-dot" cx={X(v)} cy={base - 3 - level[i] * DOT} r={2.4} />)}
        <circle className="xw-s-dot sel" cx={X(f.max)} cy={base - 3 - level[maxAt] * DOT} r={5} />
        <line className="b03-mark" x1={md} x2={md} y1={24} y2={base + 2} />
        <line className="xw-mean" x1={mx} x2={mx} y1={42} y2={base + 2} />
        <text className="xw-t xw-halo" x={at(md)} y={34} textAnchor="start">Median {num(f.median)}</text>
        <text className="xw-t xw-halo" x={at(mx)} y={54} textAnchor="start">x̄ {num(f.mean)}</text>
        <text className="xw-t xw-strong" x={right} y={14} textAnchor="end">Schiefe {num(f.skew)}</text>
        <Axis scale={X} ticks={niceTicks(0, hi, 5)} at={base + 4} from={left} to={right} labelGap={18} format={v => num(v)} />
        <text className="xw-t" x={(left + right) / 2} y={base + 42} textAnchor="middle">Haushaltsnettoeinkommen (€ im Monat)</text>
      </svg>
    </div>
  );
}

/**
 * Werkstatt „Der Reihe nach“: oben die fünf Lernzeiten zum Ziehen (eine Zeile je Person), darunter dieselben Werte
 * der Reihe nach auf Plätzen. Ab Schritt 2 die Mitte, ab 3 der Median, ab 4 die Plätze der Quartile, ab 5 die
 * Quartile, in Schritt 6 das Band der mittleren Hälfte.
 */
function ReihePicture({ values, s, step, who, names, bounds, onChange, onWho }: {
  values: number[]; s: ReiheStats; step: number; who: number; names: readonly string[]; bounds: Bounds;
  onChange: (v: number[]) => void; onWho: (i: number) => void;
}) {
  const [box, W] = useWidth();
  const left = 44, right = W - 26, X = linear([bounds.min, bounds.max], [left, right]), Y = (i: number) => 54 + i * 28, AXIS = 52 + values.length * 28;
  const set = (i: number, v: number) => { if (v !== values[i]) onChange(values.map((x, k) => k === i ? v : x)); };
  const { svg, start, handlers } = useDrag((i, p) => set(i, clamp(X.invert(p.x), bounds)));
  const n = values.length, gap = 10, sw = Math.min(58, (W - 40 - gap * (n - 1)) / n), x0 = (W - (n * sw + (n - 1) * gap)) / 2;
  const PX = (place: number) => x0 + (place - 1) * (sw + gap) + sw / 2, y0 = AXIS + 66, sh = 34, my = y0 + sh + 40, H = my + (step >= 6 ? 64 : 40);
  const byPlace = values.map((_, i) => i).sort((a, b) => s.place[a] - s.place[b]);
  const mark = (v: number, label: string, y: number, cls: string) => <g>
    <line className={cls} x1={X(v)} x2={X(v)} y1={y + 4} y2={AXIS} />
    <text className="xw-t xw-halo" x={Math.min(right - 20, Math.max(left + 20, X(v)))} y={y} textAnchor="middle">{label}</text>
  </g>;
  return (
    <div ref={box}>
      <svg ref={svg} className="xw-svg xw-drag" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="group" aria-label={`Zahlenstrahl mit den fünf Beispielpersonen, darunter ihre Werte der Reihe nach: ${s.sorted.map(v => num(v)).join(', ')}`} {...handlers}>
        {step >= 6 && <rect className="xw-band" x={X(s.q1)} y={40} width={Math.max(2, X(s.q3) - X(s.q1))} height={AXIS - 40} />}
        {values.map((_, i) => <g key={`row${i}`}><line className="xw-guide" x1={left - 10} x2={right + 10} y1={Y(i)} y2={Y(i)} /><text className="xw-t" x={10} y={Y(i) + 4}>{names[i]}</text></g>)}
        {step >= 3 && mark(s.median, `x̃ = ${num(s.median)}`, 14, 'b03-mark')}
        {step >= 5 && <>{mark(s.q1, `Q₁ = ${num(s.q1)}`, 32, 'b03-mark-q')}{mark(s.q3, `Q₃ = ${num(s.q3)}`, 32, 'b03-mark-q')}</>}
        <Axis scale={X} ticks={[0, 5, 10, 15, 20].filter(t => t >= bounds.min && t <= bounds.max)} at={AXIS} from={left} to={right} labelGap={20} />
        <text className="xw-t" x={(left + right) / 2} y={AXIS + 40} textAnchor="middle">Lernzeit in Stunden</text>
        {values.map((v, i) => (
          <DragPoint key={`dot${i}`} x={X(v)} y={Y(i)} label={`Person ${names[i]}, Lernzeit in Stunden`} selected={i === who} valueNow={v} bounds={bounds}
            onPointerDown={e => { onWho(i); start(i, e); }}
            onKeyDown={e => { const next = keyStep(e, v, bounds); if (next !== null) { e.preventDefault(); onWho(i); set(i, next); } }}>{v}</DragPoint>
        ))}
        {byPlace.map((i, k) => {
          const on = step >= 2 && Math.abs(k + 1 - s.mid) < 1e-9;
          return <g key={`slot${i}`}>
            <text className="xw-t" x={PX(k + 1)} y={y0 - 8} textAnchor="middle">Platz {k + 1}</text>
            <rect className={`b03-slot${on ? ' on' : ''}`} x={PX(k + 1) - sw / 2} y={y0} width={sw} height={sh} />
            <text className="xw-t xw-strong" x={PX(k + 1)} y={y0 + sh / 2 + 5} textAnchor="middle">{num(values[i])}</text>
            <text className={`xw-t${i === who ? ' xw-strong' : ''}`} x={PX(k + 1)} y={y0 + sh + 18} textAnchor="middle">{names[i]}</text>
          </g>;
        })}
        {step >= 4 && [s.h1, s.h3].map((hp, k) => <g key={`h${k}`}>
          <polygon className="xw-fulcrum" points={`${PX(hp)},${my - 12} ${PX(hp) - 7},${my} ${PX(hp) + 7},${my}`} />
          <text className="xw-t" x={PX(hp)} y={my + 18} textAnchor="middle">{step >= 5 ? `${k ? 'Q₃' : 'Q₁'} = ${num(k ? s.q3 : s.q1)}` : `Platz ${num(hp)}`}</text>
        </g>)}
        {step === 2 && <text className="xw-t" x={PX(s.mid)} y={my + 4} textAnchor="middle">mittlerer Platz: {num(s.mid)}</text>}
        {step === 3 && <text className="xw-t" x={PX(s.mid)} y={my + 4} textAnchor="middle">x̃ = {num(s.median)}</text>}
        {step >= 6 && <g className="b03-bracket b03-range">
          <line x1={PX(s.h1)} x2={PX(s.h3)} y1={my + 40} y2={my + 40} />
          <line x1={PX(s.h1)} x2={PX(s.h1)} y1={my + 34} y2={my + 46} />
          <line x1={PX(s.h3)} x2={PX(s.h3)} y1={my + 34} y2={my + 46} />
          <text className="xw-t xw-strong" x={(PX(s.h1) + PX(s.h3)) / 2} y={my + 60} textAnchor="middle">IQR = {num(s.q3)} − {num(s.q1)} = {num(s.iqr)}</text>
        </g>}
      </svg>
    </div>
  );
}

const SHORT = ['ohne', 'Haupt', 'Mittel', 'FH', 'Abitur'];

/**
 * Werkstatt „Häufigkeiten“: je Abschluss eine Säule, jede Person ein ziehbarer Punkt. Ab Schritt 1 die Zählung über der
 * Säule, ab 2 der Modus hervorgehoben, ab 4 die Anteile, in Schritt 5 die kumulierten Anteile.
 */
function SaeulenPicture({ values, s, step, who, names, bounds, onChange, onWho }: {
  values: number[]; s: Haeufigkeit; step: number; who: number; names: readonly string[]; bounds: Bounds;
  onChange: (v: number[]) => void; onWho: (i: number) => void;
}) {
  const [box, W] = useWidth();
  const codes = Array.from({ length: bounds.max - bounds.min + 1 }, (_, k) => bounds.min + k);
  const left = 16, right = W - 16, cw = (right - left) / codes.length, X = (v: number) => left + (v - bounds.min + 0.5) * cw;
  const ROW = 26, B = 40 + values.length * ROW, H = B + (step >= 5 ? 96 : step >= 4 ? 78 : 58);
  const set = (i: number, v: number) => { if (v !== values[i]) onChange(values.map((x, k) => k === i ? v : x)); };
  const { svg, start, handlers } = useDrag((i, p) => set(i, clamp((p.x - left) / cw - 0.5 + bounds.min, bounds)));
  const level = values.map((v, i) => values.slice(0, i).filter(x => x === v).length);
  const count = (code: number) => values.filter(v => v === code).length;
  const upTo = (code: number) => values.filter(v => v <= code).length / values.length;
  return (
    <div ref={box}>
      <svg ref={svg} className="xw-svg xw-drag" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="group"
        aria-label={`Säulen der ${values.length} Beispielpersonen nach Schulabschluss: ${codes.map(k => `Code ${k}: ${count(k)}`).join(', ')}`} {...handlers}>
        {codes.map(k => <rect key={`col${k}`} className={`b03-col${step >= 2 && s.modes.includes(k) ? ' on' : ''}`} x={X(k) - cw / 2 + 3} y={22} width={cw - 6} height={B - 22} />)}
        {codes.map(k => <text key={`n${k}`} className="xw-t xw-strong" x={X(k)} y={B - 14 - Math.max(0, count(k)) * ROW + (count(k) ? 2 : 4)} textAnchor="middle">{`n${'₀₁₂₃₄₅₆₇₈₉'[k] ?? ''} = ${count(k)}`}</text>)}
        <line className="xw-axis" x1={left} x2={right} y1={B} y2={B} />
        {codes.map(k => <g key={`lab${k}`}>
          <text className="xw-t xw-strong" x={X(k)} y={B + 20} textAnchor="middle">{k}</text>
          <text className="xw-t" x={X(k)} y={B + 38} textAnchor="middle">{SHORT[k] ?? ''}</text>
          {step >= 4 && <text className="xw-t" x={X(k)} y={B + 58} textAnchor="middle">{pct(count(k) / values.length)}</text>}
          {step >= 5 && <text className="xw-t" x={X(k)} y={B + 78} textAnchor="middle">{pct(upTo(k))}</text>}
        </g>)}
        {values.map((v, i) => (
          <DragPoint key={`dot${i}`} x={X(v)} y={B - 14 - level[i] * ROW} label={`Person ${names[i]}, Schulabschluss`} valueText={`Code ${v}: ${labelOf('schulabschluss', v)}`}
            selected={i === who} valueNow={v} bounds={bounds}
            onPointerDown={e => { onWho(i); start(i, e); }}
            onKeyDown={e => { const next = keyStep(e, v, bounds); if (next !== null) { e.preventDefault(); onWho(i); set(i, next); } }}>{names[i]}</DragPoint>
        ))}
      </svg>
    </div>
  );
}

/**
 * Werkstatt „Mehrfachantworten“: je Person und Lernquelle ein Kästchen zum Ankreuzen (Rolle „checkbox“, Leertaste
 * oder Enter), darunter die Zählungen; ab Schritt 3 Balken für die Prozente der Antworten, ab 4 für die der Fälle.
 */
function KreuzePicture({ rows, s, step, who, names, onChange, onWho }: {
  rows: number[][]; s: Mehrfach; step: number; who: number; names: readonly string[];
  onChange: (d: number[][]) => void; onWho: (i: number) => void;
}) {
  const [box, W] = useWidth();
  const left = 40, cw = Math.min(96, (W - left - 70) / OPTIONEN.length), X = (j: number) => left + (j + 0.5) * cw, R = 34, top = 34, B = top + rows.length * R;
  const toggle = (i: number, j: number) => { onWho(i); onChange(rows.map((r, k) => k === i ? r.map((v, l) => l === j ? 1 - v : v) : r)); };
  const key = (e: KeyboardEvent, i: number, j: number) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(i, j); } };
  const bx = 84, bw = Math.max(60, W - bx - 128), barY = B + 46, rowH = step >= 4 ? 44 : 26, H = step >= 3 ? barY + OPTIONEN.length * rowH + (step >= 5 ? 26 : 6) : B + 40;
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="group" aria-label={`Kreuze der fünf Beispielpersonen: ${OPTIONEN.map((o, j) => `${o} ${s.counts[j]}`).join(', ')}`}>
        {OPTIONEN.map((o, j) => <text key={o} className="xw-t xw-strong" x={X(j)} y={top - 12} textAnchor="middle">{o}</text>)}
        {step >= 2 && <text className="xw-t xw-strong" x={left + OPTIONEN.length * cw + 30} y={top - 12} textAnchor="middle">Σ</text>}
        {rows.map((r, i) => <g key={`r${i}`}>
          <text className={`xw-t${i === who ? ' xw-strong' : ''}`} x={12} y={top + i * R + R / 2 + 5}>{names[i]}</text>
          {r.map((v, j) => (
            <g key={j} className={`b03-toggle${v === 1 ? ' on' : ''}${i === who ? ' sel' : ''}`} role="checkbox" tabIndex={0} aria-checked={v === 1}
              aria-label={`Person ${names[i]}, ${OPTIONEN[j]}`} onClick={() => toggle(i, j)} onKeyDown={e => key(e, i, j)}>
              <rect x={X(j) - 13} y={top + i * R + 4} width={26} height={26} rx={4} />
              {v === 1 && <text className="xw-t xw-strong" x={X(j)} y={top + i * R + 22} textAnchor="middle">✕</text>}
            </g>
          ))}
          {step >= 2 && <text className="xw-t" x={left + OPTIONEN.length * cw + 30} y={top + i * R + R / 2 + 5} textAnchor="middle">{s.perPerson[i]}</text>}
        </g>)}
        <line className="xw-axis" x1={left} x2={left + OPTIONEN.length * cw + (step >= 2 ? 50 : 0)} y1={B + 4} y2={B + 4} />
        {OPTIONEN.map((o, j) => <text key={`n${o}`} className="xw-t xw-strong" x={X(j)} y={B + 24} textAnchor="middle">{s.counts[j]}</text>)}
        {step >= 2 && <text className="xw-t xw-strong" x={left + OPTIONEN.length * cw + 30} y={B + 24} textAnchor="middle">{s.total}</text>}
        {step >= 3 && OPTIONEN.map((o, j) => <g key={`bar${o}`}>
          <text className="xw-t" x={12} y={barY + j * rowH + 13}>{o}</text>
          <rect className="xw-bar-plain" x={bx} y={barY + j * rowH} width={Math.max(2, bw * s.respPct[j] / 100)} height={16} />
          <text className="xw-t" x={bx + Math.max(2, bw * s.respPct[j] / 100) + 6} y={barY + j * rowH + 13}>{num(s.respPct[j])} % der Kreuze</text>
          {step >= 4 && <>
            <rect className="xw-bar-pos" x={bx} y={barY + j * rowH + 19} width={Math.max(2, bw * s.casePct[j] / 100)} height={16} />
            <text className="xw-t" x={bx + Math.max(2, bw * s.casePct[j] / 100) + 6} y={barY + j * rowH + 32}>{num(s.casePct[j])} % der Personen</text>
          </>}
        </g>)}
        {step >= 5 && <text className="xw-t xw-strong" x={12} y={H - 8}>Fälle zusammen {num(s.caseSum)} %, Kreuze 100 %</text>}
      </svg>
    </div>
  );
}

export const pictures: Record<string, Picture> = {
  'b03-mehrfach': forWorkshop(p => <KreuzePicture rows={p.data} s={p.s} step={p.step} who={p.who} names={p.workshop.names} onChange={p.setData} onWho={p.pickWho} />),
  'b03-haeufigkeit': forWorkshop(p => <SaeulenPicture values={p.data} s={p.s} step={p.step} who={p.who} names={p.workshop.names} bounds={p.workshop.bounds} onChange={p.setData} onWho={p.pickWho} />),
  'b03-reihe': forWorkshop(p => <ReihePicture values={p.data} s={p.s} step={p.step} who={p.who} names={p.workshop.names} bounds={p.workshop.bounds} onChange={p.setData} onWho={p.pickWho} />),
  'b03-schiefe': forCard(p => <Schiefe top={p.value ?? FORM.einkommen.max} />),
  'b03-spannweite': forCard(p => <Spannweite top={p.value ?? LERNZEIT.max} />),
};
