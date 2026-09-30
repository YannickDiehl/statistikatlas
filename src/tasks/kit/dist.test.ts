import test from 'node:test';
import assert from 'node:assert/strict';
import { pchisq, pf, pnorm, pt, pTwoSided, ptukey, qnorm, qt } from './dist';

// Referenzwerte: R 4.5.3, gedruckt mit sprintf("%.17g", …).
const rel = (actual: number, expected: number, tol = 1e-9) =>
  assert.ok(expected === actual || Math.abs(actual - expected) <= tol * Math.abs(expected), `${actual} ≠ ${expected}`);
const abs = (actual: number, expected: number, tol: number) => assert.ok(Math.abs(actual - expected) <= tol, `${actual} ≠ ${expected}`);
const each = (f: (x: number) => number, xs: number[], ref: number[], tol = 1e-9) => xs.forEach((x, i) => rel(f(x), ref[i], tol));

test('pnorm and qnorm match R, including both tails', () => {
  each(pnorm, [-8, -3, -1.96, -0.5, 0, 0.3, 1, 2.5, 6], [6.2209605742717849e-16, 0.0013498980316300946, 0.024997895148220428,
    0.30853753872598694, 0.5, 0.61791142218895267, 0.84134474606854293, 0.99379033467422384, 0.9999999990134123]);
  each(x => pnorm(x, false), [1.96, 5, 8, 10, 20], [0.024997895148220428, 2.8665157187919391e-07, 6.2209605742717849e-16,
    7.6198530241605269e-24, 2.7536241186062337e-89]);
  each(qnorm, [1e-15, 1e-8, 0.001, 0.025, 0.3, 0.5, 0.8, 0.975, 0.999999], [-7.9413453261709952, -5.6120012441747882,
    -3.0902323061678132, -1.9599639845400538, -0.52440051270804078, 0, 0.84162123357291441, 1.9599639845400534, 4.7534243088170864]);
  assert.equal(qnorm(0), -Infinity);
  assert.equal(qnorm(1), Infinity);
  assert.ok(Number.isNaN(qnorm(1.2)));
  assert.equal(pnorm(Infinity), 1);
  assert.equal(pnorm(-Infinity), 0);
});

test('pt and qt match R for integer, fractional (Welch) and large df', () => {
  const ref: Record<string, { lo: number[]; up: number[]; q: number[] }> = {
    1: { lo: [0.077979130377369324, 0.20871440016015266, 0.62111894159084335, 0.86420025121990818],
      up: [0.099326092199118518, 0.026464676059589871], q: [-318309.88618274347, -12.706204736174703, -0.32491969623290623, 12.706204736174692] },
    2.5: { lo: [0.019506487920659114, 0.15024339463535397, 0.63959036553463855, 0.93354300729016548],
      up: [0.033894189162460162, 0.0014181075150391613], q: [-220.17342917823751, -3.5746548420036937, -0.28145951274854752, 3.5746548420036919] },
    7: { lo: [0.0025949566746484064, 0.11738391769618854, 0.64945916641479751, 0.96813449234868165],
      up: [0.0086611447127487515, 3.1791551890925527e-06], q: [-14.241469651981445, -2.3646242515927849, -0.26316686135202277, 2.364624251592784] },
    30: { lo: [0.00019092281804187821, 0.10175047926905847, 0.65400474174290402, 0.98217578000158212],
      up: [0.0020922424302753729, 2.7900927075996303e-13], q: [-5.8711171204188837, -2.0422724563012382, -0.25560536495191277, 2.0422724563012378] },
    1000: { lo: [3.4004959604390749e-05, 0.09695026420772869, 0.65537902836697093, 0.98598248733665106],
      up: [0.00099467276556104603, 2.1620286933872824e-31], q: [-4.7816086204583499, -1.9623390808264078, -0.25341451583949876, 1.9623390808264074] },
    57.83: { lo: [9.1099686387306018e-05, 0.099379360532199132, 0.65468488641901079, 0.98409172151867153],
      up: [0.0014940690995523085, 1.2370740114790485e-17], q: [-5.2844773873918607, -2.0018427771714524, -0.25451576985319313, 2.0018427771714515] },
  };
  for (const [key, { lo, up, q }] of Object.entries(ref)) {
    const df = Number(key);
    each(t => pt(t, df), [-4, -1.3, 0.4, 2.2], lo);
    each(t => pt(t, df, false), [3.1, 12], up);
    each(p => qt(p, df), [1e-6, 0.025, 0.4, 0.975], q);
  }
  rel(pTwoSided(-3.1, 7), 2 * 0.0086611447127487515);
  rel(pTwoSided(12, 30), 2 * 2.7900927075996303e-13);
  assert.equal(pTwoSided(0, 12), 1);
});

test('pt approaches the normal distribution for huge df', () => {
  each(t => pt(t, 1e8), [-3, 1.5], [0.0013498983640187455, 0.93319279715264625]);
  rel(pt(4, 1e12, false), 3.1671241835394987e-05);
  assert.equal(pt(2, Infinity), pnorm(2));
  rel(qt(0.975, 1e9), qnorm(0.975), 1e-8);
});

test('boundaries of pt and qt', () => {
  assert.equal(pt(0, 5), 0.5);
  assert.equal(pt(Infinity, 5), 1);
  assert.equal(pt(-Infinity, 5, false), 1);
  assert.equal(qt(0, 5), -Infinity);
  assert.equal(qt(1, 5), Infinity);
  assert.equal(qt(0.5, 5), 0);
  assert.ok(Number.isNaN(pt(1, 0)));
  assert.ok(Number.isNaN(qt(-0.1, 5)));
  rel(pt(qt(0.123, 3.7), 3.7), 0.123, 1e-12);
});

test('pf matches R in both tails', () => {
  each(f => pf(f, 3, 1500), [0.5, 2.6], [0.31767198460744228, 0.94927001731454386]);
  each(f => pf(f, 3, 1500, false), [2.6, 12], [0.050729982685456101, 9.1574266318819915e-08]);
  each(f => pf(f, 2, 57.3), [0.8, 3.2], [0.54571675042449497, 0.95185677459080498]);
  rel(pf(9, 2, 57.3, false), 0.00039898250362903901);
  assert.equal(pf(0, 3, 10), 0);
  assert.equal(pf(Infinity, 3, 10, false), 0);
});

test('pchisq matches R, including a far upper tail', () => {
  each(x => pchisq(x, 1), [0.2, 3.84], [0.34527915398142295, 0.94995647875129496]);
  rel(pchisq(12, 1, false), 0.00053200550513924944);
  each(x => pchisq(x, 4), [1, 9.49], [0.090204010431049877, 0.95004686877670508]);
  rel(pchisq(25, 4, false), 5.0309817823062081e-05);
  each(x => pchisq(x, 30), [20, 43.77], [0.083458472934662853, 0.94996916913445595]);
  rel(pchisq(70, 30, false), 4.8549188786169286e-05);
  rel(pchisq(266, 3, false), 2.2638016083345994e-57);
  assert.equal(pchisq(0, 3), 0);
  assert.equal(pchisq(-1, 3, false), 1);
});

test('ptukey matches R to 1e-8 absolute', () => {
  abs(ptukey(3.5, 4, 1500), 0.93570774355360575, 1e-8);
  abs(ptukey(2.1, 4, 60), 0.54716162468232787, 1e-8);
  abs(ptukey(4.2, 3, 12), 0.97074227081779318, 1e-8);
  abs(ptukey(3.5, 4, 1500, false), 0.064292256446394247, 1e-8);
  abs(ptukey(2.1, 4, 60, false), 0.45283837531767213, 1e-8);
  abs(ptukey(4.2, 3, 12, false), 0.029257729182206815, 1e-8);
  abs(ptukey(5.9, 5, 2800, false), 0.0003004904408975273, 1e-8);
  abs(ptukey(3.2, 4, 40000), 0.89314132935400836, 1e-8); // df > 25000: Spannweite ohne Studentisierung
  assert.equal(ptukey(0, 4, 20), 0);
  assert.equal(ptukey(Infinity, 4, 20), 1);
  assert.ok(Number.isNaN(ptukey(2, 4, 1)));
});
