// Formel als Satz „Binomialverteilung“ (Bereich B7): P(X = k) = C(n, k) · pᵏ · (1 − p)ⁿ⁻ᵏ.
// Beispiel: fünf zufällig Befragte, p = 0,41 wie der Anteil mit Weiterbildung im Lehrdatensatz. Zahlen in R nachgerechnet.
// Grenzfall Vorlage: Die Formel liest sich als Satz (Reihenfolgen mal Wahrscheinlichkeit einer Reihenfolge), und
// Studierende verändern n, k und p; die Daten sind Parameter, keine fünf Werte. Deshalb Formel als Satz, keine Werkstatt.
import type { ConceptTabs, SampleCtx, SentenceTemplate } from '../../types';
import { close, num, unit } from '../../format';
import { ref, titleFor } from '../../../domain/learning';
import { sampleColumn } from '../../sample';
import { binomTest, choose, dbinom, often, prob, pValue, sup } from './dist';

export type BinValues = { n: number; k: number; p: number };
export type BinStats = BinValues & { q: number; c: number; one: number; P: number; e: number; v: number; mode: number; valid: boolean };
export const BIN_START: BinValues = { n: 5, k: 2, p: 0.41 };
const T = (id: string) => titleFor(ref(id));
/** Zahl aus einem Text von `prob` („0,035“), NaN für „weniger als …“. */
const value = (t: string) => Number(t.replace(',', '.'));
/** Wahrscheinlichkeit einer Reihenfolge als Potenzen: „0,41² · 0,59³“. */
const powers = (s: BinStats) => `${num(s.p)}${sup(s.k)} · ${num(s.q)}${sup(s.n - s.k)}`;
const persons = (n: number) => n === 1 ? 'einer zufällig ausgewählten Person' : `${n} zufällig ausgewählten Personen`;

export const binomial: SentenceTemplate<BinValues, BinStats> = {
  concept: 'binomial_distribution',
  picture: 'b07-binomial',
  wofuer: 'Du befragst fünf zufällig ausgewählte Erwachsene. Wenn 41 % eine Weiterbildung gemacht haben, wie im Lehrdatensatz: Wie wahrscheinlich ist es, dass genau zwei der fünf eine gemacht haben? Die Binomialverteilung beantwortet solche Fragen.',
  kurz: 'Die Binomialverteilung zählt Erfolge in n unabhängigen Ja-Nein-Versuchen mit derselben Erfolgswahrscheinlichkeit p. Sie sagt, wie wahrscheinlich jede mögliche Zahl von Erfolgen ist.',
  fachlich: 'Die Verteilung der Summe von n unabhängigen Bernoulli-Variablen mit gleichem p: P(X = k) = C(n, k) · pᵏ · (1 − p)ⁿ⁻ᵏ für k = 0, 1, …, n.',
  initial: BIN_START,
  compute: v => {
    const q = Math.round((1 - v.p) * 100) / 100, valid = v.k <= v.n;
    const one = valid ? v.p ** v.k * q ** (v.n - v.k) : 0, P = valid ? dbinom(v.k, v.n, v.p) : 0;
    const probs = Array.from({ length: v.n + 1 }, (_, j) => dbinom(j, v.n, v.p));
    return { ...v, q, c: choose(v.n, v.k), one, P, e: v.n * v.p, v: v.n * v.p * q, mode: probs.indexOf(Math.max(...probs)), valid };
  },
  metrics: [
    { label: 'P(X = k)', value: s => prob(s.P) },
    { label: 'Erwartungswert n · p', value: s => num(s.e) },
  ],
  glyphs: [
    { key: 'n', sym: 'n', say: 'n', term: 'Zahl der Versuche', plain: 'wie viele Personen du zufällig befragst' },
    { key: 'k', sym: 'k', say: 'k', term: 'Zahl der Erfolge', plain: 'wie viele davon eine Weiterbildung gemacht haben sollen' },
    { key: 'p', sym: 'p', say: 'p', term: 'Erfolgswahrscheinlichkeit', plain: 'wie wahrscheinlich eine einzelne Person eine Weiterbildung gemacht hat' },
    { key: 'c', sym: 'C(n, k)', say: 'n über k', term: 'Binomialkoeffizient', plain: 'wie viele Reihenfolgen es für k Erfolge unter n Versuchen gibt' },
    { key: 'pk', sym: 'P(X = k)', say: 'P von X gleich k', term: T('probability_mass'), plain: 'die Wahrscheinlichkeit für genau k Erfolge', concept: 'probability_mass' },
  ],
  symbolic: [{ part: ['P(X = k)'], m: 'pk' }, ' = ', { part: ['C(n, k)'], m: 'c' }, ' · ', { part: ['p'], m: 'p' }, { part: ['ᵏ'], m: 'k' }, ' · (1 − p)', { part: ['ⁿ⁻ᵏ'], m: 'n' }],
  aria: 'P von X gleich k ist n über k, mal p hoch k, mal eins minus p hoch n minus k.',
  numeric: s => s.valid
    ? [{ part: [`P(X = ${s.k})`], m: 'pk' }, ' = ', { part: [String(s.c)], m: 'c' }, ' · ', { part: [num(s.p)], m: 'p' }, { part: [sup(s.k)], m: 'k' }, ` · ${num(s.q)}`, { part: [sup(s.n - s.k)], m: 'n' }, ` ≈ ${prob(s.P)}`]
    : [{ part: [`P(X = ${s.k})`], m: 'pk' }, ' = 0, denn mehr als ', { part: [String(s.n)], m: 'n' }, ' Erfolge gibt es nicht'],
  sentence: [{ m: 'pk', t: 'Die Wahrscheinlichkeit für genau k Erfolge' }, ' in ', { m: 'n', t: 'n Versuchen' }, ' ist ', { m: 'c', t: 'die Zahl der Reihenfolgen' }, ' mal ',
    { m: 'p', t: 'die Erfolgswahrscheinlichkeit' }, ' hoch ', { m: 'k', t: 'k' }, ' mal ihre Gegenwahrscheinlichkeit hoch n − k.'],
  worked: s => {
    if (!s.valid) return [
      { title: 'Die Zahl der Erfolge prüfen', text: `k = ${s.k} ist größer als n = ${s.n}. Bei ${unit(s.n, 'Versuch', 'Versuchen')} gibt es höchstens ${unit(s.n, 'Erfolg', 'Erfolge')}, also ist P(X = ${s.k}) = 0.` },
    ];
    const step3 = value(prob(s.one)) * s.c, fits = prob(step3) === prob(s.P);
    return [
      { title: 'Eine Reihenfolge ansehen', text: `Zum Beispiel erst ${unit(s.k, 'Erfolg', 'Erfolge')}, dann ${unit(s.n - s.k, 'Misserfolg', 'Misserfolge')}. Weil die Versuche unabhängig sind, wird malgenommen: ${powers(s)} ≈ ${prob(s.one)}.` },
      { title: 'Die Reihenfolgen zählen', text: `Auf wie viele Arten lassen sich ${unit(s.k, 'Erfolg', 'Erfolge')} auf ${s.n} Plätze verteilen? C(${s.n}, ${s.k}) = ${s.c}.` },
      { title: 'Beides malnehmen', text: `${fits ? `${s.c} · ${prob(s.one)}` : `${s.c} · ${powers(s)}`} ≈ ${prob(s.P)}. Genau ${s.k} von ${s.n} kämen ${often(s.P)} solcher Stichproben vor.` },
    ];
  },
  fehler: 'Die Wahrscheinlichkeit einer einzelnen Reihenfolge ist noch nicht das Ergebnis. Genau 2 von 5 kann auf 10 verschiedene Arten geschehen; erst mal 10 ergibt P(X = 2).',
  sliders: [
    { key: 'n', label: 'Zahl der Befragten n', min: 1, max: 12, step: 1, format: v => String(v) },
    { key: 'k', label: 'Zahl der Erfolge k', min: 0, max: 12, step: 1, format: v => String(v) },
    { key: 'p', label: 'Erfolgswahrscheinlichkeit p', min: 0.01, max: 0.99, step: 0.01, format: v => num(v) },
  ],
  quick: [
    { label: 'k auf den Erwartungswert', mark: 'k', apply: v => ({ ...v, k: Math.min(12, Math.round(v.n * v.p)) }) },
    { label: 'p = 0,5', mark: 'p', apply: v => ({ ...v, p: 0.5 }) },
    { label: 'Beispiel von oben', mark: 'n', apply: () => ({ ...BIN_START }) },
  ],
  compare: s => `Im Schnitt erwartest du n · p = ${s.n} · ${num(s.p)} = ${num(s.e)} Erfolge. Am wahrscheinlichsten ${s.mode === 1 ? 'ist 1 Erfolg' : `sind ${s.mode} Erfolge`}.`,
  check: {
    question: 'Wie wahrscheinlich sind genau 2 Erfolge bei 3 Versuchen mit p = 0,5? Zwei Nachkommastellen reichen.',
    answer: 0.375, tolerance: 0.011,
    right: 'Genau, 0,375: 3 Reihenfolgen mal 0,5² · 0,5 = 3 · 0,125.',
    diagnose: v => close(v, 0.125) ? 'Fast! Das ist eine einzelne Reihenfolge. Es gibt 3 davon, denn der Misserfolg kann an jeder der drei Stellen stehen.'
      : close(v, 0.75) ? 'Fast! Hier fehlt der Misserfolg: 3 · 0,5² = 0,75. Für ihn musst du noch mit 0,5 malnehmen.'
      : close(v, 0.25) ? 'Fast! 0,5² ist erst die Wahrscheinlichkeit der beiden Erfolge. Es fehlen der Misserfolg und die 3 Reihenfolgen.'
      : close(v, 2 / 3) ? 'Fast! 2 / 3 ist der Anteil der Erfolge, keine Wahrscheinlichkeit.'
      : 'Noch nicht ganz. Rechne die Zahl der Reihenfolgen mal p² mal (1 − p): 3 · 0,25 · 0,5.',
  },
  interpret: s => ({
    kurz: s.valid
      ? `Bei ${persons(s.n)} und p = ${num(s.p)} kämen genau ${s.k} mit Weiterbildung ${often(s.P)} solcher Stichproben vor. Im Schnitt erwartest du ${num(s.e)}.`
      : `Mehr Erfolge als Versuche gibt es nicht: P(X = ${s.k}) = 0. Stell k auf höchstens ${s.n}.`,
    fachlich: s.valid
      ? `X ∼ B(n = ${s.n}, p = ${num(s.p)}): P(X = ${s.k}) = C(${s.n}, ${s.k}) · ${powers(s)} ≈ ${prob(s.P)}. E(X) = n · p = ${num(s.e)}, Var(X) = n · p · (1 − p) ≈ ${num(s.v)}.`
      : `X ∼ B(n = ${s.n}, p = ${num(s.p)}) nimmt nur Werte von 0 bis ${s.n} an. E(X) = n · p = ${num(s.e)}.`,
  }),
  think: {
    question: 'Du befragst doppelt so viele Personen, p bleibt gleich. Was passiert mit dem Erwartungswert n · p?',
    options: ['verdoppelt sich', 'bleibt gleich', 'vervierfacht sich'], correct: 0, mark: 'n',
    explain: 'n steht als Faktor vorne: 2 · n · p. Doppelt so viele Befragte bringen im Schnitt doppelt so viele Erfolge.',
    kurz: 'Mehr Versuche, mehr erwartete Erfolge.',
    hint: 'Schieb n von 5 auf 10 und vergleiche den Erwartungswert.',
  },
  genau: {
    kurz: 'Die Binomialverteilung setzt unabhängige Versuche mit gleichem p voraus. Ohne Zurücklegen aus einer kleinen Gruppe gilt die hypergeometrische Verteilung.',
    paragraphs: [
      'C(n, k) = n! / (k! · (n − k)!) zählt die Reihenfolgen. Erwartungswert n · p, Varianz n · p · (1 − p). Für n = 1 ist die Binomialverteilung die Bernoulli-Verteilung.',
      'Bei einer Zufallsstichprobe aus einer großen Bevölkerung sind die Befragten annähernd unabhängig, und jede hat dasselbe p. Zieht man 10 aus nur 200 Befragten, ändert sich p nach jeder Ziehung ein wenig; dann gilt genau genommen die hypergeometrische Verteilung.',
      `Für großes n wird die Binomialverteilung glockenförmig. Mit n = 200 und p = 0,5 hat sie den Erwartungswert 100 und die Standardabweichung ${num(Math.sqrt(50))}.`,
      `In R liefert dbinom(2, 5, 0.41) die Wahrscheinlichkeit für genau 2 Erfolge, ${prob(dbinom(2, 5, 0.41))}.`,
    ],
  },
};

/** Zahl der Weiterbildungen in den aktuellen Daten und der zweiseitige Binomialtest gegen p = 0,5. */
export function binFit(c: SampleCtx) {
  const xs = sampleColumn(c.rows, c.columns.x?.[0] ?? 'weiterbildung'), n = xs.length, k = xs.filter(x => x === 1).length;
  const e = n * 0.5, sd = Math.sqrt(n * 0.25);
  return { n, k, e, sd, p: binomTest(k, n, 0.5) };
}

export const binomialTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'weiterbildung' },
    kurz: 'Dieselbe Verteilung mit allen 200 Befragten: Passt die Zahl der Weiterbildungen zu einem Anteil von 50 %?',
    value: c => binFit(c).p,
    result: c => {
      const f = binFit(c);
      return {
        kurz: `${f.k} von ${f.n} Befragten haben eine Weiterbildung gemacht. Bei p = 0,5 erwartet die Binomialverteilung im Schnitt ${num(f.e)}, mit einer Standardabweichung von ${num(f.sd)}. Wäre der Anteil aller Menschen 50 %, käme eine so große Abweichung von ${num(f.e)} ${often(f.p)} Stichproben vor.`,
        fachlich: `X ∼ B(${f.n}, 0,5) unter der Nullhypothese: E(X) = ${num(f.e)}, Standardabweichung √(n · p · (1 − p)) = ${num(f.sd)}. Exakter Binomialtest, zweiseitig: p ${pValue(f.p)}.`,
        zusatz: `Beobachtet ${f.k}, erwartet ${num(f.e)}: ein Abstand von ${num(Math.abs(f.k - f.e) / f.sd)} Standardabweichungen.`,
      };
    },
    voraussetzung: 'Die Befragten sind unabhängig voneinander, und jede hat dieselbe Wahrscheinlichkeit für eine Weiterbildung. Das gilt für eine Zufallsstichprobe.',
    think: [
      {
        question: 'Weiterbildung wird umgepolt: Aus 82 Einsen werden 118. Was passiert mit dem p-Wert des Binomialtests gegen 50 %?',
        options: ['bleibt gleich', 'steigt', 'sinkt'], correct: 0,
        explain: '118 liegt genauso weit über 100 wie 82 darunter. Bei p = 0,5 ist die Binomialverteilung symmetrisch, der zweiseitige p-Wert bleibt gleich.',
        kurz: 'Bei 50 % zählt nur der Abstand zur Mitte, nicht die Richtung.',
        tryIt: { label: 'Weiterbildung umpolen', op: 'reverse', column: 'x' },
        expect: { change: 'same' },
      },
      {
        question: 'Angenommen, alle 200 hätten eine Weiterbildung gemacht. Was passiert mit dem p-Wert?',
        options: ['sinkt', 'bleibt gleich', 'steigt'], correct: 0,
        explain: '200 Einsen liegen 100 über der Erwartung, gut 14 Standardabweichungen. Wäre der Anteil aller Menschen 50 %, käme das praktisch nie vor.',
        kurz: 'Je weiter weg von n · p, desto kleiner der p-Wert.',
        tryIt: { label: 'alle auf Weiterbildung (1)', op: 'constant', column: 'x', value: 1 },
        expect: { change: 'down' },
      },
    ],
  },
  r: {
    entry: 'binomial_test', variant: 0,
    tokens: {
      binomial_test: { sym: 'binomial_test()', term: T('binomial_test'), kurz: 'Prüft mit der Binomialverteilung, ob die Zahl der Einsen zu einem vermuteten Anteil p passt.', fehler: 'Hat die Spalte mehr als zwei Werte, meldet mariposa zum Beispiel: `schulabschluss` has 5 observed categories; the binomial test needs exactly 2 categories.' },
      p: { sym: 'p =', term: 'Erfolgswahrscheinlichkeit', kurz: 'Das p der Binomialverteilung, gegen das getestet wird, als Zahl zwischen 0 und 1. p = .5 heißt: halb und halb.', fehler: 'Als Prozentzahl geschrieben, etwa p = 50, meldet mariposa: `p` must be between 0 and 1.' },
    },
    outputMap: [
      { match: 'prop', atlas: 'Anteil der Erfolge', explain: '82 Erfolge geteilt durch 200 Versuche.' },
      { match: '0.500', atlas: 'p der Binomialverteilung', explain: 'Das p, mit dem die Binomialverteilung hier rechnet. Erwartet wären 200 · 0,5 = 100 Erfolge.' },
      { match: 'p', atlas: 'p-Wert', explain: 'Wäre der Anteil aller Menschen 50 %, käme eine so große Abweichung von 100 in etwa 1 von 100 Stichproben vor. Die Wahrscheinlichkeiten liefert die Binomialverteilung.' },
      { match: 'N', atlas: 'n', explain: 'N ist die Zahl der Versuche n der Binomialverteilung.' },
    ],
    check: {
      question: 'Welche Zahl ist der p-Wert, der aus der Binomialverteilung kommt? Tippe sie an.', correct: 'p',
      wrong: {
        prop: 'Fast! prop ist der beobachtete Anteil, 82 von 200. Der p-Wert steht hinter p =.',
        '0.500': 'Fast! 0.500 ist das p der Binomialverteilung, der vermutete Anteil. Der p-Wert steht weiter rechts.',
        N: 'Fast! N ist die Zahl der Versuche. Der p-Wert steht davor.',
      },
    },
  },
  next: {
    next: { id: 'binomial_test', why: 'Prüft mit dieser Verteilung, ob eine Zahl von Erfolgen zu einem vermuteten p passt.' },
    before: [
      { id: 'bernoulli_distribution', why: 'Jeder einzelne Versuch ist ein Bernoulli-Versuch.' },
      { id: 'stochastic_independence', why: 'Die Versuche dürfen sich nicht gegenseitig beeinflussen.' },
      { id: 'probability_mass', why: 'Jede mögliche Zahl von Erfolgen bekommt ihre eigene Wahrscheinlichkeit.' },
    ],
    after: [
      { id: 'hypergeometric_distribution', why: 'Dasselbe Zählen, aber ohne Zurücklegen aus einer begrenzten Gruppe.' },
      { id: 'mcnemar_test', why: 'Die exakte Fassung zählt die Wechsel in eine Richtung mit der Binomialverteilung.' },
    ],
    more: [
      { id: 'null_distribution', why: 'Mit festem p₀ ist die Binomialverteilung die Nullverteilung einer Erfolgszahl.' },
      { id: 'central_limit', why: 'Erklärt, warum die Binomialverteilung für großes n glockenförmig wird.' },
    ],
  },
};
