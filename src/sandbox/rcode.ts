import type { Range } from './analysis';
import { toRanges, type Choice, type Claim, type ItemOption } from './claims';

const bound = (x: number) => x === Infinity ? 'max' : x === -Infinity ? 'min' : String(x);
const span = ([lo, hi]: Range) => lo === hi ? bound(lo) : `${bound(lo)}:${bound(hi)}`;

type RulePart = { ranges: Range[]; value: string; label?: string };
function rules(parts: RulePart[]): string {
  const out: string[] = [];
  for (const p of parts) p.ranges.forEach((r, i) => out.push(`${span(r)}=${p.value}${i === 0 && p.label ? ` [${p.label}]` : ''}`));
  out.push('else=NA');
  return out.join('; ');
}

export type RParts = { setup: string; table: string };

export function rParts(claim: Claim, choice: Choice, item: ItemOption, base: 'row' | 'col', file: string): RParts {
  const a = claim.analysis(choice, item);
  const [targetLabel, comparisonLabel] = claim.groupLabels(choice, item);
  const [yesLabel, noLabel] = claim.outcomeLabels(choice, item);
  const groupRules = rules([
    { ranges: a.group.target, value: '1', label: targetLabel },
    { ranges: a.group.comparison, value: '2', label: comparisonLabel },
  ]);
  const o = a.outcome;
  const codes = claim.fixedOutcome ? claim.fixedOutcome.codes : item.categories.map(k => k.code);
  const no = codes.filter(k => !o.positive.includes(k) && !o.exclude.includes(k));
  const parts: RulePart[] = [];
  if (o.missing.mode === 'codesAsYes') parts.push({ ranges: toRanges(o.missing.codes), value: '1' });
  parts.push({ ranges: toRanges(o.positive), value: '1', label: yesLabel });
  parts.push({ ranges: toRanges(no), value: '0', label: noLabel });
  parts.push({ ranges: toRanges(o.exclude), value: 'NA' });
  const outcomeRules = (o.missing.mode === 'allAsNo' ? 'NA=0; ' : '') + rules(parts);
  const source = o.missing.mode === 'codesAsYes' ? `untag_na(${o.variable})` : o.variable;
  const setup = [
    'library(mariposa)',
    'library(dplyr)',
    '',
    `allbus <- read_spss("${file}")   # fehlende Angaben werden zu getaggten NAs`,
    '',
    'allbus <- allbus %>%',
    '  mutate(',
    `    ${claim.rNames.group} = rec(${a.group.variable}, rules = "${groupRules}"),`,
    `    ${claim.rNames.outcome} = rec(${source}, rules = "${outcomeRules}")`,
    '  )',
  ].join('\n');
  const weights = a.weighted ? ',\n           weights = wghtpew' : '';
  const table = `allbus %>%\n  crosstab(${claim.rNames.group}, ${claim.rNames.outcome}, percentages = "${base}"${weights})`;
  return { setup, table };
}

export function rScript(claim: Claim, choice: Choice, item: ItemOption, base: 'row' | 'col', file: string): string {
  const { setup, table } = rParts(claim, choice, item, base, file);
  return `${setup}\n\n${table} %>%\n  summary()\n`;
}
