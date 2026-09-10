import { ref, valueFor, valuesFor, symbol, numberText, indexFor, outputRef, type Ref, type LessonContext, type Variable } from './learning';
export type Expression = string | {type:'term';label:string;target:Ref;hint:string;caseId?:string} | {type:'row';items:Expression[]} | {type:'fraction';top:Expression;bottom:Expression;operation:Ref} | {type:'sum';body:Expression;target:Ref;count:Ref} | {type:'power';body:Expression;operation:Ref} | {type:'root';body:Expression;operation:Ref};
const row=(...items:Expression[]):Expression=>({type:'row',items});
export function formulaFor(original:Ref,c:LessonContext,numeric=false):Expression {
 const r=outputRef(original);
 const v=r.variable,i=indexFor(c),s=c.stats,caseId=c.pairs[i]?.id;
 const labelFor=(id:string,a:Variable=v):string=>({series:symbol(a),mean:symbol(a,'mean'),sd:symbol(a,'sd'),variance:symbol(a,'variance'),deviation:`d${a==='x'?'ₓ':'ᵧ'}ᵢ`,centering:`${a}ᶜᵢ`,squared_deviation:`d${a==='x'?'ₓ':'ᵧ'}ᵢ²`,ss:`SS${a==='x'?'ₓ':'ᵧ'}`,validn:'n',df:'n − 1',sum:`Σ${a}ᵢ`,z:symbol(a,'z'),crossproduct:r.use==='z'?'zₓᵢzᵧᵢ':'pᵢ',crossproduct_sum:r.use==='z'?'Σzₓᵢzᵧᵢ':'SPₓᵧ',covariance:'sₓᵧ',sd_product:'sₓsᵧ',pearson:'r'}[id]||id);
 const term=(id:string,a:Variable=v,label?:string,use?:string):Expression=>{const target=ref(id,a,use),n=valueFor(target,c),text=label||labelFor(id,a);return {type:'term',target,label:numeric?numberText(n):text,hint:`${text}: ${numberText(n)}${['series','deviation','centering','squared_deviation','z','crossproduct'].includes(id)?` · Person ${i+1}`:''}`,caseId:['series','deviation','centering','squared_deviation','z','crossproduct'].includes(id)?caseId:undefined};};
 const fraction=(top:Expression,bottom:Expression,use=r.id):Expression=>({type:'fraction',top,bottom,operation:use==='z'?ref('scaling',v,'z'):use==='scaling'?ref('scaling',v):ref('divide',v,use)});
 const op=(label:string,id:string,use:string):Expression=>({type:'term',label,target:ref(id,v,use),hint:`${label}: Rechenschritt erklären`});
 const sum=(source:string,target:string,use?:string):Expression=>numeric?row(...valuesFor(source,v,c).flatMap((n,j):Expression[]=>[...(j?[' + ']:[]),{type:'term',label:n!<0?`(${numberText(n)})`:numberText(n),target:ref(source==='zproducts'?'crossproduct':source,v,source==='zproducts'?'z':undefined),caseId:c.pairs[j]?.id,hint:`Beitrag von Person ${j+1}: ${numberText(n)}`}])):{type:'sum',body:{...term(source==='zproducts'?'crossproduct':source,v,source==='zproducts'?'zₓᵢzᵧᵢ':undefined,source==='zproducts'?'z':undefined) as Exclude<Expression,string>,hint:'i durchläuft alle verwendeten Personen; den einzelnen Beitrag erklären',caseId:undefined} as Expression,target:ref(target,v,use),count:ref('validn')};
 let body:Expression='';
 switch(r.id){
 case 'mean':body=fraction(numeric?term('sum'):sum('series','sum'),term('validn'));break;
 case 'sum':body=sum('series','sum');break;
 case 'validn':body=numeric?String(s.n):{type:'term',label:'Anzahl der Werte',target:ref('count','x','validn'),hint:'Jeder verwendete Fall zählt einmal.'};break;
 case 'df':body=row(term('validn'),op('−','subtract','df'),' 1');break;
 case 'deviation':case 'centering':body=row(term('series'),op('−','subtract',r.id),term('mean'));break;
 case 'squared_deviation':body={type:'power',body:term('deviation'),operation:ref('square',v,'squared_deviation')};break;
 case 'ss':body=sum('squared_deviation','ss');break;
 case 'variance':body=fraction(term('ss'),term('df'));break;
 case 'sd':body={type:'root',body:term('variance'),operation:ref('sqrt',v,'sd')};break;
 case 'z':body=fraction(row(term('series'),op('−','subtract','centering'),term('mean')),term('sd'),'z');break;
 case 'scaling':body=fraction(term(r.use==='z'?'centering':'series',v,'uᵢ'),term('sd',v,'a'),r.use==='z'?'z':'scaling');break;
 case 'crossproduct':body=r.use==='z'?row(term('z','x'),op('·','multiply','zproducts'),term('z','y')):row('(',term('deviation','x'),')',op('·','multiply','crossproduct'),'(',term('deviation','y'),')');break;
 case 'crossproduct_sum':body=sum(r.use==='z'?'zproducts':'crossproduct','crossproduct_sum',r.use);break;
 case 'covariance':body=fraction(term('crossproduct_sum'),term('df'));break;
 case 'sd_product':body=row(term('sd','x'),op('·','multiply','sd_product'),term('sd','y'));break;
 case 'pearson':body=c.route==='z'?fraction(numeric?term('crossproduct_sum',v,'Σzₓᵢzᵧᵢ','z'):sum('zproducts','crossproduct_sum','z'),term('df')):fraction(term('covariance'),row(term('sd','x'),op('·','multiply','sd_product'),term('sd','y')));break;
 case 'series':return numeric?row('(',...c.pairs.flatMap((p,j):Expression[]=>[...(j?['; ']:[]),{type:'term',label:numberText(p[v]),target:r,hint:`Person ${j+1}`,caseId:p.id}]),')'):row('(',{type:'term',label:`${v}₁`,target:r,hint:'Erster Wert',caseId:c.pairs[0]?.id},'; …; ',{type:'term',label:`${v}ₙ`,target:r,hint:'Letzter Wert',caseId:c.pairs.at(-1)?.id},')');
 case 'pairs':return row('(',term('series','x'),'; ',term('series','y'),')');
 case 'count':return numeric?row(c.pairs.map((_,j)=>String(j+1)).join('; '),' → n = ',String(s.n)):row('1, 2, …, ',term('validn'));
 case 'metric':return 'Gleiche Zahlenabstände → gleiche Merkmalsabstände';
 case 'linear':return 'Ein geradliniges Muster in den Wertepaaren';
 case 'positive_sd':return numeric?row('s = ',term('sd'),valueFor(ref('sd',v),c)===null?' · noch nicht definiert':valueFor(ref('sd',v),c)!>0?' · Voraussetzung erfüllt':' · Voraussetzung nicht erfüllt'):row(term('sd'),' > 0');
 default: {
 const a=c.pairs[i]?.[v]??null,b=c.pairs[(i+1)%Math.max(c.pairs.length,1)]?.[v]??null;
 const x:Expression={type:'term',label:numeric?numberText(a):'a',target:ref('series',v),hint:`a: Wert von Person ${i+1}`,caseId},y:Expression={type:'term',label:numeric?numberText(b):'b',target:ref('series',v),hint:'b: Wert der nächsten Person',caseId:c.pairs[(i+1)%Math.max(c.pairs.length,1)]?.id};
 if(r.id==='add')return row(x,' + ',y,numeric?` ≈ ${numberText(a===null||b===null?null:a+b)}`:'');
 if(r.id==='subtract')return row(x,' − ',y,numeric?` ≈ ${numberText(a===null||b===null?null:a-b)}`:'');
 if(r.id==='multiply')return row(x,' · ',y,numeric?` ≈ ${numberText(a===null||b===null?null:a*b)}`:'');
 if(r.id==='divide')return row(fraction(x,y,''),numeric?` ≈ ${numberText(a===null||b===null||b===0?null:a/b)}`:'  (b ≠ 0)');
 if(r.id==='square')return row({type:'power',body:x,operation:r},numeric?` ≈ ${numberText(valueFor(r,c))}`:' = a · a');
 if(r.id==='sqrt')return row({type:'root',body:x,operation:r},numeric?` ≈ ${numberText(valueFor(r,c))}`:'  (a ≥ 0)');
 return '';
 }
 }
 const lhs=r.id==='df'?'df':r.id==='scaling'?(r.use==='z'?symbol(v,'z'):`${v}*ᵢ`):labelFor(r.id);
 if(!numeric)return row(lhs,' = ',body);
 return row(body,' ≈ ',numberText(valueFor(r,c)));
}
