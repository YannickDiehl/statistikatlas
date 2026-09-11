import type { NetworkEdge, Point } from './network';
import { corePlaces, coreIds } from './organicStructure';
import { relationStrength, type Positions } from './gravitySolver';

export const pointGap=65;
export function separatePoints(positions:Positions,order:string[],fixed?:string):Positions{
 const result:Positions={};
 for(const id of fixed?[fixed,...order.filter(key=>key!==fixed)]:order){
  const home=positions[id];let p={...home};
  for(let attempt=0;Object.values(result).some(q=>Math.hypot(p.x-q.x,p.y-q.y)<pointGap);attempt++){
   const angle=attempt*2.399963,r=pointGap*Math.sqrt(1+attempt*.4);p={x:home.x+Math.cos(angle)*r,y:home.y+Math.sin(angle)*r};
  }
  result[id]=p;
 }
 return result;
}
// Once at build time. Real connected neighbors determine the remaining points;
// no topic membership, runtime simulation or moving target on selection.
export function organicLayout(ids:string[],allEdges:NetworkEdge[]):Positions{
 const edges=allEdges.filter(e=>!e.alternative),neighbors=new Map(ids.map(id=>[id,[] as {id:string;weight:number}[]]));
 for(const e of edges){const weight=relationStrength[e.kind];neighbors.get(e.source)!.push({id:e.target,weight});neighbors.get(e.target)!.push({id:e.source,weight});}
 const distance=Object.fromEntries(ids.map(id=>[id,coreIds.has(id)?0:Infinity]));
 for(let pass=0;pass<ids.length;pass++)for(const id of ids)for(const n of neighbors.get(id)!)distance[id]=Math.min(distance[id],distance[n.id]+1);
 const positions:Positions=Object.fromEntries(Object.entries(corePlaces).map(([id,p])=>[id,{...p}]));
 const minor=ids.filter(id=>!coreIds.has(id)).sort((a,b)=>distance[a]-distance[b]||a.localeCompare(b));
 minor.forEach((id,i)=>{const adjacent=neighbors.get(id)!.filter(n=>positions[n.id]),sum=adjacent.reduce((s,n)=>s+n.weight,0)||1;
  const center=adjacent.reduce((p,n)=>({x:p.x+positions[n.id].x*n.weight/sum,y:p.y+positions[n.id].y*n.weight/sum}),{x:100,y:0});
  const angle=i*2.399963,r=80+distance[id]*35;positions[id]={x:center.x+Math.cos(angle)*r,y:center.y+Math.sin(angle)*r};
 });
 // Repel locally while retaining each point's semantic starting neighborhood.
 const homes=structuredClone(positions);
 for(let tick=0;tick<180;tick++)for(const id of minor){
  const p=positions[id],f:Point={x:(homes[id].x-p.x)*.06,y:(homes[id].y-p.y)*.06};
  for(const other of ids){if(other===id)continue;const q=positions[other],dx=p.x-q.x,dy=p.y-q.y,d=Math.hypot(dx,dy)||.1,min=coreIds.has(other)?110:pointGap+15;
   if(d<min){f.x+=dx/d*(min-d)*.18;f.y+=dy/d*(min-d)*.18;}
  }
  p.x+=f.x;p.y+=f.y;
 }
 return separatePoints(positions,[...Object.keys(corePlaces),...minor]);
}

export type LabelPlacement={x:number;y:number;width:number;height:number};
function labelSize(title:string){const font=14,max=160,words=title.split(/\s+/),lines=[''];for(const word of words){const line=lines[lines.length-1];if(line&&(line+' '+word).length*font*.57>max)lines.push(word);else lines[lines.length-1]=(line+' '+word).trim();}return {width:Math.min(230,Math.max(...lines.map(line=>line.length*font*.61))+8),height:lines.length*18+6};}
// Labels stay legible in screen pixels. Resolve overlaps without moving nodes.
export function placeLabels(positions:Positions,zoom:number,titles:Record<string,string>,priority:string[],forced:string[]=[]):Record<string,LabelPlacement>{
 const placed:Record<string,LabelPlacement>={},boxes:{x:number;y:number;width:number;height:number}[]=Object.values(positions).map(p=>({x:p.x*zoom-8,y:p.y*zoom-8,width:16,height:16}));
 for(const id of priority){const p=positions[id];if(!p)continue;const {width,height}=labelSize(titles[id]),cx=p.x*zoom,cy=p.y*zoom;
  const candidates:LabelPlacement[]=[];
  for(const gap of [15,30,50,75,105])candidates.push({x:-width/2,y:-height-gap,width,height},{x:-width/2,y:gap,width,height},{x:gap,y:-height/2,width,height},{x:-width-gap,y:-height/2,width,height},{x:gap,y:gap,width,height},{x:-width-gap,y:gap,width,height},{x:gap,y:-height-gap,width,height},{x:-width-gap,y:-height-gap,width,height});
  const candidate=candidates.find(c=>boxes.every(b=>cx+c.x+width+5<b.x||cx+c.x>b.x+b.width+5||cy+c.y+height+4<b.y||cy+c.y>b.y+b.height+4));
  if(!candidate&&!forced.includes(id))continue;
  const c=candidate||candidates[0];placed[id]=c;boxes.push({x:cx+c.x,y:cy+c.y,width,height});
 }
 return placed;
}
