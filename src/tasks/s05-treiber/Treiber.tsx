import { Shuffle } from 'lucide-react';
import { useMemo } from 'react';
import { Feedback } from '../kit/Feedback';
import { HintLadder } from '../kit/HintLadder';
import { parseNumber } from '../kit/numbers';
import { PartnerToggle } from '../kit/PartnerToggle';
import { PlenumCard } from '../kit/PlenumCard';
import { RBlock } from '../kit/RBlock';
import { RoleBrief } from '../kit/RoleBrief';
import type { MeasureId } from '../kit/stats';
import type { TaskProps } from '../types';
import { CARDS, cardById, hintTexts, ROLE, STAMPS, WORKSHOP, type CardId, type Level } from './content';
import {
  checkEntry, checkLevel, checkStamp, chooseMeasure, checkStrata, driverQuestion, fitNotes, MEASURE_IDS, measureLabel, pickCard, plenumLines, prepare,
  randomCard, rCodeFor, recognised, reveal, revealNotes, rSetupFor, scaffoldFor, stampRule, statusS05, strata, variants, VIEW_LABELS, VIEWS, type S05State,
} from './domain';
import { RankChart } from './RankChart';

const LEVELS: Level[] = ['nominal', 'ordinal', 'metrisch'];

export function Treiber({ data, state, onChange, onConcept }: TaskProps<S05State>) {
  const set = (patch: Partial<S05State>) => onChange({ ...state, ...patch });
  const p = useMemo(() => prepare(data.sav), [data.sav]);
  const card = state.card ? cardById[state.card] : null;
  const vars = useMemo(() => (card ? variants(p, card) : []), [p, card]);
  const groups = card ? strata(p, card) : [];
  const main = card ? checkEntry(p, card, vars, state) : [];
  // Die Enthüllung kommt nach dem eigenen Eintrag: Wert, Werte je Teil (West/Ost bzw. Wirtschaftslage), Stempel und Satz.
  const entered = parseNumber(state.value) !== null;
  const strataDone = groups.length > 0 && state.strata.slice(0, groups.length).every(v => parseNumber(v) !== null);
  const ready = Boolean(card && entered && strataDone && state.stamp && state.sentence.trim());
  const rev = useMemo(() => (ready ? reveal(p) : null), [p, ready]);
  const draw = () => onChange(pickCard(state, randomCard(state.card)));
  const setSecond = (patch: Partial<S05State['second']>) => set({ second: { ...state.second, ...patch } });
  const setMeasure = (measure: MeasureId | '') => onChange(chooseMeasure(state, measure));

  return <div className="task s05">
    <RoleBrief role="Analyst:in im Beratungsbüro" title="Treiber-Rangliste">
      <p><strong>Dein neuer Job: Analyst:in im {ROLE.office}.</strong> Der {ROLE.fund} vergibt nächstes Jahr 1,5 Millionen Euro an Projekte. Er will das Geld dorthin lenken, wo die Zufriedenheit mit der Demokratie „entsteht“, und bestellt bei uns eine Rangliste: <strong>Welche Merkmale hängen am stärksten mit der Demokratiezufriedenheit in Deutschland zusammen?</strong> Grundlage ist der ALLBUS 2023, <code>ps03</code> (1 = sehr zufrieden … 6 = sehr unzufrieden). Polst du ps03 zuerst um, heißt ein höherer Wert: zufriedener.</p>
      <p>Du bekommst einen Kandidaten zugelost und lieferst genau einen Eintrag. Beachte:</p>
      <ul>
        <li>Die Rangliste soll für Deutschland gelten. Der ALLBUS hat Ostdeutsche absichtlich überrepräsentiert: 32 % der Befragten statt rund 17 % der Bevölkerung.</li>
        <li>Wähle das Maß, das zu deinen Variablen passt, und steh dafür ein.</li>
        <li>Der Fonds fördert in West und Ost. Prüfe, ob dein Zusammenhang in beiden Landesteilen hält.</li>
      </ul>
      <p><strong>Eintrag:</strong> Maß = Wert · Richtung in Worten · Stempel (trägt / schrumpft / nur in einem Landesteil / kehrt sich um) · ein Satz für den Fonds. Der Fonds nennt die Kandidaten „Treiber“. Ob das Wort stimmt, entscheidest du.</p>
    </RoleBrief>
    <PartnerToggle mode={state.mode} onChange={mode => set({ mode })}
      solo="Du bist erst Analyst:in (Maß wählen, gewichtet rechnen, Satz), dann Gegenleser:in des Fonds (zweite Währung, ohne Gewicht, Veto gegen „Treiber“). Die Rangliste am Ende zeigt dir, was sonst im Raum entsteht."
      pair="A ist Analyst:in: Maß wählen, gewichtet rechnen, Satz. B ist Gegenleser:in des Fonds: rechnet eine zweite Währung und ohne Gewicht, macht den Ost/West-Test und hat ein Veto gegen „Treiber“. Einigt euch auf einen Eintrag." />

    <section className="task-step">
      <h3>1 · Karte ziehen</h3>
      <div className="sandbox-chips">
        <button onClick={draw}><Shuffle size={14} aria-hidden="true" /> Karte ziehen</button>
        <label className="s05-pick">oder zugeteilte Karte wählen
          <select value={state.card ?? ''} onChange={e => onChange(pickCard(state, (e.target.value || null) as CardId | null))}>
            <option value="">–</option>{CARDS.map(c => <option key={c.id} value={c.id}>{c.title}{c.joker ? ' (Joker)' : ''}</option>)}
          </select>
        </label>
      </div>
      {card && <article className="task-card s05-card">
        <h4>{card.title}{card.joker && <span className="s05-joker"> Joker</span>} <code>{card.id}</code></h4>
        <p>{card.question}</p>
        {card.joker && <p className="sandbox-note">Der Joker ist bewusst „zu gut“: Prüfe, ob er überhaupt ein eigener Kandidat ist.</p>}
      </article>}
    </section>

    {card && <>
      <section className="task-step">
        <h3>2 · Skalenniveau und Maß</h3>
        <p>Schau mit <code>codebook()</code> nach und entferne Sonderkodes mit <code>rec()</code>. Welches Skalenniveau hat dein Kandidat, welches Maß passt?</p>
        <RBlock code={rSetupFor(card)} file="treiber-start.R" />
        <div className="sandbox-chips" role="group" aria-label="Skalenniveau">
          {LEVELS.map(l => <button key={l} aria-pressed={state.level === l} onClick={() => set({ level: l })}>{l}</button>)}
        </div>
        <Feedback notes={checkLevel(card, state.level)} />
        <div className="task-grid">
          <label>Maß<select value={state.measure} onChange={e => setMeasure(e.target.value as MeasureId | '')}>
            <option value="">bitte wählen</option>{MEASURE_IDS.map(m => <option key={m} value={m}>{measureLabel(m)}</option>)}
          </select></label>
        </div>
        <Feedback notes={fitNotes(p, card, vars, state.measure, recognised(vars, state.value))} />
      </section>

      <section className="task-step">
        <h3>3 · Gewichtet rechnen</h3>
        <label className="s04-check"><input type="checkbox" checked={state.weighted} onChange={e => set({ weighted: e.target.checked })} /> gewichtet mit wghtpew</label>
        <div className="task-grid">
          <label>Wert (drei Nachkommastellen)<input type="text" inputMode="decimal" maxLength={12} value={state.value} onChange={e => set({ value: e.target.value })} /></label>
        </div>
        <Feedback notes={main} />
        <HintLadder key={card.id} hint={{ ...hintTexts[card.level], workshop: WORKSHOP, scaffold: scaffoldFor(card), solution: rCodeFor(card) }} onConcept={onConcept} file="treiber.R" />
      </section>

      <section className="task-step">
        <h3>4 · {card.id === 'eastwest' ? 'Innerhalb gleicher Wirtschaftslage' : 'West und Ost'}</h3>
        <p>{card.id === 'eastwest'
          ? <>Bei dieser Karte ist der Landesteil selbst der Kandidat. Prüfe stattdessen, ob der Unterschied innerhalb gleicher Wirtschaftslage hält (Drittvariable). Rechne hier Gamma (<code>goodman_gamma()</code>), damit die Richtung sichtbar bleibt.</>
          : 'Rechne dasselbe Maß getrennt für West und Ost. Hält der Zusammenhang in beiden Landesteilen?'}</p>
        <div className="task-grid">
          {groups.map((g, i) => <label key={g.label}>{g.label}<input type="text" inputMode="decimal" maxLength={12} value={state.strata[i] ?? ''}
            onChange={e => set({ strata: state.strata.map((v, k) => (k === i ? e.target.value : v)) })} /></label>)}
        </div>
        <Feedback notes={checkStrata(p, card, vars, state.measure, state.strata.slice(0, groups.length))} />
        <div className="sandbox-chips" role="group" aria-label="Stempel">
          {STAMPS.map(s => <button key={s} aria-pressed={state.stamp === s} onClick={() => set({ stamp: s })}>{s}</button>)}
        </div>
        <Feedback notes={state.stamp && !strataDone
          ? [{ tone: 'hint', text: `Trag zuerst die Werte für ${groups.map(g => g.label).join(' und ')} ein – dann nenne ich meine Lesart nach der offengelegten Regel.` }]
          : checkStamp(p, card, vars, state.measure, state.stamp, state.strata.slice(0, groups.length))} />
        <details className="s05-rule"><summary>Die offengelegte Regel</summary><p>{stampRule(card)}</p></details>
      </section>

      <section className="task-step">
        <h3>5 · Dein Eintrag</h3>
        <label className="sandbox-label" htmlFor="s05-sentence">Ein Satz für den Fonds (Maß = Wert, Richtung in Worten, Stempel)</label>
        <textarea id="s05-sentence" maxLength={600} value={state.sentence} placeholder={card.id === 'eastwest'
            ? 'Maß = Wert: Wer …, ist eher … mit der Demokratie – auch innerhalb gleicher Wirtschaftslage … (Stempel).'
            : 'Maß = Wert: Wer …, ist eher … mit der Demokratie – in West und Ost … (Stempel).'}
          onChange={e => set({ sentence: e.target.value })} />
        <Feedback notes={driverQuestion(state.sentence)} />
      </section>

      <section className="task-step">
        <h3>6 · Gegenlesen für den Fonds</h3>
        <p>Rechne eine zweite Währung und dein Maß ohne Gewicht. Trägt das Wort „Treiber“?</p>
        <div className="task-grid">
          <label>Zweite Währung<select value={state.second.measure} onChange={e => setSecond({ measure: e.target.value as MeasureId | '' })}>
            <option value="">bitte wählen</option>{MEASURE_IDS.filter(m => m !== state.measure).map(m => <option key={m} value={m}>{measureLabel(m)}</option>)}
          </select></label>
          <label>Wert, gewichtet<input type="text" inputMode="decimal" maxLength={12} value={state.second.value} onChange={e => setSecond({ value: e.target.value })} /></label>
          <label>Dein Maß ohne Gewicht<input type="text" inputMode="decimal" maxLength={12} value={state.second.unweighted} onChange={e => setSecond({ unweighted: e.target.value })} /></label>
        </div>
        <Feedback notes={[
          ...checkEntry(p, card, vars, { measure: state.second.measure, weighted: true, value: state.second.value }),
          ...checkEntry(p, card, vars, { measure: state.measure, weighted: false, value: state.second.unweighted }),
          ...fitNotes(p, card, vars, state.second.measure, recognised(vars, state.second.value)),
        ]} />
        <label className="s04-check"><input type="checkbox" checked={state.second.veto} onChange={e => setSecond({ veto: e.target.checked })} /> Veto: Das Wort „Treiber“ trägt hier nicht</label>
      </section>

      {rev && <section className="task-step">
        <h3>7 · Die Rangliste in vier Währungen</h3>
        <p>So stehen alle Kandidaten aus deiner Datei da – jede Spalte ist eine andere Währung. Deine Karte ist hervorgehoben.</p>
        <div className="sandbox-chips" role="group" aria-label="Ansicht">
          {VIEWS.map(v => <button key={v} aria-pressed={state.view === v} onClick={() => set({ view: v })}>{VIEW_LABELS[v]}</button>)}
        </div>
        <RankChart data={rev} view={state.view} own={card.id} />
        <ul className="s05-notes">{revealNotes(rev, state.view).map(n => <li key={n}>{n}</li>)}</ul>
      </section>}

      {rev && <section className="task-step">
        <h3>8 · Empfehlung an den Fonds</h3>
        <label className="sandbox-label" htmlFor="s05-rec">Wie sieht eine faire Rangliste aus – und passt das Wort „Treiber“? (2–3 Sätze)</label>
        <textarea id="s05-rec" maxLength={800} value={state.recommendation} onChange={e => set({ recommendation: e.target.value })} />
      </section>}
    </>}

    <PlenumCard title="Treiber-Rangliste" lines={plenumLines(state)} file="treiber-plenum.md" />
    {card && statusS05(state) === 'done' && <details className="s02-solution"><summary>Ein vollständiges R-Skript zum Mitnehmen</summary><RBlock code={rCodeFor(card)} file="treiber.R" /></details>}
  </div>;
}
