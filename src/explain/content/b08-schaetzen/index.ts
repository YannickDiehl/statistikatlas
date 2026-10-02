// Bereich B8 „Stichprobe und Schätzen“. Begriffe (Spezifikation Ausbau, Abschnitt 6): sampling, population_parameter, estimator, sampling_distribution, sampling_bias, law_large_numbers, central_limit, random_sampling, confidence, prediction_interval.
// Je Begriff eine Datei in diesem Ordner, hier nur eintragen. Anleitung: src/explain/AUTHORING.md.
import type { AreaIndex } from '../../types';
import { sampling, samplingTabs } from './sampling';
import { populationParameter, populationParameterTabs } from './population-parameter';
import { estimator, estimatorTabs } from './estimator';
import { samplingDistribution, samplingDistributionTabs } from './sampling-distribution';
import { lawLargeNumbers, lawLargeNumbersTabs } from './law-large-numbers';
import { centralLimit, centralLimitTabs } from './central-limit';

export const b08Schaetzen: AreaIndex = {
  explanations: {
    sampling: { kind: 'begriff', card: sampling },
    population_parameter: { kind: 'begriff', card: populationParameter },
    estimator: { kind: 'begriff', card: estimator },
    sampling_distribution: { kind: 'begriff', card: samplingDistribution },
    law_large_numbers: { kind: 'begriff', card: lawLargeNumbers },
    central_limit: { kind: 'begriff', card: centralLimit },
  },
  tabs: {
    sampling: samplingTabs,
    population_parameter: populationParameterTabs,
    estimator: estimatorTabs,
    sampling_distribution: samplingDistributionTabs,
    law_large_numbers: lawLargeNumbersTabs,
    central_limit: centralLimitTabs,
  },
};
