import test from 'node:test';
import assert from 'node:assert/strict';
import { renderSession, testData } from '../testRender';
import { fourfold, initialS04, PARTY, percent, prepare } from './domain';

const joint = prepare(testData().sav);
const fmt = (x: number) => x.toFixed(1).replace('.', ',');
const party = fourfold(joint, PARTY);
const own = fourfold(joint, { item: 'pe05', distrust: [3, 4], nonvote: [-8], else0: false, weighted: false });
const p2 = { rowDistrust: fmt(percent(party, 'a', 'row')), rowOthers: fmt(percent(party, 'c', 'row')), total: fmt(percent(party, 'a', 'all')) };
const p3 = { ...initialS04().p3, rowDistrust: fmt(percent(own, 'a', 'row')), rowOthers: fmt(percent(own, 'c', 'row')), n: String(own.n.a) };
const render = (state: object) => renderSession(3, true, { tasks: { s04: { ...initialS04(), ...state } } });

test('session 4 shows the press release, three checks, the verdict and the plenum card', () => {
  const html = renderSession(3);
  assert.match(html, /Faktencheck-Redaktion „Nachgezählt“ · dein Auftrag/);
  assert.match(html, /87 Prozent der Nichtwähler/);
  for (const step of ['Prüfauftrag 1 · Zahl nachbauen', 'Prüfauftrag 2 · Eine Zelle, drei Nenner', 'Prüfauftrag 3 · Deine Lesart', 'Urteil und Faktencheck-Satz']) assert.match(html, new RegExp(step));
  assert.match(html, /FÜR DAS PLENUM/);
  assert.doesNotMatch(html, /percentages = &quot;col&quot;/);
  assert.doesNotMatch(html, /drei Nenner –/);
  assert.doesNotMatch(html, /18 Lesarten/);
  assert.doesNotMatch(html, /vollständiges R-Skript/);
  assert.match(render({ mode: 'pair' }), /A ist die Nachrechnerin \(Prüfauftrag 1\), B der Gegenrechner \(Prüfauftrag 2\)/);
});

test('draws the denominator picture and the strip only once the numbers are right', () => {
  const html = render({ p2, p3 });
  assert.match(html, /Dieselben \d+ Menschen, drei Nenner/);
  assert.match(html, /Nur der Nenner wechselt: [\d,]+ % unter den \d+ Nichtwählenden/);
  assert.match(html, /18 Lesarten: Von den Misstrauenden wollen/);
  assert.doesNotMatch(render({ p2: { ...p2, total: '99,9' }, p3 }), /drei Nenner –/);
  assert.doesNotMatch(render({ p2, p3: { ...p3, rowDistrust: '99,9' } }), /18 Lesarten/);
  assert.match(render({ p3: { ...p3, item: 'pa35', distrust: [1, 2], nonvote: [], weighted: true } }), /Deine Lesart: <strong>pa35 1–2 · 91 · gewichtet<\/strong>/);
});

test('asks at most three questions after a verdict and offers the full script when done', () => {
  const done = { p1: { pct: fmt(percent(party, 'a', 'col')), n: String(party.n.a) }, p2, p3, verdict: 2,
    reason: 'Misstrauen führt nicht zur Nichtwahl', sentence: 'Von denen, die misstrauen, wollen 6,5 % nicht wählen, von den übrigen 2,3 %.' };
  const html = render(done);
  const titles = [...html.matchAll(/<li><strong>([^<]+)<\/strong>/g)].map(m => m[1]);
  assert.deepEqual(titles, ['Du nennst eine Ursache.', 'Was ist mit „weiß nicht“?', 'Wie viele Menschen stehen hinter der Zahl?']);
  assert.match(html, /vollständiges R-Skript/);
  assert.match(html, /Kreuztabellen<small>Aufgabe abgeschlossen/);
  // Eine falsche Eingabe verrät über die Gegenfragen keine Zahlen.
  const wrong = [...render({ ...done, p1: { pct: 'x', n: '' }, p3: { ...p3, rowDistrust: '99,9' } }).matchAll(/<li><strong>([^<]+)<\/strong>/g)].map(m => m[1]);
  assert.deepEqual(wrong, ['Du nennst eine Ursache.', 'Absicht ist nicht Verhalten.']);
});
