import type { SavFile } from '../../sandbox/readSav';
import type { Note } from '../kit/Feedback';
import { de, near, parseNumber } from '../kit/numbers';
import { WORK_MODES, type WorkMode } from '../kit/PartnerToggle';
import { bool, oneOf, record, str } from '../kit/storage';
import type { TaskStatus } from '../types';
import { CLAIMED, ITEM_IDS, ITEMS, NONVOTE_EXTRAS, NOT_ELIGIBLE, R_P3_EXAMPLE, type ItemId } from './content';

/** Ein Rechenweg: welche Antworten als Misstrauen zählen, welche fehlenden Angaben als Nichtwahl, else=0, Gewicht. */
export type Way = { item: ItemId; distrust: number[]; nonvote: number[]; else0: boolean; weighted: boolean };
/** a: misstraut & nicht wählen · b: misstraut & wählen · c: übrige & nicht wählen · d: übrige & wählen */
export type Cell = 'a' | 'b' | 'c' | 'd';
export type Base = 'row' | 'col' | 'all';
export type Four = Record<Cell, number>;
export type WayTable = { way: Way; n: Four; w: Four };
export type Joint = Record<ItemId, Map<string, { item: number; vote: number; n: number; w: number }>>;

export const PARTY: Way = { item: 'pe01', distrust: [1, 2], nonvote: [], else0: false, weighted: false };
const CELLS: Cell[] = ['a', 'b', 'c', 'd'];
const zero = (): Four => ({ a: 0, b: 0, c: 0, d: 0 });
const sameSet = (a: number[], b: number[]) => a.length === b.length && [...a].sort((x, y) => x - y).every((x, i) => x === [...b].sort((p, q) => p - q)[i]);

/** Zählt einmal je Item alle Kombinationen aus Antwort und Wahlabsicht (ungewichtet und mit wghtpew). */
export function prepare(sav: SavFile): Joint {
  const pv = sav.byName.get('pv01')!, weight = sav.byName.get('wghtpew');
  const out = {} as Joint;
  for (const id of ITEM_IDS) {
    const v = sav.byName.get(id)!, codes = ITEMS[id].categories.map(c => c.code), map = new Map<string, { item: number; vote: number; n: number; w: number }>();
    for (let i = 0; i < sav.nCases; i++) {
      const x = v.values[i], p = pv.values[i];
      if (!codes.includes(x) || Number.isNaN(p)) continue;
      const key = `${x}|${p}`, cell = map.get(key) ?? { item: x, vote: p, n: 0, w: 0 };
      cell.n += 1;
      cell.w += weight ? weight.values[i] : 1;
      map.set(key, cell);
    }
    out[id] = map;
  }
  return out;
}

/** Nichtwahl-Dummy wie rec(untag_na(pv01), "91=1; -8=1; 1:90=0; else=NA"): 1, 0 oder null (fällt heraus). */
function voteDummy(p: number, way: Way): 0 | 1 | null {
  if (p === 91 || way.nonvote.includes(p)) return 1;
  if (p >= 1 && p <= 90) return 0;
  return way.else0 ? 0 : null;
}

export function fourfold(joint: Joint, way: Way): WayTable {
  const n = zero(), w = zero();
  for (const c of joint[way.item].values()) {
    const y = voteDummy(c.vote, way);
    if (y === null) continue;
    const cell: Cell = way.distrust.includes(c.item) ? (y ? 'a' : 'b') : (y ? 'c' : 'd');
    n[cell] += c.n;
    w[cell] += c.w;
  }
  return { way, n, w };
}

/** Prozentwert einer Zelle bei gegebener Basis – wie crosstab(percentages = "row" | "col" | "all"). */
export function percent(t: WayTable, cell: Cell, base: Base): number {
  const f = t.way.weighted ? t.w : t.n;
  const den = base === 'all' ? f.a + f.b + f.c + f.d
    : base === 'row' ? (cell === 'a' || cell === 'b' ? f.a + f.b : f.c + f.d)
    : (cell === 'a' || cell === 'c' ? f.a + f.c : f.b + f.d);
  return 100 * f[cell] / den;
}
export const cellCount = (t: WayTable, cell: Cell) => (t.way.weighted ? Math.round(t.w[cell]) : t.n[cell]);

function subsets<T>(xs: readonly T[]): T[][] {
  return Array.from({ length: 1 << xs.length }, (_, m) => xs.filter((_, i) => m & (1 << i)));
}

/** Alle Wege: 58 Zweiteilungen der drei Items × 8 Nichtwahl-Definitionen × else=0 × Gewicht = 1.856 Vierfeldertafeln. */
export function allTables(joint: Joint): WayTable[] {
  const out: WayTable[] = [];
  for (const item of ITEM_IDS) {
    const codes = ITEMS[item].categories.map(c => c.code);
    for (const distrust of subsets(codes).filter(s => s.length > 0 && s.length < codes.length)) {
      for (const nonvote of subsets(NONVOTE_EXTRAS.map(e => e.code))) {
        for (const else0 of [false, true]) for (const weighted of [false, true]) out.push(fourfold(joint, { item, distrust, nonvote, else0, weighted }));
      }
    }
  }
  return out;
}

export type Candidate = { table: WayTable; cell: Cell; base: Base; pct: number; n: number; group: number[]; side: 0 | 1 };
const groupOf = (t: WayTable, cell: Cell) => {
  const codes = ITEMS[t.way.item].categories.map(c => c.code);
  return cell === 'a' || cell === 'b' ? [...t.way.distrust].sort((x, y) => x - y) : codes.filter(c => !t.way.distrust.includes(c));
};
const wayKey = (w: Way) => [w.item, [...w.distrust].sort((a, b) => a - b).join(','), [...w.nonvote].sort((a, b) => a - b).join(','), w.else0, w.weighted].join('|');
const meaningKey = (c: Candidate) =>
  [c.table.way.item, c.group.join(','), c.side, c.base, [...c.table.way.nonvote].sort((a, b) => a - b).join(','), c.table.way.else0, c.table.way.weighted].join('|');
const index = new WeakMap<WayTable[], Map<string, WayTable>>();

/** Einfachster Weg zur selben Zahl: Nichtwahl-Codes, else=0 und Gewicht fallen weg, wenn sie Prozentwert und Zellen-n nicht ändern. */
function canonical(tables: WayTable[], t: WayTable, cell: Cell, base: Base): WayTable {
  if (!index.has(tables)) index.set(tables, new Map(tables.map(x => [wayKey(x.way), x])));
  const byKey = index.get(tables)!;
  const same = (a: WayTable, b: WayTable) => Math.abs(percent(a, cell, base) - percent(b, cell, base)) < 1e-9 && cellCount(a, cell) === cellCount(b, cell);
  let cur = t;
  const lighter = (way: Way) => { const next = byKey.get(wayKey(way)); if (next && same(next, cur)) cur = next; };
  for (const code of t.way.nonvote) lighter({ ...cur.way, nonvote: cur.way.nonvote.filter(c => c !== code) });
  if (cur.way.else0) lighter({ ...cur.way, else0: false });
  if (cur.way.weighted) lighter({ ...cur.way, weighted: false });
  return cur;
}

/** Rückwärtssuche: Welche Zellen passen zu Prozentwert (±0,1; ganzzahlig ±0,55) und Zellen-n (gewichtet ±1)? */
export function lookup(tables: WayTable[], pct: number, n: number | null, integer = Number.isInteger(pct)): Candidate[] {
  const tol = integer ? 0.55 : 0.1, seen = new Map<string, Candidate>();
  for (const t of tables) for (const cell of CELLS) for (const base of ['row', 'col', 'all'] as Base[]) {
    const p = percent(t, cell, base), count = cellCount(t, cell);
    if (!near(pct, p, tol)) continue;
    if (n !== null && (t.way.weighted ? Math.abs(n - t.w[cell]) > 1 : n !== count)) continue;
    const table = canonical(tables, t, cell, base);
    const c: Candidate = { table, cell, base, pct: p, n: count, group: groupOf(table, cell), side: cell === 'a' || cell === 'c' ? 1 : 0 };
    const key = meaningKey(c), prev = seen.get(key);
    // Vom Spiegelzwilling den Weg behalten, in dem die Gruppe selbst als „misstraut“ zählt (Zelle a/b) – dann nennt das Wegkürzel die gemeinte Lesart.
    if (!prev || ((c.cell === 'a' || c.cell === 'b') && (prev.cell === 'c' || prev.cell === 'd'))) seen.set(key, c);
  }
  return [...seen.values()];
}

const ranges = (codes: number[]) => {
  const s = [...codes].sort((a, b) => a - b), out: string[] = [];
  for (let i = 0; i < s.length;) {
    let j = i;
    while (j + 1 < s.length && s[j + 1] === s[j] + 1) j++;
    out.push(j > i ? `${s[i]}–${s[j]}` : `${s[i]}`);
    i = j + 1;
  }
  return out.join(', ');
};
const labelsOf = (item: ItemId, codes: number[]) => ITEMS[item].categories.filter(c => codes.includes(c.code)).map(c => `„${c.label}“`).join(', ');
export const groupText = (item: ItemId, codes: number[]) => `${item} ${ranges(codes)} (${labelsOf(item, codes)})`;
const extrasText = (nonvote: number[]) => NONVOTE_EXTRAS.filter(e => nonvote.includes(e.code)).map(e => e.label).join(', ');
const sideText = (side: 0 | 1, way: Way) => side
  ? `nicht wählen wollen${way.nonvote.length ? ` (samt ${extrasText(way.nonvote)})` : ''}`
  : 'wählen wollen';
const count = (x: number) => Math.round(x).toLocaleString('de-DE');
const pctText = (x: number) => `${de(x)} %`;

/** Bedeutungssatz: Wer sind die 100 %? */
export function meaning(c: Candidate): string {
  const t = c.table, f = t.way.weighted ? t.w : t.n, way = t.way;
  const group = groupText(way.item, c.group), side = sideText(c.side, way);
  const groupN = c.cell === 'a' || c.cell === 'b' ? f.a + f.b : f.c + f.d, sideN = c.side ? f.a + f.c : f.b + f.d;
  const weighted = way.weighted ? ' (gewichtet)' : '';
  if (c.base === 'row') return `Deine ${pctText(c.pct)} sind der Anteil derer, die ${side}, unter den ${count(groupN)} Befragten mit ${group}${weighted}.`;
  if (c.base === 'col') return `Deine ${pctText(c.pct)} sind der Anteil der Befragten mit ${group} unter den ${count(sideN)}, die ${side}${weighted}.`;
  return `Deine ${pctText(c.pct)} sind der Anteil der Befragten mit ${group}, die ${side}, an allen ${count(f.a + f.b + f.c + f.d)} Befragten mit gültigen Angaben${weighted}.`;
}

/** Wegkürzel für Karte und Streifen, z. B. „pe05↺ 1–2 · 91+wn“. */
export function shortcut(way: Way): string {
  const item = ITEMS[way.item], codes = item.categories.map(c => c.code);
  const shown = item.reversed ? way.distrust.map(c => Math.max(...codes) + Math.min(...codes) - c) : way.distrust;
  const extras = NONVOTE_EXTRAS.filter(e => way.nonvote.includes(e.code)).map(e => `+${e.short}`).join('');
  return `${way.item}${item.reversed ? '↺' : ''} ${ranges(shown)} · 91${extras}${way.else0 ? ' · else=0' : ''}${way.weighted ? ' · gewichtet' : ''}`;
}

const isParty = (way: Way) => way.item === PARTY.item && sameSet(way.distrust, PARTY.distrust) && !way.nonvote.length && !way.else0;
/** Die Tabelle des Parteivorstands (auch mit vertauschten Zeilen), ungewichtet. */
const partyTable = (c: Candidate) => {
  const w = c.table.way;
  return w.item === 'pe01' && (sameSet(w.distrust, [1, 2]) || sameSet(w.distrust, [3, 4])) && !w.nonvote.length && !w.else0 && !w.weighted;
};
/** Misstrauende (pe01 1–2) unter bzw. mit „würde nicht wählen“. */
const partyCell = (c: Candidate) => c.group.join() === '1,2' && c.side === 1;
const sensible = (way: Way) => {
  const item = ITEMS[way.item];
  return !way.else0 && (sameSet(way.distrust, item.strict) || sameSet(way.distrust, item.wide));
};
const unreversedPe05 = (c: Candidate) => c.table.way.item === 'pe05' && c.group.every(x => x <= 2) && c.side === 1;
const notEligible = (joint: Joint, item: ItemId) => [...joint[item].values()].filter(c => c.vote === NOT_ELIGIBLE).reduce((a, c) => a + c.n, 0);

const CHECKLIST = 'Diese Zahl finde ich unter den gut 1.800 möglichen Vierfeldertafeln nicht. Prüfe: Hast du beide Dummys mit rec() gebildet (1 = misstraut, 1 = nicht wählen)? Stimmt die Prozentbasis? Hast du die Häufigkeit aus derselben Zelle abgeschrieben?';

/** Prüfauftrag 1: Zahl nachbauen. */
export function checkP1(tables: WayTable[], joint: Joint, pctIn: string, nIn: string): Note[] {
  const pct = parseNumber(pctIn);
  if (pct === null) return [];
  const n = parseNumber(nIn), cands = lookup(tables, pct, n === null ? null : n, !pctIn.includes(',') && !pctIn.includes('.'));
  if (!cands.length) return [{ tone: 'warn', text: CHECKLIST }];
  const expected = cands.find(c => c.table.way.item === 'pe01' && partyCell(c) && c.base === 'col' && !c.table.way.nonvote.length && !c.table.way.else0);
  if (expected && !expected.table.way.weighted) {
    return [{ tone: 'ok', text: `${meaning(expected)} Genau so hat der Parteivorstand gerechnet – die Zahl stimmt.${n === null ? ' Trag noch die Häufigkeit derselben Zelle ein.' : ''}` }];
  }
  if (expected) return [{ tone: 'ok', text: `${meaning(expected)} Gewichtet ist das vertretbar; der Parteivorstand hat ungewichtet gerechnet (${de(CLAIMED, 0)} %).` }];
  const ask = n === null && cands.length > 1 ? ' Trag die Häufigkeit derselben Zelle ein, dann kann ich genauer sagen, wie du gerechnet hast.' : '';
  const party = partyNote(cands);
  if (party) return [{ ...party, text: party.text + ask }];
  const defensible = cands.find(c => sensible(c.table.way) && c.cell === 'a' && c.base === 'col' && !unreversedPe05(c));
  if (defensible) return [{ tone: 'hint', text: `${meaning(defensible)} Vertretbar anders gerechnet: ${shortcut(defensible.table.way)}. Für den Nachbau der ${CLAIMED} % brauchst du pe01 1–2 und nur „würde nicht wählen“ (91).${ask}` }];
  const trap = trapNote(cands, joint);
  if (trap) return [{ ...trap, text: trap.text + ask }];
  const shown = cands.slice(0, 3).map(meaning);
  return [{ tone: 'hint', text: (shown.length > 1 ? `Deine Zahl passt zu mehreren Wegen: ${shown.join(' – ')}` : shown[0]) + ask }];
}

/** Fehler in der Tabelle des Parteivorstands: vertauschter Nenner, alle als 100 %, andere Zelle. */
function partyNote(cands: Candidate[]): Note | null {
  const party = cands.filter(partyTable);
  const swapped = party.find(c => partyCell(c) && c.base === 'row');
  if (swapped) return { tone: 'warn', text: `${meaning(swapped)} Der Nenner ist vertauscht: Die Pressemitteilung spricht vom Anteil unter den Nichtwählenden.` };
  const total = party.find(c => partyCell(c) && c.base === 'all');
  if (total) return { tone: 'warn', text: `${meaning(total)} Hier sind alle Befragten 100 % – die Pressemitteilung meint nur die Nichtwählenden.` };
  const other = party.find(c => !partyCell(c));
  if (other) return { tone: 'warn', text: `${meaning(other)} Das ist eine andere Zelle der Tabelle – gesucht ist „misstraut“ und „würde nicht wählen“.` };
  return null;
}

function trapNote(cands: Candidate[], joint: Joint): Note | null {
  const pe05 = cands.find(unreversedPe05);
  if (pe05) return { tone: 'warn', text: `${meaning(pe05)} Bei dir zählen Zustimmende als Misstrauende – aber pe05 fragt, ob Politiker die Interessen der Bevölkerung vertreten. Lies pe05 noch einmal.` };
  const else0 = cands.find(c => c.table.way.else0);
  if (else0) return { tone: 'warn', text: `${meaning(else0)} Mit else=0 zählen bei dir auch ${count(notEligible(joint, else0.table.way.item))} Nicht-Wahlberechtigte und weitere fehlende Angaben als Wählende.` };
  return null;
}

/** Prüfauftrag 2: dieselbe Zelle mit drei Nennern. */
export function checkP2(tables: WayTable[], joint: Joint, p2: S04State['p2']): Note[] {
  const party = fourfold(joint, PARTY);
  const want: [keyof S04State['p2'], number, string][] = [
    ['rowDistrust', percent(party, 'a', 'row'), 'Von den Misstrauenden wollen so viele nicht wählen.'],
    ['rowOthers', percent(party, 'c', 'row'), 'Von den Übrigen wollen so viele nicht wählen.'],
    ['total', percent(party, 'a', 'all'), 'So groß ist die Zelle, gemessen an allen Befragten.'],
  ];
  const notes: Note[] = [];
  for (const [key, target, ok] of want) {
    const x = parseNumber(p2[key]);
    if (x === null) continue;
    const integer = !p2[key].includes(',') && !p2[key].includes('.');
    if (near(x, target, integer ? 0.55 : 0.1)) { notes.push({ tone: 'ok', text: `${pctText(target)} – stimmt. ${ok}` }); continue; }
    const hit = lookup(tables, x, null, integer).find(partyTable);
    notes.push({ tone: 'warn', text: hit ? `${meaning(hit)} Gesucht war hier eine andere Basis.` : 'Diese Zahl finde ich in der Tabelle aus Prüfauftrag 1 nicht. Hast du dieselben Dummys verwendet?' });
  }
  return notes;
}

/** Das Nenner-Bild: dieselbe Zelle in drei Nennern. */
export function denominators(joint: Joint) {
  const f = fourfold(joint, PARTY).n;
  return { cell: f.a, nonvoters: f.a + f.c, distrusting: f.a + f.b, all: f.a + f.b + f.c + f.d };
}

/** Die 18 vorbereiteten Lesarten: drei Items × eng/weit × Nichtwahl {91; +weiß nicht; +verweigert}, ungewichtet. */
export function readings(joint: Joint): { way: Way; distrusting: number; others: number }[] {
  const out: { way: Way; distrusting: number; others: number }[] = [];
  for (const item of ITEM_IDS) for (const distrust of [ITEMS[item].strict, ITEMS[item].wide]) for (const nonvote of [[], [-8], [-8, -7]]) {
    const t = fourfold(joint, { item, distrust, nonvote, else0: false, weighted: false });
    out.push({ way: t.way, distrusting: percent(t, 'a', 'row'), others: percent(t, 'c', 'row') });
  }
  return out;
}

export const declaredWay = (p3: S04State['p3']): Way => ({ item: p3.item, distrust: p3.distrust, nonvote: p3.nonvote, else0: false, weighted: p3.weighted });

/** Prüfauftrag 3: eigene Lesart. */
export function checkP3(tables: WayTable[], joint: Joint, p3: S04State['p3']): Note[] {
  const way = declaredWay(p3), item = ITEMS[p3.item], codes = item.categories.map(c => c.code);
  const notes: Note[] = [];
  if (!p3.distrust.length || p3.distrust.length === codes.length) return [{ tone: 'hint', text: 'Wähle, welche Antworten als Misstrauen zählen – nicht alle und nicht keine.' }];
  if (item.reversed && p3.distrust.every(c => c <= 2)) notes.push({ tone: 'warn', text: 'Wer pe05 zustimmt, sagt: Politiker vertreten die Interessen der Bevölkerung. Misst deine Gruppe wirklich Misstrauen?' });
  if (isParty(way) && !way.weighted) notes.push({ tone: 'hint', text: 'Das ist genau der Weg des Parteivorstands. Ändere mindestens eine Entscheidung: Item, Grenze, „weiß nicht“ oder Gewicht.' });
  const t = fourfold(joint, way);
  const a = parseNumber(p3.rowDistrust), c = parseNumber(p3.rowOthers), n = parseNumber(p3.n);
  if (a === null) return notes;
  const tol = (s: string) => (!s.includes(',') && !s.includes('.') ? 0.55 : 0.1);
  const okA = near(a, percent(t, 'a', 'row'), tol(p3.rowDistrust)), okC = c === null || near(c, percent(t, 'c', 'row'), tol(p3.rowOthers));
  const okN = n === null || (way.weighted ? Math.abs(n - t.w.a) <= 1 : n === t.n.a);
  if (okA && okC && okN) {
    notes.push({ tone: 'ok', text: `Stimmt für deine Lesart ${shortcut(way)}: Von den Misstrauenden wollen ${pctText(percent(t, 'a', 'row'))} nicht wählen${c === null ? '' : `, von den Übrigen ${pctText(percent(t, 'c', 'row'))}`}.` });
    return notes;
  }
  if (okA) {
    if (!okC) notes.push({ tone: 'warn', text: `Die Misstrauenden stimmen für ${shortcut(way)}. Der Wert der Übrigen passt nicht – lies die Zeile „misstraut nicht“ in der Spalte „würde nicht wählen“ ab.` });
    if (!okN) notes.push({ tone: 'warn', text: `Die Prozente stimmen für ${shortcut(way)}, die Häufigkeit nicht – trag die Zahl aus der Zelle „misstraut“ und „würde nicht wählen“ ein.` });
    return notes;
  }
  // Zeilenprozente der Nichtwählenden; zuerst Wege mit demselben Item und derselben Gewichtung.
  const rank = (x: Candidate) => (x.table.way.item === way.item ? 0 : 2) + (x.table.way.weighted === way.weighted ? 0 : 1);
  const found = lookup(tables, a, n, tol(p3.rowDistrust) > 0.1).filter(x => x.base === 'row' && x.side === 1).sort((x, y) => rank(x) - rank(y));
  const flipped = item.reversed && !p3.distrust.every(code => code <= 2) ? found.find(unreversedPe05) : undefined;
  const forgotUntag = found.find(x => x.table.way.item === way.item && sameSet(x.group, [...way.distrust].sort((p, q) => p - q)) && !x.table.way.nonvote.length && way.nonvote.length);
  if (flipped) notes.push({ tone: 'warn', text: `${meaning(flipped)} Die Richtung ist gekippt: Bei dir zählen Zustimmende zu pe05 als Misstrauende. rules = "rev" vergessen oder die Regel von pe01 kopiert?` });
  else if (forgotUntag) notes.push({ tone: 'warn', text: `${meaning(forgotUntag)} Deine „weiß nicht“-Regel greift nicht: untag_na() vergessen? rec() lässt getaggte fehlende Werte stehen.` });
  else if (found[0]) notes.push({ tone: 'warn', text: `${meaning(found[0])} Das ist nicht die Lesart, die du oben festgelegt hast (${shortcut(way)}).` });
  else notes.push({ tone: 'warn', text: `Diese Zahl passt nicht zu deiner Lesart ${shortcut(way)}. Prüfe Umpolen, Grenze und die Nichtwahl-Regel.` });
  return notes;
}

/** Zusatz: Misstrauens-Zähler – Nichtwahl-Anteil je Stufe (0–3 misstrauische Antworten). */
export function stairs(sav: SavFile): { step: number; n: number; share: number }[] {
  const get = (name: string) => sav.byName.get(name)!;
  const pe01 = get('pe01'), pa35 = get('pa35'), pe05 = get('pe05'), pv = get('pv01');
  const dummy = (v: typeof pe01, yes: number[], no: number[], i: number) => (yes.includes(v.values[i]) ? 1 : no.includes(v.values[i]) ? 0 : null);
  const out = [0, 1, 2, 3].map(step => ({ step, n: 0, yes: 0 }));
  for (let i = 0; i < sav.nCases; i++) {
    const ds = [dummy(pe01, [1, 2], [3, 4], i), dummy(pa35, [1, 2], [3, 4, 5], i), dummy(pe05, [3, 4], [1, 2], i)];
    const y = voteDummy(pv.values[i], PARTY);
    if (ds.some(d => d === null) || y === null) continue;
    const k = ds.reduce<number>((s, d) => s + (d ?? 0), 0);
    out[k].n += 1;
    out[k].yes += y;
  }
  return out.map(o => ({ step: o.step, n: o.n, share: 100 * o.yes / o.n }));
}

export function checkExtra(sav: SavFile, input: string): Note[] {
  const x = parseNumber(input);
  if (x === null) return [];
  const top = stairs(sav)[3];
  return near(x, top.share, !input.includes(',') && !input.includes('.') ? 0.55 : 0.1)
    ? [{ tone: 'ok', text: `Stimmt: Von den ${count(top.n)}, die allen drei Aussagen misstrauisch zustimmen, wollen ${pctText(top.share)} nicht wählen – die übrigen ${pctText(100 - top.share)} wollen wählen.` }]
    : [{ tone: 'warn', text: 'Das ist nicht die oberste Stufe. Lies in der Zeile misstrauen_zahl = 3 den Anteil „würde nicht wählen“ ab.' }];
}

/* ---------- Urteil, Gegenfragen, Zustand ---------- */

export const VERDICTS = ['stimmt', 'stimmt teilweise', 'irreführend', 'falsch', 'mit diesen Daten nicht prüfbar'] as const;
export const CAUSAL_WORDS = /\b(weil|deshalb|daher|darum|führt|führen|verursach\w*|liegt an|wegen|Grund|bewirk\w*|abhält|hält\s+ab)\b/i;
export type Question = { id: string; title: string; text: string; concept?: string };

export function questions(joint: Joint, s: S04State): Question[] {
  const out: Question[] = [];
  if (CAUSAL_WORDS.test(`${s.reason} ${s.sentence}`)) {
    out.push({ id: 'causal', title: 'Du nennst eine Ursache.', concept: 'causality',
      text: 'Zeigen die Daten, dass Misstrauen vom Wählen abhält – oder nur, dass beides zusammen auftritt? Denk an Drittvariablen wie Alter, Bildung oder politisches Interesse und an die umgekehrte Richtung.' });
  }
  const way = declaredWay(s.p3), dk = way.nonvote.includes(-8);
  // Zahlen erst nennen, wenn die eigene Rechnung stimmt – sonst verrieten die Gegenfragen die Lösung.
  const own = parseNumber(s.p3.rowDistrust), p1 = parseNumber(s.p1.pct);
  if (way.distrust.length && own !== null && near(own, percent(fourfold(joint, way), 'a', 'row'), 0.55)) {
    const now = percent(fourfold(joint, way), 'a', 'row');
    const alt = percent(fourfold(joint, { ...way, nonvote: dk ? way.nonvote.filter(c => c !== -8) : [...way.nonvote, -8] }), 'a', 'row');
    out.push({ id: 'dk', title: 'Was ist mit „weiß nicht“?', concept: 'missing_tools',
      text: dk
        ? `Du zählst „weiß nicht“ als Nichtwahl. Ohne sie wollen ${pctText(alt)} der Misstrauenden nicht wählen statt ${pctText(now)}. Ist Unentschlossenheit schon Nichtwahl?`
        : `Zählst du „weiß nicht“ als Nichtwahl, wollen ${pctText(alt)} der Misstrauenden nicht wählen statt ${pctText(now)}. Was bedeutet „weiß nicht“ bei einer Wahlabsicht?` });
  }
  if (p1 !== null && near(p1, percent(fourfold(joint, PARTY), 'a', 'col'), 0.55)) {
    const d = denominators(joint);
    out.push({ id: 'size', title: 'Wie viele Menschen stehen hinter der Zahl?', concept: 'sampling',
      text: `Hinter den ${CLAIMED} % stehen ${count(d.nonvoters)} Nichtwählende, in der Zelle ${count(d.cell)} Menschen. Wie sicher ist eine Aussage über alle Nichtwähler in Deutschland auf dieser Grundlage?` });
  }
  out.push({ id: 'intention', title: 'Absicht ist nicht Verhalten.', concept: 'measurement_error',
    text: 'Die Daten zeigen eine Wahlabsicht, keine tatsächliche Wahl. Was kann zwischen Befragung und Wahltag passieren – und wie offen antwortet man auf die Frage, ob man wählen geht?' });
  return out.slice(0, 3);
}

export type S04State = {
  mode: WorkMode;
  guess: string;
  p1: { pct: string; n: string };
  p2: { rowDistrust: string; rowOthers: string; total: string };
  p3: { item: ItemId; distrust: number[]; nonvote: number[]; weighted: boolean; rowDistrust: string; rowOthers: string; n: string };
  verdict: number | null;
  reason: string;
  sentence: string;
  extra: string;
};

export const initialS04 = (): S04State => ({
  mode: 'solo', guess: '', p1: { pct: '', n: '' }, p2: { rowDistrust: '', rowOthers: '', total: '' },
  p3: { item: 'pe05', distrust: [3, 4], nonvote: [-8], weighted: false, rowDistrust: '', rowOthers: '', n: '' },
  verdict: null, reason: '', sentence: '', extra: '',
});

const codeList = (x: unknown, allowed: number[]) => (Array.isArray(x) ? [...new Set(x.filter((c): c is number => allowed.includes(c as number)))] : []);

export function parseS04(raw: unknown): S04State {
  const r = record(raw), p1 = record(r.p1), p2 = record(r.p2), p3 = record(r.p3), init = initialS04();
  const item = oneOf(p3.item, ITEM_IDS, init.p3.item);
  const verdict = typeof r.verdict === 'number' && Number.isInteger(r.verdict) && r.verdict >= 0 && r.verdict < VERDICTS.length ? r.verdict : null;
  return {
    mode: oneOf(r.mode, WORK_MODES, 'solo'), guess: str(r.guess, 300),
    p1: { pct: str(p1.pct, 12), n: str(p1.n, 12) },
    p2: { rowDistrust: str(p2.rowDistrust, 12), rowOthers: str(p2.rowOthers, 12), total: str(p2.total, 12) },
    p3: {
      item, distrust: 'distrust' in p3 ? codeList(p3.distrust, ITEMS[item].categories.map(c => c.code)) : init.p3.distrust,
      nonvote: 'nonvote' in p3 ? codeList(p3.nonvote, NONVOTE_EXTRAS.map(e => e.code)) : init.p3.nonvote,
      weighted: bool(p3.weighted), rowDistrust: str(p3.rowDistrust, 12), rowOthers: str(p3.rowOthers, 12), n: str(p3.n, 12),
    },
    verdict, reason: str(r.reason, 600), sentence: str(r.sentence, 600), extra: str(r.extra, 12),
  };
}

export function statusS04(s: S04State): TaskStatus {
  if (s.p1.pct.trim() && s.p2.rowDistrust.trim() && s.p3.rowDistrust.trim() && s.verdict !== null && s.sentence.trim()) return 'done';
  const texts = [s.guess, s.p1.pct, s.p1.n, s.p2.rowDistrust, s.p2.rowOthers, s.p2.total, s.p3.rowDistrust, s.p3.rowOthers, s.p3.n, s.reason, s.sentence, s.extra];
  return texts.some(t => t.trim()) || s.verdict !== null ? 'running' : 'open';
}

export function plenumLines(s: S04State): [string, string][] {
  const a = parseNumber(s.p3.rowDistrust), c = parseNumber(s.p3.rowOthers);
  return [
    [`Die ${CLAIMED} % beziehen sich auf alle, die …`, s.guess.trim()],
    ['Meine Lesart', s.p3.rowDistrust.trim() ? shortcut(declaredWay(s.p3)) : ''],
    ['Misstrauende · Übrige (nicht wählen)', a === null ? '' : `${de(a)} % · ${c === null ? '–' : `${de(c)} %`}`],
    ['Urteil', s.verdict === null ? '' : VERDICTS[s.verdict]],
    ['Faktencheck-Satz', s.sentence.trim()],
  ];
}

/** R-Code der eigenen Lesart (Hilfestufe 4 in Prüfauftrag 3). */
export function rCodeFor(way: Way): string {
  const item = ITEMS[way.item], codes = item.categories.map(c => c.code);
  if (!way.distrust.length || way.distrust.length === codes.length) return R_P3_EXAMPLE;
  const shown = item.reversed ? way.distrust.map(c => Math.max(...codes) + Math.min(...codes) - c) : way.distrust;
  const rest = codes.filter(c => !shown.includes(c));
  const rule = (xs: number[], value: number, label: string) => ranges(xs).split(', ').map((r, i) => `${r.replace('–', ':')}=${value}${i === 0 ? ` [${label}]` : ''}`).join('; ');
  const source = item.reversed ? `${way.item}_r` : way.item;
  const extras = NONVOTE_EXTRAS.filter(e => way.nonvote.includes(e.code)).map(e => `${e.code}=1; `).join('');
  const lines = [
    'allbus <- allbus %>%',
    '  mutate(',
    ...(item.reversed ? [`    ${way.item}_r = rec(${way.item}, rules = "rev"),   # umgepolt: jetzt 1 = stimme gar nicht zu`] : []),
    `    misstrauen3 = rec(${source}, rules = "${rule(shown, 1, 'misstraut')}; ${rule(rest, 0, 'misstraut nicht')}; else=NA"),`,
    `    nichtwahl3  = rec(${way.nonvote.length ? 'untag_na(pv01)' : 'pv01'}, rules = "91=1 [würde nicht wählen]; ${extras}1:90=0 [würde wählen]; else=NA")`,
    '  )',
    `allbus %>% crosstab(misstrauen3, nichtwahl3, percentages = "row"${way.weighted ? ', weights = wghtpew' : ''}) %>% summary()`,
  ];
  return lines.join('\n');
}
