import test from 'node:test';
import assert from 'node:assert/strict';
import { renderSession, testData } from '../testRender';
import { fourfold, initialS04, PARTY, percent, prepare } from './domain';

const joint = prepare(testData().sav);
const fmt = (x: number) => x.toFixed(1).replace('.', ',');

test('session 4 shows the press release, three checks, the verdict and the plenum card', () => {
  const html = renderSession(3);
  assert.match(html, /Faktencheck-Redaktion „Nachgezählt“ \(fiktiv\)/);
  assert.match(html, /87 Prozent der Nichtwähler/);
  for (const step of ['Prüfauftrag 1 · Zahl nachbauen', 'Prüfauftrag 2 · Eine Zelle, drei Nenner', 'Prüfauftrag 3 · Deine Lesart', 'Urteil und Faktencheck-Satz']) assert.match(html, new RegExp(step));
  assert.match(html, /FÜR DAS PLENUM/);
  assert.doesNotMatch(html, /percentages = &quot;col&quot;/);
  assert.doesNotMatch(html, /drei Nenner –/);
  assert.doesNotMatch(html, /vollständiges R-Skript/);
});

test('draws the denominator picture and the strip once the numbers are right', () => {
  const party = fourfold(joint, PARTY);
  const p2 = { rowDistrust: fmt(percent(party, 'a', 'row')), rowOthers: fmt(percent(party, 'c', 'row')), total: fmt(percent(party, 'a', 'all')) };
  const own = fourfold(joint, { item: 'pe05', distrust: [3, 4], nonvote: [-8], else0: false, weighted: false });
  const p3 = { ...initialS04().p3, rowDistrust: fmt(percent(own, 'a', 'row')), rowOthers: fmt(percent(own, 'c', 'row')), n: String(own.n.a) };
  const html = renderSession(3, true, { tasks: { s04: { ...initialS04(), p2, p3 } } });
  assert.match(html, /Dieselben \d+ Menschen, drei Nenner/);
  assert.match(html, /18 Lesarten: Von den Misstrauenden wollen/);
  assert.match(html, /Deine Lesart: <strong>pe05↺ 1–2 · 91\+wn<\/strong>/);
});

test('asks at most three questions after a verdict and offers the full script when done', () => {
  const done = { ...initialS04(), p1: { pct: '87', n: '127' }, p2: { rowDistrust: '6,5', rowOthers: '2,3', total: '4,6' },
    p3: { ...initialS04().p3, rowDistrust: '21,5' }, verdict: 2, reason: 'Misstrauen führt nicht zur Nichtwahl', sentence: 'Von denen, die misstrauen, wollen 6,5 % nicht wählen, von den übrigen 2,3 %.' };
  const html = renderSession(3, true, { tasks: { s04: done } });
  assert.match(html, /Du nennst eine Ursache\./);
  assert.equal((html.match(/<li><strong>/g) ?? []).length, 3);
  assert.match(html, /vollständiges R-Skript/);
  assert.match(html, /Kreuztabellen<small>Aufgabe abgeschlossen/);
});
