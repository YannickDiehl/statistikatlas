/**
 * Zuordnung Begriff → Erklärung. Zuerst die Pilotbegriffe (Werkstätten Mittel, Streuung, Zusammenhang,
 * Standardfehler, Rekodieren), dann alle Bereiche aus src/explain/content/index.ts (`AREAS`).
 * Bereiche tragen sich nicht hier ein, sondern nur in ihrem eigenen `content/<bereich>/index.ts`.
 */
import type { AnyWorkshop, AreaIndex, ConceptTabs, Explain } from './types';
import { mittel } from './content/mittel';
import { streuung } from './content/streuung';
import { zusammenhang } from './content/zusammenhang';
import { standardfehler } from './content/standardfehler';
import { rekodieren } from './content/rekodieren';
import { AREAS } from './content';

export type { AnyWorkshop, Explain } from './types';

const PILOT_WORKSHOPS: AnyWorkshop[] = [mittel, streuung, zusammenhang];

/** Erklärungen der Pilotbegriffe; die Werkstattbegriffe kommen aus `variants`. */
const PILOT: Record<string, Explain> = {
  ...Object.fromEntries(PILOT_WORKSHOPS.flatMap(workshop => Object.keys(workshop.variants).map(variant => [variant, { kind: 'werkstatt', workshop, variant } satisfies Explain]))),
  [standardfehler.concept]: { kind: 'satz', template: standardfehler },
  [rekodieren.concept]: { kind: 'werkzeug', template: rekodieren },
};

/** Reiter der Pilotbegriffe; F3 füllt sie (src/explain/content/pilot-tabs.ts). */
const PILOT_TABS: Record<string, ConceptTabs> = {};

/** Schrittkarten der Pilotbegriffe (Spezifikation Werkstatt 6.4), ohne den Kontext des Ankers. */
const PILOT_STEP_IDS = ['sum', 'deviation', 'squared_deviation', 'ss', 'df', 'crossproduct', 'crossproduct_sum', 'sd_product'];

export type AreaTables = {
  explanations: Record<string, Explain>;
  tabs: Record<string, ConceptTabs>;
  stepCards: Record<string, { workshop: string; variant: string; step: number }>;
  workshops: AnyWorkshop[];
};

/**
 * Führt die Bereiche zusammen. Wirft einen Fehler, wenn ein Begriff in zwei Bereichen (oder in einem Bereich
 * und im Pilot) erklärt wird, wenn zwei Werkstätten dieselbe Kennung haben, wenn eine Schrittkarte auf eine
 * unbekannte Werkstatt zeigt oder wenn Reiter für einen fremden Begriff vergeben werden. So fällt eine
 * Doppelung schon beim Laden auf, nicht erst im Browser.
 *
 * `reserved.ids` sind Begriffe mit Erklärung oder Schrittkarte im Pilot; `reserved.tabs` Begriffe, deren
 * Reiter der Pilot selbst liefert. Reiter für eine Pilot-Schrittkarte (etwa `ss`) darf genau ein Bereich vergeben.
 */
export function mergeAreas(areas: Record<string, AreaIndex>, reserved: { ids: Iterable<string>; tabs?: Iterable<string>; workshops: AnyWorkshop[] }): AreaTables {
  const owner = new Map<string, string>();
  for (const id of reserved.ids) owner.set(id, 'pilot');
  const claim = (id: string, area: string, what: string) => {
    const before = owner.get(id);
    if (before !== undefined) throw new Error(`Begriff „${id}“ (${what}) ist doppelt vergeben: ${before} und ${area}.`);
    owner.set(id, area);
  };
  const out: AreaTables = { explanations: {}, tabs: {}, stepCards: {}, workshops: [] };
  const workshopIds = new Map<string, string>(reserved.workshops.map(w => [w.id, 'pilot']));
  for (const [area, index] of Object.entries(areas)) {
    for (const [id, explain] of Object.entries(index.explanations)) {
      claim(id, area, 'Erklärung');
      out.explanations[id] = explain;
      if (explain.kind === 'werkstatt' && !out.workshops.includes(explain.workshop)) {
        const before = workshopIds.get(explain.workshop.id);
        if (before !== undefined) throw new Error(`Werkstatt „${explain.workshop.id}“ ist doppelt vergeben: ${before} und ${area}.`);
        workshopIds.set(explain.workshop.id, area);
        out.workshops.push(explain.workshop);
      }
    }
    for (const [id, card] of Object.entries(index.stepCards ?? {})) {
      claim(id, area, 'Schrittkarte');
      out.stepCards[id] = card;
    }
  }
  const pilotTabs = new Set(reserved.tabs ?? []);
  const tabOwner = new Map<string, string>();
  for (const [area, index] of Object.entries(areas)) for (const [id, tabs] of Object.entries(index.tabs)) {
    const explainedBy = owner.get(id);
    if (pilotTabs.has(id)) throw new Error(`Reiter für „${id}“ liefert der Pilot, nicht ${area}.`);
    if (explainedBy !== undefined && explainedBy !== 'pilot' && explainedBy !== area) throw new Error(`Reiter für „${id}“ gehören zu ${explainedBy}, nicht zu ${area}.`);
    if (tabOwner.has(id)) throw new Error(`Reiter für „${id}“ sind doppelt vergeben: ${tabOwner.get(id)} und ${area}.`);
    tabOwner.set(id, area);
    out.tabs[id] = tabs;
  }
  const known = new Set([...reserved.workshops, ...out.workshops].map(w => w.id));
  for (const [id, card] of Object.entries(out.stepCards))
    if (!known.has(card.workshop)) throw new Error(`Schrittkarte „${id}“ zeigt auf die unbekannte Werkstatt „${card.workshop}“.`);
  return out;
}

const merged = mergeAreas(AREAS, { ids: [...Object.keys(PILOT), ...PILOT_STEP_IDS], tabs: Object.keys(PILOT), workshops: PILOT_WORKSHOPS });

/** Alle Werkstätten: Pilot und alle Werkstätten aus den Bereichen. */
export const WORKSHOPS: AnyWorkshop[] = [...PILOT_WORKSHOPS, ...merged.workshops];
const workshopById = new Map(WORKSHOPS.map(w => [w.id, w]));

/** Alle registrierten Erklärungen mit Begriff, für Tests und Prüfskripte. */
export const EXPLANATIONS: Record<string, Explain> = { ...PILOT, ...merged.explanations };

/** Welche Erklärung ein Begriff bekommt; null heißt: bisherige Darstellung. Pilot zuerst, dann die Bereiche. */
export function explainFor(id: string): Explain | null {
  return PILOT[id] ?? merged.explanations[id] ?? null;
}

/** Reiter eines Begriffs (Pilot und Bereiche); null heißt: keine Reiter. */
export function tabsFor(id: string): ConceptTabs | null {
  return PILOT_TABS[id] ?? merged.tabs[id] ?? null;
}

export type StepCard = { workshop: AnyWorkshop; variant: string; step: number };

/**
 * Schrittkarte für Begriffe, die ein Schritt einer Werkstatt sind (Spezifikation Werkstatt 6.4).
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
  }
  const card = merged.stepCards[id];
  const workshop = card && workshopById.get(card.workshop);
  return card && workshop ? { workshop, variant: card.variant, step: card.step } : null;
}

// Sprung „Werkstatt öffnen“ zu einem bestimmten Schritt: Die Schrittkarte hinterlegt den Schritt,
// die Werkstatt holt ihn nach dem Einhängen ab (Effekt). Alte Anfragen verfallen nach zehn Sekunden.
let pending: { concept: string; step: number; at: number } | null = null;
export function requestStep(concept: string, step: number, now = Date.now()) { pending = { concept, step, at: now }; }
export function takeStep(concept: string, now = Date.now()): number | null {
  const p = pending;
  if (!p || now - p.at > 10000) { pending = null; return null; }
  if (p.concept !== concept) return null;
  pending = null;
  return p.step;
}
