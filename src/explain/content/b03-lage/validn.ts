// Begriffskarte „Anzahl“ (validn): Welche Personen gehen in eine Rechnung ein? Beispiel aus dem ALLBUS 2023,
// ungewichtet und nur als Aggregat: Links-rechts-Einstufung (pa01) und Vertrauen in den Bundestag (pt03).
// Alle Zahlen sind in R nachgerechnet; Referenzwerte und R-Befehle: b03-lage.test.ts.
import type { ConceptCard, ConceptTabs } from '../../types';
import { count } from '../../format';
import { DESCRIBE_NOTE, showNote, T } from './lage';

/** ALLBUS 2023 (ZA8831, ungewichtet): Befragte, gültige Antworten und vollständige Paare. */
export const ALLBUS_N = {
  total: 5246,
  /** Links-rechts-Selbsteinstufung pa01 */
  lr: 4997, lrMissing: 249,
  /** Vertrauen in den Bundestag pt03: 1.596 nicht gefragt (Split), 58 ohne gültige Antwort */
  bt: 3592, btMissing: 1654, btSplit: 1596,
  /** beide gültig bzw. bei beiden fehlend */
  both: 3436, bothMissing: 93,
} as const;
const A = ALLBUS_N;
const c = count;

export const validn: ConceptCard = {
  concept: 'validn',
  wofuer: `Hängt die Links-rechts-Einstufung mit dem Vertrauen in den Bundestag zusammen? Im ALLBUS 2023 wurden ${c(A.total)} Menschen befragt. Aber nicht alle haben beide Fragen beantwortet, manche bekamen eine davon gar nicht gestellt. Mit wie vielen Menschen rechnest du also wirklich?`,
  kurz: 'n zählt die Personen, die in eine Rechnung wirklich eingehen. Wer bei einer der verwendeten Fragen keine gültige Antwort hat, fällt heraus.',
  stellDirVor: {
    text: `Im ALLBUS 2023 (ungewichtet) haben sich ${c(A.lr)} der ${c(A.total)} Befragten auf der Links-rechts-Skala eingestuft. Zum Vertrauen in den Bundestag gibt es ${c(A.bt)} gültige Antworten: ${c(A.btSplit)} Befragte bekamen diese Frage gar nicht gestellt, bei weiteren ${c(A.btMissing - A.btSplit)} fehlt die Antwort. Beide Angaben zugleich haben ${c(A.both)} Befragte. Für den Zusammenhang der beiden Fragen ist also n = ${c(A.both)}.`,
    figures: [
      { label: 'Befragte insgesamt', value: c(A.total) },
      { label: 'gültig bei Links-rechts', value: c(A.lr) },
      { label: 'gültig beim Vertrauen', value: c(A.bt) },
      { label: 'beide gültig: n', value: c(A.both) },
    ],
  },
  heisst: {
    sym: 'n', say: 'n',
    fach: 'Die Zahl der gültigen Fälle: Fälle mit einem gültigen Wert in jeder Variable der Rechnung. Bei zwei Variablen sind das die vollständigen Wertepaare.',
  },
  bausteine: [
    {
      title: 'Gültige Antworten zählen',
      was: 'Für jede Frage zählst du die Personen mit einer gültigen Antwort. Codes für „keine Angabe“ oder „nicht gefragt“ zählen nicht mit.',
      rechnung: `Links-rechts: ${c(A.total)} − ${c(A.lrMissing)} = ${c(A.lr)}. Vertrauen: ${c(A.total)} − ${c(A.btMissing)} = ${c(A.bt)}.`,
      warum: 'Eine fehlende Antwort ist keine Zahl. Mit ihr lässt sich weder ein Mittelwert noch ein Anteil rechnen.',
      acht: 'Im Datensatz stehen fehlende Antworten oft als negative Codes, im ALLBUS etwa −9 für „keine Angabe“. Rechnest du sie als Zahl mit, wird jeder Mittelwert falsch. Erst als fehlend markieren, dann zählen.',
      concept: 'missing',
    },
    {
      title: 'Nur vollständige Paare behalten',
      was: 'Für einen Zusammenhang brauchst du von jeder Person beide Antworten. Wer bei einer Frage fehlt, fällt für das Paar ganz heraus.',
      rechnung: `${c(A.lrMissing)} + ${c(A.btMissing)} − ${A.bothMissing} = ${c(A.lrMissing + A.btMissing - A.bothMissing)} Befragte fehlen bei mindestens einer Frage. ${c(A.total)} − ${c(A.lrMissing + A.btMissing - A.bothMissing)} = ${c(A.both)} vollständige Paare.`,
      warum: 'Mittelwerte, Streuungen und Kovarianz sollen auf denselben Personen beruhen. Sonst vergleichst du verschiedene Gruppen miteinander.',
      acht: `${A.bothMissing} Befragte fehlen bei beiden Fragen. Wer die Fehlenden beider Fragen nur addiert, zählt diese ${A.bothMissing} doppelt und kommt auf ${c(A.total - A.lrMissing - A.btMissing)} statt ${c(A.both)}.`,
      concept: 'pairs',
    },
    {
      title: 'Mit diesem n weiterrechnen',
      was: 'Durch n teilst du beim Mittelwert, n − 1 steht in der Varianz, √n im Standardfehler. Prozente beziehen sich auf n.',
      warum: 'Je nachdem, welche Fragen eine Rechnung braucht, ist n ein anderes. Deshalb meldet R zu jedem Ergebnis sein N.',
      acht: 'Zwei Ergebnisse aus demselben Datensatz können auf verschiedenen Personen beruhen. Vergleiche deshalb immer auch die beiden N.',
      concept: 'mean',
    },
  ],
  ausprobieren: [
    {
      question: 'Du willst nur den Mittelwert der Links-rechts-Einstufung wissen. Mit welchem n rechnest du?',
      options: [c(A.lr), c(A.both), c(A.total)], correct: 0, step: 1,
      explain: `Für eine Frage allein zählen alle mit gültiger Antwort auf diese Frage: ${c(A.lr)}. Das Vertrauen spielt dafür keine Rolle.`,
      kurz: 'Jede Rechnung hat ihr eigenes n.',
    },
    {
      question: 'Eine Person hat sich links-rechts eingestuft, beim Vertrauen fehlt ihre Antwort. Zählt sie für den Zusammenhang mit?',
      options: ['ja', 'nein'], correct: 1, step: 2,
      explain: 'Für den Zusammenhang braucht es beide Werte derselben Person. Ihr Wert auf der Links-rechts-Skala allein bildet kein Paar.',
      kurz: 'Kein Paar, kein Beitrag.',
    },
    {
      question: 'Eine Person hat in den letzten sieben Tagen 0 Stunden gelernt. Zählt sie für n mit?',
      options: ['ja', 'nein, 0 ist wie fehlend'], correct: 0, step: 1,
      explain: '0 Stunden ist eine gültige Antwort: Die Person hat gar nicht gelernt. Fehlend ist nur, wer keine gültige Antwort hat.',
      kurz: 'Null ist nicht fehlend.',
    },
  ],
  check: {
    question: 'Von 1.000 Befragten fehlt bei 50 das Alter und bei 80 das Einkommen; 20 davon fehlen bei beiden. Wie viele vollständige Paare gibt es?',
    options: ['890', '870', '920', '1.000'],
    correct: 0,
    right: 'Genau. 50 + 80 − 20 = 110 Personen fehlen bei mindestens einer Frage, also bleiben 1.000 − 110 = 890.',
    diagnose: {
      1: 'Fast! Du hast die 20 doppelt abgezogen. Sie fehlen bei beiden Fragen, sind aber nur 20 Personen: 1.000 − 110 = 890.',
      2: 'Fast! 920 haben ein gültiges Einkommen. Für das Paar muss zusätzlich das Alter da sein.',
      3: 'Fast! 1.000 sind alle Befragten. Wer bei einer der beiden Fragen fehlt, gehört nicht zu den vollständigen Paaren.',
    },
  },
  fuerDich: 'Schau in jeder R-Ausgabe zuerst auf N: Mit wie vielen Personen wurde gerechnet? Fehlt viel, frag dich, wer fehlt und ob das Ergebnis dadurch schief werden könnte.',
  genau: {
    kurz: 'Hier fällt eine Person aus der ganzen Rechnung, sobald ihr ein Wert fehlt. Wer fehlt, fehlt selten zufällig.',
    paragraphs: [
      'Nimmt man nur Personen, die in allen Variablen der Rechnung gültig sind, heißt das fallweiser (listenweiser) Ausschluss. Beim paarweisen Ausschluss beruht dagegen jede Korrelation einer Korrelationsmatrix auf ihrem eigenen n.',
      `Die ${c(A.btSplit)} Befragten ohne Frage zum Vertrauen fehlen nach Plan: Der ALLBUS stellt manche Fragen nur einem zufällig gewählten Teil der Befragten (Split). Solche Lücken verzerren wenig. Wer dagegen eine Antwort verweigert, unterscheidet sich oft von den anderen (Begriff „${T('missing_mechanisms')}“).`,
      `Die Zahlen hier sind ungewichtet. Mit Gewichten zählt nicht jede Person gleich viel (Begriff „${T('weights')}“); N bleibt die Zahl der Personen.`,
      'Im Lehrdatensatz mit 200 Befragten fehlt niemand. Dort ist n für jede Rechnung 200.',
    ],
  },
};

// Kein Reiter „Mit 200 Befragten“: Im Lehrdatensatz fehlt niemand, n ist für jede Spalte 200 (siehe „In R“: N 200,
// Missing 0). Eine Auswertung dazu hätte nichts zu zeigen, und die Datenänderungen der Vorhersagen erzeugen keine Lücken.
export const validnTabs: ConceptTabs = {
  r: {
    entry: '', variant: 0, live: { fn: 'describe', show: ['mean'] },
    tokens: {
      describe: DESCRIBE_NOTE,
      '"mean"': showNote('mean', T('mean'), '"mean" steht für den Mittelwert. Die Summe wird durch N geteilt, die Zahl der gültigen Werte.'),
    },
    outputMap: [
      { match: 'N', atlas: 'n', explain: 'N zählt die gültigen Werte der Spalte. Durch diese Zahl teilt R beim Mittelwert.' },
      { match: 'Missing', atlas: 'fehlende Werte', explain: 'Missing zählt Befragte ohne gültigen Wert. Sie gehen nicht in N ein.' },
      { match: 'Mean', atlas: 'Mittelwert', explain: 'Der Mittelwert, gerechnet mit den N gültigen Werten.' },
    ],
    check: {
      question: 'Welche Zahl in der Ausgabe ist n, die Zahl der gültigen Werte? Tippe sie an.', correct: 'N',
      wrong: {
        Missing: 'Fast! Missing zählt die fehlenden Werte. n steht unter N.',
        Mean: 'Fast! Das ist der Mittelwert. n steht unter N.',
      },
    },
  },
  next: {
    next: { id: 'missing', why: 'Warum Antworten fehlen und wie R fehlende Werte kennzeichnet.' },
    before: [
      { id: 'pairs', why: 'Für einen Zusammenhang zählen nur Personen mit beiden Werten.' },
      { id: 'count', why: 'Jede gültige Beobachtung zählt genau einmal.' },
    ],
    after: [
      { id: 'mean', why: 'Teilt die Summe durch n.' },
      { id: 'df', why: 'Aus n wird n − 1, die Zahl der frei wählbaren Abstände.' },
      { id: 'se', why: 'Je größer n, desto genauer kennt man den Mittelwert.' },
      { id: 'frequency', why: 'Prozente beziehen sich auf n.' },
    ],
    more: [
      { id: 'missing_mechanisms', why: 'Wer fehlt, fehlt selten zufällig.' },
      { id: 'weights', why: 'Mit Gewichten zählt nicht jede Person gleich viel.' },
    ],
  },
};
