import test from 'node:test';
import assert from 'node:assert/strict';
import { describe, relate, standardError } from './math';
import { calculateStatistics } from '../domain/statistics';
import { num, signed, paren, pct, count, parseAnswer, close, round, fixed, unit, cell } from './format';

const near = (a: number | null, b: number, tol = 1e-9) => assert.ok(a !== null && Math.abs(a - b) <= tol, `${a} != ${b}`);

test('describe() gives the reference values checked in R for groups A and B', () => {
  const b = describe([1, 3, 5, 7, 9]);
  assert.equal(b.sum, 25); assert.equal(b.mean, 5); assert.deepEqual(b.dev, [-4, -2, 0, 2, 4]);
  assert.equal(b.ss, 40); assert.equal(b.variance, 10); near(b.sd, 3.1623, 1e-4); near(b.mad, 2.4);
  const a = describe([4, 5, 5, 5, 6]);
  assert.equal(a.variance, 0.5); near(a.sd, 0.7071, 1e-4); near(a.mad, 0.4);
  near(describe([1, 3, 5, 7, 10]).sd, 3.4928, 1e-4);
  assert.equal(describe([1, 3, 5, 7, 9]).dev.reduce((s, d) => s + d, 0), 0);
});

test('relate() matches R and the atlas statistics for the three presets', () => {
  const x = [2, 3, 4, 5, 6];
  const up = relate(x, [2, 5, 3, 6, 4]);
  assert.deepEqual(up.prod, [4, -1, 0, 2, 0]); assert.equal(up.cp, 5); assert.equal(up.pos, 6); assert.equal(up.neg, -1);
  assert.equal(up.cov, 1.25); near(up.sxy, 2.5); near(up.r, 0.5);
  near(relate(x, [6, 3, 5, 2, 4]).r, -0.5);
  const u = relate(x, [5, 3, 2, 3, 5]);
  near(u.y.mean, 3.6); near(u.cov, 0); near(u.r, 0);
  const atlas = calculateStatistics(x.map((v, i) => ({ id: `P${i}`, x: v, y: [2, 5, 3, 6, 4][i] })));
  near(atlas.pearson, up.r!); near(atlas.covariance, up.cov);
  assert.equal(relate(x, [4, 4, 4, 4, 4]).r, null);
});

test('standardError() gives 0,013 for the ALLBUS interest values', () => {
  near(standardError(0.9395, 5225), 0.013, 5e-4);
  assert.equal(standardError(1, 100), 0.1);
});

test('format helpers write German numbers with a true minus sign', () => {
  assert.equal(num(3.16227), '3,16'); assert.equal(num(-4), '−4'); assert.equal(num(-0.0001), '0'); assert.equal(num(5), '5');
  assert.equal(signed(4), '+4'); assert.equal(signed(-2), '−2'); assert.equal(signed(0), '0');
  assert.equal(paren(-4), '(−4)'); assert.equal(paren(3), '3');
  assert.equal(pct(1 / 3), '33,3 %'); assert.equal(count(5225), '5.225'); assert.equal(num(NaN), '–');
  assert.deepEqual(parseAnswer('3,16'), [3.16]); assert.deepEqual(parseAnswer('−4'), [-4]); assert.equal(parseAnswer(' na '), 'NA');
  assert.deepEqual(parseAnswer('+2'), [2]); assert.deepEqual(parseAnswer('3.162'), [3.162, 3162]); assert.deepEqual(parseAnswer('0.5'), [0.5]);
  assert.equal(parseAnswer(''), null); assert.equal(parseAnswer('abc'), null);
  assert.ok(close(3.16, 3.1623)); assert.ok(!close(3.1, 3.1623));
});

/*
 * Halbe Stellen runden vom Betrag her auf (IB9), auch bei negativen Zahlen; binäres Rauschen zählt nicht.
 * R (Lehrdatensatz, read_spss): mean(atlas$wissenstest) = 10.125, also 9 − 10.125 = −1.125 genau; im Atlas
 * steht „9 − 10,13 = −1,13“, nicht „−1,12“. 19.865 (B12, Alter) ist im Rechner 19.864999…, als Dezimalzahl aber
 * genau die Hälfte: sprintf("%.15g", 19.865) = "19.865".
 */
test('format helpers round halves away from zero, for negative numbers too, and ignore binary noise', () => {
  assert.equal(num(1.125), '1,13', '1,125'); assert.equal(num(-1.125), '−1,13', '−1,125 wie 1,125');
  assert.equal(num(9 - 10.125), '−1,13', '9 − 10,125');
  assert.equal(num(19.865), '19,87', '19,865 als Dezimalzahl'); assert.equal(num(-19.865), '−19,87');
  assert.equal(num(2.675), '2,68'); assert.equal(num(1.005), '1,01'); assert.equal(num(-0.005), '−0,01'); assert.equal(num(-0.004), '0');
  assert.equal(num(0.0505, 3), '0,051'); assert.equal(num(-2.5, 0), '−3');
  assert.equal(signed(-0.125), '−0,13'); assert.equal(paren(-1.125), '(−1,13)'); assert.equal(unit(-1.125, 'Punkt', 'Punkte'), '−1,13 Punkte');
  assert.equal(fixed(-1.125), '−1,13'); assert.equal(fixed(19.865), '19,87'); assert.equal(fixed(-0.004), '0,00');
  assert.equal(count(-2.5), '−3'); assert.equal(count(2.5), '3');
  for (const v of [0.125, 1.875, 4.585, 22.205, 100.125, 1819.125]) assert.equal(num(-v), `−${num(v)}`, `Vorzeichen symmetrisch bei ${v}`);
  assert.equal(round(-1.125, 2), -1.13); assert.equal(round(0.1 + 0.2, 2), 0.3); assert.ok(Object.is(round(-0.001, 2), 0), 'kein −0');
});

test('cell() writes table numbers in German with every decimal and no thousands point below 10.000', () => {
  assert.equal(cell(8.3), '8,3'); assert.equal(cell(-9), '−9'); assert.equal(cell(3850), '3850'); assert.equal(cell(12345.5), '12.345,5');
  assert.equal(cell(0.123456), '0,123456'); assert.equal(cell(NaN), '–');
});
