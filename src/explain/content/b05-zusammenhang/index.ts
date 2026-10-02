// Bereich B5 „Zusammenhang“. Begriffe (Spezifikation Ausbau, Abschnitt 6): linear, spearman, crosstab, expected, concordance, phi, cramers_v, goodman_gamma, kendall_tau, partial_cor, correlation_matrix.
// Je Begriff eine Datei in diesem Ordner, hier nur eintragen. Anleitung: src/explain/AUTHORING.md.
import type { AreaIndex } from '../../types';
import { rangkorrelation, spearmanTabs } from './spearman';
import { concordanceTabs, gammaTabs, paarvergleich, tauTabs } from './paarvergleich';

export const b05Zusammenhang: AreaIndex = {
  explanations: {
    spearman: { kind: 'werkstatt', workshop: rangkorrelation, variant: 'spearman' },
    concordance: { kind: 'werkstatt', workshop: paarvergleich, variant: 'concordance' },
    goodman_gamma: { kind: 'werkstatt', workshop: paarvergleich, variant: 'goodman_gamma' },
    kendall_tau: { kind: 'werkstatt', workshop: paarvergleich, variant: 'kendall_tau' },
  },
  tabs: {
    spearman: spearmanTabs,
    concordance: concordanceTabs,
    goodman_gamma: gammaTabs,
    kendall_tau: tauTabs,
  },
};
