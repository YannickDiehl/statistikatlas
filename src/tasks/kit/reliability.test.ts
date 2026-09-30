import test from 'node:test';
import assert from 'node:assert/strict';
import { fixtureSav } from '../../sandbox/testData';
import { omegaOneFactor, reliability, rowMeans, rowSums, type Reliability } from './reliability';
import { pearson, validValues } from './stats';

// Referenzwerte: mariposa 0.7.3 (Rscript) auf der synthetischen Testdatei, volle Genauigkeit.
//   allbus <- read_spss("src/sandbox/fixtures/sandbox-fixture.sav")
//   r <- allbus %>% reliability(pa29, pa30, pa31, pa32, pa33, pa34, pa35)          # all7
//   allbus %>% reliability(pa29, …, pa35, weights = wghtpew)                          # all7w
//   allbus %>% reliability(pa31, pa32, pa33); reliability(pa29, pa30, pa34, pa35); reliability(pa31, pa32)
//   r$alpha, r$alpha_standardized, r$omega, r$omega_std, r$n, r$weighted_n, r$item_total$…, r$item_statistics$…
type Ref = {
  alpha: number; alphaStd: number; omega: number | null; omegaStd: number | null; n: number; weightedN: number | null;
  corrected: number[]; alphaIfDeleted: (number | null)[]; omegaIfDeleted: (number | null)[]; scaleMean: number[]; scaleVar: number[]; means: number[]; sds: number[];
};
const all7: Ref = { alpha: 0.7219762731481482, alphaStd: 0.7124685640896101, omega: 0.7450827948596005, omegaStd: 0.7253940349300199, n: 32, weightedN: null, corrected: [0.12451601468286991, 0.5371013310428505, 0.6460332366187199, 0.4083919946157937, 0.34251432897738227, 0.3632719478207866, 0.6182521517153112], alphaIfDeleted: [0.7531933215327945, 0.6677975749985768, 0.6306341463414634, 0.6959419147858389, 0.7098716059776891, 0.7068520248365296, 0.6367508406408652], omegaIfDeleted: [0.7655751337543875, 0.6999096704838922, 0.6536109077306679, 0.7404872413568884, 0.7373179059499484, 0.741182076714628, 0.6635147514110326], scaleMean: [15.34375, 15.03125, 14.28125, 14.34375, 14.4375, 14.09375, 14.46875], scaleVar: [21.07157258064517, 17.70866935483871, 15.49899193548387, 17.910282258064516, 19.15725806451613, 18.345766129032263, 15.289314516129036], means: [1.65625, 1.96875, 2.71875, 2.65625, 2.5625, 2.90625, 2.53125], sds: [1.0035220234817486, 0.9994958406536122, 1.2243332616097102, 1.1530989102302514, 1.0140146973548327, 1.1460837947184006, 1.294763024774256] };
const all7w: Ref = { alpha: 0.7126576754213313, alphaStd: 0.7079944243743798, omega: 0.7343161535824525, omegaStd: 0.7229175961290302, n: 32, weightedN: 32.001900000000006, corrected: [0.08775592594322532, 0.5383906283505485, 0.6793998301935598, 0.34203619275638353, 0.32602798019128154, 0.4524844565885895, 0.5735961356257527], alphaIfDeleted: [0.7543594217303887, 0.6566997332337384, 0.6061290707349897, 0.7007984896173728, 0.7017771092983391, 0.6721356265321435, 0.6366033012511075], omegaIfDeleted: [0.7621497692166416, 0.695353638525629, 0.6317883646370575, 0.7335889084184662, 0.7311186585834413, 0.7101701067411988, 0.6704986503644382], scaleMean: [15.146400682459479, 14.841115683756277, 14.090044653598692, 14.148331817798319, 14.34544198938188, 13.924167002584221, 14.362222243054319], scaleVar: [20.57840965110554, 17.421768885314354, 14.80615469781497, 17.81995889587712, 18.75500559306949, 16.904885458048422, 15.34519472041916], means: [1.6632199963127186, 1.9685049950159208, 2.719576025173505, 2.661288860973879, 2.4641786893903173, 2.8854536761879768, 2.4473984357178797], sds: [1.0681088534122527, 0.9461987639767452, 1.2064608554362328, 1.17041723625046, 0.9980936422199616, 1.16050112495069, 1.2563738021682673] };
const t313233: Ref = { alpha: 0.5988496673057404, alphaStd: 0.5983295529238555, omega: 0.6070334034553644, omegaStd: 0.6037798772627866, n: 36, weightedN: null, corrected: [0.4516767328288258, 0.38782618040735234, 0.384573461657141], alphaIfDeleted: [0.4298507462686567, 0.527306967984934, 0.5312252964426878], omegaIfDeleted: [null, null, null], scaleMean: [5.527777777777778, 5.583333333333334, 5.611111111111111], scaleVar: [3.4563492063492056, 3.7928571428571427, 4.015873015873015], means: [2.8333333333333335, 2.7777777777777777, 2.75], sds: [1.230563169563316, 1.1978817282689616, 1.1307393283031366] };
const rest4: Ref = { alpha: 0.5157277837579236, alphaStd: 0.5077580088586663, omega: 0.5940100418676553, omegaStd: 0.5734845248256534, n: 37, weightedN: null, corrected: [0.07513681143177389, 0.4647701914235045, 0.24093282892978476, 0.49036884710742795], alphaIfDeleted: [0.617319046577739, 0.31198949824970823, 0.5021152829190906, 0.24308300395256927], omegaIfDeleted: [0.6470267996942208, 0.5861134489057063, 0.5584013749136998, 0.4856840195194632], scaleMean: [7.54054054054054, 7.27027027027027, 6.351351351351351, 6.648648648648649], scaleVar: [6.866366366366366, 5.147147147147146, 5.678678678678679, 4.178678678678679], means: [1.7297297297297298, 2, 2.918918918918919, 2.6216216216216215], sds: [1.044792606975945, 1.0274023338281628, 1.163767311086866, 1.2769614836128105] };
const two: Ref = { alpha: 0.5297912713472486, alphaStd: 0.5298237119757546, omega: null, omegaStd: null, n: 37, weightedN: null, corrected: [0.3603810755836493, 0.3603810755836493], alphaIfDeleted: [null, null], omegaIfDeleted: [null, null], scaleMean: [2.810810810810811, 2.8378378378378377], scaleVar: [1.4354354354354357, 1.4729729729729735], means: [2.8378378378378377, 2.810810810810811], sds: [1.213660979422579, 1.1980965885250803] };

const sav = fixtureSav();
const item = (n: number) => validValues(sav.byName.get(`pa${n}`)!);
const items = (ns: number[]) => ns.map(item);
const w = validValues(sav.byName.get('wghtpew')!);

/** α, Trennschärfen, Mittel usw. sind exakt (≤ 1e-12); ω kommt in R aus factanal() mit L-BFGS-B-Abbruch: ≤ 2e-6. */
function same(r: Reliability, e: Ref, label: string) {
  const close = (a: number, b: number | null, tol: number, what: string) => {
    if (b === null) assert.ok(Number.isNaN(a), `${label} ${what}: NaN erwartet, ${a}`);
    else assert.ok(Math.abs(a - b) <= tol, `${label} ${what}: ${a} ≠ ${b}`);
  };
  close(r.alpha, e.alpha, 1e-12, 'alpha');
  close(r.alphaStd, e.alphaStd, 1e-12, 'alphaStd');
  close(r.omega, e.omega, 2e-6, 'omega');
  close(r.omegaStd, e.omegaStd, 2e-6, 'omegaStd');
  assert.equal(r.n, e.n, `${label} n`);
  if (e.weightedN === null) assert.equal(r.weightedN, null);
  else close(r.weightedN!, e.weightedN, 1e-9, 'weightedN');
  r.items.forEach((it, i) => {
    close(it.corrected, e.corrected[i], 1e-12, `corrected ${i}`);
    close(it.alphaIfDeleted, e.alphaIfDeleted[i], 1e-12, `alphaIfDeleted ${i}`);
    close(it.omegaIfDeleted, e.omegaIfDeleted[i], 2e-6, `omegaIfDeleted ${i}`);
    close(it.scaleMeanIfDeleted, e.scaleMean[i], 1e-9, `scaleMean ${i}`);
    close(it.scaleVarIfDeleted, e.scaleVar[i], 1e-9, `scaleVar ${i}`);
  });
  r.itemMeans.forEach((m, i) => close(m, e.means[i], 1e-12, `mean ${i}`));
  r.itemSds.forEach((s, i) => close(s, e.sds[i], 1e-12, `sd ${i}`));
}

test('reliability() matches mariposa 0.7.3: seven items, weighted, three, four and two items', () => {
  same(reliability(items([29, 30, 31, 32, 33, 34, 35])), all7, 'all7');
  same(reliability(items([29, 30, 31, 32, 33, 34, 35]), w), all7w, 'all7w');
  same(reliability(items([31, 32, 33])), t313233, 't313233');
  same(reliability(items([29, 30, 34, 35])), rest4, 'rest4');
  same(reliability(items([31, 32])), two, 'two');
});

test('omega is the exact one-factor ML optimum (factanal with factr = 1)', () => {
  // factanal(covmat = cor(X), factors = 1, control = list(opt = list(factr = 1, pgtol = 0, maxit = 10000)))
  const r = reliability(items([29, 30, 31, 32, 33, 34, 35]));
  assert.ok(Math.abs(r.omega - 0.7450827212930571) < 1e-9, String(r.omega));
  assert.ok(Math.abs(r.omegaStd - 0.7253939640288943) < 1e-9, String(r.omegaStd));
  assert.equal(r.omegaBoundary, false);
  // Drei Fragen: gerade identifiziert, λᵢ² = rᵢⱼ·rᵢₖ / rⱼₖ
  const R = [[1, 0.5, 0.4], [0.5, 1, 0.3], [0.4, 0.3, 1]];
  const one = omegaOneFactor(R, R);
  assert.ok(Math.abs(one.lambda[0] ** 2 - (0.5 * 0.4) / 0.3) < 1e-10);
  assert.ok(Math.abs(one.psi[2] - (1 - (0.4 * 0.3) / 0.5)) < 1e-10);
  // Heywood-Fall: λ² > 1 geht nicht, die Einzigartigkeit bleibt an der Grenze 0,005 hängen.
  const H = [[1, 0.9, 0.9], [0.9, 1, 0.5], [0.9, 0.5, 1]];
  assert.equal(omegaOneFactor(H, H).boundary, true);
  assert.ok(Number.isNaN(omegaOneFactor([[1, 0.3], [0.3, 1]], [[1, 0.3], [0.3, 1]]).omega));
});

test('reliability() drops incomplete cases listwise and returns NaN below two cases', () => {
  const a = [1, 2, 3, NaN, 5], b = [2, 2, 4, 4, NaN], c = [1, 3, 3, 5, 5];
  const r = reliability([a, b, c]);
  assert.equal(r.n, 3);
  assert.equal(reliability([a, b, c], [1, NaN, 1, 1, 1]).n, 2);
  const none = reliability([[1, NaN], [NaN, 2]]);
  assert.equal(none.n, 0);
  assert.ok(Number.isNaN(none.alpha));
  assert.deepEqual(none.items, []);
  assert.ok(Number.isNaN(reliability([a, b, c], null, { omega: false }).omega));
});

test('row_means() and row_sums() follow mariposa: NaN without valid values or below min_valid', () => {
  const x = [1, NaN, NaN, 4], y = [3, 2, NaN, NaN], z = [5, 4, NaN, 2];
  assert.deepEqual([...rowMeans([x, y, z])], [3, 3, NaN, 3]);
  assert.deepEqual([...rowMeans([x, y, z], 3)], [3, NaN, NaN, NaN]);
  assert.deepEqual([...rowMeans([x, y, z], 2)], [3, 3, NaN, 3]);
  assert.deepEqual([...rowSums([x, y, z])], [9, 6, NaN, 6]);
  assert.deepEqual([...rowSums([x, y, z], 3)], [9, NaN, NaN, NaN]);
  // Testdatei gegen R: row_means(pick(pa31, pa32, pa33), min_valid = 3) usw. (Zahl gültiger Werte und Summe)
  const agg = (v: Float64Array) => { const ok = [...v].filter(Number.isFinite); return [ok.length, ok.reduce((s, t) => s + t, 0)]; };
  const kurz = rowMeans(items([31, 32, 33]), 3), rest = rowMeans(items([29, 30, 34, 35]), 4);
  const near = ([n, s]: number[], [en, es]: number[]) => n === en && Math.abs(s - es) < 1e-9;
  assert.ok(near(agg(kurz), [36, 100.33333333333336]));
  assert.ok(near(agg(rest), [37, 85.75]));
  assert.ok(near(agg(rowMeans(items([31, 32, 33]))), [41, 117.83333333333336]));
  assert.ok(near(agg(rowSums(items([31, 32, 33]), 2)), [41, 336]));
  // pearson_cor(kurz, rest), mit weights = wghtpew und ohne min_valid
  assert.ok(Math.abs(pearson(kurz, rest) - 0.684534633329989) < 1e-12);
  assert.ok(Math.abs(pearson(kurz, rest, w) - 0.6602941649500829) < 1e-12);
  assert.ok(Math.abs(pearson(rowMeans(items([31, 32, 33])), rowMeans(items([29, 30, 34, 35]))) - 0.7334682837195342) < 1e-12);
});
