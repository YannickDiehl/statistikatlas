// Bilder des Bereichs B7 „Verteilungsfamilien“ für alle Vorlagen. Schlüssel = `picture` der Erklärung, Bausteine und
// `forWorkshop`/`forCard`/`forSentence`/`forTable` aus ./kit.tsx.
// Eigene Stile in src/explain/areas/b07-verteilungen.css (lädt main.tsx automatisch). Anleitung: src/explain/AUTHORING.md.
import { num, pct } from '../../../explain/format';
import { baseSurvey } from '../../../explain/sample';
import { columnStats, dnorm, within } from '../../../explain/content/b07-verteilungen/dist';
import { inside } from '../../../explain/content/b07-verteilungen/normal';
import { AreaUnder, Axis, Bar, Curve, forCard, linear, useWidth, type Picture } from './kit';

/** Histogramm der Schlafdauer (halbe Stunden) mit der Normalverteilung x̄, s; markiert ist x̄ ± k · s. */
function NormalFit({ k }: { k: number }) {
  const [box, W] = useWidth();
  const { xs, n, mean, sd } = columnStats(baseSurvey(), 'schlafdauer');
  const width = 0.5, start = 4.5, bins = Array.from({ length: 11 }, (_, i) => start + i * width);
  const counts = bins.map(a => xs.filter(x => x >= a - 1e-9 && x < a + width - 1e-9).length);
  const curve = (x: number) => n * width * dnorm((x - mean) / sd) / sd;
  const top = Math.max(...counts, curve(mean)) * 1.08, base = 196, left = 30, right = W - 16;
  const X = linear([start, start + bins.length * width], [left, right]), Y = linear([0, top], [base, 52]);
  const lo = mean - k * sd, hi = mean + k * sd, count = within(xs, mean, sd, k);
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={246} viewBox={`0 0 ${W} 246`} role="img"
        aria-label={`Histogramm der Schlafdauer der 200 Befragten mit einer Normalverteilung. Markiert sind ${num(lo)} bis ${num(hi)} Stunden, höchstens ${num(k)} Standardabweichungen von der Mitte: im Modell ${pct(inside(k))}, in den Daten ${count} von ${n}.`}>
        {bins.map((a, i) => counts[i] > 0 && <Bar key={a} x={X(a) + 1} y={Y(counts[i])} width={X(a + width) - X(a) - 2} height={base - Y(counts[i])} tone="plain" />)}
        <AreaUnder f={curve} from={Math.max(start, lo)} to={Math.min(start + bins.length * width, hi)} x={X} y={Y} tone="pos" />
        <Curve f={curve} from={start} to={start + bins.length * width} x={X} y={Y} />
        <line className="xw-mean" x1={X(mean)} x2={X(mean)} y1={52} y2={base} />
        <text className="xw-t" x={X(mean) + 5} y={base - 6}>x̄</text>
        <Axis scale={X} ticks={[5, 6, 7, 8, 9, 10]} at={base} from={left} to={right} labelGap={20} title="Schlafdauer in Stunden pro Nacht" />
        <text className="xw-t xw-strong" x={left} y={16}>Grüne Fläche im Modell: {pct(inside(k))}</text>
        <text className="xw-t" x={left} y={36}>In den Daten: {count} von {n}</text>
      </svg>
    </div>
  );
}

export const pictures: Record<string, Picture> = {
  'b07-normal': forCard(p => <NormalFit k={p.value ?? 1} />),
};
