import { useMemo } from 'react';
import { Feedback } from '../kit/Feedback';
import { HintLadder } from '../kit/HintLadder';
import { linkinv, logitOf } from '../kit/logit';
import { de } from '../kit/numbers';
import { PartnerToggle } from '../kit/PartnerToggle';
import { PlenumCard } from '../kit/PlenumCard';
import { RBlock } from '../kit/RBlock';
import { RoleBrief } from '../kit/RoleBrief';
import type { TaskProps } from '../types';
import { CAMPAIGN, CAMPAIGN_ANSWERS, DETOURS, hints, PERSONS, QUESTIONS, R_SOLUTION, R_START, UNITS, WORKSHOP, type CampaignAnswer, type Unit } from './content';
import {
  answerNotes, CELL_LABELS, CELLS, cellsOk, chainOk, checkAme, checkCells, checkChain, checkLikelihood, checkModel, checkReport, known,
  likelihoodOk, likelihoodReveal, NUMBER_MAX, odds3, plenumLines, prepare, sentenceNotes, statusS10, tafel, tafelNotes, tafelReady, type Cells, type S10State,
} from './domain';
import { SCurve } from './SCurve';
import { Tafel } from './Tafel';

const listJoin = (xs: string[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} und ${xs[xs.length - 1]}` : xs[0] ?? '');
const numberInput = (label: string, value: string, onChange: (v: string) => void, key?: string) =>
  <label key={key}>{label}<input type="text" inputMode="decimal" maxLength={NUMBER_MAX} value={value} onChange={e => onChange(e.target.value)} /></label>;

export function Buergerrat({ data, state, onChange, onConcept }: TaskProps<S10State>) {
  const p = useMemo(() => prepare(data.sav), [data.sav]);
  const set = (patch: Partial<S10State>) => onChange({ ...state, ...patch });
  const pair = state.mode === 'pair';
  const k = known(p, state);
  const janaDone = chainOk(p, state.jana);
  const oddsDone = cellsOk(p, state.odds, 'odds'), probDone = cellsOk(p, state.prob, 'prob');
  const ready = tafelReady(p, state);
  const rows = ready ? tafel(p) : [];
  const setCells = (lang: 'odds' | 'prob', cell: keyof Cells, v: string) => set({ [lang]: { ...state[lang], [cell]: v } } as Partial<S10State>);
  const missing = [!janaDone && 'Janas drei Zahlen (Station 2)', !oddsDone && 'die drei Chancen', !probDone && 'die drei Wahrscheinlichkeiten',
    !(state.campaign && state.answer3.trim()) && 'deine Antwort auf Frage 3'].filter(Boolean) as string[];
  const llDone = likelihoodOk(p, state.likelihood);
  const setLl = (patch: Partial<S10State['likelihood']>) => set({ likelihood: { ...state.likelihood, ...patch } });
  const setReport = (patch: Partial<S10State['report']>) => set({ report: { ...state.report, ...patch } });

  return <div className="task s10">
    <RoleBrief role="Statistik-Dolmetscher:in" title="Dolmetschen für den Bürgerrat">
      <p><strong>Dein neuer Job: Statistik-Dolmetscher:in.</strong> Ein per Los besetzter Bürgerrat berät, wie mehr Menschen wählen gehen. Gestern hat ein Sachverständiger ein Modell aus dem ALLBUS 2023 vorgestellt: Die Wahlabsicht wird erklärt durch die Zustimmung zu „Wahlbeteiligung ist Bürgerpflicht“ (<code>pe09</code>) und durch politisches Interesse (<code>pa02a</code>). Auf seiner Folie stand nur:</p>
      <figure className="sandbox-quote"><blockquote>„Pflichtgefühl: Exp(B) = 3,77 ***“</blockquote></figure>
      <p>Dann musste er zum Zug. Der Rat plant eine Kampagne {CAMPAIGN}. Zwei Mitglieder melden sich, und die Moderatorin sammelt vier Fragen:</p>
      <ol className="s10-questions">{QUESTIONS.map(q => <li key={q}>{q}</li>)}</ol>
      <p>Du hast die Datei des Sachverständigen nicht, aber denselben ALLBUS. Rechne nach, bevor du übersetzt – der Rat verlässt sich auf deine Worte. Eine Musterantwort gibt es nicht, wohl aber falsche Zahlen.</p>
      <p className="sandbox-note">Die Pflichtfrage wurde nur einer Split-Hälfte gestellt; im Modell ist gut die Hälfte der Befragten. Es geht um die geäußerte Absicht, nicht um tatsächliches Wählen.</p>
    </RoleBrief>
    <div className="s10-council">{Object.values(PERSONS).map(m => <article key={m.id} className="task-card">
      <h4>{m.name}, {m.age}</h4><p>{m.quote}</p>
    </article>)}</div>
    <PartnerToggle mode={state.mode} onChange={mode => set({ mode })}
      solo="Du übersetzt nacheinander in beide Sprachen: erst in Chancen (Jana von Hand, dann eine Stufe mehr nur mit × Exp(B), ohne R), dann in Wahrscheinlichkeiten (predict(), marginal_effects()). Am Ende steht ein Satz, der beide Sprachen verbindet."
      pair="A übersetzt in Chancen: Jana von Hand, dann eine Stufe mehr nur mit × Exp(B) – ohne R. B übersetzt in Wahrscheinlichkeiten: predict() und marginal_effects(). A wird vermutlich „gleich“ sagen, B „bei Jana“. Einigt euch auf einen Satz für den Rat. Die Dolmetscher-Tafel erscheint erst, wenn beide Zahlenreihen auf einem Bildschirm stehen." />

    <section className="task-step">
      <h3>1 · Nachrechnen</h3>
      <p>Bau das Modell des Sachverständigen in RStudio nach: Wahlabsicht (1 = würde wählen, 0 = würde nicht wählen) erklärt durch Pflichtgefühl und politisches Interesse, gewichtet mit <code>wghtpew</code>. Trag beide Exp(B) ein.</p>
      <RBlock code={R_START} file="buergerrat-start.R" />
      <p className="sandbox-note">Erscheint die Warnmeldung „Nicht-ganzzahlige #Erfolge in einem binomial-GLM“? Sie ist harmlos: R meldet nur, dass die Gewichte keine ganzen Zahlen sind. Die Schätzung stimmt trotzdem.</p>
      {p.problem ? <p className="sandbox-error" role="alert">Mit dieser Datei lässt sich das Modell nicht schätzen: {p.problem}</p> : <>
        <div className="task-grid">
          {numberInput('Exp(B) Pflichtgefühl', state.or.pflicht, v => set({ or: { ...state.or, pflicht: v } }))}
          {numberInput('Exp(B) politisches Interesse', state.or.interesse, v => set({ or: { ...state.or, interesse: v } }))}
        </div>
        <Feedback notes={checkModel(p, state.or)} />
      </>}
      <HintLadder hint={{ ...hints.model, workshop: WORKSHOP }} onConcept={onConcept} file="buergerrat-modell.R" />
    </section>

    {!p.problem && <>
      <section className="task-step">
        <h3>2 · {pair ? 'A: ' : ''}Jana von Hand übersetzen</h3>
        <p>Jana fragt: „Was heißt das für jemanden wie mich?“ Übersetze Schritt für Schritt: erst den Logit (Konstante + B × Wert), dann die Chance, dann die Wahrscheinlichkeit. Im Modell stehen die umgepolten Skalen.</p>
        <div className="task-grid">
          {numberInput('Logit', state.jana.logit, v => set({ jana: { ...state.jana, logit: v } }))}
          {numberInput('Chance', state.jana.odds, v => set({ jana: { ...state.jana, odds: v } }))}
          {numberInput('Wahrscheinlichkeit', state.jana.prob, v => set({ jana: { ...state.jana, prob: v } }))}
        </div>
        <Feedback notes={checkChain(p, state.jana)} />
        {janaDone && p.main && (() => {
          const l = logitOf(p.main, p.profiles.jana);
          return <p className="s10-reveal">Übersetzt: Janas Chance steht {odds3(Math.exp(l))} zu 1. Von 100 Menschen, die so antworten wie Jana, würden etwa {de(100 * linkinv(l), 0)} wählen gehen.</p>;
        })()}
        <HintLadder hint={{ ...hints.jana, workshop: WORKSHOP }} onConcept={onConcept} file="buergerrat-jana.R" />
      </section>

      <section className="task-step">
        <h3>3 · Frage 1 der Moderatorin</h3>
        <figure className="sandbox-quote"><blockquote>{QUESTIONS[0]}</blockquote></figure>
        <label className="sandbox-label" htmlFor="s10-answer1">Deine Antwort für den Rat (ein bis zwei Sätze)</label>
        <textarea id="s10-answer1" maxLength={800} value={state.answer1} onChange={e => set({ answer1: e.target.value })} />
        <Feedback notes={answerNotes(state.answer1, k)} />
      </section>

      <section className="task-step">
        <h3>4 · Eine Stufe mehr – für beide</h3>
        <p>Die Kampagne soll das Pflichtgefühl um eine Stufe heben. Was ändert das für Menschen wie Jana, was für Menschen wie Herrn Wiegand? Übersetze in zwei Sprachen.</p>
        <div className="s10-langs">
          <div className="task-card">
            <h4>{pair ? 'A · in Chancen' : 'Sprache 1 · Chancen'}</h4>
            <p className="sandbox-note">Ohne R: Eine Stufe mehr heißt Chance × Exp(B). Für Herrn Wiegand rechnest du zuerst seinen Logit wie bei Jana.</p>
            <div className="task-grid">{CELLS.map(c => numberInput(`Chance: ${CELL_LABELS[c]}`, state.odds[c], v => setCells('odds', c, v), c))}</div>
            <Feedback notes={checkCells(p, state.odds, 'odds')} />
          </div>
          <div className="task-card">
            <h4>{pair ? 'B · in Wahrscheinlichkeiten' : 'Sprache 2 · Wahrscheinlichkeiten'}</h4>
            <p className="sandbox-note">Mit <code>predict()</code> für vier Profile – als Anteil (z. B. 0,815) oder in Prozent (81,5 %).</p>
            <div className="task-grid">{CELLS.map(c => numberInput(`Wahrscheinlichkeit: ${CELL_LABELS[c]}`, state.prob[c], v => setCells('prob', c, v), c))}</div>
            <Feedback notes={checkCells(p, state.prob, 'prob')} />
          </div>
        </div>
        <HintLadder hint={{ ...hints.profiles, workshop: WORKSHOP }} onConcept={onConcept} file="buergerrat-profile.R" />

        <h4 className="s10-sub">Frage 3</h4>
        <figure className="sandbox-quote"><blockquote>{QUESTIONS[2]}</blockquote></figure>
        <div className="sandbox-chips" role="group" aria-label="Antwort auf Frage 3">
          {CAMPAIGN_ANSWERS.map(a => <button key={a.id} aria-pressed={state.campaign === a.id} onClick={() => set({ campaign: a.id as CampaignAnswer })}>{a.label}</button>)}
        </div>
        <label className="sandbox-label" htmlFor="s10-answer3">Dein Satz für den Rat</label>
        <textarea id="s10-answer3" maxLength={800} value={state.answer3} onChange={e => set({ answer3: e.target.value })} />
        {!ready && <p className="sandbox-note">Die Dolmetscher-Tafel erscheint, sobald {listJoin(missing)} {missing.length > 1 ? 'stehen' : 'steht'}.</p>}
        {ready && p.main && <div className="s10-reveal-block">
          <Tafel rows={rows} or={p.main.expB[1]} />
          <SCurve fit={p.main} profiles={p.profiles} range={p.pflichtRange} />
          <Feedback notes={tafelNotes(p, state.campaign, state.answer3)} />
          <label className="sandbox-label" htmlFor="s10-joint">{pair ? 'Euer gemeinsamer Satz' : 'Dein Satz in beiden Sprachen'} – so, dass der Rat Chancen und Wahrscheinlichkeiten hört</label>
          <textarea id="s10-joint" maxLength={800} value={state.joint} onChange={e => set({ joint: e.target.value })} />
          <Feedback notes={sentenceNotes(state.joint, '', k)} />
        </div>}
      </section>

      <section className="task-step">
        <h3>5 · {pair ? 'B: ' : ''}Die eine Zahl für den Bericht</h3>
        <figure className="sandbox-quote"><blockquote>{QUESTIONS[3]}</blockquote></figure>
        <p>Rechne in R den durchschnittlichen marginalen Effekt (AME) des Pflichtgefühls. Dann entscheide: Welche Zahl – aus dem Modell, von der Tafel oder aus <code>marginal_effects()</code> – kommt in den Bericht? Mit Einheit und einem Satz für Laien.</p>
        <div className="task-grid">{numberInput('AME Pflichtgefühl', state.ame, v => set({ ame: v }))}</div>
        <Feedback notes={checkAme(p, state.ame)} />
        <HintLadder hint={{ ...hints.ame, workshop: WORKSHOP }} onConcept={onConcept} file="buergerrat-ame.R" />
        <div className="task-grid">
          {numberInput('Die Zahl für den Bericht', state.report.number, v => setReport({ number: v }))}
          <label>Einheit<select value={state.report.unit} onChange={e => setReport({ unit: e.target.value as Unit | '' })}>
            <option value="">bitte wählen</option>{UNITS.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
          </select></label>
        </div>
        <Feedback notes={checkReport(p, state.report.number, state.report.unit, ready)} />
        <label className="sandbox-label" htmlFor="s10-sentence">Ein Satz für Laien, der die Zahl erklärt</label>
        <textarea id="s10-sentence" maxLength={600} value={state.report.sentence} onChange={e => setReport({ sentence: e.target.value })} />
        <Feedback notes={sentenceNotes(state.report.sentence, state.report.unit, k)} />
      </section>

      <details className="task-step s10-extra">
        <summary>6 · Zusatz: Trefferquote gegen Likelihood</summary>
        <p>Ein Ratsmitglied hat gehört, das Modell liege „fast immer richtig“. Stimmt das – und heißt das, es ist ein gutes Modell? Trag aus <code>summary(modell)</code> die Trefferquote ein, dazu die Trefferquote der Regel „alle wählen“ und beide −2LL.</p>
        <div className="task-grid">
          {numberInput('Trefferquote des Modells (%)', state.likelihood.hitModel, v => setLl({ hitModel: v }))}
          {numberInput('Trefferquote „alle wählen“ (%)', state.likelihood.hitAll, v => setLl({ hitAll: v }))}
          {numberInput('−2LL Nullmodell', state.likelihood.nullLL, v => setLl({ nullLL: v }))}
          {numberInput('−2LL Modell', state.likelihood.modelLL, v => setLl({ modelLL: v }))}
        </div>
        <Feedback notes={checkLikelihood(p, state.likelihood)} />
        <HintLadder hint={{ ...hints.likelihood, workshop: WORKSHOP }} onConcept={onConcept} file="buergerrat-likelihood.R" />
        {llDone && <>
          <ul className="s10-notes">{likelihoodReveal(p).map(t => <li key={t}>{t}</li>)}</ul>
          <label className="sandbox-label" htmlFor="s10-ll">Dein Satz für das Ratsmitglied</label>
          <textarea id="s10-ll" maxLength={600} value={state.likelihood.sentence} onChange={e => setLl({ sentence: e.target.value })} />
        </>}
      </details>
    </>}

    <PlenumCard title="Ratskarte · Dolmetschen für den Bürgerrat" lines={plenumLines(state, p)} file="buergerrat-ratskarte.md" />
    <p className="sandbox-note">Im Raum: Verschiedene Zahlen, alle aus einem Modell, alle richtig. Stimmt ab, welche in den Bericht kommt. Welche versteht eine Zeitung falsch? Welche ist für Jana ehrlich?</p>
    {statusS10(state) === 'done' && <>
      <details className="s10-afterword">
        <summary>Nachwort: sechs typische Umwege</summary>
        <ol>{DETOURS.map(d => <li key={d.title}><strong>{d.title}.</strong> {d.text}</li>)}</ol>
        <p>Und das Wichtigste: In Wahrscheinlichkeiten hat das Logit-Modell eine eingebaute Wechselwirkung. Wie viel eine Stufe mehr bringt, hängt davon ab, wo jemand auf der S-Kurve steht – deshalb gibt es nicht die eine Zahl, sondern eine Wahl der Sprache (Brücke zu Sitzung 9).</p>
      </details>
      <details className="s02-solution"><summary>Ein vollständiges R-Skript zum Mitnehmen</summary><RBlock code={R_SOLUTION.full} file="buergerrat.R" /></details>
    </>}
  </div>;
}
