import { de } from '../kit/numbers';
import { quantile6, type Describe } from './domain';

/** Neutrale Farben – bewusst keine Parteifarben. Fehlende Angaben grau. */
const PALETTE = ['#5b7c6f', '#8fa58a', '#b9c7a5', '#c9b98a', '#a38b6d', '#7d6b5d', '#9aa3b0', '#6f7f94'];
const MISSING = '#d9d6ce';

export type HallGroup = { code: number; label: string; seats: number; missing: boolean };

/** Saal 1: 100 Stühle als 10×10-Raster, gefüllt in der Reihenfolge der Gruppen. */
export function Hall({ groups }: { groups: HallGroup[] }) {
  const cells: { group: HallGroup; color: string }[] = [];
  let k = 0;
  groups.forEach(g => {
    const color = g.missing ? MISSING : PALETTE[k++ % PALETTE.length];
    for (let i = 0; i < Math.min(Math.max(0, g.seats), 120); i++) cells.push({ group: g, color });
  });
  const shown = cells.slice(0, 120), rows = Math.max(10, Math.ceil(shown.length / 10));
  const total = groups.reduce((a, g) => a + Math.max(0, g.seats), 0);
  const summary = groups.map(g => `${g.label} ${g.seats}`).join(', ');
  return <figure className="s03-hall">
    <svg viewBox={`0 0 300 ${rows * 30}`} role="img" aria-label={`Saal mit ${total} Stühlen: ${summary}`}>
      {shown.map((c, i) => <rect key={i} x={(i % 10) * 30 + 4} y={Math.floor(i / 10) * 30 + 4} width={22} height={22} rx={5} fill={c.color} />)}
    </svg>
    <figcaption>
      {groups.map((g, i) => {
        const color = g.missing ? MISSING : PALETTE[groups.slice(0, i).filter(x => !x.missing).length % PALETTE.length];
        return <span key={g.code}><i style={{ background: color }} aria-hidden="true" />{g.label} {g.seats}</span>;
      })}
    </figcaption>
  </figure>;
}

/** Saal 2: 100 Stühle in einer Reihe, sortiert nach Stunden (Lehnenhöhe = Stunden), mit Quartilen und Durchschnitt. */
export function ChairRow({ values, stats }: { values: number[]; stats: Describe }) {
  const sorted = [...values].sort((a, b) => a - b);
  const chairs = Array.from({ length: 100 }, (_, i) => quantile6(sorted, (i + 0.5) / 100));
  const max = Math.max(...chairs, 1);
  const W = 600, H = 170, base = 140, step = W / 100;
  const meanIndex = chairs.filter(c => c <= stats.mean).length;
  const marks: [string, number][] = [['Q1', 25], ['Median', 50], ['Q3', 75]];
  return <div className="s03-row-scroll" tabIndex={0} aria-label="Stuhlreihe">
    <svg viewBox={`0 0 ${W} ${H}`} className="s03-row" role="img"
      aria-label={`100 Stühle sortiert nach Stunden. Q1 ${de(stats.q1)}, Median ${de(stats.median)}, Q3 ${de(stats.q3)}, Durchschnitt ${de(stats.mean)}. ${Math.round(stats.above * 100)} Stühle stehen rechts vom Durchschnitt.`}>
      {chairs.map((c, i) => <rect key={i} x={i * step + 0.6} y={base - (c / max) * 110} width={step - 1.2} height={(c / max) * 110} fill={i >= meanIndex ? '#5b7c6f' : '#b9c7a5'} />)}
      {marks.map(([label, pos]) => <g key={label}>
        <line x1={pos * step} x2={pos * step} y1={base} y2={base + 10} stroke="#242822" />
        <text x={pos * step} y={base + 24} textAnchor="middle">{label}</text>
      </g>)}
      <line x1={meanIndex * step} x2={meanIndex * step} y1={14} y2={base} stroke="#8b2e2e" strokeDasharray="4 3" />
      <text x={meanIndex * step} y={11} textAnchor="middle" className="mean">Ø {de(stats.mean)}</text>
    </svg>
  </div>;
}
