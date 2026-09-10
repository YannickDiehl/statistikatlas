import { useState } from 'react';
import { inputs, keyOf, isOperation, titleFor, subtitle, valueFor, numberText, unitFor, type Ref, type LessonContext } from '../domain/learning';
export function Recipe({reference,context,onSelect,onHover}:{reference:Ref;context:LessonContext;onSelect:(r:Ref)=>void;onHover:(id:string|null)=>void}){
 const [expanded,setExpanded]=useState(new Set([keyOf(reference)]));
 const seen=new Set<string>();
 function render(r:Ref,depth=0):React.ReactNode{
  const key=keyOf(r),children=inputs(r,context.route),operation=isOperation(r),shared=seen.has(key);seen.add(key);
  if(shared)return <button key={`${key}-shared`} className="recipe-shared" onClick={()=>onSelect(r)}>↗ {titleFor(r)} · dieselbe Größe</button>;
  const open=operation||expanded.has(key);
  return <div key={key} className={`recipe-branch ${operation?'recipe-operation':''}`}>
   {depth>0&&<div className="recipe-card"><button onClick={()=>onSelect(r)} onPointerEnter={()=>onHover(r.id)} onPointerLeave={()=>onHover(null)} onFocus={()=>onHover(r.id)} onBlur={()=>onHover(null)}><span>{titleFor(r)}</span>{!operation&&<><small>{subtitle(r)}</small><strong>{numberText(valueFor(r,context))} <small>{unitFor(r)}</small></strong></>}</button>{children.length>0&&!operation&&<button className="recipe-expand" onClick={()=>setExpanded(current=>{const next=new Set(current);if(next.has(key))next.delete(key);else next.add(key);return next;})} aria-expanded={open} aria-label={`${titleFor(r)} ${open?'zuklappen':'weiter zerlegen'}`}>{open?'−':'+'}</button>}</div>}
   {open&&children.length>0&&<div className={`recipe-inputs ${children.length===1?'single':''}`}>{children.map(child=>render(child,depth+1))}</div>}
  </div>;
 }
 return <div className="recipe-tree"><p className="small-copy">Öffne mit + die nächsten Eingänge. Jeder Baustein führt zurück zu seiner Stelle in der Karte.</p>{render(reference)}</div>;
}
