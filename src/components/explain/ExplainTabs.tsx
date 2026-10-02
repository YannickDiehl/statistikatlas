// Reiterleiste der Erklärungen (Spezifikation Lehrdatensatz und R, Abschnitt 5.1; Ausbau, Abschnitt 5):
// „Verstehen“, „Mit 200 Befragten“, „In R“, „Weiter“ nach dem ARIA-Muster „Tabs“. Alle Reiter bleiben eingehängt
// und werden nur verborgen, damit Eingaben, Schritt, Person und Vorhersagen beim Wechsel erhalten bleiben.
// Der gewählte Reiter gilt je Begriff für die laufende Sitzung.
import { useCallback, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import type { ConceptTabs, Explain } from '../../explain/types';
import { workshopFor } from '../../explain/registry';
import { KurzGesagt, TabLinkContext } from './basics';

export type TabId = 'verstehen' | 'sample' | 'r' | 'weiter';
export type TabLinks = {
  /** Sprung in den Reiter „Mit 200 Befragten“ zu einem Schritt (aus „Verstehen“ oder „In R“). */
  goSample?: { step: number; n: number };
  /** Zahl in „So antwortet R“ → Schritt, im Reiter, der diese Schritte zeigt (`stepTargets`); ohne Schritte nicht gesetzt. */
  stepLink?: (step: number) => void;
};

/**
 * Wo die Schritte eines Begriffs stehen, auf die „In R“ verweist (`outputMap.step`): in der Brücke („Mit 200
 * Befragten“), sonst in „Verstehen“ (Werkstatt, Bausteine der Begriffskarte, Schritte des Tabellen-Werkzeugs).
 * `titles[k − 1]` ist der Titel von Schritt k. null heißt: Der Begriff hat keine Schritte.
 */
export function stepTargets(explain: Explain | null, tabs: ConceptTabs | null): { tab: 'sample' | 'verstehen'; titles: string[] } | null {
  const s = tabs?.sample;
  if (s?.kind === 'bridge') {
    const w = workshopFor(s.workshop), v = w?.variants[s.variant];
    if (w && v) return { tab: 'sample', titles: w.steps.slice(0, v.lastStep).map(x => x.title) };
  }
  switch (explain?.kind) {
    case 'werkstatt': return { tab: 'verstehen', titles: explain.workshop.steps.slice(0, explain.workshop.variants[explain.variant].lastStep).map(x => x.title) };
    case 'begriff': return { tab: 'verstehen', titles: explain.card.bausteine.map(b => b.title) };
    case 'tabelle': return { tab: 'verstehen', titles: explain.tool.steps.map(x => x.title) };
    default: return null;
  }
}

/** Reiter je Begriff für die laufende Sitzung (nicht gespeichert). */
const remembered = new Map<string, TabId>();
/** Nur für Tests: Sitzungsgedächtnis leeren. */
export const forgetTabs = () => remembered.clear();

/**
 * Name des ersten Reiters nach Vorlage: „Verstehen (5 Personen)“ für Werkstätten mit Personen, auch mit eigenem
 * `dataNote` (IB31); „Verstehen“, wenn die Zeilen keine Personen sind (`table.rowHead`); „Werkzeug“ für Werkzeuge.
 */
export function firstTabLabel(explain: Explain | null): string {
  if (explain?.kind === 'werkstatt') return explain.workshop.table.rowHead ? 'Verstehen' : `Verstehen (${explain.workshop.names.length} Personen)`;
  if (explain?.kind === 'werkzeug' || explain?.kind === 'tabelle') return 'Werkzeug';
  return 'Verstehen';
}

/** Die Reiter eines Begriffs in fester Reihenfolge: Verstehen, Mit 200 Befragten (wenn vorhanden), In R (wenn vorhanden), Weiter. */
export function tabList(explain: Explain | null, tabs: ConceptTabs): { id: TabId; label: string }[] {
  return [
    { id: 'verstehen', label: firstTabLabel(explain) },
    ...(tabs.sample ? [{ id: 'sample' as const, label: 'Mit 200 Befragten' }] : []),
    ...(tabs.r ? [{ id: 'r' as const, label: 'In R' }] : []),
    { id: 'weiter', label: 'Weiter' },
  ];
}

/** Beschriftung eines Reiters: Eine Klammer („(5 Personen)“) bleibt beim Umbruch zusammen. */
function tabText(label: string): ReactNode {
  const i = label.indexOf(' (');
  return i < 0 ? label : <>{label.slice(0, i)} <span className="xw-nowrap">{label.slice(i + 1)}</span></>;
}

/** „Kurz gesagt“ über den Reitern, je Vorlage. */
export function kurzOf(explain: Explain | null): { text: string; fach?: string } | null {
  switch (explain?.kind) {
    case 'werkstatt': { const v = explain.workshop.variants[explain.variant]; return { text: v.kurz, fach: v.fachlich }; }
    case 'satz': return { text: explain.template.kurz, fach: explain.template.fachlich };
    case 'werkzeug': return { text: explain.template.kurz, fach: explain.template.fachlich };
    case 'tabelle': return { text: explain.tool.kurz };
    case 'begriff': return { text: explain.card.kurz };
    default: return null;
  }
}

export function ExplainTabs({ concept, tabs, kurz, steps, render }: {
  concept: string;
  tabs: { id: TabId; label: string }[];
  kurz?: { text: string; fach?: string } | null;
  /** Reiter mit den Schritten, auf die „In R“ verweist (`stepTargets`). */
  steps?: 'sample' | 'verstehen' | null;
  render: (id: TabId, links: TabLinks) => ReactNode;
}) {
  const ids = tabs.map(t => t.id);
  const [active, setActiveRaw] = useState<TabId>(() => { const r = remembered.get(concept); return r && ids.includes(r) ? r : 'verstehen'; });
  const [goVerstehen, setGoVerstehen] = useState<{ step: number; n: number } | undefined>();
  const [goSample, setGoSample] = useState<{ step: number; n: number } | undefined>();
  const understandStep = useRef(1), root = useRef<HTMLDivElement>(null), bar = useRef<HTMLDivElement>(null);
  const buttons = useRef<Partial<Record<TabId, HTMLButtonElement | null>>>({}), panels = useRef<Partial<Record<TabId, HTMLDivElement | null>>>({});
  const select = (id: TabId) => { remembered.set(concept, id); setActiveRaw(id); };
  const onUnderstandStep = useCallback((n: number) => { understandStep.current = n; }, []);
  const hasKurz = !!kurz;
  const link = useMemo(() => ({ kurzAbove: hasKurz, onStep: onUnderstandStep, goTo: goVerstehen }), [hasKurz, onUnderstandStep, goVerstehen]);
  /**
   * Reiter zeigen; ohne eigenes Sprungziel (Schritt) bekommt das Panel den Fokus. Liegt sein Anfang dann über dem
   * sichtbaren Teil (oder unter der klebenden Leiste), rückt er nach oben in den Blick (scroll-padding hält die Leiste frei).
   */
  const show = (id: TabId, focusPanel = true) => {
    select(id);
    if (!focusPanel) return;
    requestAnimationFrame(() => {
      const panel = panels.current[id], box = panel?.closest<HTMLElement>('.network-inspector');
      if (!panel) return;
      panel.focus({ preventScroll: true });
      const top = panel.getBoundingClientRect().top;
      const from = box ? box.getBoundingClientRect().top + (parseFloat(getComputedStyle(box).scrollPaddingTop) || 0) : 0;
      const to = box ? Math.min(box.getBoundingClientRect().bottom, innerHeight) : innerHeight;
      if (top < from - 1 || top > to - 40) panel.scrollIntoView({ block: 'start' });
    });
  };
  const stepLink = steps && ids.includes(steps) ? (step: number) => {
    // Das Ziel (Lernkarte bzw. Baustein) nimmt den Fokus selbst.
    if (steps === 'sample') { setGoSample(g => ({ step, n: (g?.n ?? 0) + 1 })); show('sample', false); }
    else { setGoVerstehen(g => ({ step, n: (g?.n ?? 0) + 1 })); show('verstehen', false); }
  } : undefined;
  const links: TabLinks = { goSample, stepLink };
  // Maße der Reiterleiste als CSS-Variablen am Inspector: --xw-tabs-h (Höhe; darunter bleibt die Formel der Werkbank
  // stehen), --xw-pad (Innenabstand oben, dort klebt die Leiste) und --xw-tabs-bottom (beides zusammen; daraus
  // scroll-padding, damit Sprungziele und Fokus nicht unter der Leiste landen). Klebt die Leiste, bekommt sie xw-stuck.
  useLayoutEffect(() => {
    const el = bar.current, box = root.current?.closest<HTMLElement>('.network-inspector') ?? root.current;
    if (!el || !box || typeof ResizeObserver === 'undefined') return;
    let pad = 0;
    const write = () => {
      pad = parseFloat(getComputedStyle(box).paddingTop) || 0;
      box.style.setProperty('--xw-tabs-h', `${el.offsetHeight}px`);
      box.style.setProperty('--xw-pad', `${pad}px`);
      box.style.setProperty('--xw-tabs-bottom', `${pad + el.offsetHeight}px`);
    };
    const stuck = () => {
      const sticky = getComputedStyle(el).position === 'sticky';
      const offset = el.getBoundingClientRect().top - box.getBoundingClientRect().top - box.clientTop;
      el.classList.toggle('xw-stuck', sticky && box.scrollTop > 0 && offset <= pad + 0.5);
    };
    write(); stuck();
    const observer = new ResizeObserver(() => { write(); stuck(); });
    observer.observe(el); observer.observe(box);
    box.addEventListener('scroll', stuck, { passive: true });
    return () => { observer.disconnect(); box.removeEventListener('scroll', stuck); };
  }, []);
  function key(e: KeyboardEvent) {
    const i = ids.indexOf(active), next = e.key === 'ArrowRight' ? ids[(i + 1) % ids.length] : e.key === 'ArrowLeft' ? ids[(i - 1 + ids.length) % ids.length]
      : e.key === 'Home' ? ids[0] : e.key === 'End' ? ids[ids.length - 1] : null;
    if (!next) return;
    e.preventDefault();
    select(next);
    buttons.current[next]?.focus();
  }
  const tabId = (id: TabId) => `xt-${concept}-${id}`, panelId = (id: TabId) => `xp-${concept}-${id}`;
  return (
    <div className="xw-tabbed" ref={root}>
      {kurz && <div className="xw xw-top-kurz"><KurzGesagt text={kurz.text} fach={kurz.fach} /></div>}
      <div className="xw-tabs" role="tablist" aria-label="Teile der Erklärung" onKeyDown={key} ref={bar}>
        {tabs.map(t => (
          <button type="button" key={t.id} id={tabId(t.id)} role="tab" aria-selected={active === t.id} aria-controls={panelId(t.id)} tabIndex={active === t.id ? 0 : -1}
            className={t.label.length <= 6 ? 'xw-tab-short' : undefined}
            ref={el => { buttons.current[t.id] = el; }} onClick={() => select(t.id)}>{tabText(t.label)}</button>
        ))}
      </div>
      {tabs.map(t => (
        <div key={t.id} id={panelId(t.id)} role="tabpanel" aria-labelledby={tabId(t.id)} tabIndex={0} hidden={active !== t.id} className="xw-tabpanel"
          ref={el => { panels.current[t.id] = el; }}>
          {t.id === 'verstehen' ? <TabLinkContext.Provider value={link}>
            {render('verstehen', links)}
            {ids.includes('sample') && <p className="xw xw-onward"><button type="button" className="xw-button" onClick={() => { setGoSample(g => ({ step: understandStep.current, n: (g?.n ?? 0) + 1 })); show('sample', !steps || steps !== 'sample'); }}>Weiter mit 200 Befragten</button></p>}
          </TabLinkContext.Provider> : render(t.id, links)}
        </div>
      ))}
    </div>
  );
}
