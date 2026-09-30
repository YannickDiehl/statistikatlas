import test from 'node:test';
import assert from 'node:assert/strict';
import { conceptById } from '../domain/concepts';
import { txt, type Ctx, type FNode, type Workshop } from './types';
import { WORKSHOPS, explainFor, stepCardFor, requestStep, takeStep } from './registry';
import { mittel } from './content/mittel';
import { streuung } from './content/streuung';
import { zusammenhang } from './content/zusammenhang';
import { standardfehler } from './content/standardfehler';
import { rekodieren } from './content/rekodieren';
import { parseRules } from './rules';
import { createModeStore, MODE_KEY } from './mode';
import { close, fixed } from './format';

/** Für die Schleifen über alle Werkstätten genügt die lose Sicht; die Einzeltests unten sind typisiert. */
const LOOSE = WORKSHOPS as unknown as Workshop<unknown, unknown>[];

/** Mittelpunkt als Trenner zwischen Wörtern oder nach „Schritt n“ (Spezifikation 7.5). */
const SEPARATOR = /[a-zäöüß]{3,} · | · [A-Za-zÄÖÜäöüß][a-zäöüß]{2,}|Schritt \d+ ·/;
const BROKEN = /NaN|undefined|Infinity|\[object/;
const sentences = (s: string) => (s.match(/[.!?](\s|$)/g) ?? []).length;

function clean(label: string, s: string) {
  assert.ok(s.trim().length > 0, `${label}: leer`);
  assert.ok(!BROKEN.test(s), `${label}: ${s}`);
  assert.ok(!SEPARATOR.test(s), `${label}: Mittelpunkt als Trenner in „${s}“`);
}
function kurz(label: string, s: string) {
  clean(label, s);
  assert.ok(sentences(s) <= 2, `${label}: „Kurz gesagt“ hat mehr als zwei Sätze: ${s}`);
}
const flat = (nodes: FNode[]): string => nodes.map(n => typeof n === 'string' ? n
  : 'part' in n ? flat(n.part) : 'frac' in n ? flat(n.frac) + '/' + flat(n.den) : 'root' in n ? flat(n.root)
  : 'big' in n ? n.big : 'sub' in n ? n.sub : '\n').join('');

test('every workshop text resolves for every preset, variant and person without broken values', () => {
  for (const w of LOOSE) {
    clean(`${w.id} wofür`, w.wofuer);
    w.glyphs.forEach(g => { clean(`${w.id} Zeichen`, g.term); clean(`${w.id} Zeichen`, g.plain); assert.ok(g.step >= 1 && g.step <= w.steps.length); });
    for (const [id, v] of Object.entries(w.variants)) {
      assert.ok(conceptById[id], `${w.id}: Begriff ${id} fehlt`);
      assert.equal(v.lastStep <= w.steps.length, true);
      kurz(`${w.id}/${id} kurz`, v.kurz); clean(`${w.id}/${id} fachlich`, v.fachlich); clean(`${w.id}/${id} aria`, v.aria);
      kurz(`${w.id}/${id} genau`, v.genau.kurz);
      for (const preset of w.presets) {
        const s = w.compute(preset.data);
        for (let who = 0; who < w.names.length; who++) {
          const c: Ctx<unknown> = { s, who, names: w.names };
          const label = `${w.id}/${id}/${preset.id}/${w.names[who]}`;
          v.metrics.forEach(m => clean(`${label} Kennzahl`, m.value(c)));
          const i = v.interpret(c); kurz(`${label} Deutung`, i.kurz); clean(`${label} Deutung`, i.fachlich);
          v.genau.paragraphs(c).forEach(p => clean(`${label} genau`, p));
          clean(`${label} Formel`, flat(w.numeric(c, v.lastStep)));
          w.table.columns.forEach(col => { for (let r = 0; r < w.names.length; r++) clean(`${label} Tabelle`, col.cell(c, r)); if (col.sum) clean(`${label} Summe`, col.sum(c)); });
          w.table.lines.forEach(l => clean(`${label} Zeile`, l.text(c)));
          w.steps.slice(0, v.lastStep).forEach((st, k) => {
            const sl = `${label} Schritt ${k + 1}`;
            kurz(`${sl} kurz`, txt(st.kurz, c));
            for (const t of [st.fachlich, st.vorgerechnet, st.fehler, st.check.question]) clean(sl, txt(t, c));
            clean(sl, st.alltag); clean(sl, st.warum);
            const answer = st.check.answer(c);
            assert.ok(answer === 'NA' || Number.isFinite(answer), `${sl}: Antwort ${answer}`);
            assert.equal(st.check.diagnose(c, answer), null, `${sl}: richtige Antwort bekommt eine Diagnose`);
          });
          w.think.forEach(t => { clean(`${label} Denkfrage`, txt(t.explain, c)); });
        }
      }
    }
    w.steps.forEach((st, k) => {
      assert.ok(conceptById[st.concept], `${w.id} Schritt ${k + 1}: Begriff ${st.concept} fehlt`);
      if (st.also) clean(`${w.id} Schritt ${k + 1} auch`, st.also);
      for (const t of [st.button, st.sym]) assert.ok(!SEPARATOR.test(t), `${w.id} Schritt ${k + 1}: Mittelpunkt als Trenner in „${t}“`);
      (st.links ?? []).forEach(l => { assert.ok(conceptById[l.id], `${w.id}: Verweis ${l.id} fehlt`); clean(`${w.id} Verweis`, l.label); });
    });
    w.table.columns.forEach(col => assert.ok(!SEPARATOR.test(col.head)));
    Object.values(w.variants).forEach(v => { if (v.next) { assert.ok(conceptById[v.next.id]); clean(`${w.id} weiter`, v.next.label); } });
    w.presets.forEach(p => clean(`${w.id} Voreinstellung`, p.label));
    Object.values(w.captions).forEach(cap => clean(`${w.id} Bildunterschrift`, cap!));
    w.think.forEach(t => {
      kurz(`${w.id} Denkfrage kurz`, t.kurz); clean(`${w.id} Denkfrage`, t.question);
      assert.ok(t.correct >= 0 && t.correct < t.options.length);
      if (t.tryIt) {
        const d = t.tryIt.apply(w.presets[0].data) as number[] | { x: number[]; y: number[] }, values: number[] = Array.isArray(d) ? d : [...d.x, ...d.y];
        assert.ok(values.every(x => x >= w.bounds.min && x <= w.bounds.max), `${w.id}: „${t.tryIt.label}“ verlässt die Skala`);
      }
    });
  }
});

test('the step card terms are the concept titles of the map', () => {
  assert.deepEqual(streuung.steps.map(s => conceptById[s.concept].title), ['Arithmetisches Mittel', 'Abweichung vom Mittelwert', 'Quadrierte Abweichung', 'Quadratsumme der Abweichungen', 'Korrigierte Stichprobenvarianz', 'Standardabweichung']);
  assert.deepEqual(zusammenhang.steps.map(s => conceptById[s.concept].title), ['Arithmetisches Mittel', 'Abweichung vom Mittelwert', 'Abweichungsprodukt', 'Summe der Abweichungsprodukte', 'Stichprobenkovarianz', 'Pearson-Korrelation']);
  assert.deepEqual(mittel.steps.map(s => conceptById[s.concept].title), ['Summe', 'Arithmetisches Mittel']);
});

const at = <S,>(w: { compute: (d: never) => S; names: readonly string[] }, data: unknown, who: number): Ctx<S> => ({ s: w.compute(data as never), who, names: w.names });

test('typical wrong answers get their diagnosis (Streuung, Gruppe B)', () => {
  const s = streuung.steps, cA = at(streuung, [1, 3, 5, 7, 9], 0);
  assert.match(s[0].check.diagnose(cA, 25)!, /Summe/); assert.match(s[0].check.diagnose(cA, 6.25)!, /nicht durch n − 1/);
  assert.match(s[1].check.diagnose(cA, 4)!, /Vorzeichen/);
  assert.match(s[2].check.diagnose(cA, -16)!, /Taschenrechner-Falle/); assert.match(s[2].check.diagnose(cA, 8)!, /mal 2/);
  assert.match(s[3].check.diagnose(cA, 0)!, /Summe der Abweichungen/);
  assert.match(s[4].check.diagnose(cA, 8)!, /durch n = 5 geteilt/); assert.match(s[4].check.diagnose(cA, 40)!, /Quadratsumme/);
  assert.match(s[5].check.diagnose(cA, 10)!, /Wurzel/);
  assert.ok(close(s[5].check.answer(cA) as number, 3.16));
});

test('typical wrong answers get their diagnosis (Mittel and Zusammenhang)', () => {
  const m = at(mittel, [1, 3, 5, 7, 9], 0);
  assert.match(mittel.steps[0].check.diagnose(m, 24)!, /Fehlt eine Person/); assert.match(mittel.steps[0].check.diagnose(m, 34)!, /doppelt/);
  assert.match(mittel.steps[1].check.diagnose(m, 25)!, /Summe/); assert.match(mittel.steps[1].check.diagnose(m, 6.25)!, /nicht durch n − 1/);
  const z = at(zusammenhang, { x: [2, 3, 4, 5, 6], y: [2, 5, 3, 6, 4] }, 1), st = zusammenhang.steps;
  assert.equal(st[2].check.answer(z), -1);
  assert.match(st[2].check.diagnose(z, 1)!, /Vorzeichenregel/); assert.match(st[2].check.diagnose(z, 0)!, /Summe der Abweichungen/);
  assert.match(st[3].check.diagnose(z, 7)!, /negativen Produkte positiv/);
  assert.match(st[4].check.diagnose(z, 1)!, /durch n = 5 geteilt/); assert.match(st[4].check.diagnose(z, 5)!, /Summe/);
  assert.match(st[5].check.diagnose(z, 1.25 / (2 * Math.sqrt(2.5)))!, /nicht die Summe/);
  assert.match(st[5].check.diagnose(z, 0.2)!, /nicht die Varianzen/); assert.match(st[5].check.diagnose(z, 1.25)!, /noch die Kovarianz/);
  const flat4 = at(zusammenhang, { x: [2, 3, 4, 5, 6], y: [4, 4, 4, 4, 4] }, 0);
  assert.equal(st[5].check.answer(flat4), 'NA');
});

test('Stufe 2 und 3: Standardfehler and Rekodieren texts and checks', () => {
  const s = standardfehler.compute(standardfehler.initial);
  assert.ok(close(s.se, 0.013, 5e-4)); assert.ok(close(s.lo, 3.27)); assert.ok(close(s.hi, 3.32));
  assert.match(standardfehler.check.diagnose(0.01), /durch n geteilt/); assert.match(standardfehler.check.diagnose(10), /Umgekehrt/); assert.match(standardfehler.check.diagnose(1), /noch s selbst/);
  kurz('SE kurz', standardfehler.kurz); kurz('SE Deutung', standardfehler.interpret(s).kurz); kurz('SE genau', standardfehler.genau.kurz);
  standardfehler.worked(s).forEach(w => clean('SE vorgerechnet', w.text));
  clean('SE Formel', flat(standardfehler.numeric(s)));
  const rev = parseRules('rev', rekodieren.scale), code2 = rekodieren.codes[1];
  assert.equal(rekodieren.check.answer(rev, code2), 4);
  assert.match(rekodieren.check.diagnose(rev, code2, 2), /alte Code/);
  const walk = rekodieren.walk(parseRules('1:2=1; 3:5=0', rekodieren.scale), rekodieren.codes[3]);
  assert.deepEqual(walk.lines.slice(1), ['Regel 1 (1:2=1) passt nicht.', 'Regel 2 (3:5=0) passt.', 'Neuer Code: 0.']);
  assert.equal(walk.kurz, 'Aus 4 wird 0.');
  assert.equal(rekodieren.warnUnmatched([rekodieren.codes[2]]).r, '1 value of `pa02a` matched no rule and became "NA": 3.');
  for (const preset of rekodieren.presets) {
    const p = parseRules(preset.rule, rekodieren.scale);
    rekodieren.describe(p).forEach(d => clean('Regel', d.text));
    rekodieren.codes.forEach(c => { const w = rekodieren.walk(p, c); w.lines.forEach(l => clean('Durchlauf', l)); kurz('Durchlauf kurz', w.kurz); });
  }
  kurz('rec kurz', rekodieren.kurz); kurz('rec genau', rekodieren.genau.kurz);
  assert.match(rekodieren.rCode('rev'), /mutate\(interesse = rec\(pa02a, rules = "rev"\)\) %>%\n  frequency\(interesse\)/);
});

test('registry: explanations, step cards with context and the step request', () => {
  for (const id of ['mean', 'variance', 'sd', 'covariance', 'pearson']) assert.equal(explainFor(id)?.kind, 'werkstatt', id);
  assert.equal(explainFor('se')?.kind, 'satz'); assert.equal(explainFor('recode')?.kind, 'werkzeug'); assert.equal(explainFor('median'), null);
  assert.equal(stepCardFor('deviation')?.workshop.id, 'streuung');
  assert.equal(stepCardFor('deviation', 'pearson')?.workshop.id, 'zusammenhang');
  assert.deepEqual([stepCardFor('ss', 'variance')?.variant, stepCardFor('ss')?.variant, stepCardFor('ss')?.step], ['variance', 'sd', 4]);
  assert.deepEqual([stepCardFor('crossproduct_sum', 'covariance')?.variant, stepCardFor('sd_product')?.step], ['covariance', 6]);
  assert.equal(stepCardFor('sum')?.workshop.id, 'mittel'); assert.equal(stepCardFor('median'), null);
  requestStep('sd', 3); assert.equal(takeStep('variance'), null); assert.equal(takeStep('sd'), 3); assert.equal(takeStep('sd'), null);
});

test('mode store: Ausführlich by default, remembers Kompakt, survives a blocked storage', () => {
  const data = new Map<string, string>();
  const storage = { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => { data.set(k, v); } };
  const store = createModeStore(storage);
  assert.equal(store.get(), 'ausfuehrlich');
  let calls = 0; const off = store.subscribe(() => calls++);
  store.set('kompakt'); assert.equal(store.get(), 'kompakt'); assert.equal(data.get(MODE_KEY), 'kompakt'); assert.equal(calls, 1);
  off(); store.set('ausfuehrlich'); assert.equal(calls, 1);
  assert.equal(createModeStore(storage).get(), 'ausfuehrlich');
  data.set(MODE_KEY, 'kompakt'); assert.equal(createModeStore(storage).get(), 'kompakt');
  const blocked = createModeStore({ getItem: () => { throw new Error('gesperrt'); }, setItem: () => { throw new Error('gesperrt'); } });
  blocked.set('kompakt'); assert.equal(blocked.get(), 'kompakt');
});

test('review fixes: strength rounding, shift keeps s, named person, fixed format', () => {
  const z = at(zusammenhang, { x: [2, 3, 4, 5, 6], y: [2, 5, 3, 6, 4] }, 0);
  assert.match(zusammenhang.variants.pearson.interpret(z).kurz, /starker Zusammenhang, aber kein perfekter/);
  assert.match(zusammenhang.variants.pearson.interpret(at(zusammenhang, { x: [2, 3, 4, 5, 6], y: [6, 3, 5, 2, 4] }, 0)).kurz, /gegenläufiger, starker/);
  const shift = streuung.think[1].tryIt!.apply([1, 3, 5, 7, 9]);
  assert.deepEqual(shift, [2, 4, 6, 8, 10]);
  assert.ok(close(streuung.compute(shift).sd, streuung.compute([1, 3, 5, 7, 9]).sd, 1e-12));
  assert.match(mittel.steps[0].check.diagnose(at(mittel, [1, 3, 5, 7, 9], 0), 24)!, /Ohne Person A \(1\)/);
  assert.equal(fixed(2.7), '2,70'); assert.equal(fixed(3.297), '3,30'); assert.equal(fixed(-0.001), '0,00');
});

test('Stufe 2 und 3: all label texts are clean and linked concepts exist', () => {
  standardfehler.glyphs.forEach(g => { assert.ok(conceptById[g.concept], g.concept); clean('SE Zeichen', g.term); clean('SE Zeichen', g.plain); });
  rekodieren.terms.forEach(t => { if (t.concept) assert.ok(conceptById[t.concept], t.concept); clean('rec Begriff', t.plain); });
  rekodieren.signs.forEach(x => { clean('rec Zeichen', x.plain); clean('rec Zeichen', x.say); });
  const gap = parseRules('1:2=1; 4:5=0', rekodieren.scale);
  assert.match(rekodieren.warnUnmatched([rekodieren.codes[2]]).text, /Der Code 3 passt zu keiner Regel und wird NA/);
  assert.match(rekodieren.warnUnmatched([rekodieren.codes[2], rekodieren.codes[3]]).text, /Die Codes 3 und 4 passen zu keiner Regel und werden NA/);
  const rev4 = parseRules('rev(1, 4)', rekodieren.scale);
  assert.equal(rev4.kind, 'rev');
  if (rev4.kind === 'rev') assert.match(rekodieren.warnOutside(rev4, [rekodieren.codes[4]]).r, /outside the scale range 1-4: 5/);
  assert.match(rekodieren.describe(gap)[0].text, /^Die Codes 1 bis 2 werden zu 1\./);
  assert.match(rekodieren.describe(parseRules('3=copy; else=NA', rekodieren.scale))[0].text, /^Der Code 3 bleibt unverändert\./);
  assert.equal(rekodieren.walk(parseRules('rev', rekodieren.scale), rekodieren.codes[5]).kurz, '„fehlend“ bleibt „fehlend“.');
  assert.match(rekodieren.rCode('1:2=1 ["x"]; 3:5=0'), /rules = "1:2=1 \[\\"x\\"\]; 3:5=0"/);
  assert.match(rekodieren.rCode('rev'), /^library\(dplyr\)\nlibrary\(mariposa\)/);
  const se = standardfehler.compute(standardfehler.initial);
  assert.match(standardfehler.interpret(se).fachlich, /3,297 − 0,025 ≈ 3,27 bis 3,297 \+ 0,025 ≈ 3,32/);
  kurz('SE Deutung', standardfehler.interpret(se).kurz);
});
