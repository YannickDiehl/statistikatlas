import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HintLadder } from './HintLadder';
import { near, parseNumber } from './numbers';
import { PlenumCard, plenumMarkdown } from './PlenumCard';
import { RBlock } from './RBlock';
import { emptyTaskStore, oneOf, parseTaskStore, str, strList } from './storage';

test('reads German and English number formats', () => {
  assert.equal(parseNumber('37,9'), 37.9);
  assert.equal(parseNumber('37.9'), 37.9);
  assert.equal(parseNumber('1.656'), 1656);
  assert.equal(parseNumber('5 246'), 5246);
  assert.equal(parseNumber('−8'), -8);
  assert.equal(parseNumber('-0,5'), -0.5);
  assert.equal(parseNumber('0.500'), 0.5);
  assert.equal(parseNumber('0.123'), 0.123);
  assert.equal(parseNumber('-0.250'), -0.25);
  for (const bad of ['', 'abc', '1,2,3', '5,5 %']) assert.equal(parseNumber(bad), null, bad);
  assert.ok(near(37.94, 37.9, 0.05));
  assert.ok(!near(38, 37.9, 0.05));
});

test('restores only known tasks from storage and survives garbage', () => {
  assert.deepEqual(parseTaskStore(null), emptyTaskStore());
  assert.deepEqual(parseTaskStore('{kaputt'), emptyTaskStore());
  assert.deepEqual(parseTaskStore('{"tasks":[1,2]}'), emptyTaskStore());
  const store = parseTaskStore(JSON.stringify({ tasks: { s01: { a: 1 }, s99: { b: 2 }, s02: 'text' } }));
  assert.deepEqual(store, { tasks: { s01: { a: 1 } } });
  assert.equal(str(42), '');
  assert.equal(str('x'.repeat(3000)).length, 2000);
  assert.equal(oneOf('b', ['a', 'b'] as const, 'a'), 'b');
  assert.equal(oneOf('c', ['a', 'b'] as const, 'a'), 'a');
  assert.deepEqual(strList(['a', 3, 'b']), ['a', 'b']);
});

test('hint ladder starts closed and the plenum card lists its lines', () => {
  const hint = { think: 'Denk nach.', pointer: 'Schau in die Karte.', scaffold: 'find_var(___)', solution: 'find_var(allbus, "x")' };
  const html = renderToStaticMarkup(createElement(HintLadder, { hint, onConcept: () => {} }));
  assert.match(html, /Ich komme nicht weiter/);
  assert.doesNotMatch(html, /Denk nach/);
  const card = renderToStaticMarkup(createElement(PlenumCard, { title: 'Stempelbilanz', lines: [['Beauftragen', '2 von 4'], ['Variable', '']], file: 'plenum.md' }));
  assert.match(card, /FÜR DAS PLENUM/);
  assert.match(card, /2 von 4/);
  assert.equal(plenumMarkdown('T', [['A', '1'], ['B', '']]), '# T\n\n- **A:** 1\n- **B:** –\n');
  assert.match(renderToStaticMarkup(createElement(RBlock, { code: 'library(mariposa)', file: 'x.R' })), /library\(mariposa\)/);
});
