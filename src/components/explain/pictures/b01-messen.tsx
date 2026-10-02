// Bilder des Bereichs B1 „Messen und Skalen“ für alle Vorlagen. Schlüssel = `picture` der Erklärung, Bausteine und
// `forWorkshop`/`forCard`/`forSentence`/`forTable` aus ./kit.tsx.
// Eigene Stile in src/explain/areas/b01-messen.css (lädt main.tsx automatisch). Anleitung: src/explain/AUTHORING.md.
import { num } from '../../../explain/format';
import { paareFuer, R_FUENF } from '../../../explain/content/b01-messen/pairs';
import { attenuation, MF } from '../../../explain/content/b01-messen/measurement-error';
import { ohneSpitze } from '../../../explain/content/b01-messen/missing-mechanisms';
import { mean } from '../../../explain/content/b01-messen/shared';
import { baseSurvey } from '../../../explain/sample';
import { Axis, forCard, linear, MarkLine, useWidth, type Picture } from './kit';

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

/**
 * Messmodell als Balken: die Streuung der gemessenen Lernzeiten Var(X), zerlegt in die echte Streuung Var(T) und die
 * Fehlerstreuung Var(E) eines zufälligen Fehlers mit Standardabweichung `sigma`; darunter Reliabilität und r.
 */
function Messfehler({ sigma }: { sigma: number }) {
  const [box, W] = useWidth();
  const a = attenuation(sigma), err = sigma * sigma, left = 16, right = W - 16;
  const x = linear([0, MF.varT + 36], [left, right]), top = 58, h = 34;
  const label = `Balken: Streuung der gemessenen Lernzeiten ${num(a.varX)} h², davon echt ${num(MF.varT)} h² und Messfehler ${num(err)} h². Reliabilität ${num(a.rel)}, r mit dem Wissenstest etwa ${num(a.r)}.`;
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={196} viewBox={`0 0 ${W} 196`} role="img" aria-label={label}>
        <text className="xw-t xw-strong" x={left} y={20}>Var(X) = {num(MF.varT)} + {num(err)} = {num(a.varX)} h²</text>
        <text className="xw-t" x={left} y={44}>echt</text>
        {err > 0 && <text className="xw-t" x={Math.min(x(MF.varT) + 6, right - 70)} y={44}>Messfehler</text>}
        <rect className="xw-bar-pos" x={x(0)} y={top} width={x(MF.varT) - x(0)} height={h} />
        {err > 0 && <rect className="xw-bar-neg" x={x(MF.varT)} y={top} width={Math.max(2, x(MF.varT + err) - x(MF.varT))} height={h} />}
        <text className="xw-t" x={left} y={top + h + 30}>Reliabilität: {num(MF.varT)} / {num(a.varX)} ≈ {num(a.rel)}</text>
        <text className="xw-t xw-strong" x={left} y={top + h + 56}>r mit dem Wissenstest: {num(MF.r)} → etwa {num(a.r)}</text>
      </svg>
    </div>
  );
}

/**
 * Haushaltseinkommen der 200 Befragten als Punkte; die `k` höchsten verschweigen ihre Angabe (hohle Punkte).
 * Gestrichelt der Mittelwert aller 200, durchgezogen der Mittelwert der übrigen.
 */
function Fehlmuster({ k }: { k: number }) {
  const [box, W] = useWidth();
  const values = baseSurvey().map(r => r.values.einkommen), all = mean(values), o = ohneSpitze(values, k);
  const gone = new Set(values.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]).slice(0, k).map(([, i]) => i));
  const left = 20, right = W - 20, x = linear([0, 9000], [left, right]), top = 48, base = 170;
  const label = `Punktdiagramm der Haushaltseinkommen aller 200 Befragten. ${k > 0 ? `Die ${k} höchsten fehlen. Mittelwert aller 200: ${num(all)} €, der übrigen ${o.n}: ${num(o.m)} €.` : `Niemand fehlt, Mittelwert ${num(all)} €.`}`;
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={236} viewBox={`0 0 ${W} 236`} role="img" aria-label={label}>
        {values.map((v, i) => <circle key={i} className={gone.has(i) ? 'b01-gone' : 'xw-s-dot'} cx={x(v)} cy={top + 14 + ((i * 37) % 97)} r={gone.has(i) ? 4.5 : 3.5} />)}
        <MarkLine x={x(all)} from={top} to={base} label={`alle: ${num(all, 0)} €`} />
        {k > 0 && <line className="b01-rest" x1={x(o.m)} x2={x(o.m)} y1={top} y2={base} />}
        {k > 0 && <text className="xw-t xw-strong" x={Math.max(left + 60, x(o.m))} y={base + 52} textAnchor="middle">übrige: {num(o.m, 0)} €</text>}
        <Axis scale={x} ticks={[0, 2000, 4000, 6000, 8000]} at={base} from={left} to={right} labelGap={22} format={v => v.toLocaleString('de-DE')} />
        <text className="xw-t" x={left} y={18}>Haushaltseinkommen in €</text>
        <text className="xw-t" x={right} y={18} textAnchor="end">{k > 0 ? `○ fehlt (${k})` : 'niemand fehlt'}</text>
      </svg>
    </div>
  );
}

export const pictures: Record<string, Picture> = {
  'b01-paare': forCard(p => <Paare sorted={(p.value ?? 0) >= 0.5} />),
  'b01-messfehler': forCard(p => <Messfehler sigma={p.value ?? 2} />),
  'b01-fehlmuster': forCard(p => <Fehlmuster k={Math.round(p.value ?? 20)} />),
};
