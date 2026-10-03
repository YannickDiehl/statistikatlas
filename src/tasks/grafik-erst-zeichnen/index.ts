import type { TaskDef } from '../types';
import { initialGrafik, parseGrafik, statusGrafik, type GrafikState } from './domain';
import { ErstZeichnen } from './ErstZeichnen';

export const erstZeichnen: TaskDef<GrafikState> = {
  id: 'grafik',
  title: 'Erst zeichnen, dann zeigen',
  role: 'Grafikredaktion eines Schulbuchverlags',
  intro: 'Ein Schulbuchverlag braucht Grafiken für die Doppelseite „Wie geht es Deutschland?“. Du skizzierst zuerst, was du erwartest, zeichnest dann in R mit ggplot2, löst einen Rätselkasten mit vier Silhouetten, baust die Grafik zu einer Leitfrage und entscheidest, wo eine Achse beginnt. Lade dafür deine ALLBUS-Datei.',
  requiredVariables: ['ls01', 'hs01', 'pa02a', 'pa01', 'dw15', 'age', 'eastwest', 'sex', 'ps03'],
  initial: initialGrafik,
  parse: parseGrafik,
  status: statusGrafik,
  Component: ErstZeichnen,
};
