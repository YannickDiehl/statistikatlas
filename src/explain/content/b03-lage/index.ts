// Bereich B3 „Lage und Verteilung“. Begriffe (Spezifikation Ausbau, Abschnitt 6): validn, frequency, median, quantile, range, mode, shape, describe, multiple_response.
// Je Begriff eine Datei in diesem Ordner, hier nur eintragen. Anleitung: src/explain/AUTHORING.md.
import type { AreaIndex } from '../../types';
import { validn, validnTabs } from './validn';
import { range, rangeTabs } from './range';

export const b03Lage: AreaIndex = {
  explanations: {
    validn: { kind: 'begriff', card: validn },
    range: { kind: 'begriff', card: range },
  },
  tabs: {
    validn: validnTabs,
    range: rangeTabs,
  },
};
