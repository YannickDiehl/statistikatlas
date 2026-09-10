import { ref, valueFor, valuesFor, symbol, numberText, indexFor, outputRef, contextFor, allowedFor, type Ref, type LessonContext, type Variable } from './learning';
import { previewIndices, middleValues, distributionGroups } from './descriptive';
import { formatValue } from './survey';
export type Expression = string | {type:'term';label:string;target:Ref;hint:string;caseId?:string} | {type:'row';items:Expression[]} | {type:'fraction';top:Expression;bottom:Expression;operation:Ref} | {type:'sum';body:Expression;target:Ref;count:Ref} | {type:'power';body:Expression;operation:Ref} | {type:'root';body:Expression;operation:Ref};
const row=(...items:Expression[]):Expression=>({type:'row',items});
export function formulaFor(original:Ref,c:LessonContext,numeric=false):Expression {
 const raw=c;c=contextFor(original,c);const r=outputRef(original);
 const targetRef=(id:string,a:Variable=r.variable,use?:string)=>id==='series'&&original.basis==='ranks'?ref('ranks',a):ref(id,a,use,original.basis);
 if(!allowedFor(original,raw))return 'Wähle eine passende Spalte für diese Rechnung.';
 const v=r.variable,i=indexFor(c),s=c.stats,caseId=c.pairs[i]?.id;
 const labelFor=(id:string,a:Variable=v):string=>({series:original.basis==='ranks'?`R(${symbol(a)})`:symbol(a),mean:symbol(a,'mean'),sd:symbol(a,'sd'),variance:symbol(a,'variance'),deviation:`d${a==='x'?'ₓ':'ᵧ'}ᵢ`,centering:`${a}ᶜᵢ`,squared_deviation:`d${a==='x'?'ₓ':'ᵧ'}ᵢ²`,ss:`SS${a==='x'?'ₓ':'ᵧ'}`,validn:'n',df:'n − 1',sum:`Σ${a}ᵢ`,z:symbol(a,'z'),crossproduct:r.use==='z'?'zₓᵢzᵧᵢ':'pᵢ',crossproduct_sum:r.use==='z'?'Σzₓᵢzᵧᵢ':'SPₓᵧ',covariance:'sₓᵧ',sd_product:'sₓsᵧ',pearson:'r'}[id]||id);
 const term=(id:string,a:Variable=v,label?:string,use?:string):Expression=>{const target=targetRef(id,a,use),n=valueFor(target,c),text=label||labelFor(id,a);return {type:'term',target,label:numeric?numberText(n):text,hint:`${text}: ${numberText(n)}${['series','deviation','centering','squared_deviation','z','crossproduct'].includes(id)?` · Person ${i+1}`:''}`,caseId:['series','deviation','centering','squared_deviation','z','crossproduct'].includes(id)?caseId:undefined};};
 const fraction=(top:Expression,bottom:Expression,use=r.id):Expression=>({type:'fraction',top,bottom,operation:use==='z'?targetRef('scaling',v,'z'):use==='scaling'?targetRef('scaling',v):targetRef('divide',v,use)});
 const op=(label:string,id:string,use:string):Expression=>({type:'term',label,target:targetRef(id,v,use),hint:`${label}: Rechenschritt erklären`});
 const sum=(source:string,target:string,use?:string):Expression=>numeric?row(...previewIndices(c.pairs.length,i).flatMap((j,k,list):Expression[]=>{const n=valuesFor(source,v,c)[j];return [...(k?(j>list[k-1]+1?[' + … + ']:[' + ']):[]),{type:'term',label:n!<0?`(${numberText(n)})`:numberText(n),target:targetRef(source==='zproducts'?'crossproduct':source,v,source==='zproducts'?'z':undefined),caseId:c.pairs[j]?.id,hint:`Beitrag von ${c.pairs[j]?.id}: ${numberText(n)}`}];})):{type:'sum',body:{...term(source==='zproducts'?'crossproduct':source,v,source==='zproducts'?'zₓᵢzᵧᵢ':undefined,source==='zproducts'?'z':undefined) as Exclude<Expression,string>,hint:'i durchläuft alle verwendeten Personen; den einzelnen Beitrag erklären',caseId:undefined} as Expression,target:targetRef(target,v,use),count:targetRef('validn')};
 let body:Expression='';
 switch(r.id){
 case 'nominal':return 'Kategorien unterscheiden · keine Rangfolge';
 case 'ordinal':return 'Kategorien ordnen · keine festen Abstände';
 case 'frequency':{const value=c.pairs[i]?.[v],group=distributionGroups(c.pairs.map(p=>p[v]),c.columns?.[v]).find(g=>g.indices.includes(i)),count=group?.count||0;return numeric?row(`${group?.label||formatValue(c.columns?.[v],value)}: `,{type:'fraction',top:{type:'term',label:String(count),target:targetRef('frequency'),hint:'Absolute Häufigkeit der ausgewählten Ausprägung'},bottom:term('validn'),operation:targetRef('divide',v,'frequency')},` ≈ ${numberText(s.n?count/s.n*100:null)} %`):row('hⱼ = ',{type:'fraction',top:{type:'term',label:'nⱼ',target:targetRef('frequency'),hint:'Anzahl der Fälle in Kategorie j'},bottom:term('validn'),operation:targetRef('divide',v,'frequency')});}
 case 'ranks':return row(numeric?`Rang von ${formatValue(c.columns?.[v],c.pairs[i]?.[v])} ≈ ${numberText(valueFor(r,c))}`:`R(${symbol(v)}) = mittlerer belegter Rangplatz`);
 case 'spearman':return row(numeric?'ρₛ ≈ ':'ρₛ = ',{type:'term',label:numeric?numberText(valueFor(r,c)):'r',target:ref('pearson',v,undefined,'ranks'),hint:'Pearson mit den Rängen von X und Y öffnen'},numeric?'':'(',...(!numeric?[{type:'term',label:'R(X)',target:ref('ranks','x'),hint:'Ränge von X bilden'} as Expression,'; ',{type:'term',label:'R(Y)',target:ref('ranks','y'),hint:'Ränge von Y bilden'} as Expression,')']:[]));
 case 'median':{const m=middleValues(c.pairs.map(p=>p[v]));return numeric?row(m?(c.columns?.[v].categories?`${formatValue(c.columns?.[v],m[0])} und ${formatValue(c.columns?.[v],m[1])} → mittlere Kategorien`:`(${numberText(m[0])} + ${numberText(m[1])}) / 2 ≈ ${numberText((m[0]+m[1])/2)}`):'Nicht definiert'):row('Median = Mitte der ',{type:'term',label:'geordneten Werte',target:targetRef('ranks'),hint:'Ordnung und gleiche Rangplätze erklären'});}
 case 'crosstab':{const p=c.pairs[i],count=c.pairs.filter(q=>q.x===p?.x&&q.y===p?.y).length,rowCount=c.pairs.filter(q=>q.x===p?.x).length;return numeric?row(`Ausgewählte Zelle: ${count} / ${rowCount} ≈ ${numberText(rowCount?100*count/rowCount:null)} % der Zeile`):row('nⱼₖ = Anzahl der ',{type:'term',label:'Wertepaare',target:targetRef('pairs'),hint:'Beide Angaben derselben Person'},' mit x = aⱼ und y = bₖ');}
 case 'mean':body=fraction(numeric?term('sum'):sum('series','sum'),term('validn'));break;
 case 'sum':body=sum('series','sum');break;
 case 'validn':body=numeric?String(s.n):{type:'term',label:'Anzahl der Werte',target:targetRef('count','x','validn'),hint:'Jeder verwendete Fall zählt einmal.'};break;
 case 'df':body=row(term('validn'),op('−','subtract','df'),' 1');break;
 case 'deviation':case 'centering':body=row(term('series'),op('−','subtract',r.id),term('mean'));break;
 case 'squared_deviation':body={type:'power',body:term('deviation'),operation:targetRef('square',v,'squared_deviation')};break;
 case 'ss':body=sum('squared_deviation','ss');break;
 case 'variance':body=fraction(term('ss'),term('df'));break;
 case 'sd':body={type:'root',body:term('variance'),operation:targetRef('sqrt',v,'sd')};break;
 case 'z':body=fraction(row(term('series'),op('−','subtract','centering'),term('mean')),term('sd'),'z');break;
 case 'scaling':body=fraction(term(r.use==='z'?'centering':'series',v,'uᵢ'),term('sd',v,'a'),r.use==='z'?'z':'scaling');break;
 case 'crossproduct':body=r.use==='z'?row(term('z','x'),op('·','multiply','zproducts'),term('z','y')):row('(',term('deviation','x'),')',op('·','multiply','crossproduct'),'(',term('deviation','y'),')');break;
 case 'crossproduct_sum':body=sum(r.use==='z'?'zproducts':'crossproduct','crossproduct_sum',r.use);break;
 case 'covariance':body=fraction(term('crossproduct_sum'),term('df'));break;
 case 'sd_product':body=row(term('sd','x'),op('·','multiply','sd_product'),term('sd','y'));break;
 case 'pearson':body=c.route==='z'?fraction(numeric?term('crossproduct_sum',v,'Σzₓᵢzᵧᵢ','z'):sum('zproducts','crossproduct_sum','z'),term('df')):fraction(term('covariance'),row(term('sd','x'),op('·','multiply','sd_product'),term('sd','y')));break;
 case 'series':return numeric?row('(',...previewIndices(c.pairs.length,i).flatMap((j,k,list):Expression[]=>[...(k?(j>list[k-1]+1?['; …; ']:['; ']):[]),{type:'term',label:formatValue(c.columns?.[v],c.pairs[j][v]),target:r,hint:c.pairs[j].id,caseId:c.pairs[j].id}]),')'):row('(',{type:'term',label:`${v}₁`,target:r,hint:'Erster Wert',caseId:c.pairs[0]?.id},'; …; ',{type:'term',label:`${v}ₙ`,target:r,hint:'Letzter Wert',caseId:c.pairs.at(-1)?.id},')');
 case 'pairs':return row('(',term('series','x'),'; ',term('series','y'),')');
 case 'count':return numeric?row(c.pairs.length>8?`1; 2; …; ${s.n}`:c.pairs.map((_,j)=>String(j+1)).join('; '),' → n = ',String(s.n)):row('1, 2, …, ',term('validn'));
 case 'metric':return 'Gleiche Zahlenabstände → gleiche Merkmalsabstände';
 case 'linear':return 'Ein geradliniges Muster in den Wertepaaren';
 case 'positive_sd':return numeric?row('s = ',term('sd'),valueFor(targetRef('sd',v),c)===null?' · noch nicht definiert':valueFor(targetRef('sd',v),c)!>0?' · Voraussetzung erfüllt':' · Voraussetzung nicht erfüllt'):row(term('sd'),' > 0');
 default: {
 const a=c.pairs[i]?.[v]??null,b=c.pairs[(i+1)%Math.max(c.pairs.length,1)]?.[v]??null;
 const x:Expression={type:'term',label:numeric?numberText(a):'a',target:targetRef('series',v),hint:`a: Wert von Person ${i+1}`,caseId},y:Expression={type:'term',label:numeric?numberText(b):'b',target:targetRef('series',v),hint:'b: Wert der nächsten Person',caseId:c.pairs[(i+1)%Math.max(c.pairs.length,1)]?.id};
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
