import test from 'node:test';
import assert from 'node:assert/strict';
import { fakeSav } from '../../sandbox/testData';
import { QUESTIONS } from './content';
import {
  axisNotes, axisTop, boxOf, checkCaption, checkMeans, checkRead, compareSketch, initialGrafik, misplaced, parseGrafik, pictureRatio, planCode,
  planPreview, plenumLines, quantile7, rCodeFor, readOk, regionMeans, silhouetteBars, silhouetteResults, sketchSummary, sketchTruth, statusGrafik,
  type GrafikState,
} from './domain';

const rep = (x: number, n: number) => Array<number>(n).fill(x);
const r5 = (x: number, n: number) => rep(x, 5 * n);
// 200 Personen: 50 ohne Angabe bei ls01 (−9), Ost/West 50 zu 150, ps03 nur bei der Hälfte gefragt (−11), dw15 nur bei Erwerbstätigen.
const sav = fakeSav({
  ls01: { values: [...r5(8, 12), ...r5(7, 8), ...r5(5, 6), ...r5(2, 4), ...r5(-9, 10)], missingFrom: -1 },
  eastwest: { values: [...r5(2, 10), ...r5(1, 30)], labels: { 1: 'ALTE BUNDESLAENDER', 2: 'NEUE BUNDESLAENDER' } },
  sex: { values: [...r5(1, 18), ...r5(2, 18), ...r5(3, 4)], labels: { 1: 'MANN', 2: 'FRAU', 3: 'DIVERS' } },
  dw15: { values: [...r5(-10, 10), ...r5(40, 20), ...r5(38.5, 5), ...r5(20, 5)], missingFrom: -1 },
  ps03: { values: [...r5(2, 5), ...r5(-11, 5), ...r5(5, 15), ...r5(-11, 15)], labels: { 1: 'SEHR ZUFRIEDEN', 2: 'ZIEMLICH ZUFRIEDEN', 5: 'ZIEML. UNZUFRIEDEN', 6: 'SEHR UNZUFRIEDEN' }, missingFrom: -1 },
  hs01: { values: [...r5(1, 8), ...r5(2, 20), ...r5(3, 8), ...r5(5, 4)] },
  age: { values: [...r5(25, 10), ...r5(40, 10), ...r5(60, 10), ...r5(80, 10)] },
});
const sketchAt = (code: number) => Array.from({ length: 11 }, (_, i) => (i === code ? 100 : 0));
const state = (patch: Partial<GrafikState>): GrafikState => ({ ...initialGrafik(), ...patch });

test('counts the real distribution of life satisfaction without missing codes', () => {
  const t = sketchTruth(sav);
  assert.equal(t.n, 150);
  assert.equal(t.mode, 8);
  assert.equal(t.modeCount, 60);
  assert.equal(t.median, 7);
  assert.ok(Math.abs(t.mean - (8 * 12 + 7 * 8 + 5 * 6 + 2 * 4) / 30) < 1e-12);
});

test('measures the sketch as people put in another place (total variation)', () => {
  const t = sketchTruth(sav);
  const exact = t.counts.map(c => c * 3);
  assert.equal(misplaced(exact, t), 0);
  assert.equal(misplaced(sketchAt(8), t), 60);
  assert.equal(misplaced(sketchAt(0), t), 100);
  assert.equal(misplaced(rep(0, 11), t), null);
  assert.deepEqual(sketchSummary(sketchAt(5)), { peak: 5, mean: 5 });
});

test('checks what is read off the own plot: the mode and roughly its height in counts', () => {
  const t = sketchTruth(sav), sketch = sketchAt(5);
  assert.deepEqual(checkRead(t, sketch, { peak: '8', count: '58' }).map(n => n.tone), ['ok', 'ok']);
  assert.ok(readOk(t, sketch, { peak: '8', count: '58' }));
  assert.match(checkRead(t, sketch, { peak: '5', count: '' })[0].text, /Gipfel deiner Skizze/);
  assert.match(checkRead(t, sketch, { peak: '7', count: '' })[0].text, /nicht der höchste Balken/);
  assert.match(checkRead(t, sketch, { peak: '', count: '40' })[0].text, /Prozentwert/);
  assert.equal(checkRead(t, sketch, { peak: '', count: '20' })[0].tone, 'warn');
  assert.ok(!readOk(t, sketch, { peak: '8', count: '' }));
});

test('compares sketch and data after the reveal', () => {
  const notes = compareSketch(sketchTruth(sav), sketchAt(5)).map(n => n.text);
  assert.match(notes[0], /\d+ von 100 Befragten/);
  assert.match(notes[1], /Dein Gipfel liegt bei 5, der echte bei 8/);
  assert.match(notes[2], /zufriedener, als du dachtest/);
  assert.match(notes.at(-1)!, /linksschief/);
});

test('draws silhouettes per code for categories and per unit for metric variables', () => {
  assert.deepEqual(silhouetteBars(sav, 'hs01'), [40, 100, 40, 20]);
  const hours = silhouetteBars(sav, 'dw15');
  assert.equal(hours.length, 21);
  assert.equal(hours[0], 25);
  assert.equal(hours[18], 25);
  assert.equal(hours[20], 100);
  const r = silhouetteResults(state({ silhouettes: { A: 'pa02a', B: 'dw15', C: 'pa01', D: 'age' } }));
  assert.deepEqual(r.map(x => x.correct), [false, true, true, true]);
});

test('previews bars, fills and the R errors ggplot2 would give', () => {
  const [demokratie, stunden, alter] = QUESTIONS;
  const fill = planPreview(sav, demokratie, { geom: 'fill', x: 'eastwest', second: 'ps03' });
  assert.equal(fill.view?.kind, 'bars');
  assert.equal(fill.n, 100);
  assert.match(fill.notes[0].text, /summiert sich zu 100 %/);
  if (fill.view?.kind === 'bars') assert.deepEqual(fill.view.categories, ['West', 'Ost']);
  assert.match(planPreview(sav, demokratie, { geom: 'fill', x: 'ps03', second: 'eastwest' }).notes.at(-1)!.text, /Tausche x und fill/);
  assert.match(planPreview(sav, demokratie, { geom: 'fill', x: 'eastwest', second: '' }).notes[0].text, /genau 100 % hoch/);
  assert.match(planPreview(sav, demokratie, { geom: 'dodge', x: 'eastwest', second: 'ps03' }).notes[0].text, /ungleich groß/);
  const hist = planPreview(sav, demokratie, { geom: 'histogram', x: 'eastwest', second: '' });
  assert.equal(hist.view, null);
  assert.match(hist.notes[0].text, /stat_bin\(\) requires a continuous x aesthetic/);
  assert.match(planPreview(sav, stunden, { geom: 'bar', x: 'sex', second: 'dw15' }).notes[0].text, /dropped during statistical transformation: fill/);
  assert.match(planPreview(sav, alter, { geom: 'point', x: 'age', second: '' }).notes[0].text, /requires the following missing aesthetics: y/);
  assert.match(planPreview(sav, alter, { geom: 'point', x: 'age', second: 'ls01' }).notes[0].text, /verschiedene Punkte/);
  assert.match(planPreview(sav, alter, { geom: 'boxplot', x: 'age', second: 'ls01' }).notes[0].text, /Continuous x aesthetic/);
});

test('boxplots use ggplot2 quartiles and name small groups', () => {
  assert.equal(quantile7([1, 2, 3, 4], 0.25), 1.75);
  const b = boxOf('x', [1, 2, 3, 4, 100]);
  assert.deepEqual([b.q1, b.median, b.q3, b.lo, b.hi, b.outliers], [2, 3, 4, 1, 4, [100]]);
  const box = planPreview(sav, QUESTIONS[1], { geom: 'boxplot', x: 'sex', second: 'dw15' });
  assert.equal(box.view?.kind, 'boxplot');
  assert.match(box.notes[0].text, /Hinter „divers“ stehen nur 20 Personen, hinter den anderen Kästen je mindestens 40/);
  const lying = planPreview(sav, QUESTIONS[1], { geom: 'boxplot', x: 'dw15', second: 'sex' });
  assert.ok(lying.view?.kind === 'boxplot' && lying.view.horizontal);
  assert.equal(planPreview(sav, QUESTIONS[0], { geom: 'boxplot', x: 'eastwest', second: 'ps03' }).view, null);
});

test('writes the plan as ggplot2 code and as a full script with to_label() and n', () => {
  const plan = { geom: 'fill' as const, x: 'eastwest', second: 'ps03' };
  assert.equal(planCode(plan), 'ggplot(aes(x = gebiet, fill = demokratie)) +\n  geom_bar(position = "fill")');
  const code = rCodeFor(QUESTIONS[0], plan);
  assert.match(code, /mutate\(gebiet = to_label\(eastwest\), demokratie = to_label\(ps03\)\)/);
  assert.match(code, /filter\(!is.na\(gebiet\), !is.na\(demokratie\)\)/);
  assert.match(code, /bild %>% nrow\(\)/);
  assert.match(rCodeFor(QUESTIONS[2], { geom: 'jitter', x: 'age', second: 'ls01' }), /ggplot\(aes\(x = age, y = ls01\)\) \+\n  geom_jitter/);
});

test('checks n in the caption against the people in the picture', () => {
  const plan = { geom: 'fill' as const, x: 'eastwest', second: 'ps03' };
  const ok = checkCaption(sav, plan, 'Im Osten weniger zufrieden (ALLBUS 2023, n = 100).');
  assert.equal(ok[0].tone, 'ok');
  assert.match(ok[1].text, /nur in einem Teil der Fragebögen/);
  assert.match(checkCaption(sav, plan, 'n = 200, ALLBUS')[0].text, /alle Befragten/);
  assert.match(checkCaption(sav, { ...plan, x: 'eastwest', second: 'ps03' }, 'n = 1.000')[0].text, /kein passendes n/);
  assert.match(checkCaption(sav, { geom: 'boxplot', x: 'sex', second: 'dw15' }, 'n = 150')[1].text, /Quelle/);
  assert.deepEqual(checkCaption(sav, plan, ''), []);
});

test('compares the two means and the picture ratio of a cut axis', () => {
  const m = regionMeans(sav);
  assert.ok(Math.abs(m.east - 8) < 1e-12);
  assert.ok(Math.abs(m.west - (2 * 8 + 8 * 7 + 6 * 5 + 4 * 2) / 20) < 1e-12);
  assert.equal(pictureRatio({ west: 7.44, east: 7.18 }, 0).toFixed(3), (7.44 / 7.18).toFixed(3));
  assert.equal(pictureRatio({ west: 7.44, east: 7.18 }, 7.1).toFixed(2), '4.25');
  assert.equal(axisTop({ west: 7.438, east: 7.179 }), 7.5);
  assert.deepEqual(checkMeans(sav, { west: '5.5', east: '8,00', start: 0, reason: '' }).map(n => n.tone), ['ok', 'ok']);
  assert.match(checkMeans(sav, { west: '8', east: '', start: 0, reason: '' })[0].text, /anderen Gruppe/);
  assert.equal(axisNotes(sav, 0)[0].tone, 'ok');
  assert.match(axisNotes(sav, 4)[1].text, /Achse beginnt bei 4,0/);
});

test('reads stored states defensively and reports open, running and done', () => {
  const parsed = parseGrafik({ sketch: [1, 2], plan: { geom: 'pie', x: 'pv01', second: 'ps03' }, question: 'stunden', axis: { start: 99 }, silhouettes: { A: 'pv01', B: 'dw15' } });
  assert.deepEqual(parsed.sketch, rep(0, 11));
  assert.deepEqual(parsed.plan, { geom: '', x: '', second: '' });
  assert.equal(parsed.axis.start, 7.1);
  assert.deepEqual(parsed.silhouettes, { B: 'dw15' });
  assert.equal(statusGrafik(initialGrafik()), 'open');
  assert.equal(statusGrafik(state({ sketch: sketchAt(3) })), 'running');
  const done = state({
    sketch: sketchAt(5), locked: true, read: { peak: '8', count: '60' }, silhouettes: { A: 'hs01', B: 'dw15', C: 'pa01', D: 'age' }, solved: true,
    question: 'demokratie', plan: { geom: 'fill', x: 'eastwest', second: 'ps03' }, caption: 'n = 100, ALLBUS 2023',
    axis: { west: '5,5', east: '8', start: 0, reason: 'Balken beginnen bei 0.' },
  });
  assert.equal(statusGrafik(done), 'done');
  const lines = Object.fromEntries(plenumLines(sav, done));
  assert.equal(lines['Gipfel: Skizze · Grafik'], '5 · 8');
  assert.match(lines['An anderer Stelle skizziert'], /von 100/);
  assert.equal(lines['Silhouetten richtig'], '4 von 4');
  assert.match(lines['Leitfrage · Bauplan'], /Balken auf 100 % \(x = eastwest, fill = ps03\)/);
  assert.match(lines['Achse ab · Bildfaktor'], /^0,0 · /);
});
