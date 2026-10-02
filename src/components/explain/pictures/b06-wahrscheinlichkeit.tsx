// Bilder des Bereichs B6 „Wahrscheinlichkeit“ für alle Vorlagen. Schlüssel = `picture` der Erklärung, Bausteine und
// `forWorkshop`/`forCard`/`forSentence`/`forTable` aus ./kit.tsx.
// Eigene Stile in src/explain/areas/b06-wahrscheinlichkeit.css (lädt main.tsx automatisch). Anleitung: src/explain/AUTHORING.md.
import { useMemo } from 'react';
import { num, pct } from '../../../explain/format';
import { baseSurvey, sampleColumn } from '../../../explain/sample';
import { HAUSHALT, SCHLAF, dnorm, sleepMu } from '../../../explain/content/b06-wahrscheinlichkeit/gemeinsam';
import { massOf, massUpTo } from '../../../explain/content/b06-wahrscheinlichkeit/probability_mass';
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

/** Wahrscheinlichkeitsmasse der Haushaltsgröße: ein Balken je Wert, die Balken bis k grün hervorgehoben. */
function Masse({ k }: { k: number }) {
  const [box, W] = useWidth();
  const base = 186, top = 44, left = 44, right = W - 16;
  const x = linear([0.4, 5.6], [left, right]), y = linear([0, 0.3], [base, top]), half = Math.min(28, (right - left) / 5 / 2 - 6);
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={244} viewBox={`0 0 ${W} 244`} role="img"
        aria-label={`Wahrscheinlichkeitsmasse der Haushaltsgröße: ${HAUSHALT.values.map(v => `p(${v}) = ${pct(massOf(v))}`).join(', ')}. Hervorgehoben sind die Werte bis ${k}, zusammen ${pct(massUpTo(k))}.`}>
        {HAUSHALT.values.map(v => <g key={v}>
          <Bar x={x(v) - half} y={y(massOf(v))} width={2 * half} height={base - y(massOf(v))} tone={v <= k ? 'pos' : 'plain'} selected={v === k} />
          <text className="xw-t" x={x(v)} y={y(massOf(v)) - 6} textAnchor="middle">{num(massOf(v) * 100, 1)}</text>
        </g>)}
        <Axis scale={x} ticks={[...HAUSHALT.values]} at={base} from={left} to={right} labelGap={22} title="Personen im Haushalt" />
        <text className="xw-t" x={left} y={16}>Balkenhöhe: Wahrscheinlichkeit in %</text>
        <text className="xw-t xw-strong" x={left} y={34}>P(X ≤ {k}) = {pct(massUpTo(k))}</text>
      </svg>
    </div>
  );
}

export const pictures: Record<string, Picture> = {
  'b06-masse': forCard(p => <Masse k={p.value ?? 2} />),
  'b06-modell': forCard(p => <Modell mu={sleepMu(p.value ?? SCHLAF.mean)} />),
};
