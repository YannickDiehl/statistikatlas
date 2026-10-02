// Bilder des Bereichs B13 „Regression“ für alle Vorlagen. Schlüssel = `picture` der Erklärung, Bausteine und
// `forWorkshop`/`forCard`/`forSentence`/`forTable` aus ./kit.tsx.
// Eigene Stile in src/explain/areas/b13-regression.css (lädt main.tsx automatisch). Anleitung: src/explain/AUTHORING.md.
import type { KeyboardEvent } from 'react';
import { num, signed } from '../../../explain/format';
import type { Fit, Pairs } from '../../../explain/content/b13-regression/fit';
import { IA } from '../../../explain/content/b13-regression/interaction';
import { llWb } from '../../../explain/content/b13-regression/likelihood';
import { pBestanden } from '../../../explain/content/b13-regression/logistisch-kit';
import { P175, withScore } from '../../../explain/content/b13-regression/outliers';
import { fitLine } from '../../../explain/content/b13-regression/fit';
import { vifOf } from '../../../explain/content/b13-regression/multicollinearity';
import { baseTable, MAX_K } from '../../../explain/content/b13-regression/overfitting';
import { baseSurvey, sampleColumn } from '../../../explain/sample';
import { Axis, clamp, Curve, DragPoint, forCard, forSentence, forWorkshop, linear, MarkLine, useDrag, useWidth, type Bounds, type Picture } from './kit';

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

/** Zwei Balken: Quadratsumme ohne Gerade (SST) und mit Gerade (SSE); was wegfällt, ist der Anteil R². */
function R2Bars({ sse, sst }: { sse: number; sst: number }) {
  const [box, W] = useWidth();
  const L = 16, R = W - 16, max = Math.max(sse, sst, 1), X = (v: number) => L + v / max * (R - L);
  const r2 = 1 - sse / sst, gone = sst - sse;
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={150} viewBox={`0 0 ${W} 150`} role="img"
        aria-label={`Quadratsumme ohne Gerade ${num(sst)}, mit Gerade ${num(sse)}; R² ≈ ${num(r2)}`}>
        <text className="xw-t" x={L} y={18}>Ohne Gerade, um den Mittelwert: SST = {num(sst)}</text>
        <rect className="xw-bar-plain" x={L} y={26} width={Math.max(2, X(sst) - L)} height={24} />
        <text className="xw-t" x={L} y={78}>Mit Gerade, Residuen: SSE = {num(sse)}</text>
        <rect className="xw-bar-neg" x={L} y={86} width={Math.max(2, X(sse) - L)} height={24} />
        {gone > 1e-9 && <rect className="xw-max" x={X(sse)} y={86} width={X(sst) - X(sse)} height={24} />}
        <text className="xw-t xw-strong" x={L} y={136}>{r2 >= 0 ? `Weggefallen: ${num(r2 * 100, 0)} % von SST, also R² ≈ ${num(r2)}` : `SSE ist größer als SST: R² ≈ ${num(r2)}`}</text>
      </svg>
    </div>
  );
}

/** Teil der Geraden b₀ + b₁ · x, der im Feld 0 bis 20 mal 0 bis 20 liegt (in x abgeschnitten, damit die Steigung stimmt). */
function inBox(b0: number, b1: number): [number, number] | null {
  let x0 = 0, x1 = 20;
  if (Math.abs(b1) > 1e-12) {
    const a = (0 - b0) / b1, b = (20 - b0) / b1;
    x0 = Math.max(x0, Math.min(a, b)); x1 = Math.min(x1, Math.max(a, b));
  } else if (b0 < 0 || b0 > 20) return null;
  return x1 > x0 ? [x0, x1] : null;
}
/** Gerade als SVG-Linie im Feld 0 bis 20; ohne sichtbaren Teil nichts. */
function FieldLine({ b0, b1, X, Y, className }: { b0: number; b1: number; X: (v: number) => number; Y: (v: number) => number; className: string }) {
  const e = inBox(b0, b1);
  return e ? <line className={className} x1={X(e[0])} x2={X(e[1])} y1={Y(b0 + b1 * e[0])} y2={Y(b0 + b1 * e[1])} /> : null;
}

/** Lernzeit, Wissenstest und eine dritte Spalte der 200 Befragten (Ausgangsdaten). */
const base = (col: string) => sampleColumn(baseSurvey(), col);

/**
 * Interaktion: die 200 Befragten (gefüllt ohne, offen mit Weiterbildung) und zwei Geraden. Ohne Weiterbildung gilt
 * die Steigung b₁ aus R, mit Weiterbildung b₁ + b₃; b₃ kommt vom Regler.
 */
function InteractionLines({ b3 }: { b3: number }) {
  const [box, W] = useWidth();
  const L = 46, T = 14, R = W - 16, B = T + 230, H = B + 100;
  const X = linear([0, 20], [L, R]), Y = linear([0, 20], [B, T]);
  const x = base('lernzeit'), y = base('wissenstest'), g = base('weiterbildung');
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={`Streudiagramm der 200 Befragten mit zwei Geraden: ohne Weiterbildung Steigung ${num(IA.b1)}, mit Weiterbildung ${num(IA.b1 + b3)} Aufgaben je Stunde`}>
        {x.map((v, i) => g[i] === 1
          ? <circle key={i} className="b13-open" cx={X(v)} cy={Y(y[i])} r={3} />
          : <circle key={i} className="b13-dot" cx={X(v)} cy={Y(y[i])} r={2.6} />)}
        <FieldLine className="b13-line" b0={IA.b0} b1={IA.b1} X={X} Y={Y} />
        <FieldLine className="b13-line b13-alt" b0={IA.b0 + IA.b2} b1={IA.b1 + b3} X={X} Y={Y} />
        <Axis scale={X} ticks={[0, 5, 10, 15, 20]} at={B} from={L} to={R} labelGap={20} title="Lernzeit in Stunden" />
        <Axis scale={Y} ticks={[0, 5, 10, 15, 20]} at={L} from={B} to={T} orient="left" title="Gelöste Aufgaben" />
        <line className="b13-line" x1={L - 30} x2={L - 6} y1={B + 66} y2={B + 66} /><circle className="b13-dot" cx={L - 18} cy={B + 66} r={2.6} />
        <text className="xw-t" x={L} y={B + 71}>ohne Weiterbildung: {num(IA.b1)} je Stunde</text>
        <line className="b13-line b13-alt" x1={L - 30} x2={L - 6} y1={B + 88} y2={B + 88} /><circle className="b13-open" cx={L - 18} cy={B + 88} r={3} />
        <text className="xw-t" x={L} y={B + 93}>mit Weiterbildung: {num(IA.b1 + b3)} je Stunde</text>
      </svg>
    </div>
  );
}

const pTicks = (v: number) => num(v);
/** Logistische Kurve: Logit (waagerecht) und Wahrscheinlichkeit (senkrecht), markiert bei p. */
function LogitCurve({ p }: { p: number }) {
  const [box, W] = useWidth();
  const L = 50, R = W - 16, T = 16, B = T + 180, H = B + 52;
  const X = linear([-5, 5], [L, R]), Y = linear([0, 1], [B, T]);
  const z = Math.log(p / (1 - p)), zc = Math.max(-5, Math.min(5, z));
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Logistische Kurve; markiert ist p = ${num(p)} mit dem Logit ${num(z)}`}>
        <Curve f={v => 1 / (1 + Math.exp(-v))} from={-5} to={5} x={X} y={Y} />
        <MarkLine x={X(zc)} from={Y(p)} to={B} />
        <MarkLine y={Y(p)} from={L} to={X(zc)} />
        <circle className="b13-mark" cx={X(zc)} cy={Y(p)} r={6} />
        <text className="xw-t xw-strong" x={X(zc) + (zc > 0 ? -10 : 10)} y={Y(p) + (p > 0.5 ? 22 : -12)} textAnchor={zc > 0 ? 'end' : 'start'}>Logit ≈ {num(z)}</text>
        <Axis scale={X} ticks={[-4, -2, 0, 2, 4]} at={B} from={L} to={R} labelGap={20} title="Logit" />
        <Axis scale={Y} ticks={[0, 0.25, 0.5, 0.75, 1]} at={L} from={B} to={T} orient="left" format={pTicks} title="p" />
      </svg>
    </div>
  );
}

/** Log-Likelihood von 82 Ja unter 200 für jedes angenommene p, markiert beim Wert des Reglers. */
function LikelihoodCurve({ p }: { p: number }) {
  const [box, W] = useWidth();
  const L = 58, R = W - 16, T = 30, B = T + 170, H = B + 52;
  const X = linear([0.05, 0.95], [L, R]), Y = linear([-360, -120], [B, T]);
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Log-Likelihood für jedes p; am größten bei 0,41; markiert ist p = ${num(p)} mit ℓ ≈ ${num(llWb(p))}`}>
        <MarkLine x={X(0.41)} from={T} to={B} label="bestes p = 0,41" />
        <Curve f={llWb} from={0.05} to={0.95} x={X} y={Y} />
        <circle className="b13-mark" cx={X(p)} cy={Y(llWb(p))} r={6} />
        <text className="xw-t xw-strong" x={X(p) + (p > 0.6 ? -10 : 10)} y={Y(llWb(p)) + 22} textAnchor={p > 0.6 ? 'end' : 'start'}>ℓ ≈ {num(llWb(p))}</text>
        <Axis scale={X} ticks={[0.1, 0.3, 0.5, 0.7, 0.9]} at={B} from={L} to={R} labelGap={20} format={pTicks} title="angenommenes p" />
        <Axis scale={Y} ticks={[-350, -300, -250, -200, -150]} at={L} from={B} to={T} orient="left" title="ℓ" />
      </svg>
    </div>
  );
}

/**
 * S-Kurve „mindestens 10 Aufgaben“ nach Lernzeit: die 200 Befragten oben (geschafft) und unten (nicht geschafft),
 * leicht gestaffelt, dazu die vorhergesagte Wahrscheinlichkeit und der Wert des Reglers.
 */
function SCurve({ hours }: { hours: number }) {
  const [box, W] = useWidth();
  const L = 50, R = W - 16, T = 22, B = T + 190, H = B + 52;
  const X = linear([0, 20], [L, R]), Y = linear([0, 1], [B, T]);
  const x = base('lernzeit'), y = base('wissenstest'), p = pBestanden(hours);
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={`S-Kurve: vorhergesagte Wahrscheinlichkeit, mindestens 10 Aufgaben zu lösen, nach Lernzeit; bei ${num(hours)} Stunden ${num(p * 100, 0)} %`}>
        {x.map((v, i) => <circle key={i} className="b13-dot" cx={X(v)} cy={y[i] >= 10 ? Y(1) + 3 + (i % 4) * 3 : Y(0) - 3 - (i % 4) * 3} r={2.4} />)}
        <Curve f={pBestanden} from={0} to={20} x={X} y={Y} />
        <MarkLine x={X(hours)} from={Y(p)} to={B} />
        <circle className="b13-mark" cx={X(hours)} cy={Y(p)} r={6} />
        <text className="xw-t xw-strong" x={X(hours) + (hours > 12 ? -10 : 10)} y={Y(p) + 22} textAnchor={hours > 12 ? 'end' : 'start'}>{num(p * 100, 0)} %</text>
        <Axis scale={X} ticks={[0, 5, 10, 15, 20]} at={B} from={L} to={R} labelGap={20} title="Lernzeit in Stunden" />
        <Axis scale={Y} ticks={[0, 0.25, 0.5, 0.75, 1]} at={L} from={B} to={T} orient="left" format={pTicks} title="p" />
      </svg>
    </div>
  );
}

/** Ausreißer und Einfluss: die 200 Befragten, P175 mit dem Wissenstest des Reglers, die Gerade mit ihr und ohne sie. */
function Influence({ score }: { score: number }) {
  const [box, W] = useWidth();
  const L = 46, T = 14, R = W - 16, B = T + 230, H = B + 100;
  const X = linear([0, 20], [L, R]), Y = linear([0, 20], [B, T]);
  const x = base('lernzeit'), y = base('wissenstest'), w = withScore(P175, score);
  const rest = fitLine({ x: x.filter((_, i) => i !== P175), y: y.filter((_, i) => i !== P175) });
  const fitted = w.b0 + w.b1 * x[P175];
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={`Streudiagramm der 200 Befragten; P175 mit 18,4 Stunden und ${score} Aufgaben; Steigung mit ihr ${num(w.b1)}, ohne sie ${num(rest.b1!)}`}>
        {x.map((v, i) => i !== P175 && <circle key={i} className="b13-dot" cx={X(v)} cy={Y(y[i])} r={2.6} />)}
        <FieldLine className="b13-line b13-alt" b0={rest.b0!} b1={rest.b1!} X={X} Y={Y} />
        <FieldLine className="b13-line" b0={w.b0} b1={w.b1} X={X} Y={Y} />
        <line className={score >= fitted ? 'xw-pos' : 'xw-neg'} strokeWidth={2.5} x1={X(x[P175])} x2={X(x[P175])} y1={Y(score)} y2={Y(fitted)} />
        <circle className="b13-mark" cx={X(x[P175])} cy={Y(score)} r={6} />
        <text className="xw-t xw-strong" x={X(x[P175]) - 10} y={Y(score) + (score > 10 ? 22 : -10)} textAnchor="end">P175</text>
        <Axis scale={X} ticks={[0, 5, 10, 15, 20]} at={B} from={L} to={R} labelGap={20} title="Lernzeit in Stunden" />
        <Axis scale={Y} ticks={[0, 5, 10, 15, 20]} at={L} from={B} to={T} orient="left" title="Gelöste Aufgaben" />
        <line className="b13-line" x1={L - 30} x2={L - 6} y1={B + 66} y2={B + 66} />
        <text className="xw-t" x={L} y={B + 71}>mit P175: {num(w.b1)} je Stunde</text>
        <line className="b13-line b13-alt" x1={L - 30} x2={L - 6} y1={B + 88} y2={B + 88} />
        <text className="xw-t" x={L} y={B + 93}>ohne P175: {num(rest.b1!)} je Stunde</text>
      </svg>
    </div>
  );
}

/** Wie stark der Standardfehler wächst (√VIF), je enger zwei Prädiktoren zusammenhängen; markiert beim Wert des Reglers. */
function VifCurve({ r }: { r: number }) {
  const [box, W] = useWidth();
  const L = 50, R = W - 16, T = 24, B = T + 180, H = B + 52;
  const X = linear([0, 1], [L, R]), Y = linear([1, 7.5], [B, T]), f = (v: number) => Math.sqrt(vifOf(v));
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Faktor des Standardfehlers nach der Korrelation zweier Prädiktoren; bei r = ${num(r)} das ${num(f(r))}-Fache`}>
        <MarkLine y={Y(Math.sqrt(10))} from={L} to={R} label="Faustregel VIF = 10" />
        <Curve f={f} from={0} to={0.99} x={X} y={Y} />
        <circle className="b13-mark" cx={X(r)} cy={Y(f(r))} r={6} />
        <text className="xw-t xw-strong" x={X(r) + (r > 0.6 ? -10 : 10)} y={Y(f(r)) - 10} textAnchor={r > 0.6 ? 'end' : 'start'}>{num(f(r))}-fach</text>
        <Axis scale={X} ticks={[0, 0.25, 0.5, 0.75, 1]} at={B} from={L} to={R} labelGap={20} format={pTicks} title="Korrelation r der Prädiktoren" />
        <Axis scale={Y} ticks={[1, 3, 5, 7]} at={L} from={B} to={T} orient="left" title="Faktor des Standardfehlers" />
      </svg>
    </div>
  );
}

/** R² im Training und im Test für 1 bis 20 Prädiktoren, markiert bei der Zahl des Reglers. */
function TrainTest({ k }: { k: number }) {
  const [box, W] = useWidth();
  const L = 50, R = W - 16, T = 20, B = T + 180, H = B + 96;
  const X = linear([1, MAX_K], [L, R]), Y = linear([0, 0.5], [B, T]), t = baseTable(), kk = Math.max(1, Math.min(MAX_K, Math.round(k)));
  const path = (key: 'train' | 'test') => t.map((r, i) => `${i ? 'L' : 'M'}${X(i + 1).toFixed(1)},${Y(r[key]).toFixed(1)}`).join(' ');
  const now = t[kk - 1];
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={`R² im Training und im Test nach Zahl der Prädiktoren; bei ${kk} Prädiktoren Training ${num(now.train)}, Test ${num(now.test)}`}>
        <MarkLine x={X(kk)} from={T} to={B} />
        <path className="b13-train" d={path('train')} />
        <path className="b13-test" d={path('test')} />
        <circle className="b13-mark" cx={X(kk)} cy={Y(now.train)} r={5} />
        <circle className="b13-mark" cx={X(kk)} cy={Y(now.test)} r={5} />
        <Axis scale={X} ticks={[1, 5, 10, 15, 20]} at={B} from={L} to={R} labelGap={20} title="Zahl der Prädiktoren" />
        <Axis scale={Y} ticks={[0, 0.1, 0.2, 0.3, 0.4, 0.5]} at={L} from={B} to={T} orient="left" format={pTicks} title="R²" />
        <line className="b13-train" x1={L - 30} x2={L - 6} y1={B + 62} y2={B + 62} />
        <text className="xw-t" x={L} y={B + 67}>Training, P001 bis P100: {num(now.train)}</text>
        <line className="b13-test" x1={L - 30} x2={L - 6} y1={B + 84} y2={B + 84} />
        <text className="xw-t" x={L} y={B + 89}>Test, P101 bis P200: {num(now.test)}</text>
      </svg>
    </div>
  );
}

export const pictures: Record<string, Picture> = {
  'b13-ueberanpassung': forCard(p => <TrainTest k={p.value ?? 1} />),
  'b13-vif': forCard(p => <VifCurve r={p.value ?? 0.03} />),
  'b13-einfluss': forCard(p => <Influence score={p.value ?? 17} />),
  'b13-logistisch': forCard(p => <SCurve hours={p.value ?? 8} />),
  'b13-likelihood': forCard(p => <LikelihoodCurve p={p.value ?? 0.41} />),
  'b13-logit': forSentence(p => <LogitCurve p={p.values.p} />),
  'b13-interaktion': forCard(p => <InteractionLines b3={p.value ?? IA.b3} />),
  'b13-r2': forSentence(p => <R2Bars sse={p.values.sse} sst={p.values.sst} />),
  'b13-gerade': forWorkshop(p => <Gerade data={p.data} s={p.s} step={p.step} who={p.who} names={p.workshop.names} bounds={p.workshop.bounds} onChange={p.setData} onWho={p.pickWho} />),
};
