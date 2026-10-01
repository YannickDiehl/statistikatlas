// Muster der Vorlagen, aus ihren Bereichen herausgenommen (Spezifikation Ausbau, Abschnitt 6):
// `p_value` als Begriffskarte, `dummy` als Tabellen-Werkzeug. Die Reiter füllt F3.
import type { AreaIndex } from '../../types';
import { pWert } from './p-wert';
import { dummy } from './dummy';

export const muster: AreaIndex = {
  explanations: {
    [pWert.concept]: { kind: 'begriff', card: pWert },
    [dummy.concept]: { kind: 'tabelle', tool: dummy },
  },
  tabs: {},
};
