import { analyse, type AnalysisResult } from './analysis';
import { itemOf, type Choice, type Claim, type ItemOption } from './claims';
import type { SavFile } from './readSav';

export type PathResult = { choice: Choice; levels: string[]; result: AnalysisResult };
export type DecisionWeight = { id: string; label: string; spread: number };
export type Mirror = {
  paths: PathResult[];
  own: AnalysisResult;
  ownInGrid: boolean;
  sameDirection: number;
  atLeastFive: number;
  core: number;
  targetRange: [number, number];
  weights: DecisionWeight[];
};

export function enumeratePaths(claim: Claim): { choice: Choice; levels: string[] }[] {
  let acc = [{ choice: claim.defaults, levels: [] as string[] }];
  for (const dim of claim.dimensions) {
    acc = acc.flatMap(p => dim.levels.map(l => ({ choice: l.apply(p.choice), levels: [...p.levels, l.label] })));
  }
  return acc;
}

export function buildMirror(sav: SavFile, claim: Claim, own: Choice, ownItem: ItemOption): Mirror {
  const paths = enumeratePaths(claim).map(p => ({
    ...p,
    result: analyse(sav, claim.analysis(p.choice, itemOf(claim, p.choice.item))),
  }));
  const ownAnalysis = JSON.stringify(claim.analysis(own, ownItem));
  const ownResult = analyse(sav, claim.analysis(own, ownItem));
  const sign = Math.sign(ownResult.difference);
  const targets = paths.map(p => p.result.target);
  const weights = claim.dimensions.map((dim, d) => {
    const means = dim.levels.map(l => {
      const hit = paths.filter(p => p.levels[d] === l.label);
      return hit.reduce((s, p) => s + p.result.difference, 0) / hit.length;
    });
    return { id: dim.id, label: dim.label, spread: Math.max(...means) - Math.min(...means) };
  }).sort((a, b) => b.spread - a.spread);
  return {
    paths,
    own: ownResult,
    ownInGrid: paths.some(p => JSON.stringify(claim.analysis(p.choice, itemOf(claim, p.choice.item))) === ownAnalysis),
    sameDirection: paths.filter(p => Math.sign(p.result.difference) === sign).length,
    atLeastFive: paths.filter(p => Math.sign(p.result.difference) === sign && Math.abs(p.result.difference) >= 5).length,
    core: paths.filter(p => claim.core.test(p.result)).length,
    targetRange: [Math.min(...targets), Math.max(...targets)],
    weights,
  };
}
