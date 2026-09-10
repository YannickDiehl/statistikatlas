import test from 'node:test';
import assert from 'node:assert/strict';
import { concepts } from '../domain/concepts';
import { visibleConcepts, allAncestors, prerequisitePath, arrange, NODE_WIDTH, NODE_HEIGHT } from './graph';

test('Zugeklappte Knoten verlieren keine gemeinsam benötigten Voraussetzungen', () => {
  const ids = visibleConcepts('z', new Set(['z', 'centering', 'scaling']), true);
  assert(ids.has('series'));
  const collapsed = visibleConcepts('z', new Set(['z', 'scaling']), true);
  assert(collapsed.has('series'));
  assert(!visibleConcepts('z', new Set(), true).has('series'));
});
test('Die Suche nach einem Formelbaustein findet den rekursiven Weg', () => {
  const path = prerequisitePath('z', 'mean');
  assert(path);
  assert.equal(path[0], 'z'); assert.equal(path.at(-1), 'mean');
  assert(allAncestors('z').has('sum'));
});
test('Der komplette Ausschnitt hat eindeutige Knoten und kollisionsfreie Karten', () => {
  const ids = new Set(concepts.map(n => n.id));
  assert.equal(ids.size, concepts.length);
  const diagram = arrange(ids, true);
  for (let i = 0; i < diagram.nodes.length; i++) for (let j = i + 1; j < diagram.nodes.length; j++) {
    const a = diagram.nodes[i].position, b = diagram.nodes[j].position;
    assert(!(Math.abs(a.x - b.x) < NODE_WIDTH - 1 && Math.abs(a.y - b.y) < NODE_HEIGHT - 1), `${diagram.nodes[i].id} überlappt ${diagram.nodes[j].id}`);
  }
});
