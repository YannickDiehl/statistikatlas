import { Feedback } from '../kit/Feedback';
import { HintLadder } from '../kit/HintLadder';
import type { WorkMode } from '../kit/PartnerToggle';
import { hints, PLACEHOLDERS, ROLES, TEXTS } from './content';
import { checkAmount, checkRelease, chooseRelease, releaseState, rScriptFor, type Computed, type S06State } from './domain';
import { VersionChips } from './Parts';

/** Station 4: Fassung, Quote mit Spanne, Betragseffekt, der Nicht-Satz und zwei Unterschriften. */
export function Release({ c, state, onChange, onConcept, done, roleLabel }: {
  c: Computed; state: S06State; onChange: (s: S06State) => void; onConcept: (id: string) => void; done: { meansDone: boolean; tukeyDone: boolean }; roleLabel: (r: keyof typeof ROLES, mode: WorkMode) => string;
}) {
  const r = state.release;
  const setRelease = (patch: Partial<S06State['release']>) => onChange({ ...state, release: { ...r, ...patch } });
  const setSign = (patch: Partial<S06State['sign']>) => onChange({ ...state, sign: { ...state.sign, ...patch } });
  const release = releaseState(state);
  return <section className="task-step">
    <h3>Station 4 · Freigabe <span className="s06-role">beide Rollen</span></h3>
    <p>Morgen um 9 Uhr wird programmiert. Welche Fassung, welche Online-Quote mit welcher Spanne – und welchen Satz behauptet ihr ausdrücklich nicht?</p>
    <VersionChips label="Fassung für die Freigabe" value={r.version} onChange={v => onChange(chooseRelease(state, v))} />
    {r.version && <p className="sandbox-note">Wechselst du die Fassung, beginnen Quote, Spanne und Unterschriften von vorn.</p>}
    {r.version && <>
      <div className="task-grid">
        <label>Versprochene Online-Quote (%)<input type="text" inputMode="decimal" maxLength={12} value={r.rate} onChange={e => setRelease({ rate: e.target.value })} /></label>
        <label>Spanne von (%)<input type="text" inputMode="decimal" maxLength={12} value={r.low} onChange={e => setRelease({ low: e.target.value })} /></label>
        <label>bis (%)<input type="text" inputMode="decimal" maxLength={12} value={r.high} onChange={e => setRelease({ high: e.target.value })} /></label>
        <label>10 € bringen … Prozentpunkte<input type="text" inputMode="decimal" maxLength={12} value={r.amount} onChange={e => setRelease({ amount: e.target.value })} /></label>
      </div>
      <Feedback notes={[...checkRelease(c, state, done), ...checkAmount(c, r.amount).notes]} />
      <label className="sandbox-label" htmlFor="s06-not">Was wir nicht behaupten (ein Satz)</label>
      <textarea id="s06-not" maxLength={600} value={r.notClaimed} placeholder={PLACEHOLDERS.notClaimed} onChange={e => setRelease({ notClaimed: e.target.value })} />
      <details className="s06-details"><summary>Profi-Frage zum Betrag</summary>
        <p>{TEXTS.profi}</p>
        <p className="sandbox-note">{c.splitMatch ? 'In deiner Datei deckt sich der Betrag vollständig mit splt23_1.' : 'In deiner Datei deckt sich der Betrag nicht vollständig mit splt23_1.'}</p>
      </details>
      <HintLadder key={`s4-${r.version}`} hint={{ ...hints.s4, solution: rScriptFor(state) }} onConcept={onConcept} file="letzte-frage.R" />
      <div className="s06-sign">
        <div>
          <label className="sandbox-label" htmlFor="s06-sign-panel">Unterschrift {roleLabel('panel', state.mode)} (ein Satz)</label>
          <textarea id="s06-sign-panel" maxLength={400} value={state.sign.panel} placeholder={PLACEHOLDERS.signPanel} onChange={e => setSign({ panel: e.target.value })} />
        </div>
        <div>
          <label className="sandbox-label" htmlFor="s06-sign-qs">Unterschrift {roleLabel('qs', state.mode)} (ein Satz)</label>
          <textarea id="s06-sign-qs" maxLength={400} value={state.sign.qs} placeholder={PLACEHOLDERS.signQs} onChange={e => setSign({ qs: e.target.value })} />
          <label className="s04-check"><input type="checkbox" checked={state.sign.veto} onChange={e => setSign({ veto: e.target.checked })} /> Veto: So geben wir nicht frei</label>
        </div>
      </div>
      <p className={`s06-state s06-state-${release}`} aria-live="polite">Freigabe: {release === 'Veto' ? 'Veto der Qualitätssicherung – die Fassung wird so nicht programmiert.' : release === 'freigegeben' ? 'freigegeben mit zwei Unterschriften.' : 'noch offen – es fehlen Unterschriften.'}</p>
    </>}
  </section>;
}
