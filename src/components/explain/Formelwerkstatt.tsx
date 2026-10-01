import { useEffect, useMemo, useRef, useState } from 'react';
import { ref, titleFor } from '../../domain/learning';
import { txt, type AnyWorkshop, type Ctx, type Workshop } from '../../explain/types';
import { close, num } from '../../explain/format';
import { takeStep, type StepCard as StepCardData } from '../../explain/registry';
import { AllGlyphs, FormulaView, Genau, MutBox, Section, StepNav, TopKurz, useExplainMode, useTabLink, useWorkbenchLayout } from './basics';
import { CheckQuestion, ConceptLink, LearnCard, ThinkQuestions, WorkTable } from './pieces';
import { pictureFor } from './pictures/register';

/** Bild-Register aller Vorlagen (Schlüssel `mittel`, `streuung`, `zusammenhang` und die der Bereiche), siehe ./pictures/register.ts. */
export { mergePictures, PICTURES } from './pictures/register';

const RIGHT_NA = 'Genau, NA. Hier lässt sich kein Wert berechnen.';
const NUMBER_WORDS = ['Null', 'Eine', 'Zwei', 'Drei', 'Vier', 'Fünf', 'Sechs', 'Sieben', 'Acht', 'Neun', 'Zehn', 'Elf', 'Zwölf'];
/** „Fünf Beispielpersonen“, „Eine Beispielperson“, „15 Beispielpersonen“. */
const people = (n: number) => n === 1 ? 'Eine Beispielperson' : `${NUMBER_WORDS[n] ?? n} Beispielpersonen`;
const GENERAL = 'Noch nicht ganz. Schau oben in die Rechnung, sie zeigt jeden Zwischenschritt.';

/** Werkstatt (Vorlage 1). `variant` ist der Begriff, zum Beispiel „sd“. */
export function Formelwerkstatt({ workshop, variant, onConcept }: { workshop: AnyWorkshop; variant: string; onConcept: (id: string) => void }) {
  const w: Workshop<any, any> = workshop;
  return <WorkshopView workshop={w} variant={variant} onConcept={onConcept} />;
}

function WorkshopView<D, S>({ workshop: w, variant, onConcept }: {
  workshop: Workshop<D, S>; variant: string; onConcept: (id: string) => void;
}) {
  const v = w.variants[variant], picture = pictureFor(w.picture, 'werkstatt');
  const [mode] = useExplainMode(), compact = mode === 'kompakt';
  const [data, setDataRaw] = useState(w.presets[0].data);
  const [step, setStepRaw] = useState(1);
  const [who, setWho] = useState(0);
  const [checkKey, setCheckKey] = useState(0);
  const [focusCard, setFocusCard] = useState(0);
  const cardHeading = useRef<HTMLHeadingElement>(null);
  const s = useMemo(() => w.compute(data), [w, data]);
  const ctx: Ctx<S> = { s, who, names: w.names };
  const reset = () => setCheckKey(k => k + 1);
  const setStep = (n: number) => { setStepRaw(Math.max(1, Math.min(v.lastStep, n))); reset(); };
  const setData = (d: D) => { setDataRaw(d); reset(); };
  const pickWho = (i: number) => { setWho(i); reset(); };
  // Sprung aus einer Schrittkarte: nach dem Einhängen abholen (kein Seiteneffekt beim Rendern).
  useEffect(() => { const requested = takeStep(variant); if (requested) setStepRaw(Math.min(requested, v.lastStep)); }, [variant, v.lastStep]);
  useEffect(() => { if (focusCard) cardHeading.current?.focus(); }, [focusCard]);
  // In der Reiterleiste: Schritt melden („Weiter mit 200 Befragten“ setzt dort denselben Schritt) und Sprünge annehmen.
  const link = useTabLink();
  useEffect(() => { link.onStep?.(step); }, [step, link.onStep]);
  useEffect(() => { if (link.goTo) { setStepRaw(Math.max(1, Math.min(link.goTo.step, v.lastStep))); setFocusCard(n => n + 1); } }, [link.goTo?.n]);
  const stepData = w.steps[step - 1];
  const active = JSON.stringify(data);
  const layout = useWorkbenchLayout(), wide = layout.wide && !compact;

  const formula = <>
    <FormulaView className="xw-symbolic" nodes={v.symbolic} active={step} onMark={m => setStep(m as number)} label={v.aria} />
    <FormulaView className="xw-numeric" nodes={w.numeric(ctx, v.lastStep)} active={step} onMark={m => setStep(m as number)} />
  </>;
  // In der breiten Werkbank stehen die Schrittknöpfe rechts über der Lernkarte: So bleibt die Formel links klein genug zum Stehenbleiben.
  const stepNav = <StepNav steps={w.steps.slice(0, v.lastStep)} active={step} onStep={setStep} />;
  const learnCard = <LearnCard step={stepData} ctx={ctx} compact={compact} onConcept={onConcept} onWho={pickWho} current={variant} headingRef={cardHeading}
    position={{ step, last: v.lastStep, onStep: setStep }} />;
  const table = !compact && <Section title="Die Rechentabelle" note="So rechnest du es auch auf Papier. Mit jedem Schritt kommt eine Spalte dazu.">
    <WorkTable workshop={w} ctx={ctx} step={step} lastStep={v.lastStep} onWho={pickWho} />
  </Section>;
  const image = <Section title="Das Bild dazu" note={w.captions[step]}>{picture?.({ workshop: w, data, s, step, who, setData, pickWho })}</Section>;
  const check = !compact && <CheckQuestion key={`${variant}-${checkKey}`} question={txt(stepData.check.question, ctx)}
    evaluate={value => {
      const answer = stepData.check.answer(ctx);
      const ok = answer === 'NA' ? value === 'NA' : value !== 'NA' && value.some(x => close(x, answer));
      if (ok) return { ok, message: answer === 'NA' ? RIGHT_NA : `Genau, ${num(answer)}.` };
      const hint = value === 'NA' ? stepData.check.diagnose(ctx, 'NA') : value.map(x => stepData.check.diagnose(ctx, x)).find(Boolean);
      return { ok, message: hint ?? GENERAL };
    }}
    next={step < v.lastStep ? { label: `Weiter zu Schritt ${step + 1}`, go: () => { setStep(step + 1); setFocusCard(n => n + 1); } } : undefined} />;

  return (
    <div ref={layout.root} className={`xw${compact ? ' xw-compact' : ''}${wide ? ' xw-wide' : ''}`}>
      {!compact && <div className="xw-wofuer"><h2>Wofür?</h2><p>{w.wofuer}</p></div>}
      <TopKurz text={v.kurz} fach={v.fachlich} />
      {!compact && <MutBox text={w.mut} />}
      <div className="xw-presets" role="group" aria-label="Beispieldaten">
        {w.presets.map(p => <button type="button" key={p.id} aria-pressed={JSON.stringify(p.data) === active} onClick={() => setData(p.data)}>{p.label}</button>)}
        <span className="xw-note">{w.dataNote ?? `${people(w.names.length)}. Die Punkte im Bild lassen sich ziehen.`}</span>
      </div>
      <div className="xw-metrics">{v.metrics.map(m => <div key={m.label}><span>{m.label}</span><strong>{m.value(ctx)}</strong></div>)}</div>
      {/* In Kompakt fehlt „Wofür?“; die Überschrift hält die Gliederung lückenlos (h1, h2, h3). */}
      {compact && <h2 className="sr-only">Die Formel Schritt für Schritt</h2>}
      {/* Gleicher Baum in beiden Anordnungen, damit Eingaben und Fokus beim Wechsel erhalten bleiben; nur das Bild wandert. */}
      <div className={`xw-work${wide ? ' wide' : ''}`}>
        <div className={`xw-stage${wide && layout.stick === 'all' ? ' stick' : ''}`}>
          <div ref={layout.formula} className={`xw-stage-formula${wide && layout.stick === 'formula' ? ' stick' : ''}`}>{formula}{!wide && stepNav}</div>
          {wide && <div ref={layout.image}>{image}</div>}
        </div>
        <div className="xw-study">{wide && stepNav}{learnCard}{table}{!wide && image}{check}</div>
      </div>
      {!compact && (() => {
        const i = v.interpret(ctx);
        return <Section title="Was heißt das Ergebnis?"><p className="xw-deutung">{i.kurz}</p><p className="xw-fach-line">In der Fachsprache: {i.fachlich}</p>
          {v.next && <p><ConceptLink id={v.next.id} onConcept={onConcept}>{v.next.label}</ConceptLink></p>}</Section>;
      })()}
      {!compact && <ThinkQuestions items={w.think.map(t => ({
        question: t.questionFor?.[variant] ?? t.question,
        options: t.options, correct: t.correct, kurz: t.kurz,
        explain: () => txt(t.explain, ctx),
        onAnswer: () => setStep(Math.min(t.stepFor?.[variant] ?? t.step, v.lastStep)),
        tryIt: t.tryIt && {
          label: t.tryIt.label,
          run: () => {
            const next = t.tryIt!.apply(data), metric = v.metrics[v.metrics.length - 1];
            setData(next);
            return `${metric.label} vorher ${metric.value(ctx)}, jetzt ${metric.value({ ...ctx, s: w.compute(next) })}.`;
          },
        },
      }))} />}
      {!compact && <Genau kurz={v.genau.kurz} paragraphs={v.genau.paragraphs(ctx)} />}
      <AllGlyphs items={w.glyphs.filter(g => g.step <= v.lastStep).map(g => ({ ...g, target: g.step }))} active={step} onPick={t => setStep(t as number)} />
      <p><button type="button" className="xw-link" onClick={() => { setData(w.presets[0].data); setWho(0); }}>Beispieldaten zurücksetzen</button></p>
    </div>
  );
}

/** Schrittkarte eines Rechenbegriffs mit Sprung in die Werkstatt (Spezifikation Werkstatt 6.4); immer vollständig. */
type StepCardProps = { card: StepCardData; current: string; onConcept: (id: string) => void; onOpen: (concept: string, step: number) => void };
export function StepCard(p: StepCardProps) {
  const w: Workshop<any, any> = p.card.workshop;
  return <StepCardView {...p} workshop={w} />;
}

function StepCardView<D, S>({ card, current, onConcept, onOpen, workshop: w }: StepCardProps & { workshop: Workshop<D, S> }) {
  const v = w.variants[card.variant], step = w.steps[card.step - 1];
  const ctx: Ctx<S> = { s: w.compute(w.presets[0].data), who: 0, names: w.names };
  return (
    <div className="xw xw-stepcard">
      <LearnCard step={step} ctx={ctx} compact={false} onConcept={onConcept} current={current} nameLinks
        footer={<p className="xw-open"><button type="button" className="xw-button" onClick={() => onOpen(card.variant, card.step)}>
          Ist Schritt {card.step} von {v.lastStep} der Werkstatt {titleFor(ref(card.variant))}: Werkstatt öffnen</button></p>} />
    </div>
  );
}
