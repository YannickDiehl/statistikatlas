import test from 'node:test';
import assert from 'node:assert/strict';
import { isMissingCode, readSav, SavError } from './readSav';
import { fixtureBuffer, fixtureExpected } from './testData';

for (const file of ['sandbox-fixture.sav', 'sandbox-fixture-uncompressed.sav']) {
  test(`reads ${file} exactly like haven`, () => {
    const expected = fixtureExpected();
    const sav = readSav(fixtureBuffer(file));
    assert.equal(sav.nCases, expected.nCases);
    assert.deepEqual(sav.variables.map(v => v.name), expected.variables.map((v: { name: string }) => v.name));
    for (const e of expected.variables) {
      const v = sav.byName.get(e.name)!;
      assert.equal(v.label, e.label, e.name);
      assert.equal(v.kind, e.kind, e.name);
      if (e.kind === 'numeric') assert.deepEqual(Array.from(v.values, x => Number.isNaN(x) ? null : x), e.values, e.name);
      else assert.deepEqual(v.strings, e.strings, e.name);
      const range = e.naRange ? [e.naRange[0] ?? -Infinity, e.naRange[1] ?? Infinity] : null;
      assert.deepEqual(v.missing.range, range, `${e.name} range`);
      assert.deepEqual(v.missing.values, e.naValues, `${e.name} values`);
      assert.deepEqual([...v.valueLabels].map(([value, label]) => ({ value, label })), e.valueLabels, `${e.name} labels`);
    }
  });
}

test('keeps user missing codes as values and recognises them as missing', () => {
  const pv01 = readSav(fixtureBuffer()).byName.get('pv01')!;
  assert.ok(pv01.values.includes(-8));
  assert.equal(isMissingCode(pv01, -8), true);
  assert.equal(isMissingCode(pv01, 91), false);
  assert.equal(isMissingCode(pv01, NaN), true);
});

test('rejects files that are not plain SPSS system files', () => {
  const text = new TextEncoder().encode('Das ist keine SPSS-Datei, sondern Text.'.padEnd(200, '.'));
  assert.throws(() => readSav(text.buffer), (e: unknown) => e instanceof SavError && /keine SPSS-Datei/.test(e.message));
  const zsav = new Uint8Array(fixtureBuffer().slice(0));
  zsav.set(new TextEncoder().encode('$FL3'), 0);
  assert.throws(() => readSav(zsav.buffer), /ZSAV/);
  assert.throws(() => readSav(new ArrayBuffer(10)), /zu kurz/);
});
