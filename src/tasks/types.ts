import type { ReactNode } from 'react';
import type { LoadedData } from '../sandbox/ui/DataDrop';

export type TaskId = 's01' | 's02' | 's03' | 's04' | 's05' | 's06' | 's07' | 's08' | 's09' | 's10';
export const TASK_IDS: readonly TaskId[] = ['s01', 's02', 's03', 's04', 's05', 's06', 's07', 's08', 's09', 's10'];
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
