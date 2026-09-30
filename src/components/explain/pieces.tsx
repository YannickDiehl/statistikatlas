import { useState, type ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { conceptById } from '../../domain/concepts';
import { txt, type Ctx, type Step, type Workshop } from '../../explain/types';
import { parseAnswer } from '../../explain/format';
import { KurzGesagt } from './basics';

/** Kontrollfrage mit Eingabefeld; leere oder unlesbare Eingaben werden am Feld gemeldet. */
export function CheckQuestion({ title, question, evaluate, next }: {
  title: string;
  question: string;
  evaluate: (v: number | 'NA') => { ok: boolean; message: string };
  next?: { label: string; go: () => void };
}) {
  const [value, setValue] = useState(''), [error, setError] = useState(''), [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  function submit() {
    const v = parseAnswer(value);
    if (!value.trim()) { setError('Gib zuerst eine Zahl ein.'); setResult(null); return; }
    if (v === null) { setError('Das ist keine Zahl. Schreibe zum Beispiel 3,16 oder −4.'); setResult(null); return; }
    setError('');
    setResult(evaluate(v));
  }
  return (
    <div className="xw-check">
      <h3>{title}</h3>
      <p>{question}</p>
      <form className="xw-check-row" onSubmit={e => { e.preventDefault(); submit(); }}>
        <input value={value} inputMode="decimal" aria-label="Deine Antwort" aria-invalid={!!error} onChange={e => { setValue(e.target.value); setError(''); }} />
        <button type="submit">Prüfen</button>
      </form>
      <p className="xw-error" role="alert">{error}</p>
      <div aria-live="polite">
        {result && (
          <p className={result.ok ? 'xw-right' : 'xw-wrong'}>
            <strong>{result.ok ? 'Stimmt.' : 'Noch nicht.'}</strong> {result.message}
            {result.ok && next && <button type="button" className="xw-link" onClick={next.go}>{next.label}</button>}
          </p>
        )}
      </div>
    </div>
  );
}

export type ThinkItem = {
  question: string;
  options: string[];
  correct: number;
  explain: () => string;
  kurz: string;
  onAnswer: () => void;
  tryIt?: { label: string; run: () => string };
};

/** „Mit der Formel denken“: erst tippen, dann an der Formel prüfen. */
export function ThinkQuestions({ items, title = 'Mit der Formel denken', note = 'Erst tippen, dann an der Formel prüfen.', hint = 'Oben ist der zuständige Teil der Formel markiert.' }: {
  items: ThinkItem[]; title?: string; note?: string; hint?: string;
}) {
  const [chosen, setChosen] = useState<Record<number, number>>({}), [tried, setTried] = useState<Record<number, string>>({});
  return (
    <section className="xw-section xw-think">
      <h2>{title}</h2>
      <p className="xw-note">{note}</p>
      {items.map((q, i) => {
        const pick = chosen[i];
        return (
          <div className="xw-question" key={i}>
            <p>{q.question}</p>
            <div className="xw-options" role="group" aria-label="Antworten">
              {q.options.map((o, k) => (
                <button type="button" key={k}
                  className={pick === undefined ? '' : k === q.correct ? 'right' : k === pick ? 'wrong' : ''}
                  aria-pressed={pick === k}
                  onClick={() => { setChosen(c => ({ ...c, [i]: k })); q.onAnswer(); }}>{o}</button>
              ))}
            </div>
            {pick !== undefined && (
              <div className="xw-answer" aria-live="polite">
                <p><strong className={pick === q.correct ? 'xw-right' : 'xw-wrong'}>{pick === q.correct ? 'Stimmt.' : 'Nicht ganz.'}</strong> {q.explain()}</p>
                <KurzGesagt text={q.kurz} />
                <p className="xw-note">{hint}</p>
                {q.tryIt && <p><button type="button" className="xw-button" onClick={() => setTried(t => ({ ...t, [i]: q.tryIt!.run() }))}>Ausprobieren: {q.tryIt.label}</button> <span className="xw-note">{tried[i]}</span></p>}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}

/** Link auf einen Begriff; Kartenpunkte werden zusätzlich in der Karte gezeigt (über onSelect). */
export function ConceptLink({ id, onConcept, children }: { id: string; onConcept: (id: string) => void; children?: ReactNode }) {
  return <button type="button" className="xw-link" onClick={() => onConcept(id)}>{children ?? 'Begriff öffnen'} <ArrowUpRight size={14} aria-hidden="true" /></button>;
}

/** Lernkarte eines Schritts; auch als Schrittkarte eines Rechenbegriffs (Spezifikation 6.4). */
export function LearnCard<S>({ step, ctx, compact, onConcept, onWho, header, footer }: {
  step: Step<S>; ctx: Ctx<S>; compact: boolean; onConcept: (id: string) => void; onWho?: (i: number) => void; header?: ReactNode; footer?: ReactNode;
}) {
  return (
    <div className="xw-card">
      {header}
      <div className="xw-term">
        <span className="xw-label">Fachbegriff</span>
        <strong>{conceptById[step.concept]?.title ?? step.concept}</strong>
        {step.also && <span className="xw-also">auch: {step.also}</span>}
        <span className="xw-sym">{step.sym}</span>
      </div>
      <ConceptLink id={step.concept} onConcept={onConcept} />
      <KurzGesagt text={txt(step.kurz, ctx)} />
      {!compact && <>
        <h3>Fachlich in einem Satz</h3><p>{txt(step.fachlich, ctx)}</p>
        <div className="xw-worked-head">
          <h3>{step.perPerson && onWho ? 'Vorgerechnet für Person' : 'Vorgerechnet'}</h3>
          {step.perPerson && onWho && (
            <span className="xw-people" role="group" aria-label="Person wählen">
              {ctx.names.map((n, i) => <button type="button" key={n} aria-pressed={i === ctx.who} onClick={() => onWho(i)}>{n}</button>)}
            </span>
          )}
        </div>
        <p className="xw-worked">{txt(step.vorgerechnet, ctx)}</p>
        <h3>Wie im Alltag</h3><p>{step.alltag}</p>
        <h3>Warum steht das in der Formel?</h3><p>{step.warum}</p>
        <h3 className="xw-warn-head">Typischer Fehler</h3><p>{txt(step.fehler, ctx)}</p>
      </>}
      {footer}
    </div>
  );
}

/** Rechentabelle: eine Zeile je Person, Spalten erscheinen mit ihrem Schritt. */
export function WorkTable<D, S>({ workshop, ctx, step, lastStep, onWho }: {
  workshop: Workshop<D, S>; ctx: Ctx<S>; step: number; lastStep: number; onWho: (i: number) => void;
}) {
  const cols = workshop.table.columns.filter(c => c.from <= step && c.from <= lastStep);
  const cls = (active: number[]) => active.includes(step) ? 'on' : undefined;
  const lines = workshop.table.lines.filter(l => l.from <= step && l.from <= lastStep);
  return (
    <div className="xw-table-wrap">
      <table className="xw-table">
        <thead><tr><th scope="col">Person</th>{cols.map(c => <th scope="col" key={c.head} className={cls(c.active)}>{c.head}</th>)}</tr></thead>
        <tbody>
          {ctx.names.map((n, r) => (
            <tr key={n} className={r === ctx.who ? 'sel' : undefined}>
              <th scope="row"><button type="button" aria-pressed={r === ctx.who} onClick={() => onWho(r)}>{n}</button></th>
              {cols.map(c => <td key={c.head} className={cls(c.active)}>{c.cell(ctx, r)}</td>)}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr><th scope="row">Σ</th>{cols.map(c => (
            <td key={c.head} className={cls(c.active)}>
              {c.sum ? (step >= (c.sumFrom ?? c.from) ? <>{c.sum(ctx)}{c.sumNote && <small> {c.sumNote}</small>}</> : '…') : ''}
            </td>
          ))}</tr>
        </tfoot>
      </table>
      {lines.length > 0 && <div className="xw-lines">{lines.map((l, i) => <p key={i} className={l.step === step ? 'on' : undefined}>{l.text(ctx)}</p>)}</div>}
    </div>
  );
}
