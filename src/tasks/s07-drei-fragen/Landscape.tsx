import { de } from '../kit/numbers';
import type { ItemId } from './content';
import { facetLetters, labelOf, type TripleStats } from './domain';

export type Mark = { key: string; label: string };

const f3 = (v: number) => de(v, 3);
const step = (lo: number, hi: number) => (hi - lo > 0.3 ? 0.1 : 0.05);
function domain(values: number[]): [number, number, number] {
  const lo = Math.min(...values), hi = Math.max(...values), s = step(lo, hi);
  const a = Math.floor(lo / s) * s, b = Math.ceil(hi / s) * s;
  return [a, b > a ? b : a + s, s];
}

/** Koordinatenkreuz aller 35 Kurzskalen: Stimmigkeit α (x) gegen Stellvertreter-Wert r (y). */
export function Landscape({ triples: all, marks, duty, showFacets }: { triples: TripleStats[]; marks: Mark[]; duty: ItemId | null; showFacets: boolean }) {
  // Nicht berechenbare Kurzskalen (zu wenige vollständige Fälle) stehen nur in der Tabelle, mit „–“.
  const triples = all.filter(t => Number.isFinite(t.alpha) && Number.isFinite(t.r));
  const W = 600, H = 400, L = 58, R = 24, T = 20, B = 52;
  const [x0, x1, sx] = domain(triples.map(t => t.alpha)), [y0, y1, sy] = domain(triples.map(t => t.r));
  const x = (v: number) => L + ((v - x0) / (x1 - x0)) * (W - L - R);
  const y = (v: number) => H - B - ((v - y0) / (y1 - y0)) * (H - T - B);
  const ticks = (a: number, b: number, s: number) => Array.from({ length: Math.round((b - a) / s) + 1 }, (_, i) => a + i * s);
  const bestAlpha = triples.find(t => t.rankAlpha === 1)!, bestR = triples.find(t => t.rankR === 1)!;
  const byKey = Object.fromEntries(triples.map(t => [t.key, t]));
  const grouped = new Map<string, string[]>();
  for (const m of marks) if (byKey[m.key]) grouped.set(m.key, [...(grouped.get(m.key) ?? []), m.label]);
  const own = [...grouped.entries()].map(([key, labels]) => ({ t: byKey[key], label: labels.join(' = ') }));
  const summary = `${triples.length} Kurzskalen: Stimmigkeit α von ${f3(Math.min(...triples.map(t => t.alpha)))} bis ${f3(bestAlpha.alpha)}, Stellvertreter-Wert r von ${f3(Math.min(...triples.map(t => t.r)))} bis ${f3(bestR.r)}. `
    + `Stimmigste: ${labelOf(bestAlpha.items)} (Stellvertreter Platz ${bestAlpha.rankR}). Bester Stellvertreter: ${labelOf(bestR.items)} (Stimmigkeit Platz ${bestR.rankAlpha}).`
    + own.map(o => ` ${o.label}: ${labelOf(o.t.items)}, α ${f3(o.t.alpha)}, r ${f3(o.t.r)}.`).join('');
  return <figure className="s07-land">
    <div className="s07-scroll" tabIndex={0} role="region" aria-label="Koordinatenkreuz der Kurzskalen">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={summary}>
        {ticks(x0, x1, sx).map(v => <g key={`x${v}`}>
          <line x1={x(v)} x2={x(v)} y1={T} y2={H - B} className="grid" />
          <text x={x(v)} y={H - B + 18} textAnchor="middle">{de(v, 2)}</text>
        </g>)}
        {ticks(y0, y1, sy).map(v => <g key={`y${v}`}>
          <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} className="grid" />
          <text x={L - 8} y={y(v) + 4} textAnchor="end">{de(v, 2)}</text>
        </g>)}
        <text x={(L + W - R) / 2} y={H - 10} textAnchor="middle" className="axis">Stimmigkeit α der drei Fragen →</text>
        <text transform={`translate(16 ${(T + H - B) / 2}) rotate(-90)`} textAnchor="middle" className="axis">Stellvertreter-Wert r →</text>
        {triples.map(t => {
          const cls = duty ? (t.items.includes(duty) ? 'dot duty' : 'dot faded') : 'dot';
          return <circle key={t.key} cx={x(t.alpha)} cy={y(t.r)} r={4} className={cls}><title>{`${labelOf(t.items)}: α ${f3(t.alpha)}, r ${f3(t.r)}`}</title></circle>;
        })}
        <text x={x(bestAlpha.alpha) - 8} y={y(bestAlpha.r) + 16} textAnchor="end" className="champ">stimmigste</text>
        <text x={x(bestR.alpha)} y={y(bestR.r) - 10} textAnchor="middle" className="champ">bester Stellvertreter</text>
        {own.map(o => <g key={o.t.key} className="own">
          <circle cx={x(o.t.alpha)} cy={y(o.t.r)} r={8} />
          <text x={x(o.t.alpha) + 12} y={y(o.t.r) + 4}>{o.label}</text>
        </g>)}
      </svg>
    </div>
    <figcaption>Jeder Punkt ist eine der 35 möglichen Kurzskalen. Rechts liegen die stimmigen, oben die guten Stellvertreter.{duty ? ` Dunkel: alle Kurzskalen mit ${duty}.` : ''} Die Tabelle darunter nennt alle Werte.</figcaption>
    <details className="s07-table-wrap">
      <summary>Alle {all.length} Kurzskalen als Tabelle</summary>
      <div className="s07-scroll" tabIndex={0} role="region" aria-label="Tabelle der Kurzskalen">
        <table className="s07-table">
          <caption>Sortiert nach Stimmigkeit; Rang in Klammern (1 = höchster Wert).{showFacets ? ' Seiten: V = Volkssouveränität, E = Anti-Elitismus, H = Einheit des Volkes.' : ''}</caption>
          <thead><tr><th scope="col">Kurzskala</th>{showFacets && <th scope="col">Seiten</th>}<th scope="col">α (Rang)</th><th scope="col">r (Rang)</th><th scope="col">Markierung</th></tr></thead>
          <tbody>{[...all].sort((a, b) => a.rankAlpha - b.rankAlpha).map(t => {
            const mark = grouped.get(t.key)?.join(' = ') ?? '';
            return <tr key={t.key} className={mark ? 'own' : duty && t.items.includes(duty) ? 'duty' : ''}>
              <th scope="row">{labelOf(t.items)}</th>
              {showFacets && <td>{facetLetters(t.items)}</td>}
              <td>{f3(t.alpha)} ({t.rankAlpha})</td>
              <td>{f3(t.r)} ({t.rankR})</td>
              <td>{mark}</td>
            </tr>;
          })}</tbody>
        </table>
      </div>
    </details>
  </figure>;
}
