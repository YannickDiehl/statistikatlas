import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
let html = await fs.readFile(path.join(dist, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/g)];
// Nachgeladene Teile (dynamisches import(), etwa die in R erfassten Katalogausgaben) als data:-Adresse einbetten,
// damit sie auch aus der einzelnen HTML-Datei (file://) laden. Die Teile dürfen selbst nichts weiter importieren.
async function inlineChunks(source, dir) {
  let out = source;
  for (const m of source.matchAll(/import\(\s*([`'"])\.\/([\w.-]+\.js)\1\s*\)/g)) {
    const chunk = (await fs.readFile(path.join(dir, m[2]), 'utf8')).replace(/\/\/# sourceMappingURL=.*$/gm, '');
    if (/\bimport\b[\s\S]*?from\s*['"`]/.test(chunk)) throw new Error(`export-offline: ${m[2]} importiert weitere Teile und lässt sich so nicht einbetten.`);
    out = out.split(m[0]).join(`import(${m[1]}data:text/javascript;base64,${Buffer.from(chunk).toString('base64')}${m[1]})`);
  }
  return out;
}
for (const match of scripts) {
  const file = path.join(dist, match[1]);
  const source = await inlineChunks(await fs.readFile(file, 'utf8'), path.dirname(file));
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
