import type { Hint } from '../kit/HintLadder';

export type ItemId = 'pe01' | 'pa35' | 'pe05';
export type Category = { code: number; label: string };
export type Item = {
  id: ItemId;
  title: string;
  statement: string;
  categories: Category[];
  /** Zustimmung heißt hier Vertrauen: vor dem Zusammenfassen umpolen. */
  reversed: boolean;
  /** Misstrauen eng bzw. weit gefasst, in den Originalcodes. */
  strict: number[];
  wide: number[];
};

const agree4: Category[] = [
  { code: 1, label: 'stimme voll zu' }, { code: 2, label: 'stimme eher zu' },
  { code: 3, label: 'stimme eher nicht zu' }, { code: 4, label: 'stimme gar nicht zu' },
];

export const ITEM_IDS = ['pe01', 'pa35', 'pe05'] as const;
export const ITEMS: Record<ItemId, Item> = {
  pe01: {
    id: 'pe01', title: 'Politiker kümmern sich nicht um Leute wie mich',
    statement: '„Die Politiker kümmern sich nicht viel darum, was Leute wie ich denken.“',
    categories: agree4, reversed: false, strict: [1], wide: [1, 2],
  },
  pa35: {
    id: 'pa35', title: 'Politiker vertreten nur die Reichen',
    statement: '„Politiker vertreten nur die Interessen der Reichen.“',
    categories: [
      { code: 1, label: 'stimme voll zu' }, { code: 2, label: 'stimme eher zu' }, { code: 3, label: 'teils/teils' },
      { code: 4, label: 'lehne eher ab' }, { code: 5, label: 'lehne ganz ab' },
    ],
    reversed: false, strict: [1], wide: [1, 2],
  },
  pe05: {
    id: 'pe05', title: 'Politiker vertreten die Interessen der Bevölkerung',
    statement: '„Die Politiker vertreten die Interessen der Bevölkerung.“',
    categories: agree4, reversed: true, strict: [4], wide: [3, 4],
  },
};

/** Fehlende Angaben der Wahlabsicht, die man als Nichtwahl zählen kann. */
export const NONVOTE_EXTRAS = [
  { code: -8, short: 'wn', label: '„weiß nicht“' },
  { code: -7, short: 'vw', label: '„verweigert“' },
  { code: -9, short: 'ka', label: '„keine Angabe“' },
] as const;
export const NOT_ELIGIBLE = -50;

export const PRESS_RELEASE = '„Wer Politikern misstraut, geht gar nicht mehr wählen. Die Zahlen sind eindeutig: 87 Prozent der Nichtwähler sagen, dass sich Politiker nicht darum kümmern, was Leute wie sie denken. (Quelle: ALLBUS 2023)“';
export const CLAIMED = 87;

export const R_SETUP = `library(dplyr)
library(mariposa)   # zuletzt laden: haven würde sonst read_spss() überdecken

allbus <- read_spss(file.choose())   # ZA8831_v1-3-0.sav`;

export const R_P1 = `${R_SETUP}

# Prüfauftrag 1 · Zahl nachbauen: zwei Dummyvariablen (Kategorien zusammenfassen)
allbus <- allbus %>%
  mutate(
    misstrauen = rec(pe01, rules = "1:2=1 [misstraut]; 3:4=0 [misstraut nicht]; else=NA"),
    nichtwahl  = rec(pv01, rules = "91=1 [würde nicht wählen]; 1:90=0 [würde wählen]; else=NA")
  )
allbus %>% crosstab(misstrauen, nichtwahl, percentages = "col") %>% summary()`;

export const R_P2 = `# Prüfauftrag 2 · Eine Zelle, drei Nenner
allbus %>% crosstab(misstrauen, nichtwahl, percentages = "all") %>% summary()
allbus %>% chi_square(misstrauen, nichtwahl)   # Wiederholung, freiwillig`;

export const R_P3_EXAMPLE = `# Prüfauftrag 3 · Beispiel-Lesart: Gegenprobe pe05 (umpolen), „weiß nicht“ zählt als Nichtwahl
allbus <- allbus %>%
  mutate(
    pe05_r      = rec(pe05, rules = "rev"),   # jetzt 1 = stimme gar nicht zu, wie bei pe01: 1 = Misstrauen
    misstrauen3 = rec(pe05_r, rules = "1:2=1 [misstraut]; 3:4=0 [misstraut nicht]; else=NA"),
    nichtwahl3  = rec(untag_na(pv01),
                      rules = "91=1 [würde nicht wählen]; -8=1; 1:90=0 [würde wählen]; else=NA")
  )
allbus %>% crosstab(misstrauen3, nichtwahl3, percentages = "row") %>% summary()`;

export const R_EXTRA = `# Zusatz · Misstrauens-Zähler: Rechnen innerhalb einer Person
allbus <- allbus %>%
  mutate(
    m_pe01 = rec(pe01, rules = "1:2=1; 3:4=0; else=NA"),
    m_pa35 = rec(pa35, rules = "1:2=1; 3:5=0; else=NA"),
    m_pe05 = rec(pe05, rules = "3:4=1; 1:2=0; else=NA"),   # umgepolt: nicht zustimmen = Misstrauen
    misstrauen_zahl = row_sums(pick(m_pe01, m_pa35, m_pe05), min_valid = 3),
    nichtwahl = rec(pv01, rules = "91=1 [würde nicht wählen]; 1:90=0 [würde wählen]; else=NA")
  )
allbus %>% crosstab(misstrauen_zahl, nichtwahl, percentages = "row") %>% summary()`;

export const R_SOLUTION = `${R_P1}\n\n${R_P2}\n\n${R_P3_EXAMPLE}\n\n${R_EXTRA}\n`;

export const hints: Record<'p1' | 'p2' | 'p3' | 'extra', Hint> = {
  p1: {
    think: 'Zwei Merkmale mit je zwei Ausprägungen: Du brauchst zwei Variablen mit 0 und 1. Wer ist in der Pressemitteilung 100 %?',
    pointer: 'rec() fasst Kategorien zusammen, crosstab() zeigt die Prozente – mit percentages = "row", "col" oder "all" legst du fest, wer 100 % ist.',
    concept: { id: 'recode', label: 'Rekodieren' },
    workshop: '5 Daten transformieren und Skalen bilden (rec) · 7 Uni- und Bivariate Analyse (crosstab)',
    scaffold: 'allbus <- allbus %>%\n  mutate(\n    misstrauen = rec(pe01, rules = "___=1 [misstraut]; ___=0 [misstraut nicht]; else=NA"),\n    nichtwahl  = rec(pv01, rules = "___=1 [würde nicht wählen]; ___=0 [würde wählen]; else=NA")\n  )\nallbus %>% crosstab(misstrauen, nichtwahl, percentages = "___") %>% summary()',
    solution: R_P1,
  },
  p2: {
    think: 'Dieselben Menschen in derselben Zelle – nur der Nenner wechselt. Wer ist jetzt 100 %?',
    pointer: 'percentages = "all" zeigt Zeilen-, Spalten- und Gesamtprozente zugleich.',
    concept: { id: 'crosstab', label: 'Kreuztabelle' },
    workshop: '7 Uni- und Bivariate Analyse (crosstab)',
    scaffold: 'allbus %>% crosstab(misstrauen, nichtwahl, percentages = "___") %>% summary()',
    solution: R_P2,
  },
  p3: {
    think: 'Wer pe05 zustimmt, vertraut – oder misstraut? Und: −8 ist ein getaggtes NA; rec() sieht es erst nach untag_na().',
    pointer: 'rules = "rev" dreht eine Skala um; untag_na() holt fehlende Codes als Zahlen zurück.',
    concept: { id: 'missing_tools', label: 'Missing-Codes aufbereiten' },
    workshop: '4 Datenimport und Inspektion (fehlende Werte)',
    scaffold: 'allbus <- allbus %>%\n  mutate(\n    pe05_r      = rec(pe05, rules = "___"),\n    misstrauen3 = rec(pe05_r, rules = "___=1 [misstraut]; ___=0 [misstraut nicht]; else=NA"),\n    nichtwahl3  = rec(untag_na(pv01), rules = "91=1; ___=1; 1:90=0; else=NA")\n  )\nallbus %>% crosstab(misstrauen3, nichtwahl3, percentages = "___") %>% summary()',
    solution: R_P3_EXAMPLE,
  },
  extra: {
    think: 'Jede Person bekommt drei Nullen oder Einsen – die Summe zählt, wie vielen Aussagen sie misstrauisch zustimmt.',
    pointer: 'row_sums() rechnet innerhalb einer Zeile; mit min_valid = 3 zählt nur, wer alle drei beantwortet hat.',
    concept: { id: 'dummy', label: 'Dummyvariablen' },
    scaffold: 'allbus <- allbus %>%\n  mutate(\n    m_pe01 = rec(pe01, rules = "1:2=1; 3:4=0; else=NA"),\n    m_pa35 = rec(pa35, rules = "___"),\n    m_pe05 = rec(pe05, rules = "___"),\n    misstrauen_zahl = row_sums(pick(m_pe01, m_pa35, m_pe05), min_valid = ___)\n  )',
    solution: R_EXTRA,
  },
};

/** Typische Ursachen hinter „Das wollte ich anders“. */
export const CAUSES = [
  'untag_na() vergessen: rec() lässt getaggte fehlende Werte wie −8 stehen – deine Regel „-8=1“ greift dann nicht.',
  'haven nach mariposa geladen: haven::read_spss() überdeckt dann mariposa::read_spss(), die fehlenden Codes sind weg. Lade mariposa zuletzt.',
  'Kopierte Regel: pe05 misst Vertrauen. Ohne rules = "rev" zählst du Vertrauende als Misstrauende.',
  'else=0 statt else=NA: Dann zählen auch Nicht-Wahlberechtigte und fehlende Angaben als „würde wählen“.',
  'Falsche Zeile abgelesen: In einer Vierfeldertafel stehen vier Zellen – prüfe, ob deine Zelle misstraut & nicht wählen ist.',
];
