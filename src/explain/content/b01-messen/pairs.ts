// Begriffskarte „Zusammengehörige Wertepaare“ (pairs). Beispiel: Lernzeit und Wissenstest von P001 bis P005;
// der Schalter sortiert beide Spalten getrennt und zeigt, wie dabei ein Zusammenhang ohne echte Personen entsteht.
// Vorlage: Begriffskarte (eine Idee, keine Rechnung). Zahlen in R nachgerechnet: b01-messen.test.ts.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { num } from '../../format';
import { sampleColumn } from '../../sample';
import { FUENF, pearson, role, valueText } from './shared';

const X = FUENF.map(p => p.lernzeit), Y = FUENF.map(p => p.wissenstest);
const up = (v: readonly number[]) => [...v].sort((a, b) => a - b);
/** r der fünf wie erhoben (R: −0.0714) und mit getrennt sortierten Spalten (R: 0.8806). */
export const R_FUENF = { erhoben: pearson(X, Y)!, sortiert: pearson(up(X), up(Y))! };
/** Werte für das Bild: die fünf Paare wie erhoben oder getrennt sortiert. */
export const paareFuer = (sorted: boolean) => sorted
  ? up(X).map((x, i) => ({ x, y: up(Y)[i], id: '' }))
  : FUENF.map(p => ({ x: p.lernzeit as number, y: p.wissenstest as number, id: p.id as string }));

const pair = (i: number) => `(${num(X[i])}; ${num(Y[i])})`;

export const pairs: ConceptCard = {
  concept: 'pairs',
  picture: 'b01-paare',
  wofuer: 'Lösen Befragte, die mehr lernen, im Wissenstest auch mehr Aufgaben? Dafür legst du für jede Person zwei Angaben nebeneinander: ihre Lernzeit und ihr Testergebnis. Diese zusammengehörigen Wertepaare sind die Grundlage jedes Zusammenhangs.',
  kurz: 'Ein Wertepaar sind zwei Angaben derselben Person, etwa ihre Lernzeit und ihr Testergebnis. Nur solange die Paare zusammenbleiben, kannst du einen Zusammenhang messen.',
  stellDirVor: {
    text: `P001 hat in den letzten sieben Tagen ${num(X[0])} Stunden gelernt und im Wissenstest ${Y[0]} Aufgaben gelöst, P002 ${num(X[1])} Stunden und ${Y[1]} Aufgaben, P003 ${num(X[2])} und ${Y[2]}, P004 ${num(X[3])} und ${Y[3]}, P005 ${num(X[4])} und ${Y[4]}. Bei diesen fünf hängen Lernzeit und Testergebnis kaum zusammen: r ≈ ${num(R_FUENF.erhoben)}. Sortierst du beide Spalten getrennt, kommt r ≈ ${num(R_FUENF.sortiert)} heraus: ein starker Zusammenhang, den es bei keiner Person gibt.`,
    figures: [
      { label: 'Paare n', value: '5' },
      { label: 'r wie erhoben', value: num(R_FUENF.erhoben) },
      { label: 'r getrennt sortiert', value: num(R_FUENF.sortiert) },
    ],
  },
  regler: {
    label: 'Wie liegen die Paare?', min: 0, max: 1, step: 1, initial: 0,
    format: v => v < 0.5 ? 'wie erhoben' : 'Spalten getrennt sortiert',
    describe: v => v < 0.5
      ? `Wie erhoben gehört jeder Punkt zu einer Person. Bei diesen fünf ergibt sich r ≈ ${num(R_FUENF.erhoben)}: kaum ein Zusammenhang.`
      : `Jetzt bekommt die kürzeste Lernzeit das schlechteste Testergebnis und so weiter. r steigt auf ${num(R_FUENF.sortiert)}, obwohl niemand so geantwortet hat.`,
  },
  heisst: {
    sym: '(xᵢ, yᵢ)', say: 'x i, y i',
    fach: 'Ein Wertepaar besteht aus zwei Merkmalswerten desselben Falls i. Zusammenhangsmaße wie Kovarianz und Korrelation verrechnen xᵢ immer mit dem yᵢ desselben Falls.',
  },
  bausteine: [
    {
      title: 'Zwei Angaben derselben Person nebeneinanderlegen',
      was: 'Für jede Person stehen Lernzeit und Testergebnis in derselben Zeile. Zusammen bilden sie ihr Wertepaar.',
      rechnung: `P001 ${pair(0)}, P002 ${pair(1)}, P003 ${pair(2)}, P004 ${pair(3)}, P005 ${pair(4)}`,
      warum: 'Ein Zusammenhang fragt, ob hohe Werte in der einen Spalte bei denselben Personen mit hohen Werten in der anderen auftreten.',
      acht: 'Die beiden Zahlen eines Paars haben verschiedene Einheiten, Stunden und Aufgaben. Du zählst sie nie zusammen, du betrachtest sie gemeinsam.',
      concept: 'series',
    },
    {
      title: 'Jedes Paar als Punkt einzeichnen',
      was: 'Die Lernzeit gibt an, wie weit rechts der Punkt liegt, das Testergebnis, wie weit oben. Jede Person ist genau ein Punkt.',
      warum: 'Im Bild siehst du auf einen Blick, ob die Punkte eher steigen, fallen oder ungeordnet liegen.',
      acht: 'Ein Punkt ist eine Person. Zwei Punkte für dieselbe Person heißen: Irgendwo sind Paare durcheinandergeraten.',
      concept: 'linear',
    },
    {
      title: 'Spalten nie getrennt sortieren',
      was: 'Sortierst du Lernzeiten und Testergebnisse jede für sich, bekommt die kürzeste Lernzeit das schlechteste Ergebnis. Diese Paare gibt es bei keiner Person.',
      rechnung: `Wie erhoben: r ≈ ${num(R_FUENF.erhoben)}. Getrennt sortiert: r ≈ ${num(R_FUENF.sortiert)}.`,
      warum: 'Getrennt sortierte Spalten steigen immer gemeinsam. Jede Korrelation wird dann künstlich stark.',
      acht: 'In einer Tabellenkalkulation passiert das schnell, wenn du nur eine Spalte markierst und sortierst. Markiere immer alle Spalten.',
      concept: 'pearson',
    },
    {
      title: 'Nur vollständige Paare zählen',
      was: 'Fehlt bei einer Person eine der beiden Angaben, gibt es für sie kein Paar.',
      warum: 'Ein halbes Paar trägt zu keinem Zusammenhang bei. Deshalb zählt n bei Paaren nur Personen mit beiden Angaben.',
      acht: 'Die Zahl der Paare kann kleiner sein als die Zahl der Befragten. Schau in der Ausgabe von R nach, was bei N steht.',
      concept: 'validn',
    },
  ],
  ausprobieren: [
    {
      question: 'Du sortierst nur die Spalte Wissenstest der Größe nach und lässt die Lernzeit stehen. Was passiert mit den Paaren?',
      options: ['Sie gehören nicht mehr zu echten Personen.', 'Nichts, die Werte sind ja dieselben.'], correct: 0, step: 3,
      explain: 'Die Testergebnisse rutschen in fremde Zeilen. P001 steht dann zum Beispiel neben dem schlechtesten Ergebnis, das jemand anderes erzielt hat.',
      kurz: 'Die Werte bleiben, die Zuordnung geht verloren.',
    },
    {
      question: 'Bei allen 200 Befragten ist r ≈ 0,54. Was ergibt sich, wenn du beide Spalten getrennt sortierst?',
      options: ['ein viel stärkerer Zusammenhang', 'derselbe Zusammenhang', 'kein Zusammenhang'], correct: 0, step: 3,
      explain: 'Getrennt sortiert steigt r auf 0,99. Dieser Zusammenhang beschreibt keine einzige Person, er ist durch das Sortieren entstanden.',
      kurz: 'Getrennt sortieren macht jeden Zusammenhang künstlich stark.',
    },
    {
      question: 'Bei P002 fehlt das Testergebnis. Wie viele Paare haben die fünf dann noch?',
      options: ['4', '5'], correct: 0, step: 4,
      explain: 'P002 hat nur noch eine Lernzeit, aber kein Testergebnis. Ohne zweite Angabe gibt es für sie kein Paar.',
      kurz: 'Ein Paar braucht beide Angaben.',
    },
  ],
  check: {
    question: 'Was ist ein Wertepaar?',
    options: [
      'Lernzeit und Testergebnis derselben Person',
      'die Lernzeiten von zwei verschiedenen Personen',
      'die kürzeste Lernzeit und das schlechteste Testergebnis',
      'zwei Angaben, die zufällig gleich groß sind',
    ],
    correct: 0,
    right: 'Genau. Ein Paar hält zwei Angaben derselben Person zusammen.',
    diagnose: {
      1: 'Fast! Das sind zwei Werte aus derselben Spalte. Ein Paar verbindet zwei Spalten bei derselben Person.',
      2: 'Fast! Das entsteht beim getrennten Sortieren. Solche Paare gehören zu keiner Person.',
      3: 'Noch nicht ganz. Ob die Zahlen gleich groß sind, spielt keine Rolle. Entscheidend ist, dass sie von derselben Person stammen.',
    },
  },
  fuerDich: 'Wenn du Daten sortierst, filterst oder zusammenfügst, prüfe danach an ein, zwei Personen: Stehen ihre Angaben noch in einer Zeile? In R bleiben die Zeilen zusammen, solange du mit der ganzen Tabelle arbeitest.',
  genau: {
    kurz: 'Wertepaare (xᵢ, yᵢ) verbinden zwei Merkmale desselben Falls. Jedes Zusammenhangsmaß setzt diese Zuordnung voraus.',
    paragraphs: [
      'Getrennt sortierte Spalten erreichen die größte Korrelation, die mit diesen beiden Verteilungen überhaupt möglich ist. Bei den 200 Befragten sind das 0,99 statt 0,54.',
      'Bei verbundenen Messungen, etwa derselben Person vor und nach einem Kurs, ist das Paar die Einheit der Auswertung. Gepaarte Tests vergleichen die Unterschiede innerhalb der Paare.',
      'Fehlen Angaben, nutzt der listenweise Ausschluss nur Personen mit allen benötigten Angaben. Der paarweise Ausschluss nutzt für jedes Spaltenpaar alle vollständigen Paare; dann können verschiedene Korrelationen auf verschiedenen Personen beruhen.',
    ],
  },
};

/** Paare der Auswertung: Lernzeit und Wissenstest der aktuellen Daten, r wie erhoben und getrennt sortiert. */
function paareOf(c: SampleCtx) {
  const x = role(c, 'x', 'lernzeit'), y = role(c, 'y', 'wissenstest');
  const xs = sampleColumn(c.rows, x), ys = sampleColumn(c.rows, y);
  const complete = xs.filter((v, i) => Number.isFinite(v) && Number.isFinite(ys[i])).length;
  return { x, y, xs, ys, complete, r: pearson(xs, ys), sorted: pearson(up(xs), up(ys)) };
}

export const pairsTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'lernzeit', y: 'wissenstest' },
    kurz: 'Dieselbe Idee mit allen 200 Befragten: Lernzeit und Wissenstest jeder Person bilden ein Wertepaar.',
    value: c => paareOf(c).r,
    result: c => {
      const { x, y, xs, ys, complete, r, sorted } = paareOf(c);
      const direction = r === null || Math.abs(r) < 0.005 ? 'Lernzeit und Testergebnis hängen nicht geradlinig zusammen'
        : r > 0 ? 'Wer mehr lernt, löst eher mehr Aufgaben' : 'Wer mehr lernt, löst eher weniger Aufgaben';
      return {
        kurz: `Die ${c.rows.length} Befragten liefern ${complete} Wertepaare aus Lernzeit und Wissenstest. ${direction}: r ≈ ${r === null ? 'nicht berechenbar' : num(r)}. Getrennt sortiert käme r ≈ ${sorted === null ? 'nicht berechenbar' : num(sorted)} heraus, ein Zusammenhang ohne echte Personen.`,
        fachlich: `${complete} vollständige Paare (xᵢ, yᵢ); Pearson-r = ${r === null ? 'nicht definiert' : num(r)}. Mit getrennt sortierten Spalten ergäbe sich r = ${sorted === null ? 'nicht definiert' : num(sorted)}.`,
        zusatz: `${c.rows[1].id} bildet das Paar (${valueText(x, xs[1])}; ${valueText(y, ys[1])}).`,
      };
    },
    voraussetzung: 'Beide Angaben stammen von derselben Person und stehen in derselben Zeile.',
    think: [
      {
        question: 'Die gewählte Person hat plötzlich 40 Stunden gelernt. Wie viele Wertepaare gibt es danach?',
        options: ['200', '199', '201'], correct: 0,
        explain: 'Ihr Paar ändert nur seine Lernzeit. Jede Person hat weiter genau ein Paar, es bleiben 200.',
        kurz: 'Ein neuer Wert macht kein neues Paar.',
        tryIt: { label: 'die gewählte Person auf 40 Stunden', op: 'outlier', column: 'x', value: 40 },
        expect: { change: 'equals', value: 200, measure: c => paareOf(c).complete },
      },
      {
        question: 'Alle lernen eine Stunde mehr. Was passiert mit r?',
        options: ['bleibt gleich', 'wird stärker', 'wird schwächer'], correct: 0,
        explain: 'Jedes Paar rückt um eine Stunde nach rechts, alle gleich weit. Wer vorher über der Mitte lag, liegt es auch danach. Der Zusammenhang bleibt derselbe.',
        kurz: 'Verschieben ändert die Lage der Paare, nicht ihren Zusammenhang.',
        tryIt: { label: 'alle eine Stunde mehr', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'same' },
      },
    ],
  },
  r: {
    entry: 'pearson', variant: 0,
    outputMap: [
      { match: 'N', atlas: 'Zahl der Paare n', step: 4, explain: 'N zählt die vollständigen Paare. Mit use = "listwise" sind das Personen, bei denen alle Angaben vorliegen.' },
      { match: 'r', atlas: 'r aus den Paaren', step: 3, explain: 'r verrechnet jede Lernzeit mit dem Testergebnis derselben Person. Getrennt sortiert käme 0,99 heraus.' },
    ],
    check: {
      question: 'Welche Zahl sagt, wie viele Wertepaare in die Rechnung eingehen? Tippe sie an.', correct: 'N',
      wrong: {
        r: 'Fast! Das ist die Korrelation, die aus den Paaren berechnet wird. Wie viele Paare es sind, steht bei N.',
        p: 'Fast! Das ist der p-Wert. Wie viele Paare eingehen, steht bei N.',
      },
    },
  },
  next: {
    next: { id: 'covariance', why: 'Verrechnet die Abweichungen beider Werte jedes Paars und misst so, ob sie gemeinsam steigen.' },
    before: [{ id: 'series', why: 'Je Spalte eine Datenreihe; ein Paar verbindet zwei Reihen an derselben Stelle.' }],
    after: [
      { id: 'pearson', why: 'Misst Richtung und Stärke eines geradlinigen Zusammenhangs aus allen Paaren.' },
      { id: 'crosstab', why: 'Zählt Paare aus zwei Kategorien, etwa Schulabschluss und Weiterbildung.' },
      { id: 'paired_design', why: 'Dieselbe Person zweimal gemessen: Auch das sind Paare.' },
    ],
    more: [{ id: 'validn', why: 'Zählt nur Personen, bei denen beide Angaben vorliegen.' }],
  },
};
