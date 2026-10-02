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
import { KurzGesagt } from '../components/explain/basics';
import { asNumber, catalogLead, RTab } from '../components/explain/RTab';
import { TAB_IDS, tabsFor } from './registry';
import { applyOp } from './sample';
import { columnById, createSurvey, defaultSelection, projectPairs, surveyColumns, type ColumnSelection, type SurveyRow } from '../domain/survey';
import { inputs, lessonContext, ref, type Ref } from '../domain/learning';
import { entryById } from '../domain/mariposaCatalog';
import { eligible } from '../domain/mariposaRoles';
import { initialRSettings, rolesFor, startBlock, type RSettings } from '../domain/mariposa';
import { CATALOG_OUTPUT } from './catalogOutput';
import { ALLOWED_TERMS, BANNED_WORDS, styleProblems } from './style';

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
  assert.ok(t.includes('Deine Wahl: Ohne Schulabschluss. Neue Spalten: haupt, mittel, fhr, abitur. Neue Spalten sind hervorgehoben.'), 'Zusammenfassung der Wahl fehlt');
  // M4: Ohne neue Spalte steht kein Satz über hervorgehobene Spalten da.
  const missingTools = text(renderToStaticMarkup(createElement(TabellenWerkzeug, { tool: (explainFor('missing_tools') as { tool: typeof dummy }).tool, onConcept: noop })));
  assert.ok(missingTools.includes('Keine neuen Spalten.') && !missingTools.includes('Neue Spalten sind hervorgehoben'), 'missing_tools: widersprüchlicher Satz');
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

test('the header line „In der Fachsprache“ is words only, like the approved sd, at most two sentences (M1)', () => {
  // Rechenzeichen, Summen- und Wurzelzeichen, tief- und hochgestellte Zeichen, griechische Buchstaben: Die Formel
  // steht in den Schritten und unter „Genau genommen“. Namen wie „R²“ bleiben erlaubt.
  const FORMULA = /[=≈Σ√∑]|[ᵢⱼₖₓᵧ₀-₉₊⁰-⁹²³]|[α-ωΑ-Ω]/u;
  let n = 0;
  for (const id of Object.keys(EXPLANATIONS)) {
    const fach = kurzOf(explainFor(id))?.fach;
    if (!fach) continue;
    n++;
    assert.doesNotMatch(fach.replace(/R²/g, ''), FORMULA, `${id}: Formel in „In der Fachsprache“: ${fach}`);
    assert.deepEqual(styleProblems(fach, { maxWords: 25, maxSentences: 2 }), [], `${id}: ${fach}`);
  }
  assert.ok(n > 40, `nur ${n} Fachsprache-Zeilen geprüft`);
  assert.equal(kurzOf(explainFor('weights'))?.fach, 'Der gewichtete Mittelwert zählt jede Antwort mit dem Gewicht ihrer Person und teilt durch die Summe der Gewichte. Designgewichte gleichen ungleiche Auswahlwahrscheinlichkeiten aus.');
});

test('think questions and try-it buttons follow the variant filter of a shared workshop (IB30)', () => {
  const erwartung = WORKSHOPS.find(w => w.id === 'erwartung')!;
  const shown = (variant: string) => text(renderToStaticMarkup(createElement(Formelwerkstatt, { workshop: erwartung, variant, onConcept: noop })));
  const e = shown('expectation'), pv = shown('population_variance');
  assert.ok(e.includes('Was passiert mit μ?') && e.includes('mit 0,2 und nicht mit 0,25') && !e.includes('Was passiert mit σ²?') && !e.includes('durch 4 wie bei der Stichprobenvarianz'), 'Karte Erwartungswert ohne Fragen zur Streuung');
  assert.ok(pv.includes('Was passiert mit σ²?') && pv.includes('durch 4 wie bei der Stichprobenvarianz') && !pv.includes('mit 0,2 und nicht mit 0,25'), 'Karte Populationsvarianz mit ihren Fragen');
  // Ein Filter in einer Testkopie: Frage nur für sd, Ausprobieren nur für variance.
  const streuung = WORKSHOPS.find(w => w.id === 'streuung')!, t0 = streuung.think.find(t => t.tryIt)!;
  const copy = { ...streuung, think: [{ ...t0, questionFor: undefined, question: 'Nur für s?', onlyFor: ['sd'] }, { ...t0, questionFor: undefined, question: 'Ausprobieren nur bei s²?', tryFor: ['variance'] }] };
  modeStore.set('ausfuehrlich');
  const sd = renderToStaticMarkup(createElement(Formelwerkstatt, { workshop: copy, variant: 'sd', onConcept: noop }));
  const variance = renderToStaticMarkup(createElement(Formelwerkstatt, { workshop: copy, variant: 'variance', onConcept: noop }));
  assert.ok(text(sd).includes('Nur für s?') && !text(variance).includes('Nur für s?'), 'onlyFor');
  assert.ok(text(variance).includes('Ausprobieren nur bei s²?') && text(sd).includes('Ausprobieren nur bei s²?'), 'tryFor blendet die Frage nicht aus');
});

test('the work table names its first column after the rows, and the tab counts people only when the rows are people (IB14, IB31)', () => {
  const anpassung = WORKSHOPS.find(w => w.id === 'b12-anpassung')!, erwartung = WORKSHOPS.find(w => w.id === 'erwartung')!;
  assert.ok(renderToStaticMarkup(createElement(Formelwerkstatt, { workshop: anpassung, variant: 'chisq_gof', onConcept: noop })).includes('<th scope="col">Abschluss</th>'), 'Kopf der ersten Spalte');
  assert.ok(renderToStaticMarkup(createElement(Formelwerkstatt, { workshop: erwartung, variant: 'expectation', onConcept: noop })).includes('<th scope="col">Person</th>'), 'ohne rowHead „Person“');
  assert.equal(tabList(explainFor('chisq_gof'), tabsFor('chisq_gof')!)[0].label, 'Verstehen', 'Zeilen sind Abschlüsse');
  assert.equal(tabList(explainFor('expectation'), tabsFor('expectation')!)[0].label, 'Verstehen (5 Personen)', 'eigener dataNote, aber Personen');
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
const inspector = (target: string | Ref, opts: { rows?: SurveyRow[]; selection?: ColumnSelection; rSettings?: RSettings } = {}) => {
  const selection = opts.selection ?? defaultSelection, rows = opts.rows ?? surveyRows;
  const context = lessonContext(projectPairs(rows, selection), 'P002', 'covariance', { x: columnById[selection.x], y: columnById[selection.y] }, selection.likertMetric);
  return renderToStaticMarkup(createElement(ConceptInspector, {
    selected: typeof target === 'string' ? ref(target) : target, context, selection, rows, rSettings: opts.rSettings, onColumns: noop, onData: noop, onRows: noop, highlight: null, onHighlight: noop, onSelect: noop, onHover: noop, onClose: noop,
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
    // Schrittkarten sind immer vollständig (eine Lernkarte); nur ihr Reiter „Weiter“ kommt dazu (Ruling IB19).
    if (!STEP_CARD_IDS.includes(id)) assert.ok(text(compact).length < text(full).length, `${id}: Kompakt ist nicht kürzer`);
    else assert.ok(text(full).includes('Werkstatt öffnen'), `${id}: Schrittkarte im Reiter „Verstehen“`);
    // ARIA-Muster „Tabs“: ein gewählter Reiter mit Fokus, alle Panels eingehängt, nur eines sichtbar.
    assert.equal((full.match(/role="tablist"/g) ?? []).length, 1);
    assert.equal((full.match(/aria-selected="true"/g) ?? []).length, 1);
    assert.match(full, new RegExp(`id="xt-${id}-verstehen" role="tab" aria-selected="true" aria-controls="xp-${id}-verstehen" tabindex="0"`));
    const panels = [...full.matchAll(/role="tabpanel"[^>]*>/g)].map(m => m[0]);
    assert.equal(panels.length, names.length, `${id}: nicht alle Panels eingehängt`);
    assert.equal(panels.filter(p => !p.includes('hidden')).length, 1, `${id}: mehr als ein Panel sichtbar`);
    // Kurz gesagt steht über den Reitern und nur einmal da. Gezählt werden Kästen „Kurz gesagt“ mit genau diesem Text,
    // nicht Textanfänge: Ein Absatz unter „Genau genommen“ darf genauso beginnen (IB4).
    const kurz = kurzOf(explainFor(id));
    if (kurz) {
      const box = renderToStaticMarkup(createElement(KurzGesagt, { text: kurz.text })), head = box.slice(0, box.indexOf('</p>') + 4);
      assert.ok(full.includes(head) && full.indexOf(head) < full.indexOf('role="tablist"'), `${id}: Kurz gesagt steht nicht über den Reitern`);
      assert.equal(full.split(head).length, 2, `${id}: Kurz gesagt doppelt`);
    }
    assert.ok(text(panelOf(full, id, 'weiter')).includes('Als Nächstes'), `${id}: Weiter ohne Als Nächstes`);
  }
});

test('tabs: the seven pilot step cards have Verstehen, the bridge of their workshop at their step, and Weiter (IB19)', () => {
  for (const id of ['sum', 'deviation', 'squared_deviation', 'df', 'crossproduct', 'crossproduct_sum', 'sd_product']) {
    const html = inspector(id), card = stepCardFor(id)!, title = card.workshop.steps[card.step - 1].title;
    assert.deepEqual(tabNames(html), ['Verstehen', 'Mit 200 Befragten', 'Weiter'], id);
    assert.ok(text(panelOf(html, id, 'verstehen')).includes('Werkstatt öffnen'), `${id}: Schrittkarte fehlt`);
    const sample = panelOf(html, id, 'sample');
    assert.match(sample, new RegExp(`<h3 class="xw-step-title"[^>]*>${title}</h3>`), `${id}: Brücke beginnt nicht bei Schritt ${card.step} „${title}“`);
    assert.ok(text(sample).includes(`Schritt ${card.step} für alle 200`), `${id}: Schrittzeile für alle 200 fehlt`);
    assert.ok(!html.includes('Weitere Übung'), `${id}: die bisherige Rechnung steht nicht mehr doppelt da`);
  }
});

test('tabs: only the z route of a step card hides the tabs; the operation cards of the Baukasten keep Verstehen and Weiter', () => {
  forgetTabs();
  // Die Rechenschritte stehen im Baukasten mit ihrem Ziel als use (ref('add', 'x', 'sum')) und bleiben Schrittkarten mit Reitern.
  const direct = [ref('add', 'x', 'sum'), ref('subtract', 'x', 'deviation'), ref('square', 'x', 'squared_deviation'), ref('divide', 'x', 'variance'), ref('sqrt', 'x', 'sd'), ref('multiply', 'x', 'crossproduct')];
  const fromInputs = ['sum', 'deviation', 'squared_deviation', 'ss', 'df', 'variance', 'sd', 'mean', 'crossproduct', 'crossproduct_sum', 'covariance', 'sd_product', 'pearson']
    .flatMap(id => inputs(ref(id), 'covariance')).filter(r => STEP_CARD_IDS.includes(r.id) && r.use);
  assert.ok(fromInputs.length >= 6, 'der Baukasten gibt Rechenschritte mit use');
  for (const r of [...direct, ...fromInputs]) {
    const names = tabNames(inspector(r));
    assert.ok(names.includes('Verstehen') && names.at(-1) === 'Weiter', `${r.id} (${r.use}): Reiter „Verstehen“ und „Weiter“ fehlen, gefunden: ${names.join(', ') || 'keine'}`);
  }
  // Im Rechenweg über z-Werte bleibt die bisherige Ansicht ohne Reiter (Ruling IB19).
  for (const r of [ref('crossproduct', 'x', 'z'), ref('crossproduct_sum', 'x', 'z')]) assert.deepEqual(tabNames(inspector(r)), [], `${r.id}: z-Weg ohne Reiter`);
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

test('In R: Anderer Aufruf lists the own calls of the concept beside a foreign lead call; fixed live columns; German reading of R numbers', () => {
  // IB5: labels führt mit to_labelled() (conversion) und listet unter „Anderer Aufruf“ seine eigenen fünf Aufrufe.
  const labels = plain(panelOf(inspector('labels'), 'labels', 'r'));
  assert.ok(labels.includes('to_labelled('), 'Leitaufruf bleibt to_labelled()');
  for (const part of ['Anderer Aufruf', 'Fragetext setzen', 'Antworttexte setzen', 'Labels kopieren', 'Unbenutzte Labels entfernen', 'Labels entfernen', '?mariposa::var_label'])
    assert.ok(labels.includes(part), `labels: „${part}“ fehlt`);
  assert.ok(!labels.includes('Labels zu Faktoren'), 'labels: „Anderer Aufruf“ zeigt nicht mehr die Varianten von conversion');
  // p_value hat keine eigenen Aufrufe: „Anderer Aufruf“ bleibt beim t-Test.
  assert.ok(plain(panelOf(inspector('p_value'), 'p_value', 'r')).includes('Anderer Aufruf'), 'p_value: Anderer Aufruf mit den t-Test-Varianten');
  // IB6: Ein Live-Leitaufruf mit fester Spalte folgt nicht der Spaltenwahl (hier lernzeit).
  const base = { title: 'Test', rows: surveyRows, modified: false, reference: ref('ordinal'), selection: defaultSelection, onSelect: noop, onHover: noop, onConcept: noop };
  const fixedTab = { entry: 'frequency', variant: 0, live: { fn: 'frequency' as const, x: 'schulabschluss' }, outputMap: [], check: { question: 'Test?', correct: 'N', wrong: {} } };
  const fixedHtml = plain(renderToStaticMarkup(createElement(RTab, { ...base, tab: fixedTab })));
  assert.ok(fixedHtml.includes('frequency(schulabschluss)') && fixedHtml.includes('Abitur'), 'frequency() mit der festen Spalte und ihren Wertelabels');
  const followHtml = plain(renderToStaticMarkup(createElement(RTab, { ...base, tab: { ...fixedTab, live: { fn: 'frequency' as const } } })));
  assert.ok(followHtml.includes('frequency(lernzeit)'), 'ohne feste Spalte folgt der Aufruf der Spaltenwahl');
  // IB2: summary() im Leitaufruf der Ladungen.
  assert.ok(plain(panelOf(inspector('loadings'), 'loadings', 'r')).includes('summary(ergebnis)'), 'loadings: summary(ergebnis)');
  // IB29: Zahlen mit führendem Punkt und kleine Werte mit zwei gültigen Ziffern.
  assert.deepEqual(['3.238', '.021', '0.013', '<.001', '0.5'].map(asNumber), ['3,24', '0,021', '0,013', null, '0,5']);
});

/** R-Einstellungen des offenen Begriffs mit anderen Spalten: je Rolle mit genau einer Spalte die erste andere passende. */
const changedSettings = (id: string): RSettings | undefined => {
  const e = entryById[id], r = tabsFor(id)?.r;
  if (!e?.variants.length) return undefined;
  const s = initialRSettings(e, r?.entry === id ? r.variant : 0), used = new Set(Object.values(s.columns).flat());
  for (const role of rolesFor(e, s.variant)) {
    if (s.columns[role.key]?.length !== 1) continue;
    const other = surveyColumns.find(c => !used.has(c.id) && eligible(role, c, true));
    if (other) { s.columns[role.key] = [other.id]; used.add(other.id); }
  }
  return s;
};
/** Der Leitaufruf, wie ihn „Der Aufruf“ zeigt (jedes Zeichen ein eigener Knopf). */
const leadCode = (html: string, id: string) => {
  const m = panelOf(html, id, 'r').match(/<pre class="r-code xw-rcode"[^>]*><code>([\s\S]*?)<\/code><\/pre>/);
  return m ? plain(m[1]) : null;
};

test('In R: every catalog lead call shows exactly the captured call, also after another column choice, with its catalog note; only live calls follow (I1, M2)', () => {
  const leads = TAB_IDS.filter(id => { const r = tabsFor(id)?.r; return !!r?.entry && !r.live; });
  assert.ok(leads.length > 80, `nur ${leads.length} Katalog-Leitaufrufe gefunden`);
  const changed: ColumnSelection = { x: 'schlafdauer', y: 'alter', likertMetric: true };
  for (const id of leads) {
    const r = tabsFor(id)!.r!, key = `${r.entry}:${r.variant}${r.summary ? ':summary' : ''}`, captured = CATALOG_OUTPUT[key];
    assert.ok(captured, `${id}: keine erfasste Ausgabe ${key}`);
    assert.equal(leadCode(inspector(id), id), captured.code, `${id}: Leitaufruf (Standardspalten) ist nicht der erfasste Aufruf ${key}`);
    assert.equal(leadCode(inspector(id, { selection: changed, rSettings: changedSettings(id) }), id), captured.code, `${id}: Leitaufruf folgt der Spaltenwahl`);
    // „Aufruf kopieren“ gibt `code` aus; das R-Skript enthält denselben Aufruf.
    const lead = catalogLead(r, 'Test')!;
    assert.equal(lead.code, captured.code, `${id}: kopierter Aufruf`);
    assert.ok(lead.script.includes(captured.code.slice(startBlock().length).trim()) && lead.script.includes(startBlock()), `${id}: R-Skript mit anderem Aufruf`);
    // M2: Der Hinweis der Katalogvariante steht unter „Der Aufruf“ (Einheitsgewichte, Richtung des einseitigen Tests …).
    if (lead.note) {
      assert.deepEqual(styleProblems(lead.note, { maxWords: 25 }), [], `${id}: Hinweis zum Aufruf`);
      // Der Reiter zeigt keine Formel und keine Zeichen vor dem Aufruf: Der Hinweis nennt Wörter, keine Formelstücke (Sprachleitfaden).
      assert.ok(!/[₀-₉ₐ-ₜ]|[\p{L}\d]=[\p{L}\d−]|\bFormel\b/u.test(lead.note), `${id}: Hinweis mit Formelstück oder Verweis auf eine Formel: ${lead.note}`);
      const panel = text(panelOf(inspector(id), id, 'r'));
      assert.ok(panel.includes(text(lead.note)) && panel.indexOf(text(lead.note)) < panel.indexOf('So antwortet R'), `${id}: Hinweis zum Aufruf fehlt unter „Der Aufruf“`);
    }
  }
  assert.ok(text(panelOf(inspector('weights'), 'weights', 'r')).includes('Gewichte von 1 ändern nichts.'), 'weights: Satz zu den Einheitsgewichten');
  assert.ok(text(panelOf(inspector('test_sides'), 'test_sides', 'r')).includes('Die erste Gruppe ist der kleinere Code'), 'test_sides: Richtung des einseitigen Tests');
  // Live-Aufrufe folgen weiter der Spaltenwahl (Gegenprobe).
  assert.ok(leadCode(inspector('sd', { selection: { ...defaultSelection, x: 'schlafdauer' } }), 'sd')?.includes('describe(schlafdauer'), 'sd: Live-Aufruf folgt der Spaltenwahl');
});

test('the practice replace() is explained by the same „nur zum Üben“ card in missing, missing_tools and data_export (M7)', () => {
  const card = 'Setzt hier nur zum Üben bei einzelnen Personen eine Lücke oder einen Code wie −9 ein.';
  for (const id of ['missing', 'missing_tools', 'data_export']) {
    const v = text(panelOf(inspector(id), id, 'verstehen'));
    assert.ok(v.includes('replace(') && v.split(card).length === 2, `${id}: Werkzeug ohne die Karte zu replace()`);
  }
  for (const id of ['missing', 'missing_tools']) assert.match(panelOf(inspector(id), id, 'r'), /aria-label="replace: erklären"/, `${id}: replace() im Leitaufruf nicht antippbar`);
  assert.ok(!text(panelOf(inspector('dummy'), 'dummy', 'verstehen')).includes(card), 'ohne replace() keine Karte');
});

test('tabs: one reset button in the sample tab, step cards keep h1 → h2 → h3, legacy labs collapsed under Weitere Übung (IB15, IB16, IB3)', () => {
  const changed = applyOp(surveyRows, 'lernzeit', 'outlier', 40, 1);
  for (const id of ['linear', 'ss', 'crosstab', 'validn', 'series']) {
    const panel = panelOf(inspector(id, { rows: changed }), id, 'sample');
    assert.equal((panel.match(/>Ausgangsdaten wiederherstellen<\/button>/g) ?? []).length, 1, `${id}: genau ein Knopf „Ausgangsdaten wiederherstellen“`);
  }
  for (const id of ['sum', 'ss', 'add', 'sqrt']) {
    const html = inspector(id), levels = [...html.matchAll(/<h([1-6])[\s>]/g)].map(m => Number(m[1]));
    const jump = levels.findIndex((n, i) => i > 0 && n > levels[i - 1] + 1);
    assert.equal(jump, -1, `${id}: Überschriftenebene übersprungen (${levels.join(' ')})`);
  }
  assert.ok(tabsFor('add')?.next && tabNames(inspector('add')).includes('Weiter'), 'Schrittkarte add mit Reiter „Weiter“');
  // Bisherige Übungen (FactorLab, SamplingLab …) unter einer neuen Erklärung: zugeklappt am Ende von „Verstehen“.
  for (const id of ['loadings', 'sampling_distribution', 'confidence']) {
    const v = panelOf(inspector(id), id, 'verstehen');
    assert.match(v, /<details class="xw-more xw-practice"><summary>Weitere Übung<\/summary>/, `${id}: „Weitere Übung“ fehlt`);
    assert.ok(v.indexOf('Weitere Übung') > v.lastIndexOf('Genau genommen'), `${id}: „Weitere Übung“ steht nicht am Ende`);
    const start = v.indexOf('<details class="xw-more xw-practice">'), labs = [...v.matchAll(/class="foundation-lab/g)].map(m => m.index ?? -1);
    assert.ok(labs.length > 0 && labs.every(i => i > start), `${id}: die Übung steht nicht im Kasten „Weitere Übung“`);
  }
  // Schrittkarten ohne Reiter „Mit 200 Befragten“: In „Weitere Übung“ stehen Spaltenwahl, Rechnung mit Daten und Deutung (Korrekturrunde M1).
  const add = panelOf(inspector('add'), 'add', 'verstehen'), practice = add.slice(add.indexOf('xw-practice'));
  for (const part of ['Mit welchen Variablen?', 'Mit deinen Daten', 'class="interpretation"', 'Mit den Daten experimentieren']) assert.ok(practice.includes(part), `add: „${part}“ fehlt in „Weitere Übung“`);
});

test('previous labs and texts under the new explanations: no „·“ separator beside numbers, at most two decimals, no belittling words (M3)', () => {
  // Jedes Labor der „Weiteren Übung“ einmal (Verteilung, Wahrscheinlichkeit, Stichproben, Test, exakt, beobachtet, Regression, Überanpassung, Konfundierung, Messung, Faktoren).
  const labs = ['normal_distribution', 'binomial_distribution', 'probability', 'sampling_distribution', 'null_distribution', 'exact_asymptotic', 'empirical_distribution', 'outliers_influence', 'overfitting', 'confounding', 'measurement_error', 'loadings'];
  for (const id of labs) {
    const v = panelOf(inspector(id), id, 'verstehen'), results = [...v.matchAll(/class="lab-result"[^>]*>(.*?)<\/div>/g)].map(m => text(m[1]));
    assert.ok(results.length > 0, `${id}: keine Laboranzeige`);
    for (const r of results) {
      assert.doesNotMatch(r, /[\d)]\s·\s\p{L}|\p{L}\s·\s[\p{L}\d]/u, `${id}: „·“ als Trenner in „${r}“`);
      assert.doesNotMatch(r, /(?<![\d.,])(?:[1-9]\d*|0),(?!0)\d{3}|-\d/, `${id}: mehr als zwei Nachkommastellen oder Bindestrich-Minus in „${r}“`);
    }
  }
  // Regel 5 in allen bisherigen Texten, die eine Karte zeigt (Einordnung, Fachlich nachlesen, Labore), außer den Fachbegriffen.
  const banned = new RegExp(`(^|[^\\p{L}])(${BANNED_WORDS.join('|')})`, 'giu');
  for (const c of Object.values(conceptById)) {
    const t = text(inspector(c.id));
    for (const m of t.matchAll(banned)) {
      const at = (m.index ?? 0) + m[1].length, rest = t.slice(at);
      assert.ok(ALLOWED_TERMS.some(a => a.test(rest)), `${c.id}: „${t.slice(Math.max(0, at - 40), at + 40)}“`);
    }
  }
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
