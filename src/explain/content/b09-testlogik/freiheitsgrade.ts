// Begriffskarte „Freiheitsgrade im Modell“. Beispiele aus dem Lehrdatensatz: t-Test einer Stichprobe (199),
// Student (198), Welch (175,8), Kreuztabelle Schulabschluss mal Weiterbildung (4), Varianzanalyse (4 und 195).
// Zahlen in R nachgerechnet, siehe b09-testlogik.test.ts.
import type { ConceptCard, ConceptTabs } from '../../types';
import { num } from '../../format';
import { qnorm, qt } from '../../../tasks/kit/dist';
import { LERNZEIT_NACH_WEITERBILDUNG as L } from '../muster/p-wert';
import { gruppenTest } from './rechnen';

/** Freiheitsgrade am Regler, ganzzahlig zwischen 1 und 100. */
export const dfOf = (v: number) => Math.max(1, Math.min(100, Math.round(v)));
/** Freiheitsgrade der Beispiele (R): Welch-Varianzanalyse der Lernzeit nach Schulabschluss im Nenner. */
export const DF = { eins: 199, student: 198, welch: L.df, kreuz: 4, anovaZ: 4, anovaN: 195, welchAnova: 96.701708 } as const;

export const freiheitsgrade: ConceptCard = {
  concept: 'general_df',
  picture: 'b09-freiheitsgrade',
  wofuer: 'R schreibt hinter jede Prüfgröße eine Zahl in Klammern: t(199), t(198), t(175.8) oder chi2(4). Das sind die Freiheitsgrade. Woher kommen sie, und warum sind sie bei jedem Test anders?',
  kurz: 'Freiheitsgrade zählen, wie viele Werte nach den Schätzungen noch frei schwanken können. Sie legen fest, welche Form die Referenzverteilung hat.',
  stellDirVor: {
    text: `Die 200 Befragten liefern 200 Schlafdauern. Für den t-Test gegen sieben Stunden schätzt R einen Mittelwert, es bleiben 200 − 1 = ${DF.eins} Freiheitsgrade. Beim Vergleich der Lernzeit nach Weiterbildung schätzt R zwei Mittelwerte: 200 − 2 = ${DF.student}. Welch kommt auf ${num(DF.welch, 1)}, eine Näherung, die Streuung und Größe beider Gruppen einrechnet.`,
    figures: [
      { label: 'ein Mittelwert', value: String(DF.eins) },
      { label: 'zwei Gruppen nach Student', value: String(DF.student) },
      { label: 'zwei Gruppen nach Welch', value: num(DF.welch, 1) },
      { label: 'Kreuztabelle 5 mal 2', value: String(DF.kreuz) },
    ],
  },
  heisst: {
    sym: 'df', say: 'd f',
    fach: 'Die Zahl der unabhängigen Informationen, die nach den geschätzten Größen oder Nebenbedingungen übrig bleiben. Die Zählregel hängt von Modell und Prüfgröße ab: n − 1, n − 2, k − 1 und N − k, (r − 1)(c − 1).',
  },
  bausteine: [
    {
      title: 'Freie Werte zählen',
      was: 'Kennst du den Mittelwert und 199 der 200 Werte, steht der letzte fest. Nur 199 Werte sind frei.',
      rechnung: 'df = n − 1 = 200 − 1 = 199',
      warum: 'Die Abstände zum geschätzten Mittelwert ergeben zusammen immer 0. Einer davon ist deshalb nicht mehr frei.',
      acht: 'n − 1 gilt für einen geschätzten Mittelwert. Es ist keine Formel für jeden Test.',
      concept: 'df',
    },
    {
      title: 'Für jede Schätzung einen abziehen',
      was: 'Jede Größe, die das Modell aus den Daten schätzt, kostet einen Freiheitsgrad. Zwei Gruppenmittelwerte kosten zwei.',
      rechnung: `zwei Gruppen: 200 − 2 = ${DF.student}; fünf Gruppen in der Varianzanalyse: 5 − 1 = ${DF.anovaZ} und 200 − 5 = ${DF.anovaN}`,
      warum: 'Je mehr das Modell anpasst, desto weniger Information bleibt übrig, um die Streuung zu schätzen.',
      acht: 'Die Varianzanalyse hat zwei Freiheitsgrade: einen für die Gruppen und einen für den Rest. R schreibt beide hin.',
      concept: 'oneway_anova',
    },
    {
      title: 'Tabellen anders zählen',
      was: 'In einer Kreuztabelle zählen die Zellen, die bei festen Rändern frei sind. Bei fünf Abschlüssen mal Weiterbildung ja oder nein sind das 4.',
      rechnung: 'df = (r − 1) · (c − 1) = (5 − 1) · (2 − 1) = 4',
      warum: 'Stehen die Zeilen- und Spaltensummen fest, ergeben sich die letzten Zellen von selbst.',
      acht: 'Hier zählt die Größe der Tabelle, nicht die Zahl der Befragten. Mehr Befragte ändern df nicht.',
      concept: 'chi_square',
    },
    {
      title: 'Die Form der Verteilung ablesen',
      was: 'Wenige Freiheitsgrade machen die t-Verteilung breiter, mit dickeren Rändern. Ab etwa 30 sieht sie fast aus wie die Normalverteilung.',
      rechnung: `Grenze für α = 0,05, zweiseitig: df = 4: ${num(qt(0.975, 4))}; df = 199: ${num(qt(0.975, 199))}; sehr viele: ${num(qnorm(0.975))}`,
      warum: 'Mit wenigen Daten ist auch die Streuung unsicher geschätzt. Die breitere Verteilung gleicht das aus.',
      acht: '„Ab 30“ ist eine Faustregel, keine feste Grenze.',
      concept: 't_distribution',
    },
  ],
  ausprobieren: [
    {
      question: 'Ein t-Test nach Student vergleicht zwei Gruppen mit 20 und 30 Personen. Wie viele Freiheitsgrade hat er?',
      options: ['48', '49', '50'], correct: 0, step: 2,
      explain: '50 Personen, zwei geschätzte Mittelwerte: 50 − 2 = 48.',
      kurz: 'Jede Schätzung kostet einen Freiheitsgrad.',
    },
    {
      question: 'Eine Kreuztabelle hat 3 Zeilen und 4 Spalten. Wie viele Freiheitsgrade hat der χ²-Test?',
      options: ['6', '12', '11'], correct: 0, step: 3,
      explain: '(3 − 1) · (4 − 1) = 2 · 3 = 6. Bei festen Rändern sind nur sechs Zellen frei.',
      kurz: 'Bei Tabellen zählen Zeilen und Spalten.',
    },
    {
      question: `Welch meldet ${num(DF.welch, 1)} Freiheitsgrade. Ist das ein Rechenfehler?`,
      options: ['ja, df ist immer ganz', 'nein, Welch nähert'], correct: 1, step: 2,
      explain: 'Welch rechnet eine Näherung aus Streuung und Größe beider Gruppen. Dabei kommen Kommazahlen heraus, und das ist richtig.',
      kurz: 'Genäherte Freiheitsgrade dürfen krumm sein.',
    },
  ],
  regler: {
    label: 'Wie viele Freiheitsgrade hat die t-Verteilung?',
    min: 1, max: 100, step: 1, initial: 4,
    format: v => `df = ${dfOf(v)}`,
    describe: v => {
      const df = dfOf(v), c = qt(0.975, df), z = qnorm(0.975);
      return `Mit ${df} Freiheitsgraden liegt die Grenze für α = 0,05, zweiseitig, bei ${num(c)}. Die Normalverteilung hätte ${num(z)}. ${Math.round(c * 100) / 100 - 1.96 >= 0.1 - 1e-9 ? 'Die Ränder sind dicker, t muss weiter hinaus, bevor es zählt.' : 'Das ist kaum noch ein Unterschied zur Normalverteilung.'}`;
    },
  },
  check: {
    question: 'Wovon hängen die Freiheitsgrade eines Tests ab?',
    options: [
      'Immer nur von n: Es sind stets n − 1.',
      'Vom Modell: wie viele Werte nach den Schätzungen noch frei sind.',
      'Von der Größe des Unterschieds.',
      'Vom Signifikanzniveau α.',
    ],
    correct: 1,
    right: 'Genau. Prüfgröße und Modell legen gemeinsam fest, wie gezählt wird.',
    diagnose: {
      0: 'Fast! n − 1 gilt nur für einen geschätzten Mittelwert. Zwei Gruppen haben n − 2, Kreuztabellen (r − 1)(c − 1).',
      2: 'Fast! Der Unterschied steckt in der Prüfgröße, nicht in den Freiheitsgraden.',
      3: 'Fast! α legt fest, wie viel Fläche abgeschnitten wird. Welche Verteilung gilt, bestimmen die Freiheitsgrade.',
    },
  },
  fuerDich: 'Wenn du ein Ergebnis berichtest, gib die Freiheitsgrade mit an, so wie R: t(198) = 0,16. Wer liest, sieht daran, wie viele Personen und welches Modell dahinterstehen.',
  genau: {
    kurz: 'Im linearen Modell sind es n minus die Zahl der geschätzten Koeffizienten, einschließlich Achsenabschnitt. Genäherte Freiheitsgrade wie bei Welch können krumm sein.',
    paragraphs: [
      'Einfache lineare Regression mit Achsenabschnitt: n − 2. Varianzanalyse mit k Gruppen: k − 1 und N − k. Pearson-Test: n − 2. Kreuztabelle mit r Zeilen und c Spalten: (r − 1)(c − 1).',
      `Für die Lernzeit nach Schulabschluss meldet R in der Varianzanalyse ${DF.anovaZ} und ${DF.anovaN} Freiheitsgrade, im Welch-Test ${DF.anovaZ} und ${num(DF.welchAnova, 1)}.`,
      'Freiheitsgrade sind keine Fallzahl. Zwei Studien mit gleichem n können verschiedene Freiheitsgrade haben, wenn ihre Modelle verschieden viel schätzen.',
    ],
  },
};

/** Reiter: Freiheitsgrade nach Student und Welch für die aktuellen Daten, In R der Student-t-Test des Katalogs, Weiter. */
export const freiheitsgradeTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'lernzeit', group: 'weiterbildung' },
    kurz: 'Mit allen 200 Befragten: Welche Freiheitsgrade hat der Vergleich der Lernzeit nach Weiterbildung?',
    value: c => gruppenTest(c)?.df ?? null,
    result: c => {
      const r = gruppenTest(c);
      if (!r) return { kurz: 'In einer der Gruppen streut die Lernzeit nicht. Dann lässt sich der Vergleich nicht rechnen.', fachlich: 'Der t-Test braucht in beiden Gruppen mindestens zwei verschiedene Werte.' };
      return {
        kurz: `${r.nMit} Befragte mit und ${r.nOhne} ohne Weiterbildung: Die Fassung nach Student hat ${r.studentDf} Freiheitsgrade. Welch kommt auf ${num(r.df, 1)}, weil er Streuung und Größe beider Gruppen einrechnet.`,
        fachlich: `Student: df = n₁ + n₂ − 2 = ${r.studentDf}. Welch-Satterthwaite: df ≈ ${num(r.df, 1)}. Grenze für α = 0,05, zweiseitig, bei Welch: ${num(qt(0.975, r.df))}.`,
      };
    },
    voraussetzung: 'Student nimmt gleiche Streuung in beiden Gruppen an, Welch nicht. Beide setzen unabhängige Befragte voraus.',
    think: [
      {
        question: 'Alle lernen doppelt so lange. Was passiert mit der Zahl der Freiheitsgrade nach Welch?', options: ['bleibt gleich', 'steigt', 'sinkt'], correct: 0,
        explain: 'Welch rechnet mit dem Verhältnis der Streuungen beider Gruppen. Verdoppeln ändert alle Streuungen im selben Maß, das Verhältnis bleibt.',
        kurz: 'Die Einheit ändert die Freiheitsgrade nicht.',
        tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        expect: { change: 'same' },
      },
      {
        question: 'Eine Person lernt plötzlich 40 Stunden. Was passiert mit der Zahl der Freiheitsgrade nach Student?', options: ['bleibt gleich', 'steigt', 'sinkt'], correct: 0,
        explain: 'Student zählt nur Personen und Gruppen: 200 − 2 = 198. Ein einzelner Wert ändert daran nichts.',
        kurz: 'Student zählt Personen, nicht Werte.',
        tryIt: { label: 'die gewählte Person auf 40 Stunden', op: 'outlier', column: 'x', value: 40 },
        expect: { change: 'same', measure: c => gruppenTest(c)?.studentDf ?? null },
      },
    ],
  },
  r: {
    entry: 't_test', variant: 1,
    outputMap: [
      { match: '198', atlas: 'Freiheitsgrade df', step: 2, explain: '200 Befragte minus zwei geschätzte Gruppenmittelwerte. Welch käme hier auf 175,8.' },
      { match: 't', atlas: 'Prüfgröße t', explain: 'R ordnet sie in die t-Verteilung mit 198 Freiheitsgraden ein.' },
      { match: 'p', atlas: 'p-Wert', explain: 'Die Fläche jenseits von ±0,156 in dieser t-Verteilung.' },
      { match: 'N', atlas: 'n', explain: 'Aus N = 200 und zwei Gruppen entstehen 198 Freiheitsgrade.' },
    ],
    check: {
      question: 'Wo stehen die Freiheitsgrade? Tippe sie an.', correct: '198',
      wrong: { t: 'Fast! Das ist die Prüfgröße. Die Freiheitsgrade stehen in Klammern davor.', N: 'Fast! N ist die Zahl der Befragten. Die Freiheitsgrade sind N − 2 und stehen in Klammern hinter t.' },
    },
  },
  next: {
    next: { id: 't_distribution', why: 'Die Freiheitsgrade legen fest, wie dick ihre Ränder sind.' },
    before: [
      { id: 'df', why: 'n − 1 ist der bekannteste Sonderfall.' },
      { id: 'test_statistic', why: 'Jede Prüfgröße bringt ihre eigene Zählregel mit.' },
    ],
    after: [
      { id: 'chi_square_distribution', why: 'Bei Kreuztabellen zählen Zeilen und Spalten.' },
      { id: 'f_distribution', why: 'Hat zwei Freiheitsgrade, für Zähler und Nenner.' },
    ],
    more: [{ id: 'critical_value', why: 'Wenige Freiheitsgrade schieben die Grenze nach außen.' }],
  },
};
