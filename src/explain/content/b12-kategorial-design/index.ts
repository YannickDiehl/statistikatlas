// Bereich B12 „Kategoriale Tests, Design, Rechenbausteine“. Begriffe (Spezifikation Ausbau, Abschnitt 6): binomial_test, chi_square, chisq_gof, fisher_test, mcnemar_test, confounding, causality, random_assignment; Detailbegriffe count, add, subtract, multiply, divide, square, sqrt, positive_sd.
// Je Begriff eine Datei in diesem Ordner, hier nur eintragen. Anleitung: src/explain/AUTHORING.md.
import type { AreaIndex } from '../../types';
import { anpassung, gofTabs } from './chisq-gof';
import { unabhaengigkeit, chiSquareTabs } from './chi-square';
import { binomialTest, binomialTabs } from './binomial-test';

export const b12KategorialDesign: AreaIndex = {
  explanations: {
    chisq_gof: { kind: 'werkstatt', workshop: anpassung, variant: 'chisq_gof' },
    chi_square: { kind: 'werkstatt', workshop: unabhaengigkeit, variant: 'chi_square' },
    binomial_test: { kind: 'begriff', card: binomialTest },
  },
  tabs: {
    chisq_gof: gofTabs,
    chi_square: chiSquareTabs,
    binomial_test: binomialTabs,
  },
};
