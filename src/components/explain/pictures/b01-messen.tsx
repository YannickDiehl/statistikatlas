// Bilder des Bereichs B1 „Messen und Skalen“ für alle Vorlagen. Schlüssel = `picture` der Erklärung, Bausteine und
// `forWorkshop`/`forCard`/`forSentence`/`forTable` aus ./kit.tsx.
// Eigene Stile in src/explain/areas/b01-messen.css (lädt main.tsx automatisch). Anleitung: src/explain/AUTHORING.md.
import { num } from '../../../explain/format';
import { paareFuer, R_FUENF } from '../../../explain/content/b01-messen/pairs';
import { Axis, forCard, linear, useWidth, type Picture } from './kit';

/** Fünf Wertepaare (Lernzeit, Wissenstest) als Streudiagramm, wie erhoben oder mit getrennt sortierten Spalten. */
function Paare({ sorted }: { sorted: boolean }) {
  const [box, W] = useWidth();
  const pts = paareFuer(sorted), r = sorted ? R_FUENF.sortiert : R_FUENF.erhoben;
  const left = 58, right = W - 64, top = 40, base = 196;
  const x = linear([5, 11], [left, right]), y = linear([8, 15], [base, top]);
  const label = sorted
    ? `Streudiagramm der fünf Lernzeiten und Testergebnisse, beide Spalten getrennt sortiert. Die Punkte steigen fast auf einer Linie, r ≈ ${num(r)}; sie gehören zu keiner Person.`
    : `Streudiagramm der fünf Befragten P001 bis P005, Lernzeit nach rechts, gelöste Aufgaben nach oben. Die Punkte liegen ohne klare Richtung, r ≈ ${num(r)}.`;
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={262} viewBox={`0 0 ${W} 262`} role="img" aria-label={label}>
        <Axis scale={x} ticks={[5, 6, 7, 8, 9, 10, 11]} at={base} from={left} to={right} labelGap={22} title="Lernzeit in Stunden" />
        <Axis orient="left" scale={y} ticks={[8, 10, 12, 14]} at={left} from={base} to={top} labelGap={24} title="Aufgaben" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle className={`b01-pt${sorted ? ' b01-pt-fake' : ''}`} cx={x(p.x)} cy={y(p.y)} r={7} />
            {p.id && <text className="xw-t" x={x(p.x) + 11} y={y(p.y) + 5}>{p.id}</text>}
          </g>
        ))}
        <text className="xw-t xw-strong" x={left} y={20}>{sorted ? `Getrennt sortiert: r ≈ ${num(r)}` : `Wie erhoben: r ≈ ${num(r)}`}</text>
      </svg>
    </div>
  );
}

export const pictures: Record<string, Picture> = {
  'b01-paare': forCard(p => <Paare sorted={(p.value ?? 0) >= 0.5} />),
};
