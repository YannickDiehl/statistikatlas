// Bereich B11 „Rangtests und Paarvergleiche“. Begriffe (Spezifikation Ausbau, Abschnitt 6): mann_whitney, kruskal_wallis, wilcoxon_test, friedman_test, dunn_test, tukey_test, scheffe_test, pairwise_wilcoxon.
// Je Begriff eine Datei in diesem Ordner, hier nur eintragen. Anleitung: src/explain/AUTHORING.md.
import type { AreaIndex } from '../../types';
import { mannWhitneyTabs, mannWhitneyWorkshop } from './mann-whitney';
import { kruskalWallisTabs, kruskalWallisWorkshop } from './kruskal-wallis';
import { wilcoxonTabs, wilcoxonWorkshop } from './wilcoxon';
import { friedmanTabs, friedmanWorkshop } from './friedman';
import { dunnCard, dunnTabs } from './dunn';
import { tukeyCard, tukeyTabs } from './tukey';
import { scheffeCard, scheffeTabs } from './scheffe';
import { pairwiseWilcoxonCard, pairwiseWilcoxonTabs } from './pairwise-wilcoxon';

export const b11Rangtests: AreaIndex = {
  explanations: {
    mann_whitney: { kind: 'werkstatt', workshop: mannWhitneyWorkshop, variant: 'mann_whitney' },
    kruskal_wallis: { kind: 'werkstatt', workshop: kruskalWallisWorkshop, variant: 'kruskal_wallis' },
    wilcoxon_test: { kind: 'werkstatt', workshop: wilcoxonWorkshop, variant: 'wilcoxon_test' },
    friedman_test: { kind: 'werkstatt', workshop: friedmanWorkshop, variant: 'friedman_test' },
    dunn_test: { kind: 'begriff', card: dunnCard },
    tukey_test: { kind: 'begriff', card: tukeyCard },
    scheffe_test: { kind: 'begriff', card: scheffeCard },
    pairwise_wilcoxon: { kind: 'begriff', card: pairwiseWilcoxonCard },
  },
  tabs: {
    mann_whitney: mannWhitneyTabs,
    kruskal_wallis: kruskalWallisTabs,
    wilcoxon_test: wilcoxonTabs,
    friedman_test: friedmanTabs,
    dunn_test: dunnTabs,
    tukey_test: tukeyTabs,
    scheffe_test: scheffeTabs,
    pairwise_wilcoxon: pairwiseWilcoxonTabs,
  },
};
