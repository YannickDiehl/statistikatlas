// Reiterleiste der Erklärungen (Spezifikation Lehrdatensatz und R, Abschnitt 5.1; Ausbau, Abschnitt 5):
// „Verstehen“, „Mit 200 Befragten“, „In R“, „Weiter“ nach dem ARIA-Muster „Tabs“. Alle Reiter bleiben eingehängt
// und werden nur verborgen, damit Eingaben, Schritt, Person und Vorhersagen beim Wechsel erhalten bleiben.
// Der gewählte Reiter gilt je Begriff für die laufende Sitzung.
import { useCallback, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import type { ConceptTabs, Explain } from '../../explain/types';
import { KurzGesagt, TabLinkContext } from './basics';

export type TabId = 'verstehen' | 'sample' | 'r' | 'weiter';
export type TabLinks = {
  /** Sprung in den Reiter „Mit 200 Befragten“ zu einem Schritt (aus „Verstehen“ oder „In R“). */
  goSample?: { step: number; n: number };
  /** Der Reiter „Mit 200 Befragten“ meldet seinen Schritt. */
  onSampleStep: (step: number) => void;
  /** Zahl in „So antwortet R“ → Schritt: in der Brücke, sonst in „Verstehen“. */
  stepLink: (step: number) => void;
};

/** Reiter je Begriff für die laufende Sitzung (nicht gespeichert). */
const remembered = new Map<string, TabId>();
/** Nur für Tests: Sitzungsgedächtnis leeren. */
export const forgetTabs = () => remembered.clear();

/** Name des ersten Reiters nach Vorlage: „Verstehen (5 Personen)“ für Werkstätten mit Personen, „Werkzeug“ für Werkzeuge. */
export function firstTabLabel(explain: Explain | null): string {
  if (explain?.kind === 'werkstatt') return explain.workshop.dataNote ? 'Verstehen' : `Verstehen (${explain.workshop.names.length} Personen)`;
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

export function ExplainTabs({ concept, tabs, kurz, render }: {
  concept: string;
  tabs: { id: TabId; label: string }[];
  kurz?: { text: string; fach?: string } | null;
  render: (id: TabId, links: TabLinks) => ReactNode;
}) {
  const ids = tabs.map(t => t.id);
  const [active, setActiveRaw] = useState<TabId>(() => { const r = remembered.get(concept); return r && ids.includes(r) ? r : 'verstehen'; });
  const [goVerstehen, setGoVerstehen] = useState<{ step: number; n: number } | undefined>();
  const [goSample, setGoSample] = useState<{ step: number; n: number } | undefined>();
  const understandStep = useRef(1), buttons = useRef<Partial<Record<TabId, HTMLButtonElement | null>>>({}), panels = useRef<Partial<Record<TabId, HTMLDivElement | null>>>({});
  const select = (id: TabId) => { remembered.set(concept, id); setActiveRaw(id); };
  const onUnderstandStep = useCallback((n: number) => { understandStep.current = n; }, []);
  const onSampleStep = useCallback(() => {}, []);
  const link = useMemo(() => ({ kurzAbove: !!kurz, onStep: onUnderstandStep, goTo: goVerstehen }), [kurz, onUnderstandStep, goVerstehen]);
  const show = (id: TabId) => { select(id); requestAnimationFrame(() => panels.current[id]?.focus({ preventScroll: false })); };
  const stepLink = (step: number) => {
    if (ids.includes('sample')) { setGoSample(g => ({ step, n: (g?.n ?? 0) + 1 })); show('sample'); }
    else { setGoVerstehen(g => ({ step, n: (g?.n ?? 0) + 1 })); show('verstehen'); }
  };
  const links: TabLinks = { goSample, onSampleStep, stepLink };
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
    <div className="xw-tabbed">
      {kurz && <div className="xw xw-top-kurz"><KurzGesagt text={kurz.text} fach={kurz.fach} /></div>}
      <div className="xw-tabs" role="tablist" aria-label="Teile der Erklärung" onKeyDown={key}>
        {tabs.map(t => (
          <button type="button" key={t.id} id={tabId(t.id)} role="tab" aria-selected={active === t.id} aria-controls={panelId(t.id)} tabIndex={active === t.id ? 0 : -1}
            ref={el => { buttons.current[t.id] = el; }} onClick={() => select(t.id)}>{t.label}</button>
        ))}
      </div>
      {tabs.map(t => (
        <div key={t.id} id={panelId(t.id)} role="tabpanel" aria-labelledby={tabId(t.id)} tabIndex={0} hidden={active !== t.id} className="xw-tabpanel"
          ref={el => { panels.current[t.id] = el; }}>
          {t.id === 'verstehen' ? <TabLinkContext.Provider value={link}>
            {render('verstehen', links)}
            {ids.includes('sample') && <p className="xw xw-onward"><button type="button" className="xw-button" onClick={() => { setGoSample(g => ({ step: understandStep.current, n: (g?.n ?? 0) + 1 })); show('sample'); }}>Weiter mit 200 Befragten</button></p>}
          </TabLinkContext.Provider> : render(t.id, links)}
        </div>
      ))}
    </div>
  );
}
