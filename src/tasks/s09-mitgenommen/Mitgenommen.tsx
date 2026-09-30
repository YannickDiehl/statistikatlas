import { useMemo } from 'react';
import { Feedback } from '../kit/Feedback';
import { HintLadder } from '../kit/HintLadder';
import { de } from '../kit/numbers';
import { PartnerToggle } from '../kit/PartnerToggle';
import { PlenumCard } from '../kit/PlenumCard';
import { RBlock } from '../kit/RBlock';
import { RoleBrief } from '../kit/RoleBrief';
import type { TaskProps } from '../types';
import { BoardTable, CoefTable, TemplateChart, WobbleList } from './Charts';
import { CONTROLS, GROUP_IDS, GROUPS, hints, MAX_WORDS, MOVERS, ROLE, SORT_LABEL, SORTS, TEMPLATE, WORKSHOP, type ControlId, type GroupId } from './content';
import {
  board, checkControlled, checkCounter, checkDecide, checkInteraction, checkModel, checkMovers, checkPrediction, checkSelection, chooseRef, chooseSecondRef,
  controlEffect, core, interaction, interactionRecognised, modelRecognised, modelStore, moverVariants, moversRecognised, offQuestions, others, plenumLines,
  prepare, refComment, rInteraction, rSetup, rSolution, scaffoldControls, scaffoldCounter, scaffoldInteraction, scaffoldModel, selection, selectionRecognised,
  sortNote, statusS09, toggleControl, wobbleTest, wordCount, type ModelEntry, type S09State,
} from './domain';

export function Mitgenommen({ data, state, onChange, onConcept }: TaskProps<S09State>) {
  const set = (patch: Partial<S09State>) => onChange({ ...state, ...patch });
  const p = useMemo(() => prepare(data.sav), [data.sav]);
  const models = useMemo(() => modelStore(p), [p]);
  const movers = useMemo(() => moverVariants(p), [p]);
  const sel = useMemo(() => selection(p), [p]);
  const it = useMemo(() => interaction(p), [p]);
  const ref = state.ref || null;
  const main = ref ? core(models, ref) : null;
  const modelOk = Boolean(ref && modelRecognised(main, ref, state.model));
  const second = state.second.ref ? core(models, state.second.ref) : null;
  const secondOk = Boolean(state.second.ref && modelRecognised(second, state.second.ref, state.second.model));
  const controlled = ref ? models({ outcome: 'rev', ref, controls: state.controls, weighted: true }) : null;
  const controlledOk = Boolean(ref && modelRecognised(controlled, ref, state.cmodel, false));
  const counter = ref ? core(models, ref, 'pt03') : null;
  const counterOk = Boolean(ref && modelRecognised(counter, ref, state.counter, false));
  const moverHit = moversRecognised(movers, state.movers[0], state.movers[1]);
  const selOk = selectionRecognised(sel, state.abi);
  const wob = useMemo(() => (modelOk && main ? wobbleTest(main) : null), [modelOk, main]);
  const consequences = state.controls.filter(id => CONTROLS.find(c => c.id === id)!.consequence);
  const without = ref && controlledOk && consequences.length ? models({ outcome: 'rev', ref, controls: state.controls.filter(c => !consequences.includes(c)), weighted: true }) : null;
  const effect = ref && controlledOk ? controlEffect(models, ref, state.controls) : null;
  const pair = state.mode === 'pair';
  const tag = (who: string) => (pair ? ` · ${who}` : '');

  return <div className="task s09">
    <RoleBrief role="Recherche für einen Dokumentarfilm" title="Mitgenommen">
      <p><strong>Neuer Job: Datenrecherche in der {ROLE.desk}.</strong> Die Redaktion dreht einen Film mit dem Arbeitstitel „{ROLE.film}“. Er handelt von Menschen, die zwischen Ost- und Westdeutschland umgezogen sind. Redakteurin {ROLE.editor} schreibt dir:</p>
      <p>„Dass Ostdeutsche im Schnitt unzufriedener mit der Demokratie sind, wissen alle. Uns interessiert: Was nehmen Menschen mit, wenn sie umziehen? In der Redaktion gibt es zwei Lager. Die einen sagen: Es ist die <strong>Prägung</strong>. Wer im Osten aufwuchs, bleibt unzufriedener, egal wo er heute lebt. Die anderen sagen: Es ist der <strong>Ort</strong>. Wer in den Osten zieht, wird so unzufrieden wie die neuen Nachbarn. Am Ende des Films sagt unsere Sprecherin einen Satz dazu. Du schreibst ihn. Er muss stimmen und darf nicht mehr behaupten, als die Daten tragen. Der Film läuft im Fernsehen.“</p>
      <p><strong>Du lieferst:</strong> einen Off-Text-Satz (höchstens {MAX_WORDS} Wörter) und eine Schnittplan-Karte mit deinen Zahlen. Grundlage ist <code>ps03</code>, umgepolt: höher heißt zufriedener.</p>
    </RoleBrief>
    <PartnerToggle mode={state.mode} onChange={mode => set({ mode })}
      solo="Du rechnest beide Referenzen nacheinander (nur die Formel ändern), prüfst Selektion und Kontrollen und machst die Gegenprobe selbst. Danach zeigt dir die Tafel der anderen Schnittplätze alle vier Referenzen."
      pair="A ist „Schnittplatz Ost“ (Referenz Ost-Bleibende), B „Schnittplatz West“ (Referenz West-Bleibende). Gleicht eure Vorhersagen ab – sie müssen übereinstimmen. Danach prüft A Selektion und Kontrollen, B die Gegenprobe mit pt03. Den Off-Text schreibt ihr gemeinsam." />

    <section className="task-step">
      <h3>1 · Prägung oder Ort?</h3>
      <p>So müssten die vier Gruppen aussehen, wenn das eine oder das andere Lager recht hätte:</p>
      <div className="s09-scroll" tabIndex={0} role="region" aria-label="Schablone der beiden Lager">
        <table className="s09-table">
          <thead><tr><th scope="col">Gruppe (dg03)</th><th scope="col">„Prägung“ erwartet</th><th scope="col">„Ort“ erwartet</th></tr></thead>
          <tbody>{GROUP_IDS.map(g => <tr key={g}><th scope="row">{GROUPS[g].short}<small> · {GROUPS[g].label}</small></th><td>{TEMPLATE[g].praegung}</td><td>{TEMPLATE[g].ort}</td></tr>)}</tbody>
        </table>
      </div>
      <p>Welche Gruppe entscheidet den Streit?</p>
      <div className="sandbox-chips" role="group" aria-label="Gruppen, die den Streit entscheiden">
        {GROUP_IDS.map(g => <button key={g} aria-pressed={state.decide.includes(g)}
          onClick={() => set({ decide: state.decide.includes(g) ? state.decide.filter(x => x !== g) : GROUP_IDS.filter(x => x === g || state.decide.includes(x)) })}>{GROUPS[g].short}</button>)}
      </div>
      <Feedback notes={checkDecide(state.decide)} />
      <label className="sandbox-label" htmlFor="s09-decide">In einem Satz: Welcher Vergleich entscheidet, und warum?</label>
      <input id="s09-decide" type="text" maxLength={400} value={state.decideText} onChange={e => set({ decideText: e.target.value })} />
    </section>

    <section className="task-step">
      <h3>2 · Wie viele Umgezogene tragen den Film? (R)</h3>
      <RBlock code={rSetup()} file="mitgenommen-start.R" />
      <div className="task-grid">
        <label>Ost→West (dg03 = 2)<input type="text" inputMode="numeric" maxLength={12} value={state.movers[0]} onChange={e => set({ movers: [e.target.value, state.movers[1]] })} /></label>
        <label>West→Ost (dg03 = 3)<input type="text" inputMode="numeric" maxLength={12} value={state.movers[1]} onChange={e => set({ movers: [state.movers[0], e.target.value] })} /></label>
      </div>
      <Feedback notes={checkMovers(movers, state.movers[0], state.movers[1])} />
    </section>

    <section className="task-step">
      <h3>3 · Mit wem vergleicht der Film? (R){tag('A: Ost-Bleibende, B: West-Bleibende')}</h3>
      <p>Wähle die Referenzgruppe: Mit ihr vergleicht der Film alle anderen. Im Seminar wird die Referenz zugeteilt, allein wählst du frei.</p>
      <div className="sandbox-chips" role="group" aria-label="Referenzgruppe">
        {GROUP_IDS.map(g => <button key={g} aria-pressed={state.ref === g} onClick={() => onChange(chooseRef(state, g))}>{GROUPS[g].short}</button>)}
      </div>
      {ref && main === null && <p className="sandbox-note" role="note">Mit dieser Referenz lässt sich das Modell in deiner Datei nicht schätzen – eine Gruppe ist leer.</p>}
      {ref && <>
        <label className="sandbox-label" htmlFor="s09-ref">Warum diese Referenz? (ein Satz)</label>
        <input id="s09-ref" type="text" maxLength={400} value={state.refReason} onChange={e => set({ refReason: e.target.value })} />
        <p>Rechne in R das gewichtete Modell mit den drei Dummies, die nicht zur Referenz gehören, und trag Konstante und B ein.</p>
        <RBlock code={refComment(ref)} />
        <ModelInputs refGroup={ref} entry={state.model} withConstant onChange={model => set({ model })} label="Modell" />
        <Feedback notes={checkModel(p, models, ref, state.model)} />
        <HintLadder key={`model-${ref}`} hint={{ ...hints.model, workshop: WORKSHOP, scaffold: scaffoldModel(), solution: rSolution(ref, state.controls.length ? state.controls : undefined) }} onConcept={onConcept} file="mitgenommen.R" />
        {modelOk && main && <>
          <CoefTable model={main} />
          <TemplateChart model={main} />
          <div className="task-grid"><label>Vorhersage für Ost→West aus deiner Tabelle<input type="text" inputMode="decimal" maxLength={12} value={state.pred} onChange={e => set({ pred: e.target.value })} /></label></div>
          <Feedback notes={checkPrediction(main, state.model, state.pred)} />
        </>}
        {!modelOk && <p className="sandbox-note">Nach deiner Tabelle zeige ich dir Konfidenzintervalle, die Vorhersagen je Gruppe und die Schablone mit deinen Zahlen.</p>}
      </>}
    </section>

    {ref && <section className="task-step">
      <h3>4 · {pair ? 'Der andere Schnittplatz' : 'Zweite Referenz'}</h3>
      <p>{pair ? 'Tragt hier die Tabelle des anderen Schnittplatzes ein und vergleicht die Vorhersage für Ost→West.' : 'Rechne dieselbe Frage mit einer anderen Referenz – nur die Formel ändern. Was bleibt gleich, was nicht?'}</p>
      <div className="sandbox-chips" role="group" aria-label="Zweite Referenz">
        {others(ref).map(g => <button key={g} aria-pressed={state.second.ref === g} onClick={() => onChange(chooseSecondRef(state, g))}>{GROUPS[g].short}</button>)}
      </div>
      {state.second.ref !== 0 && <>
        <RBlock code={refComment(state.second.ref)} />
        <ModelInputs refGroup={state.second.ref} entry={state.second.model} withConstant onChange={model => set({ second: { ...state.second, model } })} label="Zweites Modell" />
        <Feedback notes={checkModel(p, models, state.second.ref, state.second.model)} />
        <div className="task-grid"><label>Vorhersage für Ost→West aus dieser Tabelle<input type="text" inputMode="decimal" maxLength={12} value={state.second.pred} onChange={e => set({ second: { ...state.second, pred: e.target.value } })} /></label></div>
        {secondOk && <Feedback notes={checkPrediction(second, state.second.model, state.second.pred)} />}
        <HintLadder key={`second-${state.second.ref}`} hint={{ ...hints.model, workshop: WORKSHOP, scaffold: scaffoldModel(), solution: rSolution(state.second.ref) }} onConcept={onConcept} file="mitgenommen.R" />
      </>}
      {modelOk && secondOk && <>
        <h4 className="s09-sub">Tafel der anderen Schnittplätze</h4>
        <BoardTable rows={board(models)} own={[ref, state.second.ref as GroupId]} />
        <p className="sandbox-note">Die Koeffizienten hängen an der Referenz, die Vorhersagen nicht. Ein B ist kein Wert einer Gruppe, sondern ihr Abstand zur Referenz.</p>
      </>}
    </section>}

    {ref && <section className="task-step">
      <h3>5 · Wer zieht um? Selektion und Kontrollen (R){tag('A')}</h3>
      <p>Prüfe in R mit einer Kreuztabelle (Zeilenprozente, gewichtet), wie viele der West→Ost-Umgezogenen Abitur haben. Sortiere dann die Kontrollkarten, kreuze deine Kontrollen an und rechne das Modell mit ihnen.</p>
      <div className="task-grid"><label>Abitur-Anteil unter West→Ost (%)<input type="text" inputMode="decimal" maxLength={12} value={state.abi} onChange={e => set({ abi: e.target.value })} /></label></div>
      <Feedback notes={checkSelection(sel, state.abi)} />
      <p>Sortiere die Kontrollkarten: Was stand fest, bevor jemand umzog – und was kann eine Folge des Umzugs sein?</p>
      <ul className="s09-cards">{CONTROLS.map(c => <li key={c.id}>
        <span className="s09-card-title">{c.title}</span>
        <span className="sandbox-chips" role="group" aria-label={`${c.title} einordnen`}>
          {SORTS.map(s => <button key={s} aria-pressed={state.sort[c.id] === s} onClick={() => set({ sort: { ...state.sort, [c.id]: s } })}>{SORT_LABEL[s]}</button>)}
        </span>
        <Feedback notes={sortNote(c.id, state.sort[c.id])} />
      </li>)}</ul>
      <fieldset className="s09-controls">
        <legend>Ins Modell nehme ich als Kontrolle:</legend>
        {CONTROLS.map(c => <label key={c.id} className="s04-check"><input type="checkbox" checked={state.controls.includes(c.id)} onChange={() => onChange(toggleControl(state, c.id as ControlId))} /> {c.title}</label>)}
      </fieldset>
      {state.controls.length > 0 && <>
        <ModelInputs refGroup={ref} entry={state.cmodel} withConstant={false} onChange={cmodel => set({ cmodel })} label="Modell mit Kontrollen" />
        <Feedback notes={checkControlled(models, ref, state.controls, state.cmodel)} />
      </>}
      <HintLadder key={`controls-${ref}`} hint={{ ...hints.controls, workshop: WORKSHOP, scaffold: scaffoldControls(ref), solution: rSolution(ref, state.controls.length ? state.controls : undefined) }} onConcept={onConcept} file="mitgenommen.R" />
      {modelOk && effect && <div className="s09-scroll" tabIndex={0} role="region" aria-label="Abstände ohne und mit Kontrollen">
        <table className="s09-table">
          <caption>Abstand zu {GROUPS[ref].short}: ohne und mit Kontrollen</caption>
          <thead><tr><th scope="col">Gruppe</th><th scope="col">ohne</th><th scope="col">mit</th></tr></thead>
          <tbody>{effect.map(x => <tr key={x.g}><th scope="row">{GROUPS[x.g].short}</th><td>{de(x.without, 3)}</td><td>{de(x.with, 3)}</td></tr>)}</tbody>
        </table>
        {effect.some(x => Math.abs(x.with) > Math.abs(x.without) + 0.05) && <p className="sandbox-note">Kontrolle kann einen Abstand auch vergrößern: {effect.filter(x => Math.abs(x.with) > Math.abs(x.without) + 0.05).map(x => `${GROUPS[x.g].short} ${de(x.without, 2)} → ${de(x.with, 2)}`).join(', ')}.</p>}
      </div>}
    </section>}

    {ref && <section className="task-step">
      <h3>6 · Gegenprobe mit dem Vertrauen in den Bundestag (R){pair ? ' · B' : ' · allein optional'}</h3>
      <p>Zeigt eine andere Frage dasselbe Muster? Rechne dasselbe Modell mit pt03 (1 = gar kein … 7 = großes Vertrauen) statt der Zufriedenheit.</p>
      <ModelInputs refGroup={ref} entry={state.counter} withConstant={false} onChange={counter => set({ counter })} label="Gegenprobe" />
      <Feedback notes={checkCounter(models, ref, state.counter)} />
      <HintLadder key={`counter-${ref}`} hint={{ ...hints.counter, workshop: WORKSHOP, scaffold: scaffoldCounter(), solution: rSolution(ref) }} onConcept={onConcept} file="mitgenommen.R" />
      {modelOk && counterOk && main && counter && <p className="sandbox-note">Abstand zu {GROUPS[ref].short} – Zufriedenheit / Vertrauen: {others(ref).map(g => `${GROUPS[g].short} ${de(main.b[g], 2)} / ${de(counter.b[g], 2)}`).join(', ')}.</p>}
    </section>}

    <section className="task-step">
      <details className="s09-extra">
        <summary>7 · Profi: dieselbe Frage als Interaktion</summary>
        <p>Bilde mit rec() zwei 0/1-Variablen – ost (wohnt im Osten) und ostjugend (im Osten aufgewachsen) – und rechne das gewichtete Modell mit ihrer Interaktion.</p>
        <div className="task-grid"><label>B der Zeile ost:ostjugend<input type="text" inputMode="decimal" maxLength={12} value={state.inter} onChange={e => set({ inter: e.target.value })} /></label></div>
        <Feedback notes={checkInteraction(it, core(models, 4)?.fit.r2 ?? NaN, state.inter)} />
        {!interactionRecognised(it, state.inter) && <HintLadder hint={{ ...hints.interaction, workshop: WORKSHOP, scaffold: scaffoldInteraction(), solution: `${rSetup()}\n\n${rInteraction()}` }} onConcept={onConcept} file="mitgenommen-interaktion.R" />}
      </details>
    </section>

    <section className="task-step">
      <h3>8 · Der Off-Text{pair ? ' · gemeinsam' : ''}</h3>
      {wob && main && <>
        <h4 className="s09-sub">Wackeltest</h4>
        <p>Wie stark hängen deine Abstände an einzelnen Befragten? Ich schätze jedes Modell neu – einmal ohne die fünf Fälle, die den Abstand am stärksten nach oben ziehen, einmal ohne die fünf, die ihn nach unten ziehen (DFBETA). <button className="sandbox-link" onClick={() => onConcept('outliers_influence')}>Ausreißer &amp; Einfluss in der Karte</button></p>
        <WobbleList rows={wob} model={main} />
      </>}
      <label className="sandbox-label" htmlFor="s09-off">Der Satz der Sprecherin (höchstens {MAX_WORDS} Wörter) – {wordCount(state.offText)} Wörter</label>
      <textarea id="s09-off" maxLength={400} value={state.offText} onChange={e => set({ offText: e.target.value })} />
      <Feedback notes={offQuestions(state.offText, {
        selection: selOk ? sel : null,
        movers: moverHit ? movers.find(v => v.key === 'model')! : null,
        wobble: wob,
        consequences,
        effectWithout: without ? MOVERS.filter(g => g !== ref).map(g => ({ g, value: without.b[g] })) : null,
      })} />
    </section>

    <PlenumCard title="Schnittplan-Karte · Mitgenommen" lines={plenumLines(state, models)} file="mitgenommen-schnittplan.md" />
    {ref && statusS09(state) === 'done' && <details className="s02-solution"><summary>Ein vollständiges R-Skript zum Mitnehmen</summary><RBlock code={rSolution(ref, state.controls.length ? state.controls : undefined)} file="mitgenommen.R" /></details>}
  </div>;
}

/** Eingabefelder für eine Koeffiziententabelle: Konstante (optional) und B je Gruppe, die Referenz bleibt leer. */
function ModelInputs({ refGroup, entry, withConstant, onChange, label }: { refGroup: GroupId; entry: ModelEntry; withConstant: boolean; onChange: (e: ModelEntry) => void; label: string }) {
  const setB = (g: GroupId, v: string) => onChange({ ...entry, b: entry.b.map((x, i) => (i === g - 1 ? v : x)) as ModelEntry['b'] });
  return <div className="task-grid" role="group" aria-label={label}>
    {withConstant && <label>Konstante<input type="text" inputMode="decimal" maxLength={12} value={entry.c} onChange={e => onChange({ ...entry, c: e.target.value })} /></label>}
    {GROUP_IDS.map(g => g === refGroup
      ? <label key={g}>{GROUPS[g].short}<input type="text" value="Referenz" readOnly aria-readonly="true" tabIndex={-1} /></label>
      : <label key={g}>B {GROUPS[g].short} ({GROUPS[g].dummy})<input type="text" inputMode="decimal" maxLength={12} value={entry.b[g - 1]} onChange={e => setB(g, e.target.value)} /></label>)}
  </div>;
}
