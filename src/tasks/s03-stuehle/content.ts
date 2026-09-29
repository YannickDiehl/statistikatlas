import type { Hint } from '../kit/HintLadder';

/** Missing-Codes der Wahlabsicht in der Reihenfolge, in der sie in der Stuhlregel erscheinen. */
export const CHAIR_CODES = [-8, -7, -50, -9, -42] as const;
export type Selection = 'gefragt' | 'vollzeit' | 'teilzeit' | 'alle0';
export const SELECTIONS: { id: Selection; label: string; short: string }[] = [
  { id: 'gefragt', label: 'alle, denen die Frage gestellt wurde (Voll- und Teilzeit)', short: 'aller Voll- und Teilzeitbeschäftigten' },
  { id: 'vollzeit', label: 'nur Vollzeit', short: 'der Vollzeitbeschäftigten' },
  { id: 'teilzeit', label: 'nur Teilzeit', short: 'der Teilzeitbeschäftigten' },
  { id: 'alle0', label: 'alle Befragten, Nicht-Erwerbstätige mit 0 Stunden', short: 'aller Befragten (Nicht-Erwerbstätige mit 0)' },
];

export const R_SOLUTION = `library(mariposa)
library(dplyr)

allbus <- read_spss(file.choose())

# Saal 1: Welche Lücken gibt es?
allbus %>% fre(pv01) %>% summary()
na_frequencies(allbus$pv01)

# Stuhlregel, hier ein Beispiel: Unentschlossene bekommen Stühle,
# Nicht-Wahlberechtigte, Datenfehler, keine Angabe und Verweigerung nicht
saal <- allbus %>%
  mutate(wahl = untag_na(pv01)) %>%        # Missing-Codes zurückholen
  filter(wahl != -50, wahl != -42, wahl != -9, wahl != -7)
saal %>% fre(wahl) %>% summary()           # Valid % = Stühle

# Saal 2: Wer wurde überhaupt gefragt?
na_frequencies(allbus$dw15)
allbus %>% describe(dw15, show = c("mean", "median", "sd", "skew", "quantiles"))
allbus %>% filter(dw15 > 37.89) %>% nrow()     # rechts vom Durchschnitt
allbus %>% filter(work == 1) %>% describe(dw15) # nur Vollzeit
`;

export const hints: Record<'hall' | 'row', Hint> = {
  hall: {
    think: 'fre() zeigt zwei Prozentspalten. Welche verteilt 100 Stühle nur auf gültige Antworten? Lücken sind nicht weg – sie tragen einen Code.',
    pointer: 'Mit untag_na() holst du die Missing-Codes als Zahlen zurück, mit filter() wirfst du die Gruppen hinaus, die keinen Stuhl bekommen.',
    concept: { id: 'missing_tools', label: 'Missing-Codes aufbereiten' },
    workshop: '4.8 Fehlende Werte, 4.5.2 Fälle filtern',
    scaffold: 'saal <- allbus %>%\n  mutate(wahl = untag_na(___)) %>%\n  filter(wahl != ___, wahl != ___)\nsaal %>% fre(___) %>% summary()',
    solution: '# Beispielregel – deine Regel kann anders aussehen\nsaal <- allbus %>%\n  mutate(wahl = untag_na(pv01)) %>%\n  filter(wahl != -50, wahl != -42, wahl != -9, wahl != -7)\nsaal %>% fre(wahl) %>% summary()',
  },
  row: {
    think: 'Wer bekam die Stundenfrage gar nicht? Und wo sitzt in der Reihe der Mensch in der Mitte?',
    pointer: 'describe() liefert Mittelwert, Median, Quartile und Schiefe. filter() wählt Fälle aus, nrow() zählt sie.',
    concept: { id: 'describe', label: 'Deskriptiver Überblick' },
    workshop: '7.4.2 describe()',
    scaffold: 'allbus %>% filter(work == ___) %>% describe(___)\nallbus %>% filter(dw15 > ___) %>% nrow()',
    solution: 'allbus %>% describe(dw15, show = c("mean", "median", "sd", "skew", "quantiles"))\nallbus %>% filter(dw15 > 37.89) %>% nrow()\nallbus %>% filter(work == 1) %>% describe(dw15)',
  },
};
