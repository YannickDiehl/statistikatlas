import { createContext, Fragment, useContext, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode, type RefObject } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { modeStore, type Mode } from '../../explain/mode';
import { stickFor } from '../../explain/workbench';
import type { FNode } from '../../explain/types';

export function useExplainMode(): [Mode, (m: Mode) => void] {
  const mode = useSyncExternalStore(modeStore.subscribe, modeStore.get, modeStore.get);
  return [mode, modeStore.set];
}

export function ModeToggle() {
  const [mode, setMode] = useExplainMode();
  return (
    <div className="xw-mode" role="group" aria-label="Erklärung anzeigen">
      <button type="button" aria-pressed={mode === 'kompakt'} onClick={() => setMode('kompakt')}>Kompakt</button>
      <button type="button" aria-pressed={mode === 'ausfuehrlich'} onClick={() => setMode('ausfuehrlich')}>Ausführlich</button>
    </div>
  );
}

/** Ab dieser Inhaltsbreite (Werkbank) stehen Formel und Bild links, Lernkarte und Tabelle rechts. */
export const WIDE_FROM = 800;

/**
 * Zweispaltige Werkbank: `wide`, sobald `root` breit genug ist. Links stehen Formel und Bild; was davon
 * beim Scrollen stehen bleibt, entscheidet `stickFor`. Bleibt nur die Formel stehen, rückt ein Fokus im Bild
 * darunter hervor, statt verdeckt zu werden.
 */
export function useWorkbenchLayout(): {
  root: RefObject<HTMLDivElement | null>; formula: RefObject<HTMLDivElement | null>; image: RefObject<HTMLDivElement | null>;
  wide: boolean; stick: 'all' | 'formula' | null;
} {
  const root = useRef<HTMLDivElement>(null), formula = useRef<HTMLDivElement>(null), image = useRef<HTMLDivElement>(null);
  const [wide, setWide] = useState(false), [stick, setStick] = useState<'all' | 'formula' | null>(null);
  useLayoutEffect(() => {
    const el = root.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const scroller = el.closest('.network-inspector');
    let stuck: 'all' | 'formula' | null = null;
    const read = () => {
      const isWide = el.clientWidth >= WIDE_FROM;
      setWide(isWide);
      stuck = isWide ? stickFor(formula.current?.offsetHeight ?? 0, image.current?.offsetHeight ?? 0, (scroller?.clientHeight ?? 0) - 24) : null;
      setStick(stuck);
    };
    const reveal = (e: FocusEvent) => {
      const target = e.target as Element, top = formula.current;
      // Nur Tastaturfokus: Ein Klick auf einen Punkt soll das Bild nicht unter dem Zeiger verschieben.
      if (stuck !== 'formula' || !scroller || !top || !image.current?.contains(target) || !target.matches(':focus-visible')) return;
      const hidden = top.getBoundingClientRect().bottom + 12 - target.getBoundingClientRect().top;
      if (hidden > 0) scroller.scrollTop -= hidden;
    };
    read();
    const observer = new ResizeObserver(read);
    for (const box of [el, scroller, formula.current, image.current]) if (box) observer.observe(box);
    el.addEventListener('focusin', reveal);
    return () => { observer.disconnect(); el.removeEventListener('focusin', reveal); };
  }, [wide]);
  return { root, formula, image, wide, stick };
}

/**
 * Kurze Rechenausdrücke im Fließtext („n − 1“, „xᵢ − x̄“, „s = 0“) nicht umbrechen: Die Leerzeichen um das
 * Rechenzeichen werden geschützt, wenn links und rechts höchstens drei Zeichen stehen.
 */
export const tight = (s: string) => s.replace(/(^|[\s(„])([^\s(„]{1,3}) ([−+·÷=≈]) (?=[^\s.,;:!?)“]{1,3}(?:[\s.,;:!?)“]|$))/g, '$1$2\u00a0$3\u00a0');

export function KurzGesagt({ text, fach }: { text: string; fach?: string }) {
  return (
    <div className="xw-kurz">
      <strong>Kurz gesagt</strong>
      <p>{tight(text)}</p>
      {fach && <p className="xw-fach">In der Fachsprache: {tight(fach)}</p>}
    </div>
  );
}

/**
 * Verbindung einer Erklärung zur Reiterleiste (src/components/explain/ExplainTabs.tsx): `kurzAbove` heißt, „Kurz gesagt“
 * steht schon über den Reitern; `onStep` meldet den Schritt der Werkstatt, `goTo` setzt ihn (aus „In R“ oder „Weiter“).
 * Ohne Reiter (Standardwert) bleibt alles wie bisher.
 */
export type TabLink = { kurzAbove: boolean; onStep?: (step: number) => void; goTo?: { step: number; n: number } };
export const TabLinkContext = createContext<TabLink>({ kurzAbove: false });
export const useTabLink = () => useContext(TabLinkContext);

/** „Kurz gesagt“ oben in einer Vorlage; entfällt, wenn die Reiterleiste ihn schon über den Reitern zeigt. */
export function TopKurz(props: { text: string; fach?: string }) {
  return useTabLink().kurzAbove ? null : <KurzGesagt {...props} />;
}

/** Mut-Satz zu Beginn einer Werkstatt (Regel 6): die Formel in kleine, bekannte Handlungen zerlegt. */
export function MutBox({ text }: { text: string }) {
  return <p className="xw-mut">{tight(text)}</p>;
}

/** „Schritt k von n“ mit Fortschritt („noch m kleine Schritte“) und einer Leiste aus n Stücken. */
export function Progress({ step, last }: { step: number; last: number }) {
  const left = last - step;
  return (
    <span className="xw-progress">
      <span className="xw-label">Schritt {step} von {last}, {left === 0 ? 'der letzte Schritt' : left === 1 ? 'noch 1 kleiner Schritt' : `noch ${left} kleine Schritte`}</span>
      <span className="xw-progress-bar" aria-hidden="true">{Array.from({ length: last }, (_, i) => <span key={i} className={i + 1 < step ? 'done' : i + 1 === step ? 'on' : ''} />)}</span>
    </span>
  );
}

const state = (m: number | string, active: number | string | null) =>
  m === active ? ' on' : typeof m === 'number' && typeof active === 'number' && m < active ? ' done' : '';

/**
 * Formel aus Formelknoten. Gekoppelte Teile sind mit der Maus anklickbar; per Tastatur
 * führen die Schrittknöpfe an dieselben Stellen. Die vorlesbare Fassung steht in `label`.
 */
export function FormulaView({ nodes, active, onMark, label, className = '' }: {
  nodes: FNode[]; active: number | string | null; onMark?: (m: number | string) => void; label?: string; className?: string;
}) {
  const render = (list: FNode[]): ReactNode => list.map((n, i) => {
    if (typeof n === 'string') return <Fragment key={i}>{n}</Fragment>;
    if ('br' in n) return <br key={i} />;
    if ('sub' in n) return <sub key={i}>{n.sub}</sub>;
    const click = onMark ? () => onMark(n.m) : undefined;
    if ('big' in n) return <span key={i} className={`xw-fp xw-big${state(n.m, active)}`} onClick={click}>{n.big}</span>;
    if ('frac' in n) return <span key={i} className={`xw-frac${state(n.m, active)}`}><span className="xw-num">{render(n.frac)}</span><span className="xw-den">{render(n.den)}</span></span>;
    if ('root' in n) return <span key={i} className={`xw-rad${state(n.m, active)}`}>{render(n.root)}</span>;
    // `m: 'who'` umrahmt den Summanden der gewählten Person (Formel mit 200, src/explain/sample.ts sumNodes).
    return <span key={i} className={`xw-fp${state(n.m, active)}${n.m === 'who' ? ' xw-who' : ''}`} onClick={click}>{render(n.part)}</span>;
  });
  return label
    ? <div className={`xw-formula ${className}`} role="img" aria-label={label}><span aria-hidden="true">{render(nodes)}</span></div>
    : <div className={`xw-formula ${className}`}>{render(nodes)}</div>;
}

/** Eintrag der Zeichenübersicht; `say` ist die Aussprache ohne Anführungszeichen („x quer“). */
export type LegendItem = { sym: string; say?: string; term: string; plain: string; target: number | string };
export function GlyphLegend({ items, active, onPick }: { items: LegendItem[]; active: number | string | null; onPick: (t: number | string) => void }) {
  return (
    <div className="xw-legend">
      {items.map(g => (
        <button type="button" key={g.sym} className={g.target === active ? 'on' : ''} onClick={() => onPick(g.target)}>
          <span className="xw-legend-head"><span className="xw-sym">{g.sym}</span>{g.say && <small>sprich „{g.say}“</small>}</span>
          <strong>{g.term}</strong>
          <span>{g.plain}</span>
        </button>
      ))}
    </div>
  );
}

/** „Alle Zeichen auf einen Blick“: zugeklappt am Ende (Regel 7); ein Zeichen antippen springt zu seinem Schritt. */
export function AllGlyphs(props: { items: LegendItem[]; active: number | string | null; onPick: (t: number | string) => void }) {
  return (
    <details className="xw-glyphs">
      <summary>Alle Zeichen auf einen Blick</summary>
      <p className="xw-note">Jedes Zeichen hat einen Fachbegriff und eine Aufgabe. Antippen zeigt, wo es in der Rechnung vorkommt.</p>
      <GlyphLegend {...props} />
    </details>
  );
}

/** Schrittknöpfe: „Schritt k“, die Handlung als Titel und das Zeichen. */
export function StepNav({ steps, active, onStep }: { steps: { button: string; title: string }[]; active: number; onStep: (s: number) => void }) {
  return (
    <div className="xw-steps" role="group" aria-label="Schritte der Formel">
      {steps.map((b, i) => (
        <button type="button" key={i} aria-pressed={active === i + 1} aria-label={`Schritt ${i + 1}: ${b.title}, Zeichen ${b.button}`} onClick={() => onStep(i + 1)}>
          <small>Schritt {i + 1}</small><span className="xw-step-name">{b.title}</span><span className="xw-step-sym">{b.button}</span>
        </button>
      ))}
    </div>
  );
}

export function StepArrows({ step, last, onStep }: { step: number; last: number; onStep: (s: number) => void }) {
  return (
    <span className="xw-arrows">
      <button type="button" aria-label="Vorheriger Schritt" aria-disabled={step <= 1} onClick={() => step > 1 && onStep(step - 1)}><ArrowLeft size={16} /></button>
      <button type="button" aria-label="Nächster Schritt" aria-disabled={step >= last} onClick={() => step < last && onStep(step + 1)}><ArrowRight size={16} /></button>
    </span>
  );
}

export function Genau({ kurz, paragraphs }: { kurz: string; paragraphs: string[] }) {
  return (
    <details className="xw-genau">
      <summary>Genau genommen</summary>
      <KurzGesagt text={kurz} />
      {paragraphs.map((p, i) => <p key={i}>{tight(p)}</p>)}
    </details>
  );
}

export function Section({ title, children, note }: { title: string; children: ReactNode; note?: string }) {
  return (
    <section className="xw-section">
      <h2>{title}</h2>
      {note && <p className="xw-note">{note}</p>}
      {children}
    </section>
  );
}
