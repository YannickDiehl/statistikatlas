import test from 'node:test';
import assert from 'node:assert/strict';
import { fixtureSav } from '../../sandbox/testData';
import { renderSession } from '../testRender';
import { COMMON_CAUSES, GROUP_IDS } from './content';
import { core, initialS09, interaction, modelStore, prepare, selection, type Model, type ModelEntry } from './domain';

const render = (state: object) => renderSession(8, true, { tasks: { s09: { ...initialS09(), ...state } } });
const p = prepare(fixtureSav()), models = modelStore(p);
const f3 = (x: number) => x.toFixed(3).replace('.', ',').replace('-', '−');
const entry = (m: Model, withC = true): ModelEntry => ({ c: withC ? f3(m.c) : '', b: GROUP_IDS.map(g => (g === m.spec.ref ? '' : f3(m.b[g]))) as ModelEntry['b'] });
const m4 = core(models, 4)!, m1 = core(models, 1)!;
const pred = (m: Model) => (m.c + m.b[2]).toFixed(2).replace('.', ',');

test('session 9 starts with the brief of the documentary desk and the two camps', () => {
  const html = renderSession(8);
  assert.match(html, /Neuer Job: Datenrecherche in der Doku-Redaktion „Zweiufer“\./);
  assert.match(html, /Redakteurin Mara Lindqvist schreibt dir/);
  assert.match(html, /„Prägung“ erwartet/);
  assert.match(html, /2 · Wie viele Umgezogene tragen den Film\? \(R\)/);
  assert.doesNotMatch(html, /4 · Zweite Referenz/);
  assert.doesNotMatch(html, /fiktiv|Zwischenhalt/i);
  assert.match(html, /Schnittplan-Karte · Mitgenommen/);
});

test('coefficients, CIs, predictions and the template wait for the own recognised table', () => {
  const chosen = render({ ref: 4 });
  // Nur der Hinweis zur Referenz – der fertige Modellcode steht erst in Hilfestufe 4
  assert.match(chosen, /# Deine Referenz: West-Bleibende – ihr Dummy \(dg03_4\) bleibt draußen/);
  assert.doesNotMatch(chosen, /linear_regression\(demo ~ dg03_1/);
  assert.doesNotMatch(chosen, /pt03 ~ dg03_1|crosstab\(dg03, abi|ost \* ostjugend/);
  assert.match(chosen, /readOnly="" aria-readonly="true" tabindex="-1" value="Referenz"/);
  for (const n of [f3(m4.c), f3(m4.b[2])]) assert.doesNotMatch(chosen, new RegExp(n), n);
  assert.doesNotMatch(chosen, /95-%-Konfidenzintervall/);
  assert.match(chosen, /Nach deiner Tabelle zeige ich dir Konfidenzintervalle/);
  const wrong = render({ ref: 4, model: entry(core(models, 4, 'orig')!) });
  assert.match(wrong, /ohne Umpolen/);
  assert.doesNotMatch(wrong, /95-%-Konfidenzintervall/);
  const ok = render({ ref: 4, model: entry(m4) });
  assert.match(ok, /Referenz West-Bleibende: Abstand zur Referenz \(B\) und Vorhersage je Gruppe/);
  assert.match(ok, /Gestrichelt: wo die Umgezogenen liegen müssten/);
  assert.match(ok, /Vorhersage für Ost→West aus deiner Tabelle/);
  // Wackeltest steht erst nach der erkannten Tabelle beim Off-Text
  assert.doesNotMatch(chosen, /Wackeltest/);
  assert.match(ok, /<h4 class="s09-sub">Wackeltest<\/h4>/);
});

test('the board of the other cutting rooms waits for a second recognised reference that differs from the first', () => {
  const first = { ref: 4, model: entry(m4), pred: pred(m4) };
  assert.doesNotMatch(render(first), /<h4 class="s09-sub">Tafel der anderen Schnittplätze<\/h4>/);
  assert.doesNotMatch(render({ ...first, second: { ref: 1, model: { ...entry(m1), c: '9,999' }, pred: '' } }), /<h4 class="s09-sub">Tafel der anderen Schnittplätze<\/h4>/);
  const both = render({ ...first, second: { ref: 1, model: entry(m1), pred: pred(m1) } });
  assert.match(both, /<h4 class="s09-sub">Tafel der anderen Schnittplätze<\/h4>/);
  assert.match(both, /Die Koeffizienten hängen an der Referenz, die Vorhersagen nicht/);
  assert.match(both, /Stimmt: Konstante \+ B\(Ost→West\) = /);
  // Die zweite Referenz kann nicht dieselbe sein wie die erste
  assert.doesNotMatch(render({ ...first, second: { ref: 4, model: entry(m4), pred: '' } }), /<h4 class="s09-sub">Tafel der anderen Schnittplätze<\/h4>/);
});

test('selection, controls and their effect appear only after recognised own values', () => {
  const s = selection(p), base = { ref: 4, model: entry(m4) };
  const before = render({ ...base, abi: '99,9' });
  assert.doesNotMatch(before, /Abitur-Anteile:/);
  assert.match(render({ ...base, abi: s.weighted[3].toFixed(1).replace('.', ',') }), /Stimmt \(gewichtet\)\. Abitur-Anteile:/);
  const cc = models({ outcome: 'rev', ref: 4, controls: COMMON_CAUSES, weighted: true })!;
  assert.doesNotMatch(render({ ...base, controls: COMMON_CAUSES }), /ohne und mit Kontrollen/);
  const withC = render({ ...base, controls: COMMON_CAUSES, cmodel: entry(cc, false) });
  assert.match(withC, /Abstand zu West-Bleibende: ohne und mit Kontrollen/);
  assert.doesNotMatch(withC, /demo ~ dg03_1 \+ dg03_2 \+ dg03_3 \+ age/);
  const sorted = render({ ...base, sort: { ...initialS09().sort, pt03: 'vorher' } });
  assert.match(sorted, /Vertrauen in den Bundestag – ein Argument dafür: .* Bedenke auch: /);
  assert.doesNotMatch(sorted, /tone-ok">Vertrauen in den Bundestag/);
});

test('the interaction and the counter-check reveal details only after the own value', () => {
  const it = interaction(p)!;
  assert.doesNotMatch(render({}), /Stimmt: ost:ostjugend/);
  assert.match(render({ inter: f3(it.fit.coef[3]) }), /Stimmt: ost:ostjugend = .*zweite Schreibweise/);
  const pt = core(models, 4, 'pt03')!;
  const counter = render({ ref: 4, model: entry(m4), counter: entry(pt, false) });
  assert.match(counter, /Zufriedenheit \/ Vertrauen: Ost-Bleibende/);
  assert.doesNotMatch(render({ ref: 4, model: entry(m4) }), /Zufriedenheit \/ Vertrauen:/);
});

test('off-text questions: qualitative first, with numbers after the own recognised values', () => {
  const text = 'Die Prägung macht alle Ostdeutschen unzufrieden, wenn sie in den Westen ziehen.';
  const plain = render({ offText: text });
  assert.match(plain, /Wer zieht um\? Unterscheiden sich die Umgezogenen schon, bevor sie umziehen\?/);
  assert.match(plain, /Wie viele Menschen tragen diesen Satz\?<\/li>/);
  assert.match(plain, /– 12 Wörter/);
  const numbers = render({ offText: text, movers: ['12', '7'], abi: selection(p).weighted[3].toFixed(1).replace('.', ','), ref: 4, model: entry(m4) });
  assert.match(numbers, /Im Modell 12 Ost→West und 7 West→Ost/);
  assert.match(numbers, /Wackeltest ohne die fünf einflussreichsten Fälle: Ost→West zwischen/);
});

test('pair variant: two cutting rooms, roles A and B; the finished card and the script', () => {
  const pair = render({ mode: 'pair', ref: 1 });
  assert.match(pair, /A ist „Schnittplatz Ost“ \(Referenz Ost-Bleibende\), B „Schnittplatz West“/);
  assert.match(pair, /3 · Mit wem vergleicht der Film\? \(R\) · A: Ost-Bleibende, B: West-Bleibende/);
  assert.match(pair, /4 · Der andere Schnittplatz/);
  assert.match(pair, /6 · Gegenprobe mit dem Vertrauen in den Bundestag \(R\) · B/);
  assert.doesNotMatch(render({ ref: 1 }), /Der andere Schnittplatz/);
  const cc = models({ outcome: 'rev', ref: 4, controls: COMMON_CAUSES, weighted: true })!;
  const done = render({ ref: 4, model: entry(m4), pred: pred(m4), movers: ['12', '7'], abi: '40,3', controls: COMMON_CAUSES, cmodel: entry(cc, false), offText: 'Satz' });
  assert.match(done, /vollständiges R-Skript/);
  assert.match(done, /Regression vertiefen<small>Aufgabe abgeschlossen/);
  assert.match(done, /<dt>Referenzgruppe<\/dt><dd>West-Bleibende<\/dd>/);
  assert.match(done, /<dt>Kontrolliert<\/dt><dd>Alter, Geschlecht \(Frau\), Abitur<\/dd>/);
});

test('main-model numbers stay hidden until the own first table is recognised (counter-check, board, controls)', () => {
  const cc = models({ outcome: 'rev', ref: 4, controls: COMMON_CAUSES, weighted: true })!, pt = core(models, 4, 'pt03')!;
  const noModel = { ref: 4, second: { ref: 1, model: entry(m1), pred: pred(m1) }, controls: COMMON_CAUSES, cmodel: entry(cc, false), counter: entry(pt, false) };
  const hidden = render(noModel);
  assert.doesNotMatch(hidden, /Zufriedenheit \/ Vertrauen:/);
  assert.doesNotMatch(hidden, /<h4 class="s09-sub">Tafel der anderen Schnittplätze<\/h4>/);
  assert.doesNotMatch(hidden, /ohne und mit Kontrollen/);
  // (B Ost-Bleibende steht als −B West-Bleibende in der eigenen zweiten Tabelle – das hat die Person selbst getippt)
  for (const n of [f3(m4.c), f3(m4.b[2]), f3(m4.b[3])]) assert.doesNotMatch(hidden, new RegExp(n), n);
  const shown = render({ ...noModel, model: entry(m4) });
  assert.match(shown, /Zufriedenheit \/ Vertrauen:/);
  assert.match(shown, /<h4 class="s09-sub">Tafel der anderen Schnittplätze<\/h4>/);
  assert.match(shown, /ohne und mit Kontrollen/);
});

test('entries typed as R prints them open the tables and the plenum card shows normalised values', () => {
  const dot = (x: number) => x.toFixed(3).replace('-', '−');
  const e = { c: dot(m4.c), b: GROUP_IDS.map(g => (g === 4 ? '' : dot(m4.b[g]))) };
  const s = selection(p);
  const html = render({ ref: 4, model: e, pred: (Number(dot(m4.c)) + Number(dot(m4.b[2]))).toFixed(3), abi: `${s.weighted[3].toFixed(1)}%` });
  assert.match(html, /Referenz West-Bleibende: Abstand zur Referenz/);
  assert.match(html, /Stimmt \(gewichtet\)\. Abitur-Anteile:/);
  assert.match(html, new RegExp(`<dt>B Ost→West</dt><dd>${f3(m4.b[2])}</dd>`));
  assert.doesNotMatch(html, /noch nicht geprüft/);
});
