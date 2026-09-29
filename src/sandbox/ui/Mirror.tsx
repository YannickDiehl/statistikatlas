import { Download } from 'lucide-react';
import { downloadText } from '../../domain/mariposa';
import type { Claim } from '../claims';
import { num1, pct } from '../format';
import type { Mirror } from '../multiverse';
import { VERDICTS } from '../questions';
import { factCardMarkdown, type ClaimWork } from '../state';

const WIDTH = 640, LEFT = 60, RIGHT = 20, ROW = 38, TOP = 34;

export function MirrorStep({ claim, work, mirror, ownVariable, evidence, script }: {
  claim: Claim;
  work: ClaimWork;
  mirror: Mirror;
  ownVariable: string;
  evidence: string;
  script: string;
}) {
  const rows = claim.items.map(i => i.variable);
  if (!rows.includes(ownVariable)) rows.push(ownVariable);
  const diffs = mirror.paths.map(p => p.result.difference);
  const lo = Math.floor(Math.min(...diffs, mirror.own.difference, 0) - 2);
  const hi = Math.ceil(Math.max(...diffs, mirror.own.difference, 0) + 2);
  const x = (v: number) => LEFT + (v - lo) / (hi - lo) * (WIDTH - LEFT - RIGHT);
  const y = (variable: string) => TOP + rows.indexOf(variable) * ROW + ROW / 2;
  const height = TOP + rows.length * ROW + 26;
  const ticks = Array.from({ length: Math.floor(hi / 5) - Math.ceil(lo / 5) + 1 }, (_, i) => (Math.ceil(lo / 5) + i) * 5);
  const total = mirror.paths.length;
  const maxWeight = Math.max(...mirror.weights.map(w => w.spread), 0.1);
  const summary = `Abstand zwischen den Gruppen in ${total} Auswertungswegen, von ${num1(Math.min(...diffs))} bis ${num1(Math.max(...diffs))} Prozentpunkten. Dein Weg: ${num1(mirror.own.difference)} Punkte.`;

  return <>
    <section className="sandbox-card">
      <h3>Robustheitsspiegel: {total} vertretbare Auswertungswege</h3>
      <svg className="sandbox-mirror" viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label={summary}>
        <line x1={x(0)} x2={x(0)} y1={TOP - 12} y2={height - 26} className="zero" />
        <text x={x(0)} y={TOP - 18} textAnchor="middle">kein Unterschied</text>
        {rows.map(r => <text key={r} x={0} y={y(r) + 4}>{r}</text>)}
        {mirror.paths.map((p, i) => <circle key={i} cx={x(p.result.difference)} cy={y(p.choice.item) + ((i % 5) - 2) * 4} r={4} className="path">
          <title>{p.levels.join(' · ')}: {num1(p.result.difference)} Punkte</title>
        </circle>)}
        <circle cx={x(mirror.own.difference)} cy={y(ownVariable)} r={9} className="own" />
        <text x={x(mirror.own.difference)} y={y(ownVariable) - 13} textAnchor="middle" className="own-label">dein Weg</text>
        {ticks.map(t => <text key={t} x={x(t)} y={height - 8} textAnchor="middle">{t}</text>)}
      </svg>
      <p className="sandbox-note">Jeder Punkt ist ein Weg aus {claim.dimensions.map(d => d.label).join(' × ')}. Werte: Abstand in Prozentpunkten.{mirror.ownInGrid ? '' : ' Dein Weg liegt außerhalb der vorbereiteten Wege.'}</p>
    </section>

    <div className="sandbox-metrics">
      <div><span>Gleiche Richtung wie dein Ergebnis</span><strong>{mirror.sameDirection} von {total}</strong><small>davon {mirror.atLeastFive} mit mindestens 5 Punkten Abstand</small></div>
      <div><span>{claim.core.label}</span><strong>{mirror.core} von {total}</strong><small>Anteil in der Zielgruppe: {pct(mirror.targetRange[0])} bis {pct(mirror.targetRange[1])}</small></div>
    </div>

    <section className="sandbox-card">
      <h3>Welche Entscheidung wiegt am schwersten?</h3>
      {mirror.weights.map(w => <div key={w.id} className="sandbox-weight">
        <span>{w.label}</span>
        <span className="bar"><span style={{ width: `${w.spread / maxWeight * 100}%` }} /></span>
        <span>{num1(w.spread)} Pkt.</span>
      </div>)}
    </section>

    <section className="sandbox-card sandbox-factcard" aria-label="Deine Faktencheck-Karte">
      <small>Deine Faktencheck-Karte · {claim.source}</small>
      <q>{claim.quote}</q>
      <span className="sandbox-verdict">{work.verdict === null ? '–' : VERDICTS[work.verdict]}</span>
      <p>{work.reason}</p>
      <p className="sandbox-note">Beleg: {evidence} · Richtung trägt in {mirror.sameDirection} von {total} Wegen · {Object.values(work.answers).filter(a => a.trim()).length} Gegenfragen beantwortet</p>
      <div className="sandbox-chips">
        <button onClick={() => downloadText(`faktencheck-${claim.id}.md`, factCardMarkdown(claim, work, evidence, mirror), 'text/markdown;charset=utf-8')}><Download size={15} aria-hidden="true" /> Karte als Markdown</button>
        <button onClick={() => downloadText(`faktencheck-${claim.id}.R`, script)}><Download size={15} aria-hidden="true" /> R-Skript</button>
      </div>
    </section>
  </>;
}
