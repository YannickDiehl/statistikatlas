// Begriffskarte „Normalverteilung“ (Bereich B7). Beispiel: die Schlafdauer der 200 Befragten des Lehrdatensatzes,
// Normalverteilung mit μ = x̄ und σ = s. Alle Zahlen sind in R nachgerechnet (b07-verteilungen.test.ts).
// Grenzfall Vorlage: Die Dichteformel rechnet niemand von Hand; Studierende sollen das Modell mit zwei Stellschrauben
// und die Flächenregel verstehen. Deshalb Begriffskarte mit Regler statt Formel als Satz.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { num, pct, unit } from '../../format';
import { baseSurvey } from '../../sample';
import { ref, titleFor } from '../../../domain/learning';
import { columnStats, pnorm, skewness, within } from './dist';

/** Schlafdauer der 200 Befragten (Stunden pro Nacht in den letzten sieben Tagen), Referenzwerte aus R. */
export const SCHLAF = { n: 200, mean: 7.0825, sd: 0.819758, within1: 140, within2: 191, below2: 6, skew: -0.057802 } as const;
/** Alter der 200 Befragten: innerhalb einer Standardabweichung (nicht glockenförmig). */
export const ALTER_WITHIN1 = 119;
/** Schiefe des Haushaltsnettoeinkommens der 200 Befragten (mariposa describe, show = "skew"). */
export const EINKOMMEN_SKEW = 0.791522;

const S = SCHLAF;
const T = (id: string) => titleFor(ref(id));
/** Schlafdauer der Ausgangsdaten, für den Regler (zählt für jedes k nach). */
let schlaf: ReturnType<typeof columnStats> | null = null;
const schlafStats = () => schlaf ??= columnStats(baseSurvey(), 'schlafdauer');
/** Anteil einer Normalverteilung innerhalb von μ ± k · σ. */
export const inside = (k: number) => 2 * pnorm(k) - 1;

export const normalverteilung: ConceptCard = {
  concept: 'normal_distribution',
  picture: 'b07-normal',
  wofuer: 'Wie lange schlafen Menschen? Bei den 200 Befragten liegt die Schlafdauer meist um 7 Stunden; sehr kurze und sehr lange Nächte sind selten. Die Normalverteilung ist ein Modell für so ein Muster. Sie beschreibt es mit nur zwei Zahlen.',
  kurz: 'Die Normalverteilung ist eine glockenförmige Kurve: Die meisten Werte liegen nahe der Mitte, nach außen werden sie seltener. Zwei Zahlen legen sie fest: wo die Mitte liegt und wie breit die Glocke ist.',
  stellDirVor: {
    text: `Die 200 Befragten haben in den letzten sieben Tagen im Schnitt ${num(S.mean)} Stunden pro Nacht geschlafen, mit einer Standardabweichung von ${num(S.sd)} Stunden. ${S.within1} von ihnen liegen höchstens eine Standardabweichung von der Mitte entfernt, zwischen ${num(S.mean - S.sd)} und ${num(S.mean + S.sd)} Stunden. Eine Normalverteilung mit derselben Mitte und Breite sagt dafür ${pct(inside(1), 0)} voraus, also etwa ${Math.round(S.n * inside(1))} von 200. Das passt gut.`,
    figures: [
      { label: 'Mitte x̄', value: `${num(S.mean)} h` },
      { label: 'Standardabweichung s', value: `${num(S.sd)} h` },
      { label: 'innerhalb x̄ ± s', value: `${S.within1} von 200` },
      { label: 'Normalverteilung', value: pct(inside(1)) },
    ],
  },
  heisst: {
    sym: 'N(μ, σ²)', say: 'N von mü und sigma Quadrat',
    fach: 'Eine stetige Verteilung mit der Dichte f(x) = e^(−(x − μ)² / (2σ²)) / (σ√(2π)). Sie ist symmetrisch um den Erwartungswert μ; die Standardabweichung σ bestimmt ihre Breite.',
  },
  bausteine: [
    {
      title: 'Die Mitte festlegen',
      was: `Der Erwartungswert μ sagt, wo der Gipfel der Glocke liegt. Für die Schlafdauer setzen wir die Mitte der 200 ein, ${num(S.mean)} Stunden.`,
      warum: 'Ändert sich μ, wandert die ganze Glocke nach links oder rechts. Ihre Form bleibt dabei gleich.',
      acht: 'μ ist die Mitte des Modells, x̄ die Mitte deiner Daten. Hier setzen wir beide gleich; das ist eine Schätzung, kein Gesetz.',
      concept: 'expectation',
    },
    {
      title: 'Die Breite festlegen',
      was: `Die Standardabweichung σ sagt, wie breit die Glocke ist. Bei der Schlafdauer sind es ${num(S.sd)} Stunden.`,
      warum: 'Großes σ: flache, breite Glocke. Kleines σ: schmale, hohe Glocke. Die Fläche darunter ist immer 1, also 100 %.',
      acht: 'Die Höhe der Kurve ist keine Wahrscheinlichkeit. Wahrscheinlichkeiten sind Flächen unter der Kurve, zum Beispiel die Fläche zwischen 6 und 8 Stunden.',
      concept: 'density_function',
    },
    {
      title: 'Flächen ablesen',
      was: 'Zwischen μ − σ und μ + σ liegen etwa 68 % der Fläche, zwischen μ − 2σ und μ + 2σ etwa 95 %. Fast alles liegt innerhalb von drei Standardabweichungen.',
      rechnung: `Schlafdauer: ${num(S.mean)} ± ${num(S.sd)} ergibt ${num(S.mean - S.sd)} bis ${num(S.mean + S.sd)} Stunden, im Modell ${pct(inside(1))}, in den Daten ${S.within1} von 200 (${pct(S.within1 / S.n, 0)}). Zwei Standardabweichungen: ${num(S.mean - 2 * S.sd)} bis ${num(S.mean + 2 * S.sd)} Stunden, im Modell ${pct(inside(2))}, in den Daten ${S.within2} von 200.`,
      warum: 'Diese Anteile gelten für jede Normalverteilung, egal wo ihre Mitte liegt und wie breit sie ist. Deshalb reicht eine einzige Tabelle.',
      acht: `Die Regel gilt nur für glockenförmige Daten. Beim Alter der 200 Befragten liegen nur ${ALTER_WITHIN1} innerhalb einer Standardabweichung, nicht etwa ${Math.round(S.n * inside(1))}.`,
      concept: 'standard_normal',
    },
    {
      title: 'Modell und Daten vergleichen',
      was: 'Echte Daten folgen nie genau der Kurve. Ob das Modell gut genug passt, zeigt ein Vergleich von Histogramm und Glocke.',
      rechnung: `Schlafdauer: Schiefe ${num(S.skew)}, die Werte liegen fast symmetrisch, die Glocke passt. Haushaltsnettoeinkommen: Schiefe ${num(EINKOMMEN_SKEW)}, rechts zieht sich ein langer Ausläufer, die Glocke passt schlecht.`,
      warum: 'Viele Verfahren setzen eine Normalverteilung voraus, etwa der t-Test bei kleinen Gruppen. Dann lohnt der Blick auf die Daten.',
      acht: 'z-Werte machen eine schiefe Verteilung nicht normal. Standardisieren verschiebt und staucht nur, die Form bleibt.',
      concept: 'normality_test',
    },
  ],
  ausprobieren: [
    {
      question: 'Alle schlafen eine halbe Stunde länger. Was passiert mit der Glocke?',
      options: ['Sie wandert nach rechts, ihre Form bleibt.', 'Sie wird breiter.', 'Sie wird höher.'], correct: 0, step: 1,
      explain: 'μ steigt um 0,5 Stunden. σ bleibt gleich, denn alle Abstände zur Mitte bleiben. Die Glocke rückt nach rechts.',
      kurz: 'Die Mitte verschiebt die Glocke, die Breite formt sie.',
    },
    {
      question: `Angenommen, σ wäre doppelt so groß, ${num(2 * S.sd)} Stunden. Wie viel Prozent lägen dann innerhalb von μ ± σ?`,
      options: ['etwa 34 %', 'etwa 68 %', 'etwa 95 %'], correct: 1, step: 3,
      explain: 'Die Glocke wird breiter, aber σ wächst mit. Innerhalb einer Standardabweichung liegen bei jeder Normalverteilung etwa 68 %.',
      kurz: 'Die Anteile hängen nur an der Zahl der Standardabweichungen.',
    },
    {
      question: `Wie viele der 200 Befragten schlafen laut Modell weniger als ${num(S.mean - 2 * S.sd)} Stunden, also mehr als zwei Standardabweichungen unter der Mitte?`,
      options: ['etwa 5', 'etwa 10', 'etwa 50'], correct: 0, step: 3,
      explain: `Außerhalb von zwei Standardabweichungen liegen etwa 5 %, die Hälfte davon links: ${pct(pnorm(-2))} von 200 sind etwa ${Math.round(S.n * pnorm(-2))}. In den Daten sind es ${S.below2}.`,
      kurz: 'Die Ränder der Glocke sind dünn besetzt.',
    },
  ],
  regler: {
    label: 'Wie viele liegen höchstens k Standardabweichungen von der Mitte entfernt?',
    min: 0.5, max: 3, step: 0.1, initial: 1,
    format: v => unit(v, 'Standardabweichung', 'Standardabweichungen'),
    describe: v => {
      const { xs, mean, sd } = schlafStats(), k = within(xs, mean, sd, v);
      return `Im Modell liegen ${pct(inside(v))} zwischen ${num(mean - v * sd)} und ${num(mean + v * sd)} Stunden. Bei den 200 Befragten sind es ${k}, also ${pct(k / xs.length)}.`;
    },
  },
  check: {
    question: 'Ein Modell sagt: Die Schlafdauer ist normalverteilt mit der Mitte 7 Stunden und der Standardabweichung 1 Stunde. Wie viel Prozent schlafen dann zwischen 5 und 9 Stunden?',
    options: ['etwa 68 %', 'etwa 95 %', 'etwa 99,7 %', '100 %'],
    correct: 1,
    right: 'Genau. 5 und 9 Stunden liegen je zwei Standardabweichungen von der Mitte entfernt. Dazwischen liegen etwa 95 %.',
    diagnose: {
      0: 'Fast! 68 % liegen innerhalb einer Standardabweichung, also zwischen 6 und 8 Stunden. 5 bis 9 Stunden sind zwei Standardabweichungen.',
      2: 'Fast! 99,7 % gelten für drei Standardabweichungen, also für 4 bis 10 Stunden.',
      3: 'Fast! Die Glocke hat keine festen Ränder. Ein kleiner Rest liegt immer weiter außen.',
    },
  },
  fuerDich: 'Setzt ein Verfahren eine Normalverteilung voraus, schau dir zuerst das Histogramm an. Eine Glocke um die Mitte ohne langen Ausläufer: Das Modell ist brauchbar. Ein langer Ausläufer wie beim Einkommen: Vorsicht.',
  genau: {
    kurz: 'Die Normalverteilung ist ein Modell mit unendlich langen Rändern. Für echte, begrenzte Skalen ist sie immer eine Näherung.',
    paragraphs: [
      'Die Dichte lautet f(x) = e^(−(x − μ)² / (2σ²)) / (σ√(2π)). Sie ist symmetrisch um μ und hat ihre Wendepunkte bei μ − σ und μ + σ. Kurz geschrieben: X ∼ N(μ, σ²).',
      'Die Normalverteilung reicht von minus bis plus unendlich. Schlafdauer kann nicht negativ sein; das Modell gibt solchen Werten hier aber praktisch keine Wahrscheinlichkeit. Bei begrenzten Skalen, etwa Zustimmung von 1 bis 5, bleibt sie eine Näherung.',
      'Standardisieren mit z-Werten verschiebt die Mitte auf 0 und streckt die Breite auf 1. Die Form ändert sich dabei nicht: Eine schiefe Verteilung bleibt schief.',
      'Warum taucht die Glocke so oft auf? Addieren sich viele kleine, unabhängige Einflüsse, entsteht annähernd eine Normalverteilung. Für Mittelwerte großer Stichproben beschreibt das der zentrale Grenzwertsatz.',
      'Hier setzen wir μ und σ gleich x̄ und s der 200 Befragten. Das sind Schätzungen. Ob die Daten zu einer Normalverteilung passen könnten, prüft etwa der Test nach Shapiro-Wilk.',
    ],
  },
};

/** Schlafdauer der aktuellen Daten: Mitte, Standardabweichung, Zahl innerhalb von x̄ ± s und x̄ ± 2s, Schiefe. */
export function schlafFit(c: SampleCtx) {
  const { xs, n, mean, sd } = columnStats(c.rows, c.columns.x?.[0] ?? 'schlafdauer');
  return { n, mean, sd, k1: within(xs, mean, sd, 1), k2: within(xs, mean, sd, 2), skew: skewness(xs) };
}

export const normalTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'schlafdauer' },
    kurz: 'Dieselbe Frage mit allen 200 Befragten: Wie gut passt eine Normalverteilung zur Schlafdauer?',
    value: c => schlafFit(c).k1,
    result: c => {
      const f = schlafFit(c);
      return {
        kurz: `Im Mittel schlafen die Befragten ${num(f.mean)} Stunden pro Nacht, die Standardabweichung beträgt ${unit(f.sd, 'Stunde', 'Stunden')}. ${f.k1} von ${f.n} liegen höchstens eine Standardabweichung von der Mitte entfernt, eine Normalverteilung sagt etwa ${Math.round(f.n * inside(1))} voraus. Die Schiefe ist ${num(f.skew)}; bei einer Glocke wäre sie 0.`,
        fachlich: `Normalverteilung mit μ = x̄ = ${num(f.mean)} h und σ = s = ${num(f.sd)} h. Innerhalb von x̄ ± s liegen ${f.k1} von ${f.n} (Modell ${pct(inside(1))}), innerhalb von x̄ ± 2s ${f.k2} von ${f.n} (Modell ${pct(inside(2))}). Schiefe ${num(f.skew)}, bei einer Normalverteilung 0.`,
        zusatz: `Zwischen ${num(f.mean - f.sd)} und ${num(f.mean + f.sd)} Stunden schlafen ${f.k1} von ${f.n} Befragten.`,
      };
    },
    voraussetzung: 'Das Modell nimmt an, dass die Werte symmetrisch und glockenförmig um die Mitte liegen, ohne lange Ausläufer. Die Glocke ist stetig, die Schlafdauer auf Zehntelstunden gerundet.',
    think: [
      {
        question: 'Alle schlafen eine halbe Stunde länger. Was passiert mit der Zahl der Befragten innerhalb einer Standardabweichung um die Mitte?',
        options: ['bleibt gleich', 'steigt', 'sinkt'], correct: 0,
        explain: 'Mitte und Werte rücken gemeinsam um 0,5 Stunden, die Standardabweichung bleibt. Wer vorher im Bereich lag, liegt auch danach darin.',
        kurz: 'Verschieben ändert die Lage der Glocke, nicht ihre Form.',
        tryIt: { label: 'alle eine halbe Stunde länger', op: 'shift', column: 'x', value: 0.5 },
        expect: { change: 'same' },
      },
      {
        question: 'Die gewählte Person schläft plötzlich 14 Stunden pro Nacht. Was passiert mit der Schiefe?',
        options: ['bleibt gleich', 'steigt deutlich', 'sinkt'], correct: 1,
        explain: `Ein Wert weit rechts zieht einen langen Ausläufer nach rechts. In den Ausgangsdaten steigt die Schiefe von ${num(S.skew)} auf etwa 1,8: Die Glocke passt schlechter.`,
        kurz: 'Ein einzelner Ausreißer macht die Verteilung schief.',
        tryIt: { label: 'die gewählte Person auf 14 Stunden', op: 'outlier', column: 'x', value: 14 },
        expect: { change: 'up', atLeast: 1, measure: c => schlafFit(c).skew },
      },
    ],
  },
  r: {
    entry: 'normality_test', variant: 0,
    tokens: {
      normality_test: { sym: 'normality_test()', term: T('normality_test'), kurz: 'Prüft, ob die Werte einer Spalte zu einer Normalverteilung passen. R meldet zwei Tests: Kolmogorov-Smirnov (KS) und Shapiro-Wilk (W).', fehler: 'Ohne Spalte meldet mariposa: No variables selected. Please specify at least one variable.' },
    },
    outputMap: [
      { match: 'W', atlas: 'Shapiro-Wilk W', step: 4, explain: 'W misst, wie gut die geordneten Werte zu einer Normalverteilung passen. 1 hieße perfekt; die Schlafdauer ist sehr nah dran.' },
      { match: 'KS', atlas: 'Abstand nach Kolmogorov-Smirnov', step: 4, explain: 'Der größte Abstand zwischen den kumulierten Anteilen der Daten und der Normalverteilung. Klein heißt: gute Passung.' },
      { match: 'p', atlas: 'p-Wert', explain: 'Wäre die Schlafdauer aller Menschen normalverteilt, käme ein so großer KS-Abstand in etwa 24 von 100 Stichproben vor. Der zweite p-Wert gehört zu W.' },
      { match: 'n', atlas: 'n', explain: 'n zählt die Befragten mit gültiger Schlafdauer.' },
    ],
    check: {
      question: 'Welche Zahl sagt nach Shapiro-Wilk, wie gut die Schlafdauer zu einer Glocke passt? Tippe sie an.', correct: 'W',
      wrong: {
        KS: 'Fast! Das ist der Abstand nach Kolmogorov-Smirnov, ein anderer Test. Shapiro-Wilk steht hinter W.',
        p: 'Fast! Das ist ein p-Wert. Er sagt, wie überraschend die Abweichung wäre, nicht wie gut die Passung ist.',
        n: 'Fast! n zählt die Befragten. Die Passung nach Shapiro-Wilk steht hinter W.',
      },
    },
  },
  next: {
    next: { id: 'standard_normal', why: 'Jede Normalverteilung lässt sich in eine einzige umrechnen: Mitte 0, Standardabweichung 1.' },
    before: [
      { id: 'expectation', why: 'μ, die Mitte des Modells.' },
      { id: 'density_function', why: 'Wahrscheinlichkeiten sind Flächen unter der Kurve.' },
      { id: 'sd', why: 'σ misst die Breite der Glocke, wie s die Streuung der Daten.' },
    ],
    after: [
      { id: 'normality_test', why: 'Prüft, ob Daten zu einer Normalverteilung passen könnten.' },
      { id: 'z', why: 'Rechnet Werte in Standardabweichungen um, ohne die Form zu ändern.' },
      { id: 'central_limit', why: 'Erklärt, warum Mittelwerte großer Stichproben fast normalverteilt sind.' },
    ],
    more: [
      { id: 'residuals', why: 'In der Regression betrifft die Annahme der Normalverteilung die Residuen.' },
      { id: 't_distribution', why: 'Die Glocke mit dickeren Rändern, wenn die Streuung geschätzt ist.' },
      { id: 'shape', why: 'Schiefe und Kurtosis beschreiben, wie weit Daten von der Glocke abweichen.' },
    ],
  },
};
