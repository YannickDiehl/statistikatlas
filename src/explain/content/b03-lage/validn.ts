// Begriffskarte „Anzahl“ (validn): Welche Personen gehen in eine Rechnung ein? Beispiel aus dem ALLBUS 2023,
// ungewichtet und nur als Aggregat: Links-rechts-Einstufung (pa01) und Vertrauen in den Bundestag (pt03).
// Alle Zahlen sind in R nachgerechnet; Referenzwerte und R-Befehle: b03-lage.test.ts.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { count } from '../../format';
import { column, DESCRIBE_NOTE, showNote, T } from './lage';

/** ALLBUS 2023 (ZA8831, ungewichtet): Befragte, gültige Antworten und vollständige Paare. */
export const ALLBUS_N = {
  total: 5246,
  /** Links-rechts-Selbsteinstufung pa01 */
  lr: 4997, lrMissing: 249,
  /** N von describe(pa01, weights = wghtpew): Summe der Gewichte der gültigen Fälle, 4.991,75 */
  lrWeighted: 4992,
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
  fuerDich: 'Schau in jeder R-Ausgabe zuerst auf N: Mit wie vielen Personen wurde gerechnet? Fehlt viel, frag dich, wer fehlt und ob das Ergebnis dadurch verzerrt sein könnte.',
  genau: {
    kurz: 'Hier fällt eine Person aus der ganzen Rechnung, sobald ihr ein Wert fehlt. Fehlt eine Frage nach Plan, verzerrt das nichts; wer verweigert, fehlt oft nicht zufällig.',
    paragraphs: [
      'Nimmt man nur Personen, die in allen Variablen der Rechnung gültig sind, heißt das fallweiser (listenweiser) Ausschluss. Beim paarweisen Ausschluss beruht dagegen jede Korrelation einer Korrelationsmatrix auf ihrem eigenen n.',
      `Die ${c(A.btSplit)} Befragten ohne Frage zum Vertrauen fehlen nach Plan: Der ALLBUS stellt manche Fragen nur einem zufällig gewählten Teil der Befragten (Split). Solche Lücken verzerren nicht, sie kosten nur Fallzahl. Wer dagegen eine Antwort verweigert, unterscheidet sich oft von den anderen (Begriff „${T('missing_mechanisms')}“).`,
      `Die Zahlen hier sind ungewichtet. Mit Gewichten zählt nicht jede Person gleich viel (Begriff „${T('weights')}“). describe() meldet dann als N die Summe der Gewichte, wie SPSS, und nicht mehr die Zahl der Personen: Mit dem ALLBUS-Gewicht wghtpew steht bei der Links-rechts-Einstufung N = ${count(A.lrWeighted)} statt ${count(A.lr)}.`,
      'Im Lehrdatensatz mit 200 Befragten fehlt niemand. Dort ist n für jede Rechnung 200.',
    ],
  },
};

/** Gültige Werte je Spalte und vollständige Paare in den aktuellen Daten. */
export function validCounts(c: SampleCtx) {
  const x = column(c, 'x', 'lernzeit'), y = column(c, 'y', 'wissenstest');
  const ok = (v: number) => Number.isFinite(v);
  return { x, y, nx: x.values.filter(ok).length, ny: y.values.filter(ok).length, nxy: x.values.filter((v, i) => ok(v) && ok(y.values[i])).length, total: c.rows.length };
}

export const validnTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'lernzeit', y: 'wissenstest' },
    kurz: 'Dieselbe Frage mit den 200 Befragten des Lehrdatensatzes: Wie viele vollständige Paare gehen in eine Rechnung ein?',
    value: c => validCounts(c).nxy,
    result: c => {
      const v = validCounts(c);
      return {
        kurz: v.nxy === v.total
          ? `Alle ${v.total} Befragten haben bei „${v.x.info.title}“ und bei „${v.y.info.title}“ eine gültige Antwort. Für den Zusammenhang der beiden Spalten ist n = ${v.nxy}.`
          : `${v.nxy} von ${v.total} Befragten haben bei „${v.x.info.title}“ und bei „${v.y.info.title}“ eine gültige Antwort. Für den Zusammenhang ist n = ${v.nxy}.`,
        fachlich: `Gültige Werte: „${v.x.info.title}“ ${v.nx}, „${v.y.info.title}“ ${v.ny}; vollständige Wertepaare n = ${v.nxy}, fehlend ${v.total - v.nxy}.`,
        zusatz: 'Im Lehrdatensatz fehlt niemand. In echten Umfragen wie dem ALLBUS ist das selten.',
      };
    },
    voraussetzung: 'Gezählt wird jede Person mit einem Wert in beiden Spalten, egal wie groß der Wert ist. Auch 0 ist ein gültiger Wert.',
    think: [
      {
        question: 'Eine Person lernt plötzlich 40 Stunden. Was passiert mit n?', options: ['bleibt gleich', 'steigt', 'sinkt'], correct: 0,
        explain: 'n zählt Personen, nicht Stunden. Wie groß ein Wert ist, ändert nichts daran, ob er gültig ist.',
        kurz: 'Jede Person zählt genau einmal.',
        tryIt: { label: 'die gewählte Person auf 40 Stunden', op: 'outlier', column: 'x', value: 40 },
        expect: { change: 'same' },
      },
      {
        question: 'Alle haben in den letzten sieben Tagen gar nicht gelernt. Was passiert mit n?', options: ['bleibt gleich', 'wird 0', 'sinkt'], correct: 0,
        explain: '0 Stunden ist eine gültige Antwort. Alle 200 haben weiterhin einen Wert, also bleibt n bei 200.',
        kurz: 'Null ist nicht fehlend.',
        tryIt: { label: 'alle auf 0 Stunden', op: 'constant', column: 'x', value: 0 },
        expect: { change: 'same' },
      },
    ],
  },
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
      { id: 'missing_mechanisms', why: 'Wer eine Antwort verweigert, fehlt oft nicht zufällig.' },
      { id: 'weights', why: 'Manche Befragte zählen mehr, andere weniger.' },
    ],
  },
};
