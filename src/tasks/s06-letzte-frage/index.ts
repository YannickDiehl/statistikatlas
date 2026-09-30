import type { TaskDef } from '../types';
import { ROLE } from './content';
import { initialS06, parseS06, statusS06, type S06State } from './domain';
import { LetzteFrage } from './LetzteFrage';

export const letzteFrage: TaskDef<S06State> = {
  id: 's06',
  title: 'Die letzte Frage',
  role: ROLE,
  intro: 'Morgen geht die Online-Jahresbefragung des Instituts Wiederfrage live. Welche Fassung der Einladungsfrage wird programmiert, und welche Zusagequote versprichst du? Du prüfst es am echten Incentive-Experiment des ALLBUS 2023 – mit t-Tests, Korrelationsmatrix, ANOVA und Tukey. Lade dafür deine ALLBUS-Datei.',
  requiredVariables: ['splt23_3', 'xr21', 'mode', 'age', 'wghtpew', 'splt23_1'],
  initial: initialS06,
  parse: parseS06,
  status: statusS06,
  Component: LetzteFrage,
};
