/**
 * Bild-Baukasten für die Werkstätten. Alle Bausteine zeichnen in Bildschirmpixeln: `useWidth` misst die Breite,
 * die Zeichnung rechnet ihre Koordinaten selbst aus. So bleiben Schrift (Klasse `xw-t`, 14 px) und Punkte auch im
 * schmalen Inspector und auf dem Telefon lesbar; nichts wird über `viewBox` verkleinert.
 *
 * Farben kommen aus den Klassen in src/explain.css (Atlas-Palette): positiv grün (`pos`), negativ gedecktes
 * Braunrot (`neg`). Farbe ist nie der einzige Träger, Vorzeichen stehen als „+“/„−“ daneben.
 * Beispiele: src/components/explain/pictures/pilot.tsx. Anleitung: src/explain/AUTHORING.md.
 */
import { useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode, type RefObject } from 'react';
import type { Workshop } from '../../../explain/types';

/** Was ein Bild einer Werkstatt bekommt; `PICTURES[workshop.picture]` in Formelwerkstatt.tsx ruft es auf. */
export type PictureProps<D = any, S = any> = {
  workshop: Workshop<D, S>;
  data: D; s: S; step: number; who: number;
  /** Neue Beispieldaten setzen (Ziehen, Tastatur); setzt die Kontrollfrage zurück. */
  setData: (d: D) => void;
  /** Person wählen, zum Beispiel beim Anklicken eines Punkts. */
  pickWho: (i: number) => void;
};
export type Picture = (p: PictureProps) => ReactNode;

export type Bounds = { min: number; max: number };
/** Auf eine ganze Zahl innerhalb der Grenzen runden (Ziehen und Pfeiltasten). */
export const clamp = (v: number, b: Bounds) => Math.min(b.max, Math.max(b.min, Math.round(v)));

/** Lineare Abbildung von Datenwerten auf Pixel; `invert` rechnet zurück. */
export function linear([d0, d1]: [number, number], [r0, r1]: [number, number]) {
  const k = d1 === d0 ? 0 : (r1 - r0) / (d1 - d0);
  const f = (v: number) => r0 + (v - d0) * k;
  return Object.assign(f, { invert: (px: number) => (k === 0 ? d0 : d0 + (px - r0) / k) });
}
export type Scale = ReturnType<typeof linear>;

/**
 * Misst die verfügbare Breite (zwischen `min` und `max` Pixeln), damit die Zeichnung in Bildschirmpixeln
 * gezeichnet wird. Das zurückgegebene `ref` gehört an das umschließende `<div>`.
 */
export function useWidth(fallback = 640, min = 300, max = 640): [RefObject<HTMLDivElement | null>, number] {
  const ref = useRef<HTMLDivElement>(null), [width, setWidth] = useState(fallback);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => setWidth(Math.max(min, Math.min(max, Math.round(el.clientWidth || fallback))));
    read();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(read);
    observer.observe(el);
    return () => observer.disconnect();
  }, [fallback, min, max]);
  return [ref, width];
}

/**
 * Ziehen per Zeiger: Erfassung beim Drücken, Ende bei Loslassen, Abbruch oder Verlust der Erfassung.
 * `svg` gehört an das `<svg>`, `handlers` ebenfalls; `start(i, e)` im `onPointerDown` eines Punkts aufrufen.
 * `onMove` bekommt den Punkt in SVG-Koordinaten (= Pixel, weil die Zeichnung nicht skaliert).
 */
export function useDrag(onMove: (i: number, p: { x: number; y: number }) => void) {
  const svg = useRef<SVGSVGElement>(null), drag = useRef<number | null>(null);
  const point = (e: PointerEvent) => {
    const s = svg.current!, pt = s.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const m = s.getScreenCTM();
    return m ? pt.matrixTransform(m.inverse()) : pt;
  };
  const end = () => { drag.current = null; };
  return {
    svg,
    start: (i: number, e: PointerEvent) => { drag.current = i; svg.current?.setPointerCapture(e.pointerId); },
    handlers: {
      onPointerMove: (e: PointerEvent<SVGSVGElement>) => { if (drag.current !== null && svg.current) onMove(drag.current, point(e)); },
      onPointerUp: end, onPointerCancel: end, onLostPointerCapture: end,
    },
  };
}

/** Pfeiltasten auf einer Achse: rechts/oben +1, links/unten −1, Pos1/Ende an die Grenzen; sonst null. */
export function keyStep(e: KeyboardEvent, value: number, bounds: Bounds): number | null {
  return e.key === 'ArrowRight' || e.key === 'ArrowUp' ? clamp(value + 1, bounds) : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? clamp(value - 1, bounds)
    : e.key === 'Home' ? bounds.min : e.key === 'End' ? bounds.max : null;
}

/**
 * Ziehbarer Punkt mit 20-px-Trefferkreis und der Rolle „slider“ (per Tab erreichbar, Pfeiltasten im `onKeyDown`).
 * `children` ist die Beschriftung im Punkt (Wert oder Name). Für zwei Achsen `valueText` und `describedBy` setzen.
 */
export function DragPoint({ x, y, label, selected, children, bounds, valueNow, valueText, describedBy, roleDescription, onPointerDown, onKeyDown }: {
  x: number; y: number; label: string; selected: boolean; children: ReactNode; bounds: Bounds; valueNow: number;
  valueText?: string; describedBy?: string; roleDescription?: string;
  onPointerDown: (e: PointerEvent) => void; onKeyDown: (e: KeyboardEvent) => void;
}) {
  return (
    <g className={`xw-dot${selected ? ' sel' : ''}`} tabIndex={0} role="slider" aria-label={label}
      aria-valuemin={bounds.min} aria-valuemax={bounds.max} aria-valuenow={valueNow} aria-valuetext={valueText}
      aria-describedby={describedBy} aria-roledescription={roleDescription} onPointerDown={onPointerDown} onKeyDown={onKeyDown}>
      <circle className="xw-hit" cx={x} cy={y} r={20} />
      <circle cx={x} cy={y} r={selected ? 13 : 11} />
      <text x={x} y={y + 4} textAnchor="middle">{children}</text>
    </g>
  );
}

/**
 * Achse mit Ticks. Waagerecht (`orient="bottom"`): Linie bei y = `at` von `from` bis `to`, Beschriftung `labelGap`
 * Pixel darunter. Senkrecht (`orient="left"`): Linie bei x = `at`, Beschriftung links davon.
 */
export function Axis({ scale, ticks, at, from, to, orient = 'bottom', format = String, labelGap = 30, title }: {
  scale: (v: number) => number; ticks: number[]; at: number; from: number; to: number;
  orient?: 'bottom' | 'left'; format?: (v: number) => string; labelGap?: number; title?: string;
}) {
  if (orient === 'left') return (
    <g aria-hidden="true">
      <line className="xw-axis" x1={at} x2={at} y1={from} y2={to} />
      {ticks.map(v => <g key={v}><line className="xw-axis" x1={at - 4} x2={at + 4} y1={scale(v)} y2={scale(v)} /><text className="xw-t" x={at - labelGap / 3} y={scale(v) + 4} textAnchor="end">{format(v)}</text></g>)}
      {title && <text className="xw-t" x={12} y={(from + to) / 2} textAnchor="middle" transform={`rotate(-90 12 ${(from + to) / 2})`}>{title}</text>}
    </g>
  );
  return (
    <g aria-hidden="true">
      <line className="xw-axis" x1={from} x2={to} y1={at} y2={at} />
      {ticks.map(v => <g key={v}><line className="xw-axis" x1={scale(v)} x2={scale(v)} y1={at - 4} y2={at + 4} /><text className="xw-t" x={scale(v)} y={at + labelGap} textAnchor="middle">{format(v)}</text></g>)}
      {title && <text className="xw-t" x={(from + to) / 2} y={at + labelGap + 18} textAnchor="middle">{title}</text>}
    </g>
  );
}

/** Balken (von `y` nach unten `height` hoch); `tone` färbt positiv/negativ, `label` steht rechts daneben. */
export function Bar({ x, y, width, height, tone = 'pos', label, selected = false }: {
  x: number; y: number; width: number; height: number; tone?: 'pos' | 'neg' | 'plain'; label?: string; selected?: boolean;
}) {
  return (
    <g>
      <rect className={`xw-bar-${tone}${selected ? ' sel' : ''}`} x={x} y={y} width={Math.max(2, width)} height={Math.max(0, height)} />
      {label && <text className="xw-t" x={x + Math.max(2, width) + 6} y={y + height / 2 + 5}>{label}</text>}
    </g>
  );
}

/** Pfad einer Funktion f zwischen `from` und `to` (Datenwerte), abgetastet an `samples` Stellen. */
function curvePath(f: (v: number) => number, from: number, to: number, x: (v: number) => number, y: (v: number) => number, samples: number) {
  const pts: string[] = [];
  for (let k = 0; k <= samples; k++) { const v = from + (to - from) * k / samples; pts.push(`${x(v).toFixed(1)},${y(f(v)).toFixed(1)}`); }
  return pts;
}

/** Linie einer Funktion, zum Beispiel einer Dichte. */
export function Curve({ f, from, to, x, y, samples = 120, className = 'xw-curve' }: {
  f: (v: number) => number; from: number; to: number; x: (v: number) => number; y: (v: number) => number; samples?: number; className?: string;
}) {
  return <path className={className} d={`M${curvePath(f, from, to, x, y, samples).join(' L')}`} />;
}

/** Fläche unter einer Kurve zwischen `from` und `to`, bis zur Grundlinie y(`base`), zum Beispiel ein p-Wert-Rand. */
export function AreaUnder({ f, from, to, x, y, base = 0, samples = 60, tone = 'pos' }: {
  f: (v: number) => number; from: number; to: number; x: (v: number) => number; y: (v: number) => number; base?: number; samples?: number; tone?: 'pos' | 'neg' | 'plain';
}) {
  if (!(to > from)) return null;
  const pts = curvePath(f, from, to, x, y, samples);
  return <path className={`xw-area-${tone}`} d={`M${x(from).toFixed(1)},${y(base).toFixed(1)} L${pts.join(' L')} L${x(to).toFixed(1)},${y(base).toFixed(1)} Z`} />;
}

/** Gestrichelte Bezugslinie (Mittelwert, kritischer Wert): senkrecht bei `x` oder waagerecht bei `y`, mit Beschriftung. */
export function MarkLine({ x, y, from, to, label, className = 'xw-mean' }: {
  x?: number; y?: number; from: number; to: number; label?: string; className?: string;
}) {
  if (x !== undefined) return <g><line className={className} x1={x} x2={x} y1={from} y2={to} />{label && <text className="xw-t" x={x} y={from - 5} textAnchor="middle">{label}</text>}</g>;
  return <g><line className={className} x1={from} x2={to} y1={y} y2={y} />{label && <text className="xw-t" x={to - 4} y={(y ?? 0) - 5} textAnchor="end">{label}</text>}</g>;
}

/** Zelle eines Gitters (Kreuztabelle, Matrix): Rechteck mit zentriertem Text, optional zweite Zeile `sub`. */
export function GridCell({ x, y, w, h, text, sub, tone = 'plain', selected = false }: {
  x: number; y: number; w: number; h: number; text: string; sub?: string; tone?: 'pos' | 'neg' | 'plain'; selected?: boolean;
}) {
  return (
    <g>
      <rect className={`xw-cell xw-cell-${tone}${selected ? ' sel' : ''}`} x={x} y={y} width={w} height={h} />
      <text className="xw-t xw-strong" x={x + w / 2} y={y + h / 2 + (sub ? -2 : 5)} textAnchor="middle">{text}</text>
      {sub && <text className="xw-t" x={x + w / 2} y={y + h / 2 + 16} textAnchor="middle">{sub}</text>}
    </g>
  );
}
