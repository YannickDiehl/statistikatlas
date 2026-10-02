// Begriffskarte „Nominale Kategorien“ (nominal). Beispiel: Berufs- und Hochschulabschluss im Lehrdatensatz (Codes 0 bis 8).
// Vorlage: Begriffskarte (Skalenniveau, keine Rechnung). Zahlen in R nachgerechnet: b01-messen.test.ts.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { pct } from '../../format';
import { sampleColumn } from '../../sample';
import { countsByCode, labelOf, listText, mean, numR, role } from './shared';

/** Befragte je Berufsabschluss im Lehrdatensatz, Codes 0 bis 8 (R: table(berufsabschluss)). */
export const BERUF = [16, 29, 29, 22, 27, 17, 21, 22, 17] as const;
const BERUF_MITTEL = BERUF.reduce((a, k, code) => a + k * code, 0) / 200;
const L = (code: number) => labelOf('berufsabschluss', code)!;

export const nominal: ConceptCard = {
  concept: 'nominal',
  wofuer: 'Viele Merkmale in Umfragen sind Namen: Beruf, Partei, Bundesland. Im Datensatz stehen sie als Zahlen, aber mit diesen Zahlen darfst du nicht rechnen. Nominal heißt: Es gibt nur gleich oder verschieden.',
  kurz: 'Nominale Kategorien unterscheiden sich, haben aber keine Rangfolge. Ihre Zahlencodes sind nur Namen, deshalb zählst du sie, statt mit ihnen zu rechnen.',
  stellDirVor: {
    text: `Der Lehrdatensatz fragt: „Welchen Berufs- oder Hochschulabschluss haben Sie zuletzt erworben?“ ${BERUF[1]} Befragte nennen eine duale Berufsausbildung (Code 1), ${BERUF[3]} einen Meister-, Techniker- oder Fachwirtabschluss (Code 3) und ${BERUF[4]} einen Bachelor (Code 4). Die Codes 0 bis 8 sind nur Nummern für Namen. Der Mittelwert der Codes ist ${numR(BERUF_MITTEL)}, aber einen Abschluss „${numR(BERUF_MITTEL)}“ gibt es nicht.`,
    figures: [
      { label: L(1), value: String(BERUF[1]) },
      { label: L(3), value: String(BERUF[3]) },
      { label: L(4), value: String(BERUF[4]) },
      { label: 'Mittelwert der Codes', value: `${numR(BERUF_MITTEL)}, ohne Bedeutung` },
    ],
  },
  heisst: {
    fach: 'Nominale Merkmale unterscheiden Kategorien ohne Rangfolge. Sinnvoll sind nur Vergleiche auf gleich oder verschieden: Häufigkeiten, Anteile, der Modus und Kreuztabellen.',
  },
  bausteine: [
    {
      title: 'Kategorien unterscheiden',
      was: 'Jede Person fällt in genau eine Kategorie. Über zwei Personen lässt sich nur sagen: gleicher Abschluss oder verschiedener.',
      warum: 'Ein Bachelor ist nicht „mehr“ als ein Meister, sondern ein anderer Weg. Die Frage legt keine Rangfolge fest.',
      acht: 'Auch Kategorien, die nach oben und unten klingen, haben keine Reihenfolge, solange die Frage keine festlegt.',
    },
    {
      title: 'Codes als Namen lesen',
      was: 'Die Zahlen 0 bis 8 sind Etiketten für die Abschlüsse. Genauso gut könnten dort Buchstaben stehen.',
      rechnung: `Code 4 − Code 1 = 3, aber „${L(4)} minus ${L(1)}“ ist keine Menge.`,
      warum: 'Mit Codes kann ein Programm Antworten speichern und sortieren. Rechnen darfst du mit ihnen trotzdem nicht.',
      acht: 'R rechnet aus den Codes ohne Warnung einen Mittelwert aus. Ob er etwas bedeutet, musst du selbst prüfen.',
      concept: 'labels',
    },
    {
      title: 'Zählen statt rechnen',
      was: 'Du zählst, wie viele Personen in jeder Kategorie sind, und gibst Anteile an. Die häufigste Kategorie heißt Modus.',
      rechnung: `${L(1)} und ${L(2)}: je ${BERUF[1]} von 200, das sind je ${pct(BERUF[1] / 200)}.`,
      warum: 'Zählen braucht weder Abstände noch eine Reihenfolge. Es geht deshalb bei jedem Skalenniveau.',
      acht: 'Hier gibt es zwei häufigste Kategorien. Ein Modus muss nicht eindeutig sein.',
      concept: 'mode',
    },
    {
      title: 'Für Rechnungen in Dummys zerlegen',
      was: 'Willst du Kategorien in einer Regression nutzen, bekommt jede außer einer eine eigene Spalte mit 0 oder 1.',
      warum: 'So wird aus jeder Kategorie eine echte Ja-nein-Frage, mit der man rechnen darf.',
      acht: 'Gib nie die Codes 0 bis 8 als eine einzige Zahl in eine Regression. Sie würde Abstände unterstellen, die es nicht gibt.',
      concept: 'dummy',
    },
  ],
  ausprobieren: [
    {
      question: 'Du tauschst die Codes: Bachelor bekommt die 1, die duale Berufsausbildung die 4. Ändert sich, wie viele einen Bachelor haben?',
      options: ['nein', 'ja'], correct: 0, step: 2,
      explain: `Es bleiben ${BERUF[4]} Personen mit Bachelor, sie tragen nur eine andere Nummer. Der Mittelwert der Codes ändert sich dagegen. Daran siehst du, dass er nichts bedeutet.`,
      kurz: 'Umbenennen ändert keine Gruppe.',
    },
    {
      question: 'Was beschreibt den Berufsabschluss der 200 Befragten sinnvoll?',
      options: ['die häufigsten Kategorien', 'der Mittelwert der Codes', 'der Median der Codes'], correct: 0, step: 3,
      explain: 'Häufigkeiten, Anteile und der Modus brauchen keine Reihenfolge. Ein Median setzt voraus, dass man die Abschlüsse ordnen kann.',
      kurz: 'Bei Namen bleibt das Zählen.',
    },
  ],
  check: {
    question: `Eine Auswertung meldet: „Mittlerer Berufsabschluss ${numR(BERUF_MITTEL)}“. Was stimmt?`,
    options: [
      'Die Zahl bedeutet nichts, weil die Codes nur Namen sind.',
      'Die meisten haben einen Meister (Code 3) oder einen Bachelor (Code 4).',
      'Der typische Abschluss liegt zwischen Meister und Bachelor.',
      'Die Befragten sind gut ausgebildet.',
    ],
    correct: 0,
    right: 'Genau. Ein Mittelwert aus Namenscodes ist keine Aussage über die Personen.',
    diagnose: {
      1: `Fast! Der Mittelwert sagt nicht, welche Kategorie häufig ist. Am häufigsten sind hier die duale und die schulische Berufsausbildung, je ${BERUF[1]}.`,
      2: 'Fast! Zwischen zwei Kategorien gibt es nichts, und die Codes haben keine Reihenfolge.',
      3: 'Noch nicht ganz. Über die Höhe der Bildung sagt eine Zahl aus Namenscodes nichts.',
    },
  },
  fuerDich: 'Wenn in einer Tabelle Parteien, Bundesländer oder Berufe als Zahlen stehen, rechne damit keine Mittelwerte. Zähle, wie oft jede Kategorie vorkommt, und gib Anteile an.',
  genau: {
    kurz: 'Nominal heißt: nur gleich oder verschieden. Zulässig sind Häufigkeiten, Anteile, der Modus und Zusammenhangsmaße für Kategorien wie Cramér-V.',
    paragraphs: [
      'Jede eindeutige Umbenennung der Codes ist erlaubt und ändert keine zulässige Aussage. Was sich bei einer Umbenennung ändert, etwa der Mittelwert der Codes, ist deshalb keine sinnvolle Aussage über die Personen.',
      'Ein Sonderfall sind binäre Merkmale mit 0 und 1, etwa die Weiterbildung. Ihr Mittelwert ist der Anteil der Einsen und darf so gedeutet werden.',
      'Ob ein Merkmal nominal oder ordinal ist, hängt von der Frage ab. Der Schulabschluss im Lehrdatensatz hat eine Rangfolge, der Berufsabschluss bewusst nicht: Meister und Bachelor sind verschiedene Qualifikationen.',
      'Für den Zusammenhang zweier nominaler Merkmale nutzt man Kreuztabellen, den Chi-Quadrat-Test und Cramér-V.',
    ],
  },
};

function berufOf(c: SampleCtx) {
  const column = role(c, 'x', 'berufsabschluss'), counts = countsByCode(c, column), n = c.rows.length;
  const max = Math.max(...counts.map(k => k.n)), modes = counts.filter(k => k.n === max).map(k => `„${k.label}“`);
  return { counts, n, max, modes, distinct: counts.filter(k => k.n > 0).length, m: mean(sampleColumn(c.rows, column)) };
}

export const nominalTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'berufsabschluss' },
    kurz: 'Dieselbe Frage mit allen 200 Befragten: Wie verteilen sie sich auf die Berufsabschlüsse, und was lässt sich darüber sagen?',
    result: c => {
      const { counts, n, max, modes, distinct, m } = berufOf(c);
      return {
        kurz: `Am häufigsten nennen die ${n} Befragten ${listText(modes)} (${modes.length > 1 ? 'je ' : ''}${max} von ${n}). Einen mittleren Berufsabschluss gibt es nicht: Die Codes sind nur Namen.`,
        fachlich: `Nominales Merkmal mit ${distinct} besetzten Kategorien; Modus: ${listText(modes)}. Der Mittelwert der Codes (${numR(m)}) ist nicht interpretierbar.`,
        zusatz: `${counts[4].n} Befragte haben einen Bachelor, ${counts[3].n} einen Meister-, Techniker- oder Fachwirtabschluss. Welcher Abschluss höher ist, legt die Frage nicht fest.`,
      };
    },
    voraussetzung: 'Jede Person fällt in genau eine Kategorie; „Anderer Abschluss“ fängt alle übrigen auf.',
    think: [
      {
        question: 'Die Codes werden umgedreht: 0 wird 8, 1 wird 7 und so weiter. Was passiert mit der Zahl der Befragten in der größten Gruppe?',
        options: ['bleibt gleich', 'wird größer', 'wird kleiner'], correct: 0,
        explain: `Die Gruppen bleiben dieselben, sie tragen nur andere Nummern. In den Ausgangsdaten springt dabei nur der Mittelwert der Codes, von ${numR(BERUF_MITTEL)} auf ${numR(8 - BERUF_MITTEL)}.`,
        kurz: 'Umbenennen ändert keine Gruppe.',
        tryIt: { label: 'die Codes umdrehen (0 wird 8, 8 wird 0)', op: 'reverse', column: 'x' },
        expect: { change: 'same', measure: c => berufOf(c).max },
      },
      {
        question: 'Angenommen, alle hätten eine duale Berufsausbildung (Code 1). Wie viele Kategorien kommen dann noch vor?',
        options: ['1', '9', '0'], correct: 0,
        explain: 'Alle fallen in dieselbe Kategorie. Es gibt nichts mehr zu unterscheiden, nur noch eine Gruppe mit allen 200.',
        kurz: 'Ohne Unterschiede bleibt eine einzige Kategorie.',
        tryIt: { label: 'alle auf Duale Berufsausbildung (Code 1)', op: 'constant', column: 'x', value: 1 },
        expect: { change: 'equals', value: 1, measure: c => berufOf(c).distinct },
      },
    ],
  },
  r: {
    entry: 'conversion', variant: 0,
    outputMap: [
      { match: 'Ja', atlas: 'Kategorie „Ja“ (Code 1)', step: 2, explain: 'to_label() zeigt statt der Codes 0 und 1 ihre Namen. Gezählt wird danach wie vorher.' },
      { match: 'Cum. %', atlas: 'kumulierte Prozent', step: 1, explain: 'Aufaddieren setzt eine Reihenfolge voraus. Bei nominalen Kategorien ist sie willkürlich, die Spalte sagt hier nichts.' },
      { match: 'N', atlas: 'alle Befragten n', step: 3, explain: 'Alle 200 Befragten haben eine gültige Angabe und fallen in genau eine Kategorie.' },
    ],
    check: {
      question: 'Welche Zahl ergibt bei nominalen Kategorien keinen Sinn? Tippe sie an.', correct: 'Cum. %',
      wrong: {
        Ja: 'Fast! Das ist der Name einer Kategorie. Namen sind bei nominalen Merkmalen genau richtig.',
        N: 'Fast! Die Zahl der Befragten ist immer sinnvoll. Keinen Sinn ergibt das Aufaddieren in einer willkürlichen Reihenfolge.',
      },
    },
  },
  next: {
    next: { id: 'frequency', why: 'Zählt, wie oft jede Kategorie vorkommt: die wichtigste Auswertung für nominale Merkmale.' },
    before: [{ id: 'series', why: 'Auch Kategorien stehen als Datenreihe in einer Spalte, als ein Code je Person.' }],
    after: [
      { id: 'ordinal', why: 'Die nächste Stufe: Kategorien mit einer Reihenfolge.' },
      { id: 'crosstab', why: 'Zählt zwei Kategorien derselben Person gemeinsam.' },
      { id: 'dummy', why: 'Zerlegt Kategorien in Ja-nein-Spalten, mit denen eine Regression rechnen kann.' },
    ],
    more: [
      { id: 'mode', why: 'Die häufigste Kategorie, der Lagewert für nominale Merkmale.' },
      { id: 'cramers_v', why: 'Misst, wie stark zwei Merkmale mit Kategorien zusammenhängen.' },
    ],
  },
};
