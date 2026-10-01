import { eligible } from './mariposaRoles';
export { eligible } from './mariposaRoles';
import { columnById, surveyColumns, type SurveyRow } from './survey';
import { entryById, mariposaEntries, mariposaVersion, type AtlasEntry, type ColumnRole } from './mariposaCatalog';
export type RSettings={variant:number;columns:Record<string,string[]>};
export function rolesFor(entry:AtlasEntry,variant=0){return entry.variants[variant]?.roles||entry.roles;}
/** Rollenbeschreibung: zuerst „Kurz gesagt“ in Alltagswörtern, darunter der Fachtext. */
export type RoleText={kurz:string;fach:string};
const roleTexts:Record<ColumnRole['kind'],RoleText>={
 quantitative:{kurz:'Eine Spalte mit Zahlen, mit denen du rechnen kannst.',fach:'Metrische Werte, 0/1-Indikatoren oder Likert-Items mit der sichtbaren Abstandsannahme.'},
 ordered:{kurz:'Antworten mit einer Reihenfolge, etwa von „sehr schwer“ bis „sehr leicht“.',fach:'Geordnete Merkmale; numerische Originalcodes bleiben erhalten.'},
 category:{kurz:'Antworten, die die Befragten in Gruppen einteilen.',fach:'Kategorien mit festen Antwortgruppen.'},
 twoGroups:{kurz:'Eine Spalte, die die Befragten in genau zwei Gruppen teilt.',fach:'Genau zwei Kategorien; eine Gruppenzugehörigkeit je Person.'},
 binary:{kurz:'Eine Ja/Nein-Frage: 1 heißt Ja, 0 heißt Nein.',fach:'0/1-Kodierung. Ereignis ist im Beispiel die Antwort 1.'},
 continuous:{kurz:'Eine Messung, die auch Zwischenwerte annehmen kann, etwa Stunden mit Nachkommastellen.',fach:'Kontinuierliche Messung; diskrete Ratings sind keine kontinuierliche Normalverteilung.'},
 items:{kurz:'Mehrere Fragen, die zusammen dasselbe messen sollen.',fach:'Mindestens drei der fünf gemeinsamen 7-stufigen Lehritems. Gleiche Richtung; keine validierte Skala.'},
 repeated:{kurz:'Derselbe Test, mehrmals bei denselben Personen.',fach:'Gleich skalierte Wissenstests derselben Personen.'},
 pairedBinary:{kurz:'Dieselbe Ja/Nein-Frage vor und nach dem Kurs.',fach:'Identische Ja/Nein-Frage vor und nach dem Kurs.'},
 multiple:{kurz:'Ankreuzfelder einer Frage, bei der mehrere Antworten erlaubt sind.',fach:'Mindestens zwei Optionen derselben Mehrfachauswahlfrage.'},
 predictor:{kurz:'Spalten, mit denen das Modell die Zielvariable erklärt.',fach:'Quantitative Werte oder Kategorien. Kategorien mit mehr als zwei Stufen wandelt der Aufruf mit rec(…, as_factor = TRUE) in Faktoren um.'},
 factors:{kurz:'Zwei oder drei Spalten, die die Befragten in Gruppen einteilen.',fach:'Zwei oder drei kategoriale Faktoren; Typ III mit Interaktionen.'},
 interaction:{kurz:'Zwei Spalten, deren Wirkung sich gegenseitig verändern darf.',fach:'Genau zwei Prädiktoren; Haupteffekte und ihr Produkt.'},
 likert:{kurz:'Eine Zustimmungsfrage mit festen Antwortstufen.',fach:'Theoretische Skalenendpunkte werden aus dem Codebuch übernommen.'},
};
export function roleExplanation(role:ColumnRole):RoleText{return roleTexts[role.kind];}
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
/** Name der SPSS-Datei, die der Atlas zum Herunterladen anbietet und die der Startblock einliest. */
export const SAV_NAME='Statistikatlas-200-Befragte.sav';
/** Startblock jedes Aufrufs und jedes R-Skripts (Spezifikation Lehrdatensatz und R, Abschnitt 7). */
export function startBlock(){return `library(dplyr)\nlibrary(mariposa)\n\natlas <- read_spss(${rQuote(SAV_NAME)})`;}
/**
 * Kategoriale Prädiktoren mit mehr als zwei Stufen gehen in linear_regression() und logistic_regression()
 * sonst mit ihren Zahlencodes ein (wie SPSS REGRESSION). 0/1-Indikatoren liefern als Zahl dieselben Koeffizienten.
 * Gruppen (t_test, oneway_anova, …) und Faktoren (factorial_anova, ancova) nutzen die Wertelabels direkt.
 */
function needsFactor(role:ColumnRole,id:string){const c=columnById[id];return ['predictor','interaction'].includes(role.kind)&&!!c?.categories&&c.kind!=='likert'&&c.categories.length>2;}
/** Spaltenänderungen vor dem Verfahren, in einem mutate() direkt hinter `atlas %>%`. */
function mutateStep(assignments:string[]){return assignments.length===1?`  mutate(${assignments[0]}) %>%\n`:`  mutate(\n${assignments.map(a=>`    ${a}`).join(',\n')}\n  ) %>%\n`;}
/** Aufruf im Pipe-Stil: Startblock, dann `atlas %>%` und die Katalogvorlage mit den gewählten Spalten. */
export function analysisCode(entry:AtlasEntry,s:RSettings,ranked=false){
 const v=entry.variants[s.variant];if(!v)return '';const data=s.columns,first=data.x?.[0]||'lernzeit',c=columnById[first],assignments:string[]=[];
 // Mittlere Ränge entstehen nur im Aufruf; atlas selbst behält die Originalwerte.
 if(ranked)for(const key of ['x','y'])for(const id of data[key]||[])assignments.push(`${id} = rank(${id}, ties.method = "average")`);
 const converted=new Set<string>();
 for(const role of rolesFor(entry,s.variant))for(const id of data[role.key]||[])if(needsFactor(role,id)&&!converted.has(id)){assignments.push(`${id} = rec(${id}, rules = "else=copy", as_factor = TRUE)`);converted.add(id);}
 const replacements:Record<string,string>={...Object.fromEntries(Object.entries(data).map(([k,value])=>[k,value.join(', ')])),predictors_formula:(data.predictors||[]).join(' + '),predictors_interaction:(data.predictors||[]).join(' * '),lo:String(c?.min??0),hi:String(c?.max??1),reverse_rules:c?.categories?.map(k=>`${k.value}=${c.min+c.max-k.value}`).join('; ')||'',item_count:String(data.items?.length||0)};
 // Each placeholder comes only from validated column metadata, never free-form R input.
 let call=v.code.replace(/\{([a-z_]+)\}/g,(_,key)=>replacements[key]??`UNKNOWN_${key}`);
 if(assignments.length){
  // Ränge und Faktoren entstehen im mutate() direkt hinter `atlas %>%`; fehlt die Pipe, wäre der Aufruf falsch.
  if(!call.includes('atlas %>%\n'))throw new Error(`analysisCode: Die Vorlage von ${entry.id} (${v.label}) braucht "atlas %>%", um Spalten umzuwandeln.`);
  call=call.replace('atlas %>%\n',`atlas %>%\n${mutateStep(assignments)}`);
 }
 return `${startBlock()}\n\n${call}`;
}
/** Kommentarzeilen mit höchstens 78 Zeichen. */
function comment(text:string){const lines:string[]=[];let line='#';for(const word of text.split(/\s+/).filter(Boolean)){if(line.length+1+word.length>78&&line!=='#'){lines.push(line);line='#';}line+=` ${word}`;}lines.push(line);return lines.join('\n');}
/** R-Skript zum Herunterladen: Startblock, gewählter Aufruf und kurze Kommentare in Klartext. */
export function scriptFor(entry:AtlasEntry,s:RSettings,ranked=false){
 const v=entry.variants[s.variant];if(!v)return '';const call=analysisCode(entry,s,ranked).slice(startBlock().length).trim();
 return scriptText(entry.title,`${v.label}: ${v.fn}() aus mariposa.`,call,[...(ranked?['Zuerst werden beide Spalten in mittlere Ränge umgewandelt. atlas selbst behält die Originalwerte.']:[]),...(v.note?[v.note]:[])]);
}
/** R-Skript für einen beliebigen Aufruf im Pipe-Stil (ohne Startblock), etwa einen Leitaufruf im Reiter „In R“. */
export function scriptText(title:string,label:string,call:string,notes:string[]=[]){
 return [
  comment(`Statistikatlas: ${title}`),
  comment(`Lege dieses Skript und die Datei ${SAV_NAME} in denselben Ordner. Öffne das Skript in RStudio und wähle Session > Set Working Directory > To Source File Location. Dann führst du die Zeilen nacheinander mit Strg + Enter aus (Mac: Cmd + Enter).`),
  comment('Einmalig vorher installieren: install.packages(c("dplyr", "mariposa"))'),
  '',
  comment('Pakete laden und den Lehrdatensatz mit seinen Labels einlesen:'),
  startBlock(),
  '',
  comment(label),
  ...notes.map(comment),
  call,
  '',
 ].join('\n');
}
export function surveyCsv(rows:SurveyRow[]){return '\uFEFF'+['id;'+surveyColumns.map(c=>c.id).join(';'),...rows.map(r=>[r.id,...surveyColumns.map(c=>String(r.values[c.id]).replace('.',','))].join(';'))].join('\r\n');}
export function codebookJson(){return JSON.stringify({dataset:'Vollständig synthetischer Lehrdatensatz, 200 Personen',mariposa:mariposaVersion,likert:'Ordinal erhoben; standardmäßig metrische Näherung',columns:surveyColumns},null,2);}
export function downloadText(name:string,data:string|Uint8Array<ArrayBuffer>,mime='text/plain;charset=utf-8'){const url=URL.createObjectURL(new Blob([data],{type:mime})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export const packageSearch=(id:string)=>{const e=entryById[id];return e?[e.title,e.intro,...e.variants.flatMap(v=>[v.fn,v.label])].join(' '):'';};
export const exampleVariants=()=>mariposaEntries.flatMap(e=>e.variants.map((v,i)=>({entry:e,variant:v,settings:initialRSettings(e,i)})));
