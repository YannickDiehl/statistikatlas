import { detailIds } from '../domain/visibleNetwork';
import { conceptById } from '../domain/concepts';
import { inputs, keyOf, ref, titleFor, type Ref, type Route } from '../domain/learning';

export function CalculationSteps({reference,route,formula,onSelect,onHover}:{reference:Ref;route:Route;formula?:string;onSelect:(r:Ref)=>void;onHover:(id:string|null)=>void}) {
 const steps=new Map<string,Ref>(),seen=new Set<string>();
 function walk(r:Ref){const key=keyOf(r);if(seen.has(key))return;seen.add(key);for(const child of inputs(r,route))if(detailIds.has(child.id)){steps.set(keyOf(child),child);walk(child);}}
 walk(reference);
 // For R procedures these are explanations of notation, not browser-computed
 // procedure results. Their own formulas and linked statistical inputs remain.
 if(formula){const text=formula.replace(/\[\[([^|]+)\|[^\]]+\]\]/g,'$1');for(const [id,pattern] of [['add',/Σ|∑|\+/],['subtract',/−/],['multiply',/·|×/],['divide',/\//],['sqrt',/√|sqrt/],['square',/²/]] as const)if(pattern.test(text))steps.set(id,ref(id,reference.variable));}
 if(!steps.size)return null;
 return <details className="inspector-disclosure calculation-steps" key={keyOf(reference)}><summary>Rechenschritte & Zeichen verstehen <span>({steps.size})</span></summary><p className="small-copy">Öffne einen Schritt, um seine Bedeutung und Rechnung zu erkunden.</p><div>{[...steps.values()].map(r=><button key={keyOf(r)} onClick={()=>onSelect(r)} onPointerEnter={()=>onHover(r.id)} onPointerLeave={()=>onHover(null)} onFocus={()=>onHover(r.id)} onBlur={()=>onHover(null)}><strong>{titleFor(r)}</strong><small>{conceptById[r.id].short}</small></button>)}</div></details>;
}
