import { de } from '../kit/numbers';
import { PERSONS } from './content';
import { odds3, type TafelRow } from './domain';

const pp = (x: number) => `${x > 0 ? '+' : ''}${de(100 * x, 1)}`;

/** Die Dolmetscher-Tafel: dieselbe Stufe mehr Pflichtgefühl als Logit, Chance und Wahrscheinlichkeit. */
export function Tafel({ rows, or }: { rows: TafelRow[]; or: number }) {
  const rel = (r: TafelRow) => `${de(100 * (r.risk[1] - r.risk[0]) / r.risk[0], 0)} %`;
  return <figure className="s10-tafel">
    <div className="s10-scroll" tabIndex={0} role="region" aria-label="Dolmetscher-Tafel">
      <table>
        <caption>Dolmetscher-Tafel: eine Stufe mehr Pflichtgefühl in drei Sprachen</caption>
        <thead><tr><th scope="col">Ratsmitglied</th><th scope="col">Logit</th><th scope="col">Chance</th><th scope="col">Wahrscheinlichkeit</th></tr></thead>
        <tbody>{rows.map(r => <tr key={r.person}>
          <th scope="row">{PERSONS[r.person].name}</th>
          <td>{de(r.logit[0], 2)} → {de(r.logit[1], 2)} <strong>(+{de(r.logit[1] - r.logit[0], 2)})</strong></td>
          <td>{odds3(r.odds[0])} → {odds3(r.odds[1])} <strong>(×{de(or, 2)})</strong></td>
          <td>{de(100 * r.prob[0], 1)} → {de(100 * r.prob[1], 1)} % <strong>({pp(r.prob[1] - r.prob[0])} Prozentpunkte)</strong></td>
        </tr>)}</tbody>
      </table>
    </div>
    <figcaption>Zwei Spalten sagen „gleich“, eine sagt „bei Jana viel mehr“. Nichtwahl-Risiko: {rows.map(r =>
      `${PERSONS[r.person].name} ${de(100 * r.risk[0], 1)} → ${de(100 * r.risk[1], 1)} % (${rel(r)})`).join(', ')}.</figcaption>
  </figure>;
}
