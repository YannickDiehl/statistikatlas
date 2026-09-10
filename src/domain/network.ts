import { concepts, connections, type Edge } from './concepts';
import { ref, inputs, isOperation, outputRef, keyOf, type Ref, type Route } from './learning';
export type Point={x:number;y:number};
// Fixed places make the map a spatial memory. Selection never rearranges it.
export const places:Record<string,Point>={
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
export const landmarks=new Set(['mean','sd','z','pearson']);
export const mapTitles:Record<string,string>={pairs:'Wertepaare',metric:'Metrische Daten',deviation:'Abweichung',squared_deviation:'Abweichung²',ss:'Quadratsumme',df:'Freiheitsgrade',positive_sd:'Streuung > 0',crossproduct:'Abweichungsprodukt',crossproduct_sum:'Produktsumme',sd_product:'Streuungsprodukt',linear:'Linearer Zusammenhang',pearson:'Pearson-r',z:'z-Wert'};
export type NetworkEdge=Edge&{alternative?:boolean};
function zProducts(selected:Ref|null,route:Route){if(!selected)return false;const out=outputRef(selected);return out.id==='z'||out.use==='z'&&['crossproduct','crossproduct_sum','scaling'].includes(out.id)||out.id==='pearson'&&route==='z';}
function recipeRefs(selected:Ref,route:Route){const result:Ref[]=[],seen=new Set<string>();function walk(r:Ref){if(seen.has(keyOf(r)))return;seen.add(keyOf(r));result.push(r);inputs(r,route).forEach(walk);}walk(selected);return result;}
// The same places support different uses. Edges explicitly distinguish a current
// calculation from another use of an operation or a product.
export function mapRelations(selected:Ref|null,route:Route):NetworkEdge[]{
 const standardized=zProducts(selected,route),pearsonZ=standardized,scalingZ=selected&&referenceInMap('scaling',selected,route).use==='z';
 const edges:NetworkEdge[]=connections.map(e=>({...e}));
 const alter=(source:string,target:string,label:string,alternative=false)=>{const e=edges.find(e=>e.source===source&&e.target===target);if(e)Object.assign(e,{label,alternative});else edges.push({id:`${source}--${target}`,source,target,label,kind:'build',alternative});};
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
 return edges;
}
export function neighbors(id:string,selected:Ref|null=null,route:Route='covariance'){const edges=mapRelations(selected,route);return {before:edges.filter(e=>e.target===id),after:edges.filter(e=>e.source===id)};}
export function relatedIds(selected:Ref|null,ancestors=false,route:Route='covariance'){
 if(!selected)return new Set(concepts.map(c=>c.id));
 const edges=mapRelations(selected,route),id=selected.id,result=new Set([id]);
 for(const e of edges.filter(e=>!e.alternative&&(e.source===id||e.target===id))){result.add(e.source);result.add(e.target);}
 if(ancestors){const seen=new Set<string>();function walk(target:string){if(seen.has(target))return;seen.add(target);for(const e of edges.filter(e=>e.target===target&&!e.alternative&&(e.kind!=='optional'||target==='pearson'&&e.source!=='linear'))){result.add(e.source);walk(e.source);}}walk(id);}
 return result;
}
// A concept occupies one place, while its calculation retains its X/Y use.
export function referenceInMap(id:string,selected:Ref|null,route:Route):Ref {
 if(selected?.id===id)return selected;
 if(selected){const match=recipeRefs(selected,route).find(r=>r.id===id);if(match)return match;if(zProducts(selected,route)&&['crossproduct','crossproduct_sum'].includes(id))return ref(id,selected.variable,'z');}
 return ref(id,selected?.variable||'x');
}
export function routeAfterSelection(from:Ref|null,to:Ref,route:Route):Route{
 if(to.id!=='pearson'||!from)return route;
 const out=outputRef(from);
 if(out.id==='covariance'||out.id==='sd_product')return 'covariance';
 if(out.id==='z'||out.use==='z'&&['crossproduct','crossproduct_sum','scaling'].includes(out.id))return 'z';
 return route;
}
