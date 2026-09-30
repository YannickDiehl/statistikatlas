export type InputId = 'age' | 'pa02a' | 'hs01' | 'pa01' | 'id02' | 'ls01' | 'ep03' | 'pe01' | 'ep01' | 'pt03';

export type InputItem = {
  id: InputId;
  title: string;
  /** Die Frage, die der Automat den Besucher:innen stellt. */
  ask: string;
  /** Skala in Worten (wie im Codebuch). */
  scale: string;
  /** Zwei Eingaben, für die die Kuratorin die Anzeige von Hand nachrechnet. */
  probe: [number, number];
  /** Namen einzelner Stufen (sonst „Eingabe x“). */
  levels?: Record<number, string>;
  /** Streuung je Gruppe statt je Wert (Alter: fünf Altersgruppen wie im Konzept). */
  groups?: { name: string; rules: string; map: (x: number) => number | null; labels: string[] };
  /** Gegenfrage zu Kausalwörtern auf dem Schild. */
  otherWay: string;
  /** Was die Eingabe 0 bedeutet (Konstante). */
  zero: string;
};

const ageGroup = (x: number) => (x >= 18 && x <= 29 ? 1 : x >= 30 && x <= 44 ? 2 : x >= 45 && x <= 59 ? 3 : x >= 60 && x <= 74 ? 4 : x >= 75 ? 5 : null);

/** Die zehn vorbereiteten Eingabefragen (im Seminar nach Sitzreihen verteilt), in der Reihenfolge der Automaten-Parade. */
export const INPUTS: InputItem[] = [
  { id: 'age', title: 'Alter', ask: 'Wie alt bist du?', scale: 'Alter in Jahren (18 bis 99)', probe: [18, 80],
    groups: { name: 'alter_gruppe', rules: '18:29=1 [18-29]; 30:44=2 [30-44]; 45:59=3 [45-59]; 60:74=4 [60-74]; 75:max=5 [75+]', map: ageGroup, labels: ['18–29', '30–44', '45–59', '60–74', '75+'] },
    otherWay: 'Macht das Alter zufrieden – oder haben Jahrgänge Verschiedenes erlebt?', zero: 'Alter 0 wäre ein Neugeborenes – die Konstante ist hier keine Anzeige, die je erscheint.' },
  { id: 'pa02a', title: 'Politisches Interesse', ask: 'Wie stark interessierst du dich für Politik?', scale: '1 = sehr stark … 5 = überhaupt nicht', probe: [1, 5],
    levels: { 1: 'sehr stark', 2: 'stark', 3: 'mittel', 4: 'wenig', 5: 'überhaupt nicht' },
    otherWay: 'Macht Interesse zufrieden – oder interessiert man sich eher, wenn man unzufrieden ist?', zero: 'Eingabe 0 gibt es auf dieser Skala gar nicht (1 bis 5).' },
  { id: 'hs01', title: 'Gesundheit', ask: 'Wie ist dein Gesundheitszustand?', scale: '1 = sehr gut … 5 = schlecht', probe: [1, 4],
    levels: { 1: 'sehr gut', 2: 'gut', 3: 'zufriedenstellend', 4: 'weniger gut', 5: 'schlecht' },
    otherWay: 'Macht Gesundheit zufrieden mit der Demokratie – oder stecken Alter und Einkommen hinter beidem?', zero: 'Eingabe 0 gibt es auf dieser Skala gar nicht (1 bis 5).' },
  { id: 'pa01', title: 'Links-rechts-Selbsteinstufung', ask: 'Wo stehst du politisch, von 1 (links) bis 10 (rechts)?', scale: '1 = links … 10 = rechts', probe: [1, 10],
    levels: { 1: 'ganz links', 10: 'ganz rechts' },
    otherWay: 'Macht eine Position zufrieden – oder ordnet man sich je nach Zufriedenheit anders ein?', zero: 'Eingabe 0 gibt es auf dieser Skala gar nicht (1 bis 10).' },
  { id: 'id02', title: 'Schicht', ask: 'Welcher Schicht rechnest du dich selbst zu?', scale: '1 = Unterschicht … 5 = Oberschicht', probe: [2, 4],
    levels: { 1: 'Unterschicht', 2: 'Arbeiterschicht', 3: 'Mittelschicht', 4: 'obere Mittelschicht', 5: 'Oberschicht' },
    otherWay: 'Macht die Schicht zufrieden – oder hängen beide an Bildung und Einkommen?', zero: 'Eingabe 0 gibt es auf dieser Skala gar nicht (1 bis 5).' },
  { id: 'ls01', title: 'Lebenszufriedenheit', ask: 'Wie zufrieden bist du alles in allem mit deinem Leben?', scale: '0 = ganz unzufrieden … 10 = ganz zufrieden', probe: [0, 8],
    levels: { 0: 'ganz unzufrieden', 10: 'ganz zufrieden' },
    otherWay: 'Macht ein zufriedenes Leben zufrieden mit der Demokratie – oder färbt beides aufeinander ab?', zero: 'Eingabe 0 gibt es hier wirklich: Die Konstante ist die Anzeige für „ganz unzufrieden“.' },
  { id: 'ep03', title: 'Eigene wirtschaftliche Lage', ask: 'Wie ist deine eigene wirtschaftliche Lage heute?', scale: '1 = sehr gut … 5 = sehr schlecht', probe: [2, 4],
    levels: { 1: 'sehr gut', 2: 'gut', 3: 'teils/teils', 4: 'schlecht', 5: 'sehr schlecht' },
    otherWay: 'Macht die eigene Lage zufrieden – oder sieht man alles etwas düsterer, wenn man unzufrieden ist?', zero: 'Eingabe 0 gibt es auf dieser Skala gar nicht (1 bis 5).' },
  { id: 'pe01', title: '„Politiker kümmern sich nicht“', ask: 'Politiker kümmern sich nicht darum, was Leute wie ich denken – stimmst du zu?', scale: '1 = stimme voll zu … 4 = stimme gar nicht zu', probe: [1, 4],
    levels: { 1: 'stimme voll zu', 2: 'stimme eher zu', 3: 'stimme eher nicht zu', 4: 'stimme gar nicht zu' },
    otherWay: 'Macht das Gefühl, gehört zu werden, zufrieden – oder misst die Frage fast dasselbe wie die Zufriedenheit?', zero: 'Eingabe 0 gibt es auf dieser Skala gar nicht (1 bis 4).' },
  { id: 'ep01', title: 'Wirtschaftslage in Deutschland', ask: 'Wie ist die wirtschaftliche Lage in Deutschland heute?', scale: '1 = sehr gut … 5 = sehr schlecht', probe: [2, 4],
    levels: { 1: 'sehr gut', 2: 'gut', 3: 'teils/teils', 4: 'schlecht', 5: 'sehr schlecht' },
    otherWay: 'Macht die Wirtschaftslage zufrieden – oder beurteilt man die Lage je nach Stimmung anders?', zero: 'Eingabe 0 gibt es auf dieser Skala gar nicht (1 bis 5).' },
  { id: 'pt03', title: 'Vertrauen in den Bundestag', ask: 'Wie viel Vertrauen hast du in den Bundestag?', scale: '1 = gar kein Vertrauen … 7 = großes Vertrauen', probe: [2, 6],
    levels: { 1: 'gar kein Vertrauen', 7: 'großes Vertrauen' },
    otherWay: 'Macht Vertrauen zufrieden – oder geht es auch umgekehrt?', zero: 'Eingabe 0 gibt es bei pt03 gar nicht (1 bis 7) – die Konstante zeigt der Automat nie an.' },
];
export const INPUT_IDS = INPUTS.map(i => i.id);
export const inputById = Object.fromEntries(INPUTS.map(i => [i.id, i])) as Record<InputId, InputItem>;

export const DECISIONS = ['freigeben', 'nur mit Schild freigeben', 'andere Frage vorschlagen'] as const;
export type Decision = typeof DECISIONS[number];

export const GUESSES = ['Automat', 'Faulpelz', 'beide gleich oft'] as const;
export type Guess = typeof GUESSES[number];

/** Besucherprobe: so viele Befragte zieht eine Besuchergruppe. */
export const PROBE_SIZE = 20;
/** Unter so vielen gemeinsamen Fällen warnt der Browser (Konzept, Risiko 2). */
export const MIN_CASES = 200;

export const ROLE = {
  place: 'Besucherzentrum des Landtags',
  curator: 'Ida Lorenzen',
};

export const WORKSHOP = '10 Lineare Regression';

export const hints = {
  setting: {
    think: 'Der Automat braucht zwei Zahlen: die Anzeige bei Eingabe 0 und die Änderung pro Stufe. Beide stehen in der Koeffiziententabelle (Spalte B). Und was bedeutet bei ps03 die 1?',
    pointer: 'Mit rec(ps03, rules = "rev") polst du um (höher = zufriedener), linear_regression(y ~ x, weights = wghtpew) stellt den Automaten ein; R² steht unter „Model Summary“.',
    concept: { id: 'linear_regression', label: 'Lineare Regression' },
  },
  spread: {
    think: 'Residuum = Antwort minus Anzeige. Vergleiche seine Streuung je Eingabewert: Wo liegt der Automat typischerweise weiter daneben?',
    pointer: 'mutate() bildet anzeige und daneben, describe(daneben, weights = wghtpew, show = c("mean", "sd")) nach group_by() der Eingabe zeigt die SD je Stufe; levene_test() prüft, ob die Streuungen gleich sind.',
    concept: { id: 'variance_assumption', label: 'Gleiche Fehlervarianz' },
  },
};
