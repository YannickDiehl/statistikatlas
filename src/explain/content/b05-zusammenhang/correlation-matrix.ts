// Begriffskarte „Korrelationsmatrix“: die fünf Fragen zur Methoden-Zuversicht im Lehrdatensatz, Regler wählt eine
// Frage. „In R“ zeigt die Matrix aus reliability(). In R nachgerechnet, siehe ./b05-zusammenhang.test.ts.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { num } from '../../format';
import { sampleColumn } from '../../sample';
import { columnById } from '../../../domain/survey';
import { pearsonOf } from './shared';

/** cor() der Spalten methoden1 bis methoden5 im Lehrdatensatz (R, sechs Stellen). */
export const METHODEN_R: number[][] = [
  [1, 0.649597, 0.627416, 0.655291, 0.659453],
  [0.649597, 1, 0.607513, 0.676335, 0.610519],
  [0.627416, 0.607513, 1, 0.632465, 0.635840],
  [0.655291, 0.676335, 0.632465, 1, 0.644928],
  [0.659453, 0.610519, 0.635840, 0.644928, 1],
];
const ITEMS = [1, 2, 3, 4, 5].map(k => `methoden${k}`);
/** Fragetext ohne Anführungszeichen, für Sätze wie „Frage 3 („…“)“. */
const question = (k: number) => columnById[ITEMS[k - 1]].question.replace(/[„“]/g, '').replace(/\.$/, '');
const others = (k: number) => METHODEN_R[k - 1].filter((_, j) => j !== k - 1);

export const korrelationsmatrix: ConceptCard = {
  concept: 'correlation_matrix',
  wofuer: 'Fragebögen messen ein Thema oft mit mehreren Fragen. Bevor du sie zu einem Wert zusammenfasst, willst du wissen: Hängen alle Fragen miteinander zusammen? Eine Korrelationsmatrix zeigt alle Paare auf einen Blick.',
  kurz: 'Eine Korrelationsmatrix ist eine Tabelle mit Pearson-r für jedes Paar von Variablen. Sie ist spiegelgleich, und auf der Diagonale steht immer 1.',
  stellDirVor: {
    text: `Fünf Fragen im Lehrdatensatz messen Methoden-Zuversicht, etwa „${question(1)}“, jeweils von 1 bis 7. Wer bei einer Frage zustimmt, stimmt meist auch bei den anderen zu: Je zwei Fragen hängen mit r zwischen ${num(0.607513)} und ${num(0.676335)} zusammen. Die Matrix zeigt alle zehn Paare auf einen Blick.`,
    figures: [
      { label: 'Fragen', value: '5' },
      { label: 'verschiedene Paare', value: '10' },
      { label: 'kleinstes r', value: num(0.607513) },
      { label: 'größtes r', value: num(0.676335) },
    ],
  },
  heisst: {
    sym: 'R', say: 'groß R',
    fach: 'Die Korrelationsmatrix R enthält in Zeile j und Spalte k die Pearson-Korrelation der Variablen j und k. Sie ist symmetrisch, Rⱼₖ = Rₖⱼ, und hat auf der Diagonale 1.',
  },
  bausteine: [
    {
      title: 'Jede Variable mit jeder kreuzen',
      was: 'Zeilen und Spalten nennen dieselben Variablen in derselben Reihenfolge. In jeder Zelle steht r für das Paar aus Zeile und Spalte.',
      warum: 'So siehst du viele Zusammenhänge auf einmal, statt jedes Paar einzeln zu rechnen.',
      acht: 'Jede Zelle ist eine eigene Pearson-Korrelation. Sie beschreibt nur gerade Zusammenhänge, wie jedes r.',
      concept: 'pearson',
    },
    {
      title: 'Die Diagonale lesen',
      was: 'Auf der Diagonale trifft jede Variable auf sich selbst. Dort steht immer 1.',
      warum: 'Eine Variable hängt mit sich selbst perfekt zusammen. Die Diagonale enthält deshalb keine neue Information.',
      acht: 'Haben bei einer Variablen alle denselben Wert, ist r nicht definiert. Dann steht in ihrer Zeile NA statt Zahlen, auch auf der Diagonale.',
    },
    {
      title: 'Nur eine Hälfte lesen',
      was: 'Die Matrix ist spiegelgleich: r von Frage 2 und Frage 4 steht oberhalb und unterhalb der Diagonale.',
      rechnung: 'Bei fünf Variablen: 5 · 4 / 2 = 10 verschiedene Paare.',
      warum: 'Für r spielt die Reihenfolge eines Paars keine Rolle: r von x und y ist r von y und x.',
      acht: 'Zähl die Paare nicht doppelt: 25 Zellen, davon 5 auf der Diagonale und je 10 in jeder Hälfte.',
    },
    {
      title: 'Muster erkennen',
      was: 'Hängen mehrere Fragen alle eng miteinander zusammen, messen sie vermutlich etwas Gemeinsames. Hier liegen alle zehn r zwischen 0,61 und 0,68.',
      warum: 'Solche Muster sind der Ausgangspunkt für Reliabilität und Faktorenanalyse.',
      acht: 'Eine einzelne hohe Korrelation zeigt noch keine Struktur des ganzen Blocks. Erst das Muster aller Paare zählt.',
      concept: 'dimensionality',
    },
  ],
  ausprobieren: [
    {
      question: 'Wie viele verschiedene Korrelationen stehen in einer Matrix mit 6 Variablen?',
      options: ['36', '30', '15'], correct: 2, step: 3,
      explain: '6 · 5 / 2 = 15. Von den 36 Zellen stehen 6 auf der Diagonale, und die übrigen 30 enthalten jedes Paar zweimal.',
      kurz: 'k Variablen ergeben k(k − 1) / 2 Paare.',
    },
    {
      question: 'Frage 2 wird umgepolt: Aus „stimme voll und ganz zu“ wird „stimme überhaupt nicht zu“. Was passiert in ihrer Zeile?',
      options: ['nichts', 'die Vorzeichen drehen sich, die Beträge bleiben', 'alle Werte werden 0'], correct: 1, step: 1,
      explain: 'Umpolen dreht die Richtung jedes Zusammenhangs mit Frage 2: Aus 0,65 wird −0,65. Die Diagonale bleibt 1, und Paare ohne Frage 2 bleiben, wie sie sind.',
      kurz: 'Umpolen dreht eine Zeile und eine Spalte.',
    },
    {
      question: 'Was steht in Zeile 3, Spalte 3?',
      options: ['1', '0', 'r von Frage 3 mit allen anderen'], correct: 0, step: 2,
      explain: 'Zeile 3 und Spalte 3 sind beide Frage 3. Eine Variable hängt mit sich selbst perfekt zusammen: r = 1.',
      kurz: 'Die Diagonale ist immer 1.',
    },
  ],
  regler: {
    label: 'Welche Frage willst du dir ansehen?',
    min: 1, max: 5, step: 1, initial: 1,
    format: v => `Frage ${Math.round(v)}`,
    describe: v => {
      const k = Math.min(5, Math.max(1, Math.round(v))), o = others(k);
      return `Frage ${k} („${question(k)}“) hängt mit den anderen vier zwischen r = ${num(Math.min(...o))} und r = ${num(Math.max(...o))} zusammen.`;
    },
  },
  check: {
    question: 'In Zeile 2, Spalte 4 steht 0,68. Was steht in Zeile 4, Spalte 2?',
    options: ['0,68', '−0,68', '1', 'das lässt sich nicht sagen'], correct: 0,
    right: 'Genau. Die Matrix ist spiegelgleich: r von Frage 2 und Frage 4 ist r von Frage 4 und Frage 2.',
    diagnose: {
      1: 'Fast! Das Vorzeichen dreht sich nur beim Umpolen, nicht beim Tauschen von Zeile und Spalte.',
      2: 'Fast! 1 steht nur auf der Diagonale, wo eine Variable auf sich selbst trifft.',
      3: 'Noch nicht ganz. Es ist dasselbe Paar, also dieselbe Zahl.',
    },
  },
  fuerDich: 'Wenn du in einer Studie eine Korrelationsmatrix siehst, lies nur eine Hälfte und lass die Diagonale weg. Dann such nach Gruppen von Variablen, die alle eng zusammenhängen: Sie messen vermutlich etwas Gemeinsames.',
  genau: {
    kurz: 'Hier stehen Pearson-Korrelationen; Rangkorrelationen sind eine andere mögliche Wahl. Ob alle r auf denselben Personen beruhen, hängt vom Umgang mit fehlenden Werten ab.',
    paragraphs: [
      'Mit einer gemeinsamen vollständigen Fallbasis (listenweise) passen alle r zusammen: Die Matrix ist positiv semidefinit. Paarweiser Ausschluss kann das verletzen, und eine benötigte Inverse kann fehlen.',
      'Bei Likert-Fragen wie hier behandelst du die Antwortstufen als gleich weit voneinander entfernt. Diese Annahme muss zum Ziel der Auswertung passen.',
      'reliability() aus mariposa druckt die Matrix der Fragen als „Inter-Item Correlation Matrix“. Auch die Faktorenanalyse geht von dieser Matrix aus.',
    ],
  },
  picture: 'b05-matrix',
};

// ---------- Reiter ----------

/** Korrelationsmatrix der fünf Fragen für die aktuellen Daten (Frage 1 aus der Rolle x, Frage 2 aus der Rolle y). */
export function matrixData(c: SampleCtx) {
  const ids = [c.columns.x?.[0] ?? ITEMS[0], c.columns.y?.[0] ?? ITEMS[1], ...ITEMS.slice(2)], cols = ids.map(id => sampleColumn(c.rows, id));
  const R = cols.map(a => cols.map(b => pearsonOf(a, b)));
  const pairs: { j: number; k: number; r: number }[] = [];
  for (let j = 0; j < 5; j++) for (let k = j + 1; k < 5; k++) { const r = R[j][k]; if (r !== null) pairs.push({ j, k, r }); }
  return { R, pairs, n: c.rows.length };
}

export const matrixTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: ITEMS[0], y: ITEMS[1] },
    kurz: 'Die Matrix der fünf Fragen zur Methoden-Zuversicht, gerechnet mit allen 200 Befragten.',
    value: c => matrixData(c).R[0][1],
    result: c => {
      const m = matrixData(c);
      if (!m.pairs.length) return { kurz: 'Bei den Fragen streut nichts. Dann gibt es keine Korrelationen.', fachlich: 'Alle Paare sind nicht definiert.' };
      const lo = m.pairs.reduce((a, b) => b.r < a.r ? b : a), hi = m.pairs.reduce((a, b) => b.r > a.r ? b : a), same = m.pairs.every(p => p.r > 0) || m.pairs.every(p => p.r < 0);
      return {
        kurz: `Die fünf Fragen hängen paarweise mit r zwischen ${num(lo.r)} und ${num(hi.r)} zusammen. ${same ? 'Alle Paare zeigen in dieselbe Richtung: Wer einer Frage zustimmt, stimmt meist auch den anderen zu.' : 'Nicht alle Paare zeigen in dieselbe Richtung; eine Frage ist vermutlich andersherum gepolt.'}`,
        fachlich: `Pearson-Korrelationen der Fragen 1 bis 5, listenweise mit n = ${m.n}. Zeile 1: ${m.R[0].map(r => r === null ? 'NA' : num(r)).join(', ')}.`,
        zusatz: `Am engsten hängen Frage ${hi.j + 1} und Frage ${hi.k + 1} zusammen, mit r ≈ ${num(hi.r)}.`,
      };
    },
    voraussetzung: 'Die Antwortstufen werden als gleich weit voneinander entfernt behandelt. Alle r beruhen auf denselben 200 Befragten.',
    think: [
      {
        question: 'Frage 1 wird umgepolt (8 minus Antwort). Was passiert mit r zwischen Frage 1 und Frage 2?', options: ['bleibt gleich', 'wechselt das Vorzeichen', 'wird 0'], correct: 1,
        explain: 'Wer vorher bei Frage 1 hoch lag, liegt jetzt tief. Der Zusammenhang mit Frage 2 dreht seine Richtung, der Betrag bleibt.',
        kurz: 'Umpolen dreht eine Zeile und eine Spalte der Matrix.',
        tryIt: { label: 'Frage 1 umpolen (8 minus Antwort)', op: 'reverse', column: 'x' },
        expect: { change: 'sign' },
      },
      {
        question: 'Und was passiert dabei mit r zwischen Frage 2 und Frage 3?', options: ['bleibt gleich', 'wechselt das Vorzeichen', 'halbiert sich'], correct: 0,
        explain: 'Frage 2 und Frage 3 werden nicht verändert. Ihre Zelle in der Matrix bleibt, wie sie war.',
        kurz: 'Nur Paare mit Frage 1 ändern sich.',
        tryIt: { label: 'Frage 1 umpolen (8 minus Antwort)', op: 'reverse', column: 'x' },
        expect: { change: 'same', measure: c => matrixData(c).R[1][2] },
      },
    ],
  },
  r: {
    entry: 'reliability', variant: 0,
    tokens: {
      rel: { sym: 'rel', term: 'Gespeichertes Ergebnis', kurz: 'Unter diesem Namen speichert R das Ergebnis von reliability(). summary(rel) zeigt es ausführlich, mit der Korrelationsmatrix.', fehler: 'Fehlt die Zeile rel <- …, meldet R bei summary(rel): Objekt \'rel\' nicht gefunden.' },
    },
    outputMap: [
      { match: 'Inter-Item Correlation Matrix', atlas: 'Korrelationsmatrix', explain: 'Diese Tabelle ist die Korrelationsmatrix der fünf Fragen: in jeder Zelle Pearson-r eines Paars.' },
      { match: '0.676', atlas: 'r von Frage 2 und Frage 4', step: 1, explain: 'Zeile (2), Spalte (4): Frage 2 und Frage 4 hängen mit r ≈ 0,68 zusammen, so eng wie kein anderes Paar.' },
      { match: '1.000', atlas: 'Diagonale', step: 2, explain: 'Auf der Diagonale trifft jede Frage auf sich selbst: r = 1.' },
    ],
    check: {
      question: 'Welche Zahl zeigt, wie eng Frage 2 und Frage 4 zusammenhängen? Tippe sie an.', correct: '0.676',
      wrong: {
        '1.000': 'Fast! Das ist die Diagonale: Frage 1 mit sich selbst.',
        '0.650': 'Fast! Das ist r von Frage 1 und Frage 2, oben in Zeile (1).',
      },
    },
  },
  next: {
    next: { id: 'dimensionality', why: 'Wie viele gemeinsame Dimensionen stecken hinter dem Muster der Matrix?' },
    before: [{ id: 'pearson', why: 'Jede Zelle der Matrix ist eine Pearson-Korrelation.' }],
    after: [
      { id: 'reliability', why: 'Fasst zusammen, wie gut mehrere Fragen gemeinsam ein Merkmal messen.' },
      { id: 'efa', why: 'Sucht in der Matrix nach gemeinsamen Faktoren.' },
    ],
    more: [
      { id: 'partial_cor', why: 'Mit mehreren Kontrollvariablen rechnet R über die Inverse der Korrelationsmatrix.' },
      { id: 'item_score', why: 'Passen die Fragen zusammen, bildest du daraus einen Skalenwert.' },
    ],
  },
};
