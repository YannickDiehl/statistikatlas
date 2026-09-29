import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { claims } from './claims';
import { initialWork, type ClaimWork, type Step } from './state';
import { fixtureBuffer, fixtureSav } from './testData';
import { ClaimWorkspace } from './ui/ClaimWorkspace';
import { loadAllbusFile } from './ui/DataDrop';

const sav = fixtureSav();
const renderClaim = (claim: (typeof claims)[number], patch: Partial<ClaimWork>) => renderToStaticMarkup(createElement(ClaimWorkspace, {
  sav, fileName: 'ZA8831_v1-3-0.sav', claim, work: { ...initialWork(claim), ...patch }, onChange: () => {}, onConcept: () => {},
}));

test('loads only ZA8831 .sav files', async () => {
  const file = (name: string, buffer: ArrayBuffer) => ({ name, arrayBuffer: async () => buffer });
  const loaded = await loadAllbusFile(file('allbus.sav', fixtureBuffer()));
  assert.equal(loaded.version, 'v1.3.0, 2025-07-30 (synthetisch)');
  await assert.rejects(loadAllbusFile(file('allbus.csv', fixtureBuffer())), /Endung \.sav/);
});

const expectations: Record<Step, RegExp[]> = {
  0: [/Bevor du rechnest/, /Wer genau\?/],
  1: [/Deine Tabelle, live/, /library\(mariposa\)/, /Andere Variable suchen/],
  2: [/Dein Urteil über die Behauptung/, /mit diesen Daten nicht prüfbar/],
  3: [/kritische Gutachterin/, /Du hast ungewichtet gerechnet\./],
  4: [/Robustheitsspiegel: \d+ vertretbare Auswertungswege/, /Deine Faktencheck-Karte/, /R-Skript/],
};

for (const claim of claims) {
  test(`${claim.id}: every step renders with the synthetic file`, () => {
    for (const step of [0, 1, 2, 3, 4] as Step[]) {
      const html = renderClaim(claim, { step, reached: 4, verdict: 1, reason: 'Stimmt nur zum Teil, siehe Tabelle.', evidence: { row: 0, cell: 'yes', base: 'row' } });
      for (const re of expectations[step]) assert.match(html, re, `${claim.id} Schritt ${step}: ${re}`);
      assert.match(html, new RegExp(claim.quote.replace(/[.?]/g, '\\$&')));
    }
  });
}

test('only reached steps are reachable in the step bar', () => {
  const html = renderClaim(claims[0], { step: 1, reached: 1 });
  assert.equal((html.match(/<button disabled="">\d /g) ?? []).length, 3);
});

test('the workbench shows the evidence sentence and the midpoint switch only where it belongs', () => {
  const east = renderClaim(claims.find(c => c.id === 'osten')!, { step: 1, reached: 1, evidence: { row: 0, cell: 'yes', base: 'row' } });
  assert.match(east, /61,5 % in der Gruppe „Osten“: vertraut/);
  assert.match(east, /Mittelkategorie 4 ausschließen/);
  assert.doesNotMatch(renderClaim(claims[0], { step: 1, reached: 1 }), /Mittelkategorie/);
});

test('the mirror renders without React warnings', () => {
  const errors: string[] = [], original = console.error;
  console.error = (...args: unknown[]) => { errors.push(args.map(String).join(' ')); };
  try {
    for (const claim of claims) renderClaim(claim, { step: 4, reached: 4, verdict: 1, reason: 'Siehe Tabelle.', evidence: { row: 0, cell: 'yes', base: 'row' } });
  } finally { console.error = original; }
  assert.deepEqual(errors, []);
});
