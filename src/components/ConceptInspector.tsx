import { CalculationSteps } from './CalculationSteps';
import { mapIds, visibleNeighbors } from '../domain/visibleNetwork';
import { MeaningLinks } from './MeaningLinks';
import { entryById } from '../domain/mariposaCatalog';
import type { RSettings } from '../domain/mariposa';
import type { SurveyRow } from '../domain/survey';
import { MariposaPanel } from './MariposaPanel';
import { PackageInspector } from './PackageInspector';
import { useEffect, useRef } from 'react';
import { ArrowUpRight, Check, Info, CircleAlert, X, Focus } from 'lucide-react';
import { conceptById } from '../domain/concepts';
import { deepCopy } from '../domain/explanations';
import { keyOf, inputs, isOperation, outputRef, introduction, interpretation, titleFor, subtitle, valueFor, numberText, unitFor, displayValue, contextFor, conditions, deepQuestions, type Ref, type LessonContext, type Route, type Variable } from '../domain/learning';
import { neighbors, referenceInMap } from '../domain/network';
import { ColumnPicker } from './ColumnPicker';
import { CasePicker } from './CasePicker';
import { SurveyAnalysis } from './SurveyAnalysis';
import { SurveyExperiment } from './SurveyExperiment';
import type { ColumnSelection } from '../domain/survey';
import { Formula } from './Formula';
import { Recipe } from './Recipe';
import { Experiment } from './Experiment';
import type { DataPair } from '../domain/statistics';

type Props={contextAnchor?:Ref;rows?:SurveyRow[];rSettings?:RSettings;onRSettings?:(s:RSettings)=>void;selection?:ColumnSelection;onColumns?:(next:ColumnSelection)=>void;columnNotice?:string;onData?:()=>void;selected:Ref;context:LessonContext;highlight:string|null;onHighlight:(key:string|null)=>void;onSelect:(r:Ref,caseId?:string)=>void;onHover:(id:string|null)=>void;onClose:()=>void;onFocusMap:()=>void;onCase:(id:string)=>void;onPairs:(pairs:DataPair[])=>void;onReset:()=>void;resetRevision:number;onVariable:(v:Variable)=>void;onRoute:(r:Route)=>void;trace:boolean;onTrace:()=>void;experimentRequest:number;onExperimentFocused:()=>void;experimentOpen:boolean;onExperiment:(open:boolean)=>void};
export function ConceptInspector(p:Props){
 const r=p.selected,out=outputRef(r),both=['pairs','validn','df','count','crossproduct','crossproduct_sum','covariance','sd_product','pearson','spearman','crosstab','linear'].includes(out.id),edges=mapIds.has(r.id)?visibleNeighbors(r,p.context.route,p.contextAnchor):neighbors(r.id,r,p.context.route),checks=conditions(r,p.context),result=valueFor(r,p.context),scroller=useRef<HTMLElement>(null),experiment=useRef<HTMLDetailsElement>(null),selection=keyOf(r);
 useEffect(()=>{scroller.current?.scrollTo({top:0,behavior:'instant'});},[selection]);
 useEffect(()=>{if(!p.experimentRequest||!p.experimentOpen)return;const timer=setTimeout(()=>{if(scroller.current&&experiment.current)scroller.current.scrollTo({top:experiment.current.offsetTop-24,behavior:'instant'});p.onExperimentFocused();},0);return ()=>clearTimeout(timer);},[p.experimentRequest]);
 const entry=entryById[r.id];
 if(entry&&!entry.existing)return <PackageInspector contextAnchor={p.contextAnchor} route={p.context.route} entry={entry} reference={r} selected={r} settings={p.rSettings} onSettings={p.onRSettings} rows={p.rows} selection={p.selection} onData={p.onData} onSelect={p.onSelect} onHover={p.onHover} onClose={p.onClose} onFocusMap={p.onFocusMap} trace={p.trace} onTrace={p.onTrace}/>;
 function relation(id:string,label:string,direction:'before'|'after',kind:string){const target=referenceInMap(id,r,p.context.route);return <button className={`relation-link ${direction} relation-${kind}`} key={`${id}-${label}`} onClick={()=>p.onSelect(target)} onPointerEnter={()=>p.onHover(id)} onPointerLeave={()=>p.onHover(null)} onFocus={()=>p.onHover(id)} onBlur={()=>p.onHover(null)}><span><strong>{titleFor(target)}</strong><small>{label}</small></span><ArrowUpRight size={15}/></button>;}
 return <aside className="network-inspector" ref={scroller} aria-labelledby="inspector-title"><div className="inspector-top"><span className="eyebrow">{subtitle(r,p.context)}</span><button className="inspector-close" onClick={p.onClose} aria-label="Erklärung einklappen"><X size={18}/></button></div><h1 id="inspector-title" tabIndex={-1}>{titleFor(r)}</h1><p className="concept-intro">{introduction(r,p.context)}</p><button className="map-focus-link" onClick={p.onFocusMap}><Focus size={15}/>Bezüge in der Karte zeigen</button>
  {!both&&!p.selection&&<div className="inspector-context"><span>Beispiel für</span><div className="variable-control" role="group" aria-label="Variable betrachten">{(['x','y'] as Variable[]).map(v=><button key={v} aria-pressed={r.variable===v} onClick={()=>p.onVariable(v)}>{v.toUpperCase()} · {v==='x'?'Lernzeit':'Aufgaben'}</button>)}</div></div>}
  {p.selection&&p.onColumns&&<ColumnPicker reference={r} selection={p.selection} onChange={p.onColumns} notice={p.columnNotice}/>}
  {isOperation(r)&&(r.use||r.id==='scaling')&&<p className="context-note">{r.id==='scaling'?`Hier: uᵢ = ${r.use==='z'?'zentrierter':'ursprünglicher'} Wert von ${r.variable.toUpperCase()}, a = Standardabweichung.`:`Hier verwendet für: ${titleFor(out)}.`}</p>}
  {out.id==='pearson'&&<div className="inspector-route"><label>Rechnung zeigen<select aria-label="Rechenweg zu Pearson" value={p.context.route} onChange={e=>p.onRoute(e.target.value as Route)}><option value="covariance">Über die Kovarianz</option><option value="z">Über z-Werte</option></select></label><span>Gleiche Daten, gleiches r.</span></div>}
  <Formula key={`${selection}-formal`} reference={r} context={p.context} onSelect={p.onSelect} onHighlight={p.onHighlight} highlight={p.highlight}/>
  <CalculationSteps reference={r} route={p.context.route} onSelect={p.onSelect} onHover={p.onHover}/>
  <div className="calculation-heading"><span className="eyebrow">Mit deinen Daten</span></div>
  {p.selection?<CasePicker ids={p.context.pairs.map(row=>row.id)} value={p.context.caseId} onChange={p.onCase}/>:<label>Person i = <select aria-label="Person für die Formel auswählen" value={p.context.caseId} onChange={e=>p.onCase(e.target.value)}>{p.context.pairs.map((row,i)=><option value={row.id} key={row.id}>{i+1}</option>)}</select></label>}

  <Formula key={`${selection}-numeric`} reference={r} context={p.context} onSelect={p.onSelect} onHighlight={p.onHighlight} highlight={p.highlight} numeric/>
  {result!==null&&<p className="compact-result" aria-live="polite">{displayValue(r,p.context)} {unitFor(r,p.context)}</p>}
  <SurveyAnalysis reference={r} context={contextFor(r,p.context)} onCase={p.onCase} onSelect={p.onSelect}/>
  <p className="interpretation">{interpretation(r,p.context)}</p>
  {checks.length>0&&<ul className="conditions" aria-label="Bedingungen und Annahmen">{checks.map((c,i)=><li key={i} className={c.ok===false?'unmet':c.ok===true?'met':'assumption'}>{c.ok===true?<Check size={14}/>:c.ok===false?<CircleAlert size={14}/>:<Info size={14}/>}<span>{c.text}{c.target&&<button className="condition-link" onClick={()=>p.onSelect(c.target!)}>Erklären</button>}</span></li>)}</ul>}
  {entry&&<MariposaPanel contextAnchor={p.contextAnchor} route={p.context.route} key={entry.id} entry={entry} reference={r} settings={p.rSettings} onSettings={p.onRSettings} rows={p.rows} selection={p.selection} onData={p.onData} onSelect={p.onSelect} onHover={p.onHover}/>}
  <MeaningLinks contextAnchor={p.contextAnchor} reference={r} route={p.context.route} onSelect={p.onSelect} onHover={p.onHover}/>
  <section className="inspector-relations" aria-label="Bezüge im Netzwerk"><div className="relations-heading"><h2>Von hier aus weiter</h2><button onClick={p.onTrace} aria-pressed={p.trace}>{p.trace?'Direkte Bezüge':'Alle Voraussetzungen'}</button></div>
   {edges.before.filter(e=>e.kind==='build'&&!e.alternative).length>0&&<div className="relation-group"><h3>Das geht voraus <span>→</span></h3>{edges.before.filter(e=>e.kind==='build'&&!e.alternative).map(e=>relation(e.source,e.label,'before',e.kind))}</div>}
   {edges.after.some(e=>!e.alternative&&e.kind!=='meaning')&&<div className="relation-group"><h3>Daraus entsteht <span>→</span></h3>{edges.after.filter(e=>!e.alternative&&e.kind!=='meaning').map(e=>relation(e.target,e.label,'after',e.kind))}</div>}
   {edges.before.filter(e=>e.kind!=='build'&&e.kind!=='meaning'&&!e.alternative).length>0&&<div className="relation-group"><h3>Voraussetzungen & weitere Bezüge</h3>{edges.before.filter(e=>e.kind!=='build'&&e.kind!=='meaning'&&!e.alternative).map(e=>relation(e.source,e.label,'before',e.kind))}</div>}
   {[...edges.before,...edges.after].some(e=>e.alternative)&&<div className="relation-group other-uses"><h3>Weitere Verwendungen & Rechenwege</h3>{edges.before.filter(e=>e.alternative).map(e=>relation(e.source,e.label,'before',e.kind))}{edges.after.filter(e=>e.alternative).map(e=>relation(e.target,e.label,'after',e.kind))}</div>}
   {!edges.before.length&&!edges.after.length&&<p className="small-copy">Dieser Begriff ist ein Ausgangspunkt.</p>}
  </section>
  {inputs(r,p.context.route).length>0&&<details className="inspector-disclosure" key={`recipe-${selection}`}><summary>Die Rechnung als Baukasten entfalten</summary><Recipe key={`${selection}-${p.context.route}`} reference={r} context={p.context} onSelect={p.onSelect} onHover={p.onHover}/></details>}
  <details ref={experiment} className="inspector-disclosure experiment-disclosure" open={p.experimentOpen} onToggle={e=>p.onExperiment(e.currentTarget.open)}><summary>Mit den Daten experimentieren</summary>{p.context.columns&&p.onData?<SurveyExperiment key={p.resetRevision} reference={r} context={p.context} onPairs={p.onPairs} onCase={p.onCase} onData={p.onData} onReset={p.onReset}/>:<Experiment key={p.resetRevision} reference={r} context={p.context} showBoth={both} onCase={p.onCase} onPairs={p.onPairs} onReset={p.onReset}/>}</details>
  <details key={`deep-${selection}`} className="inspector-disclosure"><summary>{deepQuestions[out.id]||'Genauer verstehen'}</summary><p>{deepCopy[out.id]||conceptById[out.id]?.explanation}</p>{isOperation(r)&&!r.use&&<p>a ist der Wert der ausgewählten Person, b der nächsten Person. Nach der letzten folgt wieder die erste.</p>}<p className="small-copy">Bei Σ werden alle Personen durchlaufen. Angezeigte Zahlen sind gerundet (≈); intern rechnen wir ungerundet.</p></details>
 </aside>;
}
