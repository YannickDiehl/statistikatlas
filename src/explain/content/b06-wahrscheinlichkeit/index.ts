// Bereich B6 „Wahrscheinlichkeit“. Begriffe (Spezifikation Ausbau, Abschnitt 6): probability, conditional_probability, stochastic_independence, random_variable, empirical_distribution, theoretical_distribution, discrete_continuous, probability_mass, density_function, cumulative_probability, theoretical_quantile, expectation, population_variance.
// Je Begriff eine Datei in diesem Ordner (Erklärung und Reiter), hier nur eintragen. Anleitung: src/explain/AUTHORING.md.
import type { AreaIndex } from '../../types';
import { probability, probabilityTabs } from './probability';

export const b06Wahrscheinlichkeit: AreaIndex = {
  explanations: {
    probability: { kind: 'begriff', card: probability },
  },
  tabs: {
    probability: probabilityTabs,
  },
};
