import test from 'node:test';
import assert from 'node:assert/strict';
import { fakeSav, fixtureSav } from '../../sandbox/testData';
import { antragById } from './content';
import { askedCount, checkHandshake, checkStamp, decodeError, emptyStamp, findVar, initialS01, lowestLabel, parseS01, plenumLines, reportMarkdown, rScript, statusS01 } from './domain';

const sav = fakeSav({
  rh08b: { label: 'HALTE VON: ASTROLOGIE, HOROSKOPE', values: [1, 2, 3, -6, 2], labels: { [-6]: 'KENNE ICH NICHT', 1: 'VIEL', 2: 'ETWAS', 3: 'GAR NICHTS' }, missingFrom: -1 },
  dp03: { label: 'LEBENSPARTNER: GEMEINSAMER HAUSHALT?', values: [1, -10, 2, -10, 1], labels: { [-10]: 'TNZ: FILTER', 1: 'JA', 2: 'NEIN' }, missingFrom: -1 },
  mp16: { label: 'FLUECHTL. CHANCE O.RISIKO: SOZIALSTAAT', values: [1, 5, -11, -11, 3], labels: { [-11]: 'TNZ: SPLIT', 1: 'RISIKO UEBERWIEGT', 5: 'CHANCE UEBERWIEGT' }, missingFrom: -1 },
  pt03: { label: 'VERTRAUEN: BUNDESTAG', values: [1, 7, -11, -9, 4], labels: { [-11]: 'TNZ: SPLIT', [-9]: 'KEINE ANGABE', 1: 'GAR KEIN VERTRAUEN', 7: 'GROSSES VERTRAUEN' }, missingFrom: -1 },
});
const hits = (pattern: string) => { const r = findVar(sav, pattern); return r.ok ? r.hits.map(v => v.name) : r.message; };

test('searches names and labels like find_var and explains empty or partial hits', () => {
  assert.deepEqual(hits('horoskop'), ['rh08b']);
  assert.deepEqual(hits('fluecht'), ['mp16']);
  const stem = findVar(sav, 'fluecht');
  assert.ok(stem.ok && stem.notes.length === 0, 'Wortstamm am Wortanfang ist kein Wortteil-Treffer');
  assert.deepEqual(hits('pt0'), ['pt03']);
  const umlaut = findVar(sav, 'flüchtling');
  assert.ok(umlaut.ok && umlaut.hits.length === 0 && /ohne Umlaute/.test(umlaut.notes[0].text));
  const partial = findVar(sav, 'einsam');
  assert.ok(partial.ok && partial.hits[0].name === 'dp03' && /gemEINSAMer/.test(partial.notes[0].text));
  assert.match(String(hits('(')), /Sonderzeichen/);
  assert.match(String(hits('  ')), /Suchwort/);
});

test('counts who was asked and reads the lowest valid label', () => {
  assert.equal(askedCount(sav.byName.get('pt03')!), 4);
  assert.equal(askedCount(sav.byName.get('rh08b')!), 5);
  assert.equal(lowestLabel(sav.byName.get('pt03')!), 'GAR KEIN VERTRAUEN');
  const real = fixtureSav().byName.get('pt03')!;
  assert.equal(askedCount(real), Array.from(real.values).filter(x => x !== -11).length);
});

test('mirrors a take-stamp without judging it', () => {
  const take = { ...emptyStamp(), decision: 'take' as const };
  assert.match(checkStamp(sav, antragById.politik, take)[0].text, /Welche Variable/);
  assert.match(checkStamp(sav, antragById.politik, { ...take, variable: 'pt99' })[0].text, /gibt es im ALLBUS nicht/);
  const good = checkStamp(sav, antragById.politik, { ...take, variable: 'PT03', lowest: 'gar kein Vertrauen', asked: '4' });
  assert.match(good[0].text, /Bundestag/);
  assert.equal(good[1].tone, 'ok');
  assert.match(good[2].text, /4 Befragten wurde die Frage gestellt/);
  assert.match(checkStamp(sav, antragById.politik, { ...take, variable: 'pt03', asked: '5' })[1].text, /TNZ: SPLIT \(n = 1\)/);
  assert.match(checkStamp(sav, antragById.politik, { ...take, variable: 'pt03', asked: '3' })[1].text, /gültigen Antworten/);
  assert.match(checkStamp(sav, antragById.politik, { ...take, variable: 'pt03', lowest: 'viel' })[1].text, /passt nicht/);
  assert.match(checkStamp(sav, null, { ...take, variable: 'rh08b' })[0].text, /HALTE VON: ASTROLOGIE/);
});

test('asks for documented searches and lets a reason overrule an objection', () => {
  const ask = { ...emptyStamp(), decision: 'ask' as const, searches: ['angst'] };
  assert.match(checkStamp(sav, antragById.politik, ask)[0].text, /mindestens zwei Suchwörter/);
  const two = { ...ask, searches: ['angst', 'furcht'] };
  assert.match(checkStamp(sav, antragById.gefluechtete, two)[0].text, /Einspruch/);
  assert.equal(checkStamp(sav, antragById.gefluechtete, { ...two, note: 'Risiko ist nicht dasselbe wie Angst.' })[0].tone, 'ok');
  assert.equal(checkStamp(sav, antragById.einsamkeit, two)[0].tone, 'ok');
  assert.deepEqual(checkStamp(sav, antragById.einsamkeit, emptyStamp()), []);
});

test('checks the handshake and decodes typical R errors', () => {
  assert.equal(checkHandshake(sav, '5', String(sav.variables.length)).every(n => n.tone === 'ok'), true);
  assert.equal(checkHandshake(sav, '6', '1')[0].tone, 'warn');
  assert.deepEqual(checkHandshake(sav, '', ''), []);
  assert.match(decodeError('Fehler in find_var(allbus, "x") : konnte Funktion "find_var" nicht finden')!.fix, /library\(mariposa\)/);
  assert.match(decodeError("Error: object 'allbus' not found")!.cause, /kennt dieses Objekt nicht/);
  assert.match(decodeError('Error in library(mariposa) : there is no package called ‘mariposa’')!.fix, /install\.packages/);
  assert.equal(decodeError('alles gut'), null);
});

test('restores state defensively and reports status, plenum line, report and script', () => {
  assert.deepEqual(parseS01(null), initialS01());
  const state = parseS01({ cases: '5246', vars: '579', stamps: { politik: { decision: 'take', variable: 'pt03', searches: ['vertrauen', 4] }, horoskop: { decision: 'nonsense' } }, mode: 'pair' });
  assert.equal(state.stamps.politik.variable, 'pt03');
  assert.deepEqual(state.stamps.politik.searches, ['vertrauen']);
  assert.equal(state.stamps.horoskop.decision, null);
  assert.equal(state.mode, 'pair');
  assert.equal(statusS01(initialS01()), 'open');
  assert.equal(statusS01(state), 'running');
  const done = { ...state, stamps: {
    horoskop: { ...emptyStamp(), decision: 'take' as const, variable: 'rh08b' },
    gefluechtete: { ...emptyStamp(), decision: 'ask' as const, searches: ['angst', 'fluecht'] },
    politik: { ...emptyStamp(), decision: 'take' as const, variable: 'pt03' },
    einsamkeit: { ...emptyStamp(), decision: 'ask' as const, searches: ['einsam', 'allein'] },
  } };
  assert.equal(statusS01(done), 'done');
  assert.deepEqual(plenumLines(done).slice(0, 2), [['Muss das Büro beauftragen', '2 von 4'], ['Idee 3 (Politik) übernommen als', 'pt03']]);
  assert.match(reportMarkdown(done), /Stempel: beauftragen · gesucht: „angst“, „fluecht“/);
  const script = rScript(done);
  assert.match(script, /find_var\(allbus, "fluecht"\)/);
  assert.match(script, /codebook\(allbus, rh08b, pt03\)/);
});
