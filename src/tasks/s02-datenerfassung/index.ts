import type { TaskDef } from '../types';
import { Datenerfassung } from './Datenerfassung';
import { initialS02, parseS02, statusS02, type S02State } from './domain';

export const datenerfassung: TaskDef<S02State> = {
  id: 's02',
  title: 'Erster Tag in der Datenerfassung',
  role: 'Datenerfasser:in im Feldinstitut',
  intro: 'Du machst aus drei Papierfragebögen Datenzeilen, so wie sie im ALLBUS stehen könnten – und entscheidest, was bei mehrdeutigen Kreuzen gilt. Lade dafür deine ALLBUS-Datei.',
  requiredVariables: ['mode', 'pa02a', 'pa01', 'pt03', 'st01', 'pv01', 'ls01'],
  initial: initialS02,
  parse: parseS02,
  status: statusS02,
  Component: Datenerfassung,
};
