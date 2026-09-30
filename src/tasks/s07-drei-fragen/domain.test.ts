import test from 'node:test';
import assert from 'node:assert/strict';
import { fakeSav, fixtureSav } from '../../sandbox/testData';
import type { ItemId } from './content';
import {
  ALPHA_NOT_FOUND, alphaVariants, BATTERY_NOT_FOUND, batteryVariants, checkNumber, checkWeakest, chooseFinal, detailOf, dutyFor, facetNote, initialS07,
  keptOf, keyOf, kuer, KUER_NOT_FOUND, kuerAllVariants, kuerMeanVariants, kuerReveal, labelOf, landscapeNotes, pa29Note, parseS07, pctTolerance, plenumLines,
  prepare, R_NOT_FOUND, recognised, revealReady, rKuer, rProposal, rScript, rVariants, scaffoldKuer, scaffoldProposal, statusS07, tolerance, toggleStrike,
  TRIPLES, weakestItem, type S07State,
} from './domain';

const p = prepare(fixtureSav());
const t = p.byKey['pa31+pa32+pa33'], d = detailOf(p, t);
/** Vier Nachkommastellen: enge Toleranz, damit sich Varianten der kleinen Testdatei nicht zufällig überlappen. */
const f4 = (x: number) => x.toFixed(4).replace('.', ',').replace('-', '−');
const one = (notes: { tone: string; text: string }[]) => { assert.equal(notes.length, 1, JSON.stringify(notes)); return notes[0]; };
const alpha = (input: string) => one(checkNumber(alphaVariants(p, t), input, ALPHA_NOT_FOUND));
const r = (input: string) => one(checkNumber(rVariants(p, t), input, R_NOT_FOUND));

test('prepare(): 35 short scales with ranks, values 1–5 only, weighted agreement per item', () => {
  assert.equal(TRIPLES.length, 35);
  assert.equal(p.triples.length, 35);
  assert.deepEqual(p.triples.map(x => x.rankAlpha).sort((a, b) => a - b), Array.from({ length: 35 }, (_, i) => i + 1));
  assert.deepEqual(p.triples.map(x => x.rankR).sort((a, b) => a - b), Array.from({ length: 35 }, (_, i) => i + 1));
  assert.equal(p.triples[0].key, 'pa29+pa30+pa31');
  assert.deepEqual(t.rest, ['pa29', 'pa30', 'pa34', 'pa35']);
  const col = (v: number[]) => ({ values: v, missingFrom: -1 });
  const sav = fakeSav({
    pa29: col([1, 2, 3, -11, -9, 5]), pa30: col([1, 1, 2, -11, 3, 4]), pa31: col([2, 1, 3, -11, 3, 5]), pa32: col([1, 2, 2, -11, 4, 5]),
    pa33: col([2, 2, 3, -11, 4, 4]), pa34: col([1, 3, 3, -11, 5, 4]), pa35: col([2, 2, 1, -11, 4, 5]), wghtpew: { values: [1, 1, 2, 1, 1, 0.5] },
  });
  const q = prepare(sav);
  assert.deepEqual([...q.x.pa29], [1, 2, 3, NaN, NaN, 5]);
  // pa29: Zustimmung (1–2) bei Gewicht 1 + 1 von 1 + 1 + 2 + 0,5 gültigem Gewicht
  assert.equal(q.agree.pa29, 2 / 4.5);
  assert.equal(q.full.n, 4);
});

test('the value detector names every alpha variant and accepts only alpha, standardised, weighted and listwise-7 alpha', () => {
  assert.equal(alpha(f4(t.alpha)).tone, 'ok');
  assert.match(alpha(f4(t.alpha)).text, /^Stimmt: Die Stimmigkeit deiner drei Fragen ist α = 0,599 \(n = 36\)\./);
  assert.match(alpha(f4(t.omega)).text, /McDonalds ω/);
  assert.equal(recognised(alphaVariants(p, t), f4(t.omega)), false);
  for (const [value, re] of [[t.alphaStd, /standardisierte α .* angenommen/], [d.alphaW, /gewichtete α .* angenommen/], [d.alphaAll7, /allen sieben Antworten .* angenommen/]] as const) {
    assert.equal(alpha(f4(value)).tone, 'hint');
    assert.match(alpha(f4(value)).text, re);
    assert.equal(recognised(alphaVariants(p, t), f4(value)), true);
  }
  assert.match(alpha(f4(p.full.alpha)).text, /α aller sieben Fragen/);
  assert.match(alpha(f4(d.alphaRest)).text, /vier gestrichenen Fragen/);
  assert.match(alpha(f4(p.full.items[0].alphaIfDeleted)).text, /„Alpha ohne Item“ für pa29/);
  assert.match(alpha(f4(t.r)).text, /Stellvertreter-Wert r .* Stimmigkeit α/);
  const other = p.byKey['pa30+pa31+pa35'];
  assert.match(alpha(f4(other.alpha)).text, /Kurzskala pa30 \+ pa31 \+ pa35 .* Behalten hast du pa31 \+ pa32 \+ pa33/);
  for (const wrong of [p.full.alpha, d.alphaRest, t.r, other.alpha]) assert.equal(recognised(alphaVariants(p, t), f4(wrong)), false);
  assert.equal(alpha('0,9999').text, ALPHA_NOT_FOUND);
  assert.match(alpha('0,6').text, /drei Nachkommastellen/);
  assert.match(alpha('abc').text, /nicht als Zahl/);
  assert.deepEqual(checkNumber(alphaVariants(p, t), '  ', ALPHA_NOT_FOUND), []);
  assert.equal(tolerance('0,76'), 0.005 + 1e-9);
  assert.equal(tolerance('0,7'), null);
  assert.equal(pctTolerance('21,7'), 0.05 + 1e-9);
  assert.equal(pctTolerance('22'), null);
});

test('the value detector names every r variant: min_valid, weight, overlap with the total index, alpha', () => {
  assert.equal(r(f4(t.r)).tone, 'ok');
  assert.match(r(f4(t.r)).text, /^Stimmt: Der Stellvertreter-Wert deiner Kurzskala ist r = 0,685 \(n = 32\)\./);
  assert.match(r(f4(d.rAny[0])).text, /Angenommen .* wer bekommt überhaupt einen Skalenwert\?/);
  assert.equal(recognised(rVariants(p, t), f4(d.rAny[0])), true);
  assert.match(r(f4(d.rW)).text, /mit Gewicht .* angenommen/);
  assert.match(r(f4(d.rLong[0])).text, /Gesamtindex aller sieben .* an sich selbst/);
  assert.equal(recognised(rVariants(p, t), f4(d.rLong[0])), false);
  assert.match(r(f4(t.alpha)).text, /Stimmigkeit α .* pearson_cor\(\)/);
  assert.match(r(f4(p.byKey['pa29+pa30+pa33'].r)).text, /Stellvertreter-Wert der Kurzskala pa29 \+ pa30 \+ pa33/);
  assert.equal(r('0,0001').text, R_NOT_FOUND);
});

test('the battery check accepts the seven-item alpha and names omega and alpha if item deleted', () => {
  const check = (input: string) => one(checkNumber(batteryVariants(p), input, BATTERY_NOT_FOUND));
  const ok = check(f4(p.full.alpha));
  assert.equal(ok.tone, 'ok');
  assert.match(ok.text, /α = 0,722 \(n = 32\)\. Daneben zeigt R McDonalds ω = 0,745/);
  assert.match(check(f4(p.full.alphaStd)).text, /standardisierte α .* angenommen/);
  assert.match(check(f4(p.full.omega)).text, /McDonalds ω .* Cronbachs α/);
  assert.match(check(f4(p.full.omegaStd)).text, /standardisierte ω/);
  assert.match(check(f4(p.full.items[3].alphaIfDeleted)).text, /„Alpha ohne Item“ für pa32/);
  assert.match(check(f4(t.alpha)).text, /Kurzskala pa31 \+ pa32 \+ pa33/);
  assert.equal(check('0,0001').text, BATTERY_NOT_FOUND);
});

test('the weakest item: wrong item without numbers, then the value from corrected_r', () => {
  assert.equal(weakestItem(p), 'pa29');
  assert.deepEqual(checkWeakest(p, '', '0,1'), []);
  const wrong = one(checkWeakest(p, 'pa31', ''));
  assert.match(wrong.text, /pa31 ist nicht die Frage mit der schwächsten Trennschärfe/);
  assert.doesNotMatch(wrong.text, /\d,\d/);
  assert.match(one(checkWeakest(p, 'pa29', '')).text, /Richtige Frage/);
  const ok = one(checkWeakest(p, 'pa29', f4(p.full.items[0].corrected)));
  assert.equal(ok.tone, 'ok');
  assert.match(ok.text, /Trennschärfe 0,125\)\. Ohne pa29 läge α bei 0,753 – höher als mit ihr\. Ausgerechnet die Frage mit der meisten Zustimmung/);
  assert.match(one(checkWeakest(p, 'pa29', f4(p.full.items[0].alphaIfDeleted))).text, /„Alpha ohne Item“ \(alpha_deleted\)/);
  assert.match(one(checkWeakest(p, 'pa29', f4(p.full.items[2].corrected))).text, /Trennschärfe von pa31, nicht von pa29/);
  assert.match(one(checkWeakest(p, 'pa29', '0,9999')).text, /corrected_r/);
});

test('content notes name missing sides; pa29 gets the validity note', () => {
  assert.deepEqual(facetNote(['pa29', 'pa30', 'pa32']), { tone: 'ok', text: 'Jede der drei Seiten ist mit einer Frage vertreten.' });
  assert.equal(facetNote(['pa31', 'pa32', 'pa35']).text, 'Aus „Volkssouveränität“ ist keine Frage mehr dabei.');
  assert.equal(facetNote(['pa30', 'pa31', 'pa35']).text, 'Aus „Volkssouveränität“ und „Einheit des Volkes“ ist keine Frage mehr dabei.');
  assert.deepEqual(pa29Note(p, ['pa31', 'pa32', 'pa33']), []);
  assert.match(pa29Note(p, ['pa29', 'pa31', 'pa32'])[0].text, /pa29 trifft den Kern des Begriffs, aber \d+ % stimmen ihr zu/);
});

test('landscape notes come from the data: champions, their proxy ranks, alpha ≥ .70 and the pa29 caveat', () => {
  const best = p.triples.find(x => x.rankAlpha === 1)!;
  const notes = landscapeNotes(p, [['pa31', 'pa32', 'pa33'], ['pa30', 'pa31', 'pa32']], false);
  assert.equal(notes[0], `Die stimmigste Kurzskala ist ${labelOf(best.items)} (α = ${best.alpha.toFixed(3).replace('.', ',')}). Als Stellvertreter steht sie auf Platz ${best.rankR} von 35.`);
  assert.match(notes[3], /hängen Stimmigkeit und Stellvertreter-Wert .* zusammen \(r = /);
  assert.match(notes[4], /von 35 Kurzskalen erreichen α ≥ 0,70/);
  assert.equal(notes.length, 5);
  const more = landscapeNotes(p, [['pa29', 'pa31', 'pa32']], true);
  assert.equal(more.length, 7);
  assert.match(more[5], /Alle sieben Fragen erreichen α = 0,722/);
  assert.match(more[6], /Steht pa29 in der Kurzskala/);
});

test('the duty question is a fixed draw per group number', () => {
  const items = Array.from({ length: 7 }, (_, g) => dutyFor(g + 1).item);
  assert.equal(new Set(items).size, 7);
  assert.deepEqual(dutyFor(8), dutyFor(1));
  assert.deepEqual(dutyFor(3), dutyFor(3));
  assert.ok(dutyFor(2).reason.length > 10);
});

test('the bonus task: mean index vs combination index, weighted, with its variants', () => {
  const col = (v: number[]) => ({ values: v, missingFrom: -1 });
  const other = col([3, 3, 3, 3, 3, 3]);
  const sav = fakeSav({
    pa29: other, pa30: other, pa34: other, pa35: other,
    pa31: col([1, 1, 2, 4, 2, -9]), pa32: col([2, 3, 1, 5, 2, 1]), pa33: col([1, 2, 2, 3, 5, 1]),
    wghtpew: { values: [1, 2, 1, 1, 1, 1] },
  });
  const q = prepare(sav);
  const k = kuer(q, ['pa31', 'pa32', 'pa33']);
  // Kurzwerte 4/3, 2, 5/3, 4, 3, fehlt; alle drei 1–2: Fälle 1 und 3
  assert.equal(k.meanW, (100 * 4) / 6);
  assert.equal(k.allW, (100 * 2) / 6);
  assert.equal(k.meanU, (100 * 3) / 5);
  assert.equal(k.strictW, (100 * 2) / 6);
  assert.equal(k.meanAnyW, (100 * 5) / 7);
  assert.equal(k.allAnyW, (100 * 2) / 7);
  const fk = kuer(p, ['pa31', 'pa32', 'pa33']);
  const f1 = (x: number) => x.toFixed(2).replace('.', ',');
  const mean = (s: string) => one(checkNumber(kuerMeanVariants(fk), s, KUER_NOT_FOUND, pctTolerance));
  const all = (s: string) => one(checkNumber(kuerAllVariants(fk), s, KUER_NOT_FOUND, pctTolerance));
  assert.equal(mean(f1(fk.meanW)).tone, 'ok');
  assert.match(mean(f1(fk.meanU)).text, /ohne Gewicht/);
  assert.match(mean(f1(fk.allW)).text, /zweite Feld/);
  assert.match(mean(f1(fk.meanW - fk.allW)).text, /Randsumme/);
  assert.equal(all(f1(fk.allW)).tone, 'ok');
  assert.match(all(f1(fk.meanW)).text, /erste Feld/);
  assert.equal(recognised(kuerMeanVariants(fk), f1(fk.meanU), pctTolerance), false);
  assert.match(kuerReveal(fk), /gelten nur nach der Mittelwertlogik als populistisch/);
});

test('state: striking resets the proposal values, the final choice resets the bonus task, parse is defensive', () => {
  let s = initialS07();
  for (const id of ['pa35', 'pa29', 'pa34', 'pa30'] as ItemId[]) s = toggleStrike(s, 'a', id);
  assert.deepEqual(s.a.struck, ['pa29', 'pa30', 'pa34', 'pa35']);
  assert.deepEqual(keptOf(s.a.struck), ['pa31', 'pa32', 'pa33']);
  s = { ...s, a: { ...s.a, alpha: '0,599', r: '0,685', why: 'weil' } };
  assert.equal(toggleStrike(s, 'a', 'pa31'), s, 'a fifth question is ignored');
  const back = toggleStrike(s, 'a', 'pa35');
  assert.deepEqual([back.a.struck, back.a.alpha, back.a.r, back.a.why], [['pa29', 'pa30', 'pa34'], '', '', 'weil']);
  assert.equal(keptOf(back.a.struck), null);
  let f = chooseFinal({ ...s, kuer: { mean: '21,7', all: '14,2' } }, ['pa33', 'pa31', 'pa32']);
  assert.deepEqual(f.final, ['pa31', 'pa32', 'pa33']);
  assert.deepEqual(f.kuer, { mean: '', all: '' });
  f = { ...f, kuer: { mean: '21,7', all: '' } };
  assert.equal(chooseFinal(f, ['pa31', 'pa32', 'pa33']), f, 'the same choice keeps the bonus entries');
  assert.deepEqual(parseS07({ mode: 'x', a: { struck: ['pa29', 'pa29', 'zz', 3, 'pa30', 'pa31', 'pa32', 'pa33'] }, final: ['pa29', 'pa30'], duty: 99, facetLevel: 7, battery: { weakest: 'pa99' } }),
    { ...initialS07(), a: { struck: ['pa29', 'pa30', 'pa31', 'pa32'], why: '', alpha: '', r: '' } });
  assert.deepEqual(parseS07('garbage'), initialS07());
  assert.deepEqual(parseS07(null), initialS07());
  const round = { ...s, mode: 'pair' as const, facetLevel: 2 as const, final: ['pa29', 'pa30', 'pa31'] as ItemId[], duty: 3, sentence: 'x', reason: 'y', kuer: { mean: '1', all: '2' } };
  assert.deepEqual(parseS07(JSON.parse(JSON.stringify(round))), round);
});

test('status and reveal: both proposals entered and recognised open the landscape', () => {
  const b = p.byKey['pa29+pa30+pa33'];
  const full: S07State = {
    ...initialS07(),
    a: { struck: ['pa29', 'pa30', 'pa34', 'pa35'], why: '', alpha: f4(t.alpha), r: f4(t.r) },
    b: { struck: ['pa31', 'pa32', 'pa34', 'pa35'], why: '', alpha: f4(b.alpha), r: f4(b.r) },
  };
  assert.equal(statusS07(initialS07()), 'open');
  assert.equal(statusS07({ ...initialS07(), battery: { alpha: '0,7', weakest: '', value: '' } }), 'running');
  assert.equal(revealReady(p, full), true);
  assert.equal(revealReady(p, { ...full, b: { ...full.b, r: '0,999' } }), false);
  assert.equal(revealReady(p, { ...full, a: { ...full.a, alpha: f4(t.omega) } }), false, 'omega is named, not accepted');
  assert.equal(revealReady(p, { ...full, a: { ...full.a, r: f4(d.rAny[0]) } }), true, 'r without min_valid is accepted');
  assert.equal(revealReady(p, { ...full, a: { ...full.a, struck: ['pa29', 'pa30', 'pa34'] } }), false);
  assert.equal(statusS07(full), 'running');
  const done = { ...full, final: ['pa31', 'pa32', 'pa33'] as ItemId[], sentence: 'die Einheit des Volkes' };
  assert.equal(statusS07(done), 'done');
  const lines = plenumLines({ ...done, duty: 3, reason: 'Grund', kuer: { mean: '21,7', all: '14,2' } }, t);
  assert.deepEqual(lines.map(l => l[0]), ['Kurzskala', 'Punkt im Kreuz (α | r)', 'Was sie nicht mehr misst', 'Begründung', 'Vorschläge', 'Pflichtfrage (Gruppe 3)', 'Kür']);
  assert.equal(lines[0][1], 'pa31 + pa32 + pa33');
  assert.equal(lines[1][1], '0,599 | 0,685');
  assert.equal(lines[4][1], 'Stimmigkeit: pa31 + pa32 + pa33 · Inhalt: pa29 + pa30 + pa33');
  assert.match(lines[5][1], new RegExp(`^${dutyFor(3).item} – `));
  assert.equal(plenumLines(done, null)[1][1], '', 'no point before the reveal');
});

test('R code: reliability, row_means with min_valid in mutate, pearson_cor; scaffolds with gaps; mariposa style', () => {
  const code = rProposal(['pa33', 'pa31', 'pa32'], 'a');
  assert.match(code, /allbus %>% reliability\(pa31, pa32, pa33\)/);
  assert.match(code, /kurz_a = row_means\(pick\(pa31, pa32, pa33\), min_valid = 3\)/);
  assert.match(code, /rest_a = row_means\(pick\(pa29, pa30, pa34, pa35\), min_valid = 4\)/);
  assert.match(code, /pearson_cor\(kurz_a, rest_a\)/);
  assert.match(rProposal(['pa29', 'pa30', 'pa33'], 'b'), /kurz_b = row_means\(pick\(pa29, pa30, pa33\)/);
  assert.match(scaffoldProposal('b'), /___/);
  assert.match(scaffoldKuer, /___/);
  const k = rKuer(['pa31', 'pa32', 'pa33']);
  assert.match(k, /z1 = rec\(pa31, rules = "1:2=1 \[stimmt zu\]; 3:5=0 \[nicht\]"\)/);
  assert.match(k, /row_sums\(pick\(z1, z2, z3\), min_valid = 3\)/);
  assert.match(k, /crosstab\(im_schnitt, durchgehend, percentages = "total", weights = wghtpew\)/);
  const all = rScript(['pa31', 'pa32', 'pa35'], ['pa31', 'pa32', 'pa33'], ['pa31', 'pa32', 'pa33']);
  assert.match(all, /^library\(dplyr\)\nlibrary\(mariposa\)/);
  assert.match(all, /reliability\(pa29, pa30, pa31, pa32, pa33, pa34, pa35\) %>%\n  summary\(\)/);
  assert.match(all, /kurz_a[\s\S]*kurz_b[\s\S]*im_schnitt/);
  for (const text of [all, scaffoldKuer, scaffoldProposal('a')]) assert.doesNotMatch(text, /ifelse|%in%/);
  assert.equal(keyOf(['pa33', 'pa29', 'pa31']), 'pa29+pa31+pa33');
});
