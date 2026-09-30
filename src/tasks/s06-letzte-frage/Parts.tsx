import { Feedback, type Note } from '../kit/Feedback';
import type { TukeyRow } from '../kit/means';
import { de } from '../kit/numbers';
import { VERSIONS, type VersionId } from './content';
import { pct, pp, versionPair, type TEntry, type Trap, type TukeyKey } from './domain';

/** Zwei Quoten und ein t-Wert – ein t-Test aus R. */
export function TTestFields({ id, legend, labels, entry, onChange, notes, diff }: {
  id: string; legend: string; labels: [string, string]; entry: TEntry; onChange: (e: TEntry) => void; notes: Note[]; diff: string | null;
}) {
  const set = (patch: Partial<TEntry>) => onChange({ ...entry, ...patch });
  return <fieldset className="s06-fields" id={id}>
    <legend>{legend}</legend>
    <div className="task-grid">
      <label>{labels[0]}<input type="text" inputMode="decimal" maxLength={12} value={entry.a} onChange={e => set({ a: e.target.value })} /></label>
      <label>{labels[1]}<input type="text" inputMode="decimal" maxLength={12} value={entry.b} onChange={e => set({ b: e.target.value })} /></label>
      <label>t (Welch)<input type="text" inputMode="decimal" maxLength={12} value={entry.t} onChange={e => set({ t: e.target.value })} /></label>
    </div>
    <Feedback notes={notes} />
    {diff && <p className="s06-own">{diff}</p>}
  </fieldset>;
}

/** Die vier Fassungen als Auswahl. */
export function VersionChips({ value, onChange, label }: { value: VersionId | ''; onChange: (v: VersionId) => void; label: string }) {
  return <div className="sandbox-chips" role="group" aria-label={label}>
    {VERSIONS.map(v => <button key={v.id} aria-pressed={value === v.id} onClick={() => onChange(v.id)}>{v.id}</button>)}
  </div>;
}

export function VersionTable() {
  return <div className="s04-scroll" tabIndex={0} role="region" aria-label="Die vier Fassungen">
    <table className="s06-table s06-versions">
      <caption>Die vier Fassungen der Einladungsfrage (splt23_3)</caption>
      <thead><tr><th scope="col">Fassung</th><th scope="col">Betrag</th><th scope="col">Wo steht das Geld im Fragetext?</th></tr></thead>
      <tbody>{VERSIONS.map(v => <tr key={v.id}><th scope="row">{v.id} <small>(Code {v.code})</small></th><td>{v.money}</td><td>{v.placement}{v.repeat ? ' („mit“ Wiederholung)' : ' („ohne“ Wiederholung)'}</td></tr>)}</tbody>
    </table>
  </div>;
}

/** Überraschungsmoment: „mit“ bleibt stehen, „ohne“ springt – die Vergleichsgruppe wechselt. */
export function TrapChart({ trap, view, onView }: { trap: Trap; view: 'all' | 'online'; onView: (v: 'all' | 'online') => void }) {
  const values = trap[view], n = trap.n[view];
  const same = Math.abs(trap.all[1] - trap.online[1]) < 0.0005;
  const summary = `Zusagequote „ohne“ Wiederholung: alle Selbstausfüller:innen ${pct(trap.all[0])}, nur online ${pct(trap.online[0])}. „mit“ Wiederholung: alle ${pct(trap.all[1])}, nur online ${pct(trap.online[1])}.`;
  return <figure className="s06-trap">
    <div className="sandbox-chips" role="group" aria-label="Vergleichsgruppe">
      <button aria-pressed={view === 'all'} onClick={() => onView('all')}>alle Selbstausfüller:innen</button>
      <button aria-pressed={view === 'online'} onClick={() => onView('online')}>nur online</button>
    </div>
    <div className="s06-bars" role="img" aria-label={summary}>
      {(['„ohne“', '„mit“'] as const).map((label, k) => <div key={label} className="s06-bar">
        <span className="s06-bar-value">{pct(values[k])}</span>
        <div className="s06-bar-track"><div className="s06-bar-fill" style={{ height: `${Math.max(0, Math.min(100, 100 * values[k]))}%` }} /></div>
        <span className="s06-bar-label">{label} Wiederholung<br /><small>n = {n[k].toLocaleString('de-DE')}</small></span>
      </div>)}
    </div>
    <figcaption>
      {same ? '„mit“ bleibt stehen – alle Fälle mit Wiederholung sind online.' : '„mit“ ändert sich kaum.'} „ohne“ {trap.online[0] > trap.all[0] ? 'springt' : 'wechselt'} von {pct(trap.all[0])} auf {pct(trap.online[0])}. <strong>Nicht die Wiederholung hat sich verändert, sondern die Vergleichsgruppe.</strong>
      {trap.nPaperOhne > 0 && <> Unter „ohne“ steckten {trap.nPaperOhne.toLocaleString('de-DE')} Papier-Befragte mit einer Zusagequote von {pct(trap.paperOhne)}.</>}
      {' '}Der Unterschied „mit“ − „ohne“: über alle {pp(trap.all[1] - trap.all[0])}, nur online {pp(trap.online[1] - trap.online[0])}.
    </figcaption>
  </figure>;
}

/** Tukey-Paare wie in summary(); nach der zweiten Enthüllung mit der gewichteten Spalte. */
export function TukeyTable({ rows, weighted }: { rows: TukeyRow[]; weighted: TukeyRow[] | null }) {
  const wp = (r: TukeyRow) => weighted?.find(x => (x.a === r.a && x.b === r.b) || (x.a === r.b && x.b === r.a))?.p;
  return <div className="s04-scroll" tabIndex={0} role="region" aria-label="Tukey-Paarvergleiche">
    <table className="s06-table">
      <caption>Tukey-Paarvergleiche nur online (Differenz in Prozentpunkten, mariposa-Zeile in Klammern)</caption>
      <thead><tr><th scope="col">Paar</th><th scope="col">Differenz</th><th scope="col">95-%-Intervall</th><th scope="col">p (Tukey)</th>{weighted && <th scope="col">p gewichtet</th>}</tr></thead>
      <tbody>{rows.map(r => <tr key={r.label} className={r.p < 0.05 ? 's06-sig' : ''}>
        <th scope="row">{versionPair(r.label as TukeyKey)} <small>({r.label})</small></th>
        <td>{pp(r.diff)}</td>
        <td>[{de(100 * r.lower, 1)}; {de(100 * r.upper, 1)}]</td>
        <td>{de(r.p, 3)}</td>
        {weighted && <td>{de(wp(r) ?? NaN, 3)}</td>}
      </tr>)}</tbody>
    </table>
  </div>;
}

/** Fälle je Fassung und Modus (wie crosstab(splt23_3, mode)). */
export function CellTable({ cells }: { cells: { online: number[]; paper: number[] } }) {
  return <div className="s04-scroll" tabIndex={0} role="region" aria-label="Wer bekam welche Fassung?">
    <table className="s06-table">
      <caption>Wer bekam welche Fassung? (Fälle)</caption>
      <thead><tr><th scope="col">Fassung</th><th scope="col">online</th><th scope="col">Papier</th></tr></thead>
      <tbody>{VERSIONS.map((v, i) => <tr key={v.id}><th scope="row">{v.id}</th><td>{cells.online[i].toLocaleString('de-DE')}</td><td>{cells.paper[i].toLocaleString('de-DE')}</td></tr>)}</tbody>
    </table>
  </div>;
}
