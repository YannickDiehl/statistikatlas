import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {exampleVariants,analysisCode,bootstrapCode,surveyCsv} from '../src/domain/mariposa';
import {createSurvey} from '../src/domain/survey';
import {mariposaExports,entryById} from '../src/domain/mariposaCatalog';
const directory=resolve(process.argv[2]||'tmp/mariposa-check');mkdirSync(directory,{recursive:true});
if(process.argv[3]){const actual=[...readFileSync(resolve(process.argv[3],'NAMESPACE'),'utf8').matchAll(/^export\(([^)]+)\)/gm)].map(m=>m[1]).sort();if(JSON.stringify(actual)!==JSON.stringify([...mariposaExports].sort()))throw new Error('Der öffentliche Namespace hat sich geändert. Katalog prüfen.');}
const examples=exampleVariants().map((v,i)=>({id:v.entry.id,variant:i,fn:v.variant.fn,label:v.variant.label,external:!!v.variant.external,code:analysisCode(v.entry,v.settings)}));
examples.push({id:'pearson',variant:110,fn:'pearson_cor',label:'Pearson auf mittleren Rängen',external:false,code:analysisCode(entryById.pearson,{variant:0,columns:{x:['schulabschluss'],y:['finanzlage']}},true)});
writeFileSync(resolve(directory,'examples.json'),JSON.stringify(examples));writeFileSync(resolve(directory,'Statistikatlas-200-Befragte-synthetisch.csv'),surveyCsv(createSurvey()));writeFileSync(resolve(directory,'start.R'),bootstrapCode());
console.log(`${examples.length} R-Prüfbeispiele in ${directory}`);
