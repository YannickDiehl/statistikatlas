// Bilder der Muster: die t-Verteilung zur Begriffskarte p-Wert (Vorbild für Bilder in Begriffskarten).
import { LERNZEIT_NACH_WEITERBILDUNG as L, pFor } from '../../../explain/content/muster/p-wert';
import { num } from '../../../explain/format';
import { lgamma } from '../../../tasks/kit/dist';
import { AreaUnder, Axis, Curve, forCard, linear, MarkLine, useWidth, type Picture } from './kit';

/** Dichte der t-Verteilung mit df Freiheitsgraden. */
const tDensity = (t: number, df: number) => Math.exp(lgamma((df + 1) / 2) - lgamma(df / 2) - 0.5 * Math.log(df * Math.PI) - (df + 1) / 2 * Math.log1p(t * t / df));

/** p als Text wie in der Begriffskarte: zwei Nachkommastellen, sehr kleine Werte als „p < 0,001“. */
const pText = (p: number) => p >= 0.01 ? `p ≈ ${num(p)}` : p >= 0.001 ? 'p < 0,01' : 'p < 0,001';

/**
 * t-Verteilung, wenn es keinen Unterschied gäbe. Markiert sind beide Ränder jenseits des t, das zum Unterschied
 * am Regler gehört; ihre Fläche zusammen ist der p-Wert.
 */
function TTails({ diff }: { diff: number }) {
  const [box, W] = useWidth();
  const lim = 4.5, t = diff / L.se, cut = Math.min(t, lim), p = pFor(diff), base = 168, top = 36;
  const x = linear([-lim, lim], [28, W - 28]), y = linear([0, 0.42], [base, top]);
  const f = (v: number) => tDensity(v, L.df);
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={222} viewBox={`0 0 ${W} 222`} role="img"
        aria-label={`t-Verteilung, wenn es keinen Unterschied gäbe. Markiert sind beide Ränder jenseits von t = ${num(t)} in jeder Richtung; zusammen ergeben sie ${pText(p)}.`}>
        <AreaUnder f={f} from={-lim} to={-cut} x={x} y={y} tone="neg" />
        <AreaUnder f={f} from={cut} to={lim} x={x} y={y} tone="neg" />
        <Curve f={f} from={-lim} to={lim} x={x} y={y} />
        <MarkLine x={x(cut)} from={top} to={base} label={t <= lim ? `t = ±${num(t)}` : `t = ±${num(t)} (weiter rechts)`} />
        <MarkLine x={x(-cut)} from={top} to={base} />
        <Axis scale={x} ticks={[-4, -2, 0, 2, 4]} at={base} from={28} to={W - 28} labelGap={22} title="t, wenn es keinen Unterschied gäbe" />
        <text className="xw-t xw-strong" x={28} y={14}>Markierte Fläche: {pText(p)}</text>
      </svg>
    </div>
  );
}

export const pictures: Record<string, Picture> = {
  'muster-p-wert': forCard(p => <TTails diff={p.value ?? L.diff} />),
};
