import test from 'node:test';
import assert from 'node:assert/strict';
import { fixtureSav } from '../../sandbox/testData';
import { chiSquare, cramersV, crosstab, gamma, pearson, permutationV, phi, roundHalfEven, spearman, tauB, validValues } from './stats';

const sav = fixtureSav();
const col = (name: string) => validValues(sav.byName.get(name)!);
const ps03 = col('ps03'), w = col('wghtpew');
const close = (actual: number, expected: number, digits = 8) => assert.ok(Math.abs(actual - expected) < 10 ** -digits, `${actual} ≠ ${expected}`);

test('builds weighted crosstabs and rounds like R', () => {
  const t = crosstab([1, 1, 2, NaN, 2], [1, 2, 2, 1, 2], [0.5, 1.5, 2, 1, 1]);
  assert.deepEqual(t.rows, [1, 2]);
  assert.deepEqual(t.cells, [[0.5, 1.5], [0, 3]]);
  assert.equal(t.n, 5);
  assert.deepEqual([0.5, 1.5, 2.5, 2.51, -2.5].map(roundHalfEven), [0, 2, 2, 3, -2]);
  assert.equal(chiSquare([[10, 20], [30, 40]]).df, 1);
});

// Referenzwerte: mariposa 0.7.3 auf der Testdatei (scripts/make-sandbox-fixture.R), ps03 in der Originalkodierung.
test('nominal and ordinal measures match mariposa, weighted on rounded cells', () => {
  const ref: Record<string, number[]> = {
    ep01: [0.4771702106, 0.4701388156, 0.9543404212, 0.8110236220, 0.7899686520],
    rd01: [0.2810016564, 0.2945886471, 0.5620033129, 0.1942148760, 0.1937984496],
    eastwest: [0.3223491092, 0.2946985560, 0.3223491092, -0.0422535211, -0.1873350923],
  };
  for (const [v, [vw, vu, phiW, gw, gu]] of Object.entries(ref)) {
    const x = col(v);
    close(cramersV(ps03, x, w), vw);
    close(cramersV(ps03, x), vu);
    close(phi(ps03, x, w), phiW);
    close(gamma(ps03, x, w), gw);
    close(gamma(ps03, x), gu);
  }
});

test('Gamma is 0 (not NaN) when there are no concordant or discordant pairs, like mariposa', () => {
  assert.equal(gamma([1, 1, 1, 1], [1, 2, 3, 3]), 0);
  assert.equal(gamma([1, 2, 3], [5, 5, 5], [1, 2, 3]), 0);
  assert.equal(gamma([NaN], [1]), 0);
  assert.equal(gamma([1, 2, 3], [1, 2, 3]), 1);
  assert.equal(gamma([1, 2, 3], [3, 2, 1]), -1);
});

test('Tau-b, Spearman and Pearson match mariposa', () => {
  const ref: Record<string, number[]> = {
    ep01: [0.6544889972, 0.6458842532, 0.7508144656, 0.7699054185, 0.7573178550],
    age: [0.2014839144, 0.1861380710, 0.2485905514, 0.2748574215, 0.2630279757],
    rd01: [0.1543385371, 0.1423871691, 0.1647905888, 0.1820824660, 0.1449122280],
    eastwest: [-0.1095041155, -0.1152724999, -0.1285608343, -0.1022473638, -0.1154736699],
  };
  for (const [v, [tw, tu, rho, rw, ru]] of Object.entries(ref)) {
    const x = col(v);
    close(tauB(ps03, x, w), tw);
    close(tauB(ps03, x), tu);
    close(spearman(ps03, x, w), rho);
    close(spearman(ps03, x), rho);
    close(pearson(ps03, x, w), rw);
    close(pearson(ps03, x), ru);
  }
});

test('the permutation V is reproducible and smaller than a real association', () => {
  const x = col('ep01');
  const a = permutationV(ps03, x, w, 20, 7), b = permutationV(ps03, x, w, 20, 7);
  assert.equal(a, b);
  assert.ok(a < cramersV(ps03, x, w));
});

test('drops categories that round to zero and returns NaN for tables with one row or column', () => {
  // Kategorie 3 hat nur Gewicht 0,3 – gerundet leer; V wie ohne sie.
  const x = [...Array(9).fill(1), ...Array(9).fill(2), 3], y = [1, 1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 1, 1, 2, 2, 2, 2, 2, 1];
  close(cramersV(x, y, [...Array(18).fill(1), 0.3]), cramersV(x.slice(0, 18), y.slice(0, 18)));
  assert.ok(Number.isNaN(phi([1, 1, 1], [1, 2, 1])));
  assert.ok(Number.isNaN(cramersV([1, 1, 1], [1, 2, 1])));
});

test('selects cases by weight like mariposa (NaN and 0 excluded) and computes χ²', () => {
  const x = [1, 2, 3, 4, 5], y = [2, 1, 4, 3, 5];
  close(spearman(x, y, [1, NaN, 0, 2, 1]), spearman([1, 4, 5], [2, 3, 5]));
  close(tauB(x, y, [1, NaN, 0, 1, 1]), tauB([1, 4, 5], [2, 3, 5]));
  close(chiSquare([[10, 20], [30, 40]]).chi2, 0.79365079, 7);
});
