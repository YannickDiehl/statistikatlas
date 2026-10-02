// Begriffskarte „Kovarianzanalyse (ANCOVA)“: Wissenstest nach Schulabschluss im Lehrdatensatz, roh und bereinigt um
// Lernzeit und Alter, wie der Leitaufruf ancova(dv = wissenstest, between = schulabschluss, covariate = c(lernzeit, alter)).
// Das Bild stellt rohe und bereinigte Gruppenmittel gegenüber. Referenzwerte: ./b10-mittelwerte.test.ts.
import type { ConceptCard, ConceptTabs, TokenNote } from '../../types';
import { num } from '../../format';
import { abschluss, ancovaFor, pText } from './stats';

/** Wissenstest je Schulabschluss (Codes 0 bis 4): roh und bereinigt (Lernzeit und Alter bei ihren Mittelwerten); aus R. */
export const BEREINIGT = [
  { label: 'ohne', roh: 8.619, bereinigt: 9.568 },
  { label: 'Haupt', roh: 10.275, bereinigt: 10.667 },
  { label: 'Mittel', roh: 10.351, bereinigt: 10.268 },
  { label: 'FHR', roh: 10.122, bereinigt: 9.637 },
  { label: 'Abitur', roh: 11.35, bereinigt: 10.535 },
] as const;

const SS_TYPE: TokenNote = { sym: 'ss_type =', term: 'Typ der Quadratsummen', kurz: '3 heißt Typ III: Jeder Term wird so geprüft, als käme er zuletzt ins Modell.', fehler: 'Mit ss_type = 2 warnt mariposa: Type II sums of squares are not implemented; computing Type III (the SPSS default).' };

export const ancova: ConceptCard = {
  concept: 'ancova',
  picture: 'b10-bereinigt',
  wofuer: 'Befragte mit Abitur lösen im Wissenstest mehr Aufgaben als Befragte ohne Schulabschluss. Sie lernen aber auch mehr. Wie groß bleibt der Unterschied, wenn man Befragte mit gleicher Lernzeit vergleicht? Die Kovarianzanalyse stellt die Lernzeit rechnerisch gleich.',
  kurz: 'Die ANCOVA vergleicht Gruppenmittel so, als hätten alle Gruppen dieselben Werte in weiteren metrischen Variablen. Diese Variablen heißen Kovariaten.',
  stellDirVor: {
    text: 'Im Lehrdatensatz lösen Befragte ohne Schulabschluss im Schnitt 8,62 von 20 Aufgaben, Befragte mit Abitur 11,35: ein Unterschied von 2,73 Aufgaben. Mit Abitur haben die Befragten in den letzten sieben Tagen aber auch mehr gelernt, 9,36 statt 5,88 Stunden. Bei gleicher Lernzeit und gleichem Alter sagt das Modell für beide Gruppen 9,57 und 10,54 Aufgaben voraus. Der Unterschied schrumpft auf 0,97 Aufgaben.',
    figures: [
      { label: 'ohne Abschluss, roh', value: '8,62 Aufgaben' },
      { label: 'Abitur, roh', value: '11,35 Aufgaben' },
      { label: 'ohne Abschluss, bereinigt', value: '9,57 Aufgaben' },
      { label: 'Abitur, bereinigt', value: '10,54 Aufgaben' },
    ],
  },
  heisst: {
    fach: 'Kovarianzanalyse: ein lineares Modell mit kategorialen Faktoren und metrischen Kovariaten. Die adjustierten Mittel sind Vorhersagen des Modells für jede Gruppe bei den Mittelwerten der Kovariaten.',
  },
  bausteine: [
    {
      title: 'Den rohen Unterschied ansehen',
      was: 'Ohne weitere Variablen unterscheiden sich die fünf Abschlussgruppen im Wissenstest: von 8,62 bis 11,35 Aufgaben im Mittel.',
      rechnung: 'Einfaktorielle ANOVA: F(4, 195) ≈ 4,34, p ≈ 0,0022.',
      warum: 'Das ist der Ausgangspunkt. Die Frage ist, wie viel davon bleibt, wenn die Lernzeit gleichgestellt ist.',
      acht: 'Der rohe Unterschied ist nicht falsch. Er beantwortet nur eine andere Frage als der bereinigte.',
      concept: 'oneway_anova',
    },
    {
      title: 'Die Kovariate ins Modell nehmen',
      was: 'Das Modell sagt den Wissenstest aus Schulabschluss, Lernzeit und Alter vorher. Für jede Stunde mehr Lernzeit sagt es etwa eine halbe Aufgabe mehr voraus.',
      rechnung: 'Steigung der Lernzeit: 0,5 Aufgaben je Stunde, F(1, 193) ≈ 64,87, p < 0,001.',
      warum: 'So kann das Modell trennen, was mit der Lernzeit und was mit dem Abschluss zusammenhängt.',
      acht: 'Die ANCOVA in mariposa nimmt in allen Gruppen dieselbe Steigung an. Ob das passt, siehst du am besten im Streudiagramm je Gruppe.',
      concept: 'linear_regression',
    },
    {
      title: 'Die Gruppen bei gleicher Kovariate vergleichen',
      was: 'Für jede Gruppe sagt das Modell den Wissenstest bei mittlerer Lernzeit und mittlerem Alter vorher. Diese bereinigten Mittel liegen nur noch zwischen 9,57 und 10,67 Aufgaben.',
      rechnung: 'Schulabschluss, bereinigt: F(4, 193) ≈ 1,5, p ≈ 0,2.',
      warum: 'So vergleichst du die Gruppen, als hätten alle gleich lange gelernt und wären gleich alt.',
      acht: 'Bereinigt heißt nicht ursächlich. Das Modell gleicht nur die Variablen aus, die drinstehen; andere Unterschiede bleiben.',
      concept: 'prediction',
    },
  ],
  ausprobieren: [
    {
      question: 'Roh liegen Abitur und ohne Abschluss 2,73 Aufgaben auseinander, bereinigt 0,97. Woran liegt das?',
      options: ['Die Gruppen lernen verschieden lange, und die Lernzeit hängt mit dem Wissenstest zusammen', 'Die ANCOVA lässt Befragte weg', 'Der Test ist mit Abitur leichter'], correct: 0, step: 3,
      explain: 'Mit Abitur lernen die Befragten im Schnitt knapp 3,5 Stunden mehr, und jede Stunde geht mit etwa einer halben Aufgabe mehr einher. Stellt das Modell die Lernzeit gleich, fällt dieser Teil des Unterschieds weg.',
      kurz: 'Was mit der Kovariate zusammenhängt, rechnet die ANCOVA heraus.',
    },
    {
      question: 'Heißt der bereinigte Befund, dass der Schulabschluss nichts mit dem Wissen zu tun hat?',
      options: ['ja', 'nein'], correct: 1, step: 3,
      explain: 'Die Daten sind Beobachtungen, niemand hat Abschlüsse zufällig verteilt. Die Lernzeit hängt selbst mit dem Abschluss zusammen. Bereinigt beschreibt nur Unterschiede bei gleicher Lernzeit.',
      kurz: 'Bereinigt ist eine andere Frage, keine Antwort auf Ursachen.',
    },
    {
      question: 'Angenommen, die Lernzeit hinge gar nicht mit dem Wissenstest zusammen. Was wäre dann mit den bereinigten Mitteln?',
      options: ['Sie lägen fast bei den rohen Mitteln', 'Sie wären alle gleich', 'Sie ließen sich nicht berechnen'], correct: 0, step: 2,
      explain: 'Dann wäre die Steigung fast 0. Die Lernzeit gleichzustellen, veränderte die Vorhersagen kaum.',
      kurz: 'Eine Kovariate ohne Zusammenhang bereinigt nichts.',
    },
  ],
  check: {
    question: 'Was ist ein bereinigtes (adjustiertes) Mittel in der ANCOVA?',
    options: [
      'Der Mittelwert der Gruppe ohne Ausreißer.',
      'Die Vorhersage des Modells für die Gruppe bei den Mittelwerten der Kovariaten.',
      'Der Mittelwert, den die Gruppe hätte, wenn man ihren Abschluss ändern würde.',
      'Der rohe Mittelwert, auf ganze Aufgaben gerundet.',
    ],
    correct: 1,
    right: 'Genau. Das Modell sagt jeder Gruppe einen Wert voraus, als hätten alle die mittlere Lernzeit und das mittlere Alter.',
    diagnose: {
      0: 'Noch nicht ganz. Mit Ausreißern hat das bereinigte Mittel nichts zu tun.',
      2: 'Fast! Das wäre eine Aussage über Ursachen. Das bereinigte Mittel ist nur eine Vorhersage bei gleicher Lernzeit und gleichem Alter.',
      3: 'Noch nicht ganz. Gerundet wird nichts; das bereinigte Mittel kommt aus dem Modell.',
    },
  },
  fuerDich: 'Wenn eine Studie „unter Kontrolle von Alter und Bildung“ berichtet, ist meist so ein Modell gemeint. Frag dich: Welche Variablen stehen im Modell, und welche fehlen? Gleichgestellt wird nur, was drinsteht.',
  genau: {
    kurz: 'mariposa rechnet die ANCOVA mit Typ-III-Tests und gemeinsamen Steigungen. Bereinigte Mittel sind Modellvorhersagen, keine beobachteten Mittelwerte.',
    paragraphs: [
      'Das Modell nimmt an, dass eine Kovariate in allen Gruppen gleich stark mit dem Wissenstest zusammenhängt: parallele Geraden. mariposa enthält keine Interaktion von Faktor und Kovariate; prüfen lässt sich das etwa mit einer Regression mit Interaktionsterm.',
      'Die Kovariaten sollten sich zwischen den Gruppen überschneiden. Lernen Befragte ohne Abschluss fast nie so lange wie Befragte mit Abitur, rechnet das Modell für sie weit außerhalb ihrer Daten.',
      'Im Leitaufruf stehen Lernzeit und Alter als Kovariaten. Das Alter hängt hier kaum mit dem Wissenstest zusammen: Je Lebensjahr sagt das Modell nur 0,0041 Aufgaben mehr voraus, η²p ≈ 0,001 (R: F(1, 193) = 0.131, p = 0.718, eta2p = 0.001).',
      'Bereinigen begründet keine Ursache. Hängt die Lernzeit ihrerseits mit dem Abschluss zusammen, nimmt die ANCOVA auch einen Teil des Unterschieds heraus, der zum Abschluss gehören könnte.',
    ],
  },
};

const span = (v: number[]) => { const lo = v.indexOf(Math.min(...v)), hi = v.indexOf(Math.max(...v)); return { lo, hi }; };

export const ancovaTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'wissenstest', group: 'schulabschluss', y: 'lernzeit', z: 'alter' },
    kurz: 'Dieselbe Rechnung mit allen 200 Befragten: Wissenstest nach Schulabschluss, roh und bei gleicher Lernzeit und gleichem Alter.',
    value: c => ancovaFor(c)?.F ?? null,
    result: c => {
      const a = ancovaFor(c);
      if (!a) return { kurz: 'Das Modell lässt sich mit diesen Daten nicht schätzen.', fachlich: 'Die Fehlerquadratsumme ist 0 oder das Modell ist nicht bestimmt.' };
      const r = span(a.raw), b = span(a.adjusted);
      return {
        kurz: `Roh lösen die Gruppen im Schnitt ${num(a.raw[r.lo])} (${abschluss(r.lo)}) bis ${num(a.raw[r.hi])} Aufgaben (${abschluss(r.hi)}). Bei gleicher Lernzeit und gleichem Alter sagt das Modell nur noch ${num(a.adjusted[b.lo])} bis ${num(a.adjusted[b.hi])} Aufgaben voraus.`,
        fachlich: `ANCOVA, Typ III: Schulabschluss bereinigt F(${a.df1}, ${a.df2}) ≈ ${num(a.F)}, ${pText(a.p)}; ohne Kovariaten F(${a.df1}, ${a.plainDf2}) ≈ ${num(a.plainF)}, ${pText(a.plainP)}. Steigung der Lernzeit ≈ ${num(a.slope)} Aufgaben je Stunde.`,
        zusatz: 'Die Daten sind Beobachtungen: Die bereinigten Mittel beschreiben Unterschiede bei gleicher Lernzeit, keine Wirkung des Abschlusses.',
      };
    },
    voraussetzung: 'Unabhängige Befragte, ähnliche Streuung in allen Gruppen und in allen Gruppen dieselbe Steigung der Kovariaten.',
    think: [
      {
        question: 'Alle lernen doppelt so lange. Was passiert mit F für den bereinigten Vergleich der Abschlüsse?', options: ['verdoppelt sich', 'bleibt gleich', 'halbiert sich'], correct: 1,
        explain: 'Das Modell rechnet die Lernzeit nur anders um: Die Steigung halbiert sich, die Vorhersagen bleiben gleich. Damit bleiben auch F und die bereinigten Mittel.',
        kurz: 'Die Einheit der Kovariate ändert den bereinigten Vergleich nicht.',
        tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'y', value: 2 },
        expect: { change: 'same' },
      },
      {
        question: 'Alle lösen eine Aufgabe mehr. Was passiert mit F für den bereinigten Vergleich?', options: ['bleibt gleich', 'wird größer', 'wird kleiner'], correct: 0,
        explain: 'Alle Vorhersagen steigen um eine Aufgabe. Die Unterschiede zwischen den Gruppen bleiben, also auch F.',
        kurz: 'Verschieben ändert keinen Unterschied.',
        tryIt: { label: 'alle eine Aufgabe mehr', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'same' },
      },
    ],
  },
  r: {
    entry: 'ancova', variant: 0,
    tokens: {
      dv: { sym: 'dv =', term: 'Zielvariable', kurz: 'Die metrische Variable, deren Gruppenmittel verglichen werden, hier der Wissenstest.', fehler: 'Steht dort eine Textspalte, meldet mariposa: Dependent variable … must be numeric.' },
      between: { sym: 'between =', term: 'Faktor', kurz: 'Die Gruppierung, deren Mittel verglichen werden, hier der Schulabschluss.', fehler: 'Ohne between meldet mariposa: Argument `between` is missing, with no default.' },
      covariate: { sym: 'covariate =', term: 'Kovariaten', kurz: 'Die metrischen Variablen, die das Modell gleichstellt, hier Lernzeit und Alter.', fehler: 'Ohne covariate meldet mariposa: Argument `covariate` is missing, with no default.' },
      ss_type: SS_TYPE,
    },
    outputMap: [
      { match: 'F', atlas: 'Kovariate Lernzeit', step: 2, explain: 'F für die Lernzeit: Sie hängt mit dem Wissenstest zusammen, p < 0,001, mit η²p = 0,25.' },
      { match: '0.718', atlas: 'p der Kovariate Alter', step: 2, explain: 'Das Alter hängt bei gleicher Lernzeit kaum mit dem Wissenstest zusammen: 0,0041 Aufgaben je Lebensjahr, η²p ≈ 0,001.' },
      { match: '1.499', atlas: 'F Schulabschluss, bereinigt', step: 3, explain: 'F für den Schulabschluss bei gleicher Lernzeit und gleichem Alter. Ohne Kovariaten wäre es 4,34.' },
      { match: '0.204', atlas: 'p Schulabschluss, bereinigt', step: 3, explain: 'Gäbe es bei gleicher Lernzeit und gleichem Alter keine Unterschiede, wären solche Gruppenunterschiede in etwa 20 von 100 Stichproben zu erwarten.' },
      { match: 'N', atlas: 'n', explain: 'Alle 200 Befragten haben gültige Werte in allen vier Variablen.' },
    ],
    check: {
      question: 'Welche Zahl ist F für den Schulabschluss, bereinigt um Lernzeit und Alter? Tippe sie an.', correct: '1.499',
      wrong: { F: 'Fast! Das ist F für die Kovariate Lernzeit, die erste Zeile.', '0.204': 'Fast! Das ist der p-Wert des Schulabschlusses. F steht davor.', '0.718': 'Fast! Das ist der p-Wert der Kovariate Alter.' },
    },
  },
  next: {
    next: { id: 'confounding', why: 'Warum ein Unterschied schrumpfen kann, wenn eine dritte Variable im Modell steht.' },
    before: [
      { id: 'factorial_anova', why: 'Faktoren und Typ-III-Tests, die die ANCOVA übernimmt.' },
      { id: 'linear_regression', why: 'Die Geradengleichung, mit der die Kovariate ins Modell kommt.' },
    ],
    after: [{ id: 'prediction', why: 'Bereinigte Mittel sind Vorhersagen des Modells bei festen Werten der Kovariaten.' }],
    more: [
      { id: 'partial_cor', why: 'Dieselbe Idee für Korrelationen: der Zusammenhang bei gleicher dritter Variable.' },
      { id: 'causality', why: 'Was es braucht, um aus einem bereinigten Unterschied eine Ursache zu machen.' },
    ],
  },
};
