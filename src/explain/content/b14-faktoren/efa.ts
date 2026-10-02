// Begriffskarte „Komponenten- & Faktorenanalyse“ (efa): der Ablauf von den Korrelationen bis zur Deutung, am Beispiel
// der fünf Fragen zur Methoden-Zuversicht im Lehrdatensatz. Zahlen aus R: b14-faktoren.test.ts.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { num, pct } from '../../format';
import { aboveOne, FRAGE, methodenPca, SPALTEN } from './rechnen';
import { PCA_TOKENS } from './r-zeichen';

/** Hauptkomponenten der fünf Fragen im Lehrdatensatz (R: efa(…, extraction = "pca", n_factors = 1)). */
export const METHODEN_PCA = {
  eigen: [3.5601784, 0.4135994, 0.3741370, 0.3370853, 0.3149998],
  loadings: [0.8521855, 0.8398356, 0.8287300, 0.8566694, 0.8414028],
  /** kleinste und größte Korrelation zweier Fragen */
  rMin: 0.6075127, rMax: 0.6763345,
  kmo: 0.891,
} as const;
const M = METHODEN_PCA;

/** Nicht berechenbar: Eine Frage streut nicht. */
export const NO_PCA = { kurz: 'Mindestens eine Frage streut nicht: Alle haben dort dasselbe angekreuzt. Dann gibt es keine Korrelationen und keine Komponenten.', fachlich: 'Eine konstante Variable hat keine definierte Korrelation; efa() bricht in diesem Fall mit einer Meldung ab.' };

/** Ladungen als Liste: „Frage 1 0,85, Frage 2 0,84, …“ */
export const loadingList = (L: readonly number[]) => L.map((l, j) => `${FRAGE[j]} ${num(l)}`).join(', ');

/** Satz zu den Ladungen der ersten Komponente, aus den Vorzeichen und Beträgen. */
export function loadingSentence(L: readonly number[]): string {
  const neg = L.map((l, j) => l < 0 ? j : -1).filter(j => j >= 0);
  if (neg.length) return `${neg.map(j => `${FRAGE[j]} (${num(L[j])})`).join(' und ')} ${neg.length > 1 ? 'laden' : 'lädt'} negativ: Wer dort zustimmt, liegt in der Komponente eher niedrig.`;
  const lo = Math.min(...L), hi = Math.max(...L);
  return lo >= 0.5 ? `Alle fünf Fragen laden stark auf ihr, zwischen ${num(lo)} und ${num(hi)}.` : `Die Ladungen reichen von ${num(lo)} bis ${num(hi)}; nicht alle Fragen gehören gleich fest dazu.`;
}

export const efa: ConceptCard = {
  concept: 'efa',
  wofuer: 'Fünf Fragen sollen zusammen die Methoden-Zuversicht messen. Steckt hinter den Antworten wirklich eine gemeinsame Sache, oder mehrere? Die Komponenten- und Faktorenanalyse sucht in den Zusammenhängen der Fragen nach einer gemeinsamen Struktur.',
  kurz: 'Die Faktorenanalyse fasst viele Fragen, die eng zusammenhängen, zu wenigen gemeinsamen Größen zusammen. Sie zeigt, welche Fragen zusammengehören und wie viel sie gemeinsam haben.',
  stellDirVor: {
    text: `Im Lehrdatensatz haben 200 Befragte fünf Aussagen zur Methoden-Zuversicht bewertet, etwa „Ich kann ein statistisches Ergebnis erklären.“ Je zwei Fragen korrelieren zwischen ${num(M.rMin)} und ${num(M.rMax)}. Die Hauptkomponentenanalyse in R findet eine Komponente, die ${pct(M.eigen[0] / 5)} der gesamten Streuung bündelt. Alle fünf Fragen laden stark auf ihr, zwischen ${num(Math.min(...M.loadings))} und ${num(Math.max(...M.loadings))}.`,
    figures: [
      { label: 'Fragen', value: '5' },
      { label: 'Korrelationen', value: `${num(M.rMin)} bis ${num(M.rMax)}` },
      { label: 'erste Komponente', value: pct(M.eigen[0] / 5) },
      { label: 'Ladungen', value: `${num(Math.min(...M.loadings))} bis ${num(Math.max(...M.loadings))}` },
    ],
  },
  heisst: {
    fach: 'Die explorative Faktorenanalyse beschreibt die Korrelationsmatrix mehrerer Variablen durch wenige Komponenten (Hauptkomponentenanalyse, PCA) oder gemeinsame Faktoren (etwa mit Maximum Likelihood, ML). Ladungen verbinden die Variablen mit den Komponenten oder Faktoren.',
  },
  bausteine: [
    {
      title: 'Die Zusammenhänge ansehen',
      was: `Für jedes Paar von Fragen rechnen wir die Korrelation. Bei fünf Fragen sind es zehn Paare, hier alle zwischen ${num(M.rMin)} und ${num(M.rMax)}.`,
      warum: 'Gemeinsames zeigt sich daran, dass Fragen zusammen nach oben und unten gehen. Ohne Korrelationen gibt es nichts zu bündeln.',
      acht: 'Sind die Korrelationen nahe 0, findet die Analyse auch nichts Gemeinsames. Der KMO-Wert in R prüft das vorab; hier meldet R KMO = 0.891.',
      concept: 'correlation_matrix',
    },
    {
      title: 'Das Gemeinsame herausziehen',
      was: 'Die Analyse sucht eine neue Größe, die möglichst viel von der Streuung aller fünf Fragen auf einmal erfasst. Das ist die erste Komponente.',
      rechnung: `Erster Eigenwert ${num(M.eigen[0])} von 5: ${num(M.eigen[0])} / 5 ≈ ${pct(M.eigen[0] / 5)}.`,
      warum: 'Fünf standardisierte Fragen haben zusammen eine Streuung von 5, eine je Frage. Die erste Komponente fasst davon 3,56 zusammen.',
      acht: 'Hauptkomponenten und gemeinsame Faktoren sind zwei verschiedene Modelle. In R wählst du mit extraction = "pca" oder "ml" ausdrücklich eins davon.',
      concept: 'factor_model',
    },
    {
      title: 'Entscheiden, wie viele es braucht',
      was: `Eine zweite Komponente käme nur noch auf einen Eigenwert von ${num(M.eigen[1])}. Sie fasst weniger zusammen als eine einzelne Frage.`,
      warum: 'Eine Komponente lohnt sich nur, wenn sie mehr bündelt als eine Frage allein. Hier reicht deshalb eine.',
      acht: 'Die Regel „Eigenwert über 1“ ist eine Faustregel. Mit entscheiden der Inhalt der Fragen und ob sich die Lösung deuten lässt.',
      concept: 'dimensionality',
    },
    {
      title: 'Die Ladungen lesen und deuten',
      was: `Jede Frage bekommt eine Ladung, ihre Korrelation mit der Komponente. Hier liegen alle fünf zwischen ${num(Math.min(...M.loadings))} und ${num(Math.max(...M.loadings))}.`,
      warum: 'An den Ladungen siehst du, welche Fragen zur Komponente gehören. Gibt es mehrere Komponenten, hilft eine Rotation beim Deuten.',
      acht: 'Den Namen gibst du der Komponente selbst, nach dem Inhalt der Fragen. Die Rechnung weiß nicht, was sie misst.',
      concept: 'loadings',
    },
  ],
  ausprobieren: [
    {
      question: 'Angenommen, die fünf Fragen hingen gar nicht zusammen: Jede Korrelation wäre 0. Wie viel würde die erste Komponente dann bündeln?',
      options: ['etwa 20 %, so viel wie eine Frage', 'etwa 71 %', '100 %'], correct: 0, step: 2,
      explain: 'Ohne Zusammenhang hat jede Komponente den Eigenwert 1, also 1 von 5 oder 20 %. Es gibt nichts Gemeinsames, das sich bündeln ließe.',
      kurz: 'Ohne Zusammenhänge gibt es nichts zu bündeln.',
    },
    {
      question: 'Frage 1 wird umgepolt, aus 7 wird 1. Was passiert mit den 71,2 %?',
      options: ['bleiben gleich', 'sinken deutlich', 'steigen'], correct: 0, step: 4,
      explain: 'Umpolen dreht nur das Vorzeichen der Korrelationen von Frage 1. Die Komponente bündelt genauso viel; nur die Ladung von Frage 1 wird negativ, −0,85. Probier es im Teil mit den 200 Befragten aus.',
      kurz: 'Das Vorzeichen einer Frage ändert nichts an der Menge des Gemeinsamen.',
    },
    {
      question: 'Die Analyse findet eine Komponente. Beweist das, dass die Fragen Methoden-Zuversicht messen?',
      options: ['ja', 'nein'], correct: 1, step: 4,
      explain: 'Die Analyse zeigt nur, dass die Antworten zusammen schwanken. Was dahintersteckt, begründest du über den Inhalt der Fragen und weitere Befunde (Begriff „Validität“).',
      kurz: 'Eine Struktur ist noch keine Bedeutung.',
    },
  ],
  check: {
    question: 'Was macht eine Faktorenanalyse?',
    options: [
      'Sie fasst eng zusammenhängende Fragen zu wenigen gemeinsamen Größen zusammen.',
      'Sie prüft, ob sich zwei Gruppen signifikant unterscheiden.',
      'Sie beweist, was die Fragen messen.',
      'Sie macht aus jeder Frage eine eigene Größe.',
    ],
    correct: 0,
    right: 'Genau. Aus vielen zusammenhängenden Fragen werden wenige gemeinsame Größen, und die Ladungen zeigen, welche Frage wohin gehört.',
    diagnose: {
      1: 'Noch nicht ganz. Gruppen vergleicht zum Beispiel ein t-Test. Die Faktorenanalyse sucht Gemeinsames in vielen Fragen.',
      2: 'Fast! Sie zeigt nur, welche Fragen zusammen schwanken. Was sie messen, musst du inhaltlich begründen.',
      3: 'Fast! Ziel ist das Gegenteil: wenige Größen für viele Fragen. Eine Größe je Frage würde nichts zusammenfassen.',
    },
  },
  fuerDich: 'Wenn du liest, ein Fragebogen messe drei Dimensionen, steckt oft eine Faktorenanalyse dahinter. Frag dann: Welches Modell, Hauptkomponenten oder gemeinsame Faktoren? Wie viele Faktoren, und warum? Und passen die Fragen inhaltlich zu den Namen der Faktoren?',
  genau: {
    kurz: 'Hauptkomponenten und gemeinsame Faktoren sind verschiedene Modelle. Zahl der Faktoren, Rotation und Deutung sind Entscheidungen, die du begründen musst.',
    paragraphs: [
      'Die Hauptkomponentenanalyse (PCA) zerlegt die gesamte standardisierte Streuung. Die gemeinsame Faktorenanalyse, etwa mit Maximum Likelihood, erklärt nur den Teil, den die Fragen teilen, und lässt jeder Frage einen eigenen Rest. mariposa rechnet ohne Angabe eine PCA mit Varimax-Rotation; schreib extraction deshalb ausdrücklich hin.',
      'Ohne n_factors nimmt efa() so viele Komponenten, wie Eigenwerte über 1 liegen, mindestens eine. KMO und der Bartlett-Test helfen bei der Frage, ob sich eine Analyse lohnt; eine inhaltliche Prüfung ersetzen sie nicht.',
      'use = "complete" rechnet nur mit Personen, die alle Fragen beantwortet haben. Mit "pairwise" kann eine Korrelationsmatrix entstehen, die sich nicht sinnvoll zerlegen lässt.',
      'Die ML-Schätzung und ihr Modelltest setzen annähernd normalverteilte Antworten voraus; siebenstufige Zustimmungsfragen erfüllen das nur näherungsweise. Die PCA braucht diese Annahme nicht.',
      'Explorativ heißt: Die Struktur wird in den Daten gesucht. Wer eine vorher festgelegte Struktur prüfen will, rechnet eine konfirmatorische Faktorenanalyse.',
    ],
  },
};

const pcaOf = (c: SampleCtx) => methodenPca(c, 1);

export const efaTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { ...SPALTEN },
    kurz: 'Dieselbe Analyse mit allen 200 Befragten: eine Hauptkomponente aus den fünf Fragen zur Methoden-Zuversicht.',
    value: c => pcaOf(c)?.share[0] ?? null,
    result: c => {
      const p = pcaOf(c);
      if (!p) return NO_PCA;
      const L = p.loadings.map(r => r[0]), n = aboveOne(p.values);
      return {
        kurz: `Eine Komponente bündelt ${pct(p.share[0])} der Streuung aller fünf Fragen. ${loadingSentence(L)}`,
        fachlich: `Hauptkomponentenanalyse der Korrelationsmatrix: erster Eigenwert ${num(p.values[0])} von 5, also ${pct(p.share[0])}. Der zweite Eigenwert ist ${num(p.values[1])}; ${n === 1 ? 'nur eine Komponente liegt' : `${n} Komponenten liegen`} über 1.`,
        zusatz: `Die Ladungen: ${loadingList(L)}.`,
      };
    },
    voraussetzung: 'Jede Frage muss streuen. Für die siebenstufigen Fragen nehmen wir gleich große Abstände zwischen den Stufen an.',
    think: [
      {
        question: 'Frage 1 wird umgepolt, aus 7 wird 1. Was passiert mit dem Anteil, den die erste Komponente bündelt?',
        options: ['bleibt gleich', 'sinkt', 'steigt'], correct: 0,
        explain: 'Umpolen dreht nur das Vorzeichen der Korrelationen von Frage 1. Die Komponente bündelt genauso viel, nur die Ladung von Frage 1 wird negativ.',
        kurz: 'Das Vorzeichen einer Frage ändert nichts an der Menge des Gemeinsamen.',
        tryIt: { label: 'Frage 1 umpolen', op: 'reverse', column: 'x' },
        expect: { change: 'same' },
      },
      {
        question: 'Die gewählte Person kreuzt bei Frage 1 die 1 an. Wie viele Komponenten haben danach einen Eigenwert über 1?',
        options: ['1', '2', '5'], correct: 0,
        explain: 'Eine einzelne Antwort ändert die Korrelationen bei 200 Befragten nur wenig. Der zweite Eigenwert bleibt weit unter 1.',
        kurz: 'Eine einzelne Person ändert die Struktur kaum.',
        tryIt: { label: 'die gewählte Person bei Frage 1 auf 1', op: 'outlier', column: 'x', value: 1 },
        expect: { change: 'equals', value: 1, measure: c => { const p = pcaOf(c); return p ? aboveOne(p.values) : null; } },
      },
    ],
  },
  r: {
    entry: 'efa', variant: 0,
    tokens: PCA_TOKENS,
    outputMap: [
      { match: '71.2%', atlas: 'Anteil der ersten Komponente', step: 2, explain: 'Der erste Eigenwert 3,56 geteilt durch 5 Fragen. So viel der gesamten Streuung bündelt die Komponente.' },
      { match: 'KMO', atlas: 'KMO-Wert', step: 1, explain: 'Prüft vorab, ob die Korrelationen genug Gemeinsames enthalten. Werte nahe 1 sind gut; Meritorious heißt verdienstvoll.' },
      { match: '1 component', atlas: 'Zahl der Komponenten', step: 3, explain: 'Eine Komponente, wie mit n_factors = 1 verlangt. Eine zweite käme nur auf den Eigenwert 0,41.' },
      { match: 'N', atlas: 'n', explain: 'Alle 200 Befragten haben alle fünf Fragen beantwortet. listwise heißt: nur vollständige Fälle.' },
    ],
    check: {
      question: 'Welche Zahl sagt, wie viel der Streuung die Komponente bündelt? Tippe sie an.', correct: '71.2%',
      wrong: {
        KMO: 'Fast! Der KMO-Wert prüft vorab, ob sich die Analyse lohnt. Der gebündelte Anteil steht hinter Variance explained.',
        N: 'Fast! N ist die Zahl der Befragten. Der gebündelte Anteil steht hinter Variance explained.',
      },
    },
  },
  next: {
    next: { id: 'factor_model', why: 'Hauptkomponenten oder gemeinsame Faktoren: zwei Modelle, die verschieden viel erklären.' },
    before: [
      { id: 'correlation_matrix', why: 'Die Korrelationen aller Fragenpaare, von denen die Analyse ausgeht.' },
      { id: 'dimensionality', why: 'Die Frage, wie viele gemeinsame Größen es braucht.' },
      { id: 'eigenvalues', why: 'Wie viel Streuung jede Komponente bündelt.' },
    ],
    after: [
      { id: 'loadings', why: 'Welche Frage wie eng zu welcher Komponente gehört.' },
      { id: 'rotation', why: 'Dreht eine Lösung mit mehreren Komponenten, damit sie sich deuten lässt.' },
      { id: 'reliability', why: 'Reicht eine Komponente, prüft Alpha, wie stimmig der Summenwert ist.' },
    ],
    more: [{ id: 'communality', why: 'Wie viel der Streuung einer einzelnen Frage die Lösung erfasst.' }],
  },
};
