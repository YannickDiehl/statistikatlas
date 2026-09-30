import test from 'node:test';
import assert from 'node:assert/strict';
import { initialS04 } from '../tasks/s04-nenner-check/domain';
import { renderSession } from '../tasks/testRender';
import { conceptById } from './concepts';
import { sessions } from './curriculum';

test('follows the session plan: ten sessions, one task each', () => {
  assert.deepEqual(sessions.map(s => s.id), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.deepEqual(sessions.map(s => s.task), ['s01', 's02', 's03', 's04', 's05', 's06', 's07', null, null, null]);
  for (const s of sessions) {
    assert.ok(s.introduced.length > 0, `Sitzung ${s.id}`);
    for (const term of [...s.repetition, ...s.introduced]) if (term.concept) assert.ok(conceptById[term.concept], `${s.id}: ${term.concept}`);
  }
});

test('lists every session with its status and marks missing map terms', () => {
  const html = renderSession(3, true, { tasks: { s04: { ...initialS04(), guess: 'Nichtwähler' } } });
  for (const s of sessions) assert.match(html, new RegExp(`<strong>${s.title}<small>`));
  assert.match(html, /Kreuztabellen<small>Aufgabe läuft/);
  assert.match(html, /Aufgabe folgt/);
  assert.match(html, /<span title="Steht im Sitzungsplan, fehlt der Karte noch">AV und UV<\/span>/);
  assert.match(html, /<button>Kreuztabelle<\/button>/);
  assert.match(html, /Andere Datei laden/);
});

test('shows the Nenner-Check in session 4 and announces upcoming tasks', () => {
  assert.match(renderSession(3), /Nenner-Check/);
  assert.match(renderSession(3, false), /87 Prozent der Nichtwähler/);
  const later = renderSession(7);
  assert.match(later, /AUFGABE FOLGT/);
  assert.match(later, /Index und Skala/);
  assert.match(renderSession(99), /Logistische Regression/);
});
