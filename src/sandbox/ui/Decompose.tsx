import type { Claim } from '../claims';
import type { ClaimWork } from '../state';

export function Decompose({ claim, work, onChange }: {
  claim: Claim;
  work: ClaimWork;
  onChange: (patch: Partial<ClaimWork>) => void;
}) {
  return <section className="sandbox-card">
    <h3>Bevor du rechnest: Was genau wird hier behauptet?</h3>
    <p className="sandbox-note">Fülle die Lücken in eigenen Worten. Deine Antworten tauchen später in den Gegenfragen und auf deiner Faktencheck-Karte wieder auf.</p>
    {claim.gaps.map(([question, hint], i) => <label key={question} className="sandbox-gap">
      <span>{question}</span>
      <input type="text" value={work.gaps[i]} placeholder={hint}
        onChange={e => onChange({ gaps: work.gaps.map((g, k) => k === i ? e.target.value : g) })} />
    </label>)}
  </section>;
}
