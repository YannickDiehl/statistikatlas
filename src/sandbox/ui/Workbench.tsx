import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { searchVariables } from '../allbus';
import type { AnalysisResult } from '../analysis';
import type { Choice, Claim, ItemOption } from '../claims';
import type { SavFile } from '../readSav';
import { rScript } from '../rcode';
import type { ClaimWork, TableLabels } from '../state';
import { LiveTable } from './LiveTable';

const toggle = (list: number[], code: number) => list.includes(code) ? list.filter(x => x !== code) : [...list, code].sort((a, b) => a - b);
const sameMode = (a: Choice['missing'], b: Choice['missing']) => JSON.stringify(a) === JSON.stringify(b);

export function Workbench({ sav, fileName, claim, work, item, result, labels, onChange, onConcept }: {
  sav: SavFile;
  fileName: string;
  claim: Claim;
  work: ClaimWork;
  item: ItemOption;
  result: AnalysisResult;
  labels: TableLabels;
  onChange: (patch: Partial<ClaimWork>) => void;
  onConcept: (id: string) => void;
}) {
  const c = work.choice;
  const [query, setQuery] = useState('');
  const found = useMemo(() => searchVariables(sav, query, claim.itemRole), [sav, query, claim.itemRole]);
  const setChoice = (patch: Partial<Choice>) => onChange({ choice: { ...c, ...patch }, evidence: null });
  const pickItem = (next: ItemOption) => { setChoice({ item: next.variable, positive: next.strict, exclude: [] }); setQuery(''); };
  const custom = !claim.items.some(i => i.variable === c.item);
  const yesName = claim.itemRole === 'outcome' ? labels.outcome[0] : labels.groups[0];

  return <>
    <section className="sandbox-card">
      <h3>1 · {claim.itemPrompt}</h3>
      <div className="sandbox-items">
        {claim.items.map(i => <button key={i.variable} aria-pressed={c.item === i.variable} onClick={() => pickItem(i)}>
          <strong>{i.variable} · {i.title}</strong><span>{i.question}</span>
        </button>)}
        {custom && <button aria-pressed="true"><strong>{item.variable} · {item.title}</strong><span>Selbst gewählte Variable</span></button>}
      </div>
      <label className="sandbox-search">
        <Search size={15} aria-hidden="true" />
        <span className="sr-only">Andere Variable suchen</span>
        <input type="search" value={query} placeholder="Andere Variable suchen, z. B. vertrauen oder pt08" onChange={e => setQuery(e.target.value)} />
      </label>
      {found.length > 0 && <ul className="sandbox-found">{found.map(f => <li key={f.variable}>
        <button onClick={() => pickItem(f)}>{f.variable} · {f.title} <small>{f.categories.length} Kategorien</small></button>
      </li>)}</ul>}
      {query.trim().length >= 2 && found.length === 0 && <p className="sandbox-note">Keine Variable mit 2 bis 11 gelabelten Kategorien gefunden.</p>}
      <button className="sandbox-link" onClick={() => onConcept('operationalization')}>Was heißt Operationalisierung?</button>
    </section>

    <section className="sandbox-card">
      <h3>2 · Wer wird verglichen?</h3>
      {claim.cutRange && <label className="sandbox-slider">
        <span>„Jung“ heißt 18 bis</span>
        <input type="range" min={claim.cutRange[0]} max={claim.cutRange[1]} step={1} value={c.cut} onChange={e => setChoice({ cut: Number(e.target.value) })} />
        <output>{c.cut} Jahre</output>
      </label>}
      {claim.comparisons.length > 1
        ? <div className="sandbox-chips" role="group" aria-label="Vergleichsgruppe">
            <span>verglichen mit</span>
            {claim.comparisons.map(k => <button key={k.id} aria-pressed={c.comparison === k.id} onClick={() => setChoice({ comparison: k.id })}>{k.label}</button>)}
          </div>
        : <p className="sandbox-note">„{labels.groups[0]}“ im Vergleich mit „{labels.groups[1]}“.</p>}
    </section>

    <section className="sandbox-card">
      <h3>3 · Wer zählt als „{yesName}“? Kategorien antippen</h3>
      <div className="sandbox-chips">{item.categories.map(k => <button key={k.code} aria-pressed={c.positive.includes(k.code)} disabled={c.exclude.includes(k.code)} onClick={() => setChoice({ positive: toggle(c.positive, k.code) })}>{k.label}</button>)}</div>
      {claim.midpoint !== null && <button className="sandbox-toggle" aria-pressed={c.exclude.includes(claim.midpoint)}
        onClick={() => {
          const m = claim.midpoint!;
          setChoice(c.exclude.includes(m) ? { exclude: c.exclude.filter(x => x !== m) } : { exclude: [...c.exclude, m], positive: c.positive.filter(x => x !== m) });
        }}>Mittelkategorie {claim.midpoint} ausschließen</button>}
      <h3>4 · {claim.fixedOutcome ? `Wer zählt als „${claim.fixedOutcome.yes}“?` : 'Fehlende Angaben'}</h3>
      <div className="sandbox-chips">{claim.missingOptions.map(o => <button key={o.id} aria-pressed={sameMode(o.mode, c.missing)} onClick={() => setChoice({ missing: o.mode })}>{o.label}</button>)}</div>
      <h3>5 · Gewichtung</h3>
      <div className="sandbox-chips">
        <button aria-pressed={c.weighted} onClick={() => setChoice({ weighted: !c.weighted })}>Mit wghtpew gewichten</button>
        <button className="sandbox-link" onClick={() => onConcept('weights')}>Was macht ein Gewicht?</button>
      </div>
    </section>

    <section className="sandbox-card">
      <h3>6 · Deine Tabelle, live. Tippe die Zelle an, die deine Aussage belegt.</h3>
      <LiveTable result={result} labels={labels} base={work.base} weighted={c.weighted} evidence={work.evidence}
        onBase={base => onChange({ base })} onEvidence={evidence => onChange({ evidence })} />
    </section>

    <section className="sandbox-card">
      <h3>Dein Weg als R-Code</h3>
      <pre className="sandbox-code">{rScript(claim, c, item, work.base, fileName)}</pre>
    </section>
  </>;
}
