// Bilder des Bereichs B2 „Datenwerkzeuge“ für alle Vorlagen. Schlüssel = `picture` der Erklärung, Bausteine und
// `forWorkshop`/`forCard`/`forSentence`/`forTable` aus ./kit.tsx.
// Eigene Stile in src/explain/areas/b02-datenwerkzeuge.css (lädt main.tsx automatisch). Anleitung: src/explain/AUTHORING.md.
import { num } from '../../../explain/format';
import { paare } from '../../../explain/content/b02-datenwerkzeuge/sorting';
import { Axis, forTable, linear, useWidth, type Picture } from './kit';

/**
 * Sortieren: die Paare (Lernzeit, Wissenstest) der fünf vor und nach dem Sortieren als Streudiagramm. Ganze Zeilen
 * sortiert, bleibt jeder Punkt an seinem Platz; nur eine Spalte sortiert, wandern die Punkte zu fremden Paaren.
 * Vorher: Kreis mit gestricheltem Rand, nachher: gefüllter Punkt; Farbe trägt nichts allein.
 */
function SortierPaare({ option }: { option: string }) {
  const [box, W] = useWidth();
  const p = paare(option), bewegt = p.filter(q => q.vorher.x !== q.nachher.x);
  const left = 52, right = W - 24, top = 34, AXIS = 214;
  const X = linear([5.5, 11], [left, right]), Y = linear([8, 15], [AXIS, top]);
  const satz = bewegt.length
    ? `${bewegt.length} von ${p.length} Punkten wandern: Diese Personen haben jetzt eine fremde Lernzeit, ihr Wissenstest blieb. Die Paare stimmen nicht mehr.`
    : 'Alle Punkte bleiben an ihrem Platz: Jede Person behält ihre Lernzeit und ihren Wissenstest. Nur die Reihenfolge der Zeilen ist neu.';
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={266} viewBox={`0 0 ${W} 266`} role="img" aria-label={`Streudiagramm Lernzeit und Wissenstest der fünf Befragten, vorher und nachher. ${satz}`}>
        <text className="xw-t" x={left} y={16}>○ vorher</text>
        <text className="xw-t" x={left + 84} y={16}>● nachher</text>
        {bewegt.map(q => <line key={`weg-${q.person}`} className="b02-weg" x1={X(q.vorher.x)} y1={Y(q.vorher.y)} x2={X(q.nachher.x)} y2={Y(q.nachher.y)} />)}
        {p.map(q => <circle key={`vorher-${q.person}`} className="b02-vorher" cx={X(q.vorher.x)} cy={Y(q.vorher.y)} r={9} />)}
        {p.map(q => <g key={`nachher-${q.person}`}>
          <circle className="b02-nachher" cx={X(q.nachher.x)} cy={Y(q.nachher.y)} r={5} />
          <text className="xw-t" x={X(q.nachher.x) + 12} y={Y(q.nachher.y) - 8}>{q.person}</text>
        </g>)}
        <Axis scale={X} ticks={[6, 7, 8, 9, 10, 11]} at={AXIS} from={left} to={right} labelGap={20} title="Lernzeit (h)" format={v => num(v)} />
        <Axis scale={Y} ticks={[9, 11, 13, 15]} at={left} from={AXIS} to={top} orient="left" labelGap={24} title="Wissenstest" />
      </svg>
      <p className="xw-note">{satz}</p>
    </div>
  );
}

export const pictures: Record<string, Picture> = {
  'b02-sortieren-paare': forTable(p => <SortierPaare option={p.option} />),
};
