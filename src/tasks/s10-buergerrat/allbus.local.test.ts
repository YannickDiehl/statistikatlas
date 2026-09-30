// Läuft nur mit der eigenen GESIS-Datei: ALLBUS_SAV=/pfad/ZA8831_v1-3-0.sav node --import tsx --test …
// Prüft die Referenzwerte aus Spezifikation §4.10 (nur Aggregate).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readSav } from '../../sandbox/readSav';
import { averageMarginalEffects, type LogitFit } from '../kit/logit';
import { checkCells, checkChain, checkModel, likelihoodOk, likelihoodReveal, personNumbers, prepare, recogniseReport, tafel, type Prepared } from './domain';

const file = process.env.ALLBUS_SAV;
const skip = !file && 'ALLBUS_SAV nicht gesetzt';
let cached: Prepared | null = null;
const load = () => {
  if (cached) return cached;
  const bytes = readFileSync(file!);
  return (cached = prepare(readSav(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength))));
};
const r = (x: number, d: number) => Math.round(x * 10 ** d) / 10 ** d;
const fit = (p: Prepared, id: keyof Prepared['models']) => p.models[id] as LogitFit;

test('session 10: the expert model (weighted, n = 2,758) as in the concept', { skip }, () => {
  const p = load(), m = p.main!;
  assert.equal(m.n, 2758);
  assert.deepEqual(m.coef.map(b => r(b, 3)), [-2.154, 1.326, 0.34]);
  assert.deepEqual(m.expB.slice(1).map(v => r(v, 3)), [3.765, 1.405]);
  assert.equal(r(m.expB[1], 2), 3.77);
  // mariposa druckt [3.154; 4.495]; das Konzept rundet 4.495 noch einmal auf 4,50
  assert.deepEqual([r(m.ciLower[1], 3), r(m.ciUpper[1], 3)], [3.154, 4.495]);
  assert.deepEqual([r(m.minus2LLNull, 1), r(m.minus2LL, 1)], [1122.3, 856.4]);
  assert.equal(r(m.nagelkerke, 3), 0.275);
  assert.deepEqual(averageMarginalEffects(m).map(a => r(a.ame, 3)), [0.054, 0.014]);
  assert.equal(r(100 * p.ame[0], 1), 5.4);
  assert.match(checkModel(p, { pflicht: '3,77', interesse: '1,41' })[0].text, /^Stimmt: .*Die 3,77 auf der Folie des Sachverständigen ist bestätigt\./);
  // so, wie R es druckt (Dezimalpunkt), und gerundet
  assert.equal(checkModel(p, { pflicht: '3.765', interesse: '1.405' })[0].tone, 'ok');
  assert.equal(checkModel(p, { pflicht: '3,8', interesse: '1,4' })[0].tone, 'hint');
});

test('session 10: Jana and Herr Wiegand with and without one step more', { skip }, () => {
  const p = load(), m = p.main!;
  const j = personNumbers(m, p.profiles.jana), w = personNumbers(m, p.profiles.wiegand);
  assert.deepEqual([r(j.logit[0], 2), r(j.odds[0], 2), r(100 * j.prob[0], 1)], [1.18, 3.25, 76.4]);
  assert.deepEqual([r(100 * j.prob[1], 1), r(100 * (j.prob[1] - j.prob[0]), 1)], [92.4, 16.0]);
  assert.deepEqual([r(100 * w.prob[0], 1), r(100 * w.prob[1], 1), r(100 * (w.prob[1] - w.prob[0]), 1)], [96.0, 98.9, 2.9]);
  // Dolmetscher-Tafel des Konzepts: Logit 1,18 → 2,50 und 3,18 → 4,51; Chance 3,25 → 12,2 und 24,1 → 90,8
  assert.deepEqual([r(j.logit[1], 2), r(w.logit[0], 2), r(w.logit[1], 2)], [2.5, 3.18, 4.51]);
  assert.deepEqual([r(j.odds[1], 1), r(w.odds[0], 1), r(w.odds[1], 1)], [12.2, 24.1, 90.8]);
  // Nichtwahl-Risiko relativ: −68 % und −73 %
  assert.deepEqual(tafel(p).map(t => r(100 * (t.risk[1] - t.risk[0]) / t.risk[0], 0)), [-68, -73]);
  assert.equal(recogniseReport(p, '−68 %', 'pct')!.kind, 'riskJana');
  assert.equal(recogniseReport(p, '5,4', 'pp')!.kind, 'amePp');
  assert.equal(recogniseReport(p, '16,0', 'pp')!.kind, 'jana');
  assert.equal(recogniseReport(p, '2,9', 'pp')!.kind, 'wiegand');
  assert.equal(recogniseReport(p, '0,27', 'times')!.kind, 'invOr');
  assert.equal(recogniseReport(p, '1,33', 'logit')!.kind, 'b');
  assert.deepEqual(checkChain(p, { logit: '1,18', odds: '3,25', prob: '76,4 %' }).map(n => n.tone), ['ok', 'ok', 'ok']);
  // von Hand mit den gedruckten B-Werten (−2,154 + 1,326·2 + 0,340·2 = 1,178) und daraus weitergerechnet
  assert.deepEqual(checkChain(p, { logit: '1,178', odds: '3,248', prob: '0,765' }).map(n => n.tone), ['ok', 'ok', 'ok']);
  assert.deepEqual(checkChain(p, { logit: '1,18', odds: '3,254', prob: '0,7650' }).map(n => n.tone), ['ok', 'ok', 'ok']);
  // eine Stufe mehr von Hand: 3,25 × 3,77 = 12,25; Herr Wiegand −2,154 + 1,326·3 + 0,340·4 = 3,184 → 24,14 → × 3,765 = 90,89
  assert.deepEqual(checkCells(p, { janaUp: '12,25', wiegand: '24,14', wiegandUp: '90,89' }, 'odds').map(n => n.tone), ['ok', 'ok', 'ok']);
  assert.deepEqual(checkCells(p, { janaUp: '0,925', wiegand: '0,960', wiegandUp: '98,9 %' }, 'prob').map(n => n.tone), ['ok', 'ok', 'ok']);
  // ohne Gewicht bleibt erkennbar
  assert.match(checkCells(p, { janaUp: '', wiegand: '0,962', wiegandUp: '' }, 'prob')[0].text, /ohne Gewicht/);
  assert.match(checkChain(p, { logit: '', odds: '', prob: '3,25' })[0].text, /Das ist die Chance, nicht die Wahrscheinlichkeit/);
});

test('session 10: the error variants of the concept', { skip }, () => {
  const p = load();
  const or = (id: keyof Prepared['models']) => fit(p, id).expB.slice(1).map(v => r(v, 2));
  assert.deepEqual(or('unweighted'), [3.7, 1.4]);
  assert.deepEqual(or('nonvote'), [0.27, 0.71]);
  assert.deepEqual(or('pe09'), [0.27, 1.4]);
  assert.deepEqual(or('dontknow'), [1.8, 1.69]);
  assert.match(checkModel(p, { pflicht: '3,70', interesse: '1,40' })[0].text, /^Ungewichtet\?/);
  assert.match(checkModel(p, { pflicht: '0,27', interesse: '0,71' })[0].text, /^Gegenrichtung/);
  assert.match(checkModel(p, { pflicht: '0,27', interesse: '1,41' })[0].text, /^pe09 läuft/);
  assert.match(checkModel(p, { pflicht: '1,80', interesse: '1,69' })[0].text, /„Weiß nicht“ als Nichtwahl/);
});

test('session 10: hit rate 95.1 % against 94.8 % for “everyone votes”, 18 of 143 non-voters', { skip }, () => {
  const p = load(), c = p.main!.classification;
  assert.equal(r(c.overall, 1), 95.1);
  assert.equal(r(100 * c.n1 / (c.n0 + c.n1), 1), 94.8);
  assert.deepEqual([Math.round(c.n0), Math.round(c.correct0)], [143, 18]);
  assert.equal(likelihoodOk(p, { hitModel: '95,1', hitAll: '94.81508', nullLL: '1122.278', modelLL: '856.448', sentence: '' }), true);
  assert.equal(likelihoodOk(p, { hitModel: '95,1 %', hitAll: '94,8', nullLL: '1.122,3', modelLL: '856,4', sentence: '' }), true);
  assert.match(likelihoodReveal(p).join(' '), /Modell 95,1 % gegen 94,8 % .*Von 143 Nichtwählenden erkennt das Modell 18 .*von 1\.122,3 auf 856,4 \(−24 %/);
});
