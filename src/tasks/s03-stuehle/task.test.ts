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

test('the chair row and the full script wait until the student has committed', () => {
  const start = renderSession(2);
  assert.doesNotMatch(start, /stehen rechts vom Durchschnitt/);
  assert.doesNotMatch(start, /vollständiges R-Skript/);
  const sign = { value: '40', measure: 'median' as const, selection: 'gefragt' as const, right: '' };
  const noCount = renderSession(2, true, undefined, { tasks: { s03: { ...initialS03(), sign } } });
  assert.doesNotMatch(noCount, /100 Stühle sortiert nach Stunden/);
  const bare = { ...initialS03(), built: true, sign: { ...sign, right: 'x' } };
  assert.doesNotMatch(renderSession(2, true, undefined, { tasks: { s03: bare } }), /vollständiges R-Skript/);
  const done = { ...bare, seats: { '1': '100' }, hallText: 'Ein Stuhl ist ein Prozent.', sign: { ...sign, right: '66' } };
  assert.match(renderSession(2, true, undefined, { tasks: { s03: done } }), /vollständiges R-Skript/);
});

test('a hall with too many chairs grows an extra row', () => {
  const html = renderSession(2, true, undefined, { tasks: { s03: { ...initialS03(), built: true, seats: { '1': '101' } } } });
  assert.match(html, /viewBox="0 0 300 330"/);
  assert.match(html, /Saal mit 101 Stühlen/);
});
