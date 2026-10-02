// Werkstatt „Friedman“ (B11): fünf Personen schreiben denselben Wissenstest dreimal; Ränge je Person, Rangsummen je
// Zeitpunkt, Abstände zur Erwartung, Q und Kendalls W wie mariposa::friedman_test(). Ton nach der Streuung.
// Alle Zahlen sind in R nachgerechnet (b11-rangtests.test.ts).
import type { ConceptTabs, Ctx, FNode, SampleCtx, Workshop } from '../../types';
import { close, num, signed } from '../../format';
import { columnsOf, friedman, midRanks, type Friedman } from './rank';
import { pOften, pText, signif, wWord } from './words';

export const FR_NAMES = ['A', 'B', 'C', 'D', 'E'] as const;
export const FR_START = [[8, 10, 12], [11, 10, 14], [6, 9, 8], [12, 15, 16], [9, 13, 11]];
export const FR_TIES = [[8, 10, 10], [11, 10, 14], [9, 9, 8], [12, 15, 16], [9, 13, 11]];
export const FR_SAME_ORDER = [[8, 10, 12], [10, 11, 14], [6, 8, 9], [12, 15, 16], [9, 11, 13]];
const ORD = ['erste', 'zweite', 'dritte'] as const;

export type FrStats = Friedman & {
  xs: number[][];
  /** Platz unter allen 15 Werten (Denkfehler: gemeinsam geordnet), von oben gezählt. */
  global: number[][]; rev: number[][];
  /** Summe der gelösten Aufgaben je Test (Denkfehler), Rangsumme − 2 (Denkfehler: mittlerer Rang als Erwartung). */
  colSum: number[]; wrongE: number[];
  /** Summe der Abstände ohne Vorzeichen, Q mit falschem Faktor 12 / (N · k · k), Q / (N · k). */
  absSum: number; wrongFactor: number; wrongW: number;
  ties: boolean;
};

export function frCompute(xs: number[][]): FrStats {
  const t = friedman(xs), flat = midRanks(xs.flat());
  return {
    ...t, xs: xs.map(r => [...r]),
    global: xs.map((_, i) => flat.slice(3 * i, 3 * i + 3)), rev: t.ranks.map(r => r.map(v => 4 - v)),
    colSum: [0, 1, 2].map(j => xs.reduce((a, r) => a + r[j], 0)), wrongE: t.R.map(r => r - 2),
    absSum: t.dev.reduce((a, d) => a + Math.abs(d), 0), wrongFactor: 12 / 45 * t.ss, wrongW: t.Q / 15,
    ties: xs.some(r => new Set(r).size < r.length),
  };
}

type C = Ctx<FrStats>;
const P = (c: C) => c.names[c.who];
/** „11, 10 und 14“; mit Dezimalzahlen durch Semikolon getrennt („1; 2,5 und 2,5“), damit das Komma eindeutig bleibt. */
const list = (v: number[]) => { const t = v.map(x => num(x)), sep = t.some(x => x.includes(',')) ? '; ' : ', '; return `${t.slice(0, -1).join(sep)} und ${t[t.length - 1]}`; };
const qText = (c: C) => Number.isFinite(c.s.Q) ? num(c.s.Q) : 'nicht definiert';
const best = (s: FrStats) => s.R.indexOf(Math.max(...s.R)), worst = (s: FrStats) => s.R.indexOf(Math.min(...s.R));

const numeric = (c: C): FNode[] => [
  { part: [`R = ${c.s.R.map(r => num(r)).join(', ')}`], m: 2 }, { br: true },
  ...c.s.dev.flatMap((d, j): FNode[] => [...(j ? [' + '] : []), '(', { part: [`${num(c.s.R[j])} − 10`], m: 3 }, { part: [')²'], m: 4 }]),
  ' = ', { part: [num(c.s.ss)], m: 4 }, { br: true },
  { part: [`Q = 0,2 · ${num(c.s.ss)} = ${num(c.s.Qraw)}`], m: 5 }, ', ', { part: [`W = ${qText(c)} / 10 ≈ ${num(c.s.W)}`], m: 6 },
];

export const friedmanWorkshop: Workshop<number[][], FrStats> = {
  id: 'b11-friedman',
  wofuer: 'Lösen Menschen über drei Zeitpunkte hinweg mehr Aufgaben? Fünf Personen schreiben denselben Wissenstest mit 20 Aufgaben dreimal. Es sind dieselben Personen, und manche wissen ohnehin mehr als andere. Der Friedman-Test vergleicht die Zeitpunkte deshalb innerhalb jeder Person, über Ränge.',
  mut: 'Die Formel sieht nach viel aus. Sie besteht aber nur aus sechs kleinen Schritten: ordnen, zusammenzählen, abziehen, quadrieren und zweimal teilen. Das Rechnen übernimmt später R. Hier geht es ums Verstehen.',
  picture: 'b11-friedman',
  names: FR_NAMES,
  bounds: { min: 0, max: 20 },
  presets: [
    { id: 'start', label: 'Ohne Gleichstand', data: FR_START },
    { id: 'gleich', label: 'Mit Gleichständen bei A und C', data: FR_TIES },
  ],
  compute: frCompute,
  glyphs: [
    { sym: 'R(xᵢⱼ)', say: 'R von x i j', term: 'Rang innerhalb der Person', plain: 'Platz von Test j unter den drei Tests von Person i', step: 1 },
    { sym: 'Rⱼ', say: 'R j', term: 'Rangsumme', plain: 'Ränge aller Personen zum Zeitpunkt j zusammengezählt', step: 2 },
    { sym: 'N, k', say: 'N, k', term: 'Personen und Zeitpunkte', plain: 'hier 5 Personen und 3 Tests', step: 3 },
    { sym: 'E', say: 'E', term: 'erwartete Rangsumme', plain: 'N(k + 1) / 2, die Summe je Zeitpunkt ohne Unterschied, hier 10', step: 3 },
    { sym: 'Σ', say: 'Sigma', term: 'Summenzeichen', plain: 'alles zusammenzählen, jeden Zeitpunkt einmal', step: 4 },
    { sym: 'Q', say: 'Q', term: 'Friedman-Prüfgröße', plain: 'wie ungleich die Rangsummen sind; R nennt sie Chi-Square', step: 5 },
    { sym: 'W', say: 'W', term: 'Kendalls W', plain: 'wie einig sich die Personen in ihrer Reihenfolge sind, von 0 bis 1', step: 6 },
  ],
  steps: [
    {
      button: 'Ränge', title: 'Je Person der Reihe nach ordnen', sym: 'R(xᵢⱼ)', say: 'R von x i j', concept: 'ranks', perPerson: true,
      links: [{ id: 'paired_design', label: 'Verbundene Messungen' }],
      was: 'Jede Person ordnet ihre eigenen drei Ergebnisse: Das schwächste bekommt Rang 1, das beste Rang 3. Verglichen wird nur innerhalb der Person.',
      rechnung: c => {
        const v = c.s.xs[c.who], r = c.s.ranks[c.who];
        const tie = new Set(v).size < 3 ? ' Gleiche Ergebnisse teilen sich ihre Plätze.' : '';
        return `Person ${P(c)}: ${list(v)} Aufgaben. Ränge: ${list(r)}.${tie}`;
      },
      fach: 'Die Ränge entstehen innerhalb jeder Zeile, also je Person, nicht über alle Personen hinweg wie bei Kruskal–Wallis.',
      warum: 'So zählt nicht, wer insgesamt viel weiß, sondern nur, wann jemand am besten war. Jede Person ist ihr eigener Vergleich.',
      acht: 'Nicht alle 15 Werte gemeinsam ordnen. Sonst bekäme eine Person mit viel Vorwissen lauter hohe Ränge, und es ginge um Personen statt um Zeitpunkte.',
      check: {
        question: c => `Welchen Rang bekommt der dritte Test von Person ${P(c)}?`,
        answer: c => c.s.ranks[c.who][2],
        diagnose: (c, v) => {
          const r = c.s.ranks[c.who][2];
          if (v === 'NA' || close(v, r)) return null;
          if (close(v, c.s.global[c.who][2])) return 'Fast! Das ist der Platz unter allen 15 Werten. Geordnet wird nur innerhalb der Person, von 1 bis 3.';
          if (close(v, c.s.rev[c.who][2])) return 'Fast! Du hast von oben gezählt. Rang 1 bekommt das schwächste Ergebnis.';
          return null;
        },
      },
    },
    {
      button: 'Rⱼ', title: 'Ränge je Zeitpunkt zusammenzählen', sym: 'Rⱼ', say: 'R j', concept: 'sum', perPerson: false,
      was: 'Für jeden Zeitpunkt zählen wir die Ränge aller fünf Personen zusammen. Hatten dort viele ihr bestes Ergebnis, wird die Summe groß.',
      rechnung: c => [0, 1, 2].map(j => `Test ${j + 1}: R${'₁₂₃'[j]} = ${c.s.ranks.map(r => num(r[j])).join(' + ')} = ${num(c.s.R[j])}`).join('. ') + '.',
      fach: 'Die Rangsumme Rⱼ ist die Summe der Ränge aller N Personen zum Zeitpunkt j. Zusammen ergeben die Rangsummen immer N · k(k + 1) / 2.',
      warum: 'Gäbe es keinen Unterschied zwischen den Zeitpunkten, wären die Ränge zufällig verteilt. Dann hätte jeder Zeitpunkt etwa dieselbe Summe.',
      acht: 'Die drei Summen ergeben zusammen immer 5 · 6 = 30, weil jede Person die Ränge 1, 2 und 3 verteilt. Daran prüfst du deine Rechnung.',
      check: {
        question: 'Wie groß ist die Rangsumme des ersten Tests?',
        answer: c => c.s.R[0],
        diagnose: (c, v) => {
          if (v === 'NA' || close(v, c.s.R[0])) return null;
          if (close(v, c.s.colSum[0])) return 'Fast! Das ist die Summe der gelösten Aufgaben. Zusammengezählt werden die Ränge.';
          if (close(v, c.s.meanRanks[0])) return 'Fast! Das ist der mittlere Rang. Gefragt ist die Summe, also nicht durch 5 teilen.';
          return null;
        },
      },
    },
    {
      button: 'Rⱼ − E', title: 'Mit der Erwartung vergleichen', sym: 'Rⱼ − E', say: 'R j minus E', concept: 'deviation', perPerson: false,
      was: 'Ohne Unterschied hätte jeder Zeitpunkt die Rangsumme 5 · 4 / 2 = 10. Wir messen, wie weit jede Rangsumme davon weg ist.',
      rechnung: c => [0, 1, 2].map(j => `Test ${j + 1}: ${num(c.s.R[j])} − 10 = ${signed(c.s.dev[j])}`).join('; ') + '.',
      fach: 'E = N(k + 1) / 2 ist die erwartete Rangsumme je Zeitpunkt, wenn es keinen Unterschied gibt. Die Abweichungen Rⱼ − E ergeben zusammen immer 0.',
      warum: 'Große Abstände heißen: Ein Zeitpunkt sammelt die guten, ein anderer die schwachen Ergebnisse. Die Personen sind sich dann einig, wann es besser lief.',
      acht: 'Erwartet wird eine Summe, kein mittlerer Rang: Jede Person bringt im Schnitt Rang 2 mit, fünf Personen also 10.',
      check: {
        question: 'Wie weit liegt die Rangsumme des ersten Tests von der Erwartung 10 weg? Mit Vorzeichen.',
        answer: c => c.s.dev[0],
        diagnose: (c, v) => {
          const d = c.s.dev[0];
          if (v === 'NA' || close(v, d)) return null;
          if (Math.abs(d) > 0.02 && close(v, -d)) return 'Fast! Der Abstand stimmt, nur die Seite nicht. Rechne Rangsumme minus 10.';
          if (close(v, c.s.wrongE[0])) return 'Fast! Du hast 2 abgezogen, den erwarteten mittleren Rang. Für die Summe von fünf Personen erwartest du 5 · 2 = 10.';
          return null;
        },
      },
    },
    {
      button: 'Σ( )²', title: 'Quadrieren und zusammenzählen', sym: 'Σ(Rⱼ − E)²', say: 'Summe über j von R j minus E, zum Quadrat', concept: 'ss', perPerson: false,
      was: 'Jeden Abstand nehmen wir mit sich selbst mal. Dann zählen wir die drei Quadrate zusammen.',
      rechnung: c => `${c.s.dev.map(d => `${d < 0 ? `(${num(d)})` : num(d)}²`).join(' + ')} = ${c.s.sq.map(q => num(q)).join(' + ')} = ${num(c.s.ss)}.`,
      fach: 'Die Quadratsumme der Abweichungen der Rangsummen von ihrer Erwartung misst, wie ungleich die Zeitpunkte abschneiden.',
      warum: 'Ohne Quadrat höben sich Plus und Minus auf, die Summe wäre immer 0. Das Quadrat lässt weite Abstände außerdem stärker zählen.',
      acht: 'Erst quadrieren, dann zusammenzählen. Andersherum ergibt sich immer 0, denn die Abstände selbst ergeben zusammen 0.',
      check: {
        question: 'Wie groß ist die Summe der drei Quadrate?',
        answer: c => c.s.ss,
        diagnose: (c, v) => {
          if (v === 'NA' || close(v, c.s.ss)) return null;
          if (c.s.ss > 0.02 && close(v, 0)) return 'Fast! 0 ist die Summe der Abstände. Gefragt ist die Summe ihrer Quadrate.';
          if (close(v, c.s.absSum)) return 'Fast! Das ist die Summe der Abstände ohne Vorzeichen. Quadriere sie vorher.';
          return null;
        },
      },
    },
    {
      button: 'Q', title: 'Auf die Prüfgröße umrechnen', sym: 'Q', say: 'Q', concept: 'friedman_test', perPerson: false,
      links: [{ id: 'chi_square_distribution', label: 'χ²-Verteilung' }],
      was: 'Wir nehmen die Summe mal 12 / (N · k · (k + 1)) = 12 / 60 = 0,2. So entsteht Q, das R mit der χ²-Verteilung vergleicht.',
      rechnung: c => `Q = 12 / (5 · 3 · 4) · ${num(c.s.ss)} = 0,2 · ${num(c.s.ss)} = ${num(c.s.Qraw)}${c.s.ties && Number.isFinite(c.s.Q) ? `. Wegen der Gleichstände innerhalb der Personen korrigiert R und meldet Q ≈ ${num(c.s.Q)}.` : '.'}`,
      fach: 'Q = 12 / (N · k · (k + 1)) · Σ(Rⱼ − E)². Ohne Unterschied folgt Q ungefähr einer χ²-Verteilung mit k − 1 = 2 Freiheitsgraden.',
      warum: 'Der Faktor bringt Q auf eine feste Skala: Ohne Unterschied folgt Q ungefähr der χ²-Verteilung mit 2 Freiheitsgraden, egal wie viele Personen es sind. Deshalb heißt Q in der Ausgabe von R Chi-Square.',
      acht: 'Ein großes Q spricht nur dafür, dass sich mindestens zwei Zeitpunkte unterscheiden. Welche Paare es sind, zeigt erst der paarweise Wilcoxon-Test.',
      check: {
        question: 'Wie groß ist Q vor der Korrektur für Gleichstände?',
        answer: c => c.s.Qraw,
        diagnose: (c, v) => {
          if (v === 'NA' || close(v, c.s.Qraw)) return null;
          if (close(v, c.s.ss)) return 'Fast! Das ist noch die Summe aus Schritt 4. Jetzt noch mal 0,2.';
          if (close(v, c.s.wrongFactor)) return 'Fast! Geteilt wird durch N · k · (k + 1) = 5 · 3 · 4 = 60, nicht durch 45.';
          return null;
        },
      },
    },
    {
      button: 'W', title: 'Die Einigkeit messen', sym: 'W', say: 'W', concept: 'effect', perPerson: false,
      was: 'Wir teilen Q durch N · (k − 1) = 5 · 2 = 10. Das Ergebnis liegt zwischen 0 und 1 und heißt Kendalls W.',
      rechnung: c => `W = ${qText(c)} / (5 · 2) ≈ ${num(c.s.W)}`,
      fach: 'Kendalls W = Q / (N(k − 1)) misst, wie gut die Rangfolgen der Personen übereinstimmen: 0 heißt keine Einigkeit, 1 heißt alle ordnen die Zeitpunkte gleich.',
      warum: 'Q wächst mit der Zahl der Personen, W nicht. W sagt deshalb, wie einig sich die Personen in ihrer Reihenfolge sind.',
      acht: 'W ist kein Anteil von Personen. W = 0,52 heißt nicht, dass 52 % der Personen einig sind, sondern beschreibt die Übereinstimmung aller Rangfolgen.',
      check: {
        question: 'Wie groß ist W? Zwei Nachkommastellen reichen.',
        answer: c => Number.isFinite(c.s.W) ? c.s.W : 'NA',
        diagnose: (c, v) => {
          if (v === 'NA' || !Number.isFinite(c.s.W) || close(v, c.s.W)) return null;
          if (close(v, c.s.Q)) return 'Fast! Das ist noch Q. Jetzt noch durch 10 teilen.';
          if (close(v, c.s.wrongW)) return 'Fast! Geteilt wird durch N · (k − 1) = 5 · 2 = 10, nicht durch 15.';
          return null;
        },
      },
    },
  ],
  numeric,
  table: {
    columns: [
      ...[0, 1, 2].map(j => ({ head: `Test ${j + 1}`, from: 1, active: [] as number[], cell: (c: C, r: number) => num(c.s.xs[r][j]) })),
      ...[0, 1, 2].map(j => ({ head: `Rang ${j + 1}`, from: 1, active: [1, 2], cell: (c: C, r: number) => num(c.s.ranks[r][j]), sum: (c: C) => num(c.s.R[j]), sumFrom: 2 })),
    ],
    lines: [
      { from: 3, step: 3, text: c => `Erwartung je Test: 5 · 4 / 2 = 10; Abstände ${c.s.dev.map(d => signed(d)).join(', ')}` },
      { from: 4, step: 4, text: c => `Σ(Rⱼ − 10)² = ${num(c.s.ss)}` },
      { from: 5, step: 5, text: c => `Q = 0,2 · ${num(c.s.ss)} = ${num(c.s.Qraw)}` },
      { from: 6, step: 6, text: c => `W = ${qText(c)} / 10 ≈ ${num(c.s.W)}` },
    ],
  },
  captions: {
    1: 'Je Zeile eine Person mit ihren drei Tests. Du kannst die Punkte ziehen; rechts stehen die Ränge innerhalb der Person.',
    2: 'Unten steht die Rangsumme jedes Tests als Balken.',
    3: 'Die gestrichelte Linie ist die Erwartung 10 ohne Unterschied.',
    4: 'Rechts neben jedem Balken steht das Quadrat seines Abstands zur Erwartung.',
    5: 'Je weiter die Balken von der Linie weg sind, desto größer wird Q.',
    6: 'W = 1 hieße: Alle fünf ordnen die drei Tests gleich.',
  },
  think: [
    {
      question: 'Mit den Startdaten: Person D löst im dritten Test 20 statt 16 Aufgaben. Was passiert mit Q?', options: ['wird größer', 'bleibt gleich', 'wird kleiner'], correct: 1, step: 1,
      explain: 'Der dritte Test bleibt Ds bestes Ergebnis, Rang 3. Kein Rang ändert sich, also auch keine Rangsumme und nicht Q.',
      kurz: 'Innerhalb der Person zählt nur die Reihenfolge.',
      tryIt: { label: 'Startdaten, Person D im dritten Test auf 20', apply: () => FR_START.map((r, i) => i === 3 ? [r[0], r[1], 20] : [...r]) },
    },
    {
      question: 'Alle lösen in jedem Test drei Aufgaben mehr. Was passiert mit Q?', options: ['wird größer', 'bleibt gleich', 'wird kleiner'], correct: 1, step: 1,
      explain: 'Jede Person verschiebt alle drei Ergebnisse gleich. Ihre Reihenfolge bleibt, die Ränge auch. Wie viel jemand insgesamt weiß, spielt keine Rolle.',
      kurz: 'Unterschiede zwischen Personen fallen heraus.',
      tryIt: { label: 'alle drei Aufgaben mehr', apply: d => d.map(r => r.map(v => Math.min(20, v + 3))) },
    },
    {
      question: 'Alle fünf haben ihr schwächstes Ergebnis im ersten und ihr bestes im dritten Test. Wie groß ist W?', options: ['0', '0,5', '1'], correct: 2, step: 6,
      explain: 'Alle ordnen die Tests gleich: Rangsummen 5, 10 und 15. Q wird 0,2 · 50 = 10, und W = 10 / 10 = 1. Vollständige Einigkeit.',
      kurz: 'Gleiche Reihenfolge bei allen, W = 1.',
      tryIt: { label: 'alle in derselben Reihenfolge', apply: () => FR_SAME_ORDER },
    },
  ],
  variants: {
    friedman_test: {
      lastStep: 6,
      kurz: 'Der Friedman-Test vergleicht drei oder mehr Messungen derselben Personen. Jede Person ordnet ihre eigenen Ergebnisse, und der Test fragt, ob ein Zeitpunkt dabei auffällig oft oben oder unten landet.',
      fachlich: 'Der Friedman-Test bildet Ränge innerhalb jeder Person und vergleicht die Rangsummen der Messzeitpunkte. Geprüft wird mit der Chi-Quadrat-Verteilung; Kendalls W zeigt, wie einig sich die Personen sind.',
      symbolic: [{ part: ['Q'], m: 5 }, ' = ', { frac: [{ part: ['12 ·'], m: 5 }, ' ', { big: 'Σ', m: 4 }, { part: ['('], m: 4 }, { part: ['R', { sub: 'j' }], m: 2 }, ' ', { part: ['− E'], m: 3 }, { part: [')²'], m: 4 }], den: ['N · k · (k + 1)'], m: 5 }, { br: true },
        { part: ['W = Q / (N(k − 1))'], m: 6 }],
      aria: 'Q gleich 12 geteilt durch N mal k mal k plus eins, mal die Summe über alle Zeitpunkte j von R j minus E, zum Quadrat; E ist die erwartete Rangsumme N mal k plus eins halbe. W gleich Q geteilt durch N mal k minus eins',
      metrics: [
        { label: 'Rangsummen', value: c => list(c.s.R) },
        { label: 'Q', value: qText },
        { label: 'Kendalls W', value: c => Number.isFinite(c.s.W) ? num(c.s.W) : 'nicht definiert' },
      ],
      interpret: c => ({
        kurz: c.s.ss < 1e-9
          ? 'Alle drei Tests haben dieselbe Rangsumme 10. Kein Zeitpunkt landet auffällig oft oben oder unten, Q ist 0.'
          : `Der ${ORD[best(c.s)]} Test schneidet mit der Rangsumme ${num(c.s.R[best(c.s)])} am besten ab, der ${ORD[worst(c.s)]} mit ${num(c.s.R[worst(c.s)])} am schwächsten. Ohne Unterschied hätte jeder Test etwa 10.`,
        fachlich: Number.isFinite(c.s.Q)
          ? `Q ≈ ${num(c.s.Q)} bei 2 Freiheitsgraden, ${pText(c.s.p)} (χ²-Näherung wie in R). Gäbe es keinen Unterschied zwischen den Zeitpunkten, käme ein so großes Q ${pOften(c.s.p)} Stichproben vor. ${signif(c.s.p)}; Kendalls W ≈ ${num(c.s.W)} ist nach der Faustregel ${wWord(c.s.W)}.`
          : 'Alle Personen haben in allen Tests dasselbe Ergebnis. Dann gibt es keine Reihenfolge, und Q ist nicht definiert.',
      }),
      genau: {
        kurz: 'Bei fünf Personen ist die χ²-Näherung nur grob. Und ein großes Q sagt nicht, welche Zeitpunkte sich unterscheiden.',
        paragraphs: c => [
          'Im Katalog steht die Formel als Q = 12 / (N · k · (k + 1)) · Σ Rⱼ² − 3N(k + 1). Sie ergibt dieselbe Zahl; die Form hier zeigt die Abstände zur Erwartung.',
          `Bei Gleichständen innerhalb einer Person korrigiert R wie friedman.test(): Es teilt durch N · k · (k + 1) − Σ(t³ − t) / (k − 1) statt durch N · k · (k + 1). ${c.s.ties && Number.isFinite(c.s.Q) ? `Hier steigt Q dadurch von ${num(c.s.Qraw)} auf ${num(c.s.Q)}.` : 'Hier gibt es keine Gleichstände.'}`,
          'Bei fünf Personen ist p aus der χ²-Näherung nur ein grober Anhaltspunkt. Für so kleine Studien gibt es Tabellen mit exakten Werten.',
          'Fehlt bei einer Person eine Messung, lässt mariposa die ganze Person weg. Der Friedman-Test braucht von jeder Person alle Messungen.',
        ],
      },
    },
  },
};

// Reiter -------------------------------------------------------------------------------

const TIMES = (c: SampleCtx) => [c.columns.x?.[0] ?? 'wissenstest', c.columns.y?.[0] ?? 'wissenstest_t2', c.columns.z?.[0] ?? 'wissenstest_t3'];
/** Friedman-Test auf den aktuellen 200 Befragten (drei Messungen derselben Personen). */
export function frSample(c: SampleCtx) {
  const cols = columnsOf(c.rows, TIMES(c));
  return friedman(c.rows.map((_, i) => cols.map(v => v[i])));
}
const AGREE: Record<string, string> = { vernachlässigbar: 'kaum', schwach: 'nur schwach', mittel: 'mittelstark', stark: 'stark' };

export const friedmanTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'wissenstest', y: 'wissenstest_t2', z: 'wissenstest_t3' },
    kurz: 'Dieselbe Frage mit allen 200 Befragten: Lösen sie zu den drei Messzeitpunkten unterschiedlich viele Aufgaben im Wissenstest?',
    value: c => { const f = frSample(c); return Number.isFinite(f.Q) ? f.Q : null; },
    result: c => {
      const f = frSample(c);
      if (!Number.isFinite(f.Q)) return { kurz: 'Alle Befragten haben zu allen drei Zeitpunkten dasselbe Ergebnis. Dann gibt es nichts zu ordnen.', fachlich: 'Q ist nicht definiert.' };
      return {
        kurz: `Ordnet jede Person ihre drei Testergebnisse, liegt der erste Test im Schnitt auf Rang ${num(f.meanRanks[0])}, der zweite auf ${num(f.meanRanks[1])}, der dritte auf ${num(f.meanRanks[2])}. Gäbe es keinen Unterschied zwischen den Zeitpunkten, käme ein so großes Q ${pOften(f.p)} Stichproben vor (${pText(f.p)}). Die Befragten sind sich in der Reihenfolge nach der Faustregel ${AGREE[wWord(f.W)]} einig (W ≈ ${num(f.W)}).`,
        fachlich: `Friedman-Test: χ² = Q ≈ ${num(f.Q)} bei ${f.df} Freiheitsgraden, ${pText(f.p)}, Kendalls W ≈ ${num(f.W)}. ${signif(f.p)}; die Übereinstimmung ist nach der Faustregel ${wWord(f.W)}.`,
        zusatz: `Rangsummen: erster Test ${num(f.R[0])}, zweiter ${num(f.R[1])}, dritter ${num(f.R[2])}; ohne Unterschied hätte jeder ${num(f.E)}.`,
      };
    },
    voraussetzung: 'Alle drei Messungen stammen von denselben Personen, und die Personen sind unabhängig voneinander. Die Ergebnisse einer Person lassen sich der Größe nach ordnen.',
    think: [
      {
        question: 'Angenommen, beim ersten Test hätten alle eine Aufgabe mehr gelöst. Was passiert mit dem mittleren Rang des ersten Tests?', options: ['steigt', 'bleibt gleich', 'sinkt'], correct: 0,
        explain: 'Wer beim ersten Mal knapp hinter einem späteren Test lag, zieht jetzt gleich oder vorbei. Der erste Test sammelt höhere Ränge, und Q sinkt hier von 78,08 auf 18,37, weil die Zeitpunkte näher zusammenrücken.',
        kurz: 'Ein besserer Zeitpunkt sammelt höhere Ränge.',
        tryIt: { label: 'erster Test eine Aufgabe mehr', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'up', measure: c => frSample(c).meanRanks[0] },
      },
      {
        question: 'Angenommen, beim zweiten Test hätten alle eine Aufgabe weniger gelöst. Was passiert mit dem mittleren Rang des zweiten Tests?', options: ['steigt', 'bleibt gleich', 'sinkt'], correct: 2,
        explain: 'Der zweite Test fällt bei vielen hinter den ersten oder den dritten zurück. Sein mittlerer Rang sinkt von 2,05 auf 1,73.',
        kurz: 'Ränge vergleichen jeden Zeitpunkt mit den anderen derselben Person.',
        tryIt: { label: 'zweiter Test eine Aufgabe weniger', op: 'shift', column: 'y', value: -1 },
        expect: { change: 'down', measure: c => frSample(c).meanRanks[1] },
      },
    ],
  },
  r: {
    entry: 'friedman_test', variant: 0,
    tokens: {
      friedman_test: { sym: 'friedman_test()', term: 'Friedman', kurz: 'Vergleicht drei oder mehr Messungen derselben Personen über Ränge innerhalb jeder Person. Meldet die mittleren Ränge, χ², p und Kendalls W.', fehler: 'Mit nur zwei Messungen rechnet mariposa nicht und meldet: Friedman test requires at least 3 related measurements. Für zwei Messungen nimmst du wilcoxon_test().' },
    },
    outputMap: [
      { match: 'Mean Rank', atlas: 'mittlerer Rang Rⱼ / N', step: 2, explain: 'Die Rangsumme des ersten Tests geteilt durch 200. Ohne Unterschied läge jeder Test bei 2.' },
      { match: 'Chi-Square', atlas: 'Q', step: 5, explain: 'Die Prüfgröße Q, schon für Gleichstände korrigiert. R nennt sie nach der Verteilung, mit der sie verglichen wird.' },
      { match: 'df', atlas: 'Freiheitsgrade k − 1', explain: 'Drei Zeitpunkte ergeben 3 − 1 = 2 Freiheitsgrade.' },
      { match: '<.001', atlas: 'p-Wert', explain: 'Gäbe es keinen Unterschied zwischen den Zeitpunkten, käme ein so großes Q in weniger als 1 von 1.000 Stichproben vor.' },
      { match: "Kendall's W", atlas: 'Kendalls W', step: 6, explain: 'W = Q / (N(k − 1)) = 78,08 / 400 ≈ 0,2: Die Befragten ordnen die Zeitpunkte nur schwach übereinstimmend.' },
    ],
    check: {
      question: 'Welche Zahl in der Ausgabe ist Q? Tippe sie an.', correct: 'Chi-Square',
      wrong: { 'Mean Rank': 'Fast! Das ist ein mittlerer Rang. Q steht in der Tabelle Test Statistics.', df: 'Fast! Das sind die Freiheitsgrade. Q steht links daneben.', '<.001': 'Fast! Das ist der p-Wert. Er wird aus Q gerechnet.', "Kendall's W": 'Fast! Das ist Kendalls W. Es wird aus Q gerechnet.' },
    },
  },
  next: {
    next: { id: 'pairwise_wilcoxon', why: 'Sagt Q, dass sich die Zeitpunkte unterscheiden, vergleicht der paarweise Wilcoxon-Test jedes Paar von Zeitpunkten.' },
    before: [
      { id: 'paired_design', why: 'Alle Messungen stammen von denselben Personen; jede Person bildet ihren eigenen Block.' },
      { id: 'wilcoxon_test', why: 'Der Rangtest für genau zwei Messungen derselben Personen.' },
    ],
    after: [
      { id: 'effect', why: 'Kendalls W sagt, wie einig sich die Personen in ihrer Reihenfolge sind.' },
    ],
    more: [
      { id: 'kruskal_wallis', why: 'Der Rangtest für unabhängige Gruppen. Dort ordnet man alle gemeinsam, hier jede Person für sich.' },
      { id: 'chi_square_distribution', why: 'Mit dieser Verteilung vergleicht R das Q.' },
    ],
  },
};
