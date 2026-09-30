import type { TaskDef } from '../types';
import { ITEM_IDS } from './content';
import { DreiFragen } from './DreiFragen';
import { initialS07, parseS07, statusS07, type S07State } from './domain';

export const dreiFragen: TaskDef<S07State> = {
  id: 's07',
  title: 'Drei Fragen müssen reichen',
  role: 'Datenteam einer Nachrichten-App',
  intro: 'Die Nachrichten-App „Wochenfaden“ hat in ihrem wöchentlichen Barometer nur noch Platz für drei von sieben Populismusfragen – drei Jahre lang. Du streichst vier, prüfst Stimmigkeit und Stellvertreter-Test in R und entscheidest dich. Lade dafür deine ALLBUS-Datei.',
  requiredVariables: [...ITEM_IDS, 'wghtpew'],
  initial: initialS07,
  parse: parseS07,
  status: statusS07,
  Component: DreiFragen,
};
