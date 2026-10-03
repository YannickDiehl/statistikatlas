import type { ReactNode } from 'react';
import type { LoadedData } from '../sandbox/ui/DataDrop';

/** Speicherschlüssel der Aufgaben. Sie bleiben stabil, auch wenn sich Sitzungsnummern verschieben (die Nummer steht in curriculum.ts):
 *  „grafik“ ist die Aufgabe der später eingefügten Sitzung 4, s04–s10 gehören seither zu den Sitzungen 5–11. */
export type TaskId = 's01' | 's02' | 's03' | 'grafik' | 's04' | 's05' | 's06' | 's07' | 's08' | 's09' | 's10';
export const TASK_IDS: readonly TaskId[] = ['s01', 's02', 's03', 'grafik', 's04', 's05', 's06', 's07', 's08', 's09', 's10'];
export type TaskStatus = 'open' | 'running' | 'done';

export type TaskProps<S> = {
  data: LoadedData;
  state: S;
  onChange: (next: S) => void;
  onConcept: (id: string) => void;
};

/** Eine Aufgabe des Lernpfads. Zustand und Texte gehören der Aufgabe; gespeichert werden nie Daten. */
export type TaskDef<S> = {
  id: TaskId;
  title: string;
  role: string;
  intro: string;
  requiredVariables: string[];
  initial: () => S;
  parse: (raw: unknown) => S;
  status: (state: S) => TaskStatus;
  Component: (props: TaskProps<S>) => ReactNode;
};
