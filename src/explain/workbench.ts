/**
 * Werkbank: In „Ausführlich“ dockt die Formelwerkstatt rechts an und ist an ihrer linken Kante
 * in der Breite ziehbar (Stand 1. Oktober 2026). Die gezogene Breite merkt sich der Browser;
 * ohne gemerkte Breite gilt die Standardbreite, die mit dem Fenster mitwächst.
 */
export const WORKBENCH_KEY = 'statistikatlas.werkbank.v1';
export const WORKBENCH = {
  /** schmalste Werkbank */
  min: 480,
  /** so viel Karte bleibt links mindestens sichtbar */
  mapMin: 340,
  /** Standard: Anteil am Fenster, höchstens standardMax */
  share: 0.64,
  standardMax: 1100,
  /** Schritt der Pfeiltasten */
  step: 40,
} as const;

export const maxWidth = (viewport: number) => Math.max(WORKBENCH.min, viewport - WORKBENCH.mapMin);
export const fitWidth = (width: number, viewport: number) => Math.round(Math.min(maxWidth(viewport), Math.max(WORKBENCH.min, width)));
export const standardWidth = (viewport: number) => fitWidth(Math.min(WORKBENCH.standardMax, viewport * WORKBENCH.share), viewport);

/**
 * Was in der linken Spalte der zweispaltigen Werkbank beim Scrollen stehen bleibt (Höhen in px, `room` ist
 * der sichtbare Teil des Inspectors): Formel und Bild, wenn beide hineinpassen; sonst nur die Formel, solange
 * sie höchstens 60 % des Platzes braucht und vom Bild noch etwas zu sehen ist; sonst nichts.
 */
export function stickFor(formula: number, image: number, room: number): 'all' | 'formula' | null {
  if (formula <= 0 || room <= 0) return null;
  if (formula + image + 20 <= room) return 'all';
  return formula <= room * 0.6 ? 'formula' : null;
}

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function createWorkbenchStore(storage: Store | null) {
  let width: number | null = null;
  try {
    const saved = Number(storage?.getItem(WORKBENCH_KEY));
    if (Number.isFinite(saved) && saved > 0) width = Math.round(saved);
  } catch { /* Speicher gesperrt */ }
  const listeners = new Set<() => void>();
  return {
    /** gemerkte Breite oder null für die Standardbreite */
    get: (): number | null => width,
    set(next: number | null) {
      const value = next === null ? null : Math.round(next);
      if (value === width) return;
      width = value;
      try { if (value === null) storage?.removeItem(WORKBENCH_KEY); else storage?.setItem(WORKBENCH_KEY, String(value)); } catch { /* nur für diese Sitzung */ }
      listeners.forEach(l => l());
    },
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
  };
}

function browserStorage(): Store | null {
  try { return typeof window !== 'undefined' ? window.localStorage : null; } catch { return null; }
}

export const workbenchStore = createWorkbenchStore(browserStorage());
