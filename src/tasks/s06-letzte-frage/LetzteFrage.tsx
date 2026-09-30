import { useMemo } from 'react';
import { Feedback } from '../kit/Feedback';
import { HintLadder } from '../kit/HintLadder';
import { PartnerToggle, type WorkMode } from '../kit/PartnerToggle';
import { PlenumCard } from '../kit/PlenumCard';
import { RBlock } from '../kit/RBlock';
import { RoleBrief } from '../kit/RoleBrief';
import type { TaskProps } from '../types';
import { hints, INSTITUTE, PLACEHOLDERS, R_SETUP, R_WEIGHTED, ROLE, ROLES, TEXTS, VERSIONS } from './content';
import {
  anovaDone, becauseNotes, checkEntry, checkF, checkP, checkR, checkShare, checkTukey, computeFor, gutFixed, withGutLock, lockMarks, markNotes, matrixReady, meansDone, plenumLines, pp,
  rScriptFor, statusS06, toggleMark, toggleTukey, trap, trapReady, tryTukey, TUKEY_KEYS, unlockMarks, versionPair, weightedNotes, type S06State, type TEntry,
} from './domain';
import { MatrixMarks, MatrixReveal } from './Matrix';
import { CellTable, TrapChart, TTestFields, TukeyTable, VersionChips, VersionTable } from './Parts';
import { Release } from './Release';

const roleLabel = (r: keyof typeof ROLES, mode: WorkMode) => (mode === 'pair' ? `${r === 'panel' ? 'A' : 'B'} · ${ROLES[r]}` : ROLES[r]);
const diffText = (grouping: 'rep' | 'amt', diff: number | null) =>
  diff === null ? null : `Deine Differenz aus deinen Quoten: ${grouping === 'rep' ? '„mit“ − „ohne“' : '10 € − 5 €'} = ${pp(diff)}.`;

export function LetzteFrage({ data, state, onChange, onConcept }: TaskProps<S06State>) {
  const c = useMemo(() => computeFor(data.sav), [data.sav]);
  const change = (next: S06State) => onChange(withGutLock(c, next));
  const set = (patch: Partial<S06State>) => change({ ...state, ...patch });
  const role = (r: keyof typeof ROLES) => <span className="s06-role">{roleLabel(r, state.mode)}</span>;
  const setEntry = (station: 's1' | 's3', key: 'rep' | 'amt', e: TEntry) => set({ [station]: { ...state[station], [key]: e } } as Partial<S06State>);
  const s1rep = checkEntry(c, 'all', 'rep', state.s1.rep), s1amt = checkEntry(c, 'all', 'amt', state.s1.amt);
  const s3rep = checkEntry(c, 'online', 'rep', state.s3.rep), s3amt = checkEntry(c, 'online', 'amt', state.s3.amt);
  const rRep = checkR(c, 'wiederholung-papier', state.r.repPaper), rAmt = checkR(c, 'betrag-papier', state.r.amtPaper);
  const means = VERSIONS.map((v, i) => checkShare(c, { scope: 'online', grouping: 'version', level: v.code }, state.anova.means[i]));
  const tukey = checkTukey(c, state), anova = anovaDone(c, state), gutFixedNow = gutFixed(c, state);
  const showMatrix = matrixReady(c, state), showTrap = trapReady(c, state), showWeighted = anova;
  const trapData = showTrap ? trap(c) : null;
  const matrix = state.matrixView === 'weighted' ? c.matrix.weighted : c.matrix.unweighted;
  const ownPoints = s1rep.valid && s1rep.diff !== null ? pp(s1rep.diff).replace(' Pp.', '') : null;

  return <div className="task s06">
    <RoleBrief role={ROLE} title="Die letzte Frage">
      <p><strong>Neuer Job: Panelaufbau beim {INSTITUTE}.</strong> Morgen um 9 Uhr geht unsere Jahresbefragung online. Ganz am Ende steht die Frage, von der unser Institut lebt: „Dürfen wir Sie zu weiteren Befragungen einladen?“ Wer Ja sagt, wird Teil unseres Panels. Offen ist nur noch, <em>wie</em> wir fragen: Versprechen wir 5 € oder 10 € (5 € fürs Ja und 5 € bei Teilnahme)? Nennen wir das Geld erst am Schluss der Frage – oder gleich am Anfang und am Schluss noch einmal?</p>
      <p>Raten musst du nicht. Der ALLBUS 2023 hat genau diese Frage als Experiment gestellt: Wer den Fragebogen selbst ausfüllte, online oder auf Papier, bekam eine von vier Fassungen (<code>splt23_3</code>). Die Antwort steht in <code>xr21</code> (1 = ja, 2 = nein).</p>
      <p>Bis 9 Uhr brauche ich von dir die Fassung, die wir programmieren, und die Zusagequote, die du der Geschäftsführung versprichst – dazu einen Satz, den wir ausdrücklich <em>nicht</em> behaupten. <strong>Deine Unterschrift steht unter der Freigabe.</strong></p>
    </RoleBrief>
    <PartnerToggle mode={state.mode} onChange={mode => set({ mode })}
      solo="Du spielst beide Rollen nacheinander: Als Panelaufbau rechnest du die t-Tests (Stationen 1 und 3a) und willst der Geschäftsführung eine starke Zahl liefern. Als Qualitätssicherung prüfst du mit Korrelationsmatrix, ANOVA und Tukey (Stationen 2 und 3b) und hast ein Vetorecht. Die Freigabe braucht am Ende beide Unterschriften."
      pair="A ist Panelaufbau: Stationen 1 und 3a (t-Tests) – A will der Geschäftsführung eine starke Zahl liefern. B ist Qualitätssicherung: Stationen 2 und 3b (Matrix, ANOVA, Tukey) – B hat ein Vetorecht. Die Freigabe braucht zwei Unterschriften mit je einem Satz." />
    <VersionTable />

    <section className="task-step">
      <h3>Vorab · Dein Bauchgefühl</h3>
      <p>Welche Fassung würdest du programmieren, und welche Zusagequote erwartest du online?</p>
      <VersionChips label="Fassung nach Bauchgefühl" value={state.gut.version} disabled={gutFixedNow} onChange={v => set({ gut: { ...state.gut, version: v } })} />
      <div className="task-grid">
        <label>Erwartete Zusagequote (%)<input type="text" inputMode="decimal" maxLength={12} value={state.gut.rate} disabled={gutFixedNow} onChange={e => set({ gut: { ...state.gut, rate: e.target.value } })} /></label>
      </div>
      <p className="sandbox-note">{gutFixedNow
        ? 'Dein Bauchgefühl ist festgehalten, seit deine erste Zahl aus Station 1 erkannt ist – es bleibt ein Vorher.'
        : 'Dein Bauchgefühl wird nicht geprüft – es steht am Ende zum Vergleich auf deiner Freigabe-Karte. Sobald deine erste Zahl aus Station 1 erkannt ist, wird es festgehalten.'}</p>
    </section>

    <section className="task-step">
      <h3>Station 1 · Erste Auswertung {role('panel')}</h3>
      <p>Rechne in RStudio: Bilde aus <code>xr21</code> eine 0/1-Variable <code>zusage</code> (ihr Mittelwert ist die Zusagequote), fasse die Fassungen zu <code>wiederholung</code> (ohne/mit) und <code>betrag</code> (5/10 €) zusammen und vergleiche mit zwei t-Tests – über alle Selbstausfüller:innen, online und Papier zusammen. Trag je Test beide Zusagequoten ein (Mittelwerte der Gruppen in <code>summary()</code>).</p>
      <RBlock code={R_SETUP} file="letzte-frage-start.R" />
      <TTestFields id="s06-s1-rep" legend="Wiederholung · alle Selbstausfüller:innen" labels={['Zusagequote „ohne“ (%)', 'Zusagequote „mit“ (%)']}
        entry={state.s1.rep} onChange={e => setEntry('s1', 'rep', e)} notes={s1rep.notes} diff={diffText('rep', s1rep.diff)} />
      <TTestFields id="s06-s1-amt" legend="Betrag · alle Selbstausfüller:innen" labels={['Zusagequote 5 € (%)', 'Zusagequote 10 € (%)']}
        entry={state.s1.amt} onChange={e => setEntry('s1', 'amt', e)} notes={s1amt.notes} diff={diffText('amt', s1amt.diff)} />
      <p className="sandbox-note">{TEXTS.sign}</p>
      <details className="s06-details"><summary>Warum darf ich eine 0/1-Variable mit dem t-Test vergleichen?</summary>
        <p>{TEXTS.zeroOne} <button className="sandbox-link" onClick={() => onConcept('sampling_distribution')}>Stichprobenverteilung in der Karte</button></p>
      </details>
      {ownPoints && <p className="s06-voice">Die Geschäftsführung liest mit: „{ownPoints} Punkte durch die Wiederholung – das nehmen wir!“ Bevor du unterschreibst, prüft die Qualitätssicherung, ob die Gruppen überhaupt vergleichbar sind.</p>}
      <HintLadder key="s1" hint={hints.s1} onConcept={onConcept} file="letzte-frage-station1.R" />
    </section>

    <section className="task-step">
      <h3>Station 2 · Zufallscheck {role('qs')}</h3>
      <p>Hat das Los die Fassungen verteilt, dürfen sie mit nichts zusammenhängen, was vor dem Los feststand. Markiere zuerst, welche Zellen der Korrelationsmatrix bei echter Auslosung ≈ 0 sein müssten. Dann rechnest du die Matrix in R.</p>
      <MatrixMarks marks={state.marks} locked={state.locked} onToggle={p => change(toggleMark(state, p))} />
      <div className="sandbox-chips">
        {!state.locked
          ? <button onClick={() => change(lockMarks(state))} disabled={!state.marks.length}>Markierung festhalten</button>
          : <><span className="sandbox-note">Deine Markierung ist festgehalten.</span><button onClick={() => change(unlockMarks(state))}>Neu markieren</button></>}
      </div>
      {state.locked && <>
        <p>Rechne jetzt die Matrix mit <code>wiederholung</code>, <code>betrag</code>, <code>papier</code> (0 = online, 1 = Papier), <code>age</code> und <code>zusage</code>. Trag zwei Zellen ein:</p>
        <div className="task-grid">
          <label>r(wiederholung, papier)<input type="text" inputMode="decimal" maxLength={12} value={state.r.repPaper} onChange={e => set({ r: { ...state.r, repPaper: e.target.value } })} /></label>
          <label>r(betrag, papier)<input type="text" inputMode="decimal" maxLength={12} value={state.r.amtPaper} onChange={e => set({ r: { ...state.r, amtPaper: e.target.value } })} /></label>
        </div>
        <Feedback notes={[...rRep.notes, ...rAmt.notes]} />
      </>}
      {showMatrix && <div className="s06-reveal">
        <div className="sandbox-chips" role="group" aria-label="Gewichtung der Matrix">
          <button aria-pressed={state.matrixView === 'unweighted'} onClick={() => set({ matrixView: 'unweighted' })}>ungewichtet</button>
          <button aria-pressed={state.matrixView === 'weighted'} onClick={() => set({ matrixView: 'weighted' })}>gewichtet</button>
        </div>
        <MatrixReveal m={matrix} marks={state.marks} weighted={state.matrixView === 'weighted'} />
        <ul className="s06-notes">{markNotes(c, state.marks, matrix).map(n => <li key={n}>{n}</li>)}</ul>
        <CellTable cells={c.cells} />
        <label className="sandbox-label" htmlFor="s06-because">{ownPoints ? `Deine ${ownPoints} Punkte aus Station 1 kommen nicht (nur) von der Wiederholung, weil …` : 'Der Unterschied aus Station 1 kommt nicht (nur) von der Wiederholung, weil …'}</label>
        <textarea id="s06-because" maxLength={600} value={state.because} placeholder={PLACEHOLDERS.because} onChange={e => set({ because: e.target.value })} />
        <Feedback notes={becauseNotes(state.because)} />
      </div>}
      <HintLadder key="s2" hint={hints.s2} onConcept={onConcept} file="letzte-frage-station2.R" />
    </section>

    <section className="task-step">
      <h3>Station 3a · Der saubere Vergleich: nur online {role('panel')}</h3>
      <p>Das Institut befragt ausschließlich online. Wiederhole die beiden t-Tests nur für die Online-Befragten.</p>
      <TTestFields id="s06-s3-rep" legend="Wiederholung · nur online" labels={['Zusagequote „ohne“ (%)', 'Zusagequote „mit“ (%)']}
        entry={state.s3.rep} onChange={e => setEntry('s3', 'rep', e)} notes={s3rep.notes} diff={diffText('rep', s3rep.diff)} />
      <TTestFields id="s06-s3-amt" legend="Betrag · nur online" labels={['Zusagequote 5 € (%)', 'Zusagequote 10 € (%)']}
        entry={state.s3.amt} onChange={e => setEntry('s3', 'amt', e)} notes={s3amt.notes} diff={diffText('amt', s3amt.diff)} />
      {trapData && <div className="s06-reveal">
        <h4>Die Falle</h4>
        <TrapChart trap={trapData} view={state.trapView} onView={v => set({ trapView: v })} />
        <p className="sandbox-note">{TEXTS.codebook}</p>
      </div>}
      {!trapData && s3rep.valid && !s1rep.valid && <p className="sandbox-note">Trag auch die Quoten „ohne/mit“ aus Station 1 ein – dann zeige ich dir, was zwischen beiden Rechnungen passiert ist.</p>}
      <HintLadder key="s3a" hint={hints.s3a} onConcept={onConcept} file="letzte-frage-station3.R" />
    </section>

    <section className="task-step">
      <h3>Station 3b · Vier Fassungen, sechs Paare {role('qs')}</h3>
      <p>Vergleiche die vier Fassungen online mit einer einfaktoriellen ANOVA und finde mit Tukey heraus, welche Paare sich unterscheiden. <code>t_test()</code> vergleicht nur zwei Gruppen – für vier brauchst du <code>oneway_anova()</code>.</p>
      <fieldset className="s06-fields">
        <legend>ANOVA · nur online</legend>
        <div className="task-grid">
          {VERSIONS.map((v, i) => <label key={v.id}>Zusagequote {v.id} (%)<input type="text" inputMode="decimal" maxLength={12} value={state.anova.means[i]}
            onChange={e => set({ anova: { ...state.anova, means: state.anova.means.map((m, k) => (k === i ? e.target.value : m)) } })} /></label>)}
          <label>F<input type="text" inputMode="decimal" maxLength={12} value={state.anova.F} onChange={e => set({ anova: { ...state.anova, F: e.target.value } })} /></label>
          <label>p<input type="text" inputMode="decimal" maxLength={12} value={state.anova.p} onChange={e => set({ anova: { ...state.anova, p: e.target.value } })} /></label>
        </div>
        <Feedback notes={[...means.flatMap(m => m.notes), ...checkF(c, state.anova.F).notes, ...checkP(c, state.anova.p).notes]} />
      </fieldset>
      <p>Welche Paare unterscheiden sich nach Tukey signifikant (p &lt; 0,05)? Wähle alle aus und prüfe die Auswahl als Ganzes.</p>
      {!anova && <p className="sandbox-note">Die Auswahl öffnet sich, sobald oben F oder p deiner ANOVA erkannt ist.</p>}
      <div className="sandbox-chips" role="group" aria-label="Signifikante Tukey-Paare">
        {TUKEY_KEYS.map(k => <button key={k} disabled={!anova} aria-pressed={state.tukey.includes(k)} onClick={() => change(toggleTukey(state, k))}>{versionPair(k)}</button>)}
        <button disabled={!anova} aria-pressed={state.tukey.includes('none')} onClick={() => change(toggleTukey(state, 'none'))}>kein Paar</button>
        <button className="primary" disabled={!anova || !state.tukey.length} onClick={() => change(tryTukey(state))}>Auswahl prüfen</button>
      </div>
      <Feedback notes={tukey.notes} />
      {tukey.correct && c.tukey.online && <TukeyTable rows={c.tukey.online} weighted={showWeighted ? c.tukey.onlineW : null} />}
      {showWeighted && <div className="s06-reveal">
        <h4>Zweite Enthüllung · mit Gewicht</h4>
        <ul className="s06-notes">{weightedNotes(c, { rep: s3rep.valid, amt: s3amt.valid, tukey: tukey.correct }).map(n => <li key={n}>{n}</li>)}</ul>
        <p>{TEXTS.weighted}</p>
        <RBlock code={R_WEIGHTED} />
      </div>}
      <HintLadder key="s3b" hint={hints.s3b} onConcept={onConcept} file="letzte-frage-station3b.R" />
    </section>

    <Release c={c} state={state} onChange={change} onConcept={onConcept} done={{ meansDone: meansDone(c, state), tukeyDone: tukey.correct }} roleLabel={roleLabel} />

    <PlenumCard title="Freigabe · Die letzte Frage" lines={plenumLines(state)} file="letzte-frage-freigabe.md" />
    {statusS06(state) === 'done' && <details className="s02-solution"><summary>Ein vollständiges R-Skript zum Mitnehmen</summary><RBlock code={rScriptFor(state)} file="letzte-frage.R" /></details>}
  </div>;
}
