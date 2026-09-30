import type { TaskDef } from '../types';
import { Automat } from './Automat';
import { INPUT_IDS } from './content';
import { initialS08, parseS08, statusS08, type S08State } from './domain';

export const automat: TaskDef<S08State> = {
  id: 's08',
  title: 'Der Demokratie-Automat',
  role: 'Technik im Besucherzentrum',
  intro: 'Im Besucherzentrum des Landtags soll ein Automat zeigen, wie zufrieden „Menschen wie du“ mit der Demokratie sind. Du wählst die Frage, stellst ihn per Regression ein, lässt ihn gegen den „Faulpelz“ antreten und schreibst das Schild. Lade dafür deine ALLBUS-Datei.',
  requiredVariables: ['ps03', 'wghtpew', ...INPUT_IDS],
  initial: initialS08,
  parse: parseS08,
  status: statusS08,
  Component: Automat,
};
