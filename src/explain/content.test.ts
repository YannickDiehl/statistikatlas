import test from 'node:test';
import assert from 'node:assert/strict';
import { conceptById } from '../domain/concepts';
import { txt, type AnySentence, type ConceptCard, type Ctx, type FNode, type TableTool, type Workshop } from './types';
import { EXPLANATIONS, WORKSHOPS, explainFor, mergeAreas, stepCardFor, tabsFor, requestStep, takeStep } from './registry';
import { styleProblems } from './style';
import { mittel } from './content/mittel';
import { streuung } from './content/streuung';
import { zusammenhang } from './content/zusammenhang';
import { standardfehler } from './content/standardfehler';
import { rekodieren } from './content/rekodieren';
import { parseRules } from './rules';
import { createModeStore, MODE_KEY } from './mode';
import { close, fixed } from './format';

/**
 * Inhaltstests für **alle** registrierten Erklärungen (Pilot und Bereiche, Spezifikation Ausbau Abschnitt 8):
 * keine kaputten Werte, Sprachregeln mit [Test] (src/explain/style.ts), Fachbegriff = Kartentitel,
 * Aussprache bei jedem Zeichen, Kontrollfragen mit richtiger Antwort ohne Diagnose und „Fast!“-Diagnosen.
 */

const BROKEN = /NaN|undefined|Infinity|\[object/;
/** „Was passiert?“ und „Warum?“: Sätze mit höchstens 25 Wörtern. */
const SHORT = { maxWords: 25 };
/** „Kurz gesagt“: höchstens zwei Sätze mit je höchstens 25 Wörtern. */
const KURZ = { maxWords: 25, maxSentences: 2 };
/** „Was heißt das Ergebnis?“: Aussage über Menschen, kurze Sätze (das gebilligte Beispiel hat drei). */
const DEUTUNG = { maxWords: 25, maxSentences: 3 };

function clean(label: string, s: string | undefined, opts?: { maxWords?: number; maxSentences?: number }) {
  assert.ok(typeof s === 'string' && s.trim().length > 0, `${label}: leer`);
  assert.ok(!BROKEN.test(s), `${label}: ${s}`);
  const problems = styleProblems(s, opts);
  assert.deepEqual(problems, [], `${label}: ${problems.join(' ')}`);
}
const flat = (nodes: FNode[]): string => nodes.map(n => typeof n === 'string' ? n
  : 'part' in n ? flat(n.part) : 'frac' in n ? flat(n.frac) + '/' + flat(n.den) : 'root' in n ? flat(n.root)
  : 'big' in n ? n.big : 'sub' in n ? n.sub : '\n').join('');
const concept = (label: string, id: string) => assert.ok(conceptById[id]?.title, `${label}: Begriff „${id}“ fehlt in concepts.ts`);
/** Regel 1: Zeichen oder ausdrücklich keins; bei einem Zeichen auch die Aussprache (ohne Anführungszeichen). */
function symbol(label: string, sym: string | undefined, say: string | undefined) {
  if (sym) { assert.ok(say?.trim(), `${label}: Zeichen „${sym}“ ohne Aussprache`); assert.ok(!/[„“"]/.test(say!), `${label}: Aussprache ohne Anführungszeichen schreiben`); }
}
const FAST = /^Fast! /, LEADS = /^(Fast! |Noch nicht ganz\. )/;

/** Alle endlichen Zahlen in den Kennwerten, auch in Listen und verschachtelten Objekten. */
function numbersIn(value: unknown, out: number[] = []): number[] {
  if (typeof value === 'number' && Number.isFinite(value)) out.push(value);
  else if (Array.isArray(value)) value.forEach(v => numbersIn(v, out));
  else if (value && typeof value === 'object') Object.values(value).forEach(v => numbersIn(v, out));
  return out;
}
/**
 * Typische Fehlantworten aus den Kennwerten: Vorzeichen, mal oder durch 2, ±1, n statt n − 1 (und umgekehrt),
 * Quadrat und Wurzel. Mindestens eine davon muss eine „Fast!“-Diagnose auslösen (siehe AUTHORING.md).
 */
function probes(s: unknown): number[] {
  const base = [...new Set(numbersIn(s))];
  return [...new Set(base.flatMap(b => [b, -b, 2 * b, b / 2, b + 1, b - 1, b * 4 / 5, b * 5 / 4, b / 4, b / 5, b * b, Math.sqrt(Math.abs(b))]))];
}

const LOOSE = WORKSHOPS as Workshop<any, any>[];

test('every workshop text resolves for every preset, variant and person and follows the tone guide', () => {
  for (const w of LOOSE) {
    clean(`${w.id} wofür`, w.wofuer); clean(`${w.id} Mut`, w.mut, SHORT);
    if (w.dataNote !== undefined) clean(`${w.id} Hinweis`, w.dataNote);
    assert.ok(w.picture.trim(), `${w.id}: Bild fehlt`);
    w.glyphs.forEach(g => { clean(`${w.id} Zeichen`, g.term); clean(`${w.id} Zeichen`, g.plain); symbol(`${w.id} Zeichen ${g.sym}`, g.sym, g.say); assert.ok(g.step >= 1 && g.step <= w.steps.length); });
    const fastByStep = new Map<number, number>();
    for (const [id, v] of Object.entries(w.variants)) {
      concept(`${w.id}`, id);
      assert.equal(v.lastStep <= w.steps.length, true);
      clean(`${w.id}/${id} kurz`, v.kurz, KURZ); clean(`${w.id}/${id} fachlich`, v.fachlich); clean(`${w.id}/${id} aria`, v.aria);
      clean(`${w.id}/${id} genau`, v.genau.kurz, KURZ);
      v.metrics.forEach(m => clean(`${w.id}/${id} Kennzahl`, m.label));
      for (const preset of w.presets) {
        const s = w.compute(preset.data), tries = probes(s);
        for (let who = 0; who < w.names.length; who++) {
          const c: Ctx<unknown> = { s, who, names: w.names };
          const label = `${w.id}/${id}/${preset.id}/${w.names[who]}`;
          v.metrics.forEach(m => clean(`${label} Kennzahl`, m.value(c)));
          const i = v.interpret(c); clean(`${label} Deutung`, i.kurz, DEUTUNG); clean(`${label} Deutung`, i.fachlich);
          v.genau.paragraphs(c).forEach(p => clean(`${label} genau`, p));
          clean(`${label} Formel`, flat(w.numeric(c, v.lastStep)));
          w.table.columns.forEach(col => { for (let r = 0; r < w.names.length; r++) clean(`${label} Tabelle`, col.cell(c, r)); if (col.sum) clean(`${label} Summe`, col.sum(c)); });
          w.table.lines.forEach(l => clean(`${label} Zeile`, l.text(c)));
          w.steps.slice(0, v.lastStep).forEach((st, k) => {
            const sl = `${label} Schritt ${k + 1}`;
            clean(`${sl} was`, txt(st.was, c), SHORT); clean(`${sl} warum`, txt(st.warum, c), SHORT);
            clean(`${sl} Rechnung`, txt(st.rechnung, c)); clean(`${sl} Fachsprache`, txt(st.fach, c)); clean(`${sl} Aufgepasst`, txt(st.acht, c));
            clean(`${sl} Frage`, txt(st.check.question, c));
            const answer = st.check.answer(c);
            assert.ok(answer === 'NA' || Number.isFinite(answer), `${sl}: Antwort ${answer}`);
            assert.equal(st.check.diagnose(c, answer), null, `${sl}: richtige Antwort bekommt eine Diagnose`);
            for (const v2 of tries) {
              if (answer !== 'NA' && close(v2, answer)) continue;
              const d = st.check.diagnose(c, v2);
              if (d === null) continue;
              clean(`${sl} Diagnose`, d);
              assert.match(d, FAST, `${sl}: Diagnose beginnt nicht mit „Fast!“: ${d}`);
              fastByStep.set(k, (fastByStep.get(k) ?? 0) + 1);
            }
          });
          w.think.forEach(t => { clean(`${label} Denkfrage`, txt(t.explain, c)); });
        }
      }
    }
    w.steps.forEach((st, k) => {
      const sl = `${w.id} Schritt ${k + 1}`;
      concept(sl, st.concept);
      clean(`${sl} Titel`, st.title); clean(`${sl} Knopf`, st.button);
      symbol(sl, st.sym, st.say);
      if (st.sym) clean(`${sl} Zeichen`, st.sym);
      if (st.alltag) clean(`${sl} Alltag`, st.alltag);
      (st.links ?? []).forEach(l => { concept(`${sl} Verweis`, l.id); clean(`${sl} Verweis`, l.label); });
      assert.ok((fastByStep.get(k) ?? 0) > 0, `${sl}: keine Fehlantwort löst eine „Fast!“-Diagnose aus`);
    });
    w.table.columns.forEach(col => clean(`${w.id} Spaltenkopf`, col.head));
    Object.values(w.variants).forEach(v => { if (v.next) { concept(`${w.id} weiter`, v.next.id); clean(`${w.id} weiter`, v.next.label); } });
    w.presets.forEach(p => clean(`${w.id} Voreinstellung`, p.label));
    Object.values(w.captions).forEach(cap => clean(`${w.id} Bildunterschrift`, cap!));
    w.think.forEach(t => {
      clean(`${w.id} Denkfrage kurz`, t.kurz, KURZ); clean(`${w.id} Denkfrage`, t.question);
      Object.values(t.questionFor ?? {}).forEach(q => clean(`${w.id} Denkfrage`, q));
      t.options.forEach(o => clean(`${w.id} Antwort`, o));
      assert.ok(t.correct >= 0 && t.correct < t.options.length);
      if (t.tryIt) {
        clean(`${w.id} Ausprobieren`, t.tryIt.label);
        for (const preset of w.presets) {
          const values = numbersIn(t.tryIt.apply(preset.data));
          assert.ok(values.every(x => x >= w.bounds.min && x <= w.bounds.max), `${w.id}: „${t.tryIt.label}“ verlässt die Skala`);
        }
      }
    });
  }
});

function checkCard(card: ConceptCard) {
  const l = `Begriffskarte ${card.concept}`;
  concept(l, card.concept);
  clean(`${l} wofür`, card.wofuer); clean(`${l} kurz`, card.kurz, KURZ);
  clean(`${l} Stell dir vor`, card.stellDirVor.text);
  (card.stellDirVor.figures ?? []).forEach(f => { clean(`${l} Zahl`, f.label); clean(`${l} Zahl`, f.value); });
  clean(`${l} Fachsprache`, card.heisst.fach); symbol(l, card.heisst.sym, card.heisst.say);
  assert.ok(card.bausteine.length >= 2 && card.bausteine.length <= 4, `${l}: zwei bis vier Bausteine`);
  card.bausteine.forEach((b, i) => {
    const bl = `${l} Baustein ${i + 1}`;
    clean(`${bl} Titel`, b.title); clean(`${bl} was`, b.was, SHORT); clean(`${bl} warum`, b.warum, SHORT); clean(`${bl} Aufgepasst`, b.acht);
    if (b.rechnung) clean(`${bl} Rechnung`, b.rechnung);
    if (b.concept) concept(bl, b.concept);
  });
  card.ausprobieren.forEach(q => {
    clean(`${l} Ausprobieren`, q.question); clean(`${l} Ausprobieren`, q.explain); clean(`${l} Ausprobieren kurz`, q.kurz, KURZ);
    q.options.forEach(o => clean(`${l} Antwort`, o));
    assert.ok(q.correct >= 0 && q.correct < q.options.length);
    if (q.step !== undefined) assert.ok(q.step >= 1 && q.step <= card.bausteine.length, `${l}: Schritt ${q.step} gibt es nicht`);
  });
  if (card.regler) {
    const r = card.regler;
    clean(`${l} Regler`, r.label);
    for (let v = r.min; v <= r.max + 1e-9; v += (r.max - r.min) / 40) { clean(`${l} Regler ${v}`, r.format(v)); clean(`${l} Regler ${v}`, r.describe(v)); }
    clean(`${l} Regler Start`, r.describe(r.initial));
  }
  const ch = card.check;
  clean(`${l} Frage`, ch.question);
  assert.equal(new Set(ch.options).size, ch.options.length, `${l}: doppelte Antworten`);
  assert.ok(Number.isInteger(ch.correct) && ch.correct >= 0 && ch.correct < ch.options.length, `${l}: genau eine richtige Antwort`);
  assert.equal(ch.diagnose[ch.correct], undefined, `${l}: die richtige Antwort bekommt keine Diagnose`);
  assert.match(ch.right, /^Genau/, `${l}: Rückmeldung zur richtigen Antwort beginnt mit „Genau“`);
  clean(`${l} richtig`, ch.right);
  ch.options.forEach((o, k) => {
    clean(`${l} Antwort`, o);
    if (k === ch.correct) return;
    const d = ch.diagnose[k];
    clean(`${l} Rückmeldung ${k}`, d);
    assert.match(d!, LEADS, `${l}: Rückmeldung zu Antwort ${k} beginnt nicht mit „Fast!“ oder „Noch nicht ganz.“`);
  });
  assert.ok(Object.values(ch.diagnose).some(d => FAST.test(d!)), `${l}: keine „Fast!“-Rückmeldung`);
  clean(`${l} für dich`, card.fuerDich);
  clean(`${l} genau`, card.genau.kurz, KURZ); card.genau.paragraphs.forEach(p => clean(`${l} genau`, p));
}

/** R-Code im Stil des Lernpfads (Spezifikation Lehrdatensatz, Abschnitt 7). */
function rStyle(label: string, code: string) {
  assert.ok(code.startsWith('library(dplyr)\nlibrary(mariposa)\n\natlas <- read_spss("Statistikatlas-200-Befragte.sav")\n'), `${label}: Startblock fehlt`);
  assert.match(code, /atlas %>%/, `${label}: Pipe fehlt`);
  for (const bad of ['d$', 'd <- ', 'factor(', 'read.csv2', 'ifelse(', '0.7.2', '0.7.3']) assert.ok(!code.includes(bad), `${label}: „${bad}“ im R-Code`);
  if (code.includes('rec(')) assert.match(code, /mutate\(/, `${label}: rec() gehört in mutate()`);
}

function checkTool(t: TableTool) {
  const l = `Werkzeug ${t.concept}`;
  concept(l, t.concept);
  clean(`${l} wofür`, t.wofuer); clean(`${l} kurz`, t.kurz, KURZ); if (t.mut) clean(`${l} Mut`, t.mut, SHORT);
  assert.equal(t.rows.length, 5, `${l}: fünf Personen`);
  t.columns.forEach(c => clean(`${l} Spalte`, c.label));
  t.steps.forEach((st, i) => {
    const sl = `${l} Schritt ${i + 1}`;
    clean(`${sl} Titel`, st.title); clean(`${sl} was`, st.was, SHORT); clean(`${sl} warum`, st.warum, SHORT); clean(`${sl} Aufgepasst`, st.acht); clean(`${sl} Fachsprache`, st.fach);
    symbol(sl, st.sym, st.say);
    if (st.concept) concept(sl, st.concept);
  });
  let fast = 0;
  for (const o of t.options) {
    clean(`${l} Wahl`, o.label);
    const after = t.apply(t.rows, o.id);
    assert.equal(after.rows.length, t.rows.length, `${l}/${o.id}: Zeilen gehen verloren`);
    after.columns.forEach(c => clean(`${l}/${o.id} Spalte`, c.label));
    after.rows.forEach(r => after.columns.forEach(c => {
      const v = r[c.key];
      assert.ok(v === null || typeof v === 'string' || Number.isFinite(v), `${l}/${o.id}: Wert ${String(v)} in ${c.key}`);
    }));
    rStyle(`${l}/${o.id}`, t.rCode(o.id));
    const answer = t.check.answer(o.id);
    assert.ok(answer === 'NA' || Number.isFinite(answer));
    assert.equal(t.check.diagnose(o.id, answer), null, `${l}: richtige Antwort bekommt eine Diagnose`);
    for (const v of answer === 'NA' ? [0, 1] : probes(answer)) {
      if (answer !== 'NA' && close(v, answer)) continue;
      const d = t.check.diagnose(o.id, v);
      if (d === null) continue;
      clean(`${l} Diagnose`, d); assert.match(d, FAST); fast++;
    }
  }
  assert.ok(fast > 0, `${l}: keine Fehlantwort löst eine „Fast!“-Diagnose aus`);
  clean(`${l} Frage`, t.check.question); assert.match(t.check.right, /^Genau/); clean(`${l} richtig`, t.check.right);
  t.think.forEach(q => {
    clean(`${l} Denkfrage`, q.question); clean(`${l} Denkfrage`, q.explain); clean(`${l} Denkfrage kurz`, q.kurz, KURZ); q.options.forEach(o => clean(`${l} Antwort`, o));
    assert.ok(q.correct >= 0 && q.correct < q.options.length);
    if (q.step !== undefined) assert.ok(q.step >= 1 && q.step <= t.steps.length);
  });
  clean(`${l} genau`, t.genau.kurz, KURZ); t.genau.paragraphs.forEach(p => clean(`${l} genau`, p));
}

/** Zustände einer Formel als Satz: Startwerte, jeder Kurzbefehl (einmal und zweimal) und jeder Regler an beiden Enden. */
function sentenceStates(t: AnySentence): Record<string, number>[] {
  const states: Record<string, number>[] = [t.initial];
  for (const q of t.quick) { const once = q.apply(t.initial); states.push(once, q.apply(once)); }
  for (const sl of t.sliders) for (const v of [sl.min, sl.max]) states.push({ ...t.initial, [sl.key]: v });
  states.push(Object.fromEntries(t.sliders.map(sl => [sl.key, sl.min])), Object.fromEntries(t.sliders.map(sl => [sl.key, sl.max])));
  return states;
}

function checkSentence(t: AnySentence) {
  const l = `Formel als Satz ${t.concept}`;
  concept(l, t.concept);
  clean(`${l} wofür`, t.wofuer); clean(`${l} kurz`, t.kurz, KURZ); clean(`${l} fachlich`, t.fachlich); clean(`${l} Aufgepasst`, t.fehler);
  clean(`${l} aria`, t.aria);
  clean(`${l} Satz`, t.sentence.map(p => typeof p === 'string' ? p : p.t).join(''));
  t.sentence.forEach(p => { if (typeof p !== 'string') assert.ok(t.glyphs.some(g => g.key === p.m), `${l}: Satzteil „${p.t}“ ohne Zeichen ${p.m}`); });
  t.metrics.forEach(m => clean(`${l} Kennzahl`, m.label));
  t.sliders.forEach(sl => { clean(`${l} Regler`, sl.label); assert.ok(t.glyphs.some(g => g.key === sl.key), `${l}: Regler ${sl.key} ohne Zeichen`); });
  t.quick.forEach(q => { clean(`${l} Kurzbefehl`, q.label); assert.ok(t.glyphs.some(g => g.key === q.mark)); });
  t.glyphs.forEach(g => {
    clean(`${l} Zeichen`, g.term); clean(`${l} Zeichen`, g.plain); symbol(l, g.sym, g.say);
    if (g.concept) { concept(l, g.concept); assert.equal(g.term, conceptById[g.concept].title, `${l}: Zeichen ${g.sym} heißt „${g.term}“, der Begriff „${g.concept}“ in der Karte aber „${conceptById[g.concept].title}“ (Regel 2)`); }
  });
  for (const v of sentenceStates(t)) {
    const s = t.compute(v), sl = `${l} bei ${JSON.stringify(v)}`;
    t.metrics.forEach(m => clean(`${sl} Kennzahl`, m.value(s)));
    t.sliders.forEach(x => clean(`${sl} Regler`, x.format(v[x.key])));
    t.worked(s).forEach(w => { clean(`${sl} Vorgerechnet`, w.title); clean(`${sl} Vorgerechnet`, w.text); });
    clean(`${sl} Formel`, flat(t.numeric(s))); clean(`${sl} Vergleich`, t.compare(s));
    const i = t.interpret(s); clean(`${sl} Deutung`, i.kurz, DEUTUNG); clean(`${sl} Deutung`, i.fachlich);
  }
  clean(`${l} Frage`, t.check.question);
  assert.match(t.check.right, /^Genau/); clean(`${l} richtig`, t.check.right);
  const said = probes(t.check.answer).filter(v => !close(v, t.check.answer, t.check.tolerance)).map(v => t.check.diagnose(v));
  said.forEach(d => { clean(`${l} Diagnose`, d); assert.match(d, LEADS); });
  assert.ok(said.some(d => FAST.test(d)), `${l}: keine „Fast!“-Diagnose`);
  clean(`${l} Denkfrage`, t.think.question); clean(`${l} Denkfrage`, t.think.explain); clean(`${l} Denkfrage kurz`, t.think.kurz, KURZ);
  t.think.options.forEach(o => clean(`${l} Antwort`, o));
  if (t.think.hint) clean(`${l} Hinweis`, t.think.hint);
  clean(`${l} genau`, t.genau.kurz, KURZ); t.genau.paragraphs.forEach(p => clean(`${l} genau`, p));
}

test('every registered explanation follows its template and the tone guide', () => {
  const kinds = new Set<string>();
  for (const [id, e] of Object.entries(EXPLANATIONS)) {
    concept('Erklärung', id);
    kinds.add(e.kind);
    if (e.kind === 'begriff') { assert.equal(e.card.concept, id); checkCard(e.card); }
    if (e.kind === 'tabelle') { assert.equal(e.tool.concept, id); checkTool(e.tool); }
    if (e.kind === 'satz') { assert.equal(e.template.concept, id); checkSentence(e.template); }
    if (e.kind === 'werkstatt') {
      assert.ok(WORKSHOPS.includes(e.workshop) && e.workshop.variants[id], `${id}: Werkstatt nicht registriert`);
      assert.equal(e.variant, id, `${id}: variant muss der Begriff selbst sein`);
    }
  }
  assert.deepEqual([...kinds].sort(), ['begriff', 'satz', 'tabelle', 'werkstatt', 'werkzeug']);
});

test('the step card terms are the concept titles of the map', () => {
  assert.deepEqual(streuung.steps.map(s => conceptById[s.concept].title), ['Arithmetisches Mittel', 'Abweichung vom Mittelwert', 'Quadrierte Abweichung', 'Quadratsumme der Abweichungen', 'Korrigierte Stichprobenvarianz', 'Standardabweichung']);
  assert.deepEqual(zusammenhang.steps.map(s => conceptById[s.concept].title), ['Arithmetisches Mittel', 'Abweichung vom Mittelwert', 'Abweichungsprodukt', 'Summe der Abweichungsprodukte', 'Stichprobenkovarianz', 'Pearson-Korrelation']);
  assert.deepEqual(mittel.steps.map(s => conceptById[s.concept].title), ['Summe', 'Arithmetisches Mittel']);
});

const at = <S,>(w: { compute: (d: never) => S; names: readonly string[] }, data: unknown, who: number): Ctx<S> => ({ s: w.compute(data as never), who, names: w.names });

test('Streuung: the approved wording, Gruppe B, Person A', () => {
  const s = streuung.steps, c = at(streuung, [1, 3, 5, 7, 9], 0);
  // Wortlaut des gebilligten Tonbeispiels (Aufgabe F1, Schritt 3), vollständig.
  assert.equal(streuung.mut, 'Die Formel sieht nach viel aus. Sie besteht aber nur aus sechs kleinen Schritten, die du alle schon kannst: zusammenzählen, abziehen, malnehmen, teilen und am Ende die Wurzel ziehen. Das Rechnen übernimmt später R. Hier geht es ums Verstehen.');
  assert.equal(streuung.wofuer, 'Zwei Gruppen mit je fünf Personen sagen, wo sie sich politisch einordnen: von 1 (ganz links) bis 10 (ganz rechts). Beide Gruppen landen im Durchschnitt bei 5. Und doch sind sie ganz verschieden: In Gruppe A sind sich fast alle einig, in Gruppe B gehen die Meinungen weit auseinander. Die Standardabweichung macht diesen Unterschied sichtbar, mit einer einzigen Zahl.');
  // Einzige Abweichung: „; große“ statt „. Große“, weil „Kurz gesagt“ höchstens zwei Sätze hat (Regel 3).
  assert.equal(streuung.variants.sd.kurz, 'Die Standardabweichung sagt dir, wie weit die Antworten typischerweise von der Mitte entfernt sind. Kleine Zahl: alle nah beieinander; große Zahl: weit verstreut.');
  const approved: [string, string, string, string?][] = [
    ['Wir zählen alle fünf Antworten zusammen und teilen durch fünf. So finden wir die Mitte der Gruppe.', 'Gleich messen wir, wie weit jede Person von der Mitte weg ist. Dafür brauchen wir zuerst die Mitte.', 'Hier teilst du durch alle fünf Personen. Das „n − 1“ aus der Formel kommt erst in Schritt 5 dran.', 'Summe aller Werte geteilt durch die Fallzahl n.'],
    ['Für jede Person rechnen wir: ihre Antwort minus die Mitte. Das Ergebnis sagt, wie weit sie weg ist und auf welcher Seite.', 'Streuung bedeutet: Wie weit sind die Leute von der Mitte weg? Genau das messen wir hier, Person für Person.', 'Das Minus darf bleiben, es zeigt die Seite. Kleine Überraschung: Alle Abstände zusammen ergeben immer 0, links und rechts gleichen sich aus.'],
    ['Jeden Abstand nehmen wir mit sich selbst mal. Danach sind alle Zahlen positiv.', 'Zwei Gründe: Plus und Minus heben sich nicht mehr auf. Und wer weit weg ist, zählt stärker, denn 2 wird zu 4, aber 4 wird zu 16.', 'Im Taschenrechner Klammern setzen: (−4)² = 16. Ohne Klammern zeigt er −16. Ein Quadrat ist nie negativ, daran erkennst du den Fehler sofort.'],
    ['Wir zählen die fünf Quadrate zusammen.', 'So steckt die Streuung der ganzen Gruppe in einer Zahl.', 'Zusammengezählt werden die Quadrate, nicht die Abstände. Die Abstände allein ergäben immer 0.', 'Σ ist ein griechisches S und bedeutet: alles zusammenzählen, jede Person genau einmal.'],
    ['Wir teilen die Summe durch die Zahl der Personen minus eins, hier also durch 4.', 'Durch das Teilen werden große und kleine Gruppen vergleichbar. Und warum minus eins? Damit die Streuung nicht zu klein geschätzt wird. Mehr dazu steht unter „Genau genommen“.', 'Wer durch 5 teilt, bekommt 8 statt 10. Das passiert sehr vielen. Merksatz: Bei der Streuung teilst du durch n − 1.'],
    ['Wir ziehen die Wurzel. Damit machen wir das Quadrieren aus Schritt 3 wieder rückgängig.', 'Die 10 aus Schritt 5 ist in „Punkten zum Quadrat“, damit kann niemand etwas anfangen. Nach der Wurzel sind wir wieder in Punkten auf der Skala.', 'Nicht bei der 10 stehen bleiben. Das ist die Varianz. Die Standardabweichung ist ihre Wurzel.'],
  ];
  approved.forEach(([was, warum, acht, fach], k) => {
    assert.equal(txt(s[k].was, c), was, `Schritt ${k + 1} was`); assert.equal(txt(s[k].warum, c), warum, `Schritt ${k + 1} warum`); assert.equal(txt(s[k].acht, c), acht, `Schritt ${k + 1} acht`);
    if (fach) assert.equal(txt(s[k].fach, c), fach, `Schritt ${k + 1} fach`);
  });
  assert.equal(streuung.variants.sd.interpret(at(streuung, [4, 5, 5, 5, 6], 0)).kurz, 'In Gruppe A liegen die Antworten typischerweise nur 0,71 Punkte von der Mitte entfernt: Dort sind sich fast alle einig. In Gruppe B sind es gut 3 Punkte. Gleicher Durchschnitt, ganz andere Gruppe.');
  // Einzahl bei genau 1: s = 1 bei 4 4 5 6 6.
  assert.match(streuung.variants.sd.interpret(at(streuung, [4, 4, 5, 6, 6], 0)).kurz, /typischerweise 1 Punkt von der Mitte/);
  assert.match(streuung.variants.variance.interpret(at(streuung, [4, 4, 5, 6, 6], 0)).kurz, /1 Punkt² groß/);
  assert.match(txt(s[1].rechnung, at(streuung, [4, 4, 5, 6, 6], 0)), /also 1 Punkt links der Mitte/);
  assert.deepEqual(s.map(st => st.title), ['Die Mitte finden', 'Abstände messen', 'Abstände quadrieren', 'Alles zusammenzählen', 'Gerecht teilen', 'Zurück zur Skala']);
  assert.deepEqual(s.map(st => [st.sym, st.say]), [['x̄', 'x quer'], ['xᵢ − x̄', 'x i minus x quer'], ['( )²', 'hoch zwei'], ['Σ', 'Sigma'], ['s²', 's Quadrat'], ['s', 's']]);
  assert.deepEqual(s.map(st => txt(st.check.question, c)), ['Wo liegt die Mitte dieser Gruppe?', 'Wie weit ist Person A von der Mitte weg? Mit Vorzeichen.', 'Was kommt heraus, wenn du (−4) mit sich selbst malnimmst?', 'Wie groß ist die Summe der fünf Quadrate?', 'Was kommt heraus, wenn du die Summe durch 4 teilst?', 'Und jetzt die Wurzel daraus? Zwei Nachkommastellen reichen.']);
  assert.equal(txt(s[4].acht, c), 'Wer durch 5 teilt, bekommt 8 statt 10. Das passiert sehr vielen. Merksatz: Bei der Streuung teilst du durch n − 1.');
  assert.equal(txt(s[5].warum, c), 'Die 10 aus Schritt 5 ist in „Punkten zum Quadrat“, damit kann niemand etwas anfangen. Nach der Wurzel sind wir wieder in Punkten auf der Skala.');
  assert.equal(txt(s[5].acht, c), 'Nicht bei der 10 stehen bleiben. Das ist die Varianz. Die Standardabweichung ist ihre Wurzel.');
  assert.equal(streuung.variants.sd.interpret(c).kurz, 'In Gruppe B liegen die Antworten typischerweise gut 3 Punkte von der Mitte entfernt. In Gruppe A sind es nur 0,71 Punkte: Dort sind sich fast alle einig. Gleicher Durchschnitt, ganz andere Gruppe.');
  assert.match(streuung.mut, /^Die Formel sieht nach viel aus\. Sie besteht aber nur aus sechs kleinen Schritten/);
  assert.match(streuung.variants.sd.kurz, /^Die Standardabweichung sagt dir, wie weit die Antworten typischerweise von der Mitte entfernt sind\./);
});

test('typical wrong answers get their diagnosis (Streuung, Gruppe B)', () => {
  const s = streuung.steps, cA = at(streuung, [1, 3, 5, 7, 9], 0);
  assert.equal(s[0].check.diagnose(cA, 25), 'Fast! Das ist die Summe. Jetzt noch durch 5 teilen.');
  assert.match(s[0].check.diagnose(cA, 6.25)!, /nicht durch n − 1/);
  assert.equal(s[1].check.diagnose(cA, 4), 'Fast! Der Abstand stimmt, nur die Seite nicht. Rechne Antwort minus Mitte.');
  assert.equal(s[2].check.diagnose(cA, -16), 'Fast! Das Minus ist zu viel: Minus mal Minus ergibt Plus. Ein Quadrat ist nie negativ.');
  assert.match(s[2].check.diagnose(cA, 8)!, /mal 2/);
  assert.match(s[3].check.diagnose(cA, 0)!, /Summe der Abstände/);
  assert.equal(s[4].check.diagnose(cA, 8), 'Fast! Du hast durch 5 geteilt. Bei der Streuung teilst du durch 4, also n − 1.');
  assert.match(s[4].check.diagnose(cA, 40)!, /noch die Summe/);
  assert.equal(s[5].check.diagnose(cA, 10), 'Fast! Das ist noch die Zahl vor der Wurzel.');
  assert.ok(close(s[5].check.answer(cA) as number, 3.16));
});

test('typical wrong answers get their diagnosis (Mittel and Zusammenhang)', () => {
  const m = at(mittel, [1, 3, 5, 7, 9], 0);
  assert.match(mittel.steps[0].check.diagnose(m, 24)!, /Fehlt eine Person/); assert.match(mittel.steps[0].check.diagnose(m, 34)!, /doppelt/);
  assert.match(mittel.steps[1].check.diagnose(m, 25)!, /Summe/); assert.match(mittel.steps[1].check.diagnose(m, 6.25)!, /nicht durch n − 1/);
  const z = at(zusammenhang, { x: [2, 3, 4, 5, 6], y: [2, 5, 3, 6, 4] }, 1), st = zusammenhang.steps;
  assert.equal(st[2].check.answer(z), -1);
  assert.match(st[2].check.diagnose(z, 1)!, /Vorzeichen/); assert.match(st[2].check.diagnose(z, 0)!, /Summe der beiden Abstände/);
  assert.match(st[3].check.diagnose(z, 7)!, /negativen Produkte positiv/);
  assert.match(st[4].check.diagnose(z, 1)!, /durch 5 geteilt/); assert.match(st[4].check.diagnose(z, 5)!, /Summe/);
  assert.match(st[5].check.diagnose(z, 1.25 / (2 * Math.sqrt(2.5)))!, /nicht die Summe/);
  assert.match(st[5].check.diagnose(z, 0.2)!, /nicht die Varianzen/); assert.match(st[5].check.diagnose(z, 1.25)!, /noch die Kovarianz/);
  const flat4 = at(zusammenhang, { x: [2, 3, 4, 5, 6], y: [4, 4, 4, 4, 4] }, 0);
  assert.equal(st[5].check.answer(flat4), 'NA');
});

test('Formel als Satz and Werkzeug: Standardfehler and Rekodieren texts and checks', () => {
  const s = standardfehler.compute(standardfehler.initial);
  assert.ok(close(s.se, 0.013, 5e-4)); assert.ok(close(s.lo, 3.27)); assert.ok(close(s.hi, 3.32));
  assert.match(standardfehler.check.diagnose(0.01), /^Fast! Du hast durch n geteilt/); assert.match(standardfehler.check.diagnose(10), /Andersherum/); assert.match(standardfehler.check.diagnose(1), /noch s selbst/);
  assert.match(standardfehler.check.diagnose(7), /^Noch nicht ganz\./);
  const rev = parseRules('rev', rekodieren.scale), code2 = rekodieren.codes[1];
  assert.equal(rekodieren.check.answer(rev, code2), 4);
  assert.match(rekodieren.check.diagnose(rev, code2, 2), /^Fast! Das ist noch der alte Code/);
  assert.match(rekodieren.check.diagnose(rev, code2, 3), /^Noch nicht ganz\./);
  const walk = rekodieren.walk(parseRules('1:2=1; 3:5=0', rekodieren.scale), rekodieren.codes[3]);
  assert.deepEqual(walk.lines.slice(1), ['Regel 1 (1:2=1) passt nicht.', 'Regel 2 (3:5=0) passt.', 'Neuer Code: 0.']);
  assert.equal(walk.kurz, 'Aus 4 wird 0.');
  assert.equal(rekodieren.warnUnmatched([rekodieren.codes[2]]).r, '1 value of `pa02a` matched no rule and became "NA": 3.');
  for (const preset of rekodieren.presets) {
    const p = parseRules(preset.rule, rekodieren.scale);
    rekodieren.describe(p).forEach(d => clean('Regel', d.text));
    rekodieren.codes.forEach(c => { const w = rekodieren.walk(p, c); w.lines.forEach(l => clean('Durchlauf', l)); clean('Durchlauf kurz', w.kurz, KURZ); });
  }
  clean('rec wofür', rekodieren.wofuer); clean('rec kurz', rekodieren.kurz, KURZ); clean('rec Mut', rekodieren.mut, SHORT); clean('rec Aufgepasst', rekodieren.fehler);
  clean('rec genau', rekodieren.genau.kurz, KURZ); rekodieren.genau.paragraphs.forEach(p => clean('rec genau', p));
  rekodieren.think.forEach(q => { clean('rec Denkfrage', q.question); clean('rec Denkfrage', q.explain); clean('rec Denkfrage kurz', q.kurz, KURZ); });
  assert.match(rekodieren.rCode('rev'), /mutate\(interesse = rec\(pa02a, rules = "rev"\)\) %>%\n  frequency\(interesse\)/);
});

test('registry: explanations, step cards with context and the step request', () => {
  for (const id of ['mean', 'variance', 'sd', 'covariance', 'pearson']) assert.equal(explainFor(id)?.kind, 'werkstatt', id);
  assert.equal(explainFor('se')?.kind, 'satz'); assert.equal(explainFor('recode')?.kind, 'werkzeug');
  assert.equal(explainFor('p_value')?.kind, 'begriff'); assert.equal(explainFor('dummy')?.kind, 'tabelle');
  assert.equal(explainFor('median'), null); assert.equal(tabsFor('median'), null);
  assert.equal(stepCardFor('deviation')?.workshop.id, 'streuung');
  assert.equal(stepCardFor('deviation', 'pearson')?.workshop.id, 'zusammenhang');
  assert.deepEqual([stepCardFor('ss', 'variance')?.variant, stepCardFor('ss')?.variant, stepCardFor('ss')?.step], ['variance', 'sd', 4]);
  assert.deepEqual([stepCardFor('crossproduct_sum', 'covariance')?.variant, stepCardFor('sd_product')?.step], ['covariance', 6]);
  assert.equal(stepCardFor('sum')?.workshop.id, 'mittel'); assert.equal(stepCardFor('median'), null);
  requestStep('sd', 3); assert.equal(takeStep('variance'), null); assert.equal(takeStep('sd'), 3); assert.equal(takeStep('sd'), null);
  assert.equal(new Set(WORKSHOPS.map(w => w.id)).size, WORKSHOPS.length, 'Werkstatt-Kennungen sind eindeutig');
});

test('registry: duplicate concept ids between areas throw while loading', () => {
  const card = (explainFor('p_value') as { kind: 'begriff'; card: ConceptCard }).card;
  const area = (id: string) => ({ explanations: { [id]: { kind: 'begriff' as const, card } }, tabs: {} });
  const none = { ids: [] as string[], workshops: [] };
  assert.throws(() => mergeAreas({ b01: area('validity'), b02: area('validity') }, none), /„validity“.*doppelt.*b01 und b02/);
  assert.throws(() => mergeAreas({ b03: area('sd') }, { ids: ['sd'], workshops: [] }), /„sd“.*pilot und b03/);
  const ws = { ...streuung };
  assert.throws(() => mergeAreas({ b04: { explanations: { sd: { kind: 'werkstatt', workshop: ws, variant: 'sd' } }, tabs: {} } }, { ids: [], workshops: [streuung] }), /Werkstatt „streuung“ ist doppelt/);
  assert.throws(() => mergeAreas({ b04: { explanations: { z: { kind: 'werkstatt', workshop: ws, variant: 'sd' } }, tabs: {} } }, none), /„z“.*variant: 'z'/);
  assert.throws(() => mergeAreas({ b12: { explanations: {}, tabs: {}, stepCards: { add: { workshop: 'gibtsnicht', variant: 'x', step: 1 } } } }, none), /unbekannte Werkstatt/);
  // Schrittkarten: Begriff, Schritt und Sprungziel müssen passen.
  const pilot = { ids: [], workshops: [streuung], explanations: { sd: { kind: 'werkstatt' as const, workshop: streuung, variant: 'sd' }, variance: { kind: 'werkstatt' as const, workshop: streuung, variant: 'variance' } } };
  const step = (variant: string, n: number) => ({ b12: { explanations: {}, tabs: {}, stepCards: { add: { workshop: 'streuung', variant, step: n } } } });
  assert.throws(() => mergeAreas(step('sdd', 1), pilot), /erklärt keinen Begriff „sdd“/);
  assert.throws(() => mergeAreas(step('variance', 6), pilot), /Schritt 6 gibt es nicht.*1 bis 5/);
  assert.throws(() => mergeAreas(step('sd', 0), pilot), /Schritt 0 gibt es nicht/);
  assert.throws(() => mergeAreas(step('sd', 2), { ...pilot, explanations: {} }), /nicht als Werkstatt „streuung“ registriert/);
  assert.equal(mergeAreas(step('variance', 5), pilot).stepCards.add.step, 5);
  const next = { next: { id: 'sd', why: 'weil' }, before: [], after: [] };
  assert.throws(() => mergeAreas({ b01: area('validity'), b02: { explanations: {}, tabs: { validity: { next } } } }, none), /gehören zu b01, nicht zu b02/);
  assert.throws(() => mergeAreas({ b01: { explanations: {}, tabs: { sd: { next } } } }, { ids: ['sd'], tabs: ['sd'], workshops: [] }), /liefert der Pilot/);
  // Reiter für eine Pilot-Schrittkarte (ss) darf ein Bereich vergeben, aber nur einer.
  const ok = mergeAreas({ b04: { explanations: {}, tabs: { ss: { next } } } }, { ids: ['ss'], tabs: ['sd'], workshops: [] });
  assert.ok(ok.tabs.ss);
  assert.throws(() => mergeAreas({ b04: { explanations: {}, tabs: { ss: { next } } }, b05: { explanations: {}, tabs: { ss: { next } } } }, { ids: ['ss'], workshops: [] }), /doppelt vergeben: b04 und b05/);
  const merged = mergeAreas({ b01: area('validity'), b02: { explanations: {}, tabs: {}, stepCards: { add: { workshop: 'streuung', variant: 'sd', step: 1 } } } }, { ...pilot });
  assert.deepEqual([Object.keys(merged.explanations), merged.stepCards.add.workshop], [['validity'], 'streuung']);
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

test('Formel als Satz and Werkzeug: all label texts are clean and linked concepts exist', () => {
  standardfehler.glyphs.forEach(g => { if (g.concept) concept('SE', g.concept); clean('SE Zeichen', g.term); clean('SE Zeichen', g.plain); });
  rekodieren.terms.forEach(t => { if (t.concept) concept('rec', t.concept); clean('rec Begriff', t.plain); });
  rekodieren.signs.forEach(x => { clean('rec Zeichen', x.plain); clean('rec Zeichen', x.say); });
  rekodieren.terms.forEach(t => clean('rec Begriff', t.term));
  rekodieren.presets.forEach(p => clean('rec Voreinstellung', p.label));
  rekodieren.codes.forEach((_, i) => clean('rec Frage', rekodieren.check.question(rekodieren.check.codeFor(i))));
  rekodieren.think.forEach(q => q.options.forEach(o => clean('rec Antwort', o)));
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
});
