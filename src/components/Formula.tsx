import { useState } from 'react';
import { formulaFor, type Expression } from '../domain/formulas';
import { keyOf, titleFor, type Ref, type LessonContext } from '../domain/learning';
export function Formula({reference,context,onSelect,onHighlight,highlight,numeric=false}:{reference:Ref;context:LessonContext;onSelect:(r:Ref,caseId?:string)=>void;onHighlight?:(key:string|null)=>void;highlight?:string|null;numeric?:boolean}){
 const [hint,setHint]=useState<string|null>(null);
 function control(label:React.ReactNode,target:Ref,description:string,caseId?:string,cls='formula-term'){
  return <button type="button" className={`${cls} ${highlight===keyOf(target)?'term-highlighted':''}`} aria-label={`${description}; ${titleFor(target)} öffnen`} onClick={()=>{setHint(null);onHighlight?.(null);onSelect(target,caseId);}} onPointerEnter={()=>{setHint(description);onHighlight?.(keyOf(target));}} onPointerLeave={()=>{setHint(null);onHighlight?.(null);}} onFocus={()=>{setHint(description);onHighlight?.(keyOf(target));}} onBlur={()=>{setHint(null);onHighlight?.(null);}}>{label}</button>;
 }
 function render(e:Expression):React.ReactNode {
  if(typeof e==='string')return <span>{e}</span>;
  switch(e.type){case 'term':return control(e.label,e.target,e.hint,e.caseId);case 'row':return <span className="formula-row">{e.items.map((p,i)=><span className="formula-piece" key={i}>{render(p)}</span>)}</span>;
  case 'fraction':return <span className="fraction"><span className="numerator">{render(e.top)}</span>{control(<span aria-hidden="true"/>,e.operation,'Bruchstrich: teilen',undefined,'fraction-divider')}<span className="denominator">{render(e.bottom)}</span></span>;
  case 'sum':return <span className="summation"><span className="sum-upper">{control('n',e.count,'n: Anzahl der verwendeten Fälle')}</span><span className="sigma">{control('Σ',e.target,'Σ: alle Beiträge aufsummieren')}</span><span className="sum-lower">i = 1</span><span className="sum-body">{render(e.body)}</span></span>;
  case 'power':return <span className="math-power"><span>({render(e.body)})</span>{control('²',e.operation,'Quadrieren')}</span>;
  case 'root':return <span className="math-root">{control('√',e.operation,'Quadratwurzel ziehen')}<span>{render(e.body)}</span></span>;
  }
 }
 return <div className={numeric?'live-formula':'symbolic-formula'}><div className="math-expression" aria-label={numeric?'Rechnung mit den aktuellen Daten':'Interaktive Formel'}>{render(formulaFor(reference,context,numeric))}</div>{numeric&&context.pairs.length>8&&['series','sum','ss','crossproduct_sum','count'].includes(reference.id)&&<p className="small-copy">… kürzt die Anzeige. Berechnet werden alle {context.pairs.length} Befragten; die ausgewählte Person bleibt in der Vorschau sichtbar.</p>}{!numeric&&<p className="formula-hint">{hint||'Formelzeichen anklicken, um den Baustein zu öffnen.'}</p>}</div>;
}
