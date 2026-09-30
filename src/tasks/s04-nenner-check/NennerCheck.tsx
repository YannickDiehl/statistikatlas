import { useMemo } from 'react';
import { Feedback } from '../kit/Feedback';
import { HintLadder } from '../kit/HintLadder';
import { parseNumber } from '../kit/numbers';
import { PartnerToggle } from '../kit/PartnerToggle';
import { PlenumCard } from '../kit/PlenumCard';
import { RBlock } from '../kit/RBlock';
import { RoleBrief } from '../kit/RoleBrief';
import type { TaskProps } from '../types';
import { DenominatorBars, ReadingStrip } from './Charts';
import { CAUSES, CLAIMED, hints, ITEM_IDS, ITEMS, NONVOTE_EXTRAS, PRESS_RELEASE, R_SETUP, R_SOLUTION, type ItemId } from './content';
import {
  allTables, checkExtra, checkP1, checkP2, checkP3, declaredWay, denominators, fourfold, percent, plenumLines, prepare,
  questions, rCodeFor, readings, shortcut, statusS04, stairs, VERDICTS, type S04State,
} from './domain';

export function NennerCheck({ data, state, onChange, onConcept }: TaskProps<S04State>) {
  const set = (patch: Partial<S04State>) => onChange({ ...state, ...patch });
  const joint = useMemo(() => prepare(data.sav), [data.sav]);
  const tables = useMemo(() => allTables(joint), [joint]);
  const p1 = checkP1(tables, joint, state.p1.pct, state.p1.n);
  const p2 = checkP2(tables, joint, state.p2);
  const p3 = checkP3(tables, joint, state.p3);
  const way = declaredWay(state.p3);
  const p3ok = p3.some(n => n.tone === 'ok');
  const own = p3ok ? (() => { const t = fourfold(joint, way); return { way, distrusting: percent(t, 'a', 'row'), others: percent(t, 'c', 'row') }; })() : null;
  const setP3 = (patch: Partial<S04State['p3']>) => set({ p3: { ...state.p3, ...patch } });
  const item = ITEMS[state.p3.item];
  const toggle = (list: number[], code: number) => (list.includes(code) ? list.filter(c => c !== code) : [...list, code]);

  return <div className="task s04">
    <RoleBrief role="Faktenchecker:in" title="Nenner-Check">
      <p><strong>Faktencheck-Redaktion „Nachgezählt“ (fiktiv) · dein Auftrag.</strong> Auf deinem Tisch liegt die Pressemitteilung eines Parteivorstands (fiktiv):</p>
      <figure className="sandbox-quote"><blockquote>{PRESS_RELEASE}</blockquote></figure>
      <p>Die Chefredaktion will bis zur Konferenz zwei Dinge wissen: <strong>Stimmt die Zahl? Und trägt sie die Behauptung?</strong> Rechne in RStudio nach, rechne gegen und liefere einen Faktencheck-Satz mit zwei Zahlen und dein Urteil. Hier trägst du deine Ergebnisse ein und bekommst Rückmeldung.</p>
    </RoleBrief>
    <PartnerToggle mode={state.mode} onChange={mode => set({ mode })}
      solo="Du rechnest alle drei Prüfaufträge nacheinander. Der Streifen am Ende zeigt dir die Lesarten, die sonst im Raum entstehen; die Gegenfragen ersetzen das Gespräch."
      pair="A ist die Nachrechnerin (Prüfauftrag 1), B der Gegenrechner (Prüfauftrag 2) – vergleicht danach eure Zellenhäufigkeit. In Prüfauftrag 3 wählt ihr zwei Lesarten, die sich in mindestens einer Entscheidung unterscheiden. Am Ende steht ein gemeinsamer Satz – oder ein festgehaltener Dissens." />

    <section className="task-step">
      <h3>Vorab · Wer sind die 100 %?</h3>
      <label className="sandbox-label" htmlFor="s04-guess">Die {CLAIMED} % beziehen sich auf alle, die …</label>
      <input id="s04-guess" type="text" maxLength={300} value={state.guess} onChange={e => set({ guess: e.target.value })} />
      <p className="sandbox-note">Dein Satz wird nicht geprüft – er steht am Ende auf deiner Karte.</p>
    </section>

    <section className="task-step">
      <h3>Prüfauftrag 1 · Zahl nachbauen</h3>
      <p>Bilde in R zwei Dummys (1 = misstraut, 1 = würde nicht wählen) und lass dir die Kreuztabelle mit der passenden Prozentbasis zeigen. Trag den Prozentwert ein und die Häufigkeit derselben Zelle.</p>
      <RBlock code={R_SETUP} file="nenner-check.R" />
      <div className="task-grid">
        <label>Prozentwert<input type="text" inputMode="decimal" maxLength={12} value={state.p1.pct} onChange={e => set({ p1: { ...state.p1, pct: e.target.value } })} /></label>
        <label>Häufigkeit derselben Zelle<input type="text" inputMode="numeric" maxLength={12} value={state.p1.n} onChange={e => set({ p1: { ...state.p1, n: e.target.value } })} /></label>
      </div>
      <Feedback notes={p1} />
      <details className="s04-causes"><summary>Das wollte ich anders</summary><ul>{CAUSES.map(c => <li key={c}>{c}</li>)}</ul></details>
      <HintLadder hint={hints.p1} onConcept={onConcept} file="nenner-check-p1.R" />
    </section>

    <section className="task-step">
      <h3>Prüfauftrag 2 · Eine Zelle, drei Nenner</h3>
      <p>Dieselbe Tabelle mit <code>percentages = "all"</code>: Wie viele der Misstrauenden wollen nicht wählen, wie viele der Übrigen – und wie groß ist die Zelle, gemessen an allen?</p>
      <div className="task-grid">
        <label>Misstrauende: nicht wählen (%)<input type="text" inputMode="decimal" maxLength={12} value={state.p2.rowDistrust} onChange={e => set({ p2: { ...state.p2, rowDistrust: e.target.value } })} /></label>
        <label>Übrige: nicht wählen (%)<input type="text" inputMode="decimal" maxLength={12} value={state.p2.rowOthers} onChange={e => set({ p2: { ...state.p2, rowOthers: e.target.value } })} /></label>
        <label>Zelle an allen (%)<input type="text" inputMode="decimal" maxLength={12} value={state.p2.total} onChange={e => set({ p2: { ...state.p2, total: e.target.value } })} /></label>
      </div>
      <Feedback notes={p2} />
      {p2.length === 3 && p2.every(n => n.tone === 'ok') && <DenominatorBars {...denominators(joint)} />}
      <HintLadder hint={hints.p2} onConcept={onConcept} />
    </section>

    <section className="task-step">
      <h3>Prüfauftrag 3 · Deine Lesart</h3>
      <p>Leg selbst fest, wer als misstrauisch gilt und was als Nichtwahl zählt – mindestens eine Entscheidung anders als der Parteivorstand. Vorschlag: die Gegenprobe mit pe05.</p>
      <div className="task-grid">
        <label>Item<select value={state.p3.item} onChange={e => { const id = e.target.value as ItemId; setP3({ item: id, distrust: ITEMS[id].wide }); }}>
          {ITEM_IDS.map(id => <option key={id} value={id}>{id} · {ITEMS[id].title}</option>)}
        </select></label>
      </div>
      <p className="sandbox-note">{item.statement}</p>
      <div className="sandbox-chips" role="group" aria-label="Als Misstrauen zählt">
        {item.categories.map(c => <button key={c.code} aria-pressed={state.p3.distrust.includes(c.code)} onClick={() => setP3({ distrust: toggle(state.p3.distrust, c.code) })}>{c.code} {c.label}</button>)}
      </div>
      <div className="sandbox-chips" role="group" aria-label="Als Nichtwahl zählt außerdem">
        <span className="sandbox-note">Nichtwahl: 91 „würde nicht wählen“ und</span>
        {NONVOTE_EXTRAS.map(e => <button key={e.code} aria-pressed={state.p3.nonvote.includes(e.code)} onClick={() => setP3({ nonvote: toggle(state.p3.nonvote, e.code) })}>{e.code} {e.label}</button>)}
      </div>
      <label className="s04-check"><input type="checkbox" checked={state.p3.weighted} onChange={e => setP3({ weighted: e.target.checked })} /> gewichtet mit wghtpew</label>
      {state.p3.distrust.length > 0 && <p className="sandbox-note">Deine Lesart: <strong>{shortcut(way)}</strong></p>}
      <div className="task-grid">
        <label>Misstrauende: nicht wählen (%)<input type="text" inputMode="decimal" maxLength={12} value={state.p3.rowDistrust} onChange={e => setP3({ rowDistrust: e.target.value })} /></label>
        <label>Übrige: nicht wählen (%)<input type="text" inputMode="decimal" maxLength={12} value={state.p3.rowOthers} onChange={e => setP3({ rowOthers: e.target.value })} /></label>
        <label>Häufigkeit: misstraut & nicht wählen<input type="text" inputMode="numeric" maxLength={12} value={state.p3.n} onChange={e => setP3({ n: e.target.value })} /></label>
      </div>
      <Feedback notes={p3} />
      {own && <ReadingStrip readings={readings(joint)} own={own} claimed={CLAIMED} />}
      <HintLadder hint={{ ...hints.p3, solution: state.p3.distrust.length ? rCodeFor(way) : hints.p3.solution }} onConcept={onConcept} file="nenner-check-p3.R" />
    </section>

    <section className="task-step">
      <h3>Urteil und Faktencheck-Satz</h3>
      <div className="sandbox-chips" role="group" aria-label="Urteil">
        {VERDICTS.map((v, i) => <button key={v} aria-pressed={state.verdict === i} onClick={() => set({ verdict: i })}>{v}</button>)}
      </div>
      <label className="sandbox-label" htmlFor="s04-reason">Begründung</label>
      <textarea id="s04-reason" maxLength={600} value={state.reason} onChange={e => set({ reason: e.target.value })} />
      <label className="sandbox-label" htmlFor="s04-sentence">Faktencheck-Satz mit zwei Zahlen</label>
      <textarea id="s04-sentence" maxLength={600} placeholder="Von denen, die …, wollen … % nicht wählen, von den übrigen … %." value={state.sentence} onChange={e => set({ sentence: e.target.value })} />
      {state.verdict !== null && <ul className="s04-questions">{questions(joint, state).map(q => <li key={q.id}>
        <strong>{q.title}</strong> {q.text}{q.concept && <> <button className="sandbox-link" onClick={() => onConcept(q.concept!)}>Karte öffnen</button></>}
      </li>)}</ul>}
    </section>

    <details className="task-step s04-extra">
      <summary>Zusatz für Schnelle · Misstrauens-Zähler</summary>
      <p>Zähle je Person, wie vielen der drei Aussagen sie misstrauisch zustimmt (0–3), und kreuze das mit der Nichtwahl. Wie viele auf der obersten Stufe wollen nicht wählen?</p>
      <div className="task-grid">
        <label>Oberste Stufe: nicht wählen (%)<input type="text" inputMode="decimal" maxLength={12} value={state.extra} onChange={e => set({ extra: e.target.value })} /></label>
      </div>
      <Feedback notes={checkExtra(data.sav, state.extra)} />
      {checkExtra(data.sav, state.extra).some(n => n.tone === 'ok') && <p className="sandbox-note">Die Treppe: {stairs(data.sav).map(s => `${s.step}: ${s.share.toLocaleString('de-DE', { maximumFractionDigits: 1, minimumFractionDigits: 1 })} %`).join(' · ')}</p>}
      <HintLadder hint={hints.extra} onConcept={onConcept} />
    </details>

    <PlenumCard title="Nenner-Check" lines={plenumLines(state)} file="nenner-check-plenum.md" />
    {statusS04(state) === 'done' && parseNumber(state.p3.rowDistrust) !== null && <details className="s02-solution"><summary>Ein vollständiges R-Skript zum Mitnehmen</summary><RBlock code={R_SOLUTION} file="nenner-check.R" /></details>}
  </div>;
}
