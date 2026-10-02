// Bereich B14 „Skalen und Faktorenanalyse“. Begriffe (Spezifikation Ausbau, Abschnitt 6): reliability, efa, factor_model, dimensionality, loadings, eigenvalues, communality, rotation.
// Je Begriff eine Datei in diesem Ordner, hier nur eintragen. Anleitung: src/explain/AUTHORING.md.
import type { AreaIndex } from '../../types';
import { alphaWerkstatt, reliabilityTabs } from './reliability';
import { efa, efaTabs } from './efa';

export const b14Faktoren: AreaIndex = {
  explanations: {
    reliability: { kind: 'werkstatt', workshop: alphaWerkstatt, variant: 'reliability' },
    efa: { kind: 'begriff', card: efa },
  },
  tabs: {
    reliability: reliabilityTabs,
    efa: efaTabs,
  },
};
