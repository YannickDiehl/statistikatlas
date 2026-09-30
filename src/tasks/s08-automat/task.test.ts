import test from 'node:test';
import assert from 'node:assert/strict';
import { fixtureSav } from '../../sandbox/testData';
import { renderSession } from '../testRender';
import { inputById } from './content';
import { initialS08, leveneVariants, machineFor, prepare, spread, variants, type Variant } from './domain';

const render = (state: object) => renderSession(7, true, { tasks: { s08: { ...initialS08(), ...state } } });
const p = prepare(fixtureSav()), vars = variants(p, inputById.pt03);
const get = (kind: Variant['kind']) => vars.find(v => v.kind === kind)!;
const f3 = (x: number) => x.toFixed(3).replace('.', ',').replace('-', '−');
const main = get('main');
const setting = { input: 'pt03', a: f3(main.a), b: f3(main.b), r2: f3(main.r2) };
const machine = machineFor(p, inputById.pt03, main, setting), sp = spread(machine);

test('session 8 starts with the brief in the visitor centre and the choice of the question', () => {
  const html = renderSession(7);
  assert.match(html, /Dein neuer Job: Technik im Besucherzentrum des Landtags\./);
  assert.match(html, /Die Kuratorin Ida Lorenzen schreibt dir/);
  assert.match(html, /10 · Vertrauen in den Bundestag/);
  assert.doesNotMatch(html, /2 · Automat einstellen/);
  assert.doesNotMatch(html, /fiktiv/i);
  assert.match(html, /FÜR DAS PLENUM/);
});

test('no automaton numbers before the own setting is recognised; testing opens afterwards', () => {
  const chosen = render({ input: 'pt03' });
  assert.match(chosen, /2 · Automat einstellen \(R\)/);
  assert.match(chosen, /mutate\(demo = rec\(ps03, rules = &quot;rev&quot;\)\)/);
  for (const n of [f3(main.a), f3(main.b), f3(main.r2)]) assert.doesNotMatch(chosen, new RegExp(n), n);
  assert.doesNotMatch(chosen, /3 · Testen/);
  // falsch umgepolt: Diagnose, aber kein Testen
  const orig = get('orig');
  const wrong = render({ input: 'pt03', a: f3(orig.a), b: f3(orig.b), r2: f3(orig.r2) });
  assert.match(wrong, /ohne Umpolen/);
  assert.doesNotMatch(wrong, /3 · Testen/);
  assert.doesNotMatch(wrong, new RegExp(f3(main.a)));
  const ready = render(setting);
  assert.match(ready, /3 · Testen/);
  assert.match(ready, /Besucherprobe/);
  assert.doesNotMatch(ready, /Besucherprobe mit 20 Befragten/);
  // ohne Gewicht gerechnet: gilt auch, die Karte vermerkt es
  const u = get('unweighted');
  const unweighted = render({ input: 'pt03', a: f3(u.a), b: f3(u.b), r2: f3(u.r2) });
  assert.match(unweighted, /3 · Testen/);
  assert.match(unweighted, /\(pt03\) · ungewichtet/);
});

test('the visitor probe needs a group code; the resolution waits for the tip', () => {
  const probe = render({ ...setting, code: '417' });
  assert.match(probe, /Besucherprobe mit 20 Befragten/);
  assert.match(probe, /Deine Gruppe:<\/strong> Fehlerquadrate Automat/);
  assert.doesNotMatch(probe, /weniger\. Das ist dein R²/);
  assert.match(render({ ...setting, code: '41' }), /drei oder vier Ziffern/);
  const tip = render({ ...setting, guess: 'Faulpelz' });
  assert.match(tip, /weniger\. Das ist dein R² \(0,052\)/);
  assert.match(tip, /Warum ist der Faulpelz so gut\?/);
  assert.match(tip, /Knöpfe \(optional\)/);
});

test('the hand displays open the machine in test mode', () => {
  const at = (x: number) => (machine.a + machine.b * x).toFixed(2).replace('.', ',');
  const html = render({ ...setting, shows: [at(2), at(6)] });
  assert.match(html, /Eingabe 2: 5,126 − 0,217 · 2 = .* – stimmt/);
  assert.match(html, /Und bei Eingabe 0 zeigt er die Konstante/);
  assert.match(html, /Menschen wie du sind im Schnitt so zufrieden mit der Demokratie: <strong>/);
  assert.doesNotMatch(render({ ...setting, shows: [at(2), ''] }), /Und bei Eingabe 0/);
});

test('the spread chart and numbers in the sign questions wait for recognised residual spreads', () => {
  const before = render({ ...setting, sign: 'Der Automat zeigt, wie zufrieden Menschen wie du sind.' });
  assert.match(before, /4 · Gleich gut für alle\? \(R\)/);
  assert.doesNotMatch(before, /Je Stufe: Fälle, Residuen-SD/);
  assert.match(before, /Nach deinem Eintrag zeige ich dir die Streuung aller Stufen/);
  assert.match(before, /Wie weit liegt er typischerweise daneben\?<\/li>/);
  assert.doesNotMatch(render({ ...setting, sdMin: '0,999', sdMax: '9,999' }), /Je Stufe: Fälle, Residuen-SD/);
  const after = render({ ...setting, sdMin: f3(sp.min), sdMax: f3(sp.max), sign: 'Der Automat zeigt, wie zufrieden Menschen wie du sind.' });
  assert.match(after, /Je Stufe: Fälle, Residuen-SD/);
  assert.match(after, /Wie weit liegt er typischerweise daneben\? Im Mittel etwa ±/);
  assert.match(after, /Für wen liegt er weiter daneben\? Bei Eingabe 7/);
});

test('Levene details appear only after the own F value', () => {
  const lv = leveneVariants(machine);
  assert.doesNotMatch(render(setting), /Stimmt: F\(/);
  assert.match(render({ ...setting, levene: lv.main.F.toFixed(3).replace('.', ',') }), /Stimmt: F\(6; 12,3\)/);
});

test('the parade waits for the decision; the pair variant splits the roles and signs twice', () => {
  assert.doesNotMatch(render(setting), /6 · Automaten-Parade/);
  const decided = render({ ...setting, decision: 'freigeben' });
  assert.match(decided, /6 · Automaten-Parade/);
  assert.match(decided, /Parade aufdecken \(im Seminar erst nach dem Plenum\)/);
  assert.match(decided, /Bei \d+ von 10 Eingaben trifft der Automat/);
  const pair = render({ ...setting, mode: 'pair' });
  assert.match(pair, /A ist Technik und stellt den Automaten in R ein\. B ist Kuratorin/);
  assert.match(pair, /2 · Automat einstellen \(R\) · Technik/);
  assert.match(pair, /3 · Testen · Kuratorin/);
  assert.match(pair, /Rollentausch: Kuratorin rechnet, Technik prüft/);
  assert.match(pair, /Technik unterschreibt/);
  assert.doesNotMatch(render(setting), /Technik unterschreibt/);
});

test('a finished automaton offers the full script, fills the plenum card and marks the session done', () => {
  const done = { ...setting, sdMin: f3(sp.min), sdMax: f3(sp.max), sign: 'Schild', decision: 'nur mit Schild freigeben', guess: 'Automat' };
  const html = render(done);
  assert.match(html, /vollständiges R-Skript/);
  assert.match(html, /Lineare Regression<small>Aufgabe abgeschlossen/);
  assert.match(html, /<dt>Treffer ±1<\/dt><dd>Automat \d+,\d % · Faulpelz \d+,\d %<\/dd>/);
  assert.match(html, /<dt>Entscheidung<\/dt><dd>nur mit Schild freigeben<\/dd>/);
});
