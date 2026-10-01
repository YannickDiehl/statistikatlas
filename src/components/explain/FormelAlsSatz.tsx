import { useState } from 'react';
import type { AnySentence } from '../../explain/types';
import { close } from '../../explain/format';
import { AllGlyphs, FormulaView, Genau, Section, TopKurz, useExplainMode } from './basics';
import { CheckQuestion, ConceptLink, termFor, ThinkQuestions } from './pieces';
import { pictureFor } from './pictures/register';

type Values = Record<string, number>;

/** Formel als Satz (Vorlage 2): Satz mit antippbaren Teilen, ein Regler je Zeichen (optional mit Bild darüber), Vorgerechnet in Mini-Schritten. */
export function FormelAlsSatz({ template: t, onConcept }: { template: AnySentence; onConcept: (id: string) => void }) {
  const [mode] = useExplainMode(), compact = mode === 'kompakt';
  const [values, setValues] = useState<Values>(t.initial);
  const [mark, setMark] = useState<string>(t.sliders[0]?.key ?? t.glyphs[0].key);
  const s = t.compute(values);
  const glyph = t.glyphs.find(g => g.key === mark) ?? t.glyphs[0];
  const draw = pictureFor(t.picture, 'satz');
  const setValue = (key: string, v: number) => { setValues(old => ({ ...old, [key]: v })); setMark(key); };

  return (
    <div className={`xw${compact ? ' xw-compact' : ''}`}>
      {!compact && <div className="xw-wofuer"><h2>Wofür?</h2><p>{t.wofuer}</p></div>}
      <TopKurz text={t.kurz} fach={t.fachlich} />
      <div className="xw-metrics">{t.metrics.map(m => <div key={m.label}><span>{m.label}</span><strong>{m.value(s)}</strong></div>)}</div>
      <FormulaView className="xw-symbolic" nodes={t.symbolic} active={mark} onMark={m => setMark(m as string)} label={t.aria} />
      <FormulaView className="xw-numeric" nodes={t.numeric(s)} active={mark} onMark={m => setMark(m as string)} />
      <div className="xw-card xw-glyph-card" aria-live="polite">
        <span className="xw-label">Das nennt man</span>
        <p className="xw-name-term"><strong>{glyph.concept ? termFor(glyph.concept) : glyph.term}</strong><span className="xw-sym">{glyph.sym}</span><small>sprich „{glyph.say}“</small></p>
        <p>{glyph.plain}</p>
        {glyph.concept && glyph.concept !== t.concept && <ConceptLink id={glyph.concept} onConcept={onConcept} />}
      </div>
      <Section title="Als Satz gelesen">
        <p className="xw-sentence">{t.sentence.map((part, i) => typeof part === 'string' ? part
          : <button type="button" key={i} className={`xw-fp xw-inline${part.m === mark ? ' on' : ''}`} aria-pressed={part.m === mark} onClick={() => setMark(part.m)}>{part.t}</button>)}</p>
      </Section>
      {!compact && <Section title="Vorgerechnet">
        <ol className="xw-worked-steps">{t.worked(s).map((w, i) => <li key={i}><small>Schritt {i + 1}</small><strong>{w.title}</strong><span>{w.text}</span></li>)}</ol>
        <h3 className="xw-warn-head">Aufgepasst</h3><p>{t.fehler}</p>
      </Section>}
      <Section title="Ein Regler je Zeichen">
        {draw?.({ template: t, values, s, mark })}
        {t.sliders.map(sl => {
          const value = values[sl.key], id = `xw-slider-${sl.key}`;
          // Logarithmische Regler laufen über 0–1000 ganzzahlige Stufen, damit beide Enden genau erreichbar sind.
          const lo = Math.log10(sl.min), hi = Math.log10(sl.max), pos = sl.log ? Math.round((Math.log10(value) - lo) / (hi - lo) * 1000) : value;
          return (
            <div key={sl.key} className="xw-slider">
              <label htmlFor={id}><span className={`xw-fp${mark === sl.key ? ' on' : ''}`}>{sl.key}</span> {sl.label}</label>
              <input id={id} type="range" aria-valuetext={sl.format(value)}
                min={sl.log ? 0 : sl.min} max={sl.log ? 1000 : sl.max} step={sl.log ? 1 : sl.step} value={pos}
                onChange={e => setValue(sl.key, sl.log ? Math.round(10 ** (lo + Number(e.target.value) / 1000 * (hi - lo))) : Number(e.target.value))} />
              <output htmlFor={id}>{sl.format(value)}</output>
            </div>
          );
        })}
        <div className="xw-presets">{t.quick.map(q => <button type="button" key={q.label} onClick={() => { setValues(q.apply(values)); setMark(q.mark); }}>{q.label}</button>)}</div>
        <p className="xw-note">{t.compare(s)}</p>
      </Section>
      {!compact && <CheckQuestion question={t.check.question}
        evaluate={v => {
          if (v !== 'NA' && v.some(x => close(x, t.check.answer, t.check.tolerance))) return { ok: true, message: t.check.right };
          return { ok: false, message: v === 'NA' ? 'Noch nicht ganz. Gefragt ist eine Zahl.' : t.check.diagnose(v[0]) };
        }} />}
      {!compact && (() => { const i = t.interpret(s); return <Section title="Was heißt das Ergebnis?"><p className="xw-deutung">{i.kurz}</p><p className="xw-fach-line">In der Fachsprache: {i.fachlich}</p></Section>; })()}
      {!compact && <ThinkQuestions title="Mit der Formel denken" items={[{
        question: t.think.question, options: t.think.options, correct: t.think.correct, kurz: t.think.kurz,
        explain: () => t.think.explain, onAnswer: () => setMark(t.think.mark),
      }]} hint={t.think.hint} />}
      {!compact && <Genau kurz={t.genau.kurz} paragraphs={t.genau.paragraphs} />}
      <AllGlyphs items={t.glyphs.map(g => ({ ...g, target: g.key }))} active={mark} onPick={k => setMark(k as string)} />
    </div>
  );
}
