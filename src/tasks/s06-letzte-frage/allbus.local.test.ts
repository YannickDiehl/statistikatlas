// Läuft nur mit der eigenen GESIS-Datei: ALLBUS_SAV=/pfad/ZA8831_v1-3-0.sav node --import tsx --test …
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readSav } from '../../sandbox/readSav';
import { checkAmount, checkF, checkP, checkR, checkShare, checkT, checkTukey, compute, initialS06, prepare, signedEffect, trap, type Computed, type Scope } from './domain';

const file = process.env.ALLBUS_SAV;
const skip = !file && 'ALLBUS_SAV nicht gesetzt';
let cached: Computed | null = null;
const load = () => {
  if (cached) return cached;
  const bytes = readFileSync(file!);
  return (cached = compute(prepare(readSav(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)))));
};
const r1 = (x: number) => Math.round(x * 10) / 10;
const r3 = (x: number) => Math.round(x * 1000) / 1000;
const welch = (c: Computed, scope: Scope, grouping: 'rep' | 'amt', weighted = false) =>
  c.tests.find(v => v.scope === scope && v.grouping === grouping && v.kind === 'welch' && v.weighted === weighted)!.test;

test('session 7: repetition and amount over all self-completers and online (spec 4.6)', { skip }, () => {
  const c = load(), tr = trap(c)!;
  // Wiederholung über alle Selbstausfüller:innen: 52,7 → 67,7 %, +15,1 Punkte, p < .001; nur online +1,0 (p = .69)
  assert.deepEqual([r1(100 * tr.all[0]), r1(100 * tr.all[1]), r1(100 * (tr.all[1] - tr.all[0]))], [52.7, 67.7, 15.1]);
  assert.deepEqual(tr.n.all, [2357, 759]);
  const all = welch(c, 'all', 'rep'), online = welch(c, 'online', 'rep');
  assert.ok(all.welch.p < 0.001);
  assert.deepEqual([r3(all.welch.t), r1(all.welch.df)], [7.59, 1357.5]);
  assert.deepEqual([r1(100 * tr.online[0]), r1(100 * tr.online[1]), r1(100 * signedEffect(online, 'rep')), Math.round(online.welch.p * 100) / 100], [66.8, 67.7, 1, 0.69]);
  // Betrag: +4,4 (p = .013), online +4,5 (p = .059); auf Papier +3,6 (p = .15)
  const amt = welch(c, 'all', 'amt'), amtOnline = welch(c, 'online', 'amt'), amtPaper = welch(c, 'paper', 'amt');
  assert.deepEqual([r1(100 * signedEffect(amt, 'amt')), r3(amt.welch.p), r3(amt.welch.t)], [4.4, 0.013, -2.491]);
  assert.deepEqual([r1(100 * signedEffect(amtOnline, 'amt')), r3(amtOnline.welch.p)], [4.5, 0.059]);
  assert.deepEqual([r1(100 * signedEffect(amtPaper, 'amt')), Math.round(amtPaper.welch.p * 100) / 100], [3.6, 0.15]);
  assert.deepEqual(amt.levels, [5, 10]);   // mariposa rechnet „5 vs. 10“
  // gewichtet: Wiederholung online +0,2 (p = .93), Betrag online +3,8 (p = .11)
  const repW = welch(c, 'online', 'rep', true), amtW = welch(c, 'online', 'amt', true);
  assert.deepEqual([r1(100 * signedEffect(repW, 'rep')), Math.round(repW.welch.p * 100) / 100, r1(100 * signedEffect(amtW, 'amt')), Math.round(amtW.welch.p * 100) / 100], [0.2, 0.93, 3.8, 0.11]);
});

test('session 7: ANOVA and Tukey online, unweighted and weighted (spec 4.6)', { skip }, () => {
  const c = load(), a = c.anova.online!, aw = c.anova.onlineW!;
  // ANOVA online p = .046, gewichtet .063; F(3, 1519) = 2,68, η² = .005
  assert.deepEqual([a.dfBetween, a.dfWithin, Math.round(a.F * 100) / 100, r3(a.p), r3(a.eta2)], [3, 1519, 2.68, 0.046, 0.005]);
  assert.deepEqual([aw.dfWithin, r3(aw.F), r3(aw.p)], [1556, 2.434, 0.063]);
  assert.deepEqual(a.groups.map(g => r1(100 * g.mean)), [67, 62.6, 66.5, 72.2]);
  assert.deepEqual(a.groups.map(g => g.n), [406, 353, 358, 406]);
  // Tukey: nur B2–A2 signifikant (+9,6 Pp., p = .026); B2–A1 +5,2 (Konzept p = .40, mariposa druckt .395), B2–B1 +5,7 (p = .34, gedruckt .338)
  const t = Object.fromEntries(c.tukey.online!.map(r => [r.label, r]));
  assert.deepEqual([r1(100 * t['4-2'].diff), r3(t['4-2'].p)], [9.6, 0.026]);
  assert.deepEqual([r1(100 * t['4-1'].diff), r3(t['4-1'].p), r1(100 * t['4-3'].diff), r3(t['4-3'].p)], [5.2, 0.395, 5.7, 0.338]);
  const tried = { ...initialS06(), anova: { means: ['', '', '', ''], F: '2.681', p: '' }, tukey: ['4-2' as const], tukeyTried: ['4-2' as const] };
  assert.ok(checkTukey(c, tried).correct);
  assert.ok(!checkTukey(c, { ...tried, tukey: ['4-1' as const], tukeyTried: ['4-1' as const] }).correct);
  // verzerrte ANOVA über alle Selbstausfüller:innen: F = 20,7, p < .001
  const pooled = c.fs.find(v => v.scope === 'all' && v.kind === 'classical' && !v.weighted)!;
  assert.deepEqual([r1(pooled.value), pooled.p < 0.001], [20.7, true]);
  assert.match(checkF(c, '2,681').notes[0].text, /^Stimmt: F\(3; 1519\) = 2,681/);
  assert.match(checkP(c, '0,046').notes[0].text, /^Stimmt: p = 0,046/);
  assert.match(checkP(c, '0,063').notes[0].text, /gewichtete ANOVA/);
  assert.match(checkF(c, '20,690').notes[0].text, /über alle Selbstausfüller:innen/);
});

test('session 7: correlation matrix, cells and the amount = questionnaire half (spec 4.6)', { skip }, () => {
  const c = load(), m = c.matrix.unweighted;
  // Wiederholung × Papier r = −.58; wiederholung × age −.20, papier × age .31, betrag × papier −.02, betrag × age −.00
  assert.deepEqual([m.r[0][2], m.r[0][3], m.r[2][3], m.r[1][2], m.r[1][3], m.r[2][4], m.r[3][4]].map(x => Math.round(x * 100) / 100), [-0.58, -0.2, 0.31, -0.02, -0, -0.22, -0.3]);
  assert.deepEqual([m.n[0][2], m.n[3][4]], [3243, 3095]);
  assert.match(checkR(c, 'wiederholung-papier', '-0,583').notes[0].text, /^Stimmt: r\(wiederholung × papier\) = −0,583/);
  const onlineAge = c.rs.find(v => v.scope === 'online' && !v.weighted && v.pair === 'wiederholung-age')!;
  assert.equal(Math.round(onlineAge.value * 100) / 100, -0.03);
  assert.deepEqual(c.cells, { online: [419, 370, 371, 427], paper: [858, 0, 798, 0] });
  assert.equal(c.splitMatch, true);
  // Eingaben wie mariposa sie druckt
  assert.match(checkShare(c, { scope: 'all', grouping: 'rep', level: 0 }, '0,527').notes[0].text, /^Stimmt/);
  assert.match(checkShare(c, { scope: 'online', grouping: 'rep', level: 0 }, '52,7').notes[0].text, /Gesucht ist hier: nur online/);
  assert.match(checkT(c, { scope: 'all', grouping: 'rep' }, '7,590').notes[0].text, /^Stimmt: Welch-t = 7,590.*„1 vs\. 0“/);
  assert.match(checkT(c, { scope: 'all', grouping: 'rep' }, '7,34').notes[0].text, /gleiche Varianzen/);
  // so, wie R druckt: Dezimalpunkt (nicht als Tausenderpunkt gelesen)
  assert.match(checkT(c, { scope: 'all', grouping: 'rep' }, '7.590').notes[0].text, /^Stimmt: Welch-t = 7,590/);
  assert.match(checkT(c, { scope: 'all', grouping: 'amt' }, '-2.491').notes[0].text, /^Stimmt: Welch-t = −2,491/);
  assert.match(checkT(c, { scope: 'online', grouping: 'amt' }, '-1.892').notes[0].text, /^Stimmt: Welch-t = −1,892/);
  assert.match(checkF(c, '2.681').notes[0].text, /^Stimmt: F\(3; 1519\) = 2,681/);
  assert.match(checkP(c, '0.046').notes[0].text, /^Stimmt: p = 0,046/);
  // Eine geratene Ungleichung öffnet weder Tukey noch die zweite Enthüllung; „< 0,001“ ist die gepoolte ANOVA, nicht die online.
  for (const guess of ['< 0,05', '< 1', 'p < 0,95']) {
    assert.ok(!checkP(c, guess).exact && !checkP(c, guess).hit, guess);
    assert.doesNotMatch(checkP(c, guess).notes[0].text, /0,046/, guess);
  }
  assert.match(checkP(c, '< .001').notes[0].text, /über alle Selbstausfüller:innen/);
  assert.match(checkR(c, 'wiederholung-papier', '-0.583').notes[0].text, /^Stimmt/);
  assert.match(checkShare(c, { scope: 'all', grouping: 'rep', level: 0 }, '0.527').notes[0].text, /^Stimmt/);
  assert.match(checkShare(c, { scope: 'all', grouping: 'rep', level: 0 }, '1.473').notes[0].text, /Mittelwert über 1/);
  assert.match(checkAmount(c, '-0.045').notes[0].text, /^Stimmt: 10 € statt 5 € bringen online \+4,5 Pp\./);
  // Quote je Fassung online mit Intervall (Einstichproben-t-Test): B2 72,2 % [67,8; 76,5]
  const b2 = c.rates[3]!;
  assert.deepEqual([r1(100 * b2.mean), r1(100 * b2.ci[0]), r1(100 * b2.ci[1]), b2.n], [72.2, 67.8, 76.5, 406]);
});
