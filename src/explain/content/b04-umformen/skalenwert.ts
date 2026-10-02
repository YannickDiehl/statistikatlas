// Begriffskarte „Skalenwert pro Person“ (Begriff `item_score`): fünf Fragen zur Methoden-Zuversicht werden zu einer
// Zahl je Person. Vorbild src/explain/content/muster/p-wert.ts, Ton nach streuung.ts. Zahlen aus dem Lehrdatensatz,
// in R nachgerechnet (rowMeans, cor, mariposa::reliability), siehe b04-umformen.test.ts.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { num } from '../../format';
import { relate } from '../../math';
import { sampleColumn } from '../../sample';
import { ITEMS, itemMeans } from './zeilen';

/** Methoden-Zuversicht im Lehrdatensatz: Skalenwerte der 200, Zusammenhang von Frage 3 mit den übrigen vier, Cronbachs Alpha (R). */
export const METHODEN = { mean: 4.012, min: 1.2, max: 7, atLeast5: 41, itemRest3: 0.7289871, alpha: 0.898 } as const;
const M = METHODEN;

/** Korrelation einer Frage mit dem Mittel der übrigen vier (Trennschärfe); null, wenn eine Seite nicht streut. */
export function itemRest(c: SampleCtx, item: string): number | null {
  const own = sampleColumn(c.rows, item), others = ITEMS.filter(k => k !== item).map(k => sampleColumn(c.rows, k));
  const rest = own.map((_, i) => others.reduce((a, col) => a + col[i], 0) / others.length);
  return relate(own, rest).r;
}

export const skalenwert: ConceptCard = {
  concept: 'item_score',
  wofuer: 'Fünf Fragen im Lehrdatensatz fragen nach Methoden-Zuversicht: eine Fragestellung formulieren, Variablen auswählen, ein Ergebnis erklären, Voraussetzungen prüfen, einen Analyseweg begründen. Statt fünf einzelner Antworten willst du eine Zahl je Person, mit der du weiterrechnen kannst.',
  kurz: 'Ein Skalenwert fasst mehrere Fragen zum selben Thema zu einer Zahl je Person zusammen. Das geht nur, wenn alle Fragen in dieselbe Richtung zeigen und dasselbe messen.',
  stellDirVor: {
    text: `P003 hat auf die fünf Fragen 5, 5, 3, 4 und 4 geantwortet, jeweils von 1 (stimme überhaupt nicht zu) bis 7 (stimme voll und ganz zu). Ihr Skalenwert ist der Mittelwert: 21 / 5 = 4,2. Über alle 200 Befragten reichen die Skalenwerte von ${num(M.min)} bis ${num(M.max)}, im Schnitt liegen sie bei ${num(M.mean)}.`,
    figures: [
      { label: 'Antworten von P003', value: '5, 5, 3, 4, 4' },
      { label: 'Skalenwert von P003', value: '4,2' },
      { label: 'Mittel der 200 Skalenwerte', value: num(M.mean) },
      { label: 'Cronbachs Alpha der fünf Fragen', value: num(M.alpha) },
    ],
  },
  heisst: {
    sym: 'Scoreᵢ', say: 'Score i',
    fach: 'Der Skalenwert einer Person ist der Mittelwert, seltener die Summe, ihrer gültigen Antworten auf gleich gepolte Items, die dasselbe Konstrukt messen sollen: Scoreᵢ = Σⱼ xᵢⱼ / kᵢ.',
  },
  bausteine: [
    {
      title: 'Fragen auswählen, die dasselbe messen',
      was: 'Du legst fest, welche Fragen zusammengehören: hier die fünf Aussagen zur Methoden-Zuversicht.',
      warum: 'Nur Fragen zum selben Thema ergeben zusammen eine sinnvolle Zahl. Lernzeit und Zuversicht in einen Topf zu werfen, ergäbe ein Durcheinander.',
      acht: 'Dass Fragen ähnlich klingen, reicht nicht. Ob sie zusammengehören, prüfen Reliabilität und Faktorenanalyse.',
      concept: 'dimensionality',
    },
    {
      title: 'Die Richtung angleichen',
      was: 'Alle Fragen müssen in dieselbe Richtung zeigen: Eine hohe Zahl heißt hohe Zuversicht. Umgekehrt formulierte Fragen polst du vorher um.',
      warum: 'Sonst heben sich Antworten auf, statt sich zu verstärken. Wer überall zuversichtlich ist, landete dann in der Mitte.',
      acht: 'Im Lehrdatensatz sind alle fünf Fragen gleich gepolt. In echten Fragebögen sind oft einzelne Fragen absichtlich umgekehrt formuliert.',
      concept: 'recode',
    },
    {
      title: 'Fehlende Antworten regeln',
      was: 'Du legst fest, wie viele Antworten eine Person mindestens braucht. Mit min_valid = 5 bekommt nur einen Wert, wer alle fünf beantwortet hat.',
      warum: 'Ein Wert aus einer einzigen Antwort wäre wenig verlässlich. Eine feste Regel behandelt alle gleich.',
      acht: 'Eine fehlende Antwort ist keine Null. Wer sie als 0 mitzählt, macht Personen künstlich unsicher.',
      concept: 'missing',
    },
    {
      title: 'Mittelwert oder Summe bilden',
      was: 'Für jede Person zählst du ihre Antworten zusammen und teilst durch die Zahl der Fragen.',
      rechnung: 'P003: (5 + 5 + 3 + 4 + 4) / 5 = 21 / 5 = 4,2',
      warum: 'Der Mittelwert bleibt auf der Antwortskala von 1 bis 7. So kannst du ihn lesen wie eine einzelne Antwort.',
      acht: 'Die Summe hängt davon ab, wie viele Fragen jemand beantwortet hat. Bei fehlenden Antworten ist der Mittelwert fairer.',
      concept: 'row_operations',
    },
  ],
  ausprobieren: [
    {
      question: 'Eine der fünf Fragen wäre umgekehrt formuliert und nicht umgepolt. Wie hängt sie dann mit den anderen vier zusammen?',
      options: ['genauso wie vorher', 'gegenläufig: Wer bei den anderen zustimmt, lehnt sie eher ab', 'gar nicht'], correct: 1, step: 2,
      explain: `Im Lehrdatensatz hängt Frage 3 mit dem Mittel der übrigen vier mit r ≈ ${num(M.itemRest3)} zusammen. Umgepolt wären es ${num(-M.itemRest3)}: gleich stark, aber gegenläufig. Im Skalenwert würde sie die anderen abschwächen.`,
      kurz: 'Erst umpolen, dann zusammenfassen.',
    },
    {
      question: 'P003 und P004 haben beide den Skalenwert 4,2. Haben sie gleich geantwortet?', options: ['ja', 'nein'], correct: 1, step: 4,
      explain: 'P003 hat 5, 5, 3, 4, 4 angekreuzt, P004 4, 4, 4, 5, 4. Der Skalenwert sagt, wo jemand insgesamt steht, nicht wie die Antworten verteilt sind.',
      kurz: 'Ein Wert für fünf Antworten verliert Einzelheiten.',
    },
    {
      question: 'Was ändert sich, wenn du statt des Mittelwerts die Summe nimmst?', options: ['die Reihenfolge der Personen', 'nur die Skala: 5 bis 35 statt 1 bis 7'], correct: 1, step: 4,
      explain: 'Bei vollständigen Antworten ist die Summe genau fünfmal der Mittelwert. Wer vorne liegt, bleibt vorne.',
      kurz: 'Summe und Mittelwert ordnen gleich, solange niemand Antworten auslässt.',
    },
  ],
  regler: {
    label: 'Antwort von P003 auf Frage 3', min: 1, max: 7, step: 1, initial: 3,
    format: v => num(v),
    describe: v => `Mit einer ${num(v)} bei Frage 3 kommt P003 auf (5 + 5 + ${num(v)} + 4 + 4) / 5 = ${num((18 + v) / 5)}. Jede Stufe mehr bei einer Frage hebt den Skalenwert um 0,2.`,
  },
  check: {
    question: 'Welche Fragen darfst du ohne Weiteres zu einem Skalenwert zusammenfassen?',
    options: [
      'Fünf gleich gepolte Fragen zur Methoden-Zuversicht mit denselben sieben Stufen',
      'Methoden-Zuversicht, Lernzeit und Alter',
      'Fünf Fragen zur Methoden-Zuversicht, von denen eine umgekehrt formuliert und nicht umgepolt ist',
      'Fragen mit 5 und mit 10 Stufen, ohne sie umzurechnen',
    ],
    correct: 0,
    right: 'Genau. Gleiches Thema, gleiche Richtung, gleiche Antwortskala: Dann ist der Mittelwert ein sinnvoller Skalenwert.',
    diagnose: {
      1: 'Fast! Das sind ganz verschiedene Merkmale mit verschiedenen Einheiten. Ihr Mittelwert beschreibt nichts Gemeinsames.',
      2: 'Fast! Die umgekehrte Frage zeigt in die andere Richtung. Polst du sie nicht um, schwächt sie den Skalenwert ab.',
      3: 'Fast! Bei verschiedenen Stufen zählt die Frage mit 10 Stufen stärker. Rechne vorher um, etwa auf 0 bis 100 mit POMP.',
    },
  },
  fuerDich: 'Wenn du in einer Studie von einem Index oder einer Skala liest, frag: Welche Fragen stecken darin, zeigen alle in dieselbe Richtung, und wie wurde mit fehlenden Antworten umgegangen?',
  genau: {
    kurz: 'Ein Skalenwert setzt voraus, dass die Fragen ein gemeinsames Merkmal messen. Eine hohe Reliabilität allein beweist das nicht.',
    paragraphs: [
      `Die fünf Fragen zur Methoden-Zuversicht im Lehrdatensatz sind gemeinsam synthetisch erzeugt und gleich gepolt. Sie sind ein Rechenbeispiel, keine geprüfte Skala. Cronbachs Alpha liegt bei ${num(M.alpha)}.`,
      'Die drei einzelnen Zustimmungsfragen mit 5, 7 und 10 Stufen (Lernplanung, Lernzuversicht, Statistikinteresse) solltest du nicht ohne Weiteres mitteln. Sie fragen Verschiedenes, und die Frage mit 10 Stufen zählte stärker.',
      'Mittelwert und Summe ergeben bei vollständigen Antworten dieselbe Reihenfolge der Personen. Fehlen Antworten, ist der Mittelwert über die gültigen Antworten fairer; min_valid legt fest, wie viele es mindestens sein müssen.',
      'Wer den Skalenwert metrisch auswertet, nimmt gleich große Abstände zwischen den Antwortstufen an. Ob ein einziger Wert der Struktur der Fragen gerecht wird, prüfen Dimensionalität und Faktorenanalyse.',
    ],
  },
};

export const tabsItemScore: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'methoden3' },
    kurz: 'Derselbe Skalenwert für alle 200 Befragten: der Mittelwert ihrer fünf Antworten zur Methoden-Zuversicht.',
    value: c => itemMeans(c).mean,
    result: c => {
      const m = itemMeans(c), r = itemRest(c, c.columns.x?.[0] ?? 'methoden3'), high = m.means.filter(v => v >= 5).length;
      const where = m.mean > 4.05 ? 'über' : m.mean < 3.95 ? 'unter' : 'etwa auf';
      return {
        kurz: `Die Skalenwerte der ${m.n} Befragten liegen im Schnitt bei ${num(m.mean)}, ${where} der Skalenmitte 4 („Weder noch“). ${high} Befragte kommen auf 5 oder mehr, stimmen also im Mittel eher zu.`,
        fachlich: `Skalenwert = Mittelwert von methoden1 bis methoden5 je Person; Mittelwert ${num(m.mean)}, Standardabweichung ${num(m.sd)}. ${r === null ? 'Frage 3 streut nicht, ein Zusammenhang lässt sich nicht berechnen.' : `Frage 3 hängt mit dem Mittel der übrigen vier mit r ≈ ${num(r)} zusammen.`}`,
        zusatz: `Die Skalenwerte reichen von ${num(m.min)} bis ${num(m.max)}.`,
      };
    },
    voraussetzung: 'Alle fünf Fragen sind gleich gepolt und haben dieselben sieben Stufen. Dass sie dasselbe messen, ist hier eine Annahme des Lehrbeispiels.',
    think: [
      {
        question: 'Angenommen, Frage 3 wird versehentlich umgepolt (8 minus Antwort). Wie hängt sie dann mit den übrigen vier zusammen?', options: ['genauso wie vorher', 'mit umgekehrtem Vorzeichen', 'gar nicht mehr'], correct: 1,
        explain: `Aus r ≈ ${num(M.itemRest3)} wird r ≈ ${num(-M.itemRest3)}. Wer bei den anderen Fragen zustimmt, lehnt die umgepolte Frage jetzt eher ab. Im Skalenwert würden sich die Antworten teilweise aufheben.`,
        kurz: 'Erst umpolen, dann zusammenfassen.',
        tryIt: { label: 'methoden3 umpolen (8 minus Antwort)', op: 'reverse', column: 'x' },
        expect: { change: 'sign', measure: c => itemRest(c, c.columns.x?.[0] ?? 'methoden3') },
      },
    ],
  },
  r: {
    entry: 'row_operations', variant: 0,
    tokens: {
      row_means: { sym: 'row_means()', term: 'Rechnen innerhalb einer Person', kurz: 'Bildet je Person den Mittelwert über die ausgewählten Fragen: den Skalenwert.', fehler: 'Ohne pick() bekommt row_means() keine Tabelle und meldet: `data` must be a data frame or tibble.' },
      methoden_mittel: { sym: 'methoden_mittel', term: 'Skalenwert pro Person', kurz: 'Der Name der neuen Spalte mit den Skalenwerten. Die fünf Fragen bleiben daneben erhalten.', fehler: 'Gibst du der neuen Spalte den Namen einer Frage, etwa methoden1, überschreibt mutate() die ursprünglichen Antworten.' },
    },
    outputMap: [
      { match: 'Mean', atlas: 'Mittel der Skalenwerte', step: 4, explain: 'Der Durchschnitt der 200 Skalenwerte, fast genau auf der Skalenmitte 4.' },
      { match: 'SD', atlas: 'Streuung der Skalenwerte', explain: 'Wie weit die Skalenwerte grob um ihren Durchschnitt streuen.' },
      { match: 'Min', atlas: 'kleinster Skalenwert', explain: 'Die geringste Zuversicht: im Mittel 1,2 über die fünf Fragen.' },
      { match: 'N', atlas: 'n', step: 3, explain: 'Alle 200 haben einen Skalenwert, denn niemand hat eine Frage ausgelassen.' },
    ],
    check: {
      question: 'Welche Zahl ist der durchschnittliche Skalenwert? Tippe sie an.', correct: 'Mean',
      wrong: {
        SD: 'Fast! Das ist die Standardabweichung der Skalenwerte. Der Durchschnitt steht unter Mean.',
        Min: 'Fast! Das ist der kleinste Skalenwert. Der Durchschnitt steht unter Mean.',
        Max: 'Fast! Das ist der größte Skalenwert. Der Durchschnitt steht unter Mean.',
      },
    },
  },
  next: {
    next: { id: 'reliability', why: `Prüft, ob die fünf Fragen genug zusammenhängen. Für die Methoden-Zuversicht meldet R ein Cronbachs Alpha von ${num(M.alpha)}.` },
    before: [
      { id: 'operationalization', why: 'Der Skalenwert ist Teil der Messregel: welche Fragen, wie verrechnet.' },
      { id: 'dimensionality', why: 'Ein Wert für mehrere Fragen setzt voraus, dass sie ein gemeinsames Merkmal messen.' },
      { id: 'recode', why: 'Umgekehrt formulierte Fragen werden vorher umgepolt.' },
    ],
    after: [
      { id: 'row_operations', why: 'So rechnest du den Skalenwert in R: mit row_means() oder row_sums().' },
    ],
    more: [
      { id: 'missing', why: 'Wie viele Antworten eine Person mindestens braucht.' },
      { id: 'efa', why: 'Zeigt, ob sich die Fragen auf ein gemeinsames Merkmal zurückführen lassen.' },
    ],
  },
};
