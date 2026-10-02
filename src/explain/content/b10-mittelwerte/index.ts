// Bereich B10 „Mittelwerte vergleichen“. Begriffe (Spezifikation Ausbau, Abschnitt 6): t_test, paired_design, paired_difference, oneway_anova, factorial_anova, ancova, group_variation, variance_assumption, levene_test, normality_test.
// Je Begriff eine Datei in diesem Ordner, hier nur eintragen. Anleitung: src/explain/AUTHORING.md.
import type { AreaIndex } from '../../types';
import { tTestSentence, tTestTabs } from './t-test';
import { paarWerkstatt, pairedDifferenceTabs } from './paired-difference';
import { pairedDesign, pairedDesignTabs } from './paired-design';
import { anovaWerkstatt, groupVariationTabs, onewayAnovaTabs } from './anova';
import { factorialAnova, factorialAnovaTabs } from './factorial-anova';
import { ancova, ancovaTabs } from './ancova';
import { varianceAssumption, varianceAssumptionTabs } from './variance-assumption';
import { levene, leveneTabs } from './levene';
import { normality, normalityTabs } from './normality';

export const b10Mittelwerte: AreaIndex = {
  explanations: {
    t_test: { kind: 'satz', template: tTestSentence },
    paired_difference: { kind: 'werkstatt', workshop: paarWerkstatt, variant: 'paired_difference' },
    paired_design: { kind: 'begriff', card: pairedDesign },
    group_variation: { kind: 'werkstatt', workshop: anovaWerkstatt, variant: 'group_variation' },
    oneway_anova: { kind: 'werkstatt', workshop: anovaWerkstatt, variant: 'oneway_anova' },
    factorial_anova: { kind: 'begriff', card: factorialAnova },
    ancova: { kind: 'begriff', card: ancova },
    variance_assumption: { kind: 'begriff', card: varianceAssumption },
    levene_test: { kind: 'begriff', card: levene },
    normality_test: { kind: 'begriff', card: normality },
  },
  tabs: {
    t_test: tTestTabs,
    paired_difference: pairedDifferenceTabs,
    paired_design: pairedDesignTabs,
    group_variation: groupVariationTabs,
    oneway_anova: onewayAnovaTabs,
    factorial_anova: factorialAnovaTabs,
    ancova: ancovaTabs,
    variance_assumption: varianceAssumptionTabs,
    levene_test: leveneTabs,
    normality_test: normalityTabs,
  },
};
