import test from 'node:test';
import assert from 'node:assert/strict';
import { fixtureSav } from '../../sandbox/testData';
import { describeOne, dfbeta, groupStats, levene, ols, predict, predictCi, refitWithout, tryOls, wobble } from './ols';
import { validValues } from './stats';

// Referenzwerte: mariposa 0.7.3 (R 4.5.3) auf der synthetischen Testdatei, Skript wie die Lösungsskripte:
//   demo = rec(ps03, rules = "rev"); to_dummy(dg03); abi = rec(educ, "1:3=0; 4:5=1; else=NA"); frau = rec(sex, "1=0; 2=1; else=NA")
//   linear_regression(…, weights = wghtpew)$coef_table / $model_summary / $anova_table / $n, levene_test(), describe(), dfbeta(lm(…)).
const sav = fixtureSav();
const col = (name: string) => validValues(sav.byName.get(name)!);
const map = (x: Float64Array, f: (v: number) => number) => Float64Array.from(x, v => (Number.isNaN(v) ? NaN : f(v)));
const demo = map(col('ps03'), v => 7 - v), pt03 = col('pt03'), w = col('wghtpew'), dg03 = col('dg03');
const dummy = (k: number) => map(dg03, v => (v === k ? 1 : 0));
const abi = map(col('educ'), v => (v >= 1 && v <= 3 ? 0 : v <= 5 ? 1 : NaN));
const frau = map(col('sex'), v => (v === 1 ? 0 : v === 2 ? 1 : NaN));

const close = (actual: number, expected: number, tol = 1e-9) =>
  assert.ok(Math.abs(actual - expected) <= tol * Math.max(1, Math.abs(expected)), `${actual} ≠ ${expected}`);
const all = (actual: number[], expected: number[], tol = 1e-9) => {
  assert.equal(actual.length, expected.length);
  actual.forEach((v, i) => (Number.isNaN(expected[i]) ? assert.ok(Number.isNaN(v)) : close(v, expected[i], tol)));
};

test('weighted simple regression matches linear_regression(demo ~ pt03, weights = wghtpew)', () => {
  const m = ols(demo, [pt03], w, { names: ['pt03'] });
  assert.deepEqual(m.terms, ['(Intercept)', 'pt03']);
  all(m.coef, [5.1259272692656621, -0.21723285314799293]);
  all(m.se, [0.96826095074999319, 0.22360487899063838]);
  all(m.t, [5.2939522814539135, -0.97150318959313842]);
  all(m.p, [5.6593560490212644e-05, 0.34471420491759486]);
  all(m.ciLower, [3.085444351894397, -0.68845079854572511]);
  all(m.ciUpper, [7.1664101866369272, 0.2539850922497392]);
  all(m.beta, [NaN, -0.22768058957195392]);
  close(m.r2, 0.051838450867832439);
  close(m.adjR2, -0.0030857255044394183);
  close(m.sigma, 1.6226091096178201);
  assert.equal(m.nPrinted, 19);
  assert.equal(m.n, 21);
  all([m.dfModel, m.dfResidual, m.dfTotal], [1, 17.263100000000005, 18.263100000000005]);
  close(m.F, 0.94381844738964016);
  close(m.pF, 0.34471420491759519);
  all([m.ssRegression, m.ssResidual, m.ssTotal], [2.4849421418840265, 45.451331035330448, 47.936273177214474]);
});

test('unweighted simple regression matches lm() as mariposa prints it', () => {
  const m = ols(demo, [pt03], null, { names: ['pt03'] });
  all(m.coef, [5.082530949105915, -0.20151306740027511]);
  all(m.se, [0.89919597535180062, 0.19689149043130627]);
  all(m.p, [1.8923453726987265e-05, 0.31893963232371575]);
  all(m.ciLower, [3.2004921430674544, -0.61361169298130269]);
  all(m.ciUpper, [6.9645697551443755, 0.21058555818075245]);
  all(m.beta, [NaN, -0.22858419325394755]);
  close(m.r2, 0.052250733405558018);
  close(m.adjR2, 0.0023691930584821552);
  close(m.sigma, 1.6383229025322519);
  assert.equal(m.nPrinted, 21);
  all([m.dfResidual, m.dfTotal, m.F, m.pF], [19, 20, 1.0474963892854405, 0.31893963232371614]);
});

test('multiple weighted regression with dummies and controls (listwise) matches mariposa', () => {
  const m = ols(demo, [dummy(1), dummy(2), dummy(3), col('age'), abi, frau], w, { names: ['dg03_1', 'dg03_2', 'dg03_3', 'age', 'abi', 'frau'] });
  all(m.coef, [4.5432463813614277, 0.42676372463811613, -0.010338343918550586, 0.60363128098740193, -0.015468318180976754, 0.032223116849768939, 0.37535545554505795]);
  all(m.se, [0.78994747552961797, 0.75752801496401778, 0.61226456944241137, 0.87800856025849117, 0.012941447022278433, 0.52445218118017589, 0.57733665572130299]);
  all(m.t, [5.7513271731331521, 0.56336361983706595, -0.016885419203606217, 0.68750045080390687, -1.1952541438641573, 0.061441477423656028, 0.65015004993248315]);
  all(m.p, [2.9201780672926611e-06, 0.57742429978820242, 0.98664116344441077, 0.49711170352099066, 0.24146265612378626, 0.95142001330154624, 0.52060249132367331]);
  all(m.ciLower, [2.9291446611364704, -1.1210952279488824, -1.2613801224965688, -1.1904058814648413, -0.041911610359174963, -1.0393913816345848, -0.80431802657336093]);
  all(m.ciUpper, [6.1573481015863845, 1.9746226772251148, 1.2407034346594679, 2.3976684434396449, 0.010974973997221455, 1.1038376153341225, 1.5550289376634769]);
  all(m.beta.slice(1), [0.10889125531656735, -0.0034167268694591155, 0.13167635483372028, -0.25127874995839783, 0.011292627639276801, 0.13111015613618759]);
  close(m.r2, 0.09266377633492659);
  close(m.adjR2, -0.090985218456206551);
  close(m.sigma, 1.5107597743000711);
  assert.equal(m.nPrinted, 37);
  all([m.dfModel, m.dfResidual, m.F, m.pF], [6, 29.643600000000006, 0.50457001651609612, 0.79983161699495486]);
});

test('another reference reparametrises the same model: predictions agree, full dummy set is singular', () => {
  const ref4 = ols(demo, [dummy(1), dummy(2), dummy(3)], w);
  const ref1 = ols(demo, [dummy(2), dummy(3), dummy(4)], w);
  all(ref1.coef, [4.4105586611575989, -0.24651310616864736, 0.30374499639867186, -0.4152626323611141]);
  all(ref1.se, [0.6349725007281628, 0.74906587109822487, 0.99327958553750961, 0.73409905800648301]);
  close(ref1.r2, 0.022742514994147166);
  close(ref4.r2, ref1.r2, 1e-12);
  // Ost→West (Gruppe 2) hat in beiden Parametrisierungen dieselbe Vorhersage und dasselbe Konfidenzintervall.
  const a = predictCi(ref4, [0, 1, 0]), b = predictCi(ref1, [1, 0, 0]);
  close(a.fit, b.fit, 1e-12); close(a.lower, b.lower, 1e-10); close(a.upper, b.upper, 1e-10);
  close(predict(ref1, [0, 0, 0]), ref1.coef[0], 1e-15);
  // Die Referenzgruppe hat als Vorhersage die Konstante, mit dem Konfidenzintervall der Konstante aus mariposa.
  const c = predictCi(ref1, [0, 0, 0]);
  close(c.lower, 3.1246312779199714); close(c.upper, 5.6964860443952263);
  assert.throws(() => ols(demo, [dummy(1), dummy(2), dummy(3), dummy(4)], w), /singular/);
  assert.equal(tryOls(demo, [dummy(1), dummy(2), dummy(3), dummy(4)], w), null);
  assert.throws(() => ols([1, 2, 3], [[1, 2, 3], [2, 1, 2]], null), /too few cases/);
});

test('residual spread per input level like describe(), overall like describe()', () => {
  const m = ols(demo, [pt03], w);
  const r = Float64Array.from(demo, (y, i) => y - (m.coef[0] + m.coef[1] * pt03[i]));
  const g = groupStats(r, pt03, w);
  assert.deepEqual(g.map(s => s.value), [1, 2, 3, 4, 5, 6, 7]);
  all(g.map(s => s.sd), [1.5935628801607293, NaN, 1.2950141186501316, 1.4300069930126003, 1.4713656127309811, NaN, 2.6680682938622811]);
  all(g.map(s => s.mean), [-0.9308680962066932, 1.3085384370303235, 0.53437144360828392, 0.8623963584013552, -1.0259739053758596, 0.17746984962229551, 0.73743718491208066]);
  all(groupStats(r, pt03).map(s => s.sd), [1.5275252316519468, NaN, 1.4142135623730951, 1.3038404810405297, 1.4719601443879746, NaN, 2.0816659994661326]);
  const one = describeOne([1, 2, 3, 4], [1, 1, 2, 2]);
  close(one.mean, 17 / 6);
  close(one.sd, Math.sqrt((1 * (1 - 17 / 6) ** 2 + (2 - 17 / 6) ** 2 + 2 * (3 - 17 / 6) ** 2 + 2 * (4 - 17 / 6) ** 2) / 5));
  assert.ok(Number.isNaN(describeOne([], null).mean));
});

test('Levene test like levene_test(daneben, group = pt03, weights = wghtpew)', () => {
  const m = ols(demo, [pt03], w);
  const r = Float64Array.from(demo, (y, i) => y - (m.coef[0] + m.coef[1] * pt03[i]));
  const wm = levene(r, pt03, w);
  all([wm.F, wm.df1, wm.df2, wm.p], [0.87529377091901717, 6, 12.263100000000005, 0.54003375966368894]);
  const um = levene(r, pt03);
  all([um.F, um.df1, um.df2, um.p], [1.0029032434352545, 6, 14, 0.46120672818849573]);
  const md = levene(r, pt03, w, 'median');
  all([md.F, md.p], [0.30422730452367475, 0.9230782338901472]);
  // Im Residuum steckt je Stufe eine Konstante: Levene auf demo selbst ist derselbe Test.
  close(levene(demo, pt03, w).F, wm.F, 1e-9);
  assert.ok(Number.isNaN(levene([1, 1, 1, 1], [1, 1, 2, 2]).F));
  assert.equal(levene([1, 2, 3], [1, 1, 1]).groups, 1);
});

test('DFBETA equals R dfbeta(lm(…, weights = w)) and the wobble test refits without the five strongest cases', () => {
  const m = ols(demo, [dummy(1), dummy(2), dummy(3)], w);
  assert.equal(m.n, 43);
  const db = dfbeta(m);
  const colMax = (j: number) => Math.max(...db.map(r => r[j])), colMin = (j: number) => Math.min(...db.map(r => r[j]));
  all([colMax(0), colMin(0), colMax(1), colMin(1), colMax(2), colMin(2), colMax(3), colMin(3)],
    [0.15263705908122138, -0.077995043442261228, 0.18305977435528328, -0.37659868163455157, 0.17038355699511826, -0.19914598650539467, 0.21609356365955643, -0.43872094193598243], 1e-8);
  close(db[0][3], -0.12374526669955022, 1e-8);
  // Vorzeichen: β̂ − β̂₍₋₁₎
  close(m.coef[3] - refitWithout(m, [0]).coef[3], db[0][3], 1e-8);
  const expected = { 1: [-0.43770401135741777, 1.6166300262146551], 2: [-1.1433712030917256, 1.4116405333623832], 3: [-0.40433815220924552, 2.0868079770359578] };
  for (const [term, [up, down]] of Object.entries(expected)) {
    const r = wobble(m, Number(term), 5, db);
    close(r.withoutUp, up, 1e-8); close(r.withoutDown, down, 1e-8);
  }
  // Wird eine Gruppe ganz entfernt, ist das Modell nicht schätzbar: NaN statt Zahl.
  const tiny = ols([1, 2, 3, 5, 4], [[0, 0, 1, 1, 1]], null);
  const t = wobble(tiny, 1, 3);
  assert.ok(Number.isNaN(t.withoutUp) && Number.isNaN(t.withoutDown));
  // Ein Fall allein in seiner Gruppe hat den Hebelwert 1: DFBETA 0 wie in R.
  const lone = ols([1, 2, 3, 5], [[0, 0, 0, 1]], null);
  assert.deepEqual(dfbeta(lone)[3].map(v => Math.abs(v)), [0, 0]);
});
