// Bereich B6 „Wahrscheinlichkeit“. Begriffe (Spezifikation Ausbau, Abschnitt 6): probability, conditional_probability, stochastic_independence, random_variable, empirical_distribution, theoretical_distribution, discrete_continuous, probability_mass, density_function, cumulative_probability, theoretical_quantile, expectation, population_variance.
// Je Begriff eine Datei in diesem Ordner (Erklärung und Reiter), hier nur eintragen. Anleitung: src/explain/AUTHORING.md.
import type { AreaIndex } from '../../types';
import { probability, probabilityTabs } from './probability';
import { conditionalProbability, conditionalProbabilityTabs } from './conditional_probability';
import { stochasticIndependence, stochasticIndependenceTabs } from './stochastic_independence';
import { randomVariable, randomVariableTabs } from './random_variable';
import { empiricalDistribution, empiricalDistributionTabs } from './empirical_distribution';

export const b06Wahrscheinlichkeit: AreaIndex = {
  explanations: {
    probability: { kind: 'begriff', card: probability },
    conditional_probability: { kind: 'begriff', card: conditionalProbability },
    stochastic_independence: { kind: 'begriff', card: stochasticIndependence },
    random_variable: { kind: 'begriff', card: randomVariable },
    empirical_distribution: { kind: 'begriff', card: empiricalDistribution },
  },
  tabs: {
    probability: probabilityTabs,
    conditional_probability: conditionalProbabilityTabs,
    stochastic_independence: stochasticIndependenceTabs,
    random_variable: randomVariableTabs,
    empirical_distribution: empiricalDistributionTabs,
  },
};
