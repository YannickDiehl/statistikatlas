import test from 'node:test';
import assert from 'node:assert/strict';
import { fakeSav, fixtureSav } from '../../sandbox/testData';
import { checkSign, describeHours, diagnoseSeats, hoursFor, initialS03, largestRemainder, parseS03, plenumLines, quantile6, rawCounts, seatsFor, statusS03 } from './domain';

const pvLabels = { [-50]: 'NICHT WAHLBERECHTIGT', [-42]: 'DATENFEHLER: MFN', [-9]: 'KEINE ANGABE', [-8]: 'WEISS NICHT', [-7]: 'VERWEIGERT', 1: 'CDU-CSU', 2: 'SPD', 6: 'DIE LINKE', 42: 'AFD' };
const rep = (code: number, n: number) => Array(n).fill(code);
const sav = fakeSav({
  pv01: { values: [...rep(1, 50), ...rep(2, 30), ...rep(6, 13), ...rep(42, 7), ...rep(-8, 20), ...rep(-7, 5), ...rep(-50, 5)], labels: pvLabels, missingFrom: -1 },
  work: { values: [...rep(1, 60), ...rep(2, 40), ...rep(4, 30)], labels: { 1: 'VOLLZEIT, GANZTAGS', 2: 'TEILZEIT', 4: 'NICHT ERWERBSTAETIG' } },
  dw15: { values: [...rep(40, 30), ...rep(45, 20), ...rep(50, 10), ...rep(20, 25), ...rep(30, 15), ...rep(-10, 30)], labels: { [-10]: 'TNZ: FILTER' }, missingFrom: -1 },
});
const seats = (entries: Record<number, number>) => new Map(Object.entries(entries).map(([k, v]) => [Number(k), v]));

test('distributes 100 chairs by largest remainders', () => {
  assert.deepEqual([...largestRemainder([[1, 50], [2, 30], [6, 13], [42, 7]])], [[1, 50], [2, 30], [6, 13], [42, 7]]);
  const withDk = seatsFor(rawCounts(sav.byName.get('pv01')!), [1, 2, 6, 42], [-8]);
  assert.deepEqual(Object.fromEntries(withDk), { 1: 42, 2: 25, 6: 11, 42: 6, [-8]: 16 });
});

test('diagnoses which chair rule the entered numbers follow', () => {
  const v = sav.byName.get('pv01')!;
  assert.equal(diagnoseSeats(v, [], seats({ 1: 50, 2: 30, 6: 13, 42: 7 })).kind, 'ok');
  assert.match(diagnoseSeats(v, [-8], seats({ 1: 42, 2: 25, 6: 11, 42: 6, [-8]: 16 })).notes[0].text, /Regel „mit ‚weiß nicht‘“\./);
  const raw = diagnoseSeats(v, [], seats({ 1: 38, 2: 23, 6: 10, 42: 5 }));
  assert.equal(raw.kind, 'raw');
  assert.match(raw.notes[0].text, /Rohprozente.*24 Stühle fehlen/);
  const rounded = diagnoseSeats(v, [-8], seats({ 1: 42, 2: 25, 6: 11, 42: 6, [-8]: 17 }));
  assert.equal(rounded.kind, 'rounded');
  assert.match(rounded.notes[0].text, /einer muss aufstehen.*„weiß nicht“/);
  const other = diagnoseSeats(v, [], seats({ 1: 42, 2: 25, 6: 11, 42: 6, [-8]: 16 }));
  assert.equal(other.kind, 'otherRule');
  assert.match(other.notes[0].text, /passen zur Regel „mit ‚weiß nicht‘“, angekreuzt hast du „nur klare Antworten“/);
  assert.equal(diagnoseSeats(v, [], seats({ 1: 10, 2: 10 })).kind, 'nomatch');
});

test('describes hours like mariposa::describe (SPSS quartiles, SPSS skewness)', () => {
  const d = describeHours([10, 20, 30, 40, 40, 40, 50, 60]);
  assert.equal(d.mean, 36.25);
  assert.equal(d.median, 40);
  assert.equal(d.q1, 22.5);
  assert.equal(d.q3, 47.5);
  assert.ok(Math.abs(d.sd - 15.9799) < 1e-4);
  assert.ok(Math.abs(d.skew - -0.3019528) < 1e-6);
  assert.equal(d.above, 0.625);
  assert.equal(quantile6([1, 2, 3, 4], 0.5), 2.5);
  assert.deepEqual(hoursFor(sav, 'gefragt').length, 100);
  assert.deepEqual(hoursFor(sav, 'vollzeit'), [...rep(40, 30), ...rep(45, 20), ...rep(50, 10)]);
  assert.equal(hoursFor(sav, 'alle0').length, 130);
});

test('names the number on the sign and checks the chairs right of the mean', () => {
  const g = describeHours(hoursFor(sav, 'gefragt'));
  const notes = checkSign(sav, { value: String(g.median).replace('.', ','), measure: 'median', selection: 'gefragt', right: String(Math.round(g.above * 100)) });
  assert.match(notes[0].text, /ist der Median aller Voll- und Teilzeitbeschäftigten/);
  assert.equal(notes[1].tone, 'ok');
  const mixed = checkSign(sav, { value: String(g.median), measure: 'mean', selection: 'gefragt', right: '10' });
  assert.match(mixed[1].text, /nicht der Mittelwert/);
  assert.equal(mixed[2].tone, 'warn');
  assert.deepEqual(checkSign(sav, { value: '', measure: '', selection: '', right: '' }), []);
});

test('restores state and reports status and plenum lines', () => {
  assert.deepEqual(parseS03(null), initialS03());
  const s = parseS03({ rule: [-8, 99, 'x'], seats: { '1': '25', '-8': '13', bad: '1' }, built: true, hallText: 'Ein Stuhl ist ein Prozent.', sign: { value: '40', measure: 'median', selection: 'gefragt', right: '66' } });
  assert.deepEqual(s.rule, [-8]);
  assert.deepEqual(s.seats, { '1': '25', '-8': '13' });
  assert.equal(statusS03(initialS03()), 'open');
  assert.equal(statusS03(s), 'done');
  const lines = plenumLines(s);
  assert.deepEqual(lines[0], ['Stuhlregel', 'mit „weiß nicht“']);
  assert.equal(lines[1][1], '25 · 13 · –');
  assert.equal(lines[2][1], '40 Stunden (Median aller Voll- und Teilzeitbeschäftigten)');
  const real = fixtureSav();
  assert.ok(hoursFor(real, 'gefragt').every(h => h > 0));
});
