import test from 'node:test';
import assert from 'node:assert/strict';
import { renderSession } from '../testRender';
import { initialS03 } from './domain';

test('session 3 shows both halls, the chair rule and the plenum card', () => {
  const html = renderSession(2);
  assert.match(html, /Deutschland in 100 Stühlen/);
  assert.match(html, /Saal 1 · Wer fehlt in der Tabelle\?/);
  assert.match(html, /weiß nicht: kein Stuhl/);
  assert.match(html, /Saal bauen/);
  assert.match(html, /Saal 2 · Die Stuhlreihe/);
  assert.match(html, /FÜR DAS PLENUM/);
  assert.doesNotMatch(html, /Saaltext/);
});

test('a built hall shows the diagnosis, the grid and the hall text field', () => {
  const state = { ...initialS03(), built: true, seats: { '1': '100' }, sign: { value: '40', measure: 'median' as const, selection: 'gefragt' as const, right: '50' } };
  const html = renderSession(2, true, undefined, { tasks: { s03: state } });
  assert.match(html, /Saal mit 100 Stühlen/);
  assert.match(html, /Saaltext/);
  assert.match(html, /100 Stühle sortiert nach Stunden/);
});
