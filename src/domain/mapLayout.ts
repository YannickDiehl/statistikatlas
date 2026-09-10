import { concepts } from './concepts';
import { entryById } from './mariposaCatalog';
import { places, regions, regionConcepts, relatedIds, mapRelations, type Point } from './network';
import type { Ref, Route } from './learning';

export type MapLayout=Record<string,Point>;
const ids=concepts.map(c=>c.id),width=226,height=146;
const copy=(positions:MapLayout):MapLayout=>Object.fromEntries(ids.map(id=>[id,{...positions[id]}]));
const overlaps=(a:Point,b:Point)=>Math.abs(a.x-b.x)<width&&Math.abs(a.y-b.y)<height;

// Keep the established arithmetic map. New topics lean gently toward their
// shared ingredients instead of reading as separate rectangular grids.
const softTargets=copy(places),homeEdges=mapRelations(null,'covariance');
for(const id of ids){
 if(!entryById[id]||entryById[id].existing)continue;
 const links=homeEdges.filter(e=>!e.alternative&&(e.source===id||e.target===id));
 const neighbors=links.map(e=>places[e.source===id?e.target:e.source]);
 if(!neighbors.length)continue;
 const p=places[id],dx=neighbors.reduce((sum,q)=>sum+q.x-p.x,0)/neighbors.length,dy=neighbors.reduce((sum,q)=>sum+q.y-p.y,0)/neighbors.length;
 softTargets[id]={x:p.x+Math.max(-55,Math.min(55,dx*.055)),y:p.y+Math.max(-24,Math.min(24,dy*.035))};
}

// Deterministic final packing guarantees readable, separate click targets.
function pack(targets:MapLayout,order:string[]):MapLayout{
 const result:MapLayout={},occupied:Point[]=[];
 for(const id of order){
  const target=targets[id];let p={...target};
  if(occupied.some(q=>overlaps(p,q))){
   let found=false;
   for(let radius=1;!found;radius++){
    const candidates:Point[]=[];
    for(let dx=-radius;dx<=radius;dx++)for(let dy=-radius;dy<=radius;dy++)if(Math.max(Math.abs(dx),Math.abs(dy))===radius)candidates.push({x:target.x+dx*24,y:target.y+dy*24});
    candidates.sort((a,b)=>(a.x-target.x)**2+(a.y-target.y)**2-((b.x-target.x)**2+(b.y-target.y)**2));
    const free=candidates.find(a=>occupied.every(q=>!overlaps(a,q)));if(free){p=free;found=true;}
   }
  }
  result[id]=p;occupied.push(p);
 }
 return result;
}
export const restingPlaces=pack(softTargets,ids);

export function gravityMembers(selected:Ref,route:Route,trace=false):Set<string>{
 const members=relatedIds(selected,trace,route);
 // These post-hoc procedures depend on the classical ANOVA error term.
 if(selected.id==='oneway_anova'&&selected.use==='v1')for(const id of ['tukey_test','scheffe_test'])members.delete(id);
 return members;
}

export function gravityLayout(selected:Ref,route:Route,trace=false,previous:MapLayout=restingPlaces):MapLayout{
 const members=gravityMembers(selected,route,trace),anchor=previous[selected.id],home=restingPlaces[selected.id],targets=copy(restingPlaces);
 for(const id of members){const p=restingPlaces[id];targets[id]={x:anchor.x+(p.x-home.x)*.26,y:anchor.y+(p.y-home.y)*.26};}
 targets[selected.id]={...anchor};
 const result=copy(targets),links=mapRelations(selected,route).filter(e=>!e.alternative&&members.has(e.source)&&members.has(e.target));
 // A bounded spring relaxation settles before rendering. Hover never enters
 // this calculation; animation simply interpolates to the finished layout.
 for(let iteration=0;iteration<160;iteration++){
  const forces=Object.fromEntries(ids.map(id=>[id,{x:(targets[id].x-result[id].x)*.025,y:(targets[id].y-result[id].y)*.025}]));
  for(const edge of links){const a=result[edge.source],b=result[edge.target],dx=(b.x-a.x)/width,dy=(b.y-a.y)/height,d=Math.hypot(dx,dy)||1,f=(d-1.65)*.018/d;forces[edge.source].x+=dx*f*width;forces[edge.source].y+=dy*f*height;forces[edge.target].x-=dx*f*width;forces[edge.target].y-=dy*f*height;}
  for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){
   const a=result[ids[i]],b=result[ids[j]],dx=(b.x-a.x)/width,dy=(b.y-a.y)/height;
   if(Math.abs(dx)>=1||Math.abs(dy)>=1)continue;
   const fixed=ids[i]===selected.id||ids[j]===selected.id,f=fixed?.7:.35;
   if(1-Math.abs(dx)<1-Math.abs(dy)){const push=(dx>=0?1:-1)*(1-Math.abs(dx))*width*f;forces[ids[i]].x-=push;forces[ids[j]].x+=push;}
   else{const push=(dy>=0?1:-1)*(1-Math.abs(dy))*height*f;forces[ids[i]].y-=push;forces[ids[j]].y+=push;}
  }
  for(const id of ids)if(id!==selected.id){result[id].x+=Math.max(-35,Math.min(35,forces[id].x));result[id].y+=Math.max(-25,Math.min(25,forces[id].y));}
 }
 const order=[selected.id,...ids.filter(id=>id!==selected.id&&members.has(id)),...ids.filter(id=>!members.has(id))];
 return pack(result,order);
}

export function topicAreas(positions:MapLayout){return regions.map(region=>{
 const points=regionConcepts(region.id).map(id=>positions[id]),left=Math.min(...points.map(p=>p.x)),top=Math.min(...points.map(p=>p.y)),right=Math.max(...points.map(p=>p.x+196)),bottom=Math.max(...points.map(p=>p.y+112));
 return {...region,x:left-180,y:top-170,width:right-left+360,height:bottom-top+340,labelX:(left+right)/2,labelY:top-28};
});}
