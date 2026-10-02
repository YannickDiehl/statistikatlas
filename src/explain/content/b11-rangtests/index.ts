// Bereich B11 „Rangtests und Paarvergleiche“. Begriffe (Spezifikation Ausbau, Abschnitt 6): mann_whitney, kruskal_wallis, wilcoxon_test, friedman_test, dunn_test, tukey_test, scheffe_test, pairwise_wilcoxon.
// Je Begriff eine Datei in diesem Ordner, hier nur eintragen. Anleitung: src/explain/AUTHORING.md.
import type { AreaIndex } from '../../types';
import { mannWhitneyTabs, mannWhitneyWorkshop } from './mann-whitney';
import { kruskalWallisTabs, kruskalWallisWorkshop } from './kruskal-wallis';

export const b11Rangtests: AreaIndex = {
  explanations: {
    mann_whitney: { kind: 'werkstatt', workshop: mannWhitneyWorkshop, variant: 'mann_whitney' },
    kruskal_wallis: { kind: 'werkstatt', workshop: kruskalWallisWorkshop, variant: 'kruskal_wallis' },
  },
  tabs: {
    mann_whitney: mannWhitneyTabs,
    kruskal_wallis: kruskalWallisTabs,
  },
};
