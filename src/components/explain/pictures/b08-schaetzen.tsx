// Bilder des Bereichs B8 „Stichprobe und Schätzen“ für alle Vorlagen. Schlüssel = `picture` der Erklärung, Bausteine und
// `forWorkshop`/`forCard`/`forSentence`/`forTable` aus ./kit.tsx.
// Eigene Stile in src/explain/areas/b08-schaetzen.css (lädt main.tsx automatisch). Anleitung: src/explain/AUTHORING.md.
import { count, fixed, num, pct } from '../../../explain/format';
import { VERTRAUEN } from '../../../explain/content/b08-schaetzen/daten';
import type { KiStats } from '../../../explain/content/b08-schaetzen/confidence';
import { GERADE, type PiStats } from '../../../explain/content/b08-schaetzen/prediction-interval';
import { baseSurvey } from '../../../explain/sample';
import { HAUSHALT_KENNWERTE, binomial, haushaltMittel, middle95, stufe } from '../../../explain/content/b08-schaetzen/daten';
import { GLOCKE_N, schiefeMittel } from '../../../explain/content/b08-schaetzen/central-limit';
import { ANTEIL_N, WEITERBILDUNG } from '../../../explain/content/b08-schaetzen/sampling-distribution';
import { GESETZ_N, daneben, wieOft } from '../../../explain/content/b08-schaetzen/law-large-numbers';
import { PLANUNG, VERZERRUNG_N, bereiche } from '../../../explain/content/b08-schaetzen/sampling-bias';
import { Axis, Curve, forCard, forSentence, linear, MarkLine, useWidth, type Picture } from './kit';
import { niceTicks } from './sample';

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
  const left = 26, right = W - 28, top = 46, base = 176, H = 236;
  const X = linear(domain, [left, right]);
  const maxP = Math.max(...bars.map(b => b.p)), Y = linear([0, maxP * 1.08], [base, top]);
  // Breite Balken mit Rand und 1 Pixel Abstand; schmale (unter 4 Pixel) nur als Fläche, mindestens 1 Pixel breit.
  const px = X(domain[0] + step) - X(domain[0]), wide = px >= 4, w = Math.max(1, wide ? px - 1 : px);
  const shown = bars.filter(b => b.p >= maxP * 1e-3 && b.x >= domain[0] - 1e-9 && b.x <= domain[1] + 1e-9);
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
        <text className="xw-t" x={left} y={16}>{legend}</text>
        {band && <rect className="xw-band" x={X(band[0])} y={top - 8} width={Math.max(1, X(band[1]) - X(band[0]))} height={base - top + 8} />}
        {shown.map(b => <rect key={b.x} className={wide ? `xw-bar-${b.tone}` : `xw-area-${b.tone}`} x={X(b.x) - w / 2} y={Y(b.p)} width={w} height={Math.max(0.5, base - Y(b.p))} />)}
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
    title={`Anteil mit Weiterbildung bei ${count(n)} Gezogenen`}
    label={`Stichprobenverteilung des Anteils mit Weiterbildung bei ${count(n)} Gezogenen: Mitte bei ${pct(WEITERBILDUNG.pi)}, in etwa ${Math.round(m.prob * 100)} von 100 Stichproben liegt der Anteil zwischen ${pct(m.lo)} und ${pct(m.hi)}.`} />;
}

/** Wie oft der Anteil mehr als 5 Prozentpunkte neben 41 % liegt: Balken außerhalb des Bands braunrot, innerhalb grün. */
function GesetzVerteilung({ n }: { n: number }) {
  const pmf = binomial(n, WEITERBILDUNG.pi), N = WEITERBILDUNG.N, ones = WEITERBILDUNG.ja;
  const bars = pmf.map((p, k): Balken => ({ x: k / n, p, tone: Math.abs(N * k - ones * n) * 20 > N * n ? 'neg' : 'pos' }));
  const often = wieOft(daneben(n));
  return <Verteilung bars={bars} step={1 / n} domain={[0, 1]} ticks={[0, 0.2, 0.4, 0.6, 0.8, 1]} format={prozent}
    band={[WEITERBILDUNG.pi - 0.05, WEITERBILDUNG.pi + 0.05]} marks={[{ x: WEITERBILDUNG.pi, label: `π = ${pct(WEITERBILDUNG.pi)}` }]}
    legend="Hinterlegt: höchstens 5 Prozentpunkte daneben"
    title={`Anteil mit Weiterbildung bei ${count(n)} Gezogenen`}
    label={`Stichprobenverteilung des Anteils bei ${count(n)} Gezogenen. Hinterlegt ist der Bereich von 36 % bis 46 %; ${often} liegt der Anteil außerhalb.`} />;
}

/**
 * Exakte Verteilung der mittleren Haushaltsgröße von n Befragten (ALLBUS 2023, ungewichtet) mit der Glockenkurve
 * gleicher Mitte und Streuung. Der Ausschnitt folgt den sichtbaren Balken, damit die Form bei jedem n zu sehen ist.
 */
function GlockeVerteilung({ n }: { n: number }) {
  const { sums, probs } = haushaltMittel(n), H = HAUSHALT_KENNWERTE, sd = H.sigma / Math.sqrt(n), step = 1 / n;
  const maxP = Math.max(...probs), seen = sums.filter((_, i) => probs[i] >= maxP * 1e-3).map(s => s / n);
  const domain: [number, number] = [Math.max(0.5, Math.min(...seen) - step), Math.max(...seen) + step];
  const bars = sums.map((s, i): Balken => ({ x: s / n, p: probs[i], tone: 'plain' }));
  const bell = (v: number) => step * Math.exp(-0.5 * ((v - H.mu) / sd) ** 2) / (sd * Math.sqrt(2 * Math.PI));
  return <Verteilung bars={bars} step={step} domain={domain} ticks={niceTicks(domain[0], domain[1], 5)} format={v => num(v)}
    curve={bell} marks={[{ x: H.mu, label: `μ = ${num(H.mu)}` }]}
    legend="Linie: Glockenkurve mit gleicher Mitte und Streuung"
    title={n === 1 ? 'Haushaltsgröße einer Person' : `mittlere Haushaltsgröße von ${n} Befragten`}
    label={`Exakte Verteilung ${n === 1 ? 'der Haushaltsgröße' : `der mittleren Haushaltsgröße von ${n} Befragten`} im ALLBUS 2023 mit Glockenkurve. Schiefe ${num(schiefeMittel(n))}${n === 1 ? ': rechts ein langer Ausläufer.' : '.'}`} />;
}

/**
 * Verzerrung gegen Zufallsfehler: Bereiche, in denen etwa 95 von 100 Umfragen mit n Antworten landen, für eine
 * Zufallsstichprobe (um den wahren Wert) und die Online-Umfrage der Planenden (um 8,67 h). Beide schrumpfen mit n,
 * nur einer bleibt um den wahren Wert.
 */
function VerzerrungBild({ n }: { n: number }) {
  const [box, W] = useWidth();
  const b = bereiche(n), left = 26, right = W - 28, base = 186, H = 246;
  const X = linear([5, 11.5], [left, right]);
  const row = (y: number, name: string, [lo, hi]: [number, number], mid: number, tone: 'pos' | 'neg') => (
    <g>
      <text className="xw-t xw-halo" x={left} y={y - 8}>{name}</text>
      <rect className={`xw-bar-${tone}`} x={X(lo)} y={y} width={Math.max(2, X(hi) - X(lo))} height={22} />
      <line className="xw-axis" x1={X(mid)} x2={X(mid)} y1={y - 3} y2={y + 25} strokeWidth={2} />
    </g>
  );
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={`Bei ${count(n)} Antworten landet eine Zufallsstichprobe in etwa 95 von 100 Fällen zwischen ${num(b.zufall[0])} und ${num(b.zufall[1])} Stunden, die Online-Umfrage zwischen ${num(b.online[0])} und ${num(b.online[1])} Stunden. Der wahre Wert ist ${num(PLANUNG.alle)} Stunden.`}>
        <text className="xw-t" x={left} y={16}>Wo etwa 95 von 100 Umfragen landen</text>
        <MarkLine x={X(PLANUNG.alle)} from={36} to={base} />
        {row(64, 'Zufallsstichprobe', b.zufall, PLANUNG.alle, 'pos')}
        {row(132, 'Online-Umfrage der Planenden', b.online, PLANUNG.teil, 'neg')}
        <text className="xw-t xw-strong xw-halo" x={X(PLANUNG.alle) + 6} y={base - 6}>wahrer Wert {num(PLANUNG.alle)} h</text>
        <Axis scale={X} ticks={[5, 6, 7, 8, 9, 10, 11]} at={base} from={left} to={right} format={v => num(v)} labelGap={20} title="mittlere Lernzeit in Stunden" />
      </svg>
    </div>
  );
}

/**
 * Konfidenzintervall auf der Skala des Vertrauens (1 bis 7) unter dem Bereich, in dem grob die einzelnen Antworten
 * liegen (x̄ ± s): Das Intervall gehört zum Mittelwert, nicht zu den einzelnen Menschen.
 */
function IntervallBild({ s }: { s: KiStats }) {
  const [box, W] = useWidth();
  const left = 26, right = W - 28, base = 196, H = 252;
  const X = linear([1, 7], [left, right]), mid = X(VERTRAUEN.mean);
  const clip = (v: number) => Math.min(7, Math.max(1, v));
  const x0 = X(clip(s.lo)), x1 = X(clip(s.hi)), apart = x1 - x0 > 110;
  const yA = 62, yK = 138;
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={`Einzelne Antworten liegen grob zwischen ${num(clip(VERTRAUEN.mean - s.s))} und ${num(clip(VERTRAUEN.mean + s.s))}. Das ${num(s.t)}-%-Konfidenzintervall für den Mittelwert reicht von ${fixed(s.lo)} bis ${fixed(s.hi)}.`}>
        <MarkLine x={mid} from={yA - 4} to={base} />
        <text className="xw-t xw-halo" x={left} y={yA - 12}>Einzelne Antworten, grob x̄ ± s</text>
        <rect className="xw-bar-plain" x={X(clip(VERTRAUEN.mean - s.s))} y={yA} width={Math.max(2, X(clip(VERTRAUEN.mean + s.s)) - X(clip(VERTRAUEN.mean - s.s)))} height={18} />
        <text className="xw-t xw-halo" x={left} y={yK - 34}>{num(s.t)}-%-Konfidenzintervall, {count(s.n)} Befragte</text>
        <line className="xw-pos" strokeWidth={3} x1={x0} x2={x1} y1={yK} y2={yK} />
        <line className="xw-pos" strokeWidth={3} x1={x0} x2={x0} y1={yK - 11} y2={yK + 11} />
        <line className="xw-pos" strokeWidth={3} x1={x1} x2={x1} y1={yK - 11} y2={yK + 11} />
        {apart
          ? <><text className="xw-t xw-halo" x={x0} y={yK - 16} textAnchor="middle">{fixed(s.lo)}</text><text className="xw-t xw-halo" x={x1} y={yK - 16} textAnchor="middle">{fixed(s.hi)}</text></>
          : <text className="xw-t xw-halo" x={Math.min(right - 60, Math.max(left + 60, mid))} y={yK - 16} textAnchor="middle">{fixed(s.lo)} bis {fixed(s.hi)}</text>}
        <text className="xw-t xw-strong xw-halo" x={Math.min(right - 30, Math.max(left + 30, mid))} y={yK + 32} textAnchor="middle">x̄ = {num(VERTRAUEN.mean)}</text>
        <Axis scale={X} ticks={[1, 2, 3, 4, 5, 6, 7]} at={base} from={left} to={right} labelGap={20} title="Vertrauen in den Bundestag, 1 bis 7" />
      </svg>
    </div>
  );
}

/**
 * Die 200 Befragten (Lernzeit, Wissenstest) mit der Geraden und an der Stelle x₀ beiden Intervallen: breit das
 * Vorhersageintervall für eine neue Person, schmal das Konfidenzintervall für den Mittelwert.
 */
function VorhersageBild({ s }: { s: PiStats }) {
  const [box, W] = useWidth();
  const rows = baseSurvey(), left = 44, right = W - 20, top = 64, bottom = 266, H = 320;
  const X = linear([0, 19], [left, right]), Y = linear([0, 22], [bottom, top]);
  const cy = (v: number) => Y(Math.max(0, Math.min(22, v))), x0 = X(s.x);
  const label = (y: number, text: string) => <text className="xw-t xw-halo" x={x0 > (left + right) / 2 ? x0 - 12 : x0 + 12} y={y} textAnchor={x0 > (left + right) / 2 ? 'end' : 'start'}>{text}</text>;
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={`Streudiagramm der 200 Befragten mit der Geraden. Bei ${num(s.x)} Stunden reicht das Vorhersageintervall von ${fixed(s.lo)} bis ${fixed(s.hi)} Aufgaben, das Konfidenzintervall für den Mittelwert von ${fixed(s.ciLo)} bis ${fixed(s.ciHi)}.`}>
        <text className="xw-t" x={left - 30} y={16}>Lange Klammer: eine neue Person</text>
        <text className="xw-t" x={left - 30} y={36}>Kurzer Balken: ihr Mittelwert</text>
        {rows.map(r => <circle key={r.id} className="xw-s-dot" cx={X(r.values.lernzeit)} cy={Y(r.values.wissenstest)} r={2.4} />)}
        <line className="xw-curve" x1={X(0)} y1={Y(GERADE.a)} x2={X(19)} y2={Y(GERADE.a + GERADE.b * 19)} />
        <rect className="xw-band" x={x0 - 7} y={cy(s.hi)} width={14} height={Math.max(2, cy(s.lo) - cy(s.hi))} />
        <line className="xw-neg" strokeWidth={2.5} x1={x0} x2={x0} y1={cy(s.hi)} y2={cy(s.lo)} />
        <line className="xw-neg" strokeWidth={2.5} x1={x0 - 7} x2={x0 + 7} y1={cy(s.hi)} y2={cy(s.hi)} />
        <line className="xw-neg" strokeWidth={2.5} x1={x0 - 7} x2={x0 + 7} y1={cy(s.lo)} y2={cy(s.lo)} />
        <rect className="xw-bar-pos" x={x0 - 7} y={cy(s.ciHi)} width={14} height={Math.max(3, cy(s.ciLo) - cy(s.ciHi))} />
        <circle cx={x0} cy={cy(s.yhat)} r={2.5} className="xw-s-dot sel" />
        {label(cy(s.hi) + 4, fixed(s.hi))}
        {label(cy(s.lo) + 4, fixed(s.lo))}
        {label(cy(s.yhat) + 4, `ŷ₀ = ${num(s.yhat)}`)}
        <Axis scale={X} ticks={[0, 5, 10, 15]} at={bottom} from={left} to={right} labelGap={20} title="Lernzeit in Stunden" />
        <Axis scale={Y} ticks={[0, 5, 10, 15, 20]} at={left} from={bottom} to={top} orient="left" labelGap={24} />
        <text className="xw-t" x={left + 6} y={top - 6}>Aufgaben</text>
      </svg>
    </div>
  );
}

export const pictures: Record<string, Picture> = {
  'b08-anteil': forCard(p => <AnteilVerteilung n={stufe(ANTEIL_N, p.value ?? ANTEIL_N.indexOf(50))} />),
  'b08-gesetz': forCard(p => <GesetzVerteilung n={stufe(GESETZ_N, p.value ?? 0)} />),
  'b08-glocke': forCard(p => <GlockeVerteilung n={stufe(GLOCKE_N, p.value ?? 0)} />),
  'b08-intervall': forSentence(p => <IntervallBild s={p.s as KiStats} />),
  'b08-vorhersage': forSentence(p => <VorhersageBild s={p.s as PiStats} />),
  'b08-verzerrung': forCard(p => <VerzerrungBild n={stufe(VERZERRUNG_N, p.value ?? VERZERRUNG_N.indexOf(100))} />),
};
