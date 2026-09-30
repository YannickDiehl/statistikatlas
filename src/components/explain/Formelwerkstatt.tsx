import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ref, titleFor } from '../../domain/learning';
import { txt, type Ctx, type Workshop } from '../../explain/types';
import { close, num } from '../../explain/format';
import { takeStep, type AnyWorkshop, type StepCard as StepCardData } from '../../explain/registry';
import type { Series, PairStats, Pairs } from '../../explain/math';
import { FormulaView, GlyphLegend, Genau, KurzGesagt, Section, StepArrows, StepNav, useExplainMode } from './basics';
import { CheckQuestion, ConceptLink, LearnCard, ThinkQuestions, WorkTable } from './pieces';
import { NumberLine, Rectangles, Squares } from './pictures';

type PictureArgs<D, S> = { data: D; s: S; step: number; who: number; setData: (d: D) => void; pickWho: (i: number) => void };

/** Stufe 1: Formelwerkstatt (Spezifikation 5.1). `variant` ist der Begriff, zum Beispiel „sd“. */
export function Formelwerkstatt({ workshop, variant, onConcept }: { workshop: AnyWorkshop; variant: string; onConcept: (id: string) => void }) {
  if (workshop.id === 'zusammenhang') {
    const w: Workshop<Pairs, PairStats> = workshop;
    return <WorkshopView workshop={w} variant={variant} onConcept={onConcept}
      picture={p => <Rectangles data={p.data} s={p.s} step={p.step} who={p.who} names={w.names} bounds={w.bounds} onChange={p.setData} onWho={p.pickWho} />} />;
  }
  const w: Workshop<number[], Series> = workshop;
  return <WorkshopView workshop={w} variant={variant} onConcept={onConcept}
    picture={p => <>
      <NumberLine values={p.data} s={p.s} step={p.step} kind={w.id === 'mittel' ? 'mittel' : 'streuung'} who={p.who} names={w.names} bounds={w.bounds} onChange={p.setData} onWho={p.pickWho} />
      {w.id === 'streuung' && p.step >= 3 && <Squares s={p.s} step={p.step} who={p.who} names={w.names} />}
    </>} />;
}

function WorkshopView<D, S>({ workshop: w, variant, onConcept, picture }: {
  workshop: Workshop<D, S>; variant: string; onConcept: (id: string) => void; picture: (p: PictureArgs<D, S>) => ReactNode;
}) {
  const v = w.variants[variant];
  const [mode] = useExplainMode(), compact = mode === 'kompakt';
  const [data, setDataRaw] = useState(w.presets[0].data);
  const [step, setStepRaw] = useState(1);
  const [who, setWho] = useState(0);
  const [checkKey, setCheckKey] = useState(0);
  const [focusCard, setFocusCard] = useState(0);
  const cardHeading = useRef<HTMLDivElement>(null);
  const s = useMemo(() => w.compute(data), [w, data]);
  const ctx: Ctx<S> = { s, who, names: w.names };
  const reset = () => setCheckKey(k => k + 1);
  const setStep = (n: number) => { setStepRaw(Math.max(1, Math.min(v.lastStep, n))); reset(); };
  const setData = (d: D) => { setDataRaw(d); reset(); };
  const pickWho = (i: number) => { setWho(i); reset(); };
  // Sprung aus einer Schrittkarte: nach dem Einhängen abholen (kein Seiteneffekt beim Rendern).
  useEffect(() => { const requested = takeStep(variant); if (requested) setStepRaw(Math.min(requested, v.lastStep)); }, [variant, v.lastStep]);
  useEffect(() => { if (focusCard) cardHeading.current?.focus(); }, [focusCard]);
  const stepData = w.steps[step - 1];
  const active = JSON.stringify(data);

  return (
    <div className={`xw${compact ? ' xw-compact' : ''}`}>
      {!compact && <div className="xw-wofuer"><h2>Wofür?</h2><p>{w.wofuer}</p></div>}
      <div className="xw-presets" role="group" aria-label="Beispieldaten">
        {w.presets.map(p => <button type="button" key={p.id} aria-pressed={JSON.stringify(p.data) === active} onClick={() => setData(p.data)}>{p.label}</button>)}
        <span className="xw-note">Fünf Beispielpersonen. Die Punkte im Bild lassen sich ziehen.</span>
      </div>
      <div className="xw-metrics">{v.metrics.map(m => <div key={m.label}><span>{m.label}</span><strong>{m.value(ctx)}</strong></div>)}</div>
      <KurzGesagt text={v.kurz} fach={v.fachlich} />
      {!compact && <Section title="Die Zeichen, bevor es losgeht" note="Jedes Zeichen hat einen Fachbegriff und eine Aufgabe. Antippen zeigt, wo es in der Rechnung vorkommt.">
        <GlyphLegend items={w.glyphs.filter(g => g.step <= v.lastStep).map(g => ({ ...g, target: g.step }))} active={step} onPick={t => setStep(t as number)} />
      </Section>}
      <FormulaView className="xw-symbolic" nodes={v.symbolic} active={step} onMark={m => setStep(m as number)} label={v.aria} />
      <FormulaView className="xw-numeric" nodes={w.numeric(ctx, v.lastStep)} active={step} onMark={m => setStep(m as number)} />
      <StepNav buttons={w.steps.slice(0, v.lastStep).map(st => st.button)} active={step} onStep={setStep} />
      <LearnCard step={stepData} ctx={ctx} compact={compact} onConcept={onConcept} onWho={pickWho} current={variant} headingRef={cardHeading}
        header={<div className="xw-card-top"><span className="xw-label">Schritt {step} von {v.lastStep}. Wir lesen die Formel von innen nach außen.</span><StepArrows step={step} last={v.lastStep} onStep={setStep} /></div>} />
      {!compact && <Section title="Die Rechentabelle" note="So rechnest du es auch auf Papier. Mit jedem Schritt kommt eine Spalte dazu.">
        <WorkTable workshop={w} ctx={ctx} step={step} lastStep={v.lastStep} onWho={pickWho} />
      </Section>}
      <Section title="Das Bild dazu" note={w.captions[step]}>{picture({ data, s, step, who, setData, pickWho })}</Section>
      {!compact && <CheckQuestion key={`${variant}-${checkKey}`} title={`Kurz prüfen: Schritt ${step}`} question={txt(stepData.check.question, ctx)}
        evaluate={value => {
          const answer = stepData.check.answer(ctx);
          const ok = answer === 'NA' ? value === 'NA' : value !== 'NA' && value.some(x => close(x, answer));
          if (ok) return { ok, message: answer === 'NA' ? 'r ist nicht definiert.' : `${num(answer)}.` };
          const hint = value === 'NA' ? null : value.map(x => stepData.check.diagnose(ctx, x)).find(Boolean);
          return { ok, message: hint ?? 'Schau in die Rechentabelle und in die Lernkarte oben. Die markierte Stelle der Formel zeigt, was hier gerechnet wird.' };
        }}
        next={step < v.lastStep ? { label: `Weiter zu Schritt ${step + 1}`, go: () => { setStep(step + 1); setFocusCard(n => n + 1); } } : undefined} />}
      {!compact && (() => {
        const i = v.interpret(ctx);
        return <Section title="Was heißt das Ergebnis?"><KurzGesagt text={i.kurz} /><p>Fachlich: {i.fachlich}</p>
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
      <p><button type="button" className="xw-link" onClick={() => { setData(w.presets[0].data); setWho(0); }}>Ausgangsdaten wiederherstellen</button></p>
    </div>
  );
}

/** Schrittkarte eines Rechenbegriffs mit Sprung in die Werkstatt (Spezifikation 6.4); immer vollständig. */
type StepCardProps = { card: StepCardData; current: string; onConcept: (id: string) => void; onOpen: (concept: string, step: number) => void };
export function StepCard(p: StepCardProps) {
  const w = p.card.workshop;
  if (w.id === 'zusammenhang') { const typed: Workshop<Pairs, PairStats> = w; return <StepCardView {...p} workshop={typed} />; }
  const typed: Workshop<number[], Series> = w;
  return <StepCardView {...p} workshop={typed} />;
}

function StepCardView<D, S>({ card, current, onConcept, onOpen, workshop: w }: StepCardProps & { workshop: Workshop<D, S> }) {
  const v = w.variants[card.variant], step = w.steps[card.step - 1];
  const ctx: Ctx<S> = { s: w.compute(w.presets[0].data), who: 0, names: w.names };
  return (
    <div className="xw xw-stepcard">
      <LearnCard step={step} ctx={ctx} compact={false} onConcept={onConcept} current={current}
        footer={<p className="xw-open"><button type="button" className="xw-button" onClick={() => onOpen(card.variant, card.step)}>
          Ist Schritt {card.step} von {v.lastStep} der Werkstatt {titleFor(ref(card.variant))}: Werkstatt öffnen</button></p>} />
    </div>
  );
}
