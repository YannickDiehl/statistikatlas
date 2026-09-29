import test from 'node:test';
import assert from 'node:assert/strict';
import { countCode, factorPosition, initialS02 } from './domain';
import { renderSession, testData } from '../testRender';

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
  assert.match(html, /du leer · Ben 5/);
});

test('settling a difference keeps the row, shows the note and remembers the own number', () => {
  const graded = { ...initialS02(), graded: true, entries: { ...initialS02().entries, '1': { pa02a: '1', pa01: '3', pt03: '6', st01: '-11', pv01: '6', ls01: '8' } } };
  assert.match(renderSession(1, true, undefined, { tasks: { s02: graded } }), /Bogen 1, <code>pa02a<\/code>: du 1 · Ben 5/);
  const taken = { ...graded, entries: { ...graded.entries, '1': { ...graded.entries['1'], pa02a: '5' } }, settled: { '1.pa02a': 'other' as const }, kept: { '1.pa02a': '1' } };
  const html = renderSession(1, true, undefined, { tasks: { s02: taken } });
  assert.match(html, /Bogen 1, <code>pa02a<\/code>: du 1 · Ben 5/);
  assert.match(html, /Ben hat die Richtung der Skala verwechselt/);
  assert.match(html, /aria-label="Bogen 1, pa02a: Zahl von Ben übernehmen"/);
});

test('R code for blocks 2 and 3 stays hidden until all three numbers are right', () => {
  const start = renderSession(1);
  assert.doesNotMatch(start, /filter\(mode == 4\)/);
  assert.doesNotMatch(start, /to_numeric/);
  const sav = testData().sav;
  const numbers = { mfn: String(countCode(sav, 'pa01', -42, 4)), dk: String(countCode(sav, 'st01', -8, 4)), afd: String(factorPosition(sav, 'pv01').get(42)) };
  const right = renderSession(1, true, undefined, { tasks: { s02: { ...initialS02(), numbers, revealed: true } } });
  assert.match(right, /Dein ganzes R-Skript zum Mitnehmen/);
  assert.match(right, /Zellen mit −42/);
});

test('the partner variant shows the row code after grading', () => {
  const html = renderSession(1, true, undefined, { tasks: { s02: { ...initialS02(), mode: 'pair' as const, graded: true } } });
  assert.match(html, /Dein Zeilencode/);
  assert.match(html, /value="S02:/);
});
