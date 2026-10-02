// Werkzeug „Variablen- & Wertelabels“: P001 bis P005 mit erwerbstaetig, erst ohne Labels (wie aus einer CSV-Datei),
// dann mit var_label() und val_labels() aus mariposa 0.7.4. In R nachgerechnet, siehe ./b02-datenwerkzeuge.test.ts.
import type { ConceptTabs, SampleCtx, TableTool } from '../../types';
import { close, num, pct } from '../../format';
import { FRAGE_ERWERBSTAETIG, FUENF, spalte } from './daten';

/** Antworttexte je Wahl; null heißt: ohne Labels. */
const TEXTE: Record<string, Record<number, string> | null> = {
  setzen: { 0: 'Nein', 1: 'Ja' },
  vertauscht: { 0: 'Ja', 1: 'Nein' },
  entfernen: null,
};

/** Mittelwert der Codes bei den fünf Personen: 4 / 5 = 0,8. */
export const LABELS_MITTEL = FUENF.reduce((a, r) => a + r.erwerbstaetig, 0) / FUENF.length;

const START = ['library(dplyr)', 'library(mariposa)', '', 'atlas <- read_spss("Statistikatlas-200-Befragte.sav")', ''];
const PRUEFEN = ['', 'atlas %>%', '  frequency(erwerbstaetig)'];

export const labels: TableTool = {
  concept: 'labels',
  wofuer: 'Stell dir vor, die Spalte erwerbstaetig kommt ohne Labels an, etwa aus einer CSV-Datei: Dort stehen nur Nullen und Einsen. Wer erwerbstätig ist, verraten erst die Labels, ein Fragetext für die Spalte und ein Antworttext für jeden Code.',
  kurz: 'Labels geben Codes ihre Bedeutung: Die Spalte bekommt ihren Fragetext, jeder Code seinen Antworttext. Die Zahlen selbst ändern sich dabei nicht.',
  mut: 'Hier rechnest du nichts. Du schreibst nur dazu, was die Zahlen bedeuten.',
  columns: [{ key: 'person', label: 'Person' }, { key: 'erwerbstaetig', label: 'erwerbstaetig' }],
  rows: FUENF.map(r => ({ person: r.person, erwerbstaetig: r.erwerbstaetig })),
  options: [
    { id: 'setzen', label: 'Fragetext und Antworttexte setzen' },
    { id: 'vertauscht', label: 'Antworttexte vertauscht' },
    { id: 'entfernen', label: 'Alle Labels entfernen' },
  ],
  steps: [
    {
      title: 'Der Spalte ihre Frage geben',
      was: `var_label() hängt den Fragetext an die Spalte: „${FRAGE_ERWERBSTAETIG}“ Die Nullen und Einsen bleiben, wie sie sind.`,
      warum: 'Der Spaltenname ist kurz. Erst der Fragetext sagt dir und anderen, was genau gefragt wurde.',
      acht: 'Ein Label ist nur Text. Es ändert weder die Werte noch das Skalenniveau.',
      fach: 'Das Variablenlabel beschreibt die Variable, meist mit dem Wortlaut der Frage.',
    },
    {
      title: 'Jedem Code seinen Antworttext geben',
      was: 'val_labels() ordnet jedem Code einen Text zu: 0 heißt Nein, 1 heißt Ja. R zeigt dann 1 [Ja].',
      warum: 'Mit Antworttexten liest sich jede Tabelle von selbst. Häufigkeitstabellen zeigen die Texte neben den Codes.',
      acht: 'R prüft nicht, ob die Zuordnung stimmt. Vertauschte Texte machen aus Erwerbstätigen scheinbar Nicht-Erwerbstätige.',
      fach: 'Wertelabels ordnen numerischen Codes Kategoriennamen zu. Gespeichert und gerechnet wird weiter mit den Codes.',
      concept: 'labels',
    },
    {
      title: 'Prüfen, was R anzeigt',
      was: 'frequency(erwerbstaetig) zeigt jeden Code mit seinem Antworttext und daneben, wie oft er vorkommt. Oben steht der Fragetext.',
      warum: 'So siehst du auf einen Blick, ob Codes und Texte zusammenpassen.',
      acht: 'Labels kommen nur mit, wenn das Dateiformat sie speichert. Eine CSV-Datei enthält nur die Zahlen.',
      fach: 'Die Häufigkeitstabelle einer gelabelten Variable nennt Code, Wertelabel und Anzahl je Kategorie.',
      concept: 'frequency',
    },
  ],
  apply: (rows, option) => {
    const texte = TEXTE[option];
    return {
      columns: [{ key: 'person', label: 'Person' }, { key: 'erwerbstaetig', label: texte ? `erwerbstaetig (${FRAGE_ERWERBSTAETIG})` : 'erwerbstaetig' }],
      rows: rows.map(r => ({ person: r.person, erwerbstaetig: texte ? `${r.erwerbstaetig} [${texte[Number(r.erwerbstaetig)]}]` : r.erwerbstaetig })),
    };
  },
  rCode: option => {
    if (option === 'entfernen') return [...START, 'atlas <- atlas %>%', '  unlabel(erwerbstaetig)', ...PRUEFEN].join('\n');
    const texte = TEXTE[option]!;
    return [
      ...START,
      option === 'vertauscht' ? '# So nicht: Die Antworttexte sind vertauscht, und R merkt es nicht.' : '# Zum Üben: erst die Labels entfernen, dann neu setzen',
      'atlas <- atlas %>%',
      '  unlabel(erwerbstaetig) %>%',
      `  var_label(erwerbstaetig = "${FRAGE_ERWERBSTAETIG}") %>%`,
      `  val_labels(erwerbstaetig = c("${texte[0]}" = 0, "${texte[1]}" = 1))`,
      ...PRUEFEN,
    ].join('\n');
  },
  check: {
    question: 'Welchen Mittelwert hat erwerbstaetig bei den fünf Personen nachher?',
    answer: () => LABELS_MITTEL,
    right: `Genau, ${num(LABELS_MITTEL)}. Labels ändern keinen Wert: R rechnet weiter mit den Codes 0 und 1.`,
    diagnose: (option, v) => v === 'NA' ? 'Fast! Labels nehmen R nicht das Rechnen weg. Die Codes bleiben Zahlen, ihr Mittelwert ist 0,8.'
      : close(v, LABELS_MITTEL) ? null
      : close(v, 4) ? 'Fast! 4 Personen haben den Code 1. Der Mittelwert teilt durch alle 5: 4 / 5 = 0,8.'
      : close(v, 0.2) ? (option === 'vertauscht'
        ? 'Fast! Vertauscht sind nur die Texte, nicht die Codes. R rechnet mit den Codes: 4 / 5 = 0,8.'
        : 'Fast! 0,2 ist der Anteil mit Code 0. Gefragt ist der Mittelwert der Codes: 4 / 5 = 0,8.')
      : close(v, 1) ? 'Fast! Du hast durch 4 geteilt. Es sind 5 Personen: 4 / 5 = 0,8.'
      : close(v, 80) ? 'Fast! Das ist der Anteil in Prozent. Als Mittelwert der Codes schreibst du 0,8.'
      : null,
  },
  think: [
    {
      question: 'Die Antworttexte sind vertauscht. Wer ist wirklich erwerbstätig?',
      options: ['wer den Code 1 hat', 'wer das Label Ja trägt'], correct: 0, step: 2,
      explain: 'Gemessen wurde mit den Codes: 1 heißt erwerbstätig. Die vertauschten Texte behaupten das Gegenteil, und R merkt es nicht. Prüfe Labels deshalb mit frequency() gegen das Codebuch.',
      kurz: 'Die Bedeutung steckt im Code, das Label beschreibt sie nur.',
    },
    {
      question: 'Du entfernst alle Labels mit unlabel(). Was passiert mit dem Mittelwert von erwerbstaetig?',
      options: ['er bleibt gleich', 'er wird NA', 'er wird 0'], correct: 0, step: 1,
      explain: 'unlabel() löscht nur Fragetext und Antworttexte. Die Codes 0 und 1 bleiben, also auch ihr Mittelwert.',
      kurz: 'Labels weg, Zahlen da.',
    },
  ],
  genau: {
    kurz: 'Labels sind Metadaten: Sie beschreiben die Daten, ohne sie zu ändern. Ob sie erhalten bleiben, hängt vom Dateiformat und von den Funktionen ab.',
    paragraphs: [
      'var_label() und val_labels() geben einen veränderten Datensatz zurück. Weise ihn zu (atlas <- atlas %>% …), sonst ist die Änderung gleich wieder weg.',
      'val_labels() ersetzt alle Antworttexte einer Spalte. Mit .add = TRUE ergänzt es nur einzelne, etwa einen Text für einen neuen Code.',
      'copy_labels() übernimmt die Labels gleichnamiger Spalten aus einem anderen Datensatz, etwa nach einem Schritt, der sie verloren hat. drop_labels() entfernt nur Antworttexte von Codes, die nicht mehr vorkommen; unlabel() entfernt alle Labels.',
      'Labels ändern nicht das Skalenniveau. Ob Abstände zwischen Codes etwas bedeuten, hängt davon ab, was gemessen wurde.',
    ],
  },
};

/** Befragte mit dem Code `code` in der Spalte des Reiters (erwerbstaetig). */
const anzahlMitCode = (c: SampleCtx, code: number) => spalte(c, 'erwerbstaetig').values.filter(v => v === code).length;

export const labelsTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'erwerbstaetig' },
    kurz: 'Dieselben Labels bei allen 200 Befragten: Wie viele tragen den Antworttext Ja, wie viele Nein?',
    value: c => anzahlMitCode(c, 1),
    result: c => {
      const ja = anzahlMitCode(c, 1), nein = anzahlMitCode(c, 0), n = c.rows.length, mittel = ja / n;
      return {
        kurz: `${ja} Befragte tragen das Label „Ja“, ${nein} das Label „Nein“. R rechnet trotzdem mit den Codes: Ihr Mittelwert ist der Anteil der Erwerbstätigen, ${ja} / ${n} = ${num(mittel, 3)}, also ${pct(mittel)}.`,
        fachlich: `erwerbstaetig mit dem Variablenlabel „${FRAGE_ERWERBSTAETIG}“ und den Wertelabels 0 = Nein und 1 = Ja; Häufigkeiten ${nein} und ${ja}, Mittelwert der Codes ${num(mittel, 3)}.`,
        zusatz: 'Die Labels hängen an den Codes, nicht an den Personen: Wer einen anderen Code bekommt, trägt auch ein anderes Label.',
      };
    },
    voraussetzung: 'Die Labels stimmen nur, solange Codes und Texte zusammenpassen. Wer Codes ändert, muss die Labels mitändern.',
    think: [
      {
        question: 'Du tauschst die Codes 0 und 1, die Labels bleiben, wo sie sind. Was passiert mit der Zahl der Befragten mit dem Label Ja?',
        options: ['sie steigt', 'sie bleibt gleich', 'sie sinkt'], correct: 2,
        explain: 'Ein Label hängt am Code, nicht an der Person. Wer vorher 0 hatte, heißt jetzt Ja. Weil es vorher mehr Ja als Nein gab, sinkt ihre Zahl.',
        kurz: 'Codes ändern, Labels vergessen: Die Bedeutung kippt.',
        tryIt: { label: 'Codes 0 und 1 tauschen', op: 'reverse', column: 'x' },
        expect: { change: 'down' },
      },
      {
        question: 'Angenommen, alle 200 wären erwerbstätig, Code 1. Wie viele tragen dann das Label Nein?',
        options: ['keine', '63', '200'], correct: 0,
        explain: 'Das Label Nein gehört zum Code 0. Hat niemand mehr den Code 0, trägt auch niemand dieses Label. In R steht es trotzdem weiter in der Liste der Wertelabels.',
        kurz: 'Ohne den Code taucht sein Label in den Daten nicht auf.',
        tryIt: { label: 'alle erwerbstätig (Code 1)', op: 'constant', column: 'x', value: 1 },
        expect: { change: 'equals', value: 0, measure: c => anzahlMitCode(c, 0) },
      },
    ],
  },
  r: {
    entry: 'conversion', variant: 1,
    tokens: {
      to_labelled: { sym: 'to_labelled()', term: 'Variablen- & Wertelabels', kurz: 'Hängt an eine Spalte Antworttexte für die Codes und einen Fragetext. Die Zahlen bleiben dieselben.', fehler: 'Bei einem Tippfehler im Spaltennamen meldet R: Objekt \'erwerbstaetigg\' nicht gefunden. Schreib den Namen genau wie im Datensatz.' },
      labels: { sym: 'labels =', term: 'Wertelabels', kurz: 'Die Antworttexte als benannter Vektor: links der Text, rechts der Code. "Nein" = 0 heißt: Der Code 0 bedeutet Nein.', fehler: 'Andersherum, c(0 = "Nein"), meldet R: Unerwartete(s) \'=\'. Der Text steht links, der Code rechts.' },
      label: { sym: 'label =', term: 'Variablenlabel', kurz: 'Der Fragetext oder eine kurze Beschreibung der Spalte. frequency() druckt ihn in Klammern hinter den Spaltennamen.', fehler: 'Ohne Anführungszeichen sucht R ein Objekt mit diesem Namen und meldet: Objekt \'Erwerbstätig\' nicht gefunden.' },
    },
    outputMap: [
      { match: 'Erwerbstätig', atlas: 'Variablenlabel', step: 1, explain: 'label = hat den Fragetext ersetzt: Statt der langen Frage steht jetzt Erwerbstätig in Klammern hinter dem Spaltennamen.' },
      { match: 'Label', atlas: 'Wertelabels', step: 2, explain: 'Die Spalte Label zeigt zu jedem Code seinen Antworttext. Sie erscheint nur, wenn die Spalte Wertelabels hat.' },
      { match: 'Nein', atlas: 'Antworttext zum Code 0', step: 2, explain: '63 Befragte haben den Code 0, und sein Label heißt Nein. Gespeichert ist weiter die 0.' },
      { match: 'mean', atlas: 'Mittelwert der Codes', explain: 'R rechnet mit den Codes 0 und 1, nicht mit den Texten. Der Mittelwert 0,69 ist der Anteil der Erwerbstätigen.' },
    ],
    check: {
      question: 'Wo steht das Variablenlabel, das label = gesetzt hat? Tippe es an.', correct: 'Erwerbstätig',
      wrong: {
        Nein: 'Fast! Nein ist ein Wertelabel, der Antworttext zum Code 0. Das Variablenlabel steht oben in Klammern hinter dem Spaltennamen.',
        mean: 'Fast! Das ist der Mittelwert der Codes. Das Variablenlabel steht oben in Klammern hinter dem Spaltennamen.',
      },
    },
  },
  next: {
    next: { id: 'conversion', why: 'to_label() macht aus Codes und ihren Antworttexten einen Faktor, mit dem Tabellen und Grafiken die Texte zeigen.' },
    before: [{ id: 'nominal', why: 'Labels geben Kategoriencodes wie 0 und 1 ihre Namen.' }],
    after: [
      { id: 'codebook', why: 'Sammelt die Labels aller Spalten an einem Ort.' },
      { id: 'data_export', why: 'Ob die Labels beim Weitergeben mitreisen, hängt vom Dateiformat ab.' },
    ],
    more: [
      { id: 'recode', why: 'rec() vergibt beim Umkodieren neue Antworttexte in eckigen Klammern.' },
      { id: 'frequency', why: 'Zeigt Codes, Antworttexte und Anzahlen in einer Tabelle.' },
    ],
  },
};
