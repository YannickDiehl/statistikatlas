import { Fragment, useSyncExternalStore, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { modeStore, type Mode } from '../../explain/mode';
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

export function KurzGesagt({ text, fach }: { text: string; fach?: string }) {
  return (
    <div className="xw-kurz">
      <strong>Kurz gesagt</strong>
      <p>{text}</p>
      {fach && <p className="xw-fach">Fachlich: {fach}</p>}
    </div>
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
    return <span key={i} className={`xw-fp${state(n.m, active)}`} onClick={click}>{render(n.part)}</span>;
  });
  return label
    ? <div className={`xw-formula ${className}`} role="img" aria-label={label}><span aria-hidden="true">{render(nodes)}</span></div>
    : <div className={`xw-formula ${className}`}>{render(nodes)}</div>;
}

export type LegendItem = { sym: string; say?: string; term: string; plain: string; target: number | string };
export function GlyphLegend({ items, active, onPick }: { items: LegendItem[]; active: number | string | null; onPick: (t: number | string) => void }) {
  return (
    <div className="xw-legend">
      {items.map(g => (
        <button type="button" key={g.sym} className={g.target === active ? 'on' : ''} onClick={() => onPick(g.target)}>
          <span className="xw-legend-head"><span className="xw-sym">{g.sym}</span>{g.say && <small>sprich {g.say}</small>}</span>
          <strong>{g.term}</strong>
          <span>{g.plain}</span>
        </button>
      ))}
    </div>
  );
}

export function StepNav({ buttons, active, onStep }: { buttons: string[]; active: number; onStep: (s: number) => void }) {
  return (
    <div className="xw-steps" role="group" aria-label="Schritte der Formel">
      {buttons.map((b, i) => (
        <button type="button" key={i} aria-pressed={active === i + 1} aria-label={`Schritt ${i + 1}: ${b}`} onClick={() => onStep(i + 1)}>
          <small>Schritt {i + 1}</small><span>{b}</span>
        </button>
      ))}
    </div>
  );
}

export function StepArrows({ step, last, onStep }: { step: number; last: number; onStep: (s: number) => void }) {
  return (
    <span className="xw-arrows">
      <button type="button" aria-label="Vorheriger Schritt" disabled={step <= 1} onClick={() => onStep(step - 1)}><ArrowLeft size={16} /></button>
      <button type="button" aria-label="Nächster Schritt" disabled={step >= last} onClick={() => onStep(step + 1)}><ArrowRight size={16} /></button>
    </span>
  );
}

export function Genau({ kurz, paragraphs }: { kurz: string; paragraphs: string[] }) {
  return (
    <details className="xw-genau">
      <summary>Genau genommen</summary>
      <KurzGesagt text={kurz} />
      {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
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
