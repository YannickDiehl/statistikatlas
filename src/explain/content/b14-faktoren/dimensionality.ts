// Begriffskarte „Dimensionalität“: zwei Dimensionen beim Vertrauen in Politik und Kirchen (ALLBUS 2023, ungewichtet)
// gegen eine Dimension bei der Methoden-Zuversicht (Lehrdatensatz). Zahlen aus R: b14-faktoren.test.ts.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { count, fixed, num } from '../../format';
import { aboveOne, methodenPca, pct1, SPALTEN } from './rechnen';
import { METHODEN_PCA, NO_PCA } from './efa';
import { VERTRAUEN as V, range } from './allbus';
import { N_FACTORS, EXTRACTION, PCA, ROTATION, VARIMAX } from './r-zeichen';

/** Der Schalter der Karte: 0 Vertrauen (ALLBUS), 1 Methoden-Zuversicht (Lehrdatensatz). */
export const isMethoden = (v: number) => v >= 0.5;

export const dimensionality: ConceptCard = {
  concept: 'dimensionality',
  picture: 'b14-scree',
  wofuer: 'Vertrauen in den Bundestag, in die Bundesregierung, in die Parteien, in die katholische und in die evangelische Kirche: Messen diese fünf Fragen ein einziges Vertrauen oder zwei verschiedene? Davon hängt ab, ob du sie zu einem Wert zusammenfassen darfst.',
  kurz: 'Die Dimensionalität sagt dir, wie viele gemeinsame Merkmale hinter einer Gruppe von Fragen stecken. Nur wenn es eines ist, passt ein einziger Skalenwert.',
  stellDirVor: {
    text: `Im ALLBUS 2023 haben ${count(V.n)} Befragte alle fünf Vertrauensfragen beantwortet (ungewichtet). Die drei politischen Institutionen korrelieren untereinander mit ${range(V.rPolitik)}, die beiden Kirchen mit ${num(V.rKirche)}. Zwischen Politik und Kirche liegen die Korrelationen nur bei ${range(V.rQuer)}. Die Hauptkomponentenanalyse findet zwei Eigenwerte über 1, nämlich ${num(V.eigen[0])} und ${num(V.eigen[1])}. Zwei Dimensionen also: Vertrauen in die Politik und Vertrauen in die Kirchen.`,
    figures: [
      { label: 'Befragte', value: count(V.n) },
      { label: 'erster Eigenwert', value: num(V.eigen[0]) },
      { label: 'zweiter Eigenwert', value: num(V.eigen[1]) },
      { label: 'dritter Eigenwert', value: num(V.eigen[2]) },
    ],
  },
  heisst: {
    fach: 'Die Dimensionalität eines Itemblocks ist die Zahl gemeinsamer Merkmale (Faktoren), die nötig ist, um das Muster seiner Korrelationen angemessen zu beschreiben. Sie hängt von der inhaltlichen Frage und vom gewählten Messmodell ab.',
  },
  bausteine: [
    {
      title: 'Das Muster der Korrelationen ansehen',
      was: 'Fragen, die dasselbe messen, korrelieren eng miteinander. Bilden sich Gruppen mit engen Korrelationen innen und schwachen nach außen, deutet das auf mehrere Dimensionen.',
      rechnung: `Innerhalb der Politik ${range(V.rPolitik)}, innerhalb der Kirchen ${num(V.rKirche)}, dazwischen ${range(V.rQuer)}.`,
      warum: 'Was gemeinsam schwankt, hat vermutlich eine gemeinsame Quelle. Zwei getrennte Gruppen sprechen für zwei Quellen.',
      acht: 'Eine einzelne hohe Korrelation zeigt noch keine Dimension. Es zählt das Muster aller Paare.',
      concept: 'correlation_matrix',
    },
    {
      title: 'Die großen Eigenwerte zählen',
      was: 'Die Hauptkomponentenanalyse liefert je Komponente einen Eigenwert. Komponenten mit einem Eigenwert über 1 fassen mehr zusammen als eine einzelne Frage.',
      rechnung: `Vertrauen: ${num(V.eigen[0])} und ${num(V.eigen[1])} liegen über 1, dann ${num(V.eigen[2])}. Methoden-Zuversicht: ${num(METHODEN_PCA.eigen[0])}, dann nur ${num(METHODEN_PCA.eigen[1])}.`,
      warum: 'Bei standardisierten Fragen bringt jede Frage eine Streuung von 1 mit. Eine Komponente unter 1 bündelt weniger als eine einzige Frage.',
      acht: 'Die Regel „Eigenwert über 1“ ist eine Faustregel. Ein Knick im Verlauf der Eigenwerte und der Inhalt der Fragen zählen mit.',
      concept: 'eigenvalues',
    },
    {
      title: 'Inhaltlich prüfen',
      was: 'Zwei Dimensionen sind nur sinnvoll, wenn die Gruppen inhaltlich zusammenpassen. Politik hier, Kirchen dort: Das lässt sich gut begründen.',
      warum: 'Die Zahlen zeigen, was zusammen schwankt. Was es bedeutet, entscheidest du mit dem Inhalt der Fragen.',
      acht: 'Ähnliche Formulierungen oder die Neigung, überall zuzustimmen, können eine scheinbare Dimension erzeugen. Prüfe den Wortlaut der Fragen.',
      concept: 'operationalization',
    },
  ],
  ausprobieren: [
    {
      question: 'Darfst du die fünf Vertrauensfragen zu einem einzigen Mittelwert zusammenfassen?',
      options: ['ja, sie hängen ja alle positiv zusammen', 'besser zwei Werte: Politik und Kirchen'], correct: 1, step: 2,
      explain: 'Alle fünf korrelieren positiv, aber in zwei Gruppen. Ein einziger Mittelwert würde zwei verschiedene Arten von Vertrauen vermischen. Zwei Skalenwerte bilden die Struktur ab.',
      kurz: 'Ein Skalenwert je Dimension.',
    },
    {
      question: `Die fünf Vertrauensfragen haben zusammen ein Cronbachs Alpha von ${fixed(V.alpha)}. Beweist das, dass sie eine einzige Dimension messen?`,
      options: ['ja', 'nein'], correct: 1, step: 2,
      explain: 'Alpha wird auch bei mehreren Dimensionen hoch, wenn genug Fragen positiv zusammenhängen. Ob es eine Dimension ist, zeigen erst die Eigenwerte, und hier sind es zwei.',
      kurz: 'Stimmigkeit ist nicht dasselbe wie eine Dimension.',
    },
    {
      question: 'Schalte das Bild auf die Methoden-Zuversicht. Wie viele Dimensionen legen die Eigenwerte dort nahe?',
      options: ['eine', 'zwei', 'fünf'], correct: 0, step: 2,
      explain: `Nur der erste Eigenwert liegt über 1 (${num(METHODEN_PCA.eigen[0])}); der zweite ist ${num(METHODEN_PCA.eigen[1])}. Die fünf Fragen messen im Wesentlichen eine Sache.`,
      kurz: 'Ein großer Eigenwert, dann nur kleine: eine Dimension.',
    },
  ],
  regler: {
    label: 'Welche Fragen zeigt das Bild?',
    min: 0, max: 1, step: 1, initial: 0,
    format: v => isMethoden(v) ? 'Methoden-Zuversicht, Lehrdatensatz' : 'Vertrauen, ALLBUS 2023',
    describe: v => isMethoden(v)
      ? `Methoden-Zuversicht: Nur ein Eigenwert liegt über 1 (${num(METHODEN_PCA.eigen[0])}), der nächste bei ${num(METHODEN_PCA.eigen[1])}. Eine Dimension reicht.`
      : `Vertrauen: Zwei Eigenwerte liegen über 1 (${num(V.eigen[0])} und ${num(V.eigen[1])}), der dritte bei ${num(V.eigen[2])}. Es braucht zwei Dimensionen.`,
  },
  check: {
    question: 'Was beschreibt die Dimensionalität?',
    options: [
      'Wie viele gemeinsame Merkmale hinter einer Gruppe von Fragen stecken.',
      'Wie viele Fragen ein Fragebogen hat.',
      'Wie stimmig die Antworten auf eine Skala sind.',
      'Wie viele Antwortstufen eine Frage hat.',
    ],
    correct: 0,
    right: 'Genau. Es geht darum, wie viele gemeinsame Merkmale das Muster der Korrelationen braucht, meist viel weniger als Fragen.',
    diagnose: {
      1: 'Fast! Die Zahl der Fragen ist k. Die Dimensionalität fragt, wie viele gemeinsame Merkmale dahinterstecken; meist sind es viel weniger.',
      2: 'Fast! Das misst Cronbachs Alpha. Auch eine stimmige Skala kann zwei Dimensionen haben.',
      3: 'Noch nicht ganz. Die Antwortstufen gehören zu einer einzelnen Frage, nicht zur Struktur vieler Fragen.',
    },
  },
  fuerDich: 'Bevor du aus mehreren Fragen einen Mittelwert bildest, frag: Messen sie wirklich eine Sache? Ein Blick auf die Korrelationen und die Eigenwerte schützt davor, Verschiedenes zu einem Wert zu vermischen.',
  genau: {
    kurz: 'Wie viele Dimensionen es braucht, ist eine begründete Entscheidung. Eigenwerte, Modellpassung, Inhalt und Stabilität entscheiden gemeinsam.',
    paragraphs: [
      'Ein Faktor und mehrere unterscheidbare Faktoren sind konkurrierende Beschreibungen desselben Korrelationsmusters. Welche passt, hängt von der Fragestellung, der Modellpassung und davon ab, ob die Lösung in anderen Stichproben wiederkehrt.',
      `Hohe interne Konsistenz beweist keine Eindimensionalität: Die fünf Vertrauensfragen haben zusammen ein Cronbachs Alpha von ${fixed(V.alpha)}, obwohl sie zwei Dimensionen haben. Auch ähnliche Formulierungen oder Antwortstile können zusätzliche gemeinsame Streuung erzeugen.`,
      'Die Zahl der Hauptkomponenten ist nicht automatisch die Zahl latenter Merkmale. Ein großer erster Eigenwert oder die Regel „über 1“ entscheiden die Frage nicht allein; weitere Hilfen sind der Knick im Verlauf der Eigenwerte (Scree-Plot) und die Parallelanalyse.',
      `Die ALLBUS-Zahlen sind ungewichtet. Die Vertrauensfragen wurden nur einem Teil der Befragten gestellt (Split); gerechnet ist mit den ${count(V.n)} Personen, die alle fünf beantwortet haben.`,
    ],
  },
};

const pcaOf = (c: SampleCtx) => methodenPca(c, 1);

export const dimensionalityTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { ...SPALTEN },
    kurz: 'Wie viele Dimensionen stecken in den fünf Fragen zur Methoden-Zuversicht? Die Eigenwerte mit allen 200 Befragten.',
    value: c => { const p = pcaOf(c); return p ? aboveOne(p.values) : null; },
    result: c => {
      const p = pcaOf(c);
      if (!p) return NO_PCA;
      const n = aboveOne(p.values), [v1, v2] = p.values;
      return {
        kurz: n <= 1
          ? `Nur eine Komponente hat einen Eigenwert über 1 (${num(v1)}); der zweite liegt bei ${num(v2)}. Die fünf Fragen messen im Wesentlichen eine Sache.`
          : `${n} Komponenten haben einen Eigenwert über 1. Die fünf Fragen könnten mehr als eine Sache messen; prüfe, ob die Gruppen inhaltlich zusammenpassen.`,
        fachlich: `Eigenwerte der Korrelationsmatrix: ${p.values.map(v => num(v)).join(', ')}. Zusammen ergeben sie mit allen Nachkommastellen 5, die Zahl der Fragen.`,
        zusatz: `Die erste Komponente bündelt ${pct1(p.share[0])} der Streuung, die zweite nur ${pct1(p.share[1])}.`,
      };
    },
    voraussetzung: 'Die Regel „Eigenwert über 1“ ist eine Faustregel. Sie gilt für die Korrelationsmatrix, also für standardisierte Fragen.',
    think: [
      {
        question: 'Die gewählte Person kreuzt bei Frage 1 die 7 an. Wie viele Komponenten haben danach einen Eigenwert über 1?',
        options: ['1', '2', '5'], correct: 0,
        explain: 'Eine einzelne Antwort ändert die Korrelationen bei 200 Befragten nur wenig. Der zweite Eigenwert bleibt weit unter 1, es bleibt bei einer Dimension.',
        kurz: 'Eine Person allein schafft keine neue Dimension.',
        tryIt: { label: 'die gewählte Person bei Frage 1 auf 7', op: 'outlier', column: 'x', value: 7 },
        expect: { change: 'equals', value: 1 },
      },
      {
        question: 'Frage 2 wird umgepolt. Was passiert mit der Zahl der Eigenwerte über 1?',
        options: ['bleibt gleich', 'steigt', 'sinkt'], correct: 0,
        explain: 'Umpolen dreht nur Vorzeichen von Korrelationen; die Eigenwerte bleiben genau dieselben. Eine verkehrt gepolte Frage ist keine eigene Dimension.',
        kurz: 'Polung ändert die Zahl der Dimensionen nicht.',
        tryIt: { label: 'Frage 2 umpolen', op: 'reverse', column: 'y' },
        expect: { change: 'same' },
      },
    ],
  },
  r: {
    entry: 'efa', variant: 2,
    tokens: { extraction: EXTRACTION, '"pca"': PCA, n_factors: N_FACTORS, rotation: ROTATION, '"varimax"': VARIMAX },
    outputMap: [
      { match: '79.5%', atlas: 'Anteil beider Komponenten', step: 2, explain: 'Mit einer Komponente waren es 71,2 %. Die zweite bringt nur 8,3 Prozentpunkte dazu, weniger als eine einzelne Frage mit 20 %.' },
      { match: '2 components', atlas: 'zwei Komponenten', explain: 'So viele, wie n_factors = 2 verlangt, nicht so viele, wie die Daten nahelegen.' },
      { match: 'KMO', atlas: 'KMO-Wert', step: 1, explain: 'Prüft vorab, ob die Korrelationen genug Gemeinsames enthalten. Wie viele Dimensionen es sind, sagt er nicht.' },
    ],
    check: {
      question: 'Welche Zahl zeigt, wie viel beide Komponenten zusammen bündeln? Tippe sie an.', correct: '79.5%',
      wrong: {
        KMO: 'Fast! Der KMO-Wert prüft vorab die Korrelationen. Den gebündelten Anteil zeigt Variance explained.',
        '2 components': 'Fast! Das ist nur die Zahl der Komponenten, die du verlangt hast. Den gebündelten Anteil zeigt Variance explained.',
      },
    },
  },
  next: {
    next: { id: 'eigenvalues', why: 'Die Zahlen, mit denen du die Dimensionen zählst.' },
    before: [
      { id: 'correlation_matrix', why: 'Das Muster der Korrelationen, in dem die Dimensionen stecken.' },
      { id: 'operationalization', why: 'Klärt, welche Merkmale die Fragen messen sollen.' },
    ],
    after: [
      { id: 'item_score', why: 'Ein gemeinsamer Skalenwert passt nur bei einer Dimension.' },
      { id: 'factor_model', why: 'Ein- und Mehrfaktorenmodelle beschreiben dasselbe Muster verschieden.' },
      { id: 'reliability', why: 'Alpha prüft die Stimmigkeit, nicht die Zahl der Dimensionen.' },
    ],
    more: [{ id: 'validity', why: 'Die Struktur der Fragen ist ein Baustein der Begründung, was sie messen.' }],
  },
};
