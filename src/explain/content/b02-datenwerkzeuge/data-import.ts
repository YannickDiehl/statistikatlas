// Begriffskarte „Daten nach R einlesen“: der ALLBUS 2023 als SPSS-Datei (nur Aggregate), read_spss() und die übrigen
// Lesefunktionen aus mariposa 0.7.4. In R nachgerechnet, siehe ./b02-datenwerkzeuge.test.ts.
import type { ConceptCard, ConceptTabs } from '../../types';
import { count, num } from '../../format';
import { ALLBUS } from './daten';

const P = ALLBUS.pt03;

export const dataImport: ConceptCard = {
  concept: 'data_import',
  wofuer: 'Du hast eine Datei mit Befragungsdaten, etwa den ALLBUS als SPSS-Datei. Bevor R damit rechnen kann, muss es die Datei lesen. Dabei entscheidet sich, ob Fragetexte, Antworttexte und Codes für fehlende Angaben mitkommen.',
  kurz: 'Einlesen holt eine Datei als Tabelle nach R. Die passende Funktion zum Dateiformat bringt auch Fragetexte, Antworttexte und Codes für fehlende Angaben mit.',
  stellDirVor: {
    text: `Du liest den ALLBUS 2023 mit read_spss() ein. R zeigt ${count(ALLBUS.befragte)} Befragte und ${ALLBUS.spalten} Spalten. Beim Vertrauen in den Bundestag (pt03, Skala 1 bis 7) erkennt R die Codes −42, −11 und −9 als fehlend: ${count(P.gueltig)} gültige Antworten, im Schnitt ${num(P.mittel)}, ungewichtet. Kämen dieselben Zahlen ohne diese Information an, rechnete R die Codes mit, und der Schnitt fiele auf ${num(P.mittelMitCodes)}.`,
    figures: [
      { label: 'Befragte', value: count(ALLBUS.befragte) },
      { label: 'gültige Antworten bei pt03', value: count(P.gueltig) },
      { label: 'Schnitt, Codes als fehlend erkannt', value: num(P.mittel) },
      { label: 'Schnitt, Codes als Zahlen mitgerechnet', value: num(P.mittelMitCodes) },
    ],
  },
  heisst: {
    fach: 'Einlesen (Import) überträgt eine Datei in einen Dataframe. read_spss() übernimmt Variablen- und Wertelabels und speichert die in der Datei festgelegten fehlenden Werte als markierte NA (tagged NA).',
  },
  bausteine: [
    {
      title: 'Die passende Funktion wählen',
      was: 'Die Dateiendung verrät das Format: .sav steht für SPSS, .dta für Stata, .xlsx für Excel. Dazu passen read_spss(), read_stata() und read_xlsx().',
      warum: 'Jedes Format speichert Labels und fehlende Werte auf eigene Weise. Nur die passende Funktion versteht diese Zusatzinformation.',
      acht: 'Liest du eine .sav-Datei mit read_stata(), bricht mariposa ab und rät dir selbst: Use `read_spss()` instead.',
    },
    {
      title: 'Der Datei einen Namen geben',
      was: 'allbus <- read_spss("ZA8831_v1-3-0.sav") liest die Datei und legt sie unter dem Namen allbus ab. Mit diesem Namen arbeitest du weiter.',
      warum: 'Ohne Namen zeigt R die Daten nur einmal an und vergisst sie gleich wieder.',
      acht: 'R sucht die Datei im Arbeitsverzeichnis. Liegt sie woanders, meldet mariposa: File \'ZA8831_v1-3-0.sav\' does not exist.',
    },
    {
      title: 'Prüfen, was angekommen ist',
      was: 'Zähle Zeilen und Spalten und sieh dir eine Spalte mit frequency() an. Stehen Antworttexte und fehlende Angaben da, wo du sie erwartest?',
      warum: 'Fehler beim Einlesen fallen sonst erst in der Auswertung auf, wenn ein Mittelwert seltsam aussieht.',
      acht: 'Ein Minimum wie −9 oder −11 heißt: Codes für fehlende Angaben sind als Zahlen angekommen. Dann hilft set_na().',
      concept: 'missing_tools',
    },
  ],
  ausprobieren: [
    {
      question: 'Ein Kommilitone schickt dir den ALLBUS als Excel-Datei ohne Labelblatt. Was fehlt nach dem Einlesen?',
      options: ['nichts', 'die Antworttexte und die Kennzeichnung fehlender Angaben', 'die Zahlen selbst'], correct: 1, step: 1,
      explain: 'In den Zellen stehen nur Zahlen. Antworttexte und die Information, dass −9 fehlend heißt, kommen nur mit, wenn mariposa sie selbst in ein Labelblatt geschrieben hat.',
      kurz: 'Excel ohne Labelblatt liefert nur Zahlen.',
    },
    {
      question: `Nach read_spss() meldet describe() für pt03 N = ${count(P.gueltig)} und Missing = ${count(P.fehlend)}. Ist beim Einlesen etwas verloren gegangen?`,
      options: [`ja, ${count(P.fehlend)} Antworten`, 'nein, das sind die Codes für fehlende Angaben', 'ja, die Labels'], correct: 1, step: 3,
      explain: `${count(P.gueltig)} und ${count(P.fehlend)} ergeben zusammen die ${count(ALLBUS.befragte)} Befragten. Die ${count(P.fehlend)} sind die Codes −42, −11 und −9, die R als fehlend erkannt hat.`,
      kurz: 'Missing zählt erkannte Codes, keine verlorenen Daten.',
    },
  ],
  check: {
    question: 'Du liest eine SPSS-Datei mit read_spss() ein. In der Datei ist −9 als fehlend festgelegt. Was wird aus −9?',
    options: ['Es bleibt die Zahl −9.', 'Ein fehlender Wert, und R merkt sich den Code.', 'Die ganze Zeile wird gelöscht.', 'Eine 0.'],
    correct: 1,
    right: 'Genau. read_spss() übernimmt die Festlegung aus der Datei und markiert −9 als fehlend.',
    diagnose: {
      0: 'Fast! Das passiert nur, wenn die Datei −9 nicht als fehlend festlegt, etwa bei einer Excel- oder CSV-Datei.',
      2: 'Fast! Die Person bleibt im Datensatz. Nur ihr Wert in dieser Spalte fehlt.',
      3: 'Noch nicht ganz. 0 wäre ein echter Wert und verfälschte jede Rechnung. Fehlend heißt in R NA.',
    },
  },
  fuerDich: 'Wenn du für eine Hausarbeit den ALLBUS herunterlädst, nimm die SPSS- oder die Stata-Datei und lies sie mit read_spss() oder read_stata() ein. Prüf danach mit frequency(), ob die fehlenden Angaben als fehlend erscheinen.',
  genau: {
    kurz: 'read_spss() liest Labels mit und macht festgelegte fehlende Werte zu markierten NA. Mit tag_na = FALSE werden sie zu gewöhnlichen NA, und der Grund geht verloren.',
    paragraphs: [
      'SAV-, POR-, DTA-, SAS- und XPT-Dateien liest mariposa über das Paket haven, Excel-Dateien über openxlsx2. read_xlsx() stellt Labels nur wieder her, wenn die Datei ein Labelblatt von write_xlsx() enthält.',
      'na_frequencies() zählt die Arten fehlender Werte, untag_na() holt die ursprünglichen Codes zurück. So bleibt sichtbar, ob jemand keine Angabe machen wollte oder die Frage gar nicht bekam.',
      'Die Beispiele im Reiter „In R“ schreiben den Lehrdatensatz erst in ein Format und lesen ihn dann wieder ein. So laufen sie ohne fremde Datei. POR- und native SAS-Dateien kann mariposa nicht schreiben; dafür brauchst du eine Datei aus einer anderen Quelle.',
      'Eine CSV-Datei enthält nur Zahlen und Text, ohne Labels und ohne festgelegte fehlende Werte. Codes wie −9 kommen dann als gewöhnliche Zahlen an.',
    ],
  },
};

export const dataImportTabs: ConceptTabs = {
  r: {
    entry: 'data_import', variant: 0, live: { fn: 'describe', show: ['min', 'max'] },
    tokens: {
      '"min"': { sym: '"min"', term: 'Minimum', kurz: 'Der kleinste Wert der Spalte. Steht hier −9 oder −11, sind Codes für fehlende Angaben als Zahlen angekommen.', fehler: 'Schreibst du "minimum", meldet mariposa: Unknown `show` value: "minimum". Erlaubt ist "min".' },
      '"max"': { sym: '"max"', term: 'Maximum', kurz: 'Der größte Wert der Spalte. Auch ein Wert wie 99 kann ein Code sein, keine echte Antwort.', fehler: 'Ohne Anführungszeichen meldet mariposa: `show` must be a character vector of statistic names.' },
    },
    outputMap: [
      { match: 'N', atlas: 'angekommene gültige Werte', step: 3, explain: 'So viele gültige Werte sind in dieser Spalte angekommen. Beim Lehrdatensatz sind es alle Befragten.' },
      { match: 'Missing', atlas: 'fehlende Werte', step: 3, explain: `Werte, die beim Einlesen als fehlend erkannt wurden. Im ALLBUS 2023 wären es bei pt03 ${count(P.fehlend)}.` },
      { match: 'Min', atlas: 'kleinster Wert', step: 3, explain: 'Liegt er unter dem kleinsten erlaubten Wert, etwa bei −9, ist ein Code als Zahl angekommen.' },
      { match: 'Max', atlas: 'größter Wert', step: 3, explain: 'Auch ein zu großer Wert kann ein Code sein, etwa 99 für weiß nicht.' },
    ],
    check: {
      question: 'Woran siehst du, ob beim Einlesen Werte als fehlend erkannt wurden? Tippe es an.', correct: 'Missing',
      wrong: {
        N: 'Fast! N zählt die gültigen Werte. Die als fehlend erkannten stehen unter Missing.',
        Min: 'Fast! Das ist der kleinste Wert. Die als fehlend erkannten Werte stehen unter Missing.',
      },
    },
  },
  next: {
    next: { id: 'codebook', why: 'Zeigt, was mitgekommen ist: Fragetexte, Codes und fehlende Angaben jeder Spalte.' },
    before: [{ id: 'series', why: 'Jede Spalte der Datei wird in R eine Datenreihe mit einem Wert je Person.' }],
    after: [
      { id: 'missing_tools', why: 'Codes, die als Zahlen angekommen sind, markierst du nachträglich als fehlend.' },
      { id: 'labels', why: 'Fehlen nach dem Einlesen Antworttexte, setzt du sie mit val_labels() selbst.' },
    ],
    more: [
      { id: 'data_export', why: 'Der umgekehrte Weg: Daten aus R in eine Datei schreiben.' },
      { id: 'conversion', why: 'Gelabelte Zahlen aus read_spss() wandelst du bei Bedarf in Faktoren um.' },
    ],
  },
};
