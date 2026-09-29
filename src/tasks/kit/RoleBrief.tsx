import type { ReactNode } from 'react';

/** Der Rollenauftrag, so wie Studierende ihn lesen. */
export function RoleBrief({ role, title, children }: { role: string; title: string; children: ReactNode }) {
  return <section className="task-brief" aria-label="Auftrag">
    <span className="learning-eyebrow">AUFGABE · {role.toLocaleUpperCase('de')}</span>
    <h3>{title}</h3>
    <div className="task-brief-text">{children}</div>
  </section>;
}
