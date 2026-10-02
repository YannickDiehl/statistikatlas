// Formel als Satz „Konfidenzintervall“ (confidence). Beispiel: Vertrauen in den Bundestag im ALLBUS 2023 (ungewichtet,
// Aggregat), x̄ ± t · SE mit t aus der t-Verteilung. Regler: Streuung, Fallzahl, Konfidenzniveau (über t). Bild
// 'b08-intervall'. Reiter: Konfidenzintervall der mittleren Lernzeit der 200; In R die Intervalle von oneway_anova().
import type { ConceptTabs, SampleCtx, SentenceTemplate } from '../../types';
import { close, count, fixed, num, unit } from '../../format';
import { qt } from '../../../tasks/kit/dist';
import { oneSampleT } from '../../../tasks/kit/means';
import { VERTRAUEN, columnX, mean, sd1, small } from './daten';

export type KiValues = { s: number; n: number; t: number };
export type KiStats = KiValues & { se: number; tq: number; df: number; moe: number; lo: number; hi: number; width: number };

/** Kritischer Wert der t-Verteilung für ein Niveau in Prozent. */
export const kritisch = (level: number, df: number) => qt(1 - (1 - level / 100) / 2, df);

/** Konfidenzintervall eines Mittelwerts `m` bei Standardabweichung s, Fallzahl n und Niveau in Prozent. */
export function intervall(m: number, v: KiValues): KiStats {
  const se = v.s / Math.sqrt(v.n), df = v.n - 1, tq = kritisch(v.t, df), moe = tq * se;
  return { ...v, se, tq, df, moe, lo: m - moe, hi: m + moe, width: 2 * moe };
}

/**
 * Konfidenzintervall der mittleren Lernzeit (Spalte x) aus den aktuellen Daten, 95 %: Grenzen aus dem gemeinsamen
 * `oneSampleT` (src/tasks/kit/means.ts), SE und t für den Text aus `intervall`. `intervall` selbst bleibt, weil die
 * Formel als Satz mit gedachten Werten für s, n und Niveau rechnet, nicht mit Daten.
 */
export function lernzeitKi(c: SampleCtx) {
  const x = columnX(c, 'lernzeit'), m = mean(x), k = intervall(m, { s: sd1(x), n: x.length, t: 95 }), t = oneSampleT(x);
  return t ? { ...k, m: t.mean, lo: t.ci[0], hi: t.ci[1], width: t.ci[1] - t.ci[0] } : { ...k, m };
}

const START: KiValues = { s: VERTRAUEN.sd, n: VERTRAUEN.n, t: 95 };
/** Ob die Regler noch auf den ALLBUS-Werten stehen (Streuung und Fallzahl); nur dann gilt der Vergleich mit dem gewichteten Mittel. */
const allbusWerte = (v: KiValues) => Math.abs(v.s - START.s) < 1e-9 && v.n === START.n;

export const confidence: SentenceTemplate<KiValues, KiStats> = {
  concept: 'confidence',
  picture: 'b08-intervall',
  wofuer: `Wie sehr vertrauen die Menschen in Deutschland dem Bundestag? Im ALLBUS 2023 haben ${count(VERTRAUEN.n)} Menschen auf einer Skala von 1 (gar kein Vertrauen) bis 7 (großes Vertrauen) geantwortet, im Mittel mit ${num(VERTRAUEN.mean)} (ungewichtet). Welche Werte sind für alle Erwachsenen plausibel?`,
  kurz: 'Ein Konfidenzintervall ist ein Bereich plausibler Werte für eine unbekannte Zahl über alle, die dich interessieren, etwa ihren Mittelwert. Je schmaler es ist, desto genauer kennst du sie.',
  fachlich: 'Ein Bereich, den ein Schätzverfahren mit festgelegter langfristiger Überdeckungsrate erzeugt: Bei 95 % enthalten 95 % solcher Intervalle den festen Parameter, wenn Modell und Verfahren stimmen.',
  initial: START,
  compute: v => intervall(VERTRAUEN.mean, v),
  metrics: [
    { label: 'Mittelwert x̄', value: () => num(VERTRAUEN.mean) },
    { label: 'Standardfehler SE', value: s => small(s.se) },
    { label: 'Konfidenzintervall', value: s => `${fixed(s.lo)} bis ${fixed(s.hi)}` },
  ],
  glyphs: [
    { key: 'xbar', sym: 'x̄', say: 'x quer', term: 'Arithmetisches Mittel', plain: 'die Mitte der Antworten, hier das mittlere Vertrauen der Befragten', concept: 'mean' },
    { key: 't', sym: 't', say: 't', term: 'Kritischer Wert & Ablehnungsbereich', plain: 'wie viele Standardfehler man nach jeder Seite geht; bei 95 % und vielen Befragten etwa 1,96', concept: 'critical_value' },
    { key: 'se', sym: 'SE', say: 'S E', term: 'Standardfehler', plain: 'wie stark der Mittelwert von Stichprobe zu Stichprobe schwanken würde', concept: 'se' },
    { key: 's', sym: 's', say: 's', term: 'Standardabweichung', plain: 'wie verschieden die Befragten antworten', concept: 'sd' },
    { key: 'n', sym: 'n', say: 'n', term: 'Fallzahl', plain: 'wie viele gültige Antworten es gibt' },
  ],
  symbolic: [
    { part: ['x̄'], m: 'xbar' }, ' ± ', { part: ['t'], m: 't' }, ' · ', { part: ['SE'], m: 'se' }, ',  SE = ',
    { frac: [{ part: ['s'], m: 's' }], den: [{ big: '√', m: 'n' }, { root: [{ part: ['n'], m: 'n' }], m: 'n' }], m: 'se' },
  ],
  aria: 'x quer plus minus t mal S E, dabei ist S E gleich s geteilt durch Wurzel aus n',
  numeric: s => [
    { part: [num(VERTRAUEN.mean)], m: 'xbar' }, ' ± ', { part: [num(s.tq)], m: 't' }, ' · ', { part: [small(s.se)], m: 'se' },
    ` ≈ ${num(VERTRAUEN.mean)} ± ${small(s.moe)}`, { br: true }, `= ${fixed(s.lo)} bis ${fixed(s.hi)}`,
  ],
  sentence: [
    'Das Konfidenzintervall reicht vom ', { m: 'xbar', t: 'Mittelwert' }, ' aus um ', { m: 't', t: 'den kritischen Wert' }, ' mal ',
    { m: 'se', t: 'den Standardfehler' }, ' nach unten und nach oben. Der Standardfehler ist ', { m: 's', t: 'die Standardabweichung' },
    ', geteilt durch die Wurzel aus ', { m: 'n', t: 'der Fallzahl' }, '.',
  ],
  worked: s => [
    { title: 'Den Standardfehler ausrechnen', text: `${num(s.s)} / √${count(s.n)} ≈ ${num(s.s)} / ${num(Math.sqrt(s.n))} ≈ ${small(s.se)}.` },
    { title: 'Den kritischen Wert nachschlagen', text: `Für ${num(s.t)} % und ${count(s.df)} Freiheitsgrade liefert die t-Verteilung t ≈ ${num(s.tq)}.` },
    { title: 'Die halbe Breite ausrechnen', text: `${num(s.tq)} · ${small(s.se)} ≈ ${small(s.moe)}. So weit reicht das Intervall nach jeder Seite.` },
    { title: 'Nach unten und oben abtragen', text: `${num(VERTRAUEN.mean)} − ${small(s.moe)} ≈ ${fixed(s.lo)} und ${num(VERTRAUEN.mean)} + ${small(s.moe)} ≈ ${fixed(s.hi)}.` },
  ],
  fehler: 'Ein 95-%-Intervall heißt nicht, dass der wahre Wert mit 95 % Wahrscheinlichkeit darin liegt. Der wahre Wert steht fest, zufällig ist das Intervall. Bei wiederholten Zufallsstichproben enthielten etwa 95 % solcher Intervalle den wahren Wert.',
  sliders: [
    { key: 'n', label: 'Fallzahl', min: 10, max: 40000, step: 1, log: true, format: v => count(v) },
    { key: 't', label: 'Konfidenzniveau', min: 80, max: 99, step: 1, format: v => `${num(v)} %` },
    { key: 's', label: 'Standardabweichung', min: 0.2, max: 3, step: 0.01, format: v => num(v) },
  ],
  quick: [
    { label: 'n mal 4', mark: 'n', apply: v => ({ ...v, n: Math.min(40000, v.n * 4) }) },
    { label: '99 % statt 95 %', mark: 't', apply: v => ({ ...v, t: 99 }) },
    { label: 'ALLBUS-Werte', mark: 'se', apply: () => ({ ...START }) },
  ],
  compare: s => `Das Intervall ist ${small(s.width)} Skalenpunkte breit. Mit viermal so vielen Befragten wäre es etwa halb so breit; ein höheres Niveau macht es breiter.`,
  check: {
    question: 'Ein Mittelwert ist 4, sein Standardfehler 0,25. Wie weit reicht das 95-%-Intervall nach jeder Seite, wenn du mit 1,96 rechnest?',
    answer: 0.49, tolerance: 0.0011,
    right: 'Genau, 0,49: 1,96 · 0,25 = 0,49. Das Intervall reicht von 3,51 bis 4,49.',
    diagnose: v => close(v, 0.98, 0.0011) ? 'Fast! Das ist die ganze Breite. Gefragt ist die Strecke nach jeder Seite: 1,96 · 0,25.'
      : close(v, 0.25, 0.0011) ? 'Fast! Das ist erst der Standardfehler. Nimm ihn noch mal 1,96.'
      : close(v, 1.96, 0.0011) ? 'Fast! Das ist der kritische Wert allein. Nimm ihn mal den Standardfehler 0,25.'
      : close(v, 4.49, 0.0011) || close(v, 3.51, 0.0011) ? 'Fast! Das ist schon eine Grenze des Intervalls. Gefragt ist nur die Strecke vom Mittelwert bis zur Grenze.'
      : 'Noch nicht ganz. Nimm den kritischen Wert 1,96 mal den Standardfehler.',
  },
  interpret: s => ({
    kurz: allbusWerte(s)
      ? `Rechnet man den ALLBUS wie eine einfache Zufallsstichprobe, sind für das mittlere Vertrauen Werte zwischen ${fixed(s.lo)} und ${fixed(s.hi)} plausibel. Bei wiederholten Zufallsstichproben mit ${count(s.n)} Befragten enthielten etwa ${num(s.t)} % solcher Intervalle den wahren Mittelwert. Das Intervall erfasst nur den Zufallsfehler: Gewichtet liegt der Mittelwert bei ${num(VERTRAUEN.gewichtet)}, ${VERTRAUEN.gewichtet > s.hi ? 'knapp außerhalb' : 'hier knapp innerhalb'}.`
      : `Rechnet man wie bei einer einfachen Zufallsstichprobe mit ${count(s.n)} Befragten, wären für das mittlere Vertrauen Werte zwischen ${fixed(s.lo)} und ${fixed(s.hi)} plausibel. Bei wiederholten Zufallsstichproben dieser Größe enthielten etwa ${num(s.t)} % solcher Intervalle den wahren Mittelwert.`,
    fachlich: `${num(s.t)}-%-Konfidenzintervall: x̄ ± t · SE = ${num(VERTRAUEN.mean)} ± ${num(s.tq)} · ${small(s.se)}, also von ${fixed(s.lo)} bis ${fixed(s.hi)}. t ist das ${num(50 + s.t / 2, 1)}-%-Quantil der t-Verteilung mit ${count(s.df)} Freiheitsgraden.`,
  }),
  think: {
    question: 'Du willst sicherer sein und nimmst 99 % statt 95 %. Was passiert mit dem Intervall?',
    options: ['es wird breiter', 'es wird schmaler', 'es bleibt gleich'], correct: 0, mark: 't',
    explain: `Für 99 % geht man weiter nach jeder Seite: t steigt von etwa ${num(kritisch(95, VERTRAUEN.n - 1))} auf etwa ${num(kritisch(99, VERTRAUEN.n - 1))}. Mehr Sicherheit kostet Genauigkeit.`,
    kurz: 'Höheres Niveau, breiteres Intervall.',
    hint: 'Probier oben „99 % statt 95 %“ aus.',
  },
  genau: {
    kurz: 'Das Intervall gilt für Zufallsstichproben und einen annähernd normalverteilten Mittelwert. Beim ALLBUS ist das echte Intervall etwas breiter.',
    paragraphs: [
      'Das konkrete Intervall gibt dem festen Parameter keine nachträgliche Wahrscheinlichkeit von 95 %. Die 95 % beschreiben das Verfahren: Über viele Stichproben enthalten etwa 95 % der so gebauten Intervalle den wahren Wert.',
      'Der kritische Wert kommt aus der t-Verteilung mit n − 1 Freiheitsgraden, weil s aus den Daten geschätzt ist. Bei vielen Befragten ist er fast 1,96, der Wert der Standardnormalverteilung.',
      `Hier ungewichtet und wie eine einfache Zufallsstichprobe gerechnet. Gewichtet liegt der Mittelwert bei ${num(VERTRAUEN.gewichtet)}, also knapp außerhalb des Intervalls: Ein Konfidenzintervall misst nur den Zufallsfehler, nicht die Verzerrung durch den Stichprobenplan. Der echte Standardfehler ist wegen der Gemeindeauswahl außerdem etwas größer.`,
      'Symmetrische Intervalle sind nur eine Form. Für Anteile nahe 0 oder 1 und für umgerechnete Größen gibt es Intervalle, die nicht symmetrisch um die Schätzung liegen.',
    ],
  },
};

export const confidenceTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'lernzeit' },
    kurz: 'Dieselbe Formel mit allen 200 Befragten: ein 95-%-Konfidenzintervall für die mittlere Lernzeit.',
    value: c => lernzeitKi(c).width,
    result: c => {
      const k = lernzeitKi(c);
      return {
        kurz: `Plausible Werte für die mittlere Lernzeit liegen zwischen ${fixed(k.lo)} und ${fixed(k.hi)} Stunden. Bei wiederholten Zufallsstichproben enthielten etwa 95 % solcher Intervalle den wahren Mittelwert.`,
        fachlich: `x̄ ± t · SE = ${num(k.m)} ± ${num(k.tq)} · ${small(k.se)}, also von ${fixed(k.lo)} bis ${fixed(k.hi)} h (t-Verteilung mit ${k.df} Freiheitsgraden).`,
        zusatz: `Das Intervall ist ${unit(k.width, 'Stunde', 'Stunden')} breit. Mit viermal so vielen Befragten wäre es etwa halb so breit.`,
      };
    },
    voraussetzung: 'Die Befragten sind unabhängig, und der Mittelwert ist annähernd normalverteilt. Bei 200 Befragten ist das meist erfüllt; ein einzelner extremer Wert wie 40 Stunden kann es stören.',
    think: [
      {
        question: 'Alle lernen eine Stunde mehr. Was macht die Breite des Intervalls?',
        options: ['bleibt gleich', 'steigt', 'sinkt'], correct: 0,
        explain: 'Das Intervall rückt um eine Stunde nach rechts. Seine Breite hängt nur von s und n ab, und die bleiben.',
        kurz: 'Verschieben ändert die Lage, nicht die Breite.',
        tryIt: { label: 'alle eine Stunde mehr', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'same' },
      },
      {
        question: 'Alle lernen doppelt so lange. Was macht die Breite des Intervalls?',
        options: ['verdoppelt sich', 'bleibt gleich', 'halbiert sich'], correct: 0,
        explain: 's verdoppelt sich, also auch der Standardfehler und die Breite.',
        kurz: 'Doppelte Streuung, doppelt so breites Intervall.',
        tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        expect: { change: 'factor', factor: 2 },
      },
      {
        question: 'Eine Person lernt plötzlich 40 Stunden. Was macht die Breite des Intervalls?',
        options: ['steigt', 'bleibt genau gleich', 'sinkt'], correct: 0,
        explain: 'Der Ausreißer vergrößert s und damit den Standardfehler. Das Intervall wird breiter und rückt etwas nach oben.',
        kurz: 'Ein Ausreißer macht das Intervall breiter.',
        tryIt: { label: 'die gewählte Person auf 40 Stunden', op: 'outlier', column: 'x', value: 40 },
        expect: { change: 'up' },
      },
    ],
  },
  r: {
    entry: 'oneway_anova', variant: 0,
    tokens: {
      summary: {
        sym: 'summary()', term: 'Ausführliche Ausgabe',
        kurz: 'Zeigt zu einem gespeicherten Ergebnis die ausführliche Tabelle. Bei oneway_anova() steht dort für jede Gruppe ein 95-%-Konfidenzintervall.',
        fehler: 'summary() braucht ein gespeichertes Ergebnis. Steht summary(a) im Skript vor der Zeile a <- …, meldet R: Objekt \'a\' nicht gefunden.',
      },
    },
    outputMap: [
      { match: '5.883', atlas: 'x̄ ohne Schulabschluss', explain: 'Mean ist die mittlere Lernzeit der 42 Befragten ohne Schulabschluss. Um diesen Wert legt R das Intervall.' },
      { match: '0.474', atlas: 'SE', explain: 'Std. Error ist der Standardfehler dieser Gruppe: 3,07 / √42 ≈ 0,47.' },
      { match: '4.926', atlas: 'untere Grenze', explain: '95% CI Lower ist die untere Grenze: 5,88 − 2,02 · 0,47 ≈ 4,93. t hat hier 41 Freiheitsgrade.' },
      { match: '6.841', atlas: 'obere Grenze', explain: '95% CI Upper ist die obere Grenze: 5,88 + 2,02 · 0,47 ≈ 6,84. Plausibel sind also 4,93 bis 6,84 Stunden.' },
    ],
    check: {
      question: 'Wo endet das 95-%-Konfidenzintervall für die Lernzeit ohne Schulabschluss nach unten? Tippe die Zahl an.', correct: '4.926',
      wrong: {
        '5.883': 'Fast! Das ist der Mittelwert, die Mitte des Intervalls. Die untere Grenze steht unter 95% CI Lower.',
        '0.474': 'Fast! Das ist der Standardfehler. Die Grenze entsteht erst, wenn du gut zwei Standardfehler abziehst.',
        '6.841': 'Fast! Das ist die obere Grenze. Die untere steht eine Spalte weiter links.',
      },
    },
  },
  next: {
    next: { id: 'prediction_interval', why: 'Der viel breitere Bereich für eine einzelne neue Person statt für den Mittelwert.' },
    before: [
      { id: 'se', why: 'Der Standardfehler bestimmt, wie breit das Intervall ist.' },
      { id: 'critical_value', why: 'Wie viele Standardfehler man nach jeder Seite geht, etwa 1,96 bei 95 %.' },
      { id: 'sampling_distribution', why: 'Die 95 % beziehen sich auf viele gedachte Stichproben.' },
    ],
    after: [
      { id: 't_test', why: 'Liegt der Wert der Nullhypothese außerhalb des 95-%-Intervalls, verwirft der zweiseitige Test bei α = 5 %.' },
      { id: 'hypothesis', why: 'Eine Hypothese nennt einen Wert für den Parameter; das Intervall zeigt, welche Werte zu den Daten passen.' },
    ],
    more: [
      { id: 'effect', why: 'Ein Intervall zeigt, wie groß ein Effekt plausibel ist, nicht nur ob es ihn gibt.' },
      { id: 'power', why: 'Wie viele Befragte ein Test braucht, um einen Effekt verlässlich zu finden; mit mehr Befragten wird auch das Intervall schmaler.' },
    ],
  },
};
