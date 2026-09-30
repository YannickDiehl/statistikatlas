import type { ReactNode } from 'react';
import { Feedback, type Note } from '../kit/Feedback';
import { HintLadder } from '../kit/HintLadder';
import { hints, ITEM_IDS, ITEMS, R_SETUP, type ItemId } from './content';
import {
  ALPHA_NOT_FOUND, alphaVariants, checkNumber, keptOf, keyOf, labelOf, R_NOT_FOUND, rProposal, rVariants, scaffoldProposal, type Prepared, type Proposal,
} from './domain';

/** Sieben Fragen, vier davon streichen: Knöpfe mit aria-pressed = gestrichen. */
export function ItemPicker({ struck, onToggle, label }: { struck: ItemId[]; onToggle: (id: ItemId) => void; label: string }) {
  return <div className="s07-picker" role="group" aria-label={label}>
    {ITEM_IDS.map(id => {
      const on = struck.includes(id);
      return <button key={id} aria-pressed={on} disabled={!on && struck.length >= 4} onClick={() => onToggle(id)}>
        <code>{id}</code> {ITEMS[id].short}
      </button>;
    })}
  </div>;
}

/** Ein Vorschlag: vier Fragen streichen, begründen, α und Stellvertreter-Wert eintragen. */
export function ProposalStep({ which, heading, children, proposal, p, onToggle, onPatch, onConcept, extra = [] }: {
  which: 'a' | 'b';
  heading: string;
  children: ReactNode;
  proposal: Proposal;
  p: Prepared;
  onToggle: (id: ItemId) => void;
  onPatch: (patch: Partial<Proposal>) => void;
  onConcept: (id: string) => void;
  extra?: Note[];
}) {
  const kept = keptOf(proposal.struck);
  const t = kept ? p.byKey[keyOf(kept)] : null;
  const notes = t ? [
    ...checkNumber(alphaVariants(p, t), proposal.alpha, ALPHA_NOT_FOUND),
    ...checkNumber(rVariants(p, t), proposal.r, R_NOT_FOUND),
  ] : [];
  return <section className="task-step">
    <h3>{heading}</h3>
    {children}
    <ItemPicker struck={proposal.struck} onToggle={onToggle} label={`${heading}: vier Fragen streichen`} />
    <p className="sandbox-note" aria-live="polite">{kept ? `Gestrichen: ${labelOf(proposal.struck)}. Es bleiben: ${labelOf(kept)}.` : `Noch ${4 - proposal.struck.length} ${4 - proposal.struck.length === 1 ? 'Frage' : 'Fragen'} streichen.`}</p>
    <Feedback notes={extra} />
    <label className="sandbox-label" htmlFor={`s07-why-${which}`}>Warum diese drei? (ein Satz)</label>
    <textarea id={`s07-why-${which}`} maxLength={400} value={proposal.why} onChange={e => onPatch({ why: e.target.value })} />
    {kept && t && <>
      <p>Rechne in RStudio die Stimmigkeit deiner drei Fragen und den Stellvertreter-Test. Trag beide Werte ein, so wie R sie zeigt.</p>
      <div className="task-grid">
        <label>Stimmigkeit α<input type="text" inputMode="decimal" maxLength={12} value={proposal.alpha} onChange={e => onPatch({ alpha: e.target.value })} /></label>
        <label>Stellvertreter-Wert r<input type="text" inputMode="decimal" maxLength={12} value={proposal.r} onChange={e => onPatch({ r: e.target.value })} /></label>
      </div>
      <Feedback notes={notes} />
      <HintLadder key={t.key} hint={{ ...hints.proposal, scaffold: scaffoldProposal(which), solution: `${R_SETUP}\n\n${rProposal(kept, which)}` }} onConcept={onConcept} file={`drei-fragen-${which}.R`} />
    </>}
  </section>;
}
