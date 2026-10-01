// Reiter „Weiter“ (Spezifikation Lehrdatensatz 5.6, Ausbau 5): Als Nächstes hervorgehoben, Das geht voraus,
// Daraus entsteht, je Ziel ein Satz; darunter zugeklappt weitere Verwendungen und Rechenwege. Leere Listen und
// alle übrigen Bezüge kommen aus der Karte, doppelte Ziele zusammengeführt (src/explain/relations.ts).
import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { titleFor, type Ref, type Route } from '../../domain/learning';
import { referenceInMap } from '../../domain/network';
import type { NextTab as NextTabData, SampleCtx } from '../../explain/types';
import { nextLists, type Edges, type RelationItem } from '../../explain/relations';
import { tight } from './basics';

export type NextProps = {
  tab: NextTabData;
  edges: Edges;
  selected: Ref;
  route: Route;
  contextAnchor?: Ref;
  onSelect: (r: Ref) => void;
  onHover: (id: string | null) => void;
  trace: boolean;
  onTrace: () => void;
  /** Weitere Einordnung (Voraussetzungen, Hinweise, Quellen), zugeklappt am Ende. */
  extra?: ReactNode;
  /** Aktuelle Daten und Spalten für Sätze, die rechnen (`NextItem.why` als Funktion). */
  ctx?: SampleCtx;
};

/** Nach dem Wechsel zu einem anderen Begriff: Fokus auf seinen Titel, statt ihn auf der Seite zu verlieren. */
const focusTitle = () => requestAnimationFrame(() => requestAnimationFrame(() => document.getElementById('inspector-title')?.focus({ preventScroll: true })));

export function NextTab(p: NextProps) {
  const lists = nextLists(p.tab, p.edges, p.ctx);
  const link = (item: RelationItem, main = false) => {
    const target = referenceInMap(item.id, p.selected, p.route, p.contextAnchor);
    return (
      <button type="button" key={item.id} className={`relation-link xw-next-link${main ? ' main' : ''}`} onClick={() => { p.onSelect(target); focusTitle(); }}
        onPointerEnter={() => p.onHover(item.id)} onPointerLeave={() => p.onHover(null)} onFocus={() => p.onHover(item.id)} onBlur={() => p.onHover(null)}>
        <span><strong>{titleFor(target)}</strong><small>{tight(item.why)}</small></span><ArrowUpRight size={15} aria-hidden="true" />
      </button>
    );
  };
  return (
    <section className="xw xw-next inspector-relations" aria-label="Bezüge im Netzwerk">
      <div className="relations-heading"><h2>Von hier aus weiter</h2><button type="button" onClick={p.onTrace} aria-pressed={p.trace}>{p.trace ? 'Direkte Bezüge' : 'Alle Voraussetzungen'}</button></div>
      <div className="xw-next-main"><span className="xw-label">Als Nächstes</span>{link(lists.next, true)}</div>
      {lists.before.length > 0 && <div className="relation-group"><h3>Das geht voraus</h3>{lists.before.map(x => link(x))}</div>}
      {lists.after.length > 0 && <div className="relation-group"><h3>Daraus entsteht</h3>{lists.after.map(x => link(x))}</div>}
      {lists.more.length > 0 && <details className="xw-more"><summary>Weitere Verwendungen und Rechenwege</summary><div className="relation-group other-uses">{lists.more.map(x => link(x))}</div></details>}
      {p.extra}
    </section>
  );
}
