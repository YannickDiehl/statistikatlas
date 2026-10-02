// Bereich B10 „Mittelwerte vergleichen“. Begriffe (Spezifikation Ausbau, Abschnitt 6): t_test, paired_design, paired_difference, oneway_anova, factorial_anova, ancova, group_variation, variance_assumption, levene_test, normality_test.
// Je Begriff eine Datei in diesem Ordner, hier nur eintragen. Anleitung: src/explain/AUTHORING.md.
import type { AreaIndex } from '../../types';
import { tTestSentence, tTestTabs } from './t-test';
import { paarWerkstatt, pairedDifferenceTabs } from './paired-difference';
import { pairedDesign, pairedDesignTabs } from './paired-design';

export const b10Mittelwerte: AreaIndex = {
  explanations: {
    t_test: { kind: 'satz', template: tTestSentence },
    paired_difference: { kind: 'werkstatt', workshop: paarWerkstatt, variant: 'paired_difference' },
    paired_design: { kind: 'begriff', card: pairedDesign },
  },
  tabs: {
    t_test: tTestTabs,
    paired_difference: pairedDifferenceTabs,
    paired_design: pairedDesignTabs,
  },
};
