import test from 'node:test';
import assert from 'node:assert/strict';
import { fakeSav, fixtureSav } from '../../sandbox/testData';
import type { CorMatrix, TukeyRow } from '../kit/means';
import { hints, PAIR_IDS, R_S1, rSolution } from './content';
import {
  anovaDone, becauseNotes, checkAmount, checkEntry, checkF, checkP, checkR, checkRelease, checkShare, checkT, checkTukey, chooseRelease, compute, computeFor,
  amountText, gutFixed, gutLocked, initialS06, withGutLock, lockMarks, markNotes, matrixReady, ownDiff, parseDiff, parseP, parseRate, parseS06, parseShare, parseStat, plenumLines, prepare,
  rateText, readMarks, releaseState, signedEffect, statusS06, toggleMark, toggleTukey, trap, trapReady, tryTukey, tukeyDone, unlockMarks, weightedNotes,
  type Coding, type Computed, type GroupVar, type S06State, type Scope, type TukeyKey,
} from './domain';

const c = compute(prepare(fixtureSav()));
const share = (scope: Scope, grouping: GroupVar | 'total', level: number, weighted = false, coding: Coding = 'ok') =>
  c.shares.find(v => v.scope === scope && v.grouping === grouping && v.level === level && v.weighted === weighted && v.coding === coding)!.value;
const pctIn = (x: number) => (100 * x).toFixed(1).replace('.', ',');
const propIn = (x: number) => x.toFixed(3).replace('.', ',').replace('-', '−');
const tOf = (scope: Scope, grouping: 'rep' | 'amt', kind: 'welch' | 'student', weighted = false) =>
  c.tests.find(v => v.scope === scope && v.grouping === grouping && v.kind === kind && v.weighted === weighted)!.value;
const text = (notes: { text: string }[]) => notes.map(n => n.text).join(' | ');
const state = (patch: Partial<S06State>): S06State => ({ ...initialS06(), ...patch });

test('prepares xr21 in four codings, the groupings and keeps CAPI out of every scope', () => {
  const sav = fakeSav({
    xr21: { values: [1, 2, -9, -15, 1, 2], missingFrom: -1 }, splt23_3: { values: [1, 2, 3, -15, 4, 3], missingFrom: -1 },
    mode: { values: [3, 3, 4, 2, 3, 4] }, age: { values: [30, 40, -32, 50, 60, 70], missingFrom: -1 }, wghtpew: { values: [1, 1, 1, 1, 1, 1] },
    splt23_1: { values: [1, 1, 2, -15, 2, 2], missingFrom: -1 },
  });
  const p = prepare(sav);
  assert.deepEqual([...p.y.ok], [1, 0, NaN, NaN, 1, 0]);
  assert.deepEqual([...p.y.raw], [1, 2, NaN, NaN, 1, 2]);
  assert.deepEqual([...p.y.reversed], [0, 1, NaN, NaN, 0, 1]);
  assert.deepEqual([...p.y.naAsNo], [1, 0, 0, 0, 1, 0]);
  assert.deepEqual([...p.g.rep], [0, 1, 0, NaN, 1, 0]);
  assert.deepEqual([...p.g.amt], [5, 5, 10, NaN, 10, 10]);
  assert.deepEqual([...p.g.paper], [0, 0, 1, NaN, 0, 1]);
  const q = compute(p);
  // „keine Angabe als Nein“ zählt nur Selbstausfüller:innen – die CAPI-Person bleibt draußen.
  assert.equal(q.shares.find(v => v.scope === 'all' && !v.weighted && v.grouping === 'total' && v.coding === 'naAsNo')!.n, 5);
  assert.deepEqual(q.cells, { online: [1, 1, 0, 1], paper: [0, 0, 2, 0] });
  assert.equal(q.splitMatch, true);
});

test('computes every path once per file: shares, t-tests, correlations, ANOVA, Tukey, rates', () => {
  assert.ok(c.shares.length > 200);
  assert.equal(c.tests.length, 24);   // Modus nur über alle, auf Papier nur der Betrag (je Welch/Student, mit/ohne Gewicht)
  assert.equal(c.fs.length, 12);
  assert.ok(Math.abs(tOf('all', 'rep', 'welch') - -0.6596362416894066) < 1e-9);
  assert.ok(Math.abs(c.anova.online!.F - 0.23809523809523794) < 1e-9);
  assert.equal(c.tukey.online!.length, 6);
  assert.deepEqual(c.cells, { online: [6, 6, 3, 2], paper: [8, 0, 12, 0] });
  assert.ok(c.splitMatch);
  assert.ok(Math.abs(c.rates[0]!.mean - 0.8) < 1e-12);
  const tr = trap(c)!;
  assert.deepEqual([tr.all[1], tr.online[1]].map(x => x.toFixed(4)), ['0.5714', '0.5714']);
  assert.equal(tr.nPaperOhne, 19);
  // Effekt in fester Richtung, gleich wie mariposa die Gruppen ordnet (in der Testdatei „10 vs. 5“).
  const amt = c.tests.find(v => v.scope === 'all' && v.grouping === 'amt' && !v.weighted)!.test;
  assert.deepEqual(amt.levels, [10, 5]);
  assert.equal(signedEffect(amt, 'amt'), amt.diff);
  const rep = c.tests.find(v => v.scope === 'all' && v.grouping === 'rep' && !v.weighted)!.test;
  assert.equal(signedEffect(rep, 'rep'), -rep.diff);
});

const one = (p: ReturnType<typeof parseShare>) => (p.kind === 'ok' ? p.readings.map(r => [Number(r.value.toFixed(9)), Number(r.tol.toFixed(6))]) : p.kind);

test('reads entries as R prints them (dot decimals) or in German, with tolerance from the decimals', () => {
  assert.deepEqual(one(parseShare('67,7')), [[0.677, 0.0005]]);
  assert.deepEqual(one(parseShare('0,677')), [[0.677, 0.0005]]);
  assert.deepEqual(one(parseShare('0.677')), [[0.677, 0.0005]]);
  assert.deepEqual(one(parseShare('67.7')), [[0.677, 0.0005]]);
  assert.deepEqual(one(parseShare('67,7 %')), one(parseShare('67,7')));
  // „1.577“ ist ein Mittelwert, wie R ihn druckt (xr21 noch 1/2) – die Tausender-Lesart ist für eine Quote zu grob und fällt weg.
  assert.deepEqual(one(parseShare('1.577')), [[1.577, 0.0005]]);
  assert.equal(parseShare('67').kind, 'coarse');
  assert.equal(parseShare('0,7').kind, 'coarse');
  assert.equal(parseShare('abc').kind, 'text');
  assert.equal(parseShare(' ').kind, 'empty');
  assert.deepEqual(one(parseStat('7.590')), [[7.59, 0.0005]]);
  assert.deepEqual(one(parseStat('-2.491')), [[-2.491, 0.0005]]);
  assert.deepEqual(one(parseStat('2.681')), [[2.681, 0.0005]]);
  assert.deepEqual(one(parseStat('−7,59')), [[-7.59, 0.005]]);
  assert.deepEqual(one(parseStat('7,590')), [[7.59, 0.0005]]);
  assert.equal(parseStat('7,6').kind, 'coarse');
  assert.deepEqual(parseP('< 0,001'), { kind: 'below', value: 0.001 });
  assert.deepEqual(parseP('p < .001'), { kind: 'below', value: 0.001 });
  assert.deepEqual(one(parseP('p = ,046')), [[0.046, 0.0005]]);
  assert.deepEqual(one(parseP('0.046')), [[0.046, 0.0005]]);
  assert.equal(parseP('0,05').kind, 'coarse');
  assert.deepEqual(one(parseDiff('4,5')), [[4.5, 0.05]]);
  assert.deepEqual(one(parseDiff('−0,045')), [[-4.5, 0.05]]);
  assert.deepEqual(one(parseDiff('-0.045')), [[-4.5, 0.05]]);
  assert.deepEqual(one(parseDiff('4 Pp.')), [[4, 0.5]]);
  assert.equal(parseRate('67'), 67);
  assert.equal(parseRate('0,67'), 67);
  assert.equal(parseRate('0.672'), 67.2);
  assert.equal(parseRate('0,8'), 80);
  assert.equal(parseRate('1'), 1);
  assert.equal(parseRate('x'), null);
  assert.equal(rateText('0,67'), '67 %');
  assert.equal(rateText('67,5 %'), '67,5 %');
  assert.ok(Math.abs(ownDiff('52,7', '0,677')! - 0.15) < 1e-12);
  assert.ok(Math.abs(ownDiff('0.527', '0.677')! - 0.15) < 1e-12);
  assert.equal(ownDiff('52', '67,7'), null);
});

test('values typed with R dot decimals are recognised like comma input', () => {
  const dot = (x: number) => x.toFixed(3).replace('−', '-');
  const welch = tOf('all', 'rep', 'welch');
  assert.match(text(checkT(c, { scope: 'all', grouping: 'rep' }, dot(welch)).notes), /^Stimmt: Welch-t/);
  // ein t über 1 mit drei Stellen (hier: Betrag auf Papier) ist mehrdeutig – die R-Lesart zählt
  const paper = c.tests.find(v => v.scope === 'paper' && v.grouping === 'amt' && v.kind === 'welch' && !v.weighted)!.value;
  assert.ok(Math.abs(paper) > 1);
  assert.match(text(checkT(c, { scope: 'all', grouping: 'rep' }, dot(paper)).notes), /Betrag, nur auf Papier/);
  const fPaper = c.fs.find(v => v.scope === 'paper' && v.kind === 'classical' && !v.weighted)!.value;
  assert.ok(fPaper > 1);
  assert.match(text(checkF(c, dot(fPaper)).notes), /nur auf Papier/);
  assert.match(text(checkShare(c, { scope: 'all', grouping: 'rep', level: 0 }, dot(share('all', 'rep', 0, false, 'raw'))).notes), /Mittelwert über 1/);
  assert.match(text(checkShare(c, { scope: 'all', grouping: 'rep', level: 0 }, dot(share('all', 'rep', 0))).notes), /^Stimmt/);
  assert.match(text(checkR(c, 'wiederholung-papier', dot(c.rs.find(v => v.pair === 'wiederholung-papier' && v.scope === 'all' && !v.weighted)!.value)).notes), /^Stimmt/);
  const f = c.fs.find(v => v.scope === 'online' && v.kind === 'classical' && !v.weighted)!;
  assert.ok(checkF(c, dot(f.value)).exact && checkP(c, dot(f.p)).exact);
});

test('the value detector names every path of a share', () => {
  const field = { scope: 'all' as const, grouping: 'rep' as const, level: 0 };
  const say = (input: string) => checkShare(c, field, input);
  const exact = say(pctIn(share('all', 'rep', 0)));
  assert.match(text(exact.notes), /^Stimmt: Zusagequote „ohne“ Wiederholung, über alle Selbstausfüller:innen, ungewichtet/);
  assert.ok(exact.valid && exact.exact);
  assert.ok(say(propIn(share('all', 'rep', 0))).exact);
  const twin = say(pctIn(share('all', 'rep', 0, true)));
  assert.match(text(twin.notes), /gewichtete Quote.*auch gültig/);
  assert.ok(twin.valid && !twin.exact);
  assert.match(text(say(propIn(share('all', 'rep', 0, false, 'raw'))).notes), /Mittelwert über 1.*Codes 1 \(ja\) und 2 \(nein\)/);
  assert.match(text(say(pctIn(share('all', 'rep', 0, false, 'reversed'))).notes), /Nein-Antworten/);
  assert.match(text(say(pctIn(share('all', 'rep', 0, false, 'naAsNo'))).notes), /„keine Angabe“ als Nein.*else=NA/);
  const scope = say(pctIn(share('online', 'rep', 0)));
  assert.match(text(scope.notes), /nur online.*Gesucht ist hier: über alle Selbstausfüller:innen/);
  assert.ok(!scope.valid && scope.hit);
  assert.match(text(say(pctIn(share('all', 'rep', 1))).notes), /„mit“ Wiederholung.*in dieses Feld gehört „ohne“ Wiederholung/);
  assert.match(text(say(pctIn(share('online', 'version', 1))).notes), /Fassung A1/);
  assert.match(text(say('99,9').notes), /finde ich nicht.*mode != 2/);
  assert.match(text(checkShare(c, { scope: 'online', grouping: 'rep', level: 0 }, '99,9').notes), /mode == 3/);
  assert.match(text(say('42').notes), /mit einer Nachkommastelle/);
  assert.deepEqual(say('abc').notes, []);
  assert.deepEqual(say('').notes, []);
});

test('the t detector accepts either sign, names Student, weighted and other tests', () => {
  const field = { scope: 'all' as const, grouping: 'rep' as const };
  const welch = tOf('all', 'rep', 'welch');
  assert.match(text(checkT(c, field, propIn(welch)).notes), /^Stimmt: Welch-t = .*mariposa vergleicht „0 vs\. 1“\.$/);
  assert.match(text(checkT(c, field, propIn(-welch)).notes), /Stimmt: Welch-t.*Vorzeichen ist umgedreht/);
  assert.match(text(checkT(c, field, propIn(tOf('all', 'rep', 'student'))).notes), /gleiche Varianzen.*Equal variances/);
  assert.match(text(checkT(c, field, propIn(tOf('all', 'rep', 'welch', true))).notes), /gewichtete t/);
  assert.match(text(checkT(c, field, propIn(tOf('online', 'rep', 'welch'))).notes), /nur online.*Gesucht ist Wiederholung, über alle/);
  assert.match(text(checkT(c, field, '9,99').notes), /finde ich nicht/);
  assert.match(text(checkT(c, field, '0,7').notes), /zwei Nachkommastellen/);
  const entry = checkEntry(c, 'all', 'rep', { a: pctIn(share('all', 'rep', 0)), b: pctIn(share('all', 'rep', 1)), t: propIn(welch) });
  assert.ok(entry.valid && entry.diff !== null && Math.abs(entry.diff - 0.148) < 0.001);
  assert.equal(checkEntry(c, 'all', 'rep', { a: '99,9', b: pctIn(share('all', 'rep', 1)), t: '' }).diff, null);
});

test('the correlation detector checks the cell, its weight, scope and sign', () => {
  const r = (pair: string, scope: 'all' | 'online', weighted = false) => c.rs.find(v => v.pair === pair && v.scope === scope && v.weighted === weighted)!.value;
  const rp = r('wiederholung-papier', 'all');
  assert.match(text(checkR(c, 'wiederholung-papier', propIn(rp)).notes), /^Stimmt: r\(wiederholung × papier\) = −0,570/);
  assert.match(text(checkR(c, 'wiederholung-papier', propIn(r('wiederholung-papier', 'all', true))).notes), /gewichtet.*auch gültig/);
  assert.match(text(checkR(c, 'wiederholung-papier', propIn(r('betrag-papier', 'all'))).notes), /betrag × papier.*Gesucht ist die Zelle wiederholung × papier/);
  assert.match(text(checkR(c, 'wiederholung-papier', propIn(-rp)).notes), /Vorzeichen nicht/);
  assert.match(text(checkR(c, 'wiederholung-age', propIn(r('wiederholung-age', 'online'))).notes), /nur online/);
  assert.match(text(checkR(c, 'wiederholung-papier', '0,999').notes), /finde ich nicht.*Zeile wiederholung und die Spalte papier/);
});

test('the ANOVA detector separates classical, Welch, weighted and pooled results', () => {
  const f = (scope: Scope, kind: 'classical' | 'welch', weighted = false) => c.fs.find(v => v.scope === scope && v.kind === kind && v.weighted === weighted)!;
  const exact = checkF(c, propIn(f('online', 'classical').value));
  assert.match(text(exact.notes), /^Stimmt: F\(3, 10\) = 0,238/);
  assert.ok(exact.exact);
  assert.match(text(checkF(c, propIn(f('online', 'welch').value)).notes), /Welchs Test/);
  assert.match(text(checkF(c, propIn(f('online', 'classical', true).value)).notes), /gewichtete ANOVA/);
  assert.match(text(checkF(c, propIn(f('all', 'classical').value)).notes), /über alle Selbstausfüller:innen.*nur online/);
  assert.match(text(checkF(c, propIn(f('paper', 'classical').value)).notes), /nur auf Papier/);
  assert.match(text(checkF(c, '9,99').notes), /finde ich nicht/);
  const p = checkP(c, propIn(f('online', 'classical').p));
  assert.match(text(p.notes), /^Stimmt: p = 0,868.*Kein Unterschied/);
  assert.ok(p.exact);
  assert.match(text(checkP(c, '< 0,001').notes), /finde ich nicht/);
  assert.match(text(checkP(c, '0,87').notes), /drei Nachkommastellen/);
});

const row = (a: number, b: number, p: number): TukeyRow => ({ a, b, label: `${a}-${b}`, diff: 0.05, se: 0.02, lower: 0, upper: 0.1, p });
const withTukey = (rows: TukeyRow[]): Computed => ({ ...c, tukey: { online: rows, onlineW: rows } });
const fOnline = () => c.fs.find(v => v.scope === 'online' && v.kind === 'classical' && !v.weighted)!;
const anovaIn = () => ({ means: ['', '', '', ''], F: propIn(fOnline().value), p: '' });

test('Tukey marks: checked only after the own ANOVA and „Auswahl prüfen“, as a whole, without naming the wrong pair', () => {
  const tried = (tukey: TukeyKey[], extra: Partial<S06State> = {}) => state({ anova: anovaIn(), tukey, tukeyTried: tukey, ...extra });
  assert.deepEqual(checkTukey(c, state({})), { notes: [], correct: false });
  // ohne eigene ANOVA: kein Urteil, nur der Hinweis
  const early = checkTukey(c, state({ tukey: ['none'], tukeyTried: ['none'] }));
  assert.ok(!early.correct);
  assert.match(text(early.notes), /Trag zuerst oben F oder p deiner ANOVA ein/);
  // mit ANOVA, aber nicht geprüft oder nach dem Prüfen geändert: kein Urteil
  assert.deepEqual(checkTukey(c, state({ anova: anovaIn(), tukey: ['none'] })), { notes: [], correct: false });
  assert.deepEqual(checkTukey(c, state({ anova: anovaIn(), tukey: ['4-2'], tukeyTried: ['none'] })), { notes: [], correct: false });
  assert.ok(checkTukey(c, tried(['none'])).correct);   // Testdatei: kein Paar signifikant
  const wrong = text(checkTukey(c, tried(['4-2'])).notes);
  assert.match(wrong, /^Noch nicht: Deine Auswahl passt nicht zur Tukey-Tabelle/);
  assert.doesNotMatch(wrong, /A1|A2|B1|B2|4-2/);
  const d = withTukey([row(2, 1, 0.5), row(3, 1, 0.9), row(4, 1, 0.4), row(3, 2, 0.7), row(4, 2, 0.026), row(4, 3, 0.3)]);
  assert.match(text(checkTukey(d, tried(['4-2'])).notes), /^Stimmt: Nach Tukey unterscheidet sich nur B2 – A2 signifikant\.$/);
  assert.ok(tukeyDone(d, tried(['4-2'])));
  for (const marks of [['4-1'], ['4-2', '4-1'], ['none']] as TukeyKey[][]) {
    const res = checkTukey(d, tried(marks));
    assert.ok(!res.correct, marks.join());
    assert.doesNotMatch(text(res.notes), /A1|A2|B1|B2/, marks.join());
  }
  assert.match(text(checkTukey({ ...c, tukey: { online: null, onlineW: null } }, tried(['4-2'])).notes), /zu wenige Fälle/);
  assert.deepEqual(tryTukey(state({ tukey: ['4-2', '3-1'] })).tukeyTried, ['4-2', '3-1']);
});

test('a typed inequality counts only as mariposa prints it (< 0,001), never as a guess that opens the gate', () => {
  for (const guess of ['< 1', '<0,9', '< 0,05', 'p < 0,95', '< 0.5']) {
    assert.equal(parseP(guess).kind, 'coarse', guess);
    const res = checkP(c, guess);
    assert.ok(!res.exact && !res.hit, guess);
    assert.match(text(res.notes), /Trag den p-Wert so ein, wie R ihn druckt/, guess);
    assert.equal(anovaDone(c, state({ anova: { means: ['', '', '', ''], F: '', p: guess } })), false, guess);
  }
  assert.deepEqual(parseP('< .001'), { kind: 'below', value: 0.001 });
  // Ist das p online wirklich unter 0,001, bleibt „< 0,001“ ein Treffer.
  const tiny: Computed = { ...c, fs: c.fs.map(v => (v.scope === 'online' && v.kind === 'classical' && !v.weighted ? { ...v, p: 0.0004 } : v)) };
  assert.ok(checkP(tiny, '< .001').exact);
  assert.ok(checkP(tiny, 'p < 0,001').exact);
  assert.ok(!checkP(c, '< 0,001').exact);   // Testdatei: p = 0,868
});

test('the gut feeling stays locked once set; card texts keep units for rates, amounts and free text', () => {
  const recognised = state({ gut: { version: 'B2', rate: '80' }, s1: { rep: { a: pctIn(share('all', 'rep', 0)), b: '', t: '' }, amt: { a: '', b: '', t: '' } } });
  const locked = withGutLock(c, recognised);
  assert.equal(locked.gutFixed, true);
  const cleared = withGutLock(c, { ...locked, s1: initialS06().s1 });
  assert.equal(cleared.gutFixed, true);
  assert.equal(gutFixed(c, cleared), true);
  assert.equal(withGutLock(c, initialS06()).gutFixed, false);
  assert.equal(gutFixed(c, recognised), true);   // auch ein gespeicherter Stand ohne das Feld bleibt fest
  assert.equal(parseS06({ gutFixed: 'ja' }).gutFixed, false);
  assert.equal(parseS06({ gutFixed: true }).gutFixed, true);
  assert.equal(rateText('ca. 70'), 'ca. 70 %');
  assert.equal(rateText('ca. 70 %'), 'ca. 70 %');
  assert.equal(amountText('-0.045'), '−4,5 Pp.');
  assert.equal(amountText('0,045'), '4,5 Pp.');
  assert.equal(amountText('4,5 Pp.'), '4,5 Pp.');
  assert.equal(amountText('etwa 4'), 'etwa 4 Pp.');
  const card = Object.fromEntries(plenumLines(state({ release: { ...initialS06().release, amount: '-0.045' } })));
  assert.equal(card['10 € bringen'], '−4,5 Pp.');
});

test('the balance check reads marks against the matrix without numbers before the reveal', () => {
  const m: CorMatrix = {
    r: [[1, 0.05, -0.58, -0.2, 0.13], [0.05, 1, -0.02, 0, 0.04], [-0.58, -0.02, 1, 0.31, -0.21], [-0.2, 0, 0.31, 1, -0.3], [0.13, 0.04, -0.21, -0.3, 1]],
    p: Array.from({ length: 5 }, () => Array(5).fill(0.001)), n: Array.from({ length: 5 }, () => Array(5).fill(100)), ci: [],
  };
  const read = readMarks(m, ['wiederholung-papier', 'betrag-papier', 'papier-age']);
  const verdict = (id: string) => read.find(x => x.pair === id)!.verdict;
  assert.deepEqual(['wiederholung-papier', 'betrag-papier', 'wiederholung-age', 'betrag-age', 'papier-age', 'age-zusage'].map(verdict), ['verletzt', 'hält', 'verletzt', 'übersehen', 'kein Loscheck', 'kein Loscheck']);
  const notes = markNotes(c, ['wiederholung-papier', 'betrag-papier', 'papier-age'], m).join(' ');
  assert.match(notes, /wiederholung × papier: r = −0,580\. Du hast richtig erwartet, dass hier bei echter Auslosung ≈ 0 stehen müsste – über beide Modi hinweg war die Fassung also nicht ausgelost\./);
  assert.match(notes, /wiederholung × age: r = −0,200\. Hier hätte bei echter Auslosung ≈ 0 stehen müssen/);
  assert.doesNotMatch(notes, /Los ist verletzt/);
  assert.match(notes, /betrag × papier: r = −0,020, hält\./);
  assert.match(notes, /betrag × age \(r = 0,000\) hättest du markieren können/);
  assert.match(notes, /wiederholung × betrag .*ungleich groß/);
  assert.match(notes, /papier × age: Papier und Alter stehen beide vor der Auslosung fest/);
  assert.match(notes, /Aus Kostengründen gab es auf Papier nur A1 und B1/);
  assert.doesNotMatch(markNotes(c, ['betrag-papier'], { ...m, r: m.r.map(r => r.map(() => 0.01)) }).join(' '), /Kostengründen/);
});

test('the amount on the release card is matched online, with a sign note', () => {
  const amt = (scope: Scope, weighted = false) => 100 * signedEffect(c.tests.find(v => v.scope === scope && v.grouping === 'amt' && v.kind === 'welch' && v.weighted === weighted)!.test, 'amt');
  const fmt = (x: number) => x.toFixed(1).replace('.', ',').replace('-', '−');
  assert.match(text(checkAmount(c, fmt(amt('online'))).notes), /^Stimmt: 10 € statt 5 € bringen online −20,0 Pp\. \(ungewichtet; Welch p = /);
  assert.match(text(checkAmount(c, fmt(-amt('online'))).notes), /Stimmt.*Vorzeichen ist umgedreht: mariposa rechnet „5 vs\. 10“/);
  assert.match(text(checkAmount(c, fmt(amt('online', true))).notes), /gewichtete Betragseffekt online/);
  assert.match(text(checkAmount(c, fmt(amt('all'))).notes), /über alle Selbstausfüller:innen.*Online-Wert aus Station 3/);
  assert.match(text(checkAmount(c, '55,5').notes), /finde ich nicht/);
  assert.deepEqual(checkAmount(c, '').notes, []);
});

test('release questions: highest bar, span, interval, pooled rate and the gut feeling', () => {
  const both = { meansDone: true, tukeyDone: true };
  const rel = (patch: Partial<S06State['release']>, extra: Partial<S06State> = {}) => state({ ...extra, release: { ...initialS06().release, ...patch } });
  assert.deepEqual(checkRelease(c, rel({}), both), []);
  // Testdatei: A1 hat online den höchsten Balken, Tukey findet kein signifikantes Paar.
  assert.match(text(checkRelease(c, rel({ version: 'A1' }), { meansDone: false, tukeyDone: true })), /^Hast du die vier Fassungen online verglichen \(Station 3b\)\?/);
  assert.doesNotMatch(text(checkRelease(c, rel({ version: 'A1' }), { meansDone: false, tukeyDone: true })), /Balken/);
  assert.match(text(checkRelease(c, rel({ version: 'A1' }), { meansDone: true, tukeyDone: false })), /höchsten Balken. Hast du mit Tukey geprüft/);
  assert.match(text(checkRelease(c, rel({ version: 'A1' }), both)), /A1 hat den höchsten Balken, schlägt nach Tukey aber keine andere Fassung signifikant\.$/);
  assert.deepEqual(checkRelease(c, rel({ version: 'A2' }), both), []);
  const d: Computed = { ...withTukey([row(2, 1, 0.5), row(3, 1, 0.9), row(4, 1, 0.4), row(3, 2, 0.7), row(4, 2, 0.026), row(4, 3, 0.3)]),
    rates: [0.67, 0.626, 0.665, 0.722].map(mean => ({ n: 400, mean, t: 1, df: 399, p: 0, ci: [mean - 0.045, mean + 0.045] as [number, number] })) };
  assert.match(text(checkRelease(d, rel({ version: 'B2' }), both)), /B2 hat den höchsten Balken, schlägt nach Tukey aber nur A2 signifikant\. Was sagst du, wenn sie bei uns nicht besser läuft als das billigere A1\?/);
  assert.match(text(checkRelease(d, rel({ version: 'B2', rate: '72' }), both)), /Wie breit ist dein Intervall/);
  assert.match(text(checkRelease(d, rel({ version: 'B2', rate: '72', low: '76', high: '68' }), both)), /vertauscht/);
  assert.match(text(checkRelease(d, rel({ version: 'B2', rate: '80', low: '68', high: '76' }), both)), /außerhalb deiner eigenen Spanne.*Zum Vergleich: B2 online, ungewichtet: 72,2 % \[67,7; 76,7\].*über der oberen Grenze/);
  // Ohne eigene vier Quoten gibt es das Intervall nur, wenn die Spanne selbst das Intervall aus t_test() ist.
  const noMeans = { meansDone: false, tukeyDone: false };
  for (const [low, high] of [['0', '2'], ['68', '76'], ['1', '99']]) {
    const t = text(checkRelease(d, rel({ version: 'B2', rate: '72', low, high }), noMeans));
    assert.doesNotMatch(t, /Zum Vergleich|72,2|67,7|76,7|Grenze|schmaler/, `${low}–${high}`);
    assert.match(t, /Woran misst du deine Spanne\?/);
  }
  for (const [low, high] of [['67,7', '76,7'], ['0.677', '0.767'], ['67.7', '76.7']]) {
    const t = text(checkRelease(d, rel({ version: 'B2', rate: '80', low, high }), noMeans));
    assert.match(t, /Das ist das 95-%-Intervall aus t_test\(\) für B2 online \(ungewichtet, n = 400\)\..*über der oberen Grenze/, `${low}–${high}`);
    assert.doesNotMatch(t, /Zum Vergleich/);
  }
  assert.match(text(checkRelease(d, rel({ version: 'B2', rate: '60', low: '58', high: '62' }), both)), /unter der unteren Grenze.*schmaler als die Hälfte/);
  assert.doesNotMatch(text(checkRelease(d, rel({ version: 'B2', rate: '72', low: '68', high: '76' }), both)), /Grenze|schmaler|Papier/);
  assert.match(text(checkRelease(d, rel({ version: 'B2', rate: '72', low: '68', high: '76' }, { gut: { version: 'A2', rate: '80' } }), both)), /Bauchgefühl vorher: A2 mit 80 %/);
  const pooled = c.shares.find(v => v.scope === 'all' && !v.weighted && v.coding === 'ok' && v.grouping === 'version' && v.level === 1)!.value;
  assert.match(text(checkRelease(c, rel({ version: 'A1', rate: (100 * pooled).toFixed(1).replace('.', ','), low: '10', high: '90' }), both)), /inklusive Papier/);
});

test('the Station-2 sentence is read for what was not randomised', () => {
  assert.deepEqual(becauseNotes('kurz'), []);
  assert.match(text(becauseNotes('weil die Papier-Befragten nur Fassungen ohne Wiederholung bekamen')), /nicht ausgelost/);
  assert.match(text(becauseNotes('weil die Wiederholung eben besser wirkt als gedacht')), /Welche Zelle der Matrix/);
});

test('state: defensive parse, locked marks, Tukey exclusivity, release resets, status and plenum', () => {
  assert.deepEqual(parseS06(null), initialS06());
  assert.deepEqual(parseS06('Müll'), initialS06());
  assert.deepEqual(parseS06({ mode: 'x', marks: ['wiederholung-papier', 'erfunden', 3, 'wiederholung-papier'], locked: true, tukey: ['4-2', 'none', 'x'], gut: { version: 'C3' },
    release: { version: 'B2', rate: 12345678901234 }, anova: { means: ['1', 2] }, matrixView: 'bunt' }), {
    ...initialS06(), marks: ['wiederholung-papier'], locked: true, tukey: ['none'], release: { ...initialS06().release, version: 'B2' },
    anova: { means: ['1', '', '', ''], F: '', p: '' },
  });
  assert.equal(parseS06({ locked: true, marks: [] }).locked, false);
  assert.deepEqual(parseS06({ tukeyTried: ['4-2', 'y'] }).tukeyTried, ['4-2']);
  assert.equal(parseS06({ tukeyTried: 'x' }).tukeyTried, null);
  // Bauchgefühl: fest, sobald eine Zahl aus Station 1 erkannt ist (auch als falsche Gruppe erkannt), nicht bei Unsinn
  assert.equal(gutLocked(c, initialS06()), false);
  assert.equal(gutLocked(c, state({ s1: { rep: { a: '99,9', b: '', t: '' }, amt: { a: '', b: '', t: '' } } })), false);
  assert.equal(gutLocked(c, state({ s1: { rep: { a: '', b: '', t: '' }, amt: { a: pctIn(share('all', 'amt', 5)), b: '', t: '' } } })), true);
  assert.equal(parseS06({ because: 'x'.repeat(900) }).because.length, 600);
  assert.equal(PAIR_IDS.length, 10);
  const marked = toggleMark(initialS06(), 'wiederholung-papier');
  assert.deepEqual(marked.marks, ['wiederholung-papier']);
  assert.equal(lockMarks(initialS06()).locked, false);
  const locked = { ...lockMarks(marked), r: { repPaper: '−0,58', amtPaper: '0,02' } };
  assert.equal(toggleMark(locked, 'betrag-age'), locked);
  assert.deepEqual(unlockMarks(locked), { ...locked, locked: false, r: { repPaper: '', amtPaper: '' } });
  assert.deepEqual(toggleTukey(toggleTukey(initialS06(), '4-2'), 'none').tukey, ['none']);
  assert.deepEqual(toggleTukey(toggleTukey(initialS06(), 'none'), '4-2').tukey, ['4-2']);
  assert.deepEqual(toggleTukey(toggleTukey(initialS06(), '4-2'), '4-2').tukey, []);
  const filled = state({ release: { version: 'B2', rate: '72', low: '68', high: '76', amount: '4,5', notClaimed: 'Wiederholung wirkt.' }, sign: { panel: 'A', qs: 'B', veto: true } });
  const switched = chooseRelease(filled, 'A1');
  assert.deepEqual(switched.release, { version: 'A1', rate: '', low: '', high: '', amount: '4,5', notClaimed: 'Wiederholung wirkt.' });
  assert.deepEqual(switched.sign, { panel: '', qs: '', veto: false });
  assert.equal(chooseRelease(filled, 'B2'), filled);
  assert.equal(statusS06(initialS06()), 'open');
  assert.equal(statusS06(state({ marks: ['betrag-age'] })), 'running');
  assert.equal(statusS06(state({ s1: { rep: { a: '52,7', b: '', t: '' }, amt: { a: '', b: '', t: '' } } })), 'running');
  assert.equal(statusS06({ ...filled, sign: { panel: 'A', qs: 'B', veto: false } }), 'done');
  assert.equal(releaseState(filled), 'Veto');
  assert.equal(releaseState({ ...filled, sign: { panel: 'A', qs: 'B', veto: false } }), 'freigegeben');
  assert.equal(releaseState(initialS06()), 'offen');
  const lines = Object.fromEntries(plenumLines({ ...filled, gut: { version: 'A2', rate: '80 %' } }));
  assert.equal(lines['Fassung'], 'B2 · 10 € (5 € fürs Ja, 5 € bei Teilnahme), am Anfang genannt und am Schluss wiederholt');
  assert.equal(lines['Versprochene Online-Quote'], '72 % (Spanne 68–76 %)');
  assert.equal(lines['10 € bringen'], '4,5 Pp.');
  assert.equal(lines['Freigabe'], 'Veto der Qualitätssicherung');
  assert.equal(lines['Bauchgefühl vorher'], 'A2 · 80 %');
  assert.equal(Object.fromEntries(plenumLines(state({ release: { ...filled.release, low: '' } })))['Versprochene Online-Quote'], '72 % (ohne Spanne)');
  assert.equal(Object.fromEntries(plenumLines(initialS06()))['Bauchgefühl vorher'], '');
});

test('reveals wait for recognised own values', () => {
  const rep = (scope: Scope, weighted = false) => ({ a: pctIn(share(scope, 'rep', 0, weighted)), b: pctIn(share(scope, 'rep', 1, weighted)), t: '' });
  const empty = { a: '', b: '', t: '' };
  assert.ok(trapReady(c, state({ s1: { rep: rep('all'), amt: empty }, s3: { rep: rep('online'), amt: empty } })));
  assert.ok(trapReady(c, state({ s1: { rep: rep('all', true), amt: empty }, s3: { rep: rep('online'), amt: empty } })));
  assert.ok(!trapReady(c, state({ s1: { rep: empty, amt: empty }, s3: { rep: rep('online'), amt: empty } })));
  assert.ok(!trapReady(c, state({ s1: { rep: rep('all'), amt: empty }, s3: { rep: rep('all'), amt: empty } })));
  const rOf = (pair: string) => propIn(c.rs.find(v => v.pair === pair && v.scope === 'all' && !v.weighted)!.value);
  const r = { repPaper: rOf('wiederholung-papier'), amtPaper: rOf('betrag-papier') };
  assert.ok(matrixReady(c, state({ marks: ['wiederholung-papier'], locked: true, r })));
  assert.ok(!matrixReady(c, state({ marks: ['wiederholung-papier'], locked: false, r })));
  assert.ok(!matrixReady(c, state({ marks: ['wiederholung-papier'], locked: true, r: { ...r, amtPaper: '0,999' } })));
  // Werte anderer Zellen (erkannt, aber falsche Zelle) öffnen die Matrix nicht; die gewichtete Zelle schon.
  assert.ok(!matrixReady(c, state({ marks: ['wiederholung-papier'], locked: true, r: { repPaper: rOf('age-zusage'), amtPaper: rOf('papier-zusage') } })));
  const rw = (pair: string) => propIn(c.rs.find(v => v.pair === pair && v.scope === 'all' && v.weighted)!.value);
  assert.ok(matrixReady(c, state({ marks: ['wiederholung-papier'], locked: true, r: { repPaper: rw('wiederholung-papier'), amtPaper: rw('betrag-papier') } })));
  const f = c.fs.find(v => v.scope === 'online' && v.kind === 'classical' && !v.weighted)!;
  const welch = c.fs.find(v => v.scope === 'online' && v.kind === 'welch' && !v.weighted)!;
  assert.ok(anovaDone(c, state({ anova: { means: ['', '', '', ''], F: propIn(f.value), p: '' } })));
  assert.ok(anovaDone(c, state({ anova: { means: ['', '', '', ''], F: '', p: propIn(f.p) } })));
  assert.ok(!anovaDone(c, state({ anova: { means: ['', '', '', ''], F: propIn(welch.value), p: '0,999' } })));
  const notes = weightedNotes(c).join(' ');
  assert.match(notes, /Ungewichtet: F\(3, 10\) = 0,238, p = 0,868\. Mit wghtpew: F\(3, 9\) = 0,201, p = 0,893\./);
  assert.match(notes, /Signifikanz bleibt/);
  // Station 3a und Tukey bleiben verborgen, bis die eigenen Werte stehen.
  assert.doesNotMatch(notes, /Wiederholung online|Betrag online|Tukey gewichtet/);
  const withRep = weightedNotes(c, { rep: true, amt: false, tukey: false }).join(' ');
  assert.match(withRep, /Wiederholung online: ungewichtet .* gewichtet /);
  assert.doesNotMatch(withRep, /Betrag online|Tukey/);
  assert.match(weightedNotes(c, { rep: false, amt: true, tukey: true }).join(' '), /Betrag online.*Tukey gewichtet: kein Paar signifikant/);
  assert.equal(anovaDone(c, state({ anova: anovaIn() })), true);
  assert.equal(computeFor(fixtureSav()) === computeFor(fixtureSav()), false);   // neue Datei, neue Rechnung
  const sav = fixtureSav();
  assert.equal(computeFor(sav), computeFor(sav));
});

test('R code: mariposa style, runnable per station, full script with the chosen version', () => {
  for (const code of [R_S1, rSolution(4), ...Object.values(hints).map(h => h.solution)]) {
    assert.doesNotMatch(code, /ifelse|%in%|group_by\(mode\) %>% t_test/);
  }
  const full = rSolution(4);
  assert.ok(full.indexOf('library(dplyr)') < full.indexOf('library(mariposa)'));
  assert.match(full, /read_spss\(file\.choose\(\)\)/);
  assert.match(full, /filter\(splt23_3 == 4\) %>% t_test\(zusage\) %>% summary\(\)/);
  assert.match(full, /oneway_anova\(zusage, group = splt23_3, weights = wghtpew\)/);
  for (const h of Object.values(hints)) {
    assert.match(h.scaffold, /___/);
    assert.match(h.solution, /library\(dplyr\)/);
  }
  assert.match(hints.s2.solution, /mutate\(papier = rec\(mode/);
});
