import { concepts } from './concepts';
import { entryById } from './mariposaCatalog';
import { incomingPaths, type NetworkEdge } from './network';
export type FocusMode='near'|'before'|'after';
export type DetailLevel='overview'|'names'|'detail';
export const detailLevel=(zoom:number):DetailLevel=>zoom<.32?'overview':zoom<.75?'names':'detail';
export const orientationPoints=new Set(['mean','pearson','normal_distribution','power','p_value','t_test','linear_regression','reliability','data_import','chi_square','quantile','variance_assumption','measurement_error']);
export const conceptRegion=(id:string)=>entryById[id]&&!entryById[id].existing?entryById[id].region:'basics';
export function focusPath(id:string|null,edges:NetworkEdge[],mode:FocusMode='near',hover=false){
 const nodes=new Set<string>(id?[id]:concepts.map(c=>c.id)),links=new Set<string>(),direct=new Set<string>();
 if(!id)return {nodes,edges:links,direct};
 const active=edges.filter(e=>!e.alternative);
 for(const e of active)if(e.source===id||e.target===id)direct.add(e.id);
 if(hover||mode==='before'){const incoming=incomingPaths(id,hover?active:active.filter(e=>e.kind!=='meaning'));incoming.nodes.forEach(n=>nodes.add(n));incoming.edges.forEach(e=>links.add(e));}
 else for(const e of active)if(mode==='after'?e.source===id||(e.kind==='meaning'&&e.target===id&&!!entryById[e.source]?.variants.length):e.source===id||e.target===id){nodes.add(e.source);nodes.add(e.target);links.add(e.id);}
 return {nodes,edges:links,direct};
}
// The overview uses actual inter-topic links; the full relation model remains intact.
export function overviewEdges(edges:NetworkEdge[]){
 const seen=new Set<string>();return edges.filter(e=>{
  if(e.alternative)return false;const a=conceptRegion(e.source),b=conceptRegion(e.target);
  if(a===b)return orientationPoints.has(e.source)&&orientationPoints.has(e.target);
  const key=[a,b].sort().join('/');if(seen.has(key))return false;seen.add(key);return true;
 });
}
export const focusLabels:Record<FocusMode,string>={near:'Direkte Bezüge',before:'Voraussetzungen',after:'Anwendungen'};

export const explorationGuides=[
 {id:'sample-size',title:'Was macht eine größere Stichprobe?',note:'Bei gleichem, von null verschiedenem beobachtetem Effekt und gleicher Streuung: mehr unabhängige Fälle → kleinerer Standardfehler → größere absolute Prüfgröße → kleinerer zweiseitiger p-Wert im entsprechenden Testmodell.',path:['validn','se','test_statistic','p_value']},
 {id:'correlation',title:'Wie hängen Streuung und Korrelation zusammen?',note:'Pearson teilt die Kovarianz durch das Produkt beider Standardabweichungen. Hier verfolgen wir den Aufbau dieses Nenners; die Kovarianz ist ein weiterer Eingang.',path:['variance','sd','sd_product','pearson']}
] as const;
export type ExplorationGuide=typeof explorationGuides[number];

export type LabelBox={id:string;x:number;y:number;width:number;height:number};
export function arrangeOverviewLabels(zoom:number,positions:Record<string,{x:number;y:number}>,areas:{id:string;labelX:number;labelY:number;width:number}[],selected?:string,hovered?:string){
 const boxes:LabelBox[]=[],nodes:Record<string,{dx:number;dy:number}>={},regions:Record<string,boolean>={};
 const free=(box:LabelBox)=>boxes.every(other=>box.x+box.width+6<=other.x||other.x+other.width+6<=box.x||box.y+box.height+6<=other.y||other.y+other.height+6<=box.y);
 function placeNode(id:string,force=false){const p=positions[id];if(!p)return;for(const [dx,dy] of (force?[[0,12],[0,-66],[0,72],[0,-126]]:[[0,12]])){const box={id,x:(p.x+98)*zoom-56+dx,y:(p.y+68)*zoom+dy,width:112,height:54};if(free(box)){boxes.push(box);nodes[id]={dx,dy};return;}}if(force){const box={id,x:(p.x+98)*zoom-56,y:(p.y+68)*zoom-190,width:112,height:54};boxes.push(box);nodes[id]={dx:0,dy:-190};}}
 if(hovered)placeNode(hovered,true);if(selected&&selected!==hovered)placeNode(selected,true);
 const selectedRegion=selected?conceptRegion(selected):undefined;
 for(const area of [...areas].sort((a,b)=>Number(b.id===selectedRegion)-Number(a.id===selectedRegion))){const width=Math.max(48,Math.min(145,area.width*zoom-18)),box={id:`region-${area.id}`,x:area.labelX*zoom-width/2,y:area.labelY*zoom-42,width,height:42};if(free(box)){boxes.push(box);regions[area.id]=true;}}
 for(const id of orientationPoints)if(!nodes[id])placeNode(id);
 return {nodes,regions,boxes};
}
