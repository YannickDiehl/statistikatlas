/** dg03: Jugend in Ost oder West × Interview in Ost oder West (Codes wie im ALLBUS). */
export type GroupId = 1 | 2 | 3 | 4;
export const GROUP_IDS: GroupId[] = [1, 2, 3, 4];
export type Group = { id: GroupId; short: string; label: string; dummy: string };
export const GROUPS: Record<GroupId, Group> = {
  1: { id: 1, short: 'Ost-Bleibende', label: 'im Osten aufgewachsen, lebt im Osten', dummy: 'dg03_1' },
  2: { id: 2, short: 'Ost→West', label: 'im Osten aufgewachsen, lebt im Westen', dummy: 'dg03_2' },
  3: { id: 3, short: 'West→Ost', label: 'im Westen aufgewachsen, lebt im Osten', dummy: 'dg03_3' },
  4: { id: 4, short: 'West-Bleibende', label: 'im Westen aufgewachsen, lebt im Westen', dummy: 'dg03_4' },
};
export const MOVERS: GroupId[] = [2, 3];

/** Was die beiden Lager für die vier Gruppen erwarten (höher = zufriedener). */
export const TEMPLATE: Record<GroupId, { praegung: string; ort: string }> = {
  1: { praegung: 'unzufriedener', ort: 'unzufriedener' },
  2: { praegung: 'unzufriedener – wie die Ost-Bleibenden', ort: 'zufriedener – wie die West-Bleibenden' },
  3: { praegung: 'zufriedener – wie die West-Bleibenden', ort: 'unzufriedener – wie die Ost-Bleibenden' },
  4: { praegung: 'zufriedener', ort: 'zufriedener' },
};

export type ControlId = 'age' | 'frau' | 'abi' | 'di08c' | 'ep03' | 'pt03';
export type Control = {
  id: ControlId;
  title: string;
  source: string;
  /** Umkodierung wie in R (rec(source, rules = …)); ohne: Variable wie sie ist. */
  rules?: string;
  map?: (x: number) => number | null;
  /** Ein Argument für „stand vor dem Umzug fest“ und eines für „kann Folge des Umzugs sein“ – beide werden gezeigt, keine Musterlösung. */
  before: string;
  after: string;
  /** Heute gemessen, kann eine Folge des Umzugs sein (für die Gegenfrage zum Off-Text). */
  consequence: boolean;
};

export const CONTROLS: Control[] = [
  { id: 'age', title: 'Alter', source: 'age', consequence: false,
    before: 'Das Alter steht fest, bevor jemand umzieht.', after: 'Wann jemand umzieht, hängt am Lebensalter – aber verändert ein Umzug das Alter?' },
  { id: 'frau', title: 'Geschlecht (Frau)', source: 'sex', rules: '1=0 [Mann]; 2=1 [Frau]; else=NA', map: x => (x === 1 ? 0 : x === 2 ? 1 : null), consequence: false,
    before: 'Das Geschlecht steht vor dem Umzug fest.', after: 'Frauen und Männer ziehen vielleicht unterschiedlich oft um – macht das das Geschlecht zur Folge des Umzugs?' },
  { id: 'abi', title: 'Abitur', source: 'educ', rules: '1:3=0 [kein Abitur]; 4:5=1 [(Fach-)Abitur]; else=NA', map: x => (x >= 1 && x <= 3 ? 0 : x === 4 || x === 5 ? 1 : null), consequence: false,
    before: 'Den Schulabschluss macht man meist in der Jugend – dort, wo man aufgewachsen ist.', after: 'Manche holen einen Abschluss später nach, auch nach einem Umzug.' },
  { id: 'di08c', title: 'Einkommen heute', source: 'di08c', consequence: true,
    before: 'Wer mehr verdient, kann leichter umziehen – das Einkommen könnte schon vorher eine Rolle gespielt haben.', after: 'Das Einkommen wird heute gemessen; wer für eine Stelle umzieht, verdient danach oft anders.' },
  { id: 'ep03', title: 'Eigene wirtschaftliche Lage', source: 'ep03', consequence: true,
    before: 'Wer wirtschaftlich gut dasteht, zieht vielleicht eher um.', after: 'Die eigene Lage wird heute eingeschätzt, nach dem Umzug – der Umzug kann sie verändert haben.' },
  { id: 'pt03', title: 'Vertrauen in den Bundestag', source: 'pt03', consequence: true,
    before: 'Vertrauen in Institutionen bringt man vielleicht aus der Jugend mit.', after: 'Vertrauen wird heute gemessen, kann sich am neuen Ort ändern und misst fast dasselbe wie die Zufriedenheit.' },
];
export const CONTROL_IDS = CONTROLS.map(c => c.id);
export const controlById = Object.fromEntries(CONTROLS.map(c => [c.id, c])) as Record<ControlId, Control>;
/** Die Kontrollen der Lösung: nur, was vor dem Umzug feststand. */
export const COMMON_CAUSES: ControlId[] = ['age', 'frau', 'abi'];

export const SORTS = ['vorher', 'folge'] as const;
export type Sort = typeof SORTS[number];
export const SORT_LABEL: Record<Sort, string> = { vorher: 'stand vor dem Umzug fest', folge: 'kann Folge des Umzugs sein' };

export const ROLE = {
  desk: 'Doku-Redaktion „Zweiufer“',
  editor: 'Mara Lindqvist',
  film: 'Mitgenommen',
};

/** Höchstens so viele Wörter hat der Off-Text-Satz. */
export const MAX_WORDS = 30;
/** Wackeltest: ohne so viele Fälle, die einen Koeffizienten am stärksten nach oben bzw. unten ziehen. */
export const WOBBLE_K = 5;

export const WORKSHOP = '11 Regression vertiefen (Dummies, Kontrollen, Interaktion)';

export const hints = {
  model: {
    think: 'Vier Gruppen: Wie viele 0/1-Variablen brauchst du, damit jede Gruppe erkennbar ist? Woran erkennt man die Gruppe, bei der alle null sind?',
    pointer: 'to_dummy() legt einmal für jede der vier Gruppen eine 0/1-Variable an (dg03_1 … dg03_4). Ins Modell kommen drei – die weggelassene Gruppe ist die Referenz. Nie alle vier zugleich: Dummyfalle.',
    concept: { id: 'dummy', label: 'Dummyvariablen' },
  },
  controls: {
    think: 'Was stand fest, bevor jemand umzog? Nur solche Merkmale können gemeinsame Ursache von Umzug und Zufriedenheit sein.',
    pointer: 'crosstab() zeigt, wer umzieht – mit Zeilenprozenten (Argument percentages) und Gewicht. Kontrollen nimmst du mit + ins Modell auf. Wird die Formel sehr lang (über 60 Zeichen), bricht summary() in mariposa 0.7.3 mit „length = 2 in coercion to logical(1)“ ab – speichere das Modell dann und lass dir as.data.frame(modell$coef_table) zeigen.',
    concept: { id: 'confounding', label: 'Confounding · gemeinsame Ursachen' },
  },
  counter: {
    think: 'Dasselbe Modell, nur eine andere abhängige Variable: Was steht links vom ~?',
    pointer: 'Die drei Dummies bleiben dieselben wie bei deiner Referenz; links steht pt03 statt demo. pt03 wird nicht umgepolt (höher = mehr Vertrauen).',
    concept: { id: 'dummy', label: 'Dummyvariablen' },
  },
  interaction: {
    think: 'Zwei Merkmale: im Osten aufgewachsen (ostjugend) und im Osten wohnend (ost). Die Ost-Bleibenden haben beide. Ist ihre Lücke mehr als die Summe der beiden einzelnen?',
    pointer: 'Ein * zwischen zwei Variablen schreibt R als beide Einzeleffekte plus ihre Interaktion. Den Interaktionskoeffizienten findest du in der Zeile mit dem Doppelpunkt.',
    concept: { id: 'interaction', label: 'Interaktion' },
  },
};
