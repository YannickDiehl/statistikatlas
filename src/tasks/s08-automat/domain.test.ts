import test from 'node:test';
import assert from 'node:assert/strict';
import { fakeSav, fixtureSav } from '../../sandbox/testData';
import { inputById, INPUTS } from './content';
import {
  checkDisplay, checkLevene, checkSetting, checkSpread, codeNumber, drawVisitors, groupValues, initialS08, knobScore, levelName, leveneVariants,
  machineFor, matchReading, NOT_ESTIMABLE, parade, paradeNotes, parseS08, pickInput, plenumLines, prepare, probeRows, probeTotals, recognisedSetting,
  recognisedSpread, resolution, rSolution, scaffoldSetting, scaffoldSpread, shown, signQuestions, spread, spreadRecognised, statusS08, variants, worseThanLazy,
  type Variant,
} from './domain';

const p = prepare(fixtureSav());
const pt03 = inputById.pt03, vars = variants(p, pt03);
const get = (kind: Variant['kind'], list = vars) => list.find(v => v.kind === kind)!;
const f3 = (x: number) => x.toFixed(3).replace('.', ',').replace('-', '−');
const main = get('main'), unw = get('unweighted');
const entry = (v: Variant) => ({ a: f3(v.a), b: f3(v.b), r2: f3(v.r2) });

test('reverses ps03, groups age like rec() and names the levels', () => {
  const sav = fakeSav({
    ps03: { values: [1, 6, -11, 3], missingFrom: -1 }, wghtpew: { values: [1, 1, 1, 1] }, age: { values: [18, 44, 75, -32], missingFrom: -1 },
  });
  const q = prepare(sav);
  assert.deepEqual([...q.y], [6, 1, NaN, 4]);
  assert.deepEqual([...groupValues(q, inputById.age)], [1, 2, 5, NaN]);
  assert.equal(levelName(pt03, 1), 'Eingabe 1 („gar kein Vertrauen“)');
  assert.equal(levelName(pt03, 4), 'Eingabe 4');
  assert.equal(levelName(inputById.age, 5), 'Alter 75+');
});

test('computes the automaton variants: weight, coding of ps03, swapped axes, age groups', () => {
  assert.deepEqual(vars.map(v => v.kind), ['main', 'unweighted', 'orig', 'origUnweighted', 'swapped', 'swappedUnweighted']);
  assert.ok(Math.abs(get('orig').b + main.b) < 1e-12 && Math.abs(get('orig').a - (7 - main.a)) < 1e-12);
  assert.ok(Math.abs(get('swapped').r2 - main.r2) < 1e-12);
  assert.ok(variants(p, inputById.age).some(v => v.kind === 'grouped'));
  assert.deepEqual(matchReading(0.4652, '0,47'), { x: 0.47, decimals: 2 });
  assert.equal(matchReading(0.4652, '0,5'), null);
  // R druckt mit Punkt: „2.288“ ist 2,288, nicht 2288; describe() lässt Nullen am Ende weg (1,300 → „1.3“)
  assert.deepEqual(matchReading(2.2875, '2.288'), { x: 2.288, decimals: 3 });
  assert.deepEqual(matchReading(2288, '2.288', 0), { x: 2288, decimals: 0 });
  assert.deepEqual(matchReading(1.3, '1.3'), { x: 1.3, decimals: 1 });
  assert.equal(matchReading(1.34, '1.3'), null);
  assert.equal(shown('-0,2170', [-0.217]), '−0,2170');
  assert.equal(shown('1.325', [1.3252]), '1,325');
  assert.equal(shown('9,9', [1.3252]), '9,9 (noch nicht geprüft)');
});

test('the setting detector recognises weighted and unweighted, names every other variant', () => {
  const ok = checkSetting(pt03, vars, entry(main));
  assert.equal(ok[0].tone, 'ok');
  assert.match(ok[0].text, /^Stimmt: Der Automat zeigt 5,126 − 0,217 · Eingabe, gewichtet/);
  assert.equal(recognisedSetting(vars, entry(main)), main);
  assert.match(checkSetting(pt03, vars, entry(unw))[0].text, /ohne Gewicht.*ungewichtet/);
  assert.equal(recognisedSetting(vars, entry(unw)), unw);
  const orig = get('orig');
  const notOk = checkSetting(pt03, vars, { a: f3(orig.a), b: f3(orig.b), r2: f3(orig.r2) });
  assert.equal(notOk.length, 2);
  assert.match(notOk[0].text, /^Konstante: .*ohne Umpolen/);
  assert.match(notOk[1].text, /^Steigung: Mehr Vertrauen in den Bundestag, kleinere Anzeige\?.*rec\(ps03, rules = "rev"\)/);
  assert.equal(recognisedSetting(vars, { a: f3(orig.a), b: f3(orig.b), r2: f3(orig.r2) }), null);
  assert.match(checkSetting(pt03, vars, { ...entry(main), b: f3(get('swapped').b) })[0].text, /Achsen vertauscht/);
  assert.match(checkSetting(pt03, vars, { ...entry(main), b: f3(main.beta) })[0].text, /Beta/);
  assert.match(checkSetting(pt03, vars, { ...entry(main), r2: f3(main.adjR2) })[0].text, /korrigierte R²/);
  assert.match(checkSetting(pt03, vars, { ...entry(main), r2: f3(Math.sqrt(main.r2)) })[0].text, /Wurzel aus R²/);
  assert.match(checkSetting(pt03, vars, { ...entry(main), a: '9,999' })[0].text, /^Konstante: Diesen Wert finde ich nicht/);
  assert.match(checkSetting(pt03, vars, { ...entry(main), a: '5,1' })[0].text, /drei Nachkommastellen/);
  assert.match(checkSetting(pt03, vars, { ...entry(main), a: 'x' })[0].text, /keine Zahl/);
  assert.match(checkSetting(pt03, vars, { ...entry(main), a: f3(unw.a) })[0].text, /nicht alle zur selben Rechnung/);
  assert.deepEqual(checkSetting(pt03, vars, { a: '', b: '', r2: '' }), []);
  const age = variants(p, inputById.age), grouped = get('grouped', age);
  assert.match(checkSetting(inputById.age, age, { ...entry(get('main', age)), b: f3(grouped.b) })[0].text, /Altersgruppen/);
});

test('numbers typed as R prints them (dot decimals) are read as R decimals everywhere', () => {
  const dot = (x: number, d = 3) => x.toFixed(d).replace('-', '−');
  const set = { a: dot(main.a), b: dot(main.b), r2: dot(main.r2) };
  assert.equal(recognisedSetting(vars, set), main);
  assert.match(checkSetting(pt03, vars, set)[0].text, /^Stimmt: Der Automat zeigt 5,126 − 0,217 · Eingabe/);
  const m = machineFor(p, pt03, main, set);
  assert.ok(Math.abs(m.a - 5.126) < 1e-12 && Math.abs(m.b + 0.217) < 1e-12);
  assert.equal(checkDisplay(m, 2, dot(m.a + m.b * 2, 2))[0].tone, 'ok');
  const s = spread(m);
  assert.ok(spreadRecognised(s, dot(s.min), dot(s.max)));
  const lv = leveneVariants(m);
  assert.equal(checkLevene(m, lv, dot(lv.main.F))[0].tone, 'ok');
  // Plenumskarte normalisiert erkannte Werte
  const lines = Object.fromEntries(plenumLines({ ...initialS08(), input: 'pt03', ...set, sdMin: dot(s.min), sdMax: dot(s.max) }, main, null, s));
  assert.equal(lines['b · R²'], `b = ${f3(main.b)} · R² = ${f3(main.r2)}`);
  assert.equal(lines['Daneben je Stufe'], `±${f3(s.min)} bis ±${f3(s.max)}`);
});

test('a model that cannot be estimated gets an explanation instead of a value hint', () => {
  const tiny = prepare(fakeSav({ ps03: { values: [1, 2, 3], missingFrom: -1 }, wghtpew: { values: [1, 1, 1] }, pt03: { values: [4, 4, 4], missingFrom: -1 } }));
  const v = variants(tiny, pt03);
  assert.equal(v.some(x => x.kind === 'main'), false);
  assert.deepEqual(checkSetting(pt03, v, { a: '1,000', b: '', r2: '' }), [{ tone: 'warn', text: NOT_ESTIMABLE }]);
});

test('an unweighted automaton accepts the weighted spread and Levene from the scaffold; the weighted one names the unweighted', () => {
  const u = get('unweighted'), mu = machineFor(p, pt03, u, entry(u));
  const own = spread(mu), weighted = spread(mu, true);
  assert.equal(own.weighted, false);
  assert.notEqual(own.max, weighted.max);
  assert.ok(Math.abs(own.other.max - weighted.max) < 1e-12);
  assert.equal(recognisedSpread(mu, f3(weighted.min), f3(weighted.max))?.weighted, true);
  assert.match(checkSpread(mu, own, f3(weighted.min), f3(weighted.max))[0].text, /mit Gewicht gerechnet, deinen Automaten ohne – beides ist vertretbar/);
  const lvu = leveneVariants(mu);
  assert.notEqual(lvu.main.F, lvu.other.F);
  assert.match(checkLevene(mu, lvu, f3(lvu.other.F))[0].text, /^Stimmt: .*beides ist vertretbar/);
  const mw = machineFor(p, pt03, main, entry(main)), sw = spread(mw), lvw = leveneVariants(mw);
  assert.equal(recognisedSpread(mw, f3(sw.other.min), f3(sw.other.max)), null);
  assert.match(checkSpread(mw, sw, f3(sw.min), f3(sw.other.max))[0].text, /SD ohne Gewicht/);
  assert.match(checkLevene(mw, lvw, f3(lvw.other.F))[0].text, /ohne Gewicht/);
});

test('hand displays: constant + slope × input, with typical slips named', () => {
  const m = machineFor(p, pt03, main, entry(main));
  const at2 = m.a + m.b * 2;
  assert.match(checkDisplay(m, 2, at2.toFixed(2).replace('.', ','))[0].text, /Eingabe 2: 5,126 − 0,217 · 2 = .* – stimmt/);
  assert.match(checkDisplay(m, 2, (m.b * 2).toFixed(2).replace('.', ','))[0].text, /fehlt die Konstante/);
  assert.match(checkDisplay(m, 2, m.a.toFixed(2).replace('.', ','))[0].text, /nur die Konstante/);
  assert.match(checkDisplay(m, 2, '9,99')[0].text, /Rechne Konstante/);
  assert.match(checkDisplay(m, 2, '4')[0].text, /zwei Nachkommastellen/);
  assert.deepEqual(checkDisplay(m, 2, ''), []);
});

test('the visitor sample is the same for the same code and differs for another', () => {
  const m = machineFor(p, pt03, main, entry(main));
  const a = drawVisitors(m, 417), b = drawVisitors(m, 417), c = drawVisitors(m, 418);
  assert.equal(a.length, Math.min(20, m.y.length));
  assert.deepEqual(a, b);
  assert.notDeepEqual(a, c);
  assert.equal(new Set(a).size, a.length);
  const rows = probeRows(m, a), t = probeTotals(rows);
  assert.ok(rows.every(r => r.lazy === m.mean && r.hit === Math.abs(r.y - r.show) <= 1));
  assert.ok(t.hits <= rows.length && t.lazyHits <= rows.length && t.sse > 0);
  assert.equal(codeNumber('417'), 417);
  assert.equal(codeNumber('41'), null);
  assert.equal(codeNumber('41a7'), null);
});

test('the resolution: fewer squared errors is R², hits compare with the lazy machine, the knobs cannot beat OLS', () => {
  const m = machineFor(p, pt03, main, entry(main));
  const r = resolution(m);
  assert.ok(Math.abs(r.reduction - main.r2) < 1e-12);
  assert.ok(r.hit >= 0 && r.hit <= 1 && r.lazyHit >= 0 && r.lazyHit <= 1);
  assert.ok(r.near.every(n => Math.abs(n.value - r.mean) <= 1));
  // „die häufigsten Antworten“ wird berechnet, nicht behauptet
  const byShare = (vals: number[]) => vals.map(v => m.y.reduce((a, y, i) => a + (y === v ? m.w[i] : 0), 0));
  const all = [...new Set(m.y)], near = r.near.map(n => n.value);
  const top = all.sort((x, y) => byShare([y])[0] - byShare([x])[0]).slice(0, near.length);
  assert.equal(r.nearAreTop, near.every(v => top.includes(v)));
  const best = knobScore(m, main.a, main.b).sse;
  assert.ok(Math.abs(best - main.fit.ssResidual) < 1e-9);
  for (const [da, db] of [[0.1, 0], [0, 0.05], [-0.2, 0.02]]) assert.ok(knobScore(m, main.a + da, main.b + db).sse > best);
});

test('residual spread per level: recognised min/max, diagnoses for other weights, overall spread, other levels and means', () => {
  const m = machineFor(p, pt03, main, entry(main)), s = spread(m);
  assert.deepEqual(s.groups.map(g => g.value), [1, 2, 3, 4, 5, 6, 7]);
  assert.ok(s.min <= s.max && s.max / s.min > 1);
  assert.ok(Math.abs(s.sigma - main.fit.sigma) < 1e-12);
  const lo = f3(s.min), hi = f3(s.max);
  assert.ok(spreadRecognised(s, lo, hi));
  assert.ok(spreadRecognised(s, hi, lo));
  assert.equal(checkSpread(m, s, lo, hi)[0].tone, 'ok');
  assert.match(checkSpread(m, s, lo, hi)[0].text, /am ungenauesten bei Eingabe 7/);
  assert.ok(!spreadRecognised(s, lo, '9,999'));
  assert.match(checkSpread(m, s, lo, f3(s.other.max))[0].text, /ohne Gewicht/);
  assert.match(checkSpread(m, s, lo, f3(s.sigma))[0].text, /über alle Befragten/);
  const middle = s.groups.find(g => Number.isFinite(g.sd) && g.sd !== s.min && g.sd !== s.max)!;
  assert.match(checkSpread(m, s, lo, f3(middle.sd))[0].text, /Das ist die SD bei Eingabe/);
  assert.match(checkSpread(m, s, lo, f3(s.groups[1].mean))[0].text, /Mittelwert der Residuen/);
  assert.match(checkSpread(m, s, lo, '9,999')[0].text, /finde ich nicht/);
  assert.match(checkSpread(m, s, lo, '1,3')[0].text, /drei Nachkommastellen/);
  assert.deepEqual(checkSpread(m, s, '', ''), []);
});

test('Levene as a pro extra: mean centre with own weights; other weights and median named', () => {
  const m = machineFor(p, pt03, main, entry(main)), lv = leveneVariants(m);
  assert.match(checkLevene(m, lv, lv.main.F.toFixed(3).replace('.', ','))[0].text, /^Stimmt: F\(6; 12,3\) = .*derselbe Test wie auf demo/);
  assert.match(checkLevene(m, lv, lv.other.F.toFixed(3).replace('.', ','))[0].text, /ohne Gewicht/);
  assert.match(checkLevene(m, lv, lv.median.F.toFixed(3).replace('.', ','))[0].text, /Median/);
  assert.match(checkLevene(m, lv, '99,999')[0].text, /finde ich nicht/);
  assert.deepEqual(checkLevene(m, lv, ''), []);
});

test('sign questions: missing error, overclaim, causal words, missing group – and silence when the sign is fine', () => {
  const m = machineFor(p, pt03, main, entry(main)), s = spread(m);
  const all = signQuestions('Der Automat weiß, wie zufrieden du bist, weil Vertrauen zufrieden macht.', pt03, s).map(n => n.text).join(' | ');
  assert.match(all, /typischerweise daneben\? Im Mittel etwa ±/);
  assert.match(all, /Durchschnitt von Menschen/);
  assert.match(all, /oder geht es auch umgekehrt/);
  assert.match(all, /Für wen liegt er weiter daneben\? Bei Eingabe 7/);
  assert.deepEqual(signQuestions('Er zeigt den Durchschnitt und liegt im Mittel ±1,6 daneben, bei manchen Menschen mehr.', pt03, s), []);
  assert.deepEqual(signQuestions('', pt03, s), []);
  // „weiß“ endet auf ß – die Wortgrenze muss trotzdem greifen; „Weißwein“ nicht
  assert.ok(signQuestions('Er weiß es ±1 daneben bei manchen Menschen.', pt03, s).some(n => /Durchschnitt von Menschen/.test(n.text)));
  assert.ok(!signQuestions('Weißwein ±1 daneben bei manchen Menschen.', pt03, s).some(n => /Durchschnitt von Menschen/.test(n.text)));
  // Ohne erkannte Streuung: dieselben Fragen ohne Zahl
  const plain = signQuestions('Menschen wie du sind so zufrieden.', pt03, null).map(n => n.text);
  assert.ok(plain.every(t => !/\d/.test(t.replace('Schritt 4', ''))), plain.join(' | '));
});

test('the parade covers all ten inputs and counts where the automaton hits less often than the lazy machine', () => {
  const rows = parade(p, true);
  assert.equal(rows.length, INPUTS.length);
  assert.equal(worseThanLazy(rows), rows.filter(r => r.hit < r.lazyHit - 1e-12).length);
  assert.match(paradeNotes(rows)[0], /^Bei \d+ von 10 Eingaben trifft der Automat auf ±1 seltener als der Faulpelz/);
  assert.equal(parade(p, false).length, INPUTS.length);
});

test('state: defensive parse, a new input resets everything that depends on it, status and plenum lines', () => {
  assert.deepEqual(parseS08(null), initialS08());
  assert.deepEqual(parseS08({ input: 'xx', mode: 'drei', guess: 'vielleicht', decision: 'jein', shows: 'no', a: 42 }), initialS08());
  const s = { ...initialS08(), mode: 'pair' as const, code: '417', input: 'pt03' as const, a: '2,288', b: '0,465', r2: '0,346', sdMin: '0,713', sdMax: '1,325', guess: 'Automat' as const, sign: 'Schild', decision: 'nur mit Schild freigeben' as const };
  assert.deepEqual(parseS08(JSON.parse(JSON.stringify(s))), s);
  assert.equal(statusS08(initialS08()), 'open');
  assert.equal(statusS08({ ...initialS08(), input: 'pt03' }), 'running');
  assert.equal(statusS08(s), 'done');
  assert.equal(statusS08({ ...s, guess: '' }), 'running');
  const next = pickInput(s, 'age');
  assert.deepEqual(next, { ...initialS08(), mode: 'pair', code: '417', input: 'age' });
  // Die Zahlen aus s passen nicht zur Testdatei: roh und als „noch nicht geprüft“ markiert
  const lines = Object.fromEntries(plenumLines({ ...s, signedTech: true, signedCurator: true }, recognisedSetting(vars, s), null));
  assert.equal(lines.Eingabe, 'Vertrauen in den Bundestag (pt03)');
  assert.equal(lines['b · R²'], 'b = 0,465 · R² = 0,346 (noch nicht geprüft)');
  assert.equal(lines['Treffer ±1'], '');
  assert.equal(lines['Daneben je Stufe'], '±0,713 bis ±1,325 (noch nicht geprüft)');
  assert.equal(lines.Entscheidung, 'nur mit Schild freigeben (unterschrieben: Technik und Kuratorin)');
});

test('R code: solution for every input, scaffolds with gaps, grouping for age', () => {
  for (const item of INPUTS) {
    const code = rSolution(item);
    assert.match(code, /library\(dplyr\)\nlibrary\(mariposa\)/);
    assert.match(code, new RegExp(`linear_regression\\(demo ~ ${item.id}, weights = wghtpew\\)`));
    assert.match(code, /levene_test\(daneben/);
    assert.doesNotMatch(code, /ifelse|%in%/);
  }
  assert.match(rSolution(inputById.age), /alter_gruppe = rec\(age, rules = "18:29=1 \[18-29\]/);
  assert.match(rSolution(inputById.age), /group_by\(alter_gruppe\)/);
  assert.match(scaffoldSetting(pt03), /rec\(___, rules = "___"\)/);
  assert.match(scaffoldSpread(pt03), /anzeige = ___ \+ ___ \* pt03/);
});
