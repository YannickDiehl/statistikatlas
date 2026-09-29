import test from 'node:test';
import assert from 'node:assert/strict';
import { renderSession } from '../testRender';
import { taskRegistry } from '../registry';

test('session 1 shows the task: file first, then handshake, four ideas and the plenum card', () => {
  assert.equal(taskRegistry.s01?.title, 'Schon gefragt?');
  const empty = renderSession(0, false);
  assert.match(empty, /AUFGABE · REFERENT:IN IM ABGEORDNETENBÜRO/);
  assert.match(empty, /ALLBUS-Datei hierher ziehen/);
  const html = renderSession(0);
  assert.match(html, /Willkommen im Büro/);
  assert.match(html, /1 · Handschlag mit R/);
  assert.match(html, /read_spss\(file\.choose\(\)\)/);
  for (const idea of ['Horoskopen', 'Angst vor Geflüchteten', 'Politik noch', 'einsam']) assert.match(html, new RegExp(idea));
  assert.match(html, /Notfallkonsole/);
  assert.match(html, /FÜR DAS PLENUM/);
  assert.match(html, /Muss das Büro beauftragen/);
  assert.match(html, /Aufgabe offen/);
});

test('the rail shows running and finished status for session 1', () => {
  const running = renderSession(0, true, undefined, { tasks: { s01: { cases: '5246' } } });
  assert.match(running, /Einstieg<small>Aufgabe läuft<\/small>/);
  const stamp = (decision: 'take' | 'ask', extra: object) => ({ decision, variable: '', lowest: '', asked: '', searches: [], note: '', ...extra });
  const done = renderSession(0, true, undefined, { tasks: { s01: { stamps: {
    horoskop: stamp('take', { variable: 'rh08b' }), gefluechtete: stamp('ask', { searches: ['angst', 'fluecht'] }),
    politik: stamp('take', { variable: 'pt03' }), einsamkeit: stamp('ask', { searches: ['einsam', 'allein'] }),
  } } } });
  assert.match(done, /Einstieg<small>Aufgabe abgeschlossen<\/small><\/strong><svg/);
  assert.match(done, /class="current done"/);
});
