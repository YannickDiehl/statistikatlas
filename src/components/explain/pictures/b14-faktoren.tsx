// Bilder des Bereichs B14 „Skalen und Faktorenanalyse“ für alle Vorlagen. Schlüssel = `picture` der Erklärung, Bausteine und
// `forWorkshop`/`forCard`/`forSentence`/`forTable` aus ./kit.tsx.
// Eigene Stile in src/explain/areas/b14-faktoren.css (lädt main.tsx automatisch). Anleitung: src/explain/AUTHORING.md.
import { fixed, num } from '../../../explain/format';
import type { AlphaStats, Antworten } from '../../../explain/content/b14-faktoren/reliability';
import { clamp, DragPoint, forWorkshop, keyStep, linear, useDrag, useWidth, type Picture } from './kit';

const ITEM = { min: 1, max: 7 };

/**
 * Seitliche Verschiebung gleicher Werte auf einer Achse, damit Punkte nebeneinander statt übereinander liegen:
 * Abstand 22 px, bei vielen gleichen Werten enger, damit die Gruppe in `room` Pixel passt.
 */
export function spread(values: readonly number[], room: number): number[] {
  return values.map((v, i) => {
    const same = values.map((w, k) => w === v ? k : -1).filter(k => k >= 0);
    const spacing = Math.min(22, room / Math.max(1, same.length - 1));
    return (same.indexOf(i) - (same.length - 1) / 2) * spacing;
  });
}

/**
 * Cronbachs Alpha: oben die Antworten als Profillinien (je Person eine Linie über die drei Fragen, ziehbar),
 * rechts die Summenwerte; unten ab Schritt 2 die Streuung der Summenwerte gegen die Summe der Einzelstreuungen.
 */
function AlphaProfile({ data, s, step, who, names, onChange, onWho }: {
  data: Antworten; s: AlphaStats; step: number; who: number; names: readonly string[];
  onChange: (d: Antworten) => void; onWho: (i: number) => void;
}) {
  const [box, W] = useWidth();
  const top = 44, bottom = 216, first = 66, sumAt = W - 64, gap = (sumAt - first) / 3;
  const axis = (j: number) => first + j * gap;
  const y = linear([ITEM.min, ITEM.max], [bottom, top]), ySum = linear([3, 21], [bottom, top]);
  const offs = [0, 1, 2].map(j => spread(data.map(r => r[j]), gap - 26));
  const sumOff = spread(s.X, 44);
  const at = (i: number, j: number) => axis(j) + offs[j][i];
  const set = (i: number, j: number, v: number) => { if (v !== data[i][j]) onChange(data.map((r, a) => a === i ? r.map((x, b) => b === j ? v : x) : r)); };
  const { svg, start, handlers } = useDrag((k, p) => set(Math.floor(k / 3), k % 3, clamp(y.invert(p.y), ITEM)));
  // Balken unten: gemeinsame Skala für sₓ² und Σsⱼ².
  const L = 24, R = W - 24, max = Math.max(s.varX, s.sumItemVar, 1e-9), bw = (v: number) => Math.max(0, v) / max * (R - L);
  const rowA = bottom + 88, rowB = rowA + 64;
  const H = step >= 6 ? rowB + 98 : step >= 5 ? rowB + 76 : step >= 3 ? rowB + 52 : step >= 2 ? rowA + 34 : bottom + 52;
  const stacked = step >= 4, third = (R - L) / 3;
  let run = L;
  const segments = s.itemVar.map((v, j) => {
    const x = stacked ? run : L + j * third, w = stacked ? bw(v) : Math.min(bw(v), third - 10);
    run += bw(v);
    return <g key={j}>
      <rect className="b14-seg" x={x} y={rowB} width={Math.max(1, w)} height={22} />
      {!stacked && <text className="xw-t" x={x} y={rowB + 40}>{`s${['₁', '₂', '₃'][j]}² = ${num(v)}`}</text>}
    </g>;
  });
  const order = [...data.keys()].filter(i => i !== who).concat(who);
  const diff = s.diff;
  return (
    <div ref={box}>
      <svg ref={svg} className="xw-svg xw-drag" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="group"
        aria-label={`Antworten der fünf Beispielpersonen auf drei Fragen, Summenwerte ${s.X.join(', ')}`} {...handlers}>
        <desc id="b14-alpha-help">Pfeiltasten nach oben und unten ändern eine Antwort um eine Stufe.</desc>
        {[1, 2, 3, 4, 5, 6, 7].map(v => <g key={`g${v}`}>
          <line className="xw-guide" x1={first - 26} x2={axis(2) + 26} y1={y(v)} y2={y(v)} />
          <text className="xw-t" x={first - 36} y={y(v) + 5} textAnchor="end">{v}</text>
        </g>)}
        {[0, 1, 2].map(j => <g key={`a${j}`}>
          <line className="xw-axis" x1={axis(j)} x2={axis(j)} y1={top - 10} y2={bottom + 10} />
          <text className="xw-t xw-strong" x={axis(j)} y={top - 22} textAnchor="middle">Frage {j + 1}</text>
        </g>)}
        <line className="xw-axis" x1={sumAt} x2={sumAt} y1={top - 10} y2={bottom + 10} />
        <text className="xw-t xw-strong" x={sumAt} y={top - 22} textAnchor="middle">Summe</text>
        {order.map(i => <g key={`l${i}`}>
          <polyline className={`b14-line${i === who ? ' sel' : ''}`} points={data[i].map((v, j) => `${at(i, j)},${y(v)}`).join(' ')} />
          <line className={`b14-link${i === who ? ' sel' : ''}`} x1={at(i, 2)} y1={y(data[i][2])} x2={sumAt + sumOff[i]} y2={ySum(s.X[i])} />
        </g>)}
        {order.map(i => <g key={`x${i}`} className={`b14-sum${i === who ? ' sel' : ''}`} onClick={() => onWho(i)}>
          <circle cx={sumAt + sumOff[i]} cy={ySum(s.X[i])} r={i === who ? 12 : 10} />
          <text className="xw-t" x={sumAt + sumOff[i]} y={ySum(s.X[i]) + 5} textAnchor="middle">{names[i]}</text>
        </g>)}
        {order.flatMap(i => data[i].map((v, j) => (
          <DragPoint key={`d${i}-${j}`} x={at(i, j)} y={y(v)} label={`Person ${names[i]}, Frage ${j + 1}`} selected={i === who}
            valueNow={v} bounds={ITEM} describedBy="b14-alpha-help"
            onPointerDown={e => { onWho(i); start(i * 3 + j, e); }}
            onKeyDown={e => {
              const next = keyStep(e, v, ITEM);
              if (next !== null) { e.preventDefault(); onWho(i); set(i, j, next); }
            }}>{v}</DragPoint>
        )))}
        <text className="xw-t" x={first - 44} y={bottom + 40}>Summenwerte: {s.X.map((x, i) => `${names[i]} ${x}`).join(', ')}</text>
        {step >= 2 && <g>
          <text className="xw-t xw-strong" x={L} y={rowA - 8}>Streuung der Summenwerte sₓ² = {num(s.varX)}</text>
          <rect className="b14-total" x={L} y={rowA} width={Math.max(1, bw(s.varX))} height={22} />
          {step >= 5 && diff > 1e-9 && <rect className="b14-shared" x={L + bw(s.sumItemVar)} y={rowA} width={bw(diff)} height={22} />}
        </g>}
        {step >= 3 && <g>
          <text className="xw-t xw-strong" x={L} y={rowB - 8}>{stacked ? `Summe der Einzelstreuungen Σsⱼ² = ${num(s.sumItemVar)}` : 'Jede Frage für sich'}</text>
          {segments}
          {step >= 5 && diff < -1e-9 && <rect className="b14-excess" x={L + bw(s.varX)} y={rowB} width={bw(-diff)} height={22} />}
        </g>}
        {step >= 5 && <text className="xw-t" x={L} y={rowB + 62}>
          {diff >= 0 ? `Gemeinsamer Teil: ${num(s.varX)} − ${num(s.sumItemVar)} = ${num(diff)}` : `Kein gemeinsamer Teil: ${num(s.varX)} − ${num(s.sumItemVar)} = ${num(diff)}`}
        </text>}
        {step >= 6 && <text className="xw-t xw-strong" x={L} y={rowB + 86}>
          {Number.isFinite(s.alpha) ? `α = 3/2 · ${num(diff)} / ${num(s.varX)} ≈ ${fixed(s.alpha)}` : 'α ist nicht berechenbar: sₓ² ist 0.'}
        </text>}
      </svg>
    </div>
  );
}

export const pictures: Record<string, Picture> = {
  'b14-alpha': forWorkshop(p => <AlphaProfile data={p.data} s={p.s} step={p.step} who={p.who} names={p.workshop.names} onChange={p.setData} onWho={p.pickWho} />),
};
