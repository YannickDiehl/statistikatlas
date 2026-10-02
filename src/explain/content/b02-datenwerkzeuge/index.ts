// Bereich B2 „Datenwerkzeuge“. Begriffe (Spezifikation Ausbau, Abschnitt 6): codebook, labels, conversion, missing_tools, data_import, data_export, sorting.
// Je Begriff eine Datei in diesem Ordner, hier nur eintragen. Anleitung: src/explain/AUTHORING.md.
import type { AreaIndex } from '../../types';
import { labels, labelsTabs } from './labels';

export const b02Datenwerkzeuge: AreaIndex = {
  explanations: {
    labels: { kind: 'tabelle', tool: labels },
  },
  tabs: {
    labels: labelsTabs,
  },
};
