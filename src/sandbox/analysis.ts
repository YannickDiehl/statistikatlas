import { isMissingCode, type SavFile, type SavVariable } from './readSav';

export type Range = [number, number];
export type MissingMode = { mode: 'drop' } | { mode: 'allAsNo' } | { mode: 'codesAsYes'; codes: number[] };
export type Selector = { variable: string; target: Range[]; comparison: Range[] };
export type Outcome = { variable: string; positive: number[]; exclude: number[]; missing: MissingMode };
export type Analysis = { group: Selector; outcome: Outcome; weighted: boolean };
export type Table2x2 = { yes: [number, number]; no: [number, number]; n: [number, number] };
export type AnalysisResult = { table: Table2x2; target: number; comparison: number; difference: number };

export const WEIGHT_VARIABLE = 'wghtpew';
const inRanges = (x: number, ranges: Range[]) => ranges.some(([lo, hi]) => x >= lo && x <= hi);

export function variableOf(sav: SavFile, name: string): SavVariable {
  const v = sav.byName.get(name);
  if (!v) throw new Error(`Variable ${name} fehlt im Datensatz.`);
  return v;
}

/** 0 = Zielgruppe, 1 = Vergleichsgruppe, -1 = ausgeschlossen */
export function groupCodes(variable: SavVariable, selector: Selector): Int8Array {
  const out = new Int8Array(variable.values.length).fill(-1);
  variable.values.forEach((x, i) => {
    if (isMissingCode(variable, x)) return;
    if (inRanges(x, selector.target)) out[i] = 0;
    else if (inRanges(x, selector.comparison)) out[i] = 1;
  });
  return out;
}

/** 1 = ja, 0 = nein, NaN = ausgeschlossen */
export function dichotomize(variable: SavVariable, outcome: Outcome): Float64Array {
  const out = new Float64Array(variable.values.length);
  variable.values.forEach((x, i) => {
    if (isMissingCode(variable, x)) {
      const m = outcome.missing;
      out[i] = m.mode === 'allAsNo' ? 0 : m.mode === 'codesAsYes' && m.codes.includes(x) ? 1 : NaN;
    } else if (outcome.exclude.includes(x)) out[i] = NaN;
    else out[i] = outcome.positive.includes(x) ? 1 : 0;
  });
  return out;
}

export function crosstab2(groups: Int8Array, outcome: Float64Array, weights: Float64Array | null): Table2x2 {
  const t: Table2x2 = { yes: [0, 0], no: [0, 0], n: [0, 0] };
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i], y = outcome[i];
    if (g < 0 || Number.isNaN(y)) continue;
    const w = weights ? weights[i] : 1;
    if (!(w > 0)) continue;
    if (y === 1) t.yes[g] += w; else t.no[g] += w;
    t.n[g] += 1;
  }
  return t;
}

export const share = (t: Table2x2, g: 0 | 1) => t.yes[g] / (t.yes[g] + t.no[g]);

export function analyse(sav: SavFile, a: Analysis): AnalysisResult {
  const groups = groupCodes(variableOf(sav, a.group.variable), a.group);
  const outcome = dichotomize(variableOf(sav, a.outcome.variable), a.outcome);
  const table = crosstab2(groups, outcome, a.weighted ? variableOf(sav, WEIGHT_VARIABLE).values : null);
  const target = share(table, 0), comparison = share(table, 1);
  return { table, target, comparison, difference: (target - comparison) * 100 };
}

/** Anteil einer Gruppe an allen „ja“ (bzw. „nein“) beider Gruppen – die Spaltenprozente. */
export const columnShare = (t: Table2x2, g: 0 | 1, cell: 'yes' | 'no') => t[cell][g] / (t[cell][0] + t[cell][1]);
