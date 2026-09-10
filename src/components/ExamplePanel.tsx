import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  type DataPair,
  defaultPairs,
  calculateStatistics,
  formatNumber,
} from '../domain/statistics';
import './ExamplePanel.css';

type ExamplePanelProps = {
  pairs: DataPair[];
  onChange: (pairs: DataPair[]) => void;
  onSelectConcept: (id: string) => void;
};

type Draft = { x: string; y: string };
type Drafts = Record<string, Draft>;
type Axis = 'x' | 'y';

const inputText = (value: number) => String(value).replace('.', ',');
const makeDrafts = (pairs: DataPair[]): Drafts =>
  Object.fromEntries(pairs.map((pair) => [pair.id, { x: inputText(pair.x), y: inputText(pair.y) }]));

function parseInput(value: string): number | null {
  const normalized = value.trim().replace(',', '.');
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(normalized)) return null;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

function numberLabel(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) return 'nicht definiert';
  if (Math.abs(value) >= 1e6 || (value !== 0 && Math.abs(value) < 0.0001)) {
    return value.toExponential(2).replace('.', ',');
  }
  return formatNumber(value);
}

/** Scale before subtracting, so even very large finite inputs remain drawable. */
function axisScale(values: number[], start: number, end: number) {
  const magnitude = Math.max(1, ...values.map(Math.abs));
  const normalized = values.map((value) => value / magnitude);
  const lower = Math.min(...normalized);
  const upper = Math.max(...normalized);
  const padding = upper === lower ? 0.15 : (upper - lower) * 0.14;
  const min = lower - padding;
  const max = upper + padding;
  return {
    project: (value: number) => start + ((value / magnitude - min) / (max - min)) * (end - start),
    lower: Math.min(...values),
    upper: Math.max(...values),
  };
}

function axisLabel(value: number) {
  if (Math.abs(value) >= 10000 || (value !== 0 && Math.abs(value) < 0.01)) {
    return value.toExponential(1).replace('.', ',');
  }
  return new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 }).format(value);
}

function Scatterplot({ pairs, activeId }: { pairs: DataPair[]; activeId: string | null }) {
  const titleId = useId();
  const descriptionId = useId();
  const x = axisScale(pairs.map((pair) => pair.x), 76, 315);
  const y = axisScale(pairs.map((pair) => pair.y), 182, 38);
  return (
    <figure className="exlab-plot">
      <figcaption>
        <span>So liegen die Wertepaare</span>
        <span className="exlab-plot-key"><i /> ein Fall</span>
      </figcaption>
      <svg viewBox="0 0 344 220" role="img" aria-labelledby={`${titleId} ${descriptionId}`}>
        <title id={titleId}>Streudiagramm der eingegebenen Wertepaare</title>
        <desc id={descriptionId}>
          Die waagerechte Achse zeigt x, die senkrechte Achse y. Jeder nummerierte Punkt entspricht
          einer Zeile der Datentabelle. Die Achsen passen sich den eingegebenen Werten an.
        </desc>
        {[75, 128].map((position) => (
          <line key={`h-${position}`} x1="66" y1={position} x2="324" y2={position} className="exlab-gridline" />
        ))}
        {[145, 235].map((position) => (
          <line key={`v-${position}`} x1={position} y1="22" x2={position} y2="193" className="exlab-gridline" />
        ))}
        <path d="M66 22 V193 H324" className="exlab-axis" />
        <text x="332" y="198" className="exlab-axisname">x</text>
        <text x="62" y="15" className="exlab-axisname">y</text>
        <text x={x.project(x.lower)} y="214" textAnchor="middle" className="exlab-tick">{axisLabel(x.lower)}</text>
        {x.upper !== x.lower && <text x={x.project(x.upper)} y="214" textAnchor="middle" className="exlab-tick">{axisLabel(x.upper)}</text>}
        <text x="58" y={y.project(y.lower) + 4} textAnchor="end" className="exlab-tick">{axisLabel(y.lower)}</text>
        {y.upper !== y.lower && <text x="58" y={y.project(y.upper) + 4} textAnchor="end" className="exlab-tick">{axisLabel(y.upper)}</text>}
        {pairs.map((pair, index) => (
          <g key={pair.id} className={`exlab-point${pair.id === activeId ? ' exlab-point-active' : ''}`}>
            <title>{`Fall ${index + 1}: x = ${inputText(pair.x)}, y = ${inputText(pair.y)}`}</title>
            <circle cx={x.project(pair.x)} cy={y.project(pair.y)} r={pair.id === activeId ? 7 : 5} />
            <text x={x.project(pair.x) + 8} y={y.project(pair.y) - 7}>{index + 1}</text>
          </g>
        ))}
      </svg>
    </figure>
  );
}

export default function ExamplePanel({ pairs, onChange, onSelectConcept }: ExamplePanelProps) {
  const [drafts, setDrafts] = useState<Drafts>(() => makeDrafts(pairs));
  const [activeId, setActiveId] = useState<string | null>(null);
  const previousPairs = useRef(pairs);
  const nextId = useRef(0);
  const inputHintId = useId();
  const headingId = useId();
  const stats = useMemo(() => calculateStatistics(pairs), [pairs]);

  useEffect(() => {
    const previousById = new Map(previousPairs.current.map((pair) => [pair.id, pair]));
    setDrafts((current) => Object.fromEntries(pairs.map((pair) => {
      const previous = previousById.get(pair.id);
      const draft = current[pair.id];
      return [pair.id, {
        x: draft && (previous?.x === pair.x || parseInput(draft.x) === pair.x) ? draft.x : inputText(pair.x),
        y: draft && (previous?.y === pair.y || parseInput(draft.y) === pair.y) ? draft.y : inputText(pair.y),
      }];
    })));
    previousPairs.current = pairs;
  }, [pairs]);

  const hasInvalidInput = pairs.some((pair) => {
    const draft = drafts[pair.id];
    return draft && (parseInput(draft.x) === null || parseInput(draft.y) === null);
  });

  function updateValue(pair: DataPair, axis: Axis, text: string) {
    setDrafts((current) => ({
      ...current,
      [pair.id]: { ...(current[pair.id] ?? { x: inputText(pair.x), y: inputText(pair.y) }), [axis]: text },
    }));
    const value = parseInput(text);
    if (value !== null) onChange(pairs.map((candidate) => candidate.id === pair.id ? { ...candidate, [axis]: value } : candidate));
  }

  function reset() {
    const fresh = defaultPairs.map((pair) => ({ ...pair }));
    setDrafts(makeDrafts(fresh));
    setActiveId(null);
    onChange(fresh);
  }

  function addPair() {
    if (pairs.length >= 8) return;
    nextId.current += 1;
    const value = pairs.length + 1;
    onChange([...pairs, { id: `example-${Date.now()}-${nextId.current}`, x: value, y: value }]);
  }

  return (
    <section className="exlab" aria-labelledby={headingId}>
      <div className="exlab-heading">
        <div>
          <p className="exlab-eyebrow">Selbst ausprobieren</p>
          <h2 id={headingId}>Das kleine Datenlabor</h2>
        </div>
        <button type="button" className="exlab-reset" onClick={reset} aria-label="Datenlabor auf die fünf Ausgangswerte zurücksetzen" title="Ausgangswerte wiederherstellen">
          Reset
        </button>
      </div>
      <p className="exlab-intro">Verändere einen Wert. Die Kennzahlen und das Netz rechnen mit.</p>

      <table className="exlab-table">
        <caption className="exlab-sr-only">Veränderbare Wertepaare für das Statistikbeispiel</caption>
        <thead>
          <tr><th scope="col">Fall</th><th scope="col">x</th><th scope="col">y</th><th scope="col"><span className="exlab-sr-only">Entfernen</span></th></tr>
        </thead>
        <tbody>
          {pairs.map((pair, index) => (
            <tr
              key={pair.id}
              className={pair.id === activeId ? 'exlab-row-active' : undefined}
              onMouseEnter={() => setActiveId(pair.id)}
              onMouseLeave={() => setActiveId(null)}
              onFocusCapture={() => setActiveId(pair.id)}
              onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setActiveId(null); }}
            >
              <th scope="row"><span className="exlab-case-number">{index + 1}</span></th>
              {(['x', 'y'] as const).map((axis) => {
                const draft = drafts[pair.id]?.[axis] ?? inputText(pair[axis]);
                const invalid = parseInput(draft) === null;
                return (
                  <td key={axis}>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={draft}
                      onChange={(event) => updateValue(pair, axis, event.target.value)}
                      aria-label={`${axis}-Wert für Fall ${index + 1}`}
                      aria-invalid={invalid}
                      aria-describedby={invalid ? inputHintId : undefined}
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </td>
                );
              })}
              <td>
                <button
                  type="button"
                  className="exlab-remove"
                  onClick={() => onChange(pairs.filter((candidate) => candidate.id !== pair.id))}
                  disabled={pairs.length <= 2}
                  aria-label={`Fall ${index + 1} entfernen`}
                  title={pairs.length <= 2 ? 'Mindestens zwei Fälle behalten' : `Fall ${index + 1} entfernen`}
                >×</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {hasInvalidInput && <p className="exlab-input-hint" id={inputHintId} role="status">Bitte eine endliche Zahl eingeben. Bis dahin gilt der letzte gültige Wert.</p>}
      <div className="exlab-table-footer">
        <button type="button" className="exlab-add" disabled={pairs.length >= 8} onClick={addPair}>+ Fall hinzufügen</button>
        <span>{pairs.length} von max. 8 Fällen</span>
      </div>

      <Scatterplot pairs={pairs} activeId={activeId} />

      <div className="exlab-results" aria-label="Berechnete Kennzahlen; auswählen, um den Begriff im Netz zu öffnen">
        <button type="button" className="exlab-result" onClick={() => onSelectConcept('mean')}>
          <span className="exlab-result-name">Mittelwert <span>im Netz ↗</span></span>
          <span className="exlab-result-values"><span>x̄ <strong>{numberLabel(stats.meanX)}</strong></span><span>ȳ <strong>{numberLabel(stats.meanY)}</strong></span></span>
        </button>
        <button type="button" className="exlab-result" onClick={() => onSelectConcept('sd')}>
          <span className="exlab-result-name">Standardabweichung <span>im Netz ↗</span></span>
          <span className="exlab-result-values"><span>sₓ <strong>{numberLabel(stats.sdX)}</strong></span><span>sᵧ <strong>{numberLabel(stats.sdY)}</strong></span></span>
        </button>
        <button type="button" className="exlab-result exlab-result-correlation" onClick={() => onSelectConcept('pearson')}>
          <span className="exlab-result-name">Pearson-Korrelation <span>im Netz ↗</span></span>
          <span className="exlab-correlation-value">r <strong>{numberLabel(stats.pearson)}</strong></span>
        </button>
      </div>
      <p className="exlab-note">Hier verwenden wir die Stichproben-Standardabweichung mit <span className="exlab-nowrap">n − 1</span>.</p>
      <p className="exlab-note exlab-limitation">Ohne Streuung in x oder y ist Pearson-r nicht definiert.</p>
    </section>
  );
}
