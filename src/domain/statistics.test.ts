import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateStatistics, defaultPairs, formatNumber, type DataPair } from './statistics.ts';
import { concepts, connections, conceptById } from './concepts.ts';

const close = (actual: number | null, expected: number, tolerance = 1e-12): void => {
  assert.notEqual(actual, null);
  assert.ok(Math.abs(actual! - expected) <= tolerance, `${actual} != ${expected}`);
};

const pairs = (x: number[], y: number[]): DataPair[] => x.map((value, i) => ({ id: `row-${i}`, x: value, y: y[i] }));

test('worked example uses the same five cases and the n − 1 convention throughout', () => {
  const s = calculateStatistics(defaultPairs);
  assert.equal(s.n, 5);
  assert.equal(s.df, 4);
  assert.equal(s.sumX, 15);
  assert.equal(s.sumY, 20);
  assert.equal(s.meanX, 3);
  assert.equal(s.meanY, 4);
  assert.deepEqual(s.deviationsX, [-2, -1, 0, 1, 2]);
  assert.deepEqual(s.deviationsY, [-2, 0, 1, 0, 1]);
  assert.deepEqual(s.squaredDeviationsX, [4, 1, 0, 1, 4]);
  assert.equal(s.ssX, 10);
  assert.equal(s.ssY, 6);
  assert.equal(s.varianceX, 2.5);
  assert.equal(s.varianceY, 1.5);
  close(s.sdX, Math.sqrt(2.5));
  close(s.sdY, Math.sqrt(1.5));
  assert.deepEqual(s.crossProducts, [4, 0, 0, 0, 2]);
  assert.equal(s.crossProductSum, 6);
  assert.equal(s.covariance, 1.5);
  close(s.pearson, Math.sqrt(0.6));
});

test('sample z-scores have mean zero, sample variance one and reproduce Pearson via Σzxzy/(n−1)', () => {
  const s = calculateStatistics(defaultPairs);
  const zx = s.zX as number[];
  const zy = s.zY as number[];
  close(zx.reduce((a, b) => a + b, 0) / s.n, 0);
  close(zy.reduce((a, b) => a + b, 0) / s.n, 0);
  close(zx.reduce((a, b) => a + b * b, 0) / s.df, 1);
  close(zy.reduce((a, b) => a + b * b, 0) / s.df, 1);
  const zProducts = zx.reduce((total, value, i) => total + value * zy[i], 0);
  close(s.pearson, zProducts / s.df);
  assert.ok(Math.abs(s.pearson! - zProducts / s.n) > 0.1, 'division by n would be the wrong convention');
});

test('a constant variable has zero variance but undefined z-scores and Pearson correlation', () => {
  const s = calculateStatistics(pairs([7, 7, 7], [1, 2, 3]));
  assert.equal(s.varianceX, 0);
  assert.equal(s.sdX, 0);
  assert.equal(s.covariance, 0);
  assert.deepEqual(s.zX, [null, null, null]);
  assert.equal(s.pearson, null);
  assert.deepEqual(s.zY, [-1, 0, 1]);
});

test('empty and single-case samples do not invent sample dispersion or a correlation', () => {
  const empty = calculateStatistics([]);
  assert.equal(empty.n, 0);
  assert.equal(empty.meanX, null);
  assert.equal(empty.varianceX, null);
  assert.equal(empty.sdX, null);
  assert.equal(empty.covariance, null);
  assert.equal(empty.pearson, null);
  assert.deepEqual(empty.zX, []);
  const single = calculateStatistics(pairs([3], [8]));
  assert.equal(single.meanX, 3);
  assert.equal(single.meanY, 8);
  assert.equal(single.varianceX, null);
  assert.equal(single.sdX, null);
  assert.equal(single.covariance, null);
  assert.equal(single.pearson, null);
  assert.deepEqual(single.zX, [null]);
});

test('a perfectly decreasing line produces Pearson −1', () => {
  const s = calculateStatistics(pairs([1, 2, 3, 4], [10, 8, 6, 4]));
  close(s.pearson, -1);
  assert.ok(s.covariance! < 0);
});

test('translation and positive scaling preserve r; reversing one scale changes its sign', () => {
  const original = calculateStatistics(defaultPairs).pearson!;
  const positive = defaultPairs.map(({ id, x, y }) => ({ id, x: 10 * x + 100, y: 3 * y - 17 }));
  const reversed = defaultPairs.map(({ id, x, y }) => ({ id, x: -2 * x + 10, y: 3 * y - 17 }));
  close(calculateStatistics(positive).pearson, original);
  close(calculateStatistics(reversed).pearson, -original);
});

test('a nonlinear relationship can have Pearson zero', () => {
  close(calculateStatistics(pairs([-2, -1, 0, 1, 2], [4, 1, 0, 1, 4])).pearson, 0);
});

test('invalid coordinates are rejected without silently changing row alignment', () => {
  assert.throws(() => calculateStatistics(pairs([1, Number.NaN], [2, 3])), RangeError);
  assert.throws(() => calculateStatistics(pairs([1, 2], [Infinity, 3])), RangeError);
});

test('overflow never leaks NaN or Infinity into a displayed result', () => {
  const s = calculateStatistics(pairs([-1e308, 1e308], [1e308, -1e308]));
  for (const value of Object.values(s).flat()) {
    assert.ok(value === null || Number.isFinite(value));
  }
  assert.equal(formatNumber(null), 'nicht definiert');
  assert.equal(formatNumber(NaN), 'nicht definiert');
  assert.equal(formatNumber(-0), '0');
  assert.equal(formatNumber(1.23456), '1,235');
});

test('every concept is explained, every reference resolves and every derived concept reaches a boundary', () => {
  assert.equal(new Set(concepts.map(({ id }) => id)).size, concepts.length);
  assert.equal(new Set(connections.map(({ id }) => id)).size, connections.length);
  for (const concept of concepts) {
    assert.ok(concept.explanation.length > 100, concept.id);
    if (!concept.boundary) assert.ok(connections.some(({ target }) => target === concept.id), concept.id);
  }
  for (const connection of connections) {
    assert.ok(conceptById[connection.source], connection.source);
    assert.ok(conceptById[connection.target], connection.target);
  }
  const reachesBoundary = (id: string, visited = new Set<string>()): boolean => {
    if (conceptById[id].boundary) return true;
    if (visited.has(id)) return false;
    const next = new Set(visited).add(id);
    return connections.filter(({ target }) => target === id).some(({ source }) => reachesBoundary(source, next));
  };
  for (const { id } of concepts) assert.ok(reachesBoundary(id), id);
});
