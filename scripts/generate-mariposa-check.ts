// Prüfverzeichnis für die R-Prüfstrecke: alle Katalogaufrufe, der Lehrdatensatz als SPSS-Datei
// (über writeSav, wie der Download im Atlas), die CSV und das Codebuch zum Abgleich, start.R = Startblock.
//   node --import tsx scripts/generate-mariposa-check.ts <prüfverzeichnis> [<mariposa-quellbaum>]
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {exampleVariants,analysisCode,summaryCode,SUMMARY_ENTRIES,surveyCsv,startBlock,SAV_NAME} from '../src/domain/mariposa';
import {writeSav,savVariableLabel,savMeasure} from '../src/domain/savWriter';
import {createSurvey,surveyColumns} from '../src/domain/survey';
import {mariposaExports,entryById} from '../src/domain/mariposaCatalog';
const directory=resolve(process.argv[2]||'tmp/mariposa-check');mkdirSync(directory,{recursive:true});
if(process.argv[3]){
 // Re-Exporte (der Pipe-Operator %>% ab mariposa 0.7.4) und Ersetzungsformen (var_label<-) zählen nicht als eigene
 // Funktionen; die Ersetzungsform gehört zum Begriff ihrer Grundfunktion.
 const api=JSON.parse(readFileSync(new URL('./mariposa-public-api.json',import.meta.url),'utf8')) as {reexports?:string[];replacementForms?:string[]};
 const skip=new Set([...(api.reexports||[]),...(api.replacementForms||[])]);
 const actual=[...readFileSync(resolve(process.argv[3],'NAMESPACE'),'utf8').matchAll(/^export\(([^)]+)\)/gm)].map(m=>m[1].replace(/^"(.*)"$/,'$1')).filter(fn=>!skip.has(fn)).sort();
 if(JSON.stringify(actual)!==JSON.stringify([...mariposaExports].sort()))throw new Error('Der öffentliche Namespace hat sich geändert. Katalog prüfen.');
}
const examples=exampleVariants().map((v,i)=>({id:v.entry.id,key:`${v.entry.id}:${v.settings.variant}`,variant:i,fn:v.variant.fn,label:v.variant.label,external:!!v.variant.external,code:analysisCode(v.entry,v.settings)}));
// Zusätzliche Wege, die die Voreinstellungen nicht erreichen: Ränge (von Spearman aus) und Faktoren für Regressionen.
const extra=(id:string,key:string,label:string,columns:Record<string,string[]>,variant=0,ranked=false)=>{const entry=entryById[id];examples.push({id,key,variant:examples.length,fn:entry.variants[variant].fn,label,external:false,code:analysisCode(entry,{variant,columns},ranked)});};
extra('pearson','pearson:0:ränge','Pearson auf mittleren Rängen',{x:['schulabschluss'],y:['finanzlage']},0,true);
extra('linear_regression','linear_regression:0:faktoren','Regression mit kategorialen Prädiktoren',{x:['wissenstest'],predictors:['lernzeit','geschlecht','schulabschluss']});
extra('linear_regression','linear_regression:1:faktor','Interaktion mit einem Faktor',{x:['wissenstest'],predictors:['lernzeit','berufsabschluss']},1);
extra('logistic_regression','logistic_regression:0:faktoren','Logitmodell mit kategorialem Prädiktor',{x:['weiterbildung'],predictors:['lernzeit','finanzlage']});
extra('marginal_effects','marginal_effects:0:faktoren','Marginale Effekte mit kategorialem Prädiktor',{x:['weiterbildung'],predictors:['lernzeit','geschlecht']});
// summary() der Ergebnisobjekte, die der Atlas in „In R“ ausführlich zeigt (efa: Ladungen, Eigenwerte, Kommunalitäten).
for(const v of exampleVariants().filter(v=>SUMMARY_ENTRIES.includes(v.entry.id)))examples.push({id:v.entry.id,key:`${v.entry.id}:${v.settings.variant}:summary`,variant:examples.length,fn:v.variant.fn,label:`${v.variant.label} mit summary()`,external:false,code:summaryCode(v.entry,v.settings)});
const rows=createSurvey();
writeFileSync(resolve(directory,'examples.json'),JSON.stringify(examples,null,1));
writeFileSync(resolve(directory,SAV_NAME),writeSav(rows,new Date(Date.UTC(2026,9,1,12))));
writeFileSync(resolve(directory,'Statistikatlas-200-Befragte-synthetisch.csv'),surveyCsv(rows));
// verify-sav.R prüft Werte und Labels; haven liest das Messniveau nicht aus. `measure` dokumentiert nur die Erwartung,
// geprüft wird es im TS-Rundlauf (src/domain/savWriter.test.ts).
writeFileSync(resolve(directory,'codebook-check.json'),JSON.stringify(surveyColumns.map(c=>({id:c.id,label:savVariableLabel(c),measure:savMeasure(c),categories:c.categories||[]})),null,1));
writeFileSync(resolve(directory,'start.R'),startBlock()+'\n');
console.log(`${examples.length} R-Prüfbeispiele und ${SAV_NAME} in ${directory}`);
