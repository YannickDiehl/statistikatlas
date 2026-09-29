import test from 'node:test';
import assert from 'node:assert/strict';
import { analyse } from './analysis';
import { itemOf, jugend, nichtwahl, osten } from './claims';
import { buildMirror } from './multiverse';
import { evidenceText, factCardMarkdown, initialWork, missionStatus, parseStore, stepError, type ClaimWork } from './state';
import { fixtureSav } from './testData';

test('restores stored work and rejects malformed values', () => {
  const work: ClaimWork = { ...initialWork(osten), step: 3, reached: 4, verdict: 2, reason: 'Etwa ein Drittel vertraut.', evidence: { row: 0, cell: 'yes', base: 'row' }, answers: { weight: 'Kaum Unterschied.' } };
  const store = { work: { osten: work } };
  assert.deepEqual(parseStore(JSON.stringify(store)), store);
  const broken = parseStore(JSON.stringify({ work: { osten: { step: 9, reached: 1, choice: { cut: 'a', missing: { mode: 'evil' }, weighted: 'yes' }, evidence: { row: 2 }, answers: { a: 1 } } } }));
  assert.deepEqual(broken.work.osten!.choice, osten.defaults);
  assert.equal(broken.work.osten!.step, 0);
  assert.equal(broken.work.osten!.evidence, null);
  assert.deepEqual(broken.work.osten!.answers, {});
  for (const raw of [null, '', '{kaputt', '[]', 'null']) assert.deepEqual(parseStore(raw), { work: {} });
  const cut = parseStore(JSON.stringify({ work: { jugend: { choice: { cut: 55 } } } }));
  assert.equal(cut.work.jugend!.choice.cut, 29);
});

test('reports whether a mission is open, running or done', () => {
  const w = initialWork(jugend);
  assert.equal(missionStatus(undefined), 'open');
  assert.equal(missionStatus(w), 'open');
  assert.equal(missionStatus({ ...w, gaps: ['junge Leute', '', '', '', ''] }), 'running');
  assert.equal(missionStatus({ ...w, step: 2, reached: 2 }), 'running');
  assert.equal(missionStatus({ ...w, step: 3, reached: 4 }), 'done');
});

test('explains what is missing before a step can be left', () => {
  const w = initialWork(jugend);
  assert.match(stepError(jugend, w, []), /drei Lücken/);
  assert.equal(stepError(jugend, { ...w, gaps: ['a', 'b', 'c', '', ''] }, []), '');
  const bench = { ...w, step: 1 as const };
  assert.match(stepError(jugend, { ...bench, choice: { ...w.choice, positive: [] } }, [1, 2, 3, 4, 5]), /mindestens eine Kategorie/);
  assert.match(stepError(jugend, bench, [1, 2, 3, 4, 5]), /Zelle/);
  const all = { ...initialWork(nichtwahl), step: 1 as const, evidence: { row: 0 as const, cell: 'yes' as const, base: 'row' as const }, choice: { ...nichtwahl.defaults, positive: [1, 2, 3, 4] } };
  assert.match(stepError(nichtwahl, all, [1, 2, 3, 4]), /Vergleichsgruppe/);
  assert.match(stepError(jugend, { ...w, step: 2 }, []), /Urteil/);
  assert.match(stepError(jugend, { ...w, step: 2, verdict: 1, reason: 'kurz' }, []), /Satz/);
});

test('phrases evidence by its base and writes a fact card', () => {
  const sav = fixtureSav();
  const item = itemOf(osten, 'pt03');
  const result = analyse(sav, osten.analysis(osten.defaults, item));
  const labels = { groups: osten.groupLabels(osten.defaults, item), outcome: osten.outcomeLabels(osten.defaults, item) };
  assert.equal(evidenceText(labels, result, { row: 0, cell: 'yes', base: 'row' }), '61,5 % in der Gruppe „Osten“: vertraut');
  assert.equal(evidenceText(labels, result, { row: 0, cell: 'yes', base: 'col' }), '66,7 % aller „vertraut“ gehören zur Gruppe „Osten“');
  const work = { ...initialWork(osten), verdict: 3 as const, reason: 'Die Daten zeigen das Gegenteil.', gaps: ['Ostdeutsche', '', '', '', ''] };
  const md = factCardMarkdown(osten, work, 'Beleg X', buildMirror(sav, osten, osten.defaults, item));
  assert.match(md, /\*\*Urteil:\*\* falsch/);
  assert.match(md, /Die Daten zeigen das Gegenteil\./);
  assert.match(md, /- Wer genau\? Ostdeutsche/);
  assert.match(md, /von 24 vertretbaren Auswertungswegen\./);
});
