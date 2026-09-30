import type { TaskDef } from '../types';
import { initialS04, parseS04, statusS04, type S04State } from './domain';
import { NennerCheck } from './NennerCheck';

export const nennerCheck: TaskDef<S04State> = {
  id: 's04',
  title: 'Nenner-Check',
  role: 'Faktenchecker:in',
  intro: 'Eine (fiktive) Pressemitteilung behauptet: „87 Prozent der Nichtwähler sagen, dass sich Politiker nicht um Leute wie sie kümmern.“ Du rechnest die Zahl in R nach, drehst den Nenner und prüfst eine eigene Lesart. Lade dafür deine ALLBUS-Datei.',
  requiredVariables: ['pe01', 'pa35', 'pe05', 'pv01', 'wghtpew'],
  initial: initialS04,
  parse: parseS04,
  status: statusS04,
  Component: NennerCheck,
};
