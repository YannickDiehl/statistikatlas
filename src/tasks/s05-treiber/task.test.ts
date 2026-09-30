import test from 'node:test';
import assert from 'node:assert/strict';
import { fixtureSav } from '../../sandbox/testData';
import { renderSession } from '../testRender';
import { cardById } from './content';
import { initialS05, prepare, variants } from './domain';

const render = (state: object) => renderSession(4, true, { tasks: { s05: { ...initialS05(), ...state } } });

test('session 5 starts with the brief and the card draw', () => {
  const html = renderSession(4);
  assert.match(html, /Analyst:in im Beratungsbüro „Querschnitt“\./);
  assert.match(html, /Der Förderfonds „Gemeinsinn“ vergibt/);
  assert.match(html, /Karte ziehen/);
  assert.doesNotMatch(html, /2 · Skalenniveau und Maß/);
  assert.match(html, /FÜR DAS PLENUM/);
});

test('a drawn card opens the steps; the ranking waits for value, stamp and sentence', () => {
  const card = render({ card: 'konf' });
  assert.match(card, /Konfession/);
  assert.match(card, /konf = rec\(rd01, rules = &quot;1:2=1 \[evangelisch\]/);
  assert.match(card, /4 · West und Ost/);
  assert.doesNotMatch(card, /Rangliste in vier Währungen/);
  assert.doesNotMatch(card, /Gamma = −0,54/);
  assert.match(render({ card: 'eastwest' }), /4 · Innerhalb gleicher Wirtschaftslage/);
  const entry = { card: 'ep01', measure: 'gamma', value: '-0,500', stamp: 'trägt', sentence: 'Satz', strata: ['-0,4', '-0,4', ''] };
  assert.match(render({ ...entry, strata: ['', '', ''] }), /Trag zuerst die Werte für West und Ost ein/);
  assert.doesNotMatch(render({ ...entry, sentence: '' }), /Rangliste in vier Währungen/);
  assert.doesNotMatch(render({ ...entry, value: 'x' }), /Rangliste in vier Währungen/);
  const ready = render(entry);
  assert.match(ready, /7 · Die Rangliste in vier Währungen/);
  assert.match(ready, /Cramér-V hat kein Vorzeichen \(0 bis 1\); Gamma, Tau-b und r zeigen die Richtung\. Die Plätze richten sich nach dem Betrag\./);
  assert.match(ready, /Rangliste gewichtet: Cramér-V Platz 1/);
  assert.match(ready, /8 · Empfehlung an den Fonds/);
});

test('the ranking waits until every part has a numeric value of its own', () => {
  const ranking = /7 · Die Rangliste in vier Währungen/;
  const entry = { card: 'ep01', measure: 'gamma', value: '-0,500', stamp: 'trägt', sentence: 'Satz' };
  // leer, nur ein Teil, Platzhalter und Text: verborgen, dazu der Hinweis statt der Lesart
  for (const strata of [['', '', ''], ['-0,4', '', ''], ['', '-0,4', ''], ['x', 'y', ''], ['-0,4', 'abc', ''], ['-', '.', '']]) {
    const html = render({ ...entry, strata });
    assert.doesNotMatch(html, ranking, JSON.stringify(strata));
    assert.doesNotMatch(html, /8 · Empfehlung an den Fonds/, JSON.stringify(strata));
    assert.match(html, /Trag zuerst die Werte für West und Ost ein/, JSON.stringify(strata));
  }
  // zahlenförmig (auch falsch, auch mit Komma oder Minuszeichen): die Enthüllung erscheint, samt Wert, Stempel und Satz
  for (const strata of [['-0,4', '-0,4', ''], ['0,999', '−0,1', ''], ['3', '4', 'x']]) assert.match(render({ ...entry, strata }), ranking, JSON.stringify(strata));
  assert.doesNotMatch(render({ ...entry, strata: ['-0,4', '-0,4', ''], stamp: '' }), ranking);
  assert.doesNotMatch(render({ ...entry, strata: ['-0,4', '-0,4', ''], sentence: ' ' }), ranking);
  assert.doesNotMatch(render({ ...entry, strata: ['-0,4', '-0,4', ''], value: '' }), ranking);
  // „West oder Ost“ hat drei Teile: erst wenn alle drei Zahlen stehen
  const ew = { card: 'eastwest', measure: 'gamma', value: '-0,350', stamp: 'trägt', sentence: 'Satz' };
  assert.doesNotMatch(render({ ...ew, strata: ['-0,3', '-0,3', ''] }), ranking);
  assert.match(render({ ...ew, strata: ['-0,3', '-0,3', '-0,3'] }), ranking);
});

test('the stamp reading prints numbers only after correct strata values', () => {
  const p = prepare(fixtureSav()), ep01 = cardById.ep01, vars = variants(p, ep01);
  const part = (s: number) => vars.find(v => v.measure === 'tau' && !v.weighted && v.stratum === s && v.reversed)!.value.toFixed(3).replace('.', ',');
  const entry = { card: 'ep01', measure: 'tau', value: '-0,387', stamp: 'trägt', sentence: 'Satz' };
  const wrong = render({ ...entry, strata: ['0,999', '0,999', ''] });
  assert.match(wrong, /(Nach der offengelegten Regel lese ich|Meine Lesart nach der offengelegten Regel ist auch) „/);
  assert.doesNotMatch(wrong, /Tau-b gesamt/);
  assert.match(render({ ...entry, strata: [part(0), part(1), ''] }), /Tau-b gesamt .* in West und Ost /);
  assert.doesNotMatch(render({ ...entry, strata: [part(0), '0,999', ''] }), /Tau-b gesamt/);
});

test('the card West oder Ost names Gamma, the economy groups and the matching rule and sentence hint', () => {
  const ew = render({ card: 'eastwest' });
  assert.match(ew, /4 · Innerhalb gleicher Wirtschaftslage/);
  assert.match(ew, /innerhalb gleicher Wirtschaftslage hält \(Drittvariable\)\. Rechne hier Gamma \(<code>goodman_gamma\(\)<\/code>\), damit die Richtung sichtbar bleibt\./);
  assert.match(ew, /Gruppen der Wirtschaftslage haben verschiedene Vorzeichen/);
  assert.doesNotMatch(ew, /Die Landesteile haben verschiedene Vorzeichen/);
  assert.match(ew, /placeholder="[^"]*auch innerhalb gleicher Wirtschaftslage[^"]*"/);
  assert.doesNotMatch(ew, /placeholder="[^"]*in West und Ost[^"]*"/);
  assert.doesNotMatch(ew, /Rechne dasselbe Maß getrennt/);
  const ep = render({ card: 'ep01' });
  assert.match(ep, /Die Landesteile haben verschiedene Vorzeichen/);
  assert.match(ep, /placeholder="[^"]*in West und Ost[^"]*"/);
  assert.doesNotMatch(ep, /Rechne hier Gamma/);
});

test('numbers in the fit prompts wait for a value the detector recognises', () => {
  const p = prepare(fixtureSav()), ep01 = cardById.ep01, vars = variants(p, ep01);
  const gammaW = vars.find(v => v.measure === 'gamma' && v.weighted && v.stratum < 0 && v.reversed)!.value.toFixed(3).replace('.', ',');
  const entry = { card: 'ep01', measure: 'gamma' };
  assert.match(render({ ...entry, value: gammaW }), /γ .*τ /);
  for (const value of ['0,999', '12,345', 'x', '0,5', '']) assert.doesNotMatch(render({ ...entry, value }), /γ .*τ /, value);
  // zweite Währung (das Hauptmaß Tau-b schweigt hier): Zahlen erst bei erkanntem zweiten Wert
  const second = (value: string) => render({ card: 'ep01', measure: 'tau', second: { measure: 'gamma', value, unweighted: '', veto: false } });
  assert.match(second(gammaW), /γ .*τ /);
  for (const value of ['0,999', '12,345', 'x', '0,5', '']) assert.doesNotMatch(second(value), /γ .*τ /, value);
});

test('a finished entry offers the full script and marks the session done', () => {
  const done = { card: 'age', measure: 'r', value: '0,059', stamp: 'kehrt sich um', sentence: 'Satz', recommendation: 'Empfehlung' };
  const html = render(done);
  assert.match(html, /vollständiges R-Skript/);
  assert.match(html, /Gewichtung und Zusammenhang<small>Aufgabe abgeschlossen/);
});
