import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
let html = await fs.readFile(path.join(dist, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/g)];
for (const match of scripts) {
  const source = await fs.readFile(path.join(dist, match[1]), 'utf8');
  const safe = source.replace(/\/\/# sourceMappingURL=.*$/gm, '').replace(/<\/script/gi, '<\\/script');
  html = html.replace(match[0], () => `<script type="module">${safe}</script>`);
}
const sheets = [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)];
for (const match of sheets) {
  const css = await fs.readFile(path.join(dist, match[1]), 'utf8');
  html = html.replace(match[0], () => `<style>${css}</style>`);
}
await fs.writeFile(path.join(root, 'Statistikatlas-Prototyp.html'), html);
await fs.writeFile(path.join(dist, 'Statistikatlas-offline.html'), html);
console.log(`Offline-Prototyp erstellt: ${Math.round(Buffer.byteLength(html)/1024)} KB, alle Skripte und Stile eingebettet.`);
