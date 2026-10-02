// Formel als Satz „Erklärter Varianzanteil R²“ (Bereich B13) mit Reitern. Zahlen der 200 Befragten aus R
// (lm(wissenstest ~ lernzeit) und der Leitaufruf mit Lernzeit und Alter), Referenzwerte in b13-regression.test.ts.
import type { ConceptTabs, SentenceTemplate } from '../../types';
import { num, close } from '../../format';
import { sampleColumnInfo } from '../../sample';
import { lineFor, LINEAR_REGRESSION_TOKEN, MODELL } from './gerade-tabs';

/** Quadratsummen der 200 Befragten: ohne Gerade (SST), mit Lernzeit (SSE) und mit Lernzeit und Alter (SSE2). */
export const QS = { sst: 1931.875, sse: 1370.273, sse2: 1368.215 } as const;

export type R2Values = { sse: number; sst: number };
export type R2Stats = R2Values & { share: number; r2: number };
const pct = (v: number) => `${num(v * 100, 0)} %`;
const isLernzeit = (s: R2Values) => close(s.sse, QS.sse, 0.01) && close(s.sst, QS.sst, 0.01);

export const erklaerteVarianz: SentenceTemplate<R2Values, R2Stats> = {
  concept: 'explained_variance',
  picture: 'b13-r2',
  wofuer: 'Die Gerade aus der Lernzeit sagt den Wissenstest nicht perfekt voraus. Aber wie viel besser als ganz ohne Lernzeit? Ohne Gerade bleibt nur der Mittelwert: Um ihn streuen die 200 Befragten mit einer Quadratsumme von 1.931,88. Mit der Geraden bleiben 1.370,27 übrig.',
  kurz: 'R² sagt dir, welchen Anteil der Streuung die Gerade erfasst. 0 heißt gar nichts, 1 heißt: Alle Punkte liegen auf der Geraden.',
  fachlich: 'Das Bestimmtheitsmaß R² = 1 − SSE / SST: eins minus dem Anteil der Quadratsumme, der nach der Regression in den Residuen übrig bleibt.',
  initial: { sse: QS.sse, sst: QS.sst },
  compute: v => { const share = v.sse / v.sst; return { ...v, share, r2: 1 - share }; },
  metrics: [
    { label: 'Ohne Gerade SST', value: s => num(s.sst) },
    { label: 'Erklärter Anteil R²', value: s => num(s.r2) },
  ],
  glyphs: [
    { key: 'r2', sym: 'R²', say: 'R Quadrat', term: 'Erklärter Varianzanteil · R²', plain: 'der Anteil der Streuung, den die Gerade erfasst', concept: 'explained_variance' },
    { key: 'rest', sym: 'SSE / SST', say: 'S S E durch S S T', term: 'Unerklärter Anteil', plain: 'der Teil der Streuung, der trotz Gerade übrig bleibt' },
    { key: 'sse', sym: 'SSE', say: 'S S E', term: 'Residuen & kleinste Quadrate', plain: 'die quadrierten Abstände zur Geraden, zusammengezählt', concept: 'residuals' },
    { key: 'sst', sym: 'SST', say: 'S S T', term: 'Quadratsumme der Abweichungen', plain: 'die quadrierten Abstände zum Mittelwert, ganz ohne Gerade', concept: 'ss' },
  ],
  symbolic: [{ part: ['R²'], m: 'r2' }, ' = 1 − ', { frac: [{ part: ['SSE'], m: 'sse' }], den: [{ part: ['SST'], m: 'sst' }], m: 'rest' }],
  aria: 'R Quadrat gleich 1 minus S S E geteilt durch S S T',
  numeric: s => [{ part: ['R²'], m: 'r2' }, ' = 1 − ', { part: [num(s.sse)], m: 'sse' }, ' / ', { part: [num(s.sst)], m: 'sst' }, ` ≈ 1 − ${num(s.share)} ≈ `, { part: [num(s.r2)], m: 'r2' }],
  sentence: [{ m: 'r2', t: 'R²' }, ' ist eins minus ', { m: 'rest', t: 'den Anteil der Streuung, der trotz Gerade übrig bleibt' }, ': ', { m: 'sse', t: 'die Quadratsumme der Residuen' }, ' geteilt durch ', { m: 'sst', t: 'die Quadratsumme um den Mittelwert' }, '.'],
  worked: s => [
    { title: 'Den Rest durch das Ganze teilen', text: `${num(s.sse)} / ${num(s.sst)} ≈ ${num(s.share)}. So viel der Streuung bleibt trotz Gerade übrig.` },
    { title: 'Von eins abziehen', text: `1 − ${num(s.share)} ≈ ${num(s.r2)}. Das ist der Anteil, den die Gerade erfasst.` },
    { title: 'In Prozent sagen', text: s.r2 >= 0 ? `Die Gerade erfasst ${pct(s.r2)} der Streuung um den Mittelwert.` : 'Ein negatives Ergebnis heißt: Die Gerade liegt weiter daneben als der Mittelwert allein.' },
  ],
  fehler: 'R² ist kein Anteil von Personen. R² = 0,29 heißt nicht, dass die Gerade 29 % der Befragten richtig vorhersagt. Es heißt: Die Quadratsumme schrumpft mit der Geraden um 29 %.',
  sliders: [
    { key: 'sse', label: 'Quadratsumme der Residuen, SSE', min: 0, max: 2500, step: 1, format: v => num(v) },
    { key: 'sst', label: 'Quadratsumme um den Mittelwert, SST', min: 100, max: 2500, step: 1, format: v => num(v) },
  ],
  quick: [
    { label: 'Nur Lernzeit (R)', mark: 'sse', apply: () => ({ sse: QS.sse, sst: QS.sst }) },
    { label: 'Lernzeit und Alter (R)', mark: 'sse', apply: () => ({ sse: QS.sse2, sst: QS.sst }) },
    { label: 'Ohne Gerade: SSE gleich SST', mark: 'rest', apply: v => ({ ...v, sse: v.sst }) },
    { label: 'Alle Punkte auf der Geraden', mark: 'sse', apply: v => ({ ...v, sse: 0 }) },
  ],
  compare: s => s.r2 >= 0
    ? `Ohne Gerade beträgt die Quadratsumme ${num(s.sst)}, mit Gerade ${num(s.sse)}. Die Gerade verkleinert sie um ${pct(s.r2)}.`
    : `Ohne Gerade beträgt die Quadratsumme ${num(s.sst)}, mit Gerade ${num(s.sse)}. Die Gerade läge also weiter daneben als der Mittelwert.`,
  check: {
    question: 'Ohne Gerade beträgt die Quadratsumme 200, mit Gerade 150. Wie groß ist R²?',
    answer: 0.25, tolerance: 0.011,
    right: 'Genau, 0,25: 1 − 150 / 200 = 1 − 0,75 = 0,25.',
    diagnose: v => close(v, 0.75) ? 'Fast! 0,75 ist der Anteil, der übrig bleibt. R² ist eins minus diesen Anteil.'
      : close(v, -0.25) ? 'Fast! Andersherum abgezogen: 1 − 0,75, nicht 0,75 − 1.'
      : close(v, 50) ? 'Fast! 50 ist der Unterschied der beiden Summen. Teil ihn noch durch 200.'
      : close(v, 4 / 3) ? 'Fast! Andersherum geteilt: SSE steht oben, SST unten.'
      : close(v, 25) ? 'Fast! Das sind Prozent. Als Anteil ist R² = 0,25.'
      : 'Noch nicht ganz. Teile zuerst 150 durch 200 und zieh das Ergebnis von 1 ab.',
  },
  interpret: s => {
    if (s.sse < 1e-9) return { kurz: 'Alle Punkte liegen auf der Geraden. Es bleibt keine Streuung übrig, R² ist 1.', fachlich: 'SSE = 0, also R² = 1 − 0 = 1.' };
    if (s.r2 < 0) return {
      kurz: 'Mit diesen Zahlen läge die Gerade weiter daneben als der Mittelwert allein. Auf den Daten, an die sie angepasst wurde, kann das nicht passieren. Bei neuen Personen schon.',
      fachlich: `1 − ${num(s.sse)} / ${num(s.sst)} ≈ ${num(s.r2)}. Für eine Gerade mit Achsenabschnitt, angepasst an genau diese Daten, ist SSE nie größer als SST.`,
    };
    return {
      kurz: `Die Gerade erfasst ${pct(s.r2)} der Streuung. ${pct(s.share)} bleiben in den Residuen, also bei allem, was die Gerade nicht vorhersagt.`,
      fachlich: `R² = 1 − ${num(s.sse)} / ${num(s.sst)} ≈ ${num(s.r2)}. ${isLernzeit(s) ? 'Mit nur einem Prädiktor ist R² das Quadrat von Pearson-r: Bei den 200 Befragten ist r ≈ 0,54, und 0,54 · 0,54 ≈ 0,29.' : 'Mit nur einem Prädiktor ist R² das Quadrat von Pearson-r.'}`,
    };
  },
  think: {
    question: 'Du nimmst zur Lernzeit noch das Alter dazu. Was macht R² bei denselben 200 Befragten?',
    options: ['kann sinken', 'bleibt gleich oder steigt', 'verdoppelt sich'], correct: 1, mark: 'sse',
    explain: 'Mit einem weiteren Prädiktor liegt die Gerade nie weiter daneben als vorher. Hier sinkt SSE von 1.370,27 auf 1.368,22, und R² wächst um gut 0,001.',
    kurz: 'Mehr Prädiktoren machen R² auf denselben Daten nie kleiner.',
    hint: 'Probier oben „Lernzeit und Alter (R)“ aus.',
  },
  genau: {
    kurz: 'R² beschreibt nur die Daten, an die die Gerade angepasst wurde. Für neue Personen und für logistische Modelle gilt es so nicht.',
    paragraphs: [
      'Mit Achsenabschnitt zerfällt die Quadratsumme auf den angepassten Daten in zwei Teile: SST = SSR + SSE, hier 1.931,88 = 561,6 + 1.370,27. R² ist dann SSR / SST und liegt zwischen 0 und 1.',
      'Mehr Prädiktoren machen R² nie kleiner. Das korrigierte R² zieht dafür etwas ab: Im Leitaufruf mit Lernzeit und Alter meldet R Adjusted R Square 0.285 statt R Square 0.292.',
      'Bei neuen Personen kann 1 − SSE / SST sogar negativ werden. Dann sagt das Modell schlechter vorher als der Mittelwert (Begriff „Überanpassung“).',
      'Ein großes R² belegt keine Ursache und keine gute Vorhersage für einzelne Personen. Die Pseudo-R²-Werte der logistischen Regression sind keine Anteile erklärter Varianz.',
    ],
  },
};

export const erklaerteVarianzTabs: ConceptTabs = {
  sample: {
    // Feste Spalten (IB32): Die Vorhersagen sprechen von Stunden und Aufgaben und gelten nur für diese beiden Spalten.
    kind: 'analysis', columns: { x: 'lernzeit', y: 'wissenstest' },
    kurz: 'Dieselbe Frage mit allen 200 Befragten: Welchen Anteil der Streuung erfasst die Gerade?',
    value: c => lineFor(c).fit.r2,
    result: c => {
      const { x, y, fit } = lineFor(c), tx = `„${sampleColumnInfo(x).title}“`, ty = `„${sampleColumnInfo(y).title}“`;
      if (fit.r2 === null || fit.b1 === null) return { kurz: 'Eine der beiden Spalten streut nicht. Dann gibt es kein R².', fachlich: 'SST oder die Quadratsumme von x ist 0.' };
      const r = Math.sign(fit.b1) * Math.sqrt(Math.max(0, fit.r2));
      return {
        kurz: `Die Gerade aus ${tx} erfasst ${pct(fit.r2)} der Streuung von ${ty}. Der Rest, ${pct(1 - fit.r2)}, bleibt in den Residuen.`,
        fachlich: `R² = 1 − ${num(fit.sse)} / ${num(fit.sst)} ≈ ${num(fit.r2)}. Das ist das Quadrat der Pearson-Korrelation r ≈ ${num(r)}.`,
        zusatz: `Mit der Geraden sinkt die Quadratsumme von ${num(fit.sst)} auf ${num(fit.sse)}.`,
      };
    },
    voraussetzung: 'R² gilt für die Gerade auf genau diesen Daten. Es erfasst nur einen geraden Zusammenhang und sagt nichts über Ursachen.',
    think: [
      {
        question: 'Der Wissenstest wird umgepolt: Aus vielen gelösten Aufgaben werden wenige. Was macht R²?', options: ['wird negativ', 'bleibt gleich', 'wird 0'], correct: 1,
        explain: 'Die Gerade fällt jetzt, statt zu steigen. Die Abstände zur Geraden und zum Mittelwert bleiben aber gleich groß, also auch beide Quadratsummen.',
        kurz: 'R² kennt keine Richtung, nur die Stärke.',
        tryIt: { label: 'Wissenstest umpolen (20 minus Aufgaben)', op: 'reverse', column: 'y' },
        expect: { change: 'same' },
      },
      {
        question: 'Alle lernen eine Stunde mehr. Was macht R²?', options: ['wird größer', 'bleibt gleich', 'wird kleiner'], correct: 1,
        explain: 'Die Gerade rückt um eine Stunde nach rechts und trifft dieselben Punkte genauso gut wie vorher. SSE und SST bleiben gleich.',
        kurz: 'Verschieben ändert nichts an der Güte der Geraden.',
        tryIt: { label: 'alle eine Stunde mehr', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'same' },
      },
      {
        question: 'Die gewählte Person lernt plötzlich 40 Stunden, ihr Wissenstest bleibt. Was macht R²?', options: ['steigt', 'sinkt, je nach ihrem Wissenstest kaum oder deutlich', 'bleibt genau gleich'], correct: 1,
        explain: 'Bei 40 Stunden liegt sie weit unter der bisherigen Geraden, denn so viele Aufgaben gibt es gar nicht. Löst sie wenige, passt die Gerade viel schlechter; löst sie viele, nur etwas schlechter.',
        kurz: 'Ein Punkt weit draußen kann R² stark drücken.',
        tryIt: { label: 'die gewählte Person auf 40 Stunden', op: 'outlier', column: 'x', value: 40 },
        expect: { change: 'down' },
      },
    ],
  },
  r: {
    entry: 'linear_regression', variant: 0,
    tokens: { linear_regression: LINEAR_REGRESSION_TOKEN, modell: MODELL },
    outputMap: [
      { match: '0.292', atlas: 'R²', explain: 'R Square ist R² für das Modell mit Lernzeit und Alter. Mit der Lernzeit allein ist R² fast gleich groß, 0,29.' },
      { match: '0.285', atlas: 'korrigiertes R²', explain: 'Adjusted R Square zieht für jeden Prädiktor etwas ab. So wird R² nicht allein durch mehr Prädiktoren größer.' },
      { match: '1368.215', atlas: 'SSE', explain: 'Residual: die Quadratsumme, die trotz Modell übrig bleibt.' },
      { match: '1931.875', atlas: 'SST', explain: 'Total: die Quadratsumme um den Mittelwert. 1 − 1.368,22 / 1.931,88 ≈ 0,29.' },
    ],
    check: {
      question: 'Welche Zahl in der Ausgabe ist R²? Tippe sie an.', correct: '0.292',
      wrong: {
        '0.285': 'Fast! Das ist das korrigierte R², Adjusted R Square. Gefragt ist R Square.',
        '0.540': 'Fast! Das ist R, die Wurzel aus R². R² steht eine Zeile tiefer.',
        '1368.215': 'Fast! Das ist SSE, die Quadratsumme der Residuen. R² steht oben unter Model Summary.',
      },
    },
  },
  next: {
    next: { id: 'overfitting', why: 'Ein hohes R² auf den eigenen Daten sagt wenig darüber, wie gut das Modell neue Personen vorhersagt.' },
    before: [
      { id: 'residuals', why: 'SSE, die Quadratsumme der Residuen.' },
      { id: 'ss', why: 'SST, die Quadratsumme um den Mittelwert.' },
      { id: 'pearson', why: 'Mit einem Prädiktor ist R² das Quadrat von r.' },
    ],
    after: [
      { id: 'multicollinearity', why: 'Der VIF rechnet mit dem R² eines Prädiktors aus den anderen Prädiktoren.' },
      { id: 'likelihood', why: 'Logistische Modelle messen ihre Güte über die Likelihood statt über R².' },
    ],
    more: [
      { id: 'effect', why: 'R² dient auch als Effektgröße eines Modells.' },
      { id: 'oneway_anova', why: 'Dieselbe Zerlegung der Quadratsumme, für Gruppen statt einer Geraden.' },
    ],
  },
};
