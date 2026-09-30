import { de } from '../kit/numbers';
import { GROUP_IDS, GROUPS, type GroupId } from './content';
import { predictions, type Model, type Wobble } from './domain';

const INK = '#242822', GHOST = '#9b9a8e';
const ci = (lo: number, hi: number) => `[${de(lo, 2)}; ${de(hi, 2)}]`;

/** Schablone: vorhergesagte Zufriedenheit je Gruppe mit Konfidenzintervall, dazu als Geister, was „Prägung“ und „Ort“ erwarten. */
export function TemplateChart({ model }: { model: Model }) {
  const pr = predictions(model);
  const lo = Math.min(...GROUP_IDS.map(g => pr[g].lower)), hi = Math.max(...GROUP_IDS.map(g => pr[g].upper));
  const pad = 0.1 * (hi - lo || 1), min = lo - pad, max = hi + pad;
  const W = 640, H = 300, left = 56, right = 20, top = 36, bottom = 64;
  const x = (i: number) => left + (i + 0.5) * ((W - left - right) / 4);
  const y = (v: number) => top + (1 - (v - min) / (max - min)) * (H - top - bottom);
  // Prägung: Ost→West wie Ost-Bleibende, West→Ost wie West-Bleibende; Ort: umgekehrt.
  const ghosts: { g: GroupId; kind: 'Prägung' | 'Ort'; v: number }[] = [
    { g: 2, kind: 'Prägung', v: pr[1].fit }, { g: 3, kind: 'Prägung', v: pr[4].fit }, { g: 2, kind: 'Ort', v: pr[4].fit }, { g: 3, kind: 'Ort', v: pr[1].fit },
  ];
  const ticks = [0, 1, 2, 3, 4].map(k => min + (k / 4) * (max - min));
  const summary = `Vorhergesagte Zufriedenheit: ${GROUP_IDS.map(g => `${GROUPS[g].short} ${de(pr[g].fit, 2)} ${ci(pr[g].lower, pr[g].upper)}`).join('; ')}. „Prägung“ erwartet Ost→West bei ${de(pr[1].fit, 2)}, „Ort“ West→Ost bei ${de(pr[1].fit, 2)}.`;
  return <figure className="s09-template">
    <div className="s09-scroll" tabIndex={0} role="region" aria-label="Schablone als Grafik">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={summary}>
        {ticks.map(t => <g key={t}><line x1={left} x2={W - right} y1={y(t)} y2={y(t)} stroke="#e4e2d8" /><text x={left - 8} y={y(t) + 4} textAnchor="end">{de(t, 2)}</text></g>)}
        {ghosts.map((gh, i) => {
          const cx = x(gh.g - 1) + (gh.kind === 'Prägung' ? -22 : 22);
          return <g key={i}>
            <line x1={cx - 12} x2={cx + 12} y1={y(gh.v)} y2={y(gh.v)} stroke={GHOST} strokeWidth={2} strokeDasharray="4 3" />
            <text x={cx} y={y(gh.v) - 6} textAnchor="middle" className="ghost">{gh.kind}</text>
          </g>;
        })}
        {GROUP_IDS.map((g, i) => <g key={g}>
          <line x1={x(i)} x2={x(i)} y1={y(pr[g].lower)} y2={y(pr[g].upper)} stroke={INK} strokeWidth={2} />
          <line x1={x(i) - 6} x2={x(i) + 6} y1={y(pr[g].lower)} y2={y(pr[g].lower)} stroke={INK} strokeWidth={2} />
          <line x1={x(i) - 6} x2={x(i) + 6} y1={y(pr[g].upper)} y2={y(pr[g].upper)} stroke={INK} strokeWidth={2} />
          <circle cx={x(i)} cy={y(pr[g].fit)} r={5} fill={INK} />
          <text x={x(i)} y={H - bottom + 20} textAnchor="middle" className="head">{GROUPS[g].short}</text>
          <text x={x(i)} y={H - bottom + 38} textAnchor="middle">n = {pr[g].n}</text>
        </g>)}
        <text x={left} y={18}>vorhergesagte Zufriedenheit (höher = zufriedener), 95-%-Konfidenzintervall</text>
      </svg>
    </div>
    <figcaption>Gestrichelt: wo die Umgezogenen liegen müssten, wenn „Prägung“ bzw. „Ort“ stimmte. Das Bild ist bei jeder Referenz dasselbe.</figcaption>
  </figure>;
}

/** Koeffiziententabelle mit Konfidenzintervallen und Vorhersagen je Gruppe. */
export function CoefTable({ model }: { model: Model }) {
  const pr = predictions(model), ref = model.spec.ref;
  return <div className="s09-scroll" tabIndex={0} role="region" aria-label="Koeffizienten und Vorhersagen">
    <table className="s09-table">
      <caption>Referenz {GROUPS[ref].short}: Abstand zur Referenz (B) und Vorhersage je Gruppe, jeweils mit 95-%-Konfidenzintervall</caption>
      <thead><tr><th scope="col">Gruppe</th><th scope="col">n</th><th scope="col">B [KI]</th><th scope="col">Vorhersage [KI]</th></tr></thead>
      <tbody>{GROUP_IDS.map(g => <tr key={g} className={g === ref ? 'ref' : ''}>
        <th scope="row">{GROUPS[g].short}</th><td>{model.n[g]}</td>
        <td>{g === ref ? 'Referenz' : `${de(model.b[g], 2)} ${ci(model.ci[g][0], model.ci[g][1])}`}</td>
        <td>{de(pr[g].fit, 2)} {ci(pr[g].lower, pr[g].upper)}</td>
      </tr>)}</tbody>
    </table>
  </div>;
}

/** Tafel der anderen Schnittplätze: dieselbe Frage mit jeder Referenz. */
export function BoardTable({ rows, own }: { rows: { ref: GroupId; model: Model }[]; own: GroupId[] }) {
  const pr = rows[0] ? predictions(rows[0].model) : null;
  return <div className="s09-scroll" tabIndex={0} role="region" aria-label="Tafel der anderen Schnittplätze">
    <table className="s09-table s09-board">
      <caption>Tafel der anderen Schnittplätze: Konstante und B je Referenz – die letzte Spalte ist bei jeder Referenz gleich</caption>
      <thead><tr><th scope="col">Gruppe</th>{rows.map(r => <th key={r.ref} scope="col" className={own.includes(r.ref) ? 'own' : ''}>Referenz {GROUPS[r.ref].short}</th>)}<th scope="col">Vorhersage</th></tr></thead>
      <tbody>
        <tr><th scope="row">Konstante</th>{rows.map(r => <td key={r.ref} className={own.includes(r.ref) ? 'own' : ''}>{de(r.model.c, 2)}</td>)}<td /></tr>
        {GROUP_IDS.map(g => <tr key={g}><th scope="row">{GROUPS[g].short}</th>
          {rows.map(r => <td key={r.ref} className={own.includes(r.ref) ? 'own' : ''}>{g === r.ref ? 'Referenz' : de(r.model.b[g], 2)}</td>)}
          <td>{pr ? de(pr[g].fit, 2) : '–'}</td>
        </tr>)}
      </tbody>
    </table>
  </div>;
}

/** Wackeltest als Liste: voller Wert und Spanne ohne die fünf einflussreichsten Fälle. */
export function WobbleList({ rows, model }: { rows: Wobble[]; model: Model }) {
  return <ul className="s09-wobble">{rows.map(r => <li key={r.g}>
    <strong>{GROUPS[r.g].short}</strong> (Abstand zu {GROUPS[model.spec.ref].short}, n = {model.n[r.g]}): {de(r.full, 2)} – ohne die fünf Fälle, die am stärksten ziehen, {Number.isFinite(r.lo) ? `zwischen ${de(r.lo, 2)} und ${de(r.hi, 2)}` : 'nicht mehr schätzbar'}.
  </li>)}</ul>;
}

