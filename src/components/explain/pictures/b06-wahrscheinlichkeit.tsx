// Bilder des Bereichs B6 „Wahrscheinlichkeit“ für alle Vorlagen. Schlüssel = `picture` der Erklärung, Bausteine und
// `forWorkshop`/`forCard`/`forSentence`/`forTable` aus ./kit.tsx.
// Eigene Stile in src/explain/areas/b06-wahrscheinlichkeit.css (lädt main.tsx automatisch). Anleitung: src/explain/AUTHORING.md.
import { useMemo } from 'react';
import { num, pct, signed } from '../../../explain/format';
import { baseSurvey, sampleColumn } from '../../../explain/sample';
import { HAUSHALT, SCHLAF, dnorm, schlafModell, sleepMu } from '../../../explain/content/b06-wahrscheinlichkeit/gemeinsam';
import { massOf, massUpTo } from '../../../explain/content/b06-wahrscheinlichkeit/probability_mass';
import { areaAround7 } from '../../../explain/content/b06-wahrscheinlichkeit/density_function';
import { AreaUnder, Axis, Bar, clamp, Curve, DragPoint, forCard, forWorkshop, keyStep, linear, MarkLine, useDrag, useWidth, type Bounds, type Picture } from './kit';
import type { Erw } from '../../../explain/content/b06-wahrscheinlichkeit/erwartung';

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

const sleepDensity = (v: number) => dnorm(v, SCHLAF.mean, SCHLAF.sd);

/** Dichte der Schlafdauer im Normalmodell, Fläche über dem Bereich 7 ± h markiert, Höhe bei 7 Stunden als Strich. */
function Dichte({ h }: { h: number }) {
  const [box, W] = useWidth();
  const base = 196, top = 48, left = 40, right = W - 16, lo = 4.5, hi = 9.7;
  const x = linear([lo, hi], [left, right]), y = linear([0, 0.56], [base, top]);
  const area = areaAround7(h);
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={254} viewBox={`0 0 ${W} 254`} role="img"
        aria-label={`Dichte des Normalmodells der Schlafdauer. Markiert ist die Fläche zwischen ${num(7 - h)} und ${num(7 + h)} Stunden, ${pct(area)}. Die Kurve ist bei 7 Stunden ${num(sleepDensity(7))} hoch.`}>
        <AreaUnder f={sleepDensity} from={Math.max(lo, 7 - h)} to={Math.min(hi, 7 + h)} x={x} y={y} tone="pos" />
        <Curve f={sleepDensity} from={lo} to={hi} x={x} y={y} />
        <MarkLine x={x(7)} from={y(sleepDensity(7))} to={base} />
        <Axis scale={x} ticks={[5, 6, 7, 8, 9]} at={base} from={left} to={right} labelGap={22} title="Schlafdauer pro Nacht in Stunden" />
        <text className="xw-t xw-strong" x={left} y={16}>Fläche {num(7 - h)} bis {num(7 + h)} h: {pct(area)}</text>
        <text className="xw-t" x={left} y={34}>Höhe bei 7 h: {num(sleepDensity(7))} pro Stunde</text>
      </svg>
    </div>
  );
}

/**
 * Kumulierte Wahrscheinlichkeit: oben die Dichte mit der Fläche links von x, unten die Verteilungsfunktion F mit dem
 * Punkt (x, F(x)). Beide Teile teilen sich die Achse der Schlafdauer; die Fläche oben ist die Höhe unten.
 */
function Kumuliert({ cut }: { cut: number }) {
  const [box, W] = useWidth();
  const left = 44, right = W - 16, lo = 4.5, hi = 9.7, F = schlafModell.F(cut);
  const x = linear([lo, hi], [left, right]);
  const yd = linear([0, 0.52], [150, 44]), yF = linear([0, 1], [300, 196]);
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={358} viewBox={`0 0 ${W} 358`} role="img"
        aria-label={`Oben die Dichte der Schlafdauer im Normalmodell, die Fläche bis ${num(cut)} Stunden markiert. Unten die Verteilungsfunktion F; bei ${num(cut)} Stunden ist F gleich ${pct(F)}.`}>
        <text className="xw-t xw-strong" x={left} y={16}>F({num(cut)}) = Fläche links ≈ {pct(F)}</text>
        <AreaUnder f={sleepDensity} from={lo} to={Math.min(hi, cut)} x={x} y={yd} tone="pos" />
        <Curve f={sleepDensity} from={lo} to={hi} x={x} y={yd} />
        <line className="xw-axis" x1={left} x2={right} y1={150} y2={150} />
        <text className="xw-t" x={left} y={176}>Dichte f</text>
        <Curve f={schlafModell.F} from={lo} to={hi} x={x} y={yF} />
        <MarkLine y={yF(F)} from={left} to={x(cut)} />
        <MarkLine x={x(cut)} from={yd(sleepDensity(cut))} to={300} />
        <circle className="xw-s-dot" cx={x(cut)} cy={yF(F)} r={5} />
        <Axis scale={yF} ticks={[0, 0.5, 1]} at={left} from={300} to={196} orient="left" labelGap={24} format={v => num(v)} />
        <Axis scale={x} ticks={[5, 6, 7, 8, 9]} at={300} from={left} to={right} labelGap={22} title="Schlafdauer pro Nacht in Stunden" />
        <text className="xw-t" x={right} y={yF(0.12)} textAnchor="end">Verteilungsfunktion F</text>
      </svg>
    </div>
  );
}

/** Theoretisches Quantil: Dichte der Schlafdauer, Fläche p links der Grenze qₚ markiert. */
function Quantil({ p }: { p: number }) {
  const [box, W] = useWidth();
  const base = 196, top = 48, left = 40, right = W - 16, lo = 4.5, hi = 9.7, q = schlafModell.q(p);
  const x = linear([lo, hi], [left, right]), y = linear([0, 0.56], [base, top]), at = Math.max(lo, Math.min(hi, q));
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={254} viewBox={`0 0 ${W} 254`} role="img"
        aria-label={`Dichte des Normalmodells der Schlafdauer. Links der Grenze ${num(q)} Stunden liegt die Fläche ${pct(p, 0)}: das ${num(p * 100, 0)}-%-Quantil.`}>
        <AreaUnder f={sleepDensity} from={lo} to={at} x={x} y={y} tone="pos" />
        <Curve f={sleepDensity} from={lo} to={hi} x={x} y={y} />
        <MarkLine x={x(at)} from={top} to={base} />
        <Axis scale={x} ticks={[5, 6, 7, 8, 9]} at={base} from={left} to={right} labelGap={22} title="Schlafdauer pro Nacht in Stunden" />
        <text className="xw-t xw-strong" x={left} y={16}>Grenze q = {num(q)} h</text>
        <text className="xw-t" x={left} y={34}>Fläche links davon: {pct(p, 0)}</text>
      </svg>
    </div>
  );
}

/**
 * Werkstatt Erwartung: eine Zeile je Person mit ziehbarem Punkt (Haushaltsgröße). Ab Schritt 2 die Linie μ, ab
 * Schritt 3 die Abstände zu μ, ab Schritt 4 rechts das Quadrat jedes Abstands, in Schritt 5 σ² darüber.
 */
function ErwartungLine({ values, s, step, who, names, bounds, onChange, onWho }: {
  values: number[]; s: Erw; step: number; who: number; names: readonly string[]; bounds: Bounds;
  onChange: (v: number[]) => void; onWho: (i: number) => void;
}) {
  const [box, W] = useWidth();
  const squares = step >= 4, left = 44, right = W - (squares ? 70 : 26), X = linear([bounds.min, bounds.max], [left, right]), Y = (i: number) => 40 + i * 28, AXIS = 186;
  const set = (i: number, v: number) => { if (v !== values[i]) onChange(values.map((x, k) => k === i ? v : x)); };
  const { svg, start, handlers } = useDrag((i, p) => set(i, clamp(X.invert(p.x), bounds)));
  const m = s.mu;
  return (
    <div ref={box}>
      <svg ref={svg} className="xw-svg xw-drag" width={W} height={240} viewBox={`0 0 ${W} 240`} role="group" aria-label="Haushaltsgrößen der fünf Beispielpersonen; jede wird mit der Chance 0,2 gezogen" {...handlers}>
        <text className="xw-t" x={10} y={14}>{step >= 5 ? `σ² = ${num(s.ss)} · 0,2 = ${num(s.sigma2)}` : step >= 2 ? `μ = ${num(m)}` : 'Chance je Person: 0,2'}</text>
        {squares && <text className="xw-t" x={W - 8} y={14} textAnchor="end">Quadrat</text>}
        {values.map((_, i) => <g key={`row${i}`}>
          <line className="xw-guide" x1={left - 10} x2={right + 10} y1={Y(i)} y2={Y(i)} />
          <text className="xw-t" x={10} y={Y(i) + 4}>{names[i]}</text>
          {squares && <text className="xw-t" x={W - 8} y={Y(i) + 4} textAnchor="end">{num(s.sq[i])}</text>}
        </g>)}
        {step >= 2 && <line className="xw-mean" x1={X(m)} x2={X(m)} y1={24} y2={AXIS} />}
        {step >= 3 && s.dev.map((d, i) => Math.abs(d) > 1e-9 && <g key={`dev${i}`}>
          <line className={d > 0 ? 'xw-pos' : 'xw-neg'} strokeWidth={i === who ? 4.5 : 3} x1={X(m)} x2={X(values[i])} y1={Y(i)} y2={Y(i)} />
          {Math.abs(X(values[i]) - X(m)) >= 48
            ? <text className="xw-t" x={(X(m) + X(values[i])) / 2} y={Y(i) - 6} textAnchor="middle">{signed(d)}</text>
            : <text className="xw-t" x={X(m) + (d > 0 ? -6 : 6)} y={Y(i) + 4} textAnchor={d > 0 ? 'end' : 'start'}>{signed(d)}</text>}
        </g>)}
        <Axis scale={X} ticks={Array.from({ length: bounds.max - bounds.min + 1 }, (_, k) => bounds.min + k)} at={AXIS} from={left} to={right} labelGap={24} title="Personen im Haushalt" />
        {values.map((v, i) => (
          <DragPoint key={`dot${i}`} x={X(v)} y={Y(i)} label={`Person ${names[i]}, Haushaltsgröße`} selected={i === who} valueNow={v} bounds={bounds}
            onPointerDown={e => { onWho(i); start(i, e); }}
            onKeyDown={e => {
              const next = keyStep(e, v, bounds);
              if (next !== null) { e.preventDefault(); onWho(i); set(i, next); }
            }}>{v}</DragPoint>
        ))}
      </svg>
    </div>
  );
}

export const pictures: Record<string, Picture> = {
  'b06-erwartung': forWorkshop(p => <ErwartungLine values={p.data} s={p.s} step={p.step} who={p.who} names={p.workshop.names} bounds={p.workshop.bounds} onChange={p.setData} onWho={p.pickWho} />),
  'b06-quantil': forCard(p => <Quantil p={p.value ?? 0.1} />),
  'b06-kumuliert': forCard(p => <Kumuliert cut={p.value ?? 6} />),
  'b06-dichte': forCard(p => <Dichte h={p.value ?? 0.5} />),
  'b06-masse': forCard(p => <Masse k={p.value ?? 2} />),
  'b06-modell': forCard(p => <Modell mu={sleepMu(p.value ?? SCHLAF.mean)} />),
};
