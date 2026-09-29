// Schreibt alle Spiegel-Wege mit erzeugtem mariposa-Code und Sandbox-Ergebnis als JSON.
// Aufruf: node --import tsx scripts/export-sandbox-grid.ts <datei.sav> <ausgabe.json>
import { readFileSync, writeFileSync } from 'node:fs';
import { analyse } from '../src/sandbox/analysis';
import { claims, itemOf } from '../src/sandbox/claims';
import { enumeratePaths } from '../src/sandbox/multiverse';
import { rParts } from '../src/sandbox/rcode';
import { readSav } from '../src/sandbox/readSav';

const [file, out] = process.argv.slice(2);
if (!file || !out) throw new Error('Aufruf: export-sandbox-grid.ts <datei.sav> <ausgabe.json>');
const bytes = readFileSync(file);
const sav = readSav(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
const grid = claims.flatMap(claim => enumeratePaths(claim).map(p => {
  const item = itemOf(claim, p.choice.item);
  const result = analyse(sav, claim.analysis(p.choice, item));
  return { claim: claim.id, levels: p.levels, ...rParts(claim, p.choice, item, 'row', file), target: 100 * result.target, comparison: 100 * result.comparison };
}));
writeFileSync(out, JSON.stringify(grid));
console.log(`${grid.length} Wege nach ${out} geschrieben.`);
