import { de } from '../kit/numbers';
import { CARD_IDS, cardById, type CardId } from './content';
import { CURRENCIES, measureLabel, ranks, VIEW_LABELS, type Reveal, type View } from './domain';

/** Rangverlauf aller Kandidaten über vier Währungen (V | Gamma | Tau-b | r); die eigene Karte ist hervorgehoben. */
export function RankChart({ data, view, own }: { data: Reveal; view: View; own: CardId | null }) {
  const byCurrency = CURRENCIES.map(m => ranks(Object.fromEntries(CARD_IDS.map(id => [id, data[view][id][m]]))));
  const rows = Math.max(...byCurrency.map(r => Object.keys(r).length));
  const W = 640, top = 34, step = 24, left = 190, right = 190, colX = (i: number) => left + i * ((W - left - right) / (CURRENCIES.length - 1));
  const y = (rank: number) => top + (rank - 1) * step;
  const leader = (m: number) => cardById[(Object.entries(byCurrency[m]).find(([, r]) => r === 1)?.[0] ?? CARD_IDS[0]) as CardId].title;
  const summary = `Rangliste ${VIEW_LABELS[view]}: ${CURRENCIES.map((m, i) => `${measureLabel(m)} Platz 1 ${leader(i)}`).join('; ')}.${own ? ` Deine Karte ${cardById[own].title}: Plätze ${byCurrency.map(r => r[own] ?? '–').join(', ')}.` : ''}`;
  return <figure className="s05-rank">
    <svg viewBox={`0 0 ${W} ${top + rows * step}`} role="img" aria-label={summary}>
      {CURRENCIES.map((m, i) => <text key={m} x={colX(i)} y={16} textAnchor="middle" className="head">{measureLabel(m)}</text>)}
      {CARD_IDS.map(id => {
        const pts = byCurrency.map((r, i) => (r[id] ? [colX(i), y(r[id]!)] as const : null));
        const mine = id === own, joker = cardById[id].joker;
        const path = pts.filter(Boolean).map((pt, k) => `${k ? 'L' : 'M'}${pt![0]} ${pt![1]}`).join(' ');
        const first = pts.find(Boolean), last = [...pts].reverse().find(Boolean);
        return <g key={id} className={mine ? 'own' : ''}>
          {path && <path d={path} fill="none" stroke={mine ? '#242822' : '#b9c7a5'} strokeWidth={mine ? 3 : 1.5} strokeDasharray={joker ? '4 3' : undefined} />}
          {pts.map((pt, i) => pt && <circle key={i} cx={pt[0]} cy={pt[1]} r={mine ? 5 : 3.5} fill={mine ? '#242822' : '#8fa58a'} />)}
          {first && <text x={first[0] - 10} y={first[1] + 4} textAnchor="end">{cardById[id].title}</text>}
          {last && <text x={last[0] + 10} y={last[1] + 4}>{cardById[id].title}</text>}
        </g>;
      })}
    </svg>
    <table className="s05-rank-table">
      <caption>Werte {VIEW_LABELS[view]} (Platz in Klammern)</caption>
      <thead><tr><th scope="col">Kandidat</th>{CURRENCIES.map(m => <th key={m} scope="col">{measureLabel(m)}</th>)}</tr></thead>
      <tbody>{CARD_IDS.map(id => <tr key={id} className={id === own ? 'own' : ''}>
        <th scope="row">{cardById[id].title}{cardById[id].joker ? ' (Joker)' : ''}</th>
        {CURRENCIES.map((m, i) => <td key={m}>{Number.isFinite(data[view][id][m]) ? `${de(data[view][id][m], 3)} (${byCurrency[i][id]})` : '–'}</td>)}
      </tr>)}</tbody>
    </table>
  </figure>;
}
