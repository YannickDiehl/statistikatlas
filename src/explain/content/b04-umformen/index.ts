// Bereich B4 „Umformen“. Begriffe (Spezifikation Ausbau, Abschnitt 6): ss, centering, scaling, z, ranks, pomps, row_operations, item_score.
// Je Begriff eine Datei in diesem Ordner, hier nur eintragen. Anleitung: src/explain/AUTHORING.md.
import type { AreaIndex } from '../../types';
import { zentrieren, tabsCentering } from './zentrieren';
import { standardisieren, tabsZ } from './standardisieren';
import { tabsSs } from './ss';
import { skalieren, tabsScaling } from './skalieren';
import { raenge, tabsRanks } from './raenge';

export const b04Umformen: AreaIndex = {
  explanations: {
    centering: { kind: 'werkstatt', workshop: zentrieren, variant: 'centering' },
    z: { kind: 'werkstatt', workshop: standardisieren, variant: 'z' },
    scaling: { kind: 'satz', template: skalieren },
    ranks: { kind: 'werkstatt', workshop: raenge, variant: 'ranks' },
  },
  // Die Quadratsumme behält ihre Schrittkarte aus der Werkstatt Streuung (Pilot); B4 liefert nur ihre Reiter.
  tabs: {
    ss: tabsSs,
    centering: tabsCentering,
    z: tabsZ,
    scaling: tabsScaling,
    ranks: tabsRanks,
  },
};
