// Begriffskarte „Verbundene Messungen“: dieselben 200 Befragten lösen den Wissenstest zweimal. Gepaart gerechnet ist t
// mehr als doppelt so groß wie für zwei fremde Gruppen. Der Regler zeigt, wie der Zusammenhang r der beiden Tests die
// Streuung der Veränderungen verkleinert. Referenzwerte: ./b10-mittelwerte.test.ts.
import type { ConceptCard, ConceptTabs } from '../../types';
import { num, signed } from '../../format';
import { dfText, pairedFor, pText } from './stats';

/** Wissenstest zu Zeitpunkt 1 und 2 im Lehrdatensatz (R: mean, sd, cor, gepaarter und Welch-t-Test). */
export const WISSEN = {
  n: 200, m1: 10.125, m2: 10.875, d: 0.75, s1: 3.11575265, s2: 3.48714437, sd: 1.893522, r: 0.8413497,
  tPaired: 5.601519, tWelch: 2.268145, dfWelch: 393.0573, pWelch: 0.02386226,
} as const;

/** Streuung der Veränderungen bei einem Zusammenhang r der beiden Tests: √(s₁² + s₂² − 2 · r · s₁ · s₂). */
export const sdForR = (r: number) => Math.sqrt(WISSEN.s1 ** 2 + WISSEN.s2 ** 2 - 2 * r * WISSEN.s1 * WISSEN.s2);
/** t der mittleren Veränderung 0,75 bei diesem Zusammenhang, mit 200 Personen. */
export const tForR = (r: number) => WISSEN.d / (sdForR(r) / Math.sqrt(WISSEN.n));

export const pairedDesign: ConceptCard = {
  concept: 'paired_design',
  picture: 'b10-verbunden',
  wofuer: 'Dieselben 200 Befragten lösen einen Wissenstest zweimal, zu zwei Zeitpunkten. Haben sie beim zweiten Mal mehr gelöst? Dass es dieselben Menschen sind, ist eine wertvolle Information. Verbundene Messungen halten sie fest.',
  kurz: 'Verbundene Messungen stammen von denselben Personen, etwa vorher und nachher. Beim Vergleich bleibt jede Messung mit ihrer Person verbunden.',
  stellDirVor: {
    text: `Im Lehrdatensatz lösen die 200 Befragten beim ersten Wissenstest im Mittel ${num(WISSEN.m1)} von 20 Aufgaben, beim zweiten ${num(WISSEN.m2)}. Die Personen unterscheiden sich stark: Die Testwerte streuen mit s ≈ ${num(WISSEN.s1)} und ${num(WISSEN.s2)} Aufgaben. Ihre Veränderungen streuen viel weniger, mit s ≈ ${num(WISSEN.sd)} Aufgaben. Wer beim ersten Mal gut war, ist es meist auch beim zweiten Mal (r ≈ ${num(WISSEN.r)}).`,
    figures: [
      { label: 'erster Test', value: `${num(WISSEN.m1)} Aufgaben` },
      { label: 'zweiter Test', value: `${num(WISSEN.m2)} Aufgaben` },
      { label: 't als Paare', value: num(WISSEN.tPaired) },
      { label: 't als fremde Gruppen', value: num(WISSEN.tWelch) },
    ],
  },
  heisst: {
    fach: 'Verbundene (abhängige) Stichproben: Mehrere Messungen gehören über dieselbe Person oder denselben Block zusammen. Unabhängig sein sollen die Personen beziehungsweise Blöcke, nicht ihre Messungen.',
  },
  bausteine: [
    {
      title: 'Die Messungen derselben Person zusammenhalten',
      was: 'Jede Zeile im Datensatz ist eine Person mit zwei Spalten: wissenstest und wissenstest_t2. Diese Zuordnung darf beim Vergleich nicht verloren gehen.',
      warum: 'Nur so lässt sich sagen, wie sich eine bestimmte Person verändert hat.',
      acht: 'Wer eine Spalte für sich sortiert oder beide Tests als zwei Gruppen behandelt, zerreißt die Paare. Die Zahlen sehen danach harmlos aus, aber die Information ist weg.',
      concept: 'pairs',
    },
    {
      title: 'Die Unterschiede zwischen den Personen herausrechnen',
      was: 'Für jede Person zählt nur ihre Veränderung: zweiter minus erster Test. Wie gut jemand überhaupt ist, fällt dabei heraus.',
      rechnung: `Testwerte: s ≈ ${num(WISSEN.s1)} und ${num(WISSEN.s2)} Aufgaben. Veränderungen: s ≈ ${num(WISSEN.sd)} Aufgaben.`,
      warum: 'Der Test misst die mittlere Veränderung dann am kleinen Schwanken der Veränderungen. Deshalb wird t größer.',
      acht: 'Das geht nur, wenn beide Messungen dasselbe auf derselben Skala messen. Zwei verschiedene Fragen an dieselbe Person sind keine zwei Zeitpunkte.',
      concept: 'paired_difference',
    },
    {
      title: 'Unabhängig sind die Personen, nicht die Messungen',
      was: 'Die 200 Personen sollen unabhängig voneinander ausgewählt sein. Die zwei Messungen derselben Person hängen dagegen zusammen, und das ist gewollt.',
      warum: 'Gepaarte Verfahren nutzen genau diesen Zusammenhang. Ein Test für unabhängige Gruppen würde ihn übersehen.',
      acht: 'Auch zwei verschiedene Menschen können ein Paar bilden, etwa zwei Partner aus einem Haushalt. Entscheidend ist eine feste Zuordnung.',
      concept: 'sampling',
    },
  ],
  ausprobieren: [
    {
      question: 'Was passiert mit t, wenn du die Paare übersiehst und die beiden Tests wie zwei fremde Gruppen vergleichst?',
      options: ['t wird kleiner', 't bleibt gleich', 't wird größer'], correct: 0, step: 2,
      explain: `Dann misst der Test die mittlere Veränderung am großen Schwanken zwischen den Personen. Im Lehrdatensatz fällt t von ${num(WISSEN.tPaired)} auf ${num(WISSEN.tWelch)}; das zeigt auch der Regler bei r = 0.`,
      kurz: 'Wer die Paare zerreißt, verschenkt Genauigkeit.',
    },
    {
      question: 'Je enger die beiden Tests derselben Person zusammenhängen, desto …',
      options: ['kleiner die Streuung der Veränderungen', 'größer die Streuung der Veränderungen', 'gleich bleibt die Streuung der Veränderungen'], correct: 0, step: 2,
      explain: 'Wer beim ersten Mal gut war und beim zweiten Mal auch, hat eine kleine Veränderung. Je enger der Zusammenhang, desto ähnlicher sind die Veränderungen. Schieb den Regler nach rechts.',
      kurz: 'Ein enger Zusammenhang macht den gepaarten Vergleich genau.',
    },
    {
      question: 'Eine Befragung fragt 100 Menschen nach ihrem Vertrauen in den Bundestag und ein Jahr später 100 andere. Sind das verbundene Messungen?',
      options: ['ja', 'nein'], correct: 1, step: 3,
      explain: 'Es sind verschiedene Menschen. Ohne feste Zuordnung gibt es keine Paare; das sind zwei unabhängige Stichproben.',
      kurz: 'Gleiche Frage reicht nicht, es braucht dieselben Personen.',
    },
  ],
  regler: {
    label: 'Wie eng hängen die beiden Tests derselben Person zusammen?',
    min: 0, max: 0.95, step: 0.01, initial: WISSEN.r,
    format: v => `r = ${num(v)}`,
    describe: v => `Bei r = ${num(v)} streuen die Veränderungen um ${num(sdForR(v))} Aufgaben. Die mittlere Veränderung von +0,75 Aufgaben ist dann ${num(tForR(v))} Standardfehler groß.${v < 0.005 ? ' So rechnet auch, wer die Paare übersieht.' : ''}`,
  },
  check: {
    question: 'Welche dieser Messungen sind verbunden?',
    options: [
      'Vertrauen in den Bundestag von Männern und von Frauen',
      'Lernzeit derselben Studierenden vor und nach der Klausur',
      'Mieten in Marburg und in Gießen',
      'Wahlabsicht von 18-Jährigen und von 60-Jährigen',
    ],
    correct: 1,
    right: 'Genau. Dieselben Menschen werden zweimal gemessen, jede Messung gehört zu einer Person.',
    diagnose: {
      0: 'Fast! Männer und Frauen sind verschiedene Menschen. Das sind zwei unabhängige Gruppen.',
      2: 'Noch nicht ganz. Verschiedene Wohnungen in zwei Städten bilden keine festen Paare.',
      3: 'Fast! Zwei Altersgruppen bestehen aus verschiedenen Personen. Verbunden wären sie nur, wenn dieselben Menschen zweimal gefragt würden.',
    },
  },
  fuerDich: 'Wenn du dieselben Menschen mehrfach befragst, halte die Messungen über eine Kennung zusammen. In R bildest du dann die Differenz mit mutate() und testest sie, statt die Zeitpunkte wie fremde Gruppen zu vergleichen.',
  genau: {
    kurz: 'Verbundene Messungen brauchen gepaarte Verfahren. Unabhängig sein müssen die Personen beziehungsweise Blöcke.',
    paragraphs: [
      'Die Varianz der Differenzen hängt am Zusammenhang der beiden Messungen: s₁² + s₂² − 2 · r · s₁ · s₂. Ist r = 0 und sind beide Gruppen gleich groß, ergibt der gepaarte Vergleich dasselbe t wie der Welch-t-Test für zwei unabhängige Gruppen. Je größer r, desto kleiner die Streuung der Differenzen.',
      'Im Lehrdatensatz gelten die drei Wissenstests als gleich schwere Fassungen mit je 20 Aufgaben; dass sie vergleichbar sind, wird im Lehrbeispiel angenommen. Die Daten sagen nichts darüber, warum sich die Ergebnisse verändern.',
      'Für mehr als zwei Messzeitpunkte gibt es eigene Verfahren, etwa den Friedman-Test mit Rängen. Für eine Ja-nein-Frage vorher und nachher nimmt man den McNemar-Test.',
    ],
  },
};

export const pairedDesignTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'wissenstest', y: 'wissenstest_t2' },
    kurz: 'Dieselben 200 Befragten, zwei Tests: einmal als Paare gerechnet, einmal so, als wären es zwei fremde Gruppen.',
    value: c => pairedFor(c).t,
    result: c => {
      const p = pairedFor(c);
      if (!(p.sdD > 0)) return { kurz: 'Alle haben sich um gleich viele Aufgaben verändert. Ohne Streuung der Veränderungen ist t nicht definiert.', fachlich: 's = 0 bei den Differenzen; der gepaarte t-Test lässt sich nicht berechnen.' };
      const fewer = Math.abs(p.tU) < Math.abs(p.t);
      return {
        kurz: `Als Paare gerechnet ist die mittlere Veränderung von ${signed(p.dMean)} Aufgaben ${num(Math.abs(p.t))} Standardfehler groß. Als zwei fremde Gruppen gerechnet sind es ${fewer ? 'nur ' : ''}${num(Math.abs(p.tU))}, weil dann das Schwanken zwischen den Personen mitzählt.`,
        fachlich: `Gepaarter t-Test: t(${p.df}) ≈ ${num(p.t)}, ${pText(p.p)}. Welch-t-Test mit denselben Werten als unabhängige Gruppen: t ≈ ${num(p.tU)} bei ${dfText(p.dfU)} Freiheitsgraden, ${pText(p.pU)}. Die beiden Tests hängen mit r ≈ ${num(p.r)} zusammen.`,
        zusatz: `Die Testwerte streuen mit s ≈ ${num(p.sx)} und ${num(p.sy)} Aufgaben, die Veränderungen mit s ≈ ${num(p.sdD)}.`,
      };
    },
    voraussetzung: 'Die 200 Befragten sind unabhängig voneinander, und beide Tests messen dasselbe auf derselben Skala.',
    think: [
      {
        question: 'Alle lösen beim ersten Test eine Aufgabe mehr. Was passiert mit der Streuung der Veränderungen?', options: ['wird größer', 'bleibt gleich', 'wird kleiner'], correct: 1,
        explain: 'Jede Veränderung wird um 1 kleiner, alle gemeinsam. Die Abstände zwischen den Veränderungen bleiben, also auch ihre Streuung.',
        kurz: 'Was alle gleich trifft, ändert die Streuung nicht.',
        tryIt: { label: 'erster Test eine Aufgabe mehr', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'same', measure: c => pairedFor(c).sdD },
      },
      {
        question: 'Alle lösen beim zweiten Test eine Aufgabe weniger. Was passiert mit t, als Paare gerechnet?', options: ['bleibt gleich', 'wird kleiner', 'wird größer'], correct: 1,
        explain: 'Jede Veränderung wird um 1 kleiner, die mittlere Veränderung auch. Die Streuung bleibt, also sinkt t. In den Ausgangsdaten wird aus einem Plus ein Minus.',
        kurz: 't folgt der mittleren Veränderung.',
        tryIt: { label: 'zweiter Test eine Aufgabe weniger', op: 'shift', column: 'y', value: -1 },
        expect: { change: 'down' },
      },
    ],
  },
  r: {
    entry: 't_test', variant: 3,
    tokens: {
      differenz: { sym: 'differenz', term: 'Gepaarte Differenzen', kurz: 'Die neue Spalte: für jede Person der zweite Test minus der erste. So bleibt jede Veränderung bei ihrer Person.', fehler: 'Schreibst du die Spalte in mutate() anders als in t_test(), meldet R: Column `differenz` doesn\'t exist.' },
    },
    outputMap: [
      { match: 'N', atlas: 'Personen', step: 1, explain: 'N = 200: Jede Person geht mit einer Differenz ein, nicht mit zwei Messungen.' },
      { match: '199', atlas: 'n − 1', explain: 'Die Freiheitsgrade zählen Personen: 200 minus 1.' },
      { match: 't', atlas: 't als Paare', step: 2, explain: 'Die mittlere Veränderung in Standardfehlern der Veränderungen. Als fremde Gruppen gerechnet wäre t nur etwa 2,27.' },
    ],
    check: {
      question: 'Wie viele Personen gehen in den gepaarten Test ein? Tippe die Zahl an.', correct: 'N',
      wrong: { '199': 'Fast! Das sind die Freiheitsgrade, eins weniger als die Zahl der Personen.', t: 'Fast! Das ist t. Die Zahl der Personen steht hinter N =.' },
    },
  },
  next: {
    next: { id: 'paired_difference', why: 'Die Rechnung, die aus jedem Paar eine Zahl macht: später minus früher, Person für Person.' },
    before: [
      { id: 'pairs', why: 'Zwei Werte gehören über dieselbe Person zusammen.' },
      { id: 'sampling', why: 'Unabhängig sein sollen die Personen, nicht ihre Messungen.' },
    ],
    after: [
      { id: 'wilcoxon_test', why: 'Der gepaarte Vergleich mit Rängen der Differenzen.' },
      { id: 'mcnemar_test', why: 'Der gepaarte Vergleich für eine Ja-nein-Frage vorher und nachher.' },
      { id: 'friedman_test', why: 'Mehr als zwei Messungen derselben Personen, mit Rängen.' },
    ],
  },
};
