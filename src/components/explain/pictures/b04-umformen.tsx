// Bilder des Bereichs B4 „Umformen“: Lineale für Zentrieren und Standardisieren (die Punkte bleiben, die
// Beschriftung ändert sich), Werte und Ränge, das Teilen durch einen Maßstab und der Weg auf einer Antwortskala (POMP).
// Bausteine aus ./kit.tsx; eigene Stile in src/explain/areas/b04-umformen.css. Anleitung: src/explain/AUTHORING.md.
import type { KeyboardEvent } from 'react';
import { num, signed } from '../../../explain/format';
import type { ZStats } from '../../../explain/content/b04-umformen/shared';
import { LERNZEIT } from '../../../explain/content/b04-umformen/skalieren';
import type { RankStats } from '../../../explain/content/b04-umformen/raenge';
import { DragPoint, forSentence, forWorkshop, keyStep, linear, useDrag, useWidth, clamp, type Bounds, type Picture } from './kit';

/** Gut lesbare Abstände für Striche (1, 2, 5 mal Zehnerpotenz), etwa `count` Stück über `span`. */
function niceStep(span: number, count = 5): number {
  const raw = Math.max(span, 1e-9) / count, pow = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 5, 10].map(k => k * pow).find(s => s >= raw) ?? 10 * pow;
}
/** Striche zwischen lo und hi im Abstand step. */
function ticksBetween(lo: number, hi: number, step: number): number[] {
  const out: number[] = [];
  for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + 1e-9; v += step) out.push(Number(v.toFixed(10)));
  return out;
}

/** Ein Lineal: Linie, Striche an den Pixelstellen `at`, Beschriftung darunter und ein Titel links darüber. */
function Ruler({ y, from, to, marks, title, titleBelow = false }: { y: number; from: number; to: number; marks: { x: number; label: string }[]; title: string; titleBelow?: boolean }) {
  return (
    <g aria-hidden="true">
      <line className="xw-axis" x1={from} x2={to} y1={y} y2={y} />
      {marks.map(m => <g key={`${m.x}-${m.label}`}><line className="xw-axis" x1={m.x} x2={m.x} y1={y - 4} y2={y + 4} /><text className="xw-t" x={m.x} y={y + 19} textAnchor="middle">{m.label}</text></g>)}
      <text className="xw-t b04-ruler-title" x={from} y={titleBelow ? y + 38 : y - 24}>{title}</text>
    </g>
  );
}

/**
 * Fünf Lernzeiten in Zeilen über bis zu drei Linealen: Stunden, Abstand zur Mitte (ab Schritt 2) und, beim
 * Standardisieren, Standardabweichungen (ab Schritt 4). Die Punkte bleiben stehen; nur die Beschriftung ändert sich.
 */
function Lineale({ values, s, step, who, names, bounds, mode, onChange, onWho }: {
  values: number[]; s: ZStats; step: number; who: number; names: readonly string[]; bounds: Bounds; mode: 'centering' | 'z';
  onChange: (v: number[]) => void; onWho: (i: number) => void;
}) {
  const [box, W] = useWidth();
  const left = 44, right = W - 26, X = linear([bounds.min, bounds.max], [left, right]);
  const rowY = (i: number) => 34 + i * 26, rowsEnd = rowY(values.length - 1) + 16;
  const r1 = rowsEnd + 40, r2 = r1 + 64, r3 = r2 + 64;
  const showCentered = step >= 2, showZ = mode === 'z' && step >= 4 && s.sd > 1e-9;
  const band = mode === 'z' && step >= 3 && s.sd > 1e-9;
  const last = showZ ? r3 : showCentered ? r2 : r1, H = last + 34;
  const m = s.mean, set = (i: number, v: number) => { if (v !== values[i]) onChange(values.map((x, k) => k === i ? v : x)); };
  const { svg, start, handlers } = useDrag((i, p) => set(i, clamp(X.invert(p.x), bounds)));
  const hourStep = niceStep(bounds.max - bounds.min, 4);
  const hourMarks = ticksBetween(bounds.min, bounds.max, hourStep).map(v => ({ x: X(v), label: num(v) }));
  const cStep = niceStep(bounds.max - bounds.min, 4);
  const centeredMarks = ticksBetween(bounds.min - m, bounds.max - m, cStep).map(t => ({ x: X(m + t), label: Math.abs(t) < 1e-9 ? '0' : signed(t) }));
  // z-Striche je Standardabweichung; bei engen Strichen nur jeden zweiten.
  const every = s.sd > 1e-9 && X(m + s.sd) - X(m) < 28 ? 2 : 1;
  const zMarks = showZ ? ticksBetween((bounds.min - m) / s.sd, (bounds.max - m) / s.sd, every).map(k => ({ x: X(m + k * s.sd), label: k === 0 ? '0' : signed(k) })) : [];
  const xw = X(values[who]), dev = s.dev[who], z = s.z ? s.z[who] : null;
  const reading = (y: number, label: string) => <text className="xw-t xw-strong xw-halo" x={Math.min(right - 18, Math.max(left + 18, xw))} y={y - 8} textAnchor="middle">{label}</text>;
  const label = mode === 'z' ? 'Lernzeiten der fünf Personen auf drei Linealen: Stunden, Abstand zur Mitte und Standardabweichungen'
    : 'Lernzeiten der fünf Personen auf zwei Linealen: Stunden und Abstand zur Mitte';
  return (
    <div ref={box}>
      <svg ref={svg} className="xw-svg xw-drag" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="group" aria-label={label} {...handlers}>
        {band && <rect className="xw-band" x={X(m - s.sd)} y={18} width={Math.max(0, X(m + s.sd) - X(m - s.sd))} height={last - 14} />}
        {values.map((_, i) => <g key={`row${i}`}><line className="xw-guide" x1={left - 10} x2={right + 10} y1={rowY(i)} y2={rowY(i)} /><text className="xw-t" x={10} y={rowY(i) + 4}>{names[i]}</text></g>)}
        <line className="xw-mean" x1={X(m)} x2={X(m)} y1={16} y2={last} />
        <text className="xw-t" x={Math.min(right - 30, Math.max(left + 30, X(m)))} y={11} textAnchor="middle">x̄ = {num(m)}</text>
        {showCentered && s.dev.map((d, i) => Math.abs(d) > 1e-9 && <g key={`dev${i}`}>
          <line className={d > 0 ? 'xw-pos' : 'xw-neg'} strokeWidth={i === who ? 4.5 : 3} x1={X(m)} x2={X(values[i])} y1={rowY(i)} y2={rowY(i)} />
        </g>)}
        <line className="b04-reading" x1={xw} x2={xw} y1={rowY(who)} y2={last} />
        <Ruler y={r1} from={left} to={right} marks={hourMarks} title="Stunden" />
        {reading(r1, num(values[who]))}
        {showCentered && <><Ruler y={r2} from={left} to={right} marks={centeredMarks} title="Abstand zur Mitte" />{reading(r2, signed(dev))}</>}
        {showZ && z !== null && <><Ruler y={r3} from={left} to={right} marks={zMarks} title="in Standardabweichungen (z)" />{reading(r3, signed(z))}</>}
        {values.map((v, i) => (
          <DragPoint key={`dot${i}`} x={X(v)} y={rowY(i)} label={`Person ${names[i]}, Lernzeit in Stunden`} selected={i === who} valueNow={v} bounds={bounds}
            onPointerDown={e => { onWho(i); start(i, e); }}
            onKeyDown={(e: KeyboardEvent) => {
              const next = keyStep(e, v, bounds);
              if (next !== null) { e.preventDefault(); onWho(i); set(i, next); }
            }}>{num(v, 1)}</DragPoint>
        ))}
      </svg>
    </div>
  );
}

/**
 * Teilen durch a: oben das Lineal in Stunden mit der Mitte der 200 Befragten und dem Wert am Regler, darunter dasselbe
 * Lineal in der neuen Einheit. Die Punkte bleiben stehen; die Beschriftung wird durch a geteilt.
 */
function Teilen({ x, a }: { x: number; a: number }) {
  const [box, W] = useWidth();
  const top = Math.max(20, Math.ceil(x / 5) * 5), left = 24, right = W - 24, X = linear([0, top], [left, right]);
  const r1 = 66, r2 = 136, H = 170;
  const oldMarks = ticksBetween(0, top, niceStep(top, 4)).map(v => ({ x: X(v), label: num(v) }));
  const newMarks = ticksBetween(0, top / a, niceStep(top / a, 4)).map(t => ({ x: X(t * a), label: num(t) }));
  const m = LERNZEIT.mean, xs = X(Math.min(x, top));
  const tag = (px: number, y: number, label: string, strong = false) => <text className={`xw-t xw-halo${strong ? ' xw-strong' : ''}`} x={Math.min(right - 30, Math.max(left + 30, px))} y={y} textAnchor="middle">{label}</text>;
  const unitTitle = Math.abs(a - 7) < 1e-9 ? 'Stunden pro Tag' : `geteilt durch a = ${num(a)}`;
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={`Zwei Lineale: oben Stunden in sieben Tagen, unten ${unitTitle}. Die Mitte ${num(m)} h liegt unten bei ${num(m / a)}, der Wert ${num(x)} h bei ${num(x / a)}.`}>
        <line className="xw-mean" x1={X(m)} x2={X(m)} y1={18} y2={r2 + 4} />
        <line className="b04-reading" x1={xs} x2={xs} y1={r1} y2={r2} />
        <Ruler y={r1} from={left} to={right} marks={oldMarks} title="Stunden in sieben Tagen" />
        <Ruler y={r2} from={left} to={right} marks={newMarks} title={unitTitle} />
        {tag(X(m), 14, `x̄: ${num(m)} h oben, ${num(m / a)} unten`)}
        {tag(xs, r1 - 8, num(x), true)}
        {tag(xs, r2 - 8, num(x / a), true)}
        <circle className="xw-s-dot sel" cx={xs} cy={r1} r={5.5} />
        <circle className="xw-s-dot sel" cx={xs} cy={r2} r={5.5} />
      </svg>
    </div>
  );
}

/**
 * Lernzeiten in Zeilen über dem Lineal in Stunden, darunter dieselben Personen auf einer Reihe gleich weit
 * auseinanderliegender Plätze (Schritt 1) bzw. Ränge (Schritt 2). Gleiche Ränge stehen übereinander.
 */
function Raenge({ values, s, step, who, names, bounds, onChange, onWho }: {
  values: number[]; s: RankStats; step: number; who: number; names: readonly string[]; bounds: Bounds;
  onChange: (v: number[]) => void; onWho: (i: number) => void;
}) {
  const [box, W] = useWidth();
  const left = 44, right = W - 26, X = linear([bounds.min, bounds.max], [left, right]), n = values.length;
  const rowY = (i: number) => 34 + i * 26, r1 = rowY(n - 1) + 56, r2 = r1 + 100, H = r2 + 48;
  const R = linear([1, Math.max(2, n)], [left, right]);
  const set = (i: number, v: number) => { if (v !== values[i]) onChange(values.map((x, k) => k === i ? v : x)); };
  const { svg, start, handlers } = useDrag((i, p) => set(i, clamp(X.invert(p.x), bounds)));
  const pos = step >= 2 ? s.rank : s.place;
  // Gleiche Positionen übereinander stapeln, ohne in die Beschriftung des Stunden-Lineals zu reichen.
  const level = pos.map((v, i) => pos.slice(0, i).filter(w => Math.abs(w - v) < 1e-9).length);
  const gap = Math.min(24, (r2 - r1 - 64) / Math.max(1, Math.max(...level)));
  const markY = (i: number) => r2 - 14 - level[i] * gap;
  const hourMarks = ticksBetween(bounds.min, bounds.max, niceStep(bounds.max - bounds.min, 4)).map(v => ({ x: X(v), label: num(v) }));
  const rankMarks = Array.from({ length: n }, (_, k) => ({ x: R(k + 1), label: String(k + 1) }));
  return (
    <div ref={box}>
      <svg ref={svg} className="xw-svg xw-drag" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="group"
        aria-label={`Lernzeiten der fünf Personen in Stunden und darunter ihre ${step >= 2 ? 'Ränge' : 'Plätze'}: ${values.map((_, i) => `${names[i]} ${num(pos[i])}`).join(', ')}`} {...handlers}>
        {values.map((_, i) => <g key={`row${i}`}><line className="xw-guide" x1={left - 10} x2={right + 10} y1={rowY(i)} y2={rowY(i)} /><text className="xw-t" x={10} y={rowY(i) + 4}>{names[i]}</text></g>)}
        {values.map((v, i) => <line key={`link${i}`} className={`b04-link${i === who ? ' sel' : ''}`} x1={X(v)} x2={R(pos[i])} y1={r1 + 26} y2={markY(i) + 11} />)}
        <Ruler y={r1} from={left} to={right} marks={hourMarks} title="Stunden" />
        <Ruler y={r2} from={left} to={right} marks={rankMarks} title={step >= 2 ? 'Ränge' : 'Plätze der Reihe nach'} titleBelow />
        {values.map((_, i) => <g key={`mark${i}`}>
          <circle className={`xw-s-dot${i === who ? ' sel' : ''}`} cx={R(pos[i])} cy={markY(i)} r={11} />
          <text className="xw-t xw-strong" x={R(pos[i])} y={markY(i) + 5} textAnchor="middle">{names[i]}</text>
        </g>)}
        {values.map((v, i) => (
          <DragPoint key={`dot${i}`} x={X(v)} y={rowY(i)} label={`Person ${names[i]}, Lernzeit in Stunden`} selected={i === who} valueNow={v} bounds={bounds}
            onPointerDown={e => { onWho(i); start(i, e); }}
            onKeyDown={(e: KeyboardEvent) => {
              const next = keyStep(e, v, bounds);
              if (next !== null) { e.preventDefault(); onWho(i); set(i, next); }
            }}>{num(v, 1)}</DragPoint>
        ))}
      </svg>
    </div>
  );
}

/**
 * POMP als Weg: oben die Antwortstufen 1 bis max, der zurückgelegte Weg bis zur Antwort x als Balken, darunter
 * dasselbe Lineal in POMP von 0 bis 100.
 */
function PompWeg({ x, hi }: { x: number; hi: number }) {
  const [box, W] = useWidth();
  const top = Math.max(hi, x), left = 28, right = W - 28, X = linear([1, top], [left, right]);
  const r1 = 70, r2 = 140, H = 172, p = 100 * (x - 1) / (hi - 1);
  const stageMarks = Array.from({ length: top }, (_, k) => ({ x: X(k + 1), label: String(k + 1) })).filter((m, k, all) => all.length <= 10 || k % 2 === 0);
  const pompMarks = [0, 25, 50, 75, 100].map(v => ({ x: X(1 + v / 100 * (hi - 1)), label: String(v) }));
  const at = X(x), tag = Math.min(right - 36, Math.max(left + 36, at));
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={`Antwortskala von 1 bis ${num(hi)}. Die Antwort ${num(x)} liegt bei POMP ${num(p)}.`}>
        <rect className="b04-fill" x={X(1)} y={54} width={Math.max(0, X(Math.min(x, hi)) - X(1))} height={10} />
        <line className="b04-reading" x1={at} x2={at} y1={54} y2={r2} />
        <Ruler y={r1} from={left} to={right} marks={stageMarks} title="Antwortstufen" />
        <Ruler y={r2} from={left} to={X(hi)} marks={pompMarks} title="POMP" />
        <circle className="xw-s-dot sel" cx={at} cy={r1} r={5.5} />
        <text className="xw-t xw-strong xw-halo" x={tag} y={r2 - 8} textAnchor="middle">{x > hi ? 'über 100' : `POMP ${num(p)}`}</text>
      </svg>
    </div>
  );
}

export const pictures: Record<string, Picture> = {
  'b04-pomps': forSentence(p => <PompWeg x={p.values.x} hi={p.values.hi} />),
  'b04-raenge': forWorkshop(p => <Raenge values={p.data} s={p.s} step={p.step} who={p.who} names={p.workshop.names} bounds={p.workshop.bounds} onChange={p.setData} onWho={p.pickWho} />),
  'b04-skalieren': forSentence(p => <Teilen x={p.values.x} a={p.values.a} />),
  'b04-zentrieren': forWorkshop(p => <Lineale values={p.data} s={p.s} step={p.step} who={p.who} names={p.workshop.names} bounds={p.workshop.bounds} mode="centering" onChange={p.setData} onWho={p.pickWho} />),
  'b04-standardisieren': forWorkshop(p => <Lineale values={p.data} s={p.s} step={p.step} who={p.who} names={p.workshop.names} bounds={p.workshop.bounds} mode="z" onChange={p.setData} onWho={p.pickWho} />),
};

