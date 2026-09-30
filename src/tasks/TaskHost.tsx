import { useMemo } from 'react';
import { DataDrop, type LoadedData } from '../sandbox/ui/DataDrop';
import type { TaskDef } from './types';

/** Lädt bei Bedarf die ALLBUS-Datei, prüft die benötigten Variablen und zeigt dann die Aufgabe. */
export function TaskHost<S>({ def, data, raw, onRaw, onData, onConcept, onReset }: {
  def: TaskDef<S>;
  data: LoadedData | null;
  raw: unknown;
  onRaw: (next: S) => void;
  onData: (data: LoadedData) => void;
  onConcept: (id: string) => void;
  /** Zurück zum Ladefeld, wenn der Datei Variablen fehlen (die Datei wird nicht gespeichert). */
  onReset?: () => void;
}) {
  const state = useMemo(() => raw === undefined ? def.initial() : def.parse(raw), [def, raw]);
  if (!data) return <>
    <span className="learning-eyebrow">AUFGABE · {def.role.toLocaleUpperCase('de')}</span>
    <h3 className="task-title">{def.title}</h3>
    <p>{def.intro}</p>
    <DataDrop onLoaded={onData} />
  </>;
  const missing = def.requiredVariables.filter(v => !data.sav.byName.has(v));
  if (missing.length) return <p className="sandbox-error" role="alert">
    Für diese Aufgabe fehlen in deiner Datei die Variablen {missing.join(', ')}. Bitte die vollständige Datei ZA8831 v1.3.0 von GESIS laden.
    {onReset && <> <button className="sandbox-link" onClick={onReset}>Andere Datei laden</button></>}
  </p>;
  const Task = def.Component;
  return <Task data={data} state={state} onChange={onRaw} onConcept={onConcept} />;
}
