import test from 'node:test';
import assert from 'node:assert/strict';
import { claimById } from '../sandbox/claims';
import { initialWork, type MissionStore } from '../sandbox/state';
import { renderSession } from '../tasks/testRender';
import { conceptById } from './concepts';
import { sessions } from './curriculum';

test('follows the session plan: ten sessions, one task each, Belege es! only in session 4', () => {
  assert.deepEqual(sessions.map(s => s.id), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.deepEqual(sessions.map(s => s.task), ['s01', 's02', 's03', null, null, null, null, null, null, null]);
  assert.deepEqual(sessions.map(s => s.mission), [null, null, null, 'nichtwahl', null, null, null, null, null, null]);
  for (const s of sessions) {
    assert.ok(s.introduced.length > 0, `Sitzung ${s.id}`);
    for (const term of [...s.repetition, ...s.introduced]) if (term.concept) assert.ok(conceptById[term.concept], `${s.id}: ${term.concept}`);
    if (s.mission) assert.ok(claimById[s.mission]);
  }
});

test('lists every session with its status and marks missing map terms', () => {
  const store: MissionStore = { work: { nichtwahl: { ...initialWork(claimById.nichtwahl), step: 4, reached: 4 } } };
  const html = renderSession(3, true, store);
  for (const s of sessions) assert.match(html, new RegExp(`<strong>${s.title}<small>`));
  assert.match(html, /Mission abgeschlossen/);
  assert.match(html, /Aufgabe folgt/);
  assert.match(html, /<span title="Steht im Sitzungsplan, fehlt der Karte noch">AV und UV<\/span>/);
  assert.match(html, /<button>Kreuztabelle<\/button>/);
  assert.match(html, /Andere Datei laden/);
});

test('keeps the Belege es! mission in session 4 and announces upcoming tasks', () => {
  assert.match(renderSession(3), /Wer Politikern misstraut, geht gar nicht mehr wählen\./);
  assert.match(renderSession(3, false), /Lade dafür zuerst deine Datei/);
  const later = renderSession(5);
  assert.match(later, /AUFGABE FOLGT/);
  assert.match(later, /Mittelwerte vergleichen/);
  assert.match(renderSession(99), /Logistische Regression/);
});
