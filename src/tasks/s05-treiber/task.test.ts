import test from 'node:test';
import assert from 'node:assert/strict';
import { renderSession } from '../testRender';
import { initialS05 } from './domain';

test('session 5 starts with the brief and the card draw', () => {
  const html = renderSession(4);
  assert.match(html, /Beratungsbüro „Querschnitt“ \(fiktiv\)/);
  assert.match(html, /Förderfonds „Gemeinsinn“ \(fiktiv\)/);
  assert.match(html, /Karte ziehen/);
  assert.doesNotMatch(html, /2 · Skalenniveau und Maß/);
  assert.match(html, /FÜR DAS PLENUM/);
});

test('a drawn card opens the steps; the ranking waits for value and stamp', () => {
  const card = renderSession(4, true, { tasks: { s05: { ...initialS05(), card: 'konf' } } });
  assert.match(card, /Konfession/);
  assert.match(card, /konf = rec\(rd01, rules = &quot;1:2=1 \[evangelisch\]/);
  assert.match(card, /4 · West und Ost/);
  assert.doesNotMatch(card, /Rangliste in vier Währungen/);
  const ew = renderSession(4, true, { tasks: { s05: { ...initialS05(), card: 'eastwest' } } });
  assert.match(ew, /4 · Innerhalb gleicher Wirtschaftslage/);
  const ready = renderSession(4, true, { tasks: { s05: { ...initialS05(), card: 'ep01', measure: 'gamma', value: '-0,500', stamp: 'trägt' } } });
  assert.match(ready, /7 · Die Rangliste in vier Währungen/);
  assert.match(ready, /Rangliste gewichtet: Cramér-V Platz 1/);
  assert.match(ready, /8 · Empfehlung an den Fonds/);
});

test('a finished entry offers the full script and marks the session done', () => {
  const done = { ...initialS05(), card: 'age' as const, measure: 'r' as const, value: '0,059', stamp: 'kehrt sich um' as const, sentence: 'Satz', recommendation: 'Empfehlung' };
  const html = renderSession(4, true, { tasks: { s05: done } });
  assert.match(html, /vollständiges R-Skript/);
  assert.match(html, /Gewichtung und Zusammenhang<small>Aufgabe abgeschlossen/);
});
