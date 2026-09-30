// Läuft nur mit der eigenen GESIS-Datei: ALLBUS_SAV=/pfad/ZA8831_v1-3-0.sav node --import tsx --test src/tasks/s07-drei-fragen/allbus.local.test.ts
// Prüft die Referenzwerte aus Spezifikation 4.7 (ungewichtet; Kür gewichtet) – nur Aggregate.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readSav } from '../../sandbox/readSav';
import {
  ALPHA_NOT_FOUND, alphaVariants, checkNumber, detailOf, kuer, KUER_NOT_FOUND, kuerMeanVariants, landscapeNotes, pctTolerance, prepare, R_NOT_FOUND, rVariants, weakestItem,
} from './domain';

const file = process.env.ALLBUS_SAV;
const skip = !file && 'ALLBUS_SAV nicht gesetzt';
const load = () => {
  const bytes = readFileSync(file!);
  return prepare(readSav(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)));
};
const r3 = (x: number) => Math.round(x * 1000) / 1000;
const r1 = (x: number) => Math.round(x * 10) / 10;

test('session 7: battery, 35 short scales, the example and the bonus task match spec 4.7', { skip }, () => {
  const p = load();
  // Alle sieben Fragen: α = .833, ω = .841, n = 3.427; schwächste Trennschärfe pa29 (.348), ohne pa29 α = .842
  assert.deepEqual([r3(p.full.alpha), r3(p.full.omega), p.full.n], [0.833, 0.841, 3427]);
  assert.deepEqual([r3(p.full.alphaStd), r3(p.full.omegaStd)], [0.83, 0.835]);
  assert.equal(weakestItem(p), 'pa29');
  assert.deepEqual([r3(p.full.items[0].corrected), r3(p.full.items[0].alphaIfDeleted), r3(p.full.items[0].omegaIfDeleted)], [0.348, 0.842, 0.844]);
  // 14 von 35 mit α ≥ .70, keine mit pa29 (höchstens .631); pa29: 78 % Zustimmung (gewichtet)
  assert.equal(p.triples.length, 35);
  const good = p.triples.filter(t => t.alpha >= 0.7);
  assert.equal(good.length, 14);
  assert.equal(good.filter(t => t.items.includes('pa29')).length, 0);
  assert.equal(r3(Math.max(...p.triples.filter(t => t.items.includes('pa29')).map(t => t.alpha))), 0.631);
  assert.equal(Math.round(100 * p.agree.pa29), 78);
  // Höchstes α: pa31 + pa32 + pa35 = .776, als Stellvertreter Rang 26; die zweitstimmigste Rang 34; r(α, Stellvertreter) = .23
  const first = p.triples.find(t => t.rankAlpha === 1)!, second = p.triples.find(t => t.rankAlpha === 2)!;
  assert.deepEqual([first.key, r3(first.alpha), r3(first.r), first.rankR], ['pa31+pa32+pa35', 0.776, 0.702, 26]);
  assert.deepEqual([second.key, r3(second.alpha), second.rankR], ['pa30+pa32+pa35', 0.767, 34]);
  assert.equal(Math.round(p.corAlphaR * 100) / 100, 0.23);
  const bestR = p.triples.find(t => t.rankR === 1)!;
  assert.deepEqual([bestR.key, r3(bestR.r), bestR.rankAlpha], ['pa30+pa32+pa33', 0.764, 11]);
  assert.deepEqual([r3(Math.min(...p.triples.map(t => t.alpha))), r3(Math.min(...p.triples.map(t => t.r)))], [0.527, 0.63]);
  // Beispiel pa31 + pa32 + pa33: α = .759 (n = 3.478), r = .758 (n = 3.427); Varianten wie im Konzept
  const ex = p.byKey['pa31+pa32+pa33'], d = detailOf(p, ex);
  assert.deepEqual([r3(ex.alpha), ex.nAlpha, r3(ex.r), ex.nR, ex.rankAlpha, ex.rankR], [0.759, 3478, 0.758, 3427, 5, 2]);
  assert.deepEqual([r3(ex.alphaStd), r3(d.alphaW), r3(d.rAny[0]), r3(d.rW), r3(d.rLong[0])], [0.759, 0.754, 0.745, 0.749, 0.937]);
  assert.equal(p.byKey['pa29+pa31+pa32'].rankR, 4);
  const alpha = (s: string) => checkNumber(alphaVariants(p, ex), s, ALPHA_NOT_FOUND)[0];
  const r = (s: string) => checkNumber(rVariants(p, ex), s, R_NOT_FOUND)[0];
  assert.equal(alpha('0,759').tone, 'ok');
  assert.match(alpha('0,833').text, /α aller sieben Fragen/);
  assert.equal(r('.758').tone, 'ok');
  assert.match(r('0,937').text, /Gesamtindex aller sieben/);
  assert.match(r('0,745').text, /wer bekommt überhaupt einen Skalenwert/);
  assert.match(r('0,749').text, /mit Gewicht/);
  // Kür (gewichtet): 21,7 % im Schnitt gegen 14,2 % durchgehend
  const k = kuer(p, ['pa31', 'pa32', 'pa33']);
  assert.deepEqual([r1(k.meanW), r1(k.allW), r1(k.meanW - k.allW)], [21.7, 14.2, 7.5]);
  assert.match(checkNumber(kuerMeanVariants(k), '14,1', KUER_NOT_FOUND, pctTolerance)[0].text, /Kurzwert unter 2/);
  assert.match(checkNumber(kuerMeanVariants(k), '14,2', KUER_NOT_FOUND, pctTolerance)[0].text, /zweite Feld/);
  const notes = landscapeNotes(p, [['pa31', 'pa32', 'pa33']], true);
  assert.equal(notes[0], 'Die stimmigste Kurzskala ist pa31 + pa32 + pa35 (α = 0,776). Als Stellvertreter steht sie auf Platz 26 von 35.');
  assert.equal(notes[1], 'Die zweitstimmigste, pa30 + pa32 + pa35, steht als Stellvertreter auf Platz 34.');
  assert.equal(notes[3], 'Über alle 35 Kurzskalen hängen Stimmigkeit und Stellvertreter-Wert nur schwach zusammen (r = 0,228).');
  assert.equal(notes[4], '14 von 35 Kurzskalen erreichen α ≥ 0,70, keine davon mit pa29 (höchstens 0,631).');
});
