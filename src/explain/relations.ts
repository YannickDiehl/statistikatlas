/**
 * Bezüge im Netzwerk für den Reiter „Weiter“ und die Bezugslisten des Inspectors (Spezifikation Lehrdatensatz,
 * Abschnitt 9: „Doppelte Bezugsziele werden zu einem Eintrag zusammengeführt“). Rein, ohne React.
 */
import type { NetworkEdge } from '../domain/network';
import type { NextTab } from './types';

/** Ein Ziel mit einem Satz („why“), aus einem oder mehreren Bezügen zusammengeführt. */
export type RelationItem = { id: string; why: string; kind: NetworkEdge['kind']; alternative: boolean };

/** Bezugstext ohne Mittelpunkt als Trenner: „liefert den Bezugspunkt · über Abweichung“ → „liefert den Bezugspunkt, über Abweichung“. */
export const relationText = (label: string) => label.replace(/\s+·\s+über\s+/g, ', über ').replace(/\s+·\s+/g, ', ');

/**
 * Führt Bezüge auf dasselbe Ziel zu einem Eintrag zusammen. `side` sagt, welches Ende das Ziel ist
 * (`before`: die Quelle, `after`: das Ziel des Bezugs). Verschiedene Texte werden mit „;“ verbunden,
 * gleiche nur einmal genannt; die Reihenfolge bleibt die des ersten Auftretens.
 */
export function mergeRelations(edges: readonly NetworkEdge[], side: 'before' | 'after'): RelationItem[] {
  const out = new Map<string, RelationItem>();
  for (const e of edges) {
    const id = side === 'before' ? e.source : e.target, text = relationText(e.label);
    const old = out.get(id);
    if (!old) { out.set(id, { id, why: text, kind: e.kind, alternative: !!e.alternative }); continue; }
    if (!old.why.split('; ').includes(text)) old.why = `${old.why}; ${text}`;
    if (e.kind === 'build') old.kind = 'build';
    old.alternative = old.alternative && !!e.alternative;
  }
  return [...out.values()];
}

/** Bezüge eines Begriffs, wie der Inspector sie bekommt. */
export type Edges = { before: readonly NetworkEdge[]; after: readonly NetworkEdge[] };

/**
 * Inhalt des Reiters „Weiter“: von Hand geschriebene Listen (`tab`), leere Listen aus den Bezügen der Karte
 * („Das geht voraus“: aufbauende Bezüge davor; „Daraus entsteht“: alle direkten Bezüge danach außer der Einordnung),
 * darunter zugeklappt `more` und alle übrigen Bezüge. Jedes Ziel steht höchstens einmal da.
 */
export function nextLists(tab: NextTab, edges: Edges): { next: RelationItem; before: RelationItem[]; after: RelationItem[]; more: RelationItem[] } {
  const hand = (list: { id: string; why: string }[]) => list.map(x => ({ ...x, kind: 'build' as const, alternative: false }));
  const before = tab.before.length ? hand(tab.before) : mergeRelations(edges.before.filter(e => e.kind === 'build' && !e.alternative), 'before');
  const after = tab.after.length ? hand(tab.after) : mergeRelations(edges.after.filter(e => !e.alternative && e.kind !== 'meaning'), 'after');
  const shown = new Set([tab.next.id, ...before.map(x => x.id), ...after.map(x => x.id)]);
  const more: RelationItem[] = [];
  for (const item of [...hand(tab.more ?? []), ...mergeRelations(edges.before, 'before'), ...mergeRelations(edges.after, 'after')]) {
    if (shown.has(item.id)) continue;
    shown.add(item.id);
    more.push(item);
  }
  return { next: { ...tab.next, kind: 'build', alternative: false }, before, after, more };
}
