import { useEffect, useRef, useSyncExternalStore, type KeyboardEvent, type PointerEvent } from 'react';
import { maxWidth, WORKBENCH, workbenchStore } from '../../explain/workbench';

export function useWorkbenchWidth() {
  return useSyncExternalStore(workbenchStore.subscribe, workbenchStore.get, workbenchStore.get);
}

const readViewport = () => (typeof window !== 'undefined' ? window.innerWidth : 1440);
const subscribeViewport = (listener: () => void) => { window.addEventListener('resize', listener); return () => window.removeEventListener('resize', listener); };
export function useViewportWidth() {
  return useSyncExternalStore(subscribeViewport, readViewport, () => 1440);
}

/**
 * Linke Kante der Werkbank. Ziehen mit Zeiger; Pfeil links/rechts um 40 px, Pos1/Ende auf breiteste
 * oder schmalste Breite; Doppelklick oder Eingabetaste stellt die Standardbreite her.
 * `onWidth(w, false)` meldet die Breite während des Ziehens, `onWidth(w, true)` den Endstand.
 */
export function WorkbenchHandle({ width, viewport, onWidth, onReset }: {
  width: number; viewport: number; onWidth: (width: number, done: boolean) => void; onReset: () => void;
}) {
  const drag = useRef<{ x: number; width: number; moved: boolean } | null>(null), max = maxWidth(viewport);
  const dragging = (on: boolean) => { document.documentElement.classList.toggle('workbench-dragging', on); };
  useEffect(() => () => dragging(false), []);
  const move = (e: PointerEvent<HTMLDivElement>, done: boolean) => {
    const d = drag.current;
    if (!d) return;
    if (done) { drag.current = null; dragging(false); }
    // Ein bloßer Klick (auch der erste eines Doppelklicks) legt keine Breite fest.
    d.moved ||= Math.abs(e.clientX - d.x) >= 3;
    if (d.moved) onWidth(d.width + d.x - e.clientX, done);
  };
  const key = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); onReset(); return; }
    const next = e.key === 'ArrowLeft' ? width + WORKBENCH.step : e.key === 'ArrowRight' ? width - WORKBENCH.step
      : e.key === 'Home' ? max : e.key === 'End' ? WORKBENCH.min : null;
    if (next === null) return;
    e.preventDefault();
    onWidth(next, true);
  };
  return (
    <div className="workbench-handle" role="separator" aria-orientation="vertical" tabIndex={0}
      aria-label="Breite der Formelwerkstatt" aria-valuemin={WORKBENCH.min} aria-valuemax={max} aria-valuenow={width} aria-valuetext={`${width} Pixel breit`}
      title="Ziehen ändert die Breite. Doppelklick stellt die Standardbreite wieder her."
      onPointerDown={e => {
        if (e.button !== 0) return;
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        drag.current = { x: e.clientX, width, moved: false };
        dragging(true);
      }}
      onPointerMove={e => move(e, false)} onPointerUp={e => move(e, true)} onPointerCancel={e => move(e, true)} onLostPointerCapture={e => move(e, true)}
      onDoubleClick={onReset} onKeyDown={key}>
      <span aria-hidden="true" />
    </div>
  );
}
