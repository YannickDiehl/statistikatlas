// Begriffskarte „Die Werte streuen“ (positive_sd), Bedingung der Detailansicht für z-Werte und Pearson.
// Zahlen aus dem Lehrdatensatz, in R nachgerechnet: b12-kategorial-design.test.ts.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { num } from '../../format';
import { sampleColumnInfo, sampleSeries, unitText } from '../../sample';

/** Standardabweichung einer Spalte der Auswertung (Rolle x oder y), wie sampleSeries; konstante Spalten genau 0. */
export function spalteSd(c: SampleCtx, role: 'x' | 'y') {
  const id = c.columns[role]?.[0] ?? (role === 'x' ? 'lernzeit' : 'wissenstest'), sd = sampleSeries(c.rows, id).sd;
  return { id, sd: sd < 1e-12 ? 0 : sd };
}

export const LERNZEIT = { mean: 7.7515, sd: 3.237515294, min: 0, max: 18.4, p002: 8.3, z002: 0.1694200491, ab66: 29 } as const;
const Z = LERNZEIT;

export const streuen: ConceptCard = {
  concept: 'positive_sd',
  wofuer: 'Für z-Werte und für die Pearson-Korrelation teilst du durch die Standardabweichung. Das geht nur, wenn sich die Werte unterscheiden. Haben alle dieselbe Antwort, ist s = 0, und durch 0 lässt sich nicht teilen.',
  kurz: 'Eine Standardabweichung über 0 heißt: Mindestens zwei Werte sind verschieden. Nur dann lassen sich z-Werte und Korrelationen berechnen.',
  stellDirVor: {
    text: `Die Lernzeit der 200 Befragten streut: s = ${num(Z.sd)} Stunden. P002 liegt mit ${num(Z.p002)} Stunden ${num(Z.p002 - Z.mean)} Stunden über dem Mittelwert ${num(Z.mean)}, das ergibt z ≈ ${num(Z.z002)}. Hätten alle genau 8 Stunden gelernt, wäre s = 0, und z wäre für niemanden berechenbar.`,
    figures: [
      { label: 'Standardabweichung s', value: `${num(Z.sd)} h` },
      { label: 'P002', value: `${num(Z.p002)} h` },
      { label: 'z-Wert von P002', value: num(Z.z002) },
    ],
  },
  heisst: {
    sym: 's > 0', say: 's größer 0',
    fach: 'Eine Datenreihe hat eine positive Standardabweichung, wenn sie mindestens zwei verschiedene Werte enthält. Bei konstanten Werten ist s = 0; z-Werte dieser Reihe und eine Pearson-Korrelation mit ihr sind dann nicht definiert.',
  },
  bausteine: [
    {
      title: 'Prüfen, ob es Unterschiede gibt',
      was: 'Wir schauen, ob mindestens zwei Personen verschiedene Werte haben. Dann ist die Standardabweichung größer als 0.',
      rechnung: `Lernzeit: von ${num(Z.min)} bis ${num(Z.max)} Stunden, s = ${num(Z.sd)}.`,
      warum: 'Nur wenn Werte verschieden sind, gibt es Abstände zur Mitte. Ohne Abstände ist jede Quadratsumme 0.',
      acht: 'Schon eine einzige abweichende Person macht s größer als 0. Ob die Streuung für eine sinnvolle Auswertung reicht, ist eine andere Frage.',
      concept: 'sd',
    },
    {
      title: 'Nicht durch 0 teilen',
      was: 'Ein z-Wert teilt den Abstand zur Mitte durch s. Ist s = 0, ist auch jeder Abstand 0, und 0 / 0 ergibt keine Zahl.',
      rechnung: `P002: z = (${num(Z.p002)} − ${num(Z.mean)}) / ${num(Z.sd)} ≈ ${num(Z.z002)}. Mit s = 0 stünde dort (8 − 8) / 0.`,
      warum: 'Teilen fragt: Wie oft passt der Nenner hinein? Bei 0 hat diese Frage keine Antwort.',
      acht: 'R meldet dann statt einer Zahl einen Platzhalter für „keine Zahl“ oder NA. Das ist kein Fehler im Code, sondern ein Hinweis auf konstante Werte.',
      concept: 'z',
    },
    {
      title: 'Für Korrelationen beide prüfen',
      was: 'Pearson teilt durch das Produkt beider Standardabweichungen. Streut eine der beiden Spalten nicht, ist r nicht definiert.',
      warum: 'Eine Spalte ohne Unterschiede kann mit nichts zusammenhängen: Es gibt nichts, was gemeinsam schwanken könnte.',
      acht: `Das passiert schneller als gedacht, etwa nach einem Filter: Unter den ${Z.ab66} Befragten ab 66 Jahren ist niemand erwerbstätig.`,
      concept: 'pearson',
    },
  ],
  ausprobieren: [
    {
      question: 'Alle fünf Personen einer Gruppe wählen auf der Links-rechts-Skala die 5. Wie groß ist s?',
      options: ['0', '5', 'nicht definiert'], correct: 0, step: 1,
      explain: 'Alle Abstände zur Mitte sind 0, also auch s. s selbst ist also definiert; nur durch s teilen geht nicht.',
      kurz: 's = 0 ist möglich, Teilen durch s nicht.',
    },
    {
      question: 'Welchen z-Wert hat eine Person in dieser Gruppe?',
      options: ['0', 'keinen, er ist nicht definiert', '1'], correct: 1, step: 2,
      explain: 'z = (5 − 5) / 0 = 0 / 0. Das ist keine Zahl; R zeigt statt eines Ergebnisses einen Platzhalter.',
      kurz: 'Ohne Streuung keine z-Werte.',
    },
    {
      question: 'Unter den Befragten ab 66 Jahren ist niemand erwerbstätig. Kannst du dort Alter und Erwerbstätigkeit korrelieren?',
      options: ['ja', 'nein'], correct: 1, step: 3,
      explain: 'Die Spalte erwerbstaetig ist in dieser Gruppe überall 0, ihre Standardabweichung also 0. r ist dann nicht definiert, R meldet NA.',
      kurz: 'Beide Spalten müssen streuen.',
    },
  ],
  check: {
    question: 'In einer Spalte haben alle 200 Befragten den Wert 8. Was stimmt?',
    options: [
      's = 0, und z-Werte sind nicht definiert.',
      's ist nicht definiert.',
      'Alle z-Werte sind 0.',
      'Die Korrelation mit jeder anderen Spalte ist 0.',
    ],
    correct: 0,
    right: 'Genau. s lässt sich ausrechnen und ist 0. Nur durch s teilen geht nicht.',
    diagnose: {
      1: 'Fast! s ist definiert und beträgt 0. Erst das Teilen durch s geht nicht.',
      2: 'Fast! Der Abstand ist zwar 0, aber 0 / 0 ist keine Zahl und nicht 0.',
      3: 'Fast! Die Korrelation ist nicht 0, sondern gar nicht definiert. R meldet NA.',
    },
  },
  fuerDich: 'Meldet R bei einer Korrelation NA oder eine Warnung zur Standardabweichung, prüf zuerst, ob eine Spalte konstant ist. Oft steckt ein Filter dahinter, nach dem nur noch eine Antwort übrig ist.',
  genau: {
    kurz: 'Mit s > 0 ist das Teilen durch s möglich. Wie verlässlich eine Korrelation ist, hängt zusätzlich von n und der Größe der Streuung ab.',
    paragraphs: [
      'Formal gilt sₓ > 0 genau dann, wenn mindestens zwei Werte verschieden sind. Für Pearson braucht es sₓ > 0 und sᵧ > 0.',
      'Sehr kleine Streuung ist kein Rechenproblem, aber ein inhaltliches: Unterscheiden sich fast alle nicht, hängt ein Ergebnis an wenigen Personen.',
      'Mit nur einem Wert ist s nicht definiert, weil durch n − 1 = 0 geteilt würde. R meldet dann NA. Die Bedingung setzt also mindestens zwei Personen voraus.',
    ],
  },
};

const sdText = (c: SampleCtx, role: 'x' | 'y') => {
  const s = spalteSd(c, role), col = sampleColumnInfo(s.id);
  return { ...s, title: col.title, text: s.sd === 0 ? `„${col.title}“ ist konstant: s = 0` : `„${col.title}“ streut mit s = ${unitText(col, s.sd)}` };
};

export const streuenTabs: ConceptTabs = {
  sample: {
    kind: 'analysis',
    kurz: 'Dieselbe Prüfung mit allen 200 Befragten: Streuen die beiden gewählten Spalten?',
    value: c => spalteSd(c, 'x').sd,
    result: c => {
      const x = sdText(c, 'x'), y = sdText(c, 'y'), ok = x.sd > 0 && y.sd > 0;
      return {
        kurz: `${x.text}, ${y.text}. ${ok ? 'Beide sind größer als 0: z-Werte und die Pearson-Korrelation lassen sich berechnen.' : 'Ohne Streuung lässt sich durch s nicht teilen: z-Werte dieser Spalte und r sind nicht definiert.'}`,
        fachlich: `sₓ = ${num(x.sd)}, sᵧ = ${num(y.sd)}; die Bedingung sₓ > 0 und sᵧ > 0 ist ${ok ? 'erfüllt' : 'verletzt'}.`,
      };
    },
    voraussetzung: 'Für z-Werte muss eine Spalte streuen, für die Pearson-Korrelation beide.',
    think: [
      {
        question: 'Alle Befragten bekommen in der ersten Spalte den Wert 5. Wie groß wird s?', options: ['0', '5', 'nicht definiert'], correct: 0,
        explain: 'Ohne Unterschiede gibt es keine Abstände zur Mitte. s wird 0, und z-Werte dieser Spalte sind nicht mehr definiert.',
        kurz: 'Keine Unterschiede, keine Streuung.',
        tryIt: { label: 'alle auf 5', op: 'constant', column: 'x', value: 5 },
        expect: { change: 'equals', value: 0 },
      },
      {
        question: 'Alle bekommen in der ersten Spalte 1 dazu. Was passiert mit s?', options: ['bleibt gleich', 'wird größer', 'wird kleiner'], correct: 0,
        explain: 'Verschieben ändert die Lage, nicht die Abstände untereinander. s bleibt gleich, auch wenn es vorher 0 war.',
        kurz: 'Verschieben ändert die Streuung nicht.',
        tryIt: { label: 'alle 1 dazu', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'same' },
      },
    ],
  },
  next: {
    next: { id: 'z', why: 'Teilt den Abstand zur Mitte durch s; das geht nur bei s > 0.' },
    before: [{ id: 'sd', why: 'Die Standardabweichung, die größer als 0 sein muss.' }],
    after: [{ id: 'pearson', why: 'Braucht in beiden Spalten eine Standardabweichung über 0.' }],
    more: [{ id: 'divide', why: 'Teilen durch 0 ist nicht definiert.' }],
  },
};
