// Bilder des Bereichs B6 „Wahrscheinlichkeit“ für alle Vorlagen. Schlüssel = `picture` der Erklärung, Bausteine und
// `forWorkshop`/`forCard`/`forSentence`/`forTable` aus ./kit.tsx.
// Eigene Stile in src/explain/areas/b06-wahrscheinlichkeit.css (lädt main.tsx automatisch). Anleitung: src/explain/AUTHORING.md.
import { useMemo } from 'react';
import { num } from '../../../explain/format';
import { baseSurvey, sampleColumn } from '../../../explain/sample';
import { SCHLAF, dnorm, sleepMu } from '../../../explain/content/b06-wahrscheinlichkeit/gemeinsam';
import { Axis, Bar, Curve, forCard, linear, useWidth, type Picture } from './kit';

/** Schlafdauer der 200 Befragten in Klassen von einer halben Stunde, als Dichte (Anteil je Stunde). */
function useSleepBins() {
  return useMemo(() => {
    const xs = sampleColumn(baseSurvey(), 'schlafdauer'), n = xs.length;
    return Array.from({ length: 10 }, (_, k) => {
      const from = 5 + k * 0.5, to = from + 0.5;
      const count = xs.filter(v => v >= from - 1e-9 && v < to - 1e-9).length;
      return { from, to, count, density: count / n / 0.5 };
    });
  }, []);
}

/** Theoretische Verteilung: Histogramm der beobachteten Schlafdauer und darüber die Kurve des Normalmodells mit Mitte μ. */
function Modell({ mu }: { mu: number }) {
  const [box, W] = useWidth();
  const bins = useSleepBins(), base = 196, top = 48, left = 40, right = W - 16;
  const x = linear([4.5, 10], [left, right]), y = linear([0, 0.56], [base, top]);
  const f = (v: number) => dnorm(v, mu, SCHLAF.sd);
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={254} viewBox={`0 0 ${W} 254`} role="img"
        aria-label={`Balken: Schlafdauer der 200 Befragten in Klassen von einer halben Stunde. Kurve: Normalmodell mit μ = ${num(mu)} Stunden und σ = ${num(SCHLAF.sd)} Stunden.`}>
        {bins.map(b => <Bar key={b.from} x={x(b.from) + 1} y={y(b.density)} width={x(b.to) - x(b.from) - 2} height={base - y(b.density)} tone="plain" />)}
        <Curve f={f} from={4.5} to={10} x={x} y={y} />
        <Axis scale={x} ticks={[5, 6, 7, 8, 9, 10]} at={base} from={left} to={right} labelGap={22} title="Schlafdauer pro Nacht in Stunden" />
        <text className="xw-t" x={left} y={16}>Balken: die Daten der 200</text>
        <text className="xw-t" x={left} y={34}>Kurve: Modell mit μ = {num(mu)} h</text>
      </svg>
    </div>
  );
}

export const pictures: Record<string, Picture> = {
  'b06-modell': forCard(p => <Modell mu={sleepMu(p.value ?? SCHLAF.mean)} />),
};
