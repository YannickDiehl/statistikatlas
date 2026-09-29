import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveItem } from './allbus';
import { analyse } from './analysis';
import { claims, itemOf, jugend, osten } from './claims';
import { buildMirror, enumeratePaths } from './multiverse';
import { fixtureSav } from './testData';

test('enumerates every combination of levels exactly once', () => {
  assert.deepEqual(claims.map(c => enumeratePaths(c).length), [72, 24, 24]);
  const paths = enumeratePaths(jugend);
  assert.equal(new Set(paths.map(p => p.levels.join('|'))).size, 72);
  assert.deepEqual(paths[0].levels, ['pa02a', 'bis 24', 'allen Älteren', 'streng', 'gewichtet']);
  assert.deepEqual(paths[0].choice.positive, [1, 2]);
  assert.deepEqual(paths[1].choice.weighted, false);
});

test('summarises the mirror and places the own path', () => {
  const sav = fixtureSav();
  const m = buildMirror(sav, osten, osten.defaults, itemOf(osten, 'pt03'));
  assert.equal(m.paths.length, 24);
  assert.equal(m.ownInGrid, true);
  assert.ok(m.sameDirection >= m.atLeastFive);
  assert.ok(m.targetRange[0] <= m.own.target && m.own.target <= m.targetRange[1]);
  assert.deepEqual(m.weights.map(w => w.spread), [...m.weights.map(w => w.spread)].sort((a, b) => b - a));
  assert.deepEqual(new Set(m.weights.map(w => w.id)), new Set(['item', 'threshold', 'midpoint', 'weighted']));
});

test('marks paths outside the prepared grid', () => {
  const sav = fixtureSav();
  const odd = { ...jugend.defaults, cut: 31 };
  assert.equal(buildMirror(sav, jugend, odd, itemOf(jugend, 'pa02a')).ownInGrid, false);
  const custom = resolveItem(jugend, sav, 'pt03');
  assert.equal(buildMirror(sav, jugend, { ...jugend.defaults, item: 'pt03', positive: [7] }, custom).ownInGrid, false);
});

test('every path yields finite shares on the synthetic file', () => {
  const sav = fixtureSav();
  for (const claim of claims) for (const p of enumeratePaths(claim)) {
    const r = analyse(sav, claim.analysis(p.choice, itemOf(claim, p.choice.item)));
    assert.ok(Number.isFinite(r.target) && Number.isFinite(r.comparison), `${claim.id} ${p.levels.join('/')}`);
  }
});
