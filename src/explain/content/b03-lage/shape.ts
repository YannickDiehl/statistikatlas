// Begriffskarte „Schiefe & Kurtosis“ (shape). Grenzfall: Es gibt eine Formel, aber niemand rechnet sie von Hand;
// zu verstehen ist, was Vorzeichen und Größe über die Form sagen. Beispiel aus dem Lehrdatensatz (Haushaltseinkommen
// und Lernzeit der 200 Befragten), der Regler verschiebt das höchste Einkommen. Referenzwerte in R: b03-lage.test.ts.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { num } from '../../format';
import { baseSurvey, sampleColumn } from '../../sample';
import { column, excessKurtosis, mean, median, quantile6, skewness, T } from './lage';

/** Haushaltseinkommen (€ im Monat) und Lernzeit der 200 Befragten: Form und Lage wie in R. */
export const FORM = {
  einkommen: { skew: 0.7915222, kurt: 0.6781967, mean: 3154.62, median: 2772, q1: 2223, q3: 4087.75, max: 8636, top: 'P054' },
  lernzeit: { skew: 0.1962485, kurt: 0.3383592, kurtosis: 3.3383592, mean: 7.7515, median: 7.6 },
} as const;
const E = FORM.einkommen, Z = FORM.lernzeit;
const eur = (v: number) => `${num(v)} €`;

/** Die 200 Einkommen, bei denen der Haushalt mit dem höchsten Einkommen `top` € hat (für Regler und Bild). */
export function incomesWithTop(top: number): number[] {
  const rows = baseSurvey(), xs = sampleColumn(rows, 'einkommen'), at = rows.findIndex(r => r.id === E.top);
  return xs.map((v, i) => i === at ? top : v);
}
/** Schiefe, Exzess, Mittelwert und Median der Einkommen mit dem höchsten Einkommen `top`. */
export function formWithTop(top: number) {
  const xs = incomesWithTop(top);
  return { xs, skew: skewness(xs), kurt: excessKurtosis(xs), mean: mean(xs), median: median(xs), max: Math.max(...xs) };
}

export const shape: ConceptCard = {
  concept: 'shape',
  picture: 'b03-schiefe',
  wofuer: `Beim Haushaltseinkommen der 200 Befragten liegt der Mittelwert bei ${eur(E.mean)} im Monat, der Median nur bei ${eur(E.median)}. Einige wenige Haushalte haben sehr viel Geld und ziehen den Mittelwert nach oben. Die Schiefe fasst diese Asymmetrie in eine Zahl, die Kurtosis beschreibt die Ränder.`,
  kurz: 'Die Schiefe sagt, ob eine Verteilung zu einer Seite ausläuft: Positiv heißt ein langer Ausläufer zu großen Werten, negativ zu kleinen. Die Kurtosis sagt, wie stark die Ränder besetzt sind, verglichen mit einer Normalverteilung.',
  stellDirVor: {
    text: `Im Lehrdatensatz hat das Haushaltseinkommen eine Schiefe von ${num(E.skew)}: Die mittlere Hälfte der Haushalte hat zwischen ${eur(E.q1)} und ${eur(E.q3)}, einzelne bis zu ${eur(E.max)}. Die Lernzeit ist mit einer Schiefe von ${num(Z.skew)} fast symmetrisch; ihr Mittelwert ${num(Z.mean)} h liegt nah am Median ${num(Z.median)} h. Die Kurtosis (als Exzess) beträgt beim Einkommen ${num(E.kurt)}, bei der Lernzeit ${num(Z.kurt)}.`,
    figures: [
      { label: 'Schiefe Einkommen', value: num(E.skew) },
      { label: 'Schiefe Lernzeit', value: num(Z.skew) },
      { label: 'Exzess Einkommen', value: num(E.kurt) },
      { label: 'Exzess Lernzeit', value: num(Z.kurt) },
    ],
  },
  heisst: {
    sym: 'G₁', say: 'G eins',
    fach: 'Die Schiefe G₁ ist das dritte standardisierte Moment der Abweichungen vom Mittelwert, mit Stichprobenkorrektur. Die Kurtosis beruht auf dem vierten Moment; als Exzess ist sie um 3 vermindert, sodass eine Normalverteilung 0 hat.',
  },
  bausteine: [
    {
      title: 'Abstände hoch drei nehmen',
      was: 'Jeden Abstand zum Mittelwert nimmst du dreimal mit sich selbst mal. Das Vorzeichen bleibt dabei erhalten.',
      rechnung: '(+2)³ = +8, (−2)³ = −8, (+4)³ = +64.',
      warum: 'Große Abstände zählen dadurch sehr stark. Liegen die großen Abstände vor allem rechts, überwiegt das Plus, und die Schiefe wird positiv.',
      acht: 'Hoch drei, nicht hoch zwei: Das Quadrat machte alles positiv, und links und rechts ließen sich nicht mehr unterscheiden.',
      concept: 'deviation',
    },
    {
      title: 'Durch s³ teilen',
      was: 'Den Durchschnitt dieser Würfelzahlen teilst du durch die Standardabweichung hoch drei. So hat die Schiefe keine Einheit mehr.',
      warum: 'Ob in Euro oder in Cent gemessen, die Form bleibt dieselbe. Deshalb lassen sich Schiefen verschiedener Variablen vergleichen.',
      acht: 'Eine Schiefe nahe 0 heißt nur: Keine Seite überwiegt. Die Verteilung kann trotzdem zwei Gipfel haben; schau dir immer auch das Bild an.',
      concept: 'sd',
    },
    {
      title: 'Die Ränder ansehen',
      was: 'Die Kurtosis nimmt die Abstände hoch vier. Sie wird groß, wenn einige Werte sehr weit von der Mitte liegen.',
      warum: 'Sie zeigt, ob extreme Werte häufiger sind als bei einer Normalverteilung. R meldet sie als Exzess, bei einer Normalverteilung ist er 0.',
      acht: 'Die Kurtosis misst nicht, wie spitz der Gipfel ist. Sie reagiert vor allem auf die Ränder; schon ein einziger Ausreißer kann sie stark erhöhen.',
      concept: 'normal_distribution',
    },
  ],
  regler: {
    label: 'Wie viel Geld hat der Haushalt mit dem höchsten Einkommen im Monat?',
    min: E.max, max: 30000, step: 100, initial: E.max,
    format: v => eur(v),
    describe: v => {
      const f = formWithTop(v);
      return Math.abs(v - E.max) < 1
        ? `So ist es in den Daten: Die Schiefe beträgt ${num(f.skew)}. Der Mittelwert ${eur(f.mean)} liegt über dem Median ${eur(f.median)}.`
        : `Mit ${eur(v)} für diesen Haushalt beträgt die Schiefe ${num(f.skew)} und der Exzess ${num(f.kurt)}. Der Mittelwert wandert auf ${eur(f.mean)}, der Median bleibt bei ${eur(f.median)}.`;
    },
  },
  ausprobieren: [
    {
      question: 'Alle Einkommen verdoppeln sich. Was passiert mit der Schiefe?',
      options: ['bleibt gleich', 'verdoppelt sich', 'wird kleiner'], correct: 0, step: 2,
      explain: 'Abstände und Standardabweichung verdoppeln sich beide. Teilt man durch s³, kürzt sich das heraus: Die Form der Verteilung bleibt dieselbe.',
      kurz: 'Die Einheit ändert die Form nicht.',
    },
    {
      question: 'Der Haushalt mit dem höchsten Einkommen hätte 30.000 € im Monat. Was passiert mit Mittelwert und Median?',
      options: ['Der Mittelwert steigt, der Median bleibt.', 'Beide steigen gleich stark.', 'Der Median steigt, der Mittelwert bleibt.'], correct: 0, step: 1,
      explain: `Der Mittelwert steigt von ${eur(E.mean)} auf ${eur(formWithTop(30000).mean)}, der Median bleibt bei ${eur(E.median)}. Die Schiefe springt von ${num(E.skew)} auf ${num(formWithTop(30000).skew)}. Probier es mit dem Regler oben.`,
      kurz: 'Ein langer Ausläufer zieht den Mittelwert, nicht den Median.',
    },
    {
      question: 'Eine Verteilung hat eine positive Schiefe. Wo liegt der Mittelwert meistens?',
      options: ['über dem Median', 'unter dem Median', 'genau auf dem Median'], correct: 0, step: 1,
      explain: 'Ein Ausläufer zu großen Werten zieht den Mittelwert nach oben, den Median kaum. Diese Faustregel gilt meistens, aber nicht immer.',
      kurz: 'Rechts schief: Mittelwert meist über dem Median.',
    },
  ],
  check: {
    question: 'R meldet für eine Variable eine Schiefe von −1,2. Was heißt das?',
    options: ['Die Verteilung läuft zu kleinen Werten hin aus.', 'Die Verteilung läuft zu großen Werten hin aus.', 'Die Werte liegen eng beieinander.', 'Die meisten Werte sind negativ.'],
    correct: 0,
    right: 'Genau. Das Minus zeigt einen langen Ausläufer nach links, zu kleinen Werten.',
    diagnose: {
      1: 'Fast! Das wäre eine positive Schiefe. Das Minus zeigt nach links, zu kleinen Werten.',
      2: 'Fast! Wie eng die Werte liegen, misst die Streuung. Die Schiefe sagt nur, zu welcher Seite die Verteilung ausläuft.',
      3: 'Fast! Die Schiefe sagt nichts über das Vorzeichen der Werte. Auch lauter positive Zahlen können links schief verteilt sein.',
    },
  },
  fuerDich: 'Bei Einkommen, Mieten oder Wartezeiten ist die Verteilung oft rechts schief. Lies dann neben dem Mittelwert immer auch den Median: Er beschreibt den typischen Haushalt besser.',
  genau: {
    kurz: 'mariposa rechnet Schiefe und Kurtosis mit Stichprobenkorrektur, wie SPSS. Bei kleinen Stichproben und mit Ausreißern schwanken beide stark.',
    paragraphs: [
      'Mit den Momenten mᵣ = Σ(xᵢ − x̄)ʳ / n ist die Schiefe G₁ = √(n(n − 1)) / (n − 2) · m₃ / m₂^(3/2). Die Kurtosis als Exzess ist G₂ = ((n + 1) · g₂ + 6) · (n − 1) / ((n − 2)(n − 3)) mit g₂ = m₄ / m₂² − 3.',
      `w_kurtosis() meldet ohne weitere Angabe den Exzess. Mit excess = FALSE kommt die Kurtosis selbst heraus, bei der Lernzeit ${num(Z.kurtosis)} statt ${num(Z.kurt)}.`,
      `Als Faustregel gilt eine Schiefe mit einem Betrag unter 0,5 als fast symmetrisch, über 1 als deutlich schief. Formkennwerte ergänzen ein Bild der Verteilung (Begriff „${T('empirical_distribution')}“), sie ersetzen es nicht.`,
    ],
  },
};

/** Schiefe, Exzess, Mittelwert und Median der Spalte x in den aktuellen Daten. */
export function formOf(c: SampleCtx) {
  const col = column(c, 'x', 'lernzeit'), xs = col.values, m = mean(xs);
  return { col, n: xs.length, skew: skewness(xs), kurt: excessKurtosis(xs), mean: m, median: median(xs), q1: quantile6(xs, 0.25), above: xs.filter(v => v > m + 1e-9).length, below: xs.filter(v => v < m - 1e-9).length };
}
/** Faustregel für die Form: fast symmetrisch, etwas schief, deutlich schief, mit Richtung aus dem Vorzeichen. */
export function formWords(skew: number): string {
  const a = Math.abs(skew), side = skew > 0 ? 'zu großen Werten' : 'zu kleinen Werten';
  return a < 0.5 ? 'ist fast symmetrisch verteilt' : a <= 1 ? `läuft etwas ${side} hin aus` : `läuft deutlich ${side} hin aus`;
}

export const shapeTabs: ConceptTabs = {
  sample: {
    kind: 'analysis',
    kurz: 'Dieselbe Frage mit allen 200 Befragten: Läuft die Verteilung einer Spalte zu einer Seite aus?',
    value: c => { const s = formOf(c).skew; return Number.isFinite(s) ? s : null; },
    result: c => {
      const f = formOf(c), u = f.col.u, t = f.col.info.title;
      if (!Number.isFinite(f.skew)) return { kurz: `Bei „${t}“ haben alle denselben Wert. Ohne Streuung gibt es keine Form.`, fachlich: 'Die Standardabweichung ist 0, deshalb sind Schiefe und Kurtosis nicht definiert.' };
      const rel = Math.abs(f.mean - f.median) < 0.005 ? 'genau auf' : f.mean > f.median ? 'über' : 'unter';
      return {
        kurz: `„${t}“ ${formWords(f.skew)}: Die Schiefe beträgt ${num(f.skew)}. Der Mittelwert ${u(f.mean)} liegt ${rel} dem Median ${u(f.median)}.`,
        fachlich: `Schiefe G₁ ≈ ${num(f.skew)}, Exzess-Kurtosis G₂ ≈ ${num(f.kurt)} bei n = ${f.n}. Nach einer Faustregel gilt ein Betrag der Schiefe unter 0,5 als fast symmetrisch, über 1 als deutlich schief.`,
        zusatz: `${f.above} von ${f.n} Befragten liegen über dem Mittelwert, ${f.below} darunter.`,
      };
    },
    voraussetzung: 'Schiefe und Kurtosis brauchen Zahlen mit sinnvollen Abständen und mindestens drei, für die Kurtosis vier Werte. Ein einzelner Ausreißer kann beide stark verändern.',
    think: [
      {
        question: 'Alle lernen doppelt so lange. Was passiert mit der Schiefe?', options: ['bleibt gleich', 'verdoppelt sich', 'wird kleiner'], correct: 0,
        explain: 'Alle Abstände und die Standardabweichung verdoppeln sich. Durch s³ geteilt, kürzt sich das heraus: Die Form bleibt dieselbe.',
        kurz: 'Die Einheit ändert die Form nicht.',
        tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        expect: { change: 'same' },
      },
      {
        question: 'Die Lernzeit wird gespiegelt: 60 minus Stunden. Was passiert mit der Schiefe?', options: ['wechselt das Vorzeichen', 'bleibt gleich', 'wird 0'], correct: 0,
        explain: 'Aus Abständen nach rechts werden Abstände nach links. Hoch drei behält jeder Abstand seine Größe, nur das Vorzeichen dreht sich.',
        kurz: 'Spiegeln dreht die Seite des Ausläufers.',
        tryIt: { label: 'Lernzeit spiegeln (60 minus Stunden)', op: 'reverse', column: 'x' },
        expect: { change: 'sign' },
      },
      {
        question: 'Eine Person lernt plötzlich 40 Stunden. Was passiert mit der Schiefe?', options: ['die Verteilung wird stärker schief', 'bleibt gleich', 'sie wird kleiner'], correct: 0,
        explain: 'Hoch drei genommen wird der Abstand dieser Person riesig. In den Ausgangsdaten springt die Schiefe von 0,2 auf 2,72 bis 2,82, je nachdem, wer es ist.',
        kurz: 'Ein einziger Ausreißer kann die Schiefe stark verändern.',
        tryIt: { label: 'die gewählte Person auf 40 Stunden', op: 'outlier', column: 'x', value: 40 },
        expect: { change: 'stronger' },
      },
    ],
  },
  r: {
    entry: 'shape', variant: 0,
    outputMap: [
      { match: 'Skewness', atlas: 'Schiefe G₁', step: 2, explain: 'Skewness heißt Schiefe. Positiv: ein Ausläufer zu großen Werten; nahe 0: fast symmetrisch.' },
      { match: 'N', atlas: 'n', explain: 'N zählt die gültigen Werte, mit denen R die Schiefe rechnet.' },
      { match: 'Missing', atlas: 'fehlende Werte', explain: 'Missing zählt Befragte ohne Antwort. Im Lehrdatensatz fehlt niemand.' },
    ],
    check: {
      question: 'Welche Zahl in der Ausgabe ist die Schiefe? Tippe sie an.', correct: 'Skewness',
      wrong: {
        N: 'Fast! N ist die Zahl der Befragten. Die Schiefe steht unter Skewness.',
        Missing: 'Fast! Missing zählt fehlende Antworten. Die Schiefe steht unter Skewness.',
      },
    },
  },
  next: {
    next: { id: 'describe', why: 'Zeigt Schiefe und Kurtosis zusammen mit Mittelwert, Median und Streuung.' },
    before: [
      { id: 'deviation', why: 'Die Abstände zum Mittelwert, die hoch drei und hoch vier genommen werden.' },
      { id: 'sd', why: 'Durch s³ und s⁴ geteilt, werden die Kennwerte einheitenfrei.' },
    ],
    after: [
      { id: 'normality_test', why: 'Prüft, ob Daten zu einer Normalverteilung passen; Schiefe und Exzess geben erste Hinweise.' },
      { id: 'median', why: 'Bei schiefen Verteilungen beschreibt er die Mitte besser als der Mittelwert.' },
    ],
    more: [{ id: 'outliers_influence', why: 'Einzelne extreme Werte verändern Schiefe und Kurtosis stark.' }],
  },
};
