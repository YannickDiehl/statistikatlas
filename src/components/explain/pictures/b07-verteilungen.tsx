// Bilder des Bereichs B7 „Verteilungsfamilien“ für alle Vorlagen. Schlüssel = `picture` der Erklärung, Bausteine und
// `forWorkshop`/`forCard`/`forSentence`/`forTable` aus ./kit.tsx.
// Eigene Stile in src/explain/areas/b07-verteilungen.css (lädt main.tsx automatisch). Anleitung: src/explain/AUTHORING.md.
import { num, pct } from '../../../explain/format';
import { baseSurvey } from '../../../explain/sample';
import { columnStats, dbinom, dchisq, dF, dhyper, dnorm, dt, prob, qchisq, within } from '../../../explain/content/b07-verteilungen/dist';
import { inside } from '../../../explain/content/b07-verteilungen/normal';
import { areaText, type ZStats } from '../../../explain/content/b07-verteilungen/standard-normal';
import { SCHLAF_T, tCrit } from '../../../explain/content/b07-verteilungen/t';
import { CHI } from '../../../explain/content/b07-verteilungen/chi-square';
import { ANOVA, fTail, pText } from '../../../explain/content/b07-verteilungen/f';
import type { BernStats } from '../../../explain/content/b07-verteilungen/bernoulli';
import type { BinStats } from '../../../explain/content/b07-verteilungen/binomial';
import { HYPER } from '../../../explain/content/b07-verteilungen/hypergeometric';
import { AreaUnder, Axis, Bar, Curve, forCard, forSentence, linear, MarkLine, useWidth, type Picture } from './kit';

/** Histogramm der Schlafdauer (halbe Stunden) mit der Normalverteilung x̄, s; markiert ist x̄ ± k · s. */
function NormalFit({ k }: { k: number }) {
  const [box, W] = useWidth();
  const { xs, n, mean, sd } = columnStats(baseSurvey(), 'schlafdauer');
  const width = 0.5, start = 4.5, bins = Array.from({ length: 11 }, (_, i) => start + i * width);
  const counts = bins.map(a => xs.filter(x => x >= a - 1e-9 && x < a + width - 1e-9).length);
  const curve = (x: number) => n * width * dnorm((x - mean) / sd) / sd;
  const top = Math.max(...counts, curve(mean)) * 1.08, base = 196, left = 30, right = W - 16;
  const X = linear([start, start + bins.length * width], [left, right]), Y = linear([0, top], [base, 52]);
  const lo = mean - k * sd, hi = mean + k * sd, count = within(xs, mean, sd, k);
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={246} viewBox={`0 0 ${W} 246`} role="img"
        aria-label={`Histogramm der Schlafdauer der 200 Befragten mit einer Normalverteilung. Markiert sind ${num(lo)} bis ${num(hi)} Stunden, höchstens ${num(k)} Standardabweichungen von der Mitte: im Modell ${pct(inside(k))}, in den Daten ${count} von ${n}.`}>
        {bins.map((a, i) => counts[i] > 0 && <Bar key={a} x={X(a) + 1} y={Y(counts[i])} width={X(a + width) - X(a) - 2} height={base - Y(counts[i])} tone="plain" />)}
        <AreaUnder f={curve} from={Math.max(start, lo)} to={Math.min(start + bins.length * width, hi)} x={X} y={Y} tone="pos" />
        <Curve f={curve} from={start} to={start + bins.length * width} x={X} y={Y} />
        <line className="xw-mean" x1={X(mean)} x2={X(mean)} y1={52} y2={base} />
        <text className="xw-t" x={X(mean) + 5} y={base - 6}>x̄</text>
        <Axis scale={X} ticks={[5, 6, 7, 8, 9, 10]} at={base} from={left} to={right} labelGap={20} title="Schlafdauer in Stunden pro Nacht" />
        <text className="xw-t xw-strong" x={left} y={16}>Grüne Fläche im Modell: {pct(inside(k))}</text>
        <text className="xw-t" x={left} y={36}>In den Daten: {count} von {n}</text>
      </svg>
    </div>
  );
}

/** Standardnormalverteilung mit der Fläche links von z; darunter dieselben Stellen in Stunden (μ + z · σ). */
function StandardArea({ s }: { s: ZStats }) {
  const [box, W] = useWidth();
  const lim = 4, base = 168, left = 28, right = W - 28, cut = Math.max(-lim, Math.min(lim, s.zr));
  const X = linear([-lim, lim], [left, right]), Y = linear([0, 0.42], [base, 46]);
  const hours = [-2, 0, 2];
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={238} viewBox={`0 0 ${W} 238`} role="img"
        aria-label={`Standardnormalverteilung. Markiert ist die Fläche links von z = ${num(s.zr)}: ${areaText(s.area)}. Die Mitte 0 entspricht ${num(s.mu)} Stunden, eine Standardabweichung ${num(s.sigma)} Stunden.`}>
        <AreaUnder f={dnorm} from={-lim} to={cut} x={X} y={Y} tone="pos" />
        <Curve f={dnorm} from={-lim} to={lim} x={X} y={Y} />
        <MarkLine x={X(cut)} from={46} to={base} label={Math.abs(s.zr) <= lim ? `z = ${num(s.zr)}` : `z = ${num(s.zr)} (außerhalb)`} />
        <Axis scale={X} ticks={[-3, -2, -1, 0, 1, 2, 3]} at={base} from={left} to={right} labelGap={18} />
        <text className="xw-t" x={right} y={base + 18} textAnchor="end">z</text>
        {hours.map(z => <text key={z} className="xw-t" x={X(z)} y={base + 42} textAnchor="middle">{num(s.mu + z * s.sigma)}</text>)}
        <text className="xw-t" x={(left + right) / 2} y={base + 62} textAnchor="middle">Stunden: μ − 2σ, μ, μ + 2σ</text>
        <text className="xw-t xw-strong" x={left} y={16}>Fläche links von z: {areaText(s.area)}</text>
      </svg>
    </div>
  );
}

/** t-Verteilung mit df Freiheitsgraden neben der Standardnormalverteilung (gestrichelt); markiert die äußeren 5 % und t = 1,42. */
function TCompare({ df }: { df: number }) {
  const [box, W] = useWidth();
  const lim = 5, base = 222, top = 98, left = 28, right = W - 28, crit = tCrit(df), t = SCHLAF_T.t;
  const X = linear([-lim, lim], [left, right]), Y = linear([0, 0.42], [base, top]);
  const f = (v: number) => dt(v, df), cut = Math.min(crit, lim);
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={268} viewBox={`0 0 ${W} 268`} role="img"
        aria-label={`t-Verteilung mit ${num(df)} Freiheitsgraden und gestrichelt die Standardnormalverteilung. Die äußeren 5 % liegen jenseits von ±${num(crit)}. Markiert ist t = ${num(t)} aus dem Lehrdatensatz.`}>
        {crit < lim && <><AreaUnder f={f} from={-lim} to={-cut} x={X} y={Y} tone="neg" /><AreaUnder f={f} from={cut} to={lim} x={X} y={Y} tone="neg" /></>}
        <Curve f={dnorm} from={-lim} to={lim} x={X} y={Y} className="b07-ref" />
        <Curve f={f} from={-lim} to={lim} x={X} y={Y} />
        {crit < lim && <><MarkLine x={X(cut)} from={top} to={base} /><MarkLine x={X(-cut)} from={top} to={base} /></>}
        <line className="xw-pos" strokeWidth={2.5} x1={X(t)} x2={X(t)} y1={Y(Math.max(f(t), dnorm(t))) - 14} y2={base} />
        <Axis scale={X} ticks={[-4, -2, 0, 2, 4]} at={base} from={left} to={right} labelGap={20} title="t" />
        <text className="xw-t xw-strong" x={left} y={16}>t-Verteilung, {fgText(df)}</text>
        <text className="xw-t" x={left} y={36}>gestrichelt: Standardnormalverteilung</text>
        <text className="xw-t" x={left} y={56}>braunrot: äußere 5 %, jenseits von ±{num(crit)}</text>
        <text className="xw-t" x={left} y={76}>grüner Strich bei {num(t)}: t der Schlafdauer</text>
      </svg>
    </div>
  );
}
/** χ²-Verteilung mit df Freiheitsgraden: Erwartungswert gestrichelt, äußere 5 % braunrot, bei 4 Freiheitsgraden χ² = 3,08 als grüner Strich. */
function ChiShape({ df }: { df: number }) {
  const [box, W] = useWidth();
  const lim = 25, base = 222, top = 98, left = 28, right = W - 20, crit = qchisq(0.95, df), four = Math.abs(df - 4) < 1e-9;
  const peak = Math.min(0.5, Math.max(...Array.from({ length: 100 }, (_, i) => dchisq(0.1 + i * 0.25, df))));
  const f = (v: number) => Math.min(dchisq(v, df), peak);
  const X = linear([0, lim], [left, right]), Y = linear([0, peak * 1.08], [base, top]);
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={268} viewBox={`0 0 ${W} 268`} role="img"
        aria-label={`χ²-Verteilung mit ${num(df)} Freiheitsgraden. Erwartungswert ${num(df)}, die äußeren 5 % liegen über ${num(crit)}.${four ? ` Markiert ist χ² = ${num(CHI.chi2)} aus dem Lehrdatensatz.` : ''}`}>
        <AreaUnder f={f} from={crit} to={lim} x={X} y={Y} tone="neg" />
        <Curve f={f} from={0.02} to={lim} x={X} y={Y} samples={200} />
        <MarkLine x={X(df)} from={top} to={base} />
        {four && <line className="xw-pos" strokeWidth={2.5} x1={X(CHI.chi2)} x2={X(CHI.chi2)} y1={Y(f(CHI.chi2)) - 14} y2={base} />}
        <Axis scale={X} ticks={[0, 5, 10, 15, 20, 25]} at={base} from={left} to={right} labelGap={20} title="χ²" />
        <text className="xw-t xw-strong" x={left} y={16}>χ²-Verteilung, {fgText(df)}</text>
        <text className="xw-t" x={left} y={36}>gestrichelt: Erwartungswert {num(df)}</text>
        <text className="xw-t" x={left} y={56}>braunrot: äußere 5 %, ab {num(crit)}</text>
        {four && <text className="xw-t" x={left} y={76}>grüner Strich bei {num(CHI.chi2)}: χ² der 200</text>}
      </svg>
    </div>
  );
}
/** F-Verteilung mit 4 und 195 Freiheitsgraden: Fläche rechts vom gewählten F braunrot, Grenze für die äußeren 5 % gestrichelt. */
function FTail({ value }: { value: number }) {
  const [box, W] = useWidth();
  const lim = 10, base = 202, top = 78, left = 28, right = W - 20, p = fTail(value);
  const f = (v: number) => dF(v, ANOVA.df1, ANOVA.df2);
  const X = linear([0, lim], [left, right]), Y = linear([0, 0.8], [base, top]);
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={248} viewBox={`0 0 ${W} 248`} role="img"
        aria-label={`F-Verteilung mit 4 und 195 Freiheitsgraden. Braunrot ist die Fläche rechts von F = ${num(value)}: ${pText(p)}. Gestrichelt die Grenze ${num(ANOVA.crit)} für die äußeren 5 %.`}>
        <AreaUnder f={f} from={Math.min(value, lim)} to={lim} x={X} y={Y} tone="neg" samples={120} />
        <Curve f={f} from={0.01} to={lim} x={X} y={Y} samples={200} />
        <MarkLine x={X(ANOVA.crit)} from={top} to={base} />
        <line className="xw-pos" strokeWidth={2.5} x1={X(Math.min(value, lim))} x2={X(Math.min(value, lim))} y1={Y(f(Math.min(value, lim))) - 14} y2={base} />
        <Axis scale={X} ticks={[0, 2, 4, 6, 8, 10]} at={base} from={left} to={right} labelGap={20} title="F" />
        <text className="xw-t xw-strong" x={left} y={16}>Fläche rechts von F = {num(value)}: {pText(p)}</text>
        <text className="xw-t" x={left} y={36}>F-Verteilung, 4 und 195 Freiheitsgrade</text>
        <text className="xw-t" x={left} y={56}>gestrichelt: Grenze {num(ANOVA.crit)} für 5 %</text>
      </svg>
    </div>
  );
}
/** Bernoulli-Verteilung: links die zwei Wahrscheinlichkeiten als Balken, rechts die Varianz p · (1 − p) für alle p mit dem gewählten Punkt. */
function BernoulliBars({ s }: { s: BernStats }) {
  const [box, W] = useWidth();
  const base = 186, top = 46, half = W / 2, bw = Math.min(56, half / 4);
  const Y = linear([0, 1], [base, top]);
  const VX = linear([0, 1], [half + 24, W - 16]), VY = linear([0, 0.25], [base, top + 20]);
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={236} viewBox={`0 0 ${W} 236`} role="img"
        aria-label={`Bernoulli-Verteilung mit p = ${num(s.p)}: Balken für 0 mit ${num(s.q)}, für 1 mit ${num(s.p)}. Rechts die Varianz p mal 1 minus p für alle p; beim gewählten p ist sie ${prob(s.v)}.`}>
        <Bar x={half / 4 - bw / 2} y={Y(s.q)} width={bw} height={base - Y(s.q)} tone="plain" />
        <Bar x={3 * half / 4 - bw / 2} y={Y(s.p)} width={bw} height={base - Y(s.p)} tone="pos" />
        <text className="xw-t" x={half / 4} y={Y(s.q) - 6} textAnchor="middle">{num(s.q)}</text>
        <text className="xw-t" x={3 * half / 4} y={Y(s.p) - 6} textAnchor="middle">{num(s.p)}</text>
        <line className="xw-axis" x1={8} x2={half - 8} y1={base} y2={base} />
        <text className="xw-t" x={half / 4} y={base + 20} textAnchor="middle">0</text>
        <text className="xw-t" x={3 * half / 4} y={base + 20} textAnchor="middle">1</text>
        <text className="xw-t" x={half / 2} y={base + 40} textAnchor="middle">Wert von X</text>
        <Curve f={p => p * (1 - p)} from={0} to={1} x={VX} y={VY} />
        <circle className="b07-dot" cx={VX(s.p)} cy={VY(s.v)} r={6} />
        <Axis scale={VX} ticks={[0, 0.5, 1]} at={base} from={half + 24} to={W - 16} labelGap={20} format={v => num(v)} title="p" />
        <text className="xw-t xw-strong" x={8} y={16}>P(X = 0) und P(X = 1)</text>
        <text className="xw-t xw-strong" x={half + 24} y={36}>Var(X) = {prob(s.v)}</text>
      </svg>
    </div>
  );
}
/** Binomialverteilung B(n, p): ein Balken je Zahl der Erfolge, k hervorgehoben, der Erwartungswert n · p gestrichelt. */
function BinomialBars({ s }: { s: BinStats }) {
  const [box, W] = useWidth();
  const base = 196, top = 62, left = 28, right = W - 16, probs = Array.from({ length: s.n + 1 }, (_, j) => dbinom(j, s.n, s.p));
  const X = linear([-0.5, s.n + 0.5], [left, right]), Y = linear([0, Math.max(...probs) * 1.1], [base, top]), bw = Math.max(4, (X(1) - X(0)) * 0.7);
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={244} viewBox={`0 0 ${W} 244`} role="img"
        aria-label={`Binomialverteilung mit n = ${s.n} und p = ${num(s.p)}: Wahrscheinlichkeiten für 0 bis ${s.n} Erfolge. ${s.valid ? `Hervorgehoben: genau ${s.k}, ${prob(s.P)}.` : `k = ${s.k} ist größer als n.`} Erwartungswert ${num(s.e)}.`}>
        {probs.map((q, j) => <Bar key={j} x={X(j) - bw / 2} y={Y(q)} width={bw} height={base - Y(q)} tone={j === s.k ? 'pos' : 'plain'} selected={j === s.k} />)}
        <MarkLine x={X(s.e)} from={top - 8} to={base} />
        <Axis scale={X} ticks={Array.from({ length: s.n + 1 }, (_, j) => j)} at={base} from={left} to={right} labelGap={20} title="Zahl der Erfolge" />
        <text className="xw-t xw-strong" x={left} y={16}>{s.valid ? `P(X = ${s.k}) ≈ ${prob(s.P)}` : `k = ${s.k} ist größer als n = ${s.n}`}</text>
        <text className="xw-t" x={left} y={36}>gestrichelt: Erwartungswert {num(s.e)}</text>
      </svg>
    </div>
  );
}
/** n aus 200 ohne Zurücklegen (Balken, hypergeometrisch) neben mit Zurücklegen (Kreise, Binomialverteilung). */
function HyperBars({ n }: { n: number }) {
  const [box, W] = useWidth();
  const draws = Math.max(1, Math.min(HYPER.N, Math.round(n))), p = HYPER.K / HYPER.N;
  const ks = Array.from({ length: draws + 1 }, (_, k) => k).filter(k => dhyper(k, HYPER.K, HYPER.N, draws) >= 0.001 || dbinom(k, draws, p) >= 0.001);
  const lo = ks[0], hi = ks[ks.length - 1], base = 200, top = 84, left = 28, right = W - 16;
  const X = linear([lo - 0.5, hi + 0.5], [left, right]);
  const peak = Math.max(...ks.map(k => Math.max(dhyper(k, HYPER.K, HYPER.N, draws), dbinom(k, draws, p))));
  const Y = linear([0, peak * 1.08], [base, top]), bw = Math.max(2, (X(1) - X(0)) * 0.7);
  const every = Math.max(1, Math.ceil((hi - lo + 1) / 6)), ticks = ks.filter(k => (k - lo) % every === 0);
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={250} viewBox={`0 0 ${W} 250`} role="img"
        aria-label={`${draws} von 200 Befragten gezogen. Balken: Zahl der Treffer mit Weiterbildung ohne Zurücklegen, hypergeometrisch. Kreise: mit Zurücklegen, binomialverteilt. Treffer von ${lo} bis ${hi}.`}>
        {ks.map(k => { const q = dhyper(k, HYPER.K, HYPER.N, draws); return q > 0 && <Bar key={`b${k}`} x={X(k) - bw / 2} y={Y(q)} width={bw} height={base - Y(q)} tone="pos" />; })}
        {ks.map(k => <circle key={`c${k}`} className="b07-dot" cx={X(k)} cy={Y(dbinom(k, draws, p))} r={Math.min(5, Math.max(2.5, bw / 3))} />)}
        <Axis scale={X} ticks={ticks} at={base} from={left} to={right} labelGap={20} title="Treffer mit Weiterbildung" />
        <text className="xw-t xw-strong" x={left} y={16}>{draws} von 200 gezogen</text>
        <text className="xw-t" x={left} y={36}>Balken: ohne Zurücklegen</text>
        <text className="xw-t" x={left} y={56}>Kreise: mit Zurücklegen</text>
      </svg>
    </div>
  );
}
const fgText = (df: number) => `${num(df)} ${num(df) === '1' ? 'Freiheitsgrad' : 'Freiheitsgrade'}`;

export const pictures: Record<string, Picture> = {
  'b07-normal': forCard(p => <NormalFit k={p.value ?? 1} />),
  'b07-standard': forSentence(p => <StandardArea s={p.s as ZStats} />),
  'b07-t': forCard(p => <TCompare df={p.value ?? 4} />),
  'b07-chi': forCard(p => <ChiShape df={p.value ?? 4} />),
  'b07-f': forCard(p => <FTail value={p.value ?? ANOVA.f} />),
  'b07-bernoulli': forSentence(p => <BernoulliBars s={p.s as BernStats} />),
  'b07-binomial': forSentence(p => <BinomialBars s={p.s as BinStats} />),
  'b07-hyper': forCard(p => <HyperBars n={p.value ?? HYPER.n} />),
};
