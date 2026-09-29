import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { fixtureSav } from '../sandbox/testData';
import { TaskHost } from './TaskHost';
import type { TaskDef } from './types';

type Dummy = { clicks: number };
const dummy: TaskDef<Dummy> = {
  id: 's10', title: 'Attrappe', role: 'Testrolle', intro: 'Nur für Tests.', requiredVariables: ['pa02a'],
  initial: () => ({ clicks: 0 }),
  parse: raw => ({ clicks: typeof (raw as Dummy)?.clicks === 'number' ? (raw as Dummy).clicks : 0 }),
  status: s => s.clicks > 0 ? 'running' : 'open',
  Component: ({ state }) => createElement('p', null, `Klicks: ${state.clicks}`),
};
const data = { sav: fixtureSav(), fileName: 'ZA8831_v1-3-0.sav', version: 'v1.3.0' };
const host = (props: Partial<Parameters<typeof TaskHost<Dummy>>[0]>) => renderToStaticMarkup(createElement(TaskHost<Dummy>, {
  def: dummy, data, raw: undefined, onRaw: () => {}, onData: () => {}, onConcept: () => {}, ...props,
}));

test('asks for the file first, then checks variables, then shows the task with restored state', () => {
  const empty = host({ data: null });
  assert.match(empty, /AUFGABE · TESTROLLE/);
  assert.match(empty, /ALLBUS-Datei hierher ziehen/);
  assert.match(host({ def: { ...dummy, requiredVariables: ['gibtesnicht'] } }), /fehlen in deiner Datei die Variablen gibtesnicht/);
  assert.match(host({}), /Klicks: 0/);
  assert.match(host({ raw: { clicks: 3 } }), /Klicks: 3/);
  assert.match(host({ raw: { clicks: 'x' } }), /Klicks: 0/);
});
