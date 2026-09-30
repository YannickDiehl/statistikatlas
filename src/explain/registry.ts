import type { Workshop } from './types';
import { mittel } from './content/mittel';
import { streuung } from './content/streuung';
import { zusammenhang } from './content/zusammenhang';
import { standardfehler } from './content/standardfehler';
import { rekodieren } from './content/rekodieren';

export type AnyWorkshop = Workshop<any, any>;
export const WORKSHOPS: AnyWorkshop[] = [mittel, streuung, zusammenhang];

export type Explain =
  | { kind: 'werkstatt'; workshop: AnyWorkshop; variant: string }
  | { kind: 'satz'; template: typeof standardfehler }
  | { kind: 'werkzeug'; template: typeof rekodieren };

/** Welche Erklärung ein Begriff bekommt; null heißt: bisherige Darstellung. */
export function explainFor(id: string): Explain | null {
  for (const workshop of WORKSHOPS) if (workshop.variants[id]) return { kind: 'werkstatt', workshop, variant: id };
  if (id === standardfehler.concept) return { kind: 'satz', template: standardfehler };
  if (id === rekodieren.concept) return { kind: 'werkzeug', template: rekodieren };
  return null;
}

export type StepCard = { workshop: AnyWorkshop; variant: string; step: number };

/**
 * Schrittkarte für Begriffe, die ein Schritt einer Werkstatt sind (Spezifikation 6.4).
 * `anchor` ist der Begriff, von dem aus man gekommen ist (contextAnchor).
 */
export function stepCardFor(id: string, anchor?: string): StepCard | null {
  const fromPair = anchor === 'covariance' || anchor === 'pearson';
  const streuungVariant = anchor === 'variance' ? 'variance' : 'sd';
  const pairVariant = anchor === 'covariance' ? 'covariance' : 'pearson';
  switch (id) {
    case 'sum': return { workshop: mittel, variant: 'mean', step: 1 };
    case 'deviation': return fromPair ? { workshop: zusammenhang, variant: pairVariant, step: 2 } : { workshop: streuung, variant: streuungVariant, step: 2 };
    case 'squared_deviation': return { workshop: streuung, variant: streuungVariant, step: 3 };
    case 'ss': return { workshop: streuung, variant: streuungVariant, step: 4 };
    case 'df': return { workshop: streuung, variant: streuungVariant, step: 5 };
    case 'crossproduct': return { workshop: zusammenhang, variant: pairVariant, step: 3 };
    case 'crossproduct_sum': return { workshop: zusammenhang, variant: pairVariant, step: 4 };
    case 'sd_product': return { workshop: zusammenhang, variant: 'pearson', step: 6 };
    default: return null;
  }
}

// Sprung „Werkstatt öffnen“ zu einem bestimmten Schritt: Die Schrittkarte hinterlegt
// den Schritt, die Werkstatt holt ihn beim ersten Rendern ab.
let pending: { concept: string; step: number } | null = null;
export function requestStep(concept: string, step: number) { pending = { concept, step }; }
export function takeStep(concept: string): number | null {
  if (!pending || pending.concept !== concept) return null;
  const step = pending.step;
  pending = null;
  return step;
}
