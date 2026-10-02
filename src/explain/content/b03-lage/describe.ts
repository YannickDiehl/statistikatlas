// Begriffskarte „Deskriptiver Überblick“ (describe): die Ausgabe von describe(lernzeit, einkommen, show = "all")
// lesen. Kein eigener Rechenkern, die Kennzahlen erklären ihre eigenen Begriffe. Referenzwerte in R: b03-lage.test.ts.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { num, unit } from '../../format';
import { column, mean, median, quantile6, sdOf, showNote, skewness } from './lage';

/** Kennzahlen aus describe(lernzeit, einkommen, show = "all") für die 200 Befragten. */
export const UEBERBLICK = {
  lernzeit: { mean: 7.7515, median: 7.6, sd: 3.237515, iqr: 3.95, skew: 0.1962485 },
  einkommen: { mean: 3154.62, median: 2772, sd: 1426.646, iqr: 1864.75, range: 8029, min: 607, max: 8636, q1: 2223, q3: 4087.75, mode: 3070, distinct: 197, skew: 0.7915222 },
  /** Mittelwert der Codes 0 bis 4 des Schulabschlusses, wie describe() ihn druckt */
  schulabschlussMean: '1.985',
} as const;
const Z = UEBERBLICK.lernzeit, E = UEBERBLICK.einkommen;
const eur = (v: number) => `${num(v)} €`;

export const describeCard: ConceptCard = {
  concept: 'describe',
  wofuer: 'Du bekommst einen Datensatz und willst wissen, was in einer Spalte steckt: Wo liegt die Mitte? Wie weit streuen die Werte? Gibt es Ausreißer? describe() aus mariposa beantwortet das für mehrere Spalten in einer Tabelle.',
  kurz: 'Ein deskriptiver Überblick stellt die wichtigsten Kennzahlen einer Spalte nebeneinander: Mitte, Streuung, Form und Fallzahl. Erst der Vergleich dieser Zahlen erzählt, wie die Werte verteilt sind.',
  stellDirVor: {
    text: `In R liefert describe(lernzeit, einkommen, show = "all") für die 200 Befragten 16 Kennzahlen je Spalte. Bei der Lernzeit liegen Mittelwert (${num(Z.mean)} h) und Median (${num(Z.median)} h) fast gleich auf. Beim Haushaltseinkommen liegt der Mittelwert mit ${eur(E.mean)} deutlich über dem Median von ${eur(E.median)}: Einige hohe Einkommen ziehen ihn nach oben.`,
    figures: [
      { label: 'Mittelwert Einkommen', value: eur(E.mean) },
      { label: 'Median Einkommen', value: eur(E.median) },
      { label: 'Standardabweichung Einkommen', value: eur(E.sd) },
      { label: 'Interquartilsabstand Einkommen', value: eur(E.iqr) },
    ],
  },
  heisst: {
    fach: 'Ein deskriptiver Überblick fasst Lage (Mittelwert, Median, Modus), Streuung (Standardabweichung, Varianz, Spannweite, Interquartilsabstand), Form (Schiefe, Kurtosis) und Fallzahl (N, Missing) einer Variable zusammen.',
  },
  bausteine: [
    {
      title: 'Die Mitte lesen',
      was: 'Vergleiche Mean und Median. Liegen sie nah beieinander, ist die Verteilung eher symmetrisch.',
      rechnung: `Einkommen: ${eur(E.mean)} gegen ${eur(E.median)}, also ${eur(E.mean - E.median)} Unterschied.`,
      warum: 'Der Mittelwert reagiert auf jeden einzelnen Wert, der Median nur auf die Reihenfolge. Ihr Abstand verrät einen Ausläufer.',
      acht: `Mode ist der häufigste Wert. Beim Einkommen kommen ${E.distinct} verschiedene Werte vor; der Modus ${eur(E.mode)} steht nur für zwei Haushalte und sagt deshalb wenig.`,
      concept: 'median',
    },
    {
      title: 'Die Streuung lesen',
      was: 'SD, IQR und Range messen, wie weit die Werte auseinanderliegen, jede Kennzahl auf ihre Weise.',
      rechnung: `Einkommen: SD ${eur(E.sd)}, IQR ${eur(E.iqr)}, Range ${eur(E.range)}.`,
      warum: 'Range hängt an zwei Personen, IQR an der mittleren Hälfte, SD an allen Werten. Zusammen zeigen sie, ob die Ränder weit hinausreichen.',
      acht: 'Variance ist die Streuung im Quadrat, beim Einkommen in Euro zum Quadrat. Für Aussagen über Menschen nimm SD.',
      concept: 'sd',
    },
    {
      title: 'Die Form lesen',
      was: 'Skewness und Kurtosis beschreiben die Form. Eine positive Schiefe heißt: ein Ausläufer zu großen Werten.',
      rechnung: `Schiefe beim Einkommen ${num(E.skew)}, bei der Lernzeit ${num(Z.skew)}.`,
      warum: 'So erkennst du, ob Mittelwert und Standardabweichung die Daten gut beschreiben oder ob Median und IQR besser passen.',
      acht: 'Kurtosis ist in describe() der Exzess. 0 heißt: Ränder wie bei einer Normalverteilung, nicht „keine Kurtosis“.',
      concept: 'shape',
    },
    {
      title: 'Die Fallzahl prüfen',
      was: 'N zählt die gültigen Werte, Missing die fehlenden. Alle Kennzahlen einer Zeile beruhen auf diesen N Personen.',
      warum: 'Fehlen viele Werte, beschreibt die Tabelle nur einen Teil der Befragten.',
      acht: 'describe() rechnet jede Spalte für sich. Zwei Spalten können deshalb auf verschiedenen Personen beruhen; vergleiche ihr N.',
      concept: 'validn',
    },
  ],
  ausprobieren: [
    {
      question: 'Beim Einkommen liegt der Mittelwert über dem Median. Was schließt du daraus?',
      options: ['Einige hohe Einkommen ziehen den Mittelwert nach oben.', `Die meisten Haushalte haben mehr als ${eur(E.mean)}.`, 'Der Median ist falsch berechnet.'], correct: 0, step: 1,
      explain: `Ein Ausläufer zu großen Werten zieht den Mittelwert, den Median nicht. Passend dazu ist die Schiefe positiv (${num(E.skew)}).`,
      kurz: 'Mittelwert über Median: Ausläufer nach oben.',
    },
    {
      question: `Beim Einkommen ist die Spannweite ${eur(E.range)}, der IQR nur ${eur(E.iqr)}. Was zeigt der Unterschied?`,
      options: ['Die mittlere Hälfte liegt eng, die Ränder reichen weit.', 'Die Daten enthalten einen Fehler.', 'Die Standardabweichung ist falsch.'], correct: 0, step: 2,
      explain: `Die mittlere Hälfte der Haushalte hat zwischen ${eur(E.q1)} und ${eur(E.q3)}. Bis zu den äußersten Haushalten ist es viel weiter: von ${eur(E.min)} bis ${eur(E.max)}.`,
      kurz: 'Range zeigt die Ränder, IQR die Mitte.',
    },
    {
      question: `describe() meldet für den Schulabschluss (Codes 0 bis 4) Mean ${UEBERBLICK.schulabschlussMean}. Was sagt dir diese Zahl?`,
      options: ['wenig, denn die Codes haben keine gleichen Abstände', 'die meisten haben einen Hauptschulabschluss', 'der typische Abschluss ist der mittlere Abschluss'], correct: 0, step: 1,
      explain: 'Abitur (Code 4) ist nicht doppelt so viel wie ein mittlerer Abschluss (Code 2). Für geordnete Kategorien lies Median und Häufigkeiten.',
      kurz: 'Codes sind keine Mengen.',
    },
  ],
  check: {
    question: 'Der Haushalt mit dem höchsten Einkommen hätte plötzlich 30.000 € im Monat. Welche Kennzahl aus describe() ändert sich dabei nicht?',
    options: ['Median', 'Mean', 'SD', 'Range'],
    correct: 0,
    right: 'Genau. Der Median hängt nur an der Reihenfolge, und der höchste Wert bleibt der höchste.',
    diagnose: {
      1: `Fast! Der Mittelwert steigt, denn der neue Wert geht in die Summe ein: von ${eur(E.mean)} auf 3.261,44 €.`,
      2: 'Fast! Die Standardabweichung wächst, denn der Abstand dieses Haushalts zur Mitte wird viel größer.',
      3: 'Fast! Die Spannweite wächst sogar am stärksten: Das Maximum ist einer ihrer beiden Werte.',
    },
  },
  fuerDich: 'Bevor du einen Test rechnest oder ein Ergebnis berichtest, schau dir describe() an. Liegen Mittelwert und Median weit auseinander oder reicht die Spannweite weit über den IQR hinaus, sieh dir die Verteilung genauer an.',
  genau: {
    kurz: 'Ohne show zeigt describe() eine kurze Auswahl: Mean, Median, SD, Range, IQR und Skewness. show = "all" zeigt alle Kennzahlen.',
    paragraphs: [
      'Q25 und Q75 sind das erste und das dritte Quartil, gerechnet wie w_quantile() nach Type 6; IQR ist ihr Abstand. Mode ist der häufigste Wert, bei Gleichstand der kleinste.',
      'Für Zahlencodes nominaler Kategorien rechnet describe() trotzdem Mittelwert und Standardabweichung. Ob das sinnvoll ist, entscheidet das Skalenniveau, nicht die Software.',
      'Mit weights = … rechnet describe() gewichtete Kennwerte, im ALLBUS etwa mit dem Gewicht wghtpew.',
    ],
  },
};

/** Kennzahlen der Spalte x wie in describe(): Mittelwert, Median, s, Quartile, Schiefe. */
export function overviewOf(c: SampleCtx) {
  const col = column(c, 'x', 'lernzeit'), xs = col.values;
  const q1 = quantile6(xs, 0.25), q3 = quantile6(xs, 0.75);
  return { col, n: xs.length, mean: mean(xs), median: median(xs), sd: sdOf(xs), q1, q3, iqr: q3 - q1, skew: skewness(xs) };
}

export const describeTabs: ConceptTabs = {
  sample: {
    kind: 'analysis',
    kurz: 'Dieselbe Übersicht mit allen 200 Befragten: Mitte, Streuung und Form der gewählten Spalte auf einen Blick.',
    value: c => overviewOf(c).mean,
    result: c => {
      const o = overviewOf(c), u = o.col.u, t = o.col.info.title, h = (v: number) => unit(v, 'Stunde', 'Stunden');
      return {
        kurz: o.col.id === 'lernzeit'
          ? `Im Schnitt haben die ${o.n} Befragten in den letzten sieben Tagen ${h(o.mean)} gelernt, der Median liegt bei ${h(o.median)}. Grob gesagt liegt eine Person etwa ${h(o.sd)} vom Durchschnitt entfernt; die mittlere Hälfte lernt zwischen ${num(o.q1)} und ${h(o.q3)}.`
          : `Bei „${t}“ liegt der Mittelwert bei ${u(o.mean)}, der Median bei ${u(o.median)}. Die mittlere Hälfte der Befragten liegt zwischen ${u(o.q1)} und ${u(o.q3)}.`,
        fachlich: `Mittelwert ${u(o.mean)}, Median ${u(o.median)}, Standardabweichung ${u(o.sd)}, Interquartilsabstand ${u(o.iqr)}${Number.isFinite(o.skew) ? `, Schiefe ${num(o.skew)}` : ''}, n = ${o.n}.`,
        zusatz: `Mittelwert und Median liegen ${u(Math.abs(o.mean - o.median))} auseinander.`,
      };
    },
    voraussetzung: 'Mittelwert, Standardabweichung und Schiefe setzen sinnvolle Abstände voraus. Bei geordneten Kategorien lies vor allem Median und Quartile.',
    think: [
      {
        question: 'Eine Person hat plötzlich gar nicht gelernt (0 Stunden). Was passiert mit dem Median?', options: ['bleibt gleich', 'sinkt deutlich', 'steigt'], correct: 0,
        explain: 'Wer vorher über dem Median lag, rutscht ans untere Ende. Auf den mittleren Plätzen der Reihe stehen hier aber mehrere Befragte mit genau 7,6 Stunden, deshalb bleibt der Median. Der Mittelwert sinkt dagegen um bis zu 0,09 Stunden.',
        kurz: 'Der Median hängt an der Reihenfolge, nicht an der Größe.',
        tryIt: { label: 'die gewählte Person auf 0 Stunden', op: 'outlier', column: 'x', value: 0 },
        expect: { change: 'same', measure: c => overviewOf(c).median },
      },
      {
        question: 'Alle lernen eine Stunde mehr. Was passiert mit dem Median?', options: ['bleibt gleich', 'steigt um 1 Stunde', 'verdoppelt sich'], correct: 1,
        explain: 'Die Reihenfolge bleibt dieselbe, nur jeder Wert ist eine Stunde größer. Also auch der mittlere Wert der Reihe nach.',
        kurz: 'Verschieben verschiebt alle Lagewerte.',
        tryIt: { label: 'alle eine Stunde mehr', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'plus', amount: 1, measure: c => overviewOf(c).median },
      },
      {
        question: 'Alle lernen doppelt so lange. Was passiert mit der Standardabweichung?', options: ['bleibt gleich', 'verdoppelt sich', 'vervierfacht sich'], correct: 1,
        explain: 'Jeder Abstand zur Mitte verdoppelt sich, also auch die Standardabweichung. Die Varianz würde sich vervierfachen.',
        kurz: 'Doppelte Werte, doppelte Standardabweichung.',
        tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        expect: { change: 'factor', factor: 2, measure: c => overviewOf(c).sd },
      },
    ],
  },
  r: {
    entry: 'describe', variant: 0,
    tokens: {
      '"all"': showNote('all', 'alle Kennzahlen', '"all" zeigt alle Kennzahlen von describe(), von Mean bis Q75. Ohne show kommt eine kurze Auswahl.'),
    },
    outputMap: [
      { match: 'Mean', atlas: 'Mittelwert', step: 1, explain: 'Mean ist der Mittelwert: die Summe geteilt durch N.' },
      { match: 'Median', atlas: 'Median', step: 1, explain: 'Der mittlere Wert der Reihe nach. Liegt er weit vom Mean entfernt, läuft die Verteilung zu einer Seite aus.' },
      { match: 'SD', atlas: 'Standardabweichung', step: 2, explain: 'SD heißt standard deviation, auf Deutsch Standardabweichung. Sie nutzt alle Werte.' },
      { match: 'IQR', atlas: 'Interquartilsabstand', step: 2, explain: 'IQR ist die Breite der mittleren Hälfte: Q75 minus Q25.' },
      { match: 'Skewness', atlas: 'Schiefe', step: 3, explain: 'Skewness heißt Schiefe. Positiv: ein Ausläufer zu großen Werten.' },
      { match: 'N', atlas: 'n', step: 4, explain: 'N zählt die gültigen Werte der Spalte.' },
    ],
    check: {
      question: 'Welche Zahl zeigt den Median der Lernzeit, den mittleren Wert der Reihe nach? Tippe sie an.', correct: 'Median',
      wrong: {
        Mean: 'Fast! Das ist der Mittelwert. Der Median steht in der Spalte daneben.',
        Mode: 'Fast! Mode ist der häufigste Wert. Der Median steht oben unter Median.',
        Q25: 'Fast! Q25 ist das erste Quartil: Ein Viertel liegt darunter. Der Median steht oben unter Median.',
      },
    },
  },
  next: {
    next: { id: 'empirical_distribution', why: 'Das Bild hinter den Kennzahlen: die ganze beobachtete Verteilung.' },
    before: [
      { id: 'mean', why: 'Die Lage, die jeden Wert gleich zählt.' },
      { id: 'median', why: 'Die Lage nach der Reihenfolge.' },
      { id: 'sd', why: 'Die Streuung mit allen Werten.' },
      { id: 'quantile', why: 'Q25, Q75 und die Breite der mittleren Hälfte.' },
    ],
    after: [
      { id: 'shape', why: 'Schiefe und Kurtosis aus der Tabelle genauer erklärt.' },
      { id: 't_test', why: 'Vergleicht Mittelwerte zweier Gruppen; vorher lohnt der Blick in die Übersicht.' },
    ],
    more: [{ id: 'weights', why: 'Mit Gewichten rechnet describe() gewichtete Kennwerte.' }],
  },
};
