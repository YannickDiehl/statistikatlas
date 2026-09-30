import type { Hint } from '../kit/HintLadder';

export const INSTITUTE = 'Institut Wiederfrage';
export const ROLE = 'Panelaufbau im Umfrageinstitut';
export const ROLES = { panel: 'Panelaufbau', qs: 'Qualitätssicherung' } as const;

/** Die vier Fassungen der Einladungsfrage (splt23_3). */
export type VersionId = 'A1' | 'A2' | 'B1' | 'B2';
export type Version = { id: VersionId; code: 1 | 2 | 3 | 4; amount: 5 | 10; repeat: boolean; money: string; placement: string };
export const VERSIONS: Version[] = [
  { id: 'A1', code: 1, amount: 5, repeat: false, money: '5 € bei Teilnahme', placement: 'Geld nur am Schluss der Frage genannt' },
  { id: 'A2', code: 2, amount: 5, repeat: true, money: '5 € bei Teilnahme', placement: 'am Anfang genannt und am Schluss wiederholt' },
  { id: 'B1', code: 3, amount: 10, repeat: false, money: '10 € (5 € fürs Ja, 5 € bei Teilnahme)', placement: 'Geld nur am Schluss der Frage genannt' },
  { id: 'B2', code: 4, amount: 10, repeat: true, money: '10 € (5 € fürs Ja, 5 € bei Teilnahme)', placement: 'am Anfang genannt und am Schluss wiederholt' },
];
export const VERSION_IDS = VERSIONS.map(v => v.id);
export const versionByCode = (code: number) => VERSIONS.find(v => v.code === code) ?? null;
export const versionById = (id: VersionId) => VERSIONS.find(v => v.id === id)!;

/** Die fünf Variablen der Korrelationsmatrix, in der Reihenfolge des Lösungsskripts. */
export const MATRIX_VARS = ['wiederholung', 'betrag', 'papier', 'age', 'zusage'] as const;
export type MatrixVar = typeof MATRIX_VARS[number];
export const MATRIX_LABELS: Record<MatrixVar, string> = { wiederholung: 'wiederholung', betrag: 'betrag', papier: 'papier', age: 'age', zusage: 'zusage' };
export type PairId = 'wiederholung-betrag' | 'wiederholung-papier' | 'wiederholung-age' | 'wiederholung-zusage' | 'betrag-papier' | 'betrag-age'
  | 'betrag-zusage' | 'papier-age' | 'papier-zusage' | 'age-zusage';
export const PAIRS: { id: PairId; a: MatrixVar; b: MatrixVar; i: number; j: number }[] = MATRIX_VARS.flatMap((a, i) =>
  MATRIX_VARS.slice(i + 1).map((b, k) => ({ id: `${a}-${b}` as PairId, a, b, i, j: i + 1 + k })));
export const PAIR_IDS = PAIRS.map(p => p.id);
/** Diese Zellen müssten bei echter Auslosung ≈ 0 sein: Fassungsmerkmale gegen Merkmale, die vor dem Los feststehen, und gegeneinander. */
export const BALANCE_PAIRS: PairId[] = ['wiederholung-betrag', 'wiederholung-papier', 'wiederholung-age', 'betrag-papier', 'betrag-age'];

/** Was eine Zelle der Matrix bedeutet – ohne Zahlen, die kommen aus der Datei. */
export const PAIR_MEANING: Record<PairId, string> = {
  'wiederholung-betrag': 'Beide stammen aus derselben Auslosung. Bei gleich großen Zellen wären sie unabhängig.',
  'wiederholung-papier': 'Wer die Wiederholung bekam, dürfte nicht häufiger online oder auf Papier antworten.',
  'wiederholung-age': 'Das Los kennt das Alter nicht.',
  'wiederholung-zusage': 'Hier darf etwas stehen: Das ist der Effekt, nach dem du suchst – oder etwas, das wie einer aussieht.',
  'betrag-papier': 'Wer 10 € angeboten bekam, dürfte nicht häufiger online oder auf Papier antworten.',
  'betrag-age': 'Das Los kennt das Alter nicht.',
  'betrag-zusage': 'Hier darf etwas stehen: Das ist der Betragseffekt.',
  'papier-age': 'Papier und Alter stehen beide vor der Auslosung fest. Dass sie zusammenhängen, sagt nichts über das Los.',
  'papier-zusage': 'Der Modus ist nicht ausgelost – die Befragten haben ihn selbst gewählt.',
  'age-zusage': 'Das Alter ist nicht ausgelost.',
};

export const R_SETUP = `library(dplyr)
library(mariposa)   # zuletzt laden: haven würde sonst read_spss() überdecken

allbus <- read_spss(file.choose())   # ZA8831_v1-3-0.sav`;

export const R_S1 = `# Station 1 · Erste Auswertung: Im Experiment waren nur die Selbstausfüller:innen (online und Papier)
experiment <- allbus %>%
  filter(mode != 2) %>%
  mutate(
    zusage       = rec(xr21, rules = "1=1 [ja]; 2=0 [nein]; else=NA"),
    betrag       = rec(splt23_3, rules = "1:2=5 [5 Euro]; 3:4=10 [10 Euro]; else=NA"),
    wiederholung = rec(splt23_3, rules = "1=0 [ohne]; 3=0 [ohne]; 2=1 [mit]; 4=1 [mit]; else=NA")
  )
experiment %>% t_test(zusage, group = wiederholung) %>% summary()
experiment %>% t_test(zusage, group = betrag) %>% summary()`;

export const R_S2 = `# Station 2 · Zufallscheck: Was hängt mit der Fassung zusammen, obwohl das Los es nicht dürfte?
experiment <- experiment %>%
  mutate(papier = rec(mode, rules = "3=0 [online]; 4=1 [Papier]; else=NA"))
experiment %>% pearson_cor(wiederholung, betrag, papier, age, zusage) %>%
  summary(pvalue_matrix = FALSE, n_matrix = FALSE)
experiment %>% crosstab(splt23_3, mode, percentages = "none") %>% summary()   # Wer bekam welche Fassung?`;

export const R_S3A = `# Station 3 · Der saubere Vergleich: nur online – so befragt das Institut
# (kein group_by(mode) vor t_test(): auf Papier gibt es kein „mit“, mariposa bricht dann ab)
online <- experiment %>% filter(mode == 3)
online %>% t_test(zusage, group = wiederholung) %>% summary()
online %>% t_test(zusage, group = betrag) %>% summary()`;

export const R_S3B = `# Vier Fassungen auf einmal: ANOVA, danach Tukey für die sechs Paare
online %>% oneway_anova(zusage, group = splt23_3) %>% summary()
online %>% oneway_anova(zusage, group = splt23_3) %>% tukey_test() %>% summary()`;

export const R_WEIGHTED = `# Zweite Enthüllung: dieselbe ANOVA mit Gewicht
online %>% oneway_anova(zusage, group = splt23_3, weights = wghtpew) %>% summary()`;

/** Quote einer Fassung mit 95-%-Intervall: Einstichproben-t-Test ohne group. */
export const rRelease = (code: number) => `# Station 4 · Freigabe: Quote der gewählten Fassung mit 95-%-Intervall (1 = A1, 2 = A2, 3 = B1, 4 = B2)
online %>% filter(splt23_3 == ${code}) %>% t_test(zusage) %>% summary()`;

export const rSolution = (code = 1) => [R_SETUP, R_S1, R_S2, R_S3A, R_S3B, R_WEIGHTED, rRelease(code)].join('\n\n') + '\n';

const WORKSHOP = '5 Datenaufbereitung (rec) · 7.6 Mittelwertvergleiche';

export const hints: Record<'s1' | 's2' | 's3a' | 's3b' | 's4', Hint> = {
  s1: {
    think: 'Im Experiment waren nur Selbstausfüller:innen. Wie wird aus xr21 (1 = ja, 2 = nein) eine Variable, deren Mittelwert die Zusagequote ist? Und wie fasst du die vier Fassungen zu „ohne/mit Wiederholung“ und „5/10 €“ zusammen?',
    pointer: 'filter(mode != 2) behält online (3) und Papier (4). rec() mit else=NA macht aus xr21 eine 0/1-Variable – ihr Mittelwert ist der Anteil der Ja-Antworten. t_test(zusage, group = …) vergleicht zwei Gruppen; summary() zeigt beide Mittelwerte, die Differenz und das Intervall.',
    concept: { id: 't_test', label: 't-Test' },
    workshop: WORKSHOP,
    scaffold: `experiment <- allbus %>%
  filter(mode != ___) %>%
  mutate(
    zusage       = rec(xr21, rules = "1=___ [ja]; 2=___ [nein]; else=NA"),
    betrag       = rec(splt23_3, rules = "1:2=5 [5 Euro]; ___=10 [10 Euro]; else=NA"),
    wiederholung = rec(splt23_3, rules = "1=0 [ohne]; 3=0 [ohne]; ___=1 [mit]; ___=1 [mit]; else=NA")
  )
experiment %>% t_test(zusage, group = ___) %>% summary()
experiment %>% t_test(zusage, group = ___) %>% summary()`,
    solution: `${R_SETUP}\n\n${R_S1}`,
  },
  s2: {
    think: 'Das Los weiß nichts über Alter oder Papier. Welche Zellen der Matrix müssten also nahe 0 liegen?',
    pointer: 'pearson_cor() mit mehreren Variablen liefert eine Matrix. Jede Zelle nutzt alle Fälle, bei denen beide Variablen gültig sind (paarweises n). Für papier bildest du mit rec() aus mode eine 0/1-Variable.',
    concept: { id: 'correlation_matrix', label: 'Korrelationsmatrix' },
    workshop: '7 Bivariate Analyse (Korrelation)',
    scaffold: `experiment <- experiment %>%
  mutate(papier = rec(mode, rules = "3=___ [online]; 4=___ [Papier]; else=NA"))
experiment %>% pearson_cor(wiederholung, betrag, ___, age, zusage) %>%
  summary(pvalue_matrix = FALSE, n_matrix = FALSE)`,
    solution: `${R_SETUP}\n\n${R_S1}\n\n${R_S2}`,
  },
  s3a: {
    think: 'Das Institut befragt nur online. In welcher ALLBUS-Teilgruppe gab es alle vier Fassungen?',
    pointer: 'filter(mode == 3) behält nur die Online-Befragten. Kein group_by(mode) vor t_test(): Auf Papier gibt es kein „mit“, dann bricht mariposa mit einer unverständlichen Meldung ab.',
    concept: { id: 'confounding', label: 'Confounding' },
    workshop: WORKSHOP,
    scaffold: `online <- experiment %>% filter(mode == ___)
online %>% t_test(zusage, group = ___) %>% summary()
online %>% t_test(zusage, group = ___) %>% summary()`,
    solution: `${R_SETUP}\n\n${R_S1}\n\n${R_S3A}`,
  },
  s3b: {
    think: 'Vier Fassungen auf einmal: t_test() vergleicht nur zwei Gruppen. Welcher Test vergleicht vier Mittelwerte – und wie findest du danach heraus, welche Paare sich unterscheiden?',
    pointer: 'oneway_anova(zusage, group = splt23_3) prüft, ob sich irgendeine Fassung unterscheidet. tukey_test() vergleicht danach alle sechs Paare und korrigiert dabei für die Zahl der Vergleiche.',
    concept: { id: 'oneway_anova', label: 'Einfaktorielle ANOVA' },
    workshop: WORKSHOP,
    scaffold: `online %>% oneway_anova(zusage, group = ___) %>% summary()
online %>% oneway_anova(zusage, group = ___) %>% tukey_test() %>% summary()`,
    solution: `${R_SETUP}\n\n${R_S1}\n\n${R_S3A}\n\n${R_S3B}`,
  },
  s4: {
    think: 'Eine Quote ohne Spanne ist ein Versprechen ohne Sicherheitsabstand. Wie breit ist das Intervall für deine Fassung – online?',
    pointer: 'Filtere die Online-Befragten deiner Fassung. t_test(zusage) ohne group zeigt in summary() den Mittelwert (die Quote) mit 95-%-Intervall.',
    concept: { id: 'confidence', label: 'Konfidenzintervall' },
    workshop: '7.6 Mittelwertvergleiche',
    scaffold: 'online %>% filter(splt23_3 == ___) %>% t_test(zusage) %>% summary()',
    solution: rSolution(1),
  },
};

export const TEXTS = {
  zeroOne: 'zusage kennt nur 0 und 1 – normalverteilt ist das nicht. Der t-Test braucht aber keine normalverteilten Einzelwerte, sondern annähernd normalverteilte Mittelwerte: Zöge man immer neue Stichproben dieser Größe, verteilten sich die Anteile fast wie eine Glockenkurve (Stichprobenverteilung). Bei Hunderten Fällen je Gruppe ist das gegeben. Eine Kreuztabelle mit χ² käme hier zur selben Schlussfolgerung.',
  sign: 'mariposa vergleicht die Gruppen in der Reihenfolge, in der sie in den Daten zuerst vorkommen („Groups compared: … vs. …“). Das Vorzeichen von t und der Differenz sagt nur, welche Gruppe vorn steht – trag es ein, wie R es zeigt, oder ohne Minus.',
  codebook: 'Das Codebuch sagt es in einem Nebensatz: Aus Kostengründen gab es auf Papier nur A1 und B1. Online wurden alle vier Fassungen etwa gleich oft gezogen – ausgelost ist also nur innerhalb eines Modus.',
  cells: 'Leicht von 0 verschoben, weil die Zellen ungleich groß sind: Auf Papier fehlen die Fassungen mit Wiederholung. Dann hängen Betrag und Wiederholung rechnerisch ein wenig zusammen, ohne dass das Los versagt hätte.',
  trap: 'Nicht die Wiederholung hat sich verändert, sondern die Vergleichsgruppe.',
  weighted: 'Gewichte sind für Aussagen über die Bevölkerung da. Im Experiment bildet das Los die Gruppen – deshalb rechnen wir ungewichtet. Aber: Wenn eine vertretbare Rechenentscheidung „signifikant“ in „nicht signifikant“ verwandelt, ist der Befund knapp. Das gehört in die Freigabe.',
  profi: 'Profi-Frage: Der Betrag hängt an der Fragebogenhälfte splt23_1 (A1/A2 = Split A, B1/B2 = Split B). Die beiden Hälften hatten auch sonst ein etwas anderes Frageprogramm. Wie sicher ist dann „10 € bringen …“?',
};

export const PLACEHOLDERS = {
  because: 'Die Punkte kommen nicht (nur) von der Wiederholung, weil …',
  notClaimed: 'Was wir nicht behaupten: …',
  signPanel: 'Ich verspreche der Geschäftsführung …, weil …',
  signQs: 'Ich gebe frei, weil … / Veto, weil …',
};
