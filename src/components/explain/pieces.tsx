import { useState, type ReactNode, type Ref } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { conceptById } from '../../domain/concepts';
import { ref, titleFor } from '../../domain/learning';
import { txt, type Ctx, type Step, type Workshop } from '../../explain/types';
import { parseAnswer } from '../../explain/format';
import { KurzGesagt, Progress, StepArrows } from './basics';

/** Fachbegriff eines Begriffs: sein Titel in concepts.ts (Regel 2), sonst der Anzeigetitel. */
export const termFor = (id: string) => conceptById[id]?.title ?? titleFor(ref(id));

/** Rückmeldung mit fett gesetztem Anfang („Genau,“, „Fast!“, „Noch nicht ganz.“). */
export function Feedback({ ok, message, children }: { ok: boolean; message: string; children?: ReactNode }) {
  const lead = message.match(/^(Genau[,.]?|Fast!|Noch nicht ganz\.)/)?.[0] ?? '';
  return <p className={ok ? 'xw-right' : 'xw-wrong'}>{lead && <strong>{lead}</strong>}{message.slice(lead.length)}{children}</p>;
}

/**
 * Zahlfrage „Probier es selbst“ mit Eingabefeld und Knopf „Nachsehen“; leere oder unlesbare Eingaben werden am
 * Feld gemeldet. `evaluate` liefert die ganze Rückmeldung („Genau, 5.“, „Fast! …“ oder „Noch nicht ganz. …“).
 */
export function CheckQuestion({ title = 'Probier es selbst', question, evaluate, next,
  empty = 'Tippe zuerst eine Zahl ein, zum Beispiel 5 oder −4.', invalid = 'Das kann ich nicht als Zahl lesen. Schreib zum Beispiel 3,16 oder −4.' }: {
  title?: string;
  question: string;
  /** Bekommt alle Lesarten der Eingabe (siehe parseAnswer) oder „NA“. */
  evaluate: (v: number[] | 'NA') => { ok: boolean; message: string };
  next?: { label: string; go: () => void };
  empty?: string;
  invalid?: string;
}) {
  const [value, setValue] = useState(''), [error, setError] = useState(''), [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  function submit() {
    const v = parseAnswer(value);
    if (!value.trim()) { setError(empty); setResult(null); return; }
    if (v === null) { setError(invalid); setResult(null); return; }
    setError('');
    setResult(evaluate(v));
  }
  return (
    <div className="xw-check">
      <h3>{title}</h3>
      <p>{question}</p>
      <form className="xw-check-row" onSubmit={e => { e.preventDefault(); submit(); }}>
        <input value={value} inputMode="decimal" aria-label="Deine Antwort" aria-invalid={!!error} onChange={e => { setValue(e.target.value); setError(''); }} />
        <button type="submit">Nachsehen</button>
      </form>
      <p className="xw-error" role="alert">{error}</p>
      <div aria-live="polite">
        {result && <Feedback ok={result.ok} message={result.message}>
          {result.ok && next && <button type="button" className="xw-link" onClick={next.go}>{next.label}</button>}
        </Feedback>}
      </div>
    </div>
  );
}

/**
 * Auswahlfrage „Probier es selbst“ (Begriffskarte): `right` beginnt mit „Genau“, `diagnose[k]` mit „Fast!“ oder
 * „Noch nicht ganz.“; ohne Diagnose gibt es einen allgemeinen Hinweis.
 */
export function ChoiceCheck({ question, options, correct, right, diagnose, title = 'Probier es selbst' }: {
  question: string; options: string[]; correct: number; right: string; diagnose: Partial<Record<number, string>>; title?: string;
}) {
  const [pick, setPick] = useState<number | null>(null);
  return (
    <div className="xw-check">
      <h3>{title}</h3>
      <p>{question}</p>
      <div className="xw-options xw-options-column" role="group" aria-label="Antworten">
        {options.map((o, k) => (
          <button type="button" key={k} aria-pressed={pick === k} className={pick === null ? '' : k === correct && pick === k ? 'right' : k === pick ? 'wrong' : ''} onClick={() => setPick(k)}>{o}</button>
        ))}
      </div>
      <div aria-live="polite">
        {pick !== null && <Feedback ok={pick === correct} message={pick === correct ? right : diagnose[pick] ?? 'Noch nicht ganz. Lies die Antworten noch einmal und denk an das Beispiel oben.'} />}
      </div>
    </div>
  );
}

/** Denkfrage für die Oberfläche; `explain` wird erst nach der Antwort berechnet. */
export type ThinkQuestion = {
  question: string;
  options: string[];
  correct: number;
  explain: () => string;
  kurz: string;
  onAnswer?: () => void;
  /** Hinweis nach der Antwort, zum Beispiel wenn oben etwas umgestellt wurde. */
  note?: string;
  tryIt?: { label: string; run: () => string };
};

/** „Mit der Formel denken“: erst vermuten, dann nachsehen. */
export function ThinkQuestions({ items, title = 'Mit der Formel denken', note = 'Erst vermuten, dann an der Formel nachsehen.', hint = 'Oben ist der zuständige Teil der Formel markiert.', lead }: {
  items: ThinkQuestion[]; title?: string; note?: string; hint?: string;
  /** Steht vor den Fragen, zum Beispiel ein Regler. */
  lead?: ReactNode;
}) {
  const [chosen, setChosen] = useState<Record<number, number>>({}), [tried, setTried] = useState<Record<number, string>>({});
  return (
    <section className="xw-section xw-think">
      <h2>{title}</h2>
      <p className="xw-note">{note}</p>
      {lead}
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
                  onClick={() => { setChosen(c => ({ ...c, [i]: k })); q.onAnswer?.(); }}>{o}</button>
              ))}
            </div>
            <div className="xw-answer" aria-live="polite">
              {pick !== undefined && <>
                <Feedback ok={pick === q.correct} message={`${pick === q.correct ? 'Genau.' : 'Noch nicht ganz.'} ${q.explain()}`} />
                <KurzGesagt text={q.kurz} />
                {(q.note ?? hint) && <p className="xw-note">{q.note ?? hint}</p>}
                {q.tryIt && <p><button type="button" className="xw-button" onClick={() => { const message = q.tryIt!.run(); setTried(t => ({ ...t, [i]: message })); }}>Ausprobieren: {q.tryIt.label}</button> <span className="xw-note">{tried[i]}</span></p>}
              </>}
            </div>
          </div>
        );
      })}
    </section>
  );
}

/** Link auf einen Begriff; die Navigation übernimmt onSelect des Inspectors (bleibt im Verlauf). */
export function ConceptLink({ id, onConcept, children }: { id: string; onConcept: (id: string) => void; children?: ReactNode }) {
  return <button type="button" className="xw-link" onClick={() => onConcept(id)}>{children ?? 'Begriff öffnen'} <ArrowUpRight size={14} aria-hidden="true" /></button>;
}

/**
 * Kasten „Das nennt man …“: Fachbegriff (Titel des Begriffs in der Karte), Zeichen, Aussprache, darunter klein
 * „In der Fachsprache: …“ und die Links. Ohne `concept` steht nur der Fachsprache-Satz da.
 */
export function NameBox({ concept, sym, say, fach, links = [], onConcept }: {
  concept?: string; sym?: string; say?: string; fach: string; links?: { id: string; label: string }[]; onConcept: (id: string) => void;
}) {
  return (
    <div className="xw-name">
      <span className="xw-label">Das nennt man</span>
      {(concept || sym) && <p className="xw-name-term">
        {concept && <strong>{termFor(concept)}</strong>}
        {sym && <span className="xw-sym">{sym}</span>}
        {say && <small>sprich „{say}“</small>}
      </p>}
      <p className="xw-fach">In der Fachsprache: {fach}</p>
      {links.length > 0 && <p className="xw-links-row">{links.map(l => <ConceptLink key={l.id} id={l.id} onConcept={onConcept}>{l.label}</ConceptLink>)}</p>}
    </div>
  );
}

/**
 * Lernkarte eines Schritts (Spezifikation Ausbau, Abschnitt 3): Kopf mit „Schritt k von n“ und Fortschritt,
 * Titel als Handlung, Was passiert?, Rechnung, Das nennt man …, Warum?, Aufgepasst, optional Wie im Alltag.
 * Kompakt zeigt nur Was passiert?, Rechnung und Das nennt man. Auch als Schrittkarte eines Rechenbegriffs.
 */
export function LearnCard<S>({ step, ctx, compact, onConcept, onWho, position, footer, current, headingRef, nameLinks = false }: {
  step: Step<S>; ctx: Ctx<S>; compact: boolean; onConcept: (id: string) => void; onWho?: (i: number) => void;
  /** Kopf mit Fortschritt und Pfeilen; fehlt auf Schrittkarten. */
  position?: { step: number; last: number; onStep: (n: number) => void };
  footer?: ReactNode;
  /** Begriff, der gerade offen ist; auf ihn wird nicht noch einmal verlinkt. */
  current?: string;
  headingRef?: Ref<HTMLHeadingElement>;
  /** Auf Schrittkarten den Begriff im Link nennen, weil die Karte zu einem anderen Begriff gehört. */
  nameLinks?: boolean;
}) {
  const links = [
    ...(step.concept !== current ? [{ id: step.concept, label: nameLinks ? `${titleFor(ref(step.concept))} öffnen` : 'Begriff öffnen' }] : []),
    ...(step.links ?? []).filter(l => l.id !== current),
  ];
  const people = step.perPerson && onWho;
  return (
    <div className="xw-card">
      {position && <div className="xw-card-top"><Progress step={position.step} last={position.last} /><StepArrows step={position.step} last={position.last} onStep={position.onStep} /></div>}
      <h3 className="xw-step-title" ref={headingRef} tabIndex={-1}>{step.title}</h3>
      <h4>Was passiert?</h4>
      <p>{txt(step.was, ctx)}</p>
      <div className="xw-worked-head">
        <h4>{people ? 'Rechnung für Person' : 'Rechnung'}</h4>
        {people && (
          <span className="xw-people" role="group" aria-label="Person wählen">
            {ctx.names.map((n, i) => <button type="button" key={n} aria-pressed={i === ctx.who} onClick={() => onWho(i)}>{n}</button>)}
          </span>
        )}
      </div>
      <p className="xw-rechnung">{txt(step.rechnung, ctx)}</p>
      <NameBox concept={step.concept} sym={step.sym} say={step.say} fach={txt(step.fach, ctx)} links={links} onConcept={onConcept} />
      {!compact && <>
        <h4>Warum?</h4><p>{txt(step.warum, ctx)}</p>
        <h4 className="xw-warn-head">Aufgepasst</h4><p>{txt(step.acht, ctx)}</p>
        {step.alltag && <><h4>Wie im Alltag</h4><p>{step.alltag}</p></>}
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
  const cls = (active: number[], tone?: string) => [active.includes(step) ? 'on' : '', tone ?? ''].join(' ').trim() || undefined;
  const lines = workshop.table.lines.filter(l => l.from <= step && l.from <= lastStep);
  return (
    <div className="xw-table-wrap">
      <table className="xw-table">
        <thead><tr><th scope="col">Person</th>{cols.map(c => <th scope="col" key={c.head} className={cls(c.active)}>{c.head}</th>)}</tr></thead>
        <tbody>
          {ctx.names.map((n, r) => (
            <tr key={n} className={r === ctx.who ? 'sel' : undefined}>
              <th scope="row"><button type="button" aria-pressed={r === ctx.who} onClick={() => onWho(r)}>{n}</button></th>
              {cols.map(c => <td key={c.head} className={cls(c.active, c.tone?.(ctx, r))}>{c.cell(ctx, r)}</td>)}
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
