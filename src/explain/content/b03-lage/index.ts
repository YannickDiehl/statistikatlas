// Bereich B3 „Lage und Verteilung“. Begriffe (Spezifikation Ausbau, Abschnitt 6): validn, frequency, median, quantile, range, mode, shape, describe, multiple_response.
// Je Begriff eine Datei in diesem Ordner, hier nur eintragen. Anleitung: src/explain/AUTHORING.md.
import type { AreaIndex } from '../../types';
import { validn, validnTabs } from './validn';

export const b03Lage: AreaIndex = {
  explanations: {
    validn: { kind: 'begriff', card: validn },
  },
  tabs: {
    validn: validnTabs,
  },
};
