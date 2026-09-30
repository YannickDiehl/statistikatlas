import test from 'node:test';
import assert from 'node:assert/strict';
import { fakeSav, fixtureSav } from '../../sandbox/testData';
import {
  allTables, checkExtra, checkP1, checkP2, checkP3, denominators, fourfold, initialS04, lookup, parseS04, PARTY, percent,
  plenumLines, prepare, questions, rCodeFor, readings, shortcut, stairs, statusS04,
} from './domain';

// Handgebaute Vierfeldertafel (pe01 × pv01): misstraut (1–2) & nicht wählen (91) = 5, misstraut & wählen = 10,
// übrige & nicht wählen = 1, übrige & wählen = 9; dazu 2× „weiß nicht“ und 3× „nicht wahlberechtigt“.
const rows: [pe01: number, pv01: number, pe05: number, times: number, weight?: number][] = [
  [1, 91, 2, 2, 2], [1, 91, 4, 1, 2], [2, 91, 3, 2], [3, 91, 4, 1], [4, 1, 1, 4], [1, 1, 3, 6], [2, 2, 2, 1], [2, 2, 3, 3], [3, 2, 3, 5],
  [2, -8, 1, 2], [4, -50, 1, 3],
];
const col = (k: 0 | 1 | 2 | 4) => rows.flatMap(r => Array(r[3]).fill(k === 4 ? r[4] ?? 1 : r[k]));
const sav = fakeSav({
  pe01: { values: col(0), missingFrom: -1 }, pv01: { values: col(1), missingFrom: -1 }, pe05: { values: col(2), missingFrom: -1 },
  pa35: { values: col(0).map(() => -11), missingFrom: -1 }, wghtpew: { values: col(4) },
});
const joint = prepare(sav), tables = allTables(joint);

test('counts the fourfold table and its three bases', () => {
  assert.equal(tables.length, 1856);
  const t = fourfold(joint, PARTY);
  assert.deepEqual(t.n, { a: 5, b: 10, c: 1, d: 9 });
  assert.equal(percent(t, 'a', 'col'), 500 / 6);
  assert.equal(percent(t, 'a', 'row'), 100 / 3);
  assert.equal(percent(t, 'c', 'row'), 10);
  assert.equal(percent(t, 'a', 'all'), 20);
  assert.deepEqual(denominators(joint), { cell: 5, nonvoters: 6, distrusting: 15, all: 25 });
  assert.deepEqual(fourfold(joint, { ...PARTY, nonvote: [-8] }).n, { a: 7, b: 10, c: 1, d: 9 });
  assert.deepEqual(fourfold(joint, { ...PARTY, else0: true }).n, { a: 5, b: 12, c: 1, d: 12 });
});

test('names who the 100 % are and recognises the press-release way', () => {
  assert.match(checkP1(tables, joint, '83,3', '5')[0].text, /unter den 6, die nicht wählen wollen\. Genau so hat der Parteivorstand gerechnet/);
  assert.match(checkP1(tables, joint, '83', '')[0].text, /Trag noch die Häufigkeit/);
  assert.match(checkP1(tables, joint, '88,9', '8')[0].text, /gewichtet.*Gewichtet ist das vertretbar/);
  assert.match(checkP1(tables, joint, '33,3', '5')[0].text, /unter den 15 Befragten mit pe01 1–2.*Der Nenner ist vertauscht/);
  assert.match(checkP1(tables, joint, '20,0', '5')[0].text, /an allen 25 Befragten.*alle Befragten 100 %/);
  assert.match(checkP1(tables, joint, '16,7', '1')[0].text, /pe01 3–4.*andere Zelle/);
  assert.match(checkP1(tables, joint, '28,6', '2')[0].text, /pe05 1–2.*Lies pe05 noch einmal/);
  assert.match(checkP1(tables, joint, '66,7', '4')[0].text, /Vertretbar anders gerechnet: pe05↺ 1–2 · 91\./);
  assert.match(checkP1(tables, joint, '29,4', '5')[0].text, /Mit else=0 zählen bei dir auch 3 Nicht-Wahlberechtigte/);
  assert.match(checkP1(tables, joint, '41,7', '99')[0].text, /finde ich unter den gut 1\.800/);
  assert.deepEqual(checkP1(tables, joint, '', ''), []);
});

test('finds the way behind a number, merging mirror twins and silent else=0 variants', () => {
  const hits = lookup(tables, 500 / 6, 5);
  assert.equal(shortcut(hits[0].table.way), 'pe01 1–2 · 91');
  // In so kleinen Daten passt dieselbe Zahl zufällig auch zu pe01 3 (Wählende) – aber nie doppelt über wirkungslose Entscheidungen.
  assert.deepEqual(hits.map(h => `${shortcut(h.table.way)} ${h.cell} ${h.base}`), ['pe01 1–2 · 91 a col', 'pe01 3 · 91 b row', 'pe01 1–2, 4 · 91 a col']);
  assert.equal(shortcut({ item: 'pe05', distrust: [3, 4], nonvote: [-8, -7], else0: false, weighted: true }), 'pe05↺ 1–2 · 91+wn+vw · gewichtet');
});

test('checks three denominators and the own reading', () => {
  assert.deepEqual(checkP2(tables, joint, { rowDistrust: '33,3', rowOthers: '10', total: '20' }).map(n => n.tone), ['ok', 'ok', 'ok']);
  assert.match(checkP2(tables, joint, { rowDistrust: '83,3', rowOthers: '', total: '' })[0].text, /unter den 6.*andere Basis/);
  const p3 = { item: 'pe01' as const, distrust: [1, 2], nonvote: [-8], weighted: false, rowDistrust: '41,2', rowOthers: '10,0', n: '7' };
  assert.match(checkP3(tables, joint, p3).at(-1)!.text, /Stimmt für deine Lesart pe01 1–2 · 91\+wn/);
  assert.match(checkP3(tables, joint, { ...p3, rowDistrust: '33,3', n: '5' }).at(-1)!.text, /untag_na\(\) vergessen/);
  assert.match(checkP3(tables, joint, { ...p3, rowOthers: '20,0' }).at(-1)!.text, /Der Wert der Übrigen passt nicht/);
  assert.match(checkP3(tables, joint, { ...p3, n: '8' }).at(-1)!.text, /die Häufigkeit nicht/);
  assert.match(checkP3(tables, joint, { ...p3, item: 'pe05', distrust: [3, 4], nonvote: [], rowDistrust: '28,6', rowOthers: '', n: '2' }).at(-1)!.text, /Die Richtung ist gekippt/);
  assert.doesNotMatch(checkP3(tables, joint, { ...p3, rowOthers: '' }).at(-1)!.text, /Übrigen/);
  assert.match(checkP3(tables, joint, { ...p3, nonvote: [] }).at(0)!.text, /genau der Weg des Parteivorstands/);
  assert.match(checkP3(tables, joint, { ...p3, item: 'pe05', distrust: [1, 2] })[0].text, /Misst deine Gruppe wirklich Misstrauen/);
  assert.equal(readings(joint).length, 18);
});

test('asks at most three questions and builds the plenum card', () => {
  assert.deepEqual(questions(joint, { ...initialS04(), verdict: 1 }).map(x => x.id), ['intention']);
  const s = { ...initialS04(), guess: 'Nichtwähler', verdict: 2, reason: 'weil Misstrauen abhält', sentence: 'Von denen …', p1: { pct: '83,3', n: '5' },
    p3: { item: 'pe01' as const, distrust: [1, 2], nonvote: [], weighted: false, rowDistrust: '33,3', rowOthers: '10', n: '5' } };
  const q = questions(joint, s);
  assert.deepEqual(q.map(x => x.id), ['causal', 'dk', 'size']);
  assert.match(q[1].text, /41,2 % der Misstrauenden nicht wählen statt 33,3 %/);
  assert.deepEqual(plenumLines(s)[1], ['Meine Lesart', 'pe01 1–2 · 91']);
  assert.deepEqual(plenumLines(s)[2], ['Misstrauende · Übrige (nicht wählen)', '33,3 % · 10,0 %']);
  assert.equal(plenumLines(s)[3][1], 'irreführend');
});

test('writes R code for the own reading', () => {
  assert.equal(rCodeFor({ item: 'pe05', distrust: [3, 4], nonvote: [-8], else0: false, weighted: false }), [
    'allbus <- allbus %>%', '  mutate(', '    pe05_r = rec(pe05, rules = "rev"),   # umgepolt: jetzt 1 = stimme gar nicht zu',
    '    misstrauen3 = rec(pe05_r, rules = "1:2=1 [misstraut]; 3:4=0 [misstraut nicht]; else=NA"),',
    '    nichtwahl3  = rec(untag_na(pv01), rules = "91=1 [würde nicht wählen]; -8=1; 1:90=0 [würde wählen]; else=NA")',
    '  )', 'allbus %>% crosstab(misstrauen3, nichtwahl3, percentages = "row") %>% summary()',
  ].join('\n'));
  assert.match(rCodeFor({ item: 'pa35', distrust: [1, 3], nonvote: [], else0: false, weighted: true }),
    /rec\(pa35, rules = "1=1 \[misstraut\]; 3=1; 2=0 \[misstraut nicht\]; 4:5=0; else=NA"\)[\s\S]*rec\(pv01, rules = "91=1 \[würde nicht wählen\]; 1:90=0[\s\S]*weights = wghtpew/);
});

test('counts the distrust stairs and checks the top step', () => {
  const real = fixtureSav(), steps = stairs(real);
  assert.deepEqual(steps.map(s => s.step), [0, 1, 2, 3]);
  assert.deepEqual(steps.map(s => s.n), [1, 3, 2, 3]);
  assert.equal(steps[3].share.toFixed(1), '33.3');
  const top = steps[3];
  assert.match(checkExtra(real, top.share.toFixed(1).replace('.', ','))[0].text, /Stimmt/);
});

test('restores state defensively and reports status', () => {
  assert.deepEqual(parseS04(null), initialS04());
  const s = parseS04({ verdict: 9, p3: { item: 'pa35', distrust: [1, 9, 'x'], nonvote: [-8, -50] }, p1: { pct: 87 } });
  assert.equal(s.verdict, null);
  assert.deepEqual(s.p3.distrust, [1]);
  assert.deepEqual(s.p3.nonvote, [-8]);
  assert.equal(s.p1.pct, '');
  assert.equal(statusS04(initialS04()), 'open');
  assert.equal(statusS04({ ...initialS04(), guess: 'x' }), 'running');
  assert.equal(statusS04({ ...initialS04(), p1: { pct: '87', n: '127' }, p2: { rowDistrust: '6,5', rowOthers: '', total: '' },
    p3: { ...initialS04().p3, rowDistrust: '21,5' }, verdict: 2, sentence: 'Satz' }), 'done');
});
