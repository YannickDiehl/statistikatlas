export type WorkMode = 'solo' | 'pair';
export const WORK_MODES = ['solo', 'pair'] as const;

export function PartnerToggle({ mode, onChange, solo, pair }: { mode: WorkMode; onChange: (mode: WorkMode) => void; solo: string; pair: string }) {
  return <div className="task-partner">
    <div className="sandbox-chips" role="group" aria-label="Arbeitsform">
      <button aria-pressed={mode === 'solo'} onClick={() => onChange('solo')}>Allein</button>
      <button aria-pressed={mode === 'pair'} onClick={() => onChange('pair')}>Zu zweit</button>
    </div>
    <p className="sandbox-note">{mode === 'solo' ? solo : pair}</p>
  </div>;
}
