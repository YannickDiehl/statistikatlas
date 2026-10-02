// Bilder des Bereichs B12 „Kategoriale Tests, Design, Rechenbausteine“: Balken des Anpassungstests (ziehbar),
// die Vierfeldertafel des Unabhängigkeitstests und diskrete Verteilungen mit markierten Rändern (Binomialtest, Fisher).
// Bausteine aus ./kit.tsx; eigene Stile in src/explain/areas/b12-kategorial-design.css. Anleitung: src/explain/AUTHORING.md.
import type { GofData, GofStats } from '../../../explain/content/b12-kategorial-design/chisq-gof';
import type { FourStats } from '../../../explain/content/b12-kategorial-design/chi-square';
import { partText } from '../../../explain/content/b12-kategorial-design/chi-gemeinsam';
import { pBinom } from '../../../explain/content/b12-kategorial-design/binomial-test';
import { dFisher, FISHER, pFisher } from '../../../explain/content/b12-kategorial-design/fisher-test';
import { dbinom, pText } from '../../../explain/content/b12-kategorial-design/rechnen';
import { num, signed } from '../../../explain/format';
import { Axis, Bar, clamp, DragPoint, forCard, forWorkshop, GridCell, keyStep, linear, MarkLine, useDrag, useWidth, type Bounds, type Picture } from './kit';

const SHORT = ['Ohne', 'Haupt', 'Mittl.', 'FH', 'Abi'];

/** Beobachtete Zahlen je Schulabschluss als ziehbare Balken, die erwarteten als gestrichelte Linien. */
function GofBars({ data, s, step, who, names, bounds, setData, pickWho }: {
  data: GofData; s: GofStats; step: number; who: number; names: readonly string[]; bounds: Bounds;
  setData: (d: GofData) => void; pickWho: (i: number) => void;
}) {
  const [box, W] = useWidth();
  const left = 44, right = W - 12, top = 30, base = 206, H = step >= 5 ? 280 : 256;
  const Y = linear([0, bounds.max], [base, top]), slot = (right - left) / s.k, cx = (i: number) => left + slot * (i + 0.5), bw = Math.min(46, slot * 0.56);
  const labels = slot < 80 ? SHORT : names;
  const set = (i: number, v: number) => { if (v !== data.o[i]) setData({ ...data, o: data.o.map((x, k) => k === i ? v : x) }); };
  const { svg, start, handlers } = useDrag((i, p) => set(i, clamp(Y.invert(p.y), bounds)));
  return (
    <div ref={box}>
      <svg ref={svg} className="xw-svg xw-drag" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="group" aria-label="Befragte je Schulabschluss: beobachtet als Balken, erwartet als gestrichelte Linie" {...handlers}>
        <Axis scale={Y} ticks={[0, 25, 50, 75, 100]} at={left - 6} from={base} to={top} orient="left" labelGap={18} />
        {s.o.map((o, i) => {
          const x0 = cx(i) - bw / 2;
          return <g key={i}>
            <Bar x={x0} y={Y(o)} width={bw} height={base - Y(o)} tone="plain" selected={i === who} />
            <MarkLine y={Y(s.e[i])} from={x0 - 7} to={x0 + bw + 7} />
            {step >= 2 && <text className={`xw-t ${s.dev[i] > 1e-9 ? 'xw-pos-t' : ''}`} x={cx(i)} y={Y(o) - 20} textAnchor="middle">{signed(s.dev[i])}</text>}
            <text className="xw-t" x={cx(i)} y={base + 20} textAnchor="middle">{labels[i]}</text>
            {step >= 4 && <text className="xw-t xw-strong" x={cx(i)} y={base + 40} textAnchor="middle">{partText(s.part[i])}</text>}
          </g>;
        })}
        <line className="xw-axis" x1={left - 6} x2={right} y1={base} y2={base} />
        {step >= 5 && <text className="xw-t xw-strong" x={left} y={base + 66}>χ² = {num(s.chi2)}{step >= 6 ? `, df = ${s.df}, ${pText(s.p)}` : ''}</text>}
        {s.o.map((o, i) => (
          <DragPoint key={`dot${i}`} x={cx(i)} y={Y(o)} label={`${s.labels[i]}, beobachtete Zahl`} selected={i === who} valueNow={o}
            valueText={`${o} Befragte, erwartet ${num(s.e[i])}`} bounds={bounds}
            onPointerDown={e => { pickWho(i); start(i, e); }}
            onKeyDown={e => { const next = keyStep(e, o, bounds); if (next !== null) { e.preventDefault(); pickWho(i); set(i, next); } }}>{o}</DragPoint>
        ))}
      </svg>
    </div>
  );
}

/** Vierfeldertafel mit Rändern: groß die beobachtete Zahl, darunter je nach Schritt E, O − E, das Quadrat oder der Beitrag. */
function FourGrid({ s, step, who }: { s: FourStats; step: number; who: number }) {
  const [box, W] = useWidth();
  const lab = 62, sumW = 56, gap = 6, cw = (W - lab - sumW - 3 * gap - 4) / 2, ch = 62, y0 = 66;
  const x = (j: number) => lab + gap + j * (cw + gap), y = (r: number) => y0 + r * (ch + gap), H = y(2) + 30 + (step >= 5 ? 32 : 0);
  const sub = (i: number) => step <= 1 ? `E = ${num(s.e[i])}` : step === 2 ? signed(s.dev[i]) : step === 3 ? num(s.sq[i]) : partText(s.part[i]);
  const tone = (i: number) => step < 2 ? 'plain' : s.dev[i] > 1e-9 ? 'pos' : s.dev[i] < -1e-9 ? 'neg' : 'plain';
  const label = `Vierfeldertafel ${s.rowTitle} und ${s.colTitle}: ${s.o.map((o, i) => `${'abcd'[i]} ${o}, erwartet ${num(s.e[i])}`).join('; ')}`;
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
        <text className="xw-t" x={4} y={16}>Zeilen: {s.rowTitle}</text>
        <text className="xw-t" x={4} y={36}>Spalten: {s.colTitle}</text>
        {[0, 1].map(j => <text key={`c${j}`} className="xw-t xw-strong" x={x(j) + cw / 2} y={y0 - 8} textAnchor="middle">{s.colShort[j]}</text>)}
        <text className="xw-t" x={x(2) + sumW / 2} y={y0 - 8} textAnchor="middle">Summe</text>
        {[0, 1].map(r => <g key={`r${r}`}>
          <text className="xw-t xw-strong" x={lab - 4} y={y(r) + ch / 2 + 5} textAnchor="end">{s.rowShort[r]}</text>
          {[0, 1].map(j => { const i = r * 2 + j; return <GridCell key={i} x={x(j)} y={y(r)} w={cw} h={ch} text={`${'abcd'[i]}: ${s.o[i]}`} sub={sub(i)} tone={tone(i)} selected={i === who} />; })}
          <text className="xw-t" x={x(2) + sumW / 2} y={y(r) + ch / 2 + 5} textAnchor="middle">{s.rowSum[r]}</text>
        </g>)}
        {[0, 1].map(j => <text key={`s${j}`} className="xw-t" x={x(j) + cw / 2} y={y(2) + 16} textAnchor="middle">{s.colSum[j]}</text>)}
        <text className="xw-t xw-strong" x={x(2) + sumW / 2} y={y(2) + 16} textAnchor="middle">{s.n}</text>
        {step >= 5 && <text className="xw-t xw-strong" x={4} y={y(2) + 48}>χ² = {num(s.chi2)}{step >= 6 ? `, df = 1, ${pText(s.p)}` : ''}</text>}
      </svg>
    </div>
  );
}

/**
 * Diskrete Verteilung als Balken, wenn die Nullhypothese stimmt. Markiert sind alle Ergebnisse, die mindestens so
 * ungewöhnlich sind wie das beobachtete; ihre Wahrscheinlichkeiten zusammen sind der p-Wert.
 */
export function Tails({ from, to, prob, marked, obs, expected, p, ticks, title, axis, what }: {
  from: number; to: number; prob: (k: number) => number; marked: (k: number) => boolean; obs: number; expected: number; p: number;
  ticks: number[]; title: string; axis: string; what: string;
}) {
  const [box, W] = useWidth();
  const left = 16, right = W - 16, base = 176, top = 44, ks = Array.from({ length: to - from + 1 }, (_, i) => from + i);
  const peak = Math.max(...ks.map(prob)), X = linear([from - 0.5, to + 0.5], [left, right]), Y = linear([0, peak * 1.08], [base, top]);
  const bw = Math.max(1, (right - left) / ks.length - 1), seen = Math.min(to, Math.max(from, obs));
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={238} viewBox={`0 0 ${W} 238`} role="img"
        aria-label={`${title}. Markiert sind alle Ergebnisse, die mindestens so ungewöhnlich sind wie ${obs} ${what}; zusammen ergeben sie ${pText(p)}.`}>
        <text className="xw-t xw-strong" x={left} y={16}>Markierte Balken zusammen: {pText(p)}</text>
        {ks.map(k => <Bar key={k} x={X(k) - bw / 2} y={Y(prob(k))} width={bw} height={base - Y(prob(k))} tone={marked(k) ? 'neg' : 'plain'} />)}
        <MarkLine x={X(seen)} from={top - 6} to={base} />
        <text className="xw-t" x={X(seen)} y={top - 12} textAnchor={X(seen) < W / 3 ? 'start' : X(seen) > 2 * W / 3 ? 'end' : 'middle'}>beobachtet: {obs}</text>
        <MarkLine x={X(expected)} from={top + 14} to={base} className="xw-axis" />
        <Axis scale={X} ticks={ticks} at={base} from={left} to={right} labelGap={22} title={axis} />
      </svg>
    </div>
  );
}

export const pictures: Record<string, Picture> = {
  'b12-anpassung': forWorkshop(p => <GofBars data={p.data} s={p.s} step={p.step} who={p.who} names={p.workshop.names} bounds={p.workshop.bounds} setData={p.setData} pickWho={p.pickWho} />),
  'b12-unabhaengigkeit': forWorkshop(p => <FourGrid s={p.s} step={p.step} who={p.who} />),
  'b12-binomial': forCard(p => {
    const v = p.value ?? 82, lo = Math.min(v, 200 - v), hi = Math.max(v, 200 - v);
    return <Tails from={60} to={140} prob={k => dbinom(k, 200, 0.5)} marked={k => k <= lo || k >= hi} obs={v} expected={100} p={pBinom(v)}
      ticks={[60, 80, 100, 120, 140]} title="Zahl der Ja-Antworten unter 200, wenn es in Wahrheit 50 % wären" axis="Ja-Antworten von 200, erwartet 100" what="Ja-Antworten" />;
  }),
  'b12-fisher': forCard(p => {
    const v = p.value ?? FISHER.k, d0 = dFisher(v) * (1 + 1e-7);
    return <Tails from={40} to={72} prob={dFisher} marked={k => dFisher(k) <= d0} obs={v} expected={FISHER.expected} p={pFisher(v)}
      ticks={[40, 48, 56, 64, 72]} title="Erwerbstätige unter den 82 Befragten mit Weiterbildung, wenn es keinen Zusammenhang gäbe" axis="Erwerbstätige mit Weiterbildung" what="Erwerbstätige" />;
  }),
};
