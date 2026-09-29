export type Note = { tone: 'ok' | 'hint' | 'warn'; text: string };

export function Feedback({ notes }: { notes: Note[] }) {
  if (!notes.length) return null;
  return <ul className="task-feedback" aria-live="polite">
    {notes.map((n, i) => <li key={i} className={`tone-${n.tone}`}>{n.text}</li>)}
  </ul>;
}
