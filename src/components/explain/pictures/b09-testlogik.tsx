// Bilder des Bereichs B9 „Testlogik“ für alle Vorlagen. Schlüssel = `picture` der Erklärung, Bausteine und
// `forWorkshop`/`forCard`/`forSentence`/`forTable` aus ./kit.tsx.
// Eigene Stile in src/explain/areas/b09-testlogik.css (lädt main.tsx automatisch). Anleitung: src/explain/AUTHORING.md.
import { num } from '../../../explain/format';
import { lgamma } from '../../../tasks/kit/dist';
import { MU0, SCHLAF, schlafP, small } from '../../../explain/content/b09-testlogik/rechnen';
import type { TStats } from '../../../explain/content/b09-testlogik/pruefgroesse';
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

export const pictures: Record<string, Picture> = {
  'b09-pruefgroesse': forSentence(p => <Pruefgroesse s={p.s as TStats} />),
  'b09-hypothese': forCard(p => <Hypothese mu0={p.value ?? MU0} />),
};
