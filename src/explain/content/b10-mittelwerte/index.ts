// Bereich B10 „Mittelwerte vergleichen“. Begriffe (Spezifikation Ausbau, Abschnitt 6): t_test, paired_design, paired_difference, oneway_anova, factorial_anova, ancova, group_variation, variance_assumption, levene_test, normality_test.
// Je Begriff eine Datei in diesem Ordner, hier nur eintragen. Anleitung: src/explain/AUTHORING.md.
import type { AreaIndex } from '../../types';
import { tTestSentence, tTestTabs } from './t-test';

export const b10Mittelwerte: AreaIndex = {
  explanations: {
    t_test: { kind: 'satz', template: tTestSentence },
  },
  tabs: {
    t_test: tTestTabs,
  },
};
