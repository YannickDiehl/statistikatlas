// Bilder des Bereichs B9 „Testlogik“ für alle Vorlagen. Schlüssel = `picture` der Erklärung, Bausteine und
// `forWorkshop`/`forCard`/`forSentence`/`forTable` aus ./kit.tsx.
// Eigene Stile in src/explain/areas/b09-testlogik.css (lädt main.tsx automatisch). Anleitung: src/explain/AUTHORING.md.
import { lgamma } from '../../../tasks/kit/dist';
import type { TStats } from '../../../explain/content/b09-testlogik/pruefgroesse';
import { MISCHEN, asFarAs, mixCount } from '../../../explain/content/b09-testlogik/nullverteilung';
import { SEITEN, sideOf } from '../../../explain/content/b09-testlogik/seiten';
import { ANTEIL } from '../../../explain/content/b09-testlogik/alpha';
import type { CStats } from '../../../explain/content/b09-testlogik/kritisch';
import { MU0, SCHLAF, mischen, schlafP, small } from '../../../explain/content/b09-testlogik/rechnen';
import { LERNZEIT_NACH_WEITERBILDUNG as LW } from '../../../explain/content/muster/p-wert';
import { baseSurvey } from '../../../explain/sample';
import { count, num } from '../../../explain/format';
import { AreaUnder, Axis, Curve, forCard, forSentence, linear, MarkLine, useWidth, type Picture } from './kit';

/** Dichte der t-Verteilung mit df Freiheitsgraden (für sehr viele Freiheitsgrade praktisch die Normalverteilung). */
const tDensity = (t: number, df: number) => df > 1e5 ? Math.exp(-t * t / 2) / Math.sqrt(2 * Math.PI)
  : Math.exp(lgamma((df + 1) / 2) - lgamma(df / 2) - 0.5 * Math.log(df * Math.PI) - (df + 1) / 2 * Math.log1p(t * t / df));
/** Gleichmäßige Ticks: Schritt 1, 2, 5, 10 … so, dass höchstens etwa sieben Ticks entstehen. */
const ticksFor = (lim: number) => { const step = [1, 2, 5, 10, 20, 50, 100].find(s => lim * 2 / s <= 7) ?? 200; const out: number[] = []; for (let v = -Math.floor(lim / step) * step; v <= lim + 1e-9; v += step) out.push(v); return out; };

/**
 * Zahlenstrahl der Schlafdauer: der Mittelwert der 200, der Bereich der Vergleichswerte, die der Test bei α = 0,05
 * nicht verwirft (95-%-Konfidenzintervall), und der gewählte Vergleichswert μ₀ des Reglers.
 */
function Hypothese({ mu0 }: { mu0: number }) {
  const [box, W] = useWidth();
  const x = linear([6.7, 7.5], [24, W - 24]), base = 128, keep = schlafP(mu0) > 0.05;
  const at = Math.min(W - 44, Math.max(44, x(mu0)));
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={186} viewBox={`0 0 ${W} 186`} role="img"
        aria-label={`Zahlenstrahl der Schlafdauer von 6,7 bis 7,5 Stunden. Der Mittelwert der 200 Befragten liegt bei ${num(SCHLAF.mean)} Stunden. Vergleichswerte von ${num(SCHLAF.lo)} bis ${num(SCHLAF.hi)} Stunden verwirft der Test bei α = 0,05 nicht. Gewählt ist μ₀ = ${num(mu0)} Stunden; ${keep ? 'dieser Wert liegt im Bereich und wird nicht verworfen' : 'dieser Wert liegt außerhalb und wird verworfen'}.`}>
        <text className="xw-t xw-strong" x={24} y={16}>{keep ? 'μ₀ im Bereich: H₀ nicht verwerfen' : 'μ₀ außerhalb: H₀ verwerfen'}</text>
        <rect className="xw-area-pos" x={x(SCHLAF.lo)} y={50} width={x(SCHLAF.hi) - x(SCHLAF.lo)} height={base - 50} />
        <MarkLine x={x(mu0)} from={44} to={base} className={keep ? 'xw-mean' : 'xw-mean b09-reject'} />
        <text className="xw-t" x={at} y={38} textAnchor="middle">μ₀ = {num(mu0)}</text>
        <text className="xw-t b09-halo" x={(x(SCHLAF.lo) + x(SCHLAF.hi)) / 2} y={70} textAnchor="middle">nicht verworfen</text>
        <circle className="b09-dot" cx={x(SCHLAF.mean)} cy={base - 22} r={7} />
        <text className="xw-t b09-halo" x={x(SCHLAF.mean) + (mu0 > SCHLAF.mean ? -12 : 12)} y={base - 17} textAnchor={mu0 > SCHLAF.mean ? 'end' : 'start'}>x̄ = {num(SCHLAF.mean)}</text>
        <Axis scale={x} ticks={[6.8, 7, 7.2, 7.4]} at={base} from={24} to={W - 24} labelGap={20} format={v => num(v)} title="Schlafdauer in Stunden pro Nacht" />
      </svg>
    </div>
  );
}

/**
 * Lineal in Standardfehlern: Die t-Verteilung zeigt, welche Abstände ohne echten Unterschied üblich wären; der Punkt
 * markiert den Abstand des Mittelwerts zum Vergleichswert, gemessen in Standardfehlern (t).
 */
function Pruefgroesse({ s }: { s: TStats }) {
  const [box, W] = useWidth();
  const lim = Math.min(60, Math.max(4, Math.ceil(Math.abs(s.t)) + 1)), shown = Math.max(-lim, Math.min(lim, s.t));
  const x = linear([-lim, lim], [28, W - 28]), base = 150, y = linear([0, 0.42], [base, 46]);
  const f = (v: number) => tDensity(v, s.df);
  const label = `x̄: t = ${num(s.t)}${Math.abs(s.t) > lim ? ' (weiter außen)' : ''}`, wide = label.length * 7.5, dot = x(shown);
  const side = shown >= 0 ? (dot + 12 + wide <= W - 4 ? 'right' : 'left') : (dot - 12 - wide >= 4 ? 'left' : 'right');
  const lx = side === 'right' ? dot + 12 : dot - 12, crosses = side === 'right' ? lx < x(0) && lx + wide > x(0) : lx > x(0) && lx - wide < x(0);
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={206} viewBox={`0 0 ${W} 206`} role="img"
        aria-label={`Lineal in Standardfehlern. Ein Standardfehler sind ${small(s.se)} Stunden. Die Kurve zeigt die t-Verteilung mit ${s.df} Freiheitsgraden, also die Abstände, die ohne echten Unterschied üblich wären. Der Mittelwert liegt bei t = ${num(s.t)}.`}>
        <text className="xw-t xw-strong" x={28} y={16}>1 Standardfehler = {small(s.se)} h</text>
        <Curve f={f} from={-lim} to={lim} x={x} y={y} samples={160} />
        <MarkLine x={x(0)} from={46} to={base} />
        <text className="xw-t" x={x(0)} y={40} textAnchor="middle">μ₀</text>
        <line className="b09-arrow" x1={x(0)} x2={x(shown)} y1={base - 12} y2={base - 12} />
        <circle className="b09-dot" cx={x(shown)} cy={base - 12} r={7} />
        <text className="xw-t b09-halo" x={lx} y={crosses ? base - 30 : base - 7} textAnchor={side === 'right' ? 'start' : 'end'}>{label}</text>
        <Axis scale={x} ticks={ticksFor(lim)} at={base} from={28} to={W - 28} labelGap={20} title="Abstand zu μ₀ in Standardfehlern" />
      </svg>
    </div>
  );
}

/**
 * Nullverteilung durch Mischen: Säulen zählen die Unterschiede „ohne minus mit Weiterbildung“ der ersten k Mischungen
 * (Klassen zu 0,1 h); die Kurve ist die Normalverteilung mit derselben Standardabweichung; markiert ist der beobachtete
 * Unterschied in beide Richtungen.
 */
function Nullverteilung({ value }: { value: number }) {
  const [box, W] = useWidth();
  const k = mixCount(value), diffs = mischen(baseSurvey(), k), lim = 1.6, width = 0.1, bins = Math.round(2 * lim / width);
  const counts = new Array<number>(bins).fill(0);
  for (const d of diffs) { const b = Math.floor((d + lim) / width); if (b >= 0 && b < bins) counts[b]++; }
  const normalPeak = k * width / (MISCHEN.sd * Math.sqrt(2 * Math.PI)), top = Math.max(...counts, normalPeak);
  const x = linear([-lim, lim], [24, W - 24]), base = 160, y = linear([0, top], [base, 44]);
  const f = (v: number) => k * width * Math.exp(-v * v / (2 * MISCHEN.sd ** 2)) / (MISCHEN.sd * Math.sqrt(2 * Math.PI));
  const far = asFarAs(k);
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={216} viewBox={`0 0 ${W} 216`} role="img"
        aria-label={`Säulen: Unterschiede der Lernzeit nach ${count(k)}-maligem Mischen der Weiterbildungsangaben, von −1,6 bis +1,6 Stunden, gehäuft um 0. Die Kurve zeigt die Glockenform mit der Standardabweichung ${num(MISCHEN.sd)} Stunden. Markiert ist der beobachtete Unterschied von ${num(LW.diff)} Stunden in beide Richtungen; ${count(far)} der ${count(k)} Mischungen liegen mindestens so weit von 0 entfernt.`}>
        <text className="xw-t xw-strong" x={24} y={16}>{count(k)}-mal gemischt</text>
        {counts.map((c, i) => <rect key={i} className="xw-bar-plain" x={x(-lim + i * width) + 0.5} y={y(c)} width={Math.max(1, x(width) - x(0) - 1)} height={base - y(c)} />)}
        <Curve f={f} from={-lim} to={lim} x={x} y={y} />
        <MarkLine x={x(LW.diff)} from={38} to={base} className="xw-mean b09-reject" />
        <MarkLine x={x(-LW.diff)} from={38} to={base} className="xw-mean b09-reject" />
        <text className="xw-t" x={x(0)} y={34} textAnchor="middle">±{num(LW.diff)} h beobachtet</text>
        <Axis scale={x} ticks={[-1.5, -1, -0.5, 0, 0.5, 1, 1.5]} at={base} from={24} to={W - 24} labelGap={20} format={v => num(v)} title="Unterschied ohne minus mit, in Stunden" />
      </svg>
    </div>
  );
}

/** Nullverteilung t mit 175,8 Freiheitsgraden; je nach Schalter ist der linke, der rechte oder beide Ränder jenseits von t markiert. */
function Seiten({ value }: { value: number }) {
  const [box, W] = useWidth();
  const side = sideOf(value), t = LW.t, lim = 4, base = 160;
  const x = linear([-lim, lim], [28, W - 28]), y = linear([0, 0.42], [base, 50]), f = (v: number) => tDensity(v, LW.df);
  const p = [SEITEN.left, SEITEN.two, SEITEN.right][side];
  const what = ['nur der linke Rand bis t', 'beide Ränder jenseits von ±t', 'nur der rechte Rand ab t'][side];
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={214} viewBox={`0 0 ${W} 214`} role="img"
        aria-label={`t-Verteilung, wenn es keinen Unterschied gäbe. Beobachtet ist t = ${num(t)}. Markiert ist ${what}; die Fläche ist p ≈ ${num(p)}.`}>
        <text className="xw-t xw-strong" x={28} y={16}>Markierte Fläche: p ≈ {num(p)}</text>
        {side === 0 && <AreaUnder f={f} from={-lim} to={t} x={x} y={y} tone="neg" />}
        {side === 1 && <><AreaUnder f={f} from={-lim} to={-t} x={x} y={y} tone="neg" /><AreaUnder f={f} from={t} to={lim} x={x} y={y} tone="neg" /></>}
        {side === 2 && <AreaUnder f={f} from={t} to={lim} x={x} y={y} tone="neg" />}
        <Curve f={f} from={-lim} to={lim} x={x} y={y} />
        <MarkLine x={x(t)} from={44} to={base} />
        {side === 1 && <MarkLine x={x(-t)} from={44} to={base} />}
        <text className="xw-t" x={x(t) + 4} y={38} textAnchor="start">t = {side === 1 ? '±' : ''}{num(t)}</text>
        <Axis scale={x} ticks={[-4, -2, 0, 2, 4]} at={base} from={28} to={W - 28} labelGap={20} title="t, wenn es keinen Unterschied gäbe" />
      </svg>
    </div>
  );
}

/** Lineal der p-Werte von 0 bis 0,1: links von α liegt der Bereich „H₀ verwerfen“; der Punkt ist p ≈ 0,013 der Weiterbildung. */
function Alpha({ a }: { a: number }) {
  const [box, W] = useWidth();
  const x = linear([0, 0.1], [24, W - 24]), base = 120, reject = ANTEIL.p <= a;
  const at = Math.min(W - 40, Math.max(40, x(a)));
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={176} viewBox={`0 0 ${W} 176`} role="img"
        aria-label={`Lineal der p-Werte von 0 bis 0,1. Links von α = ${num(a, 3)} liegt der Bereich, in dem du H₀ verwirfst. Der p-Wert der Weiterbildung, ${small(ANTEIL.p)}, liegt ${reject ? 'darin: signifikant' : 'rechts davon: nicht signifikant'}.`}>
        <text className="xw-t xw-strong" x={24} y={16}>{reject ? 'p liegt unter α: H₀ verwerfen' : 'p liegt über α: H₀ nicht verwerfen'}</text>
        <rect className="xw-area-neg" x={x(0)} y={52} width={x(a) - x(0)} height={base - 52} />
        <MarkLine x={x(a)} from={46} to={base} className="xw-mean b09-reject" />
        <text className="xw-t" x={at} y={40} textAnchor="middle">α = {num(a, 3)}</text>
        <circle className="b09-dot" cx={x(ANTEIL.p)} cy={base - 20} r={7} />
        <text className="xw-t b09-halo" x={x(ANTEIL.p) + 12} y={base - 15}>p ≈ {small(ANTEIL.p)}</text>
        <Axis scale={x} ticks={[0, 0.02, 0.04, 0.06, 0.08, 0.1]} at={base} from={24} to={W - 24} labelGap={20} format={v => num(v)} title="p-Wert" />
      </svg>
    </div>
  );
}

/** t-Verteilung mit df Freiheitsgraden, beide Ränder jenseits von ±c markiert (je α/2), dazu t der Schlafdauer. */
function Kritisch({ s }: { s: CStats }) {
  const [box, W] = useWidth();
  const lim = Math.min(14, Math.max(4, Math.ceil(s.c + 0.5))), c = Math.min(s.c, lim), base = 160;
  const x = linear([-lim, lim], [28, W - 28]), y = linear([0, 0.42], [base, 50]), f = (v: number) => tDensity(v, s.df);
  const far = s.c > lim, tx = Math.min(lim, SCHLAF.t);
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={214} viewBox={`0 0 ${W} 214`} role="img"
        aria-label={`t-Verteilung mit ${s.df} Freiheitsgraden. Markiert sind beide Ränder jenseits von c = ±${num(s.c)}, zusammen α = ${num(s.alpha, 3)}. Der Punkt zeigt t = ${num(SCHLAF.t)} der Schlafdauer; er liegt ${SCHLAF.t >= s.c ? 'im Ablehnungsbereich' : 'zwischen den Grenzen'}.`}>
        <text className="xw-t xw-strong" x={28} y={16}>Ablehnungsbereich: |t| ≥ {num(s.c)}{far ? ' (weiter außen)' : ''}</text>
        <AreaUnder f={f} from={-lim} to={-c} x={x} y={y} tone="neg" />
        <AreaUnder f={f} from={c} to={lim} x={x} y={y} tone="neg" />
        <Curve f={f} from={-lim} to={lim} x={x} y={y} samples={200} />
        <MarkLine x={x(c)} from={44} to={base} className="xw-mean b09-reject" />
        <MarkLine x={x(-c)} from={44} to={base} className="xw-mean b09-reject" />
        <text className="xw-t" x={x(c)} y={38} textAnchor={x(c) > W - 70 ? 'end' : 'middle'}>+c</text>
        <text className="xw-t" x={x(-c)} y={38} textAnchor={x(-c) < 70 ? 'start' : 'middle'}>−c</text>
        <circle className="b09-dot" cx={x(tx)} cy={base - 10} r={6} />
        <text className="xw-t b09-halo" x={x(tx)} y={base - 22} textAnchor="middle">t = {num(SCHLAF.t)}</text>
        <Axis scale={x} ticks={ticksFor(lim)} at={base} from={28} to={W - 28} labelGap={20} title="t, wenn es keinen Unterschied gäbe" />
      </svg>
    </div>
  );
}

export const pictures: Record<string, Picture> = {
  'b09-kritisch': forSentence(p => <Kritisch s={p.s as CStats} />),
  'b09-alpha': forCard(p => <Alpha a={p.value ?? 0.05} />),
  'b09-seiten': forCard(p => <Seiten value={p.value ?? 1} />),
  'b09-nullverteilung': forCard(p => <Nullverteilung value={p.value ?? 200} />),
  'b09-pruefgroesse': forSentence(p => <Pruefgroesse s={p.s as TStats} />),
  'b09-hypothese': forCard(p => <Hypothese mu0={p.value ?? MU0} />),
};
