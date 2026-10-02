// Begriffskarte „Messfehler“ (measurement_error). Beispiel: Wissenstest zu zwei Zeitpunkten (Paralleltest) und ein
// Gedankenexperiment mit zufälligen Fehlern in den Lernzeiten (Regler, klassisches Messmodell X = T + E).
// Vorlage: Begriffskarte mit Regler; die Formel ist eine Idee zum Verstehen, keine Rechnung zum Nachrechnen.
// Zahlen in R nachgerechnet: b01-messen.test.ts.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { num, pct, unit } from '../../format';
import { sampleColumn, sampleColumnInfo, unitText } from '../../sample';
import { relate } from '../../math';
import { role } from './shared';

/**
 * Varianz der Lernzeit (R: var(lernzeit) = 10.4815), r mit dem Wissenstest (0.5392), r der Wissenstests zu zwei Zeitpunkten
 * (0.8413) und ihre Mittelwerte (10.125, 10.875).
 */
export const MF = { varT: 10.48150, r: 0.5391689, rRetest: 0.8413497, wissenT1: 10.125, wissenT2: 10.875 } as const;

/** Klassisches Messmodell: Fehler mit Standardabweichung `sigma` auf wahre Werte mit Varianz `varT`; r des fehlerfreien Paars `r`. */
export function attenuation(sigma: number, varT: number = MF.varT, r: number = MF.r) {
  const varX = varT + sigma * sigma, rel = varT / varX;
  return { varX, rel, r: r * Math.sqrt(rel) };
}

const at2 = attenuation(2), at3 = attenuation(3);

export const measurementError: ConceptCard = {
  concept: 'measurement_error',
  picture: 'b01-messfehler',
  wofuer: 'Keine Messung ist perfekt. Wer seine Lernzeit der letzten sieben Tage schätzt, rundet, vergisst einen Abend oder zählt etwas doppelt. Messfehler machen einzelne Werte ungenau, und sie verändern, was du in den Daten siehst.',
  kurz: 'Ein Messwert besteht aus dem wahren Wert und einem Fehler. Zufällige Fehler machen Zusammenhänge schwächer, systematische Fehler verschieben die Werte in eine Richtung.',
  stellDirVor: {
    text: `Dieselben 200 Personen haben den Wissenstest ein zweites Mal gemacht, mit einer zweiten Form desselben Tests. Wer beim ersten Mal viele Aufgaben löste, löste auch beim zweiten Mal eher viele: r ≈ ${num(MF.rRetest)}. Gleich sind die Ergebnisse aber nicht. Ein Teil des Unterschieds ist Messfehler: Tagesform, Raten, Glück bei einzelnen Aufgaben.`,
    figures: [
      { label: 'r Zeitpunkt 1 und 2', value: num(MF.rRetest) },
      { label: 'Lernzeit, Varianz s²', value: `${num(MF.varT)} h²` },
      { label: 'r Lernzeit und Wissenstest', value: num(MF.r) },
    ],
  },
  regler: {
    label: 'Wie stark schwanken die Lernzeiten zufällig um ihren wahren Wert?', min: 0, max: 6, step: 0.5, initial: 2,
    format: v => `Fehler mit s = ${unit(v, 'Stunde', 'Stunden')}`,
    describe: v => {
      if (v < 0.001) return `Ohne Messfehler ist die ganze Streuung von ${num(MF.varT)} h² echt. Die Lernzeit hängt dann mit r ≈ ${num(MF.r)} mit dem Wissenstest zusammen.`;
      const a = attenuation(v);
      return `Schwankt jede Angabe zufällig mit s = ${num(v)} h um ihren wahren Wert, wächst die Streuung auf ${num(a.varX)} h². Nur ${pct(a.rel, 0)} davon sind echt, und r mit dem Wissenstest sinkt nach dem Messmodell von ${num(MF.r)} auf etwa ${num(a.r)}.`;
    },
  },
  heisst: {
    sym: 'X = T + E', say: 'X gleich T plus E',
    fach: 'Im klassischen Messmodell ist der beobachtete Wert X die Summe aus dem wahren Wert T und dem Messfehler E. E ist im Mittel 0 und hängt nicht mit T zusammen; dann gilt Var(X) = Var(T) + Var(E). Systematische Fehler verschieben die Messung dagegen in eine Richtung.',
  },
  bausteine: [
    {
      title: 'Zufällige Fehler erkennen',
      was: 'Mal rundet jemand auf, mal vergisst er einen Abend. Solche Fehler gehen mal nach oben, mal nach unten.',
      warum: 'Zufällige Fehler gleichen sich im Mittel aus. Sie machen einzelne Werte ungenau, verschieben aber nicht den Mittelwert.',
      acht: 'Sie schwächen Zusammenhänge ab: r rückt näher an 0, als es ohne Fehler wäre.',
      concept: 'reliability',
    },
    {
      title: 'Systematische Fehler erkennen',
      was: 'Geben alle ihre Lernzeit eine Stunde zu hoch an, liegt der Fehler immer auf derselben Seite.',
      warum: 'Systematische Fehler gleichen sich nicht aus. Sie verschieben den Mittelwert um genau diesen Betrag.',
      acht: 'Mehr Befragte helfen dagegen nicht. Bei 2.000 Personen ist der Fehler genauso groß wie bei 200.',
      concept: 'sampling_bias',
    },
    {
      title: 'Die Streuung zerlegen',
      was: 'Die Streuung der Antworten besteht aus echter Streuung und Fehlerstreuung. Beide zählen sich zusammen.',
      rechnung: `Var(X) = ${num(MF.varT)} h² + 4 h² = ${num(at2.varX)} h². Echt sind ${num(MF.varT)} / ${num(at2.varX)} ≈ ${num(at2.rel)} davon.`,
      warum: 'Der echte Anteil heißt Reliabilität. Je kleiner er ist, desto stärker wird ein Zusammenhang abgeschwächt.',
      acht: 'Das ist ein Gedankenexperiment: Wir tun so, als wären die 200 Lernzeiten die wahren Werte, und legen Fehler mit s = 2 h darüber.',
      concept: 'variance',
    },
  ],
  ausprobieren: [
    {
      question: 'Alle geben ihre Lernzeit eine Stunde zu hoch an. Was passiert mit dem Zusammenhang zum Wissenstest?',
      options: ['er bleibt gleich', 'er wird schwächer'], correct: 0, step: 2,
      explain: `Alle rücken um dieselbe Stunde. Wer vorher mehr lernte als andere, tut es auch jetzt. r bleibt ${num(MF.r)}, nur der Mittelwert steigt um 1 Stunde.`,
      kurz: 'Ein Fehler, der alle gleich trifft, verschiebt nur die Lage.',
    },
    {
      question: 'Der zufällige Fehler in den Lernzeiten wird größer. Was passiert mit dem Zusammenhang zum Wissenstest?',
      options: ['er wird schwächer', 'er bleibt gleich', 'er wird stärker'], correct: 0, step: 3,
      explain: `Der Fehler bringt Streuung hinein, die mit dem Wissenstest nichts zu tun hat. Bei einem Fehler mit s = 3 h sinkt r nach dem Messmodell auf etwa ${num(at3.r, 1)}. Schieb den Regler und schau zu.`,
      kurz: 'Zufälliges Rauschen verdünnt jeden Zusammenhang.',
    },
    {
      question: 'Hilft es gegen einen systematischen Fehler, 2.000 statt 200 Personen zu befragen?',
      options: ['nein', 'ja'], correct: 0, step: 2,
      explain: 'Nein. Mehr Personen machen die zufälligen Schwankungen der Stichprobe kleiner. Ein Fehler, der alle in dieselbe Richtung zieht, bleibt.',
      kurz: 'Gegen einseitige Fehler hilft keine größere Stichprobe.',
    },
  ],
  check: {
    question: 'In einer Umfrage geben viele Befragte an, gewählt zu haben, obwohl sie es nicht taten. Was für ein Fehler ist das?',
    options: [
      'ein systematischer Messfehler',
      'ein zufälliger Messfehler',
      'gar kein Fehler, wenn genug Personen antworten',
      'ein Rechenfehler bei der Auswertung',
    ],
    correct: 0,
    right: 'Genau. Der Fehler geht immer in dieselbe Richtung: Die Wahlbeteiligung wird zu hoch gemessen.',
    diagnose: {
      1: 'Fast! Zufällige Fehler gehen mal nach oben, mal nach unten. Hier geht der Fehler nur in eine Richtung.',
      2: 'Fast! Mehr Befragte helfen nur gegen zufällige Schwankungen, nicht gegen einen Fehler in eine Richtung.',
      3: 'Noch nicht ganz. Der Fehler entsteht schon bei der Antwort, nicht beim Rechnen.',
    },
  },
  fuerDich: 'Frag bei einem schwachen Zusammenhang auch: Wie genau wurde gemessen? Und frag bei einem auffälligen Mittelwert: Gibt es einen Grund, warum viele in dieselbe Richtung falsch antworten?',
  genau: {
    kurz: 'Zufälliger Messfehler senkt die Reliabilität und schwächt Korrelationen ab. Systematischer Fehler verzerrt Mittelwerte und kann im wahren Wert T stecken.',
    paragraphs: [
      `Im Schnitt lösen die 200 beim zweiten Mal ${num(MF.wissenT2 - MF.wissenT1)} Aufgaben mehr (${num(MF.wissenT1)} gegen ${num(MF.wissenT2)}). r ≈ ${num(MF.rRetest)} sagt nur, dass die Reihenfolge der Personen weitgehend erhalten bleibt.`,
      'Im klassischen Modell ist T der Erwartungswert einer Person über gedachte Wiederholungen derselben Messung; E hat den Erwartungswert 0. Die Zerlegung Var(X) = Var(T) + Var(E) setzt voraus, dass T und E nicht zusammenhängen.',
      'Reliabilität ist der Anteil Var(T) / Var(X). Sind beide Merkmale mit unabhängigen Fehlern gemessen, gilt für die beobachtete Korrelation r(X, Y) = r(T_X, T_Y) · √(Rel_X · Rel_Y). Der Regler rechnet so, mit einem fehlerfreien Wissenstest.',
      'Der wahre Wert garantiert nicht, dass das gemeinte Konstrukt getroffen wird. Gleichbleibende Verzerrungen, etwa geschöntes Antworten, stecken im wahren Wert T und fallen erst bei der Frage nach der Validität auf.',
      'Für systematische Fehler oder mehrere fehlerbehaftete erklärende Variablen gibt es keine allgemeine Abschwächungsregel. Mehr Befragte verringern die Stichprobenunsicherheit, beseitigen aber keine Fehler des Messverfahrens.',
    ],
  },
};

function fehlerOf(c: SampleCtx) {
  const x = role(c, 'x', 'lernzeit'), y = role(c, 'y', 'wissenstest');
  const xs = sampleColumn(c.rows, x), rel = relate(xs, sampleColumn(c.rows, y)), r = rel.r, v = rel.x.variance;
  return { xs, m: rel.x.mean, v, r, info: sampleColumnInfo(x), att: r === null ? null : attenuation(2, v, r) };
}

export const measurementErrorTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'lernzeit', y: 'wissenstest' },
    kurz: 'Dieselbe Frage mit allen 200 Befragten: Wie sähe der Zusammenhang von Lernzeit und Wissenstest aus, wenn die Lernzeiten Messfehler hätten?',
    value: c => fehlerOf(c).r,
    result: c => {
      const { xs, m, v, r, info, att } = fehlerOf(c), u = (w: number) => unitText(info, w);
      if (r === null || att === null) return {
        kurz: 'Eine der beiden Spalten streut nicht. Dann gibt es keinen Zusammenhang zu messen, und auch kein Messfehler kann ihn abschwächen.',
        fachlich: 'Pearson-r ist nicht definiert, wenn eine Varianz 0 ist.',
      };
      const direction = Math.abs(r) < 0.005 ? 'Lernzeit und Wissenstest hängen nicht geradlinig zusammen'
        : r > 0 ? 'Wer mehr lernt, löst im Wissenstest eher mehr Aufgaben' : 'Wer mehr lernt, löst im Wissenstest eher weniger Aufgaben';
      return {
        kurz: `${direction}: r ≈ ${num(r)}. Hätten die Lernzeiten zufällige Messfehler mit s = 2 h, läge r nach dem Messmodell nur bei etwa ${num(att.r)}.`,
        fachlich: `Pearson-r = ${num(r)} bei n = ${xs.length}; Varianz der Lernzeit ${num(v)} h². Mit einer Fehlervarianz von 4 h² sänke die Reliabilität auf ${num(att.rel)}.`,
        zusatz: `Ein systematischer Fehler von +1 Stunde bei allen ließe r unverändert und höbe den Mittelwert von ${u(m)} auf ${u(m + 1)}.`,
      };
    },
    voraussetzung: 'Das Messmodell nimmt an, dass zufällige Fehler im Mittel 0 sind und nichts mit dem wahren Wert zu tun haben.',
    think: [
      {
        question: 'Alle geben eine Stunde zu viel an. Was passiert mit r?',
        options: ['bleibt gleich', 'wird schwächer', 'wird stärker'], correct: 0,
        explain: 'Der Fehler trifft alle gleich. Wer vorher mehr lernte als andere, tut es auch jetzt, und r bleibt gleich.',
        kurz: 'Ein gleicher Fehler bei allen ändert keinen Zusammenhang.',
        tryIt: { label: 'alle eine Stunde zu viel', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'same' },
      },
      {
        question: 'Und was passiert dabei mit dem Mittelwert der Lernzeit?',
        options: ['steigt um 1 Stunde', 'bleibt gleich'], correct: 0,
        explain: 'Jede Angabe ist um eine Stunde zu hoch, also auch ihr Mittelwert. Genau so verzerrt ein systematischer Fehler.',
        kurz: 'Systematische Fehler verschieben den Mittelwert.',
        tryIt: { label: 'alle eine Stunde zu viel', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'plus', amount: 1, measure: c => fehlerOf(c).m },
      },
      {
        question: 'Die gewählte Person vertippt sich und trägt 40 statt ihrer Lernzeit ein. Was passiert mit r?',
        options: ['bleibt fast gleich', 'wird schwächer, je nach ihrem Wissenstest kaum oder deutlich', 'wird stärker'], correct: 1,
        explain: 'Der Tippfehler ist ein einzelner, großer Messfehler. Er zieht den Wert weit weg von dem, was zum Wissenstest passt, und r sinkt.',
        kurz: 'Ein grober Tippfehler kann einen Zusammenhang spürbar verwässern.',
        tryIt: { label: 'die gewählte Person auf 40 Stunden', op: 'outlier', column: 'x', value: 40 },
        expect: { change: 'weaker' },
      },
    ],
  },
  r: {
    entry: 'reliability', variant: 0,
    outputMap: [
      { match: '0.898', atlas: 'Reliabilität (Cronbach-Alpha)', step: 3, explain: 'Alpha schätzt, welcher Anteil der Streuung im Summenwert der fünf Fragen echt ist: hier etwa 90 %. Der Rest gilt als zufälliger Messfehler.' },
      { match: 'Corrected', atlas: 'Trennschärfe einer Frage', step: 1, explain: 'Wie eng die erste Frage mit der Summe der anderen zusammenhängt. Je kleiner, desto weniger teilt sie mit den anderen: eigenes Rauschen oder ein anderer Inhalt.' },
      { match: 'N (listwise)', atlas: 'Fallzahl n', explain: 'Gerechnet wird mit den 200 Befragten, die alle fünf Fragen beantwortet haben.' },
    ],
    check: {
      question: 'Welche Zahl schätzt, wie viel der Streuung echt und wie viel Messfehler ist? Tippe sie an.', correct: '0.898',
      wrong: {
        Corrected: 'Fast! Das betrifft eine einzelne Frage. Für den Summenwert aller fünf steht die Schätzung bei Cronbach\'s Alpha.',
        'N (listwise)': 'Fast! Das zählt die Befragten. Den echten Anteil der Streuung schätzt Cronbach\'s Alpha.',
      },
    },
  },
  next: {
    next: { id: 'reliability', why: 'Schätzt, welcher Anteil der Streuung echt ist, etwa mit Cronbach-Alpha.' },
    before: [
      { id: 'operationalization', why: 'Die Messregel, deren Ergebnis Fehler enthalten kann.' },
      { id: 'variance', why: 'Die Streuung, die das Messmodell in echt und Fehler zerlegt.' },
    ],
    after: [
      { id: 'validity', why: 'Misst die Frage das Richtige? Gleichbleibende Verzerrungen fallen erst hier auf.' },
      { id: 'pearson', why: 'Zufällige Messfehler machen r kleiner, als es ohne sie wäre.' },
    ],
    more: [{ id: 'sampling_bias', why: 'Verzerrung durch die Auswahl der Befragten: eine andere Fehlerquelle als die Messung.' }],
  },
};
