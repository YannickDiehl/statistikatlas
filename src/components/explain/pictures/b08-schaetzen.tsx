// Bilder des Bereichs B8 „Stichprobe und Schätzen“ für alle Vorlagen. Schlüssel = `picture` der Erklärung, Bausteine und
// `forWorkshop`/`forCard`/`forSentence`/`forTable` aus ./kit.tsx.
// Eigene Stile in src/explain/areas/b08-schaetzen.css (lädt main.tsx automatisch). Anleitung: src/explain/AUTHORING.md.
import { num, pct } from '../../../explain/format';
import { binomial, middle95, stufe } from '../../../explain/content/b08-schaetzen/daten';
import { ANTEIL_N, WEITERBILDUNG } from '../../../explain/content/b08-schaetzen/sampling-distribution';
import { Axis, Curve, forCard, linear, MarkLine, useWidth, type Picture } from './kit';

type Tone = 'pos' | 'neg' | 'plain';
/** Ein Balken der Verteilung: Wert, Wahrscheinlichkeit und Farbe (Farbe ist nie allein Träger, das Band zeigt die Lage). */
type Balken = { x: number; p: number; tone: Tone };

/**
 * Verteilung als Balken über einer waagerechten Achse. Sehr schmale Balken werden mindestens 1 Pixel breit; Balken mit
 * verschwindender Wahrscheinlichkeit fallen weg. Optional: ein hinterlegtes Band, senkrechte Marken und eine Kurve
 * (in denselben Einheiten wie die Balken, also Wahrscheinlichkeit je Balken).
 */
function Verteilung({ bars, step, domain, ticks, format, band, marks = [], curve, legend, title, label }: {
  bars: Balken[]; step: number; domain: [number, number]; ticks: number[]; format: (v: number) => string;
  band?: [number, number]; marks?: { x: number; label: string }[]; curve?: (v: number) => number;
  legend: string; title: string; label: string;
}) {
  const [box, W] = useWidth();
  const left = 24, right = W - 20, top = 46, base = 176, H = 236;
  const X = linear(domain, [left, right]);
  const maxP = Math.max(...bars.map(b => b.p)), Y = linear([0, maxP * 1.08], [base, top]);
  const w = Math.max(1, X(domain[0] + step) - X(domain[0]) - (X(domain[0] + step) - X(domain[0]) >= 4 ? 1 : 0));
  const shown = bars.filter(b => b.p >= maxP * 1e-3 && b.x >= domain[0] - 1e-9 && b.x <= domain[1] + 1e-9);
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
        <text className="xw-t" x={left} y={16}>{legend}</text>
        {band && <rect className="xw-band" x={X(band[0])} y={top - 8} width={Math.max(1, X(band[1]) - X(band[0]))} height={base - top + 8} />}
        {shown.map(b => <rect key={b.x} className={`xw-bar-${b.tone}`} x={X(b.x) - w / 2} y={Y(b.p)} width={w} height={Math.max(0.5, base - Y(b.p))} />)}
        {curve && <Curve f={curve} from={domain[0]} to={domain[1]} x={X} y={Y} samples={160} />}
        {marks.map(m => <MarkLine key={m.label} x={X(m.x)} from={top - 6} to={base} label={m.label} />)}
        <Axis scale={X} ticks={ticks} at={base} from={left} to={right} format={format} labelGap={20} title={title} />
      </svg>
    </div>
  );
}

const prozent = (v: number) => `${num(v * 100)} %`;

/** Stichprobenverteilung des Anteils mit Weiterbildung bei n Gezogenen (exakt binomial), mittlere 95 % hinterlegt. */
function AnteilVerteilung({ n }: { n: number }) {
  const pmf = binomial(n, WEITERBILDUNG.pi), m = middle95(n, WEITERBILDUNG.pi);
  const bars = pmf.map((p, k): Balken => ({ x: k / n, p, tone: k / n >= m.lo - 1e-12 && k / n <= m.hi + 1e-12 ? 'pos' : 'plain' }));
  return <Verteilung bars={bars} step={1 / n} domain={[0, 1]} ticks={[0, 0.2, 0.4, 0.6, 0.8, 1]} format={prozent}
    band={[m.lo - 0.5 / n, m.hi + 0.5 / n]} marks={[{ x: WEITERBILDUNG.pi, label: `π = ${pct(WEITERBILDUNG.pi)}` }]}
    legend={`Hinterlegt: die mittleren ${Math.round(m.prob * 100)} von 100 Stichproben`}
    title={`Anteil mit Weiterbildung bei ${n} Gezogenen`}
    label={`Stichprobenverteilung des Anteils mit Weiterbildung bei ${n} Gezogenen: Mitte bei ${pct(WEITERBILDUNG.pi)}, in etwa ${Math.round(m.prob * 100)} von 100 Stichproben liegt der Anteil zwischen ${pct(m.lo)} und ${pct(m.hi)}.`} />;
}

export const pictures: Record<string, Picture> = {
  'b08-anteil': forCard(p => <AnteilVerteilung n={stufe(ANTEIL_N, p.value ?? ANTEIL_N.indexOf(50))} />),
};
