// Bereich B1 „Messen und Skalen“. Begriffe (Spezifikation Ausbau, Abschnitt 6): series, pairs, metric, nominal, ordinal, operationalization, measurement_error, validity, missing, missing_mechanisms, weights.
// Je Begriff eine Datei in diesem Ordner, hier nur eintragen. Anleitung: src/explain/AUTHORING.md.
import type { AreaIndex } from '../../types';
import { series, seriesTabs } from './series';
import { pairs, pairsTabs } from './pairs';
import { metric, metricTabs } from './metric';
import { nominal, nominalTabs } from './nominal';
import { ordinal, ordinalTabs } from './ordinal';
import { operationalization, operationalizationTabs } from './operationalization';
import { measurementError, measurementErrorTabs } from './measurement-error';
import { validity, validityTabs } from './validity';
import { missing, missingTabs } from './missing';
import { missingMechanisms, missingMechanismsTabs } from './missing-mechanisms';

export const b01Messen: AreaIndex = {
  explanations: {
    series: { kind: 'begriff', card: series },
    pairs: { kind: 'begriff', card: pairs },
    metric: { kind: 'begriff', card: metric },
    nominal: { kind: 'begriff', card: nominal },
    ordinal: { kind: 'begriff', card: ordinal },
    operationalization: { kind: 'begriff', card: operationalization },
    measurement_error: { kind: 'begriff', card: measurementError },
    validity: { kind: 'begriff', card: validity },
    missing: { kind: 'tabelle', tool: missing },
    missing_mechanisms: { kind: 'begriff', card: missingMechanisms },
  },
  tabs: {
    series: seriesTabs,
    pairs: pairsTabs,
    metric: metricTabs,
    nominal: nominalTabs,
    ordinal: ordinalTabs,
    operationalization: operationalizationTabs,
    measurement_error: measurementErrorTabs,
    validity: validityTabs,
    missing: missingTabs,
    missing_mechanisms: missingMechanismsTabs,
  },
};
