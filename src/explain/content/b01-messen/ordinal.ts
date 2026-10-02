// Begriffskarte „Geordnete Kategorien“ (ordinal). Beispiel: „Wie gut kommt Ihr Haushalt mit seinem Einkommen aus?“
// (finanzlage, Codes 1 bis 5) im Lehrdatensatz. Vorlage: Begriffskarte. Zahlen in R nachgerechnet: b01-messen.test.ts.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { sampleColumn } from '../../sample';
import { countsByCode, labelOf, mean, middle, numR, role, valueText } from './shared';

/** Befragte je Antwort zur finanziellen Lage, Codes 1 bis 5 (R: table(finanzlage)). */
export const FINANZ = [17, 54, 57, 52, 20] as const;
const F = (code: number) => `„${labelOf('finanzlage', code)}“`;
const FINANZ_MITTEL = FINANZ.reduce((a, k, i) => a + k * (i + 1), 0) / 200;
/** Mittelwert der Codes, wenn man statt 1 bis 5 die Zahlen 1, 2, 3, 10, 20 vergibt (R: 6.08). */
const UMNUMMERIERT = [1, 2, 3, 10, 20].reduce((a, v, i) => a + FINANZ[i] * v, 0) / 200;

export const ordinal: ConceptCard = {
  concept: 'ordinal',
  wofuer: 'Viele Fragen in Umfragen haben Antworten mit einer Reihenfolge: von „Sehr schwer“ bis „Sehr leicht“, von „Stimme überhaupt nicht zu“ bis „Stimme voll und ganz zu“. Diese Reihenfolge darfst du nutzen. Wie groß die Schritte dazwischen sind, weißt du aber nicht.',
  kurz: 'Geordnete Kategorien haben eine Reihenfolge, aber keine festen Abstände. Du darfst sagen, wer besser oder schlechter liegt, aber nicht, um wie viel.',
  stellDirVor: {
    text: `Der Lehrdatensatz fragt: „Wie gut kommt Ihr Haushalt mit seinem Einkommen aus?“ ${FINANZ[0]} Befragte sagen ${F(1)}, ${FINANZ[1]} ${F(2)}, ${FINANZ[2]} ${F(3)}, ${FINANZ[3]} ${F(4)} und ${FINANZ[4]} ${F(5)}. Die Antworten haben eine klare Reihenfolge. Wie weit ${F(4)} von ${F(5)} entfernt ist, sagt die Frage aber nicht.`,
    figures: [
      { label: labelOf('finanzlage', 1)!, value: String(FINANZ[0]) },
      { label: labelOf('finanzlage', 3)!, value: String(FINANZ[2]) },
      { label: labelOf('finanzlage', 5)!, value: String(FINANZ[4]) },
      { label: 'Median', value: labelOf('finanzlage', 3)! },
    ],
  },
  heisst: {
    fach: 'Bei ordinalen Merkmalen ist die Reihenfolge der Kategorien sinnvoll; die Abstände zwischen benachbarten Kategorien sind nicht festgelegt. Zulässig sind Größer-kleiner-Vergleiche: Median, Quantile, Ränge und Rangkorrelationen.',
  },
  bausteine: [
    {
      title: 'Die Reihenfolge nutzen',
      was: `${F(4)} ist besser als ${F(3)}, und das ist besser als ${F(2)}. Diese Ordnung darfst du verwenden.`,
      warum: `Mit ihr kannst du sagen, wer besser oder schlechter auskommt. Und du kannst zählen, wie viele ${F(3)} oder schlechter antworten.`,
      acht: 'Die Reihenfolge muss aus der Frage kommen. Bei der finanziellen Lage ist sie klar, beim Berufsabschluss gibt es keine.',
      concept: 'sorting',
    },
    {
      title: 'Die Abstände offenlassen',
      was: `Ob der Schritt von ${F(1)} zu ${F(2)} so groß ist wie der von ${F(4)} zu ${F(5)}, weiß niemand.`,
      warum: 'Die Codes 1 bis 5 sehen gleichmäßig aus. Die Gleichmäßigkeit steckt aber nur in der Nummerierung.',
      acht: `Ein Mittelwert der Codes, hier ${numR(FINANZ_MITTEL)}, tut so, als wären alle Schritte gleich groß.`,
      concept: 'metric',
    },
    {
      title: 'Den mittleren Wert der Reihe nach suchen',
      was: `Du ordnest alle 200 Antworten und schaust in die Mitte, auf die Plätze 100 und 101. Dort steht beide Male ${F(3)}.`,
      rechnung: `Bis ${F(2)} sind es ${FINANZ[0] + FINANZ[1]} Befragte, bis ${F(3)} ${FINANZ[0] + FINANZ[1] + FINANZ[2]}. Die Plätze 100 und 101 liegen also bei ${F(3)}.`,
      warum: 'Der Median braucht nur die Reihenfolge, keine Abstände. Deshalb passt er zu ordinalen Daten.',
      acht: 'Liegen die beiden mittleren Plätze in verschiedenen Kategorien, gibt es keinen einzelnen Median. Dann nennst du beide.',
      concept: 'median',
    },
    {
      title: 'Zusammenhänge über Ränge messen',
      was: 'Für zwei ordinale Merkmale ersetzt man die Antworten durch Ränge und misst, ob sie gemeinsam steigen.',
      warum: 'So zählt nur, wer vor wem liegt, nicht wie weit.',
      acht: 'Pearson-r setzt feste Abstände voraus. Bei ordinalen Daten passen Spearman, Kendall Tau-b oder Gamma.',
      concept: 'spearman',
    },
  ],
  ausprobieren: [
    {
      question: 'Du nummerierst die finanzielle Lage statt mit 1 bis 5 mit 1, 2, 3, 10, 20. Was passiert mit dem Median?',
      options: [`er bleibt ${F(3)}`, 'er verschiebt sich nach oben'], correct: 0, step: 3,
      explain: `Die Reihenfolge bleibt dieselbe, also auch der mittlere Platz. Der Mittelwert der Codes springt dagegen von ${numR(FINANZ_MITTEL)} auf ${numR(UMNUMMERIERT)}.`,
      kurz: 'Der Median hängt nur an der Reihenfolge.',
    },
    {
      question: `Ist ${F(4)} (Code 4) doppelt so gut wie ${F(2)} (Code 2)?`,
      options: ['ja', 'nein'], correct: 1, step: 2,
      explain: `Nein. Die Codes geben nur die Reihenfolge an. Mit den Codes 1, 2, 3, 10, 20 wäre ${F(4)} fünfmal so viel, und beide Nummerierungen wären gleich richtig.`,
      kurz: 'Codes einer Rangfolge sind keine Mengen.',
    },
  ],
  check: {
    question: `Bei der finanziellen Lage antwortet die mittlere Person der Reihe nach ${F(3)}. Was darfst du sagen?`,
    options: [
      `Mindestens die Hälfte antwortet ${F(3)} oder schlechter.`,
      `Im Durchschnitt liegt die finanzielle Lage bei ${numR(FINANZ_MITTEL)} Punkten.`,
      `${F(4)} ist doppelt so gut wie ${F(2)}.`,
      `Genau die Hälfte antwortet ${F(3)}.`,
    ],
    correct: 0,
    right: `Genau. Der Median teilt die geordneten Antworten: Mindestens die Hälfte liegt bei ${F(3)} oder darunter, mindestens die Hälfte bei ${F(3)} oder darüber.`,
    diagnose: {
      1: 'Fast! Ein Durchschnitt der Codes setzt gleich große Abstände zwischen den Antworten voraus.',
      2: 'Fast! Verhältnisse brauchen feste Abstände und einen echten Nullpunkt. Die Codes geben nur die Reihenfolge an.',
      3: `Fast! Der Median ist ein Platz in der Reihe, kein Anteil. ${F(3)} sagen ${FINANZ[2]} von 200.`,
    },
  },
  fuerDich: 'Bei Zustimmungsfragen und Rangfolgen berichte zuerst die Häufigkeiten und den Median. Wenn du trotzdem einen Mittelwert rechnest, schreib dazu, dass du gleich große Abstände annimmst.',
  genau: {
    kurz: 'Ordinal heißt: Reihenfolge ja, feste Abstände nein. Zulässig ist alles, was sich nicht ändert, wenn man die Codes unter Beibehaltung der Reihenfolge neu vergibt.',
    paragraphs: [
      'Jede Umnummerierung, die die Reihenfolge erhält, ist bei ordinalen Daten erlaubt. Median und Ränge bleiben dabei gleich, Mittelwert und Varianz der Codes nicht. Daran erkennst du, welche Kennwerte zulässig sind.',
      'Bei einer geraden Zahl von Befragten liegt der Median zwischen den Plätzen n / 2 und n / 2 + 1. Fallen sie in verschiedene Kategorien, nennt der Atlas beide, statt Codes zu mitteln.',
      'Zustimmungsskalen sind streng genommen ordinal. Mit fünf oder mehr Stufen werden sie oft wie metrische Daten ausgewertet; das ist eine Annahme über gleich große Abstände.',
      'Umpolen mit rec(…, rules = "rev") dreht die Reihenfolge um. Jede Kategorie behält ihre Häufigkeit, aber oben und unten tauschen.',
    ],
  },
};

function finanzOf(c: SampleCtx) {
  const column = role(c, 'x', 'finanzlage'), values = sampleColumn(c.rows, column), counts = countsByCode(c, column);
  const [lo, hi] = middle(values);
  return { column, values, counts, lo, hi, n: values.length, m: mean(values) };
}

export const ordinalTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'finanzlage' },
    kurz: 'Dieselbe Frage mit allen 200 Befragten: Wie gut kommen ihre Haushalte mit dem Einkommen aus, und wo liegt der mittlere Wert der Reihe nach?',
    value: c => { const f = finanzOf(c); return (f.lo + f.hi) / 2; },
    result: c => {
      const { column, counts, lo, hi, n, m } = finanzOf(c);
      const med = lo === hi ? valueText(column, lo) : `zwischen ${valueText(column, lo)} und ${valueText(column, hi)}`;
      const low = counts[0].n + counts[1].n, high = counts[3].n + counts[4].n;
      return {
        kurz: `Die mittlere Person der Reihe nach sagt ${med}. ${low} von ${n} kommen eher schwer oder sehr schwer aus, ${high} eher leicht oder sehr leicht.`,
        fachlich: `Ordinales Merkmal mit fünf Kategorien; Median: ${med}. Der Mittelwert der Codes, ${numR(m)}, setzt gleiche Abstände voraus.`,
        zusatz: `Häufigkeiten von ${F(1)} bis ${F(5)}: ${counts.map(k => k.n).join(', ')}.`,
      };
    },
    voraussetzung: 'Die Antworten lassen sich ordnen; über die Größe der Schritte zwischen ihnen sagt die Frage nichts.',
    think: [
      {
        question: `Die gewählte Person rückt auf ${F(5)}. Was passiert mit dem Median?`,
        options: ['bleibt gleich', 'steigt', 'sinkt'], correct: 0,
        explain: `Eine einzelne Antwort verschiebt den mittleren Platz der Reihe kaum. In den Ausgangsdaten bleibt der Median ${F(3)}, egal wer nach oben rückt.`,
        kurz: 'Der Median hängt an den mittleren Plätzen, nicht an einzelnen Rändern.',
        tryIt: { label: `die gewählte Person auf ${F(5)} (5)`, op: 'outlier', column: 'x', value: 5 },
        expect: { change: 'same' },
      },
      {
        question: `In den Ausgangsdaten sagen ${FINANZ[0]} Befragte ${F(1)}. Nun werden alle Antworten umgepolt: ${F(1)} wird ${F(5)} und umgekehrt. Wie viele sagen danach ${F(5)}?`,
        options: [String(FINANZ[0]), String(FINANZ[4]), String(FINANZ[2])], correct: 0,
        explain: `Umpolen dreht die Reihenfolge um. Wer vorher ${F(1)} sagte, steht jetzt ganz oben; in den Ausgangsdaten sind das ${FINANZ[0]} Befragte.`,
        kurz: 'Umpolen tauscht oben und unten.',
        tryIt: { label: 'die Antworten umpolen (1 wird 5, 5 wird 1)', op: 'reverse', column: 'x' },
        expect: { change: 'equals', value: FINANZ[0], measure: c => finanzOf(c).counts[4].n },
      },
    ],
  },
  r: {
    entry: 'frequency', variant: 0,
    outputMap: [
      { match: 'Cum. %', atlas: 'kumulierte Prozent', step: 1, explain: 'Von unten aufaddiert: 21 % haben keinen Schulabschluss, bis zum mittleren Abschluss sind es 59,5 %. Das nutzt nur die Reihenfolge.' },
      { match: 'mean', atlas: 'Mittelwert der Codes', step: 2, explain: 'R mittelt die Codes 0 bis 4. Das setzt gleich große Abstände zwischen den Abschlüssen voraus, die es nicht gibt.' },
      { match: 'valid N', atlas: 'gültige Angaben n', step: 3, explain: 'Alle 200 Befragten haben eine gültige Angabe zum Schulabschluss.' },
    ],
    check: {
      question: 'Welche Zahl nutzt nur die Reihenfolge der Abschlüsse? Tippe sie an.', correct: 'Cum. %',
      wrong: {
        mean: 'Fast! Der Mittelwert der Codes setzt gleiche Abstände voraus. Die gibt es zwischen Schulabschlüssen nicht.',
        sd: 'Fast! Auch die Standardabweichung der Codes misst Abstände. Sie passt nicht zu geordneten Kategorien.',
        'valid N': 'Fast! N zählt nur die gültigen Angaben. Die Reihenfolge nutzen die kumulierten Prozent.',
      },
    },
  },
  next: {
    next: { id: 'median', why: 'Der mittlere Wert der Reihe nach: der passende Lagewert für geordnete Kategorien.' },
    before: [{ id: 'nominal', why: 'Die Stufe davor: Kategorien ohne Reihenfolge.' }],
    after: [
      { id: 'metric', why: 'Die nächste Stufe: Auch die Abstände bedeuten etwas.' },
      { id: 'ranks', why: 'Ersetzt Werte durch ihren Platz in der Reihenfolge.' },
      { id: 'spearman', why: 'Zusammenhang zweier geordneter Merkmale über Ränge.' },
    ],
    more: [
      { id: 'recode', why: 'Dreht die Reihenfolge einer Frage um, etwa mit rules = "rev".' },
      { id: 'goodman_gamma', why: 'Zusammenhangsmaß für zwei geordnete Merkmale mit wenigen Kategorien.' },
    ],
  },
};
