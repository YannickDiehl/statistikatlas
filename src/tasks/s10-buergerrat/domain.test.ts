import test from 'node:test';
import assert from 'node:assert/strict';
import { fakeSav, fixtureSav } from '../../sandbox/testData';
import { linkinv, logitOf, type LogitFit } from '../kit/logit';
import {
  ameCandidates, answerNotes, cellCandidates, cellsOk, chainOk, checkAme, checkCells, checkChain, checkLikelihood, checkModel, checkReport, detect,
  initialS10, janaCandidates, known, languages, likelihoodOk, likelihoodReveal, modelOk, parseS10, personNumbers, plenumLines, prepare,
  readEntry, recogniseReport, sentenceNotes, statusS10, tafel, tafelNotes, tafelReady, tafelSentences, TIMES_LIKELY, type S10State,
} from './domain';

const p = prepare(fixtureSav());
const m = p.main as LogitFit;
const fit = (id: keyof typeof p.models) => p.models[id] as LogitFit;
/** Deutsche Schreibweise, wie Studierende sie eintippen. */
const fmt = (x: number, d = 3) => x.toFixed(d).replace('.', ',').replace('-', '−');
const texts = (notes: { text: string }[]) => notes.map(n => n.text).join(' | ');
const jana = personNumbers(m, p.profiles.jana), wiegand = personNumbers(m, p.profiles.wiegand);
const right = {
  or: { pflicht: fmt(m.expB[1]), interesse: fmt(m.expB[2]) },
  jana: { logit: fmt(jana.logit[0]), odds: fmt(jana.odds[0]), prob: fmt(jana.prob[0]) },
  odds: { janaUp: fmt(jana.odds[1], 2), wiegand: fmt(wiegand.odds[0], 2), wiegandUp: fmt(wiegand.odds[1], 2) },
  prob: { janaUp: fmt(jana.prob[1]), wiegand: fmt(wiegand.prob[0]), wiegandUp: fmt(100 * wiegand.prob[1], 1) + ' %' },
};
const solved = (patch: Partial<S10State> = {}): S10State => ({ ...initialS10(), ...right, campaign: 'depends', answer3: 'Kommt auf die Sprache an.', ...patch });

test('prepares the variables like rec() and fits every model variant once', () => {
  assert.ok(p.main && !p.problem);
  assert.deepEqual(p.profiles, { jana: [2, 2], wiegand: [3, 4] });
  assert.deepEqual(p.rawProfiles, { jana: [3, 4], wiegand: [2, 2] });
  assert.deepEqual(p.pflichtRange, [1, 4]);
  for (const id of Object.keys(p.models) as (keyof typeof p.models)[]) assert.ok(p.models[id].ok, id);
  // Gegenrichtung: gleiche Beträge, umgekehrte Vorzeichen
  assert.ok(Math.abs(fit('nonvote').coef[1] + m.coef[1]) < 1e-9);
  assert.ok(Math.abs(fit('pa02a').coef[1] - m.coef[1]) < 1e-9);
  assert.equal(p.ame.length, 2);
  // pv01: 1–90 wählen, 91 nicht, fehlende Codes (auch −50) NA; rev über die beobachtete Spannweite (wie mariposa 0.7.3)
  const sav = fakeSav({
    pv01: { values: [1, 91, -50, 42, 91, 2, 3, 91, 4, 6, 1, 91], missingFrom: -1 },
    pe09: { values: [1, 4, 1, 2, 3, 2, 1, 2, 4, 1, 3, 4], missingFrom: -1 },
    pa02a: { values: [2, 5, 1, 3, 2, 1, 4, 3, 2, 5, 1, 4], missingFrom: -1 },
    wghtpew: { values: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
  });
  const q = prepare(sav);
  assert.ok(q.main);
  assert.equal(q.main!.cases, 11);
  assert.deepEqual(q.profiles.jana, [2, 2]);
});

test('a model that cannot be estimated gives an explanation instead of numbers', () => {
  const sav = fakeSav({
    pv01: { values: [1, 1, 1, 91, 91, 91, 2, 2], missingFrom: -1 },
    pe09: { values: [1, 1, 1, 4, 4, 4, 1, 1], missingFrom: -1 },
    pa02a: { values: [1, 2, 3, 1, 2, 3, 4, 5], missingFrom: -1 },
    wghtpew: { values: [1, 1, 1, 1, 1, 1, 1, 1] },
  });
  const q = prepare(sav);
  assert.equal(q.main, null);
  assert.match(q.problem!, /trennen die beiden Ausgänge/);
  assert.deepEqual(checkModel(q, right.or), []);
  assert.deepEqual(janaCandidates(q), { logit: [], odds: [], prob: [] });
  assert.deepEqual(tafel(q), []);
  assert.equal(tafelReady(q, solved()), false);
  assert.deepEqual(checkReport(q, '3,77', 'times', true), []);
});

test('reads entries with a tolerance of half a unit of the last digit', () => {
  assert.deepEqual(readEntry('3,77'), { x: 3.77, tol: 0.005 + 1e-9, percent: false });
  assert.deepEqual(readEntry('76,4 %'), { x: 76.4, tol: 0.05 + 1e-9, percent: true });
  assert.equal(readEntry('1.122')!.x, 1122);
  assert.equal(readEntry('1.122')!.tol, 0.5 + 1e-9);
  assert.equal(readEntry('1122,3')!.tol, 0.05 + 1e-9);
  assert.equal(readEntry('−0,27')!.x, -0.27);
  assert.equal(readEntry('0.764')!.tol, 0.0005 + 1e-9);
  assert.equal(readEntry('abc'), null);
  assert.equal(readEntry(''), null);
  // Prozent und Anteil werden beide als Wahrscheinlichkeit gelesen, eine Chance nie als Prozent
  const probs = janaCandidates(p).prob;
  assert.equal(detect(fmt(100 * jana.prob[0], 1), probs, 0.005)!.hits[0].id, 'ok');
  assert.equal(detect(`${fmt(100 * jana.prob[0], 1)} %`, probs, 0.005)!.hits[0].id, 'ok');
  assert.equal(detect(fmt(jana.odds[0], 2), probs, 0.005)!.hits[0].id, 'isOdds');
  assert.equal(detect('0,5', probs, 0.005)!.imprecise, true);
  // Wer den Wert rundet, den mariposa druckt (1.405 → 1,41), liegt richtig, auch wenn der genaue Wert 1,4049 ist
  const or = [{ id: 'ok', value: 1.40491, note: () => ({ tone: 'ok' as const, text: '' }) }];
  assert.equal(detect('1,41', or, 0.005)!.hits[0]?.id, 'ok');
  assert.equal(detect('1,40', or, 0.005)!.hits[0]?.id, 'ok');
  assert.equal(detect('1,42', or, 0.005)!.hits.length, 0);
});

test('station 1: both Exp(B) together name the way that was computed', () => {
  const orOf = (id: keyof typeof p.models) => ({ pflicht: fmt(fit(id).expB[1]), interesse: fmt(fit(id).expB[2] ?? NaN) });
  const ok = texts(checkModel(p, right.or));
  assert.match(ok, /^Stimmt: Exp\(B\) = 2,615 für Pflichtgefühl und 2,417 für Interesse, gewichtet\. Auf der Folie stand 3,77 – deine Datei liefert einen anderen Wert\./);
  assert.equal(modelOk(p, right.or), true);
  assert.match(texts(checkModel(p, orOf('unweighted'))), /^Ungewichtet\?/);
  assert.match(texts(checkModel(p, orOf('nonvote'))), /^Gegenrichtung: .*1\/0,382 ≈ 2,62\.$/);
  assert.match(texts(checkModel(p, orOf('pe09'))), /^pe09 läuft von „stimme voll zu“/);
  assert.match(texts(checkModel(p, orOf('pa02a'))), /^pa02a läuft von „sehr stark“/);
  assert.match(texts(checkModel(p, orOf('dontknow'))), /„Weiß nicht“ als Nichtwahl gezählt/);
  assert.match(texts(checkModel(p, orOf('ineligible'))), /Nicht Wahlberechtigte \(−50\)/);
  assert.match(texts(checkModel(p, orOf('allMissing'))), /else=0/);
  assert.match(texts(checkModel(p, { pflicht: fmt(fit('pflichtOnly').expB[1]), interesse: '' })), /^Pflichtgefühl: Das ist das Modell nur mit dem Pflichtgefühl/);
  assert.match(texts(checkModel(p, { pflicht: fmt(m.coef[1]), interesse: fmt(m.coef[2]) })), /^Das ist B, der Logit-Koeffizient/);
  // eines richtig, das andere leer bzw. falsch
  assert.match(texts(checkModel(p, { pflicht: right.or.pflicht, interesse: '' })), /^Pflichtgefühl: stimmt\. Trag auch das andere Exp\(B\) ein/);
  const mixed = checkModel(p, { pflicht: right.or.pflicht, interesse: '9,999' });
  assert.deepEqual(mixed.map(n => n.tone), ['ok', 'warn']);
  assert.doesNotMatch(texts(mixed), /Trag auch das andere/);
  assert.match(texts(checkModel(p, { pflicht: '2,6', interesse: '' })), /genauer/);
  assert.match(texts(checkModel(p, { pflicht: 'viel', interesse: '' })), /keine Zahl/);
  assert.equal(modelOk(p, { pflicht: right.or.pflicht, interesse: '' }), false);
  // Falsche Werte verraten die richtigen nicht
  for (const wrong of [orOf('unweighted'), orOf('pe09'), { pflicht: '9,999', interesse: '9,999' }]) {
    const t = texts(checkModel(p, wrong));
    assert.ok(!t.includes('2,615') && !t.includes('2,417') && !t.includes('2,61 ') && !t.includes('2,42'), t);
  }
});

test('station 2: the chain logit → odds → probability and its detours', () => {
  const k = janaCandidates(p);
  const note = (field: 'logit' | 'odds' | 'prob', id: string, d = 3) => texts(checkChain(p, { logit: '', odds: '', prob: '', [field]: fmt(k[field].find(c => c.id === id)!.value, d) }));
  assert.equal(texts(checkChain(p, right.jana)), 'Logit: stimmt. | Chance: stimmt. | Wahrscheinlichkeit: stimmt.');
  assert.equal(chainOk(p, right.jana), true);
  assert.match(note('logit', 'rawCodes'), /Originalcodes eingesetzt \(pe09 = 3, pa02a = 4\)/);
  assert.match(note('logit', 'rawPflicht'), /Originalcode von pe09/);
  assert.match(note('logit', 'rawInteresse'), /Originalcode von pa02a/);
  assert.match(note('logit', 'noConst'), /Konstante fehlt/);
  assert.match(note('logit', 'expB'), /Exp\(B\) eingesetzt/);
  assert.match(note('logit', 'sign'), /Vorzeichen/);
  assert.match(note('logit', 'unweighted'), /ohne Gewicht/);
  assert.match(note('odds', 'isLogit'), /^Chance: Das ist der Logit/);
  assert.match(note('odds', 'isProb'), /Das ist die Wahrscheinlichkeit/);
  assert.match(note('odds', 'inverse'), /nicht zu wählen/);
  assert.match(note('prob', 'isOdds', 2), /^Wahrscheinlichkeit: Das ist die Chance, nicht die Wahrscheinlichkeit\. Wahrscheinlichkeiten liegen zwischen 0 und 1/);
  assert.match(note('prob', 'complement'), /nicht zu wählen/);
  assert.match(note('prob', 'rawCodes'), /Originalcodes/);
  assert.match(texts(checkChain(p, { logit: '', odds: '', prob: fmt(100 * jana.prob[0], 1) })), /^Wahrscheinlichkeit: stimmt/);
  assert.match(texts(checkChain(p, { logit: '9,99', odds: '', prob: '' })), /finde ich auf keinem Weg/);
  assert.equal(chainOk(p, { ...right.jana, odds: '9,99' }), false);
});

test('rule-based counter-questions to written answers', () => {
  for (const t of ['3,77-mal so wahrscheinlich', 'fast viermal so wahrscheinlich', 'die 3,77-fache Wahrscheinlichkeit', 'Die Wahrscheinlichkeit ist 3,77-mal so hoch', '3,77 mal wahrscheinlicher'])
    assert.ok(TIMES_LIKELY.test(t), t);
  for (const t of ['manchmal wahrscheinlich', 'Die Chance ist 3,77-mal so hoch', 'wahrscheinlich nicht']) assert.ok(!TIMES_LIKELY.test(t), t);
  const none = { or: null, pJana: null }, some = known(p, { or: right.or, jana: right.jana });
  assert.ok(some.or !== null && some.pJana !== null);
  const times = answerNotes('Ja, 3,77-mal so wahrscheinlich.', none);
  assert.equal(times[0].tone, 'warn');
  assert.doesNotMatch(times[0].text, /\d+,\d/);
  assert.match(answerNotes('Ja, 3,77-mal so wahrscheinlich.', some)[0].text, /^Probier es an Jana: 50,5 % × 2,61 = 132 % – geht das\?/);
  assert.equal(answerNotes('Nein, nicht 3,77-mal so wahrscheinlich – die Chance ist 3,77-mal so hoch.', some)[0].tone, 'ok');
  assert.match(texts(answerNotes('Die Kampagne bewirkt, dass mehr wählen.', none)), /vergleicht Menschen/);
  assert.match(texts(answerNotes('Jana wird wählen.', some)), /Von 100 Menschen, die so antworten wie Jana, würden etwa 50 wählen gehen/);
  assert.doesNotMatch(texts(answerNotes('Jana wird wählen.', none)), /etwa \d/);
  assert.match(texts(answerNotes('Das ist so.', none)), /Gegenprobe/);
  assert.deepEqual(answerNotes('  ', none), []);
  assert.deepEqual(sentenceNotes('Das ist so.', 'pp', none), []);
  assert.match(texts(sentenceNotes('Im Schnitt 5 Prozent mehr.', 'pp', none)), /gemeint sind Prozentpunkte/);
  assert.deepEqual(known(p, { or: { pflicht: '9,999', interesse: '9,999' }, jana: { logit: '', odds: '', prob: '0,999' } }), none);
});

test('station 4: one step more, in odds and in probabilities', () => {
  assert.equal(texts(checkCells(p, right.odds, 'odds')), 'Jana, eine Stufe mehr: stimmt. | Herr Wiegand: stimmt. | Herr Wiegand, eine Stufe mehr: stimmt.');
  assert.equal(cellsOk(p, right.odds, 'odds') && cellsOk(p, right.prob, 'prob'), true);
  const val = (cell: 'janaUp' | 'wiegand' | 'wiegandUp', lang: 'odds' | 'prob', id: string) => cellCandidates(p, cell, lang).find(c => c.id === id)!.value;
  const one = (cell: 'janaUp' | 'wiegand' | 'wiegandUp', lang: 'odds' | 'prob', input: string) => texts(checkCells(p, { janaUp: '', wiegand: '', wiegandUp: '', [cell]: input }, lang));
  // Umweg 6: Wahrscheinlichkeit mal Exp(B), als Anteil oder in Prozent
  assert.match(one('janaUp', 'prob', fmt(val('janaUp', 'prob', 'timesLikely'), 2)), /mal Exp\(B\)\. Exp\(B\) vervielfacht die Chance/);
  assert.match(one('janaUp', 'prob', fmt(100 * val('janaUp', 'prob', 'timesLikely'), 0)), /nicht über 100 % steigen/);
  assert.match(one('wiegandUp', 'prob', fmt(val('wiegandUp', 'prob', 'plusAme'), 3)), /linear gedacht/);
  assert.match(one('janaUp', 'prob', fmt(val('janaUp', 'prob', 'isOdds'), 2)), /Das ist die Chance/);
  assert.match(one('janaUp', 'odds', fmt(val('janaUp', 'odds', 'additive'), 2)), /Chance × Exp\(B\), nicht Chance \+ Exp\(B\)/);
  assert.match(one('janaUp', 'odds', fmt(val('janaUp', 'odds', 'swap'), 2)), /ohne die Stufe mehr/);
  assert.match(one('wiegand', 'odds', fmt(val('wiegand', 'odds', 'rawCodes'), 2)), /Originalcodes eingesetzt \(pe09 = 2, pa02a = 2\)/);
  assert.match(one('wiegand', 'prob', fmt(val('wiegand', 'prob', 'complement'), 3)), /nicht zu wählen/);
  assert.match(one('wiegand', 'prob', '0,123'), /predict\(modell/);
  assert.equal(cellsOk(p, { ...right.prob, janaUp: '' }, 'prob'), false);
});

test('the interpreter board waits for Jana, all six cells and the answer to question 3', () => {
  assert.equal(tafelReady(p, solved()), true);
  for (const patch of [{ campaign: '' as const }, { answer3: ' ' }, { jana: { ...right.jana, logit: '' } }, { odds: { ...right.odds, wiegand: '9,99' } },
    { prob: { ...right.prob, wiegandUp: '' } }, { or: { pflicht: '', interesse: '' }, jana: { ...right.jana, prob: '0,999' } }])
    assert.equal(tafelReady(p, solved(patch)), false, JSON.stringify(patch));
  const [j, w] = tafel(p);
  assert.deepEqual(j.prob, jana.prob);
  assert.ok(Math.abs((j.logit[1] - j.logit[0]) - m.coef[1]) < 1e-12 && Math.abs(w.odds[1] / w.odds[0] - m.expB[1]) < 1e-9);
  const s = tafelSentences(p);
  assert.match(s.prob, /^In Wahrscheinlichkeiten gewinnt Jana mehr: \+22,2 gegenüber \+3,6 Prozentpunkten/);
  assert.match(s.odds, /mit 2,61 multipliziert \(Jana 1,02 → 2,66, Herr Wiegand 15,6 → 40,7\)/);
  assert.match(s.risk, /\(−45 %\).*\(−60 %\)/);
  assert.deepEqual(languages('Die Chance steigt, in Prozentpunkten mehr, der Logit gleich'), ['odds', 'prob', 'logit']);
  assert.deepEqual(languages('Bei Jana.'), []);
  assert.match(texts(tafelNotes(p, 'jana', 'Bei Jana steigt die Wahrscheinlichkeit mehr.')), /stimmt in Wahrscheinlichkeiten.*Deine Antwort spricht Wahrscheinlichkeiten\. Die anderen Sprachen: In Chancen gewinnen beide gleich/);
  assert.match(texts(tafelNotes(p, 'same', 'Gleich.')), /Chancen und Logits.*Ich erkenne nicht, in welcher Sprache/);
  assert.equal(tafelNotes(p, 'depends', 'x')[0].tone, 'ok');
  assert.match(texts(tafelNotes(p, 'wiegand', 'Die Kampagne bewirkt bei ihm mehr.')), /relativ betrachtet.*Vorsicht mit „bewirkt“/);
});

test('station 5: the AME and the size behind the report number', () => {
  assert.match(texts(checkAme(p, fmt(p.ame[0]))), /^Stimmt: Im Mittel über alle Befragten steigt die Wahrscheinlichkeit je Stufe Pflichtgefühl um 10,3 Prozentpunkte\.$/);
  assert.match(texts(checkAme(p, fmt(100 * p.ame[0], 1))), /^Stimmt/);
  assert.match(texts(checkAme(p, fmt(p.ame[1]))), /Interesses/);
  assert.match(texts(checkAme(p, fmt(p.ame[1]))), /Interesses/);
  assert.match(texts(checkAme(p, fmt(m.coef[1]))), /Das ist B/);
  assert.match(texts(checkAme(p, '0,1')), /genauer/);
  assert.equal(ameCandidates(p)[0].id, 'ok');
  const kind = (x: string, unit: Parameters<typeof recogniseReport>[2]) => recogniseReport(p, x, unit)?.kind;
  assert.equal(kind(fmt(m.expB[1], 2), 'times'), 'or');
  assert.equal(kind(fmt(100 * (m.expB[1] - 1), 0), 'pct'), 'orPct');
  assert.equal(kind(fmt(m.coef[1], 2), 'logit'), 'b');
  assert.equal(kind(fmt(100 * p.ame[0], 1), 'pp'), 'amePp');
  assert.equal(kind(fmt(p.ame[0], 3), 'none'), 'ame');
  assert.equal(kind(fmt(100 * (jana.prob[1] - jana.prob[0]), 1), 'pp'), 'jana');
  assert.equal(kind(fmt(100 * (wiegand.prob[1] - wiegand.prob[0]), 1), 'pp'), 'wiegand');
  const [j] = tafel(p);
  assert.equal(kind(fmt(100 * (j.risk[1] - j.risk[0]) / j.risk[0], 0), 'pct'), 'riskJana');
  assert.equal(kind(fmt(m.expB[2], 2), 'times'), 'orInt');
  assert.equal(kind('12345', 'pp'), undefined);
  // Einheit falsch gewählt: Prozent statt Prozentpunkte, Faktor als Prozentpunkte, Anteil als Prozentpunkte
  const amePp = fmt(100 * p.ame[0], 1);
  assert.match(texts(checkReport(p, amePp, 'pct', false)), /Prozent oder Prozentpunkte\?/);
  assert.match(texts(checkReport(p, fmt(m.expB[1], 2), 'pp', false)), /Exp\(B\) ist ein Faktor.*Die Chance steigt um 161 %/);
  assert.match(texts(checkReport(p, fmt(p.ame[0], 3), 'pp', false)), /wären winzig/);
  assert.match(texts(checkReport(p, amePp, '', false)), /Wähl eine Einheit/);
  assert.match(texts(checkReport(p, fmt(m.coef[1], 2), 'pp', false)), /Logit-Einheiten/);
  // Was die Zahl verschweigt: Zahlen der Ratsmitglieder erst nach der Tafel
  const hidden = texts(checkReport(p, amePp, 'pp', false)), shown = texts(checkReport(p, amePp, 'pp', true));
  assert.doesNotMatch(hidden, /22,2|3,6/);
  assert.match(shown, /für Menschen wie Jana 22,2, wie Herrn Wiegand 3,6 Prozentpunkte/);
  assert.match(texts(checkReport(p, fmt(m.classification.overall, 1), 'pct', true)), /Trefferquote/);
  assert.match(texts(checkReport(p, '999', 'pct', true)), /erkenne ich nicht/);
  assert.match(texts(checkReport(p, 'viel', 'pct', true)), /keine Zahl/);
  assert.match(texts(checkReport(p, fmt(m.expB[1], 2), 'times', true)), /Zeigt: eine Zahl, die für alle gilt.*„2,61-mal so wahrscheinlich“/);
});

test('station 6: hit rate against likelihood', () => {
  const c = m.classification;
  const e = { hitModel: fmt(c.overall, 1), hitAll: fmt(100 * Math.round(c.n1) / (Math.round(c.n0) + Math.round(c.n1)), 1), nullLL: fmt(m.minus2LLNull, 1), modelLL: fmt(m.minus2LL, 1), sentence: '' };
  assert.equal(texts(checkLikelihood(p, e)), 'Trefferquote des Modells: stimmt. | Regel „alle wählen“: stimmt. | −2LL Nullmodell: stimmt. | −2LL Modell: stimmt.');
  assert.equal(likelihoodOk(p, e), true);
  const one = (patch: Partial<typeof e>) => texts(checkLikelihood(p, { hitModel: '', hitAll: '', nullLL: '', modelLL: '', sentence: '', ...patch }));
  assert.match(one({ hitModel: fmt(c.pct1, 1) }), /nur bei den Wählenden/);
  assert.match(one({ hitModel: fmt(c.pct0, 1) }), /Nichtwählenden/);
  assert.match(one({ hitAll: fmt(c.overall, 1) }), /Trefferquote des Modells – sie gehört ins erste Feld/);
  assert.match(one({ nullLL: fmt(m.minus2LL, 1) }), /−2LL deines Modells/);
  assert.match(one({ modelLL: fmt(m.omnibus.chi2, 1) }), /Omnibus-Chi-Quadrat/);
  assert.match(one({ hitModel: '85' }), /genauer/);
  assert.equal(likelihoodOk(p, { ...e, modelLL: '' }), false);
  const reveal = likelihoodReveal(p).join(' ');
  assert.match(reveal, /Modell 84,9 % gegen 80,5 % für die Regel „alle wählen“ \(\+4,4 Prozentpunkte\)\. Von 5 Nichtwählenden erkennt das Modell 2/);
  assert.match(reveal, /von 27,4 auf 19,4 \(−29 %, McFadden-R² = 0,293\)/);
});

test('restores state defensively, reports status and builds the council card', () => {
  assert.deepEqual(parseS10(null), initialS10());
  assert.deepEqual(parseS10('kaputt'), initialS10());
  const s = parseS10({ mode: 'pair', or: { pflicht: 3.77, interesse: '1,405' }, campaign: 'alle', report: { unit: 'kg', number: 'x'.repeat(50) }, odds: { janaUp: '12,2', extra: '1' }, answer1: 7 });
  assert.equal(s.mode, 'pair');
  assert.deepEqual(s.or, { pflicht: '', interesse: '1,405' });
  assert.equal(s.campaign, '');
  assert.equal(s.report.unit, '');
  assert.equal(s.report.number.length, 16);
  assert.deepEqual(s.odds, { janaUp: '12,2', wiegand: '', wiegandUp: '' });
  assert.equal(s.answer1, '');
  assert.equal(statusS10(initialS10()), 'open');
  assert.equal(statusS10({ ...initialS10(), campaign: 'jana' }), 'running');
  assert.equal(statusS10({ ...initialS10(), likelihood: { ...initialS10().likelihood, hitModel: '95' } }), 'running');
  const done = solved({ answer1: 'Nein, die Chance.', report: { number: '10,3', unit: 'pp', sentence: 'Im Schnitt 10 Prozentpunkte mehr.' } });
  assert.equal(statusS10(done), 'done');
  assert.equal(statusS10({ ...done, report: { ...done.report, sentence: '' } }), 'running');
  const lines = plenumLines({ ...done, joint: 'Gemeinsam.', likelihood: { hitModel: '84,9 %', hitAll: '80,5', nullLL: '27,4', modelLL: '19,4', sentence: '' } }, p);
  assert.deepEqual(lines, [
    ['Frage 3 · Bei wem bewirkt die Kampagne mehr?', 'kommt auf die Sprache an – Kommt auf die Sprache an.'],
    ['Gemeinsamer Satz für den Rat', 'Gemeinsam.'],
    ['Die eine Zahl für den Bericht', '10,3 Prozentpunkte · AME'],
    ['Satz für den Bericht', 'Im Schnitt 10 Prozentpunkte mehr.'],
    ['Frage 1 · „3,77-mal so wahrscheinlich?“', 'Nein, die Chance.'],
    ['Zusatz · Trefferquote gegen −2LL', 'Modell 84,9 % · „alle wählen“ 80,5 % · −2LL 27,4 → 19,4'],
  ]);
  assert.equal(plenumLines(initialS10())[2][1], '');
});

test('predicted probabilities are the logistic of the linear predictor', () => {
  assert.ok(Math.abs(linkinv(logitOf(m, p.profiles.jana)) - jana.prob[0]) < 1e-15);
  assert.ok(Math.abs(jana.odds[1] / jana.odds[0] - m.expB[1]) < 1e-9);
});
