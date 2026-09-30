import type { TaskDef } from '../types';
import { initialS09, parseS09, statusS09, type S09State } from './domain';
import { Mitgenommen } from './Mitgenommen';

export const mitgenommen: TaskDef<S09State> = {
  id: 's09',
  title: 'Mitgenommen',
  role: 'Recherche für einen Dokumentarfilm',
  intro: 'Eine Doku-Redaktion dreht einen Film über Menschen, die zwischen Ost und West umgezogen sind: Nehmen sie ihre Unzufriedenheit mit, oder übernehmen sie die der neuen Nachbarn? Du baust Dummies, wählst die Referenz, prüfst Selektion und Kontrollen und schreibst den Satz der Sprecherin. Lade dafür deine ALLBUS-Datei.',
  requiredVariables: ['ps03', 'wghtpew', 'dg03', 'eastwest', 'age', 'sex', 'educ', 'di08c', 'ep03', 'pt03'],
  initial: initialS09,
  parse: parseS09,
  status: statusS09,
  Component: Mitgenommen,
};
