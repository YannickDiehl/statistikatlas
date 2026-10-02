// Bereich B8 „Stichprobe und Schätzen“. Begriffe (Spezifikation Ausbau, Abschnitt 6): sampling, population_parameter, estimator, sampling_distribution, sampling_bias, law_large_numbers, central_limit, random_sampling, confidence, prediction_interval.
// Je Begriff eine Datei in diesem Ordner, hier nur eintragen. Anleitung: src/explain/AUTHORING.md.
import type { AreaIndex } from '../../types';
import { sampling, samplingTabs } from './sampling';

export const b08Schaetzen: AreaIndex = {
  explanations: {
    sampling: { kind: 'begriff', card: sampling },
  },
  tabs: {
    sampling: samplingTabs,
  },
};
