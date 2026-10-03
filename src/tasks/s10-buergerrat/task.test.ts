import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { fakeSav, fixtureSav } from '../../sandbox/testData';
import type { LogitFit } from '../kit/logit';
import { renderSession } from '../testRender';
import { Buergerrat } from './Buergerrat';
import { initialS10, personNumbers, prepare, type S10State } from './domain';

const render = (state: Partial<S10State>) => renderSession(10, true, { tasks: { s10: { ...initialS10(), ...state } } });
const p = prepare(fixtureSav()), m = p.main as LogitFit;
const fmt = (x: number, d = 3) => x.toFixed(d).replace('.', ',');
const jana = personNumbers(m, p.profiles.jana), wiegand = personNumbers(m, p.profiles.wiegand);
const right = {
  or: { pflicht: fmt(m.expB[1]), interesse: fmt(m.expB[2]) },
  jana: { logit: fmt(jana.logit[0]), odds: fmt(jana.odds[0]), prob: fmt(jana.prob[0]) },
  odds: { janaUp: fmt(jana.odds[1], 2), wiegand: fmt(wiegand.odds[0], 2), wiegandUp: fmt(wiegand.odds[1], 2) },
  prob: { janaUp: fmt(jana.prob[1]), wiegand: fmt(wiegand.prob[0]), wiegandUp: fmt(wiegand.prob[1]) },
};
const answered = { ...right, campaign: 'depends' as const, answer3: 'Kommt auf die Sprache an.' };
const TAFEL = /Dolmetscher-Tafel: eine Stufe mehr Pflichtgefühl in drei Sprachen/;
// Referenzwerte der Testdatei, die vor dem eigenen Eintrag nirgends stehen dürfen
const secrets = ['2,615', '2,417', '50,5', '72,7', '94,0', '97,6', '22,2', '+3,6', '15,6', '40,7', '10,3'];

test('session 11 starts with the brief, both council members and the first station', () => {
  const html = renderSession(10);
  assert.match(html, /AUFGABE · STATISTIK-DOLMETSCHER:IN/);
  assert.match(html, /Dein neuer Job: Statistik-Dolmetscher:in\./);
  assert.match(html, /„Pflichtgefühl: Exp\(B\) = 3,77 \*\*\*“/);
  assert.match(html, /Jana, 24/);
  assert.match(html, /Herr Wiegand, 67/);
  assert.match(html, /1 · Nachrechnen/);
  assert.match(html, /Nicht-ganzzahlige #Erfolge in einem binomial-GLM“\? Sie ist harmlos/);
  assert.match(html, /6 · Zusatz: Trefferquote gegen Likelihood/);
  assert.match(html, /FÜR DAS PLENUM/);
  assert.doesNotMatch(html, /fiktiv/i);
  for (const s of secrets) assert.ok(!html.includes(s), s);
  assert.doesNotMatch(html, TAFEL);
  assert.doesNotMatch(html, /Nachwort/);
  const empty = renderSession(10, false);
  assert.match(empty, /Dolmetschen für den Bürgerrat/);
  assert.match(empty, /ALLBUS-Datei hierher ziehen/);
});

test('numbers appear only after the own entry is recognised', () => {
  // Station 2: die Übersetzung für Jana erst nach drei richtigen Zahlen
  assert.doesNotMatch(render({ jana: { ...right.jana, prob: '0,999' } }), /Übersetzt: Janas Chance/);
  assert.match(render({ jana: right.jana }), /Übersetzt: Janas Chance steht 1,02 zu 1\. Von 100 Menschen, die so antworten wie Jana, würden etwa 50 wählen gehen\./);
  // Station 3: die Gegenfrage rechnet erst mit Janas Zahl, wenn Exp(B) und Janas Wahrscheinlichkeit stimmen
  const times = { answer1: 'Ja, 3,77-mal so wahrscheinlich.' };
  assert.doesNotMatch(render(times), /Probier es an Jana: /);
  assert.match(render(times), /Probier es an Jana aus: Nimm ihre Wahrscheinlichkeit/);
  assert.match(render({ ...times, or: right.or, jana: right.jana }), /Probier es an Jana: 50,5 % × 2,61 = 132 % – geht das\?/);
  // Wrong entries never show the right values
  const wrong = render({ or: { pflicht: '9,999', interesse: '9,999' }, jana: { logit: '9,99', odds: '9,99', prob: '0,999' }, odds: { janaUp: '9,99', wiegand: '9,99', wiegandUp: '9,99' },
    prob: { janaUp: '0,111', wiegand: '0,222', wiegandUp: '0,333' }, campaign: 'jana', answer3: 'Bei Jana.', ame: '0,999', report: { number: '9,99', unit: 'pp', sentence: 'x' } });
  for (const s of secrets) assert.ok(!wrong.includes(s), s);
  assert.doesNotMatch(wrong, TAFEL);
});

test('the interpreter board waits for Jana, all six cells and the answer to question 3', () => {
  const ready = render(answered);
  assert.match(ready, TAFEL);
  assert.match(ready, /50,5 → 72,7 % <strong>\(\+22,2 Prozentpunkte\)<\/strong>/);
  assert.match(ready, /1,02 → 2,66 <strong>\(×2,61\)<\/strong>/);
  assert.match(ready, /role="img" aria-label="S-Kurve der Wahrscheinlichkeit zu wählen über das Pflichtgefühl\. Jana: 50,5 % → 72,7 % \(\+22,2 Prozentpunkte\); Herr Wiegand: 94,0 % → 97,6 % \(\+3,6 Prozentpunkte\)\."/);
  assert.match(ready, /Genau: Die Antwort hängt an der Sprache/);
  assert.match(ready, /Dein Satz in beiden Sprachen/);
  assert.match(ready, /class="s10-scroll" tabindex="0" role="region" aria-label="Dolmetscher-Tafel"/);
  for (const patch of [{ campaign: '' as const }, { answer3: '' }, { jana: { ...right.jana, odds: '' } }, { odds: { ...right.odds, wiegandUp: '1,00' } }, { prob: { ...right.prob, janaUp: 'x' } }]) {
    const html = render({ ...answered, ...patch });
    assert.doesNotMatch(html, TAFEL, JSON.stringify(patch));
    assert.match(html, /Die Dolmetscher-Tafel erscheint, sobald/);
  }
  assert.match(render({ ...answered, campaign: '' }), /sobald deine Antwort auf Frage 3 steht\./);
  assert.match(render({ ...answered, jana: { ...right.jana, odds: '' }, prob: { ...right.prob, janaUp: '' } }), /sobald Janas drei Zahlen \(Station 2\) und die drei Wahrscheinlichkeiten stehen\./);
});

test('changing the answer to question 3 changes only the derived notes, never the typed texts', () => {
  const a = render({ ...answered, joint: 'Unser Satz.', campaign: 'jana' });
  const b = render({ ...answered, joint: 'Unser Satz.', campaign: 'same' });
  assert.match(a, /Du sagst „bei Jana“/);
  assert.match(b, /Du sagst „bei beiden gleich“/);
  for (const html of [a, b]) assert.match(html, />Unser Satz\.<\/textarea>/);
});

test('the partner variant splits the two languages and asks for a shared sentence', () => {
  const pair = render({ ...answered, mode: 'pair' });
  assert.match(pair, /A übersetzt in Chancen: Jana von Hand/);
  assert.match(pair, /2 · A: Jana von Hand übersetzen/);
  assert.match(pair, /A · in Chancen/);
  assert.match(pair, /B · in Wahrscheinlichkeiten/);
  assert.match(pair, /Euer gemeinsamer Satz/);
  assert.match(pair, /Die Dolmetscher-Tafel erscheint erst, wenn beide Zahlenreihen auf einem Bildschirm stehen\./);
  assert.match(pair, /5 · B: Die eine Zahl für den Bericht/);
  const solo = render(answered);
  assert.match(solo, /Sprache 1 · Chancen/);
  assert.match(solo, /Sprache 2 · Wahrscheinlichkeiten/);
  assert.doesNotMatch(solo, /A · in Chancen/);
  assert.match(solo, /5 · Die eine Zahl für den Bericht/);
  assert.match(solo, /inputMode="decimal" maxLength="24"/);
  assert.doesNotMatch(solo, /maxLength="16"/);
});

test('the report number is recognised, persons’ numbers appear only after the board', () => {
  const report = { ame: fmt(p.ame[0]), report: { number: fmt(100 * p.ame[0], 1), unit: 'pp' as const, sentence: 'Im Schnitt steigt die Wahrscheinlichkeit.' } };
  const before = render(report);
  assert.match(before, /Das ist der durchschnittliche marginale Effekt \(AME\)\./);
  assert.match(before, /Stimmt: Im Mittel über alle Befragten steigt die Wahrscheinlichkeit je Stufe Pflichtgefühl um 10,3 Prozentpunkte\./);
  assert.doesNotMatch(before, /22,2/);
  assert.match(render({ ...answered, ...report }), /für Menschen wie Jana 22,2, wie Herrn Wiegand 3,6 Prozentpunkte/);
  assert.match(render({ report: { number: fmt(100 * p.ame[0], 1), unit: 'pct', sentence: '' } }), /Prozent oder Prozentpunkte\?/);
  // vor der Tafel ist das Feld kein Orakel für die Werte der Ratsmitglieder
  const oracle = render({ report: { number: fmt(100 * wiegand.prob[0], 0), unit: 'pct', sentence: '' } });
  assert.match(oracle, /erst ein, wenn die Dolmetscher-Tafel offen ist/);
  assert.doesNotMatch(oracle, /Das ist eine Wahrscheinlichkeit/);
});

test('the likelihood station reveals its lesson after four right entries', () => {
  const c = m.classification;
  const ll = { hitModel: fmt(c.overall, 1), hitAll: fmt(100 * c.n1 / (c.n0 + c.n1), 1), nullLL: fmt(m.minus2LLNull, 1), modelLL: fmt(m.minus2LL, 1), sentence: '' };
  assert.match(render({ likelihood: ll }), /Von 5 Nichtwählenden erkennt das Modell 2/);
  assert.match(render({ likelihood: ll }), /Dein Satz für das Ratsmitglied/);
  assert.doesNotMatch(render({ likelihood: { ...ll, modelLL: '99,9' } }), /Nichtwählenden erkennt/);
});

test('a finished task fills the council card, offers the afterword and marks the session done', () => {
  const done = render({ ...answered, answer1: 'Nein – die Chance ist so viel höher, nicht die Wahrscheinlichkeit.', joint: 'In Chancen gleich, in Prozentpunkten bei Jana mehr.',
    report: { number: fmt(100 * p.ame[0], 1), unit: 'pp', sentence: 'Im Mittel steigt die Wahrscheinlichkeit um 10 Prozentpunkte.' } });
  assert.match(done, /Ratskarte · Dolmetschen für den Bürgerrat/);
  assert.match(done, /<dt>Die eine Zahl für den Bericht<\/dt><dd>10,3 Prozentpunkte · AME<\/dd>/);
  assert.match(done, /<dt>Frage 3 · Bei wem bewirkt die Kampagne mehr\?<\/dt><dd>kommt auf die Sprache an – Kommt auf die Sprache an\.<\/dd>/);
  assert.match(done, /Nachwort: sechs typische Umwege/);
  assert.match(done, /vollständiges R-Skript/);
  assert.match(done, /Logistische Regression<small>Aufgabe abgeschlossen/);
});

test('a file on which the model cannot be estimated shows an explanation instead of stations', () => {
  const sav = fakeSav({
    pv01: { values: [1, 1, 1, 91, 91, 91, 2, 2], missingFrom: -1 }, pe09: { values: [1, 1, 1, 4, 4, 4, 1, 1], missingFrom: -1 },
    pa02a: { values: [1, 2, 3, 1, 2, 3, 4, 5], missingFrom: -1 }, wghtpew: { values: [1, 1, 1, 1, 1, 1, 1, 1] },
  });
  const html = renderToStaticMarkup(createElement(Buergerrat, {
    data: { sav, fileName: 'x.sav', version: 'v1.3.0' }, state: initialS10(), onChange: () => {}, onConcept: () => {},
  }));
  assert.match(html, /role="alert">Mit dieser Datei lässt sich das Modell nicht schätzen: Die Prädiktoren trennen die beiden Ausgänge/);
  assert.doesNotMatch(html, /2 · Jana von Hand/);
  assert.doesNotMatch(html, /NaN/);
});
