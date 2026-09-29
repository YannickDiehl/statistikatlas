import type { SavFile } from '../../sandbox/readSav';
import { Feedback } from '../kit/Feedback';
import { HintLadder } from '../kit/HintLadder';
import { PartnerToggle } from '../kit/PartnerToggle';
import { PlenumCard } from '../kit/PlenumCard';
import { RBlock } from '../kit/RBlock';
import { RoleBrief } from '../kit/RoleBrief';
import type { TaskProps } from '../types';
import { benNotes, hints, R_SOLUTION, S02_VARS, SHEET_IDS, sheets, type S02Var, type SheetId } from './content';
import { benEntries, cellKey, checkCell, checkNumbers, decodeRow, diffEntries, encodeRow, gradeCell, plenumLines, scanCode, type Entries, type S02State } from './domain';
import { PaperSheet } from './PaperSheet';

const sheetById = Object.fromEntries(sheets.map(s => [s.id, s])) as Record<SheetId, (typeof sheets)[number]>;

function EntryGrid({ sav, state, set }: { sav: SavFile; state: S02State; set: (patch: Partial<S02State>) => void }) {
  const setCell = (sheet: SheetId, v: S02Var, value: string) =>
    set({ entries: { ...state.entries, [sheet]: { ...state.entries[sheet], [v]: value } } });
  const messages: string[] = [];
  const open: { sheet: SheetId; variable: S02Var }[] = [];
  for (const sheet of SHEET_IDS) for (const v of S02_VARS) {
    const input = state.entries[sheet][v];
    if (!state.graded) {
      const check = checkCell(sav, v, input);
      if (input.trim() && check.state === 'invalid') messages.push(`Bogen ${sheet}, ${v}: ${check.message}`);
      continue;
    }
    const grade = gradeCell(sav, sheetById[sheet], v, input);
    if (grade.status === 'open') open.push({ sheet, variable: v });
    else if (grade.status !== 'match') messages.push(`Bogen ${sheet}, ${v}: ${grade.message}`);
  }
  return <>
    <table className="sandbox-table s02-grid">
      <caption className="sr-only">Erfassungsraster: je Variable ein Code pro Bogen</caption>
      <thead><tr><th scope="col">Variable</th>{SHEET_IDS.map(id => <th key={id} scope="col">Bogen {id}</th>)}</tr></thead>
      <tbody>{S02_VARS.map(v => <tr key={v}>
        <th scope="row"><code>{v}</code></th>
        {SHEET_IDS.map(id => {
          const grade = state.graded ? gradeCell(sav, sheetById[id], v, state.entries[id][v]).status : '';
          return <td key={id}><input type="text" inputMode="numeric" className={grade ? `grade-${grade}` : ''} aria-label={`Bogen ${id}, ${v}`}
            value={state.entries[id][v]} onChange={e => setCell(id, v, e.target.value)} /></td>;
        })}
      </tr>)}</tbody>
    </table>
    {messages.length > 0 && <ul className="task-feedback">{messages.map(m => <li key={m} className="tone-warn">{m}</li>)}</ul>}
    {!state.graded
      ? <button className="primary" onClick={() => set({ graded: true })}>Erfassung abschließen</button>
      : open.length > 0 && <div className="s02-rules">
          <p>Hier musstest du entscheiden. Schreib deine Regel so auf, dass die nächste Person genauso erfasst:</p>
          {open.map(({ sheet, variable }) => {
            const key = cellKey(sheet, variable);
            return <label key={key} className="sandbox-label">Bogen {sheet}, {variable} (du hast {state.entries[sheet][variable]} eingetragen)
              <input type="text" value={state.rules[key] ?? ''} onChange={e => set({ rules: { ...state.rules, [key]: e.target.value } })} />
            </label>;
          })}
        </div>}
  </>;
}

function DoubleEntry({ sav, state, set }: { sav: SavFile; state: S02State; set: (patch: Partial<S02State>) => void }) {
  const partner = state.mode === 'pair' ? decodeRow(state.partnerCode) : null;
  const other: Entries | null = state.mode === 'pair' ? partner : benEntries(sav);
  const who = state.mode === 'pair' ? 'Partner:in' : 'Ben';
  const diffs = other ? diffEntries(state.entries, other) : [];
  const settle = (sheet: SheetId, variable: S02Var, choice: 'mine' | 'other') => {
    const key = cellKey(sheet, variable);
    const entries = choice === 'other' && other
      ? { ...state.entries, [sheet]: { ...state.entries[sheet], [variable]: other[sheet][variable] } }
      : state.entries;
    set({ entries, settled: { ...state.settled, [key]: choice } });
  };
  return <>
    {state.mode === 'pair' && <div className="task-grid">
      <label>Dein Zeilencode (zum Abtippen für die andere Person)<input type="text" readOnly value={encodeRow(state.entries)} /></label>
      <label>Zeilencode deiner Partnerin oder deines Partners<input type="text" value={state.partnerCode} onChange={e => set({ partnerCode: e.target.value })} /></label>
    </div>}
    {state.mode === 'pair' && state.partnerCode.trim() && !partner && <p className="sandbox-error">Der Code ist unvollständig. Er beginnt mit „S02:“ und hat 18 Werte.</p>}
    {other && (diffs.length === 0
      ? <p className="sandbox-note">Keine Abweichungen zu {who}.</p>
      : <ul className="s02-diffs">{diffs.map(({ sheet, variable }) => {
          const key = cellKey(sheet, variable);
          const settled = state.settled[key];
          return <li key={key}>
            <span>Bogen {sheet}, <code>{variable}</code>: du {state.entries[sheet][variable] || 'leer'} · {who} {other[sheet][variable] || 'leer'}</span>
            <span className="sandbox-chips">
              <button aria-pressed={settled === 'mine'} onClick={() => settle(sheet, variable, 'mine')}>Meine Zahl bleibt</button>
              <button aria-pressed={settled === 'other'} onClick={() => settle(sheet, variable, 'other')}>Übernehmen</button>
            </span>
            {settled && state.mode === 'solo' && benNotes[key] && <small>{benNotes[key]}</small>}
          </li>;
        })}</ul>)}
  </>;
}

export function Datenerfassung({ data, state, onChange, onConcept }: TaskProps<S02State>) {
  const set = (patch: Partial<S02State>) => onChange({ ...state, ...patch });
  const scan = state.revealed ? scanCode(data.sav, -42) : null;
  const numberNotes = checkNumbers(data.sav, state.numbers);
  const allRight = numberNotes.length === 3 && numberNotes.every(n => n.tone === 'ok');
  return <div className="task s02">
    <RoleBrief role="Datenerfasser:in im Feldinstitut" title="Erster Tag in der Datenerfassung">
      <p>Du fängst heute in der Erfassungsstelle eines Feldinstituts an. Institut und Kollegium sind erfunden, die Daten nicht: Fast jede dritte Zeile im ALLBUS 2023 war einmal Papier – 1.656 Menschen haben ihren Fragebogen per Post zurückgeschickt. Jemand hat aus den Kreuzen Zahlen gemacht. Heute bist du das.</p>
      <p>Mach aus jedem der drei Bögen eine Zeile, die so im ALLBUS stehen könnte. Auf dem Papier stehen Wörter; welche Zahl du eintippst, verrät nur das Codebuch. Nicht jedes Kreuz ist eindeutig. Wo du entscheiden musst, entscheidest du – und schreibst deine Regel auf. Alles wird doppelt erfasst. Jede Abweichung landet wieder bei dir.</p>
    </RoleBrief>
    <PartnerToggle mode={state.mode} onChange={mode => set({ mode })}
      solo="Dein Kollege Ben (erfunden) hat die Bögen schon einmal erfasst. Du gleichst mit ihm ab."
      pair="A und B erfassen blind jede:r für sich. Danach tippt ihr gegenseitig eure Zeilencodes ab. In R übernimmt A den Block „Papier“, B den Block „Umwandeln“." />

    <section className="task-step">
      <h3>1 · Welche Zahl gehört zu welchem Wort?</h3>
      <p>Lies deine Datei in R ein und schau dir die sechs Variablen der Bögen im Codebuch an.</p>
      <RBlock code={'library(mariposa)\nlibrary(dplyr)\n\nallbus <- read_spss(file.choose())\n\n' + hints.codes.solution} />
      <HintLadder hint={hints.codes} onConcept={onConcept} />
    </section>

    <section className="task-step">
      <h3>2 · Erfassen</h3>
      <div className="s02-sheets">{sheets.map(s => <PaperSheet key={s.id} sheet={s} />)}</div>
      <EntryGrid sav={data.sav} state={state} set={set} />
    </section>

    {state.graded && <section className="task-step">
      <h3>3 · Doppelerfassung</h3>
      <DoubleEntry sav={data.sav} state={state} set={set} />
    </section>}

    <section className="task-step">
      <h3>4 · Wie speichert der ALLBUS Papier?</h3>
      <p>Filter in R die Papierbögen und schau nach, was der ALLBUS bei Doppelkreuzen und bei „weiß nicht“ gespeichert hat. Wandle danach die Wahlabsicht in Wörter und zurück in Zahlen um.</p>
      <HintLadder hint={hints.paper} onConcept={onConcept} />
      <HintLadder hint={hints.convert} onConcept={onConcept} file="datenerfassung.R" />
      <div className="task-grid">
        <label>Papierbögen mit −42 bei pa01<input type="text" inputMode="numeric" value={state.numbers.mfn} onChange={e => set({ numbers: { ...state.numbers, mfn: e.target.value } })} /></label>
        <label>Papierbögen mit −8 bei st01<input type="text" inputMode="numeric" value={state.numbers.dk} onChange={e => set({ numbers: { ...state.numbers, dk: e.target.value } })} /></label>
        <label>Zahl der AfD nach dem Umwandeln<input type="text" inputMode="numeric" value={state.numbers.afd} onChange={e => set({ numbers: { ...state.numbers, afd: e.target.value } })} /></label>
      </div>
      <Feedback notes={numberNotes} />
      {!state.revealed
        ? <button onClick={() => set({ revealed: true })}>Wo steht −42 im ganzen Datensatz?</button>
        : scan && <p className="s02-reveal" role="status">
            {scan.total.toLocaleString('de-DE')} Zellen mit −42 („Mehrfachnennung“) in {scan.variables} Variablen: {scan.byMode.map(m => `${m.label} ${m.n.toLocaleString('de-DE')}`).join(' · ')}.
            {scan.byMode.every(m => m.label === 'MAIL' || m.n === 0) && ' Diesen Code gibt es nur, weil es Papier gibt.'}
          </p>}
    </section>

    <section className="task-step">
      <h3>5 · Freigabe</h3>
      <label className="sandbox-label" htmlFor="s02-rule">Welche deiner Regeln soll für alle 1.656 Papierbögen gelten?</label>
      <input id="s02-rule" type="text" value={state.plenumRule} onChange={e => set({ plenumRule: e.target.value })} />
      <PlenumCard title="Eine Person, viele Zeilen" lines={plenumLines(state)} file="datenerfassung-plenum.md" />
      {allRight && <details className="s02-solution"><summary>Dein ganzes R-Skript zum Mitnehmen</summary><RBlock code={R_SOLUTION} file="datenerfassung.R" /></details>}
    </section>
  </div>;
}
