// Werkstatt „Cronbachs Alpha“ für den Begriff `reliability` (Reliabilität: Alpha und Omega): fünf Personen, drei Fragen
// zur Methoden-Zuversicht (1 bis 7), sechs Schritte. Ton nach der Streuung (src/explain/content/streuung.ts).
// Alle Zahlen in R nachgerechnet, siehe b14-faktoren.test.ts.
import type { ConceptTabs, Ctx, FNode, SampleCtx, Workshop } from '../../types';
import { close, fixed, num, paren } from '../../format';
import { ref, titleFor } from '../../../domain/learning';
import { cronbach, FRAGE, itemColumns, SPALTEN, variance } from './rechnen';

/** Fünf Personen (Zeilen) mal drei Fragen (Spalten), Antworten von 1 bis 7. */
export type Antworten = number[][];

export type AlphaStats = {
  d: Antworten;
  k: number;
  /** Summenwert je Person und der Durchschnitt ihrer drei Antworten (für die Diagnose „durch 3 geteilt“). */
  X: number[]; personMean: number[];
  sumX: number; meanX: number; devX: number[]; sqX: number[]; ssX: number; varX: number; sdX: number;
  itemSS: number[]; itemVar: number[]; sumItemVar: number;
  /** Kovarianzen der Fragenpaare 1–2, 1–3, 2–3 (wie stats::cov) und ihre Summe. */
  covPairs: number[]; sumCov: number;
  /** sₓ² − Σsⱼ², der gemeinsame Teil (doppelte Summe der Kovarianzen). */
  diff: number;
  /** (sₓ² − Σsⱼ²) / sₓ², ohne k/(k − 1). */
  ratio: number;
  /** Cronbachs Alpha; NaN, wenn die Summenwerte nicht streuen. */
  alpha: number;
  /** Typischer Fehler: k/(k − 1) · Σsⱼ² / sₓ² statt des gemeinsamen Teils. */
  wrongPart: number;
};

const NAMES = ['A', 'B', 'C', 'D', 'E'] as const;
/** Gruppe „Passen zusammen“ (α = 0,96) und „Passen kaum zusammen“ (dieselben Antworten je Frage, anders verteilt: α ≈ 0,34). */
export const ZUSAMMEN: Antworten = [[2, 3, 2], [3, 3, 4], [4, 5, 4], [5, 5, 6], [6, 7, 6]];
export const KAUM: Antworten = [[2, 3, 4], [3, 3, 4], [4, 5, 6], [5, 5, 6], [6, 7, 2]];

const sumOf = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0);
const ss = (xs: readonly number[]) => { const m = sumOf(xs) / xs.length; return xs.reduce((a, x) => a + (x - m) ** 2, 0); };

export function alphaStats(d: Antworten): AlphaStats {
  const n = d.length, k = d[0].length;
  const X = d.map(r => sumOf(r)), sumX = sumOf(X), meanX = sumX / n;
  const devX = X.map(x => x - meanX), sqX = devX.map(x => x * x), ssX = sumOf(sqX), varX = ssX / (n - 1);
  const items = Array.from({ length: k }, (_, j) => d.map(r => r[j]));
  const itemSS = items.map(ss), itemVar = itemSS.map(s => s / (n - 1)), sumItemVar = sumOf(itemVar);
  const diff = varX - sumItemVar, ratio = varX > 1e-12 ? diff / varX : NaN;
  const cov = (a: number[], b: number[]) => { const ma = sumOf(a) / n, mb = sumOf(b) / n; return a.reduce((s, x, i) => s + (x - ma) * (b[i] - mb), 0) / (n - 1); };
  const covPairs = k === 3 ? [cov(items[0], items[1]), cov(items[0], items[2]), cov(items[1], items[2])] : [];
  return {
    d, k, X, personMean: X.map(x => x / k), sumX, meanX, devX, sqX, ssX, varX, sdX: Math.sqrt(varX), itemSS, itemVar, sumItemVar, covPairs, sumCov: sumOf(covPairs),
    diff, ratio, alpha: k / (k - 1) * ratio, wrongPart: varX > 1e-12 ? k / (k - 1) * sumItemVar / varX : NaN,
  };
}

type C = Ctx<AlphaStats>;
const P = (c: C) => c.names[c.who];
const ok = (c: C) => Number.isFinite(c.s.alpha);
/** Alpha in Sätzen („0,96“, „knapp 0,9“, „−1,78“), ohne Wert „nicht berechenbar“. */
const A = (c: C) => ok(c) ? alphaText(c.s.alpha) : 'nicht berechenbar';
/** Alpha in Rechnungen und Kennzahlen: zwei feste Stellen. */
const AN = (c: C) => ok(c) ? fixed(c.s.alpha) : 'nicht berechenbar';
/** „2 · (2,5 + 2,5 + 2,2)“, negative Kovarianzen in Klammern. */
const COVS = (c: C) => `2 · (${c.s.covPairs.map(v => paren(v)).join(' + ')})`;
const VARS = (c: C) => c.s.itemVar.map(v => num(v));
const SUB = ['₁', '₂', '₃'];

/**
 * Wie gut die Fragen zusammenpassen, als Wort, mit den Grenzen von mariposa 0.7.4 (Excellent ab 0.90, Good ab 0.80,
 * Acceptable ab 0.70, Questionable ab 0.60, sonst Poor) auf dem ungerundeten Wert: 0.898 ist „gut“ wie R „Good“.
 */
export function fit(alpha: number): string {
  return alpha >= 0.9 ? 'sehr gut' : alpha >= 0.8 ? 'gut' : alpha >= 0.7 ? 'ausreichend' : alpha >= 0.6 ? 'nur bedingt' : 'schlecht';
}

/** Alpha mit zwei Stellen; liegt es knapp unter einer Grenze, die das Runden erreichen würde: „knapp 0,9“ statt „0,90“. */
export function alphaText(alpha: number): string {
  const edge = [0.9, 0.8, 0.7, 0.6].find(t => alpha < t && Math.round(alpha * 100) / 100 >= t);
  return edge !== undefined ? `knapp ${num(edge)}` : fixed(alpha);
}

const vars = (c: C): FNode[] => c.s.itemVar.flatMap((v, j): FNode[] => [...(j ? [' + '] : []), { part: [num(v)], m: 3 }]);

export const alphaWerkstatt: Workshop<Antworten, AlphaStats> = {
  id: 'cronbach',
  wofuer: 'Fünf Personen beantworten drei Fragen zur Methoden-Zuversicht, zum Beispiel „Ich kann passende Variablen auswählen.“ Die Antworten reichen von 1 (stimme überhaupt nicht zu) bis 7 (stimme voll und ganz zu). Aus den drei Antworten soll eine Zahl je Person werden. Das ist nur sinnvoll, wenn die Fragen zusammenpassen: Wer einer Frage zustimmt, sollte auch den anderen eher zustimmen. Cronbachs Alpha prüft das mit einer einzigen Zahl.',
  mut: 'Die Formel sieht nach viel aus. Sie besteht aber aus sechs kleinen Schritten, die du schon kennst: zusammenzählen, Varianzen rechnen, abziehen, teilen und malnehmen. Das Rechnen übernimmt später R. Hier geht es ums Verstehen.',
  picture: 'b14-alpha',
  names: NAMES,
  bounds: { min: 1, max: 7 },
  presets: [
    { id: 'zusammen', label: 'Passen zusammen', data: ZUSAMMEN },
    { id: 'kaum', label: 'Passen kaum zusammen', data: KAUM },
  ],
  compute: alphaStats,
  glyphs: [
    { sym: 'Xᵢ', say: 'groß X i', term: 'Summenwert', plain: 'alle Antworten von Person i zusammengezählt', step: 1 },
    { sym: 'sₓ²', say: 's x Quadrat', term: 'Varianz der Summenwerte', plain: 'wie stark die Summenwerte streuen', step: 2 },
    { sym: 'sⱼ²', say: 's j Quadrat', term: 'Varianz einer Frage', plain: 'wie stark die Antworten auf Frage j streuen', step: 3 },
    { sym: 'j', say: 'j', term: 'Laufindex der Fragen', plain: 'die Nummer der Frage, von 1 bis k', step: 3 },
    { sym: 'Σ', say: 'Sigma', term: 'Summenzeichen', plain: 'über alle Fragen zusammenzählen', step: 4 },
    { sym: 'sₓ² − Σsⱼ²', say: 's x Quadrat minus Summe der s j Quadrat', term: 'gemeinsamer Teil', plain: 'was nur entsteht, weil die Fragen zusammen nach oben und unten gehen', step: 5 },
    { sym: 'sⱼₗ', say: 's j l', term: 'Stichprobenkovarianz', plain: 'wie Frage j und Frage l gemeinsam um ihre Mitten schwanken', step: 5 },
    { sym: 'k', say: 'k', term: 'Zahl der Fragen', plain: 'wie viele Fragen die Skala hat, hier 3', step: 6 },
    { sym: 'α', say: 'Alpha', term: 'Cronbachs Alpha', plain: 'wie stimmig die Fragen sind, höchstens 1', step: 6 },
  ],
  steps: [
    {
      button: 'Xᵢ', title: 'Je Person zusammenzählen', sym: 'Xᵢ', say: 'groß X i', concept: 'item_score', perPerson: true,
      was: 'Für jede Person zählen wir ihre drei Antworten zusammen. So bekommt jede Person einen Summenwert.',
      rechnung: c => `Person ${P(c)}: ${c.s.d[c.who].join(' + ')} = ${c.s.X[c.who]}`,
      fach: 'Der Summenwert Xᵢ ist die Summe der Antworten von Person i auf alle k Fragen der Skala.',
      warum: 'Am Ende soll eine Zahl je Person die ganze Skala zusammenfassen. Ob die drei Fragen dafür taugen, prüft Alpha.',
      acht: 'Hier zählst du nur zusammen und teilst nicht durch 3. Die Formel für Alpha rechnet mit dem Summenwert.',
      check: {
        question: c => `Welchen Summenwert hat Person ${P(c)}?`,
        answer: c => c.s.X[c.who],
        diagnose: (c, v) => v !== 'NA' && !close(v, c.s.X[c.who]) && close(v, c.s.personMean[c.who])
          ? 'Fast! Das ist der Durchschnitt der drei Antworten. Für den Summenwert zählst du sie nur zusammen.' : null,
      },
    },
    {
      button: 'sₓ²', title: 'Die Streuung der Summenwerte messen', sym: 'sₓ²', say: 's x Quadrat', concept: 'variance', perPerson: true,
      was: 'Wie bei jeder Varianz quadrieren wir die Abstände der Summenwerte zur Mitte und zählen sie zusammen. Dann teilen wir durch n − 1 = 4.',
      rechnung: c => `Mitte: ${num(c.s.sumX)} / 5 = ${num(c.s.meanX)}. Person ${P(c)}: (${c.s.X[c.who]} − ${num(c.s.meanX)})² = ${num(c.s.sqX[c.who])}. Alle zusammen ${num(c.s.ssX)}, geteilt durch 4: sₓ² = ${num(c.s.varX)}.`,
      fach: 'sₓ² ist die korrigierte Stichprobenvarianz der Summenwerte Xᵢ, also ihre Quadratsumme geteilt durch n − 1.',
      warum: 'Passen die Fragen zusammen, landen manche Personen überall oben und andere überall unten. Dann liegen die Summenwerte weit auseinander.',
      acht: 'Geteilt wird durch n − 1 = 4, die Zahl der Personen minus eins. Mit k, der Zahl der Fragen, hat dieser Schritt nichts zu tun.',
      check: {
        question: 'Wie groß ist die Varianz der fünf Summenwerte?',
        answer: c => c.s.varX,
        diagnose: (c, v) => v === 'NA' || close(v, c.s.varX) || c.s.ssX < 1e-9 ? null
          : close(v, c.s.ssX / 5) ? 'Fast! Du hast durch 5 geteilt. Bei der Varianz teilst du durch n − 1 = 4.'
          : close(v, c.s.ssX) ? 'Fast! Das ist noch die Quadratsumme. Jetzt noch durch 4 teilen.'
          : close(v, c.s.sdX) ? 'Fast! Das ist die Standardabweichung. Gefragt ist die Varianz, also ohne Wurzel.'
          : null,
      },
    },
    {
      button: 'sⱼ²', title: 'Jede Frage für sich messen', sym: 'sⱼ²', say: 's j Quadrat', concept: 'variance', perPerson: false,
      was: 'Jetzt rechnen wir die Varianz jeder Frage einzeln, genauso wie eben bei den Summenwerten.',
      rechnung: c => VARS(c).map((v, j) => `Frage ${j + 1}: s${SUB[j]}² = ${v}`).join('; '),
      fach: 'sⱼ² ist die korrigierte Stichprobenvarianz der Antworten auf Frage j, für j = 1 bis k.',
      warum: 'So sehen wir, wie stark jede Frage für sich streut. Gleich vergleichen wir das mit der Streuung der Summenwerte.',
      acht: 'Hier zählt jede Frage einzeln, also jede Spalte der Tabelle. Die Summenwerte kommen in diesem Schritt nicht vor.',
      check: {
        question: 'Wie groß ist die Varianz von Frage 1?',
        answer: c => c.s.itemVar[0],
        diagnose: (c, v) => v === 'NA' || close(v, c.s.itemVar[0]) || c.s.itemSS[0] < 1e-9 ? null
          : close(v, c.s.itemSS[0] / 5) ? 'Fast! Du hast durch 5 geteilt. Auch hier teilst du durch n − 1 = 4.'
          : close(v, c.s.itemSS[0]) ? 'Fast! Das ist noch die Quadratsumme von Frage 1. Jetzt noch durch 4 teilen.'
          : null,
      },
    },
    {
      button: 'Σsⱼ²', title: 'Die Einzelstreuungen zusammenzählen', sym: 'Σsⱼ²', say: 'Summe der s j Quadrat', concept: 'sum', perPerson: false,
      was: 'Wir zählen die drei Varianzen aus Schritt 3 zusammen.',
      rechnung: c => `${VARS(c).join(' + ')} = ${num(c.s.sumItemVar)}`,
      fach: 'Σsⱼ² ist die Summe der Itemvarianzen über alle k Fragen.',
      warum: 'So stark würden die Summenwerte streuen, wenn die Fragen nichts miteinander zu tun hätten. Das ist unser Vergleichsmaßstab.',
      acht: 'Zusammengezählt werden die Varianzen der Fragen, nicht ihre Standardabweichungen. Varianzen lassen sich hier addieren, Standardabweichungen nicht.',
      check: {
        question: 'Wie groß ist die Summe der drei Varianzen?',
        answer: c => c.s.sumItemVar,
        diagnose: (c, v) => v !== 'NA' && !close(v, c.s.sumItemVar) && close(v, c.s.varX)
          ? 'Fast! Das ist die Varianz der Summenwerte aus Schritt 2. Hier zählst du die drei Varianzen der Fragen zusammen.' : null,
      },
    },
    {
      button: 'sₓ² − Σsⱼ²', title: 'Den gemeinsamen Teil herausrechnen', sym: 'sⱼₗ', say: 's j l', concept: 'covariance', perPerson: false,
      was: 'Wir ziehen die Summe der Einzelstreuungen von der Streuung der Summenwerte ab. Was übrig bleibt, entsteht nur, weil die Fragen zusammen nach oben und unten gehen.',
      rechnung: c => `${num(c.s.varX)} − ${num(c.s.sumItemVar)} = ${num(c.s.diff)} = ${COVS(c)}. Die Klammer enthält die Kovarianzen der drei Fragenpaare.`,
      fach: 'Der Unterschied sₓ² − Σsⱼ² ist die doppelte Summe der Kovarianzen sⱼₗ aller Fragenpaare, hier 2 · (s₁₂ + s₁₃ + s₂₃).',
      warum: 'Streuen die Summenwerte stärker als die Fragen einzeln zusammen, dann stimmen die Antworten einer Person überein. Genau das soll eine Skala.',
      acht: c => c.s.diff < -1e-9
        ? 'Hier ist der Unterschied negativ: Die Fragen laufen eher gegeneinander. Prüfe dann, ob eine Frage verkehrt herum gepolt ist.'
        : 'Die Reihenfolge zählt: Streuung der Summenwerte minus Summe der Einzelstreuungen. Andersherum bekommst du das falsche Vorzeichen.',
      check: {
        question: 'Wie viel größer ist die Streuung der Summenwerte als die Summe der Einzelstreuungen?',
        answer: c => c.s.diff,
        diagnose: (c, v) => v === 'NA' || close(v, c.s.diff) ? null
          : Math.abs(c.s.diff) > 0.02 && close(v, -c.s.diff) ? 'Fast! Das Vorzeichen stimmt nicht. Rechne sₓ² minus Σsⱼ², nicht andersherum.'
          : Number.isFinite(c.s.ratio) && close(v, c.s.ratio) ? 'Fast! Das ist schon der Anteil aus dem nächsten Schritt. Hier ist nur der Unterschied gefragt.'
          : null,
      },
    },
    {
      button: 'α', title: 'Den Anteil bilden und hochrechnen', sym: 'α', say: 'Alpha', concept: 'reliability', perPerson: false,
      was: 'Wir teilen den gemeinsamen Teil durch sₓ². Dann nehmen wir das Ergebnis mit k/(k − 1) = 3/2 mal.',
      rechnung: c => ok(c)
        ? `α = 3/2 · ${num(c.s.diff)} / ${num(c.s.varX)} ≈ ${AN(c)}. Der gemeinsame Teil macht ${num(c.s.ratio * 100, 0)} % der Streuung der Summenwerte aus.`
        : 'Alle Summenwerte sind gleich, sₓ² ist 0. Durch 0 lässt sich nicht teilen: Alpha ist hier nicht berechenbar.',
      fach: 'Cronbachs Alpha ist α = k/(k − 1) · (sₓ² − Σsⱼ²) / sₓ², gleichbedeutend mit k/(k − 1) · (1 − Σsⱼ² / sₓ²).',
      warum: 'Selbst bei völlig gleichen Antworten auf alle drei Fragen erreicht der Anteil nur 2/3. Mal 3/2 setzt dieses Höchste auf 1.',
      acht: 'Alpha ist keine Prozentzahl und kein Beweis, dass die Fragen dasselbe messen. Es sagt, wie stimmig die Antworten sind.',
      check: {
        question: 'Wie groß ist Alpha? Zwei Nachkommastellen reichen.',
        answer: c => ok(c) ? c.s.alpha : 'NA',
        diagnose: (c, v) => v === 'NA' || !ok(c) || close(v, c.s.alpha) ? null
          : close(v, c.s.ratio) ? 'Fast! Das ist noch der Anteil. Nimm ihn mit 3/2 mal.'
          : close(v, c.s.wrongPart) ? 'Fast! Du hast mit Σsⱼ² / sₓ² gerechnet. Gefragt ist der gemeinsame Teil: (sₓ² − Σsⱼ²) / sₓ².'
          : null,
      },
    },
  ],
  numeric: c => ['α = ', { part: ['3/2'], m: 6 }, ' · ( ', { part: [num(c.s.varX)], m: 2 }, ' − ', { part: ['('], m: 4 }, ...vars(c), { part: [')'], m: 4 }, ' ) / ', { part: [num(c.s.varX)], m: 2 },
    { br: true }, '= ', { part: ['3/2'], m: 6 }, ' · ', { part: [num(c.s.diff)], m: 5 }, ' / ', { part: [num(c.s.varX)], m: 2 }, ' ≈ ', { part: [AN(c)], m: 6 }],
  table: {
    columns: [
      { head: 'Frage 1', from: 1, active: [1, 3], cell: (c, i) => String(c.s.d[i][0]) },
      { head: 'Frage 2', from: 1, active: [1, 3], cell: (c, i) => String(c.s.d[i][1]) },
      { head: 'Frage 3', from: 1, active: [1, 3], cell: (c, i) => String(c.s.d[i][2]) },
      { head: 'Xᵢ', from: 1, active: [1], cell: (c, i) => String(c.s.X[i]), sum: c => num(c.s.sumX), sumFrom: 2 },
      { head: '(Xᵢ − X̄)²', from: 2, active: [2], cell: (c, i) => num(c.s.sqX[i]), sum: c => num(c.s.ssX), sumFrom: 2 },
    ],
    lines: [
      { from: 2, step: 2, text: c => `X̄ = ${num(c.s.sumX)} / 5 = ${num(c.s.meanX)}; sₓ² = ${num(c.s.ssX)} / 4 = ${num(c.s.varX)}` },
      { from: 3, step: 3, text: c => VARS(c).map((v, j) => `s${SUB[j]}² = ${v}`).join('; ') },
      { from: 4, step: 4, text: c => `Σsⱼ² = ${VARS(c).join(' + ')} = ${num(c.s.sumItemVar)}` },
      { from: 5, step: 5, text: c => `sₓ² − Σsⱼ² = ${num(c.s.varX)} − ${num(c.s.sumItemVar)} = ${num(c.s.diff)} = ${COVS(c)}` },
      { from: 6, step: 6, text: c => ok(c) ? `α = 3/2 · ${num(c.s.diff)} / ${num(c.s.varX)} ≈ ${AN(c)}` : 'α ist nicht berechenbar, weil sₓ² = 0 ist.' },
    ],
  },
  captions: {
    1: 'Jede Linie ist eine Person, jeder Punkt eine Antwort. Rechts stehen die Summenwerte auf einer eigenen Achse. Du kannst die Antworten ziehen.',
    2: 'Der obere Balken zeigt, wie stark die Summenwerte streuen.',
    3: 'Darunter die Streuung jeder Frage für sich.',
    4: 'Die drei Einzelstreuungen aneinandergelegt.',
    5: 'Der Überstand des oberen Balkens ist der gemeinsame Teil.',
    6: 'Alpha ist der gemeinsame Teil als Anteil, mal 3/2.',
  },
  think: [
    {
      question: 'In der Gruppe „Passen zusammen“ kreuzen alle bei Frage 2 dasselbe an, zum Beispiel 4. Was macht Alpha?',
      options: ['steigt', 'bleibt gleich', 'sinkt'], correct: 2, step: 4,
      explain: 'Frage 2 unterscheidet dann niemanden mehr, ihre Varianz ist 0. Sie trägt nichts zur Streuung der Summenwerte bei, zählt aber weiter als eine von drei Fragen. Hier sinkt Alpha von 0,96 auf 0,73. Meist ist das so. Hing Frage 2 vorher kaum mit den anderen zusammen oder lief sie gegen sie, kann Alpha auch steigen. R würde eine Frage ohne Streuung übrigens ganz weglassen; die Formel hier zählt sie mit.',
      kurz: 'Eine Frage, auf die alle gleich antworten, misst nichts.',
      tryIt: { label: 'Passen zusammen, Frage 2 für alle auf 4', apply: () => ZUSAMMEN.map(r => [r[0], 4, r[2]]) },
    },
    {
      question: 'In der Gruppe „Passen zusammen“ wird Frage 3 verkehrt herum gestellt: Aus 6 wird 2, aus 2 wird 6. Was macht Alpha?',
      options: ['bleibt gleich', 'sinkt ein wenig', 'fällt unter 0'], correct: 2, step: 5,
      explain: 'Frage 3 läuft jetzt gegen die anderen. Die Summenwerte streuen viel weniger als die drei Fragen einzeln zusammen. Der Unterschied in Schritt 5 wird negativ, und Alpha fällt von 0,96 auf −1,78.',
      kurz: 'Eine verkehrt gepolte Frage zieht Alpha nach unten, oft unter 0.',
      tryIt: { label: 'Passen zusammen, Frage 3 umgepolt', apply: () => ZUSAMMEN.map(r => [r[0], r[1], 8 - r[2]]) },
    },
    {
      question: 'In der Gruppe „Passen zusammen“ kreuzen alle bei jeder Frage eine Stufe tiefer an. Was macht Alpha?',
      options: ['steigt', 'bleibt gleich', 'sinkt'], correct: 1, step: 2,
      explain: 'Alle Antworten rücken gleich weit. Die Abstände zur Mitte bleiben gleich, also auch alle Varianzen. Alpha ändert sich nicht.',
      kurz: 'Verschieben ändert die Lage, nicht die Stimmigkeit.',
      tryIt: { label: 'Passen zusammen, alle eine Stufe tiefer', apply: () => ZUSAMMEN.map(r => r.map(x => x - 1)) },
    },
    {
      question: 'Warum nimmt die Formel am Ende mit 3/2 mal?',
      options: ['damit Alpha höchstens 1 wird', 'weil durch n − 1 geteilt wird', 'damit Alpha nie negativ wird'], correct: 0, step: 6,
      explain: 'Antwortet jede Person auf alle drei Fragen gleich, dann ist sₓ² genau 9 · s² und Σsⱼ² genau 3 · s², mit s² der Varianz einer Frage. Der Anteil ist dann (9 − 3) / 9 = 2/3. Mal 3/2 ergibt genau 1.',
      kurz: 'k/(k − 1) setzt das Höchste auf 1.',
      tryIt: { label: 'alle antworten wie bei Frage 1', apply: d => d.map(r => [r[0], r[0], r[0]]) },
    },
  ],
  variants: {
    reliability: {
      lastStep: 6,
      kurz: 'Cronbachs Alpha sagt dir, wie gut mehrere Fragen zusammenpassen, die dasselbe messen sollen. Nahe 1: Wer bei einer Frage hoch liegt, liegt meist auch bei den anderen hoch.',
      fachlich: 'Cronbachs Alpha vergleicht die Summe der Itemvarianzen mit der Varianz des Summenwerts. Unter Annahmen schätzt es die Reliabilität des Summenwerts.',
      symbolic: ['α = ', { frac: [{ part: ['k'], m: 6 }], den: [{ part: ['k − 1'], m: 6 }], m: 6 }, ' · ',
        { frac: [{ part: ['sₓ²'], m: 2 }, ' ', { part: ['−'], m: 5 }, ' ', { big: 'Σ', m: 4 }, { part: ['sⱼ²'], m: 3 }], den: [{ part: ['sₓ²'], m: 2 }], m: 5 },
        { br: true }, 'mit ', { part: ['Xᵢ = xᵢ₁ + xᵢ₂ + xᵢ₃'], m: 1 }],
      aria: 'Alpha gleich k durch k minus 1, mal: s x Quadrat minus Summe der s j Quadrat, geteilt durch s x Quadrat. Dabei ist groß X i die Summe der drei Antworten von Person i.',
      metrics: [
        { label: 'Streuung der Summenwerte sₓ²', value: c => num(c.s.varX) },
        { label: 'Summe der Einzelstreuungen Σsⱼ²', value: c => num(c.s.sumItemVar) },
        { label: 'Cronbachs Alpha α', value: AN },
      ],
      interpret: c => {
        if (!ok(c)) return { kurz: 'Alle Summenwerte sind gleich. Dann lässt sich Alpha nicht berechnen.', fachlich: 'Mit sₓ² = 0 ist der Anteil (sₓ² − Σsⱼ²) / sₓ² nicht definiert.' };
        const a = c.s.alpha;
        const kurz = a < 0
          ? `Alpha ist negativ (${A(c)}): Die Fragen laufen eher gegeneinander. Meist ist dann eine Frage verkehrt herum gepolt.`
          : a >= 0.7
            ? `Die drei Fragen passen ${fit(a)} zusammen: Wer bei einer Frage hoch liegt, liegt meist auch bei den anderen hoch. Alpha ist ${A(c)}.`
            : `Die drei Fragen passen ${fit(a)} zusammen: Wer einer Frage zustimmt, stimmt den anderen nicht unbedingt zu. Alpha ist ${A(c)}.`;
        return {
          kurz,
          fachlich: `α = 3/2 · (${num(c.s.varX)} − ${num(c.s.sumItemVar)}) / ${num(c.s.varX)} ≈ ${AN(c)}. Als Faustregel gelten Werte ab 0,7 als ausreichend, ab 0,8 als gut und ab 0,9 als sehr gut; das sind keine festen Grenzen. Ein hohes Alpha zeigt Stimmigkeit, nicht, dass die Fragen das Richtige messen.`,
        };
      },
      genau: {
        kurz: 'Alpha ist nur unter Annahmen eine Reliabilität. Ein hohes Alpha beweist weder, dass die Fragen eine einzige Sache messen, noch dass sie das Richtige messen.',
        paragraphs: () => [
          'Reliabilität heißt: Welcher Anteil der Streuung der Summenwerte geht auf echte Unterschiede zwischen den Personen zurück, nicht auf zufällige Messfehler? Alpha schätzt diesen Anteil, wenn alle Fragen gleich stark mit dem Gemeinsamen zusammenhängen (essenzielle Tau-Äquivalenz) und ihre Messfehler unabhängig sind. Hängen sie verschieden stark zusammen, ist Alpha bei unabhängigen Fehlern eine untere Grenze; bei zusammenhängenden Fehlern kann es die Reliabilität auch überschätzen.',
          'Alpha wächst mit der Zahl der Fragen. Zehn mäßig zusammenhängende Fragen können ein hohes Alpha haben, ohne eine einzige Sache zu messen. Ob eine Dimension reicht, zeigt erst eine Faktorenanalyse (Begriff „Dimensionalität“).',
          'McDonalds Omega ω rechnet über ein Modell mit einem gemeinsamen Faktor: ω = (Σλⱼ)² / ((Σλⱼ)² + Σθⱼ), mit den Ladungen λⱼ und den Fehlervarianzen θⱼ. Gleiche Ladungen muss es nicht annehmen. mariposa meldet Alpha und Omega, jeweils roh und standardisiert; standardisiert heißt: aus den Korrelationen statt aus den Varianzen gerechnet.',
          'Alpha kann negativ werden, wenn die Fragen im Schnitt gegeneinander laufen. Meist ist dann eine Frage verkehrt herum gepolt. Umpolen musst du selbst, zum Beispiel mit rec(x, rules = "rev") in mutate(); reliability() macht das nicht automatisch.',
        ],
      },
    },
  },
};

// Reiter ----------------------------------------------------------------------------------------------------------

/**
 * Alpha der Fragen zur Methoden-Zuversicht in den aktuellen Daten, gerechnet wie mariposa::reliability() 0.7.4: Fragen
 * ohne Streuung lässt R weg (Warnung „item with zero variance is removed from the scale“, wie SPSS), gerechnet wird mit
 * den übrigen; mit weniger als zwei Fragen gibt es kein Alpha.
 */
export function alphaAll(c: SampleCtx) {
  const cols = itemColumns(c.rows), all = cols.map((_, j) => j);
  const keep = all.filter(j => variance(cols[j]) > 1e-12), dropped = all.filter(j => !keep.includes(j));
  return { a: keep.length >= 2 ? cronbach(keep.map(j => cols[j])) : null, keep, dropped };
}

const ZAHLWORT = ['null', 'eine', 'zwei', 'drei', 'vier', 'fünf'];
/** Die Beschriftung, die mariposa 0.7.4 hinter Alpha druckt (.alpha_interpretation). */
export function rLabel(alpha: number): string {
  return alpha < 0 ? 'negative; check item coding' : alpha >= 0.9 ? 'Excellent' : alpha >= 0.8 ? 'Good' : alpha >= 0.7 ? 'Acceptable' : alpha >= 0.6 ? 'Questionable' : 'Poor';
}

export const reliabilityTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { ...SPALTEN },
    kurz: 'Dieselbe Rechnung mit allen 200 Befragten und allen fünf Fragen zur Methoden-Zuversicht.',
    value: c => { const a = alphaAll(c).a?.alpha; return a !== undefined && Number.isFinite(a) ? a : null; },
    result: c => {
      const { a, keep, dropped } = alphaAll(c);
      if (!a || !(a.totalVar > 1e-12) || !Number.isFinite(a.alpha)) return { kurz: 'Zu viele Fragen streuen nicht oder alle Summenwerte sind gleich. Dann lässt sich Alpha nicht berechnen.', fachlich: 'Alpha braucht mindestens zwei Fragen, die streuen, und Summenwerte mit sₓ² > 0.' };
      const k = keep.length, wer = dropped.length ? `Die übrigen ${ZAHLWORT[k]} Fragen` : 'Die fünf Fragen';
      // R druckt das Minus als Bindestrich; im Text steht das echte Minus (Regel 11).
      const rv = `R meldet ${a.alpha.toFixed(3).replace('-', '−')}`, r = `${rv} (${rLabel(a.alpha)})`;
      const kurz = a.alpha < 0
        ? `Alpha ist negativ (${fixed(a.alpha)}): ${wer} laufen eher gegeneinander. Meist ist dann eine Frage verkehrt herum gepolt; R meldet dazu „negative; check item coding“.`
        : a.alpha >= 0.7
          ? `${wer} zur Methoden-Zuversicht passen ${fit(a.alpha)} zusammen: Cronbachs Alpha ist ${alphaText(a.alpha)} (${rv}). Wer einer Frage zustimmt, stimmt meist auch den anderen zu.`
          : `${wer} zur Methoden-Zuversicht passen ${fit(a.alpha)} zusammen: Cronbachs Alpha ist ${alphaText(a.alpha)} (${rv}). Wer einer Frage zustimmt, stimmt den anderen nicht unbedingt zu.`;
      const weg = dropped.length ? ` ${dropped.map(j => FRAGE[j]).join(' und ')} ${dropped.length > 1 ? 'streuen' : 'streut'} nicht: R lässt sie weg und warnt (item with zero variance is removed from the scale); gerechnet ist mit den übrigen ${ZAHLWORT[k]}.` : '';
      const edge = alphaText(a.alpha).startsWith('knapp') ? `; das liegt knapp unter ${alphaText(a.alpha).slice(6)}` : '';
      return {
        kurz,
        fachlich: `k = ${k} Fragen, Σsⱼ² = ${num(a.sumItemVar)}, sₓ² = ${num(a.totalVar)}: α = ${k}/${k - 1} · (1 − ${num(a.sumItemVar)} / ${num(a.totalVar)}) ≈ ${fixed(a.alpha)}.${weg} ${r}${edge}. Aus den Korrelationen gerechnet (standardisiert) ergibt sich ${fixed(a.alphaStd)}. mariposa beschriftet Werte ab 0,9 mit Excellent, ab 0,8 mit Good, ab 0,7 mit Acceptable, ab 0,6 mit Questionable und darunter mit Poor. Im Atlas heißt das sehr gut, gut, ausreichend, nur bedingt und schlecht. Das sind Faustregeln, keine festen Grenzen.`,
        zusatz: a.sumItemVar > 1e-12 ? `Die Summenwerte streuen ${num(a.totalVar / a.sumItemVar)}-mal so stark wie die ${ZAHLWORT[k]} Fragen einzeln zusammen.` : undefined,
      };
    },
    voraussetzung: 'Alpha setzt voraus, dass alle fünf Fragen gleich gepolt sind und etwa gleich stark mit dem Gemeinsamen zusammenhängen.',
    think: [
      {
        question: 'Frage 1 wird umgepolt: Aus 7 wird 1, aus 1 wird 7. Was macht Alpha?',
        options: ['bleibt gleich', 'sinkt deutlich', 'steigt'], correct: 1,
        explain: 'Frage 1 läuft jetzt gegen die anderen vier. Die Summenwerte streuen viel weniger, der gemeinsame Teil schrumpft. In den Ausgangsdaten fällt Alpha von knapp 0,9 auf 0,41.',
        kurz: 'Eine verkehrt gepolte Frage drückt Alpha stark nach unten.',
        tryIt: { label: 'Frage 1 umpolen', op: 'reverse', column: 'x' },
        expect: { change: 'down', atLeast: 0.09 },
      },
      {
        question: 'Alle kreuzen bei Frage 2 „Weder noch“ an, also 4. Was macht Alpha?',
        options: ['steigt', 'bleibt gleich', 'sinkt'], correct: 2,
        explain: 'Frage 2 unterscheidet niemanden mehr. R lässt sie deshalb weg und rechnet mit den übrigen vier; eine gut passende Frage fehlt dann. In den Ausgangsdaten sinkt Alpha von knapp 0,9 auf 0,88.',
        kurz: 'Eine Frage ohne Streuung trägt nichts zur Messung bei.',
        tryIt: { label: 'alle bei Frage 2 auf 4', op: 'constant', column: 'y', value: 4 },
        expect: { change: 'down' },
      },
    ],
  },
  r: {
    entry: 'reliability', variant: 0,
    tokens: {
      reliability: { sym: 'reliability()', term: titleFor(ref('reliability')), kurz: 'Rechnet Cronbachs Alpha und McDonalds Omega für Fragen, die zusammen eine Skala bilden sollen. Die Fragen stehen durch Kommas getrennt in der Klammer.', fehler: 'Mit nur einer Frage bricht mariposa ab: `reliability()` requires at least 2 items.' },
      summary: { sym: 'summary()', term: 'Ausführliche Ausgabe', kurz: 'Zeigt alle Tabellen der Reliabilitätsanalyse: Kennwerte je Frage, die Korrelationen und Alpha ohne jede einzelne Frage.', fehler: 'Ohne summary() zeigt R nur zwei Zeilen: Cronbach\'s Alpha = 0.898 (Good), McDonald\'s Omega = 0.899 und N.' },
    },
    outputMap: [
      { match: '0.898', atlas: 'Cronbachs Alpha α', step: 6, explain: 'Das Ergebnis von Schritt 6, hier mit allen fünf Fragen und allen 200 Befragten.' },
      { match: 'McDonald\'s Omega', atlas: 'McDonalds Omega ω', explain: 'Omega rechnet über ein Modell mit einem gemeinsamen Faktor. Hier liegt es mit 0.899 fast gleichauf mit Alpha.' },
      { match: 'Std. Deviation', atlas: 'sⱼ, die Wurzel aus sⱼ²', step: 3, explain: 'Die Standardabweichung jeder Frage. Ihr Quadrat ist die Varianz aus Schritt 3: 1,425 · 1,425 ≈ 2,03.' },
      { match: 'Corrected', atlas: 'Trennschärfe', explain: 'Die Korrelation einer Frage mit der Summe der übrigen vier. Für Frage 1 meldet R 0.761.' },
      { match: 'Alpha if', atlas: 'Alpha ohne diese Frage', explain: 'So groß wäre Alpha ohne Frage 1: 0.873. Weil das weniger als 0.898 ist, trägt Frage 1 zur Stimmigkeit bei.' },
    ],
    check: {
      question: 'Welche Zahl in der Ausgabe ist Cronbachs Alpha für alle fünf Fragen? Tippe sie an.', correct: '0.898',
      wrong: {
        'Std. Deviation': 'Fast! Das ist die Standardabweichung von Frage 1. Alpha steht oben hinter Cronbach\'s Alpha.',
        Corrected: 'Fast! Das ist die Trennschärfe von Frage 1. Alpha für alle fünf Fragen steht oben.',
        'Alpha if': 'Fast! Das ist Alpha ohne Frage 1. Alpha für alle fünf Fragen steht oben hinter Cronbach\'s Alpha.',
      },
    },
  },
  next: {
    next: { id: 'dimensionality', why: 'Ein hohes Alpha zeigt Stimmigkeit. Ob die Fragen wirklich eine einzige Sache messen, ist eine eigene Frage.' },
    before: [
      { id: 'item_score', why: 'Der Summenwert je Person, dessen Streuung Alpha mit den Einzelstreuungen vergleicht.' },
      { id: 'variance', why: 'Jede Streuung in der Formel ist eine Varianz mit n − 1.' },
      { id: 'covariance', why: 'Der gemeinsame Teil aus Schritt 5 ist die doppelte Summe der Kovarianzen.' },
    ],
    after: [
      { id: 'validity', why: 'Stimmige Antworten heißen noch nicht, dass die Fragen das Richtige messen.' },
      { id: 'factor_model', why: 'Omega rechnet über ein Modell mit einem gemeinsamen Faktor.' },
    ],
    more: [
      { id: 'measurement_error', why: 'Reliabilität ist der Anteil der Streuung, der nicht auf zufällige Messfehler zurückgeht.' },
      { id: 'recode', why: 'Verkehrt gepolte Fragen polst du vor der Rechnung um.' },
    ],
  },
};
