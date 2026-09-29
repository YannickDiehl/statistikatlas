import test from 'node:test';
import assert from 'node:assert/strict';
import { claims, itemOf, jugend, nichtwahl, osten } from './claims';
import { enumeratePaths } from './multiverse';
import { CAUSAL_WORDS, questionsFor, type Evidence, type QuestionContext } from './questions';
import { fixtureSav } from './testData';

const sav = fixtureSav();
const ctx = (claim: typeof jugend, patch: Partial<QuestionContext> = {}): QuestionContext => ({
  sav, claim, choice: claim.defaults, item: itemOf(claim, claim.defaults.item), evidence: null, verdict: 1, reason: 'Stimmt nur teilweise.', ...patch,
});
const ids = (c: QuestionContext) => questionsFor(c).map(q => q.id);
const colEvidence: Evidence = { row: 0, cell: 'yes', base: 'col' };

test('every one of the eleven rules can be triggered by one of the three claims', () => {
  const seen = new Set<string>();
  for (const claim of claims) for (const p of enumeratePaths(claim)) for (const missing of claim.missingOptions) {
    const choice = { ...p.choice, missing: missing.mode };
    for (const id of ids(ctx(claim, { choice, item: itemOf(claim, choice.item), evidence: colEvidence, reason: 'weil es so ist' }))) seen.add(id);
  }
  assert.deepEqual([...seen].sort(), ['base', 'causal', 'intention', 'item', 'midpoint', 'missing', 'size', 'split', 'temporal', 'threshold', 'weight']);
});

test('rules only fire when their condition holds', () => {
  assert.ok(ids(ctx(jugend)).includes('weight'));
  assert.ok(!ids(ctx(jugend, { choice: { ...jugend.defaults, weighted: true } })).includes('weight'));
  assert.ok(!ids(ctx(jugend, { verdict: 4 })).includes('temporal'));
  assert.ok(!ids(ctx(jugend, { verdict: null })).includes('temporal'));
  assert.ok(!ids(ctx(jugend)).includes('base'));
  assert.ok(ids(ctx(jugend, { evidence: colEvidence })).includes('base'));
  assert.ok(!ids(ctx(jugend)).includes('causal'));
  assert.ok(ids(ctx(nichtwahl)).includes('intention') && !ids(ctx(osten)).includes('intention'));
  assert.ok(ids(ctx(osten)).includes('midpoint'));
  assert.ok(!ids(ctx(osten, { choice: { ...osten.defaults, exclude: [4] } })).includes('midpoint'));
  assert.ok(ids(ctx(osten)).includes('split') && !ids(ctx(jugend)).includes('split'));
  assert.ok(!ids(ctx(jugend)).includes('missing'));
  assert.ok(ids(ctx(jugend, { choice: { ...jugend.defaults, missing: { mode: 'allAsNo' } } })).includes('missing'));
  assert.ok(ids(ctx(nichtwahl)).includes('missing'));
});

test('recognises causal language without false alarms', () => {
  for (const s of ['weil sie enttäuscht sind', 'Das führt dazu', 'Der Grund ist Bildung', 'deshalb', 'verursacht']) assert.ok(CAUSAL_WORDS.test(s), s);
  for (const s of ['Die Grundgesamtheit', 'Ein Drittel vertraut', 'Anteil']) assert.ok(!CAUSAL_WORDS.test(s), s);
});

test('the causal question fits each claim', () => {
  const causal = (claim: typeof jugend) => questionsFor(ctx(claim, { reason: 'weil es so ist' })).find(q => q.id === 'causal')!.text;
  assert.match(causal(jugend), /Alter und Generation nicht trennen/);
  assert.match(causal(osten), /Gleichaltrige mit gleichem Einkommen/);
  assert.match(causal(nichtwahl), /beides erklären/);
  assert.match(causal(nichtwahl), /umgekehrt/);
  // Alter und Region werden von keiner Drittvariable verursacht.
  for (const claim of [jugend, osten]) assert.doesNotMatch(causal(claim), /beides erklären/);
});

test('questions quote recomputed numbers', () => {
  const split = questionsFor(ctx(osten, { choice: { ...osten.defaults, missing: { mode: 'allAsNo' } } })).find(q => q.id === 'split')!;
  assert.match(split.text, /Nicht-Gefragten als „nein“/);
  const threshold = questionsFor(ctx(osten)).find(q => q.id === 'threshold')!;
  assert.match(threshold.text, /\d+,\d %/);
  assert.equal(threshold.concept, 'operationalization');
});

test('the weight question never compares a number with itself', () => {
  for (const claim of claims) for (const p of enumeratePaths(claim)) for (const base of ['row', 'col'] as const) {
    const choice = { ...p.choice, weighted: false };
    const q = questionsFor(ctx(claim, { choice, item: itemOf(claim, choice.item), evidence: { row: 0, cell: 'yes', base } })).find(x => x.id === 'weight')!;
    const m = q.text.match(/\(([\d,]+ %) statt ([\d,]+ %)\)/);
    assert.ok(!m || m[1] !== m[2], q.text);
  }
});
