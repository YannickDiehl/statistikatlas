import { de } from '../kit/numbers';
import type { InputItem } from './content';
import { levelName, type ParadeRow, type ProbeRow, type Spread } from './domain';

const INK = '#242822', LAZY = '#9b9a8e', ANSWER = '#6f8f6a';

/** Besucherprobe: je Person Antwort (Punkt), Anzeige des Automaten (Strich) und Faulpelz (gestrichelt); das Residuum als Linie. */
export function ProbeChart({ rows, item }: { rows: ProbeRow[]; item: InputItem }) {
  const W = 640, left = 110, right = 24, top = 30, step = 18;
  const x = (v: number) => left + ((v - 1) / 5) * (W - left - right);
  const H = top + rows.length * step + 10;
  const summary = `Besucherprobe mit ${rows.length} Befragten: Antwort, Anzeige des Automaten und des Faulpelzes je Person. Der Automat trifft ${rows.filter(r => r.hit).length}-mal auf ±1, der Faulpelz ${rows.filter(r => r.lazyHit).length}-mal.`;
  return <figure className="s08-probe">
    <div className="s08-scroll" tabIndex={0} role="region" aria-label="Besucherprobe als Grafik">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={summary}>
        {[1, 2, 3, 4, 5, 6].map(v => <g key={v}>
          <line x1={x(v)} x2={x(v)} y1={top - 8} y2={H - 6} stroke="#e4e2d8" />
          <text x={x(v)} y={16} textAnchor="middle" className="axis">{v}</text>
        </g>)}
        {rows.map((r, i) => {
          const cy = top + i * step + step / 2;
          return <g key={i}>
            <text x={left - 10} y={cy + 4} textAnchor="end">{item.groups ? `Alter ${r.x}` : `Eingabe ${r.x}`}</text>
            <line x1={x(r.show)} x2={x(r.y)} y1={cy} y2={cy} stroke={INK} strokeWidth={2} />
            <line x1={x(r.lazy)} x2={x(r.lazy)} y1={cy - 6} y2={cy + 6} stroke={LAZY} strokeWidth={2} strokeDasharray="2 2" />
            <line x1={x(r.show)} x2={x(r.show)} y1={cy - 7} y2={cy + 7} stroke={INK} strokeWidth={3} />
            <circle cx={x(r.y)} cy={cy} r={4.5} fill={ANSWER} />
          </g>;
        })}
      </svg>
    </div>
    <figcaption>Skala 1 (sehr unzufrieden) bis 6 (sehr zufrieden). Punkt = Antwort, dicker Strich = Anzeige des Automaten, gestrichelt = Faulpelz, Linie = wie weit der Automat danebenliegt.</figcaption>
    <details className="s08-table-toggle"><summary>Als Tabelle</summary>
      <div className="s08-scroll" tabIndex={0} role="region" aria-label="Besucherprobe als Tabelle">
        <table className="s08-table">
          <thead><tr><th scope="col">{item.groups ? 'Alter' : 'Eingabe'}</th><th scope="col">Antwort</th><th scope="col">Automat</th><th scope="col">daneben</th><th scope="col">Faulpelz</th><th scope="col">daneben</th></tr></thead>
          <tbody>{rows.map((r, i) => <tr key={i}>
            <td>{r.x}</td><td>{r.y}</td><td>{de(r.show, 2)}</td><td>{de(r.y - r.show, 2)}{r.hit ? ' ✓' : ''}</td><td>{de(r.lazy, 2)}</td><td>{de(r.y - r.lazy, 2)}{r.lazyHit ? ' ✓' : ''}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </details>
  </figure>;
}

/** Residuen-SD je Eingabestufe als Balken mit Bezugslinie beim Standardfehler der Schätzung; darunter die Residuenmittel. */
export function SpreadChart({ spread, item }: { spread: Spread; item: InputItem }) {
  const groups = spread.groups;
  const W = 640, left = 190, right = 70, top = 24, step = 24;
  const top2 = Math.max(spread.max, spread.sigma) * 1.15 || 1;
  const x = (v: number) => left + (v / top2) * (W - left - right);
  const H = top + groups.length * step + 16;
  const summary = `Residuen-SD je Stufe von ${de(spread.min, 2)} (${levelName(item, spread.minAt)}) bis ${de(spread.max, 2)} (${levelName(item, spread.maxAt)}); über alle ${de(spread.sigma, 2)}.`;
  return <figure className="s08-spread">
    <div className="s08-scroll" tabIndex={0} role="region" aria-label="Streuung je Stufe als Grafik">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={summary}>
        <line x1={x(spread.sigma)} x2={x(spread.sigma)} y1={top - 10} y2={H - 8} stroke={INK} strokeDasharray="4 3" />
        <text x={x(spread.sigma)} y={12} textAnchor="middle" className="axis">alle: {de(spread.sigma, 2)}</text>
        {groups.map((g, i) => {
          const cy = top + i * step;
          return <g key={g.value}>
            <text x={left - 10} y={cy + 14} textAnchor="end">{g.label}</text>
            {Number.isFinite(g.sd)
              ? <><rect x={left} y={cy + 3} width={Math.max(0, x(g.sd) - left)} height={step - 8} fill={g.value === spread.maxAt ? '#8a8676' : '#b9c7a5'} />
                <text x={x(g.sd) + 6} y={cy + 14}>{de(g.sd, 2)}{g.n < 30 ? ` (n = ${g.n})` : ''}</text></>
              : <text x={left + 4} y={cy + 14}>zu wenige Fälle</text>}
          </g>;
        })}
      </svg>
    </div>
    <div className="s08-scroll" tabIndex={0} role="region" aria-label="Streuung und Residuenmittel als Tabelle">
      <table className="s08-table">
        <caption>Je Stufe: Fälle, Residuen-SD (wie weit er typischerweise danebenliegt) und Residuenmittel (liegt die Gerade dort zu hoch oder zu tief?)</caption>
        <thead><tr><th scope="col">Stufe</th><th scope="col">n</th><th scope="col">SD</th><th scope="col">Mittel</th></tr></thead>
        <tbody>{groups.map(g => <tr key={g.value}><th scope="row">{g.label}</th><td>{g.n}</td><td>{de(g.sd, 3)}</td><td>{de(g.mean, 2)}</td></tr>)}</tbody>
      </table>
    </div>
  </figure>;
}

/** Automaten-Parade: alle zehn Eingaben aus der eigenen Datei. */
export function ParadeTable({ rows, own }: { rows: ParadeRow[]; own: string | null }) {
  return <div className="s08-scroll" tabIndex={0} role="region" aria-label="Automaten-Parade">
    <table className="s08-table s08-parade">
      <caption>Automaten-Parade: Steigung, R², Treffer auf ±1 gegen den Faulpelz und Streuung der Residuen je Stufe</caption>
      <thead><tr><th scope="col">Eingabe</th><th scope="col">b</th><th scope="col">R²</th><th scope="col">Treffer</th><th scope="col">Faulpelz</th><th scope="col">daneben je Stufe</th></tr></thead>
      <tbody>{rows.map(r => <tr key={r.item.id} className={r.item.id === own ? 'own' : ''}>
        <th scope="row">{r.item.title}</th><td>{de(r.b, 3)}</td><td>{de(r.r2, 3)}</td>
        <td>{de(100 * r.hit, 1)} %{r.hit < r.lazyHit - 1e-12 ? ' ↓' : ''}</td><td>{de(100 * r.lazyHit, 1)} %</td><td>{de(r.sdMin, 2)}–{de(r.sdMax, 2)}</td>
      </tr>)}</tbody>
    </table>
  </div>;
}
