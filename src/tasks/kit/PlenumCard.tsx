import { Download } from 'lucide-react';
import { downloadText } from '../../domain/mariposa';

export const plenumMarkdown = (title: string, lines: [string, string][]) =>
  `# ${title}\n\n${lines.map(([k, v]) => `- **${k}:** ${v || '–'}`).join('\n')}\n`;

/** Das vergleichbare Ergebnis, das im Plenum vorgelesen oder an die Tafel geschrieben wird. */
export function PlenumCard({ title, lines, file }: { title: string; lines: [string, string][]; file: string }) {
  return <section className="task-plenum" aria-label="Ergebnis für das Plenum">
    <span className="learning-eyebrow">FÜR DAS PLENUM</span>
    <h4>{title}</h4>
    <dl>{lines.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v || '–'}</dd></div>)}</dl>
    <button onClick={() => downloadText(file, plenumMarkdown(title, lines), 'text/markdown;charset=utf-8')}>
      <Download size={14} aria-hidden="true" /> Karte als Markdown
    </button>
  </section>;
}
