// Begriffskarte „Spannweite“ (range). Grenzfall: Die Rechnung ist eine einzige Subtraktion; zu verstehen ist die
// Idee, dass nur zwei Personen die Zahl bestimmen. Beispiel aus dem Lehrdatensatz (Lernzeit der 200 Befragten),
// der Regler verschiebt den größten Wert. Referenzwerte in R: b03-lage.test.ts.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { num, unit } from '../../format';
import { baseSurvey, sampleColumn } from '../../sample';
import { column, DESCRIBE_NOTE, quantile6, showNote, T } from './lage';

/** Lernzeit der 200 Befragten im Lehrdatensatz: kleinster und größter Wert, Quartile (Type 6). */
export const LERNZEIT = { min: 0, minPerson: 'P100', max: 18.4, maxPerson: 'P175', q1: 5.8, q3: 9.75, iqr: 3.95 } as const;
const L = LERNZEIT;
const h = (v: number) => unit(v, 'Stunde', 'Stunden');

/** Die 200 Lernzeiten, bei denen die Person mit der längsten Lernzeit `top` Stunden hat (für Regler und Bild). */
export function withTop(top: number): number[] {
  const rows = baseSurvey(), xs = sampleColumn(rows, 'lernzeit'), at = rows.findIndex(r => r.id === L.maxPerson);
  return xs.map((v, i) => i === at ? top : v);
}
/** Spannweite und Interquartilsabstand, wenn die längste Lernzeit `top` Stunden beträgt. */
export function rangeWithTop(top: number) {
  const xs = withTop(top), lo = Math.min(...xs), hi = Math.max(...xs), q1 = quantile6(xs, 0.25), q3 = quantile6(xs, 0.75);
  return { xs, min: lo, max: hi, range: hi - lo, q1, q3, iqr: q3 - q1 };
}

export const range: ConceptCard = {
  concept: 'range',
  picture: 'b03-spannweite',
  wofuer: 'Wie unterschiedlich lange lernen die 200 Befragten? Eine erste Antwort: Schau, wer am wenigsten und wer am meisten gelernt hat. Der Abstand zwischen diesen beiden heißt Spannweite.',
  kurz: 'Die Spannweite ist der Abstand zwischen dem kleinsten und dem größten Wert. Sie hängt nur an diesen zwei Personen.',
  stellDirVor: {
    text: `Im Lehrdatensatz hat eine Person in den letzten sieben Tagen gar nicht gelernt, die fleißigste ${num(L.max)} Stunden. Die Spannweite beträgt also ${num(L.max)} − ${num(L.min)} = ${num(L.max - L.min)} Stunden. Die mittlere Hälfte der Befragten lernt dagegen zwischen ${num(L.q1)} und ${num(L.q3)} Stunden; diese Spanne ist nur ${num(L.iqr)} Stunden breit.`,
    figures: [
      { label: 'kleinster Wert', value: `${num(L.min)} h` },
      { label: 'größter Wert', value: `${num(L.max)} h` },
      { label: 'Spannweite', value: `${num(L.max - L.min)} h` },
      { label: 'Interquartilsabstand', value: `${num(L.iqr)} h` },
    ],
  },
  heisst: {
    sym: 'x₍ₙ₎ − x₍₁₎', say: 'x n minus x eins',
    fach: 'Die Spannweite ist das Maximum minus das Minimum der beobachteten Werte, also der letzte minus der erste Wert der geordneten Reihe.',
  },
  bausteine: [
    {
      title: 'Den kleinsten und den größten Wert suchen',
      was: 'Du ordnest die Werte der Reihe nach. Der erste ist das Minimum, der letzte das Maximum.',
      rechnung: `Kleinster Wert ${num(L.min)} h (${L.minPerson}), größter Wert ${num(L.max)} h (${L.maxPerson}).`,
      warum: 'Nur diese beiden Werte zeigen, wie weit die Antworten insgesamt reichen.',
      acht: 'Gemeint sind der kleinste und der größte Wert, nicht der erste und der letzte Eintrag im Datensatz. Ohne Ordnen erwischst du leicht die falschen.',
      concept: 'sorting',
    },
    {
      title: 'Den Abstand messen',
      was: 'Du ziehst den kleinsten Wert vom größten ab. Das Ergebnis hat die Einheit der Daten, hier Stunden.',
      rechnung: `${num(L.max)} − ${num(L.min)} = ${h(L.max - L.min)}.`,
      warum: 'Eine einzige Zahl sagt, wie breit der ganze Bereich der Antworten ist.',
      acht: 'Mit show = c("min", "max", "range") zeigt describe() Min, Max und Range nebeneinander. Range ist schon die Differenz; zieh nicht noch einmal ab.',
      concept: 'subtract',
    },
    {
      title: 'Bedenken, wer die Zahl bestimmt',
      was: 'Die 198 Personen dazwischen spielen keine Rolle. Ändert sich nur der größte Wert, ändert sich die ganze Spannweite.',
      warum: 'Deshalb ist die Spannweite empfindlich für Ausreißer. Der Interquartilsabstand misst nur die mittlere Hälfte und bleibt ruhig.',
      acht: 'Mit mehr Befragten steigt die Chance auf einen extremen Wert. Spannweiten verschieden großer Gruppen lassen sich deshalb schlecht vergleichen.',
      concept: 'quantile',
    },
  ],
  regler: {
    label: 'Wie lange hat die Person mit der längsten Lernzeit gelernt?',
    min: L.max, max: 60, step: 0.1, initial: L.max,
    format: v => h(v),
    describe: v => {
      const r = rangeWithTop(v);
      return Math.abs(v - L.max) < 0.05
        ? `So ist es in den Daten: Die Spannweite beträgt ${h(r.range)}, der Interquartilsabstand ${h(r.iqr)}.`
        : `Mit ${h(v)} reicht die Spannweite von ${num(r.min)} bis ${num(r.max)} Stunden: ${h(r.range)}. Der Interquartilsabstand bleibt bei ${h(r.iqr)}, denn die mittlere Hälfte ändert sich nicht.`;
    },
  },
  ausprobieren: [
    {
      question: `Die Person mit der längsten Lernzeit hätte 40 statt ${num(L.max)} Stunden gelernt. Was passiert mit der Spannweite?`,
      options: [`wächst um ${num(40 - L.max)} Stunden`, 'bleibt gleich', 'wächst um etwa 0,1 Stunden'], correct: 0, step: 3,
      explain: `Das Maximum wandert von ${num(L.max)} auf 40 Stunden, das Minimum bleibt ${num(L.min)}. Die Spannweite wächst also um 40 − ${num(L.max)} = ${h(40 - L.max)}. Probier es mit dem Regler oben.`,
      kurz: 'Ein einziger Wert bestimmt die Spannweite.',
    },
    {
      question: 'Und was passiert dabei mit dem Interquartilsabstand?',
      options: ['bleibt gleich', `wächst auch um ${num(40 - L.max)} Stunden`], correct: 0, step: 3,
      explain: `Die mittlere Hälfte reicht weiter von ${num(L.q1)} bis ${num(L.q3)} Stunden. Der Ausreißer liegt außerhalb und zählt nicht mit.`,
      kurz: 'Die mittlere Hälfte bleibt ruhig.',
    },
    {
      question: 'Eine andere Befragung hat 2.000 statt 200 Befragte. Wird ihre Spannweite eher größer oder eher kleiner sein?',
      options: ['eher größer', 'eher kleiner', 'gleich'], correct: 0, step: 3,
      explain: 'Je mehr Menschen du befragst, desto eher ist jemand mit einem sehr kleinen oder sehr großen Wert dabei. Die Spannweite wächst deshalb im Schnitt mit der Zahl der Befragten.',
      kurz: 'Mehr Befragte, mehr Extreme.',
    },
  ],
  check: {
    question: 'Fünf Personen haben in den letzten sieben Tagen 3, 12, 5, 8 und 6 Stunden gelernt. Wie groß ist die Spannweite?',
    options: ['9 Stunden', '3 Stunden', '6 Stunden', '12 Stunden'],
    correct: 0,
    right: 'Genau. Größter Wert 12, kleinster Wert 3: 12 − 3 = 9 Stunden.',
    diagnose: {
      1: 'Fast! 6 − 3 ist der letzte minus der erste Eintrag der Liste. Gesucht sind der größte und der kleinste Wert: 12 − 3.',
      2: 'Fast! 6 ist der mittlere Wert der Reihe nach, der Median. Die Spannweite ist der größte minus der kleinste Wert.',
      3: 'Fast! 12 ist der größte Wert. Zieh noch den kleinsten ab: 12 − 3.',
    },
  },
  fuerDich: 'Liest du „Befragte zwischen 18 und 75 Jahren“, stecken darin der kleinste und der größte Wert; die Spannweite ist 75 − 18 = 57 Jahre. Wie die meisten verteilt sind, sagt sie nicht; dafür brauchst du Median und Interquartilsabstand.',
  genau: {
    kurz: 'Die Spannweite nutzt nur zwei Werte. Sie wächst im Schnitt mit der Zahl der Befragten und reagiert stark auf Ausreißer.',
    paragraphs: [
      'In R liefern w_range() und describe() die Spannweite; mit show = c("min", "max", "range") zeigt describe() dazu Min und Max. Gewichte ändern sie nicht, denn sie ändern nicht, welche Werte beobachtet wurden.',
      `Robuster sind der Interquartilsabstand, die Breite der mittleren Hälfte (Begriff „${T('quantile')}“), und die Standardabweichung, die alle Werte nutzt.`,
      'Bei geordneten Kategorien, etwa Schulabschlüssen mit den Codes 0 bis 4, lässt sich die Spannweite der Codes kaum deuten: Die Abstände zwischen den Codes sind keine Mengen.',
    ],
  },
};

/** Kleinster und größter Wert der Spalte x, ihre Spannweite und wer sie bestimmt. */
export function rangeOf(c: SampleCtx) {
  const col = column(c, 'x', 'lernzeit'), lo = Math.min(...col.values), hi = Math.max(...col.values);
  const who = (v: number) => c.rows.filter(r => r.values[col.id] === v).map(r => r.id);
  return { col, min: lo, max: hi, range: hi - lo, iqr: quantile6(col.values, 0.75) - quantile6(col.values, 0.25), atMin: who(lo), atMax: who(hi) };
}
const people = (ids: string[]) => ids.length === 1 ? ids[0] : ids.length <= 3 ? `${ids.slice(0, -1).join(', ')} und ${ids.at(-1)}` : `${ids.length} Befragte`;

export const rangeTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'lernzeit' },
    kurz: 'Dieselbe Frage mit allen 200 Befragten: Wie weit liegen der kleinste und der größte Wert auseinander?',
    value: c => rangeOf(c).range,
    result: c => {
      const r = rangeOf(c), u = r.col.u, n = c.rows.length;
      return {
        kurz: r.col.id === 'lernzeit'
          ? `Die ${n} Befragten haben in den letzten sieben Tagen zwischen ${num(r.min)} und ${num(r.max)} Stunden gelernt. Die Spannweite beträgt ${h(r.range)}.`
          : `Bei „${r.col.info.title}“ liegen die ${n} Befragten zwischen ${u(r.min)} und ${u(r.max)}. Die Spannweite beträgt ${u(r.range)}.`,
        fachlich: `Spannweite = Maximum − Minimum = ${num(r.max)} − ${num(r.min)} = ${u(r.range)} bei n = ${n}. Zum Vergleich: Der Interquartilsabstand beträgt ${u(r.iqr)}.`,
        zusatz: r.range === 0 ? 'Alle haben denselben Wert; die Spannweite ist 0.' : `Den größten Wert hat ${people(r.atMax)}, den kleinsten ${people(r.atMin)}.`,
      };
    },
    voraussetzung: 'Die Spannweite braucht Zahlen mit sinnvollen Abständen. Sie hängt nur am kleinsten und am größten Wert.',
    think: [
      {
        question: 'Eine Person lernt plötzlich 40 Stunden. Was passiert mit der Spannweite?', options: ['bleibt gleich', 'steigt', 'sinkt'], correct: 1,
        explain: `40 Stunden sind mehr als der bisher größte Wert, also wird 40 das neue Maximum. In den Ausgangsdaten wächst die Spannweite von ${num(L.max)} auf 39,1 bis 40 Stunden, je nachdem, wer es ist.`,
        kurz: 'Ein einziger Wert bestimmt die Spannweite.',
        tryIt: { label: 'die gewählte Person auf 40 Stunden', op: 'outlier', column: 'x', value: 40 },
        expect: { change: 'up' },
      },
      {
        question: 'Alle lernen eine Stunde mehr. Was passiert mit der Spannweite?', options: ['steigt um 1 Stunde', 'bleibt gleich', 'verdoppelt sich'], correct: 1,
        explain: 'Der kleinste und der größte Wert wachsen beide um eine Stunde. Ihr Abstand bleibt derselbe.',
        kurz: 'Verschieben ändert die Lage, nicht die Breite.',
        tryIt: { label: 'alle eine Stunde mehr', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'same' },
      },
      {
        question: 'Alle lernen doppelt so lange. Was passiert mit der Spannweite?', options: ['bleibt gleich', 'verdoppelt sich', 'vervierfacht sich'], correct: 1,
        explain: 'Der größte und der kleinste Wert verdoppeln sich, also auch ihr Abstand.',
        kurz: 'Doppelte Werte, doppelte Spannweite.',
        tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        expect: { change: 'factor', factor: 2 },
      },
    ],
  },
  r: {
    entry: 'range', variant: 0, live: { fn: 'describe', show: ['min', 'max', 'range'] },
    tokens: {
      describe: DESCRIBE_NOTE,
      '"min"': showNote('min', 'Minimum', '"min" steht für den kleinsten Wert. In der Ausgabe heißt die Spalte Min.'),
      '"max"': showNote('max', 'Maximum', '"max" steht für den größten Wert. In der Ausgabe heißt die Spalte Max.'),
      '"range"': showNote('range', T('range'), '"range" steht für die Spannweite, Max minus Min. In der Ausgabe heißt die Spalte Range.'),
    },
    outputMap: [
      { match: 'Min', atlas: 'kleinster Wert', step: 1, explain: 'Min ist der kleinste Wert, der erste der geordneten Reihe.' },
      { match: 'Max', atlas: 'größter Wert', step: 1, explain: 'Max ist der größte Wert, der letzte der geordneten Reihe.' },
      { match: 'Range', atlas: 'Spannweite', step: 2, explain: 'Range heißt Spannweite: Max minus Min, in der Einheit der Daten.' },
      { match: 'N', atlas: 'n', explain: 'N zählt die gültigen Werte. Die Spannweite nutzt davon nur zwei.' },
    ],
    check: {
      question: 'Welche Zahl in der Ausgabe ist die Spannweite? Tippe sie an.', correct: 'Range',
      wrong: {
        Max: 'Fast! Das ist der größte Wert. Die Spannweite ist Max minus Min und steht unter Range.',
        Min: 'Fast! Das ist der kleinste Wert. Die Spannweite steht unter Range.',
        N: 'Fast! N ist die Zahl der gültigen Werte. Die Spannweite steht unter Range.',
      },
    },
  },
  next: {
    next: { id: 'quantile', why: 'Misst nur die Breite der mittleren Hälfte und lässt die Ränder weg.' },
    before: [
      { id: 'series', why: 'Die Werte, deren kleinster und größter zählen.' },
      { id: 'sorting', why: 'Geordnet stehen Minimum und Maximum am Anfang und am Ende.' },
    ],
    after: [
      { id: 'outliers_influence', why: 'Ein einzelner extremer Wert bestimmt die Spannweite allein.' },
      { id: 'describe', why: 'Zeigt Min, Max und Range neben den anderen Kennzahlen.' },
    ],
    more: [{ id: 'sd', why: 'Misst die Streuung mit allen Werten statt nur mit zweien.' }],
  },
};
