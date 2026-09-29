import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LearningPath } from '../components/LearningPath';
import { claimById } from '../sandbox/claims';
import { initialWork, type MissionStore } from '../sandbox/state';
import { fixtureSav } from '../sandbox/testData';
import { conceptById } from './concepts';
import { sessions } from './curriculum';

const data = { sav: fixtureSav(), fileName: 'ZA8831_v1-3-0.sav', version: 'v1.3.0' };
const render = (sessionIndex: number, withData = true, store?: MissionStore) => renderToStaticMarkup(createElement(LearningPath, {
  onConcept: () => {}, sessionIndex, onSessionChange: () => {}, initialData: withData ? data : null, initialStore: store,
}));

test('follows the session plan with ten sessions and three missions', () => {
  assert.deepEqual(sessions.map(s => s.id), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.deepEqual(sessions.map(s => s.mission), ['setup', null, 'jugend', 'nichtwahl', 'osten', null, null, null, null, null]);
  for (const s of sessions) {
    assert.ok(s.introduced.length > 0, `Sitzung ${s.id}`);
    for (const term of [...s.repetition, ...s.introduced]) if (term.concept) assert.ok(conceptById[term.concept], `${s.id}: ${term.concept}`);
    if (s.mission && s.mission !== 'setup') assert.ok(claimById[s.mission]);
  }
});

test('lists every session with its status and marks missing map terms', () => {
  const store: MissionStore = { work: { jugend: { ...initialWork(claimById.jugend), step: 4, reached: 4 } } };
  const html = render(3, true, store);
  for (const s of sessions) assert.match(html, new RegExp(`<strong>${s.title}<small>`));
  assert.match(html, /Mission abgeschlossen/);
  assert.match(html, /Mission offen/);
  assert.match(html, /Mission folgt/);
  assert.match(html, /<span title="Steht im Sitzungsplan, fehlt der Karte noch">AV und UV<\/span>/);
  assert.match(html, /<button>Kreuztabelle<\/button>/);
});

test('embeds the mission of a session once the file is loaded', () => {
  assert.match(render(3), /Wer Politikern misstraut, geht gar nicht mehr wählen\./);
  assert.match(render(3), /Bevor du rechnest/);
  const withoutData = render(3, false);
  assert.match(withoutData, /Lade dafür zuerst deine Datei/);
  assert.match(withoutData, /ALLBUS-Datei hierher ziehen oder auswählen/);
});

test('shows setup and upcoming sessions without a mission', () => {
  const setup = render(0, false);
  assert.match(setup, /EINRICHTUNG/);
  assert.match(setup, /read_spss\(file\.choose\(\)\)/);
  assert.match(render(0), /Andere Datei laden/);
  const later = render(5);
  assert.match(later, /MISSION FOLGT/);
  assert.match(later, /Mittelwerte vergleichen/);
  assert.match(render(99), /Logistische Regression/);
});
