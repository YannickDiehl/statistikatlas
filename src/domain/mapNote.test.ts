import test from 'node:test';
import assert from 'node:assert/strict';
import { foundationEntries } from './foundations/catalog';
import { mariposaEntries } from './mariposaCatalog';
import { mapNote, mapNoteCounts, MAP_NOTE } from './mapNote';
import { mapConcepts, mapIds } from './visibleNetwork';

test('map note: counts only concepts of the map with their own mariposa call and the functions of exactly those calls', () => {
  const n = mapNoteCounts(), own = mariposaEntries.filter(e => mapIds.has(e.id) && e.variants.length);
  assert.equal(n.concepts, mapConcepts.length);
  assert.equal(n.withCalls, own.length);
  assert.equal(n.functions, new Set(own.flatMap(e => e.variants.map(v => v.fn))).size);
  // Die Grundlagen des Katalogs haben keinen Aufruf und dürfen nicht mitzählen (sonst stand dort „133 davon führen zu …“).
  assert.ok(foundationEntries.length > 0 && foundationEntries.every(e => e.variants.length === 0));
  assert.ok(n.withCalls < mariposaEntries.filter(e => mapIds.has(e.id)).length, 'Grundlagen ohne Aufruf sind im Netz');
  assert.ok(n.withCalls > 0 && n.withCalls <= n.concepts && n.functions >= n.withCalls);
});

test('map note: one clear sentence with the three numbers from the data and no separator beside numbers', () => {
  const n = mapNoteCounts();
  assert.equal(MAP_NOTE, mapNote());
  assert.equal(MAP_NOTE, `${n.concepts} Begriffe im Netz; ${n.withCalls} davon mit eigenem mariposa-Aufruf (${n.functions} Funktionen)`);
  assert.ok(!MAP_NOTE.includes('·') && !MAP_NOTE.includes('führen'), MAP_NOTE);
});
