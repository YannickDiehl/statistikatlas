import { useMemo } from 'react';
import { Feedback, type Note } from '../kit/Feedback';
import { HintLadder } from '../kit/HintLadder';
import { de } from '../kit/numbers';
import { PartnerToggle } from '../kit/PartnerToggle';
import { PlenumCard } from '../kit/PlenumCard';
import { RBlock } from '../kit/RBlock';
import { RoleBrief } from '../kit/RoleBrief';
import type { TaskProps } from '../types';
import { FACET_HELP, FACET_IDS, FACETS, hints, ITEM_IDS, ITEMS, R_BATTERY, R_SETUP, ROLE, SCALE, type ItemId } from './content';
import {
  BATTERY_NOT_FOUND, batteryVariants, checkNumber, checkWeakest, chooseFinal, DUTY_GROUPS, dutyFor, facetNote, keptOf, keyOf, kuer, KUER_NOT_FOUND,
  kuerAllVariants, kuerMeanVariants, kuerReveal, labelOf, landscapeNotes, pa29Note, pctTolerance, plenumLines, prepare, recognised, revealReady, rKuer,
  rScript, scaffoldKuer, statusS07, toggleStrike, TRIPLES, type Proposal, type S07State,
} from './domain';
import { Landscape } from './Landscape';
import { ProposalStep } from './ProposalStep';

export function DreiFragen({ data, state, onChange, onConcept }: TaskProps<S07State>) {
  const set = (patch: Partial<S07State>) => onChange({ ...state, ...patch });
  const p = useMemo(() => prepare(data.sav), [data.sav]);
  const solo = state.mode === 'solo';
  const a = keptOf(state.a.struck), b = keptOf(state.b.struck);
  const ready = revealReady(p, state);
  const finalStats = ready && state.final.length === 3 ? p.byKey[keyOf(state.final)] : null;
  const duty = state.duty ? dutyFor(state.duty) : null;
  const facetsShown = state.facetLevel === 2;
  const k = useMemo(() => (finalStats ? kuer(p, finalStats.items) : null), [p, finalStats]);
  const batteryOk = recognised(batteryVariants(p), state.battery.alpha);
  const patchProposal = (which: 'a' | 'b') => (patch: Partial<Proposal>) => set({ [which]: { ...state[which], ...patch } });
  const setBattery = (patch: Partial<S07State['battery']>) => set({ battery: { ...state.battery, ...patch } });
  const setKuer = (patch: Partial<S07State['kuer']>) => set({ kuer: { ...state.kuer, ...patch } });

  const contentNotes = (items: ItemId[] | null, name: string): Note[] =>
    facetsShown && items ? [{ ...facetNote(items), text: `${name}: ${facetNote(items).text}` }] : [];
  const sameAsA = a && b && keyOf(a) === keyOf(b)
    ? [{ tone: 'hint' as const, text: 'Das ist dieselbe Auswahl wie beim ersten Vorschlag. Das ist erlaubt – aber prüfe mit der Brille des Inhalts, ob wirklich alle Seiten des Begriffs vertreten sind.' }]
    : [];
  const finalNotes: Note[] = finalStats ? [
    ...(facetsShown ? [facetNote(finalStats.items)] : []),
    ...pa29Note(p, finalStats.items),
    ...(duty && !finalStats.items.includes(duty.item) ? [{ tone: 'warn' as const, text: `Eure Pflichtfrage ${duty.item} fehlt in dieser Auswahl. Wählt eine Kurzskala mit ${duty.item} – in der Landschaft sind sie dunkel.` }] : []),
  ] : [];
  const sentenceNotes: Note[] = /^\s*(nichts|alles)\b/i.test(state.sentence)
    ? [{ tone: 'hint', text: 'Jede Kurzskala verliert etwas. Welche Seite des Begriffs ist mit drei Fragen schwächer vertreten als mit sieben – und welche Menschen unterscheidet sie nicht mehr?' }]
    : [];
  const meanOk = k ? recognised(kuerMeanVariants(k), state.kuer.mean, pctTolerance) : false;
  const allOk = k ? recognised(kuerAllVariants(k), state.kuer.all, pctTolerance) : false;

  return <div className="task s07">
    <RoleBrief role="Datenteam einer Nachrichten-App" title="Drei Fragen müssen reichen">
      <p><strong>Neuer Job: Datenteam der Nachrichten-App „{ROLE.app}“.</strong> Jede Woche lässt die App ein Feldinstitut 2.000 Menschen befragen – das „{ROLE.barometer}“. Bisher stehen darin sieben Fragen zum Populismus. Ab Januar ist nur noch Platz für drei. Die Kurzskala läuft dann drei Jahre lang unverändert: Wer später etwas tauscht, zerreißt die Zeitreihe.</p>
      <p>Du entscheidest, welche vier Fragen gestrichen werden. Teste deine Wahl am ALLBUS 2023, in dem alle sieben Fragen gestellt wurden (einem Teil der Befragten, Fragebogensplit): <strong>Messen deine drei Fragen stimmig dasselbe? Und sagen sie voraus, was die vier gestrichenen Fragen ergeben hätten?</strong></p>
      <p><strong>Abgabe bis Sitzungsende:</strong> deine drei Fragen, zwei Kennzahlen – die <em>Stimmigkeit</em> (Cronbachs α der drei Fragen) und den <em>Stellvertreter-Wert</em> (Korrelation deines Kurzwerts mit dem Wert der vier gestrichenen Fragen) – und ein Satz: „Was meine Kurzskala nicht mehr misst: …“ Eine richtige Lösung gibt es nicht.</p>
    </RoleBrief>
    <PartnerToggle mode={state.mode} onChange={mode => set({ mode })}
      solo="Du übernimmst nacheinander beide Rollen: erst die Stimmigkeit (α und Trennschärfen), dann den Inhalt (alle Seiten des Begriffs, Stellvertreter-Test). Danach zeigt dir der Browser alle 35 möglichen Kurzskalen, und du entscheidest dich."
      pair="A vertritt die Stimmigkeit: optimiert α und liest die Trennschärfen. B vertritt den Inhalt: Jede Seite des Begriffs soll erhalten bleiben, B prüft den Stellvertreter-Test. Beide schlagen eine Kurzskala vor, rechnen beide Kennzahlen für beide Vorschläge und einigen sich auf eine." />

    <section className="task-step">
      <h3>1 · Die sieben Fragen</h3>
      <p>Im ALLBUS heißen sie pa29 bis pa35. Antwortskala: {SCALE} – ein kleiner Wert heißt also Zustimmung. Daneben steht, wie viele Menschen in Deutschland zustimmen (stimme voll oder eher zu, gewichtet).</p>
      <ol className="s07-items">
        {ITEM_IDS.map(id => <li key={id} className="task-card">
          <h4><code>{id}</code> {ITEMS[id].short}<span className="s07-agree">{Number.isFinite(p.agree[id]) ? `${de(100 * p.agree[id], 0)} % Zustimmung` : ''}</span></h4>
          <p>{ITEMS[id].statement}</p>
        </li>)}
      </ol>
      <p className="sandbox-note">Die Aussagen sind gekürzt; den genauen Wortlaut zeigt der ALLBUS-Fragebogen.</p>
      <p>Lies die Daten in RStudio ein und prüfe zuerst die ganze Batterie mit <code>reliability()</code> und <code>summary()</code>: Wie stimmig sind alle sieben Fragen, und welche passt am schlechtesten zu den übrigen?</p>
      <RBlock code={R_SETUP} file="drei-fragen-start.R" />
      {!Number.isFinite(p.full.alpha) && <p className="sandbox-error" role="alert">In dieser Datei haben weniger als zwei Befragte alle sieben Fragen beantwortet. Stimmigkeit und Stellvertreter-Test lassen sich damit nicht berechnen – bitte die vollständige Datei ZA8831 v1.3.0 laden.</p>}
      <div className="task-grid">
        <label>α aller sieben Fragen<input type="text" inputMode="decimal" maxLength={12} value={state.battery.alpha} onChange={e => setBattery({ alpha: e.target.value })} /></label>
        <label>Schwächste Trennschärfe hat<select value={state.battery.weakest} onChange={e => setBattery({ weakest: e.target.value as ItemId | '' })}>
          <option value="">bitte wählen</option>{ITEM_IDS.map(id => <option key={id} value={id}>{id}</option>)}
        </select></label>
        <label>ihre Trennschärfe<input type="text" inputMode="decimal" maxLength={12} value={state.battery.value} onChange={e => setBattery({ value: e.target.value })} /></label>
      </div>
      <Feedback notes={[...checkNumber(batteryVariants(p), state.battery.alpha, BATTERY_NOT_FOUND), ...checkWeakest(p, state.battery.weakest, state.battery.value)]} />
      <HintLadder hint={{ ...hints.battery, scaffold: hints.battery.scaffold!, solution: `${R_SETUP}\n\n${R_BATTERY}` }} onConcept={onConcept} file="drei-fragen-batterie.R" />
    </section>

    <ProposalStep which="a" heading={solo ? '2 · Rolle 1: Stimmigkeit' : '2 · Person A: Stimmigkeit'} proposal={state.a} p={p}
      onToggle={id => onChange(toggleStrike(state, 'a', id))} onPatch={patchProposal('a')} onConcept={onConcept}>
      <p>{solo ? 'Du vertrittst zuerst die Stimmigkeit:' : 'A vertritt die Stimmigkeit:'} Die drei Fragen, die bleiben, sollen möglichst stimmig dasselbe messen. Die Trennschärfen der ganzen Batterie zeigen, welche Fragen gut zu den übrigen passen. Streiche vier Fragen.</p>
    </ProposalStep>

    <ProposalStep which="b" heading={solo ? '3 · Rolle 2: Inhalt – jetzt wechselst du die Seite' : '3 · Person B: Inhalt'} proposal={state.b} p={p}
      onToggle={id => onChange(toggleStrike(state, 'b', id))} onPatch={patchProposal('b')} onConcept={onConcept}
      extra={[...contentNotes(a, 'Vorschlag Stimmigkeit'), ...contentNotes(b, 'Vorschlag Inhalt'), ...sameAsA]}>
      <p>{solo ? 'Jetzt vertrittst du den Inhalt:' : 'B vertritt den Inhalt:'} Die Kurzskala soll den ganzen Begriff tragen, nicht nur einen Teil davon. Und sie soll vorhersagen, was die vier gestrichenen Fragen ergeben hätten – das prüft der Stellvertreter-Test. Streiche noch einmal vier Fragen, diesmal mit dieser Brille. Im Skript änderst du nur die Fragen.</p>
      <div className="s07-facets">
        {state.facetLevel === 0 && <button onClick={() => set({ facetLevel: 1 })} aria-expanded={false}>Welche Seiten hat der Begriff?</button>}
        {state.facetLevel >= 1 && <p><strong>Denkanstoß.</strong> {FACET_HELP.think}</p>}
        {state.facetLevel === 1 && <button onClick={() => set({ facetLevel: 2 })} aria-expanded={false}>Die drei Seiten zeigen</button>}
        {facetsShown && <>
          <p>{FACET_HELP.reveal}</p>
          <ul className="s07-facet-list">{FACET_IDS.map(fid => <li key={fid}>
            <strong>{FACETS[fid].name}</strong> ({fid}): {FACETS[fid].gist} – {ITEM_IDS.filter(id => ITEMS[id].facet === fid).join(', ')}
          </li>)}</ul>
        </>}
      </div>
    </ProposalStep>

    <section className="task-step">
      <h3>4 · Alle 35 Kurzskalen</h3>
      {!ready && <p className="sandbox-note">Die Landschaft aller 35 möglichen Kurzskalen erscheint, sobald für beide Vorschläge Stimmigkeit und Stellvertreter-Wert eingetragen und erkannt sind.</p>}
      {ready && a && b && <>
        <p>Jede Kurzskala ist ein Punkt: rechts die stimmigen, oben die guten Stellvertreter. Deine beiden Vorschläge sind markiert.</p>
        <Landscape triples={p.triples} duty={duty?.item ?? null} showFacets={facetsShown}
          marks={[{ key: keyOf(a), label: solo ? 'Stimmigkeit' : 'A' }, { key: keyOf(b), label: solo ? 'Inhalt' : 'B' }, ...(finalStats ? [{ key: finalStats.key, label: 'Wahl' }] : [])]} />
        <ul className="s07-notes">{landscapeNotes(p, [a, b], batteryOk).map(n => <li key={n}>{n}</li>)}</ul>
      </>}
    </section>

    {ready && a && b && <section className="task-step">
      <h3>5 · Deine Wahl</h3>
      <p>Welche Kurzskala würdest du drei Jahre lang verantworten? Umentscheiden ist ausdrücklich erlaubt – auch eine dritte Kurzskala.{solo ? '' : ' Einigt euch auf eine.'}</p>
      <div className="sandbox-chips" role="group" aria-label="Vorschlag übernehmen">
        <button aria-pressed={keyOf(state.final) === keyOf(a)} onClick={() => onChange(chooseFinal(state, a))}>Stimmigkeit übernehmen ({labelOf(a)})</button>
        <button aria-pressed={keyOf(state.final) === keyOf(b)} onClick={() => onChange(chooseFinal(state, b))}>Inhalt übernehmen ({labelOf(b)})</button>
      </div>
      <div className="task-grid">
        <label>oder eine andere Kurzskala<select value={state.final.length === 3 ? keyOf(state.final) : ''} onChange={e => onChange(chooseFinal(state, e.target.value ? e.target.value.split('+') as ItemId[] : []))}>
          <option value="">bitte wählen</option>
          {TRIPLES.map(t => { const s = p.byKey[keyOf(t)]; return <option key={s.key} value={s.key}>{labelOf(t)} (α {de(s.alpha, 3)} · r {de(s.r, 3)})</option>; })}
        </select></label>
      </div>
      <Feedback notes={finalNotes} />
      <label className="sandbox-label" htmlFor="s07-reason">Warum diese drei? (ein, zwei Sätze)</label>
      <textarea id="s07-reason" maxLength={600} value={state.reason} onChange={e => set({ reason: e.target.value })} />
      <label className="sandbox-label" htmlFor="s07-sentence">Was meine Kurzskala nicht mehr misst: …</label>
      <textarea id="s07-sentence" maxLength={400} value={state.sentence} placeholder="Was meine Kurzskala nicht mehr misst: …" onChange={e => set({ sentence: e.target.value })} />
      <Feedback notes={sentenceNotes} />
    </section>}

    {finalStats && k && <details className="task-step s07-kuer">
      <summary>Kür (optional, etwa 10 Minuten): Mittelwertindex gegen Kombinationsindex</summary>
      <p>Die App will in der Push-Nachricht melden, wie viele Menschen „populistisch denken“. Nach dem Mittelwertindex zählt, wer im Schnitt zustimmt (Kurzwert höchstens 2). Nach dem Kombinationsindex zählt nur, wer allen drei Aussagen zustimmt. Rechne beide Anteile gewichtet für {labelOf(finalStats.items)} – hier geht es um eine Aussage über Deutschland.</p>
      <div className="task-grid">
        <label>Im Schnitt Zustimmung (%)<input type="text" inputMode="decimal" maxLength={12} value={state.kuer.mean} onChange={e => setKuer({ mean: e.target.value })} /></label>
        <label>Allen drei zugestimmt (%)<input type="text" inputMode="decimal" maxLength={12} value={state.kuer.all} onChange={e => setKuer({ all: e.target.value })} /></label>
      </div>
      <Feedback notes={[
        ...checkNumber(kuerMeanVariants(k), state.kuer.mean, KUER_NOT_FOUND, pctTolerance, 'Trag den Anteil mit einer Nachkommastelle ein, so wie crosstab() ihn zeigt.'),
        ...checkNumber(kuerAllVariants(k), state.kuer.all, KUER_NOT_FOUND, pctTolerance, 'Trag den Anteil mit einer Nachkommastelle ein, so wie crosstab() ihn zeigt.'),
        ...(meanOk && allOk ? [{ tone: 'ok' as const, text: kuerReveal(k) }] : []),
      ]} />
      <HintLadder key={finalStats.key} hint={{ ...hints.kuer, scaffold: scaffoldKuer, solution: `${R_SETUP}\n\n${rKuer(finalStats.items)}` }} onConcept={onConcept} file="drei-fragen-kuer.R" />
    </details>}

    {ready && <section className="task-step s07-duty">
      <h3>Pflichtfrage bei zu einheitlicher Wahl</h3>
      <p>Wählt der Raum fast überall dieselbe Kurzskala, lost der Browser je Gruppe eine Pflichtfrage aus. Die Auslosung hängt nur an der Gruppennummer – jedes Gerät zieht für dieselbe Nummer dieselbe Frage.</p>
      <div className="task-grid">
        <label>Gruppennummer<select value={state.duty ?? ''} onChange={e => set({ duty: e.target.value ? Number(e.target.value) : null })}>
          <option value="">keine Pflichtfrage</option>
          {Array.from({ length: DUTY_GROUPS }, (_, i) => i + 1).map(g => <option key={g} value={g}>Gruppe {g}</option>)}
        </select></label>
      </div>
      {duty && <p className="s07-duty-draw" aria-live="polite"><strong>Pflichtfrage für Gruppe {state.duty}: {duty.item}</strong> – {ITEMS[duty.item].statement} Grund: {duty.reason} Sie muss in eurer Kurzskala bleiben{state.final.includes(duty.item) ? ' – eure Wahl enthält sie schon. Begründet, warum ihr die beiden anderen dazunehmt.' : `: Wählt oben neu; in der Landschaft sind alle Kurzskalen mit ${duty.item} dunkel.`}</p>}
    </section>}

    <PlenumCard title="Drei Fragen müssen reichen" lines={plenumLines(state, finalStats)} file="drei-fragen-plenum.md" />
    {statusS07(state) === 'done' && <details className="s02-solution"><summary>Ein vollständiges R-Skript zum Mitnehmen</summary>
      <RBlock code={rScript(a, b, state.final.length === 3 ? state.final : null)} file="drei-fragen.R" />
    </details>}
  </div>;
}
