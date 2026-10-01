import type { Explain } from '../../explain/types';
import { Formelwerkstatt } from './Formelwerkstatt';
import { FormelAlsSatz } from './FormelAlsSatz';
import { Werkzeug } from './Werkzeug';
import { TabellenWerkzeug } from './TabellenWerkzeug';
import { Begriffskarte } from './Begriffskarte';

/** Kopfzeile (Eyebrow) im Inspector je Vorlage. */
export const EXPLAIN_LABEL: Record<Explain['kind'], string> = {
  werkstatt: 'Formelwerkstatt', satz: 'Formel als Satz', werkzeug: 'Werkzeug', tabelle: 'Werkzeug', begriff: 'Begriffskarte',
};

/**
 * Rendert die Erklärung eines Begriffs mit ihrer Vorlage (Spezifikation Ausbau, Abschnitt 4). `id` ist der
 * Begriff; er dient als Schlüssel, damit der Zustand beim Wechsel des Begriffs zurückgesetzt wird.
 */
export function Explanation({ id, explain, onConcept }: { id: string; explain: Explain; onConcept: (id: string) => void }) {
  switch (explain.kind) {
    case 'werkstatt': return <Formelwerkstatt key={`werkstatt-${id}`} workshop={explain.workshop} variant={explain.variant} onConcept={onConcept} />;
    case 'satz': return <FormelAlsSatz key={`satz-${id}`} template={explain.template} onConcept={onConcept} />;
    case 'werkzeug': return <Werkzeug key={`werkzeug-${id}`} template={explain.template} onConcept={onConcept} />;
    case 'tabelle': return <TabellenWerkzeug key={`tabelle-${id}`} tool={explain.tool} onConcept={onConcept} />;
    case 'begriff': return <Begriffskarte key={`begriff-${id}`} card={explain.card} onConcept={onConcept} />;
  }
}
