/** Umschalter „Kompakt / Ausführlich“ (Spezifikation 6.1), gespeichert je Browser. */
export type Mode = 'ausfuehrlich' | 'kompakt';
export const MODE_KEY = 'statistikatlas.erklaerung.v1';
type Store = Pick<Storage, 'getItem' | 'setItem'>;

export function createModeStore(storage: Store | null) {
  let mode: Mode = 'ausfuehrlich';
  try { if (storage?.getItem(MODE_KEY) === 'kompakt') mode = 'kompakt'; } catch { /* Speicher gesperrt */ }
  const listeners = new Set<() => void>();
  return {
    get: (): Mode => mode,
    set(next: Mode) {
      if (next === mode) return;
      mode = next;
      try { storage?.setItem(MODE_KEY, next); } catch { /* nur für diese Sitzung */ }
      listeners.forEach(l => l());
    },
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
  };
}

function browserStorage(): Store | null {
  try { return typeof window !== 'undefined' ? window.localStorage : null; } catch { return null; }
}

export const modeStore = createModeStore(browserStorage());
