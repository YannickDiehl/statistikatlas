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
  /** Denkanstoß je nach Sortierung (keine Musterlösung). */
  onBefore: string;
  onAfter: string;
  /** Kann eine Folge des Umzugs sein (heute gemessen). */
  consequence: boolean;
};

export const CONTROLS: Control[] = [
  { id: 'age', title: 'Alter', source: 'age', consequence: false,
    onBefore: 'Das Alter steht fest, bevor jemand umzieht – und wer älter ist, hat andere Jahrgänge erlebt.', onAfter: 'Kann ein Umzug das Alter ändern?' },
  { id: 'frau', title: 'Geschlecht (Frau)', source: 'sex', rules: '1=0 [Mann]; 2=1 [Frau]; else=NA', map: x => (x === 1 ? 0 : x === 2 ? 1 : null), consequence: false,
    onBefore: 'Das Geschlecht steht vor dem Umzug fest.', onAfter: 'Kann ein Umzug das Geschlecht ändern?' },
  { id: 'abi', title: 'Abitur', source: 'educ', rules: '1:3=0 [kein Abitur]; 4:5=1 [(Fach-)Abitur]; else=NA', map: x => (x >= 1 && x <= 3 ? 0 : x === 4 || x === 5 ? 1 : null), consequence: false,
    onBefore: 'Den Schulabschluss macht man meist in der Jugend – also dort, wo man aufgewachsen ist, vor dem Umzug.', onAfter: 'Wo macht man meist den Schulabschluss: vor oder nach einem Umzug im Erwachsenenalter?' },
  { id: 'di08c', title: 'Einkommen heute', source: 'di08c', consequence: true,
    onBefore: 'Das Einkommen wird heute gemessen – nach dem Umzug. Kann der Umzug es verändert haben?', onAfter: 'Gut begründet: Wer für eine Stelle umzieht, verdient danach oft anders.' },
  { id: 'ep03', title: 'Eigene wirtschaftliche Lage', source: 'ep03', consequence: true,
    onBefore: 'Die eigene Lage wird heute eingeschätzt – nach dem Umzug. Kann der Umzug sie verändert haben?', onAfter: 'Gut begründet: Die heutige Lage kann eine Folge des Umzugs sein.' },
  { id: 'pt03', title: 'Vertrauen in den Bundestag', source: 'pt03', consequence: true,
    onBefore: 'Vertrauen wird heute gemessen und hängt eng mit der Demokratiezufriedenheit zusammen. Stand es wirklich vor dem Umzug fest?', onAfter: 'Gut begründet: Vertrauen kann sich mit dem neuen Ort ändern – und misst fast dasselbe wie die Zufriedenheit.' },
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
    pointer: 'to_dummy(dg03) legt einmal alle vier Dummies an (dg03_1 … dg03_4). Ins Modell kommen drei – die weggelassene Gruppe ist die Referenz. Nie alle vier zugleich: Dummyfalle.',
    concept: { id: 'dummy', label: 'Dummyvariablen' },
  },
  controls: {
    think: 'Was stand fest, bevor jemand umzog? Nur solche Merkmale können gemeinsame Ursache von Umzug und Zufriedenheit sein.',
    pointer: 'crosstab(dg03, abi, percentages = "row", weights = wghtpew) zeigt, wer umzieht. Kontrollen nimmst du mit + ins Modell auf.',
    concept: { id: 'confounding', label: 'Confounding · gemeinsame Ursachen' },
  },
  interaction: {
    think: 'Zwei Merkmale: im Osten aufgewachsen (ostjugend) und im Osten wohnend (ost). Die Ost-Bleibenden haben beide. Ist ihre Lücke mehr als die Summe der beiden einzelnen?',
    pointer: 'ost * ostjugend schreibt ost + ostjugend + ost:ostjugend. Der Interaktionskoeffizient steht in der Zeile ost:ostjugend.',
    concept: { id: 'interaction', label: 'Interaktion' },
  },
};
