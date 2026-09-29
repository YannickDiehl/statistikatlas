import test from 'node:test';
import assert from 'node:assert/strict';
import { fakeSav, fixtureSav } from '../../sandbox/testData';
import { ben, S02_VARS, sheets, type S02Var } from './content';
import { benEntries, checkCell, checkNumbers, countCode, decodeRow, diffEntries, emptyEntries, encodeRow, factorPosition, gradeCell, initialS02, parseS02, plenumLines, scanCode, statusS02 } from './domain';

const labels = {
  pa02a: { [-9]: 'KEINE ANGABE', 1: 'SEHR STARK', 2: 'STARK', 3: 'MITTEL', 4: 'WENIG', 5: 'UEBERHAUPT NICHT' },
  pa01: { [-42]: 'DATENFEHLER: MFN', [-9]: 'KEINE ANGABE', 1: 'LINKS', 2: '..', 3: '..', 4: '..', 5: '..', 6: '..', 7: '..', 8: '..', 9: '..', 10: 'RECHTS' },
  pt03: { [-11]: 'TNZ: SPLIT', [-9]: 'KEINE ANGABE', 1: 'GAR KEIN VERTRAUEN', 2: '..', 3: '..', 4: '..', 5: '..', 6: '..', 7: 'GROSSES VERTRAUEN' },
  st01: { [-42]: 'DATENFEHLER: MFN', [-11]: 'TNZ: SPLIT', [-9]: 'KEINE ANGABE', [-8]: 'WEISS NICHT', 1: 'MAN KANN TRAUEN', 2: 'MUSS VORSICHTIG SEIN', 3: 'KOMMT DARAUF AN', 4: 'SONSTIGES' },
  pv01: { [-9]: 'KEINE ANGABE', [-8]: 'WEISS NICHT', 1: 'CDU-CSU', 2: 'SPD', 3: 'FDP', 4: 'DIE GRUENEN', 6: 'DIE LINKE', 42: 'AFD', 90: 'ANDERE PARTEI', 91: 'WUERDE NICHT WAEHLEN' },
  ls01: { [-9]: 'KEINE ANGABE', 0: 'GANZ UNZUFRIEDEN', 1: '..', 2: '..', 3: '..', 4: '..', 5: '..', 6: '..', 7: '..', 8: '..', 9: '..', 10: 'GANZ ZUFRIEDEN' },
};
const sav = fakeSav({
  mode: { values: [2, 3, 4, 4, 4, 4], labels: { 2: 'CAPI', 3: 'CAWI', 4: 'MAIL' } },
  pa02a: { values: [1, 2, 3, 4, 5, 2], labels: labels.pa02a, missingFrom: -1 },
  pa01: { values: [3, 5, -42, -42, 8, 2], labels: labels.pa01, missingFrom: -1 },
  pt03: { values: [1, -11, 7, -42, 2, 3], labels: labels.pt03, missingFrom: -1 },
  st01: { values: [-8, 1, -11, 3, 2, -8], labels: labels.st01, missingFrom: -1 },
  pv01: { values: [1, 42, 6, 91, -8, 2], labels: labels.pv01, missingFrom: -1 },
  ls01: { values: [0, 8, 10, 7, -9, 5], labels: labels.ls01, missingFrom: -1 },
});

test('checks a cell against the codebook without giving the answer away', () => {
  assert.equal(checkCell(sav, 'pv01', '').state, 'empty');
  assert.match((checkCell(sav, 'pv01', 'Linke') as { message: string }).message, /als Zahl/);
  assert.match((checkCell(sav, 'pa01', '5,5') as { message: string }).message, /Doppelkreuz ist eine Entscheidung/);
  assert.match((checkCell(sav, 'pv01', '5') as { message: string }).message, /pv01 hat keinen Code 5/);
  assert.deepEqual(checkCell(sav, 'pv01', '6'), { state: 'ok', code: 6 });
  assert.deepEqual(checkCell(sav, 'ls01', '0'), { state: 'ok', code: 0 });
});

test('grades clear cells, leaves open cells to the student and explains typical slips', () => {
  const s1 = sheets[0], s2 = sheets[1], s3 = sheets[2];
  assert.equal(gradeCell(sav, s1, 'pv01', '6').status, 'match');
  assert.equal(gradeCell(sav, s1, 'pa02a', '5').status, 'mismatch');
  assert.match(gradeCell(sav, s1, 'st01', '-9').message ?? '', /stand in Version A gar nicht/);
  assert.equal(gradeCell(sav, s1, 'st01', '-11').status, 'match');
  assert.equal(gradeCell(sav, s2, 'pa01', '5').status, 'open');
  assert.equal(gradeCell(sav, s2, 'pa01', '').status, 'empty');
  assert.match(gradeCell(sav, s3, 'ls01', '-9').message ?? '', /gültige Antwort/);
  assert.equal(gradeCell(sav, s3, 'pt03', '1').status, 'match');
});

test('compares a double entry with Ben and round-trips a partner row code', () => {
  const mine = emptyEntries();
  const codeOf = (v: S02Var, label: string) => String([...sav.byName.get(v)!.valueLabels].find(([, l]) => l === label)![0]);
  for (const sheet of sheets) for (const v of S02_VARS) {
    const soll = sheet.cells[v].soll;
    mine[sheet.id][v] = soll.kind === 'value' ? String(soll.value) : soll.kind === 'label' ? codeOf(v, soll.label) : '5';
  }
  const benRows = benEntries(sav);
  assert.equal(benRows['1'].pa02a, '5');
  assert.equal(benRows['1'].st01, '');
  assert.equal(benRows['3'].ls01, '-9');
  const d = diffEntries(mine, benRows).map(x => `${x.sheet}.${x.variable}`);
  assert.deepEqual(d, ['1.pa02a', '1.st01', '1.pv01', '2.st01', '2.ls01', '3.ls01']);
  assert.equal(Object.keys(ben).length, 3);
  const code = encodeRow(mine);
  assert.deepEqual(decodeRow(code), mine);
  assert.equal(decodeRow('kaputt'), null);
});

test('counts codes by mode, scans for paper-only codes and mirrors to_numeric(to_label())', () => {
  assert.equal(countCode(sav, 'pa01', -42, 4), 2);
  assert.equal(countCode(sav, 'st01', -8, 4), 1);
  assert.equal(countCode(sav, 'st01', -8), 2);
  const scan = scanCode(sav, -42);
  assert.deepEqual(scan, { total: 3, variables: 2, byMode: [{ label: 'CAPI', n: 0 }, { label: 'CAWI', n: 0 }, { label: 'MAIL', n: 3 }] });
  assert.equal(factorPosition(sav, 'pv01').get(42), 4);
  const notes = checkNumbers(sav, { mfn: '2', dk: '1', afd: '4' });
  assert.deepEqual(notes.map(n => n.tone), ['ok', 'ok', 'ok']);
  assert.equal(checkNumbers(sav, { mfn: '9', dk: '', afd: '42' }).map(n => n.tone).join(), 'warn,warn');
  const real = fixtureSav();
  assert.equal(factorPosition(real, 'pv01').get(1), 1);
});

test('restores state defensively and reports status and plenum line', () => {
  assert.deepEqual(parseS02(undefined), initialS02());
  const s = parseS02({ entries: { 2: { pa02a: '4', pa01: 5, x: '1' } }, rules: { '2.pa01': 'Bei zwei Kreuzen: −42.' }, numbers: { afd: '6' } });
  assert.equal(s.entries['2'].pa02a, '4');
  assert.equal(s.entries['2'].pa01, '');
  assert.equal(s.rules['2.pa01'], 'Bei zwei Kreuzen: −42.');
  assert.equal(statusS02(initialS02()), 'open');
  assert.equal(statusS02(s), 'running');
  assert.deepEqual(plenumLines(s)[0], ['Zeile für Bogen 2', '4 | – | – | – | – | –']);
  assert.equal(plenumLines(s)[1][1], 'Bei zwei Kreuzen: −42.');
});
