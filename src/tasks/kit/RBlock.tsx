import { Copy, Download } from 'lucide-react';
import { useState } from 'react';
import { downloadText } from '../../domain/mariposa';

export function RBlock({ code, file }: { code: string; file?: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }
  return <div className="task-rblock">
    <pre className="sandbox-code">{code}</pre>
    <div className="sandbox-chips">
      <button onClick={() => void copy()}><Copy size={14} aria-hidden="true" /> {copied ? 'Kopiert' : 'Kopieren'}</button>
      {file && <button onClick={() => downloadText(file, code)}><Download size={14} aria-hidden="true" /> {file}</button>}
    </div>
  </div>;
}
