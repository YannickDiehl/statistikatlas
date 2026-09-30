import type { TaskDef } from '../types';
import { Buergerrat } from './Buergerrat';
import { initialS10, parseS10, statusS10, type S10State } from './domain';

export const buergerrat: TaskDef<S10State> = {
  id: 's10',
  title: 'Dolmetschen für den Bürgerrat',
  role: 'Statistik-Dolmetscher:in',
  intro: 'Ein Sachverständiger hat einem Bürgerrat nur „Exp(B) = 3,77“ hinterlassen. Du rechnest sein Logit-Modell nach und übersetzt die Zahl für zwei Ratsmitglieder in Logit, Chance und Wahrscheinlichkeit – und entscheidest, welche Zahl in den Bericht kommt. Lade dafür deine ALLBUS-Datei.',
  requiredVariables: ['pv01', 'pe09', 'pa02a', 'wghtpew'],
  initial: initialS10,
  parse: parseS10,
  status: statusS10,
  Component: Buergerrat,
};
