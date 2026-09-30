import { useMemo, useState } from 'react';
import { conceptById } from '../../domain/concepts';
import { txt, type Ctx } from '../../explain/types';
import { close, num } from '../../explain/format';
import { takeStep, type AnyWorkshop, type StepCard as StepCardData } from '../../explain/registry';
import type { Series, PairStats, Pairs } from '../../explain/math';
import { FormulaView, GlyphLegend, Genau, KurzGesagt, Section, StepArrows, StepNav, useExplainMode } from './basics';
import { CheckQuestion, LearnCard, ThinkQuestions, WorkTable } from './pieces';
import { NumberLine, Rectangles, Squares } from './pictures';

/** Stufe 1: Formelwerkstatt (Spezifikation 5.1). `variant` ist der Begriff, zum Beispiel „sd“. */
export function Formelwerkstatt({ workshop: w, variant, onConcept }: { workshop: AnyWorkshop; variant: string; onConcept: (id: string) => void }) {
  const v = w.variants[variant];
  const [mode] = useExplainMode(), compact = mode === 'kompakt';
  const [data, setData] = useState(w.presets[0].data);
  const [step, setStepRaw] = useState(() => Math.min(takeStep(variant) ?? 1, v.lastStep));
  const [who, setWho] = useState(0);
  const [checkKey, setCheckKey] = useState(0);
  const s = useMemo(() => w.compute(data), [w, data]);
  const ctx: Ctx<unknown> = { s, who, names: w.names };
  const setStep = (n: number) => { setStepRaw(Math.max(1, Math.min(v.lastStep, n))); setCheckKey(k => k + 1); };
  const pickWho = (i: number) => { setWho(i); setCheckKey(k => k + 1); };
  const stepData = w.steps[step - 1];
  const buttons = w.steps.slice(0, v.lastStep).map(st => st.button);

  const picture = w.id === 'zusammenhang'
    ? <Rectangles data={data as Pairs} s={s as PairStats} step={step} who={who} names={w.names} bounds={w.bounds} onChange={setData} onWho={pickWho} />
    : <>
      <NumberLine values={data as number[]} s={s as Series} step={step} kind={w.id === 'mittel' ? 'mittel' : 'streuung'} who={who} names={w.names} bounds={w.bounds} onChange={setData} onWho={pickWho} />
      {w.id === 'streuung' && step >= 3 && <Squares s={s as Series} step={step} who={who} names={w.names} />}
    </>;

  return (
    <div className={`xw${compact ? ' xw-compact' : ''}`}>
      {!compact && <div className="xw-wofuer"><h2>Wofür?</h2><p>{w.wofuer}</p></div>}
      <div className="xw-presets" role="group" aria-label="Beispieldaten">
        {w.presets.map(p => <button type="button" key={p.id} onClick={() => setData(p.data)}>{p.label}</button>)}
        <span className="xw-note">Fünf Beispielpersonen. Die Punkte im Bild lassen sich ziehen.</span>
      </div>
      <div className="xw-metrics">{v.metrics.map(m => <div key={m.label}><span>{m.label}</span><strong>{m.value(ctx)}</strong></div>)}</div>
      <KurzGesagt text={v.kurz} fach={v.fachlich} />
      {!compact && <Section title="Die Zeichen, bevor es losgeht" note="Jedes Zeichen hat einen Fachbegriff und eine Aufgabe. Antippen zeigt, wo es in der Rechnung vorkommt.">
        <GlyphLegend items={w.glyphs.filter(g => g.step <= v.lastStep).map(g => ({ ...g, target: g.step }))} active={step} onPick={t => setStep(t as number)} />
      </Section>}
      <FormulaView className="xw-symbolic" nodes={v.symbolic} active={step} onMark={m => setStep(m as number)} label={v.aria} />
      <FormulaView className="xw-numeric" nodes={w.numeric(ctx, v.lastStep)} active={step} onMark={m => setStep(m as number)} />
      <StepNav buttons={buttons} active={step} onStep={setStep} />
      <LearnCard step={stepData} ctx={ctx} compact={compact} onConcept={onConcept} onWho={pickWho}
        header={<div className="xw-card-top"><span className="xw-label">Schritt {step} von {v.lastStep}. Wir lesen die Formel von innen nach außen.</span><StepArrows step={step} last={v.lastStep} onStep={setStep} /></div>} />
      {!compact && <Section title="Die Rechentabelle" note="So rechnest du es auch auf Papier. Mit jedem Schritt kommt eine Spalte dazu.">
        <WorkTable workshop={w} ctx={ctx} step={step} lastStep={v.lastStep} onWho={pickWho} />
      </Section>}
      <Section title="Das Bild dazu" note={w.captions[step]}>{picture}</Section>
      {!compact && <CheckQuestion key={`${variant}-${step}-${checkKey}`} title={`Kurz prüfen: Schritt ${step}`} question={txt(stepData.check.question, ctx)}
        evaluate={value => {
          const answer = stepData.check.answer(ctx);
          const ok = answer === 'NA' ? value === 'NA' : value !== 'NA' && close(value, answer);
          if (ok) return { ok, message: answer === 'NA' ? 'r ist nicht definiert.' : `${num(answer)}.` };
          return { ok, message: stepData.check.diagnose(ctx, value) ?? 'Schau in die Rechentabelle und in die Lernkarte oben. Die markierte Stelle der Formel zeigt, was hier gerechnet wird.' };
        }}
        next={step < v.lastStep ? { label: `Weiter zu Schritt ${step + 1}`, go: () => setStep(step + 1) } : undefined} />}
      {!compact && (() => { const i = v.interpret(ctx); return <Section title="Was heißt das Ergebnis?"><KurzGesagt text={i.kurz} /><p>Fachlich: {i.fachlich}</p></Section>; })()}
      {!compact && <ThinkQuestions items={w.think.map(t => ({
        question: t.questionFor?.[variant] ?? t.question,
        options: t.options, correct: t.correct, kurz: t.kurz,
        explain: () => txt(t.explain, ctx),
        onAnswer: () => setStep(Math.min(t.stepFor?.[variant] ?? t.step, v.lastStep)),
        tryIt: t.tryIt && {
          label: t.tryIt.label,
          run: () => {
            const next = t.tryIt!.apply(data), before = v.metrics[v.metrics.length - 1], after = w.compute(next);
            setData(next);
            return `${before.label} vorher ${before.value(ctx)}, jetzt ${before.value({ ...ctx, s: after })}.`;
          },
        },
      }))} />}
      {!compact && <Genau kurz={v.genau.kurz} paragraphs={v.genau.paragraphs(ctx)} />}
      <p><button type="button" className="xw-link" onClick={() => { setData(w.presets[0].data); setWho(0); }}>Ausgangsdaten wiederherstellen</button></p>
    </div>
  );
}

/** Schrittkarte eines Rechenbegriffs mit Sprung in die Werkstatt (Spezifikation 6.4). */
export function StepCard({ card, onConcept, onOpen }: { card: StepCardData; onConcept: (id: string) => void; onOpen: (concept: string, step: number) => void }) {
  const [mode] = useExplainMode();
  const w = card.workshop, v = w.variants[card.variant], step = w.steps[card.step - 1];
  const ctx: Ctx<unknown> = { s: w.compute(w.presets[0].data), who: 0, names: w.names };
  return (
    <div className="xw xw-stepcard">
      <LearnCard step={step} ctx={ctx} compact={mode === 'kompakt'} onConcept={onConcept}
        footer={<p className="xw-open"><button type="button" className="xw-button" onClick={() => onOpen(card.variant, card.step)}>
          Ist Schritt {card.step} von {v.lastStep} der Werkstatt {conceptById[card.variant]?.title}: Werkstatt öffnen</button></p>} />
    </div>
  );
}
