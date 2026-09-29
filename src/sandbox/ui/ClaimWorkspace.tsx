import { ArrowLeft, ArrowRight, Mic } from 'lucide-react';
import { useMemo, useState } from 'react';
import { resolveItem } from '../allbus';
import { analyse } from '../analysis';
import { itemOf, type Choice, type Claim, type ItemOption } from '../claims';
import { buildMirror } from '../multiverse';
import { questionsFor } from '../questions';
import type { SavFile } from '../readSav';
import { rScript } from '../rcode';
import { evidenceText, STEPS, stepError, type ClaimWork, type Step } from '../state';
import { Decompose } from './Decompose';
import { MirrorStep } from './Mirror';
import { QuestionsStep } from './Questions';
import { VerdictStep } from './Verdict';
import { Workbench } from './Workbench';

function usable(claim: Claim, sav: SavFile, choice: Choice): { choice: Choice; item: ItemOption } {
  try {
    return { choice, item: resolveItem(claim, sav, choice.item) };
  } catch {
    return { choice: claim.defaults, item: itemOf(claim, claim.defaults.item) };
  }
}

export function ClaimWorkspace({ sav, fileName, claim, work, onChange, onConcept }: {
  sav: SavFile;
  fileName: string;
  claim: Claim;
  work: ClaimWork;
  onChange: (work: ClaimWork) => void;
  onConcept: (id: string) => void;
}) {
  const [error, setError] = useState('');
  const { choice, item } = usable(claim, sav, work.choice);
  const current = choice === work.choice ? work : { ...work, choice };
  const result = useMemo(() => analyse(sav, claim.analysis(choice, item)), [sav, claim, choice, item]);
  const labels = { groups: claim.groupLabels(choice, item), outcome: claim.outcomeLabels(choice, item) };
  const evidence = current.evidence ? evidenceText(labels, result, current.evidence) : '–';
  const mirror = useMemo(() => current.step === 4 ? buildMirror(sav, claim, choice, item) : null, [current.step, sav, claim, choice, item]);
  const set = (patch: Partial<ClaimWork>) => { setError(''); onChange({ ...current, ...patch }); };

  function go(delta: 1 | -1) {
    const message = delta > 0 ? stepError(claim, current, item.categories.map(k => k.code)) : '';
    setError(message);
    if (message) return;
    const step = Math.min(4, Math.max(0, current.step + delta)) as Step;
    onChange({ ...current, step, reached: Math.max(current.reached, step) as Step });
  }

  return <section className="sandbox-work" aria-labelledby="sandbox-quote">
    <figure className="sandbox-quote">
      <figcaption><Mic size={15} aria-hidden="true" /> {claim.source}</figcaption>
      <blockquote id="sandbox-quote">„{claim.quote}“</blockquote>
    </figure>
    <nav className="sandbox-steps" aria-label="Schritte">
      {STEPS.map((name, i) => <button key={name} aria-current={i === current.step ? 'step' : undefined} disabled={i > current.reached}
        onClick={() => set({ step: i as Step })}>{i + 1} {name}</button>)}
    </nav>
    {current.step === 0 && <Decompose claim={claim} work={current} onChange={set} />}
    {current.step === 1 && <Workbench sav={sav} fileName={fileName} claim={claim} work={current} item={item} result={result} labels={labels} onChange={set} onConcept={onConcept} />}
    {current.step === 2 && <VerdictStep work={current} evidence={evidence} onChange={set} />}
    {current.step === 3 && <QuestionsStep
      questions={questionsFor({ sav, claim, choice, item, evidence: current.evidence, verdict: current.verdict, reason: current.reason })}
      answers={current.answers}
      onAnswer={(id, text) => set({ answers: { ...current.answers, [id]: text } })}
      onEdit={() => set({ step: 1 })}
      onConcept={onConcept} />}
    {mirror && <MirrorStep claim={claim} work={current} mirror={mirror} ownVariable={item.variable}
      evidence={evidence} script={rScript(claim, choice, item, current.base, fileName)} />}
    {error && <p className="sandbox-error" role="alert">{error}</p>}
    <div className="sandbox-nav">
      {current.step > 0 && <button onClick={() => go(-1)}><ArrowLeft size={16} aria-hidden="true" /> Zurück</button>}
      {current.step < 4 && <button className="primary" onClick={() => go(1)}>Weiter <ArrowRight size={16} aria-hidden="true" /></button>}
    </div>
  </section>;
}
