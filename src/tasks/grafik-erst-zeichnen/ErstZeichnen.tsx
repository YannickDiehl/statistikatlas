import { useMemo } from 'react';
import { Feedback } from '../kit/Feedback';
import { HintLadder } from '../kit/HintLadder';
import { de } from '../kit/numbers';
import { PartnerToggle } from '../kit/PartnerToggle';
import { PlenumCard } from '../kit/PlenumCard';
import { RBlock } from '../kit/RBlock';
import { RoleBrief } from '../kit/RoleBrief';
import type { TaskProps } from '../types';
import { AxisBars, PlanChart, Silhouette, SketchOverlay, SketchPad } from './Charts';
import {
  AXIS_MAX_START, CANDIDATES, GEOMS, hints, QUESTIONS, R_AXIS, R_SETUP, R_SILHOUETTES, R_SKETCH, SILHOUETTE_IDS, SILHOUETTES, VARS,
  type GeomId, type Level, type QuestionId,
} from './content';
import {
  axisNotes, axisTop, checkCaption, checkMeans, checkRead, compareSketch, meansOk, planCode, planPreview, plenumLines, questionById, rCodeFor,
  readOk, regionMeans, rSolution, silhouetteBars, silhouetteResults, silhouetteStory, sketchShares, sketchSummary, sketchTruth, statusGrafik,
  type GrafikState,
} from './domain';

const LEVEL: Record<Level, { text: string; concept: string }> = {
  nominal: { text: 'Kategorien ohne Reihenfolge', concept: 'nominal' },
  ordinal: { text: 'geordnete Kategorien', concept: 'ordinal' },
  metric: { text: 'metrisch', concept: 'metric' },
};

export function ErstZeichnen({ data, state, onChange, onConcept }: TaskProps<GrafikState>) {
  const set = (patch: Partial<GrafikState>) => onChange({ ...state, ...patch });
  const sav = data.sav;
  const truth = useMemo(() => sketchTruth(sav), [sav]);
  const silhouettes = useMemo(() => Object.fromEntries(SILHOUETTE_IDS.map(id => [id, silhouetteBars(sav, SILHOUETTES[id])])), [sav]);
  const means = useMemo(() => regionMeans(sav), [sav]);
  const question = state.question ? questionById(state.question) : null;
  const { geom: planGeom, x: planX, second: planSecond } = state.plan;
  // Nach Bauplan-Feldern, nicht nach Objekt: Der Zustand wird bei jeder Eingabe neu gelesen, die Vorschau soll dann nicht neu rechnen.
  const preview = useMemo(() => (question ? planPreview(sav, question, { geom: planGeom, x: planX, second: planSecond }) : null), [sav, question, planGeom, planX, planSecond]);
  const own = sketchSummary(state.sketch);
  const revealed = state.locked && readOk(truth, state.sketch, state.read);
  const results = silhouetteResults(state);
  const geom = GEOMS.find(g => g.id === state.plan.geom);
  const link = (id: string, label: string) => <button className="sandbox-link" onClick={() => onConcept(id)}>{label}</button>;

  const chooseQuestion = (id: QuestionId) => {
    const q = questionById(id);
    if (id === state.question) return;
    // Neue Leitfrage, neues Bild: Die Bildunterschrift gehört zum alten.
    set({ question: id, plan: { geom: state.plan.geom, x: q.group, second: q.outcome }, caption: '' });
  };

  return <div className="task grafik">
    <RoleBrief role="Grafikredaktion eines Schulbuchverlags" title="Erst zeichnen, dann zeigen">
      <p>Der Verlag Kreidestrich plant für das Politikbuch der Oberstufe die Doppelseite „Wie geht es Deutschland?“. Die Lektorin schreibt:</p>
      <p>„Schülerinnen und Schüler glauben Grafiken mehr als Zahlen. Darum gilt bei uns: Vor jeder Grafik wird skizziert, was man erwartet – sonst merkt man nicht, was die Daten einem beibringen. Und keine Grafik geht in den Druck, die mehr verspricht als die Daten.“</p>
      <p>Du lieferst vier Dinge: eine Vorher-Skizze neben der echten Verteilung, einen Rätselkasten mit vier Silhouetten, die Grafik zu einer Leitfrage mit Bildunterschrift und deine Entscheidung über die Achse eines Ost-West-Vergleichs. Gezeichnet wird in RStudio mit ggplot2; hier trägst du ein, was du abliest, und bekommst Rückmeldung.</p>
    </RoleBrief>
    <PartnerToggle mode={state.mode} onChange={mode => set({ mode })}
      solo="Du skizzierst, rätst, baust und entscheidest selbst. Die Vorschau im Bauplan zeigt dir, was ggplot2 aus anderen Entscheidungen machen würde."
      pair="A skizziert die Lebenszufriedenheit, B tippt verdeckt auf die Silhouetten; dann tauscht ihr und deckt gemeinsam auf. Im Bauplan nehmt ihr dieselbe Leitfrage, aber verschiedene Formen, und entscheidet, welche ins Buch kommt." />
    <RBlock code={R_SETUP} file="erst-zeichnen-start.R" />

    <section className="task-step">
      <h3>Teil 1 · Erst zeichnen</h3>
      <p>„Wie zufrieden sind Sie gegenwärtig, alles in allem, mit Ihrem Leben?“ – 0 heißt ganz unzufrieden, 10 ganz zufrieden. Zieh die Balken so hoch, wie du die Antworten von gut 5.000 Befragten erwartest. Nicht nachsehen: Es zählt deine Erwartung.</p>
      <SketchPad heights={state.sketch} onChange={sketch => set({ sketch })} disabled={state.locked} />
      {own && <p className="sandbox-note">Deine Skizze: Gipfel bei {own.peak}, Mittel bei {de(own.mean)}.</p>}
      {!state.locked
        ? <button className="primary" disabled={!own} onClick={() => set({ locked: true })}>Skizze abgeben</button>
        : <p className="sandbox-note">Abgegeben. <button className="sandbox-link" onClick={() => set({ locked: false, read: { peak: '', count: '' } })}>Neu skizzieren</button></p>}
      {state.locked && <>
        <p>Jetzt die echte Verteilung in R. Lies an deiner Grafik ab: Wo steht der höchste Balken, und wie hoch ist er ungefähr?</p>
        <RBlock code={R_SKETCH} />
        <div className="task-grid">
          <label>Höchster Balken bei (0–10)<input type="text" inputMode="numeric" maxLength={12} value={state.read.peak} onChange={e => set({ read: { ...state.read, peak: e.target.value } })} /></label>
          <label>Höhe: etwa wie viele Befragte?<input type="text" inputMode="numeric" maxLength={12} value={state.read.count} onChange={e => set({ read: { ...state.read, count: e.target.value } })} /></label>
        </div>
        <Feedback notes={checkRead(truth, state.sketch, state.read)} />
        {revealed && <>
          <SketchOverlay truth={truth} sketch={sketchShares(state.sketch)} />
          <Feedback notes={compareSketch(truth, state.sketch)} />
          <p className="sandbox-note">In der Karte: {link('mode', 'Modus')} · {link('shape', 'Schiefe')} · {link('empirical_distribution', 'Empirische Verteilung')}</p>
        </>}
        <HintLadder hint={hints.sketch} onConcept={onConcept} />
      </>}
    </section>

    <section className="task-step">
      <h3>Teil 2 · Rätselkasten: Welche Frage hat diese Form?</h3>
      <p>Für den Rand der Doppelseite: vier echte Verteilungen aus dem ALLBUS, ohne Achsen und ohne Titel. Ordne jeder Silhouette ihre Frage zu – eine der fünf Fragen bleibt übrig. Prüf deinen Verdacht in R, bevor du auflöst.</p>
      <ul className="grafik-candidates">
        {CANDIDATES.map(name => <li key={name}><strong>{VARS[name].title}</strong> <code>{name}</code><span>{VARS[name].question}</span><small>{VARS[name].scale}</small></li>)}
      </ul>
      <div className="grafik-silhouettes">
        {SILHOUETTE_IDS.map(id => {
          const r = results.find(x => x.id === id)!;
          return <figure key={id} className={state.solved ? (r.correct ? 'right' : 'wrong') : ''}>
            <Silhouette bars={silhouettes[id]} label={`Silhouette ${id}`} />
            <figcaption>
              <label>{id}<select value={state.silhouettes[id] ?? ''} disabled={state.solved} onChange={e => set({ silhouettes: { ...state.silhouettes, [id]: e.target.value } })}>
                <option value="">Frage wählen</option>
                {CANDIDATES.map(name => <option key={name} value={name}>{VARS[name].title}</option>)}
              </select></label>
              {state.solved && <p><strong>{r.correct ? 'Richtig' : `Das ist: ${VARS[r.truth].title}`}.</strong> {silhouetteStory(sav, id, r.chosen)}</p>}
            </figcaption>
          </figure>;
        })}
      </div>
      {!state.solved
        ? <button className="primary" disabled={SILHOUETTE_IDS.some(id => !state.silhouettes[id])} onClick={() => set({ solved: true })}>Auflösen</button>
        : <Feedback notes={[{ tone: results.every(r => r.correct) ? 'ok' : 'hint', text: `${results.filter(r => r.correct).length} von 4 richtig. Übrig bleibt: ${VARS[CANDIDATES.find(c => !Object.values(SILHOUETTES).includes(c))!].title}.` }]} />}
      <RBlock code={R_SILHOUETTES} />
      <p className="sandbox-note">In der Karte: {link('discrete_continuous', 'Diskret & stetig')} · {link('frequency', 'Häufigkeiten')} · {link('codebook', 'Codebuch')}</p>
      <HintLadder hint={hints.silhouettes} onConcept={onConcept} />
    </section>

    <section className="task-step">
      <h3>Teil 3 · Der Bauplan</h3>
      <p>Die Lektorin hat drei Leitfragen für die Doppelseite. Wähl eine und entscheide: Welche Form, welche Variable wohin? Die Vorschau zeigt, was ggplot2 aus deinem Bauplan macht – auch, wenn R einen Fehler meldet. Probier ruhig Formen aus, die nicht passen.</p>
      <div className="sandbox-chips" role="group" aria-label="Leitfrage">
        {QUESTIONS.map(q => <button key={q.id} aria-pressed={state.question === q.id} onClick={() => chooseQuestion(q.id)}>{q.text}</button>)}
      </div>
      {question && <>
        <ul className="grafik-vars">
          {[question.group, question.outcome].map(name => <li key={name}>
            <code>{name}</code> {VARS[name].title}: {VARS[name].scale} · {link(LEVEL[VARS[name].level].concept, LEVEL[VARS[name].level].text)}
          </li>)}
        </ul>
        <div className="sandbox-chips" role="group" aria-label="Form (geom)">
          {GEOMS.map(g => <button key={g.id} aria-pressed={state.plan.geom === g.id} onClick={() => set({ plan: { ...state.plan, geom: g.id as GeomId } })}>{g.label}</button>)}
        </div>
        <div className="task-grid">
          <label>x<select value={state.plan.x} onChange={e => {
            const x = e.target.value;
            set({ plan: { ...state.plan, x, second: state.plan.second === x ? (x === question.group ? question.outcome : question.group) : state.plan.second } });
          }}>
            {[question.group, question.outcome].map(name => <option key={name} value={name}>{name} · {VARS[name].title}</option>)}
          </select></label>
          <label>{geom?.role === 'y' ? 'y' : 'fill (Farbe)'}<select value={state.plan.second} onChange={e => set({ plan: { ...state.plan, second: e.target.value } })}>
            <option value="">keine</option>
            {[question.group, question.outcome].filter(n => n !== state.plan.x).map(name => <option key={name} value={name}>{name} · {VARS[name].title}</option>)}
          </select></label>
        </div>
        {state.plan.geom && <>
          <p className="sandbox-note">Dein Bauplan in ggplot2:</p>
          <pre className="sandbox-code">{planCode(state.plan)}</pre>
          {preview?.view && <PlanChart view={preview.view} />}
          <Feedback notes={preview?.notes ?? []} />
          <label className="sandbox-label" htmlFor="grafik-caption">Bildunterschrift fürs Schulbuch: ein Satz, was das Bild zeigt, dazu n und Quelle</label>
          <textarea id="grafik-caption" maxLength={400} placeholder="… (ALLBUS 2023, n = …)" value={state.caption} onChange={e => set({ caption: e.target.value })} />
          <Feedback notes={checkCaption(sav, state.plan, state.caption)} />
        </>}
        <p className="sandbox-note">In der Karte: {link('quantile', 'Quantile (Boxplot)')} · {link('crosstab', 'Kreuztabelle')} · {link('labels', 'Labels')} · {link('missing', 'Fehlende Angaben')}</p>
        <HintLadder hint={{ ...hints.plan, solution: rCodeFor(question, state.plan) }} onConcept={onConcept} file="erst-zeichnen-bauplan.R" />
      </>}
    </section>

    <section className="task-step">
      <h3>Teil 4 · Wo beginnt die Achse?</h3>
      <p>Für den Ost-West-Vergleich will die Chefredaktion Drama: „Mach den Unterschied sichtbar!“ Rechne in R die mittlere Lebenszufriedenheit in West und Ost und entscheide dann, wo die y-Achse beginnt.</p>
      <RBlock code={R_AXIS} />
      <div className="task-grid">
        <label>Mittel West<input type="text" inputMode="decimal" maxLength={12} value={state.axis.west} onChange={e => set({ axis: { ...state.axis, west: e.target.value } })} /></label>
        <label>Mittel Ost<input type="text" inputMode="decimal" maxLength={12} value={state.axis.east} onChange={e => set({ axis: { ...state.axis, east: e.target.value } })} /></label>
      </div>
      <Feedback notes={checkMeans(sav, state.axis)} />
      {meansOk(sav, state.axis) && <>
        <label className="grafik-slider">Die y-Achse beginnt bei {de(state.axis.start)}
          <input type="range" min={0} max={AXIS_MAX_START} step={0.1} value={state.axis.start} onChange={e => set({ axis: { ...state.axis, start: Number(e.target.value) } })} />
        </label>
        <AxisBars west={means.west} east={means.east} start={state.axis.start} top={axisTop(means)} />
        <Feedback notes={axisNotes(sav, state.axis.start)} />
        <label className="sandbox-label" htmlFor="grafik-reason">Deine Antwort an die Chefredaktion: Warum beginnt die Achse dort?</label>
        <textarea id="grafik-reason" maxLength={400} value={state.axis.reason} onChange={e => set({ axis: { ...state.axis, reason: e.target.value } })} />
      </>}
      <HintLadder hint={hints.axis} onConcept={onConcept} />
    </section>

    <PlenumCard title="Erst zeichnen, dann zeigen" lines={plenumLines(sav, state)} file="erst-zeichnen-plenum.md" />
    {statusGrafik(state) === 'done' && question && <details className="s02-solution"><summary>Ein vollständiges R-Skript zum Mitnehmen</summary><RBlock code={rSolution(question, state.plan)} file="erst-zeichnen.R" /></details>}
  </div>;
}
