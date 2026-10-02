// Bereich B12 „Kategoriale Tests, Design, Rechenbausteine“. Begriffe (Spezifikation Ausbau, Abschnitt 6): binomial_test, chi_square, chisq_gof, fisher_test, mcnemar_test, confounding, causality, random_assignment; Detailbegriffe count, add, subtract, multiply, divide, square, sqrt, positive_sd.
// Je Begriff eine Datei in diesem Ordner, hier nur eintragen. Anleitung: src/explain/AUTHORING.md.
import type { AreaIndex } from '../../types';
import { anpassung, gofTabs } from './chisq-gof';
import { unabhaengigkeit, chiSquareTabs } from './chi-square';
import { binomialTest, binomialTabs } from './binomial-test';
import { fisherTest, fisherTabs } from './fisher-test';
import { mcnemarTest, mcnemarTabs } from './mcnemar-test';
import { confounding, confoundingTabs } from './confounding';
import { causality, causalityTabs } from './causality';
import { randomAssignment, randomAssignmentTabs } from './random-assignment';
import { STEP_CARDS, STEP_TABS } from './rechenbausteine';
import { zaehlen, zaehlenTabs } from './count';
import { streuen, streuenTabs } from './positive-sd';

export const b12KategorialDesign: AreaIndex = {
  explanations: {
    chisq_gof: { kind: 'werkstatt', workshop: anpassung, variant: 'chisq_gof' },
    chi_square: { kind: 'werkstatt', workshop: unabhaengigkeit, variant: 'chi_square' },
    binomial_test: { kind: 'begriff', card: binomialTest },
    fisher_test: { kind: 'begriff', card: fisherTest },
    mcnemar_test: { kind: 'satz', template: mcnemarTest },
    confounding: { kind: 'begriff', card: confounding },
    causality: { kind: 'begriff', card: causality },
    random_assignment: { kind: 'begriff', card: randomAssignment },
    count: { kind: 'begriff', card: zaehlen },
    positive_sd: { kind: 'begriff', card: streuen },
  },
  tabs: {
    chisq_gof: gofTabs,
    chi_square: chiSquareTabs,
    binomial_test: binomialTabs,
    fisher_test: fisherTabs,
    mcnemar_test: mcnemarTabs,
    confounding: confoundingTabs,
    causality: causalityTabs,
    random_assignment: randomAssignmentTabs,
    count: zaehlenTabs,
    positive_sd: streuenTabs,
    // Schrittkarten mit dem Reiter „Weiter“ (Ruling IB19); render.test nimmt sie von „Kompakt kürzer“ aus.
    ...STEP_TABS,
  },
  stepCards: STEP_CARDS,
};
