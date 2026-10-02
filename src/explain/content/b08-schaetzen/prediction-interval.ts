// Formel als Satz „Vorhersageintervall“ (prediction_interval). Beispiel: Gerade Wissenstest auf Lernzeit der 200 Befragten;
// eine neue Person mit x₀ Stunden. ŷ₀ ± t · sₑ · √(1 + h₀) gegen das Konfidenzintervall mit √h₀. Regler: x₀, Fallzahl,
// Niveau. Bild 'b08-vorhersage'. Reiter: dieselbe Rechnung bei x₀ = x̄ der aktuellen Daten; In R linear_regression().
import type { ConceptTabs, SampleCtx, SentenceTemplate } from '../../types';
import { close, count, num, unit } from '../../format';
import { sampleColumn } from '../../sample';
import { gerade, small } from './daten';
import { kritisch } from './confidence';

/** Gerade Wissenstest auf Lernzeit der 200 Befragten (Ausgangsdaten), in R nachgerechnet. */
export const GERADE = { n: 200, a: 6.1028182424, b: 0.5188907641, se: 2.630697799, mx: 7.7515, my: 10.125, ssx: 2085.81955 } as const;

export type PiValues = { x: number; n: number; t: number };
export type PiStats = PiValues & { yhat: number; h: number; df: number; tq: number; half: number; lo: number; hi: number; ciHalf: number; ciLo: number; ciHi: number; ssx: number };

/** Vorhersage- und Konfidenzintervall an der Stelle x₀, für n Befragte bei gleicher Geraden und gleicher Streuung. */
export function vorhersage(v: PiValues, g: { a: number; b: number; se: number; mx: number; ssx: number; n: number } = GERADE): PiStats {
  const ssx = g.ssx / (g.n - 1) * (v.n - 1), h = 1 / v.n + (v.x - g.mx) ** 2 / ssx, df = v.n - 2, tq = kritisch(v.t, df);
  const yhat = g.a + g.b * v.x, half = tq * g.se * Math.sqrt(1 + h), ciHalf = tq * g.se * Math.sqrt(h);
  return { ...v, yhat, h, df, tq, half, lo: yhat - half, hi: yhat + half, ciHalf, ciLo: yhat - ciHalf, ciHi: yhat + ciHalf, ssx };
}

/** Dieselbe Rechnung mit den aktuellen Daten (x Lernzeit, y Wissenstest), für eine neue Person mit x₀ = x̄. */
export function vorhersageDaten(c: SampleCtx) {
  const xs = sampleColumn(c.rows, c.columns.x?.[0] ?? 'lernzeit'), ys = sampleColumn(c.rows, c.columns.y?.[0] ?? 'wissenstest');
  const g = gerade(xs, ys), p = vorhersage({ x: g.mx, n: g.n, t: 95 }, g);
  const inside = g.residuals.filter(r => Math.abs(r) <= p.half + 1e-12).length;
  return { ...p, se: g.se, mx: g.mx, inside, N: g.n };
}

const START: PiValues = { x: 10, n: 200, t: 95 };

export const predictionInterval: SentenceTemplate<PiValues, PiStats> = {
  concept: 'prediction_interval',
  picture: 'b08-vorhersage',
  wofuer: 'Wie viele Aufgaben im Wissenstest löst eine Person, die in den letzten sieben Tagen 10 Stunden gelernt hat? Die Gerade aus den 200 Befragten gibt eine Zahl. Aber wie weit kann eine einzelne neue Person davon abweichen?',
  kurz: 'Ein Vorhersageintervall ist ein Bereich plausibler Werte für eine einzelne neue Person. Es ist viel breiter als das Konfidenzintervall, weil einzelne Menschen um die Gerade streuen.',
  fachlich: 'Ein Bereich für den Wert einer neuen Person bei festgelegten Prädiktorwerten. Er berücksichtigt die Unsicherheit der geschätzten Geraden und die zusätzliche Streuung einzelner Personen.',
  initial: START,
  compute: v => vorhersage(v),
  metrics: [
    { label: 'Vorhersage ŷ₀', value: s => `${num(s.yhat)} Aufgaben` },
    { label: 'Vorhersageintervall', value: s => `${num(s.lo)} bis ${num(s.hi)}` },
    { label: 'Konfidenzintervall für den Mittelwert', value: s => `${num(s.ciLo)} bis ${num(s.ciHi)}` },
  ],
  glyphs: [
    { key: 'yhat', sym: 'ŷ₀', say: 'y Dach null', term: 'Linearer Prädiktor', plain: 'die Vorhersage der Geraden für die neue Person', concept: 'prediction' },
    { key: 't', sym: 't', say: 't', term: 'Kritischer Wert & Ablehnungsbereich', plain: 'wie viele Streuungseinheiten man nach jeder Seite geht; bei 95 % knapp 2', concept: 'critical_value' },
    { key: 'se', sym: 'sₑ', say: 's e', term: 'Standardfehler der Schätzung', plain: 'wie weit die Befragten typischerweise neben der Geraden liegen' },
    { key: 'eins', sym: '1', say: 'eins', term: 'Streuung der neuen Person', plain: 'die neue Person streut um die Gerade wie alle anderen' },
    { key: 'h', sym: 'h₀', say: 'h null', term: 'Hebelwert', plain: 'wie unsicher die Gerade an der Stelle x₀ ist; wächst mit dem Abstand zur Mitte' },
    { key: 'x', sym: 'x₀', say: 'x null', term: 'Lernzeit der neuen Person', plain: 'die Stelle, für die du vorhersagst' },
    { key: 'n', sym: 'n', say: 'n', term: 'Fallzahl', plain: 'wie viele Befragte die Gerade tragen' },
  ],
  symbolic: [
    { part: ['ŷ₀'], m: 'yhat' }, ' ± ', { part: ['t'], m: 't' }, ' · ', { part: ['sₑ'], m: 'se' }, ' · ',
    { big: '√', m: 'h' }, { root: [{ part: ['1'], m: 'eins' }, ' + ', { part: ['h₀'], m: 'h' }], m: 'h' },
    ',  h₀ = 1 / ', { part: ['n'], m: 'n' }, ' + (', { part: ['x₀'], m: 'x' }, ' − x̄)² / Σ(xᵢ − x̄)²',
  ],
  aria: 'y Dach null plus minus t mal s e mal Wurzel aus eins plus h null; h null gleich eins durch n plus x null minus x quer zum Quadrat, geteilt durch die Quadratsumme der x',
  numeric: s => [
    { part: [num(s.yhat)], m: 'yhat' }, ' ± ', { part: [num(s.tq)], m: 't' }, ' · ', { part: [num(GERADE.se)], m: 'se' }, ' · √(',
    { part: ['1'], m: 'eins' }, ' + ', { part: [small(s.h)], m: 'h' }, `) ≈ ${num(s.yhat)} ± ${num(s.half)}`, { br: true },
    `= ${num(s.lo)} bis ${num(s.hi)} Aufgaben`,
  ],
  sentence: [
    'Das Vorhersageintervall reicht von ', { m: 'yhat', t: 'der Vorhersage der Geraden' }, ' aus um ', { m: 't', t: 'den kritischen Wert' }, ' mal ',
    { m: 'se', t: 'die Streuung um die Gerade' }, ' mal die Wurzel aus ', { m: 'eins', t: 'eins' }, ' plus ', { m: 'h', t: 'dem Hebelwert' },
    ' nach unten und nach oben. Der Hebelwert wird kleiner mit ', { m: 'n', t: 'mehr Befragten' }, ' und größer, je weiter ',
    { m: 'x', t: 'die Lernzeit der neuen Person' }, ' von der Mitte entfernt ist.',
  ],
  worked: s => [
    { title: 'Die Vorhersage ablesen', text: `Die Gerade ŷ = ${num(GERADE.a)} + ${num(GERADE.b)} · x sagt für ${unit(s.x, 'Stunde', 'Stunden')} ${num(s.yhat)} Aufgaben voraus, mit allen Nachkommastellen gerechnet.` },
    { title: 'Den Hebelwert ausrechnen', text: `h₀ = 1 / ${count(s.n)} + (${num(s.x)} − ${num(GERADE.mx)})² / ${count(s.ssx)} ≈ ${small(s.h)}.` },
    { title: 'Die halbe Breite ausrechnen', text: `${num(s.tq)} · ${num(GERADE.se)} · √(1 + ${small(s.h)}) ≈ ${num(s.half)} Aufgaben nach jeder Seite.` },
    { title: 'Mit dem Konfidenzintervall vergleichen', text: `Für den Mittelwert aller Personen mit ${unit(s.x, 'Stunde', 'Stunden')} fällt die 1 weg: ${num(s.tq)} · ${num(GERADE.se)} · √${small(s.h)} ≈ ${num(s.ciHalf)}. Dieses Intervall reicht nur von ${num(s.ciLo)} bis ${num(s.ciHi)}.` },
  ],
  fehler: 'Das Vorhersageintervall ist nicht das Konfidenzintervall. Für den Mittelwert vieler Personen wird der Bereich mit mehr Befragten immer schmaler; für eine einzelne neue Person bleibt er breit, weil sie selbst streut.',
  sliders: [
    { key: 'x', label: 'Lernzeit der neuen Person in Stunden', min: 0, max: 18, step: 0.5, format: v => `${num(v)} h` },
    { key: 'n', label: 'Fallzahl', min: 10, max: 40000, step: 1, log: true, format: v => count(v) },
    { key: 't', label: 'Niveau', min: 80, max: 99, step: 1, format: v => `${num(v)} %` },
  ],
  quick: [
    { label: 'n mal 100', mark: 'n', apply: v => ({ ...v, n: Math.min(40000, v.n * 100) }) },
    { label: 'x₀ in die Mitte', mark: 'x', apply: v => ({ ...v, x: GERADE.mx }) },
    { label: 'Ausgangswerte', mark: 'yhat', apply: () => ({ ...START }) },
  ],
  compare: s => `Für eine neue Person ist der Bereich ${num(s.hi - s.lo)} Aufgaben breit, für den Mittelwert vergleichbarer Personen nur ${num(s.ciHi - s.ciLo)}.`,
  check: {
    question: 'Unter der Wurzel steht 1 + h₀. Was kommt bei h₀ = 0,44 heraus, wenn du die Wurzel ziehst?',
    answer: 1.2, tolerance: 0.0011,
    right: 'Genau, 1,2: √(1 + 0,44) = √1,44 = 1,2.',
    diagnose: v => close(v, 1.44, 0.0011) ? 'Fast! Das ist 1 + h₀. Jetzt noch die Wurzel ziehen.'
      : close(v, Math.sqrt(0.44), 0.0011) ? 'Fast! Das ist √h₀ allein, wie beim Konfidenzintervall. Beim Vorhersageintervall kommt die 1 unter die Wurzel.'
      : close(v, 1 + Math.sqrt(0.44), 0.0011) ? 'Fast! Die 1 gehört unter die Wurzel: erst 1 + 0,44, dann die Wurzel.'
      : 'Noch nicht ganz. Rechne erst 1 + 0,44 und ziehe dann die Wurzel.',
  },
  interpret: s => ({
    kurz: `Für eine neue Person mit ${unit(s.x, 'Stunde', 'Stunden')} Lernzeit sind ${num(s.lo)} bis ${num(s.hi)} gelöste Aufgaben plausibel. Personen mit dieser Lernzeit lösen im Mittel ${num(s.ciLo)} bis ${num(s.ciHi)} Aufgaben, aber jede einzelne streut viel weiter.${s.hi > 20 || s.lo < 0 ? ' Der Test hat 0 bis 20 Aufgaben; das Modell ist am Rand nur eine Näherung.' : ''}`,
    fachlich: `${num(s.t)}-%-Vorhersageintervall: ŷ₀ ± t · sₑ · √(1 + h₀) = ${num(s.yhat)} ± ${num(s.half)}. Unter dem Modell enthalten etwa ${num(s.t)} % solcher Intervalle den Wert einer neuen, unabhängigen Person. Das Konfidenzintervall für den bedingten Mittelwert nutzt √h₀ und reicht von ${num(s.ciLo)} bis ${num(s.ciHi)}.`,
  }),
  think: {
    question: 'Mit 100-mal so vielen Befragten: Was passiert mit dem Vorhersageintervall?',
    options: ['es schrumpft auf ein Zehntel', 'es wird kaum schmaler', 'es verschwindet fast'], correct: 1, mark: 'eins',
    explain: 'Mehr Befragte verkleinern nur h₀. Die 1 unter der Wurzel bleibt: Die neue Person streut um die Gerade wie alle anderen. Das Konfidenzintervall schrumpft dagegen auf etwa ein Zehntel.',
    kurz: 'Einzelne Menschen bleiben schwer vorherzusagen.',
    hint: 'Probier oben „n mal 100“ aus.',
  },
  genau: {
    kurz: 'Die Formel gilt für ein passend angegebenes lineares Modell mit normalverteilten Fehlern gleicher Varianz. Die neue Person muss unabhängig von den Befragten sein.',
    paragraphs: [
      'Allgemein ist h₀ = x₀ᵀ(XᵀX)⁻¹x₀; x₀ enthält auch die 1 für den Achsenabschnitt. Bei einem einzigen Prädiktor wird daraus 1 / n + (x₀ − x̄)² / Σ(xᵢ − x̄)².',
      `sₑ ist die Wurzel aus SSE / (n − p); p zählt die Koeffizienten einschließlich Achsenabschnitt. Hier ist p = 2 und sₑ ≈ ${num(GERADE.se)} Aufgaben; t kommt aus der t-Verteilung mit n − 2 Freiheitsgraden.`,
      'Das Konfidenzintervall für den bedingten Mittelwert enthält √h₀ statt √(1 + h₀). Ein nominelles 95-%-Vorhersageverfahren deckt unter dem Modell langfristig 95 % solcher neuen Werte ab.',
      'Mit dem Regler für n bleiben Gerade, sₑ und die Streuung der Lernzeit gleich; nur die Zahl der Befragten ändert sich. Für Lernzeiten weit außerhalb der Daten trägt die Gerade nicht.',
      'In R liefert predict() mit interval = "prediction" diese Grenzen; mariposa hat dafür keine eigene Funktion.',
    ],
  },
};

export const predictionIntervalTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'lernzeit', y: 'wissenstest' },
    kurz: 'Dieselbe Formel mit allen 200: Wie viele Aufgaben löst eine neue Person, die so lange lernt wie der Durchschnitt?',
    value: c => 2 * vorhersageDaten(c).half,
    result: c => {
      const p = vorhersageDaten(c);
      return {
        kurz: `Für eine neue Person mit ${unit(p.mx, 'Stunde', 'Stunden')} Lernzeit sagt die Gerade ${num(p.yhat)} Aufgaben voraus. Plausibel sind ${num(p.lo)} bis ${num(p.hi)} gelöste Aufgaben. Für den Mittelwert solcher Personen wären es nur ${num(p.ciLo)} bis ${num(p.ciHi)}.`,
        fachlich: `ŷ₀ ± t · sₑ · √(1 + h₀) = ${num(p.yhat)} ± ${num(p.tq)} · ${num(p.se)} · √(1 + 1 / ${p.N}) ≈ ${num(p.yhat)} ± ${num(p.half)}; an der Stelle x₀ = x̄ ist h₀ = 1 / n.`,
        zusatz: `${p.inside} von ${p.N} Befragten liegen höchstens ${num(p.half)} Aufgaben neben ihrer eigenen Vorhersage.`,
      };
    },
    voraussetzung: 'Die Gerade beschreibt den Zusammenhang gut, die Streuung um sie ist überall gleich, und die neue Person ist unabhängig von den 200.',
    think: [
      {
        question: 'Alle lernen eine Stunde mehr. Was passiert mit der Breite des Vorhersageintervalls für eine Person mit durchschnittlicher Lernzeit?',
        options: ['bleibt gleich', 'steigt', 'sinkt'], correct: 0,
        explain: 'Die Gerade rückt mit, die Streuung um sie bleibt. Auch die durchschnittliche Lernzeit rückt um eine Stunde, also bleibt h₀ = 1 / n.',
        kurz: 'Verschieben ändert die Streuung um die Gerade nicht.',
        tryIt: { label: 'alle eine Stunde mehr', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'same' },
      },
      {
        question: 'Alle lernen doppelt so lange. Was passiert mit der Breite des Vorhersageintervalls?',
        options: ['bleibt gleich', 'verdoppelt sich', 'halbiert sich'], correct: 0,
        explain: 'Die Gerade wird flacher, aber die Personen liegen genauso weit neben ihr wie vorher. Gemessen wird die Breite in Aufgaben, nicht in Stunden.',
        kurz: 'Die Einheit der Lernzeit ändert die Streuung der Aufgaben nicht.',
        tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        expect: { change: 'same' },
      },
      {
        question: 'Eine Person löst plötzlich alle 20 Aufgaben. Was passiert mit der Breite des Vorhersageintervalls?',
        options: ['steigt', 'bleibt genau gleich', 'sinkt'], correct: 0,
        explain: 'Die Person liegt weiter über der Geraden als vorher. Damit wächst sₑ, die Streuung um die Gerade, und das Intervall wird breiter.',
        kurz: 'Mehr Streuung um die Gerade, breitere Vorhersage.',
        tryIt: { label: 'die gewählte Person auf 20 Aufgaben', op: 'outlier', column: 'y', value: 20 },
        expect: { change: 'up' },
      },
    ],
  },
  r: {
    entry: 'linear_regression', variant: 0,
    outputMap: [
      { match: 'Mean', atlas: 'ȳ, mittlerer Wissenstest', explain: 'Die Befragten lösen im Mittel 10,13 Aufgaben. Für eine Person mit durchschnittlicher Lernzeit sagt die Gerade genau diesen Wert voraus.' },
      { match: 'R Square', atlas: 'erklärter Anteil R²', explain: 'Wie viel der Unterschiede im Wissenstest das Modell erfasst. Der Rest ist die Streuung um die Gerade, die das Vorhersageintervall breit macht.' },
      { match: 'Std. Error of the Estimate', atlas: 'sₑ', explain: 'Daneben steht sₑ: So weit liegen die Befragten typischerweise neben ihrer Vorhersage. Dieses Modell nimmt das Alter dazu, ohne Alter sind es 2,63 Aufgaben.' },
      { match: '9.180750', atlas: 'ŷ für P001', explain: 'predict() rechnet für jede Person die Vorhersage aus, für P001 rund 9,18 Aufgaben. Um so einen Wert legt das Vorhersageintervall seinen Bereich.' },
    ],
    check: {
      question: 'Welche Angabe brauchst du für die Breite eines Vorhersageintervalls? Tippe sie an.', correct: 'Std. Error of the Estimate',
      wrong: {
        Mean: 'Fast! Das ist der Mittelwert der gelösten Aufgaben. Für die Breite zählt die Streuung um die Gerade, sₑ.',
        'R Square': 'Fast! R² ist ein Anteil ohne Einheit. Die Breite in Aufgaben kommt aus sₑ, dem Std. Error of the Estimate.',
        '9.180750': 'Fast! Das ist eine Vorhersage, also die Mitte eines Intervalls. Wie breit es ist, sagt sₑ.',
      },
    },
  },
  next: {
    next: { id: 'confidence', why: 'Das schmalere Intervall für den Mittelwert vergleichbarer Personen; ihm fehlt die 1 unter der Wurzel.' },
    before: [
      { id: 'prediction', why: 'Die Vorhersage ŷ₀ der Geraden ist die Mitte des Intervalls.' },
      { id: 'residuals', why: 'Aus den Abständen zur Geraden entsteht sₑ.' },
      { id: 't_distribution', why: 'Liefert den kritischen Wert t mit n − 2 Freiheitsgraden.' },
    ],
    after: [],
    more: [
      { id: 'linear_regression', why: 'Das Modell, aus dem Gerade und sₑ stammen.' },
      { id: 'variance_assumption', why: 'Die Formel nimmt überall dieselbe Streuung um die Gerade an.' },
    ],
  },
};
