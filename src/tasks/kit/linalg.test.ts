import test from 'node:test';
import assert from 'node:assert/strict';
import { invertSPD, matMul, solveSPD, transpose, wls, type Matrix } from './linalg';

const rel = (actual: number, expected: number, tol = 1e-9) =>
  assert.ok(Math.abs(actual - expected) <= tol * Math.abs(expected), `${actual} ≠ ${expected}`);

test('transpose, matMul, solveSPD and invertSPD', () => {
  const a: Matrix = [[1, 2, 3], [4, 5, 6]];
  assert.deepEqual(transpose(a), [[1, 4], [2, 5], [3, 6]]);
  assert.deepEqual(matMul(a, transpose(a)), [[14, 32], [32, 77]]);
  assert.throws(() => matMul(a, a), /dimension/);
  const s: Matrix = [[4, 2, 0.6], [2, 5, 1], [0.6, 1, 3]];
  const x = solveSPD(s, [1, 2, 3]);
  matMul(s, x.map(v => [v])).forEach((row, i) => assert.ok(Math.abs(row[0] - [1, 2, 3][i]) < 1e-14));
  const inv = invertSPD(s);
  matMul(s, inv).forEach((row, i) => row.forEach((v, j) => assert.ok(Math.abs(v - (i === j ? 1 : 0)) < 1e-14)));
  assert.equal(inv[0][2], inv[2][0]);
});

test('singular or indefinite matrices throw Error("singular")', () => {
  assert.throws(() => solveSPD([[1, 2], [2, 4]], [1, 1]), /^Error: singular$/);
  assert.throws(() => invertSPD([[1, 2], [2, 1]]), /^Error: singular$/);
  assert.throws(() => invertSPD([[0, 0], [0, 1]]), /^Error: singular$/);
});

// Erfundene Daten; Referenz: R 4.5.3, lm(y ~ x1 + x2, weights = w), vcov(m) = rss / (n − p) · (XᵀWX)⁻¹.
const y = [3.1, 4.5, 2.2, 5.8, 6.1, 3.9, 7.2, 4.4, 5.0, 6.6, 2.9, 5.5];
const x1 = [1, 2, 1, 3, 4, 2, 5, 3, 3, 4, 1, 4];
const x2 = [0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 1];
const w = [0.8, 1.2, 1.0, 0.6, 1.5, 0.9, 1.1, 1.3, 0.7, 1.0, 1.4, 0.5];
const X = y.map((_, i) => [1, x1[i], x2[i]]);
const vcov = (r: ReturnType<typeof wls>, dfRes: number) => r.xtwxInv.flat().map(v => v * r.rss / dfRes);

test('wls reproduces weighted lm coefficients, vcov, fitted values and rss', () => {
  const r = wls(X, y, w);
  [1.7278895088398216, 1.085261550083495, 0.092758170540991322].forEach((b, j) => rel(r.coef[j], b));
  rel(r.rss, 2.1263928287433371);
  // vcov in R's Spaltenreihenfolge (symmetrisch)
  vcov(r, 9).forEach((v, k) => rel(v, [0.10173062765958243, -0.029789996811091606, -0.0017574180223597325, -0.029789996811091606,
    0.01408674267811307, -0.017484156583253977, -0.0017574180223597325, -0.017484156583253977, 0.1004781248374105][k]));
  [2.8131510589233182, 3.9911707795478044, 2.8131510589233173].forEach((f, i) => rel(r.fitted[i], f));
  r.residuals.forEach((e, i) => assert.ok(Math.abs(e - (y[i] - r.fitted[i])) < 1e-15));
});

test('wls without weights is ordinary least squares', () => {
  const r = wls(X, y);
  [1.7676975945017175, 1.1072164948453609, -0.091752577319587719].forEach((b, j) => rel(r.coef[j], b));
  vcov(r, 9).forEach((v, k) => rel(v, [0.12124335906388556, -0.035552563936026585, -0.0027348126104635834, -0.035552563936026585,
    0.016408875662781496, -0.019143688273245068, -0.0027348126104635834, -0.019143688273245068, 0.11075991072377502][k]));
});

test('wls stays accurate on survey-like scales (age, income, age²)', () => {
  const idx = Array.from({ length: 300 }, (_, k) => k + 1);
  const age = idx.map(i => 18 + (i * 37) % 73), inc = idx.map(i => 800 + (i * 977) % 4200);
  const wt = idx.map(i => 0.4 + ((i * 13) % 15) / 10);
  const yy = idx.map((i, k) => 2 + 0.03 * age[k] + 0.0004 * inc[k] + Math.sin(i));
  const r = wls(idx.map((_, k) => [1, age[k], inc[k], age[k] ** 2]), yy, wt);
  [2.2503939488607299, 0.021343883826866614, 0.00039399312225791064, 6.91085771948922e-05].forEach((b, j) => rel(r.coef[j], b));
  rel(r.rss, 165.41453174355132);
  const se = vcov(r, 296).filter((_, k) => k % 5 === 0).map(Math.sqrt);
  [0.29994279345446551, 0.011214816399207498, 3.4405805271624292e-05, 0.00010263237486030179].forEach((s, j) => rel(se[j], s));
});

test('wls throws Error("singular") for collinear designs and rejects invalid input', () => {
  // vollständiger Dummy-Satz neben der Konstanten
  const Xc = x2.map((d, i) => [1, x1[i], d, 1 - d]);
  assert.throws(() => wls(Xc, y, w), /^Error: singular$/);
  // zweite Spalte ist ein Vielfaches der ersten
  assert.throws(() => wls(x1.map(v => [1, v, 2 * v]), y), /^Error: singular$/);
  // Gewicht null lässt den Fall weg; mit zu wenigen Fällen ist das Design singulär
  assert.throws(() => wls([[1, 1], [1, 2], [1, 3]], [1, 2, 4], [0, 1, 0]), /^Error: singular$/);
  assert.throws(() => wls(X, y, w.map(v => -v)), /weight/);
  assert.throws(() => wls(X, y.map((v, i) => (i === 3 ? NaN : v))), /non-finite/);
  // Fälle mit Gewicht null zählen nicht
  const r0 = wls([...X, [1, 9, 1]], [...y, 100], [...w, 0]);
  [1.7278895088398216, 1.085261550083495, 0.092758170540991322].forEach((b, j) => rel(r0.coef[j], b));
});
