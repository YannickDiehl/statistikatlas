import { linkinv, logitOf, type LogitFit } from '../kit/logit';
import { de } from '../kit/numbers';
import { PERSONS, type PersonId } from './content';
import type { Profile } from './domain';

const W = 560, H = 300, L = 52, R = 150, T = 16, B = 46;

/** S-Kurve der vorhergesagten Wahrscheinlichkeit über das Pflichtgefühl – je eine Kurve für das Interesse der beiden Ratsmitglieder,
 *  mit dem Schritt „eine Stufe mehr“ an ihrer Stelle. */
export function SCurve({ fit, profiles, range }: { fit: LogitFit; profiles: Record<PersonId, Profile>; range: [number, number] }) {
  const [lo, hi] = range;
  const x = (v: number) => L + ((v - lo) / (hi - lo || 1)) * (W - L - R);
  const y = (p: number) => T + (1 - p) * (H - T - B);
  const ids: PersonId[] = ['jana', 'wiegand'];
  const style: Record<PersonId, { stroke: string; dash?: string }> = { jana: { stroke: '#242822' }, wiegand: { stroke: '#7d8377', dash: '6 4' } };
  const curve = (interesse: number) => Array.from({ length: 61 }, (_, i) => lo + (i / 60) * (hi - lo))
    .map((v, i) => `${i ? 'L' : 'M'}${x(v).toFixed(1)} ${y(linkinv(logitOf(fit, [v, interesse]))).toFixed(1)}`).join(' ');
  const step = (id: PersonId) => {
    const [pf, int] = profiles[id];
    const a = linkinv(logitOf(fit, [pf, int])), b = linkinv(logitOf(fit, [pf + 1, int]));
    return { pf, a, b };
  };
  const steps = Object.fromEntries(ids.map(id => [id, step(id)])) as Record<PersonId, ReturnType<typeof step>>;
  const label = (id: PersonId) => `${PERSONS[id].name}: ${de(100 * steps[id].a, 1)} % → ${de(100 * steps[id].b, 1)} % (+${de(100 * (steps[id].b - steps[id].a), 1)} Prozentpunkte)`;
  const summary = `S-Kurve der Wahrscheinlichkeit zu wählen über das Pflichtgefühl. ${ids.map(label).join('; ')}.`;
  const ticks = Array.from({ length: Math.round(hi - lo) + 1 }, (_, i) => lo + i);
  return <figure className="s10-curve">
    <div className="s10-scroll" tabIndex={0} role="region" aria-label="S-Kurve">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={summary}>
        {[0, 0.25, 0.5, 0.75, 1].map(p => <g key={p}>
          <line x1={L} x2={W - R} y1={y(p)} y2={y(p)} className="grid" />
          <text x={L - 8} y={y(p) + 4} textAnchor="end">{de(100 * p, 0)} %</text>
        </g>)}
        {ticks.map(t => <text key={t} x={x(t)} y={H - B + 18} textAnchor="middle">{de(t, 0)}</text>)}
        <text x={(L + W - R) / 2} y={H - 8} textAnchor="middle">Pflichtgefühl (umgepolt: höher = mehr Zustimmung)</text>
        {ids.map(id => {
          const s = steps[id], st = style[id];
          return <g key={id}>
            <path d={curve(profiles[id][1])} fill="none" stroke={st.stroke} strokeWidth={2} strokeDasharray={st.dash} />
            <path d={`M${x(s.pf)} ${y(s.a)} H${x(s.pf + 1)} V${y(s.b)}`} fill="none" stroke={st.stroke} strokeWidth={3} />
            <circle cx={x(s.pf)} cy={y(s.a)} r={5} fill="#fff" stroke={st.stroke} strokeWidth={2} />
            <circle cx={x(s.pf + 1)} cy={y(s.b)} r={5} fill={st.stroke} />
            <text x={x(s.pf + 1) + 8} y={(y(s.a) + y(s.b)) / 2 + 4} className="step">+{de(100 * (s.b - s.a), 1)} Pp.</text>
            <text x={W - R + 10} y={y(linkinv(logitOf(fit, [hi, profiles[id][1]]))) + (id === 'jana' ? 16 : -6)} className="name">{PERSONS[id].name}</text>
          </g>;
        })}
      </svg>
    </div>
    <figcaption>Vorhergesagte Wahrscheinlichkeit zu wählen – durchgezogen mit Janas Interesse, gestrichelt mit dem von Herrn Wiegand. Derselbe Schritt nach rechts bringt unten auf der Kurve viel, oben wenig. {ids.map(label).join('; ')}.</figcaption>
  </figure>;
}
