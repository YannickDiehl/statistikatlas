// Bereich B4 „Umformen“. Begriffe (Spezifikation Ausbau, Abschnitt 6): ss, centering, scaling, z, ranks, pomps, row_operations, item_score.
// Je Begriff eine Datei in diesem Ordner, hier nur eintragen. Anleitung: src/explain/AUTHORING.md.
import type { AreaIndex } from '../../types';
import { zentrieren, tabsCentering } from './zentrieren';
import { standardisieren, tabsZ } from './standardisieren';

export const b04Umformen: AreaIndex = {
  explanations: {
    centering: { kind: 'werkstatt', workshop: zentrieren, variant: 'centering' },
    z: { kind: 'werkstatt', workshop: standardisieren, variant: 'z' },
  },
  tabs: {
    centering: tabsCentering,
    z: tabsZ,
  },
};
