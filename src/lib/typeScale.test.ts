import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';

// Schriftskala: nichts im UI unter 13 px (Stand 1. Oktober 2026, „+2 px, mindestens 13 px“).
const MIN = 13;
const dir = new URL('../', import.meta.url);
const sheets = readdirSync(dir).filter(f => f.endsWith('.css'));

/** Jede px-Schriftgröße aus font-size und der font-Kurzschreibweise (dort steht die Größe vor der Schriftart). */
function sizes(css: string) {
  const found: { size: number; rule: string }[] = [];
  for (const m of css.matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
    const [, selector, body] = m;
    for (const d of body.matchAll(/font-size:\s*(\d*\.?\d+)px/g)) found.push({ size: +d[1], rule: selector.trim() });
    for (const d of body.matchAll(/(?:^|;)\s*font:([^;]*)/g)) {
      const size = d[1].match(/(\d*\.?\d+)px/);
      if (size) found.push({ size: +size[1], rule: selector.trim() });
    }
  }
  return found;
}

test('Die Stylesheets setzen keine Schrift kleiner als 13 px', () => {
  assert.ok(sheets.length >= 5, sheets.join(', '));
  for (const file of sheets) {
    const css = readFileSync(new URL(file, dir), 'utf8');
    const small = sizes(css).filter(s => s.size < MIN);
    assert.deepEqual(small, [], `${file}: ${small.map(s => `${s.rule} ${s.size}px`).join('; ')}`);
  }
});

test('Die Prüfung erkennt kleine Schrift in beiden Schreibweisen', () => {
  assert.deepEqual(sizes('.a{font-size:11px}.b{color:red;font:600 12px/1.4 sans-serif}.c{font:16px/20px serif}').map(s => s.size), [11, 12, 16]);
});
