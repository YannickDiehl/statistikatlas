import type { TaskDef } from '../types';
import { initialS03, parseS03, statusS03, type S03State } from './domain';
import { Stuehle } from './Stuehle';

export const stuehle: TaskDef<S03State> = {
  id: 's03',
  title: 'Deutschland in 100 Stühlen',
  role: 'Szenograf:in einer Ausstellung',
  intro: 'Du baust zwei Säle einer (fiktiven) Ausstellung: 100 Stühle für die Wahlabsicht und eine Stuhlreihe nach Arbeitsstunden. Wer einen Stuhl bekommt und was auf dem Schild steht, entscheidest du. Lade dafür deine ALLBUS-Datei.',
  requiredVariables: ['pv01', 'dw15', 'work'],
  initial: initialS03,
  parse: parseS03,
  status: statusS03,
  Component: Stuehle,
};
