// Läuft nur mit der eigenen GESIS-Datei: ALLBUS_SAV=/pfad/ZA8831_v1-3-0.sav pnpm test
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { analyse, columnShare } from './analysis';
import { itemOf, jugend, nichtwahl, osten, type Claim, type Choice } from './claims';
import { readSav } from './readSav';

const file = process.env.ALLBUS_SAV;

test('reproduces the reference values of the specification', { skip: !file && 'ALLBUS_SAV nicht gesetzt' }, () => {
  const bytes = readFileSync(file!);
  const sav = readSav(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
  const run = (claim: Claim, patch: Partial<Choice> = {}) => {
    const choice = { ...claim.defaults, ...patch };
    return analyse(sav, claim.analysis(choice, itemOf(claim, choice.item)));
  };
  const p = (x: number) => (100 * x).toFixed(1);
  assert.equal(sav.nCases, 5246);
  const young = run(jugend, { weighted: true });
  assert.deepEqual([p(young.target), p(young.comparison)], ['33.1', '40.9']);
  const wide = run(jugend, { weighted: true, positive: [1, 2, 3] });
  assert.deepEqual([p(wide.target), p(wide.comparison)], ['80.1', '84.0']);
  const east = run(osten);
  assert.deepEqual([p(east.target), p(east.comparison)], ['34.6', '43.0']);
  assert.equal(east.table.n[0] + east.table.n[1], 3592);
  const distrustful = (weighted: boolean) => columnShare(run(osten, { positive: [3, 4, 5, 6, 7], weighted }).table, 0, 'no');
  assert.deepEqual([p(distrustful(false)), p(distrustful(true))], ['41.8', '23.4']);
  assert.deepEqual([p(run(osten, { item: 'pt12' }).target), p(run(osten, { item: 'pt15' }).target)], ['31.9', '15.8']);
  assert.equal(p(run(nichtwahl).target), '8.8');
  assert.equal(p(run(nichtwahl, { weighted: true }).target), '9.2');
  assert.equal(p(run(nichtwahl, { missing: { mode: 'codesAsYes', codes: [-8] } }).target), '23.0');
  const agree = run(nichtwahl, { positive: [1, 2] });
  assert.deepEqual([p(agree.target), p(columnShare(agree.table, 0, 'yes'))], ['6.5', '87.0']);
  assert.equal(p(run(nichtwahl, { item: 'pa35' }).target), '10.8');
});
