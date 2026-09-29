import test from 'node:test';
import assert from 'node:assert/strict';
import { analyse, columnShare, crosstab2, dichotomize, groupCodes } from './analysis';
import { fakeSav } from './testData';

const sav = fakeSav({
  age: { values: [18, 25, 40, 70, -32, 30], missingFrom: -1 },
  q: { values: [1, 2, 3, -9, 1, 4], missingFrom: -1 },
  w: { values: [2, 1, 1, 1, NaN, 0.5] },
});

test('assigns target, comparison and excluded cases from ranges and missing codes', () => {
  const g = groupCodes(sav.byName.get('age')!, { variable: 'age', target: [[18, 29]], comparison: [[30, Infinity]] });
  assert.deepEqual([...g], [0, 0, 1, 1, -1, 1]);
});

test('dichotomizes with every missing mode and excluded categories', () => {
  const q = sav.byName.get('q')!;
  const base = { variable: 'q', positive: [1, 2], exclude: [] as number[] };
  const values = (m: Parameters<typeof dichotomize>[1]) => [...dichotomize(q, m)].map(x => Number.isNaN(x) ? null : x);
  assert.deepEqual(values({ ...base, missing: { mode: 'drop' } }), [1, 1, 0, null, 1, 0]);
  assert.deepEqual(values({ ...base, missing: { mode: 'allAsNo' } }), [1, 1, 0, 0, 1, 0]);
  assert.deepEqual(values({ ...base, missing: { mode: 'codesAsYes', codes: [-9] } }), [1, 1, 0, 1, 1, 0]);
  assert.deepEqual(values({ ...base, exclude: [3], missing: { mode: 'drop' } }), [1, 1, null, null, 1, 0]);
});

test('crosstab counts cases, weights them and drops invalid weights', () => {
  const groups = Int8Array.from([0, 0, 1, 1, -1, 1]);
  const outcome = Float64Array.from([1, 1, 0, NaN, 1, 0]);
  assert.deepEqual(crosstab2(groups, outcome, null), { yes: [2, 0], no: [0, 2], n: [2, 2] });
  assert.deepEqual(crosstab2(groups, outcome, Float64Array.from([2, 1, 1, 1, NaN, 0.5])), { yes: [3, 0], no: [0, 1.5], n: [2, 2] });
  assert.deepEqual(crosstab2(groups, outcome, Float64Array.from([2, 1, NaN, 1, 1, 0.5])), { yes: [3, 0], no: [0, 0.5], n: [2, 1] });
});

test('reports shares, difference in points and column shares', () => {
  const r = analyse(sav, { group: { variable: 'age', target: [[18, 29]], comparison: [[30, Infinity]] }, outcome: { variable: 'q', positive: [1], exclude: [], missing: { mode: 'drop' } }, weighted: false });
  assert.equal(r.target, 0.5);
  assert.equal(r.comparison, 0);
  assert.equal(r.difference, 50);
  assert.equal(columnShare(r.table, 0, 'yes'), 1);
  assert.equal(columnShare(r.table, 1, 'no'), 2 / 3);
});
