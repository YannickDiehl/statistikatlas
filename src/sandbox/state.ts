import { columnShare, type AnalysisResult } from './analysis';
import { claims, type Choice, type Claim } from './claims';
import { pct } from './format';
import type { Mirror } from './multiverse';
import { VERDICTS, type Evidence, type Verdict } from './questions';

export const missionStorageKey = 'statistikatlas.missionen.v1';
export type Step = 0 | 1 | 2 | 3 | 4;
export const STEPS = ['Zerlegen', 'Werkbank', 'Urteil', 'Gegenfragen', 'Spiegel'] as const;

export type ClaimWork = {
  step: Step;
  reached: Step;
  gaps: string[];
  choice: Choice;
  base: 'row' | 'col';
  evidence: Evidence | null;
  verdict: Verdict | null;
  reason: string;
  answers: Record<string, string>;
};
export type MissionStore = { work: Partial<Record<Claim['id'], ClaimWork>> };
export type MissionStatus = 'open' | 'running' | 'done';

export const initialWork = (claim: Claim): ClaimWork => ({
  step: 0, reached: 0, gaps: claim.gaps.map(() => ''), choice: structuredClone(claim.defaults),
  base: 'row', evidence: null, verdict: null, reason: '', answers: {},
});
export const emptyStore = (): MissionStore => ({ work: {} });

export function missionStatus(work: ClaimWork | undefined): MissionStatus {
  if (!work) return 'open';
  if (work.reached === 4) return 'done';
  return work.reached > 0 || work.gaps.some(g => g.trim()) ? 'running' : 'open';
}

const isStep = (x: unknown): x is Step => typeof x === 'number' && [0, 1, 2, 3, 4].includes(x);
const isNumArray = (x: unknown): x is number[] => Array.isArray(x) && x.every(n => typeof n === 'number' && Number.isFinite(n));
const text = (x: unknown, max: number) => typeof x === 'string' ? x.slice(0, max) : '';

function parseChoice(claim: Claim, raw: unknown): Choice {
  const d = claim.defaults;
  if (!raw || typeof raw !== 'object') return structuredClone(d);
  const r = raw as Record<string, unknown>;
  const missing = claim.missingOptions.find(o => JSON.stringify(o.mode) === JSON.stringify(r.missing))?.mode ?? d.missing;
  const cutOk = typeof r.cut === 'number' && claim.cutRange !== null && r.cut >= claim.cutRange[0] && r.cut <= claim.cutRange[1];
  return {
    item: typeof r.item === 'string' && /^[a-z0-9_]{1,32}$/i.test(r.item) ? r.item : d.item,
    positive: isNumArray(r.positive) ? r.positive : [...d.positive],
    cut: cutOk ? r.cut as number : d.cut,
    comparison: claim.comparisons.some(k => k.id === r.comparison) ? r.comparison as string : d.comparison,
    missing: structuredClone(missing),
    exclude: isNumArray(r.exclude) ? r.exclude : [...d.exclude],
    weighted: typeof r.weighted === 'boolean' ? r.weighted : d.weighted,
  };
}

function parseEvidence(raw: unknown): Evidence | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if ((r.row !== 0 && r.row !== 1) || (r.cell !== 'yes' && r.cell !== 'no') || (r.base !== 'row' && r.base !== 'col')) return null;
  return { row: r.row, cell: r.cell, base: r.base };
}

export function parseStore(raw: string | null): MissionStore {
  try {
    const input: unknown = JSON.parse(raw || '{}');
    if (!input || typeof input !== 'object' || Array.isArray(input)) return emptyStore();
    const r = input as Record<string, unknown>;
    const store = emptyStore();
    const work = r.work && typeof r.work === 'object' ? r.work as Record<string, unknown> : {};
    for (const claim of claims) {
      const w = work[claim.id];
      if (!w || typeof w !== 'object') continue;
      const x = w as Record<string, unknown>;
      const answers: Record<string, string> = {};
      if (x.answers && typeof x.answers === 'object') {
        for (const [k, v] of Object.entries(x.answers)) if (typeof v === 'string') answers[k] = v.slice(0, 4000);
      }
      const step = isStep(x.step) ? x.step : 0;
      store.work[claim.id] = {
        step,
        reached: isStep(x.reached) && x.reached >= step ? x.reached : step,
        gaps: claim.gaps.map((_, i) => Array.isArray(x.gaps) ? text(x.gaps[i], 300) : ''),
        choice: parseChoice(claim, x.choice),
        base: x.base === 'col' ? 'col' : 'row',
        evidence: parseEvidence(x.evidence),
        verdict: typeof x.verdict === 'number' && [0, 1, 2, 3, 4].includes(x.verdict) ? x.verdict as Verdict : null,
        reason: text(x.reason, 4000),
        answers,
      };
    }
    return store;
  } catch {
    return emptyStore();
  }
}

/** Leerer Text, wenn der Schritt abgeschlossen werden darf; sonst die Meldung für die Studierenden. */
export function stepError(claim: Claim, work: ClaimWork, categories: number[]): string {
  if (work.step === 0 && work.gaps.filter(g => g.trim()).length < 3) return 'Fülle mindestens drei Lücken in eigenen Worten aus, bevor du rechnest.';
  if (work.step === 1) {
    const { positive, exclude } = work.choice;
    if (positive.length === 0) return 'Tippe mindestens eine Kategorie als „ja“ an.';
    if (claim.itemRole === 'group' && categories.every(k => positive.includes(k) || exclude.includes(k))) return 'Lass mindestens eine Kategorie für die Vergleichsgruppe übrig.';
    if (!work.evidence) return 'Tippe in der Tabelle die Zelle an, die deine Aussage belegt.';
  }
  if (work.step === 2 && work.verdict === null) return 'Wähle ein Urteil.';
  if (work.step === 2 && work.reason.trim().length < 20) return 'Begründe dein Urteil in mindestens einem Satz.';
  return '';
}

export type TableLabels = { groups: [string, string]; outcome: [string, string] };

export function evidenceText(labels: TableLabels, result: AnalysisResult, e: Evidence): string {
  const group = labels.groups[e.row];
  const answer = labels.outcome[e.cell === 'yes' ? 0 : 1];
  if (e.base === 'row') {
    const share = e.row === 0 ? result.target : result.comparison;
    return `${pct(e.cell === 'yes' ? share : 1 - share)} in der Gruppe „${group}“: ${answer}`;
  }
  return `${pct(columnShare(result.table, e.row, e.cell))} aller „${answer}“ gehören zur Gruppe „${group}“`;
}

export function factCardMarkdown(claim: Claim, work: ClaimWork, evidence: string, mirror: Mirror): string {
  const answered = Object.values(work.answers).filter(a => a.trim()).length;
  return [
    `# Faktencheck: „${claim.quote}“`,
    '',
    `Quelle: ${claim.source} · Daten: ALLBUScompact 2023 (ZA8831), GESIS`,
    '',
    `**Urteil:** ${work.verdict === null ? '–' : VERDICTS[work.verdict]}`,
    '',
    work.reason.trim() || '(keine Begründung)',
    '',
    `**Beleg:** ${evidence}`,
    '',
    `**Tragfähigkeit:** Die Richtung trägt in ${mirror.sameDirection} von ${mirror.paths.length} vertretbaren Auswertungswegen${mirror.ownInGrid ? '' : ' (dein Weg liegt außerhalb der vorbereiteten Wege)'}.`,
    '',
    '## Zerlegung',
    ...claim.gaps.map(([q], i) => `- ${q} ${work.gaps[i]?.trim() || '–'}`),
    '',
    `Gegenfragen beantwortet: ${answered}`,
    '',
  ].join('\n');
}
