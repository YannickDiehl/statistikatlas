// Bereich B5 „Zusammenhang“. Begriffe (Spezifikation Ausbau, Abschnitt 6): linear, spearman, crosstab, expected, concordance, phi, cramers_v, goodman_gamma, kendall_tau, partial_cor, correlation_matrix.
// Je Begriff eine Datei in diesem Ordner, hier nur eintragen. Anleitung: src/explain/AUTHORING.md.
import type { AreaIndex } from '../../types';
import { rangkorrelation, spearmanTabs } from './spearman';

export const b05Zusammenhang: AreaIndex = {
  explanations: {
    spearman: { kind: 'werkstatt', workshop: rangkorrelation, variant: 'spearman' },
  },
  tabs: {
    spearman: spearmanTabs,
  },
};
