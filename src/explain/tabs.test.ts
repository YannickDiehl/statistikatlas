import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { conceptById } from '../domain/concepts';
import { entryById } from '../domain/mariposaCatalog';
import { analysisCode, initialRSettings } from '../domain/mariposa';
import { RTOKENS } from '../domain/rTokens';
import { neighbors } from '../domain/network';
import { mapIds, visibleNeighbors } from '../domain/visibleNetwork';
import { ref } from '../domain/learning';
import { createSurvey, defaultSelection } from '../domain/survey';
import { EXPLANATIONS, TAB_IDS, bridgeFor, explainFor, tabsFor, workshopFor } from './registry';
import { CATALOG_OUTPUT } from './catalogOutput';
import { applyOp, bridgeContext, fitsColumn } from './sample';
import { liveCode, liveOutput, locate, noteFor, tokenize } from './rRead';
import { mergeRelations, nextLists, relationText } from './relations';
import { styleProblems } from './style';
import type { BridgePicture, ConceptTabs, SampleCtx, ThinkSample } from './types';

/**
 * Reiter aller Begriffe (Pilot, Muster und Bereiche): Texte im Ton des Sprachleitfadens, Vorhersagen, die sich auf dem
 * Lehrdatensatz ausprobieren lassen, R-Ausgaben, in denen jede Zuordnung ihre Zahl findet, und Ziele, die es gibt.
 * Referenzwerte der Pilotreiter in R (mariposa 0.7.4, atlas <- read_spss("Statistikatlas-200-Befragte.sav")):
 *   atlas %>% describe(lernzeit, show = c("mean", "sd", "var"))    # Mean 7.752, SD 3.238, Variance 10.482
 *   atlas %>% pearson_cor(lernzeit, wissenstest)                     # r = 0.539
 *   atlas %>% summarise(kovarianz = cov(lernzeit, wissenstest))      # 5.44
 *   atlas %>% mutate(lernzeit = lernzeit * 2) %>% t_test(lernzeit, group = weiterbildung)   # p = 0.876 wie vorher
 *   atlas %>% to_dummy(schulabschluss, ref = 0)                      # 200 × 4; Codes 0 bis 4: 42, 40, 37, 41, 40
 */
const rows = createSurvey();
/** Bezüge wie im Inspector: sichtbare Karte, sonst das ganze Netz. */
const edgesOf = (id: string) => mapIds.has(id) ? visibleNeighbors(ref(id), 'covariance') : neighbors(id, ref(id));
const BROKEN = /NaN|undefined|Infinity|\[object/;
function clean(label: string, s: string | undefined, opts?: { maxWords?: number; maxSentences?: number }) {
  assert.ok(typeof s === 'string' && s.trim().length > 0, `${label}: leer`);
  assert.ok(!BROKEN.test(s), `${label}: ${s}`);
  const problems = styleProblems(s, opts);
  assert.deepEqual(problems, [], `${label}: ${problems.join(' ')}`);
}
const SHORT = { maxWords: 25 }, KURZ = { maxWords: 25, maxSentences: 2 }, DEUTUNG = { maxWords: 25, maxSentences: 3 };
const ALL = (): [string, ConceptTabs][] => TAB_IDS.map(id => [id, tabsFor(id)!]);
const fixture = (name: string) => readFileSync(new URL(`./fixtures/r-output/${name}.txt`, import.meta.url), 'utf8').replace(/\n$/, '');

test('every registered explanation has tabs with Weiter, and the seven pilot concepts and both patterns have all their tabs', () => {
  for (const id of Object.keys(EXPLANATIONS)) assert.ok(tabsFor(id)?.next, `${id}: Reiter „Weiter“ fehlt (tabs[id].next)`);
  for (const id of ['mean', 'variance', 'sd', 'covariance', 'pearson', 'se', 'p_value', 'dummy']) assert.ok(tabsFor(id)?.sample && tabsFor(id)?.r, `${id}: Reiter unvollständig`);
  assert.ok(tabsFor('recode')?.r && !tabsFor('recode')?.sample, 'recode: In R, aber kein Mit 200 Befragten');
  assert.equal(tabsFor('median'), null);
  assert.equal(new Set(TAB_IDS).size, TAB_IDS.length);
});

test('Weiter: every target exists, every sentence follows the tone guide, no target twice', () => {
  for (const [id, tabs] of ALL()) {
    const n = tabs.next, items = [n.next, ...n.before, ...n.after, ...(n.more ?? [])];
    for (const item of items) {
      assert.ok(conceptById[item.id], `${id}: Ziel „${item.id}“ fehlt in concepts.ts`);
      assert.notEqual(item.id, id, `${id}: verweist auf sich selbst`);
      clean(`${id} weiter ${item.id}`, item.why, KURZ);
    }
    const listed = [...n.before, ...n.after, ...(n.more ?? [])].map(x => x.id);
    assert.equal(new Set(listed).size, listed.length, `${id}: ein Ziel steht zweimal in den Listen`);
    const lists = nextLists(n, edgesOf(id));
    const shown = [lists.next, ...lists.before, ...lists.after, ...lists.more].map(x => x.id);
    assert.equal(new Set(shown.slice(1)).size, shown.length - 1, `${id}: Weiter zeigt ein Ziel doppelt`);
  }
});

test('relations: duplicate targets merge into one entry without a middle dot', () => {
  const sd = edgesOf('sd');
  const z = sd.after.filter(e => e.target === 'z');
  assert.ok(z.length >= 2, 'Vorbedingung: z steht in den Bezügen der Standardabweichung zweimal');
  const merged = mergeRelations(sd.after, 'after');
  assert.equal(merged.filter(m => m.id === 'z').length, 1);
  assert.match(merged.find(m => m.id === 'z')!.why, /; /);
  assert.equal(relationText('liefert den Bezugspunkt · über Abweichung vom Mittelwert'), 'liefert den Bezugspunkt, über Abweichung vom Mittelwert');
  for (const m of merged) assert.ok(!m.why.includes('·'), m.why);
  // Leere Listen füllt der Reiter aus der Karte.
  const fallback = nextLists({ next: { id: 'se', why: 'weil' }, before: [], after: [] }, sd);
  assert.ok(fallback.before.some(x => x.id === 'variance') && fallback.after.some(x => x.id === 'z'), 'leere Listen kommen aus der Karte');
  assert.equal(fallback.after.filter(x => x.id === 'z').length, 1);
});

/** Spalten, für die die Vorhersagen eines Reiters geschrieben sind (Brücke: `variable`, Auswertung: feste Spalten oder die Spaltenwahl). */
function columnsOf(tabs: ConceptTabs): Record<'x' | 'y', string> {
  const s = tabs.sample!;
  if (s.kind === 'bridge') { const [x, y] = s.variable.split(','); return { x, y: y ?? defaultSelection.y }; }
  return { x: s.columns?.x ?? defaultSelection.x, y: s.columns?.y ?? defaultSelection.y };
}
function thinkClean(label: string, t: ThinkSample) {
  clean(`${label} Frage`, t.question); clean(`${label} Erklärung`, t.explain, SHORT); clean(`${label} kurz`, t.kurz, KURZ); clean(`${label} Ausprobieren`, t.tryIt.label);
  t.options.forEach(o => clean(`${label} Antwort`, o));
  assert.ok(t.correct >= 0 && t.correct < t.options.length, `${label}: richtige Antwort fehlt`);
}

test('Mit 200 Befragten: bridge texts for every step and person, before and after every prediction', () => {
  for (const [id, tabs] of ALL()) {
    const s = tabs.sample;
    if (s?.kind !== 'bridge') continue;
    const w = workshopFor(s.workshop), b = bridgeFor(s.workshop);
    assert.ok(w && b, `${id}: Werkstatt „${s.workshop}“ ohne Brücke (Workshop.bridge)`);
    const v = w.variants[s.variant];
    assert.ok(v, `${id}: Werkstatt „${s.workshop}“ erklärt „${s.variant}“ nicht`);
    assert.equal(explainFor(id)?.kind === 'werkstatt' || id === s.variant, true);
    assert.ok(b.lines.length >= v.lastStep, `${id}: Schrittzeilen fehlen`);
    assert.ok(s.think.length >= 2, `${id}: mindestens zwei Vorhersagefragen`);
    const cols = columnsOf(tabs), datasets = [rows, ...s.think.map(t => applyOp(rows, cols[t.tryIt.column], t.tryIt.op, t.tryIt.value, 1))];
    s.think.forEach((t, k) => {
      thinkClean(`${id} Vorhersage ${k + 1}`, t);
      assert.ok(fitsColumn(datasets[k + 1], cols[t.tryIt.column]), `${id} Vorhersage ${k + 1}: Ausprobieren passt nicht zu „${cols[t.tryIt.column]}“`);
      if (t.step !== undefined) assert.ok(t.step >= 1 && t.step <= v.lastStep, `${id} Vorhersage ${k + 1}: Schritt ${t.step}`);
    });
    for (const [d, data] of datasets.entries()) for (const who of d === 0 ? rows.map((_, i) => i) : [0, 1, 174, 199]) {
      const c = bridgeContext(w.compute, b.data, data, cols.x, cols.y, who), label = `${id} Daten ${d} ${c.names[who]}`;
      for (let k = 0; k < v.lastStep; k++) { clean(`${label} Schritt ${k + 1} alle`, b.lines[k].all(c), SHORT); clean(`${label} Schritt ${k + 1} Person`, b.lines[k].person(c), SHORT); }
      const i = b.interpret(c, s.variant);
      clean(`${label} Deutung`, i.kurz, DEUTUNG); clean(`${label} Fachsprache`, i.fachlich); if (i.zusatz) clean(`${label} Zusatz`, i.zusatz, SHORT);
      clean(`${label} Voraussetzung`, b.voraussetzung(c, s.variant), SHORT);
      b.metrics(c, s.variant).forEach(m => { clean(`${label} Kennzahl`, m.label); clean(`${label} Kennzahl`, m.value); });
      const flat = (nodes: unknown[]): string => nodes.map(n => typeof n === 'string' ? n : n && typeof n === 'object' && 'part' in n ? flat((n as { part: unknown[] }).part) : '').join('');
      clean(`${label} Formel`, flat(b.numeric(c, v.lastStep)));
      for (let step = 1; step <= v.lastStep; step++) { const pic: BridgePicture = b.picture(c, step); if (pic.contributions) assert.equal(pic.contributions.values.length, data.length); }
    }
  }
});

test('Mit 200 Befragten: the approved sd wording and its numbers from the data', () => {
  const s = tabsFor('sd')!.sample!, w = workshopFor('streuung')!, b = bridgeFor('streuung')!;
  assert.equal(s.kind, 'bridge');
  const c = bridgeContext(w.compute, 'series', rows, 'lernzeit', '', 1);
  assert.equal(b.interpret(c, 'sd').zusatz, '141 von 200 Befragten lernen zwischen 4,51 und 10,99 Stunden.');
  assert.equal(b.lines[0].all(c), 'Alle 200 Lernzeiten zusammen ergeben 1.550,3 h. Geteilt durch 200: x̄ ≈ 7,75 h.');
  assert.match(b.lines[3].all(c), /Quadratsumme 2\.085,82 h²\. Den größten Beitrag liefert P175 mit 18,4 h: \(18,4 − 7,75\)² ≈ 113,4 h²\./);
  assert.equal(b.lines[4].all(c), '2.085,82 / (200 − 1) = 2.085,82 / 199 ≈ 10,48 h².');
  assert.equal(b.lines[5].all(c), '√10,48 ≈ 3,24 h. Probe: 3,24 · 3,24 ≈ 10,48.');
  assert.equal(b.lines[1].person(c), 'P002: 8,3 − 7,75 = +0,55, also 0,55 h über der Mitte.');
  const flat = (nodes: unknown[]): string => nodes.map(n => typeof n === 'string' ? n : n && typeof n === 'object' && 'part' in n ? flat((n as { part: unknown[] }).part) : '').join('');
  assert.match(flat(b.numeric(c, 6)), /= √\( 2\.085,82 \/ 199 \) ≈ √10,48 ≈ 3,24 h$/);
  assert.equal(b.metrics(c, 'sd').at(-1)!.value, '3,24 h');
  const doubled = bridgeContext(w.compute, 'series', applyOp(rows, 'lernzeit', 'double'), 'lernzeit', '', 1);
  assert.equal(b.metrics(doubled, 'sd').at(-1)!.value, '6,48 h');
  assert.equal(tabsFor('sd')!.next.next.why, 'Wie genau kennt man den Mittelwert? Teile s durch die Wurzel aus n: 3,24 / √200 ≈ 0,23 h.');
});

test('Mit 200 Befragten: analysis results resolve for the data and after every prediction', () => {
  for (const [id, tabs] of ALL()) {
    const s = tabs.sample;
    if (s?.kind !== 'analysis') continue;
    clean(`${id} kurz`, s.kurz, KURZ);
    if (s.voraussetzung) clean(`${id} Voraussetzung`, s.voraussetzung, SHORT);
    assert.ok(s.think.length >= 1, `${id}: mindestens eine Vorhersagefrage`);
    const cols = columnsOf(tabs), columns = s.columns ? Object.fromEntries(Object.entries(s.columns).map(([k, v]) => [k, [v]])) : { x: [cols.x], y: [cols.y] };
    const ctx = (data: typeof rows): SampleCtx => ({ rows: data, columns });
    const datasets = [rows, ...s.think.map(t => applyOp(rows, columns[t.tryIt.column]?.[0] ?? cols[t.tryIt.column], t.tryIt.op, t.tryIt.value, 1))];
    s.think.forEach((t, k) => { thinkClean(`${id} Vorhersage ${k + 1}`, t); assert.ok(fitsColumn(datasets[k + 1], columns[t.tryIt.column]?.[0] ?? cols[t.tryIt.column]), `${id} Vorhersage ${k + 1}: Ausprobieren passt nicht`); });
    for (const [d, data] of datasets.entries()) {
      const r = s.result(ctx(data));
      clean(`${id} Daten ${d} Deutung`, r.kurz, DEUTUNG); clean(`${id} Daten ${d} Fachsprache`, r.fachlich); if (r.zusatz) clean(`${id} Daten ${d} Zusatz`, r.zusatz, SHORT);
    }
  }
  // Zahlen der Muster aus den Daten (R-Befehle oben).
  const p = tabsFor('p_value')!.sample!;
  assert.equal(p.kind, 'analysis');
  if (p.kind === 'analysis') {
    const r = p.result({ rows, columns: { x: ['lernzeit'], group: ['weiterbildung'] } });
    assert.match(r.kurz, /7,71 Stunden, ohne 7,78 Stunden.*p ≈ 0,88/);
    assert.match(p.result({ rows: applyOp(rows, 'lernzeit', 'double'), columns: { x: ['lernzeit'], group: ['weiterbildung'] } }).kurz, /p ≈ 0,88/, 'verdoppelt: p bleibt');
  }
  const d = tabsFor('dummy')!.sample!;
  if (d.kind === 'analysis') assert.match(d.result({ rows, columns: { x: ['schulabschluss'] } }).fachlich, /haupt 40, mittel 37, fhr 41, abitur 40/);
});

test('In R: every output map finds its number, the quick check has its answers, the lead code is the catalog code', () => {
  for (const [id, tabs] of ALL()) {
    const r = tabs.r;
    if (!r) continue;
    const entry = r.entry ? entryById[r.entry] : undefined;
    if (r.entry) assert.ok(entry, `${id}: Katalogeintrag „${r.entry}“ fehlt`);
    let output: string, code: string;
    if (r.live) {
      const x = r.live.fn === 'rec_frequency' ? entry?.roles.find(x => x.key === 'x')?.default[0] ?? 'lernplanung5' : 'lernzeit';
      output = liveOutput(r.live, rows, x, 'wissenstest'); code = liveCode(r.live, x, 'wissenstest');
    } else {
      assert.ok(entry && entry.variants[r.variant], `${id}: Leitaufruf ${r.entry}:${r.variant} fehlt im Katalog`);
      const captured = CATALOG_OUTPUT[`${r.entry}:${r.variant}`];
      assert.ok(captured?.output, `${id}: keine in R erfasste Ausgabe für ${r.entry}:${r.variant}`);
      assert.equal(captured.code, analysisCode(entry!, initialRSettings(entry!, r.variant)), `${id}: erfasster Code passt nicht zum Katalog`);
      output = captured.output; code = captured.code;
    }
    const spots = r.outputMap.map(m => ({ m, spot: locate(output, m.match) }));
    for (const { m, spot } of spots) {
      assert.ok(spot, `${id}: „${m.match}“ kommt in der Ausgabe nicht vor`);
      clean(`${id} Zuordnung ${m.match}`, m.atlas); clean(`${id} Zuordnung ${m.match}`, m.explain, KURZ);
    }
    clean(`${id} Kurz prüfen`, r.check.question);
    assert.ok(r.outputMap.some(m => m.match === r.check.correct), `${id}: richtige Antwort „${r.check.correct}“ fehlt in outputMap`);
    for (const [key, text] of Object.entries(r.check.wrong)) {
      assert.ok(locate(output, key), `${id}: Fehlantwort „${key}“ kommt in der Ausgabe nicht vor`);
      clean(`${id} Kurz prüfen ${key}`, text); assert.match(text, /^Fast! /, `${id}: Rückmeldung beginnt nicht mit „Fast!“`);
    }
    const positions = new Set(spots.map(s => s.spot!.start));
    assert.ok(positions.size >= 2 || Object.keys(r.check.wrong).length >= 1, `${id}: Kurz prüfen braucht mindestens zwei Zahlen zur Wahl`);
    for (const [key, note] of Object.entries(r.tokens ?? {})) {
      for (const t of [note.term, note.kurz, note.fehler]) clean(`${id} Zeichen ${key}`, t);
      clean(`${id} Zeichen ${key} kurz`, note.kurz, KURZ);
      assert.ok(tokenize(code, { ...RTOKENS, ...r.tokens }).some(p => p.key === key), `${id}: Zeichen „${key}“ kommt im Leitaufruf nicht vor`);
    }
    for (const part of tokenize(code, { ...RTOKENS, ...r.tokens })) if (part.key) assert.ok(noteFor(part.key, r.tokens), `${id}: keine Karte für „${part.key}“`);
  }
});

test('In R: the live lead calls print exactly what R printed for the starting data', () => {
  assert.equal(liveOutput({ fn: 'describe', show: ['mean', 'sd', 'var'] }, rows, 'lernzeit'), fixture('ausgang--describe-mean-sd-var'));
  assert.equal(liveOutput({ fn: 'describe', show: ['mean'] }, rows, 'lernzeit'), fixture('ausgang--describe-mean'));
  assert.equal(liveOutput({ fn: 'describe', show: ['mean', 'sd', 'se'] }, rows, 'lernzeit'), fixture('ausgang--describe-mean-sd-se'));
  assert.equal(liveOutput({ fn: 'pearson_cor' }, rows, 'lernzeit', 'wissenstest'), fixture('ausgang--pearson'));
  assert.equal(liveOutput({ fn: 'cov' }, rows, 'lernzeit', 'wissenstest'), fixture('ausgang--kovarianz'));
  assert.equal(liveOutput({ fn: 'frequency' }, rows, 'lernplanung5'), fixture('ausgang--frequency'));
  assert.equal(liveOutput({ fn: 'describe', show: ['mean', 'sd', 'var'] }, applyOp(rows, 'lernzeit', 'outlier', 40, 1), 'lernzeit'), fixture('p002_40--describe-mean-sd-var'));
  assert.equal(liveOutput({ fn: 'rec_frequency' }, rows, 'lernplanung5'), CATALOG_OUTPUT['recode:0'].output);
  assert.ok(CATALOG_OUTPUT['recode:0'].code.endsWith(liveCode({ fn: 'rec_frequency' }, 'lernplanung5')));
  assert.equal(liveCode({ fn: 'describe', show: ['mean'] }, 'lernzeit'), 'atlas %>%\n  describe(lernzeit, show = "mean")');
  assert.equal(liveCode({ fn: 'describe', show: ['mean', 'sd', 'var'] }, 'lernzeit'), 'atlas %>%\n  describe(lernzeit, show = c("mean", "sd", "var"))');
  assert.equal(liveCode({ fn: 'cov' }, 'lernzeit', 'wissenstest'), 'atlas %>%\n  summarise(kovarianz = cov(lernzeit, wissenstest))');
});

test('locate: label = number, column header, literal text', () => {
  const describe = fixture('ausgang--describe-mean-sd-var');
  assert.deepEqual(['Mean', 'SD', 'Variance', 'N', 'Missing'].map(m => locate(describe, m)?.text), ['7.752', '3.238', '10.482', '200', '0']);
  const pearson = fixture('ausgang--pearson');
  assert.deepEqual(['r', 'p', 'N'].map(m => locate(pearson, m)?.text), ['0.539', '0.001', '200']);
  const cov = fixture('ausgang--kovarianz');
  assert.equal(locate(cov, 'kovarianz')?.text, '5.44');
  assert.equal(locate(cov, '<dbl>')?.text, '<dbl>', 'Typangaben zeigen nicht auf die Zahl darunter');
  assert.equal(locate(cov, '1 × 1')?.text, '1 × 1');
  const tt = CATALOG_OUTPUT['t_test:0'].output;
  assert.deepEqual(['t', 'p', 'g'].map(m => locate(tt, m)?.text), ['0.156', '0.876', '0.022']);
  const freq = fixture('ausgang--frequency');
  assert.deepEqual(['mean', 'sd', 'valid N', 'Raw %'].map(m => locate(freq, m)?.text), ['3.26', '1.20', '200', '8.50']);
  assert.equal(locate(freq, 'gibtsnicht'), null);
});

test('tokenize: functions, arguments, columns and atlas are tappable, strings only with their own card', () => {
  const code = 'library(dplyr)\nlibrary(mariposa)\n\natlas <- read_spss("Statistikatlas-200-Befragte.sav")\n\natlas %>%\n  describe(lernzeit, show = c("mean", "sd"))';
  const parts = tokenize(code, { ...RTOKENS, '"sd"': { sym: '"sd"', term: 'Standardabweichung', kurz: 'k', fehler: 'f' } });
  assert.equal(parts.map(p => p.text).join(''), code, 'nichts geht verloren');
  const keys = parts.filter(p => p.key).map(p => p.key);
  for (const k of ['library', 'atlas', '<-', 'read_spss', '%>%', 'describe', 'lernzeit', 'show', '=', 'c', '"sd"']) assert.ok(keys.includes(k), `„${k}“ ist nicht antippbar`);
  assert.ok(!keys.includes('"mean"') && !keys.includes('"Statistikatlas-200-Befragte.sav"'), 'Zeichenketten ohne eigene Karte sind nicht antippbar');
  assert.match(noteFor('describe')!.term, /Deskriptiver Überblick/);
  assert.match(noteFor('lernzeit')!.term, /Variable „Lernzeit“/);
});
