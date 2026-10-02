// Formel als Satz „Standardnormalverteilung“ (Bereich B7): z = (x − μ) / σ und die Fläche Φ(z) links davon.
// Beispiel: Schlafdauer mit μ und σ aus den 200 Befragten (7,08 h und 0,82 h). Zahlen in R nachgerechnet (b07-verteilungen.test.ts).
// Grenzfall Vorlage: Studierende verändern x, μ und σ und beobachten z und die Fläche; deshalb Formel als Satz.
import type { ConceptTabs, SampleCtx, SentenceTemplate } from '../../types';
import { close, num, paren, pct, unit } from '../../format';
import { baseSurvey } from '../../sample';
import { ref, titleFor } from '../../../domain/learning';
import { pnorm, series, shown2 } from './dist';

export type ZValues = { x: number; mu: number; sigma: number };
export type ZStats = ZValues & { diff: number; z: number; zr: number; area: number; count: number; n: number };

/** Startwerte: 5,5 Stunden Schlaf, Mitte und Standardabweichung der 200 Befragten (gerundet). */
export const Z_START: ZValues = { x: 5.5, mu: 7.08, sigma: 0.82 };
const T = (id: string) => titleFor(ref(id));

/** Fläche als Prozent: „2,7 %“, an den Rändern „weniger als 0,1 %“ bzw. „mehr als 99,9 %“. */
export const areaText = (a: number) => a < 0.0005 ? 'weniger als 0,1 %' : a > 0.9995 ? 'mehr als 99,9 %' : pct(a);
/** Mit „etwa“, wenn eine Zahl dasteht: „etwa 2,7 %“, sonst „weniger als 0,1 %“. */
const aboutArea = (a: number) => a < 0.0005 || a > 0.9995 ? areaText(a) : `etwa ${areaText(a)}`;
const eq = (v: number) => Math.abs(shown2(v) - v) > 1e-9 ? '≈' : '=';
const side = (d: number) => d < 0 ? 'unter' : 'über';

let schlaf: number[] | null = null;
const schlafdauer = () => schlaf ??= series(baseSurvey(), 'schlafdauer').xs;

export const standardnormal: SentenceTemplate<ZValues, ZStats> = {
  concept: 'standard_normal',
  picture: 'b07-standard',
  wofuer: 'Wie ungewöhnlich sind 5,5 Stunden Schlaf? Die 200 Befragten schlafen im Mittel 7,08 Stunden, mit einer Standardabweichung von 0,82 Stunden. Rechnest du den Abstand in Standardabweichungen um, kannst du die Antwort an einer einzigen Kurve ablesen: der Standardnormalverteilung.',
  kurz: 'Die Standardnormalverteilung ist die Normalverteilung mit der Mitte 0 und der Standardabweichung 1. Jede Normalverteilung lässt sich in sie umrechnen, und dann gilt für alle dieselbe Tabelle.',
  fachlich: 'Die Normalverteilung N(0, 1). Ist X normalverteilt mit μ und σ, dann ist Z = (X − μ) / σ standardnormalverteilt, und P(X ≤ x) = Φ(z).',
  initial: Z_START,
  compute: v => {
    const diff = shown2(v.x - v.mu), z = diff / v.sigma, zr = shown2(z), xs = schlafdauer();
    return { ...v, diff, z, zr, area: pnorm(zr), count: xs.filter(x => x <= v.x + 1e-9).length, n: xs.length };
  },
  metrics: [
    { label: 'z-Wert z', value: s => num(s.z) },
    { label: 'Fläche links von z', value: s => areaText(s.area) },
  ],
  glyphs: [
    { key: 'z', sym: 'z', say: 'z', term: T('z'), plain: 'wie viele Standardabweichungen ein Wert über oder unter der Mitte liegt', concept: 'z' },
    { key: 'x', sym: 'x', say: 'x', term: T('random_variable'), plain: 'der Wert, nach dem du fragst, hier eine Schlafdauer', concept: 'random_variable' },
    { key: 'mu', sym: 'μ', say: 'mü', term: T('expectation'), plain: 'die Mitte der Normalverteilung', concept: 'expectation' },
    { key: 'sigma', sym: 'σ', say: 'sigma', term: 'Standardabweichung der Verteilung', plain: 'die Breite der Glocke' },
    { key: 'phi', sym: 'Φ(z)', say: 'Phi von z', term: T('cumulative_probability'), plain: 'die Fläche links von z unter der Standardnormalverteilung', concept: 'cumulative_probability' },
  ],
  symbolic: [{ part: ['z'], m: 'z' }, ' = ', { frac: [{ part: ['x'], m: 'x' }, ' − ', { part: ['μ'], m: 'mu' }], den: [{ part: ['σ'], m: 'sigma' }], m: 'z' }, '     P(X ≤ x) = ', { part: ['Φ(z)'], m: 'phi' }],
  aria: 'z gleich x minus mü, geteilt durch sigma. Die Wahrscheinlichkeit für höchstens x ist Phi von z.',
  numeric: s => [{ part: ['z'], m: 'z' }, ' = (', { part: [num(s.x)], m: 'x' }, ' − ', { part: [num(s.mu)], m: 'mu' }, ') / ', { part: [num(s.sigma)], m: 'sigma' },
    ` = ${num(s.diff)} / ${num(s.sigma)} ${eq(s.z)} ${num(s.z)}`, { br: true }, { part: [`Φ(${num(s.zr)})`], m: 'phi' }, ` ≈ ${areaText(s.area)}`],
  sentence: ['Der ', { m: 'z', t: 'z-Wert' }, ' zählt, wie viele ', { m: 'sigma', t: 'Standardabweichungen' }, ' ', { m: 'x', t: 'ein Wert' }, ' über oder unter ', { m: 'mu', t: 'der Mitte' }, ' liegt. ',
    { m: 'phi', t: 'Die Fläche links von z' }, ' unter der Standardnormalverteilung ist der Anteil der Werte, die höchstens so groß sind.'],
  worked: s => [
    { title: 'Den Abstand zur Mitte messen', text: `x − μ = ${num(s.x)} − ${num(s.mu)} = ${num(s.diff)} Stunden.${Math.abs(s.diff) < 0.005 ? ' Der Wert liegt genau auf der Mitte.' : ` ${num(s.x)} Stunden liegen ${unit(Math.abs(s.diff), 'Stunde', 'Stunden')} ${side(s.diff)} der Mitte.`}` },
    { title: 'In Standardabweichungen umrechnen', text: `${paren(s.diff)} / ${num(s.sigma)} ${eq(s.z)} ${num(s.z)}.${Math.abs(s.zr) < 0.005 ? ' Null Standardabweichungen: genau die Mitte.' : ` Das sind ${unit(Math.abs(s.zr), 'Standardabweichung', 'Standardabweichungen')} ${side(s.zr)} der Mitte.`}` },
    { title: 'Die Fläche ablesen', text: `Links von z = ${num(s.zr)} liegt unter der Standardnormalverteilung ${areaText(s.area)} der Fläche. Laut Modell schlafen also ${aboutArea(s.area)} höchstens ${num(s.x)} Stunden.` },
  ],
  fehler: 'z ist kein Anteil und keine Wahrscheinlichkeit. z = −2 heißt: zwei Standardabweichungen unter der Mitte. Den Anteil liefert erst die Fläche links davon, Φ(−2) ≈ 2,3 %.',
  sliders: [
    { key: 'x', label: 'Schlafdauer x', min: 3, max: 11, step: 0.1, format: v => `${num(v)} h` },
    { key: 'mu', label: 'Mitte μ', min: 5, max: 9, step: 0.01, format: v => `${num(v)} h` },
    { key: 'sigma', label: 'Standardabweichung σ', min: 0.3, max: 2, step: 0.01, format: v => `${num(v)} h` },
  ],
  quick: [
    { label: 'x zwei σ über die Mitte', mark: 'x', apply: v => ({ ...v, x: Math.min(11, shown2(v.mu + 2 * v.sigma)) }) },
    { label: 'σ verdoppeln', mark: 'sigma', apply: v => ({ ...v, sigma: Math.min(2, shown2(2 * v.sigma)) }) },
    { label: 'Werte der 200 Befragten', mark: 'mu', apply: () => ({ ...Z_START }) },
  ],
  compare: s => `Bei jeder Normalverteilung gehört zu z = ${num(s.zr)} dieselbe Fläche: ${areaText(s.area)}. Es zählt nur, wie viele Standardabweichungen x von der Mitte entfernt liegt.`,
  check: {
    question: 'Ein Wert liegt bei x = 9, die Mitte bei μ = 7, die Standardabweichung ist σ = 0,5. Wie groß ist z?',
    answer: 4, tolerance: 0.011,
    right: 'Genau, 4: (9 − 7) / 0,5 = 2 / 0,5 = 4. Der Wert liegt vier Standardabweichungen über der Mitte.',
    diagnose: v => close(v, 2) ? 'Fast! Das ist der Abstand x − μ in Stunden. Teile ihn noch durch σ = 0,5.'
      : close(v, -4) ? 'Fast! Das Vorzeichen stimmt nicht. Rechne Wert minus Mitte: 9 − 7 = +2.'
      : close(v, 1) ? 'Fast! Du hast mit σ malgenommen. Geteilt durch 0,5 ergibt 4.'
      : close(v, 18) ? 'Fast! Die Mitte fehlt. Erst x − μ rechnen, dann durch σ teilen.'
      : 'Noch nicht ganz. Rechne erst x − μ und teile dann durch σ.',
  },
  interpret: s => ({
    kurz: Math.abs(s.diff) < 0.005
      ? `${num(s.x)} Stunden liegen genau auf der Mitte. Laut Modell liegt die Hälfte der Schlafdauern bei höchstens diesem Wert. Bei den 200 Befragten sind es ${s.count} von ${s.n}.`
      : `Laut Modell liegen ${aboutArea(s.area)} der Schlafdauern bei höchstens ${num(s.x)} Stunden pro Nacht. ${num(s.x)} Stunden liegen ${unit(Math.abs(s.zr), 'Standardabweichung', 'Standardabweichungen')} ${side(s.zr)} der Mitte. Bei den 200 Befragten sind es ${s.count} von ${s.n}.`,
    fachlich: `z = (x − μ) / σ = (${num(s.x)} − ${num(s.mu)}) / ${num(s.sigma)} ${eq(s.z)} ${num(s.z)}, P(X ≤ x) = Φ(${num(s.zr)}) ≈ ${areaText(s.area)}. Zwischen z = −1,96 und z = 1,96 liegen 95 % der Fläche.`,
  }),
  think: {
    question: 'σ wird doppelt so groß, x und μ bleiben. Was passiert mit z?',
    options: ['z verdoppelt sich', 'z halbiert sich', 'z bleibt gleich'], correct: 1, mark: 'sigma',
    explain: 'σ steht im Nenner. Bei einer doppelt so breiten Glocke ist derselbe Abstand nur halb so viele Standardabweichungen.',
    kurz: 'Breitere Glocke, kleinere z-Werte.',
    hint: 'Probier oben „σ verdoppeln“ aus.',
  },
  genau: {
    kurz: 'Für Φ(z) gibt es keine Formel zum Ausrechnen von Hand; R und Tabellen liefern die Werte. z-Werte aus Daten machen schiefe Daten nicht normal.',
    paragraphs: [
      'Die Standardnormalverteilung N(0, 1) ist die Normalverteilung mit μ = 0 und σ = 1. Ist X normalverteilt mit μ und σ, dann ist Z = (X − μ) / σ standardnormalverteilt. Deshalb reicht eine einzige Tabelle für alle Normalverteilungen.',
      'Wichtige Werte: Zwischen −1,96 und 1,96 liegen 95 % der Fläche, zwischen −2,58 und 2,58 etwa 99 %. Diese Grenzen tauchen bei Konfidenzintervallen und Tests wieder auf.',
      'Hier setzen wir für μ und σ die gerundeten Werte der 200 Befragten ein, x̄ = 7,08 und s = 0,82. Die wahren Werte aller Menschen kennt niemand; das Ergebnis ist eine Näherung.',
      'z-Werte aus x̄ und s heißen z-Standardisierung. Sie haben immer die Mitte 0 und die Standardabweichung 1, folgen aber nur dann der Standardnormalverteilung, wenn die Daten selbst normalverteilt sind.',
      'Hier wird z vor dem Ablesen auf zwei Stellen gerundet, wie in einer gedruckten Tabelle. In R liefert pnorm(z) die Fläche links von z und qnorm(0.975) die Grenze 1,96.',
    ],
  },
};

/** z-Werte der Schlafdauer in den aktuellen Daten: wie viele jenseits von ±1,96, kleinster und größter z-Wert. */
export function zFit(c: SampleCtx) {
  const id = c.columns.x?.[0] ?? 'schlafdauer', { xs, n, mean, sd } = series(c.rows, id);
  const z = xs.map(x => (x - mean) / sd), max = Math.max(...z);
  return { n, mean, sd, outside: z.filter(v => Math.abs(v) > 1.96).length, zmax: max, zmin: Math.min(...z), who: c.rows[z.indexOf(max)].id };
}

export const standardTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'schlafdauer' },
    kurz: 'Dieselbe Rechnung mit allen 200 Befragten: Jede Schlafdauer wird zum z-Wert. Wie viele liegen weiter als 1,96 Standardabweichungen von der Mitte entfernt?',
    value: c => zFit(c).outside,
    result: c => {
      const f = zFit(c);
      return {
        kurz: `Als z-Werte haben die ${f.n} Schlafdauern die Mitte 0 und die Standardabweichung 1. ${f.outside} von ${f.n} liegen weiter als 1,96 Standardabweichungen von der Mitte entfernt; die Standardnormalverteilung sagt 5 % voraus, also ${Math.round(f.n * 0.05)}. Der größte z-Wert ist ${num(f.zmax)}.`,
        fachlich: `z = (x − x̄) / s mit x̄ = ${num(f.mean)} h und s = ${num(f.sd)} h. Betrag über 1,96: ${f.outside} von ${f.n} (${pct(f.outside / f.n)}), unter N(0, 1) wären es 5 %. Kleinster z-Wert ${num(f.zmin)}, größter ${num(f.zmax)} (${f.who}).`,
        zusatz: `Zwischen ${num(f.mean - 1.96 * f.sd)} und ${num(f.mean + 1.96 * f.sd)} Stunden liegen ${f.n - f.outside} von ${f.n} Befragten.`,
      };
    },
    voraussetzung: 'Die z-Werte folgen nur dann einer Standardnormalverteilung, wenn die Schlafdauer selbst normalverteilt ist. Mitte und Standardabweichung kommen hier aus den Daten.',
    think: [
      {
        question: 'Alle schlafen eine halbe Stunde länger. Was passiert mit der Zahl der Befragten jenseits von 1,96 Standardabweichungen?',
        options: ['bleibt gleich', 'steigt', 'sinkt'], correct: 0,
        explain: 'Mitte und Werte rücken gemeinsam um 0,5 Stunden, die Standardabweichung bleibt. Jeder z-Wert bleibt genau gleich.',
        kurz: 'z-Werte hängen nicht davon ab, wo die Werte liegen.',
        tryIt: { label: 'alle eine halbe Stunde länger', op: 'shift', column: 'x', value: 0.5 },
        expect: { change: 'same' },
      },
      {
        question: 'Die gewählte Person schläft plötzlich 14 Stunden pro Nacht. Was passiert mit dem größten z-Wert?',
        options: ['steigt deutlich', 'bleibt gleich', 'sinkt'], correct: 0,
        explain: 'Ihr Wert liegt weit über der Mitte. In den Ausgangsdaten springt der größte z-Wert von 2,95 auf über 7.',
        kurz: 'Ausreißer erkennst du an sehr großen z-Werten.',
        tryIt: { label: 'die gewählte Person auf 14 Stunden', op: 'outlier', column: 'x', value: 14 },
        expect: { change: 'up', atLeast: 2, measure: c => zFit(c).zmax },
      },
    ],
  },
  r: {
    entry: 'z', variant: 0,
    tokens: {
      std: { sym: 'std()', term: T('z'), kurz: 'Standardisiert Spalten: Die Mitte wird abgezogen, dann wird durch die Standardabweichung geteilt. Mit suffix entsteht eine neue Spalte.', fehler: 'Fehlt die Zeile library(mariposa), meldet R: konnte Funktion "std" nicht finden.' },
      method: { sym: 'method =', term: 'Art der Standardisierung', kurz: '"sd" teilt durch die Standardabweichung. So entstehen z-Werte mit der Standardabweichung 1.', fehler: 'Groß geschrieben kennt std() die Methode nicht. method = "SD" ergibt: \'arg\' sollte eines von \'“sd”, “2sd”, “mad”, “gmd”\' sein.' },
    },
    outputMap: [
      { match: 'lernzeit_z', atlas: 'z-Werte der Lernzeit', explain: 'Die Zeile lernzeit_z zeigt die z-Werte: Mitte 0, Standardabweichung 1, wie bei der Standardnormalverteilung.' },
      { match: 'Mean', atlas: 'x̄ der Lernzeit', explain: 'Die Mitte der Lernzeit in Stunden. Sie wird von jedem Wert abgezogen.' },
      { match: 'SD', atlas: 's der Lernzeit', explain: 'Die Standardabweichung der Lernzeit in Stunden. Durch sie wird jeder Abstand geteilt.' },
      { match: '1.000', atlas: 'Standardabweichung 1', explain: 'Nach dem Standardisieren ist die Standardabweichung genau 1, die Mitte daneben genau 0.' },
    ],
    check: {
      question: 'Woran siehst du, dass die z-Werte die Standardabweichung 1 haben? Tippe die Zahl an.', correct: '1.000',
      wrong: {
        SD: 'Fast! 3.238 ist die Standardabweichung der Lernzeit in Stunden. Die z-Werte stehen eine Zeile tiefer.',
        Mean: 'Fast! Das ist die Mitte der Lernzeit. Gefragt ist die Standardabweichung in der Zeile lernzeit_z.',
      },
    },
  },
  next: {
    next: { id: 't_distribution', why: 'Die Standardnormalverteilung mit dickeren Rändern, wenn die Streuung geschätzt ist.' },
    before: [
      { id: 'normal_distribution', why: 'Jede Normalverteilung lässt sich in diese eine umrechnen.' },
      { id: 'z', why: 'Rechnet Werte in Abstände in Standardabweichungen um.' },
    ],
    after: [
      { id: 'critical_value', why: 'Grenzen wie 1,96 kommen aus der Standardnormalverteilung.' },
      { id: 'confidence', why: 'Das 95-%-Intervall reicht etwa 1,96 Standardfehler um den Mittelwert.' },
      { id: 'chi_square_distribution', why: 'Quadrierte z-Werte, zusammengezählt, ergeben die χ²-Verteilung.' },
    ],
    more: [
      { id: 'central_limit', why: 'Standardisierte Mittelwerte großer Stichproben folgen annähernd dieser Verteilung.' },
      { id: 'cumulative_probability', why: 'Φ(z) ist die Fläche links von z.' },
    ],
  },
};
