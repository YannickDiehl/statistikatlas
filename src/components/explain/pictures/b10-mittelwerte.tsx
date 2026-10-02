// Bilder des Bereichs B10 „Mittelwerte vergleichen“ für alle Vorlagen. Schlüssel = `picture` der Erklärung, Bausteine und
// `forWorkshop`/`forCard`/`forSentence`/`forTable` aus ./kit.tsx.
// Eigene Stile in src/explain/areas/b10-mittelwerte.css (lädt main.tsx automatisch). Anleitung: src/explain/AUTHORING.md.
import type { Pairs } from '../../../explain/math';
import { num, signed } from '../../../explain/format';
import type { PairedStats } from '../../../explain/content/b10-mittelwerte/paired-difference';
import { sdForR, tForR, WISSEN } from '../../../explain/content/b10-mittelwerte/paired-design';
import { GRUPPEN, type AnovaStats } from '../../../explain/content/b10-mittelwerte/anova';
import { ZELLEN } from '../../../explain/content/b10-mittelwerte/factorial-anova';
import { BEREINIGT } from '../../../explain/content/b10-mittelwerte/ancova';
import { STREUUNGEN } from '../../../explain/content/b10-mittelwerte/variance-assumption';
import { Axis, Bar, clamp, DragPoint, forCard, forWorkshop, keyStep, linear, MarkLine, useDrag, useWidth, type Bounds, type Picture } from './kit';

/** Ganzzahlige Ticks von `from` bis `to` in Schritten von `by`. */
/** „=“, wenn die angezeigte Zahl genau ist, sonst „≈“. */
const eq = (v: number) => Math.abs(Math.round(v * 100) / 100 - v) > 1e-9 ? '≈' : '=';
const ticks = (from: number, to: number, by: number) => Array.from({ length: Math.floor((to - from) / by) + 1 }, (_, k) => from + k * by);

/**
 * Gepaarte Differenzen: oben je Person beide Tests mit dem Pfeil der Veränderung (beide Punkte ziehbar), unten die fünf
 * Veränderungen mit ihrer Mitte d̄ (ab Schritt 2), dem Band d̄ ± s (Schritt 3), d̄ ± SE (Schritt 4) und dem Abstand zu 0 (Schritt 5).
 */
function PairsPicture({ data, s, step, who, names, bounds, onChange, onWho }: {
  data: Pairs; s: PairedStats; step: number; who: number; names: readonly string[]; bounds: Bounds;
  onChange: (d: Pairs) => void; onWho: (i: number) => void;
}) {
  const [box, W] = useWidth();
  const left = 44, right = W - 26, X = linear([bounds.min, bounds.max], [left, right]);
  const rowY = (i: number) => 40 + i * 36, AXIS = rowY(names.length - 1) + 26;
  const set = (i: number, which: 'x' | 'y', v: number) => {
    if (data[which][i] === v) return;
    onChange({ ...data, [which]: data[which].map((old, k) => k === i ? v : old) });
  };
  const { svg, start, handlers } = useDrag((k, p) => set(k >> 1, k & 1 ? 'y' : 'x', clamp(X.invert(p.x), bounds)));
  // Unteres Feld: die Veränderungen auf ihrer eigenen Achse, mindestens von −6 bis +6, darunter eine Zeile je Schritt.
  const lim = Math.max(6, Math.ceil(Math.max(...s.d.map(Math.abs)))), top = AXIS + 92, D = linear([-lim, lim], [left, right]);
  const dotY = (i: number) => top + 28 - 12 * s.d.slice(0, i).filter(v => v === s.d[i]).length;
  const lines = [
    step >= 3 && `Band: d̄ ± s = ${num(s.mean)} ± ${num(s.sd)}`,
    step >= 4 && `Grüner Strich: d̄ ± SE = ${num(s.mean)} ± ${num(s.se, 3)}`,
    step >= 5 && (s.t === null ? 't nicht definiert: Die Veränderungen streuen nicht.' : `d̄ liegt ${num(Math.abs(s.t))} Standardfehler ${s.t >= 0 ? 'über' : 'unter'} 0: t ${eq(s.t)} ${num(s.t)}`),
  ].filter((l): l is string => !!l);
  const H = step >= 2 ? top + 78 + lines.length * 20 : AXIS + 48;
  const lo = (v: number) => Math.max(left, Math.min(right, D(v)));
  return (
    <div ref={box}>
      <svg ref={svg} className="xw-svg xw-drag" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="group" aria-label="Erster und zweiter Wissenstest der fünf Beispielpersonen mit ihren Veränderungen" {...handlers}>
        <desc id="b10-paare-help">Pfeiltasten ändern die gelösten Aufgaben, Pos1 und Ende springen an die Grenzen.</desc>
        {names.map((n, i) => <g key={`row${i}`}>
          <line className="xw-guide" x1={left - 10} x2={right + 10} y1={rowY(i)} y2={rowY(i)} />
          <text className="xw-t" x={10} y={rowY(i) + 4}>{n}</text>
        </g>)}
        {s.d.map((d, i) => d !== 0 && <g key={`arrow${i}`}>
          <line className={d > 0 ? 'xw-pos' : 'xw-neg'} strokeWidth={i === who ? 4.5 : 3} x1={X(data.x[i])} x2={X(data.y[i])} y1={rowY(i)} y2={rowY(i)} />
          <text className="xw-t" x={(X(data.x[i]) + X(data.y[i])) / 2} y={rowY(i) - 15} textAnchor="middle">{signed(d)}</text>
        </g>)}
        <Axis scale={X} ticks={ticks(bounds.min, bounds.max, 2)} at={AXIS} from={left} to={right} labelGap={20} title="gelöste Aufgaben" />
        {names.flatMap((n, i) => (['x', 'y'] as const).map((which, k) => {
          const v = data[which][i];
          return <DragPoint key={`${which}${i}`} x={X(v)} y={rowY(i)} label={`Person ${n}, ${which === 'x' ? 'erster' : 'zweiter'} Test`} selected={i === who}
            valueNow={v} bounds={bounds} valueText={`${v} Aufgaben`} describedBy="b10-paare-help"
            onPointerDown={e => { onWho(i); start(i * 2 + k, e); }}
            onKeyDown={e => { const next = keyStep(e, v, bounds); if (next !== null) { e.preventDefault(); onWho(i); set(i, which, next); } }}>{k + 1}</DragPoint>;
        }))}
        {step >= 2 && <g>
          <text className="xw-t xw-strong" x={10} y={top - 40}>Die fünf Veränderungen dᵢ</text>
          {step >= 3 && s.sd > 0 && <rect className="xw-band" x={lo(s.mean - s.sd)} y={top - 4} width={lo(s.mean + s.sd) - lo(s.mean - s.sd)} height={44} />}
          {step >= 4 && s.se > 0 && <line className="xw-side" x1={lo(s.mean - s.se)} x2={lo(s.mean + s.se)} y1={top + 36} y2={top + 36} />}
          {step >= 5 && <line className="xw-axis" strokeWidth={2} x1={D(0)} x2={D(0)} y1={top} y2={top + 40} />}
          <MarkLine x={D(s.mean)} from={top - 14} to={top + 40} label={`d̄ = ${num(s.mean)}`} />
          {s.d.map((d, i) => <circle key={`d${i}`} className={`b10-dot${i === who ? ' sel' : ''}`} cx={D(d)} cy={dotY(i)} r={i === who ? 7 : 5.5} />)}
          <Axis scale={D} ticks={ticks(-lim, lim, lim > 10 ? 4 : 2)} at={top + 40} from={left} to={right} labelGap={18} format={v => v > 0 ? `+${v}` : String(v).replace('-', '−')} />
          {lines.map((l, k) => <text key={l} className={`xw-t${k === lines.length - 1 ? ' xw-strong' : ''}`} x={10} y={top + 84 + k * 20}>{l}</text>)}
        </g>}
      </svg>
    </div>
  );
}

/**
 * Verbundene Messungen: Streuung der beiden Tests und Streuung der Veränderungen bei dem Zusammenhang r, den der Regler
 * einstellt; darunter, wie viele Standardfehler die mittlere Veränderung dann groß ist.
 */
function PairedSpread({ r }: { r: number }) {
  const [box, W] = useWidth();
  const left = 150, right = W - 70, X = linear([0, 5], [left, right]), sd = sdForR(r), t = tForR(r);
  const rows: { label: string; v: number; tone: 'plain' | 'pos' }[] = [
    { label: 'erster Test', v: WISSEN.s1, tone: 'plain' }, { label: 'zweiter Test', v: WISSEN.s2, tone: 'plain' }, { label: 'Veränderung', v: sd, tone: 'pos' },
  ];
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={196} viewBox={`0 0 ${W} 196`} role="img"
        aria-label={`Streuung in Aufgaben: erster Test ${num(WISSEN.s1)}, zweiter Test ${num(WISSEN.s2)}, Veränderung ${num(sd)} bei r = ${num(r)}. Die mittlere Veränderung ist ${num(t)} Standardfehler groß.`}>
        <text className="xw-t xw-strong" x={8} y={16}>Streuung s in Aufgaben</text>
        {rows.map((row, i) => <g key={row.label}>
          <text className="xw-t" x={8} y={44 + i * 34}>{row.label}</text>
          <Bar x={left} y={30 + i * 34} width={X(row.v) - left} height={20} tone={row.tone} label={num(row.v)} />
        </g>)}
        <Axis scale={X} ticks={[0, 1, 2, 3, 4, 5]} at={136} from={left} to={right} labelGap={18} />
        <text className="xw-t xw-strong" x={8} y={186}>{`t als Paare ≈ ${num(t)}`}</text>
      </svg>
    </div>
  );
}

/**
 * Einfaktorielle ANOVA: neun Personen in drei Gruppen auf der Lernzeit-Achse (ziehbar), gestrichelt die Gruppenmitten,
 * durchgezogen die Gesamtmitte. Schritt 2: Abstände der Gruppenmitten zur Gesamtmitte; Schritt 3: Abstände der Personen
 * zu ihrer Gruppenmitte; ab Schritt 4 die beiden mittleren Quadratsummen als Balken und F.
 */
function GroupDots({ values, s, step, who, names, bounds, onChange, onWho }: {
  values: number[]; s: AnovaStats; step: number; who: number; names: readonly string[]; bounds: Bounds;
  onChange: (v: number[]) => void; onWho: (i: number) => void;
}) {
  const [box, W] = useWidth();
  const left = 44, right = W - 78, X = linear([bounds.min, bounds.max], [left, right]);
  const rowY = (i: number) => 40 + i * 24 + Math.floor(i / 3) * 14, AXIS = rowY(names.length - 1) + 26;
  const set = (i: number, v: number) => { if (v !== values[i]) onChange(values.map((x, k) => k === i ? v : x)); };
  const { svg, start, handlers } = useDrag((i, p) => set(i, clamp(X.invert(p.x), bounds)));
  const barTop = AXIS + 84, H = step >= 4 ? barTop + (step >= 5 ? 92 : 70) : AXIS + 48;
  const scale = Math.max(1, s.msB, s.msW), bar = (v: number) => (right - left) * Math.min(1, v / scale);
  return (
    <div ref={box}>
      <svg ref={svg} className="xw-svg xw-drag" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="group" aria-label="Lernzeit der neun Beispielpersonen in drei Gruppen" {...handlers}>
        <desc id="b10-anova-help">Pfeiltasten ändern die Lernzeit um eine Stunde, Pos1 und Ende springen an die Grenzen.</desc>
        {[0, 1, 2].map(j => {
          const top = rowY(j * 3) - 14, bottom = rowY(j * 3 + 2) + 14, mid = rowY(j * 3 + 1), d = s.gm[j] - s.grand;
          return <g key={`g${j}`}>
            <rect className="b10-group" x={left - 10} y={top} width={right - left + 20} height={bottom - top} />
            <text className="xw-t" x={right + 14} y={mid - 4}>{GRUPPEN[j].key}: x̄ = {num(s.gm[j])}</text>
            {step >= 2 && Math.abs(d) > 1e-9 && <g>
              <rect className={d > 0 ? 'xw-rect-pos' : 'xw-rect-neg'} x={Math.min(X(s.grand), X(s.gm[j]))} y={mid - 5} width={Math.abs(X(s.gm[j]) - X(s.grand))} height={10} />
              <text className="xw-t" x={right + 14} y={mid + 14}>{signed(d)}</text>
            </g>}
            <line className="xw-mean" x1={X(s.gm[j])} x2={X(s.gm[j])} y1={top} y2={bottom} />
          </g>;
        })}
        <line className="xw-axis" strokeWidth={2} x1={X(s.grand)} x2={X(s.grand)} y1={22} y2={AXIS} />
        <text className="xw-t xw-strong" x={X(s.grand)} y={16} textAnchor="middle">alle: x̄ = {num(s.grand)}</text>
        {names.map((n, i) => <g key={`row${i}`}>
          <text className="xw-t" x={8} y={rowY(i) + 4}>{n}</text>
          {step >= 3 && Math.abs(s.dW[i]) > 1e-9 && <line className={i === who ? 'b10-dev sel' : 'b10-dev'} x1={X(s.gmOf[i])} x2={X(values[i])} y1={rowY(i)} y2={rowY(i)} />}
        </g>)}
        <Axis scale={X} ticks={ticks(bounds.min, bounds.max, 2)} at={AXIS} from={left} to={right} labelGap={20} title="Lernzeit in Stunden" />
        {values.map((v, i) => (
          <DragPoint key={`p${i}`} x={X(v)} y={rowY(i)} label={`Person ${names[i]}`} selected={i === who} valueNow={v} bounds={bounds}
            valueText={`${num(v)} Stunden`} describedBy="b10-anova-help"
            onPointerDown={e => { onWho(i); start(i, e); }}
            onKeyDown={e => { const next = keyStep(e, v, bounds); if (next !== null) { e.preventDefault(); onWho(i); set(i, next); } }}>{num(v, 1)}</DragPoint>
        ))}
        {step >= 4 && <g>
          <text className="xw-t xw-strong" x={8} y={barTop - 14}>Geteilt durch die Freiheitsgrade</text>
          <Bar x={left} y={barTop} width={bar(s.msB)} height={18} tone="pos" />
          <text className="xw-t" x={left} y={barTop + 34}>zwischen: MS_B = {num(s.msB)}</text>
          <Bar x={left} y={barTop + 42} width={bar(s.msW)} height={18} tone="plain" />
          <text className="xw-t" x={left + bar(s.msW) + 8} y={barTop + 56}>innerhalb: MS_W = {num(s.msW)}</text>
          {step >= 5 && <text className="xw-t xw-strong" x={left} y={barTop + 84}>{s.F === null ? 'F nicht definiert: innerhalb streut nichts.' : `F = ${num(s.msB)} / ${num(s.msW)} ${eq(s.F)} ${num(s.F)}`}</text>}
        </g>}
      </svg>
    </div>
  );
}

/** Mehrfaktorielle ANOVA: Zellmittel der Lernzeit nach Schulabschluss, je eine Linie ohne und mit Weiterbildung. */
function InteractionPlot() {
  const [box, W] = useWidth();
  const left = 48, right = W - 20, top = 34, bottom = 214, X = (i: number) => left + 18 + i * (right - left - 36) / (ZELLEN.length - 1), Y = linear([4, 12], [bottom, top]);
  const line = (key: 'nein' | 'ja') => ZELLEN.map((z, i) => `${X(i).toFixed(1)},${Y(z[key]).toFixed(1)}`).join(' ');
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={276} viewBox={`0 0 ${W} 276`} role="img"
        aria-label={`Mittlere Lernzeit nach Schulabschluss, ohne Weiterbildung: ${ZELLEN.map(z => `${z.label} ${num(z.nein)}`).join(', ')}; mit Weiterbildung: ${ZELLEN.map(z => `${z.label} ${num(z.ja)}`).join(', ')} Stunden. Die Linien kreuzen sich.`}>
        <Axis scale={Y} ticks={[4, 6, 8, 10, 12]} at={left} from={top} to={bottom} orient="left" labelGap={24} title="Stunden" />
        {[4, 6, 8, 10, 12].map(v => <line key={v} className="xw-guide" x1={left} x2={right} y1={Y(v)} y2={Y(v)} />)}
        <polyline className="b10-line" points={line('nein')} />
        <polyline className="b10-line b10-line-ja" points={line('ja')} />
        {ZELLEN.map((z, i) => <g key={z.label}>
          <circle className="b10-dot" cx={X(i)} cy={Y(z.nein)} r={5} />
          <rect className="b10-square" x={X(i) - 5} y={Y(z.ja) - 5} width={10} height={10} />
          <text className="xw-t" x={X(i)} y={bottom + 22} textAnchor="middle">{z.label}</text>
        </g>)}
        <line className="xw-axis" x1={left} x2={right} y1={bottom} y2={bottom} />
        <circle className="b10-dot" cx={left + 6} cy={252} r={5} /><text className="xw-t" x={left + 16} y={257}>ohne Weiterbildung</text>
        <rect className="b10-square" x={left + Math.min(170, (W - left) / 2) - 5} y={247} width={10} height={10} /><text className="xw-t" x={left + Math.min(170, (W - left) / 2) + 10} y={257}>mit</text>
        <text className="xw-t xw-strong" x={left} y={18}>Mittlere Lernzeit nach Schulabschluss</text>
      </svg>
    </div>
  );
}

/** ANCOVA: je Schulabschluss das rohe Mittel (Kreis) und das bereinigte Mittel (Quadrat) im Wissenstest, mit Pfeil. */
function AdjustedMeans() {
  const [box, W] = useWidth();
  const left = 70, right = W - 24, X = linear([8, 12], [left, right]), rowY = (i: number) => 52 + i * 34, AXIS = rowY(BEREINIGT.length - 1) + 26;
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={AXIS + 82} viewBox={`0 0 ${W} ${AXIS + 82}`} role="img"
        aria-label={`Wissenstest nach Schulabschluss, roh und bereinigt um Lernzeit und Alter: ${BEREINIGT.map(b => `${b.label} ${num(b.roh)} und ${num(b.bereinigt)}`).join(', ')} Aufgaben.`}>
        <text className="xw-t xw-strong" x={8} y={18}>Wissenstest: roh und bereinigt</text>
        {BEREINIGT.map((b, i) => <g key={b.label}>
          <line className="xw-guide" x1={left} x2={right} y1={rowY(i)} y2={rowY(i)} />
          <text className="xw-t" x={8} y={rowY(i) + 4}>{b.label}</text>
          <line className="b10-shift" x1={X(b.roh)} x2={X(b.bereinigt)} y1={rowY(i)} y2={rowY(i)} />
          <circle className="b10-dot" cx={X(b.roh)} cy={rowY(i)} r={6} />
          <rect className="b10-square" x={X(b.bereinigt) - 6} y={rowY(i) - 6} width={12} height={12} />
        </g>)}
        <Axis scale={X} ticks={[8, 9, 10, 11, 12]} at={AXIS} from={left} to={right} labelGap={20} title="gelöste Aufgaben" />
        <circle className="b10-dot" cx={14} cy={AXIS + 68} r={5} /><text className="xw-t" x={24} y={AXIS + 73}>roh</text>
        <rect className="b10-square" x={74} y={AXIS + 63} width={10} height={10} /><text className="xw-t" x={90} y={AXIS + 73}>bereinigt</text>
      </svg>
    </div>
  );
}

/** Gleiche Fehlervarianz: Standardabweichung der Lernzeit je Schulabschluss und die gemeinsame Streuung √MS_W (gestrichelt). */
function GroupSpreads() {
  const [box, W] = useWidth();
  const left = 70, right = W - 60, X = linear([0, 4], [left, right]), rowY = (i: number) => 40 + i * 30, bottom = rowY(STREUUNGEN.sd.length - 1) + 20;
  return (
    <div ref={box}>
      <svg className="xw-svg" width={W} height={bottom + 70} viewBox={`0 0 ${W} ${bottom + 70}`} role="img"
        aria-label={`Standardabweichung der Lernzeit je Schulabschluss: ${STREUUNGEN.labels.map((l, i) => `${l} ${num(STREUUNGEN.sd[i])}`).join(', ')} Stunden; gemeinsame Streuung ${num(STREUUNGEN.pooled)} Stunden.`}>
        <text className="xw-t xw-strong" x={8} y={18}>Streuung s der Lernzeit je Abschluss</text>
        <MarkLine x={X(STREUUNGEN.pooled)} from={28} to={bottom} />
        {STREUUNGEN.sd.map((v, i) => <g key={STREUUNGEN.labels[i]}>
          <text className="xw-t" x={8} y={rowY(i) + 5}>{STREUUNGEN.labels[i]}</text>
          <Bar x={left} y={rowY(i) - 9} width={X(v) - left} height={18} tone="plain" />
          <text className="xw-t b10-label" x={X(v) + 6} y={rowY(i) + 5}>{num(v)}</text>
        </g>)}
        <Axis scale={X} ticks={[0, 1, 2, 3, 4]} at={bottom} from={left} to={right} labelGap={18} title="Stunden" />
        <text className="xw-t" x={8} y={bottom + 62}>gestrichelt: gemeinsame Streuung {num(STREUUNGEN.pooled)}</text>
      </svg>
    </div>
  );
}

export const pictures: Record<string, Picture> = {
  'b10-streuungen': forCard(() => <GroupSpreads />),
  'b10-bereinigt': forCard(() => <AdjustedMeans />),
  'b10-interaktion': forCard(() => <InteractionPlot />),
  'b10-anova': forWorkshop(p => <GroupDots values={p.data} s={p.s} step={p.step} who={p.who} names={p.workshop.names} bounds={p.workshop.bounds} onChange={p.setData} onWho={p.pickWho} />),
  'b10-verbunden': forCard(p => <PairedSpread r={p.value ?? WISSEN.r} />),
  'b10-paare': forWorkshop(p => <PairsPicture data={p.data} s={p.s} step={p.step} who={p.who} names={p.workshop.names} bounds={p.workshop.bounds} onChange={p.setData} onWho={p.pickWho} />),
};
