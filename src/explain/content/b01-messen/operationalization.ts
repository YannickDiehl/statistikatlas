// Begriffskarte „Operationalisierung“ (operationalization). Beispiel: Wie aus „Wie viel lernen Menschen?“ die Spalte
// lernzeit des Lehrdatensatzes wird. Vorlage: Begriffskarte (eine Idee, keine Rechnung). Zahlen in R: b01-messen.test.ts.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { columnById } from '../../../domain/survey';
import { num } from '../../format';
import { sampleColumn, sampleColumnInfo, unitText } from '../../sample';
import { FUENF, mean, role } from './shared';

const LZ = columnById.lernzeit;
/** Mittelwert der Lernzeit aller 200 (R: 7.7515) und der Zusammenhang von Methoden-Zuversicht und Wissenstest (R: 0.0211). */
export const OP = { mittel: 7.7515, rMethodenWissen: 0.0211 } as const;

export const operationalization: ConceptCard = {
  concept: 'operationalization',
  wofuer: '„Lernaufwand“ kann man nicht direkt ablesen. Bevor im Datensatz eine Zahl steht, muss jemand entscheiden: Was genau fragen wir, über welchen Zeitraum, in welcher Einheit? Diese Übersetzung heißt Operationalisierung.',
  kurz: 'Operationalisieren heißt, einen Begriff in eine genaue Frage und eine Antwortregel zu übersetzen. Erst diese Regeln legen fest, was eine Zahl im Datensatz bedeutet.',
  stellDirVor: {
    text: `Der Begriff heißt „Lernaufwand“: Wie viel lernen Menschen? Im Lehrdatensatz wird daraus die Frage: „${LZ.question}“ Die Antwortregel: Stunden mit einer Nachkommastelle, von ${LZ.min} bis ${LZ.max}. So wird aus dem Lernen von ${FUENF[1].id} die Zahl ${num(FUENF[1].lernzeit)}.`,
    figures: [
      { label: 'Begriff', value: 'Lernaufwand' },
      { label: 'Zeitraum', value: 'letzte sieben Tage' },
      { label: 'Einheit', value: 'Stunden' },
      { label: `Messwert ${FUENF[1].id}`, value: `${num(FUENF[1].lernzeit)} h` },
    ],
  },
  heisst: {
    sym: 'Konstrukt → Frage → Antwortregel → Messwert', say: 'Konstrukt, Frage, Antwortregel, Messwert',
    fach: 'Operationalisierung übersetzt ein theoretisches Konstrukt in Beobachtungs- und Auswertungsregeln: Wortlaut, Bezugszeitraum, Antwortformat, Einheit, Kodierung und gegebenenfalls Regeln für einen Skalenwert.',
  },
  bausteine: [
    {
      title: 'Den Begriff klären',
      was: 'Was soll gemessen werden? Lernaufwand kann Zeit heißen, aber auch Mühe oder Regelmäßigkeit.',
      warum: 'Erst wenn klar ist, was gemeint ist, lässt sich eine passende Frage finden.',
      acht: 'Ein Begriff hat oft mehrere Seiten. Eine einzige Frage erfasst meist nur eine davon.',
      concept: 'dimensionality',
    },
    {
      title: 'Eine Frage formulieren',
      was: 'Wortlaut und Zeitraum werden genau festgelegt: „in den letzten sieben Tagen“ und „selbstständig gelernt“.',
      warum: 'Jedes Wort zieht eine Grenze. „Selbstständig“ schließt Kursstunden aus, „sieben Tage“ meint diese Woche und keine typische.',
      acht: 'Kleine Wörter ändern viel: „normalerweise pro Woche“ misst etwas anderes als „in den letzten sieben Tagen“.',
    },
    {
      title: 'Eine Antwortregel festlegen',
      was: `Die Antwort kommt in Stunden mit einer Nachkommastelle, erlaubt sind ${LZ.min} bis ${LZ.max}. Für eine fehlende Antwort legt die Regel einen eigenen Code fest, etwa −9.`,
      rechnung: `${FUENF[1].id} → ${num(FUENF[1].lernzeit)}; P100 → 0`,
      warum: 'Nur mit einer festen Regel bedeuten gleiche Zahlen bei allen Personen dasselbe.',
      acht: '0 Stunden ist eine echte Antwort. Eine fehlende Antwort braucht einen anderen Code, sonst rechnet sie als 0 mit.',
      concept: 'missing',
    },
    {
      title: 'Die Messregel aufschreiben',
      was: 'Wortlaut, Zeitraum, Einheit und Codes kommen ins Codebuch und ins Variablenlabel. So kann jede und jeder nachlesen, was die Zahl bedeutet.',
      warum: 'Wer die Daten später auswertet, war bei der Befragung nicht dabei. Ohne diese Angaben müsste sie raten.',
      acht: 'Ein Spaltenname wie lernzeit verrät nicht den Zeitraum. Erst das Label mit dem Fragetext tut das.',
      concept: 'codebook',
    },
  ],
  ausprobieren: [
    {
      question: 'Statt „in den letzten sieben Tagen“ fragst du „in den letzten 14 Tagen“. Alle lernen gleichmäßig weiter. Was passiert mit dem Mittelwert?',
      options: ['er verdoppelt sich ungefähr', 'er bleibt gleich'], correct: 0, step: 2,
      explain: `Doppelter Zeitraum, doppelte Stunden: Aus ${num(OP.mittel)} würden etwa ${num(OP.mittel * 2, 1)} Stunden. Die Zahl hängt an der Messregel, nicht nur am Lernen.`,
      kurz: 'Andere Messregel, andere Zahl.',
    },
    {
      question: 'Die Methoden-Zuversicht wird mit fünf Selbstauskünften gemessen, etwa „Ich kann passende Variablen auswählen.“ Misst das, wie gut jemand Methoden beherrscht?',
      options: ['nein, es misst, wie sicher sich jemand fühlt', 'ja, das ist dasselbe'], correct: 0, step: 1,
      explain: `Die Fragen erfassen Zutrauen, nicht Können. Ob beides zusammenhängt, müsste man erst prüfen. Im Lehrdatensatz hängt die Methoden-Zuversicht kaum mit dem Wissenstest zusammen: r ≈ ${num(OP.rMethodenWissen)}.`,
      kurz: 'Eine Frage misst, wonach sie fragt.',
    },
  ],
  check: {
    question: 'Welche Angabe gehört zur Operationalisierung der Lernzeit?',
    options: [
      'der Zeitraum „in den letzten sieben Tagen“',
      `der Mittelwert von ${num(OP.mittel)} Stunden`,
      'die Zahl der Befragten',
      'der Zusammenhang mit dem Wissenstest',
    ],
    correct: 0,
    right: 'Genau. Der Zeitraum ist Teil der Messregel: Er legt fest, was die Zahl bedeutet.',
    diagnose: {
      1: 'Fast! Das ist ein Ergebnis der Messung, keine Regel dafür.',
      2: 'Noch nicht ganz. Wie viele befragt werden, gehört zur Stichprobe, nicht zur Messregel.',
      3: 'Fast! Das ist ein Befund über die Messung. Er hilft bei der Frage, ob sie gültig ist, ist aber keine Messregel.',
    },
  },
  fuerDich: 'Wenn du eine Zahl aus einer Umfrage liest, such den genauen Fragetext. Erst er sagt dir, was die Zahl bedeutet und womit du sie vergleichen darfst.',
  genau: {
    kurz: 'Operationalisierung legt fest, wie ein Konstrukt beobachtet und in Zahlen übersetzt wird. Sie ist eine Entscheidung mit Folgen für die Validität.',
    paragraphs: [
      'Zur Dokumentation gehören der genaue Wortlaut, der Bezugszeitraum, die Antwortvorgaben, die Einheit, die Kodierung samt Missing-Codes und die Regeln zur Bildung eines Skalenwerts (GESIS-Leitfaden von Schmidt und Lechner, 2020).',
      'Dasselbe Konstrukt lässt sich verschieden operationalisieren, etwa die Lernzeit als Selbstauskunft oder als Protokoll. Verschiedene Operationalisierungen können verschiedene Ergebnisse liefern.',
      'Die fünf Methodenfragen des Lehrdatensatzes sind ein synthetisches Lehrbeispiel. Ob ihre Zahlenabstände gleich groß sind und ob ein gemeinsamer Wert sinnvoll ist, muss begründet werden.',
    ],
  },
};

function lernzeitOf(c: SampleCtx) {
  const column = role(c, 'x', 'lernzeit'), values = sampleColumn(c.rows, column), info = sampleColumnInfo(column);
  return { values, info, m: mean(values), lo: Math.min(...values), hi: Math.max(...values), u: (v: number) => unitText(info, v) };
}

export const operationalizationTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'lernzeit' },
    kurz: 'Dieselbe Messregel bei allen 200 Befragten: eine Frage, eine Einheit, ein Zeitraum, und daraus eine Zahl je Person.',
    value: c => lernzeitOf(c).m,
    result: c => {
      const { values, info, m, lo, hi, u } = lernzeitOf(c);
      return {
        kurz: `Gefragt war: „${info.question}“ Im Schnitt antworten die ${values.length} Befragten mit ${u(m)}.`,
        fachlich: `Messregel: Stunden mit einer Nachkommastelle, erlaubt ${LZ.min} bis ${LZ.max}; beobachtet ${u(lo)} bis ${u(hi)}, Mittelwert x̄ ≈ ${u(m)}.`,
        zusatz: `Für ${c.rows[1].id} steht ${u(values[1])} in der Spalte. Was diese Zahl bedeutet, sagt nur die Frage.`,
      };
    },
    voraussetzung: 'Die Zahl gilt für diese Frage. Mit anderem Wortlaut oder Zeitraum misst du etwas anderes.',
    think: [
      {
        question: 'Die Frage lautet jetzt „in den letzten 14 Tagen“, und alle lernen gleichmäßig weiter. Was passiert mit dem Mittelwert?',
        options: ['bleibt gleich', 'verdoppelt sich', 'steigt um 7'], correct: 1,
        explain: 'Jede Angabe deckt doppelt so viele Tage ab und verdoppelt sich, mit ihr der Mittelwert. Gelernt wird nicht mehr, nur anders gemessen.',
        kurz: 'Ein anderer Zeitraum ändert die Zahl, nicht das Lernen.',
        tryIt: { label: 'alle Angaben für 14 statt 7 Tage', op: 'double', column: 'x', value: 2 },
        expect: { change: 'factor', factor: 2 },
      },
      {
        question: 'Die Frage zählt jetzt auch eine Kursstunde mit, die alle besucht haben. Was passiert mit dem Mittelwert?',
        options: ['steigt um 1 Stunde', 'bleibt gleich', 'verdoppelt sich'], correct: 0,
        explain: 'Jede Angabe wächst um die Kursstunde, also auch der Mittelwert um genau 1 Stunde. Das Wort „selbstständig“ hatte diese Stunde vorher ausgeschlossen.',
        kurz: 'Ein Wort mehr oder weniger in der Frage verschiebt alle Antworten.',
        tryIt: { label: 'alle eine Stunde mehr', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'plus', amount: 1 },
      },
    ],
  },
  r: {
    entry: 'codebook', variant: 1,
    outputMap: [
      { match: 'Wie viele Stunden', atlas: 'Fragetext im Variablenlabel', step: 2, explain: 'Das Label hält den Wortlaut der Frage fest. Erst er sagt, was in der Spalte gemessen wurde.' },
      { match: 'lernzeit', atlas: 'Name der Spalte', step: 4, explain: 'Der Name ist kurz und gut zum Tippen. Den Zeitraum und die Einheit verrät er nicht.' },
      { match: 'col', atlas: 'Nummer der Spalte', step: 4, explain: 'lernzeit ist die zehnte Spalte des Datensatzes. Für die Bedeutung spielt das keine Rolle.' },
    ],
    check: {
      question: 'Wo steht, was genau gefragt wurde? Tippe es an.', correct: 'Wie viele Stunden',
      wrong: {
        lernzeit: 'Fast! Das ist nur der Name der Spalte. Was gefragt wurde, steht im Label daneben.',
        col: 'Fast! Das ist die Nummer der Spalte im Datensatz. Der Wortlaut der Frage steht im Label.',
      },
    },
  },
  next: {
    next: { id: 'validity', why: 'Misst die Frage wirklich, was sie messen soll? Das prüft die Validität.' },
    before: [{ id: 'series', why: 'Am Ende jeder Messregel steht eine Datenreihe: ein Wert je Person.' }],
    after: [
      { id: 'measurement_error', why: 'Auch eine gute Messregel misst nie ganz genau.' },
      { id: 'metric', why: 'Die Antwortregel entscheidet, ob Abstände etwas bedeuten.' },
      { id: 'item_score', why: 'Die Regel, nach der mehrere Fragen zu einem Wert je Person werden.' },
    ],
    more: [{ id: 'codebook', why: 'Hält Wortlaut, Codes und Labels jeder Spalte fest.' }],
  },
};
