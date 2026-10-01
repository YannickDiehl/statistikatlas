import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorkbenchStore, fitWidth, maxWidth, standardWidth, WORKBENCH, WORKBENCH_KEY } from './workbench';

test('workbench width: about two thirds of the window, capped, and the map keeps 340 px', () => {
  assert.equal(standardWidth(1440), 922);
  assert.equal(standardWidth(1280), 819);
  assert.equal(standardWidth(1920), 1100);
  assert.equal(standardWidth(1101), 705);
  for (const viewport of [1101, 1280, 1440, 1920, 2560]) {
    const w = standardWidth(viewport);
    assert.ok(viewport - w >= WORKBENCH.mapMin, `${viewport}`);
    assert.ok(w >= WORKBENCH.min, `${viewport}`);
  }
});

test('workbench width: dragging is clamped between 480 px and the map minimum, beyond the standard cap', () => {
  assert.equal(fitWidth(200, 1440), 480);
  assert.equal(fitWidth(1300, 1440), 1100);
  assert.equal(fitWidth(1300, 1920), 1300);
  assert.equal(fitWidth(5000, 1920), 1580);
  assert.equal(maxWidth(700), 480);
  assert.equal(fitWidth(640.4, 1440), 640);
});

test('workbench store: remembers a dragged width, forgets it on reset, survives a blocked storage', () => {
  const data = new Map<string, string>();
  const storage = { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => { data.set(k, v); }, removeItem: (k: string) => { data.delete(k); } };
  const store = createWorkbenchStore(storage);
  assert.equal(store.get(), null);
  let calls = 0;
  const off = store.subscribe(() => { calls++; });
  store.set(860.6);
  assert.equal(store.get(), 861);
  assert.equal(data.get(WORKBENCH_KEY), '861');
  assert.equal(createWorkbenchStore(storage).get(), 861);
  store.set(861);
  assert.equal(calls, 1);
  store.set(null);
  assert.equal(data.has(WORKBENCH_KEY), false);
  assert.equal(calls, 2);
  off();
  data.set(WORKBENCH_KEY, 'breit');
  assert.equal(createWorkbenchStore(storage).get(), null);
  const blocked = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); }, removeItem: () => { throw new Error('blocked'); } };
  const fallback = createWorkbenchStore(blocked);
  fallback.set(700);
  assert.equal(fallback.get(), 700);
  assert.equal(createWorkbenchStore(null).get(), null);
});
