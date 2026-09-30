import test from 'node:test';
import assert from 'node:assert/strict';
import { renderSession } from '../testRender';
import { initialS05 } from './domain';

const render = (state: object) => renderSession(4, true, { tasks: { s05: { ...initialS05(), ...state } } });

test('session 5 starts with the brief and the card draw', () => {
  const html = renderSession(4);
  assert.match(html, /Beratungsbüro „Querschnitt“ \(fiktiv\)/);
  assert.match(html, /Förderfonds „Gemeinsinn“ \(fiktiv\)/);
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
  const entry = { card: 'ep01', measure: 'gamma', value: '-0,500', stamp: 'trägt', sentence: 'Satz' };
  assert.match(render({ ...entry, strata: ['', '', ''] }), /Trag zuerst die Werte für West und Ost ein/);
  assert.doesNotMatch(render({ ...entry, sentence: '' }), /Rangliste in vier Währungen/);
  assert.doesNotMatch(render({ ...entry, value: 'x' }), /Rangliste in vier Währungen/);
  const ready = render(entry);
  assert.match(ready, /7 · Die Rangliste in vier Währungen/);
  assert.match(ready, /Rangliste gewichtet: Cramér-V Platz 1/);
  assert.match(ready, /8 · Empfehlung an den Fonds/);
});

test('a finished entry offers the full script and marks the session done', () => {
  const done = { card: 'age', measure: 'r', value: '0,059', stamp: 'kehrt sich um', sentence: 'Satz', recommendation: 'Empfehlung' };
  const html = render(done);
  assert.match(html, /vollständiges R-Skript/);
  assert.match(html, /Gewichtung und Zusammenhang<small>Aufgabe abgeschlossen/);
});
