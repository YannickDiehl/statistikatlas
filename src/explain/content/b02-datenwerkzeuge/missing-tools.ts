// Werkzeug „Missing-Codes aufbereiten“: P001 bis P005 mit dem Haushaltseinkommen; zum Üben stehen bei P001 der Code
// −9 (keine Angabe) und bei P004 der Code −8 (weiß nicht). set_na() aus mariposa 0.7.4 markiert sie als fehlend.
// In R nachgerechnet, siehe ./b02-datenwerkzeuge.test.ts. ALLBUS-Zahlen nur als Aggregat (./daten.ts).
import type { ConceptTabs, SampleCtx, TableTool } from '../../types';
import { close, count, num } from '../../format';
import { ALLBUS, FUENF, spalte } from './daten';

/** Einkommen der fünf mit den beiden Übungscodes. */
export const EINKOMMEN = FUENF.map(r => r.person === 'P001' ? -9 : r.person === 'P004' ? -8 : r.einkommen);
/** Welche Codes die Wahl als fehlend markiert. */
const MARKIERT: Record<string, number[]> = { keine: [], neun: [-9], beide: [-9, -8] };
const TAG: Record<number, string> = { [-9]: 'NA(a)', [-8]: 'NA(b)' };
const zeigen = (v: number) => v < 0 ? `−${-v}` : v;

/** Was describe() nach der Wahl rechnet: Summe und Zahl der gültigen Werte, Mittelwert. */
export function missingMittel(option: string) {
  const gueltig = EINKOMMEN.filter(v => !MARKIERT[option].includes(v));
  const summe = gueltig.reduce((a, b) => a + b, 0);
  return { summe, n: gueltig.length, mittel: summe / gueltig.length };
}
const rechnung = (option: string) => { const m = missingMittel(option); return `${count(m.summe)} / ${m.n} ${Math.abs(m.mittel * 100 - Math.round(m.mittel * 100)) < 1e-9 ? '=' : '≈'} ${num(m.mittel)}`; };

const START = ['library(dplyr)', 'library(mariposa)', '', 'atlas <- read_spss("Statistikatlas-200-Befragte.sav")', ''];
const SET_NA: Record<string, string[]> = { keine: [], neun: ['  set_na(einkommen = -9) %>%'], beide: ['  set_na(einkommen = c(-9, -8)) %>%'] };

const P = ALLBUS.pt03;

export const missingTools: TableTool = {
  concept: 'missing_tools',
  wofuer: `Im ALLBUS 2023 steht beim Vertrauen in den Bundestag bei ${count(P.fehlend)} von ${count(ALLBUS.befragte)} Befragten keine Antwort von 1 bis 7 (ungewichtet). Dort steht ein Code, etwa −9 für keine Angabe. Rechnet R diese Codes als Zahlen mit, liegt das mittlere Vertrauen bei ${num(P.mittelMitCodes)} statt bei ${num(P.mittel)}. Hier übst du an fünf Befragten, solche Codes als fehlend zu markieren.`,
  kurz: 'Missing-Codes sind Zahlen, die eigentlich „keine Antwort“ bedeuten. Markierst du sie als fehlend, lässt R sie beim Rechnen weg und merkt sich den Grund.',
  mut: 'Du rechnest nur einen Durchschnitt. Der Rest ist Aufräumen: Welche Zahl ist keine echte Antwort?',
  columns: [{ key: 'person', label: 'Person' }, { key: 'einkommen', label: 'einkommen' }],
  rows: FUENF.map((r, i) => ({ person: r.person, einkommen: zeigen(EINKOMMEN[i]) })),
  options: [
    { id: 'keine', label: 'Codes stehen lassen' },
    { id: 'neun', label: 'Nur −9 markieren' },
    { id: 'beide', label: '−9 und −8 markieren' },
  ],
  steps: [
    {
      title: 'Die Codes finden',
      was: 'Im Codebuch steht, welche Zahlen keine echten Antworten sind. Hier heißt −9 keine Angabe und −8 weiß nicht.',
      warum: 'Ein Einkommen von −9 Euro gibt es nicht. Andere Codes fallen weniger auf, etwa 99 beim Alter.',
      acht: 'Codes sehen aus wie Zahlen, und R rechnet sie mit, solange du nichts tust.',
      fach: 'Missing-Codes sind vereinbarte Werte, die das Fehlen einer gültigen Angabe und seinen Grund festhalten.',
      concept: 'missing',
    },
    {
      title: 'Die Codes als fehlend markieren',
      was: 'set_na(einkommen = c(−9, −8)) macht aus beiden Codes fehlende Werte. R zeigt sie als NA(a) und NA(b).',
      warum: 'Die Personen bleiben im Datensatz. Nur ihr Wert in dieser Spalte zählt nicht mehr mit.',
      acht: 'Jeder Code muss in der Liste stehen. Vergisst du −8, rechnet R ihn weiter als Einkommen.',
      fach: 'set_na() ersetzt die genannten Werte durch markierte fehlende Werte (tagged NA); der Buchstabe hält den ursprünglichen Code fest.',
      concept: 'missing_tools',
    },
    {
      title: 'Ohne die Lücken rechnen',
      was: 'describe() lässt fehlende Werte weg und zählt sie unter Missing. Der Mittelwert stammt dann nur aus den gültigen Einkommen.',
      warum: 'Ein Durchschnitt aus echten Einkommen sagt etwas über die Befragten. Einer mit −9 und −8 nicht.',
      acht: 'Weniger gültige Werte heißt: Das Ergebnis beruht auf weniger Personen. Notiere immer, wie viele fehlen.',
      fach: 'Fehlende Werte werden fallweise ausgeschlossen; N zählt nur die gültigen Werte.',
    },
  ],
  apply: (rows, option) => ({
    columns: [{ key: 'person', label: 'Person' }, { key: 'einkommen', label: 'einkommen' }],
    rows: rows.map((r, i) => ({ person: r.person, einkommen: MARKIERT[option].includes(EINKOMMEN[i]) ? TAG[EINKOMMEN[i]] : zeigen(EINKOMMEN[i]) })),
  }),
  rCode: option => [
    ...START,
    'atlas %>%',
    '  # zum Üben zwei Codes einsetzen; atlas selbst bleibt unverändert',
    '  mutate(',
    '    einkommen = replace(einkommen, id == "P001", -9),',
    '    einkommen = replace(einkommen, id == "P004", -8)',
    '  ) %>%',
    ...SET_NA[option],
    '  describe(einkommen, show = "mean")',
  ].join('\n'),
  check: {
    question: 'Welchen Mittelwert meldet describe() nachher für die fünf Einkommen?',
    answer: option => missingMittel(option).mittel,
    right: 'Genau. Nur echte Einkommen gehören in den Durchschnitt, Codes nicht.',
    diagnose: (option, v) => {
      const m = missingMittel(option);
      if (v === 'NA') return 'Fast! describe() lässt fehlende Werte weg und rechnet mit den übrigen. Einen Mittelwert gibt es also.';
      if (close(v, m.mittel)) return null;
      if (close(v, m.summe / (m.n - 1))) return option === 'keine'
        ? `Fast! Du hast durch ${m.n - 1} geteilt. Ohne set_na() sind −9 und −8 gewöhnliche Zahlen, alle fünf zählen: ${rechnung(option)}.`
        : `Fast! Du hast durch ${m.n - 1} geteilt. Es sind ${m.n} gültige Einkommen: ${rechnung(option)}.`;
      if (close(v, m.summe / (m.n + 1))) return `Fast! Du hast durch ${m.n + 1} geteilt. Fehlende Werte zählen nicht mit: ${rechnung(option)}.`;
      if (option !== 'beide' && close(v, missingMittel('beide').mittel)) return option === 'neun'
        ? 'Fast! −8 steht nicht in der Liste von set_na() und zählt deshalb weiter als Einkommen mit.'
        : 'Fast! So wäre es mit beiden Codes als fehlend. Ohne set_na() rechnet R −9 und −8 mit.';
      if (option !== 'keine' && close(v, missingMittel('keine').mittel)) return 'Fast! So wäre es ohne set_na(). Die markierten Codes zählen nicht mehr mit.';
      return null;
    },
  },
  think: [
    {
      question: 'Du schreibst set_na(−9) ohne Spaltennamen. Was passiert?',
      options: ['nur einkommen wird bereinigt', 'in allen Zahlenspalten wird −9 zu NA', 'nichts'], correct: 1, step: 2,
      explain: 'Ohne Namen gilt der Code für alle Zahlenspalten. Das passt, wenn −9 überall keine Angabe heißt. Bei einem Code wie 0 träfe es auch echte Antworten.',
      kurz: 'Ohne Spaltennamen gilt der Code überall.',
    },
    {
      question: '−9 und −8 sind jetzt beide NA. Lässt sich noch erkennen, wer keine Angabe gemacht hat?',
      options: ['ja, über die Markierung', 'nein, NA ist NA'], correct: 0, step: 2,
      explain: 'set_na() markiert jeden Code mit einem eigenen Buchstaben. na_frequencies() zählt die Arten, untag_na() holt die Codes zurück.',
      kurz: 'Markierte NA merken sich ihren Grund.',
    },
  ],
  genau: {
    kurz: 'set_na() macht aus vereinbarten Codes fehlende Werte und merkt sich ihren Grund. Warum Angaben fehlen, ist eine eigene Frage für die Auswertung.',
    paragraphs: [
      'Markierte NA (tagged NA) verhalten sich in Rechnungen wie gewöhnliche NA. na_frequencies() zeigt je Art Code, Anzahl und Buchstaben; strip_tags() macht daraus gewöhnliche NA, untag_na() stellt die ursprünglichen Codes wieder her.',
      'read_spss() macht Codes, die in der SPSS-Datei als fehlend definiert sind, schon beim Einlesen zu markierten NA. set_na() brauchst du für Codes, die als gewöhnliche Zahlen angekommen sind.',
      `Die Codes im ALLBUS 2023 beim Vertrauen in den Bundestag: ${count(P.codes[1].n)}-mal −11 (Frage nicht gestellt, Split), ${P.codes[2].n}-mal −9 (keine Angabe) und ${P.codes[0].n}-mal −42 (Datenfehler), ungewichtet.`,
      'Fehlende Werte wegzulassen ist nur dann unbedenklich, wenn das Fehlen nichts mit dem Thema zu tun hat. Ob das so ist, behandelt der Begriff „Warum fehlen Angaben?“.',
    ],
  },
};

/** Einkommen mit −9 bei P001 (wie im Katalogaufruf): Mittelwert mit dem Code und ohne ihn. */
export function mitCode(c: SampleCtx) {
  const v = spalte(c, 'einkommen').values, at = c.rows.findIndex(r => r.id === 'P001');
  const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
  return { n: v.length, mit: mean(v.map((x, i) => i === at ? -9 : x)), ohne: mean(v.filter((_, i) => i !== at)) };
}

export const missingToolsTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'einkommen' },
    kurz: 'Dasselbe mit allen 200 Befragten: Zum Üben steht bei P001 der Code −9. Wie verändert er den Durchschnitt, mit und ohne set_na()?',
    value: c => mitCode(c).ohne,
    result: c => {
      const m = mitCode(c);
      return {
        kurz: `Bleibt −9 stehen, liegt das mittlere Haushaltseinkommen bei ${num(m.mit)} €. Als fehlend markiert sind es ${num(m.ohne)} €, berechnet aus ${m.n - 1} gültigen Angaben.`,
        fachlich: `Nach set_na(einkommen = −9) meldet describe() N = ${m.n - 1} und Missing = 1. Ohne set_na() zählt −9 als Einkommen, und N ist ${m.n}.`,
        zusatz: `Der eine Code drückt den Mittelwert hier um ${num(m.ohne - m.mit)} € nach unten.`,
      };
    },
    voraussetzung: 'Der Durchschnitt ohne die Lücke beschreibt die Befragten nur dann gut, wenn das Fehlen nichts mit dem Einkommen zu tun hat.',
    think: [
      {
        question: 'Alle Einkommen steigen um 100 €. Was passiert mit dem Mittelwert nach set_na()?',
        options: ['er steigt um 100', 'er steigt um 99,50', 'er bleibt gleich'], correct: 0,
        explain: 'Alle gültigen Einkommen steigen um 100 €, also auch ihr Mittelwert. Ohne set_na() stiege er nur um 99,50 €, weil der Code −9 nicht mitwächst.',
        kurz: 'Ein Code wächst nicht mit, eine echte Angabe schon.',
        tryIt: { label: 'alle 100 € mehr', op: 'shift', column: 'x', value: 100 },
        expect: { change: 'plus', amount: 100 },
      },
      {
        question: 'Alle Einkommen verdoppeln sich. Was passiert mit dem Mittelwert nach set_na()?',
        options: ['er verdoppelt sich', 'er steigt um 100', 'er bleibt gleich'], correct: 0,
        explain: 'Jedes gültige Einkommen wird doppelt so groß, also auch ihr Durchschnitt. Der Code bei P001 zählt nicht mit und stört deshalb nicht.',
        kurz: 'Ohne den Code bleibt der Mittelwert ein echter Durchschnitt.',
        tryIt: { label: 'alle Einkommen verdoppeln', op: 'double', column: 'x', value: 2 },
        expect: { change: 'factor', factor: 2 },
      },
    ],
  },
  r: {
    entry: 'missing_tools', variant: 0,
    tokens: {
      set_na: { sym: 'set_na()', term: 'Missing-Codes aufbereiten', kurz: 'Erklärt Codes wie −9 zu fehlenden Werten. R lässt sie beim Rechnen weg und merkt sich, welcher Code es war.', fehler: 'Steht der Code in Anführungszeichen, meldet mariposa: Missing values for `einkommen` must be numeric. Schreib die Zahl ohne Anführungszeichen.' },
      replace: { sym: 'replace()', term: 'Wert ersetzen', kurz: 'Setzt hier nur zum Üben bei P001 den Code −9 ein. Der Datensatz atlas selbst bleibt unverändert.', fehler: 'Mit = statt == meldet R: unbenutztes Argument (id = "P001"). Für den Vergleich braucht es zwei Gleichheitszeichen.' },
      id: { sym: 'id', term: 'Kennung der Befragten', kurz: 'Die Spalte mit den Kennungen P001 bis P200. Mit ihr findest du jede Person eindeutig.', fehler: 'Ohne Anführungszeichen um P001 sucht R ein Objekt dieses Namens und meldet: Objekt \'P001\' nicht gefunden.' },
    },
    outputMap: [
      { match: 'Missing', atlas: 'fehlende Werte', step: 2, explain: 'Der Code −9 bei P001 zählt jetzt als fehlend. describe() weist ihn hier aus, statt mit ihm zu rechnen.' },
      { match: 'N', atlas: 'gültige Werte', step: 3, explain: '199 statt 200: Der Mittelwert beruht auf allen Befragten außer P001.' },
      { match: 'Mean', atlas: 'Mittelwert ohne den Code', step: 3, explain: 'Der Durchschnitt der 199 gültigen Einkommen. Mit −9 als Zahl läge er bei 3.131,83 €.' },
    ],
    check: {
      question: 'Wie viele Werte zählt R als fehlend? Tippe die Zahl an.', correct: 'Missing',
      wrong: {
        N: 'Fast! N zählt die gültigen Werte, hier 199. Die fehlenden stehen unter Missing.',
        Mean: 'Fast! Das ist der Mittelwert. Die fehlenden Werte stehen unter Missing.',
      },
    },
  },
  next: {
    next: { id: 'missing_mechanisms', why: 'Warum Angaben fehlen, entscheidet, ob das Weglassen unbedenklich ist.' },
    before: [
      { id: 'missing', why: 'Was eine fehlende Angabe ist und wie R sie als NA führt.' },
      { id: 'codebook', why: 'Dort steht, welche Codes keine echten Antworten sind.' },
    ],
    after: [{ id: 'describe', why: 'Zählt fehlende Werte unter Missing und rechnet ohne sie.' }],
    more: [{ id: 'data_import', why: 'read_spss() markiert die in der Datei festgelegten Codes schon beim Einlesen.' }],
  },
};
