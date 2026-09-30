// Läuft nur mit der eigenen GESIS-Datei: ALLBUS_SAV=/pfad/ZA8831_v1-3-0.sav node --import tsx --test …
// Prüft die Referenzwerte aus Spezifikation 4.9 – nur Aggregate. Die Spezifikation nennt die Vorzeichen für ps03 im Original
// (positiv = unzufriedener); die Aufgabe polt ps03 um (Abschnitt 5), deshalb sind die Abstände hier negativ und die
// Konstanten und Vorhersagen 7 − Originalwert (2,76 → 4,24; 2,92 → 4,08).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readSav } from '../../sandbox/readSav';
import { COMMON_CAUSES, GROUP_IDS } from './content';
import { board, core, interaction, modelStore, moverVariants, predictions, prepare, selection, wobbleTest } from './domain';

const file = process.env.ALLBUS_SAV;
const skip = !file && 'ALLBUS_SAV nicht gesetzt';
const load = () => {
  const bytes = readFileSync(file!);
  return prepare(readSav(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)));
};
const r = (x: number, d: number) => Math.round(x * 10 ** d) / 10 ** d;

test('session 9: dummies with reference West-Bleibende, CIs, invariant predictions and group sizes match spec 4.9', { skip }, () => {
  const p = load(), models = modelStore(p);
  const m = core(models, 4)!;
  assert.deepEqual([r(m.c, 2), r(m.b[1], 2), r(m.b[2], 2), r(m.b[3], 2)], [4.24, -0.71, -0.17, -0.03]);
  assert.deepEqual(m.ci[2].map(x => r(x, 2)), [-0.4, 0.07]);
  assert.deepEqual(m.ci[3].map(x => r(x, 2)), [-0.39, 0.32]);
  assert.deepEqual(m.ci[1].map(x => r(x, 2)), [-0.82, -0.59]);
  assert.equal(r(m.fit.r2, 3), 0.041);
  assert.deepEqual([m.n[1], m.n[2], m.n[3], m.n[4]], [1003, 91, 97, 2063]);
  // Vorhersage Ost→West 4,08 (Original 2,92) bei jeder Referenz
  for (const row of board(models)) assert.equal(r(predictions(row.model)[2].fit, 2), 4.08);
  // Referenz Ost-Bleibende (Original −0,54 / −0,67 / −0,71) und West→Ost (Ost→West, Original +0,13)
  const ost = core(models, 1)!;
  assert.deepEqual([r(ost.c, 2), r(ost.b[2], 2), r(ost.b[3], 2), r(ost.b[4], 2)], [3.54, 0.54, 0.67, 0.71]);
  assert.equal(r(core(models, 3)!.b[2], 2), -0.13);
  // ungewichtet (Original 0,708 / 0,166 / 0,037)
  const u = core(models, 4, 'rev', false)!;
  assert.deepEqual([r(u.b[1], 3), r(u.b[2], 3), r(u.b[3], 3)], [-0.708, -0.166, -0.037]);
});

test('session 9: movers, selection, controls, the pt03 counter-check and the interaction match spec 4.9', { skip }, () => {
  const p = load(), models = modelStore(p);
  const mv = Object.fromEntries(moverVariants(p).map(v => [v.key, v]));
  assert.deepEqual([mv.model.ow, mv.model.wo], [91, 97]);
  assert.deepEqual([mv.all.ow, mv.all.wo], [139, 128]);
  assert.deepEqual([Math.round(mv.allWeighted.ow), Math.round(mv.allWeighted.wo)], [170, 67]);
  const s = selection(p);
  assert.deepEqual(GROUP_IDS.map(g => r(s.weighted[g], 1)), [40.5, 44.1, 78, 50]);
  // gemeinsame Ursachen: West→Ost 0,155 (Original) → −0,155; Ost-Lücke 0,69 → −0,69
  const cc = models({ outcome: 'rev', ref: 4, controls: COMMON_CAUSES, weighted: true })!;
  assert.deepEqual([r(cc.b[1], 2), r(cc.b[2], 2), r(cc.b[3], 3)], [-0.69, -0.17, -0.155]);
  assert.deepEqual(cc.ci[3].map(x => r(x, 2)), [-0.5, 0.19]);
  assert.equal(r(cc.fit.r2, 3), 0.094);
  // Kontrollen, die Folgen sein können: Vertrauen drückt die Ost-Lücke auf 0,49
  const trust = models({ outcome: 'rev', ref: 4, controls: [...COMMON_CAUSES, 'pt03'], weighted: true })!;
  assert.deepEqual([r(trust.b[1], 2), r(trust.b[2], 2), r(trust.b[3], 2)], [-0.49, -0.1, -0.19]);
  const income = models({ outcome: 'rev', ref: 4, controls: [...COMMON_CAUSES, 'di08c'], weighted: true })!;
  assert.deepEqual([r(income.b[1], 2), r(income.b[2], 2), r(income.b[3], 2)], [-0.69, -0.18, -0.18]);
  const lage = models({ outcome: 'rev', ref: 4, controls: [...COMMON_CAUSES, 'ep03'], weighted: true })!;
  assert.deepEqual([r(lage.b[1], 3), r(lage.b[2], 2), r(lage.b[3], 2)], [-0.645, -0.19, -0.15]);
  // Gegenprobe mit pt03 (−0,49 / −0,25 / +0,30)
  const pt = core(models, 4, 'pt03')!;
  assert.deepEqual([r(pt.b[1], 2), r(pt.b[2], 2), r(pt.b[3], 2)], [-0.49, -0.25, 0.3]);
  // Interaktion 0,51 (p = .023) → −0,51; ohne Interaktion 0,36 / 0,32 → −0,36 / −0,32; R² wie das Gruppenmodell
  const it = interaction(p)!;
  assert.deepEqual([r(it.fit.coef[1], 2), r(it.fit.coef[2], 2), r(it.fit.coef[3], 2), r(it.fit.p[3], 3)], [-0.03, -0.17, -0.51, 0.023]);
  assert.deepEqual(it.additive!.coef.slice(1).map(x => r(x, 2)), [-0.36, -0.32]);
  assert.ok(Math.abs(it.fit.r2 - core(models, 4)!.fit.r2) < 1e-10);
});

test('session 9: the wobble test stays far from the 0.7 both camps would need (concept values)', { skip }, () => {
  const models = modelStore(load());
  const w = Object.fromEntries(wobbleTest(core(models, 4)!).map(x => [x.g, x]));
  // Konzept (Original): Ost→West −0,02 … 0,26, West→Ost −0,12 … 0,13 – gerundet aus −0,015 … 0,255 und −0,123 … 0,134
  // (R: dfbeta(lm(…, weights = wghtpew)), explore7.R); umgepolt gespiegelt
  assert.deepEqual([r(w[2].lo, 3), r(w[2].hi, 3)], [-0.255, 0.015]);
  assert.deepEqual([r(w[3].lo, 3), r(w[3].hi, 3)], [-0.134, 0.123]);
  assert.ok(Math.abs(w[2].lo) < 0.7 && Math.abs(w[3].lo) < 0.7);
});
