import type { Analysis, AnalysisResult, MissingMode, Range } from './analysis';

export type Choice = {
  item: string;
  positive: number[];
  cut: number;
  comparison: string;
  missing: MissingMode;
  exclude: number[];
  weighted: boolean;
};

export type Category = { code: number; label: string };
export type ItemOption = {
  variable: string;
  title: string;
  question: string;
  categories: Category[];
  strict: number[];
  wide: number[];
  split: boolean;
  yes: string;
  no: string;
};
export type Level = { label: string; apply: (c: Choice) => Choice };
export type Dimension = { id: string; label: string; levels: Level[] };
export type MissingOption = { id: string; label: string; mode: MissingMode };
export type FixedOutcome = { variable: string; codes: number[]; positive: number[]; yes: string; no: string };

export type Claim = {
  id: 'jugend' | 'osten' | 'nichtwahl';
  quote: string;
  source: string;
  gaps: [string, string][];
  itemRole: 'outcome' | 'group';
  itemPrompt: string;
  items: ItemOption[];
  comparisons: { id: string; label: string }[];
  cutRange: [number, number] | null;
  missingOptions: MissingOption[];
  requiredVariables: string[];
  defaults: Choice;
  fixedOutcome: FixedOutcome | null;
  groupLabels: (c: Choice, item: ItemOption) => [string, string];
  outcomeLabels: (c: Choice, item: ItemOption) => [string, string];
  rNames: { group: string; outcome: string };
  analysis: (c: Choice, item: ItemOption) => Analysis;
  dimensions: Dimension[];
  temporal: boolean;
  intention: boolean;
  midpoint: number | null;
  /** Denkanstoß der Gegenfrage „Du nennst eine Ursache.“ */
  causalHint: string;
  core: { label: string; test: (r: AnalysisResult) => boolean };
};

export const toRanges = (codes: number[]): Range[] => {
  const sorted = [...new Set(codes)].sort((a, b) => a - b), out: Range[] = [];
  for (const c of sorted) {
    const last = out[out.length - 1];
    if (last && c === last[1] + 1) last[1] = c; else out.push([c, c]);
  }
  return out;
};

const scale = (from: number, to: number, labels: Record<number, string>): Category[] =>
  Array.from({ length: to - from + 1 }, (_, i) => ({ code: from + i, label: labels[from + i] ?? String(from + i) }));

export function itemOf(claim: Claim, variable: string): ItemOption {
  const item = claim.items.find(i => i.variable === variable);
  if (!item) throw new Error(`Item ${variable} gehört nicht zu ${claim.id}.`);
  return item;
}

const itemLevels = (items: ItemOption[]): Level[] =>
  items.map(i => ({ label: i.variable, apply: c => ({ ...c, item: i.variable, positive: i.strict }) }));
const weightLevels: Level[] = [
  { label: 'gewichtet', apply: c => ({ ...c, weighted: true }) },
  { label: 'ungewichtet', apply: c => ({ ...c, weighted: false }) },
];
const thresholdLevels = (claim: () => Claim, strictLabel: string, wideLabel: string): Level[] => [
  { label: strictLabel, apply: c => ({ ...c, positive: itemOf(claim(), c.item).strict }) },
  { label: wideLabel, apply: c => ({ ...c, positive: itemOf(claim(), c.item).wide }) },
];
const outcomeOf = (c: Choice): Analysis['outcome'] => ({ variable: c.item, positive: c.positive, exclude: c.exclude, missing: c.missing });

const interestItems: ItemOption[] = [
  {
    variable: 'pa02a', title: 'Politisches Interesse',
    question: 'Wie stark interessieren Sie sich für Politik? Sehr stark, stark, mittel, wenig oder überhaupt nicht?',
    categories: scale(1, 5, { 1: 'sehr stark', 2: 'stark', 3: 'mittel', 4: 'wenig', 5: 'überhaupt nicht' }),
    strict: [1, 2], wide: [1, 2, 3], split: false, yes: 'interessiert', no: 'nicht interessiert',
  },
  {
    variable: 'li07', title: 'Wichtigkeit von Politik',
    question: 'Wie wichtig ist Ihnen der Lebensbereich Politik und öffentliches Leben? (1 unwichtig bis 7 sehr wichtig)',
    categories: scale(1, 7, { 1: '1 unwichtig', 7: '7 sehr wichtig' }),
    strict: [6, 7], wide: [5, 6, 7], split: false, yes: 'Politik wichtig', no: 'Politik nicht wichtig',
  },
];

const trustScale = scale(1, 7, { 1: '1 gar kein Vertrauen', 7: '7 großes Vertrauen' });
const trustItems: ItemOption[] = [
  ['pt03', 'Vertrauen in den Bundestag'],
  ['pt12', 'Vertrauen in die Bundesregierung'],
  ['pt15', 'Vertrauen in die Parteien'],
].map(([variable, title]) => ({
  variable, title,
  question: `${title}: 1 gar kein Vertrauen bis 7 großes Vertrauen. Nur einem Teil der Befragten gestellt (Fragebogensplit).`,
  categories: trustScale, strict: [6, 7], wide: [5, 6, 7], split: true, yes: 'vertraut', no: 'vertraut nicht',
}));

const distrustItems: ItemOption[] = [
  {
    variable: 'pe01', title: 'Politiker kümmern sich nicht um meine Gedanken',
    question: '„Die Politiker kümmern sich nicht viel darum, was Leute wie ich denken.“ Stimme voll zu bis stimme gar nicht zu. Nur einem Teil der Befragten gestellt (Fragebogensplit).',
    categories: scale(1, 4, { 1: 'stimme voll zu', 2: 'stimme eher zu', 3: 'stimme eher nicht zu', 4: 'stimme gar nicht zu' }),
    strict: [1], wide: [1, 2], split: true, yes: 'misstraut', no: 'übrige',
  },
  {
    variable: 'pa35', title: 'Politiker vertreten nur die Reichen',
    question: '„Politiker vertreten nur die Interessen der Reichen.“ Stimme voll zu bis lehne ganz ab. Nur einem Teil der Befragten gestellt (Fragebogensplit).',
    categories: scale(1, 5, { 1: 'stimme voll zu', 2: 'stimme eher zu', 3: 'teils/teils', 4: 'lehne eher ab', 5: 'lehne ganz ab' }),
    strict: [1], wide: [1, 2], split: true, yes: 'misstraut', no: 'übrige',
  },
];

const ageComparison: Record<string, (cut: number) => Range> = {
  older: cut => [cut + 1, Infinity],
  mid: () => [40, 59],
  senior: () => [60, Infinity],
};
const ageLabel: Record<string, (cut: number) => string> = {
  older: cut => `${cut + 1} und älter`,
  mid: () => '40–59',
  senior: () => '60 und älter',
};

export const jugend: Claim = {
  id: 'jugend',
  quote: 'Die Jungen interessieren sich doch gar nicht mehr für Politik.',
  source: 'Gast in einer Polit-Talkshow (fiktiv)',
  gaps: [
    ['Wer genau?', 'die Jungen = ?'],
    ['Was genau?', 'Interesse = ?'],
    ['Wie viel heißt „gar nicht“?', 'niemand? weniger als die Hälfte?'],
    ['Im Vergleich zu wem?', 'zu den Älteren? zu früher?'],
    ['„Nicht mehr“ – seit wann?', 'Veränderung seit …?'],
  ],
  itemRole: 'outcome',
  itemPrompt: 'Was misst „Interesse“?',
  items: interestItems,
  comparisons: [{ id: 'older', label: 'allen Älteren' }, { id: 'mid', label: '40 bis 59' }, { id: 'senior', label: '60 und älter' }],
  cutRange: [20, 39],
  missingOptions: [
    { id: 'drop', label: 'ausschließen', mode: { mode: 'drop' } },
    { id: 'no', label: 'als „nein“ zählen', mode: { mode: 'allAsNo' } },
  ],
  requiredVariables: ['age', 'pa02a', 'li07', 'wghtpew'],
  defaults: { item: 'pa02a', positive: [1, 2], cut: 29, comparison: 'older', missing: { mode: 'drop' }, exclude: [], weighted: false },
  fixedOutcome: null,
  groupLabels: c => [`18–${c.cut}`, ageLabel[c.comparison](c.cut)],
  outcomeLabels: (_c, item) => [item.yes, item.no],
  rNames: { group: 'altersgruppe', outcome: 'interessiert' },
  analysis: c => ({
    group: { variable: 'age', target: [[18, c.cut]], comparison: [ageComparison[c.comparison](c.cut)] },
    outcome: outcomeOf(c),
    weighted: c.weighted,
  }),
  dimensions: [],
  temporal: true,
  intention: false,
  midpoint: null,
  causalHint: 'Liegt es an der Lebensphase (Ausbildung, Umzug, Berufseinstieg), oder ist diese Generation anders und bleibt es? Eine einzige Befragung kann Alter und Generation nicht trennen.',
  core: { label: '„Die meisten Jungen interessieren sich nicht“', test: r => r.target < 0.5 },
};
jugend.dimensions = [
  { id: 'item', label: 'Item', levels: itemLevels(interestItems) },
  { id: 'cut', label: 'Altersgrenze', levels: [24, 29, 34].map(cut => ({ label: `bis ${cut}`, apply: (c: Choice) => ({ ...c, cut }) })) },
  { id: 'comparison', label: 'Vergleichsgruppe', levels: jugend.comparisons.map(k => ({ label: k.label, apply: (c: Choice) => ({ ...c, comparison: k.id }) })) },
  { id: 'threshold', label: 'Schwelle für „ja“', levels: thresholdLevels(() => jugend, 'streng', 'weit') },
  { id: 'weighted', label: 'Gewichtung', levels: weightLevels },
];

export const osten: Claim = {
  id: 'osten',
  quote: 'Im Osten vertraut kaum noch jemand dem Bundestag.',
  source: 'Social-Media-Post, tausendfach geteilt (fiktiv)',
  gaps: [
    ['Wer genau?', '„der Osten“ = ?'],
    ['Was genau?', 'Vertrauen = ?'],
    ['Wie viel heißt „kaum jemand“?', 'unter 10 %? unter 20 %?'],
    ['Im Vergleich zu wem?', 'zum Westen? zu früher?'],
    ['„Noch“ – seit wann?', 'Veränderung seit …?'],
  ],
  itemRole: 'outcome',
  itemPrompt: 'Was misst „Vertrauen in den Bundestag“?',
  items: trustItems,
  comparisons: [{ id: 'west', label: 'Westen' }],
  cutRange: null,
  missingOptions: [
    { id: 'drop', label: 'ausschließen', mode: { mode: 'drop' } },
    { id: 'no', label: 'als „nein“ zählen', mode: { mode: 'allAsNo' } },
  ],
  requiredVariables: ['eastwest', 'pt03', 'pt12', 'pt15', 'wghtpew'],
  defaults: { item: 'pt03', positive: [5, 6, 7], cut: 0, comparison: 'west', missing: { mode: 'drop' }, exclude: [], weighted: false },
  fixedOutcome: null,
  groupLabels: () => ['Osten', 'Westen'],
  outcomeLabels: (_c, item) => [item.yes, item.no],
  rNames: { group: 'region', outcome: 'vertrauen' },
  analysis: c => ({
    group: { variable: 'eastwest', target: [[2, 2]], comparison: [[1, 1]] },
    outcome: outcomeOf(c),
    weighted: c.weighted,
  }),
  dimensions: [],
  temporal: true,
  intention: false,
  midpoint: 4,
  causalHint: 'Osten und Westen unterscheiden sich auch in Alter, Einkommen und Erfahrungen mit Arbeitslosigkeit. Wie viel vom Unterschied bliebe, wenn man Gleichaltrige mit gleichem Einkommen vergleicht?',
  core: { label: '„Kaum jemand im Osten vertraut“ (unter 20 %)', test: r => r.target < 0.2 },
};
osten.dimensions = [
  { id: 'item', label: 'Item', levels: itemLevels(trustItems) },
  { id: 'threshold', label: 'Schwelle für „vertraut“', levels: thresholdLevels(() => osten, '6–7', '5–7') },
  {
    id: 'midpoint', label: 'Mittelkategorie 4', levels: [
      { label: 'ausgeschlossen', apply: c => ({ ...c, exclude: [4] }) },
      { label: 'als „vertraut nicht“', apply: c => ({ ...c, exclude: [] }) },
    ],
  },
  { id: 'weighted', label: 'Gewichtung', levels: weightLevels },
];

export const nichtwahl: Claim = {
  id: 'nichtwahl',
  quote: 'Wer Politikern misstraut, geht gar nicht mehr wählen.',
  source: 'Pressemitteilung eines Parteivorstands (fiktiv)',
  gaps: [
    ['Wer genau?', '„wer misstraut“ = ?'],
    ['Was genau?', '„nicht wählen“ = ?'],
    ['Wie viel heißt „gar nicht“?', 'alle? die meisten?'],
    ['Im Vergleich zu wem?', 'zu denen, die vertrauen?'],
    ['„Nicht mehr“ – seit wann?', 'Veränderung seit …?'],
  ],
  itemRole: 'group',
  itemPrompt: 'Was misst „Politikern misstrauen“?',
  items: distrustItems,
  comparisons: [{ id: 'rest', label: 'alle übrigen' }],
  cutRange: null,
  missingOptions: [
    { id: 'drop', label: 'nur „würde nicht wählen“', mode: { mode: 'drop' } },
    { id: 'dk', label: '+ „weiß nicht“', mode: { mode: 'codesAsYes', codes: [-8] } },
    { id: 'dkref', label: '+ „weiß nicht“ + „verweigert“', mode: { mode: 'codesAsYes', codes: [-8, -7] } },
  ],
  requiredVariables: ['pe01', 'pa35', 'pv01', 'wghtpew'],
  defaults: { item: 'pe01', positive: [1], cut: 0, comparison: 'rest', missing: { mode: 'drop' }, exclude: [], weighted: false },
  fixedOutcome: { variable: 'pv01', codes: [1, 2, 3, 4, 6, 42, 90, 91], positive: [91], yes: 'nicht wählen', no: 'wählen' },
  groupLabels: (_c, item) => [item.yes, item.no],
  outcomeLabels: () => ['nicht wählen', 'wählen'],
  rNames: { group: 'misstrauen', outcome: 'nichtwahl' },
  analysis: (c, item) => {
    const rest = item.categories.map(k => k.code).filter(k => !c.positive.includes(k) && !c.exclude.includes(k));
    return {
      group: { variable: c.item, target: toRanges(c.positive), comparison: toRanges(rest) },
      outcome: { variable: 'pv01', positive: [91], exclude: [], missing: c.missing },
      weighted: c.weighted,
    };
  },
  dimensions: [],
  temporal: true,
  intention: true,
  midpoint: null,
  causalHint: 'Bildung, politisches Interesse oder Alter könnten beides erklären. Und vielleicht läuft es umgekehrt: Wer ohnehin nicht wählt, begründet das mit Misstrauen.',
  core: { label: '„Die meisten Misstrauenden wollen nicht wählen“', test: r => r.target > 0.5 },
};
nichtwahl.dimensions = [
  { id: 'item', label: 'Item', levels: itemLevels(distrustItems) },
  { id: 'threshold', label: 'Schwelle für „misstraut“', levels: thresholdLevels(() => nichtwahl, 'nur voll', 'voll oder eher') },
  { id: 'missing', label: 'Wer zählt als Nichtwahl', levels: nichtwahl.missingOptions.map(o => ({ label: o.label, apply: (c: Choice) => ({ ...c, missing: o.mode }) })) },
  { id: 'weighted', label: 'Gewichtung', levels: weightLevels },
];

export const claims: Claim[] = [jugend, osten, nichtwahl];
export const claimById: Record<Claim['id'], Claim> = { jugend, osten, nichtwahl };
