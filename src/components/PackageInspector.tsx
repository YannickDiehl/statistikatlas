import { CalculationSteps } from './CalculationSteps';
import { explainFor, tabsFor, workshopFor } from '../explain/registry';
import { ExplainTabs, kurzOf, tabList } from './explain/ExplainTabs';
import { SampleTab } from './explain/SampleTab';
import { RTab } from './explain/RTab';
import { NextTab } from './explain/NextTab';
import { baseSurvey, modifiedFrom } from '../explain/sample';
import type { ColumnSelection, SurveyRow } from '../domain/survey';
import { Explanation, EXPLAIN_LABEL } from './explain/Explanation';
import { ModeToggle } from './explain/basics';
import { visibleNeighbors } from '../domain/visibleNetwork';
import { FoundationLab } from './foundations/FoundationLab';
import { MeaningLinks } from './MeaningLinks';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Focus, X } from 'lucide-react';
import { entryById } from '../domain/mariposaCatalog';
import { referenceInMap } from '../domain/network';
import { mergeRelations } from '../explain/relations';
import { ref, titleFor, numberText, type Ref } from '../domain/learning';
import { MariposaPanel, LinkedFormula, type RPanelProps } from './MariposaPanel';
function PrincipleLab({id}:{id:string}){
 const [n,setN]=useState(200),[spread,setSpread]=useState(10),[eta,setEta]=useState(0),[answer,setAnswer]=useState(3),[weight,setWeight]=useState(1);
 return <details className="principle-lab"><summary>Prinzip ausprobieren</summary><p className="small-copy">Eigenständiges Rechenbeispiel. Die Regler verändern diese Illustration, nicht die 200 Befragten.</p>
 {id==='se'&&<><label>Unabhängige Fälle n = {n}<input type="range" min="10" max="800" step="10" value={n} onChange={e=>setN(+e.target.value)}/></label><label>Standardabweichung s = {spread}<input type="range" min="1" max="40" value={spread} onChange={e=>setSpread(+e.target.value)}/></label><output>SE = {spread} / √{n} = {numberText(spread/Math.sqrt(n))}</output><p>Mehr unabhängige Fälle machen den Mittelwert bei gleicher Streuung präziser.</p></>}
 {id==='logit'&&<><label>Linearer Prädiktor η = {numberText(eta)}<input type="range" min="-6" max="6" step=".1" value={eta} onChange={e=>setEta(+e.target.value)}/></label><output>p = {numberText(100/(1+Math.exp(-eta)),1)} % · Odds = {numberText(Math.exp(eta))}</output><div className="probability-bar" aria-hidden="true"><span style={{width:`${100/(1+Math.exp(-eta))}%`}}/></div><p>Gleiche Schritte im Logit bewirken unterschiedlich große Änderungen der Wahrscheinlichkeit.</p></>}
 {id==='pomps'&&<><label>Antwort auf einer 1–5-Skala: {answer}<input type="range" min="1" max="5" step="1" value={answer} onChange={e=>setAnswer(+e.target.value)}/></label><output>100 · ({answer}−1)/(5−1) = {(answer-1)*25}</output></>}
 {id==='weights'&&<><label>Gewicht der Person mit Wert 10: {weight}<input type="range" min="1" max="10" step="1" value={weight} onChange={e=>setWeight(+e.target.value)}/></label><output>x̄w = (1·2 + {weight}·10)/(1+{weight}) = {numberText((2+weight*10)/(1+weight))}</output><p>Die andere Person hat Wert 2 und Gewicht 1. Höheres Gewicht verschiebt den Mittelwert zum Wert 10.</p></>}
 </details>;
}
/** Was der Inspector zusätzlich für die Reiter braucht (Spaltenwahl, Person, Daten ändern). */
export type PackageTabProps={onColumns?:(next:ColumnSelection)=>void;columnNotice?:string;caseId?:string;onCase?:(id:string)=>void;onRows?:(rows:SurveyRow[])=>void;onReset?:()=>void};
export function PackageInspector(p:RPanelProps&PackageTabProps&{selected:Ref;onClose:()=>void;onFocusMap:()=>void;trace:boolean;onTrace:()=>void}){
 const e=p.entry,v=e.variants[p.settings?.variant??Number(p.selected.use?.slice(1)||0)],scroll=useRef<HTMLElement>(null);
 useEffect(()=>{scroll.current?.scrollTo({top:0,behavior:'instant'});},[e.id]);
 const links=visibleNeighbors(p.selected,p.route||'covariance',p.contextAnchor),before=links.before.filter(x=>!x.alternative&&x.kind!=='meaning'),after=links.after.filter(x=>!x.alternative&&x.kind!=='meaning');
 // Erklärung nach Vorlage (Formel als Satz, Werkzeug, Begriffskarte …), siehe src/explain/registry.ts
 const template=explainFor(e.id),open=(id:string)=>p.onSelect(ref(id)),tabs=tabsFor(e.id);
 function link(id:string,label:string){return <button className="relation-link" key={`${id}-${label}`} onClick={()=>p.onSelect(referenceInMap(id,p.selected,p.route||'covariance',p.contextAnchor))} onPointerEnter={()=>p.onHover(id)} onPointerLeave={()=>p.onHover(null)} onFocus={()=>p.onHover(id)} onBlur={()=>p.onHover(null)}><span><strong>{titleFor(ref(id))}</strong><small>{label}</small></span><ArrowUpRight size={15}/></button>;}
 const top=<div className="inspector-top" key="top"><span className="eyebrow">{template?EXPLAIN_LABEL[template.kind]:e.variants.length?'Verfahren & Werkzeuge':'Gemeinsamer Baustein'}</span>{(template||tabs)&&<ModeToggle/>}<button className="inspector-close" onClick={p.onClose} aria-label="Erklärung einklappen"><X size={18}/></button></div>;
 const focusMap=<button className="map-focus-link" key="focus" onClick={p.onFocusMap}><Focus size={15}/>Bezüge in der Karte zeigen</button>;
 const conditions=<section className="package-conditions"><h2>Voraussetzungen & Einordnung</h2>{e.requires.map(r=>link(r.id,r.reason))}<ul>{e.notes.map((text,i)=><li key={i}>{text}</li>)}</ul></section>;
 const sources=e.sources?.length?<details className="foundation-sources"><summary>Fachlich nachlesen</summary>{e.sources.map(source=><a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.title}</a>)}</details>:null;

 // Begriffe mit Reitern (Spezifikation Lehrdatensatz 5.1/5.2): Titel, Kurz gesagt, Reiterleiste; die bisherigen Teile wandern in die Reiter.
 if(tabs){
  const rows=p.rows??baseSurvey(),modified=!!p.rows&&modifiedFrom(p.rows,baseSurvey()),route=p.route||'covariance';
  const workshop=tabs.sample?.kind==='bridge'?workshopFor(tabs.sample.workshop):template?.kind==='werkstatt'?template.workshop:null;
  return <aside id="atlas-inspector" className="network-inspector package-inspector has-tabs" ref={scroll} aria-labelledby="inspector-title">{top}<h1 id="inspector-title" tabIndex={-1} key="title">{e.title}</h1>{focusMap}
   <ExplainTabs key={e.id} concept={e.id} tabs={tabList(template,tabs)} kurz={kurzOf(template)} render={(id,tabLinks)=>{
    switch(id){
     case 'verstehen':return <>
      {template?<Explanation id={e.id} explain={template} onConcept={open}/>:<><p className="concept-intro">{e.intro}</p><LinkedFormula key={`${e.id}-${p.settings?.variant||0}`} contextAnchor={p.contextAnchor} route={p.route} formula={v?.formula||e.formula} reference={p.selected} onSelect={p.onSelect} onHover={p.onHover}/><CalculationSteps reference={p.selected} route={route} formula={v?.formula||e.formula} onSelect={p.onSelect} onHover={p.onHover}/><section className="package-meaning"><h2>Was sagt das Ergebnis?</h2><p>{e.output}</p></section></>}
      <FoundationLab key={`foundation-${e.id}`} id={e.id} rows={p.rows} selection={p.selection}/>
      {e.lab&&!template&&<PrincipleLab key={`principle-${e.id}`} id={e.lab}/>}
     </>;
     case 'sample':return <SampleTab tab={tabs.sample!} rows={rows} onRows={p.onRows} onReset={p.onReset} modified={modified} reference={p.selected} selection={p.selection} onColumns={p.onColumns} columnNotice={p.columnNotice} settingsColumns={p.settings?.columns} caseId={p.caseId??rows[1]?.id??''} onCase={p.onCase??(()=>{})} goTo={tabLinks.goSample} onStep={tabLinks.onSampleStep}/>;
     case 'r':return <RTab {...p} tab={tabs.r!} title={e.title} rows={rows} modified={modified} reference={p.selected} onStepLink={tabLinks.stepLink} stepTitle={n=>workshop?.steps[n-1]?.title} onConcept={open}/>;
     case 'weiter':return <NextTab tab={tabs.next} edges={links} selected={p.selected} route={route} contextAnchor={p.contextAnchor} onSelect={p.onSelect} onHover={p.onHover} trace={p.trace} onTrace={p.onTrace}
      extra={<details className="xw-more"><summary>Voraussetzungen und Einordnung</summary>{conditions}{sources}</details>}/>;
    }
   }}/>
  </aside>;
 }

 return <aside id="atlas-inspector" className="network-inspector package-inspector" ref={scroll} aria-labelledby="inspector-title">{top}<h1 id="inspector-title" tabIndex={-1} key="title">{e.title}</h1>{!template&&<p className="concept-intro" key="intro">{e.intro}</p>}{focusMap}
 {template&&<Explanation id={e.id} explain={template} onConcept={open}/>}
 {!template&&<><LinkedFormula key={`${e.id}-${p.settings?.variant||0}`} contextAnchor={p.contextAnchor} route={p.route} formula={v?.formula||e.formula} reference={p.selected} onSelect={p.onSelect} onHover={p.onHover}/>
 <CalculationSteps reference={p.selected} route={p.route||'covariance'} formula={v?.formula||e.formula} onSelect={p.onSelect} onHover={p.onHover}/></>}
 <FoundationLab key={`foundation-${e.id}`} id={e.id} rows={p.rows} selection={p.selection}/>
 {e.lab&&!template&&<PrincipleLab key={`principle-${e.id}`} id={e.lab}/>}
 {!template&&<section className="package-meaning" key="meaning"><h2>Was sagt das Ergebnis?</h2><p>{e.output}</p></section>}
 {conditions}
 {e.variants.length>0&&<MariposaPanel key={`mariposa-${e.id}`} {...p}/>}
 <MeaningLinks key="meaning-links" contextAnchor={p.contextAnchor} reference={p.selected} route={p.route||'covariance'} onSelect={p.onSelect} onHover={p.onHover}/>
 {sources}
 <section className="inspector-relations" key="relations"><div className="relations-heading"><h2>Von hier aus weiter</h2><button onClick={p.onTrace} aria-pressed={p.trace}>{p.trace?'Direkte Bezüge':'Alle Voraussetzungen'}</button></div>{before.length>0&&<div className="relation-group"><h3>Das geht voraus →</h3>{mergeRelations(before,'before').map(r=>link(r.id,r.why))}</div>}{after.length>0&&<div className="relation-group"><h3>Daraus entsteht →</h3>{mergeRelations(after,'after').map(r=>link(r.id,r.why))}</div>}</section>
 </aside>;
}
