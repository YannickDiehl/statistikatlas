import type { MeasureId } from '../kit/stats';

export type Level = 'nominal' | 'ordinal' | 'metrisch';
export type CardId = 'ep01' | 'ep03' | 'ls01' | 'id02' | 'eastwest' | 'educ5' | 'pa01' | 'rp01' | 'konf' | 'gs01' | 'age' | 'pa02a' | 'pt03';
export type Card = {
  id: CardId;
  /** Variable in der Datei. */
  source: string;
  title: string;
  question: string;
  level: Level;
  /** Ebenfalls vertretbares Skalenniveau (quasi-metrische Skalen, Dichotomien). */
  alsoLevel?: Level;
  /** Was ein höherer Code bedeutet – für den Richtungssatz; null bei rein nominalen Karten. */
  high: string | null;
  /** Umkodierung wie in R: rec(source, rules = …) als neue Variable id; TS-Spiegel map. */
  recode?: { rules: string; map: (x: number) => number | null };
  joker?: boolean;
};

const konfMap = (x: number) => (x === 1 || x === 2 ? 1 : x === 3 ? 2 : x === 4 || x === 5 ? 3 : x === 6 ? 4 : null);

export const CARDS: Card[] = [
  { id: 'ep01', source: 'ep01', title: 'Wirtschaftslage in Deutschland', question: 'Wie beurteilen Sie ganz allgemein die heutige wirtschaftliche Lage in Deutschland? (1 sehr gut … 5 sehr schlecht)', level: 'ordinal', high: 'die Wirtschaftslage schlechter einschätzt' },
  { id: 'ep03', source: 'ep03', title: 'Eigene wirtschaftliche Lage', question: 'Und Ihre eigene wirtschaftliche Lage heute? (1 sehr gut … 5 sehr schlecht)', level: 'ordinal', high: 'die eigene Lage schlechter einschätzt' },
  { id: 'ls01', source: 'ls01', title: 'Lebenszufriedenheit', question: 'Wie zufrieden sind Sie gegenwärtig, alles in allem, mit Ihrem Leben? (0 ganz unzufrieden … 10 ganz zufrieden)', level: 'metrisch', alsoLevel: 'ordinal', high: 'zufriedener mit dem eigenen Leben ist' },
  { id: 'id02', source: 'id02', title: 'Schicht', question: 'Welcher Schicht rechnen Sie sich selbst eher zu? (1 Unterschicht … 5 Oberschicht)', level: 'ordinal', high: 'sich einer höheren Schicht zurechnet' },
  { id: 'eastwest', source: 'eastwest', title: 'Wohnort West oder Ost', question: 'Erhebungsgebiet: alte (1) oder neue (2) Bundesländer', level: 'nominal', alsoLevel: 'ordinal', high: 'im Osten wohnt' },
  { id: 'educ5', source: 'educ', title: 'Schulabschluss', question: 'Allgemeiner Schulabschluss (1 ohne … 5 Hochschulreife; „anderer Abschluss“ und „noch Schüler“ fallen heraus)', level: 'ordinal', high: 'einen höheren Schulabschluss hat',
    recode: { rules: '1:5=copy; else=NA', map: x => (x >= 1 && x <= 5 ? x : null) } },
  { id: 'pa01', source: 'pa01', title: 'Links-rechts-Selbsteinstufung', question: 'Wo würden Sie sich selbst auf einer Skala von 1 (links) bis 10 (rechts) einstufen?', level: 'metrisch', alsoLevel: 'ordinal', high: 'sich weiter rechts einstuft' },
  { id: 'rp01', source: 'rp01', title: 'Kirchgang', question: 'Wie oft gehen Sie in die Kirche? (1 über einmal pro Woche … 6 nie)', level: 'ordinal', high: 'seltener in die Kirche geht' },
  { id: 'konf', source: 'rd01', title: 'Konfession', question: 'Welcher Religionsgemeinschaft gehören Sie an? (evangelisch, katholisch, andere, keine)', level: 'nominal', high: null,
    recode: { rules: '1:2=1 [evangelisch]; 3=2 [katholisch]; 4:5=3 [andere]; 6=4 [keine]; else=NA', map: konfMap } },
  { id: 'gs01', source: 'gs01', title: 'Wohnort: Stadt oder Land', question: 'Wie würden Sie Ihren Wohnort beschreiben? (1 Großstadt … 5 Einzelhaus auf dem Land)', level: 'ordinal', high: 'ländlicher wohnt' },
  { id: 'age', source: 'age', title: 'Alter', question: 'Alter in Jahren', level: 'metrisch', high: 'älter ist' },
  { id: 'pa02a', source: 'pa02a', title: 'Politisches Interesse', question: 'Wie stark interessieren Sie sich für Politik? (1 sehr stark … 5 überhaupt nicht)', level: 'ordinal', high: 'sich weniger für Politik interessiert' },
  { id: 'pt03', source: 'pt03', title: 'Vertrauen in den Bundestag', question: 'Wie viel Vertrauen haben Sie in den Bundestag? (1 gar kein … 7 großes Vertrauen)', level: 'ordinal', high: 'dem Bundestag mehr vertraut', joker: true },
];
export const CARD_IDS = CARDS.map(c => c.id) as CardId[];
export const cardById = Object.fromEntries(CARDS.map(c => [c.id, c])) as Record<CardId, Card>;

/** Konfession in zwei weiteren, ebenso willkürlichen Reihenfolgen (für Gamma). */
export const KONF_ORDERS: { label: string; rules: string; map: (x: number) => number | null }[] = [
  { label: 'evangelisch, katholisch, andere, keine', rules: '1:2=1; 3=2; 4:5=3; 6=4; else=NA', map: konfMap },
  { label: 'keine, evangelisch, katholisch, andere', rules: '6=1; 1:2=2; 3=3; 4:5=4; else=NA', map: x => (x === 6 ? 1 : x === 1 || x === 2 ? 2 : x === 3 ? 3 : x === 4 || x === 5 ? 4 : null) },
  { label: 'katholisch, keine, andere, evangelisch', rules: '3=1; 6=2; 4:5=3; 1:2=4; else=NA', map: x => (x === 3 ? 1 : x === 6 ? 2 : x === 4 || x === 5 ? 3 : x === 1 || x === 2 ? 4 : null) },
];

export const LEVEL_MEASURES: Record<Level, MeasureId[]> = {
  nominal: ['V', 'phi'],
  ordinal: ['gamma', 'tau', 'rho'],
  metrisch: ['r', 'rho'],
};

export const STAMPS = ['trägt', 'schrumpft', 'nur in einem Landesteil', 'kehrt sich um'] as const;
export type Stamp = typeof STAMPS[number];

/** Die Wirtschaftslage als Drittvariable für die Karte „West oder Ost“. */
export const LAGE = { rules: '1:2=1 [gut]; 3=2 [teils/teils]; 4:5=3 [schlecht]; else=NA', groups: ['gut', 'teils/teils', 'schlecht'] };

export const ROLE = {
  office: 'Beratungsbüro „Querschnitt“',
  fund: 'Förderfonds „Gemeinsinn“',
};

export const hintTexts: Record<Level, { think: string; pointer: string; concept: { id: string; label: string } }> = {
  nominal: {
    think: 'Kategorien ohne Reihenfolge: Welches Maß braucht keine Rangfolge? Und wie nimmst du die Ost-Überquote aus dem Spiel?',
    pointer: 'cramers_v() beruht auf χ²; mit weights = wghtpew rechnest du für Deutschland. group_by(eastwest) trennt West und Ost. Bei der Karte „West oder Ost“ vergleichst du stattdessen innerhalb gleicher Wirtschaftslage: Gruppen aus ep01 mit rec() bilden, dann je Gruppe filter(lage == …) und goodman_gamma().',
    concept: { id: 'cramers_v', label: 'Cramér-V' },
  },
  ordinal: {
    think: 'Geordnete Stufen ohne gleiche Abstände: Welche Maße nutzen nur die Reihenfolge? Wie nimmst du die Ost-Überquote aus dem Spiel?',
    pointer: 'goodman_gamma() und kendall_tau() nutzen die Rangfolge; kendall_tau() erst nach unlabel() (sonst sehr langsam). Mit weights = wghtpew rechnest du für Deutschland.',
    concept: { id: 'kendall_tau', label: 'Kendall Tau-b' },
  },
  metrisch: {
    think: 'Viele Stufen mit gleichen Abständen: Welches Maß nutzt die Abstände selbst? Wie nimmst du die Ost-Überquote aus dem Spiel?',
    pointer: 'pearson_cor() rechnet mit weights = wghtpew gewichtet; spearman_rho() nutzt Gewichte nur zur Fallauswahl.',
    concept: { id: 'pearson', label: 'Pearson-Korrelation' },
  },
};
export const WORKSHOP = '7 Uni- und Bivariate Analyse (Gewichtung, Zusammenhangsmaße)';
