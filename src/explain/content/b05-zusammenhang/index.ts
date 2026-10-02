// Bereich B5 „Zusammenhang“. Begriffe (Spezifikation Ausbau, Abschnitt 6): linear, spearman, crosstab, expected, concordance, phi, cramers_v, goodman_gamma, kendall_tau, partial_cor, correlation_matrix.
// Je Begriff eine Datei in diesem Ordner, hier nur eintragen. Anleitung: src/explain/AUTHORING.md.
import type { AreaIndex } from '../../types';
import { rangkorrelation, spearmanTabs } from './spearman';
import { concordanceTabs, gammaTabs, paarvergleich, tauTabs } from './paarvergleich';
import { crosstabTabs, kreuztabelle } from './crosstab';
import { erwartet, expectedTabs } from './expected';
import { phiSatz, phiTabs } from './phi';
import { cramerSatz, cramersTabs } from './cramers-v';
import { partialTabs, partielleKorrelation } from './partial-cor';

export const b05Zusammenhang: AreaIndex = {
  explanations: {
    spearman: { kind: 'werkstatt', workshop: rangkorrelation, variant: 'spearman' },
    concordance: { kind: 'werkstatt', workshop: paarvergleich, variant: 'concordance' },
    goodman_gamma: { kind: 'werkstatt', workshop: paarvergleich, variant: 'goodman_gamma' },
    kendall_tau: { kind: 'werkstatt', workshop: paarvergleich, variant: 'kendall_tau' },
    crosstab: { kind: 'tabelle', tool: kreuztabelle },
    expected: { kind: 'satz', template: erwartet },
    phi: { kind: 'satz', template: phiSatz },
    cramers_v: { kind: 'satz', template: cramerSatz },
    partial_cor: { kind: 'satz', template: partielleKorrelation },
  },
  tabs: {
    spearman: spearmanTabs,
    concordance: concordanceTabs,
    goodman_gamma: gammaTabs,
    kendall_tau: tauTabs,
    crosstab: crosstabTabs,
    expected: expectedTabs,
    phi: phiTabs,
    cramers_v: cramersTabs,
    partial_cor: partialTabs,
  },
};
