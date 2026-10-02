// Bilder des Bereichs B11 „Rangtests und Paarvergleiche“ für alle Vorlagen. Schlüssel = `picture` der Erklärung, Bausteine und
// `forWorkshop`/`forCard`/`forSentence`/`forTable` aus ./kit.tsx.
// Eigene Stile in src/explain/areas/b11-rangtests.css (lädt main.tsx automatisch). Anleitung: src/explain/AUTHORING.md.
import type { KeyboardEvent, PointerEvent } from 'react';
import { num } from '../../../explain/format';
import { MW_GROUP, type MwStats } from '../../../explain/content/b11-rangtests/mann-whitney';
import { KW_GROUP, KW_LABELS, type KwStats } from '../../../explain/content/b11-rangtests/kruskal-wallis';
import type { WxStats } from '../../../explain/content/b11-rangtests/wilcoxon';
import type { FrStats } from '../../../explain/content/b11-rangtests/friedman';
import type { Pairs } from '../../../explain/math';
import { Axis, clamp, DragPoint, forWorkshop, GridCell, keyStep, linear, MarkLine, useDrag, useWidth, type Bounds, type Picture } from './kit';

/** Ein Punkt einer Zeile: Wert, Beschriftung im Kreis, vorgelesener Name, Index in den Daten. */
type RowPoint = { value: number; label: string; name: string; at: number };
/** Eine Zeile: Name links, Punkte, rechts eine Notiz; `head` beginnt eine neue Gruppe mit Überschrift. */
type Row = { name: string; points: RowPoint[]; note?: string; head?: string; arrow?: boolean; tone?: 'pos' | 'neg' };

/**
 * Zeilen mit ziehbaren Punkten auf einer gemeinsamen Achse (eine Zeile je Person). Ziehen und Pfeiltasten ändern den
 * Wert des Punkts (`onChange(at, wert)`), ein Klick wählt die Person der Zeile (`onPick(zeile)`).
 */
function DotRows({ rows, bounds, axisTitle, who, onPick, onChange, label, tickStep }: {
  rows: Row[]; bounds: Bounds; axisTitle: string; who: number; label: string; tickStep: number;
  onPick: (row: number) => void; onChange: (at: number, v: number) => void;
}) {
  const [box, W] = useWidth();
  const left = 40, right = W - 92, X = linear([bounds.min, bounds.max], [left, right]);
  // Mehrere Punkte je Zeile stehen leicht versetzt übereinander, damit nahe Werte lesbar bleiben.
  const heads = rows.filter(r => r.head).length, HEAD = 24, SHIFT = 10;
  const ys: number[] = [];
  let y = 22;
  rows.forEach(r => { const half = (r.points.length - 1) * SHIFT / 2; if (r.head) y += HEAD; y += half; ys.push(y); y += 30 + half; });
  const py = (row: number, j: number) => ys[row] + (j - (rows[row].points.length - 1) / 2) * SHIFT;
  const AXIS = y - 6, H = AXIS + 50;
  const flat = rows.flatMap((r, k) => r.points.map((p, j) => ({ ...p, row: k, j })));
  const { svg, start, handlers } = useDrag((i, p) => { const pt = flat[i]; const v = clamp(X.invert(p.x), bounds); if (v !== pt.value) onChange(pt.at, v); });
  const key = (e: KeyboardEvent, i: number) => {
    const pt = flat[i], next = keyStep(e, pt.value, bounds);
    if (next === null) return;
    e.preventDefault(); onPick(pt.row);
    if (next !== pt.value) onChange(pt.at, next);
  };
  const ticks = Array.from({ length: Math.floor((bounds.max - bounds.min) / tickStep) + 1 }, (_, k) => bounds.min + k * tickStep);
  return (
    <div ref={box}>
      <svg ref={svg} className="xw-svg xw-drag" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="group" aria-label={label} {...handlers}>
        {heads > 0 && rows.map((r, k) => r.head ? <text key={`h${k}`} className="xw-t xw-strong" x={4} y={ys[k] - 20}>{r.head}</text> : null)}
        {rows.map((r, k) => (
          <g key={`r${k}`}>
            <line className="xw-guide" x1={left - 8} x2={right + 8} y1={ys[k]} y2={ys[k]} />
            <text className={`xw-t${k === who ? ' xw-strong' : ''}`} x={6} y={ys[k] + 5}>{r.name}</text>
            {r.arrow && r.points.length === 2 && Math.abs(r.points[1].value - r.points[0].value) > 1e-9 && (
              <line className={r.tone === 'neg' ? 'xw-neg' : 'xw-pos'} strokeWidth={k === who ? 4.5 : 3} x1={X(r.points[0].value)} x2={X(r.points[1].value)} y1={py(k, 0)} y2={py(k, 1)} />
            )}
            {r.note && <text className={`xw-t${k === who ? ' xw-strong' : ''}`} x={right + 22} y={ys[k] + 5}>{r.note}</text>}
          </g>
        ))}
        <Axis scale={X} ticks={ticks} at={AXIS} from={left} to={right} labelGap={20} title={axisTitle} />
        {flat.map((pt, i) => (
          <DragPoint key={`p${i}`} x={X(pt.value)} y={py(pt.row, pt.j)} label={pt.name} selected={pt.row === who} valueNow={pt.value} bounds={bounds}
            onPointerDown={(e: PointerEvent) => { onPick(pt.row); start(i, e); }} onKeyDown={e => key(e, i)}>{pt.label}</DragPoint>
        ))}
      </svg>
    </div>
  );
}

// Mann–Whitney-U -----------------------------------------------------------------------

/** Alle 16 Paare aus je einer Person ohne (Zeilen) und mit Weiterbildung (Spalten): grün, wenn ohne vorn liegt, braunrot, wenn mit vorn liegt. */
function PairGrid({ s, names, who }: { s: MwStats; names: readonly string[]; who: number }) {
  const [box, W] = useWidth();
  const cell = Math.min(44, Math.floor((W - 70) / 4)), x0 = 46, y0 = 44, H = y0 + 4 * cell + 34;
  const ohne = [0, 1, 2, 3], mit = [4, 5, 6, 7];
  const won = (a: number, b: number) => s.xs[a] > s.xs[b] ? 1 : s.xs[a] === s.xs[b] ? 0.5 : 0;
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={`Alle 16 Paare: In ${num(s.U1)} Paaren lernt die Person ohne Weiterbildung länger, in ${num(s.U2)} die Person mit Weiterbildung.`}>
        <text className="xw-t" x={x0} y={14}>mit Weiterbildung</text>
        {mit.map((b, j) => <text key={`c${j}`} className="xw-t xw-strong" x={x0 + j * cell + cell / 2} y={y0 - 8} textAnchor="middle">{names[b]}</text>)}
        {ohne.map((a, i) => <g key={`r${i}`}>
          <text className="xw-t xw-strong" x={x0 - 10} y={y0 + i * cell + cell / 2 + 5} textAnchor="end">{names[a]}</text>
          {mit.map((b, j) => {
            const w = won(a, b);
            return <GridCell key={`g${j}`} x={x0 + j * cell} y={y0 + i * cell} w={cell} h={cell} text={w === 1 ? '+' : w === 0.5 ? '½' : '−'}
              tone={w === 1 ? 'pos' : w === 0 ? 'neg' : 'plain'} selected={a === who || b === who} />;
          })}
        </g>)}
        <text className="xw-t" x={x0} y={y0 + 4 * cell + 22}>U₁ = {num(s.U1)}, U₂ = {num(s.U2)}</text>
      </svg>
    </div>
  );
}

/** Achse von 0 bis n₁ · n₂ mit dem gemeldeten U und der Erwartung ohne Unterschied. */
function UScale({ s }: { s: MwStats }) {
  const [box, W] = useWidth();
  const X = linear([0, 16], [24, W - 24]), base = 70;
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={124} viewBox={`0 0 ${W} 124`} role="img"
        aria-label={`U = ${num(s.U)} auf der Achse von 0 bis 16; ohne Unterschied erwartet man 8, z ≈ ${Number.isFinite(s.z) ? num(s.z) : 'nicht definiert'}.`}>
        {s.sd > 0 && <rect className="xw-band" x={X(Math.max(0, 8 - s.sd))} y={34} width={X(Math.min(16, 8 + s.sd)) - X(Math.max(0, 8 - s.sd))} height={base - 34} />}
        <MarkLine x={X(8)} from={30} to={base} label="Erwartung 8" />
        <line className="xw-pos" strokeWidth={4} x1={X(s.U)} x2={X(s.U)} y1={40} y2={base} />
        <text className="xw-t xw-strong" x={X(s.U)} y={base + 44} textAnchor="middle">U = {num(s.U)}</text>
        <Axis scale={X} ticks={[0, 4, 8, 12, 16]} at={base} from={24} to={W - 24} labelGap={20} />
      </svg>
    </div>
  );
}

function MannWhitneyPicture({ data, s, step, who, setData, pickWho, names }: { data: number[]; s: MwStats; step: number; who: number; setData: (d: number[]) => void; pickWho: (i: number) => void; names: readonly string[] }) {
  const rows: Row[] = data.map((v, i) => ({
    name: names[i],
    head: i === 0 ? `ohne Weiterbildung${step >= 2 ? `: R₁ = ${num(s.R1)}` : ''}` : i === 4 ? `mit Weiterbildung${step >= 2 ? `: R₂ = ${num(s.R2)}` : ''}` : undefined,
    points: [{ value: v, label: String(num(v)), name: `Person ${names[i]}, ${MW_GROUP[i] ? 'mit' : 'ohne'} Weiterbildung, Lernzeit in Stunden`, at: i }],
    note: `Rang ${num(s.rank[i])}`,
  }));
  return <>
    <DotRows rows={rows} bounds={{ min: 0, max: 30 }} tickStep={5} axisTitle="Lernzeit in den letzten sieben Tagen (h)" who={who} onPick={pickWho}
      onChange={(at, v) => setData(data.map((x, k) => k === at ? v : x))} label="Lernzeiten der acht Beispielpersonen, je Zeile eine Person" />
    {step >= 3 && <PairGrid s={s} names={names} who={who} />}
    {step >= 5 && <UScale s={s} />}
  </>;
}

// Kruskal–Wallis -----------------------------------------------------------------------

/** Rangachse von 1 bis N mit dem mittleren Rang jeder Gruppe, ab Schritt 3 mit der Mitte und den Abständen dazu. */
function MeanRanks({ s, step, labels }: { s: KwStats; step: number; labels: readonly string[] }) {
  const [box, W] = useWidth();
  const right = step >= 4 ? W - 96 : W - 24, X = linear([1, s.N], [24, right]), Y = (j: number) => 44 + j * 44, AXIS = 44 + s.k * 44, H = AXIS + 56;
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={`Mittlere Ränge: ${labels.map((l, j) => `${l} ${num(s.mean[j])}`).join(', ')}; die Mitte aller Ränge ist ${num(s.grand)}.`}>
        {step >= 3 && <MarkLine x={X(s.grand)} from={20} to={AXIS} label={`Mitte ${num(s.grand)}`} />}
        {s.mean.map((m, j) => <g key={j}>
          <line className="xw-guide" x1={24} x2={right} y1={Y(j)} y2={Y(j)} />
          {step >= 3 && Math.abs(s.dev[j]) > 1e-9 && <g>
            <line className={s.dev[j] > 0 ? 'xw-pos' : 'xw-neg'} strokeWidth={3} x1={X(s.grand)} x2={X(m)} y1={Y(j)} y2={Y(j)} />
          </g>}
          <circle className="b11-mark" cx={X(m)} cy={Y(j)} r={6} />
          <text className="xw-t" x={24} y={Y(j) - 10}>{labels[j]}: {num(m)}</text>
          {step >= 4 && <text className="xw-t" x={right + 12} y={Y(j) + 5}>· 3 = {num(s.weighted[j])}</text>}
        </g>)}
        <Axis scale={X} ticks={Array.from({ length: s.N }, (_, k) => k + 1)} at={AXIS} from={24} to={right} labelGap={20} title="Rang in der gemeinsamen Reihe" />
        {step >= 5 && <text className="xw-t xw-strong" x={W - 24} y={14} textAnchor="end">H ≈ {num(s.Hraw)}</text>}
      </svg>
    </div>
  );
}

function KruskalWallisPicture({ data, s, step, who, setData, pickWho, names }: { data: number[]; s: KwStats; step: number; who: number; setData: (d: number[]) => void; pickWho: (i: number) => void; names: readonly string[] }) {
  const rows: Row[] = data.map((v, i) => ({
    name: names[i],
    head: i === 0 || KW_GROUP[i] !== KW_GROUP[i - 1] ? `${KW_LABELS[KW_GROUP[i]]}${step >= 2 ? `: R̄ = ${num(s.mean[KW_GROUP[i]])}` : ''}` : undefined,
    points: [{ value: v, label: String(num(v)), name: `Person ${names[i]}, ${KW_LABELS[KW_GROUP[i]]}, Lernzeit in Stunden`, at: i }],
    note: `Rang ${num(s.rank[i])}`,
  }));
  return <>
    <DotRows rows={rows} bounds={{ min: 0, max: 30 }} tickStep={5} axisTitle="Lernzeit in den letzten sieben Tagen (h)" who={who} onPick={pickWho}
      onChange={(at, v) => setData(data.map((x, k) => k === at ? v : x))} label="Lernzeiten der neun Beispielpersonen, je Zeile eine Person" />
    {step >= 2 && <MeanRanks s={s} step={step} labels={['Haupt', 'Mittel', 'Abitur']} />}
  </>;
}

// Wilcoxon, verbunden ------------------------------------------------------------------

/** Zwei waagerechte Balken für die Rangsummen W⁺ und W⁻, ab Schritt 4 mit der Erwartung ohne Veränderung. */
function RankSumBars({ s, step }: { s: WxStats; step: number }) {
  const [box, W] = useWidth();
  const left = 60, right = W - 90, X = linear([0, Math.max(1, s.total)], [left, right]);
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={112} viewBox={`0 0 ${W} 112`} role="img"
        aria-label={`Rangsumme der Verbesserungen W⁺ = ${num(s.Wpos)}, der Verschlechterungen W⁻ = ${num(s.Wneg)}; ohne Veränderung erwartet man je ${num(s.E)}.`}>
        <text className="xw-t" x={4} y={36}>W⁺</text>
        <rect className="xw-bar-pos" x={left} y={22} width={Math.max(2, X(s.Wpos) - left)} height={20} />
        <text className="xw-t" x={X(s.Wpos) + 8} y={37}>+ {num(s.Wpos)}</text>
        <text className="xw-t" x={4} y={76}>W⁻</text>
        <rect className="xw-bar-neg" x={left} y={62} width={Math.max(2, X(s.Wneg) - left)} height={20} />
        <text className="xw-t" x={X(s.Wneg) + 8} y={77}>− {num(s.Wneg)}</text>
        {step >= 4 && s.n > 0 && <MarkLine x={X(s.E)} from={16} to={92} label="" />}
        {step >= 4 && s.n > 0 && <text className="xw-t" x={X(s.E)} y={108} textAnchor="middle">Erwartung {num(s.E)}</text>}
      </svg>
    </div>
  );
}

function WilcoxonPicture({ data, s, step, who, setData, pickWho, names }: { data: Pairs; s: WxStats; step: number; who: number; setData: (d: Pairs) => void; pickWho: (i: number) => void; names: readonly string[] }) {
  const n = data.x.length;
  const note = (i: number) => step === 1 ? `d = ${s.d[i] > 0 ? '+' : ''}${num(s.d[i])}` : s.d[i] === 0 ? 'fällt weg'
    : step === 2 ? `Rang ${num(s.rank[i])}` : `${s.d[i] > 0 ? '+' : '−'} ${num(s.rank[i])}`;
  const rows: Row[] = data.x.map((x, i) => ({
    name: names[i], arrow: true, tone: s.d[i] < 0 ? 'neg' : 'pos',
    points: [
      { value: x, label: '1', name: `Person ${names[i]}, erster Test, gelöste Aufgaben`, at: i },
      { value: data.y[i], label: '2', name: `Person ${names[i]}, zweiter Test, gelöste Aufgaben`, at: n + i },
    ],
    note: note(i),
  }));
  const change = (at: number, v: number) => setData(at < n ? { x: data.x.map((x, k) => k === at ? v : x), y: data.y } : { x: data.x, y: data.y.map((y, k) => k === at - n ? v : y) });
  return <>
    <DotRows rows={rows} bounds={{ min: 0, max: 20 }} tickStep={5} axisTitle="gelöste Aufgaben im Wissenstest (von 20)" who={who} onPick={pickWho}
      onChange={change} label="Zwei Tests der sechs Beispielpersonen, je Zeile eine Person" />
    {step >= 3 && <RankSumBars s={s} step={step} />}
  </>;
}

// Friedman ------------------------------------------------------------------------------

/** Rangsummen der drei Tests als Balken, ab Schritt 3 mit der Erwartung, ab Schritt 4 mit den Quadraten der Abstände. */
function TimeSums({ s, step }: { s: FrStats; step: number }) {
  const [box, W] = useWidth();
  const top = s.N * s.k, left = 60, right = step >= 4 ? W - 110 : W - 50, X = linear([0, top], [left, right]);
  const Y = (j: number) => 26 + j * 36, H = 26 + s.k * 36 + 34;
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={`Rangsummen der drei Tests: ${s.R.map(r => num(r)).join(', ')}; ohne Unterschied hätte jeder ${num(s.E)}.`}>
        {s.R.map((r, j) => <g key={j}>
          <text className="xw-t" x={4} y={Y(j) + 15}>Test {j + 1}</text>
          <rect className="xw-bar-plain" x={left} y={Y(j)} width={Math.max(2, X(r) - left)} height={20} />
          <text className="xw-t" x={X(r) + 6} y={Y(j) + 15}>{num(r)}</text>
          {step >= 4 && <text className="xw-t" x={right + 30} y={Y(j) + 15}>({s.dev[j] < 0 ? '−' : s.dev[j] > 0 ? '+' : ''}{num(Math.abs(s.dev[j]))})² = {num(s.sq[j])}</text>}
        </g>)}
        {step >= 3 && <MarkLine x={X(s.E)} from={14} to={Y(s.k - 1) + 28} />}
        {step >= 3 && <text className="xw-t" x={X(s.E)} y={H - 8} textAnchor="middle">Erwartung {num(s.E)}</text>}
      </svg>
    </div>
  );
}

function FriedmanPicture({ data, s, step, who, setData, pickWho, names }: { data: number[][]; s: FrStats; step: number; who: number; setData: (d: number[][]) => void; pickWho: (i: number) => void; names: readonly string[] }) {
  const rows: Row[] = data.map((r, i) => ({
    name: names[i],
    points: r.map((v, j) => ({ value: v, label: String(j + 1), name: `Person ${names[i]}, Test ${j + 1}, gelöste Aufgaben`, at: 3 * i + j })),
    note: `R: ${s.ranks[i].map(x => num(x)).join('; ')}`,
  }));
  const change = (at: number, v: number) => setData(data.map((r, i) => i === Math.floor(at / 3) ? r.map((x, j) => j === at % 3 ? v : x) : r));
  return <>
    <DotRows rows={rows} bounds={{ min: 0, max: 20 }} tickStep={5} axisTitle="gelöste Aufgaben im Wissenstest (von 20)" who={who} onPick={pickWho}
      onChange={change} label="Drei Tests der fünf Beispielpersonen, je Zeile eine Person" />
    {step >= 2 && <TimeSums s={s} step={step} />}
  </>;
}

export const pictures: Record<string, Picture> = {
  'b11-kw': forWorkshop(p => <KruskalWallisPicture data={p.data} s={p.s} step={p.step} who={p.who} setData={p.setData} pickWho={p.pickWho} names={p.workshop.names} />),
  'b11-wilcoxon': forWorkshop(p => <WilcoxonPicture data={p.data} s={p.s} step={p.step} who={p.who} setData={p.setData} pickWho={p.pickWho} names={p.workshop.names} />),
  'b11-friedman': forWorkshop(p => <FriedmanPicture data={p.data} s={p.s} step={p.step} who={p.who} setData={p.setData} pickWho={p.pickWho} names={p.workshop.names} />),
  'b11-mw': forWorkshop(p => <MannWhitneyPicture data={p.data} s={p.s} step={p.step} who={p.who} setData={p.setData} pickWho={p.pickWho} names={p.workshop.names} />),
};
