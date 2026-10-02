// Bereich B7 „Verteilungsfamilien“. Begriffe (Spezifikation Ausbau, Abschnitt 6): normal_distribution, standard_normal, t_distribution, chi_square_distribution, f_distribution, bernoulli_distribution, binomial_distribution, hypergeometric_distribution.
// Je Begriff eine Datei in diesem Ordner, hier nur eintragen. Anleitung: src/explain/AUTHORING.md.
import type { AreaIndex } from '../../types';
import { normalverteilung, normalTabs } from './normal';
import { standardnormal, standardTabs } from './standard-normal';
import { tVerteilung, tTabs } from './t';
import { chiQuadratVerteilung, chiTabs } from './chi-square';
import { fVerteilung, fTabs } from './f';
import { bernoulli, bernoulliTabs } from './bernoulli';

export const b07Verteilungen: AreaIndex = {
  explanations: {
    normal_distribution: { kind: 'begriff', card: normalverteilung },
    standard_normal: { kind: 'satz', template: standardnormal },
    t_distribution: { kind: 'begriff', card: tVerteilung },
    chi_square_distribution: { kind: 'begriff', card: chiQuadratVerteilung },
    f_distribution: { kind: 'begriff', card: fVerteilung },
    bernoulli_distribution: { kind: 'satz', template: bernoulli },
  },
  tabs: {
    normal_distribution: normalTabs,
    standard_normal: standardTabs,
    t_distribution: tTabs,
    chi_square_distribution: chiTabs,
    f_distribution: fTabs,
    bernoulli_distribution: bernoulliTabs,
  },
};
