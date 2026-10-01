import { eligible } from './mariposaRoles';
import { entryById } from './mariposaCatalog';
import type { DataPair } from './statistics';
export type Scale='nominal'|'ordinal'|'metric';
export type SurveyColumn={id:string;title:string;short:string;question:string;scale:Scale;kind:'continuous'|'discrete'|'binary'|'likert'|'category';unit:string;min:number;max:number;step:number;categories?:{value:number;label:string}[];note:string};
export type SurveyRow={id:string;values:Record<string,number>};
export type ColumnSelection={x:string;y:string;likertMetric:boolean};
const categories=(labels:string[],start=0)=>labels.map((label,i)=>({value:i+start,label}));
const yesNo=categories(['Nein','Ja']);
const metric=(id:string,title:string,question:string,unit:string,min:number,max:number,step:number,note='',kind:'continuous'|'discrete'='continuous'):SurveyColumn=>({id,title,short:title,question,unit,min,max,step,note,scale:'metric',kind});
const category=(id:string,title:string,question:string,scale:Scale,labels:string[],note='',kind:SurveyColumn['kind']='category',start=0):SurveyColumn=>({id,title,short:title,question,scale,kind,unit:'',min:start,max:start+labels.length-1,step:1,categories:categories(labels,start),note});
const likert=(id:string,title:string,question:string,labels:string[]):SurveyColumn=>category(id,title,question,'ordinal',labels,'Einzelnes Zustimmungsitem. Für metrische Rechnungen nehmen wir gleich große Abstände zwischen den Antwortstufen an.','likert',1);
export const surveyColumns:SurveyColumn[]=[
 category('geschlecht','Geschlecht','Welcher Geschlechtseintrag trifft auf Sie zu?','nominal',['Männlich','Weiblich','Divers','Kein Eintrag'],'Selbstauskunft zum Geschlechtseintrag. „Kein Eintrag“ ist eine eigene Kategorie; keine fehlende Antwort.'),
 metric('einkommen','Haushaltsnettoeinkommen','Wie hoch ist das durchschnittliche monatliche Nettoeinkommen Ihres gesamten Haushalts?','€/Monat',0,30000,1,'Einkommen aller Haushaltsmitglieder zusammen; kein persönliches Gehalt.'),
 category('schulabschluss','Schulabschluss','Welchen höchsten allgemeinbildenden Schulabschluss haben Sie?','ordinal',['Ohne Schulabschluss','Haupt-/Volksschulabschluss','Mittlerer Abschluss','Fachhochschulreife','Abitur / fachgebundene Hochschulreife'],'Vereinfachte Rangfolge der Abschlüsse. Die Codes 0–4 beschreiben keine gleichen Bildungsabstände. Gleichwertige Abschlüsse sind eingeschlossen.'),
 category('berufsabschluss','Berufs-/Hochschulabschluss','Welchen Berufs- oder Hochschulabschluss haben Sie zuletzt erworben?','nominal',['Kein Abschluss','Duale Berufsausbildung','Schulische Berufsausbildung','Meister / Techniker / Fachwirt','Bachelor','Master','Diplom / Magister / Staatsexamen','Promotion','Anderer Abschluss'],'Vereinfachte Abschlussgruppen. „Zuletzt erworben“ ermöglicht eine eindeutige Angabe. Codes sind keine Rangfolge; Meister und Bachelor sind unterschiedliche Qualifikationstypen.'),
 metric('alter','Alter','Wie alt sind Sie?','Jahre',18,90,1,'Vollendete Lebensjahre.','discrete'),
 metric('haushaltsgroesse','Haushaltsgröße','Wie viele Personen leben einschließlich Ihnen in Ihrem Haushalt?','Personen',1,8,1,'Gemeinsamer Haushalt entsprechend der Einkommensfrage.','discrete'),
 category('erwerbstaetig','Erwerbstätig','Sind Sie gegenwärtig erwerbstätig?','nominal',yesNo.map(c=>c.label),'0 = Nein, 1 = Ja. Der Mittelwert dieser Indikatorvariable ist der Anteil der Ja-Antworten.','binary'),
 metric('arbeitsstunden','Erwerbsarbeitszeit','Wie viele Stunden arbeiten Sie üblicherweise pro Woche in allen Erwerbstätigkeiten zusammen?','h/Woche',0,80,.1,'Im Ausgangsdatensatz: 0 bei Personen ohne Erwerbstätigkeit.'),
 metric('lernzeit','Lernzeit','Wie viele Stunden haben Sie in den letzten sieben Tagen selbstständig gelernt?','h',0,60,.1,'Zeitdauer mit einem inhaltlichen Nullpunkt.'),
 metric('schlafdauer','Schlafdauer','Wie lange haben Sie in den letzten sieben Tagen durchschnittlich pro Nacht geschlafen?','h/Nacht',2,14,.1,'Durchschnittliche Schlafdauer, auch Dezimalwerte möglich.'),
 metric('wissenstest','Wissenstest','Wie viele Aufgaben haben Sie in diesem fiktiven Test richtig gelöst?','Aufgaben',0,20,1,'Anzahl richtiger Antworten; ein didaktisch konstruiertes Testergebnis.','discrete'),
 category('weiterbildung','Weiterbildung','Haben Sie in den letzten zwölf Monaten an einer Weiterbildung teilgenommen?','nominal',yesNo.map(c=>c.label),'0 = Nein, 1 = Ja. Die Kodierung ist für Anteilsrechnungen festgelegt.','binary'),
 category('finanzlage','Finanzielle Lage','Wie gut kommt Ihr Haushalt mit seinem Einkommen aus?','ordinal',['Sehr schwer','Eher schwer','Teils / teils','Eher leicht','Sehr leicht'],'Geordnete Kategorien. Ein Schritt zwischen zwei Antworten hat keinen festgelegten Geldwert.', 'category',1),
 likert('lernplanung5','Lernplanung · 5 Stufen','„Ich plane feste Zeiten zum Lernen ein.“',['Stimme überhaupt nicht zu','Stimme eher nicht zu','Weder noch','Stimme eher zu','Stimme voll und ganz zu']),
 likert('lernzuversicht7','Lernzuversicht · 7 Stufen','„Ich traue mir zu, schwierige Lerninhalte zu verstehen.“',['Stimme überhaupt nicht zu','Stimme nicht zu','Stimme eher nicht zu','Weder noch','Stimme eher zu','Stimme zu','Stimme voll und ganz zu']),
 likert('statistikinteresse10','Statistikinteresse · 10 Stufen','„Ich beschäftige mich gerne mit statistischen Fragen.“',Array.from({length:10},(_,i)=>i===0?'Stimme überhaupt nicht zu':i===9?'Stimme voll und ganz zu':`Stufe ${i+1}`)),
 ...Array.from({length:5},(_,i)=>likert(`methoden${i+1}`,`Methoden-Zuversicht · Item ${i+1}`,['„Ich kann eine statistische Fragestellung formulieren.“','„Ich kann passende Variablen auswählen.“','„Ich kann ein statistisches Ergebnis erklären.“','„Ich kann Voraussetzungen eines Verfahrens prüfen.“','„Ich kann einen Analyseweg begründen.“'][i],['Stimme überhaupt nicht zu','Stimme nicht zu','Stimme eher nicht zu','Weder noch','Stimme eher zu','Stimme zu','Stimme voll und ganz zu'])),
 ...[2,3].map(t=>metric(`wissenstest_t${t}`,`Wissenstest · Zeitpunkt ${t}`,`Wie viele Aufgaben lösen Sie beim ${t}. Messzeitpunkt richtig?`,'Aufgaben',0,20,1,'Fiktive Parallelformen desselben Tests mit 20 Aufgaben. Dieselben Personen; Vergleichbarkeit wird im Lehrbeispiel angenommen. Keine nachgewiesene Intervention.','discrete')),
 ...['vor','nach'].map(t=>category(`kurs_${t}`,`Kurszuversicht · ${t==='vor'?'vorher':'nachher'}`, '„Trauen Sie sich zu, eine kleine Datenauswertung selbstständig durchzuführen?“','nominal',['Nein','Ja'],'Dieselbe dichotome Frage vor und nach dem fiktiven Kurs, bei denselben Personen.','binary')),
 ...['buch','video','kurs'].map((t,i)=>category(`quelle_${t}`,`Lernquelle · ${['Buch','Video','Kurs'][i]}`,'Welche Lernquellen haben Sie in den letzten sieben Tagen genutzt? Mehrere Antworten möglich.','nominal',['Nicht gewählt','Gewählt'],'Teil derselben Mehrfachauswahlfrage. 0 = nicht gewählt, 1 = gewählt.','binary')),
];
export const columnById:Record<string,SurveyColumn>=Object.fromEntries(surveyColumns.map(c=>[c.id,c]));
export const defaultSelection:ColumnSelection={x:'lernzeit',y:'wissenstest',likertMetric:true};
export const scaleName=(c:SurveyColumn)=>c.kind==='likert'?`Likert, ${c.categories!.length} Stufen (ordinal)`:c.kind==='binary'?'Binär (0/1)':c.scale==='metric'?`Metrisch · ${c.kind==='continuous'?'stetig':'diskret'}`:c.scale==='ordinal'?'Ordinal · geordnete Kategorien':'Nominal · Kategorien ohne Rangfolge';
/** Spalte mit kurzem Skalenhinweis für Auswahllisten; Likert-Titel nennen ihre Stufen schon selbst. */
export const columnChoiceLabel=(c:SurveyColumn)=>c.kind==='likert'?c.title:`${c.title} (${c.kind==='binary'?'0/1':c.scale==='metric'?'metrisch':c.scale})`;
export const formatValue=(c:SurveyColumn|undefined,n:number|null|undefined)=>n==null?'Nicht definiert':c?.categories?.find(k=>k.value===n)?.label||new Intl.NumberFormat('de-DE',{maximumFractionDigits:3}).format(n);
export const quantitative=(c:SurveyColumn,likertMetric=true)=>c.scale==='metric'||c.kind==='binary'||c.kind==='likert'&&likertMetric;
export function compatible(id:string,c:SurveyColumn,likertMetric=true){
 if(entryById[id]&&!entryById[id].existing){const role=entryById[id].roles.find(r=>r.key==='x')||entryById[id].roles[0];return role?eligible(role,c,likertMetric):true;}
 if(['series','pairs','validn','count','df','frequency','metric','nominal','ordinal'].includes(id))return true;
 if(id==='crosstab')return !!c.categories;
 if(['median','ranks','spearman'].includes(id))return c.scale!=='nominal'||c.kind==='binary';
 return quantitative(c,likertMetric);
}
export function compatibilityReason(id:string,c:SurveyColumn,likertMetric=true){
 if(compatible(id,c,likertMetric))return c.kind==='likert'&&!['frequency','crosstab','ranks','spearman','median'].includes(id)?'Hier mit gleich großen Abständen ausgewertet.':c.kind==='binary'?'0/1-Kodierung; der Mittelwert entspricht dem Ja-Anteil.':'Passendes Skalenniveau.';
 return id==='crosstab'?'Stetige / viele metrische Werte: zunächst in Klassen einteilen.':c.kind==='likert'?'Metrische Näherung für Likert-Items ist ausgeschaltet.':c.scale==='nominal'?'Kategorien besitzen keine quantitative Rangfolge.':'Geordnete Kategorien haben keine festgelegten Abstände.';
}
export function reconcileColumns(id:string,current:ColumnSelection):ColumnSelection{
 const allowed=surveyColumns.filter(c=>compatible(id,c,current.likertMetric));
 const fallback=id==='crosstab'?['geschlecht','schulabschluss']:['median','ranks','spearman','ordinal'].includes(id)?['schulabschluss','finanzlage']:['lernzeit','wissenstest'];
 const choose=(axis:'x'|'y',other?:string)=>allowed.some(c=>c.id===current[axis]&&c.id!==other)?current[axis]:allowed.find(c=>c.id===fallback[axis==='x'?0:1]&&c.id!==other)?.id||allowed.find(c=>c.id!==other)?.id||allowed[0]?.id||current[axis];
 const x=choose('x'),y=choose('y',x);return {...current,x,y};
}
export function validColumnValue(c:SurveyColumn,n:number){return Number.isFinite(n)&&n>=c.min&&n<=c.max&&(c.categories?c.categories.some(k=>k.value===n):Math.abs(n/c.step-Math.round(n/c.step))<1e-6);}
export function fitColumnValue(c:SurveyColumn,n:number){return Math.max(c.min,Math.min(c.max,Math.round(n/c.step)*c.step));}
function createBaseSurvey(seed=20260910):SurveyRow[]{
 let state=seed>>>0;const random=()=>{state=(Math.imul(1664525,state)+1013904223)>>>0;return state/4294967296;};
 const normal=()=>Math.sqrt(-2*Math.log(Math.max(random(),1e-12)))*Math.cos(2*Math.PI*random());
 const draw=(id:string,n:number)=>Number(fitColumnValue(columnById[id],n).toFixed(2));
 return Array.from({length:200},(_,i)=>{
  const age=18+Math.floor(random()*58),school=Math.floor(random()*5),job=age<66&&random()>.2?1:0,learning=draw('lernzeit',Math.max(0,6+3*normal()+school*.8)),income=draw('einkommen',Math.exp(7.85+.5*normal())+school*140),confidence=draw('lernzuversicht7',4+1.6*normal());
  return {id:`P${String(i+1).padStart(3,'0')}`,values:{geschlecht:i<4?i:(random()<.5?0:1),einkommen:income,schulabschluss:school,berufsabschluss:i<9?i:Math.floor(random()*9),alter:age,haushaltsgroesse:1+Math.floor(random()*5),erwerbstaetig:job,arbeitsstunden:job?draw('arbeitsstunden',34+10*normal()):0,lernzeit:learning,schlafdauer:draw('schlafdauer',7+.8*normal()),wissenstest:draw('wissenstest',6+learning*.55+2.5*normal()),weiterbildung:random()<.42?1:0,finanzlage:draw('finanzlage',3+normal()+(income-3000)/2500),lernplanung5:draw('lernplanung5',2.5+learning*.1+normal()),lernzuversicht7:confidence,statistikinteresse10:draw('statistikinteresse10',5.5+(confidence-4)*.5+2*normal())}};
 });
}
export function createSurvey(seed=20260910):SurveyRow[]{return extendSurvey(createBaseSurvey(seed),seed);}
export function extendSurvey(rows:SurveyRow[],seed=20260910):SurveyRow[]{
 let state=(seed^0x9e3779b9)>>>0;const random=()=>{state=(Math.imul(1664525,state)+1013904223)>>>0;return state/4294967296;};
 const normal=()=>Math.sqrt(-2*Math.log(Math.max(random(),1e-12)))*Math.cos(2*Math.PI*random());
 return rows.map(row=>{const latent=normal(),extra:Record<string,number>={};for(let i=1;i<=5;i++)extra[`methoden${i}`]=fitColumnValue(columnById[`methoden${i}`],4+1.1*latent+.85*normal());
  extra.wissenstest_t2=fitColumnValue(columnById.wissenstest_t2,row.values.wissenstest+1+1.8*normal());extra.wissenstest_t3=fitColumnValue(columnById.wissenstest_t3,row.values.wissenstest+1.5+2*normal());
  extra.kurs_vor=random()<.45?1:0;extra.kurs_nach=random()<(extra.kurs_vor?.83:.38)?1:0;
  for(const name of ['buch','video','kurs'])extra[`quelle_${name}`]=random()<.55?1:0;
  return {...row,values:{...extra,...row.values}};
 });
}
// Upgrade the previous 16-column dataset without replacing edited cells or IDs.
export function migrateSurvey(value:unknown):SurveyRow[]|null{
 if(!Array.isArray(value)||value.length!==200)return null;
 const oldColumns=surveyColumns.slice(0,16);
 if(!value.every(r=>r&&typeof r.id==='string'&&r.values&&oldColumns.every(c=>validColumnValue(c,r.values[c.id]))))return null;
 const extended=extendSurvey(value);return validSurvey(extended)?extended:null;
}
export function projectPairs(rows:SurveyRow[],selection:ColumnSelection):DataPair[]{return rows.map(r=>({id:r.id,x:r.values[selection.x],y:r.values[selection.y]}));}
export function validSurvey(value:unknown):value is SurveyRow[]{return Array.isArray(value)&&value.length===200&&new Set(value.map(r=>r?.id)).size===200&&value.every(r=>r&&typeof r.id==='string'&&/^P\d{3}$/.test(r.id)&&r.values&&surveyColumns.every(c=>typeof r.values[c.id]==='number'&&validColumnValue(c,r.values[c.id])));}
export function updateProjectedPairs(rows:SurveyRow[],selection:ColumnSelection,pairs:DataPair[]){const updates=new Map(pairs.map(p=>[p.id,p]));return rows.map(row=>{const p=updates.get(row.id);if(!p)return row;const values={...row.values};for(const axis of ['x','y'] as const){const c=columnById[selection[axis]];if(p[axis]!==row.values[c.id]&&validColumnValue(c,p[axis]))values[c.id]=p[axis];}return {...row,values};});}
export const surveySources=[
 {title:'GESIS · Allgemeinbildender Schulabschluss',url:'https://pretest.gesis.org/frage/showFrage?frage=1149&lang=de&selectedProj=123'},
 {title:'GESIS · Berufs- und Hochschulabschlüsse',url:'https://pretest.gesis.org/frage/showFrage?frage=1150&lang=de&selectedProj=123'},
 {title:'DQR · Verschiedene Qualifikationen auf gleichem Niveau',url:'https://www.dqr.de/dqr/de/der-dqr/faq/deutscher-qualifikationsrahmen-faq.html'},
 {title:'GESIS · Gestaltung von Ratingskalen',url:'https://www.gesis.org/fileadmin/admin/Dateikatalog/pdf/guidelines/gestaltung_ratingskalen_frageboegen_menold_bogner_2015.pdf'},
];
