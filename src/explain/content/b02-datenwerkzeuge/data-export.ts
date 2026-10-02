// Werkzeug „Daten & Ergebnisse weitergeben“: P001 bis P005 mit erwerbstaetig (Wertelabels) und einkommen (bei P001
// zum Üben −9, mit set_na() markiert), geschrieben mit write_spss(), write_stata(), write_xpt(version = 8) oder
// write_xlsx() aus mariposa 0.7.4 und wieder eingelesen. In R nachgerechnet, siehe ./b02-datenwerkzeuge.test.ts.
import type { ConceptTabs, TableTool } from '../../types';
import { FUENF, JA_NEIN } from './daten';

type Format = { endung: string; schreiben: string; lesen: string; wertelabels: boolean; code: string };
/** Was nach dem Wiedereinlesen noch da ist (R-Gegenprobe im Bereichstest). */
export const FORMATE: Record<string, Format> = {
  sav: { endung: 'sav', schreiben: 'write_spss("atlas.sav")', lesen: 'read_spss("atlas.sav")', wertelabels: true, code: '−9' },
  dta: { endung: 'dta', schreiben: 'write_stata("atlas.dta")', lesen: 'read_stata("atlas.dta")', wertelabels: true, code: '.a' },
  xpt: { endung: 'xpt', schreiben: 'write_xpt("atlas.xpt", version = 8, name = "atlas")', lesen: 'read_xpt("atlas.xpt")', wertelabels: false, code: '.a' },
  xlsx: { endung: 'xlsx', schreiben: 'write_xlsx("atlas.xlsx")', lesen: 'read_xlsx("atlas.xlsx")', wertelabels: true, code: '−9' },
};

const mitLabel = (code: number) => `${code} [${JA_NEIN[code]}]`;
const SPALTEN = [{ key: 'person', label: 'Person' }, { key: 'erwerbstaetig', label: 'erwerbstaetig' }, { key: 'einkommen', label: 'einkommen' }];

export const dataExport: TableTool = {
  concept: 'data_export',
  wofuer: 'Deine Projektgruppe arbeitet mit Stata, die Betreuerin mit SPSS, und für den Anhang brauchst du eine Excel-Datei. Jedes Format bewahrt andere Teile deiner Daten. Bei P001 fehlt das Einkommen; der Code −9 für keine Angabe ist mit set_na() markiert. Was kommt bei den anderen an, wenn sie die Datei wieder einlesen?',
  kurz: 'Weitergeben heißt: Daten in eine Datei schreiben, die andere öffnen können. Prüfe vorher, ob das Format Antworttexte und fehlende Werte behält.',
  mut: 'Hier rechnest du nichts. Du wählst ein Format und schaust nach, was beim Wiedereinlesen noch da ist.',
  columns: SPALTEN,
  rows: FUENF.map(r => ({ person: r.person, erwerbstaetig: mitLabel(r.erwerbstaetig), einkommen: r.person === 'P001' ? 'NA (−9)' : r.einkommen })),
  options: [
    { id: 'sav', label: 'SPSS (.sav)' },
    { id: 'dta', label: 'Stata (.dta)' },
    { id: 'xpt', label: 'SAS Transport (.xpt)' },
    { id: 'xlsx', label: 'Excel (.xlsx)' },
  ],
  steps: [
    {
      title: 'Das Format nach den Empfängern wählen',
      was: 'Wer mit SPSS arbeitet, braucht .sav, wer mit Stata arbeitet, .dta. Excel öffnet fast jeder; SAS Transport (.xpt) verlangen manche Datenarchive.',
      warum: 'Eine Datei, die niemand öffnen kann, hilft niemandem. Frag deshalb vorher, womit die anderen arbeiten.',
      acht: 'Der Dateiname braucht die passende Endung. Ohne .sav lehnt write_spss() ab und meldet: `path` must end in ".sav" or ".zsav".',
      fach: 'Exportieren heißt, Daten aus R in eine Datei eines bestimmten Formats zu schreiben.',
    },
    {
      title: 'Die Datei schreiben',
      was: 'write_spss(), write_stata(), write_xpt() oder write_xlsx() schreiben die Daten als Datei in dein Arbeitsverzeichnis.',
      warum: 'So entsteht eine feste Fassung deiner aufbereiteten Daten, mit der andere weiterarbeiten können.',
      acht: 'Liegt dort schon eine Datei mit demselben Namen, wird sie ohne Rückfrage überschrieben.',
      fach: 'Beim Export landen die Werte und, je nach Format, Metadaten wie Labels und Missing-Codes in der Datei.',
      concept: 'data_export',
    },
    {
      title: 'Wieder einlesen und vergleichen',
      was: 'Lies die Datei zurück und sieh dir eine Spalte mit frequency() an. Fehlen Antworttexte, hat das Format sie nicht behalten.',
      warum: 'Nur die Gegenprobe zeigt sicher, was bei den anderen ankommt.',
      acht: 'SAS Transport behält keine Wertelabels. Stata und SAS speichern den Code −9 als .a; dass der Wert fehlt, bleibt erhalten.',
      fach: 'Stata und SAS kennen keine negativen Missing-Codes; sie halten die Art des Fehlens mit Buchstaben wie .a fest.',
      concept: 'labels',
    },
  ],
  apply: (rows, option) => {
    const f = FORMATE[option];
    return {
      columns: SPALTEN,
      rows: rows.map((r, i) => {
        const code = FUENF[i].erwerbstaetig;
        return { person: r.person, erwerbstaetig: f.wertelabels ? mitLabel(code) : code, einkommen: r.person === 'P001' ? `NA (${f.code})` : FUENF[i].einkommen };
      }),
    };
  },
  rCode: option => {
    const f = FORMATE[option];
    return [
      'library(dplyr)', 'library(mariposa)', '', 'atlas <- read_spss("Statistikatlas-200-Befragte.sav")', '',
      'atlas %>%',
      '  # zum Üben: bei P001 den Code -9 einsetzen und als fehlend markieren',
      '  mutate(einkommen = replace(einkommen, id == "P001", -9)) %>%',
      '  set_na(einkommen = -9) %>%',
      `  ${f.schreiben}`, '',
      '# Gegenprobe: wieder einlesen und nachsehen',
      `zurueck <- ${f.lesen}`, '',
      'zurueck %>%', '  frequency(erwerbstaetig)', '',
      'zurueck %>%', '  describe(einkommen, show = "mean")',
    ].join('\n');
  },
  check: {
    question: 'Wie viele der fünf Personen zeigen nach dem Wiedereinlesen einen Antworttext bei erwerbstaetig?',
    answer: option => FORMATE[option].wertelabels ? FUENF.length : 0,
    right: 'Genau. Das Format entscheidet, ob die Antworttexte mitreisen.',
    diagnose: (option, v) => {
      if (FORMATE[option].wertelabels) return v === 5 ? null
        : v === 4 ? 'Fast! Auch Nein ist ein Antworttext. Alle fünf tragen einen, Ja oder Nein.'
        : v === 1 ? 'Fast! Nur eine Person sagt Nein, aber auch die anderen tragen einen Antworttext: Ja.'
        : v === 0 ? 'Fast! Dieses Format behält die Wertelabels. Nur SAS Transport verliert sie.'
        : null;
      return v === 0 ? null
        : v === 5 || v === 4 || v === 1 ? 'Fast! SAS Transport speichert keine Wertelabels. Nach dem Einlesen stehen nur noch 0 und 1 da.'
        : null;
    },
  },
  think: [
    {
      question: 'Du gibst die Daten als .xpt weiter. Was ist mit den Fragetexten?',
      options: ['sie sind weg', 'sie bleiben erhalten'], correct: 1, step: 3,
      explain: 'SAS Transport speichert Variablenlabels, aber keine Wertelabels. Die Frage bleibt also lesbar, die Antworttexte fehlen.',
      kurz: 'Fragetext ja, Antworttexte nein.',
    },
    {
      question: 'Die Betreuerin will nur eine Häufigkeitstabelle, keine Daten. Geht das?',
      options: ['ja, mit write_xlsx()', 'nein, nur ganze Datensätze'], correct: 0, step: 2,
      explain: 'write_xlsx() schreibt auch Ergebnisse wie Häufigkeitstabellen oder ein Codebuch in eine Excel-Datei. So bekommt sie die Tabelle ohne R.',
      kurz: 'Weitergeben lassen sich Daten und Ergebnisse.',
    },
  ],
  genau: {
    kurz: 'Jedes Format bewahrt andere Metadaten. SPSS und Excel über mariposa behalten alles; Stata behält die Antworttexte, schreibt den Missing-Code aber als .a; SAS Transport verliert zudem die Antworttexte.',
    paragraphs: [
      'Die R-Aufrufe schreiben Dateien in dein Arbeitsverzeichnis. Der Atlas zeigt den Code nur; das heruntergeladene R-Skript schreibt erst, wenn du es in R ausführst.',
      'SAS Transport braucht version = 8. Version 5 erlaubt nur Spaltennamen mit höchstens acht Zeichen, und mariposa bricht ab, weil aus methoden1 bis methoden5 fünfmal methoden würde.',
      'write_xlsx() legt neben dem Blatt Data ein Blatt Labels an. read_xlsx() aus mariposa stellt Labels und Missing-Codes daraus wieder her; im Datenblatt sieht man in Excel nur die Zahlen.',
      'Eine CSV-Datei speichert nur Werte. Fragetexte, Antworttexte und die Art fehlender Werte gehen dabei verloren.',
    ],
  },
};

export const dataExportTabs: ConceptTabs = {
  r: {
    entry: 'data_export', variant: 0, live: { fn: 'describe', show: ['mean'] },
    tokens: {
      describe: { sym: 'describe()', term: 'Deskriptiver Überblick', kurz: 'Zeigt Kennwerte einer Spalte. Vor dem Weitergeben und nach dem Wiedereinlesen müssen dieselben Zahlen herauskommen.', fehler: 'Bei einem Tippfehler im Spaltennamen meldet mariposa: Can\'t select columns that don\'t exist.' },
      '"mean"': { sym: '"mean"', term: 'Mittelwert', kurz: 'Fordert den Mittelwert an. N und Missing druckt describe() immer dazu.', fehler: 'Ohne Anführungszeichen meldet mariposa: `show` must be a character vector of statistic names.' },
    },
    outputMap: [
      { match: 'Mean', atlas: 'Mittelwert', explain: 'Nach dem Wiedereinlesen muss derselbe Mittelwert herauskommen. Weicht er ab, ist beim Schreiben oder Lesen etwas verloren gegangen.' },
      { match: 'N', atlas: 'gültige Werte', step: 3, explain: 'So viele gültige Werte müssen auch aus der Datei wieder ankommen.' },
      { match: 'Missing', atlas: 'fehlende Werte', step: 3, explain: 'Fehlende Werte bleiben in allen vier Formaten fehlend. In Stata und SAS heißt der Code danach .a statt −9.' },
    ],
    check: {
      question: 'Wie viele gültige Werte müssen aus der Datei wieder ankommen? Tippe die Zahl an.', correct: 'N',
      wrong: {
        Mean: 'Fast! Der Mittelwert soll auch gleich bleiben, er zählt aber keine Werte. Wie viele gültig sind, steht unter N.',
        Missing: 'Fast! Missing zählt die fehlenden Werte. Wie viele gültig sind, steht unter N.',
      },
    },
  },
  next: {
    next: { id: 'data_import', why: 'Die Gegenprobe: Lies die Datei wieder ein und prüfe, was angekommen ist.' },
    before: [
      { id: 'labels', why: 'Ob die Antworttexte mitreisen, hängt vom Dateiformat ab.' },
      { id: 'missing_tools', why: 'Markierte Codes behalten ihren Grund nur in Formaten, die ihn speichern.' },
    ],
    after: [],
    more: [
      { id: 'codebook', why: 'Lässt sich mit write_xlsx() als Excel-Datei weitergeben.' },
      { id: 'frequency', why: 'Auch eine Häufigkeitstabelle geht mit write_xlsx() nach Excel.' },
    ],
  },
};
