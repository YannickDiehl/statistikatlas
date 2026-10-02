// Bilder des Bereichs B9 „Testlogik“ für alle Vorlagen. Schlüssel = `picture` der Erklärung, Bausteine und
// `forWorkshop`/`forCard`/`forSentence`/`forTable` aus ./kit.tsx.
// Eigene Stile in src/explain/areas/b09-testlogik.css (lädt main.tsx automatisch). Anleitung: src/explain/AUTHORING.md.
import { num } from '../../../explain/format';
import { MU0, SCHLAF, schlafP } from '../../../explain/content/b09-testlogik/rechnen';
import { Axis, forCard, linear, MarkLine, useWidth, type Picture } from './kit';

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

export const pictures: Record<string, Picture> = {
  'b09-hypothese': forCard(p => <Hypothese mu0={p.value ?? MU0} />),
};
