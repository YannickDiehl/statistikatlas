import { de } from '../kit/numbers';
import { shortcut, type Way } from './domain';

const count = (x: number) => x.toLocaleString('de-DE');

/** Nenner-Bild: dieselbe Zelle (dieselben Menschen) in drei Nennern. */
export function DenominatorBars({ cell, nonvoters, distrusting, all }: { cell: number; nonvoters: number; distrusting: number; all: number }) {
  const bars: [string, number][] = [
    [`unter den ${count(nonvoters)} Nichtwählenden`, nonvoters],
    [`unter den ${count(distrusting)} Misstrauenden`, distrusting],
    [`unter allen ${count(all)} Befragten`, all],
  ];
  const W = 800, scale = (x: number) => (x / all) * (W - 4);
  const label = bars.map(([text, n]) => `${text}: ${de(100 * cell / n)} %`).join('; ');
  return <figure className="s04-bars">
    <div className="s04-scroll" tabIndex={0} role="region" aria-label="Nenner-Bild">
    <svg viewBox={`0 0 ${W} 150`} className="s04-bars-svg" role="img" aria-label={`Dieselben ${cell} Menschen, drei Nenner – ${label}`}>
      {bars.map(([text, n], i) => <g key={text} transform={`translate(2 ${i * 50 + 6})`}>
        <rect width={Math.max(scale(n), 3)} height={18} rx={4} fill="#d9d6ce" />
        <rect width={Math.max(scale(cell), 3)} height={18} rx={4} fill="#5b7c6f" />
        <text x={0} y={36}>{text}: <tspan className="value">{de(100 * cell / n)} %</tspan></text>
      </g>)}
    </svg>
    </div>
    <figcaption>Das dunkle Stück sind in allen drei Balken dieselben {cell} Menschen. Nur der Nenner wechselt: {bars.map(([text, n]) => `${de(100 * cell / n)} % ${text}`).join(' · ')}.</figcaption>
  </figure>;
}

/** Streifen: die 18 vorbereiteten Lesarten, die eigene Lesart und die 87 % als Fähnchen „anderer Nenner“. */
export function ReadingStrip({ readings, own, claimed }: {
  readings: { way: Way; distrusting: number; others: number }[];
  own: { way: Way; distrusting: number; others: number } | null;
  claimed: number;
}) {
  const W = 600, x = (p: number) => 20 + (p / 100) * (W - 40);
  const lo = Math.min(...readings.map(r => r.distrusting)), hi = Math.max(...readings.map(r => r.distrusting));
  const summary = `${readings.length} Lesarten: Von den Misstrauenden wollen ${de(lo)} bis ${de(hi)} % nicht wählen.${own ? ` Deine Lesart ${shortcut(own.way)}: ${de(own.distrusting)} % gegenüber ${de(own.others)} % bei den Übrigen.` : ''} Die ${claimed} % haben einen anderen Nenner.`;
  return <figure className="s04-strip">
    <div className="s04-scroll" tabIndex={0} role="region" aria-label="Streifen der Lesarten">
    <svg viewBox={`0 0 ${W} 120`} role="img" aria-label={summary}>
      <line x1={x(0)} x2={x(100)} y1={70} y2={70} stroke="#242822" />
      {[0, 25, 50, 75, 100].map(p => <g key={p}>
        <line x1={x(p)} x2={x(p)} y1={66} y2={74} stroke="#242822" />
        <text x={x(p)} y={90} textAnchor="middle">{p} %</text>
      </g>)}
      <line x1={x(50)} x2={x(50)} y1={24} y2={70} stroke="#8b2e2e" strokeDasharray="4 3" />
      {readings.map((r, i) => <g key={i}>
        <line x1={x(r.others)} x2={x(r.distrusting)} y1={58 - (i % 3) * 8} y2={58 - (i % 3) * 8} stroke="#b9c7a5" />
        <circle cx={x(r.distrusting)} cy={58 - (i % 3) * 8} r={3.5} fill="#8fa58a" />
      </g>)}
      {own && <g>
        <line x1={x(own.others)} x2={x(own.distrusting)} y1={38} y2={38} stroke="#242822" strokeWidth={2} />
        <circle cx={x(own.distrusting)} cy={38} r={6} fill="#242822" />
        <circle cx={x(own.others)} cy={38} r={4} fill="#fff" stroke="#242822" strokeWidth={2} />
        <text x={x(own.distrusting)} y={24} textAnchor="middle" className="own">du</text>
      </g>}
      <g>
        <line x1={x(claimed)} x2={x(claimed)} y1={14} y2={70} stroke="#7d6b5d" />
        <path d={`M${x(claimed)} 14 h 34 l -6 6 l 6 6 h -34 z`} fill="#c9b98a" />
        <text x={x(claimed) + 4} y={24} className="flag">{claimed} %</text>
      </g>
    </svg>
    </div>
    <figcaption>Jede Linie verbindet die Übrigen (links) mit den Misstrauenden (Punkt). Die gestrichelte Linie markiert 50 %, das Fähnchen die {claimed} % der Pressemitteilung – sie haben einen anderen Nenner.</figcaption>
  </figure>;
}
