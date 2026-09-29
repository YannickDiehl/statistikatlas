import test from 'node:test';
import assert from 'node:assert/strict';
import { initialS02 } from './domain';
import { renderSession } from '../testRender';

test('session 2 shows three paper sheets, the entry grid and the release step', () => {
  const html = renderSession(1);
  assert.match(html, /Erster Tag in der Datenerfassung/);
  assert.match(html, /Fragebogen · Version A · Bogen 1/);
  assert.match(html, /Fragebogen · Version B · Bogen 2/);
  assert.match(html, /Kreuze bei „5“ und „6“/);
  assert.match(html, /Randnotiz/);
  assert.match(html, /aria-label="Bogen 2, pa01"/);
  assert.match(html, /Erfassung abschließen/);
  assert.doesNotMatch(html, /3 · Doppelerfassung/);
  assert.match(html, /FÜR DAS PLENUM/);
  assert.doesNotMatch(html, /Dein ganzes R-Skript/);
});

test('after grading, open cells ask for a rule and Ben is compared', () => {
  const state = { ...initialS02(), graded: true, entries: { ...initialS02().entries, '2': { pa02a: '4', pa01: '5', pt03: '-11', st01: '3', pv01: '-8', ls01: '8' } } };
  const html = renderSession(1, true, undefined, { tasks: { s02: state } });
  assert.match(html, /Hier musstest du entscheiden/);
  assert.match(html, /Bogen 2, pa01 \(du hast 5 eingetragen\)/);
  assert.match(html, /3 · Doppelerfassung/);
  assert.match(html, /Ben/);
});
