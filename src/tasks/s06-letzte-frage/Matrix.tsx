import type { CorMatrix } from '../kit/means';
import { de } from '../kit/numbers';
import { MATRIX_LABELS, MATRIX_VARS, PAIRS, type PairId } from './content';
import { readMarks } from './domain';

const pairAt = (i: number, j: number) => PAIRS.find(p => p.i === j && p.j === i)!;
const rows = MATRIX_VARS.slice(1), cols = MATRIX_VARS.slice(0, -1);

/** Vor der Rechnung: Welche Zellen müssten bei echter Auslosung ≈ 0 sein? Untere Dreiecksmatrix zum Anklicken. */
export function MatrixMarks({ marks, locked, onToggle }: { marks: PairId[]; locked: boolean; onToggle: (p: PairId) => void }) {
  return <div className="s04-scroll" tabIndex={0} role="region" aria-label="Korrelationsmatrix zum Markieren">
    <table className="s06-matrix">
      <caption>Klicke die Zellen an, die bei echter Auslosung ≈ 0 sein müssten.</caption>
      <thead><tr><td />{cols.map(c => <th key={c} scope="col">{MATRIX_LABELS[c]}</th>)}</tr></thead>
      <tbody>{rows.map((r, ri) => <tr key={r}>
        <th scope="row">{MATRIX_LABELS[r]}</th>
        {cols.map((c, ci) => {
          if (ci > ri) return <td key={c} />;
          const pair = pairAt(ri + 1, ci), on = marks.includes(pair.id);
          return <td key={c}><button aria-pressed={on} disabled={locked} aria-label={`${MATRIX_LABELS[pair.a]} × ${MATRIX_LABELS[pair.b]}: müsste ≈ 0 sein`} onClick={() => onToggle(pair.id)}>{on ? '≈ 0' : '·'}</button></td>;
        })}
      </tr>)}</tbody>
    </table>
  </div>;
}

const VERDICT: Record<ReturnType<typeof readMarks>[number]['verdict'], string> = { hält: 'hält', verletzt: '≠ 0 – über die Modi nicht ausgelost', übersehen: 'nicht markiert', 'kein Loscheck': '' };

/** Nach der Rechnung: die Matrix aus der Datei, deine Markierung eingezeichnet. */
export function MatrixReveal({ m, marks, weighted }: { m: CorMatrix; marks: PairId[]; weighted: boolean }) {
  const readings = readMarks(m, marks);
  return <div className="s04-scroll" tabIndex={0} role="region" aria-label="Korrelationsmatrix aus deiner Datei">
    <table className="s06-matrix s06-matrix-values">
      <caption>Korrelationsmatrix über alle Selbstausfüller:innen, {weighted ? 'gewichtet' : 'ungewichtet'} (Pearson-r, paarweises n). Umrandet: deine Markierung.</caption>
      <thead><tr><td />{cols.map(c => <th key={c} scope="col">{MATRIX_LABELS[c]}</th>)}</tr></thead>
      <tbody>{rows.map((r, ri) => <tr key={r}>
        <th scope="row">{MATRIX_LABELS[r]}</th>
        {cols.map((c, ci) => {
          if (ci > ri) return <td key={c} />;
          const pair = pairAt(ri + 1, ci), x = readings.find(y => y.pair === pair.id)!;
          // Höchstens 45 % Deckung: Die Schrift bleibt dunkel und hat auf jeder Zelle mindestens 4,5 : 1 Kontrast.
          const alpha = Math.min(0.45, Math.abs(x.r) * 0.75);
          return <td key={c} className={`${x.marked ? 'marked' : ''} ${x.verdict === 'verletzt' ? 'broken' : ''}`}
            style={{ background: `rgba(40, 50, 62, ${Number.isFinite(alpha) ? alpha : 0})` }}>
            <span>{de(x.r, 3)}</span>{(x.marked || VERDICT[x.verdict]) && <small>{[x.marked ? 'markiert' : '', VERDICT[x.verdict]].filter(Boolean).join(' · ')}</small>}
          </td>;
        })}
      </tr>)}</tbody>
    </table>
  </div>;
}
