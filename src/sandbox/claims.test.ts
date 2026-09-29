import test from 'node:test';
import assert from 'node:assert/strict';
import { analyse } from './analysis';
import { claims, itemOf, jugend, nichtwahl, osten, toRanges } from './claims';
import { fixtureSav } from './testData';

test('compresses codes into sorted ranges', () => {
  assert.deepEqual(toRanges([3, 1, 2, 7, 5, 6, 42]), [[1, 3], [5, 7], [42, 42]]);
  assert.deepEqual(toRanges([]), []);
});

test('every claim is complete and its defaults are one of its own paths', () => {
  for (const claim of claims) {
    assert.equal(claim.gaps.length, 5, claim.id);
    assert.ok(claim.items.some(i => i.variable === claim.defaults.item), claim.id);
    assert.ok(claim.missingOptions.some(o => JSON.stringify(o.mode) === JSON.stringify(claim.defaults.missing)), claim.id);
    for (const item of claim.items) for (const code of [...item.strict, ...item.wide]) assert.ok(item.categories.some(k => k.code === code), `${claim.id} ${item.variable} ${code}`);
  }
});

test('each claim builds the intended groups and outcome', () => {
  const young = jugend.analysis({ ...jugend.defaults, cut: 24, comparison: 'mid' }, itemOf(jugend, 'pa02a'));
  assert.deepEqual(young.group, { variable: 'age', target: [[18, 24]], comparison: [[40, 59]] });
  assert.deepEqual(jugend.groupLabels({ ...jugend.defaults, cut: 24 }, itemOf(jugend, 'pa02a')), ['18–24', '25 und älter']);
  const east = osten.analysis({ ...osten.defaults, exclude: [4] }, itemOf(osten, 'pt03'));
  assert.deepEqual(east.group.target, [[2, 2]]);
  assert.deepEqual(east.outcome.exclude, [4]);
  const distrust = nichtwahl.analysis({ ...nichtwahl.defaults, positive: [1, 2] }, itemOf(nichtwahl, 'pe01'));
  assert.deepEqual(distrust.group, { variable: 'pe01', target: [[1, 2]], comparison: [[3, 4]] });
  assert.deepEqual(distrust.outcome.positive, [91]);
});

// Referenzwerte der synthetischen Datei; mit scripts/verify-sandbox-r.R gegen mariposa 0.7.3 geprüft.
test('matches mariposa on the synthetic fixture', () => {
  const f = fixtureSav();
  const run = (claim: typeof jugend, choice = claim.defaults) => analyse(f, claim.analysis(choice, itemOf(claim, choice.item)));
  const o = run(osten);
  assert.deepEqual(o.table, { yes: [8, 4], no: [5, 9], n: [13, 13] });
  assert.equal(o.target, 8 / 13);
  const n = run(nichtwahl, { ...nichtwahl.defaults, missing: { mode: 'codesAsYes', codes: [-8] } });
  assert.deepEqual([n.target, n.comparison], [3 / 8, 10 / 28]);
  const j = run(jugend, { ...jugend.defaults, weighted: true });
  assert.equal(j.target.toFixed(6), '0.246710');
  assert.equal(j.comparison.toFixed(6), '0.381749');
});
