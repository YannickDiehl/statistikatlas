import type { Hint } from '../kit/HintLadder';

/** Skalenniveau, wie es für die Wahl der Grafik zählt. Die 0–10-Skala gilt hier als metrisch (elf gleich weite Stufen). */
export type Level = 'nominal' | 'ordinal' | 'metric';
export type VarMeta = {
  name: string;
  title: string;
  /** Frage in Kurzform und Antwortskala, wie sie im Rätselkasten und im Bauplan stehen. */
  question: string;
  scale: string;
  level: Level;
  /** Name der Spalte im R-Code nach to_label(); metrische Variablen behalten ihren Namen. */
  rName: string;
  /** Kurze Beschriftungen für Kategorien (statt der Großbuchstaben-Labels der Datei). */
  short?: Record<number, string>;
};

export const VARS: Record<string, VarMeta> = {
  ls01: { name: 'ls01', title: 'Lebenszufriedenheit', question: 'Wie zufrieden sind Sie gegenwärtig, alles in allem, mit Ihrem Leben?', scale: '0 ganz unzufrieden … 10 ganz zufrieden', level: 'metric', rName: 'ls01' },
  hs01: { name: 'hs01', title: 'Gesundheit', question: 'Wie würden Sie Ihren Gesundheitszustand im Allgemeinen beschreiben?', scale: '1 sehr gut · 2 gut · 3 zufriedenstellend · 4 weniger gut · 5 schlecht', level: 'ordinal', rName: 'gesundheit' },
  pa02a: { name: 'pa02a', title: 'Politisches Interesse', question: 'Wie stark interessieren Sie sich für Politik?', scale: '1 sehr stark · 2 stark · 3 mittel · 4 wenig · 5 überhaupt nicht', level: 'ordinal', rName: 'interesse' },
  pa01: { name: 'pa01', title: 'Links-rechts', question: 'Wo würden Sie Ihre politischen Ansichten auf einer Skala von links nach rechts einstufen?', scale: '1 links … 10 rechts', level: 'ordinal', rName: 'pa01' },
  dw15: { name: 'dw15', title: 'Arbeitsstunden', question: 'Wie viele Stunden arbeiten Sie durchschnittlich pro Woche? (nur Erwerbstätige)', scale: 'Stunden, mit Nachkommastellen', level: 'metric', rName: 'dw15' },
  age: { name: 'age', title: 'Alter', question: 'Alter der befragten Person', scale: 'Jahre', level: 'metric', rName: 'age' },
  eastwest: { name: 'eastwest', title: 'Wohngebiet', question: 'Erhebungsgebiet: alte oder neue Bundesländer', scale: '1 West · 2 Ost', level: 'nominal', rName: 'gebiet', short: { 1: 'West', 2: 'Ost' } },
  sex: { name: 'sex', title: 'Geschlecht', question: 'Geschlecht der befragten Person', scale: '1 Mann · 2 Frau · 3 divers', level: 'nominal', rName: 'geschlecht', short: { 1: 'Mann', 2: 'Frau', 3: 'divers' } },
  ps03: {
    name: 'ps03', title: 'Zufriedenheit mit der Demokratie', question: 'Wie zufrieden sind Sie – alles in allem – mit der Demokratie, so wie sie in Deutschland besteht?',
    scale: '1 sehr zufrieden … 6 sehr unzufrieden', level: 'ordinal', rName: 'demokratie',
    short: { 1: 'sehr zufrieden', 2: 'ziemlich zufrieden', 3: 'etwas zufrieden', 4: 'etwas unzufrieden', 5: 'ziemlich unzufrieden', 6: 'sehr unzufrieden' },
  },
};

/* ---------- Teil 1 · Vorher-Skizze ---------- */

export const SKETCH_VAR = 'ls01';
export const SKETCH_CODES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

/* ---------- Teil 2 · Silhouetten ---------- */

export const SILHOUETTE_IDS = ['A', 'B', 'C', 'D'] as const;
export type SilhouetteId = typeof SILHOUETTE_IDS[number];
/** Feste Reihenfolge, damit der Raum dieselben Buchstaben vergleicht. */
export const SILHOUETTES: Record<SilhouetteId, string> = { A: 'hs01', B: 'dw15', C: 'pa01', D: 'age' };
/** Kandidaten im Rätselkasten: die vier richtigen und ein Köder mit derselben Stufenzahl wie A. */
export const CANDIDATES = ['pa02a', 'age', 'hs01', 'dw15', 'pa01'] as const;

/* ---------- Teil 3 · Bauplan ---------- */

export type GeomId = 'bar' | 'dodge' | 'fill' | 'histogram' | 'boxplot' | 'point' | 'jitter';
export type Role = 'fill' | 'y';
export const GEOMS: { id: GeomId; label: string; code: string; role: Role }[] = [
  { id: 'bar', label: 'Balken, gestapelt', code: 'geom_bar()', role: 'fill' },
  { id: 'dodge', label: 'Balken nebeneinander', code: 'geom_bar(position = "dodge")', role: 'fill' },
  { id: 'fill', label: 'Balken auf 100 %', code: 'geom_bar(position = "fill")', role: 'fill' },
  { id: 'histogram', label: 'Histogramm', code: 'geom_histogram()', role: 'fill' },
  { id: 'boxplot', label: 'Boxplot', code: 'geom_boxplot()', role: 'y' },
  { id: 'point', label: 'Punkte', code: 'geom_point()', role: 'y' },
  { id: 'jitter', label: 'Punkte, gestreut', code: 'geom_jitter(width = 0.3, height = 0.3, alpha = 0.2)', role: 'y' },
];
export const GEOM_IDS = GEOMS.map(g => g.id);

export type QuestionId = 'demokratie' | 'stunden' | 'alter';
export type Question = {
  id: QuestionId;
  short: string;
  text: string;
  /** Die Gruppe, nach der verglichen wird, und das Merkmal, das verglichen wird. */
  group: string;
  outcome: string;
};
export const QUESTIONS: Question[] = [
  { id: 'demokratie', short: 'Demokratie in Ost und West', text: 'Sind Menschen im Osten mit der Demokratie unzufriedener als im Westen?', group: 'eastwest', outcome: 'ps03' },
  { id: 'stunden', short: 'Arbeitsstunden nach Geschlecht', text: 'Arbeiten Frauen weniger Stunden als Männer?', group: 'sex', outcome: 'dw15' },
  { id: 'alter', short: 'Alter und Lebenszufriedenheit', text: 'Werden Menschen mit dem Alter zufriedener?', group: 'age', outcome: 'ls01' },
];
export const QUESTION_IDS = QUESTIONS.map(q => q.id);

/* ---------- Teil 4 · Achse ---------- */

export const AXIS_MAX_START = 7.1;

/* ---------- R ---------- */

export const R_SETUP = `library(dplyr)
library(ggplot2)
library(mariposa)   # zuletzt laden: haven würde sonst read_spss() überdecken

allbus <- read_spss(file.choose())   # ZA8831_v1-3-0.sav`;

export const R_SKETCH = `# Teil 1 · Die echte Verteilung
allbus %>%
  filter(!is.na(ls01)) %>%
  ggplot(aes(x = ls01)) +
  geom_bar() +
  scale_x_continuous(breaks = 0:10)`;

export const R_SILHOUETTES = `# Teil 2 · Wie viele Stufen hat welche Frage?
codebook(allbus, hs01, pa02a, pa01)

# Kategorien: ein Balken je Stufe
allbus %>% filter(!is.na(hs01)) %>% ggplot(aes(x = hs01)) + geom_bar()

# Metrisch: ein Balken je Jahr
allbus %>% filter(!is.na(age)) %>% ggplot(aes(x = age)) + geom_histogram(binwidth = 1)`;

export const R_AXIS = `# Teil 4 · Zwei Mittelwerte, zwei Bilder
mittel <- allbus %>%
  mutate(gebiet = to_label(eastwest)) %>%
  group_by(gebiet) %>%
  summarise(zufriedenheit = mean(ls01, na.rm = TRUE))
mittel

mittel %>%
  ggplot(aes(x = gebiet, y = zufriedenheit)) +
  geom_col() +
  coord_cartesian(ylim = c(0, 7.5))   # Wo beginnt deine Achse?`;

export const hints: Record<'sketch' | 'silhouettes' | 'plan' | 'axis', Hint> = {
  sketch: {
    think: 'Der höchste Balken ist der Modus. Seine Höhe liest du an der y-Achse ab – sie zählt Befragte, keine Prozente.',
    pointer: 'geom_bar() zählt, wie oft jeder Wert vorkommt. Die Warnung „Removed … rows“ ohne filter() meint die fehlenden Angaben. Genau nachzählen kannst du mit fre(ls01).',
    concept: { id: 'mode', label: 'Modus' },
    workshop: '6.2.1 Häufigkeitsverteilung eines Items, 6.4.1 Eine kategoriale Variable',
    scaffold: 'allbus %>%\n  filter(!is.na(___)) %>%\n  ggplot(aes(x = ___)) +\n  geom____()',
    solution: `${R_SKETCH}\n\n# genau nachzählen\nallbus %>% fre(ls01)`,
  },
  silhouettes: {
    think: 'Zähl die Balken: Wie viele Stufen hat die Frage? Und wo steht der höchste Balken – am Rand, in der Mitte oder auf einer runden Zahl?',
    pointer: 'codebook() zeigt, wie viele Stufen eine Frage hat und was die 1 bedeutet. Metrische Variablen haben viele schmale Balken.',
    concept: { id: 'discrete_continuous', label: 'Diskret & stetig' },
    workshop: '4.4.2 codebook(), 6.4 Geoms für verschiedene Datentypen',
    scaffold: 'codebook(allbus, ___, ___)\nallbus %>% filter(!is.na(___)) %>% ggplot(aes(x = ___)) + geom_bar()\nallbus %>% filter(!is.na(___)) %>% ggplot(aes(x = ___)) + geom_histogram(binwidth = 1)',
    solution: `${R_SILHOUETTES}\nallbus %>% filter(!is.na(pa02a)) %>% ggplot(aes(x = pa02a)) + geom_bar()\nallbus %>% filter(!is.na(pa01)) %>% ggplot(aes(x = pa01)) + geom_bar()\nallbus %>% filter(!is.na(dw15)) %>% ggplot(aes(x = dw15)) + geom_histogram(binwidth = 1)`,
  },
  plan: {
    think: 'Welche Variable bildet die Gruppen, welche ist das Merkmal, das verglichen wird? Kategorien gehören auf x oder in die Farbe (fill), metrische Werte auf x (Histogramm) oder y (Boxplot, Punkte).',
    pointer: 'to_label() macht aus Codes Wörter, filter(!is.na(…)) lässt fehlende Angaben weg, nrow() zählt, wer im Bild steckt. Zwischen den Schichten steht ein +, kein %>%.',
    concept: { id: 'conversion', label: 'Datentypen umwandeln' },
    workshop: '6.3 Aufbau einer Grafik, 6.4 Geoms für verschiedene Datentypen, 6.7 Beschriftungen',
    scaffold: 'allbus %>%\n  mutate(___ = to_label(___)) %>%\n  filter(!is.na(___), !is.na(___)) %>%\n  ggplot(aes(x = ___, ___ = ___)) +\n  geom____() +\n  labs(caption = "ALLBUS 2023, ungewichtet, n = ___")',
    solution: '',
  },
  axis: {
    think: 'Erst die zwei Mittelwerte, dann das Bild. Wie hoch wäre jeder Balken, wenn die Achse bei 0 anfinge?',
    pointer: 'group_by() teilt in West und Ost, summarise() rechnet je Gruppe einen Wert. geom_col() zeichnet vorgegebene Höhen, coord_cartesian(ylim = …) wählt den Ausschnitt der y-Achse.',
    concept: { id: 'mean', label: 'Arithmetisches Mittel' },
    workshop: '6.3.3 Layer hinzufügen',
    scaffold: 'mittel <- allbus %>%\n  mutate(gebiet = to_label(___)) %>%\n  group_by(___) %>%\n  summarise(zufriedenheit = mean(___, na.rm = TRUE))\nmittel %>%\n  ggplot(aes(x = gebiet, y = zufriedenheit)) +\n  geom_col() +\n  coord_cartesian(ylim = c(___, 7.5))',
    solution: R_AXIS,
  },
};
