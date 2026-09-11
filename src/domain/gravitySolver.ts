import type { NetworkEdge, Point } from './network';

export type Positions=Record<string,Point>;
export const cardWidth=226,cardHeight=146;
export const relationStrength={build:1,condition:.45,optional:.2,meaning:.12};

// Condense cycles before assigning depth. Only computational relations establish
// a reading direction; interpretation and assumptions never increase the rank.
export function dependencyDepth(ids:string[],edges:NetworkEdge[]):Record<string,number> {
 const adjacency=new Map(ids.map(id=>[id,[] as string[]]));
 for(const e of edges)if(e.kind==='build'&&!e.alternative)adjacency.get(e.source)?.push(e.target);
 let clock=0;const index=new Map<string,number>(),low=new Map<string,number>(),stack:string[]=[],onStack=new Set<string>(),groups:string[][]=[];
 function visit(id:string){index.set(id,clock);low.set(id,clock++);stack.push(id);onStack.add(id);
  for(const child of adjacency.get(id)||[]){if(!index.has(child)){visit(child);low.set(id,Math.min(low.get(id)!,low.get(child)!));}else if(onStack.has(child))low.set(id,Math.min(low.get(id)!,index.get(child)!));}
  if(low.get(id)===index.get(id)){const group:string[]=[];let child:string;do{child=stack.pop()!;onStack.delete(child);group.push(child);}while(child!==id);groups.push(group);}
 }
 ids.forEach(id=>{if(!index.has(id))visit(id);});
 const groupOf=new Map(groups.flatMap((g,i)=>g.map(id=>[id,i] as const))),parents=groups.map(()=>new Set<number>()),depths=new Map<number,number>();
 for(const e of edges)if(e.kind==='build'&&!e.alternative){const a=groupOf.get(e.source)!,b=groupOf.get(e.target)!;if(a!==b)parents[b].add(a);}
 function depth(i:number):number{if(depths.has(i))return depths.get(i)!;const d=Math.max(0,...[...parents[i]].map(p=>depth(p)+1));depths.set(i,d);return d;}
 return Object.fromEntries(ids.map(id=>[id,depth(groupOf.get(id)!)]));
}

export function pack(positions:Positions,order:string[],fixed?:string):Positions {
 const result:Positions={},occupied:Point[]=[];
 const overlaps=(p:Point,q:Point)=>Math.abs(p.x-q.x)<cardWidth&&Math.abs(p.y-q.y)<cardHeight;
 for(const id of fixed?[fixed,...order.filter(id=>id!==fixed)]:order){
  const home=positions[id];let p={...home};
  for(let radius=1;occupied.some(q=>overlaps(p,q));radius++){
   const candidates:Point[]=[];
   for(let dx=-radius;dx<=radius;dx++)for(let dy=-radius;dy<=radius;dy++)if(Math.max(Math.abs(dx),Math.abs(dy))===radius)candidates.push({x:home.x+dx*24,y:home.y+dy*24});
   candidates.sort((a,b)=>(a.x-home.x)**2+(a.y-home.y)**2-(b.x-home.x)**2-(b.y-home.y)**2);
   const free=candidates.find(q=>occupied.every(o=>!overlaps(q,o)));if(free){p=free;break;}
  }
  result[id]=p;occupied.push(p);
 }
 return result;
}

// Build-time relaxation: no force simulation runs during map hover or selection.
// Fixed seed, hub-normalized springs, rectangular collision and soft depth force.
export function solveGravity(ids:string[],allEdges:NetworkEdge[]):Positions {
 const edges=allEdges.filter(e=>!e.alternative),depth=dependencyDepth(ids,edges),degree=Object.fromEntries(ids.map(id=>[id,0]));
 for(const e of edges){degree[e.source]++;degree[e.target]++;}
 const meanDepth=ids.reduce((s,id)=>s+depth[id],0)/ids.length;
 const positions:Positions=Object.fromEntries(ids.map((id,i)=>[id,{x:(depth[id]-meanDepth)*340+Math.cos(i*2.399963)*220,y:Math.sin(i*2.399963)*Math.sqrt(i+1)*100}]));
 const velocity=Object.fromEntries(ids.map(id=>[id,{x:0,y:0}]));
 const links=edges.map(e=>({...e,strength:relationStrength[e.kind]/Math.sqrt(Math.max(degree[e.source],degree[e.target],1)),distance:e.kind==='build'?320:e.kind==='condition'?430:580}));
 for(let tick=0;tick<520;tick++){
  const alpha=Math.pow(1-tick/520,.65),forces=Object.fromEntries(ids.map(id=>[id,{x:((depth[id]-meanDepth)*340-positions[id].x)*.016,y:-positions[id].y*.0015}]));
  for(const e of links){const a=positions[e.source],b=positions[e.target],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1,f=(d-e.distance)*.14*e.strength/d;
   forces[e.source].x+=dx*f;forces[e.source].y+=dy*f;forces[e.target].x-=dx*f;forces[e.target].y-=dy*f;
   if(e.kind==='build'&&depth[e.target]>depth[e.source]&&dx<220){const push=(220-dx)*.04;forces[e.source].x-=push;forces[e.target].x+=push;}
  }
  for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){
   const a=ids[i],b=ids[j],dx=positions[b].x-positions[a].x,dy=positions[b].y-positions[a].y,d2=Math.max(100,dx*dx+dy*dy),d=Math.sqrt(d2),push=72000/d2;
   forces[a].x-=dx/d*push;forces[a].y-=dy/d*push;forces[b].x+=dx/d*push;forces[b].y+=dy/d*push;
   if(Math.abs(dx)<cardWidth&&Math.abs(dy)<cardHeight){
    if((cardWidth-Math.abs(dx))/cardWidth<(cardHeight-Math.abs(dy))/cardHeight){const f=(dx>=0?1:-1)*(cardWidth-Math.abs(dx))*.65;forces[a].x-=f;forces[b].x+=f;}
    else{const f=(dy>=0?1:-1)*(cardHeight-Math.abs(dy))*.65;forces[a].y-=f;forces[b].y+=f;}
   }
  }
  for(const id of ids){const v=velocity[id];v.x=(v.x+forces[id].x*alpha)*.55;v.y=(v.y+forces[id].y*alpha)*.55;positions[id].x+=Math.max(-40,Math.min(40,v.x));positions[id].y+=Math.max(-40,Math.min(40,v.y));}
 }
 return pack(positions,ids);
}
