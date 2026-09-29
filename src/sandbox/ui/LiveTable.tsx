import { columnShare, type AnalysisResult } from '../analysis';
import { count, num1, pct } from '../format';
import type { Evidence } from '../questions';
import { evidenceText, type TableLabels } from '../state';

const ROWS = [0, 1] as const;
const CELLS = ['yes', 'no'] as const;

export function LiveTable({ result, labels, base, weighted, evidence, onBase, onEvidence }: {
  result: AnalysisResult;
  labels: TableLabels;
  base: 'row' | 'col';
  weighted: boolean;
  evidence: Evidence | null;
  onBase: (base: 'row' | 'col') => void;
  onEvidence: (evidence: Evidence) => void;
}) {
  const shares = [result.target, result.comparison];
  const value = (row: 0 | 1, cell: 'yes' | 'no') => base === 'row'
    ? (cell === 'yes' ? shares[row] : 1 - shares[row])
    : columnShare(result.table, row, cell);
  return <div className="sandbox-live">
    <div className="sandbox-chips" role="group" aria-label="Prozentbasis">
      <button aria-pressed={base === 'row'} onClick={() => onBase('row')}>Zeilenprozente</button>
      <button aria-pressed={base === 'col'} onClick={() => onBase('col')}>Spaltenprozente</button>
    </div>
    <table className="sandbox-table">
      <thead><tr><th scope="col">Gruppe</th><th scope="col">{labels.outcome[0]}</th><th scope="col">{labels.outcome[1]}</th><th scope="col">n</th></tr></thead>
      <tbody>{ROWS.map(row => <tr key={row}>
        <th scope="row">{labels.groups[row]}</th>
        {CELLS.map(cell => {
          const v = value(row, cell);
          const selected = evidence?.row === row && evidence.cell === cell && evidence.base === base;
          return <td key={cell}>
            <button aria-pressed={selected} disabled={!Number.isFinite(v)} onClick={() => onEvidence({ row, cell, base })}
              aria-label={`${pct(v)}, ${labels.groups[row]}, ${labels.outcome[cell === 'yes' ? 0 : 1]}: als Beleg markieren`}>{pct(v)}</button>
          </td>;
        })}
        <td>{count(result.table.n[row])}</td>
      </tr>)}</tbody>
    </table>
    <p className="sandbox-note">
      {base === 'row' ? 'Basis: jede Zeile. Wie viele in jeder Gruppe antworten so?' : 'Basis: jede Spalte. Wie verteilt sich eine Antwort auf die Gruppen?'}
      {weighted ? ' Gewichtet mit wghtpew.' : ' Ungewichtet.'} n = ungewichtete Fallzahl.
    </p>
    <div className="sandbox-metrics">
      <div><span>Abstand {labels.groups[0]} − {labels.groups[1]}</span><strong>{Number.isFinite(result.difference) ? `${num1(result.difference)} Punkte` : '–'}</strong></div>
      <div><span>Dein Beleg</span><strong>{evidence ? evidenceText(labels, result, evidence) : 'Tippe eine Zelle an'}</strong></div>
    </div>
  </div>;
}
