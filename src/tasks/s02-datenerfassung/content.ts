import type { Hint } from '../kit/HintLadder';

export const S02_VARS = ['pa02a', 'pa01', 'pt03', 'st01', 'pv01', 'ls01'] as const;
export type S02Var = typeof S02_VARS[number];
export const SHEET_IDS = ['1', '2', '3'] as const;
export type SheetId = typeof SHEET_IDS[number];

/** Was richtig erfasst wäre – als Label oder Zahl; die Codes ermittelt der Browser zur Laufzeit aus der Datei. */
export type Soll = { kind: 'label'; label: string } | { kind: 'value'; value: number } | { kind: 'open'; options: string[] };
/** Wie der Bogen aussieht. */
export type Mark =
  | { kind: 'cross'; at: string[] }
  | { kind: 'struck'; struck: string; at: string }
  | { kind: 'between'; a: string; b: string }
  | { kind: 'note'; text: string }
  | { kind: 'empty' }
  | { kind: 'absent' };
export type Question = { variable: S02Var; text: string; options: string[] };
export type Sheet = { id: SheetId; version: 'A' | 'B'; cells: Record<S02Var, { mark: Mark; soll: Soll }> };
/** Eintrag des fiktiven Kollegen Ben. */
export type Entry = { kind: 'label'; label: string } | { kind: 'value'; value: number } | { kind: 'blank' };

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => String(a + i));

export const questions: Question[] = [
  { variable: 'pa02a', text: 'Wie stark interessieren Sie sich für Politik?', options: ['sehr stark', 'stark', 'mittel', 'wenig', 'überhaupt nicht'] },
  { variable: 'pa01', text: 'Viele Leute verwenden die Begriffe „links“ und „rechts“. Wo würden Sie sich selbst einstufen? (1 = links, 10 = rechts)', options: range(1, 10) },
  { variable: 'pt03', text: 'Wie viel Vertrauen haben Sie in den Bundestag? (1 = gar kein Vertrauen, 7 = großes Vertrauen)', options: range(1, 7) },
  { variable: 'st01', text: 'Kann man den meisten Menschen vertrauen, oder muss man im Umgang mit anderen vorsichtig sein?', options: ['Man kann den meisten trauen', 'Man muss vorsichtig sein', 'Kommt darauf an', 'Sonstiges'] },
  { variable: 'pv01', text: 'Wenn am nächsten Sonntag Bundestagswahl wäre: Welche Partei würden Sie wählen?', options: ['CDU/CSU', 'SPD', 'FDP', 'Bündnis 90/Die Grünen', 'Die Linke', 'AfD', 'eine andere Partei', 'Ich würde nicht wählen', 'Weiß nicht'] },
  { variable: 'ls01', text: 'Wie zufrieden sind Sie gegenwärtig, alles in allem, mit Ihrem Leben? (0 = ganz unzufrieden, 10 = ganz zufrieden)', options: range(0, 10) },
];

const label = (l: string): Soll => ({ kind: 'label', label: l });
const value = (v: number): Soll => ({ kind: 'value', value: v });
const cross = (...at: string[]): Mark => ({ kind: 'cross', at });

export const sheets: Sheet[] = [
  { id: '1', version: 'A', cells: {
    pa02a: { mark: cross('sehr stark'), soll: label('SEHR STARK') },
    pa01: { mark: cross('3'), soll: value(3) },
    pt03: { mark: cross('6'), soll: value(6) },
    st01: { mark: { kind: 'absent' }, soll: label('TNZ: SPLIT') },
    pv01: { mark: cross('Die Linke'), soll: label('DIE LINKE') },
    ls01: { mark: cross('8'), soll: value(8) },
  } },
  { id: '2', version: 'B', cells: {
    pa02a: { mark: { kind: 'struck', struck: 'mittel', at: 'wenig' }, soll: label('WENIG') },
    pa01: { mark: cross('5', '6'), soll: { kind: 'open', options: ['5', '6', 'DATENFEHLER: MFN'] } },
    pt03: { mark: { kind: 'absent' }, soll: label('TNZ: SPLIT') },
    st01: { mark: { kind: 'note', text: '„weiß nicht so recht, kommt auf die Leute an“' }, soll: { kind: 'open', options: ['KOMMT DARAUF AN', 'WEISS NICHT', 'KEINE ANGABE'] } },
    pv01: { mark: cross('Weiß nicht'), soll: label('WEISS NICHT') },
    ls01: { mark: { kind: 'between', a: '7', b: '8' }, soll: { kind: 'open', options: ['7', '8', 'KEINE ANGABE'] } },
  } },
  { id: '3', version: 'A', cells: {
    pa02a: { mark: cross('überhaupt nicht'), soll: label('UEBERHAUPT NICHT') },
    pa01: { mark: cross('8'), soll: value(8) },
    pt03: { mark: cross('1'), soll: label('GAR KEIN VERTRAUEN') },
    st01: { mark: { kind: 'absent' }, soll: label('TNZ: SPLIT') },
    pv01: { mark: { kind: 'empty' }, soll: label('KEINE ANGABE') },
    ls01: { mark: cross('0'), soll: value(0) },
  } },
];

const bv = (v: number): Entry => ({ kind: 'value', value: v });
const bl = (l: string): Entry => ({ kind: 'label', label: l });
/** Bens Ersterfassung: sechs Abweichungen mit typischen Fehlern. */
export const ben: Record<SheetId, Record<S02Var, Entry>> = {
  '1': { pa02a: bv(5), pa01: bv(3), pt03: bv(6), st01: { kind: 'blank' }, pv01: bv(5), ls01: bv(8) },
  '2': { pa02a: bl('WENIG'), pa01: bv(5), pt03: bl('TNZ: SPLIT'), st01: bl('WEISS NICHT'), pv01: bl('WEISS NICHT'), ls01: bv(8) },
  '3': { pa02a: bl('UEBERHAUPT NICHT'), pa01: bv(8), pt03: bl('GAR KEIN VERTRAUEN'), st01: bl('TNZ: SPLIT'), pv01: bl('KEINE ANGABE'), ls01: bl('KEINE ANGABE') },
};
export const benNotes: Record<string, string> = {
  '1.pa02a': 'Ben hat die Richtung der Skala verwechselt.',
  '1.pv01': 'Ben hat den Listenplatz auf dem Bogen eingetragen, nicht den Code.',
  '1.st01': 'Ben hat die Zelle leer gelassen – in R wird daraus ein namenloses NA.',
  '2.pa01': 'Ben hat einfach das erste Kreuz genommen.',
  '2.ls01': 'Ben hat aufgerundet.',
  '3.ls01': 'Ben hat die 0 als „keine Angabe“ gelesen – sie ist eine gültige Antwort.',
};

export const R_SOLUTION = `library(mariposa)
library(dplyr)

allbus <- read_spss(file.choose())

# Block 1: Welche Zahl gehört zu welchem Wort?
allbus %>%
  codebook(pa02a, pa01, pt03, st01, pv01, ls01, mode, splt23_1) %>%
  summary()

# Block 2: Wie speichert der ALLBUS Papierbögen?
papier <- allbus %>% filter(mode == 4)   # 4 = MAIL
papier %>%
  codebook(pa01, st01, pt03) %>%
  summary()

# Block 3: Was passiert beim Umwandeln?
allbus %>%
  mutate(partei_text = to_label(pv01),
         partei_zahl = to_numeric(partei_text)) %>%
  frequency(pv01, partei_zahl) %>%
  summary()
`;

export const hints: Record<'codes' | 'paper' | 'convert', Hint> = {
  codes: {
    think: 'Auf dem Papier stehen Wörter, im Datensatz Zahlen. Wo steht, welche Zahl zu welchem Wort gehört?',
    pointer: 'codebook() zeigt zu jeder Variable Fragetext, Codes, Wertelabels und fehlende Angaben.',
    concept: { id: 'labels', label: 'Variablen- & Wertelabels' },
    workshop: '4.4.2 codebook()',
    scaffold: 'allbus %>%\n  codebook(___, ___, ___) %>%\n  summary()',
    solution: 'allbus %>%\n  codebook(pa02a, pa01, pt03, st01, pv01, ls01, mode, splt23_1) %>%\n  summary()',
  },
  paper: {
    think: 'Welche Spalte verrät, auf welchem Weg jemand geantwortet hat – und welche Zahl heißt MAIL?',
    pointer: 'mode ist der Erhebungsmodus. Mit filter() behältst du nur die Zeilen, die eine Bedingung erfüllen.',
    concept: { id: 'codebook', label: 'Codebuch & Variablensuche' },
    workshop: '4.5.2 Fälle filtern',
    scaffold: 'papier <- allbus %>% filter(mode == ___)\npapier %>%\n  codebook(___, ___) %>%\n  summary()',
    solution: 'papier <- allbus %>% filter(mode == 4)\npapier %>%\n  codebook(pa01, st01, pt03) %>%\n  summary()',
  },
  convert: {
    think: 'Was passiert mit einem Code, wenn man ihn in ein Wort und wieder zurück in eine Zahl verwandelt?',
    pointer: 'to_label() macht aus Codes Wörter (einen Faktor), to_numeric() macht daraus wieder Zahlen.',
    concept: { id: 'conversion', label: 'Datentypen umwandeln' },
    workshop: '4.6 Datentypen',
    scaffold: 'allbus %>%\n  mutate(partei_text = to_label(___),\n         partei_zahl = to_numeric(___)) %>%\n  frequency(pv01, partei_zahl) %>%\n  summary()',
    solution: 'allbus %>%\n  mutate(partei_text = to_label(pv01),\n         partei_zahl = to_numeric(partei_text)) %>%\n  frequency(pv01, partei_zahl) %>%\n  summary()',
  },
};
