// Reiter „Mit 200 Befragten“ (Spezifikation Lehrdatensatz und R, Abschnitte 5.3 und 5.4; Ausbau, Abschnitt 5):
// für Werkstätten die Brücke (dieselbe Formel mit allen 200, Schritt für Schritt, Person, Bild, Deutung), für alle
// übrigen Begriffe eine Auswertung mit Deutung. Beide mit Vorhersagen („Erst tippen, dann ausprobieren“), die den
// gemeinsamen Lehrdatensatz ändern, und einem Hinweis mit Rücksetzknopf, solange er verändert ist.
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { ColumnSelection, SurveyRow } from '../../domain/survey';
import type { Ref } from '../../domain/learning';
import { ColumnPicker } from '../ColumnPicker';
import { bridgeFor, workshopFor } from '../../explain/registry';
import { applyOp, bridgeContext, fitsColumn, sampleColumnInfo } from '../../explain/sample';
import type { BridgeCtx, FNode, SampleCtx, SampleTab as SampleTabData, ThinkSample } from '../../explain/types';
import { FormulaView, KurzGesagt, Progress, Section, StepArrows, StepNav, useExplainMode, useWorkbenchLayout } from './basics';
import { ThinkQuestions, type ThinkQuestion } from './pieces';
import { SamplePicture } from './pictures/sample';

export type SampleProps = {
  tab: SampleTabData;
  /** Die aktuellen 200 Befragten (gemeinsamer Lehrdatensatz). */
  rows: SurveyRow[];
  /** Neue Daten übernehmen (Ausprobieren); ohne ihn bleiben die Vorhersagen ohne Ausprobieren. */
  onRows?: (rows: SurveyRow[]) => void;
  onReset?: () => void;
  modified: boolean;
  /** Der offene Begriff, für die Spaltenwahl und die Variable (x oder y). */
  reference: Ref;
  selection?: ColumnSelection;
  onColumns?: (next: ColumnSelection) => void;
  columnNotice?: string;
  /** Spalten der R-Einstellungen je Rolle (Verfahren aus dem Katalog). */
  settingsColumns?: Record<string, string[]>;
  caseId: string;
  onCase: (id: string) => void;
  /** Sprung zu einem Schritt (aus „Verstehen“ oder „In R“); die Lernkarte bekommt dann den Fokus. */
  goTo?: { step: number; n: number };
  /** Bisherige Auswertungen des Atlas (Fallwahl, Verteilung, Streudiagramm …), unter der Deutung. */
  extras?: ReactNode;
  /** „Die Rechnung als Baukasten entfalten“, zugeklappt am Ende. */
  recipe?: ReactNode;
  /** Ohne Spaltenwahl: Umschalter zwischen den Beispielspalten X und Y. */
  variableControl?: ReactNode;
};

/** Ohne Spaltenwahl rechnet der Atlas mit seinen Beispielspalten: X Lernzeit, Y Wissenstest. */
const EXAMPLE: ColumnSelection = { x: 'lernzeit', y: 'wissenstest', likertMetric: true };

const WORDS = ['null', 'einer', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf'];
const flat = (nodes: FNode[]): string => nodes.map(n => typeof n === 'string' ? n
  : 'part' in n ? flat(n.part) : 'frac' in n ? `${flat(n.frac)} / ${flat(n.den)}` : 'root' in n ? `Wurzel aus ${flat(n.root)}`
  : 'big' in n ? n.big : 'sub' in n ? n.sub : ' ').join('').replace(/\s+/g, ' ').trim();

/**
 * Hinweis, solange der gemeinsame Lehrdatensatz verändert ist, mit Rücksetzknopf. Nach dem Zurücksetzen verschwindet
 * der Knopf; der Fokus geht dann auf die Statuszeile („Wieder die Ausgangsdaten.“), nicht verloren.
 */
export function ModifiedNote({ modified, onReset, text = 'Deine Daten sind verändert. Formel, Bild und Kennzahlen zeigen die veränderten Werte.' }: { modified: boolean; onReset?: () => void; text?: string }) {
  const box = useRef<HTMLDivElement>(null), [reset, setReset] = useState(false);
  useEffect(() => { if (modified) setReset(false); }, [modified]);
  useEffect(() => { if (reset && !modified) box.current?.focus(); }, [reset, modified]);
  return (
    <div role="status" tabIndex={-1} ref={box} className="xw-status">
      {modified && <p className="xw-modified">{text}{onReset && <button type="button" className="xw-button" onClick={() => { setReset(true); onReset(); }}>Ausgangsdaten wiederherstellen</button>}</p>}
      {!modified && reset && <p className="xw-note">Wieder die Ausgangsdaten.</p>}
    </div>
  );
}

/**
 * Zählt, wie oft die Daten zu den Ausgangsdaten zurückgekehrt sind: Als Schlüssel der Vorhersagen leert er alte
 * „Vorher … Jetzt …“-Meldungen nach dem Zurücksetzen.
 */
function useResetCount(modified: boolean): number {
  const [count, setCount] = useState(0), before = useRef(modified);
  useEffect(() => { if (before.current && !modified) setCount(n => n + 1); before.current = modified; }, [modified]);
  return count;
}

/** Vorhersagefragen mit Ausprobieren auf dem Lehrdatensatz; `measure` beschreibt das Ergebnis vorher und nachher. */
function predictions(items: ThinkSample[], p: SampleProps, columnOf: (axis: 'x' | 'y') => string | undefined, who: number, measure: (rows: SurveyRow[]) => string, onAnswer?: (t: ThinkSample) => void): ThinkQuestion[] {
  return items.map(t => ({
    question: t.question, options: t.options, correct: t.correct, kurz: t.kurz,
    explain: () => t.explain,
    onAnswer: () => onAnswer?.(t),
    tryIt: {
      label: t.tryIt.label,
      run: () => {
        const column = columnOf(t.tryIt.column);
        if (!p.onRows || !column) return 'Ausprobieren geht hier nur mit dem Lehrdatensatz der Karte.';
        const next = applyOp(p.rows, column, t.tryIt.op, t.tryIt.value, who);
        if (!fitsColumn(next, column)) return `Das geht hier nicht: Einige Werte lägen außerhalb dessen, was „${sampleColumnInfo(column).title}“ erlaubt.`;
        const before = measure(p.rows), after = measure(next);
        p.onRows(next);
        return `Vorher: ${before} Jetzt: ${after}`;
      },
    },
  }));
}

export function SampleTab(p: SampleProps) {
  return p.tab.kind === 'bridge' ? <BridgeView {...p} tab={p.tab} /> : <AnalysisView {...p} tab={p.tab} />;
}

function PersonPicker({ names, who, onCase }: { names: readonly string[]; who: number; onCase: (id: string) => void }) {
  return (
    <div className="xw-person">
      <label>Vorgerechnet für Person <select value={names[who]} onChange={e => onCase(e.target.value)}>{names.map(id => <option key={id} value={id}>{id}</option>)}</select></label>
      <span className="xw-arrows">
        <button type="button" aria-label="Vorherige Person" aria-disabled={who <= 0} onClick={() => who > 0 && onCase(names[who - 1])}><ArrowLeft size={16} /></button>
        <button type="button" aria-label="Nächste Person" aria-disabled={who >= names.length - 1} onClick={() => who < names.length - 1 && onCase(names[who + 1])}><ArrowRight size={16} /></button>
      </span>
      <p className="xw-note">Ihr Beitrag ist in Formel und Bild markiert. Ein Klick auf einen Punkt im Bild wählt eine andere Person.</p>
    </div>
  );
}

function BridgeView(p: SampleProps & { tab: Extract<SampleTabData, { kind: 'bridge' }> }) {
  const { tab } = p, workshop = workshopFor(tab.workshop), bridge = bridgeFor(tab.workshop), v = workshop?.variants[tab.variant];
  const [mode] = useExplainMode(), compact = mode === 'kompakt';
  const [step, setStepRaw] = useState(1);
  const last = v?.lastStep ?? 1;
  const setStep = (n: number) => setStepRaw(Math.max(1, Math.min(last, n)));
  const cardTitle = useRef<HTMLHeadingElement>(null), thinkBox = useRef<HTMLDivElement>(null), [focusCard, setFocusCard] = useState(0);
  useEffect(() => { if (p.goTo) { setStep(p.goTo.step); setFocusCard(n => n + 1); } }, [p.goTo?.n]);
  useEffect(() => { if (focusCard) cardTitle.current?.focus(); }, [focusCard]);
  const resets = useResetCount(p.modified);
  const layout = useWorkbenchLayout(), wide = layout.wide && !compact;
  const wanted = tab.variable.split(','), pairs = bridge?.data === 'pairs';
  const axis = pairs ? 'x' : p.reference.variable;
  const chosen = p.selection ?? EXAMPLE, x = chosen[axis], y = pairs ? chosen.y : '';
  const who = Math.max(0, p.rows.findIndex(r => r.id === p.caseId));
  const c = useMemo(() => workshop && bridge ? bridgeContext(workshop.compute, bridge.data, p.rows, x, y, who) : null, [workshop, bridge, p.rows, x, y, who]);
  if (!workshop || !bridge || !v || !c) return null;
  const n = c.values.length, line = bridge.lines[step - 1], pic = bridge.picture(c, step);
  const matches = pairs ? x === wanted[0] && y === wanted[1] : x === wanted[0];
  const measure = (rows: SurveyRow[]) => { const m = bridge.metrics(bridgeContext(workshop.compute, bridge.data, rows, x, y, who), tab.variant).at(-1)!; return `${m.label} ${m.value}.`; };
  const think = predictions(tab.think, p, a => a === 'y' ? y : x, who, measure, t => t.step && setStep(t.step));
  const numeric = bridge.numeric(c, last);
  const ctx = c as BridgeCtx<unknown>;
  const formula = <>
    <FormulaView className="xw-symbolic" nodes={v.symbolic} active={step} onMark={m => typeof m === 'number' && setStep(m)} label={v.aria} />
    <FormulaView className="xw-numeric" nodes={numeric} active={step} onMark={m => typeof m === 'number' && setStep(m)} label={`Eingesetzt: ${flat(numeric)}`} />
  </>;
  const stepNav = <StepNav steps={workshop.steps.slice(0, last)} active={step} onStep={setStep} />;
  const image = <Section title="Das Bild dazu"><SamplePicture kind={bridge.data} values={c.values} values2={c.values2} names={c.names} who={c.who} pic={pic} col={c.col} col2={c.col2} onWho={i => p.onCase(c.names[i])} /></Section>;
  const card = (
    <div className="xw-card">
      <div className="xw-card-top"><Progress step={step} last={last} /><StepArrows step={step} last={last} onStep={setStep} /></div>
      <h3 className="xw-step-title" ref={cardTitle} tabIndex={-1}>{workshop.steps[step - 1].title}</h3>
      <h4>Schritt {step} für alle {n}</h4>
      <p>{line?.all(ctx as never)}</p>
      <h4>Vorgerechnet für {c.names[c.who]}</h4>
      <p className="xw-rechnung">{line?.person(ctx as never)}</p>
    </div>
  );
  const i = bridge.interpret(c, tab.variant);
  return (
    <div ref={layout.root} className={`xw xw-sample${compact ? ' xw-compact' : ''}${wide ? ' xw-wide' : ''}`}>
      <KurzGesagt text={`Dieselbe Formel wie mit ${WORDS[workshop.names.length] ?? workshop.names.length} Personen, jetzt mit allen ${n} Befragten des Lehrdatensatzes.`} />
      {p.selection && p.onColumns ? <ColumnPicker reference={p.reference} selection={p.selection} onChange={p.onColumns} notice={p.columnNotice} title={pairs ? 'Mit welchen Variablen?' : 'Mit welcher Variable?'} /> : p.variableControl}
      <ModifiedNote modified={p.modified} onReset={p.onReset} />
      <div className="xw-metrics">{bridge.metrics(c, tab.variant).map(m => <div key={m.label}><span>{m.label}</span><strong>{m.value}</strong></div>)}</div>
      <div className={`xw-work${wide ? ' wide' : ''}`}>
        <div className={`xw-stage${wide && layout.stick === 'all' ? ' stick' : ''}`}>
          <div ref={layout.formula} className={`xw-stage-formula${wide && layout.stick === 'formula' ? ' stick' : ''}`}>{formula}{!wide && stepNav}</div>
          {wide && <div ref={layout.image}>{image}</div>}
        </div>
        <div className="xw-study">{wide && stepNav}<PersonPicker names={c.names} who={c.who} onCase={p.onCase} />{card}{!wide && image}</div>
      </div>
      <Section title="Was heißt das Ergebnis?">
        <p className="xw-deutung">{i.kurz}</p>
        {!compact && <>
          <p className="xw-fach-line">In der Fachsprache: {i.fachlich}</p>
          {i.zusatz && <p>{i.zusatz}</p>}
          <h4>Voraussetzung</h4><p>{bridge.voraussetzung(c, tab.variant)}</p>
        </>}
      </Section>
      {!compact && <div ref={thinkBox} tabIndex={-1} className="xw-focus-box">{matches
        ? <ThinkQuestions key={resets} items={think} title="Erst tippen, dann ausprobieren" note={`Erst vermuten, dann mit den ${n} Befragten ausprobieren. Ausgangsdaten wiederherstellen setzt alles zurück.`} hint="Oben ist der zuständige Schritt markiert." />
        : <Section title="Erst tippen, dann ausprobieren"><p className="xw-note">Die Vorhersagefragen sind für {wanted.map(id => `„${sampleColumnInfo(id).title}“`).join(' und ')} geschrieben.
          {p.selection && p.onColumns && <button type="button" className="xw-link" onClick={() => {
            p.onColumns!(pairs ? { ...p.selection!, x: wanted[0], y: wanted[1] } : { ...p.selection!, [axis]: wanted[0] });
            // Der Knopf verschwindet mit dem Wechsel; der Fokus geht auf die Vorhersagen.
            requestAnimationFrame(() => thinkBox.current?.focus());
          }}>Zu {wanted.map(id => sampleColumnInfo(id).title).join(' und ')} wechseln</button>}</p></Section>}</div>}
      {!compact && p.recipe}
    </div>
  );
}

function AnalysisView(p: SampleProps & { tab: Extract<SampleTabData, { kind: 'analysis' }> }) {
  const { tab } = p, [mode] = useExplainMode(), compact = mode === 'kompakt';
  const columns: Record<string, string[]> = tab.columns
    ? Object.fromEntries(Object.entries(tab.columns).map(([role, id]) => [role, [id]]))
    : { ...(p.selection ? { x: [p.selection.x], y: [p.selection.y] } : {}), ...p.settingsColumns };
  const ctx = (rows: SurveyRow[]): SampleCtx => ({ rows, columns });
  const result = tab.result(ctx(p.rows)), who = Math.max(0, p.rows.findIndex(r => r.id === p.caseId));
  const think = predictions(tab.think, p, a => columns[a]?.[0], who, rows => tab.result(ctx(rows)).kurz);
  const resets = useResetCount(p.modified);
  return (
    <div className={`xw xw-sample${compact ? ' xw-compact' : ''}`}>
      <KurzGesagt text={tab.kurz} />
      {!tab.columns && (p.selection && p.onColumns ? <ColumnPicker reference={p.reference} selection={p.selection} onChange={p.onColumns} notice={p.columnNotice} /> : p.variableControl)}
      <ModifiedNote modified={p.modified} onReset={p.onReset} text="Deine Daten sind verändert. Das Ergebnis zeigt die veränderten Werte." />
      <Section title="Was heißt das Ergebnis?">
        <p className="xw-deutung">{result.kurz}</p>
        {!compact && <>
          <p className="xw-fach-line">In der Fachsprache: {result.fachlich}</p>
          {result.zusatz && <p>{result.zusatz}</p>}
          {tab.voraussetzung && <><h4>Voraussetzung</h4><p>{tab.voraussetzung}</p></>}
        </>}
      </Section>
      {p.extras}
      {!compact && tab.think.length > 0 && <ThinkQuestions key={resets} items={think} title="Erst tippen, dann ausprobieren" note={`Erst vermuten, dann mit den ${p.rows.length} Befragten ausprobieren. Ausgangsdaten wiederherstellen setzt alles zurück.`} hint="Das Ergebnis oben zeigt nach dem Ausprobieren die neuen Daten." />}
      {!compact && p.recipe}
    </div>
  );
}
