// Bereich B9 „Testlogik“. Begriffe (Spezifikation Ausbau, Abschnitt 6): hypothesis, test_statistic, null_distribution, test_sides, alpha_level, critical_value, type_errors, power, general_df, exact_asymptotic, multiplicity, effect.
// Je Begriff eine Datei in diesem Ordner (Erklärung und Reiter), hier nur eintragen. Anleitung: src/explain/AUTHORING.md.
// Gemeinsame Rechnungen in ./rechnen.ts; Referenzwerte aus R in ./b09-testlogik.test.ts.
import type { AreaIndex } from '../../types';
import { hypothese, hypotheseTabs } from './hypothese';
import { pruefgroesse, pruefgroesseTabs } from './pruefgroesse';
import { nullverteilung, nullverteilungTabs } from './nullverteilung';

export const b09Testlogik: AreaIndex = {
  explanations: {
    hypothesis: { kind: 'begriff', card: hypothese },
    test_statistic: { kind: 'satz', template: pruefgroesse },
    null_distribution: { kind: 'begriff', card: nullverteilung },
  },
  tabs: {
    hypothesis: hypotheseTabs,
    test_statistic: pruefgroesseTabs,
    null_distribution: nullverteilungTabs,
  },
};
