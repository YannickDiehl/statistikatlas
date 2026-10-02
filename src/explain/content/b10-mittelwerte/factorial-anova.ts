// Begriffskarte „Mehrfaktorielle ANOVA“: Lernzeit nach Schulabschluss und Weiterbildung im Lehrdatensatz, wie der
// Leitaufruf factorial_anova(dv = lernzeit, between = c(schulabschluss, weiterbildung), ss_type = 3). Das Bild zeigt die
// zehn Zellmittel als zwei Linien. Referenzwerte: ./b10-mittelwerte.test.ts.
import type { ConceptCard, ConceptTabs } from '../../types';
import { num } from '../../format';
import { factorialFor, pText } from './stats';

/** Zellmittel der Lernzeit (Stunden) nach Schulabschluss (Codes 0 bis 4) und Weiterbildung (nein, ja), mit n; aus R. */
export const ZELLEN = [
  { label: 'ohne', nein: 5.848, ja: 5.935, nNein: 25, nJa: 17 },
  { label: 'Haupt', nein: 7.039, ja: 6.742, nNein: 28, nJa: 12 },
  { label: 'Mittel', nein: 7.230, ja: 8.788, nNein: 20, nJa: 17 },
  { label: 'FHR', nein: 8.542, ja: 8.941, nNein: 24, nJa: 17 },
  { label: 'Abitur', nein: 10.729, ja: 7.837, nNein: 21, nJa: 19 },
] as const;
/** Typ-III-Tests aus R (summary von factorial_anova). */
export const TERME = {
  schule: { F: 8.558, df: 4, eta2p: 0.153 },
  weiter: { F: 0.284, df: 1, p: 0.595, eta2p: 0.001 },
  zusammen: { F: 2.999, df: 4, p: 0.020, eta2p: 0.059 },
  dfError: 190,
} as const;

export const factorialAnova: ConceptCard = {
  concept: 'factorial_anova',
  picture: 'b10-interaktion',
  wofuer: 'Hängt die Lernzeit mit dem Schulabschluss zusammen, mit einer Weiterbildung oder mit beidem? Die mehrfaktorielle ANOVA prüft beide Gruppierungen in einem Modell. Und sie fragt, ob der Unterschied zwischen mit und ohne Weiterbildung in allen Abschlussgruppen gleich groß ist.',
  kurz: 'Die mehrfaktorielle ANOVA vergleicht Mittelwerte nach zwei oder drei Gruppierungen zugleich. Sie trennt, was jede Gruppierung für sich zeigt, von ihrem Zusammenspiel.',
  stellDirVor: {
    text: 'Im Lehrdatensatz haben Befragte mit Abitur und ohne Weiterbildung in den letzten sieben Tagen im Schnitt 10,73 Stunden gelernt, die mit Abitur und Weiterbildung 7,84 Stunden. In den anderen Abschlussgruppen liegen mit und ohne Weiterbildung höchstens 1,56 Stunden auseinander, teils in der anderen Richtung. Der Unterschied nach Weiterbildung ist also nicht in allen Abschlussgruppen gleich. R meldet für dieses Zusammenspiel p = 0.020.',
    figures: [
      { label: 'Abitur, ohne Weiterbildung', value: '10,73 h' },
      { label: 'Abitur, mit Weiterbildung', value: '7,84 h' },
      { label: 'Zusammenspiel in R', value: 'p = 0.020' },
    ],
  },
  heisst: {
    sym: 'A × B', say: 'A mal B',
    fach: 'Mehrfaktorielle Varianzanalyse: ein lineares Modell mit den Haupteffekten der Faktoren A und B und ihrer Interaktion A × B. Jeder Term wird mit einem eigenen F-Test geprüft, in mariposa mit Typ-III-Quadratsummen.',
  },
  bausteine: [
    {
      title: 'Jede Gruppierung für sich prüfen',
      was: 'Für jeden Faktor fragt die ANOVA: Unterscheiden sich seine Gruppen, wenn die andere Gruppierung im Modell steht? Das heißt Haupteffekt.',
      rechnung: 'Schulabschluss: F(4, 190) ≈ 8,56, p < 0,001. Weiterbildung: F(1, 190) ≈ 0,28, p ≈ 0,6.',
      warum: 'So siehst du in einem Modell, ob die Lernzeit mit dem Abschluss zusammenhängt und ob mit der Weiterbildung.',
      acht: 'Ein Haupteffekt ist ein Durchschnitt über die andere Gruppierung. Bei einem starken Zusammenspiel sieht er in einzelnen Gruppen ganz anders aus.',
      concept: 'group_variation',
    },
    {
      title: 'Das Zusammenspiel prüfen',
      was: 'Ist der Unterschied zwischen mit und ohne Weiterbildung in allen fünf Abschlussgruppen ungefähr gleich groß? Wenn nicht, gibt es eine Interaktion.',
      rechnung: 'Abitur: 10,73 − 7,84 = 2,89 Stunden. Mittlerer Abschluss: 7,23 − 8,79 = −1,56 Stunden. Zusammenspiel: F(4, 190) ≈ 3, p ≈ 0,02.',
      warum: 'Zeichnet man eine Linie je Weiterbildungsgruppe, laufen die Linien ohne Interaktion parallel. Hier kreuzen sie sich.',
      acht: 'Interaktion heißt nicht, dass ein Faktor den anderen verursacht. Sie beschreibt nur, dass ein Unterschied je nach Gruppe verschieden groß ist.',
      concept: 'interaction',
    },
    {
      title: 'Jeden Term am Restschwanken messen',
      was: 'Jeder Haupteffekt und das Zusammenspiel bekommen eine eigene Quadratsumme. Sie wird durch ihre Freiheitsgrade geteilt und mit dem Schwanken innerhalb der Zellen verglichen.',
      rechnung: 'F = (SS_Term / df_Term) / MSE. Im Nenner stehen 190 Freiheitsgrade: 200 Befragte minus 10 Zellen.',
      warum: 'Wie in der einfaktoriellen ANOVA: Ein großes F heißt, der Term trennt die Gruppen stärker, als das übliche Schwanken erwarten lässt.',
      acht: 'mariposa rechnet Typ-III-Quadratsummen. Sie ergeben zusammen nicht die gesamte Streuung, anders als in der einfaktoriellen ANOVA.',
      concept: 'residuals',
    },
  ],
  ausprobieren: [
    {
      question: 'Zwei Linien im Bild laufen parallel. Was sagt das über das Zusammenspiel?',
      options: ['kein Zusammenspiel', 'starkes Zusammenspiel', 'kein Haupteffekt'], correct: 0, step: 2,
      explain: 'Parallele Linien heißen: Der Unterschied nach Weiterbildung ist in allen Abschlussgruppen gleich groß. Genau das ist keine Interaktion.',
      kurz: 'Parallel heißt: überall derselbe Unterschied.',
    },
    {
      question: 'Weiterbildung zeigt keinen Haupteffekt (p ≈ 0,6). Heißt das, Weiterbildung hängt in keiner Abschlussgruppe mit der Lernzeit zusammen?',
      options: ['ja', 'nein'], correct: 1, step: 1,
      explain: 'Der Haupteffekt mittelt über alle Abschlüsse. Mit Abitur lernen die ohne Weiterbildung fast 3 Stunden mehr, mit Mittlerem Abschluss gut 1,5 Stunden weniger. Im Durchschnitt heben sich diese Unterschiede fast auf.',
      kurz: 'Ein Durchschnitt kann Unterschiede in einzelnen Gruppen verdecken.',
    },
    {
      question: 'Drei Tests in einer Tabelle, einer davon mit p ≈ 0,02. Was solltest du bedenken?',
      options: ['Mehrere Tests finden öfter zufällig etwas', 'Nichts, p ist eindeutig', 'Das Zusammenspiel ist sicher echt'], correct: 0, step: 3,
      explain: 'Jeder Test kann sich irren. Ein einzelnes kleines p unter mehreren Tests ist ein Hinweis, kein Beweis. Der Lehrdatensatz ist außerdem synthetisch.',
      kurz: 'Viele Tests, mehr zufällige Funde.',
    },
  ],
  check: {
    question: 'Was beschreibt eine Interaktion zwischen Schulabschluss und Weiterbildung?',
    options: [
      'Befragte mit Abitur lernen mehr als Befragte ohne Abschluss.',
      'Der Unterschied zwischen mit und ohne Weiterbildung ist je nach Schulabschluss verschieden groß.',
      'Die Weiterbildung verursacht mehr Lernzeit.',
      'Schulabschluss und Weiterbildung hängen miteinander zusammen.',
    ],
    correct: 1,
    right: 'Genau. Interaktion heißt: Wie groß ein Unterschied ist, hängt von der anderen Gruppierung ab.',
    diagnose: {
      0: 'Fast! Das ist ein Haupteffekt des Schulabschlusses. Interaktion heißt: Der Unterschied nach Weiterbildung ist je nach Abschluss verschieden groß.',
      2: 'Fast! Eine Interaktion sagt nichts über Ursachen. Sie beschreibt, wie Unterschiede über die Gruppen verteilt sind.',
      3: 'Noch nicht ganz. Das wäre ein Zusammenhang der beiden Faktoren untereinander. Die Interaktion betrifft die Lernzeit.',
    },
  },
  fuerDich: 'Wenn eine Studie einen Effekt von A und eine Interaktion A × B berichtet, lies zuerst die Interaktion. Ist sie deutlich, schau dir die Mittelwerte der einzelnen Zellen an, statt nur die Haupteffekte zu deuten.',
  genau: {
    kurz: 'mariposa rechnet Typ-III-Quadratsummen mit zwei oder drei Faktoren. Jede Zelle braucht Befragte, und die Befunde zeigen Zusammenhänge, keine Wirkungen.',
    paragraphs: [
      'Typ III prüft jeden Term so, als käme er als letzter ins Modell. Bei ungleich besetzten Zellen, hier mit 12 bis 28 Befragten je Zelle, ergeben die Quadratsummen zusammen nicht die gesamte Streuung. Mit ss_type = 2 warnt mariposa und rechnet trotzdem Typ III.',
      'Voraussetzungen wie bei der einfaktoriellen ANOVA: unabhängige Befragte, annähernd normalverteilte Werte in jeder Zelle und ähnliche Streuung in allen Zellen. R meldet dazu den Levene-Test über alle zehn Zellen: F(9, 190) = 1.168, p = 0.317.',
      'Die partielle Effektgröße η²p setzt die Quadratsumme eines Terms ins Verhältnis zu ihr selbst plus der Fehlerquadratsumme: beim Schulabschluss 0,15, beim Zusammenspiel 0,06.',
      'Der Lehrdatensatz ist synthetisch. Das Zusammenspiel zeigt, wie man so einen Befund liest, nicht wie Menschen in Deutschland lernen.',
    ],
  },
};

export const factorialAnovaTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'lernzeit' },
    kurz: 'Dieselbe Rechnung mit allen 200 Befragten: Lernzeit nach Schulabschluss und Weiterbildung, mit Zusammenspiel.',
    value: c => factorialFor(c)?.ab.F ?? null,
    result: c => {
      const f = factorialFor(c);
      if (!f) return { kurz: 'Innerhalb der Zellen streut die Lernzeit nicht. Dann lassen sich keine F-Werte berechnen.', fachlich: 'Die Fehlerquadratsumme ist 0; das Modell ist nicht prüfbar.' };
      const abi = f.cells[4];
      return {
        kurz: `Mit Abitur haben Befragte ohne Weiterbildung im Schnitt ${num(abi[0].mean)} Stunden gelernt, mit Weiterbildung ${num(abi[1].mean)} Stunden. Gäbe es kein Zusammenspiel, wären so verschiedene Unterschiede in den fünf Gruppen ${f.ab.p < 0.05 ? 'überraschend' : 'nicht überraschend'} (${pText(f.ab.p)}).`,
        fachlich: `Typ III: Schulabschluss F(${f.a.df}, ${f.dfError}) ≈ ${num(f.a.F)}, ${pText(f.a.p)}; Weiterbildung F(${f.b.df}, ${f.dfError}) ≈ ${num(f.b.F)}, ${pText(f.b.p)}; Zusammenspiel F(${f.ab.df}, ${f.dfError}) ≈ ${num(f.ab.F)}, ${pText(f.ab.p)}, η²p ≈ ${num(f.ab.eta2p)}.`,
        zusatz: `Je Zelle aus Abschluss und Weiterbildung zwischen ${Math.min(...f.cells.flat().map(z => z.n))} und ${Math.max(...f.cells.flat().map(z => z.n))} Befragte.`,
      };
    },
    voraussetzung: 'Unabhängige Befragte und ähnliche Streuung in allen zehn Zellen. Jede Zelle braucht Befragte.',
    think: [
      {
        question: 'Alle lernen doppelt so lange. Was passiert mit F für das Zusammenspiel?', options: ['verdoppelt sich', 'bleibt gleich', 'vervierfacht sich'], correct: 1,
        explain: 'Alle Quadratsummen werden viermal so groß, die des Zusammenspiels und die des Restschwankens. F ist ihr Verhältnis und bleibt gleich.',
        kurz: 'F hängt nicht von der Einheit ab.',
        tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        expect: { change: 'same' },
      },
      {
        question: 'Die Lernzeit wird umgepolt: 60 Stunden minus der eigene Wert. Was passiert mit F für das Zusammenspiel?', options: ['bleibt gleich', 'wird 0', 'wird größer'], correct: 0,
        explain: 'Alle Unterschiede drehen nur ihre Richtung. Wo die Linien sich vorher kreuzten, kreuzen sie sich auch jetzt, nur gespiegelt.',
        kurz: 'Ein Zusammenspiel hat keine Richtung, die sich umpolen ließe.',
        tryIt: { label: 'Lernzeit umpolen', op: 'reverse', column: 'x' },
        expect: { change: 'same' },
      },
    ],
  },
  r: {
    entry: 'factorial_anova', variant: 0,
    tokens: {
      dv: { sym: 'dv =', term: 'Zielvariable', kurz: 'Die metrische Variable, deren Mittelwerte verglichen werden, hier die Lernzeit.', fehler: 'Ist die Variable nicht numerisch, meldet mariposa: Dependent variable … must be numeric.' },
      between: { sym: 'between =', term: 'Faktoren', kurz: 'Die Gruppierungen, mit c() zusammengefasst: hier Schulabschluss und Weiterbildung.', fehler: 'Mit nur einem Faktor meldet mariposa: `factorial_anova()` requires at least 2 between-subjects factors.' },
      ss_type: { sym: 'ss_type =', term: 'Typ der Quadratsummen', kurz: '3 heißt Typ III: Jeder Term wird so geprüft, als käme er zuletzt ins Modell.', fehler: 'Mit ss_type = 2 warnt mariposa: Type II sums of squares are not implemented; computing Type III (the SPSS default).' },
    },
    outputMap: [
      { match: 'F', atlas: 'Haupteffekt Schulabschluss', step: 1, explain: 'F für den Schulabschluss: Die Abschlussgruppen unterscheiden sich deutlich, p < 0,001.' },
      { match: '0.284', atlas: 'Haupteffekt Weiterbildung', step: 1, explain: 'F für die Weiterbildung allein: im Durchschnitt über alle Abschlüsse kaum ein Unterschied.' },
      { match: '2.999', atlas: 'Interaktion A × B', step: 2, explain: 'F für das Zusammenspiel: Der Unterschied nach Weiterbildung ist je nach Abschluss verschieden groß.' },
      { match: '0.020', atlas: 'p der Interaktion', step: 2, explain: 'Gäbe es kein Zusammenspiel, wären so verschiedene Unterschiede in etwa 2 von 100 Stichproben zu erwarten.' },
      { match: 'eta2p', atlas: 'partielles η²', step: 3, explain: 'Die partielle Effektgröße des Terms: seine Quadratsumme im Verhältnis zu ihr plus dem Restschwanken.' },
    ],
    check: {
      question: 'Welche Zahl ist F für das Zusammenspiel von Schulabschluss und Weiterbildung? Tippe sie an.', correct: '2.999',
      wrong: { F: 'Fast! Das ist F für den Schulabschluss allein, die erste Zeile.', '0.284': 'Fast! Das ist F für die Weiterbildung allein. Das Zusammenspiel steht in der Zeile mit dem Doppelpunkt.', '0.020': 'Fast! Das ist der p-Wert des Zusammenspiels. F steht davor.' },
    },
  },
  next: {
    next: { id: 'interaction', why: 'Was ein Zusammenspiel zweier Merkmale bedeutet, auch in der Regression.' },
    before: [
      { id: 'oneway_anova', why: 'Dieselbe Idee mit einer einzigen Gruppierung.' },
      { id: 'group_variation', why: 'Quadratsummen zwischen und innerhalb, die hier je Term gebildet werden.' },
    ],
    after: [{ id: 'ancova', why: 'Nimmt zusätzlich metrische Variablen wie die Lernzeit ins Modell.' }],
    more: [
      { id: 'effect', why: 'Wie groß ein Unterschied ist, sagt erst eine Effektgröße wie η²p.' },
      { id: 'multiplicity', why: 'Mehrere F-Tests in einer Tabelle finden öfter zufällig etwas.' },
    ],
  },
};
