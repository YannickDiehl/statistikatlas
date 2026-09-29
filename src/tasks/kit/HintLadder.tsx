import { LifeBuoy } from 'lucide-react';
import { useState } from 'react';
import { workshopUrl } from '../../domain/curriculum';
import { RBlock } from './RBlock';

/** Vier Stufen: Denkanstoß → Verweis → Gerüst mit Lücken (___) → vollständiger Code. */
export type Hint = {
  think: string;
  pointer: string;
  concept?: { id: string; label: string };
  workshop?: string;
  scaffold: string;
  solution: string;
};

export function HintLadder({ hint, onConcept, file }: { hint: Hint; onConcept: (id: string) => void; file?: string }) {
  const [level, setLevel] = useState(0);
  return <div className="task-hints">
    {level > 0 && <ol className="task-hint-steps">
      <li><strong>Denkanstoß.</strong> {hint.think}</li>
      {level > 1 && <li>
        <strong>Wo nachsehen?</strong> {hint.pointer}{' '}
        {hint.concept && <button className="sandbox-link" onClick={() => onConcept(hint.concept!.id)}>{hint.concept.label} in der Karte</button>}
        {hint.workshop && <a href={workshopUrl} target="_blank" rel="noreferrer">R-Workshop: {hint.workshop}</a>}
      </li>}
      {level > 2 && <li><strong>Gerüst.</strong> Ersetze die Lücken ___:<RBlock code={hint.scaffold} /></li>}
      {level > 3 && <li><strong>Lösung.</strong> Die Aufgabe zählt trotzdem als bearbeitet – entscheiden musst du weiterhin selbst.<RBlock code={hint.solution} file={file} /></li>}
    </ol>}
    {level < 4 && <button onClick={() => setLevel(level + 1)} aria-expanded={level > 0}>
      <LifeBuoy size={15} aria-hidden="true" /> {level === 0 ? 'Ich komme nicht weiter' : `Nächste Hilfe (${level + 1} von 4)`}
    </button>}
  </div>;
}
