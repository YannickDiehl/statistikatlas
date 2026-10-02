// Formel als Satz „Wahrscheinlichkeit, Odds & Logit“ (Bereich B13) mit Reitern. Beispiel: 82 von 200 Befragten
// haben eine Weiterbildung gemacht. Referenzwerte aus R in b13-regression.test.ts.
import type { ConceptTabs, SentenceTemplate } from '../../types';
import { num, count, close } from '../../format';
import { sampleColumn } from '../../sample';
import { MODELL } from './gerade-tabs';
import { FACTORS_TOKEN, LOGISTIC_TOKEN } from './logistisch-kit';

export type LogitValues = { p: number };
export type LogitStats = LogitValues & { q: number; odds: number; logit: number };
const shown = (v: number) => Math.round(v * 100) / 100;
/** „etwa 69 Ja-Fälle“: Odds als Ja-Fälle auf 100 Nein-Fälle. */
const perHundred = (odds: number) => { const k = Math.round(odds * 100); return `${count(k)} ${k === 1 ? 'Ja-Fall' : 'Ja-Fälle'}`; };
/** Hinweis, wenn der Logarithmus der angezeigten Odds anders rundet als der genaue Logit. */
const fullDigits = (s: LogitStats) => num(Math.log(shown(s.odds))) === num(s.logit) ? '' : ' (mit allen Nachkommastellen)';

export const logitSatz: SentenceTemplate<LogitValues, LogitStats> = {
  concept: 'logit',
  picture: 'b13-logit',
  wofuer: 'Von den 200 Befragten haben 82 in den letzten zwölf Monaten eine Weiterbildung gemacht, also 41 %. Wahrscheinlichkeiten liegen immer zwischen 0 und 1. Für die logistische Regression braucht man eine Zahl ohne diese Grenzen: den Logit.',
  kurz: 'Der Logit übersetzt eine Wahrscheinlichkeit in eine Zahl ohne Grenzen. Über 50 % wird er positiv, darunter negativ.',
  fachlich: 'logit(p) = ln(p / (1 − p)), der natürliche Logarithmus der Odds. Umgekehrt gilt p = 1 / (1 + e^(−logit)).',
  initial: { p: 0.41 },
  compute: v => { const q = 1 - v.p, odds = v.p / q; return { ...v, q, odds, logit: Math.log(odds) }; },
  metrics: [
    { label: 'Odds', value: s => num(s.odds) },
    { label: 'Logit', value: s => num(s.logit) },
  ],
  glyphs: [
    { key: 'logit', sym: 'logit(p)', say: 'Logit von p', term: 'Wahrscheinlichkeit, Odds & Logit', plain: 'die Odds auf einer Skala ohne Grenzen', concept: 'logit' },
    { key: 'ln', sym: 'ln', say: 'L N', term: 'Natürlicher Logarithmus', plain: 'zu welcher Hochzahl man e ≈ 2,72 nehmen muss, um die Zahl zu bekommen' },
    { key: 'odds', sym: 'p / (1 − p)', say: 'p durch eins minus p', term: 'Odds', plain: 'Ja-Fälle je Nein-Fall' },
    { key: 'p', sym: 'p', say: 'p', term: 'Ereignis & Wahrscheinlichkeit', plain: 'wie wahrscheinlich das Ereignis ist, zwischen 0 und 1', concept: 'probability' },
    { key: 'q', sym: '1 − p', say: 'eins minus p', term: 'Gegenwahrscheinlichkeit', plain: 'wie wahrscheinlich das Ereignis nicht eintritt' },
  ],
  symbolic: [{ part: ['logit(p)'], m: 'logit' }, ' = ', { part: ['ln'], m: 'ln' }, '( ', { frac: [{ part: ['p'], m: 'p' }], den: [{ part: ['1 − p'], m: 'q' }], m: 'odds' }, ' )'],
  aria: 'Logit von p gleich natürlicher Logarithmus von p geteilt durch eins minus p',
  numeric: s => [{ part: ['logit'], m: 'logit' }, ' = ', { part: ['ln'], m: 'ln' }, '(', { part: [num(s.p)], m: 'p' }, ' / ', { part: [num(s.q)], m: 'q' }, ') ≈ ', { part: ['ln'], m: 'ln' }, '(', { part: [num(s.odds)], m: 'odds' }, ') ≈ ', { part: [num(s.logit)], m: 'logit' }],
  sentence: ['Der ', { m: 'logit', t: 'Logit' }, ' ist ', { m: 'ln', t: 'der natürliche Logarithmus' }, ' der ', { m: 'odds', t: 'Odds' }, ', also ', { m: 'p', t: 'der Wahrscheinlichkeit' }, ' geteilt durch ', { m: 'q', t: 'ihre Gegenwahrscheinlichkeit' }, '.'],
  worked: s => [
    { title: 'Die Gegenwahrscheinlichkeit bilden', text: `1 − ${num(s.p)} = ${num(s.q)}.` },
    { title: 'Die Odds bilden', text: `${num(s.p)} / ${num(s.q)} ≈ ${num(s.odds)}. Auf 100 Nein-Fälle kommen etwa ${perHundred(s.odds)}.` },
    { title: 'Den Logarithmus ziehen', text: `ln(${num(s.odds)}) ≈ ${num(s.logit)}${fullDigits(s)}.` },
  ],
  fehler: 'Odds sind keine Wahrscheinlichkeit. Odds von 0,69 heißen nicht 69 %, sondern: Auf 118 Befragte ohne Weiterbildung kommen 82 mit. Die Wahrscheinlichkeit bleibt 41 %.',
  sliders: [{ key: 'p', label: 'Wahrscheinlichkeit p', min: 0.01, max: 0.99, step: 0.01, format: v => num(v) }],
  quick: [
    { label: 'Weiterbildung: 82 von 200', mark: 'p', apply: () => ({ p: 0.41 }) },
    { label: 'Halb und halb: p = 0,5', mark: 'logit', apply: () => ({ p: 0.5 }) },
    { label: 'Ja und Nein tauschen', mark: 'q', apply: v => ({ p: shown(1 - v.p) }) },
  ],
  compare: s => `p = ${num(s.p)}, Odds ≈ ${num(s.odds)}, Logit ≈ ${num(s.logit)}. ${Math.abs(s.p - 0.5) < 1e-9 ? 'Bei genau 50 % ist der Logit 0.' : s.p > 0.5 ? 'Über 50 % ist der Logit positiv.' : 'Unter 50 % ist der Logit negativ.'}`,
  check: {
    question: 'Die Wahrscheinlichkeit ist 0,8. Wie groß sind die Odds?',
    answer: 4, tolerance: 0.011,
    right: 'Genau, 4: 0,8 / 0,2 = 4. Auf einen Nein-Fall kommen vier Ja-Fälle.',
    diagnose: v => close(v, 0.25) ? 'Fast! Andersherum: p steht oben, 1 − p unten.'
      : close(v, 0.2) ? 'Fast! 0,2 ist die Gegenwahrscheinlichkeit 1 − p. Teile noch 0,8 durch 0,2.'
      : close(v, 0.8) ? 'Fast! Das ist noch p selbst. Die Odds teilen p durch 1 − p.'
      : close(v, Math.log(4)) ? 'Fast! Das ist schon der Logit, ln(4). Gefragt sind die Odds selbst.'
      : 'Noch nicht ganz. Teile p durch 1 − p.',
  },
  interpret: s => {
    if (Math.abs(s.p - 0.5) < 1e-9) return { kurz: 'Ja und Nein sind gleich wahrscheinlich. Die Odds sind 1, der Logit ist 0.', fachlich: 'logit(0,5) = ln(0,5 / 0,5) = ln(1) = 0.' };
    return {
      kurz: `Bei p = ${num(s.p)} stehen die Odds bei ${num(s.odds)}: Auf 100 Nein-Fälle kommen etwa ${perHundred(s.odds)}. Der Logit ist ${num(s.logit)}, ${s.p > 0.5 ? 'positiv, weil Ja wahrscheinlicher ist' : 'negativ, weil Nein wahrscheinlicher ist'}.`,
      fachlich: `logit(${num(s.p)}) = ln(${num(s.p)} / ${num(s.q)}) ≈ ${num(s.logit)}. Die Odds reichen von 0 bis unendlich, der Logit von minus bis plus unendlich.`,
    };
  },
  think: {
    question: 'Ja und Nein tauschen: Aus p wird 1 − p. Was passiert mit dem Logit?',
    options: ['wird 0', 'wechselt das Vorzeichen', 'halbiert sich'], correct: 1, mark: 'logit',
    explain: 'Die Odds werden zu ihrem Kehrwert: 0,41 / 0,59 wird zu 0,59 / 0,41. Der Logarithmus eines Kehrwerts ist der Logarithmus mit umgekehrtem Vorzeichen.',
    kurz: 'Ja und Nein tauschen heißt: Logit mal minus eins.',
    hint: 'Probier oben „Ja und Nein tauschen“ aus.',
  },
  genau: {
    kurz: 'Logit und Wahrscheinlichkeit hängen nicht gerade zusammen. In der Mitte ändert sich p mit dem Logit schnell, an den Rändern langsam.',
    paragraphs: [
      'Zurück geht es mit der logistischen Funktion p = 1 / (1 + e^(−logit)). Aus −0,36 wird wieder 1 / (1 + e^0,36) ≈ 0,41.',
      'ln ist der natürliche Logarithmus zur Basis e ≈ 2,718. In R heißt er log().',
      'Bei p = 0 oder p = 1 ist der Logit nicht definiert, denn die Odds wären 0 oder unendlich groß. Deshalb endet der Regler bei 0,01 und 0,99.',
      'In der logistischen Regression ist der Logit der lineare Prädiktor. e hoch ein Koeffizient ist eine Odds Ratio: Sie nimmt die Odds mal, nicht die Wahrscheinlichkeit.',
    ],
  },
};

/** Anteil, Odds und Logit der Spalte x (Standard: Weiterbildung) für die aktuellen Daten. */
export function shareFor(rows: Parameters<typeof sampleColumn>[0], column: string) {
  const v = sampleColumn(rows, column), k = v.filter(x => x === 1).length, n = v.length, p = k / n;
  return { k, n, p, odds: k / (n - k), logit: Math.log(k / (n - k)) };
}

export const logitTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'weiterbildung' },
    kurz: 'Dieselbe Rechnung mit allen 200 Befragten: Wie stehen die Odds, in den letzten zwölf Monaten eine Weiterbildung gemacht zu haben?',
    value: c => { const s = shareFor(c.rows, c.columns.x?.[0] ?? 'weiterbildung'); return s.k > 0 && s.k < s.n ? s.logit : null; },
    result: c => {
      const s = shareFor(c.rows, c.columns.x?.[0] ?? 'weiterbildung');
      if (s.k === 0 || s.k === s.n) return { kurz: 'Alle haben dieselbe Antwort gegeben. Dann sind Odds und Logit nicht definiert.', fachlich: 'Bei p = 0 oder p = 1 ist der Logit nicht definiert.' };
      return {
        kurz: `${s.k} von ${s.n} Befragten haben in den letzten zwölf Monaten eine Weiterbildung gemacht, also p = ${num(s.p)}. Die Odds sind ${num(s.odds)}, der Logit ${num(s.logit)}.`,
        fachlich: `Mit den Anzahlen geht es direkt: Odds = ${s.k} / ${s.n - s.k} ≈ ${num(s.odds)}, logit = ln(${s.k} / ${s.n - s.k}) ≈ ${num(s.logit)}.`,
        zusatz: `Auf ${s.n - s.k} Befragte ohne Weiterbildung kommen ${s.k} mit.`,
      };
    },
    voraussetzung: 'Der Anteil beschreibt diese 200 Befragten. Für alle Erwachsenen wäre er nur eine Schätzung.',
    think: [
      {
        question: 'Die Weiterbildung wird umgepolt: Aus Ja wird Nein und aus Nein Ja. Was passiert mit dem Logit?', options: ['bleibt gleich', 'wechselt das Vorzeichen', 'wird 0'], correct: 1,
        explain: 'Aus 82 zu 118 wird 118 zu 82. Die Odds werden zu ihrem Kehrwert, und der Logarithmus wechselt dabei sein Vorzeichen.',
        kurz: 'Ja und Nein tauschen dreht den Logit um.',
        tryIt: { label: 'Weiterbildung umpolen (Ja und Nein tauschen)', op: 'reverse', column: 'x' },
        expect: { change: 'sign' },
      },
    ],
  },
  r: {
    entry: 'logistic_regression', variant: 0,
    tokens: { logistic_regression: LOGISTIC_TOKEN, factors: FACTORS_TOKEN, modell: MODELL },
    outputMap: [
      { match: '-0.006', atlas: 'Logit je Stunde', explain: 'B steht auf der Logit-Skala: Je Stunde Lernzeit ändert sich der Logit einer Weiterbildung um −0,006, also fast gar nicht.' },
      { match: '0.994', atlas: 'Odds Ratio', explain: 'Exp(B) ist e hoch B: Je Stunde werden die Odds mit 0,994 malgenommen und bleiben fast gleich.' },
      { match: '0.011', atlas: 'Logit bei 0 Stunden und Alter 0', explain: 'B der Zeile (Intercept): der Logit, wenn alle Prädiktoren 0 sind.' },
      { match: '0.4225702', atlas: 'p von P001', explain: 'predict(modell, type = "response") rechnet den Logit in eine Wahrscheinlichkeit zurück, hier für P001: 0,42.' },
    ],
    check: {
      question: 'Welche Zahl sagt, wie sich der Logit je Stunde Lernzeit ändert? Tippe sie an.', correct: '-0.006',
      wrong: {
        '0.994': 'Fast! Das ist Exp(B), die Odds Ratio. Die Änderung des Logits steht unter B.',
        '0.4225702': 'Fast! Das ist eine Wahrscheinlichkeit aus predict(). Die Änderung des Logits steht unter B.',
      },
    },
  },
  next: {
    next: { id: 'logistic_regression', why: 'Sie legt eine Gerade auf die Logit-Skala und rechnet sie in Wahrscheinlichkeiten zurück.' },
    before: [
      { id: 'probability', why: 'p, aus der Odds und Logit entstehen.' },
      { id: 'bernoulli_distribution', why: 'Ja oder Nein mit der Wahrscheinlichkeit p.' },
    ],
    after: [
      { id: 'likelihood', why: 'Wie die logistische Regression die passenden Logits findet.' },
      { id: 'marginal_effects', why: 'Übersetzt Änderungen des Logits zurück in Prozentpunkte.' },
    ],
    more: [{ id: 'crosstab', why: 'Odds lassen sich auch aus einer Vierfeldertafel ablesen.' }],
  },
};
