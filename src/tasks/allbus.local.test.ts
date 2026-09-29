// Läuft nur mit der eigenen GESIS-Datei: ALLBUS_SAV=/pfad/ZA8831_v1-3-0.sav pnpm test
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readSav, type SavFile } from '../sandbox/readSav';
import { askedCount, findVar } from './s01-schon-gefragt/domain';
import { S02_VARS, sheets } from './s02-datenerfassung/content';
import { countCode, factorPosition, gradeCell, scanCode } from './s02-datenerfassung/domain';
import { describeHours, diagnoseSeats, hoursFor, rawCounts, seatsFor, validCodes } from './s03-stuehle/domain';

const file = process.env.ALLBUS_SAV;
const skip = !file && 'ALLBUS_SAV nicht gesetzt';
let cached: SavFile | null = null;
const load = () => {
  if (cached) return cached;
  const bytes = readFileSync(file!);
  return (cached = readSav(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)));
};
const names = (sav: SavFile, p: string) => { const r = findVar(sav, p); return r.ok ? r.hits.map(v => v.name) : []; };
const r1 = (x: number) => Math.round(x * 10) / 10;

test('session 1: search hits and asked counts match the concept', { skip }, () => {
  const sav = load();
  assert.equal(sav.nCases, 5246);
  assert.equal(sav.variables.length, 579);
  assert.deepEqual(names(sav, 'horoskop'), ['rh08b']);
  assert.deepEqual(names(sav, 'flüchtling'), []);
  assert.deepEqual(names(sav, 'angst'), []);
  assert.deepEqual(names(sav, 'fluecht'), ['mi05', 'mp16', 'mp17', 'mp18', 'mp19']);
  assert.equal(names(sav, 'vertrauen').length, 16);
  assert.deepEqual(names(sav, 'einsam'), ['dp03']);
  assert.equal(askedCount(sav.byName.get('rh08b')!), 5246);
  assert.equal(askedCount(sav.byName.get('pt03')!), 3650);
  assert.equal(askedCount(sav.byName.get('mp16')!), 3599);
});

test('session 2: paper-only codes, factor positions and sheet grading', { skip }, () => {
  const sav = load();
  assert.equal(countCode(sav, 'mode', 4), 1656);
  assert.equal(countCode(sav, 'pa01', -42, 4), 24);
  assert.equal(countCode(sav, 'pa01', -42), 24);
  assert.equal(countCode(sav, 'st01', -8, 4), 0);
  assert.equal(countCode(sav, 'pt03', -11, 4), 798);
  assert.equal(factorPosition(sav, 'pv01').get(42), 6);
  assert.deepEqual(scanCode(sav, -42), { total: 638, variables: 202, byMode: [{ label: 'CAPI', n: 0 }, { label: 'CAWI', n: 0 }, { label: 'MAIL', n: 638 }] });
  assert.equal(gradeCell(sav, sheets[0], 'pv01', '6').status, 'match');
  assert.equal(gradeCell(sav, sheets[1], 'pt03', '-11').status, 'match');
  assert.equal(gradeCell(sav, sheets[2], 'pt03', '1').status, 'match');
  assert.equal(gradeCell(sav, sheets[2], 'pv01', '-9').status, 'match');
  for (const sheet of sheets) for (const v of S02_VARS) {
    const soll = sheet.cells[v].soll;
    if (soll.kind === 'open') continue;
    const code = soll.kind === 'value' ? soll.value : [...sav.byName.get(v)!.valueLabels].find(([, l]) => l.toUpperCase() === soll.label.toUpperCase())?.[0];
    assert.notEqual(code, undefined, `Bogen ${sheet.id}, ${v}`);
    assert.equal(gradeCell(sav, sheet, v, String(code)).status, 'match', `Bogen ${sheet.id}, ${v}`);
  }
});

test('session 3: chairs per rule, diagnoses and hours match the concept', { skip }, () => {
  const sav = load();
  const pv = sav.byName.get('pv01')!, counts = rawCounts(pv), valid = validCodes(pv);
  const seat = (rule: number[]) => Object.fromEntries(seatsFor(counts, valid, rule));
  assert.deepEqual(seat([]), { 1: 25, 2: 20, 3: 8, 4: 19, 6: 6, 42: 12, 90: 4, 91: 6 });
  const dk = seat([-8]);
  assert.deepEqual([dk[1], dk[2], dk[4], dk[42], dk[3], dk[6], dk[-8]], [22, 17, 16, 10, 7, 6, 13]);
  const all = seat([-8, -7, -50, -9, -42]);
  assert.deepEqual([all[1], all[2], all[4], all[42], all[3], all[6], all[-8], all[-7], all[-50]], [19, 15, 14, 9, 6, 5, 11, 6, 4]);
  const entered = (m: Record<number, number>) => new Map(Object.entries(m).map(([k, v]) => [Number(k), v]));
  const raw = diagnoseSeats(pv, [], entered({ 1: 19, 2: 15, 3: 6, 4: 14, 6: 5, 42: 9, 90: 3, 91: 4 }));
  assert.equal(raw.kind, 'raw');
  assert.equal(raw.sum, 75);
  const rounded = diagnoseSeats(pv, [], entered({ 1: 25, 2: 20, 3: 8, 4: 19, 6: 7, 42: 12, 90: 4, 91: 6 }));
  assert.equal(rounded.kind, 'rounded');
  assert.match(rounded.notes[0].text, /DIE LINKE/);
  const g = describeHours(hoursFor(sav, 'gefragt'));
  assert.deepEqual([g.n, r1(g.mean), g.median, g.q1, g.q3, r1(g.sd), Math.round(g.skew * 100) / 100, Math.round(g.above * 1000) / 10], [2945, 37.9, 40, 35, 41.5, 9.9, -0.25, 66.2]);
  const v = describeHours(hoursFor(sav, 'vollzeit'));
  assert.deepEqual([v.n, r1(v.mean), v.median, v.q1, v.q3, Math.round(v.skew * 100) / 100], [2172, 41.7, 40, 39, 44, 0.97]);
  const a = describeHours(hoursFor(sav, 'alle0'));
  assert.deepEqual([a.n, r1(a.mean), a.median], [5208, 21.4, 25]);
});
