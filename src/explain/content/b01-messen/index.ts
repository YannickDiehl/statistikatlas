// Bereich B1 „Messen und Skalen“. Begriffe (Spezifikation Ausbau, Abschnitt 6): series, pairs, metric, nominal, ordinal, operationalization, measurement_error, validity, missing, missing_mechanisms, weights.
// Je Begriff eine Datei in diesem Ordner, hier nur eintragen. Anleitung: src/explain/AUTHORING.md.
import type { AreaIndex } from '../../types';
import { series, seriesTabs } from './series';
import { pairs, pairsTabs } from './pairs';
import { metric, metricTabs } from './metric';
import { nominal, nominalTabs } from './nominal';
import { ordinal, ordinalTabs } from './ordinal';

export const b01Messen: AreaIndex = {
  explanations: {
    series: { kind: 'begriff', card: series },
    pairs: { kind: 'begriff', card: pairs },
    metric: { kind: 'begriff', card: metric },
    nominal: { kind: 'begriff', card: nominal },
    ordinal: { kind: 'begriff', card: ordinal },
  },
  tabs: {
    series: seriesTabs,
    pairs: pairsTabs,
    metric: metricTabs,
    nominal: nominalTabs,
    ordinal: ordinalTabs,
  },
};
