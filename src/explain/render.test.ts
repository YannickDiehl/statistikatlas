import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { conceptById } from '../domain/concepts';
import { Formelwerkstatt, mergePictures, PICTURES, StepCard } from '../components/explain/Formelwerkstatt';
import { FormelAlsSatz } from '../components/explain/FormelAlsSatz';
import { Werkzeug } from '../components/explain/Werkzeug';
import { Begriffskarte } from '../components/explain/Begriffskarte';
import { TabellenWerkzeug } from '../components/explain/TabellenWerkzeug';
import { Explanation, EXPLAIN_LABEL } from '../components/explain/Explanation';
import { AreaUnder, Axis, Bar, Curve, DragPoint, forCard, forSentence, forTable, forWorkshop, GridCell, linear, MarkLine } from '../components/explain/pictures/kit';
import { pictureFor } from '../components/explain/pictures/register';
import { EXPLANATIONS, explainFor, STEP_CARD_IDS, stepCardFor, WORKSHOPS } from './registry';
import { standardfehler } from './content/standardfehler';
import { rekodieren } from './content/rekodieren';
import { pWert } from './content/muster/p-wert';
import { dummy } from './content/muster/dummy';
import { modeStore } from './mode';
import { ConceptInspector } from '../components/ConceptInspector';
import { forgetTabs, kurzOf, tabList } from '../components/explain/ExplainTabs';
import { TAB_IDS, tabsFor } from './registry';
import { applyOp } from './sample';
import { columnById, createSurvey, defaultSelection, projectPairs, type ColumnSelection, type SurveyRow } from '../domain/survey';
import { lessonContext, ref } from '../domain/learning';

const noop = () => {};
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
const sound = (html: string, label: string) => assert.ok(!/NaN|undefined|Infinity|\[object/.test(text(html)), `${label}: kaputter Wert`);
const both = (render: () => string) => {
  try { modeStore.set('ausfuehrlich'); const full = render(); modeStore.set('kompakt'); return { full, compact: render() }; }
  finally { modeStore.set('ausfuehrlich'); }
};

test('every workshop variant renders the new learn card in Ausführlich and fewer blocks in Kompakt', () => {
  for (const w of WORKSHOPS) for (const variant of Object.keys(w.variants)) {
    const { full, compact } = both(() => renderToStaticMarkup(createElement(Formelwerkstatt, { workshop: w, variant, onConcept: noop })));
    sound(full, `${w.id}/${variant}`);
    const t = text(full), step = w.steps[0];
    for (const part of ['Wofür?', 'Kurz gesagt', w.mut, `Schritt 1 von ${w.variants[variant].lastStep}`, step.title, 'Was passiert?', 'Rechnung', 'Das nennt man', conceptById[step.concept].title,
      'In der Fachsprache', 'Warum?', 'Aufgepasst', 'Die Rechentabelle', 'Das Bild dazu', 'Probier es selbst', 'Nachsehen', 'Was heißt das Ergebnis?', 'Mit der Formel denken', 'Genau genommen', 'Alle Zeichen auf einen Blick'])
      assert.ok(t.includes(part), `${w.id}/${variant}: „${part}“ fehlt`);
    assert.match(t, /noch \d+ kleine Schritte|noch 1 kleiner Schritt/, `${w.id}/${variant}: Fortschritt fehlt`);
    assert.ok(full.includes('class="xw-mut"'), `${w.id}/${variant}: Mut-Kasten fehlt`);
    assert.ok(full.includes('<details class="xw-glyphs">') && !full.includes('<details class="xw-glyphs" open'), `${w.id}/${variant}: Zeichenübersicht nicht zugeklappt`);
    assert.ok(t.indexOf('Alle Zeichen auf einen Blick') > t.indexOf('Genau genommen'), `${w.id}/${variant}: Zeichenübersicht steht nicht am Ende`);
    assert.ok(full.includes('role="img"') && full.includes(`aria-label="${w.variants[variant].aria}"`), `${w.id}/${variant}: vorlesbare Formel fehlt`);
    w.steps.slice(0, w.variants[variant].lastStep).forEach((st, i) => assert.ok(t.includes(`Schritt ${i + 1} ${st.title} ${st.button}`), `${w.id}/${variant}: Schrittknopf ${i + 1} zeigt nicht Schritt, Titel und Zeichen`));
    const c = text(compact);
    for (const part of ['Kurz gesagt', 'Was passiert?', 'Rechnung', 'Das nennt man', 'Das Bild dazu']) assert.ok(c.includes(part), `${w.id}/${variant} kompakt: „${part}“ fehlt`);
    for (const part of ['Die Rechentabelle', 'Probier es selbst', 'Mit der Formel denken', 'Warum?', 'Aufgepasst', 'Wie im Alltag']) assert.ok(!c.includes(part), `${w.id}/${variant} kompakt: „${part}“ sollte fehlen`);
  }
});

test('every picture key of every explanation is in the register with the right kind, and keys are unique', () => {
  for (const w of WORKSHOPS) assert.equal(PICTURES[w.picture]?.kind, 'werkstatt', `${w.id}: Bild „${w.picture}“ fehlt in PICTURES oder ist kein Werkstattbild (forWorkshop)`);
  for (const [id, e] of Object.entries(EXPLANATIONS)) {
    const key = e.kind === 'begriff' ? e.card.picture : e.kind === 'satz' ? e.template.picture : e.kind === 'tabelle' ? e.tool.picture : undefined;
    const maker = { begriff: 'forCard', satz: 'forSentence', tabelle: 'forTable' }[e.kind as string];
    if (key !== undefined) assert.equal(PICTURES[key]?.kind, e.kind, `${id}: Bild „${key}“ fehlt in PICTURES oder ist nicht mit ${maker} gebaut`);
  }
  assert.deepEqual(['mittel', 'streuung', 'zusammenhang'].filter(k => !PICTURES[k]), []);
  assert.equal(pictureFor('mittel', 'begriff'), null, 'falsche Art liefert kein Bild');
  assert.equal(pictureFor('gibtsnicht', 'werkstatt'), null);
  assert.throws(() => mergePictures({ pilot: { a: forWorkshop(() => null) }, b05: { a: forCard(() => null) } }), /Bild „a“ ist doppelt vergeben: pilot und b05/);
});

test('pictures show in every template: card with its slider value, sentence with its values, table with before and after', () => {
  // Begriffskarte: das echte Bild des p-Werts, gesteuert vom Regler.
  const card = text(renderToStaticMarkup(createElement(Begriffskarte, { card: pWert, onConcept: noop })));
  assert.ok(card.includes('Das Bild dazu') && card.includes('Markierte Fläche: p ≈ 0,88') && card.includes('t, wenn es keinen Unterschied gäbe'), 'Bild der Begriffskarte fehlt');
  assert.ok(card.indexOf('Das Bild dazu') < card.indexOf('Das nennt man') && card.indexOf(pWert.regler!.label) < card.indexOf('Das nennt man'), 'Bild und Regler stehen nach „Stell dir vor“');
  assert.equal(card.split(pWert.regler!.label).length, 2, 'der Regler steht nur einmal da');
  // Formel als Satz und Tabellen-Werkzeug mit vorübergehend eingetragenen Bildern.
  PICTURES['test-satz'] = forSentence(p => createElement('svg', { 'aria-label': `Satzbild ${p.mark} ${p.values.n} ${typeof p.s.se}` }));
  PICTURES['test-tabelle'] = forTable(p => createElement('svg', { 'aria-label': `Tabellenbild ${p.option} ${p.before.rows.length} ${p.after.columns.length}` }));
  try {
    const se = renderToStaticMarkup(createElement(FormelAlsSatz, { template: { ...standardfehler, picture: 'test-satz' }, onConcept: noop }));
    assert.ok(se.includes('aria-label="Satzbild s 5225 number"'), 'Bild der Formel als Satz fehlt');
    const tool = renderToStaticMarkup(createElement(TabellenWerkzeug, { tool: { ...dummy, picture: 'test-tabelle' }, onConcept: noop }));
    assert.ok(tool.includes('aria-label="Tabellenbild 0 5 6"'), 'Bild des Tabellen-Werkzeugs fehlt');
    assert.ok(!renderToStaticMarkup(createElement(FormelAlsSatz, { template: { ...standardfehler, picture: 'test-tabelle' }, onConcept: noop })).includes('Tabellenbild'), 'Bild der falschen Art erscheint nicht');
  } finally { delete PICTURES['test-satz']; delete PICTURES['test-tabelle']; }
});

test('step cards name their term and offer the jump into their workshop', () => {
  const html = text(renderToStaticMarkup(createElement(StepCard, { card: stepCardFor('deviation', 'pearson')!, current: 'deviation', onConcept: noop, onOpen: noop })));
  assert.ok(html.includes('Abweichung vom Mittelwert') && html.includes('Ist Schritt 2 von 6 der Werkstatt Pearson-Korrelation'));
  assert.ok(html.includes('Abstände messen') && html.includes('Das nennt man'));
  assert.ok(!html.includes('Begriff öffnen'), 'Schrittkarte verlinkt nicht auf sich selbst');
  modeStore.set('kompakt');
  try { assert.ok(text(renderToStaticMarkup(createElement(StepCard, { card: stepCardFor('ss')!, current: 'ss', onConcept: noop, onOpen: noop }))).includes('Aufgepasst'), 'Schrittkarte bleibt vollständig'); }
  finally { modeStore.set('ausfuehrlich'); }
  const ss = text(renderToStaticMarkup(createElement(StepCard, { card: stepCardFor('ss')!, current: 'ss', onConcept: noop, onOpen: noop })));
  assert.ok(ss.includes('Quadratsumme der Abweichungen') && ss.includes('Ist Schritt 4 von 6 der Werkstatt Standardabweichung'));
});

test('every registered step card renders for every anchor and opens a registered workshop concept', () => {
  assert.ok(STEP_CARD_IDS.length >= 8);
  for (const id of STEP_CARD_IDS) for (const anchor of [undefined, 'variance', 'covariance', 'pearson']) {
    const card = stepCardFor(id, anchor);
    assert.ok(card, `${id}: keine Schrittkarte`);
    const v = card.workshop.variants[card.variant];
    assert.ok(v && card.step >= 1 && card.step <= v.lastStep, `${id}: Schritt ${card.step} passt nicht zu ${card.variant}`);
    const target = explainFor(card.variant);
    assert.ok(target?.kind === 'werkstatt' && target.workshop === card.workshop, `${id}: Sprungziel ${card.variant} ist nicht diese Werkstatt`);
    const html = renderToStaticMarkup(createElement(StepCard, { card, current: id, onConcept: noop, onOpen: noop }));
    sound(html, `Schrittkarte ${id}`);
    assert.ok(text(html).includes(card.workshop.steps[card.step - 1].title) && text(html).includes('Werkstatt öffnen'), `${id}: Schrittkarte unvollständig`);
  }
});

test('Formel als Satz and Werkzeug render their blocks in the new tone', () => {
  assert.equal(explainFor('se')?.kind, 'satz');
  const se = renderToStaticMarkup(createElement(FormelAlsSatz, { template: standardfehler, onConcept: noop }));
  sound(se, 'se');
  for (const part of ['Als Satz gelesen', 'Ein Regler je Zeichen', 'Vorgerechnet', 'Aufgepasst', 'Probier es selbst', 'Genau genommen', 'Alle Zeichen auf einen Blick', 'Das nennt man', '0,013']) assert.ok(text(se).includes(part), `se: „${part}“ fehlt`);
  const rec = renderToStaticMarkup(createElement(Werkzeug, { template: rekodieren, onConcept: noop }));
  sound(rec, 'recode');
  for (const part of ['Die Fachbegriffe', 'Die Zeichen der Regel', 'So liest rec() deine Regel', 'Vorher und nachher', 'rules = "rev"', 'Aus 4 wird 2.', '3,3', 'Aufgepasst', 'Probier es selbst', rekodieren.mut])
    assert.ok(text(rec).includes(part), `recode: „${part}“ fehlt`);
});

test('Begriffskarte (p-Wert) renders all parts in Ausführlich and the short form in Kompakt', () => {
  const { full, compact } = both(() => renderToStaticMarkup(createElement(Begriffskarte, { card: pWert, onConcept: noop })));
  sound(full, 'p_value');
  const t = text(full);
  for (const part of ['Wofür?', 'Kurz gesagt', 'Stell dir vor …', '0,88', 'Das nennt man', 'p-Wert', 'In der Fachsprache', 'Schritt 1 von 3', pWert.bausteine[0].title, 'Was passiert?', 'Warum?', 'Aufgepasst',
    'Ausprobieren', pWert.regler!.label, pWert.regler!.describe(pWert.regler!.initial), 'Probier es selbst', pWert.check.options[1], 'Was heißt das für dich?', 'Genau genommen'])
    assert.ok(t.includes(part), `p_value: „${part}“ fehlt`);
  assert.ok(t.includes(`${conceptById.hypothesis.title} öffnen`), 'Bausteine verlinken ihren Begriff');
  const c = text(compact);
  for (const part of ['Kurz gesagt', 'Stell dir vor …', 'Das nennt man', 'Was passiert?', 'Was heißt das für dich?']) assert.ok(c.includes(part), `p_value kompakt: „${part}“ fehlt`);
  for (const part of ['Ausprobieren', 'Probier es selbst', 'Aufgepasst', 'Genau genommen']) assert.ok(!c.includes(part), `p_value kompakt: „${part}“ sollte fehlen`);
});

test('Tabellen-Werkzeug (Dummy) renders before, steps, after and the R call', () => {
  const { full, compact } = both(() => renderToStaticMarkup(createElement(TabellenWerkzeug, { tool: dummy, onConcept: noop })));
  sound(full, 'dummy');
  const t = text(full);
  for (const part of ['Wofür?', 'Kurz gesagt', dummy.mut!, 'Vorher', 'Schritt für Schritt', 'Eine Vergleichsgruppe wählen', 'Das nennt man', 'Dummyvariablen', 'Nachher', 'haupt', 'abitur',
    'So sieht es in R aus', 'mutate(', 'rec(schulabschluss, rules = "1=1; 0,2,3,4=0")', 'Probier es selbst', 'Mitdenken', 'Genau genommen'])
    assert.ok(t.includes(part), `dummy: „${part}“ fehlt`);
  assert.ok(!/\bohne\s+=\s+rec/.test(t), 'die Vergleichsgruppe bekommt keine eigene Spalte');
  assert.ok(full.includes('<th scope="col" class="on">haupt</th>'), 'neue Spalten sind hervorgehoben');
  assert.ok(t.includes('Deine Wahl: Ohne Schulabschluss. Neue Spalten: haupt, mittel, fhr, abitur.'), 'Zusammenfassung der Wahl fehlt');
  assert.ok(!/aria-live="polite"><div class="xw-table-wrap"/.test(full), 'die Tabelle selbst wird nicht vorgelesen');
  const first = t.slice(t.indexOf('Eine Vergleichsgruppe wählen'), t.indexOf('Für jede andere Gruppe'));
  assert.ok(first.includes('In der Fachsprache') && !first.includes('Das nennt man'), 'ohne Begriff und Zeichen kein „Das nennt man“');
  const c = text(compact);
  for (const part of ['Kurz gesagt', 'Vorher', 'Nachher', 'So sieht es in R aus']) assert.ok(c.includes(part), `dummy kompakt: „${part}“ fehlt`);
  for (const part of ['Probier es selbst', 'Mitdenken', 'Genau genommen']) assert.ok(!c.includes(part), `dummy kompakt: „${part}“ sollte fehlen`);
});

test('Tabellen-Werkzeug: numbers in the data tables are German (comma, true minus), texts stay as written (IB8)', () => {
  const tool = { ...dummy, columns: [{ key: 'person', label: 'Person' }, { key: 'zeit', label: 'Lernzeit' }, { key: 'code', label: 'Code' }],
    rows: [{ person: 'P001', zeit: 8.3, code: -9 }, { person: 'P002', zeit: 6, code: 'NA(a)' }, { person: 'P003', zeit: 3850, code: null }, { person: 'P004', zeit: 12345.5, code: 1 }, { person: 'P005', zeit: 0.25, code: 2 }],
    apply: (rows: typeof dummy.rows) => ({ columns: [{ key: 'person', label: 'Person' }, { key: 'zeit', label: 'Lernzeit' }], rows }) };
  const cells = [...renderToStaticMarkup(createElement(TabellenWerkzeug, { tool, onConcept: noop })).matchAll(/<t[dh][^>]*>([^<]*)<\/t[dh]>/g)].map(m => m[1]);
  for (const part of ['8,3', '−9', 'NA(a)', 'NA', '3850', '12.345,5', '0,25']) assert.ok(cells.includes(part), `Zelle „${part}“ fehlt`);
  assert.ok(!cells.some(c => /^-|\d\.\d/.test(c) && c !== '12.345,5'), `Dezimalpunkt oder Bindestrich-Minus in einer Zelle: ${cells.join(' | ')}`);
});

test('every registered explanation renders through Explanation in Ausführlich and Kompakt without broken values', () => {
  for (const [id, explain] of Object.entries(EXPLANATIONS)) {
    const { full, compact } = both(() => renderToStaticMarkup(createElement(Explanation, { id, explain, onConcept: noop })));
    for (const [mode, html] of [['ausführlich', full], ['kompakt', compact]]) {
      sound(html, `${id} ${mode}`);
      assert.ok(text(html).includes('Kurz gesagt'), `${id} ${mode}: Kurz gesagt fehlt`);
    }
    assert.ok(text(compact).length < text(full).length, `${id}: Kompakt ist nicht kürzer`);
    assert.ok(EXPLAIN_LABEL[explain.kind]);
  }
});

test('the data note counts the example people or uses the workshop note', () => {
  const mittel = WORKSHOPS.find(w => w.id === 'mittel')!;
  assert.ok(text(renderToStaticMarkup(createElement(Formelwerkstatt, { workshop: mittel, variant: 'mean', onConcept: noop }))).includes('Fünf Beispielpersonen. Die Punkte im Bild lassen sich ziehen.'));
  const six = { ...mittel, names: ['A', 'B', 'C', 'D', 'E', 'F'], presets: [{ id: 'x', label: 'Sechs Werte', data: [1, 2, 3, 4, 5, 6] }] };
  assert.ok(text(renderToStaticMarkup(createElement(Formelwerkstatt, { workshop: six, variant: 'mean', onConcept: noop }))).includes('Sechs Beispielpersonen.'));
  const own = { ...mittel, dataNote: 'Zwei Gruppen aus dem Lehrdatensatz.' };
  assert.ok(text(renderToStaticMarkup(createElement(Formelwerkstatt, { workshop: own, variant: 'mean', onConcept: noop }))).includes('Zwei Gruppen aus dem Lehrdatensatz.'));
});

test('picture kit: building blocks draw in screen pixels and keep the slider role', () => {
  const x = linear([0, 10], [40, 440]), y = linear([0, 1], [200, 20]);
  assert.equal(x(5), 240); assert.equal(x.invert(240), 5); assert.equal(y(0.5), 110);
  const svg = renderToStaticMarkup(createElement('svg', null,
    createElement(Axis, { scale: x, ticks: [0, 5, 10], at: 200, from: 40, to: 440, title: 'Stunden' }),
    createElement(Axis, { scale: y, ticks: [0, 1], at: 40, from: 20, to: 200, orient: 'left' }),
    createElement(Bar, { x: 40, y: 50, width: 120, height: 16, tone: 'neg', label: 'Minusflächen −3' }),
    createElement(Curve, { f: v => Math.exp(-v), from: 0, to: 10, x, y }),
    createElement(AreaUnder, { f: v => Math.exp(-v), from: 8, to: 10, x, y }),
    createElement(MarkLine, { x: x(5), from: 20, to: 200, label: 'x̄ = 5' }),
    createElement(GridCell, { x: 0, y: 0, w: 60, h: 40, text: '12', sub: 'erwartet 9', tone: 'pos' }),
    createElement(DragPoint, { x: 100, y: 100, label: 'Person A', selected: true, bounds: { min: 1, max: 10 }, valueNow: 4, onPointerDown: noop, onKeyDown: noop, children: 'A' })));
  sound(svg, 'kit');
  for (const part of ['role="slider"', 'aria-valuenow="4"', 'r="20"', 'class="xw-area-pos"', 'class="xw-curve"', 'class="xw-bar-neg"', 'class="xw-cell xw-cell-pos"', 'Stunden', 'erwartet 9', 'x̄ = 5'])
    assert.ok(svg.includes(part), `Baukasten: „${part}“ fehlt`);
  assert.ok(!/font-size="?\d/.test(svg), 'Schriftgrößen kommen aus dem CSS (mindestens 13 px), nicht aus Attributen');
});

// ---------- Reiter (Aufgabe F3) ----------

const surveyRows = createSurvey();
const inspector = (id: string, opts: { rows?: SurveyRow[]; selection?: ColumnSelection } = {}) => {
  const selection = opts.selection ?? defaultSelection, rows = opts.rows ?? surveyRows;
  const context = lessonContext(projectPairs(rows, selection), 'P002', 'covariance', { x: columnById[selection.x], y: columnById[selection.y] }, selection.likertMetric);
  return renderToStaticMarkup(createElement(ConceptInspector, {
    selected: ref(id), context, selection, rows, onColumns: noop, onData: noop, onRows: noop, highlight: null, onHighlight: noop, onSelect: noop, onHover: noop, onClose: noop,
    onFocusMap: noop, onCase: noop, onPairs: noop, onReset: noop, resetRevision: 0, onVariable: noop, onRoute: noop, trace: false, onTrace: noop,
    experimentOpen: false, experimentRequest: 0, onExperimentFocused: noop, onExperiment: noop,
  }));
};
/** Text ohne Tags und ohne zusätzliche Leerzeichen, für Code, in dem jedes Zeichen ein eigener Knopf ist. */
const plain = (html: string) => html.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
/** Beschriftungen der Reiter (die Klammer steht in einem eigenen span, damit sie beim Umbruch zusammenbleibt). */
const tabNames = (html: string) => [...html.matchAll(/role="tab"[^>]*>(.*?)<\/button>/g)].map(m => m[1].replace(/<[^>]+>/g, ''));
const panelOf = (html: string, id: string, tab: string) => {
  const start = html.indexOf(`id="xp-${id}-${tab}"`), next = html.indexOf('role="tabpanel"', html.indexOf('>', start));
  return start < 0 ? '' : html.slice(start, next < 0 ? undefined : next);
};

test('tabs: four for sd, three for recode, Weiter for every concept with tabs, named after their template', () => {
  forgetTabs();
  const expected: Record<string, string[]> = {
    sd: ['Verstehen (5 Personen)', 'Mit 200 Befragten', 'In R', 'Weiter'],
    mean: ['Verstehen (5 Personen)', 'Mit 200 Befragten', 'In R', 'Weiter'],
    pearson: ['Verstehen (5 Personen)', 'Mit 200 Befragten', 'In R', 'Weiter'],
    se: ['Verstehen', 'Mit 200 Befragten', 'In R', 'Weiter'],
    recode: ['Werkzeug', 'In R', 'Weiter'],
    p_value: ['Verstehen', 'Mit 200 Befragten', 'In R', 'Weiter'],
    dummy: ['Werkzeug', 'Mit 200 Befragten', 'In R', 'Weiter'],
  };
  for (const [id, names] of Object.entries(expected)) assert.deepEqual(tabNames(inspector(id)), names, id);
  for (const id of TAB_IDS) {
    const { full, compact } = both(() => inspector(id));
    sound(full, `${id} Reiter`);
    const names = tabNames(full), tabs = tabsFor(id)!;
    assert.deepEqual(names, tabList(explainFor(id), tabs).map(t => t.label), id);
    assert.equal(names.at(-1), 'Weiter', `${id}: Reiter „Weiter“ fehlt`);
    assert.deepEqual(tabNames(compact), names, `${id}: Kompakt zeigt andere Reiter`);
    assert.ok(text(compact).length < text(full).length, `${id}: Kompakt ist nicht kürzer`);
    // ARIA-Muster „Tabs“: ein gewählter Reiter mit Fokus, alle Panels eingehängt, nur eines sichtbar.
    assert.equal((full.match(/role="tablist"/g) ?? []).length, 1);
    assert.equal((full.match(/aria-selected="true"/g) ?? []).length, 1);
    assert.match(full, new RegExp(`id="xt-${id}-verstehen" role="tab" aria-selected="true" aria-controls="xp-${id}-verstehen" tabindex="0"`));
    const panels = [...full.matchAll(/role="tabpanel"[^>]*>/g)].map(m => m[0]);
    assert.equal(panels.length, names.length, `${id}: nicht alle Panels eingehängt`);
    assert.equal(panels.filter(p => !p.includes('hidden')).length, 1, `${id}: mehr als ein Panel sichtbar`);
    // Kurz gesagt steht über den Reitern und nur einmal da.
    const kurz = kurzOf(explainFor(id));
    if (kurz) {
      assert.ok(full.indexOf(kurz.text.slice(0, 40)) < full.indexOf('role="tablist"'), `${id}: Kurz gesagt steht nicht über den Reitern`);
      assert.equal(full.split(kurz.text.slice(0, 40)).length, 2, `${id}: Kurz gesagt doppelt`);
    }
    assert.ok(text(panelOf(full, id, 'weiter')).includes('Als Nächstes'), `${id}: Weiter ohne Als Nächstes`);
  }
});

test('tabs: the pilot contents in each tab of the standard deviation', () => {
  const html = inspector('sd'), t = (tab: string) => text(panelOf(html, 'sd', tab));
  for (const part of ['Wofür?', 'Die Mitte finden', 'Das Bild dazu', 'Weiter mit 200 Befragten']) assert.ok(t('verstehen').includes(part), `Verstehen: „${part}“ fehlt`);
  for (const part of ['Dieselbe Formel wie mit fünf Personen, jetzt mit allen 200 Befragten des Lehrdatensatzes.', 'Mit welcher Variable?', 'Wie viele Stunden haben Sie',
    'Standardabweichung s', '3,24 h', 'Vorgerechnet für Person', 'Ihr Beitrag ist in Formel und Bild markiert.', 'Schritt 1 für alle 200', 'Vorgerechnet für P002',
    'Was heißt das Ergebnis?', '141 von 200 Befragten lernen zwischen 4,51 und 10,99 Stunden.', 'Voraussetzung', 'Erst tippen, dann ausprobieren', 'Die Rechnung als Baukasten entfalten'])
    assert.ok(t('sample').includes(part), `Mit 200 Befragten: „${part}“ fehlt`);
  assert.match(panelOf(html, 'sd', 'sample'), /class="xw-fp xw-who"/, 'der Summand der gewählten Person ist umrahmt');
  for (const part of ['In R rechnet mariposa dieselbe Zahl.', 'Lehrdatensatz als SPSS-Datei (.sav)', 'auch als CSV', 'describe(lernzeit, show = c("mean", "sd", "var"))', 'Descriptive Statistics',
    'R schreibt Punkt statt Komma', 'Kurz prüfen', 'Welche Zahl in der Ausgabe ist s?', 'Anderer Aufruf', 'w_sd(lernzeit)', 'Aufruf kopieren', 'R-Skript', 'Weitere Funktionen und Hilfe', '?mariposa::describe'])
    assert.ok(plain(panelOf(html, 'sd', 'r')).includes(part), `In R: „${part}“ fehlt`);
  assert.match(panelOf(html, 'sd', 'r'), /<button type="button" tabindex="-?\d" class="xw-num" aria-pressed="false" aria-label="SD 3\.238: im Atlas zeigen">3\.238<\/button>/);
  // Ein Tabstopp je Code und je Ausgabe (rollender tabIndex), die übrigen Zeichen mit den Pfeiltasten.
  const r = panelOf(html, 'sd', 'r');
  assert.equal((r.match(/class="xw-tok[^"]*"/g) ?? []).length > 10 && (r.match(/tabindex="0" class="xw-tok/g) ?? []).length, 1, 'genau ein Tabstopp im Code');
  assert.equal((r.match(/tabindex="0" class="xw-num/g) ?? []).length, 1, 'genau ein Tabstopp in der Ausgabe');
  assert.match(panelOf(html, 'sd', 'r'), /aria-label="%&gt;%: erklären"/, 'der Pipe-Operator ist antippbar');
  for (const part of ['Von hier aus weiter', 'Als Nächstes', 'Standardfehler', 'Das geht voraus', 'Varianz', 'Daraus entsteht', 'z-Standardisierung', 'Weitere Verwendungen und Rechenwege'])
    assert.ok(t('weiter').includes(part), `Weiter: „${part}“ fehlt`);
  assert.ok(!text(html).includes('Mit dem Lehrdatensatz (200 Befragte)'), 'die alte Überschrift wandert in den Reiter');
});

test('tabs: changed data show a note with reset in the sample tab and the live R output follows the data', () => {
  const changed = inspector('sd', { rows: applyOp(surveyRows, 'lernzeit', 'outlier', 40, 1) });
  assert.ok(text(panelOf(changed, 'sd', 'sample')).includes('Deine Daten sind verändert.') && text(panelOf(changed, 'sd', 'sample')).includes('Ausgangsdaten wiederherstellen'), 'Hinweis mit Rücksetzknopf fehlt');
  assert.ok(plain(panelOf(changed, 'sd', 'r')).includes('3.960'), 'die Ausgabe zeigt s = 3.960 nach dem Ausreißer');
  assert.ok(text(panelOf(changed, 'sd', 'r')).includes('Die Ausgabe zeigt deine veränderten Daten'), 'Hinweis zur Ausgabe fehlt');
  assert.ok(!text(inspector('sd')).includes('Deine Daten sind verändert.'), 'Hinweis ohne Änderung');
  // Andere Spalte gewählt: Die Vorhersagen nennen ihre Spalte und bieten den Wechsel an.
  const other = inspector('sd', { selection: { ...defaultSelection, x: 'schlafdauer' } });
  assert.ok(text(panelOf(other, 'sd', 'sample')).includes('Die Vorhersagefragen sind für „Lernzeit“ geschrieben.'), 'Hinweis zur Spalte der Vorhersagen fehlt');
  assert.ok(plain(panelOf(other, 'sd', 'r')).includes('describe(schlafdauer'), 'der Leitaufruf folgt der Spaltenwahl');
});

test('tabs: package concepts (se, p_value, dummy, recode) show their sample and R tabs', () => {
  const has = (html: string, id: string, tab: string, part: string) => assert.ok(plain(panelOf(html, id, tab)).includes(part), `${id}/${tab}: „${part}“ fehlt`);
  const se = inspector('se');
  has(se, 'se', 'sample', 'SE = 3,24 / √200 ≈ 0,23 h');
  has(se, 'se', 'r', 'describe(lernzeit, show = c("mean", "sd", "se"))'); has(se, 'se', 'r', '0.229');
  const p = inspector('p_value');
  has(p, 'p_value', 'sample', 'p ≈ 0,88');
  has(p, 'p_value', 'r', 't_test(lernzeit, group = weiterbildung, var.equal = FALSE)');
  has(p, 'p_value', 'r', 'Ausgabe für die Ausgangsdaten, in R erfasst.');
  has(p, 'p_value', 'weiter', 'Signifikanzniveau α');
  const rec = inspector('recode');
  has(rec, 'recode', 'r', 'lernplanung5_umgepolt (Ich plane feste Zeiten zum Lernen ein. (recoded))');
  has(rec, 'recode', 'r', 'mean=2.74');
  has(inspector('dummy'), 'dummy', 'sample', 'haupt 40, mittel 37, fhr 41, abitur 40');
});

test('tabs: rank routes (Spearman through Pearson with ranks) keep the old layout with rank-based numbers', () => {
  const selection = defaultSelection, context = lessonContext(projectPairs(surveyRows, selection), 'P002', 'covariance', { x: columnById.lernzeit, y: columnById.wissenstest }, true);
  const html = renderToStaticMarkup(createElement(ConceptInspector, {
    selected: ref('pearson', 'x', undefined, 'ranks'), context, selection, rows: surveyRows, onColumns: noop, onData: noop, onRows: noop, highlight: null, onHighlight: noop, onSelect: noop, onHover: noop, onClose: noop,
    onFocusMap: noop, onCase: noop, onPairs: noop, onReset: noop, resetRevision: 0, onVariable: noop, onRoute: noop, trace: false, onTrace: noop,
    experimentOpen: false, experimentRequest: 0, onExperimentFocused: noop, onExperiment: noop,
  }));
  assert.ok(!html.includes('role="tablist"'), 'keine Reiter auf dem Rangweg');
  assert.ok(text(html).includes('Mit dem Lehrdatensatz (200 Befragte)') && html.includes('ties.method'), 'der bisherige Aufbau rechnet mit Rängen');
  assert.ok(html.includes('role="tablist"') === false && inspector('pearson').includes('role="tablist"'), 'ohne Ränge bleiben die Reiter');
});
