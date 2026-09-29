import { useMemo } from 'react';
import { Feedback } from '../kit/Feedback';
import { HintLadder } from '../kit/HintLadder';
import { parseNumber } from '../kit/numbers';
import { PartnerToggle } from '../kit/PartnerToggle';
import { PlenumCard } from '../kit/PlenumCard';
import { RBlock } from '../kit/RBlock';
import { RoleBrief } from '../kit/RoleBrief';
import type { TaskProps } from '../types';
import { ChairRow, Hall } from './Charts';
import { CHAIR_CODES, hints, R_SOLUTION, SELECTIONS, type Selection } from './content';
import { codeName, describeHours, diagnoseSeats, hoursFor, plenumLines, rawCounts, validCodes, checkSign, type Measure, type S03State } from './domain';

export function Stuehle({ data, state, onChange, onConcept }: TaskProps<S03State>) {
  const set = (patch: Partial<S03State>) => onChange({ ...state, ...patch });
  const pv = data.sav.byName.get('pv01')!;
  const counts = useMemo(() => rawCounts(pv), [pv]);
  const valid = useMemo(() => validCodes(pv), [pv]);
  const present = CHAIR_CODES.filter(c => counts.has(c));
  const included = [...valid, ...CHAIR_CODES.filter(c => state.rule.includes(c))];
  const entered = new Map(included.map(c => [c, parseNumber(state.seats[String(c)] ?? '') ?? 0]));
  const diagnosis = state.built ? diagnoseSeats(pv, state.rule, entered) : null;
  const toggle = (code: number) => set({ rule: state.rule.includes(code) ? state.rule.filter(c => c !== code) : [...state.rule, code] });
  const rowSelection: Selection = state.sign.selection || 'gefragt';
  const rowValues = useMemo(() => hoursFor(data.sav, rowSelection), [data.sav, rowSelection]);
  const rowStats = useMemo(() => describeHours(rowValues), [rowValues]);

  return <div className="task s03">
    <RoleBrief role="Szenograf:in einer Ausstellung" title="Deutschland in 100 Stühlen">
      <p>Die Wanderausstellung „Deutschland in 100 Stühlen“ (fiktiv) braucht deine Baupläne. Die Kuratorin schreibt:</p>
      <p>„Im ersten Saal stehen 100 Stühle. Jeder steht für ein Prozent – nur wovon? Auf jede Lehne kommt eine Antwort auf die Frage, welche Partei man wählen würde, wenn am Sonntag Bundestagswahl wäre. Besucher:innen sollen ihren Stuhl finden können, auch wenn sie keine Partei nennen würden. Im zweiten Saal stellen wir 100 Stühle in eine Reihe, sortiert nach Wochenarbeitsstunden. Darüber hängt ein Schild: ‚Hier arbeitet man im Mittel __ Stunden.‘ Wer einen Stuhl bekommt und was auf dem Schild steht, entscheidest du. Am Freitag gehen die Pläne in die Schreinerei – gebaut wird, was du einträgst.“</p>
    </RoleBrief>
    <PartnerToggle mode={state.mode} onChange={mode => set({ mode })}
      solo="Du planst beide Säle selbst und entscheidest, wer einen Stuhl bekommt."
      pair="A plant den „Saal der Vielen“ (alle Befragten bekommen einen Stuhl), B den „Saal der Stimmen“ (nur klare Antworten). Gebaut wird ein Saal: Einigt euch und schreibt den Saaltext gemeinsam. In Saal 2 rechnet A „wie gefragt“, B „nur Vollzeit“." />

    <section className="task-step">
      <h3>Saal 1 · Wer fehlt in der Tabelle?</h3>
      <p>Zähl in R die Wahlabsicht aus. Neben den Parteien gibt es Lücken – jede mit eigenem Code. Schreib zu jeder Lücke einen Halbsatz: Wer ist das?</p>
      <RBlock code={'library(mariposa)\nlibrary(dplyr)\n\nallbus <- read_spss(file.choose())\n\nallbus %>% fre(pv01) %>% summary()\nna_frequencies(allbus$pv01)'} />
      <div className="task-grid">
        {present.map(c => <label key={c}>{c} {codeName(pv, c)}<input type="text" value={state.who[String(c)] ?? ''} placeholder="Das sind Menschen, die …"
          onChange={e => set({ who: { ...state.who, [String(c)]: e.target.value } })} /></label>)}
      </div>
    </section>

    <section className="task-step">
      <h3>Saal 1 · Stuhlregel und Sitzplan</h3>
      <p>Wer bekommt einen Stuhl? Die Parteien und „würde nicht wählen“ sitzen immer. Entscheide für jede Lücke.</p>
      <div className="sandbox-chips" role="group" aria-label="Stuhlregel">
        {present.map(c => <button key={c} aria-pressed={state.rule.includes(c)} onClick={() => toggle(c)}>{codeName(pv, c)}: {state.rule.includes(c) ? 'Stuhl' : 'kein Stuhl'}</button>)}
      </div>
      <div className="task-grid">
        <label>Warum (nicht) für „weiß nicht“?<input type="text" value={state.reasons.dk} onChange={e => set({ reasons: { ...state.reasons, dk: e.target.value } })} /></label>
        <label>Warum (nicht) für „nicht wahlberechtigt“?<input type="text" value={state.reasons.nw} onChange={e => set({ reasons: { ...state.reasons, nw: e.target.value } })} /></label>
      </div>
      <p>Filtere in R nach deiner Regel und trag die Stühle je Gruppe ein (zusammen 100):</p>
      <div className="task-grid">
        {included.map(c => <label key={c}>{codeName(pv, c)}<input type="text" inputMode="numeric" value={state.seats[String(c)] ?? ''}
          onChange={e => set({ seats: { ...state.seats, [String(c)]: e.target.value }, built: false })} /></label>)}
      </div>
      <p className="sandbox-note">Summe: {[...entered.values()].reduce((a, b) => a + b, 0)} Stühle</p>
      <button className="primary" onClick={() => set({ built: true })}>Saal bauen</button>
      {diagnosis && <>
        <Feedback notes={diagnosis.notes} />
        <Hall groups={included.map(c => ({ code: c, label: codeName(pv, c), seats: entered.get(c) ?? 0, missing: c < 0 }))} />
      </>}
      <HintLadder hint={hints.hall} onConcept={onConcept} />
      {state.built && <>
        <label className="sandbox-label" htmlFor="s03-hall-text">Saaltext (höchstens zwei Sätze): Wofür steht ein Stuhl?</label>
        <textarea id="s03-hall-text" value={state.hallText} onChange={e => set({ hallText: e.target.value })} />
      </>}
    </section>

    <section className="task-step">
      <h3>Saal 2 · Die Stuhlreihe</h3>
      <p>Wem wurde die Frage nach den Wochenarbeitsstunden gestellt? Beschreib die Stunden in R, wähl eine Fallauswahl und ein Maß für das Schild – und zähl, wie viele von 100 Stühlen rechts vom Durchschnitt stehen.</p>
      <div className="task-grid">
        <label>Zahl auf dem Schild<input type="text" inputMode="decimal" value={state.sign.value} onChange={e => set({ sign: { ...state.sign, value: e.target.value } })} /></label>
        <label>Maß<select value={state.sign.measure} onChange={e => set({ sign: { ...state.sign, measure: e.target.value as Measure | '' } })}>
          <option value="">bitte wählen</option><option value="mean">Mittelwert</option><option value="median">Median</option>
        </select></label>
        <label>Fallauswahl<select value={state.sign.selection} onChange={e => set({ sign: { ...state.sign, selection: e.target.value as Selection | '' } })}>
          <option value="">bitte wählen</option>{SELECTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select></label>
        <label>Stühle rechts vom Durchschnitt<input type="text" inputMode="numeric" value={state.sign.right} onChange={e => set({ sign: { ...state.sign, right: e.target.value } })} /></label>
      </div>
      <Feedback notes={checkSign(data.sav, state.sign)} />
      {state.sign.value.trim() && state.sign.selection && <ChairRow values={rowValues} stats={rowStats} />}
      <HintLadder hint={hints.row} onConcept={onConcept} file="stuehle.R" />
    </section>

    <PlenumCard title="Deutschland in 100 Stühlen" lines={plenumLines(state)} file="stuehle-plenum.md" />
    {state.built && state.sign.right.trim() && <details className="s02-solution"><summary>Ein vollständiges R-Skript zum Mitnehmen</summary><RBlock code={R_SOLUTION} file="stuehle.R" /></details>}
  </div>;
}
