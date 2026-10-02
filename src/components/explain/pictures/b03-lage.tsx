// Bilder des Bereichs B3 „Lage und Verteilung“ für alle Vorlagen. Schlüssel = `picture` der Erklärung, Bausteine und
// `forWorkshop`/`forCard`/`forSentence`/`forTable` aus ./kit.tsx.
// Eigene Stile in src/explain/areas/b03-lage.css (lädt main.tsx automatisch). Anleitung: src/explain/AUTHORING.md.
import { num } from '../../../explain/format';
import { rangeWithTop, LERNZEIT } from '../../../explain/content/b03-lage/range';
import { formWithTop, FORM } from '../../../explain/content/b03-lage/shape';
import { niceTicks } from './sample';
import { Axis, forCard, linear, useWidth, type Picture } from './kit';

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

export const pictures: Record<string, Picture> = {
  'b03-schiefe': forCard(p => <Schiefe top={p.value ?? FORM.einkommen.max} />),
  'b03-spannweite': forCard(p => <Spannweite top={p.value ?? LERNZEIT.max} />),
};
