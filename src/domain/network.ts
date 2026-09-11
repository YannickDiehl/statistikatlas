import { mariposaEntries, entryById, formulaTargets } from './mariposaCatalog';
import { concepts, connections, type Edge } from './concepts';
import { ref, inputs, isOperation, outputRef, keyOf, type Ref, type Route } from './learning';
export type Point={x:number;y:number};
// Home coordinates keep the map reproducible; mapLayout adds soft spacing and optional, reversible gravity.
export const places:Record<string,Point>={
 nominal:{x:0,y:750},ordinal:{x:240,y:750},frequency:{x:240,y:1050},ranks:{x:480,y:1050},median:{x:730,y:750},crosstab:{x:480,y:1300},spearman:{x:730,y:1300},
 pairs:{x:0,y:150},series:{x:0,y:340},metric:{x:0,y:540},
 count:{x:240,y:0},validn:{x:240,y:150},sum:{x:240,y:340},
 add:{x:480,y:0},mean:{x:480,y:340},df:{x:480,y:570},
 divide:{x:730,y:0},subtract:{x:730,y:170},deviation:{x:730,y:340},
 square:{x:990,y:0},squared_deviation:{x:990,y:170},centering:{x:990,y:540},
 ss:{x:1240,y:170},variance:{x:1240,y:340},scaling:{x:1240,y:710},
 sqrt:{x:1490,y:170},sd:{x:1490,y:340},positive_sd:{x:1490,y:540},z:{x:1490,y:750},
 multiply:{x:990,y:850},crossproduct:{x:990,y:1050},crossproduct_sum:{x:1240,y:1050},
 covariance:{x:1490,y:1050},sd_product:{x:1750,y:540},pearson:{x:1750,y:850},linear:{x:1750,y:1050},
};
export const regions=[
 {id:'probability_foundations',title:'Zufall & Verteilungen',description:'Von Ereignissen zu Verteilungsmodellen',x:-40,y:-1370,width:1840,height:800,columns:7},
 {id:'inference_foundations',title:'Schätzen & Testen verstehen',description:'Von der Stichprobe zum statistischen Schluss',x:2170,y:-1370,width:1620,height:800,columns:6},
 {id:'model_foundations',title:'Modelle beurteilen',description:'Annahmen, Vorhersage und Kausalität',x:4240,y:-125,width:1120,height:1000,columns:4},
 {id:'measurement_foundations',title:'Messung verstehen',description:'Von der Frage zur begründeten Skala',x:4240,y:1100,width:1120,height:1100,columns:4},
 {id:'basics',title:'Von Daten zu Kennwerten',description:'Die Rechenwege verbinden',x:-40,y:-125,width:2040,height:1595},
 {id:'prepare',title:'Daten vorbereiten',description:'Codes, Labels und Dateien',x:-1030,y:0,width:850,height:1180},
 {id:'inference',title:'Von Daten zu Schlüssen',description:'Unsicherheit und Hypothesen',x:2170,y:-125,width:850,height:820},
 {id:'groups',title:'Gruppen & Veränderungen',description:'Unabhängig oder verbunden?',x:2170,y:785,width:850,height:1360},
 {id:'models',title:'Modelle & Vorhersagen',description:'Regression und Kontrolle',x:3210,y:-125,width:850,height:1150},
 {id:'categorical',title:'Kategorien & Ränge',description:'Anteile und Zusammenhänge',x:-40,y:1625,width:1120,height:1000},
 {id:'describe',title:'Verteilungen verstehen',description:'Lage, Form und Gewichte',x:1170,y:1625,width:850,height:1000},
 {id:'scales',title:'Items & Skalen',description:'Messen und zusammenfassen',x:3210,y:1125,width:850,height:1120},
];
for(const region of regions.filter(r=>r.id!=='basics')){
 const entries=mariposaEntries.filter(e=>!e.existing&&e.region===region.id),columns=region.columns||(region.id==='categorical'?4:3);
 entries.forEach((entry,i)=>{places[entry.id]={x:region.x+35+(i%columns)*260,y:region.y+125+Math.floor(i/columns)*205};});
 region.height=Math.max(480,Math.ceil(entries.length/columns)*205+165);
}
export const regionConcepts=(id:string)=>id==='basics'?concepts.filter(c=>!mariposaEntries.some(e=>!e.existing&&e.id===c.id)).map(c=>c.id):mariposaEntries.filter(e=>!e.existing&&e.region===id).map(e=>e.id);
export const landmarks=new Set(['mean','sd','z','pearson','frequency','median','spearman','crosstab']);
export const mapTitles:Record<string,string>={sd:'Standard\u00adabweichung',nominal:'Nominale Kategorien',ordinal:'Geordnete Kategorien',frequency:'Häufigkeiten',ranks:'Ränge',median:'Median',spearman:'Spearman-ρ',crosstab:'Kreuztabelle',pairs:'Wertepaare',metric:'Metrische Daten',deviation:'Abweichung',squared_deviation:'Abweichung²',ss:'Quadratsumme',df:'Freiheitsgrade',positive_sd:'Streuung > 0',crossproduct:'Abweichungsprodukt',crossproduct_sum:'Produktsumme',sd_product:'Streuungsprodukt',linear:'Linearer Zusammenhang',pearson:'Pearson-r',z:'z-Wert'};
export type NetworkEdge=Edge&{alternative?:boolean};
export function incomingPaths(id:string,edges:NetworkEdge[]){
 const nodes=new Set([id]),links=new Set<string>(),seen=new Set<string>();
 function walk(target:string){if(seen.has(target))return;seen.add(target);for(const e of edges.filter(e=>e.target===target&&e.kind!=='meaning'&&!e.alternative)){nodes.add(e.source);links.add(e.id);walk(e.source);}}
 walk(id);for(const e of edges)if(e.kind==='meaning'&&!e.alternative&&(e.source===id||e.target===id)){nodes.add(e.source);nodes.add(e.target);links.add(e.id);}return {nodes,edges:links};
}
function zProducts(selected:Ref|null,route:Route){if(!selected)return false;const out=outputRef(selected);return out.id==='z'||out.use==='z'&&['crossproduct','crossproduct_sum','scaling'].includes(out.id)||out.id==='pearson'&&route==='z';}
const recipeCache=new Map<string,Ref[]>();
function recipeRefs(selected:Ref,route:Route){const cacheKey=JSON.stringify(selected)+route,cached=recipeCache.get(cacheKey);if(cached)return cached;const result:Ref[]=[],seen=new Set<string>();function walk(r:Ref){if(seen.has(keyOf(r)))return;seen.add(keyOf(r));result.push(r);inputs(r,route).forEach(walk);}walk(selected);if(recipeCache.size>256)recipeCache.clear();recipeCache.set(cacheKey,result);return result;}
// The same places support different uses. Edges explicitly distinguish a current
// calculation from another use of an operation or a product.
export function mapRelations(selected:Ref|null,route:Route,anchor?:Ref|null):NetworkEdge[]{
 const standardized=zProducts(selected,route),pearsonZ=standardized,scalingZ=selected&&referenceInMap('scaling',selected,route).use==='z';
 const rankUse=selected?.basis==='ranks'||selected?.id==='spearman'||selected?.id==='ranks';
 const edges:NetworkEdge[]=connections.map(e=>({...e}));
 const alter=(source:string,target:string,label:string,alternative=false)=>{const e=edges.find(e=>e.source===source&&e.target===target);if(e)Object.assign(e,{label,alternative});else edges.push({id:`${source}--${target}`,source,target,label,kind:'build',alternative});};
 const resolved=[...(anchor?recipeRefs(anchor,route):[]),...(selected?recipeRefs(selected,route):[])];
 for(const entry of mariposaEntries.filter(e=>!e.existing)){
  const r=resolved.find(r=>r.id===entry.id),variant=entry.variants[Number(r?.use?.slice(1)||0)],sources=new Set([...formulaTargets(variant?.formula||entry.formula),...entry.requires.map(r=>r.id)]);
  for(const e of edges)if(e.target===entry.id&&e.kind!=='meaning'&&!sources.has(e.source))e.alternative=true;
 }

 if(rankUse){for(const target of ['sum','deviation','scaling']){alter('series',target,'Andere Verwendung: ursprüngliche Zahlen statt Ränge',true);alter('ranks',target,'liefert hier die Ränge der ursprünglichen Antworten');}}
 if(standardized){
  alter('deviation','crossproduct','Andere Verwendung: Produkte unstandardisierter Abweichungen',true);
  alter('z','crossproduct','multipliziert zₓ und zᵧ derselben Person');
  alter('multiply','crossproduct','multipliziert die beiden z-Werte');
  alter('add','crossproduct_sum','addiert die Produkte der z-Werte');
  alter('crossproduct_sum','covariance','Andere Verwendung: Summe unstandardisierter Abweichungsprodukte',true);
  alter('crossproduct_sum','pearson','liefert die z-Produktsumme für das Teilen durch n − 1');
 }
 if(pearsonZ){
  alter('covariance','pearson','Weiterer Rechenweg: Kovarianz durch Streuungsprodukt',true);
  alter('sd_product','pearson','Weiterer Rechenweg: Nenner der standardisierten Kovarianz',true);
  alter('divide','pearson','teilt die z-Produktsumme durch n − 1');
 }else for(const source of ['z','multiply','add','df']){const e=edges.find(e=>e.source===source&&e.target==='pearson');if(e)e.alternative=true;}
 if(scalingZ){alter('series','scaling','Andere Verwendung: ursprüngliche Werte skalieren',true);alter('centering','scaling','liefert hier die bereits zentrierten Werte');}
 if(selected&&isOperation(selected)&&selected.use){
  const out=outputRef(selected);
  for(const e of edges.filter(e=>out.id!==selected.id&&e.source===selected.id&&e.target!==out.id)){e.alternative=true;e.label=`Weitere Verwendung: ${e.label}`;}
  for(const input of inputs(selected,route))alter(input.id,selected.id,'liefert einen Eingang dieser Rechnung');
 }
 for(const e of edges)if(e.kind==='meaning'&&e.variants){const r=resolved.find(r=>r.id===e.source);e.alternative=!e.variants.includes(Number(r?.use?.slice(1)||0));}
 return edges;
}
export function neighbors(id:string,selected:Ref|null=null,route:Route='covariance',anchor?:Ref){const edges=mapRelations(selected,route,anchor);return {before:edges.filter(e=>e.target===id),after:edges.filter(e=>e.source===id)};}
export function relatedIds(selected:Ref|null,ancestors=false,route:Route='covariance',anchor?:Ref){
 if(!selected)return new Set(concepts.map(c=>c.id));
 const edges=mapRelations(selected,route,anchor),id=selected.id,result=new Set([id]);
 for(const e of edges.filter(e=>!e.alternative&&(e.source===id||e.target===id))){result.add(e.source);result.add(e.target);}
 if(ancestors){const seen=new Set<string>();function walk(target:string){if(seen.has(target))return;seen.add(target);for(const e of edges.filter(e=>e.target===target&&e.kind!=='meaning'&&!e.alternative&&(e.kind!=='optional'||target==='pearson'&&e.source!=='linear'))){result.add(e.source);walk(e.source);}}walk(id);}
 return result;
}
// A concept occupies one place, while its calculation retains its X/Y use.
export function referenceInMap(id:string,selected:Ref|null,route:Route,anchor?:Ref):Ref {
 if(anchor?.id===id)return anchor;
 if(selected?.id===id)return selected;
 if(selected){const match=recipeRefs(selected,route).find(r=>r.id===id);if(match)return match;if(zProducts(selected,route)&&['crossproduct','crossproduct_sum'].includes(id))return ref(id,selected.variable,'z',selected.basis);}
 const rankUse=selected?.basis==='ranks'||selected?.id==='spearman'||selected?.id==='ranks';
 return ref(id,selected?.variable||'x',undefined,rankUse&&!mariposaEntries.some(e=>!e.existing&&e.id===id)&&!['series','pairs','ranks','median','spearman','frequency','crosstab','nominal','ordinal','metric'].includes(id)?'ranks':undefined);
}
export function routeAfterSelection(from:Ref|null,to:Ref,route:Route):Route{
 if(to.id!=='pearson'||!from)return route;
 const out=outputRef(from);
 if(out.id==='covariance'||out.id==='sd_product')return 'covariance';
 if(out.id==='z'||out.use==='z'&&['crossproduct','crossproduct_sum','scaling'].includes(out.id))return 'z';
 return route;
}
