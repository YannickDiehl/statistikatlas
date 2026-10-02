// Formel als Satz „Bernoulli-Verteilung“ (Bereich B7): P(X = 1) = p, E(X) = p, Var(X) = p · (1 − p).
// Beispiel: Weiterbildung in den letzten zwölf Monaten, 82 von 200 Befragten (p̂ = 0,41). Zahlen in R nachgerechnet.
// Grenzfall Vorlage: Studierende verschieben p und beobachten Erwartungswert und Varianz; deshalb Formel als Satz.
import type { ConceptTabs, SampleCtx, SentenceTemplate } from '../../types';
import { close, num } from '../../format';
import { ref, titleFor } from '../../../domain/learning';
import { sampleColumn } from '../../sample';
import { prob, shown2 } from './dist';

export type BernValues = { p: number };
export type BernStats = { p: number; q: number; v: number; sd: number };
/** Weiterbildung im Lehrdatensatz: 82 von 200 (R: mean(), var()). */
export const WEITERBILDUNG = { n: 200, k: 82, p: 0.41, var: 0.2419, s2: 0.2431156 } as const;
const T = (id: string) => titleFor(ref(id));
const eq = (v: number, shown: string) => Math.abs(Number(shown.replace(',', '.')) - v) > 1e-9 ? '≈' : '=';
/** „= 0,25“ oder „≈ 0,24“, je nachdem, ob die angezeigte Zahl genau ist. */
export const eqProb = (v: number) => `${eq(v, prob(v))} ${prob(v)}`;

export const bernoulli: SentenceTemplate<BernValues, BernStats> = {
  concept: 'bernoulli_distribution',
  picture: 'b07-bernoulli',
  wofuer: 'Hast du in den letzten zwölf Monaten an einer Weiterbildung teilgenommen? Ja oder nein. Kodiert als 1 und 0 wird jede Antwort zu einem Bernoulli-Versuch. Im Lehrdatensatz sagen 82 von 200 Ja, ein Anteil von 0,41.',
  kurz: 'Die Bernoulli-Verteilung beschreibt eine einzelne Ja-Nein-Frage: 1 mit der Wahrscheinlichkeit p, sonst 0. Ihr Mittelwert ist p, ihre Streuung ist bei halb und halb am größten.',
  fachlich: 'Die Bernoulli-Verteilung beschreibt einen Versuch mit zwei Ausgängen, Erfolg (1) und Misserfolg (0). Ihr Erwartungswert ist die Erfolgswahrscheinlichkeit, ihre Varianz diese mal die Gegenwahrscheinlichkeit.',
  initial: { p: WEITERBILDUNG.p },
  compute: v => { const q = shown2(1 - v.p), variance = v.p * q; return { p: v.p, q, v: variance, sd: Math.sqrt(variance) }; },
  metrics: [
    { label: 'Erwartungswert E(X)', value: s => num(s.p) },
    { label: 'Varianz Var(X)', value: s => prob(s.v) },
  ],
  glyphs: [
    { key: 'p', sym: 'p', say: 'p', term: 'Erfolgswahrscheinlichkeit', plain: 'wie wahrscheinlich eine 1 ist, hier eine Weiterbildung' },
    { key: 'q', sym: '1 − p', say: 'eins minus p', term: 'Gegenwahrscheinlichkeit', plain: 'wie wahrscheinlich eine 0 ist' },
    { key: 'pm', sym: 'P(X = 1)', say: 'P von X gleich 1', term: T('probability_mass'), plain: 'die Wahrscheinlichkeit, mit der genau der Wert 1 vorkommt', concept: 'probability_mass' },
    { key: 'e', sym: 'E(X)', say: 'E von X', term: T('expectation'), plain: 'der Mittelwert vieler Nullen und Einsen auf lange Sicht', concept: 'expectation' },
    { key: 'var', sym: 'Var(X)', say: 'Var von X', term: T('population_variance'), plain: 'wie stark die Nullen und Einsen streuen', concept: 'population_variance' },
  ],
  symbolic: [{ part: ['P(X = 1)'], m: 'pm' }, ' = ', { part: ['p'], m: 'p' }, '     ', { part: ['E(X)'], m: 'e' }, ' = p     ', { part: ['Var(X)'], m: 'var' }, ' = p · ', { part: ['(1 − p)'], m: 'q' }],
  aria: 'P von X gleich 1 ist p. E von X ist p. Var von X ist p mal eins minus p.',
  numeric: s => [{ part: ['P(X = 1)'], m: 'pm' }, ` = ${num(s.p)}     `, { part: ['E(X)'], m: 'e' }, ` = ${num(s.p)}`, { br: true },
    { part: ['Var(X)'], m: 'var' }, ` = ${num(s.p)} · `, { part: [num(s.q)], m: 'q' }, ` ${eqProb(s.v)}`],
  sentence: ['Eine Bernoulli-Variable ist 1 mit ', { m: 'p', t: 'der Wahrscheinlichkeit p' }, ' und 0 mit ', { m: 'q', t: 'der Gegenwahrscheinlichkeit 1 − p' }, '. ',
    { m: 'e', t: 'Ihr Erwartungswert' }, ' ist p, ', { m: 'var', t: 'ihre Varianz' }, ' ist p mal (1 − p).'],
  worked: s => [
    { title: 'Die Gegenwahrscheinlichkeit bilden', text: `1 − ${num(s.p)} = ${num(s.q)}. Mit dieser Wahrscheinlichkeit kommt eine 0.` },
    { title: 'Den Erwartungswert ausrechnen', text: `E(X) = 0 · ${num(s.q)} + 1 · ${num(s.p)} = ${num(s.p)}. Der Mittelwert vieler Nullen und Einsen ist der Anteil der Einsen.` },
    { title: 'Die Varianz ausrechnen', text: `Var(X) = ${num(s.p)} · ${num(s.q)} ${eqProb(s.v)}. Die Standardabweichung ist die Wurzel daraus, ${eqProb(s.sd).replace(/^= /, '').replace(/^≈ /, 'etwa ')}.` },
  ],
  fehler: 'Die Varianz ist nicht p selbst. Bei p = 0,41 ist der Erwartungswert 0,41, die Varianz aber 0,41 · 0,59 ≈ 0,24. Und sie ist bei p = 0,5 am größten, nicht bei p = 1.',
  sliders: [{ key: 'p', label: 'Anteil der Einsen p', min: 0, max: 1, step: 0.01, format: v => num(v) }],
  quick: [
    { label: 'p = 0,5', mark: 'var', apply: () => ({ p: 0.5 }) },
    { label: 'umpolen: 1 − p', mark: 'q', apply: v => ({ p: shown2(1 - v.p) }) },
    { label: 'Anteil im Lehrdatensatz', mark: 'p', apply: () => ({ p: WEITERBILDUNG.p }) },
  ],
  compare: s => `Umgepolt, mit p = ${num(s.q)}, bleibt die Varianz gleich: ${num(s.q)} · ${num(s.p)} ${eqProb(s.v)}.`,
  check: {
    question: 'Wie groß ist die Varianz einer Bernoulli-Variable mit p = 0,2?',
    answer: 0.16, tolerance: 0.011,
    right: 'Genau, 0,16: 0,2 · (1 − 0,2) = 0,2 · 0,8 = 0,16.',
    diagnose: v => close(v, 0.2) ? 'Fast! 0,2 ist p selbst, der Erwartungswert. Die Varianz ist p · (1 − p) = 0,2 · 0,8.'
      : close(v, 0.8) ? 'Fast! 0,8 ist 1 − p. Malnehmen mit p = 0,2 fehlt noch.'
      : close(v, 0.04) ? 'Fast! Das ist p · p. Malnehmen musst du mit 1 − p = 0,8.'
      : close(v, 0.4) ? 'Fast! 0,4 ist die Standardabweichung, die Wurzel aus 0,16. Gefragt ist die Varianz.'
      : 'Noch nicht ganz. Rechne p · (1 − p) = 0,2 · 0,8.',
  },
  interpret: s => ({
    kurz: s.v < 1e-9
      ? `Alle haben denselben Wert, ${s.p >= 0.5 ? 'eine 1' : 'eine 0'}. Die Varianz ist 0: Es gibt nichts zu streuen.`
      : `Bei p = ${num(s.p)} sind im Schnitt ${Math.round(s.p * 100)} von 100 Antworten eine 1. Die Varianz ${prob(s.v)} ist ${s.v >= 0.24 ? 'fast so groß wie möglich: Ja und Nein kommen beide häufig vor' : s.v <= 0.09 ? 'klein: Fast alle geben dieselbe Antwort' : 'mittelgroß'}; am größten ist sie bei p = 0,5.`,
    fachlich: `P(X = 1) = ${num(s.p)}, P(X = 0) = ${num(s.q)}, E(X) = ${num(s.p)}, Var(X) = p · (1 − p) ${eqProb(s.v)}, Standardabweichung ${prob(s.sd)}.`,
  }),
  think: {
    question: 'Für welches p ist die Varianz am größten?',
    options: ['p = 0,5', 'p = 1', 'p = 0,1'], correct: 0, mark: 'var',
    explain: 'p · (1 − p) ist am größten, wenn beide Teile gleich groß sind: 0,5 · 0,5 = 0,25. Bei p = 1 haben alle eine 1, und es gibt nichts zu streuen.',
    kurz: 'Am meisten Streuung bei halb und halb.',
    hint: 'Probier oben „p = 0,5“ aus.',
  },
  genau: {
    kurz: 'Für Daten ist der Anteil der Einsen der Schätzer für p. Wie bei s² teilt R für die Varianz durch n − 1; das ergibt eine etwas größere Zahl.',
    paragraphs: [
      'Ein Bernoulli-Versuch hat genau zwei Ausgänge. Welcher die 1 bekommt, entscheidest du; die 1 steht für das Ereignis, das dich interessiert.',
      `Im Lehrdatensatz haben ${WEITERBILDUNG.k} von ${WEITERBILDUNG.n} Befragten eine Weiterbildung gemacht, p̂ = ${num(WEITERBILDUNG.p)} und p̂ · (1 − p̂) ≈ ${num(WEITERBILDUNG.var)}. Teilt man wie bei s² durch n − 1, wird die Zahl um den Faktor 200 / 199 größer; auf zwei Stellen bleibt es ${num(WEITERBILDUNG.s2)}.`,
      'Viele unabhängige Bernoulli-Versuche mit demselben p, zusammengezählt, ergeben die Binomialverteilung. In der logistischen Regression darf p von Person zu Person verschieden sein.',
      'Weil der Mittelwert einer 0/1-Spalte der Anteil der Einsen ist, rechnen viele Verfahren mit solchen Dummys wie mit metrischen Zahlen.',
    ],
  },
};

/** Weiterbildung in den aktuellen Daten: Zahl der Einsen, Anteil p̂, p̂ · (1 − p̂) und die Varianz mit n − 1. */
export function bernFit(c: SampleCtx) {
  const xs = sampleColumn(c.rows, c.columns.x?.[0] ?? 'weiterbildung'), n = xs.length, k = xs.filter(x => x === 1).length, p = k / n, v = p * (1 - p);
  return { n, k, p, v, s2: v * n / (n - 1) };
}

export const bernoulliTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'weiterbildung' },
    kurz: 'Dieselbe Rechnung mit allen 200 Befragten: Wie groß sind Anteil und Varianz der Weiterbildung?',
    value: c => bernFit(c).v,
    result: c => {
      const f = bernFit(c);
      return {
        kurz: `${f.k} von ${f.n} Befragten haben in den letzten zwölf Monaten eine Weiterbildung gemacht: p̂ = ${num(f.p)}. Die Varianz p̂ · (1 − p̂) beträgt ${prob(f.v)}; am größten wäre sie bei halb und halb, mit 0,25.`,
        fachlich: `Mittelwert der 0/1-Spalte = Anteil der Einsen p̂ = ${f.k} / ${f.n} = ${num(f.p)}. p̂ · (1 − p̂) ${eqProb(f.v)}, mit n − 1 wie bei s²: ${prob(f.s2)}.`,
        zusatz: `Keine Weiterbildung haben ${f.n - f.k} Befragte gemacht, ein Anteil von ${num(1 - f.p)}.`,
      };
    },
    voraussetzung: 'Jede Person zählt als ein Versuch mit zwei Ausgängen. Als Schätzer für den Anteil aller Menschen taugt p̂ nur bei einer Zufallsstichprobe.',
    think: [
      {
        question: 'Weiterbildung wird umgepolt: 1 heißt jetzt keine Weiterbildung. Was passiert mit der Varianz?',
        options: ['bleibt gleich', 'steigt', 'sinkt'], correct: 0,
        explain: 'Aus p wird 1 − p und aus 1 − p wird p. Das Produkt p · (1 − p) bleibt dasselbe.',
        kurz: 'Umpolen ändert den Anteil, nicht die Streuung.',
        tryIt: { label: 'Weiterbildung umpolen', op: 'reverse', column: 'x' },
        expect: { change: 'same' },
      },
      {
        question: 'Angenommen, alle hätten eine Weiterbildung gemacht. Wie groß ist dann die Varianz?',
        options: ['0', '0,25', '1'], correct: 0,
        explain: 'Alle haben eine 1, also p = 1 und 1 − p = 0. Das Produkt ist 0: Ohne Unterschiede gibt es keine Streuung.',
        kurz: 'Lauter gleiche Antworten streuen nicht.',
        tryIt: { label: 'alle auf Weiterbildung (1)', op: 'constant', column: 'x', value: 1 },
        expect: { change: 'equals', value: 0 },
      },
    ],
  },
  r: {
    entry: 'binomial_test', variant: 0,
    tokens: {
      binomial_test: { sym: 'binomial_test()', term: T('binomial_test'), kurz: 'Vergleicht den Anteil der Einsen einer 0/1-Spalte mit einem vermuteten Anteil. Den beobachteten Anteil meldet R als prop.', fehler: 'Hat die Spalte mehr als zwei Werte, meldet mariposa zum Beispiel: `schulabschluss` has 5 observed categories; the binomial test needs exactly 2 categories.' },
      p: { sym: 'p =', term: 'vermuteter Anteil', kurz: 'Der Anteil, gegen den getestet wird, als Zahl zwischen 0 und 1. p = .5 heißt: halb und halb.', fehler: 'Als Prozentzahl geschrieben, etwa p = 50, meldet mariposa: `p` must be between 0 and 1.' },
    },
    outputMap: [
      { match: 'Group 1 (Ja)', atlas: 'die Einsen', explain: 'Group 1 ist die Gruppe mit dem Code 1, hier Ja. Ihr Anteil steht dahinter.' },
      { match: 'prop', atlas: 'p̂, Anteil der Einsen', explain: 'prop ist der Anteil mit Ja, 82 von 200. Das ist der Mittelwert der 0/1-Spalte und der Schätzer für p.' },
      { match: '0.500', atlas: 'vermuteter Anteil', explain: 'Der Vergleichswert aus p = .5 im Aufruf. Der Test fragt, ob 0.410 dazu passt.' },
      { match: 'N', atlas: 'n', explain: 'N zählt die Befragten, also die Bernoulli-Versuche.' },
    ],
    check: {
      question: 'Welche Zahl ist der Anteil der Einsen p̂? Tippe sie an.', correct: 'prop',
      wrong: {
        '0.500': 'Fast! 0.500 ist der vermutete Anteil, gegen den getestet wird. Der beobachtete Anteil steht hinter prop.',
        N: 'Fast! N zählt die Befragten. Der Anteil der Einsen steht hinter prop.',
      },
    },
  },
  next: {
    next: { id: 'binomial_distribution', why: 'Zählt die Einsen in vielen unabhängigen Bernoulli-Versuchen.' },
    before: [
      { id: 'probability_mass', why: 'Die Bernoulli-Verteilung legt ihre Masse auf genau zwei Werte, 0 und 1.' },
      { id: 'nominal', why: 'Ja-Nein-Fragen sind die kleinste Form nominaler Kategorien.' },
    ],
    after: [
      { id: 'likelihood', why: 'Die logistische Regression schätzt mit Bernoulli-Wahrscheinlichkeiten.' },
      { id: 'binomial_test', why: 'Prüft, ob ein Anteil zu einem vermuteten p passt.' },
    ],
    more: [
      { id: 'dummy', why: 'Dummyvariablen sind Bernoulli-Spalten: 1 für die Gruppe, sonst 0.' },
      { id: 'logistic_regression', why: 'Erklärt, wie p von Person zu Person verschieden sein kann.' },
    ],
  },
};
