import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { conceptById, concepts } from '../domain/concepts';
import { entryById } from '../domain/mariposaCatalog';
import { analysisCode, initialRSettings, summaryCode } from '../domain/mariposa';
import { RTOKENS } from '../domain/rTokens';
import { neighbors } from '../domain/network';
import { mapIds, visibleNeighbors } from '../domain/visibleNetwork';
import { ref } from '../domain/learning';
import { compatible, createSurvey, defaultSelection, surveyColumns, type SurveyRow } from '../domain/survey';
import { EXPLANATIONS, TAB_IDS, bridgeFor, explainFor, rKurz, R_TAP, tabsFor, workshopFor } from './registry';
import { CATALOG_OUTPUT } from './catalogOutput';
import { applyOp, bridgeContext, fitsColumn, shownDiff } from './sample';
import { liveCode, liveFits, liveOutput, locate, noteFor, tokenize } from './rRead';
import { mergeRelations, nextLists, relationText } from './relations';
import { styleProblems } from './style';
import { equationsThatFail } from './equations';
import type { BridgeCtx, BridgePicture, ConceptTabs, Expect, SampleCtx, SampleTab, ThinkSample } from './types';
import { stepTargets } from '../components/explain/ExplainTabs';

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
  // Rechnungen gehen mit den sichtbaren Zahlen auf (AUTHORING §2), etwa „12 − 10,13 = +1,87“, nicht „= +1,88“.
  assert.deepEqual(equationsThatFail(s), [], `${label}: Rechnung geht nicht auf: ${s}`);
}
const SHORT = { maxWords: 25 }, KURZ = { maxWords: 25, maxSentences: 2 }, DEUTUNG = { maxWords: 25, maxSentences: 3 };
const ALL = (): [string, ConceptTabs][] => TAB_IDS.map(id => [id, tabsFor(id)!]);
const fixture = (name: string) => readFileSync(new URL(`./fixtures/r-output/${name}.txt`, import.meta.url), 'utf8').replace(/\n$/, '');

test('every registered explanation has tabs with Weiter, and the seven pilot concepts and both patterns have all their tabs', () => {
  for (const id of Object.keys(EXPLANATIONS)) assert.ok(tabsFor(id)?.next, `${id}: Reiter „Weiter“ fehlt (tabs[id].next)`);
  for (const id of ['mean', 'variance', 'sd', 'covariance', 'pearson', 'se', 'p_value', 'dummy']) assert.ok(tabsFor(id)?.sample && tabsFor(id)?.r, `${id}: Reiter unvollständig`);
  assert.ok(tabsFor('recode')?.r && !tabsFor('recode')?.sample, 'recode: In R, aber kein Mit 200 Befragten');
  // Ein Begriff ohne Erklärung hat keine Reiter; abgeleitet statt fest (IB20), sonst eine Kennung, die es nicht gibt.
  const unexplained = concepts.map(c => c.id).find(id => !explainFor(id) && !tabsFor(id)) ?? 'ohne_erklaerung';
  assert.equal(tabsFor(unexplained), null, unexplained);
  assert.equal(new Set(TAB_IDS).size, TAB_IDS.length);
});

test('Weiter: every target exists, every sentence follows the tone guide, no target twice anywhere in the tab', () => {
  const data = [rows, applyOp(rows, 'lernzeit', 'double')];
  for (const [id, tabs] of ALL()) {
    const n = tabs.next, items = [n.next, ...n.before, ...n.after, ...(n.more ?? [])];
    for (const item of items) {
      assert.ok(conceptById[item.id], `${id}: Ziel „${item.id}“ fehlt in concepts.ts`);
      assert.notEqual(item.id, id, `${id}: verweist auf sich selbst`);
    }
    // Von Hand: kein Ziel doppelt, auch nicht „Als Nächstes“ in einer der Listen.
    const hand = items.map(x => x.id);
    assert.equal(new Set(hand).size, hand.length, `${id}: ein Ziel steht zweimal in den Listen (auch Als Nächstes zählt)`);
    // Angezeigt (mit den Bezügen der Karte): jedes Ziel genau einmal; Sätze, die rechnen, für die Daten und nach einer Änderung.
    for (const d of data) {
      const lists = nextLists(n, edgesOf(id), { rows: d, columns: { x: ['lernzeit'], y: ['wissenstest'] } });
      const shown = [lists.next, ...lists.before, ...lists.after, ...lists.more];
      assert.equal(new Set(shown.map(x => x.id)).size, shown.length, `${id}: Weiter zeigt ein Ziel doppelt`);
      for (const x of [lists.next, ...lists.before, ...lists.after]) clean(`${id} weiter ${x.id}`, x.why, KURZ);
      const ctx = { rows: d, columns: { x: ['lernzeit'], y: ['wissenstest'] } };
      for (const x of n.more ?? []) clean(`${id} weiter (mehr) ${x.id}`, typeof x.why === 'string' ? x.why : x.why(ctx), KURZ);
    }
  }
  // Der Satz zum Standardfehler rechnet mit den aktuellen Daten (R: sd(x) / sqrt(200) = 0.2289269; verdoppelt 0.4578538).
  const why = (d: typeof rows) => nextLists(tabsFor('sd')!.next, edgesOf('sd'), { rows: d, columns: { x: ['lernzeit'] } }).next.why;
  assert.equal(why(rows), 'Wie genau kennt man den Mittelwert? Teile s durch die Wurzel aus n: 3,24 / √200 ≈ 0,23 h.');
  assert.equal(why(applyOp(rows, 'lernzeit', 'double')), 'Wie genau kennt man den Mittelwert? Teile s durch die Wurzel aus n: 6,48 / √200 ≈ 0,46 h.');
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
  // Leere Listen füllt der Reiter aus der Karte; „Als Nächstes“ steht dort nicht noch einmal.
  const fallback = nextLists({ next: { id: 'se', why: 'weil' }, before: [], after: [] }, sd);
  assert.ok(fallback.before.some(x => x.id === 'variance') && fallback.after.some(x => x.id === 'z'), 'leere Listen kommen aus der Karte');
  assert.equal(fallback.after.filter(x => x.id === 'z').length, 1);
  assert.ok(!fallback.after.some(x => x.id === 'se') && !fallback.more.some(x => x.id === 'se'), 'Als Nächstes steht nur einmal da');
  const variance = nextLists({ next: { id: 'sd', why: 'weil' }, before: [], after: [] }, edgesOf('variance'));
  const all = [variance.next, ...variance.before, ...variance.after, ...variance.more].map(x => x.id);
  assert.equal(new Set(all).size, all.length, 'auch die Bezüge der Karte doppeln „Als Nächstes“ nicht');
});

/** Spalten, für die die Vorhersagen eines Reiters geschrieben sind (Brücke: `variable`, Auswertung: feste Spalten oder die Spaltenwahl). */
function columnsOf(tabs: ConceptTabs): Record<'x' | 'y', string> {
  const s = tabs.sample!;
  if (s.kind === 'bridge') { const [x, y] = s.variable.split(','); return { x, y: y ?? defaultSelection.y }; }
  return { x: s.columns?.x ?? defaultSelection.x, y: s.columns?.y ?? defaultSelection.y };
}
/**
 * Spalten x, mit denen der Reiter rechnen kann: bei Auswertungen ohne feste Spalten jede Spalte, die die Spaltenwahl
 * für den Begriff anbietet (außer der Spalte y), sonst nur die eigene (IB32).
 */
function selectableX(id: string, tabs: ConceptTabs): string[] {
  const s = tabs.sample!, cols = columnsOf(tabs);
  if (s.kind !== 'analysis' || s.columns) return [cols.x];
  return [cols.x, ...surveyColumns.filter(c => c.id !== cols.x && c.id !== cols.y && compatible(id, c, defaultSelection.likertMetric)).map(c => c.id)];
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
    assert.ok(b.value, `${id}: Brücke ohne value`);
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
  // Die Probe rechnet mit der sichtbaren 3,24: 3,24² = 10,4976 ≈ 10,5; R: var(lernzeit) = 10.4815.
  assert.equal(b.lines[5].all(c), '√10,48 ≈ 3,24 h. Probe: 3,24 · 3,24 ≈ 10,5, bis auf Rundung die 10,48.');
  assert.equal(b.lines[1].person(c), 'P002: 8,3 − 7,75 = +0,55, also 0,55 h über der Mitte.');
  // N1: Schritt 6 nennt denselben gerundeten Abstand wie Schritt 2, für jede Spalte der Spaltenwahl und jede Person.
  let differ = 0;
  for (const col of surveyColumns.filter(x => compatible('sd', x, true))) {
    const cc = bridgeContext(w.compute, 'series', rows, col.id, '', 0);
    for (const who of rows.keys()) {
      const two = b.lines[1].person({ ...cc, who }).match(/, also (.+)\.$/)?.[1], six = b.lines[5].person({ ...cc, who }).match(/ liegt (.+), also (inner|außer)halb/)?.[1];
      assert.ok(two && six, `${col.id} ${who}: Abstand nicht gefunden`);
      assert.equal(six, two, `${col.id}, ${cc.names[who]}: Schritt 6 nennt einen anderen Abstand als Schritt 2`);
      if (Math.abs(cc.s.dev[who]) !== Math.abs(shownDiff(cc.values[who], cc.s.mean))) differ++;
    }
  }
  assert.ok(differ > 0, 'Gegenprobe: genaue und gezeigte Abstände unterscheiden sich');
  const flat = (nodes: unknown[]): string => nodes.map(n => typeof n === 'string' ? n : n && typeof n === 'object' && 'part' in n ? flat((n as { part: unknown[] }).part) : '').join('');
  assert.match(flat(b.numeric(c, 6)), /= √\( 2\.085,82 \/ 199 \) ≈ √10,48 ≈ 3,24 h$/);
  assert.equal(b.metrics(c, 'sd').at(-1)!.value, '3,24 h');
  const doubled = bridgeContext(w.compute, 'series', applyOp(rows, 'lernzeit', 'double'), 'lernzeit', '', 1);
  assert.equal(b.metrics(doubled, 'sd').at(-1)!.value, '6,48 h');
  // Gebilligter Satz zum Standardfehler, aus den Daten gerechnet (Test „Weiter“ prüft auch veränderte Daten).
  assert.equal(nextLists(tabsFor('sd')!.next, edgesOf('sd'), { rows, columns: { x: ['lernzeit'] } }).next.why, 'Wie genau kennt man den Mittelwert? Teile s durch die Wurzel aus n: 3,24 / √200 ≈ 0,23 h.');
});

test('Mit 200 Befragten: analysis results resolve for the data and after every prediction', () => {
  for (const [id, tabs] of ALL()) {
    const s = tabs.sample;
    if (s?.kind !== 'analysis') continue;
    clean(`${id} kurz`, s.kurz, KURZ);
    if (s.voraussetzung) clean(`${id} Voraussetzung`, s.voraussetzung, SHORT);
    assert.ok(s.think.length >= 1, `${id}: mindestens eine Vorhersagefrage`);
    // Ohne feste Spalten: für jede Spalte, die die Spaltenwahl anbietet (IB32); Ausprobieren muss zur eigenen Spalte passen.
    for (const [n, x] of selectableX(id, tabs).entries()) {
      const cols = { ...columnsOf(tabs), x }, columns = s.columns ? Object.fromEntries(Object.entries(s.columns).map(([k, v]) => [k, [v]])) : { x: [cols.x], y: [cols.y] };
      const ctx = (data: typeof rows): SampleCtx => ({ rows: data, columns }), column = (t: ThinkSample) => columns[t.tryIt.column]?.[0] ?? cols[t.tryIt.column];
      const datasets = [rows, ...s.think.map(t => applyOp(rows, column(t), t.tryIt.op, t.tryIt.value, 1)).filter((d, k) => fitsColumn(d, column(s.think[k])))];
      if (n === 0) s.think.forEach((t, k) => { thinkClean(`${id} Vorhersage ${k + 1}`, t); assert.ok(fitsColumn(applyOp(rows, column(t), t.tryIt.op, t.tryIt.value, 1), column(t)), `${id} Vorhersage ${k + 1}: Ausprobieren passt nicht`); });
      for (const [d, data] of datasets.entries()) {
        const r = s.result(ctx(data)), l = `${id} mit ${x}, Daten ${d}`;
        clean(`${l} Deutung`, r.kurz, DEUTUNG); clean(`${l} Fachsprache`, r.fachlich); if (r.zusatz) clean(`${l} Zusatz`, r.zusatz, SHORT);
      }
    }
  }
  // Zahlen der Muster aus den Daten (R-Befehle oben).
  const p = tabsFor('p_value')!.sample!;
  assert.equal(p.kind, 'analysis');
  if (p.kind === 'analysis') {
    const r = p.result({ rows, columns: { x: ['lernzeit'], group: ['weiterbildung'] } });
    assert.match(r.kurz, /in den letzten sieben Tagen im Schnitt 7,71 Stunden gelernt, die ohne 7,78 Stunden.*Gäbe es keinen Unterschied.*p ≈ 0,88/);
    // Richtung wie R (mariposa 0.7.4): ohne minus mit Weiterbildung, t(175.8) = 0.156.
    assert.match(r.fachlich, /ohne minus mit Weiterbildung 0,07 h, t ≈ 0,16 bei 175,8 Freiheitsgraden, p ≈ 0,88/);
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
      // Feste Spalten des Reiters (live.x, IB6) gehen vor; sonst wie die Oberfläche ohne Spaltenwahl.
      const x = r.live.x ?? (r.live.fn === 'rec_frequency' ? entry?.roles.find(x => x.key === 'x')?.default[0] ?? 'lernplanung5' : 'lernzeit'), y = r.live.y ?? 'wissenstest';
      assert.ok(liveFits(r.live, x, y), `${id}: Leitaufruf passt nicht zu den Spalten ${x}, ${y}`);
      output = liveOutput(r.live, rows, x, y); code = liveCode(r.live, x, y);
    } else {
      assert.ok(entry && entry.variants[r.variant], `${id}: Leitaufruf ${r.entry}:${r.variant} fehlt im Katalog`);
      // Mit summary() (IB2) liegt die Ausgabe unter „…:summary“, der Code speichert das Ergebnis und ruft summary() auf.
      const key = `${r.entry}:${r.variant}${r.summary ? ':summary' : ''}`, captured = CATALOG_OUTPUT[key];
      assert.ok(captured?.output, `${id}: keine in R erfasste Ausgabe für ${key}`);
      assert.equal(captured.code, (r.summary ? summaryCode : analysisCode)(entry!, initialRSettings(entry!, r.variant)), `${id}: erfasster Code passt nicht zum Katalog`);
      output = captured.output; code = captured.code;
    }
    // „Kurz gesagt“ des Reiters (IB7): höchstens zwei Sätze im Ton des Sprachleitfadens; der eigene Satz ist einer.
    clean(`${id} In R Kurz gesagt`, rKurz(r, id), KURZ);
    if (r.kurz) clean(`${id} In R kurz`, r.kurz, { maxWords: 25, maxSentences: 1 });
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

test('In R: Kurz gesagt fits the lead call of each concept (IB7, IB24, IB35)', () => {
  assert.equal(rKurz(tabsFor('sd')!.r!, 'sd'), `In R rechnet mariposa dieselbe Zahl. ${R_TAP}`, 'eigener Leitaufruf');
  assert.equal(rKurz(tabsFor('covariance')!.r!, 'covariance'), `In R rechnet mariposa dieselbe Zahl. ${R_TAP}`, 'Live-Aufruf ohne Katalogeintrag');
  assert.equal(rKurz(tabsFor('p_value')!.r!, 'p_value'), `Der Begriff steckt in diesem Aufruf und in seiner Ausgabe. ${R_TAP}`, 'fremder Leitaufruf');
  for (const id of ['confidence', 'prediction_interval']) assert.ok(!rKurz(tabsFor(id)!.r!, id).includes('dieselbe Zahl'), `${id}: B8 M18`);
  assert.ok(rKurz(tabsFor('dummy')!.r!, 'dummy').startsWith('In R erledigt mariposa denselben Schritt'), 'Werkzeug');
  assert.equal(rKurz({ ...tabsFor('sd')!.r!, kurz: 'Ein eigener Satz.' }, 'sd'), `Ein eigener Satz. ${R_TAP}`);
  for (const id of ['data_import', 'data_export', 'codebook']) assert.ok(tabsFor(id)?.r?.kurz, `${id}: eigener Satz für „Kurz gesagt“ (B2, IB7)`);
});

test('In R: summary() of efa is captured in R and shows loadings, eigenvalues and communalities (IB2)', () => {
  for (let v = 0; v < entryById.efa.variants.length; v++) {
    const captured = CATALOG_OUTPUT[`efa:${v}:summary`];
    assert.ok(captured?.output.includes('Total Variance Explained') && captured.output.includes('Communalities'), `efa:${v}:summary fehlt`);
    assert.equal(captured.code, summaryCode(entryById.efa, initialRSettings(entryById.efa, v)), `efa:${v}:summary: Code`);
    assert.match(captured.code, /\nergebnis <- atlas %>%\n  efa\(.*\)\n\nsummary\(ergebnis\)$/s, `efa:${v}: gespeichert und summary()`);
  }
  // R: eigen(cor(methoden1:5)): 3.5602, 0.4136 …; Ladungen 0.8522 0.8398 0.8287 0.8567 0.8414; Quadrate 0.7262 … 0.7339
  const o = CATALOG_OUTPUT['efa:0:summary'].output;
  assert.deepEqual(['Total', '% Var.', 'PC1', 'Extraction', 'Initial'].map(m => locate(o, m)?.text), ['3.560', '71.204', '0.857', '0.726', '1.000']);
  for (const id of ['loadings', 'eigenvalues', 'communality']) assert.ok(tabsFor(id)?.r?.summary, `${id}: Leitaufruf mit summary()`);
  // Ein Aufruf, der sein Ergebnis schon speichert, bleibt, wie er ist.
  assert.equal(summaryCode(entryById.reliability, initialRSettings(entryById.reliability, 0)), analysisCode(entryById.reliability, initialRSettings(entryById.reliability, 0)));
});

test('In R: the live lead calls print exactly what R printed for the starting data', () => {
  assert.equal(liveOutput({ fn: 'describe', show: ['mean', 'sd', 'var'] }, rows, 'lernzeit'), fixture('ausgang--describe-mean-sd-var'));
  assert.equal(liveOutput({ fn: 'describe', show: ['mean'] }, rows, 'lernzeit'), fixture('ausgang--describe-mean'));
  assert.equal(liveOutput({ fn: 'describe', show: ['mean', 'sd', 'se'] }, rows, 'lernzeit'), fixture('ausgang--describe-mean-sd-se'));
  assert.equal(liveOutput({ fn: 'pearson_cor' }, rows, 'lernzeit', 'wissenstest'), fixture('ausgang--pearson'));
  assert.equal(liveOutput({ fn: 'cov' }, rows, 'lernzeit', 'wissenstest'), fixture('ausgang--kovarianz'));
  assert.equal(liveOutput({ fn: 'frequency' }, rows, 'lernplanung5'), fixture('ausgang--frequency'));
  assert.equal(liveOutput({ fn: 'describe', show: ['mean', 'sd', 'var'] }, applyOp(rows, 'lernzeit', 'outlier', 40, 1), 'lernzeit'), fixture('p002_40--describe-mean-sd-var'));
  assert.equal(liveOutput({ fn: 'rec_frequency' }, rows, 'lernplanung5'), fixture('zusatz--frequency-rev'));
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
  // IB23: „95% CI Lower“ ist eine Kopfzeile, keine Zeile mit Werten; darunter steht die untere Grenze.
  const anova = CATALOG_OUTPUT['oneway_anova:0'].output;
  assert.deepEqual(['95% CI Lower', '95% CI Upper', 'Std. Error'].map(m => locate(anova, m)?.text), ['4.926', '6.841', '0.474']);
  assert.deepEqual(['25%', '50%', '75%', 'N'].map(m => locate(CATALOG_OUTPUT['quantile:0'].output, m)?.text), ['5.800', '7.600', '9.750', '200']);
  // IB29: Zahlen mit führendem Punkt in Tabellenspalten („.021“, „<.001“), nicht in Sätzen wie „(p < .05)“.
  assert.equal(locate(CATALOG_OUTPUT['kruskal_wallis:0'].output, 'p value')?.text, '.021');
  assert.equal(locate(CATALOG_OUTPUT['linear_regression:0'].output, 'Sig.')?.text, '<.001', 'Sig. über „<.001“, mit dem Kleinerzeichen');
  assert.equal(locate('Test (Holm)\n  3 comparisons, 3 significant (p < .05)', '(Holm)')?.text, '(Holm)', 'kein Satz als Tabellenzeile');
  assert.deepEqual(locate('p = .021', 'p'), { start: 4, end: 8, text: '.021' });
});

test('tokenize: functions, arguments, columns and atlas are tappable, strings only with their own card', () => {
  const code = 'library(dplyr)\nlibrary(mariposa)\n\natlas <- read_spss("Statistikatlas-200-Befragte.sav")\n\natlas %>%\n  describe(lernzeit, show = c("mean", "sd"))';
  const parts = tokenize(code, { ...RTOKENS, '"sd"': { sym: '"sd"', term: 'Standardabweichung', kurz: 'k', fehler: 'f' } });
  assert.equal(parts.map(p => p.text).join(''), code, 'nichts geht verloren');
  const keys = parts.filter(p => p.key).map(p => p.key);
  for (const k of ['library', 'atlas', '<-', 'read_spss', '%>%', 'describe', 'lernzeit', 'show', '=', 'c', '"sd"']) assert.ok(keys.includes(k), `„${k}“ ist nicht antippbar`);
  assert.ok(!keys.includes('"mean"'), 'Zeichenketten ohne eigene Karte sind nicht antippbar');
  for (const k of ['"Statistikatlas-200-Befragte.sav"', 'dplyr', 'mariposa']) assert.ok(keys.includes(k), `„${k}“ hat eine Karte in der Codelegende`);
  assert.match(noteFor('describe')!.term, /Deskriptiver Überblick/);
  assert.match(noteFor('lernzeit')!.term, /Variable „Lernzeit“/);
});

/*
 * R (mariposa 0.7.4, atlas <- read_spss("Statistikatlas-200-Befragte.sav"); x = lernzeit, y = wissenstest):
 *   sum(x < mean(x)); sum(x > mean(x))                     # 103, 97
 *   p <- (x - mean(x)) * (y - mean(y)); sum(p)             # 1082.313
 *   sum(p > 0); sum(p < 0)                                 # 119, 81
 *   p[atlas$id == "P002"]; p[atlas$id == "P175"]           # -0.6170625, 73.20844
 *   sd(y)                                                  # 3.115753
 *   sd(x) / sqrt(200); mean(x) -/+ 2 * sd(x) / sqrt(200)   # 0.2289269; 7.293646, 8.209354
 *   max((x - mean(x))^2) / sum((x - mean(x))^2) * 100      # 5.436259 (P175)
 */
test('Mit 200 Befragten: the numbers of the pilot bridges as in R', () => {
  const m = bridgeContext(workshopFor('mittel')!.compute, 'series', rows, 'lernzeit', '', 1), bm = bridgeFor('mittel')!;
  assert.equal(bm.interpret(m, 'mean').zusatz, '103 von 200 Befragten liegen unter dem Mittelwert, 97 darüber.');
  const z = bridgeContext(workshopFor('zusammenhang')!.compute, 'pairs', rows, 'lernzeit', 'wissenstest', 1), bz = bridgeFor('zusammenhang')!;
  assert.equal(bz.lines[3].all(z), 'Plus und Minus verrechnet ergeben die 200 Produkte 1.082,31. 119 Produkte sind positiv, 81 negativ.');
  assert.equal(bz.lines[3].person(z), 'P002 steuert −0,62 zur Summe bei.');
  assert.equal(bz.lines[5].all(z), '5,44 / (3,24 · 3,12) ≈ 0,54. Im Betrag größer als sₓ · sᵧ ≈ 10,09 (mit allen Nachkommastellen) kann die Kovarianz hier nicht werden.');
  assert.equal(bz.interpret(z, 'pearson').zusatz, '119 von 200 Befragten liegen in beiden Fragen auf derselben Seite der Mitte.');
  const s = bridgeContext(workshopFor('streuung')!.compute, 'series', rows, 'lernzeit', '', 1), bs = bridgeFor('streuung')!;
  assert.equal(bs.interpret(s, 'variance').zusatz, 'Den größten Einzelbeitrag liefert P175: 5,44 % der Quadratsumme.');
  assert.equal(bs.lines[3].person(s), 'P002 steuert 0,3 h² bei, das sind 0,01 % der Quadratsumme.');
  const se = tabsFor('se')!.sample!;
  if (se.kind === 'analysis') assert.match(se.result({ rows, columns: { x: ['lernzeit'] } }).fachlich, /von 7,29 bis 8,21 h/, 'Konfidenzintervall wie in R');
});


/** Ob die Behauptung einer Vorhersage für die Ergebniszahl vorher (a) und nachher (b) stimmt. */
function holds(e: Expect, a: number | null, b: number | null): boolean {
  if (a === null || b === null || !Number.isFinite(a) || !Number.isFinite(b)) return false;
  const tol = 1e-9 * Math.max(1, Math.abs(a), Math.abs(b)), d = b - a;
  const within = (x: number, e: { atLeast?: number; atMost?: number }) => (e.atLeast === undefined || x >= e.atLeast) && (e.atMost === undefined || x <= e.atMost);
  switch (e.change) {
    case 'same': return Math.abs(d) <= tol;
    case 'factor': return Math.abs(b - e.factor * a) <= tol * Math.max(1, e.factor);
    case 'plus': return Math.abs(d - e.amount) <= tol;
    case 'sign': return Math.abs(a) > tol && Math.abs(a + b) <= tol;
    case 'up': return d > tol && within(d, e);
    case 'down': return -d > tol && within(-d, e);
    case 'weaker': return Math.abs(a) - Math.abs(b) > tol && within(Math.abs(a) - Math.abs(b), e);
    case 'stronger': return Math.abs(b) - Math.abs(a) > tol && within(Math.abs(b) - Math.abs(a), e);
    case 'equals': return Math.abs(b - e.value) <= tol;
  }
}

const deNumber = (t: string) => Number(t.replace(/\./g, '').replace(',', '.'));
/**
 * Ob die Worte der markierten Antwort zu `expect` passen; sonst der Grund. So prüft der Test die Antwort selbst und
 * nicht nur, was die Autorin in `expect` eingetragen hat. Unbekannte Worte fallen durch: dann die Tabelle ergänzen
 * (und AUTHORING §8.2).
 */
export function answerFits(answer: string, e: Expect): string | null {
  const a = answer.toLowerCase(), has = (re: RegExp) => re.test(a), is = (...c: Expect['change'][]) => c.includes(e.change);
  const bounds = e as { atLeast?: number; atMost?: number };
  let known = false;
  const need = (ok: boolean, what: string) => { known = true; return ok ? null : `„${answer}“ verlangt ${what}, expect ist ${JSON.stringify(e)}`; };
  const checks: (string | null)[] = [];
  if (has(/verdoppelt/)) checks.push(need(e.change === 'factor' && e.factor === 2, 'factor 2'));
  if (has(/vervierfacht/)) checks.push(need(e.change === 'factor' && e.factor === 4, 'factor 4'));
  if (has(/halbiert/)) checks.push(need(e.change === 'factor' && e.factor === 0.5, 'factor 0.5'));
  if (has(/vorzeichen/)) checks.push(need(is('sign'), 'sign'));
  if (has(/(bleibt|ist) (genau )?gleich|gar nicht|ändert sich nicht/) && !has(/fast gleich/)) checks.push(need(is('same'), 'same'));
  const plus = a.match(/(?:steigt|sinkt) um ([\d.,]+)/);
  if (plus) checks.push(need(e.change === 'plus' && Math.abs(e.amount) === deNumber(plus[1]), `plus ${plus[1]}`));
  else if (has(/steigt|wird größer|nimmt zu/)) checks.push(need(is('up', 'plus') || (e.change === 'factor' && e.factor > 1), 'up'));
  else if (has(/sinkt|wird kleiner|nimmt ab/)) checks.push(need(is('down') || (e.change === 'factor' && e.factor < 1), 'down'));
  if (has(/schwächer/)) checks.push(need(is('weaker'), 'weaker'));
  if (has(/stärker/)) checks.push(need(is('stronger'), 'stronger'));
  const count = a.match(/^(\d+|keine)$/);
  if (count) checks.push(need(e.change === 'equals' && e.value === (count[1] === 'keine' ? 0 : deNumber(count[1])), `equals ${count[1]}`));
  if (has(/^lauter /)) checks.push(need(is('equals'), 'equals'));
  // Größe: „deutlich“ braucht eine Untergrenze, „kaum“ oder „ein wenig“ eine Obergrenze. „kaum oder deutlich“ sagt nur die Richtung.
  const big = has(/deutlich|spürbar|stark(?!er)/), small = has(/kaum|ein wenig|etwas|fast gleich/);
  if (big && !small) checks.push(need(bounds.atLeast !== undefined, 'atLeast („deutlich“)'));
  if (small && !big) checks.push(need(bounds.atMost !== undefined, 'atMost („kaum“, „ein wenig“)'));
  if (big && small) known = true;
  if (!known) return `„${answer}“: keine bekannte Behauptung (Tabelle answerFits in tabs.test.ts und AUTHORING §8.2 ergänzen)`;
  return checks.find(c => c !== null) ?? null;
}

/**
 * Erster Fall, in dem die markierte Antwort einer Vorhersage nicht stimmt, sonst null; zählt die geprüften Fälle.
 * Datenstände: die Ausgangsdaten und die Daten nach jeder anderen Vorhersage des Reiters (bei outlier mit P002);
 * bei der eigenen Vorhersage mit outlier jede der 200 Personen.
 */
function predictionFails(id: string, tabs: ConceptTabs, s: SampleTab, t: ThinkSample, own: number, count: () => void, x?: string): string | null {
  const words = answerFits(t.options[t.correct], t.expect);
  if (words) return `${id}: ${words}`;
  const cols = { ...columnsOf(tabs), ...(x ? { x } : {}) };
  const columnOf = (axis: 'x' | 'y') => s.kind === 'analysis' && s.columns?.[axis] ? s.columns[axis] : cols[axis];
  let measure: (d: SurveyRow[]) => number | null;
  if (s.kind === 'bridge') {
    // Eine eigene Zahl der Vorhersage (`expect.measure`) gilt auch in Brücken, sonst das Ergebnis der Brücke (IB22).
    const w = workshopFor(s.workshop)!, b = bridgeFor(s.workshop)!, own = t.expect.measure, columns = { x: [cols.x], y: [cols.y] };
    measure = own ? d => own({ rows: d, columns }) : d => b.value(bridgeContext(w.compute, b.data, d, cols.x, cols.y, 0), s.variant);
  } else {
    const columns = s.columns ? Object.fromEntries(Object.entries(s.columns).map(([k, v]) => [k, [v]])) : { x: [cols.x], y: [cols.y] };
    const m = t.expect.measure ?? s.value;
    if (!m) return `${id}: Auswertung ohne value und Vorhersage ohne expect.measure`;
    measure = d => m({ rows: d, columns });
  }
  const column = columnOf(t.tryIt.column);
  const after = s.think.map((o, i) => i === own ? null : applyOp(rows, columnOf(o.tryIt.column), o.tryIt.op, o.tryIt.value, 1));
  const states = [rows, ...after.filter((d, i): d is SurveyRow[] => !!d && fitsColumn(d, columnOf(s.think[i].tryIt.column)))];
  for (const [k, state] of states.entries()) {
    const people = t.tryIt.op === 'outlier' ? state.map((_, i) => i) : [1];
    for (const who of people) {
      const next = applyOp(state, column, t.tryIt.op, t.tryIt.value, who);
      if (!fitsColumn(next, column)) continue;           // die Oberfläche lehnt das Ausprobieren dann ab
      const a = measure(state), b = measure(next);
      count();
      if (!holds(t.expect, a, b)) return `${id}${x ? ` mit ${x}` : ''}: „${t.question}“ (${t.options[t.correct]}) stimmt nicht nach Datenstand ${k}, Person ${state[who].id}: vorher ${a}, nachher ${b}`;
    }
  }
  return null;
}

/*
 * R (mariposa 0.7.4) für einzelne Fälle der Prüfung unten, x = lernzeit, w = wissenstest:
 *   sapply(1:200, function(k) { xx <- x; xx[k] <- 40; cor(xx, w) - cor(x, w) })   # −0.255 (0 Aufgaben) bis −0.004 (17 Aufgaben): r wird immer schwächer
 *   cor(replace(x, 3, 40), w)                                                      # 0.494 statt 0.539 (P003): „deutlich“ (mindestens 0,05) stimmt nicht für alle
 *   sapply(1:200, function(k) { xx <- x; xx[k] <- 40; mean(xx) - mean(x) })        # +0.108 bis +0.200: „ein wenig“
 *   sapply(1:200, function(k) { xx <- x; xx[k] <- 40; sd(xx) - sd(x) })            # +0.652 bis +0.722, nach dem Verdoppeln +0.057 bis +0.228: „steigt“, nicht „deutlich“
 */
test('Mit 200 Befragten: every prediction keeps its marked answer, for every person and after every other prediction', () => {
  assert.ok(holds({ change: 'factor', factor: 2 }, 3, 6) && !holds({ change: 'same' }, 3, 3.1) && holds({ change: 'sign' }, 0.5, -0.5) && !holds({ change: 'up', atMost: 0.25 }, 1, 1.3), 'Prüfregeln');
  assert.ok(holds({ change: 'weaker', atLeast: 0.05 }, -0.54, -0.45) && !holds({ change: 'weaker', atLeast: 0.05 }, 0.539, 0.494) && !holds({ change: 'stronger' }, 0.5, 0.4), 'Prüfregeln im Betrag');
  assert.equal(answerFits('verdoppelt sich', { change: 'factor', factor: 2 }), null, 'Wortprüfung: verdoppelt');
  assert.ok(answerFits('bleibt gleich', { change: 'factor', factor: 2 }), 'Wortprüfung: falsches expect fällt auf');
  assert.ok(answerFits('ja, deutlich', { change: 'weaker' }), 'Wortprüfung: deutlich ohne atLeast fällt auf');
  assert.ok(answerFits('irgendwie anders', { change: 'up' }), 'Wortprüfung: unbekannte Worte fallen auf');
  let checked = 0;
  const count = () => { checked++; };
  for (const [id, tabs] of ALL()) {
    const s = tabs.sample;
    if (!s) continue;
    // Ohne feste Spalten wirkt Ausprobieren auf die gewählte Spalte: jede wählbare Spalte durchrechnen (IB32).
    for (const x of selectableX(id, tabs)) for (const [own, t] of s.think.entries()) {
      const fail = predictionFails(id, tabs, s, t, own, count, x);
      assert.equal(fail, null, fail ?? '');
    }
  }
  assert.ok(checked > 2000, `nur ${checked} Fälle geprüft`);
  // F3 X1: Nach „alle doppelt so lange“ fällt eine Person auf 40 Stunden kaum noch auf; der Ablenker „bleibt fast
  // gleich“ wäre dann richtig. Ausreißerfragen mit diesem Ablenker beziehen sich deshalb auf die Ausgangsdaten, außer
  // die markierte Antwort hat eine geprüfte Untergrenze (atLeast) für jeden Datenstand.
  for (const [id, tabs] of ALL()) for (const t of tabs.sample?.think ?? [])
    if (t.tryIt.op === 'outlier' && !(t.expect && 'atLeast' in t.expect && t.expect.atLeast) && t.options.some((o, i) => i !== t.correct && /fast gleich/.test(o)))
      assert.match(t.question, /in den Ausgangsdaten/, `${id}: „${t.question}“ mit dem Ablenker „bleibt fast gleich“`);
  // Gegenprobe: die alte Vorhersage zum Ausreißer bei r („ja, deutlich“) fällt durch, egal wie expect lautet.
  const pearson = tabsFor('pearson')!, ps = pearson.sample!;
  const old = (expect: Expect): ThinkSample => ({ ...ps.think[2], question: 'Kann ein einziger Wert r bei 200 Befragten spürbar verändern?', options: ['nein, kaum', 'ja, deutlich'], correct: 1, expect });
  assert.ok(predictionFails('pearson', pearson, ps, old({ change: 'weaker' }), 2, () => {})?.includes('atLeast'), 'alte C2-Antwort ohne Untergrenze');
  assert.match(predictionFails('pearson', pearson, ps, old({ change: 'weaker', atLeast: 0.05 }), 2, () => {}) ?? '', /Person P003/, 'alte C2-Antwort mit Untergrenze');
  // Gegenprobe IB22: In einer Brücke zählt expect.measure. „bleibt gleich“ für s stimmt beim Verschieben, für den Mittelwert nicht.
  const sd = tabsFor('sd')!, sds = sd.sample!, shift = sds.think.findIndex(t => t.tryIt.op === 'shift');
  assert.ok(shift >= 0, 'sd hat eine Vorhersage mit Verschieben');
  const meanOf = (c: SampleCtx) => c.rows.reduce((a, r) => a + r.values[c.columns.x[0]], 0) / c.rows.length;
  const same = { ...sds.think[shift], options: ['bleibt gleich', 'steigt'], correct: 0 };
  assert.equal(predictionFails('sd', sd, sds, { ...same, expect: { change: 'same' } }, shift, () => {}), null, 'ohne measure: s bleibt gleich');
  assert.match(predictionFails('sd', sd, sds, { ...same, expect: { change: 'same', measure: meanOf } }, shift, () => {}) ?? '', /stimmt nicht/, 'mit measure: der Mittelwert steigt');
});

test('bridges read right for every column they can use: no middle dot from column titles, direction from the sign', () => {
  const seen = new Set<string>();
  for (const [id, tabs] of ALL()) {
    const s = tabs.sample;
    if (s?.kind !== 'bridge' || seen.has(`${s.workshop}:${s.variant}`)) continue;
    seen.add(`${s.workshop}:${s.variant}`);
    const w = workshopFor(s.workshop)!, b = bridgeFor(s.workshop)!, v = w.variants[s.variant];
    const usable = surveyColumns.filter(c => compatible(s.variant, c, true)).map(c => c.id);
    const pairs: [string, string][] = b.data === 'pairs'
      ? [...usable.filter(x => x !== 'wissenstest').map(x => [x, 'wissenstest'] as [string, string]), ...usable.filter(y => y !== 'lernzeit').map(y => ['lernzeit', y] as [string, string])]
      : usable.map(x => [x, ''] as [string, string]);
    for (const [x, y] of pairs) for (const data of b.data === 'pairs' ? [rows, applyOp(rows, y, 'reverse')] : [rows]) {
      const c = bridgeContext(w.compute, b.data, data, x, y, 1), label = `${id} mit ${x}${y ? ` und ${y}` : ''}`;
      for (let k = 0; k < v.lastStep; k++) { clean(`${label} Schritt ${k + 1}`, b.lines[k].all(c), SHORT); clean(`${label} Schritt ${k + 1} Person`, b.lines[k].person(c), SHORT); }
      const i = b.interpret(c, s.variant);
      clean(`${label} Deutung`, i.kurz, DEUTUNG); clean(`${label} Fachsprache`, i.fachlich); if (i.zusatz) clean(`${label} Zusatz`, i.zusatz, SHORT);
      clean(`${label} Voraussetzung`, b.voraussetzung(c, s.variant), SHORT);
      b.metrics(c, s.variant).forEach(m => clean(`${label} Kennzahl`, m.value));
      // Richtung aus dem Vorzeichen: gleichläufig nur bei positivem, gegenläufig nur bei negativem Ergebnis.
      const r = b.value(c, s.variant);
      if (b.data === 'pairs' && r !== null && Math.abs(r) > 0.005) {
        const text = `${i.kurz} ${b.lines[v.lastStep - 1].person(c)}`;
        if (r < 0) assert.ok(!/gleichläufig|auch höher|auch darüber|mehr lernt, löst im Wissenstest eher mehr/.test(text), `${label}: Deutung passt nicht zu r < 0: ${text}`);
        else assert.ok(!/gegenläufig|eher niedriger|eher darunter/.test(text), `${label}: Deutung passt nicht zu r > 0: ${text}`);
      }
    }
  }
  assert.ok(seen.size >= 5, 'alle Pilotbrücken geprüft');
});

/*
 * R (Lehrdatensatz, read_spss): mean(wissenstest) = 10.125, mean(erwerbstaetig) = 0.685, mean(lernzuversicht7) = 3.995,
 * mean(methoden3) = 4.035, mean(quelle_video) = 0.565, mean(arbeitsstunden) = 22.205: Mittelwerte genau auf der Hälfte.
 * Dort zeigt der Text den Abstand aus den gezeigten Zahlen („12 − 10,13 = +1,87“, exakt 1,875).
 */
test('bridges: every printed calculation adds up with the shown numbers, for every person of the main columns', () => {
  const seen = new Set<string>();
  let checked = 0;
  for (const [, tabs] of ALL()) {
    const s = tabs.sample;
    if (s?.kind !== 'bridge' || seen.has(`${s.workshop}:${s.variant}`)) continue;
    seen.add(`${s.workshop}:${s.variant}`);
    const w = workshopFor(s.workshop)!, b = bridgeFor(s.workshop)!, v = w.variants[s.variant], [ox, oy = 'wissenstest'] = s.variable.split(',');
    const usable = surveyColumns.filter(c => compatible(s.variant, c, true)).map(c => c.id);
    // Die eigene Spalte (bzw. das eigene Paar) mit allen 200, jede andere Spalte der Spaltenwahl mit jeder vierten Person.
    const cases: [string, string][] = b.data === 'pairs'
      ? [[ox, oy], ...usable.filter(x => x !== oy && x !== ox).map(x => [x, oy] as [string, string]), ...usable.filter(y => y !== ox && y !== oy).map(y => [ox, y] as [string, string])]
      : [[ox, ''], ...usable.filter(x => x !== ox).map(x => [x, ''] as [string, string])];
    for (const [x, y] of cases) {
      // Die Zeilen „für alle“ hängen nicht von der Person ab: einmal je Spalte; die Personenzeilen für jede der 200.
      const where: string = `${s.workshop}/${s.variant} mit ${x}${y ? ` und ${y}` : ''}`;
      const base: BridgeCtx<unknown> = bridgeContext(w.compute, b.data, rows, x, y, 0);
      for (let k = 0; k < v.lastStep; k++) { checked++; const t: string = b.lines[k].all(base); assert.deepEqual(equationsThatFail(t), [], `${where}, Schritt ${k + 1}: ${t}`); }
      const own = x === ox && (b.data !== 'pairs' || y === oy);
      for (const who of [...rows.keys()].filter(i => own || i % 4 === 0)) for (let k = 0; k < v.lastStep; k++) {
        checked++;
        const t: string = b.lines[k].person({ ...base, who });
        assert.deepEqual(equationsThatFail(t), [], `${where}, ${base.names[who]}, Schritt ${k + 1}: ${t}`);
      }
    }
  }
  assert.ok(checked > 50000, `nur ${checked} Zeilen geprüft`);
  // Gegenprobe: so stand es vor der Korrektur, und so fällt es auf.
  assert.deepEqual(equationsThatFail('P001: 12 − 10,13 = +1,88 und 6 − 7,75 = −1,75.'), ['12 − 10,13 = +1,88']);
  assert.deepEqual(equationsThatFail('P001: (−1,04) · (+1,87) = −1,95, aber 200 · 199 / 2 = 19.900 und 103 / 200 = 51,5 %.'), ['(−1,04) · (+1,87) = −1,95']);
  assert.deepEqual(equationsThatFail('(+1,87)² ≈ 3,52 und (−4)² = 16'), []);
  const pz = bridgeContext(workshopFor('zusammenhang')!.compute, 'pairs', rows, 'lernzeit', 'wissenstest', 0);
  assert.equal(bridgeFor('zusammenhang')!.lines[1].person(pz), 'P001: 6 − 7,75 = −1,75 und 12 − 10,13 = +1,87.');
  // R: x̄ = 7.7515, also 6 − 7.7515 = −1.7515 und (−1.7515) · 1.875 = −3.284; aus den gezeigten Teilen −3,27, darum „≈“.
  assert.match(bridgeFor('zusammenhang')!.lines[2].person(pz), /^P001: \(−1,75\) · 1,87 ≈ −3,28,/);
});

test('steps: every step that In R or a prediction points to exists in the tab the jump opens', () => {
  for (const [id, tabs] of ALL()) {
    const targets = stepTargets(explainFor(id), tabs);
    for (const m of tabs.r?.outputMap ?? []) if (m.step !== undefined)
      assert.ok(targets && m.step >= 1 && m.step <= targets.titles.length, `${id}: outputMap „${m.match}“ zeigt auf Schritt ${m.step}, den es nicht gibt`);
    if (tabs.sample?.kind === 'analysis') for (const t of tabs.sample.think)
      assert.equal(t.step, undefined, `${id}: In einer Auswertung markiert step nichts; lass es weg („${t.question}“)`);
  }
  assert.equal(stepTargets(explainFor('sd'), tabsFor('sd'))?.tab, 'sample');
  assert.deepEqual(stepTargets(explainFor('p_value'), tabsFor('p_value')), { tab: 'verstehen', titles: ['Annehmen, es gäbe keinen Unterschied', 'Den Unterschied am üblichen Schwanken messen', 'Nachsehen, wie oft der Zufall so etwas liefert'] });
  assert.equal(stepTargets(explainFor('dummy'), tabsFor('dummy'))?.tab, 'verstehen');
  assert.equal(stepTargets(explainFor('se'), tabsFor('se')), null, 'Formel als Satz hat keine Schritte zum Anspringen');
});

test('In R: every concept with mariposa calls in the catalog keeps them in its tabs', () => {
  for (const [id, tabs] of ALL()) if (entryById[id]?.variants.length)
    assert.ok(tabs.r, `${id}: Der Katalog hat Aufrufe, aber tabs[${id}].r fehlt; ohne ihn verschwindet das R-Panel`);
});

test('In R: umpolen with rules = "rev" keeps and mirrors the value labels exactly as R prints them', () => {
  // R: atlas %>% mutate(x_umgepolt = rec(x, rules = "rev")) %>% frequency(x_umgepolt), siehe fixtures/r-output/zusatz--frequency-rev*.txt
  assert.equal(liveOutput({ fn: 'rec_frequency' }, rows, 'lernplanung5'), fixture('zusatz--frequency-rev'));
  for (const v of ['lernzuversicht7', 'statistikinteresse10', 'finanzlage'])
    assert.equal(liveOutput({ fn: 'rec_frequency' }, rows, v), fixture(`zusatz--frequency-rev-${v}`).replace(/x_umgepolt/g, `${v}_umgepolt`), v);
  assert.equal(liveCode({ fn: 'rec_frequency' }, 'lernplanung5'), 'atlas %>%\n  mutate(lernplanung5_umgepolt = rec(lernplanung5, rules = "rev")) %>%\n  frequency(lernplanung5_umgepolt)');
});
