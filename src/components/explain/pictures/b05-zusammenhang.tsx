// Bilder des Bereichs B5 „Zusammenhang“ für alle Vorlagen. Schlüssel = `picture` der Erklärung, Bausteine und
// `forWorkshop`/`forCard`/`forSentence`/`forTable` aus ./kit.tsx.
// Eigene Stile in src/explain/areas/b05-zusammenhang.css (lädt main.tsx automatisch). Anleitung: src/explain/AUTHORING.md.
import type { KeyboardEvent, ReactNode } from 'react';
import type { Pairs } from '../../../explain/math';
import { num, signed } from '../../../explain/format';
import type { RankStats } from '../../../explain/content/b05-zusammenhang/spearman';
import { clamp, DragPoint, forWorkshop, useDrag, useWidth, type Bounds, type Picture } from './kit';

type Drag = { data: Pairs; names: readonly string[]; who: number; bounds: Bounds; onChange: (d: Pairs) => void; onWho: (i: number) => void };

/**
 * Raster mit Gitterlinien, Achsenbeschriftung und ziehbaren Punkten (Pfeiltasten: links/rechts für x, oben/unten für y).
 * Gibt die Koordinatenfunktionen zurück, damit Bilder weitere Elemente darauf zeichnen können.
 */
function grid(L: number, T: number, plot: number, b: Bounds) {
  const u = plot / (b.max - b.min), B = T + plot;
  return { u, B, X: (v: number) => L + (v - b.min) * u, Y: (v: number) => B - (v - b.min) * u };
}

/** Streudiagramm der Antworten mit ziehbaren Punkten; `extra` zeichnet über die Gitterlinien, unter die Punkte. */
function DragScatter({ d, W, L, T, plot, xTitle, yTitle, help, extra }: { d: Drag; W: number; L: number; T: number; plot: number; xTitle: string; yTitle: string; help: string; extra?: (g: ReturnType<typeof grid>) => ReactNode }) {
  const { data, names, who, bounds, onChange, onWho } = d, g = grid(L, T, plot, bounds), { X, Y, B, u } = g;
  const set = (i: number, x: number, y: number) => {
    if (x === data.x[i] && y === data.y[i]) return;
    onChange({ x: data.x.map((v, k) => k === i ? x : v), y: data.y.map((v, k) => k === i ? y : v) });
  };
  const { svg, start, handlers } = useDrag((i, p) => set(i, clamp((p.x - L) / u + bounds.min, bounds), clamp((B - p.y) / u + bounds.min, bounds)));
  const key = (e: KeyboardEvent, i: number) => {
    const x = data.x[i], y = data.y[i];
    const next = e.key === 'ArrowRight' ? [x + 1, y] : e.key === 'ArrowLeft' ? [x - 1, y] : e.key === 'ArrowUp' ? [x, y + 1] : e.key === 'ArrowDown' ? [x, y - 1] : null;
    if (!next) return;
    e.preventDefault(); onWho(i); set(i, clamp(next[0], bounds), clamp(next[1], bounds));
  };
  const ticks = Array.from({ length: bounds.max - bounds.min + 1 }, (_, k) => bounds.min + k);
  const helpId = `b05-help-${yTitle.length}-${xTitle.length}`;
  const H = B + 44;
  return (
    <svg ref={svg} className="xw-svg xw-drag" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="group" aria-label={`Streudiagramm der fünf Beispielpersonen: ${xTitle} und ${yTitle}`} {...handlers}>
      <desc id={helpId}>{help}</desc>
      {ticks.map(t => <g key={`t${t}`}>
        <line className="xw-guide" x1={X(t)} x2={X(t)} y1={Y(bounds.max)} y2={Y(bounds.min)} />
        <line className="xw-guide" x1={X(bounds.min)} x2={X(bounds.max)} y1={Y(t)} y2={Y(t)} />
        <text className="xw-t" x={X(t)} y={B + 16} textAnchor="middle">{t}</text>
        <text className="xw-t" x={L - 10} y={Y(t) + 4} textAnchor="end">{t}</text>
      </g>)}
      <text className="xw-t" x={L + plot / 2} y={B + 36} textAnchor="middle">{xTitle} (x)</text>
      <text className="xw-t" x={12} y={T + plot / 2} textAnchor="middle" transform={`rotate(-90 12 ${T + plot / 2})`}>{yTitle} (y)</text>
      {extra?.(g)}
      {data.x.map((x, i) => (
        <DragPoint key={`p${i}`} x={X(x)} y={Y(data.y[i])} label={`Person ${names[i]}`} selected={i === who} valueNow={x} bounds={bounds}
          valueText={`${xTitle} ${x}, ${yTitle} ${data.y[i]}`} describedBy={helpId} roleDescription="verschiebbarer Punkt"
          onPointerDown={e => { onWho(i); start(i, e); }} onKeyDown={e => key(e, i)}>{names[i]}</DragPoint>
      ))}
    </svg>
  );
}

// ---------- Rangkorrelation (Spearman) ----------

/** Oben die Antworten (ziehbar), unten die Ränge mit Achsenkreuz beim mittleren Rang und den Produktflächen. */
function RankPicture({ d, s, step }: { d: Drag; s: RankStats; step: number }) {
  const [box, W] = useWidth();
  const plot = Math.min(W - 72, 250), L = 50, T = 16;
  const n = s.n, rb: Bounds = { min: 1, max: n }, g = grid(L, 30, plot, rb), { X, Y, B } = g;
  const mid = s.mid, who = d.who;
  const scale = Math.max(1, s.pos, -s.neg), barMax = Math.max(60, W - 190), bar = (v: number) => Math.abs(v) / scale * barMax;
  const below = B + 50, H = below + (step >= 4 ? 96 : 0);
  return (
    <div ref={box}>
      <DragScatter d={d} W={W} L={L} T={T} plot={plot} xTitle="Lernstunden" yTitle="Gelöste Aufgaben"
        help="Pfeiltasten links und rechts ändern die Lernstunden, oben und unten die gelösten Aufgaben." />
      <svg className="xw-svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={`Ränge der fünf Personen. ${s.rho === null ? 'ρ ist nicht definiert.' : `Summe der Produkte ${num(s.sp)}, ρ ${num(s.rho)}.`}`}>
        <text className="xw-t xw-strong" x={L} y={14}>Die Plätze in der Reihenfolge</text>
        {Array.from({ length: n }, (_, k) => k + 1).map(t => <g key={`r${t}`}>
          <line className="xw-guide" x1={X(t)} x2={X(t)} y1={Y(n)} y2={Y(1)} />
          <line className="xw-guide" x1={X(1)} x2={X(n)} y1={Y(t)} y2={Y(t)} />
          <text className="xw-t" x={X(t)} y={B + 16} textAnchor="middle">{t}</text>
          <text className="xw-t" x={L - 10} y={Y(t) + 4} textAnchor="end">{t}</text>
        </g>)}
        <text className="xw-t" x={L + plot / 2} y={B + 36} textAnchor="middle">Rang Stunden R(x)</text>
        <text className="xw-t" x={12} y={30 + plot / 2} textAnchor="middle" transform={`rotate(-90 12 ${30 + plot / 2})`}>Rang Aufgaben R(y)</text>
        {step >= 3 && s.rx.map((rx, i) => Math.abs(s.prod[i]) > 1e-9 && (
          <rect key={`q${i}`} className={`${s.prod[i] > 0 ? 'xw-rect-pos' : 'xw-rect-neg'}${i === who ? ' sel' : ''}`}
            x={Math.min(X(rx), X(mid))} y={Math.min(Y(s.ry[i]), Y(mid))} width={Math.abs(X(rx) - X(mid))} height={Math.abs(Y(s.ry[i]) - Y(mid))} />
        ))}
        {step >= 2 && <g>
          <line className="xw-mean" x1={X(mid)} x2={X(mid)} y1={Y(n)} y2={Y(1)} />
          <line className="xw-mean" x1={X(1)} x2={X(n)} y1={Y(mid)} y2={Y(mid)} />
          <text className="xw-t" x={X(n) + 4} y={Y(mid) + 4}>R̄ = {num(mid)}</text>
        </g>}
        {step === 2 && s.rx.map((rx, i) => <g key={`d${i}`} className={i === who ? 'xw-devs sel' : 'xw-devs'}>
          <line x1={X(rx)} x2={X(mid)} y1={Y(s.ry[i])} y2={Y(s.ry[i])} />
          <line x1={X(rx)} x2={X(rx)} y1={Y(s.ry[i])} y2={Y(mid)} />
        </g>)}
        {step >= 3 && s.rx.map((rx, i) => Math.abs(s.prod[i]) > 1e-9 && (
          <text key={`v${i}`} className="xw-t xw-strong" x={(X(rx) + X(mid)) / 2} y={(Y(s.ry[i]) + Y(mid)) / 2 + 5} textAnchor="middle">{s.prod[i] > 0 ? '+' : '−'}</text>
        ))}
        {s.rx.map((rx, i) => <g key={`p${i}`} className={`xw-dot${i === who ? ' sel' : ''}`} aria-hidden="true">
          <circle cx={X(rx)} cy={Y(s.ry[i])} r={i === who ? 13 : 11} />
          <text x={X(rx)} y={Y(s.ry[i]) + 4} textAnchor="middle">{d.names[i]}</text>
        </g>)}
        {step >= 4 && <g>
          <text className="xw-t xw-strong" x={20} y={below + 6}>Plus- und Minusbeiträge</text>
          <rect className="xw-rect-pos" x={20} y={below + 16} width={Math.max(2, bar(s.pos))} height={16} /><text className="xw-t" x={26 + bar(s.pos)} y={below + 29}>Plus {num(s.pos)}</text>
          <rect className="xw-rect-neg" x={20} y={below + 38} width={Math.max(2, bar(s.neg))} height={16} /><text className="xw-t" x={26 + bar(s.neg)} y={below + 51}>Minus {num(-s.neg)}</text>
          <text className="xw-t xw-strong" x={20} y={below + 76}>{step >= 5
            ? (s.rho === null ? 'ρ ist nicht definiert' : `${num(s.sp)} von höchstens ${num(s.den)}: ρ ≈ ${num(s.rho)}`)
            : `verrechnet ${signed(s.sp)}`}</text>
        </g>}
      </svg>
    </div>
  );
}

export const pictures: Record<string, Picture> = {
  'b05-rangkorrelation': forWorkshop(p => <RankPicture s={p.s} step={p.step}
    d={{ data: p.data, names: p.workshop.names, who: p.who, bounds: p.workshop.bounds, onChange: p.setData, onWho: p.pickWho }} />),
};
