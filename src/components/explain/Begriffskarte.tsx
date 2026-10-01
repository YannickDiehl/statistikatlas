import { useId, useState } from 'react';
import type { ConceptCard } from '../../explain/types';
import { Genau, Section, TopKurz, useExplainMode } from './basics';
import { ChoiceCheck, ConceptLink, NameBox, termFor, ThinkQuestions } from './pieces';
import { pictureFor } from './pictures/register';

/** Regler der Begriffskarte: Wert verändern, die Beschreibung darunter liest sich mit (aria-live). */
function Regler({ r, value, setValue }: { r: NonNullable<ConceptCard['regler']>; value: number; setValue: (v: number) => void }) {
  const id = useId();
  return (
    <div className="xw-regler">
      <label htmlFor={id}>{r.label}</label>
      <div className="xw-regler-row">
        <input id={id} type="range" min={r.min} max={r.max} step={r.step} value={value} aria-valuetext={r.format(value)} onChange={e => setValue(Number(e.target.value))} />
        <output htmlFor={id}>{r.format(value)}</output>
      </div>
      <p className="xw-regler-text" aria-live="polite">{r.describe(value)}</p>
    </div>
  );
}

/**
 * Begriffskarte (Vorlage 4) für Begriffe ohne Rechenkern: Wofür, Kurz gesagt, Stell dir vor …, optional das Bild
 * (mit dem Regler darunter), Das nennt man …, Bausteine im Lernkartenformat, Ausprobieren (ohne Bild mit dem Regler),
 * Probier es selbst, Was heißt das für dich?, Genau genommen.
 * Kompakt zeigt Kurz gesagt, Stell dir vor, das Bild, Das nennt man, die Bausteine mit „Was passiert?“ und „Was heißt das für dich?“.
 */
export function Begriffskarte({ card: c, onConcept }: { card: ConceptCard; onConcept: (id: string) => void }) {
  const [mode] = useExplainMode(), compact = mode === 'kompakt';
  const [value, setValue] = useState(c.regler?.initial ?? null);
  const draw = pictureFor(c.picture, 'begriff');
  const regler = c.regler && value !== null && <Regler r={c.regler} value={value} setValue={setValue} />;
  return (
    <div className={`xw xw-begriff${compact ? ' xw-compact' : ''}`}>
      {!compact && <div className="xw-wofuer"><h2>Wofür?</h2><p>{c.wofuer}</p></div>}
      <TopKurz text={c.kurz} />
      <Section title="Stell dir vor …">
        <p>{c.stellDirVor.text}</p>
        {c.stellDirVor.figures && <div className="xw-metrics">{c.stellDirVor.figures.map(f => <div key={f.label}><span>{f.label}</span><strong>{f.value}</strong></div>)}</div>}
      </Section>
      {draw && <Section title="Das Bild dazu">{draw({ card: c, value })}{regler}</Section>}
      <NameBox concept={c.concept} sym={c.heisst.sym} say={c.heisst.say} fach={c.heisst.fach} onConcept={onConcept} />
      <Section title="Schritt für Schritt">
        {c.bausteine.map((b, i) => (
          <div className="xw-card" key={i}>
            <span className="xw-label">Schritt {i + 1} von {c.bausteine.length}</span>
            <h3 className="xw-step-title">{b.title}</h3>
            <h4>Was passiert?</h4><p>{b.was}</p>
            {b.rechnung && <><h4>Rechnung</h4><p className="xw-rechnung">{b.rechnung}</p></>}
            {!compact && <>
              <h4>Warum?</h4><p>{b.warum}</p>
              <h4 className="xw-warn-head">Aufgepasst</h4><p>{b.acht}</p>
            </>}
            {b.concept && b.concept !== c.concept && <p className="xw-links-row"><ConceptLink id={b.concept} onConcept={onConcept}>{termFor(b.concept)} öffnen</ConceptLink></p>}
          </div>
        ))}
      </Section>
      {!compact && <ThinkQuestions title="Ausprobieren" note="Erst vermuten, dann nachsehen." lead={!draw && regler}
        items={c.ausprobieren.map(q => ({
          question: q.question, options: q.options, correct: q.correct, kurz: q.kurz, explain: () => q.explain,
          note: q.step ? `Mehr dazu in Schritt ${q.step}: ${c.bausteine[q.step - 1]?.title ?? ''}.` : undefined,
        }))} hint="" />}
      {!compact && <ChoiceCheck question={c.check.question} options={c.check.options} correct={c.check.correct} right={c.check.right} diagnose={c.check.diagnose} />}
      <Section title="Was heißt das für dich?"><p>{c.fuerDich}</p></Section>
      {!compact && <Genau kurz={c.genau.kurz} paragraphs={c.genau.paragraphs} />}
    </div>
  );
}
