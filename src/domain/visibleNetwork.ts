import { concepts, conceptById } from './concepts';
import { mapRelations, incomingPaths, type NetworkEdge } from './network';
import { outputRef, type Ref, type Route } from './learning';
import { explainRelations } from './organicStructure';

export const arithmeticIds = new Set(['count','add','subtract','multiply','divide','square','sqrt']);
// These remain searchable, selectable and fully explained in the inspector.
// Statistical transformations and the shared sum of squares remain on the map.
export const detailIds = new Set([...arithmeticIds,'sum','deviation','squared_deviation','crossproduct','crossproduct_sum','sd_product','df','positive_sd']);
export const mapConcepts = concepts.filter(c => !detailIds.has(c.id));
export const mapIds = new Set(mapConcepts.map(c => c.id));
const relationCache=new Map<string,NetworkEdge[]>();
const refParts=(r?:Ref|null)=>r?[r.id,r.variable,r.use??null,r.basis??null]:null;

export function visibleRelations(selected:Ref|null, route:Route, anchor?:Ref|null):NetworkEdge[] {
 const cacheKey=JSON.stringify([refParts(selected),route,refParts(anchor)]),cached=relationCache.get(cacheKey);
 if(cached){relationCache.delete(cacheKey);relationCache.set(cacheKey,cached);return cached;}
 const raw = mapRelations(selected,route,anchor), incoming = new Map<string,NetworkEdge[]>();
 for(const e of raw) incoming.set(e.target,[...(incoming.get(e.target)||[]),e]);
 const result = new Map<string,NetworkEdge>();
 for(const target of mapConcepts) {
  function walk(edge:NetworkEdge, via:string[], seen:Set<string>, kind:NetworkEdge['kind'], alternative:boolean) {
   const source = edge.source;
   if(source===target.id || seen.has(source))return;
   // General arithmetic has multiple unrelated uses; never contract through it.
   if(arithmeticIds.has(source))return;
   if(mapIds.has(source)) {
    const key = `${source}--${target.id}--${kind}--${alternative?'alternative':'active'}`;
    const old=result.get(key), label=via.length ? `${edge.label} · über ${via.map(id=>conceptById[id].title).join(', ')}` : edge.label;
    if(!old || !via.length)result.set(key,{...edge,id:key,source,target:target.id,kind,alternative,label});
    return;
   }
   const nextSeen=new Set(seen).add(source);
   for(const before of incoming.get(source)||[]) {
    // Interpretive edges are never inputs to a computation.
    if(before.kind==='meaning')continue;
    const nextKind=kind==='meaning'?'meaning':kind==='condition'||before.kind==='condition'?'condition':kind==='optional'||before.kind==='optional'?'optional':'build';
    walk(before,[...via,source],nextSeen,nextKind,alternative||!!before.alternative);
   }
  }
  for(const e of incoming.get(target.id)||[])walk(e,[],new Set(),e.kind,!!e.alternative);
 }
 const projected=explainRelations([...result.values()]);
 // Shared results are read-only; the bounded cache cannot retain the whole
 // navigation history. Numeric data/case changes do not change this graph.
 projected.forEach(Object.freeze);Object.freeze(projected);
 if(relationCache.size>=48)relationCache.delete(relationCache.keys().next().value!);
 relationCache.set(cacheKey,projected);return projected;
}

// A selected calculation opens in the inspector while its statistical result
// remains the map anchor. All context (X/Y, ranks, variant) stays on the Ref.
const homes:Record<string,string>={count:'validn',add:'mean',subtract:'centering',multiply:'covariance',divide:'mean',square:'ss',sqrt:'sd',sum:'mean',deviation:'centering',squared_deviation:'ss',crossproduct:'covariance',crossproduct_sum:'covariance',sd_product:'pearson',df:'general_df',positive_sd:'sd'};
export function mapAnchor(r:Ref|null,anchor?:Ref|null):Ref|null {
 if(!r || mapIds.has(r.id))return r;
 if(anchor&&mapIds.has(anchor.id))return anchor;
 const out=outputRef(r);
 const id=mapIds.has(out.id)?out.id:out.use==='z'&&['crossproduct','crossproduct_sum'].includes(out.id)?'pearson':homes[out.id]||homes[r.id];
 return id?{...out,id}:null;
}
export function visibleNeighbors(r:Ref,route:Route,anchor?:Ref) {
 const edges=visibleRelations(r,route,anchor);
 return {before:edges.filter(e=>e.target===r.id),after:edges.filter(e=>e.source===r.id)};
}
export function visibleRelated(selected:Ref|null,trace=false,route:Route='covariance',anchor?:Ref) {
 const focus=mapAnchor(selected,anchor);
 if(!focus)return new Set(mapIds);
 const edges=visibleRelations(selected,route,anchor);
 if(trace)return incomingPaths(focus.id,edges).nodes;
 return new Set([focus.id,...edges.filter(e=>!e.alternative&&(e.source===focus.id||e.target===focus.id)).flatMap(e=>[e.source,e.target])]);
}
