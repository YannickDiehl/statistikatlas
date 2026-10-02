// Bereich B7 „Verteilungsfamilien“. Begriffe (Spezifikation Ausbau, Abschnitt 6): normal_distribution, standard_normal, t_distribution, chi_square_distribution, f_distribution, bernoulli_distribution, binomial_distribution, hypergeometric_distribution.
// Je Begriff eine Datei in diesem Ordner, hier nur eintragen. Anleitung: src/explain/AUTHORING.md.
import type { AreaIndex } from '../../types';
import { normalverteilung, normalTabs } from './normal';
import { standardnormal, standardTabs } from './standard-normal';

export const b07Verteilungen: AreaIndex = {
  explanations: {
    normal_distribution: { kind: 'begriff', card: normalverteilung },
    standard_normal: { kind: 'satz', template: standardnormal },
  },
  tabs: {
    normal_distribution: normalTabs,
    standard_normal: standardTabs,
  },
};
