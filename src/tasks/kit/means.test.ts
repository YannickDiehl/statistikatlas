import test from 'node:test';
import assert from 'node:assert/strict';
import { fakeSav, fixtureSav } from '../../sandbox/testData';
import { corMatrix, describeGroups, mean, oneSampleT, onewayAnova, pearsonTest, qtukey, tTest, tukeyHSD } from './means';
import { validValues } from './stats';

// Referenzwerte: mariposa 0.7.3 (R 4.5.3) auf der synthetischen Testdatei, gedruckt mit sprintf("%.17g", …).
// Aufbereitung wie im Lösungsskript von Sitzung 6: exp <- filter(mode != 2), online <- filter(mode == 3).
const near = (actual: number, expected: number, tol = 1e-8) =>
  assert.ok(Math.abs(actual - expected) <= tol * Math.max(1, Math.abs(expected)), `${actual} ≠ ${expected}`);
const all = (actual: number[], expected: number[], tol = 1e-8) => {
  assert.equal(actual.length, expected.length);
  actual.forEach((a, i) => near(a, expected[i], tol));
};

const sav = fixtureSav();
const col = (name: string) => validValues(sav.byName.get(name)!);
const mode = col('mode'), xr21 = col('xr21'), version = col('splt23_3');
const inScope = (keep: (m: number) => boolean) => (x: Float64Array) => Float64Array.from(x, (v, i) => (keep(mode[i]) ? v : NaN));
const exp = inScope(m => m !== 2), online = inScope(m => m === 3);
const zusage = Float64Array.from(xr21, v => (v === 1 ? 1 : v === 2 ? 0 : NaN));
const betrag = Float64Array.from(version, v => (v === 1 || v === 2 ? 5 : v === 3 || v === 4 ? 10 : NaN));
const wiederholung = Float64Array.from(version, v => (v === 1 || v === 3 ? 0 : v === 2 || v === 4 ? 1 : NaN));
const papier = Float64Array.from(mode, v => (v === 3 ? 0 : v === 4 ? 1 : NaN));
const age = col('age'), w = col('wghtpew');

test('qtukey matches R (secant iterations of nmath)', () => {
  all([qtukey(0.95, 4, 12), qtukey(0.95, 4, 1519), qtukey(0.95, 3, 5.5), qtukey(0.99, 6, 40), qtukey(0.95, 4, 30.37), qtukey(0.5, 2, 3)],
    [4.1986602299667037, 3.6371839895933502, 4.4557470487900082, 5.1144878828674987, 3.8427085861529546, 1.081721104555222], 1e-9);
  assert.equal(qtukey(0, 4, 20), 0);
  assert.equal(qtukey(1, 4, 20), Infinity);
  assert.ok(Number.isNaN(qtukey(0.95, 1, 20)) && Number.isNaN(qtukey(0.95, 4, 1)) && Number.isNaN(qtukey(1.2, 4, 20)));
});

test('t_test: Welch and Student, group order of first appearance, effect sizes (unweighted)', () => {
  const rep = tTest(exp(zusage), exp(wiederholung))!;
  assert.deepEqual(rep.levels, [0, 1]);
  assert.deepEqual(rep.n, [26, 7]);
  all(rep.means, [0.42307692307692307, 0.5714285714285714]);
  all([rep.welch.t, rep.welch.df, rep.welch.p, ...rep.welch.ci], [-0.6596362416894066, 9.0889073850959559, 0.52584723903021857, -0.65635132605705926, 0.35964802935376261]);
  all([rep.student.t, rep.student.df, rep.student.p, ...rep.student.ci], [-0.68323889906515234, 31, 0.49953091187062904, -0.5911911617667156, 0.29448786506341895]);
  all([rep.d, rep.g, rep.glass], [-0.29093358608712944, -0.28383764496305308, -0.29444696512350715]);
  // Betrag: in der Testdatei kommt 10 € zuerst vor – mariposa rechnet dann „10 vs. 5“.
  const amt = tTest(exp(zusage), exp(betrag))!;
  assert.deepEqual(amt.levels, [10, 5]);
  all([amt.welch.t, amt.welch.df, amt.welch.p, ...amt.welch.ci], [0.12364372116760602, 29.825689189123455, 0.90242686695309016, -0.34492102544631076, 0.38936546989075527]);
  all([amt.student.t, amt.student.p], [0.12375865841870169, 0.90230532897221427]);
  all([amt.d, amt.g, amt.glass], [0.04326639199573392, 0.042211114142179436, 0.04303314829119359]);
  const onRep = tTest(online(zusage), online(wiederholung))!;
  all([onRep.welch.t, onRep.welch.df, onRep.welch.p, ...onRep.welch.ci], [0.52223296786709361, 11.9016393442623, 0.61109062789246471, -0.45370518846261138, 0.73941947417689713]);
  all([onRep.student.df, onRep.student.p, ...onRep.student.ci], [12, 0.61101326109841803, -0.45315841881448499, 0.73887270452877074]);
  const onAmt = tTest(online(zusage), online(betrag))!;
  assert.deepEqual([onAmt.levels, onAmt.n], [[5, 10], [10, 4]]);
  all([onAmt.welch.t, onAmt.welch.df, onAmt.welch.p, onAmt.student.t, onAmt.student.p], [0.61237243569579447, 4.7900207900207894, 0.56818751533626088, 0.66512879456843177, 0.51854747484585495]);
  all([onAmt.d, onAmt.g, onAmt.glass], [0.39349550147037166, 0.36837876733396496, 0.41403933560541245]);
});

test('t_test with weights: sums of weights replace n, printed n = round(Σw)', () => {
  const rep = tTest(exp(zusage), exp(wiederholung), w)!;
  assert.deepEqual(rep.n, [27, 5]);
  all(rep.means, [0.40726121737038384, 0.6351247272260494]);
  all([rep.welch.t, rep.welch.df, rep.welch.p, ...rep.welch.ci], [-0.84625409099692717, 4.8393468449136838, 0.43724369550571002, -0.92699044139973719, 0.47126342168840601]);
  all([rep.student.t, rep.student.df, rep.student.p, ...rep.student.ci], [-0.89735105718877572, 29.275799999999993, 0.37685219753850741, -0.74699431295205532, 0.29126729324072426]);
  all([rep.d, rep.g, rep.glass], [-0.45004823983403858, -0.4379976706579779, -0.45497366329110644]);
  const amt = tTest(online(zusage), online(betrag), w)!;
  assert.deepEqual(amt.n, [9, 4]);
  all([amt.welch.t, amt.welch.df, amt.welch.p, amt.student.t, amt.student.df, amt.student.p], [0.5194857136601706, 5.4425870550952267, 0.6238560821853415, 0.55986119910779641, 11.224599999999999, 0.5865731306861961]);
  all([amt.d, amt.g, amt.glass], [0.32971977757219195, 0.30580785920636383, 0.35146744765108895]);
});

test('one-sample t_test gives the rate of one version with its interval', () => {
  const a1 = oneSampleT(Float64Array.from(online(zusage), (v, i) => (version[i] === 1 ? v : NaN)))!;
  all([a1.mean, a1.t, a1.df, a1.p, ...a1.ci], [0.80000000000000004, 4, 4, 0.016130089900092539, 0.24471097896044133, 1.3552890210395587]);
  assert.equal(a1.n, 5);
  const b2 = oneSampleT(Float64Array.from(online(zusage), (v, i) => (version[i] === 4 ? v : NaN)), w)!;
  all([b2.mean, b2.t, b2.df, b2.p, ...b2.ci], [0.67500690417011877, 1.297458721209539, 0.8105, 0.45304079343498993, -10.982516946126902, 12.332530754467138]);
  assert.equal(b2.n, 2);
  assert.equal(oneSampleT([1, NaN]), null);
});

test('oneway_anova: classical table, effect sizes, Welch and group statistics (unweighted and weighted)', () => {
  const a = onewayAnova(online(zusage), online(version))!;
  assert.deepEqual([a.levels, a.dfBetween, a.dfWithin], [[1, 2, 3, 4], 3, 10]);
  all([a.F, a.p, a.eta2, a.epsilon2, a.omega2, a.ssBetween, a.ssWithin, a.ssTotal], [0.23809523809523794, 0.86781428148378736, 0.066666666666666638, 0, 0, 0.21428571428571425, 3.0000000000000009, 3.2142857142857153]);
  all([a.welch.F, a.welch.df2, a.welch.p], [0.16142234634181576, 2.6840517684323788, 0.91529472090885755]);
  all(a.groups.map(g => g.mean), [0.8, 0.6, 0.5, 0.5]);
  all([a.groups[1].sd, a.groups[1].se, ...a.groups[1].ci], [0.54772255750516607, 0.24494897427831777, -0.080087380658255602, 1.2800873806582556]);
  assert.deepEqual(a.groups.map(g => g.n), [5, 5, 2, 2]);
  const aw = onewayAnova(online(zusage), online(version), w)!;
  assert.deepEqual([aw.dfBetween, aw.dfWithin], [3, 9]);   // floor(Σw) − k
  all([aw.F, aw.p, aw.eta2, aw.ssBetween, aw.ssWithin, aw.ssTotal], [0.20075917865165271, 0.89327135738515206, 0.062722362866494769, 0.17871432819170857, 2.6705776950074807, 2.8492920231991894]);
  all([aw.welch.F, aw.welch.df2, aw.welch.p], [0.12532460994080119, 2.4989627068472759, 0.93818774466203725]);
  all(aw.groups.map(g => g.mean), [0.79871436282447617, 0.60991025596256587, 0.50006155866540813, 0.67500690417011877]);
  assert.deepEqual(aw.groups.map(g => [g.cases, g.n]), [[5, 6], [5, 3], [2, 2], [2, 2]]);
  all([aw.groups[0].sd, aw.groups[0].se, ...aw.groups[0].ci], [0.43841618578562602, 0.17731052567867872, 0.34595449374944359, 1.2514742318995087]);
  const pooled = onewayAnova(exp(zusage), exp(version))!;
  all([pooled.F, pooled.p, pooled.eta2, pooled.welch.F, pooled.welch.df2, pooled.welch.p], [0.21019998253427621, 0.88850797949308746, 0.021282051282051257, 0.15429711879131916, 4.2488758794180077, 0.9219292785697768]);
  assert.deepEqual(describeGroups(online(zusage), online(version)).map(g => g.mean), a.groups.map(g => g.mean));
});

test('tukey_test: TukeyHSD order unweighted, mariposa combn order weighted', () => {
  const t = tukeyHSD(online(zusage), online(version))!;
  assert.deepEqual(t.map(r => r.label), ['2-1', '3-1', '4-1', '3-2', '4-2', '4-3']);
  const ref = [
    [-0.20000000000000018, -1.2597918514085344, 0.85979185140853409, 0.9366384719366041],
    [-0.29999999999999971, -1.7019728401598493, 1.1019728401598496, 0.91153056175354186],
    [-0.29999999999999993, -1.7019728401598493, 1.1019728401598496, 0.91153056175354163],
    [-0.099999999999999534, -1.5019728401598491, 1.3019728401598498, 0.99608713937524884],
    [-0.099999999999999756, -1.5019728401598491, 1.3019728401598498, 0.99608713937524873],
    [-2.2204460492503131e-16, -1.6756780480688473, 1.6756780480688469, 1],
  ];
  t.forEach((r, i) => all([r.diff, r.lower, r.upper, r.p], ref[i]));
  const tw = tukeyHSD(online(zusage), online(version), w)!;
  assert.deepEqual(tw.map(r => r.label), ['1 - 2', '1 - 3', '1 - 4', '2 - 3', '2 - 4', '3 - 4']);
  const refW = [
    [0.18880410686191029, -1.008075377259793, 1.3856835909836134, 0.95941705403720445, 0.38529050225336148],
    [0.29865280415906803, -0.96763107743917198, 1.5649366857573082, 0.88166575456125518, 0.40763264740421584],
    [0.12370745865435739, -1.2905137434852125, 1.5379286607939273, 0.99250343377687011, 0.45525552446874545],
    [0.10984869729715774, -1.3468860773401758, 1.5665834719344913, 0.99515258906045279, 0.4689411761300471],
    [-0.065096648207552898, -1.6521136435240074, 1.5219203471089018, 0.99920480085037067, 0.51088065533916494],
    [-0.17494534550471064, -1.8149384286326056, 1.4650477376231841, 0.98664056069476402, 0.5279343217701391],
  ];
  tw.forEach((r, i) => all([r.diff, r.lower, r.upper, r.p, r.se], refW[i]));
});

test('pearson_cor with five variables: pairwise n, p and Fisher intervals (unweighted and weighted)', () => {
  const vars = [wiederholung, betrag, papier, age, zusage].map(exp);
  const m = corMatrix(vars);
  all(m.r[0], [1, -0.22075382560965517, -0.56968729189588507, 0.071034294128472411, 0.12179969144117252]);
  all(m.r[2], [-0.56968729189588507, 0.30588235294117661, 1, -0.14847489278606871, -0.32463590555874239]);
  all(m.r[3], [0.071034294128472411, -0.13378522301359611, -0.14847489278606871, 1, -0.022198327511620222]);
  all(m.p[0], [0, 0.18919245185151717, 0.00023297668043086112, 0.68057034043152809, 0.49953091187062904]);
  all(m.p[3], [0.68057034043152809, 0.43663453582864331, 0.38747025533040935, 0, 0.9040147343936864]);
  assert.deepEqual(m.n, [[37, 37, 37, 36, 33], [37, 37, 37, 36, 33], [37, 37, 37, 36, 33], [36, 36, 36, 36, 32], [33, 33, 33, 32, 33]]);
  all(m.ci[0].map(c => c[0]), [1, -0.50840724483059219, -0.75444386643269934, -0.26365442742285644, -0.23117591028723009]);
  all(m.ci[2].map(c => c[1]), [-0.30128174735522462, 0.573100395512955, 1, 0.18929449998419084, 0.021015250302994722]);
  const mw = corMatrix(vars, w);
  all(mw.r[0], [1, -0.15553048912731582, -0.47056015282601665, 0.088094483474469354, 0.16361230496715271]);
  all(mw.r[4], [0.16361230496715271, -0.091697812036037454, -0.42154906921104651, 0.052027985641733235, 1]);
  all(mw.p[2], [0.0036933388533442802, 0.075848977783115348, 0, 0.39373724580993841, 0.017629928052863727]);
  assert.deepEqual(mw.n, [[36, 36, 36, 36, 31], [36, 36, 36, 36, 31], [36, 36, 36, 36, 31], [36, 36, 36, 36, 31], [31, 31, 31, 31, 31]]);
  all(mw.ci[1].map(c => c[0]), [-0.45987851503166616, 1, -0.031997853147782578, -0.44018511100196472, -0.43052720715175924]);
  all(mw.ci[4].map(c => c[1]), [0.48819185723928366, 0.2697845093662839, -0.080810234841090678, 0.40059786069909759, 1]);
});

test('empty groups and degenerate inputs give null or NaN instead of numbers', () => {
  assert.equal(tTest([1, 0, 1], [1, 1, 1]), null);                // nur eine Gruppe
  assert.equal(tTest([1, 0, 1, 0], [1, 2, 3, 1]), null);          // drei Gruppen: t_test() will genau zwei
  assert.equal(tTest([1, 0, 1], [1, 1, 2]), null);                // eine Gruppe mit nur einem Fall
  assert.equal(tTest([1, 1, 1, 1], [1, 1, 2, 2]), null);          // konstante Daten: t.test() bricht ab
  assert.ok(tTest([1, 1, 0, 1], [1, 1, 2, 2]));                   // eine Gruppe ohne Streuung reicht Welch
  assert.equal(onewayAnova([1, 0], [1, 1]), null);
  assert.equal(onewayAnova([1, 0], [1, 2]), null);                // keine Rest-Freiheitsgrade
  assert.equal(tukeyHSD([1], [1]), null);
  const c = pearsonTest([1, 2], [2, 3]);
  assert.ok(Number.isNaN(c.r) && c.n === 2);
  assert.ok(Number.isNaN(pearsonTest([1, 1, 1, 1], [1, 2, 3, 4]).r));
  assert.equal(pearsonTest([1, 2, 3, 4], [2, 4, 6, 8]).p, 0);
  assert.equal(mean([1, NaN, 0, 1]), 2 / 3);
  assert.equal(mean([1, 0], [3, 1]), 0.75);
  const s = fakeSav({ y: { values: [1, 0, -9], missingFrom: -1 } });
  assert.ok(Number.isNaN(validValues(s.byName.get('y')!)[2]));
});
