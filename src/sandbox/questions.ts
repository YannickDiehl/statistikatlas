import { analyse, columnShare, type AnalysisResult } from './analysis';
import type { Choice, Claim, ItemOption } from './claims';
import { count, num1, pct } from './format';
import type { SavFile } from './readSav';

export type Evidence = { row: 0 | 1; cell: 'yes' | 'no'; base: 'row' | 'col' };
export type Verdict = 0 | 1 | 2 | 3 | 4;
export const VERDICTS = ['stimmt', 'stimmt teilweise', 'irreführend', 'falsch', 'mit diesen Daten nicht prüfbar'] as const;
export const NOT_TESTABLE: Verdict = 4;

export type QuestionContext = {
  sav: SavFile;
  claim: Claim;
  choice: Choice;
  item: ItemOption;
  evidence: Evidence | null;
  verdict: Verdict | null;
  reason: string;
};
export type Question = { id: string; title: string; text: string; concept?: string };

const points = (x: number) => `${num1(x)} Punkten`;
const sorted = (a: number[]) => JSON.stringify([...a].sort((x, y) => x - y));
const same = (a: number[], b: number[]) => sorted(a) === sorted(b);
export const CAUSAL_WORDS = /\b(weil|deshalb|daher|darum|führt|führen|verursach\w*|liegt an|wegen|Grund|bewirk\w*)\b/i;

export function questionsFor(ctx: QuestionContext): Question[] {
  const { sav, claim, choice, item } = ctx;
  const run = (c: Choice, i: ItemOption = item): AnalysisResult => analyse(sav, claim.analysis(c, i));
  const cur = run(choice);
  const [target] = claim.groupLabels(choice, item);
  const [yes] = claim.outcomeLabels(choice, item);
  const out: Question[] = [];

  if (!choice.weighted) {
    const alt = run({ ...choice, weighted: true });
    const east = sav.byName.get('eastwest');
    const eastShare = east ? Array.from(east.values).filter(x => x === 2).length / sav.nCases : NaN;
    const colBased = ctx.evidence?.base === 'col';
    const now = colBased ? columnShare(cur.table, ctx.evidence!.row, ctx.evidence!.cell) : cur.target;
    const then = colBased ? columnShare(alt.table, ctx.evidence!.row, ctx.evidence!.cell) : alt.target;
    out.push(Math.abs(now - then) < 0.01
      ? { id: 'weight', title: 'Du hast ungewichtet gerechnet.', concept: 'weights',
          text: `Gewichtet ändert sich dein Wert kaum (${pct(then)} statt ${pct(now)}). Warum wirkt das Gewicht hier so wenig – und bei welcher Aussage würde es viel ändern? Tipp: wghtpew gleicht vor allem aus, dass der Osten überproportional befragt wurde.` }
      : { id: 'weight', title: 'Du hast ungewichtet gerechnet.', concept: 'weights',
          text: `Im ALLBUS stammen ${pct(eastShare)} der Befragten aus dem Osten, in der Bevölkerung sind es deutlich weniger. Gewichtet mit wghtpew wären es ${pct(then)} statt ${pct(now)}. Ändert das dein Urteil?` });
  }

  if (claim.temporal && ctx.verdict !== null && ctx.verdict !== 4) {
    out.push({ id: 'temporal', title: 'Die Behauptung spricht von einer Veränderung.',
      text: 'Die Befragung stammt aus 2023 und zeigt einen Zustand. Womit müsstest du vergleichen, um „nicht mehr“ oder „noch“ zu prüfen? Tipp: Die ALLBUS-Kumulation enthält Wellen seit 1980.' });
  }

  if (item.strict.length && item.wide.length) {
    const altCodes = same(choice.positive, item.wide) ? item.strict : item.wide;
    const alt = run({ ...choice, positive: altCodes });
    const labels = item.categories.filter(k => altCodes.includes(k.code)).map(k => k.label).join(', ');
    out.push({ id: 'threshold', title: 'Deine Grenze entscheidet mit.', concept: 'operationalization',
      text: `Zählst du „${labels}“ als „${claim.itemRole === 'outcome' ? yes : target}“, läge der Anteil „${yes}“ in der Gruppe „${target}“ bei ${pct(alt.target)} statt ${pct(cur.target)}, der Abstand bei ${points(alt.difference)} statt ${points(cur.difference)}. Wo ziehst du die Grenze – und warum dort?` });
  }

  if (ctx.evidence && ctx.evidence.base === 'col') {
    out.push({ id: 'base', title: 'Deine Prozentbasis passt nicht zur Behauptung.', concept: 'crosstab',
      text: `Dein Beleg sagt, wie sich eine Antwort auf die Gruppen verteilt (Spaltenprozente). Die Behauptung handelt davon, wie viele in der Gruppe „${target}“ „${yes}“ sind – das sind Zeilenprozente: ${pct(cur.target)}.` });
  }

  const cell = ctx.evidence ? Math.round(cur.table.n[ctx.evidence.row] * (ctx.evidence.cell === 'yes' ? cur.target : 1 - cur.target)) : Infinity;
  if (cur.table.n[0] < 500 || cell < 30) {
    out.push({ id: 'size', title: 'Wie viele Menschen stehen hinter deiner Zahl?', concept: 'sampling',
      text: `Die Gruppe „${target}“ umfasst ${count(cur.table.n[0])} Befragte${Number.isFinite(cell) ? `, deine Belegzelle etwa ${cell}` : ''}. Wie sicher ist eine Aussage über alle in Deutschland auf dieser Grundlage?` });
  }

  if (CAUSAL_WORDS.test(ctx.reason)) {
    out.push({ id: 'causal', title: 'Du nennst eine Ursache.', concept: 'causality',
      text: `Zeigen die Daten, warum sich die Gruppen unterscheiden – oder nur, dass sie es tun? Welche Drittvariable, ${claim.thirdVariables}, könnte beides erklären?` });
  }

  const other = claim.items.find(i => i.variable !== choice.item);
  if (other) {
    const altCodes = item.wide.length && same(choice.positive, item.wide) ? other.wide : other.strict;
    const alt = run({ ...choice, item: other.variable, positive: altCodes, exclude: [] }, other);
    out.push({ id: 'item', title: 'Misst dein Item, was die Behauptung meint?', concept: 'operationalization',
      text: `Mit ${other.variable} („${other.title}“) läge der Abstand bei ${points(alt.difference)} statt ${points(cur.difference)}. Welches Item trifft die Behauptung genauer – und warum?` });
  }

  const codesOption = claim.missingOptions.find(o => o.mode.mode === 'codesAsYes');
  if (choice.missing.mode !== 'drop') {
    const alt = run({ ...choice, missing: { mode: 'drop' } });
    out.push({ id: 'missing', title: 'Du zählst fehlende Angaben mit.', concept: 'missing',
      text: `Ohne sie läge der Anteil „${yes}“ in der Gruppe „${target}“ bei ${pct(alt.target)} statt ${pct(cur.target)}. Was sagt eine fehlende Angabe hier eigentlich aus?` });
  } else if (codesOption) {
    const alt = run({ ...choice, missing: codesOption.mode });
    out.push({ id: 'missing', title: 'Was ist mit „weiß nicht“?', concept: 'missing',
      text: `Du schließt „weiß nicht“ aus. Zählst du es als „${yes}“ (${codesOption.label}), läge der Anteil bei ${pct(alt.target)} statt ${pct(cur.target)}. Was bedeutet „weiß nicht“ bei einer Wahlabsicht?` });
  }

  if (item.split) {
    const v = sav.byName.get(choice.item);
    const asked = v ? Array.from(v.values).filter(x => x !== -11).length / sav.nCases : NaN;
    out.push({ id: 'split', title: 'Nur ein Teil wurde gefragt.', concept: 'random_sampling',
      text: `Diese Frage wurde nur ${pct(asked)} der Befragten gestellt (Fragebogensplit). Was bedeutet das für die Fallzahl – und warum verzerrt es das Ergebnis nicht, wenn die Teilgruppen zufällig gebildet wurden?${choice.missing.mode === 'allAsNo' ? ' Achtung: Du zählst gerade auch alle Nicht-Gefragten als „nein“.' : ''}` });
  }

  if (claim.intention) {
    out.push({ id: 'intention', title: 'Absicht ist nicht Verhalten.', concept: 'measurement_error',
      text: 'Die Daten zeigen eine Wahlabsicht, keine tatsächliche Wahl. Was kann zwischen Befragung und Wahltag passieren – und wie offen antwortet man auf die Frage, ob man wählen geht?' });
  }

  if (claim.midpoint !== null && !choice.exclude.includes(claim.midpoint) && !choice.positive.includes(claim.midpoint)) {
    const alt = run({ ...choice, exclude: [...choice.exclude, claim.midpoint] });
    out.push({ id: 'midpoint', title: 'Die Mitte zählt bei dir als „nein“.', concept: 'ordinal',
      text: `Wer ${claim.midpoint} angibt, liegt genau in der Mitte. Ohne diese Antworten läge der Anteil „${yes}“ in der Gruppe „${target}“ bei ${pct(alt.target)} statt ${pct(cur.target)}. Ist die Mitte Misstrauen?` });
  }

  return out;
}
