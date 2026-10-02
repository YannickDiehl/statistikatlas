// Bilder des Bereichs B13 „Regression“ für alle Vorlagen. Schlüssel = `picture` der Erklärung, Bausteine und
// `forWorkshop`/`forCard`/`forSentence`/`forTable` aus ./kit.tsx.
// Eigene Stile in src/explain/areas/b13-regression.css (lädt main.tsx automatisch). Anleitung: src/explain/AUTHORING.md.
import type { KeyboardEvent } from 'react';
import { num, signed } from '../../../explain/format';
import type { Fit, Pairs } from '../../../explain/content/b13-regression/fit';
import { clamp, DragPoint, forWorkshop, useDrag, useWidth, type Bounds, type Picture } from './kit';

/**
 * Streudiagramm der fünf Personen mit der Regressionsgeraden: Mitten (Schritt 1), Gerade mit Steigungsdreieck (2),
 * Achsenabschnitt (3), Vorhersagen (4), Residuen (5) und ihre Quadrate (6). Punkte lassen sich ziehen; Pfeiltasten
 * links und rechts ändern die Lernzeit, oben und unten die gelösten Aufgaben.
 */
function Gerade({ data, s, step, who, names, bounds, onChange, onWho }: {
  data: Pairs; s: Fit; step: number; who: number; names: readonly string[]; bounds: Bounds;
  onChange: (d: Pairs) => void; onWho: (i: number) => void;
}) {
  const [box, W] = useWidth();
  const L = 46, T = 30, plot = Math.min(W - L - 18, 340), B = T + plot, H = B + 54;
  const u = plot / (bounds.max - bounds.min), X = (v: number) => L + (v - bounds.min) * u, Y = (v: number) => B - (v - bounds.min) * u;
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
  const ticks = [0, 5, 10, 15, 20];
  const line = s.b1 !== null;
  // Gerade im Zeichenfeld abschneiden: von x = 0 bis 20, aber nicht über den oberen oder unteren Rand.
  const at = (x: number) => s.icpt + s.slope * x;
  const ends = (() => {
    if (!line) return null;
    let x0 = bounds.min, x1 = bounds.max;
    if (Math.abs(s.slope) > 1e-9) {
      const xLo = (bounds.min - s.icpt) / s.slope, xHi = (bounds.max - s.icpt) / s.slope;
      x0 = Math.max(x0, Math.min(xLo, xHi)); x1 = Math.min(x1, Math.max(xLo, xHi));
    } else if (s.icpt < bounds.min || s.icpt > bounds.max) return null;
    return x1 > x0 ? [x0, x1] : null;
  })();
  const mx = s.x.mean, my = s.y.mean;
  // Steigungsdreieck: 4 Stunden nach rechts ab der Mitte (oder nach links, wenn rechts kein Platz ist).
  const run = mx + 4 <= bounds.max ? 4 : -4;
  const rise = s.slope * run;
  const triangle = line && step === 2 && at(mx + run) >= bounds.min && at(mx + run) <= bounds.max;
  const b0In = line && s.icpt >= bounds.min && s.icpt <= bounds.max;
  return (
    <div ref={box}>
      <svg ref={svg} className="xw-svg xw-drag" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="group" aria-label="Streudiagramm mit den fünf Beispielpersonen und der Regressionsgeraden" {...handlers}>
        <desc id="b13-gerade-help">Pfeiltasten links und rechts ändern die Lernzeit, oben und unten die gelösten Aufgaben.</desc>
        {ticks.map(t => <g key={`t${t}`}>
          <line className="xw-guide" x1={X(t)} x2={X(t)} y1={Y(bounds.max)} y2={Y(bounds.min)} />
          <line className="xw-guide" x1={X(bounds.min)} x2={X(bounds.max)} y1={Y(t)} y2={Y(t)} />
          <text className="xw-t" x={X(t)} y={B + 18} textAnchor="middle">{t}</text>
          <text className="xw-t" x={L - 8} y={Y(t) + 5} textAnchor="end">{t}</text>
        </g>)}
        <text className="xw-t" x={L + plot / 2} y={B + 40} textAnchor="middle">Lernzeit in Stunden (x)</text>
        <text className="xw-t" x={13} y={T + plot / 2} textAnchor="middle" transform={`rotate(-90 13 ${T + plot / 2})`}>Gelöste Aufgaben (y)</text>
        <line className="xw-mean" x1={X(mx)} x2={X(mx)} y1={Y(bounds.max)} y2={Y(bounds.min)} />
        <line className="xw-mean" x1={X(bounds.min)} x2={X(bounds.max)} y1={Y(my)} y2={Y(my)} />
        <text className="xw-t" x={X(mx)} y={T - 10} textAnchor="middle">x̄ = {num(mx)}</text>
        <text className="xw-t" x={X(bounds.max) - 4} y={Y(my) - 6} textAnchor="end">ȳ = {num(my)}</text>
        {step >= 6 && data.x.map((x, i) => {
          const e = s.e[i], side = Math.abs(e) * u;
          if (side < 1) return null;
          const left = X(x) + 2 + side <= X(bounds.max) ? X(x) + 2 : X(x) - 2 - side;
          return <rect key={`q${i}`} className={`xw-square${i === who ? ' sel' : ''}`} x={left} y={Math.min(Y(data.y[i]), Y(s.yhat[i]))} width={side} height={side} />;
        })}
        {ends && step >= 2 && <line className="b13-line" x1={X(ends[0])} x2={X(ends[1])} y1={Y(at(ends[0]))} y2={Y(at(ends[1]))} />}
        {triangle && <g className="b13-triangle">
          <line x1={X(mx)} x2={X(mx + run)} y1={Y(my)} y2={Y(my)} />
          <line x1={X(mx + run)} x2={X(mx + run)} y1={Y(my)} y2={Y(my + rise)} />
          <text className="xw-t xw-strong" x={X(mx + run) + (run > 0 ? 6 : -6)} y={(Y(my) + Y(my + rise)) / 2 + 5} textAnchor={run > 0 ? 'start' : 'end'}>{run > 0 ? '4 h mehr' : '4 h weniger'}: {signed(rise)}</text>
        </g>}
        {step >= 3 && b0In && <g>
          <circle className="b13-b0" cx={X(0)} cy={Y(s.icpt)} r={5} />
          <text className="xw-t xw-strong" x={X(0) + 9} y={Y(s.icpt) + (s.slope >= 0 ? 18 : -10)}>b₀ = {num(s.icpt)}</text>
        </g>}
        {step >= 5 && data.x.map((x, i) => Math.abs(s.e[i]) > 1e-9 && (
          <line key={`e${i}`} className={s.e[i] > 0 ? 'xw-pos' : 'xw-neg'} strokeWidth={i === who ? 4.5 : 3} x1={X(x)} x2={X(x)} y1={Y(data.y[i])} y2={Y(s.yhat[i])} />
        ))}
        {step >= 5 && Math.abs(s.e[who]) > 1e-9 && (
          <text className="xw-t xw-strong" x={X(data.x[who]) - 8} y={(Y(data.y[who]) + Y(s.yhat[who])) / 2 + 5} textAnchor="end">{signed(s.e[who])}</text>
        )}
        {step >= 4 && data.x.map((x, i) => <circle key={`h${i}`} className={`b13-hat${i === who ? ' sel' : ''}`} cx={X(x)} cy={Y(s.yhat[i])} r={i === who ? 6 : 4.5} />)}
        {step === 4 && <text className="xw-t xw-strong" x={X(data.x[who]) + 10} y={Y(s.yhat[who]) + 18}>ŷ = {num(s.yhat[who])}</text>}
        {data.x.map((x, i) => (
          <DragPoint key={`p${i}`} x={X(x)} y={Y(data.y[i])} label={`Person ${names[i]}`} selected={i === who} valueNow={x} bounds={bounds}
            valueText={`Lernzeit ${x} Stunden, ${data.y[i]} Aufgaben gelöst`} describedBy="b13-gerade-help" roleDescription="verschiebbarer Punkt"
            onPointerDown={e => { onWho(i); start(i, e); }} onKeyDown={e => key(e, i)}>{names[i]}</DragPoint>
        ))}
        {step >= 6 && <text className="xw-t xw-strong" x={L + 6} y={T + 16}>Σeᵢ² = {num(s.sse)}</text>}
        {step >= 2 && !line && <text className="xw-t xw-strong" x={L + 6} y={T + 16}>Alle gleich lange: keine Steigung</text>}
      </svg>
    </div>
  );
}

export const pictures: Record<string, Picture> = {
  'b13-gerade': forWorkshop(p => <Gerade data={p.data} s={p.s} step={p.step} who={p.who} names={p.workshop.names} bounds={p.workshop.bounds} onChange={p.setData} onWho={p.pickWho} />),
};
