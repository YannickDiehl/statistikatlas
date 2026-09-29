import { VERDICTS, type Verdict } from '../questions';
import type { ClaimWork } from '../state';

export function VerdictStep({ work, evidence, onChange }: {
  work: ClaimWork;
  evidence: string;
  onChange: (patch: Partial<ClaimWork>) => void;
}) {
  return <section className="sandbox-card">
    <h3>Dein Urteil über die Behauptung</h3>
    <div className="sandbox-chips" role="radiogroup" aria-label="Urteil">
      {VERDICTS.map((v, i) => <button key={v} role="radio" aria-checked={work.verdict === i} onClick={() => onChange({ verdict: i as Verdict })}>{v}</button>)}
    </div>
    <label className="sandbox-label" htmlFor="sandbox-reason">Begründung für die Faktencheck-Karte</label>
    <textarea id="sandbox-reason" value={work.reason} placeholder="Die Behauptung … denn …" onChange={e => onChange({ reason: e.target.value })} />
    <p className="sandbox-note">Dein Beleg: {evidence}</p>
  </section>;
}
