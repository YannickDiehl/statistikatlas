import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRules, apply, trace, recode, splitRules, RuleError, type Code } from './rules';
import { num } from './format';

// ALLBUS 2023, pa02a, ungewichtet (aggregiert).
const CODES: Code[] = [
  { k: 1, label: 'sehr stark', f: 527 }, { k: 2, label: 'stark', f: 1542 }, { k: 3, label: 'mittel', f: 2303 },
  { k: 4, label: 'wenig', f: 663 }, { k: 5, label: 'überhaupt nicht', f: 190 }, { k: 'M', label: 'fehlend', f: 21 },
];
const SCALE = { min: 1, max: 5 };
const table = (rule: string) => Object.fromEntries(recode(parseRules(rule, SCALE), CODES, v => num(v)).rows.map(r => [`${r.code} ${r.label}`.trim(), r.f]));

test('reference cases checked with mariposa 0.7.4 on ZA8831', () => {
  assert.deepEqual(table('rev'), { '1 überhaupt nicht': 190, '2 wenig': 663, '3 mittel': 2303, '4 stark': 1542, '5 sehr stark': 527, 'NA fehlend, bleibt': 21 });
  assert.deepEqual(table('rev(1, 5)'), table('rev'));
  assert.deepEqual(table('1:2=1 [stark]; 3:5=0 [nicht stark]'), { '0 nicht stark': 3156, '1 stark': 2069, 'NA fehlend, bleibt': 21 });
  assert.deepEqual(table('1,2=1; 3:5=0'), { '0': 3156, '1': 2069, 'NA fehlend, bleibt': 21 });
  assert.deepEqual(table('1:2=1; else=0'), { '0': 3177, '1': 2069 });
  assert.deepEqual(table('1:2=1; 4:5=0'), { '0': 853, '1': 2069, 'NA keine Regel': 2303, 'NA fehlend, bleibt': 21 });
});

test('mean, binary share, unmatched codes and captured missings', () => {
  const rev = recode(parseRules('rev', SCALE), CODES, v => num(v));
  assert.ok(Math.abs(rev.mean - 3.2972) < 1e-4); assert.equal(rev.nValid, 5225); assert.equal(rev.binary, false);
  const dicho = recode(parseRules('1:2=1; 3:5=0', SCALE), CODES, v => num(v));
  assert.ok(Math.abs(dicho.mean - 2069 / 5225) < 1e-12); assert.equal(dicho.binary, true);
  const gap = recode(parseRules('1:2=1; 4:5=0', SCALE), CODES, v => num(v));
  assert.deepEqual(gap.unmatched.map(c => c.k), [3]); assert.equal(gap.captured, null);
  const cap = recode(parseRules('1:2=1 [stark]; else=0 [nicht stark]', SCALE), CODES, v => num(v));
  assert.equal(cap.captured?.code.k, 'M'); assert.equal(cap.captured?.to.v, 0); assert.equal(cap.captured?.to.label, 'nicht stark');
  assert.deepEqual(cap.targets, ['v1', 'v1', 'v0', 'v0', 'v0', 'v0']);
});

test('first matching rule wins, copy keeps codes, NA= catches missings, keywords ignore case', () => {
  const p = parseRules('1=9; 1:5=0; NA=-1', SCALE);
  assert.deepEqual(apply(p, CODES[0]), { t: 'val', v: 9, label: null });
  assert.deepEqual(apply(p, CODES[5]), { t: 'val', v: -1, label: null });
  assert.deepEqual(apply(parseRules('1:3=copy; ELSE=NA', SCALE), CODES[2]), { t: 'val', v: 3, label: 'mittel' });
  assert.deepEqual(apply(parseRules('1:3=copy; else=NA', SCALE), CODES[3]), { t: 'na' });
  assert.deepEqual(apply(parseRules('1:3=copy; else=copy', SCALE), CODES[5]), { t: 'miss' });
  assert.deepEqual(apply(parseRules('min:2=1; 3:max=0', SCALE), CODES[4]), { t: 'val', v: 0, label: null });
  assert.deepEqual(apply(parseRules('REV', SCALE), CODES[3]), { t: 'val', v: 2, label: 'wenig' });
});

test('trace stops at the first matching rule and marks missing values in ranges', () => {
  const t = trace(parseRules('1:2=1; 3:5=0', SCALE), CODES[3]);
  assert.deepEqual(t.checked.map(s => [s.rule, s.hit]), [[1, false], [2, true]]);
  const m = trace(parseRules('1:2=1; else=0', SCALE), CODES[5]);
  assert.deepEqual(m.checked.map(s => [s.rule, s.hit, s.missingInRange]), [[1, false, true], [2, true, false]]);
  assert.equal(trace(parseRules('rev', SCALE), CODES[0]).checked.length, 0);
});

test('labels may contain semicolons; invalid syntax throws readable RuleErrors', () => {
  assert.deepEqual(splitRules('1:2=1 [stark; sehr]; 3:5=0'), ['1:2=1 [stark; sehr]', '3:5=0']);
  const bad: [string, RegExp][] = [
    ['', /Gib eine Regel ein/], ['1:2', /verstehe ich nicht/], ['1:2=x', /kein gültiger neuer Wert/],
    ['a=1', /weder ein Code noch ein Bereich/], ['5:2=1', /von klein nach groß schreiben: 2:5/],
    ['dicho', /Werkstatt zeigt es noch nicht/], ['rev(5, 1)', /kleinere Wert zuerst/],
  ];
  for (const [rule, msg] of bad) assert.throws(() => parseRules(rule, SCALE), (e: unknown) => e instanceof RuleError && msg.test(e.message), rule);
});
