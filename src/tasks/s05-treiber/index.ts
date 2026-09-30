import type { TaskDef } from '../types';
import { initialS05, parseS05, statusS05, type S05State } from './domain';
import { Treiber } from './Treiber';

export const treiber: TaskDef<S05State> = {
  id: 's05',
  title: 'Treiber-Rangliste',
  role: 'Analyst:in im Beratungsbüro',
  intro: 'Ein Förderfonds bestellt eine Rangliste: Was hängt am stärksten mit der Demokratiezufriedenheit zusammen? Du ziehst einen Kandidaten, wählst ein passendes Maß, rechnest gewichtet und prüfst West und Ost. Lade dafür deine ALLBUS-Datei.',
  requiredVariables: ['ps03', 'wghtpew', 'eastwest', 'ep01', 'ep03', 'ls01', 'id02', 'educ', 'pa01', 'rp01', 'rd01', 'gs01', 'age', 'pa02a', 'pt03'],
  initial: initialS05,
  parse: parseS05,
  status: statusS05,
  Component: Treiber,
};
