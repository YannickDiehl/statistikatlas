import type { NetworkEdge } from './network';

export type MapRole='neutral'|'focus'|'incoming'|'outgoing'|'both'|'ancestor';
export const directionColors={incoming:'#2869a2',outgoing:'#b35e21',focus:'#7950a3',neutral:'#879383'};
export const directionLabels:Record<MapRole,string>={neutral:'',focus:'Aktuell im Blick',incoming:'Eingehender Bezug',outgoing:'Ausgehender Bezug',both:'Bezüge in beide Richtungen',ancestor:'Weiter zurückliegender Eingang'};

// Direction always refers to one current focus. Interpretive outputs retain
// their outgoing direction even when incomingPaths includes them for context.
export function mapEmphasis(focus:string|undefined,edges:NetworkEdge[],pathEdges:ReadonlySet<string>=new Set()){
 const incoming=new Set<string>(),outgoing=new Set<string>(),ancestors=new Set<string>();
 for(const e of edges){if(e.alternative||!focus)continue;if(e.target===focus)incoming.add(e.source);if(e.source===focus)outgoing.add(e.target);if(pathEdges.has(e.id)&&e.kind!=='meaning'){ancestors.add(e.source);ancestors.add(e.target);}}
 function nodeRole(id:string):MapRole{
  if(!focus)return 'neutral';if(id===focus)return 'focus';
  if(incoming.has(id)&&outgoing.has(id))return 'both';if(incoming.has(id))return 'incoming';if(outgoing.has(id))return 'outgoing';if(ancestors.has(id))return 'ancestor';return 'neutral';
 }
 function edgeRole(e:NetworkEdge):MapRole{
  if(!focus||e.alternative)return 'neutral';if(e.target===focus)return 'incoming';if(e.source===focus)return 'outgoing';return pathEdges.has(e.id)?'ancestor':'neutral';
 }
 return {nodeRole,edgeRole,both:[...incoming].some(id=>outgoing.has(id))};
}

// Separate reciprocal or parallel relations without moving either endpoint.
export function relationLanes(edges:NetworkEdge[]):Map<string,number>{
 const groups=new Map<string,NetworkEdge[]>(),lanes=new Map<string,number>();
 for(const e of edges){if(e.alternative)continue;const key=[e.source,e.target].sort().join('/');groups.set(key,[...(groups.get(key)||[]),e]);}
 for(const group of groups.values())group.forEach((e,i)=>lanes.set(e.id,(i-(group.length-1)/2)*14*(e.source<e.target?1:-1)));
 return lanes;
}
