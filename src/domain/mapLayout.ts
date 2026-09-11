import savedPlaces from './gravityPlaces.json';
import { pack, relationStrength, type Positions } from './gravitySolver';
import { mapIds, mapAnchor, visibleRelated, visibleRelations } from './visibleNetwork';
import type { Ref, Route } from './learning';
export type MapLayout=Positions;
export const restingPlaces:MapLayout=savedPlaces;

export function gravityMembers(selected:Ref,route:Route,trace=false,contextAnchor?:Ref):Set<string>{
 const members=visibleRelated(selected,trace,route,contextAnchor);
 if(selected.id==='oneway_anova'&&selected.use==='v1')for(const id of ['tukey_test','scheffe_test'])members.delete(id);
 return members;
}
export function gravityLayout(selected:Ref,route:Route,trace=false,previous:MapLayout=restingPlaces,contextAnchor?:Ref):MapLayout{
 const focus=mapAnchor(selected,contextAnchor);if(!focus)return previous;
 const members=gravityMembers(selected,route,trace,contextAnchor),anchor=previous[focus.id],targets:MapLayout=Object.fromEntries([...mapIds].map(id=>[id,{...previous[id]}]));
 for(const id of members)if(id!==focus.id){const p=previous[id];targets[id]={x:anchor.x+(p.x-anchor.x)*.66,y:anchor.y+(p.y-anchor.y)*.66};}
 const fixed=[...mapIds].filter(id=>!members.has(id)),moving=[...members].filter(id=>id!==focus.id);
 return pack(targets,[...fixed,...moving],focus.id);
}
export function dragLayout(id:string,position:{x:number;y:number},previous:MapLayout,selected:Ref|null,route:Route):MapLayout{
 const result:MapLayout=Object.fromEntries([...mapIds].map(key=>[key,{...previous[key]}]));
 const dx=position.x-previous[id].x,dy=position.y-previous[id].y;
 for(const edge of visibleRelations(selected,route).filter(e=>!e.alternative&&(e.source===id||e.target===id))){const key=edge.source===id?edge.target:edge.source,weight=relationStrength[edge.kind]*.22;result[key].x+=dx*weight;result[key].y+=dy*weight;}
 result[id]=position;return pack(result,[...mapIds],id);
}
