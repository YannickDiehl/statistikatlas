import type { Hint } from '../kit/HintLadder';

export type ItemId = 'pa29' | 'pa30' | 'pa31' | 'pa32' | 'pa33' | 'pa34' | 'pa35';
export const ITEM_IDS: readonly ItemId[] = ['pa29', 'pa30', 'pa31', 'pa32', 'pa33', 'pa34', 'pa35'];

/** Die drei Seiten des Populismus – nur als Hilfe, nie vorab (Spezifikation 4.7). Zuordnung als Vorschlag. */
export type FacetId = 'V' | 'E' | 'H';
export const FACET_IDS: readonly FacetId[] = ['V', 'E', 'H'];
export const FACETS: Record<FacetId, { name: string; gist: string }> = {
  V: { name: 'Volkssouveränität', gist: 'Das Volk soll selbst entscheiden, nicht die Politik.' },
  E: { name: 'Anti-Elitismus', gist: 'Die Politiker als abgehobene Elite, die nicht für die Leute da ist.' },
  H: { name: 'Einheit des Volkes', gist: 'Es gibt einen gemeinsamen Volkswillen; wer Kompromisse schließt, verrät ihn.' },
};

export type Item = { id: ItemId; short: string; statement: string; facet: FacetId };
export const ITEMS: Record<ItemId, Item> = {
  pa29: { id: 'pa29', short: 'Abgeordnete nur dem Volk verpflichtet', statement: 'Die Abgeordneten im Bundestag sollten sich nur dem Willen des Volkes verpflichtet fühlen.', facet: 'V' },
  pa30: { id: 'pa30', short: 'Politiker reden zu viel, handeln zu wenig', statement: 'Die Politiker reden zu viel und handeln zu wenig.', facet: 'E' },
  pa31: { id: 'pa31', short: 'Einfache Bürger wären bessere Volksvertreter', statement: 'Ein einfacher Bürger würde meine Interessen besser vertreten als ein Berufspolitiker.', facet: 'E' },
  pa32: { id: 'pa32', short: 'Kompromiss ist Verrat an Prinzipien', statement: 'Was man in der Politik „Kompromiss“ nennt, ist in Wirklichkeit nur ein Verrat der eigenen Prinzipien.', facet: 'H' },
  pa33: { id: 'pa33', short: 'Das Volk sollte entscheiden', statement: 'Das Volk, nicht die Politiker, sollte die wichtigsten politischen Entscheidungen treffen.', facet: 'V' },
  pa34: { id: 'pa34', short: 'Das Volk ist sich einig', statement: 'Die Bürger sind sich im Prinzip einig darüber, was politisch passieren muss.', facet: 'H' },
  pa35: { id: 'pa35', short: 'Politiker vertreten nur die Reichen', statement: 'Politiker vertreten nur die Interessen der Reichen.', facet: 'E' },
};
export const SCALE = '1 stimme voll zu · 2 stimme eher zu · 3 teils/teils · 4 lehne eher ab · 5 lehne ganz ab';

export const ROLE = {
  app: 'Wochenfaden',
  barometer: 'Wochenfaden-Barometer',
};

/** Gründe für die Pflichtfrage, die der Browser bei zu einheitlicher Wahl je Gruppe auslost. */
export const DUTY_REASONS = [
  'Sie stand schon in der Vorgängerstudie – nur mit ihr lässt sich die neue Reihe an die alte anschließen.',
  'Die Chefredaktion zitiert sie jede Woche in der Push-Nachricht.',
  'Ein Partnermedium in Österreich stellt genau diese Frage – nur so lassen sich beide Länder vergleichen.',
  'Die Leserschaft hat sie in einer Abstimmung zur wichtigsten Frage gewählt.',
  'Die App zeigt sie jeden Montag auf dem Sperrbildschirm – viele Leserinnen und Leser kennen sie schon.',
  'Der Beirat der App besteht darauf, weil sie den Kern des Begriffs trifft.',
  'Die Werbekampagne zum Barometer ist mit ihr schon gedruckt.',
] as const;

export const WORKSHOP = '5 Daten transformieren und Skalen bilden (row_means) · 7 Uni- und Bivariate Analyse (pearson_cor) · 8 Latente Strukturen (reliability)';

export const R_SETUP = `library(dplyr)
library(mariposa)   # zuletzt laden: haven würde sonst read_spss() überdecken

allbus <- read_spss(file.choose())   # ZA8831_v1-3-0.sav`;

export const R_BATTERY = `# Die ganze Batterie: Stimmigkeit (Cronbachs α), Trennschärfen (corrected_r) und „Alpha ohne Item“ (alpha_deleted)
allbus %>%
  reliability(pa29, pa30, pa31, pa32, pa33, pa34, pa35) %>%
  summary()`;

export const hints: Record<'battery' | 'proposal' | 'kuer', Omit<Hint, 'scaffold' | 'solution'> & { scaffold?: string }> = {
  battery: {
    think: 'Eine einzige Funktion rechnet die Stimmigkeit aller sieben Fragen. Mit summary() zeigt sie auch, wie gut jede Frage zu den übrigen passt.',
    pointer: 'reliability() mit allen sieben Fragen, danach summary(): oben steht Cronbachs α, unten in der Item-Total-Statistik je Frage die Trennschärfe (corrected_r).',
    concept: { id: 'reliability', label: 'Reliabilität · Alpha & Omega' },
    workshop: '8 Latente Strukturen (reliability)',
    scaffold: 'allbus %>%\n  reliability(___, ___, ___, ___, ___, ___, ___) %>%\n  summary()',
  },
  proposal: {
    think: 'Du brauchst eine Zahl für die Stimmigkeit deiner drei Fragen. Außerdem für jede Person zwei Werte – einen aus deinen drei Fragen, einen aus den vier gestrichenen –, die du miteinander korrelierst.',
    pointer: 'reliability() zeigt Cronbachs α. row_means() in mutate() bildet den Mittelwert je Person; min_valid legt fest, wie viele Antworten jemand mindestens braucht, um einen Wert zu bekommen. pearson_cor() korreliert die beiden Werte.',
    concept: { id: 'item_score', label: 'Skalenwert pro Person' },
    workshop: WORKSHOP,
  },
  kuer: {
    think: 'Der Mittelwertindex fragt: Liegt der Durchschnitt auf der Seite der Zustimmung? Der Kombinationsindex fragt: Hat die Person allen drei Aussagen zugestimmt? Bilde für jede Aussage eine 0/1-Variable und zähle.',
    pointer: 'rec() macht aus 1–2 eine 1 und aus 3–5 eine 0; row_sums() zählt die Zustimmungen je Person. crosstab() mit weights = wghtpew und percentages = "total": Den Anteil nach dem Mittelwertindex liest du in der Zeile „im Schnitt Zustimmung“ ganz rechts (Total, total %), den Anteil nach dem Kombinationsindex in der Zelle „im Schnitt Zustimmung“ × „allen drei zugestimmt“ – wer allen dreien zustimmt, stimmt auch im Schnitt zu.',
    concept: { id: 'row_operations', label: 'Rechnen innerhalb einer Person' },
    workshop: '5 Daten transformieren und Skalen bilden (rec, row_sums) · 7 Uni- und Bivariate Analyse (crosstab)',
  },
};

/** Denkanstöße für die Rolle „Inhalt“: erst die Frage, dann die drei Seiten als Vorschlag. */
export const FACET_HELP = {
  think: 'Lies die sieben Aussagen noch einmal langsam: Worum geht es jeweils – um die Politiker, um das Volk als Ganzes oder darum, wer entscheiden soll? Gruppiere sie für dich.',
  reveal: 'Eine gängige Lesart unterscheidet drei Seiten des Populismus. Die Zuordnung ist ein Vorschlag – du darfst anders sortieren und im Satz begründen.',
};
