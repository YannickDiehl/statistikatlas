import { eligible } from './mariposaRoles';
export { eligible } from './mariposaRoles';
import { columnById, surveyColumns, quantitative, type SurveyColumn, type SurveyRow } from './survey';
import { entryById, mariposaEntries, mariposaVersion, type AtlasEntry, type ColumnRole, type MethodVariant } from './mariposaCatalog';
export type RSettings={variant:number;columns:Record<string,string[]>};
export function rolesFor(entry:AtlasEntry,variant=0){return entry.variants[variant]?.roles||entry.roles;}
export function roleExplanation(role:ColumnRole){return ({quantitative:'Metrische Werte, 0/1-Indikatoren oder Likert-Items mit der sichtbaren Abstandsannahme.',ordered:'Geordnete Merkmale; numerische Originalcodes bleiben erhalten.',category:'Kategorien mit festen Antwortgruppen.',twoGroups:'Genau zwei Kategorien; eine Gruppenzugehörigkeit je Person.',binary:'0/1-Kodierung. Ereignis ist im Beispiel die Antwort 1.',continuous:'Kontinuierliche Messung; diskrete Ratings sind keine kontinuierliche Normalverteilung.',items:'Mindestens drei der fünf gemeinsamen 7-stufigen Lehritems. Gleiche Richtung; keine validierte Skala.',repeated:'Gleich skalierte Wissenstests derselben Personen.',pairedBinary:'Identische Ja/Nein-Frage vor und nach dem Kurs.',multiple:'Mindestens zwei Optionen derselben Mehrfachauswahlfrage.',predictor:'Quantitative Werte oder ausdrücklich als Faktoren kodierte Kategorien.',factors:'Zwei oder drei kategoriale Faktoren; Typ III mit Interaktionen.',interaction:'Genau zwei Prädiktoren; Haupteffekte und ihr Produkt.',likert:'Theoretische Skalenendpunkte werden aus dem Codebuch übernommen.'} as Record<string,string>)[role.kind];}
export function initialRSettings(entry:AtlasEntry,variant=0):RSettings{return {variant,columns:Object.fromEntries(rolesFor(entry,variant).map(r=>[r.key,[...r.default]]))};}
export function validateRSettings(entry:AtlasEntry,s:RSettings,likertMetric=true,rows?:SurveyRow[],ranked=false){
 const errors:string[]=[],used=new Set<string>();
 if(!Number.isInteger(s.variant)||!entry.variants[s.variant])return ['Keine passende R-Variante.'];
 for(const r of rolesFor(entry,s.variant)){const selected=s.columns[r.key]||[];const min=r.kind==='factors'||r.kind==='interaction'||r.kind==='multiple'?2:r.kind==='items'||r.key==='times'?3:1,max=r.kind==='factors'?3:r.kind==='interaction'?2:r.many?8:1;
  if(selected.length<min||selected.length>max)errors.push(`${r.label}: ${min===max?`genau ${min}`:`${min} bis ${max}`} Spalten wählen.`);
  for(const id of selected){const c=columnById[id];if(!c||!(eligible(r,c,likertMetric)||ranked&&['x','y'].includes(r.key)&&(c.scale!=='nominal'||c.kind==='binary')))errors.push(`${c?.title||id}: passt nicht zur Rolle „${r.label}“.`);if(used.has(id))errors.push('Eine Spalte kann nicht gleichzeitig mehrere Rollen besetzen.');used.add(id);
   if(rows&&c){const values=new Set(rows.map(row=>row.values[id]));if(values.size<2&&!['category','likert','multiple'].includes(r.kind))errors.push(`${c.title}: nur eine beobachtete Ausprägung; wähle eine streuende Variable.`);}
  }
 }
 return [...new Set(errors)];
}
export const rQuote=(s:string)=>JSON.stringify(s);
function factorCode(id:string,output=id,treatment=false){const c=columnById[id],levels=c.categories!;return `d$${output} <- factor(d$${id},\n  levels = c(${levels.map(k=>k.value).join(', ')}),\n  labels = c(${levels.map(k=>rQuote(k.label)).join(', ')}),\n  ordered = FALSE)${treatment?`\ncontrasts(d$${output}) <- stats::contr.treatment(levels(d$${output}), base = 1)`:''}`;}
export function analysisCode(entry:AtlasEntry,s:RSettings,ranked=false){
 const v=entry.variants[s.variant];if(!v)return '';const data=s.columns,first=data.x?.[0]||'lernzeit',c=columnById[first],lines=['library(mariposa)','d <- atlas'];
 if(ranked){lines.push('# Mittlere Ränge; Originaldaten in atlas bleiben erhalten.');for(const key of ['x','y'])for(const id of data[key]||[])lines.push(`d$${id} <- rank(d$${id}, ties.method = "average", na.last = "keep")`);}
 const converted=new Set<string>();
 for(const role of rolesFor(entry,s.variant)){
  if(role.key==='group'&&data.group?.[0]){lines.push(factorCode(data.group[0],'gruppe'));continue;}
  for(const id of data[role.key]||[]){const col=columnById[id];const regression=['predictor','interaction'].includes(role.kind),needsFactor=role.kind==='factors'||regression&&!!col.categories&&col.kind!=='likert';
   if(needsFactor&&!converted.has(id)){lines.push(factorCode(id,id,regression));converted.add(id);}
  }
 }
 const replacements:Record<string,string>={...Object.fromEntries(Object.entries(data).map(([k,value])=>[k,value.join(', ')])),predictors_formula:(data.predictors||[]).join(' + '),predictors_interaction:(data.predictors||[]).join(' * '),lo:String(c?.min??0),hi:String(c?.max??1),reverse_rules:c?.categories?.map(k=>`${k.value}=${c.min+c.max-k.value}`).join('; ')||'',item_count:String(data.items?.length||0)};
 // Each placeholder comes only from validated column metadata, never free-form R input.
 lines.push(v.code.replace(/\{([a-z_]+)\}/g,(_,key)=>replacements[key]??`UNKNOWN_${key}`));
 return lines.join('\n\n');
}
export function bootstrapCode(){return `# Statistikatlas · 200 synthetische Befragte\n# Erklärungen geprüft am mariposa-Quellstand ${mariposaVersion}.\n# Das Paket muss in R installiert sein.\nif (!requireNamespace("mariposa", quietly = TRUE)) stop("Bitte mariposa zuerst installieren.")\nif (utils::packageVersion("mariposa") < "${mariposaVersion}") stop("Dieses Beispiel benötigt mariposa ${mariposaVersion} oder neuer.")\n\natlas <- utils::read.csv2(\n  "Statistikatlas-200-Befragte-synthetisch.csv",\n  fileEncoding = "UTF-8-BOM", stringsAsFactors = FALSE,\n  colClasses = c("character", rep("numeric", ${surveyColumns.length})),\n  check.names = FALSE, na.strings = c("", "NA")\n)\nstopifnot(nrow(atlas) == 200L, !anyDuplicated(atlas$id))\nstopifnot(identical(names(atlas), c("id", ${surveyColumns.map(c=>rQuote(c.id)).join(', ')})))\n# Originalcodes bleiben numerisch. Faktoren entstehen gezielt im Aufruf.\n# Likert-Codes bleiben numerisch. Die Abstandsannahme ist nur bei metrischen Analysen nötig.\n`;}
export function surveyCsv(rows:SurveyRow[]){return '\uFEFF'+['id;'+surveyColumns.map(c=>c.id).join(';'),...rows.map(r=>[r.id,...surveyColumns.map(c=>String(r.values[c.id]).replace('.',','))].join(';'))].join('\r\n');}
export function codebookJson(){return JSON.stringify({dataset:'Vollständig synthetischer Lehrdatensatz, 200 Personen',mariposa:mariposaVersion,likert:'Ordinal erhoben; standardmäßig metrische Näherung',columns:surveyColumns},null,2);}
export function downloadText(name:string,text:string,mime='text/plain;charset=utf-8'){const url=URL.createObjectURL(new Blob([text],{type:mime})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export const packageSearch=(id:string)=>{const e=entryById[id];return e?[e.title,e.intro,...e.variants.flatMap(v=>[v.fn,v.label])].join(' '):'';};
export const exampleVariants=()=>mariposaEntries.flatMap(e=>e.variants.map((v,i)=>({entry:e,variant:v,settings:initialRSettings(e,i)})));
