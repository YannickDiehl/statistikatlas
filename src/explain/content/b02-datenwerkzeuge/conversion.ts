// Werkzeug „Datentypen umwandeln“: P001 bis P005 mit erwerbstaetig als gelabelte Zahl (wie read_spss() sie liefert),
// umgewandelt mit to_numeric(), to_label(), to_character() aus mariposa 0.7.4 und, als Falle, as.numeric() auf den
// Faktor. In R nachgerechnet, siehe ./b02-datenwerkzeuge.test.ts.
import type { ConceptTabs, SampleCtx, TableTool } from '../../types';
import { close, num, pct } from '../../format';
import { mean } from '../../../tasks/kit/means';
import { FUENF, JA_NEIN, spalte } from './daten';

type Form = { typ: string; wert: (code: number) => number | string };
/** So zeigt R die Spalte nach der Umwandlung: Typ unter dem Namen und der Wert je Person. */
const FORMEN: Record<string, Form> = {
  zahl: { typ: '<dbl>', wert: code => code },
  faktor: { typ: '<fct>', wert: code => JA_NEIN[code] },
  text: { typ: '<chr>', wert: code => JA_NEIN[code] },
  // Ein Faktor zählt seine Antworttexte (Stufen) intern ab 1 durch: Nein ist Nummer 1, Ja Nummer 2.
  stufen: { typ: '<dbl>', wert: code => code + 1 },
};

const codes = FUENF.map(r => r.erwerbstaetig);
/** Mittelwert der Codes (0,8) und der Stufennummern (1,8) bei den fünf Personen. */
export const CONVERSION_MITTEL = { codes: mean(codes), stufen: mean(codes.map(c => c + 1)) };

const START = ['library(dplyr)', 'library(mariposa)', '', 'atlas <- read_spss("Statistikatlas-200-Befragte.sav")', ''];
const AUFRUF: Record<string, string[]> = {
  zahl: ['atlas <- atlas %>%', '  to_numeric(erwerbstaetig)'],
  faktor: ['atlas <- atlas %>%', '  to_label(erwerbstaetig)'],
  text: ['atlas <- atlas %>%', '  to_character(erwerbstaetig)'],
  stufen: ['# So nicht: as.numeric() liefert die internen Nummern 1 und 2, nicht die Codes 0 und 1', 'atlas <- atlas %>%', '  to_label(erwerbstaetig) %>%', '  mutate(erwerbstaetig = as.numeric(erwerbstaetig))'],
};

export const conversion: TableTool = {
  concept: 'conversion',
  wofuer: 'In R kann dieselbe Antwort verschieden gespeichert sein: als Zahl 1, als Zahl mit Label 1 [Ja], als Faktor Ja oder als Text Ja. Ein Faktor ist die Form, in der R Kategorien speichert: feste Antworttexte in fester Reihenfolge. Was R damit tun kann, hängt von dieser Form ab, etwa ob es einen Mittelwert rechnet.',
  kurz: 'Datentypen umwandeln heißt: dieselbe Antwort in eine andere Form bringen, etwa von der Zahl 1 zum Text Ja. Mit Zahlen rechnet R, Antworttexte zählt es nur.',
  mut: 'Du rechnest nichts aus. Du entscheidest nur, in welcher Form R eine Antwort speichert.',
  columns: [{ key: 'person', label: 'Person' }, { key: 'erwerbstaetig', label: 'erwerbstaetig <dbl+lbl>' }],
  rows: FUENF.map(r => ({ person: r.person, erwerbstaetig: `${r.erwerbstaetig} [${JA_NEIN[r.erwerbstaetig]}]` })),
  options: [
    { id: 'zahl', label: 'Zahl mit to_numeric()' },
    { id: 'faktor', label: 'Faktor mit to_label()' },
    { id: 'text', label: 'Text mit to_character()' },
    { id: 'stufen', label: 'Faktor mit as.numeric() zurück' },
  ],
  steps: [
    {
      title: 'Die jetzige Form ansehen',
      was: 'read_spss() liefert erwerbstaetig als Zahl mit Labels. Gespeichert ist die 1, angezeigt wird 1 [Ja].',
      warum: 'Erst wenn du die Form kennst, weißt du, was R damit rechnen kann.',
      acht: 'Was R anzeigt, ist nicht immer das, was gespeichert ist. Bei 1 [Ja] rechnet R mit der 1.',
      fach: 'Ein gelabelter Vektor (haven_labelled) speichert Zahlen und trägt die Wertelabels als Attribut.',
      concept: 'labels',
    },
    {
      title: 'Die Zielform wählen',
      was: 'to_numeric() behält nur die Zahl. to_label() macht einen Faktor: Die Spalte kennt dann nur noch die Antworttexte Nein und Ja, in fester Reihenfolge. to_character() macht reinen Text.',
      warum: 'Für Mittelwerte brauchst du Zahlen. Für Tabellen, Grafiken und Gruppenvergleiche sind Faktoren mit Texten bequemer.',
      acht: 'to_numeric() macht aus Kategorien keine Mengen. Der Mittelwert der Codes 0 bis 4 beim Schulabschluss ist keine Menge an Bildung: Die Codes geben nur die Reihenfolge an.',
      fach: 'Ein Faktor speichert Kategorien als Stufen mit Namen; intern trägt jede Stufe eine laufende Nummer ab 1.',
      concept: 'conversion',
    },
    {
      title: 'Zurück zu Zahlen, aber richtig',
      was: 'Ein Faktor zählt seine Antworttexte intern ab 1 durch: Nein ist Nummer 1, Ja Nummer 2. as.numeric() liefert diese Nummern, to_numeric() die ursprünglichen Codes.',
      warum: 'Die Nummern zählen nur die Antworttexte durch, die Codes kennt der Faktor nicht mehr. Aus den Codes 0 und 1 würden mit as.numeric() die Zahlen 1 und 2.',
      acht: 'Wer mit as.numeric() zurückwandelt, verschiebt hier jeden Wert um 1. Dann stimmt auch der Mittelwert nicht mehr.',
      fach: 'Die Stufennummern eines Faktors (seine internen Nummern ab 1) und die ursprünglichen Zahlencodes können auseinanderfallen.',
    },
  ],
  apply: (rows, option) => {
    const f = FORMEN[option];
    return {
      columns: [{ key: 'person', label: 'Person' }, { key: 'erwerbstaetig', label: `erwerbstaetig ${f.typ}` }],
      rows: rows.map((r, i) => ({ person: r.person, erwerbstaetig: f.wert(codes[i]) })),
    };
  },
  rCode: option => [...START, ...AUFRUF[option], '', 'atlas %>%', '  frequency(erwerbstaetig)'].join('\n'),
  check: {
    question: 'Welchen Mittelwert meldet R nachher für erwerbstaetig bei den fünf Personen? Gibt es keinen, tippe NA.',
    answer: option => option === 'zahl' ? CONVERSION_MITTEL.codes : option === 'stufen' ? CONVERSION_MITTEL.stufen : 'NA',
    right: 'Genau. Ob R einen Mittelwert rechnet, hängt von der Form ab: mit Zahlen ja, mit Faktoren und Text nicht.',
    diagnose: (option, v) => {
      if (option === 'faktor' || option === 'text') {
        const form = option === 'faktor' ? 'einem Faktor' : 'Text';
        return v === 'NA' ? null : `Fast! Mit ${form} rechnet R keinen Mittelwert. mean() meldet NA und dazu eine Warnung.`;
      }
      if (v === 'NA') return option === 'zahl'
        ? 'Fast! to_numeric() liefert Zahlen, und mit denen rechnet R: 4 / 5 = 0,8.'
        : 'Fast! Nach as.numeric() stehen wieder Zahlen da, nur die falschen: (2 + 2 + 1 + 2 + 2) / 5 = 1,8.';
      if (option === 'zahl') return close(v, CONVERSION_MITTEL.codes) ? null
        : close(v, CONVERSION_MITTEL.stufen) ? 'Fast! 1,8 kommt mit den internen Nummern 1 und 2 des Faktors heraus. to_numeric() liefert die Codes 0 und 1.'
        : close(v, 4) ? 'Fast! 4 Personen haben die 1. Der Mittelwert teilt durch alle 5: 4 / 5 = 0,8.'
        : close(v, 1) ? 'Fast! Du hast durch 4 geteilt. Es sind 5 Personen: 4 / 5 = 0,8.'
        : null;
      return close(v, CONVERSION_MITTEL.stufen) ? null
        : close(v, CONVERSION_MITTEL.codes) ? 'Fast! So wäre es mit den Codes 0 und 1. as.numeric() liefert aber die internen Nummern 1 und 2: 9 / 5 = 1,8.'
        : close(v, 2.25) ? 'Fast! Du hast durch 4 geteilt. Es sind 5 Personen: 9 / 5 = 1,8.'
        : null;
    },
  },
  think: [
    {
      question: 'Du willst wissen, wie viel Prozent erwerbstätig sind. Welche Form hilft dir?',
      options: ['die Zahl, denn ihr Mittelwert ist der Anteil', 'der Faktor, denn frequency() zählt die Texte', 'beide'], correct: 2, step: 2,
      explain: 'Als Zahl ergibt der Mittelwert 0,8, also 80 %. Als Faktor zählt frequency() 4 von 5 mit Ja. Beide Wege führen zum selben Anteil.',
      kurz: 'Zahl und Faktor erzählen dasselbe, nur auf verschiedene Weise.',
    },
    {
      question: 'Der Schulabschluss hat die Codes 0 bis 4. Was liefert as.numeric() nach to_label()?',
      options: ['die Codes 0 bis 4', 'die Zahlen 1 bis 5', 'Text'], correct: 1, step: 3,
      explain: 'Ein Faktor zählt seine Antworttexte intern ab 1 durch. Ohne Schulabschluss bekommt die Nummer 1, obwohl sein Code 0 ist. to_numeric() holt die Codes 0 bis 4 zurück.',
      kurz: 'Die internen Nummern beginnen bei 1, Codes nicht unbedingt.',
    },
  ],
  genau: {
    kurz: 'Zahl, Zahl mit Labels, Faktor und Text tragen dieselbe Antwort, aber R behandelt sie verschieden. Wandle gezielt um, passend zum nächsten Schritt.',
    paragraphs: [
      'to_labelled() macht aus einer Zahl wieder einen gelabelten Vektor: labels = setzt die Antworttexte, label = den Fragetext.',
      'Für Gruppenvergleiche und Regressionen mit Vergleichsgruppe nimm ungeordnete Faktoren. Mit to_label(ordered = TRUE) entsteht ein geordneter Faktor; R gibt ihm in Modellen oft polynomiale Kontraste, die schwerer zu deuten sind.',
      'to_character() vergisst die Reihenfolge der Codes: frequency() sortiert die Texte dann nach dem Alphabet, Ja vor Nein. Ein Faktor behält die Reihenfolge der Codes.',
      'describe() rechnet nur mit Zahlen. Nach to_label() meldet mariposa: Variable `erwerbstaetig` is not numeric.',
      'Umwandeln ändert nie das Skalenniveau. to_numeric() macht eine nominale Variable nicht metrisch, auch wenn R danach mit ihren Codes rechnet.',
    ],
  },
};

const werte = (c: SampleCtx) => spalte(c, 'erwerbstaetig').values;

export const conversionTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'erwerbstaetig' },
    kurz: 'Dieselbe Spalte in zwei Formen bei allen 200 Befragten: Als Zahl rechnet R einen Mittelwert. Als Faktor, also mit festen Antworttexten, zählt es nur, wie oft jeder vorkommt.',
    value: c => mean(werte(c)),
    result: c => {
      const v = werte(c), m = mean(v), ja = v.filter(x => x === 1).length, nein = v.filter(x => x === 0).length;
      return {
        kurz: `Als Zahl hat erwerbstaetig den Mittelwert ${ja} / ${v.length} = ${num(m, 3)}: ${pct(m)} der Befragten sind erwerbstätig. Als Faktor zählt R ${ja}-mal „Ja“ und ${nein}-mal „Nein“; einen Mittelwert gibt es dann nicht.`,
        fachlich: `to_numeric() liefert die Codes 0 und 1 mit dem Mittelwert ${num(m, 3)}. to_label() liefert einen Faktor mit den Stufen Nein und Ja; as.numeric() darauf ergäbe die Stufennummern 1 und 2 mit dem Mittelwert ${num(m + 1, 3)}.`,
        zusatz: 'Die internen Nummern des Faktors liegen hier immer genau 1 über den Codes, weil Nein mit dem Code 0 die Nummer 1 bekommt.',
      };
    },
    voraussetzung: 'Der Mittelwert einer Spalte mit nur 0 und 1 ist der Anteil der Einsen. Er ist nur dann der Anteil der Erwerbstätigen, wenn 1 für Ja steht und keine weiteren Codes vorkommen.',
    think: [
      {
        question: 'Angenommen, alle wären erwerbstätig, Code 1. Welchen Mittelwert hat die Zahlenspalte dann?',
        options: ['1', '200', '0,5'], correct: 0,
        explain: 'Alle Codes sind 1, also auch ihr Mittelwert. Als Anteil gelesen: 100 % sind erwerbstätig.',
        kurz: 'Mittelwert 1 heißt: alle Ja.',
        tryIt: { label: 'alle erwerbstätig (Code 1)', op: 'constant', column: 'x', value: 1 },
        expect: { change: 'equals', value: 1 },
      },
      {
        question: 'Du tauschst die Codes 0 und 1. Was passiert mit dem Mittelwert der Zahlenspalte?',
        options: ['er steigt', 'er bleibt gleich', 'er sinkt'], correct: 2,
        explain: 'Aus dem Anteil der Ja-Antworten wird der Anteil der Nein-Antworten. Weil vorher mehr Ja als Nein dastanden, sinkt der Mittelwert.',
        kurz: 'Getauschte Codes, gespiegelter Anteil.',
        tryIt: { label: 'Codes 0 und 1 tauschen', op: 'reverse', column: 'x' },
        expect: { change: 'down' },
      },
    ],
  },
  r: {
    entry: 'conversion', variant: 0,
    tokens: {
      to_label: { sym: 'to_label()', term: 'Datentypen umwandeln', kurz: 'Macht aus Codes mit Antworttexten einen Faktor: Statt 0 und 1 stehen danach Nein und Ja in der Spalte.', fehler: 'Danach rechnet describe() nicht mehr mit der Spalte. mariposa meldet: Variable `erwerbstaetig` is not numeric.' },
    },
    outputMap: [
      { match: 'Nein', atlas: 'Faktorstufe', step: 2, explain: 'Wo vorher der Code 0 stand, steht jetzt der Antworttext. to_label() hat das Wertelabel zu einem festen Antworttext des Faktors gemacht.' },
      { match: 'valid N', atlas: 'gültige Antworten', explain: 'Alle 200 Befragten haben eine gültige Antwort. Einen Mittelwert rechnet R für den Faktor nicht: In der Kopfzeile fehlt mean=.' },
      { match: 'Raw %', atlas: 'Anteil Nein in Prozent', explain: '31,50 % der Befragten sind nicht erwerbstätig. Prozente rechnet frequency() auch für Faktoren.' },
    ],
    check: {
      question: 'Welcher Eintrag war vorher der Code 0? Tippe ihn an.', correct: 'Nein',
      wrong: {
        'valid N': 'Fast! Das ist die Zahl der gültigen Antworten. Den früheren Code 0 erkennst du an seinem Antworttext.',
        'Raw %': 'Fast! Das ist der Anteil in Prozent. Den früheren Code 0 erkennst du an seinem Antworttext.',
      },
    },
  },
  next: {
    next: { id: 'dummy', why: 'Aus einer Kategorie mit mehreren Codes werden 0/1-Spalten. Ein Faktor bekommt sie in einer Regression von R selbst.' },
    before: [
      { id: 'labels', why: 'Die Antworttexte, aus denen to_label() die festen Antworttexte des Faktors macht.' },
      { id: 'nominal', why: 'Kategorien ohne Rangfolge: Ihre Codes sind Namen, keine Mengen.' },
    ],
    after: [{ id: 'frequency', why: 'Zählt Antworttexte eines Faktors und Codes gleichermaßen.' }],
    more: [
      { id: 'ordinal', why: 'Geordnete Faktoren behalten die Rangfolge, bekommen in Modellen aber besondere Kontraste.' },
      { id: 'linear_regression', why: 'Ein Faktor geht dort als Gruppe mit einer Vergleichsgruppe ein.' },
    ],
  },
};
