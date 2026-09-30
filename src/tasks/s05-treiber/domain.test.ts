import test from 'node:test';
import assert from 'node:assert/strict';
import { fakeSav, fixtureSav } from '../../sandbox/testData';
import { cardById } from './content';
import {
  cardValues, checkEntry, checkLevel, checkStamp, checkStrata, direction, driverQuestion, fitNotes, initialS05, parseS05, pickCard, plenumLines, prepare,
  randomCard, ranks, rCodeFor, reveal, revealNotes, scaffoldFor, stampReading, statusS05, strata, tolerance, variants,
} from './domain';

const p = prepare(fixtureSav());
const ep01 = cardById.ep01, vars = variants(p, ep01);
const value = (measure: string, weighted: boolean, stratum = -1, reversed = true) =>
  vars.find(v => v.measure === measure && v.weighted === weighted && v.stratum === stratum && v.reversed === reversed)!.value;
const fmt = (x: number) => x.toFixed(3).replace('.', ',');

test('reverses ps03, recodes cards like rec() and groups the economy as a third variable', () => {
  const sav = fakeSav({
    ps03: { values: [1, 6, -11, 3], missingFrom: -1 }, ep01: { values: [1, 3, 5, -9], missingFrom: -1 }, wghtpew: { values: [1, 1, 1, 1] },
    eastwest: { values: [1, 2, 1, 2] }, rd01: { values: [2, 3, 5, 6], missingFrom: -1 }, educ: { values: [1, 5, 6, 7], missingFrom: -1 },
  });
  const q = prepare(sav);
  assert.deepEqual([...q.y], [6, 1, NaN, 4]);
  assert.deepEqual([...q.lage], [1, 2, 3, NaN]);
  assert.deepEqual([...cardValues(q, cardById.konf)], [1, 2, 3, 4]);
  assert.deepEqual([...cardValues(q, cardById.educ5)], [1, 5, NaN, NaN]);
  assert.deepEqual(strata(q, cardById.eastwest).map(s => s.label), ['Wirtschaftslage gut', 'Wirtschaftslage teils/teils', 'Wirtschaftslage schlecht']);
});

test('computes every variant: measure × weight × region × coding of ps03', () => {
  assert.equal(vars.length, 60);
  assert.equal(variants(p, cardById.eastwest).length, 80);
  assert.equal(value('gamma', true, -1, false), -value('gamma', true));
  assert.equal(value('rho', true), value('rho', false));
  assert.equal(tolerance('0,54'), 0.005 + 1e-9);
  assert.equal(tolerance('0,5'), null);
});

test('the value detector names which variant a number is', () => {
  const check = (measure: 'gamma' | 'tau' | 'rho', weighted: boolean, input: string) => checkEntry(p, ep01, vars, { measure, weighted, value: input });
  assert.match(check('gamma', true, fmt(value('gamma', true)))[0].text, /^Stimmt: Gamma mit Gewicht/);
  assert.match(check('gamma', true, fmt(value('gamma', false)))[0].text, /Gamma ohne Gewicht.*weights = wghtpew/);
  assert.match(check('gamma', true, fmt(-value('gamma', true)))[0].text, /Originalkodierung.*umgepolt/);
  assert.match(check('tau', true, fmt(value('tau', false, 0)))[0].text, /\(West\).*ganz Deutschland/);
  assert.match(check('tau', true, fmt(value('gamma', true)))[0].text, /Gamma mit Gewicht.*Tau-b gewählt/);
  assert.match(check('gamma', true, '0,5')[0].text, /drei Nachkommastellen/);
  assert.match(check('gamma', true, '0,999')[0].text, /finde ich für diese Karte nicht/);
  assert.match(check('rho', true, fmt(value('rho', true)))[0].text, /nur zur Fallauswahl/);
  assert.deepEqual(checkStrata(p, ep01, vars, 'tau', [fmt(value('tau', false, 0)), fmt(value('tau', true, 1))]).map(n => n.tone), ['ok', 'ok']);
});

test('reads the stamp by the disclosed rule (real ALLBUS values)', () => {
  assert.equal(stampReading(-0.387, [-0.367, -0.436], true), 'trägt');
  assert.equal(stampReading(-0.136, [-0.109, -0.076], true), 'schrumpft');
  assert.equal(stampReading(-0.057, [-0.063, -0.136], true), 'nur in einem Landesteil');
  assert.equal(stampReading(0.059, [0.095, -0.045], true), 'kehrt sich um');
  assert.equal(stampReading(-0.028, [-0.040, 0.005], true), 'nur in einem Landesteil');
  assert.match(checkStamp(p, ep01, vars, 'tau', 'kehrt sich um')[0].text, /die Entscheidung bleibt bei dir/);
});

test('gives fit prompts without grading', () => {
  const konf = cardById.konf, kv = variants(p, konf);
  assert.match(fitNotes(p, konf, kv, 'gamma')[0].text, /willkürlich.*\/.*\//);
  assert.match(fitNotes(p, ep01, vars, 'phi')[0].text, /Vierfeldertafeln/);
  assert.match(fitNotes(p, ep01, vars, 'gamma')[0].text, /Bindungen.*dem Betrag nach größer als Tau-b/);
  assert.match(fitNotes(p, ep01, vars, 'r')[0].text, /gleiche Abstände/);
  assert.match(fitNotes(p, cardById.age, variants(p, cardById.age), 'V')[0].text, /Zufalls-V/);
  assert.doesNotMatch(fitNotes(p, ep01, vars, 'gamma', false)[0].text, /γ|τ/);
  assert.doesNotMatch(fitNotes(p, cardById.age, variants(p, cardById.age), 'V', false)[0].text, /≈/);
  assert.doesNotMatch(fitNotes(p, cardById.konf, variants(p, cardById.konf), 'gamma', false)[0].text, /\d,\d{3}/);
  assert.equal(checkLevel(cardById.pa01, 'ordinal')[0].tone, 'ok');
  assert.equal(checkLevel(ep01, 'nominal')[0].tone, 'hint');
  assert.equal(direction(ep01, -0.5), 'Wer die Wirtschaftslage schlechter einschätzt, ist eher unzufriedener mit der Demokratie.');
  assert.equal(direction(ep01, 0.02), 'Der Zusammenhang ist so schwach, dass sich keine Richtung angeben lässt.');
  assert.match(driverQuestion('Die Wirtschaftslage treibt die Zufriedenheit')[0].text, /Drittvariable/);
  assert.deepEqual(driverQuestion('hängt zusammen'), []);
});

test('reveals the ranking in four currencies', () => {
  assert.deepEqual(ranks({ ep01: -0.5, age: 0.1, konf: NaN, pt03: 0.6 }), { pt03: 1, ep01: 2, age: 3 });
  const r = reveal(p);
  assert.ok(Number.isNaN(r.west.eastwest.V));
  assert.ok(Number.isNaN(r.weighted.konf.gamma) && Number.isNaN(r.weighted.konf.r) && Number.isFinite(r.weighted.konf.V));
  // Die Testdatei hat im Alter in West und Ost dasselbe Vorzeichen – die ALLBUS-Bemerkung darf dann nicht erscheinen.
  const notes = revealNotes(r, 'weighted');
  assert.ok(notes.length >= 1);
  assert.ok(notes.every(n => !/verschiedene Richtungen/.test(n)));
});

test('writes the R script for each kind of card', () => {
  assert.match(rCodeFor(cardById.konf), /zufriedenheit = rec\(ps03, rules = "rev"\),   # umgepolt: höher = zufriedener\n    konf = rec\(rd01, rules = "1:2=1 \[evangelisch\]; 3=2 \[katholisch\]; 4:5=3 \[andere\]; 6=4 \[keine\]; else=NA"\)\)/);
  assert.match(rCodeFor(ep01), /^library\(dplyr\)\nlibrary\(mariposa\)/);
  assert.match(rCodeFor(cardById.konf), /group_by\(eastwest\) %>% cramers_v\(zufriedenheit, konf\)/);
  assert.match(rCodeFor(ep01), /unlabel\(zufriedenheit, ep01, wghtpew\) %>% kendall_tau\(zufriedenheit, ep01, weights = wghtpew\)/);
  assert.match(rCodeFor(cardById.age), /pearson_cor\(zufriedenheit, age, weights = wghtpew\)/);
  assert.doesNotMatch(rCodeFor(cardById.age), /crosstab/);
  assert.match(rCodeFor(cardById.eastwest), /filter\(lage == 3\) %>% goodman_gamma\(zufriedenheit, eastwest\)/);
  assert.match(scaffoldFor(ep01), /rules = "___"/);
  assert.match(scaffoldFor(cardById.konf), /konf = rec\(rd01, rules = "___"\)/);
  assert.match(scaffoldFor(cardById.eastwest), /filter\(lage == ___\) %>% goodman_gamma\(zufriedenheit, eastwest\)/);
});

test('restores state defensively, reports status and builds the plenum card', () => {
  assert.deepEqual(parseS05(null), initialS05());
  const s = parseS05({ card: 'xx', measure: 'gamma', stamp: 'trägt', strata: ['-0,5', 7] });
  assert.equal(s.card, null);
  assert.deepEqual(s.strata, ['-0,5', '', '']);
  const done = { ...initialS05(), card: 'ep01' as const, measure: 'gamma' as const, value: '-0,544', stamp: 'trägt' as const, sentence: 'Satz', recommendation: 'Empfehlung',
    second: { measure: 'tau' as const, value: '-0,387', unweighted: '', veto: true } };
  assert.equal(statusS05(initialS05()), 'open');
  assert.equal(statusS05({ ...initialS05(), card: 'age' }), 'running');
  assert.equal(statusS05(done), 'done');
  assert.deepEqual(plenumLines(done).slice(0, 4), [['Kandidat', 'Wirtschaftslage in Deutschland (ep01)'], ['Maß = Wert · Stempel', 'Gamma = -0,544 · trägt'], ['Zweite Währung', 'Tau-b = -0,387'], ['„Treiber“?', 'Veto: kein Treiber']]);
});

test('the card West oder Ost checks the economy groups with Gamma, whatever measure was chosen', () => {
  const ew = cardById.eastwest, ev = variants(p, ew);
  const g = (s: number) => ev.find(v => v.measure === 'gamma' && !v.weighted && v.stratum === s && v.reversed)!.value;
  assert.deepEqual(checkStrata(p, ew, ev, 'V', [fmt(g(0)), fmt(g(1)), fmt(g(2))]).map(n => n.tone), ['ok', 'ok', 'ok']);
  assert.match(checkStamp(p, ew, ev, 'V', 'trägt')[0].text, /Gamma gesamt/);
});

test('a new card starts the card-bound work from scratch and a draw never repeats the current card', () => {
  const s = { ...initialS05(), mode: 'pair' as const, card: 'ep01' as const, measure: 'gamma' as const, value: '-0,544', stamp: 'trägt' as const, sentence: 'Satz', recommendation: 'Empfehlung',
    second: { measure: 'tau' as const, value: '-0,387', unweighted: '-0,553', veto: true }, view: 'ost' as const };
  assert.deepEqual(pickCard(s, 'age'), { ...initialS05(), mode: 'pair', card: 'age' });
  for (let i = 0; i < 50; i++) assert.notEqual(randomCard('ep01', () => i / 50), 'ep01');
  assert.equal(randomCard('ep01', () => 0.9999999), 'pt03');
});
