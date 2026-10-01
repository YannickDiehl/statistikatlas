import { referenceInMap } from '../domain/network';
import { useEffect, useState } from 'react';
import { Copy, Download, ArrowUpRight } from 'lucide-react';
import { columnById, surveyColumns, columnChoiceLabel, type ColumnSelection, type SurveyRow } from '../domain/survey';
import { writeSav } from '../domain/savWriter';
import { analysisCode, codebookJson, downloadText, eligible, initialRSettings, roleExplanation, rolesFor, SAV_NAME, scriptFor, startBlock, surveyCsv, validateRSettings, type RSettings } from '../domain/mariposa';
import { formulaParts, mariposaVersion, type AtlasEntry } from '../domain/mariposaCatalog';
import { ref, titleFor, type Ref, type Route } from '../domain/learning';
export function LinkedFormula({formula,onSelect,onHover,reference,route='covariance',contextAnchor}:{contextAnchor?:Ref;route?:Route;reference?:Ref;formula:string;onSelect:(r:Ref)=>void;onHover:(id:string|null)=>void}){
 const [hint,setHint]=useState('');
 return <div className="symbolic-formula package-formula"><div className="math-expression" aria-label="Interaktive Formel">{formulaParts(formula).map((part,i)=>part.target?<button key={i} className="formula-term" onClick={()=>{onHover(null);onSelect(referenceInMap(part.target!,reference||null,route,contextAnchor));}} onPointerEnter={()=>{setHint(part.hint||'');onHover(part.target!);}} onPointerLeave={()=>{setHint('');onHover(null);}} onFocus={()=>{setHint(part.hint||'');onHover(part.target!);}} onBlur={()=>{setHint('');onHover(null);}} aria-label={`${part.hint}; ${titleFor(ref(part.target))} öffnen`}>{part.text}</button>:<span key={i}>{part.text}</span>)}</div><p className="formula-hint">{hint||'Formelzeichen öffnen den zugehörigen Baustein in der Karte.'}</p></div>;
}
export type RPanelProps={contextAnchor?:Ref;route?:Route;entry:AtlasEntry;reference?:Ref;settings?:RSettings;onSettings?:(s:RSettings)=>void;selection?:ColumnSelection;rows?:SurveyRow[];onData?:()=>void;onSelect:(r:Ref)=>void;onHover:(id:string|null)=>void;
 /** Im Reiter „In R“ unter „Anderer Aufruf“: ohne Kopfzeile, Datensatz-Download und Hilfe (stehen im Reiter selbst). */
 embedded?:boolean};
/** Einstellungen, mit denen der Aufruf gebaut wird: Bei Begriffen der Karte kommen x und y aus der Spaltenwahl. */
export function panelSettings(entry:AtlasEntry,base:RSettings,selection?:ColumnSelection,reference?:Ref):RSettings{
 const s={...base,columns:{...base.columns}},roles=rolesFor(entry,s.variant);
 if(entry.existing&&selection)for(const axis of ['x','y'] as const)if(roles.some(r=>r.key===axis))s.columns[axis]=[selection[roles.some(r=>r.key==='y')?axis:reference?.variable||'x']];
 return s;
}
export function MariposaPanel(p:RPanelProps){
 const [local,setLocal]=useState(()=>initialRSettings(p.entry)),[feedback,setFeedback]=useState('');
 const base=p.settings||local,entry=p.entry,s=panelSettings(entry,base,p.selection,p.reference),variant=entry.variants[s.variant];
 const roles=rolesFor(entry,s.variant);
 const problems=validateRSettings(entry,s,p.selection?.likertMetric??true,p.rows,p.reference?.basis==='ranks'),code=variant&&problems.length===0?analysisCode(entry,s,p.reference?.basis==='ranks'):'',picked=Object.values(s.columns).flat();
 useEffect(()=>setFeedback(''),[code]);
 if(!entry.variants.length)return null;
 function change(next:RSettings){p.onSettings?p.onSettings(next):setLocal(next);}
 async function copy(){try{await navigator.clipboard.writeText(code);setFeedback('R-Aufruf kopiert.');}catch{setFeedback('Kopieren ist hier nicht verfügbar. Du kannst das R-Skript herunterladen.');}}
 return <section className={`mariposa-panel${p.embedded?' embedded':''}`} aria-label="Passender mariposa-Aufruf">{!p.embedded&&<div className="package-heading"><span className="eyebrow">In R · mariposa {mariposaVersion}</span><code>{variant.fn}()</code></div>}
  {entry.variants.length>1&&<label className="variant-label">{entry.existing?'R-Aufruf wählen':'Rechenweg / R-Aufruf'}<select value={s.variant} onChange={e=>change(initialRSettings(entry,Number(e.target.value)))}>{entry.variants.map((v,i)=><option key={i} value={i}>{v.label}</option>)}</select></label>}
  {entry.existing&&variant.formula&&<><p className="small-copy">Dieser R-Rechenweg verwendet einen eigenen Maßstab:</p><LinkedFormula contextAnchor={p.contextAnchor} route={p.route} formula={variant.formula} reference={p.reference} onSelect={p.onSelect} onHover={p.onHover}/></>}
  {variant.note&&<p className="context-note">{variant.note}</p>}
  {roles.length>0&&<div className="r-roles"><h2>Spalten für den R-Aufruf</h2>{roles.map(role=>{const columns=surveyColumns.filter(c=>eligible(role,c,p.selection?.likertMetric??true)),values=s.columns[role.key]||[],fixed=entry.existing&&p.selection&&['x','y'].includes(role.key);
   return <fieldset key={role.key}><legend>{role.label}</legend>{fixed?<p className="selected-r-column">{columnById[values[0]]?.title} <code>{values[0]}</code></p>:role.many?<div className="r-multiselect">{columns.map(c=><label key={c.id}><input type="checkbox" checked={values.includes(c.id)} disabled={!values.includes(c.id)&&picked.includes(c.id)} onChange={e=>change({...s,columns:{...s.columns,[role.key]:e.target.checked?[...values,c.id]:values.filter(v=>v!==c.id)}})}/><span>{c.title}</span></label>)}</div>:<select aria-label={role.label} value={values[0]||''} onChange={e=>change({...s,columns:{...s.columns,[role.key]:[e.target.value]}})}>{columns.map(c=><option key={c.id} value={c.id} disabled={picked.includes(c.id)&&!values.includes(c.id)}>{c.title}</option>)}</select>}
    {p.reference?.basis==='ranks'?<small>Die R-Rechnung verwendet die mittleren Ränge dieser Originalspalte.</small>:<><small><strong>Kurz gesagt:</strong> {roleExplanation(role).kurz}</small><small>{roleExplanation(role).fach}</small></>}{!fixed&&<details className="r-excluded"><summary>Warum fehlen andere Spalten?</summary><p>{roleExplanation(role).fach}</p>{surveyColumns.filter(c=>!eligible(role,c,p.selection?.likertMetric??true)).map(c=><p key={c.id}>{columnChoiceLabel(c)}</p>)}</details>}
   </fieldset>;
  })}</div>}
  {p.selection?.likertMetric&&p.reference?.basis!=='ranks'&&roles.some(r=>['quantitative','items','predictor','interaction'].includes(r.kind)&&(s.columns[r.key]||[]).some(id=>columnById[id]?.kind==='likert'))&&<p className="context-note">Likert-Items: Die Rechnung nimmt gleich große Abstände zwischen den Antwortstufen an. Die Antwortskala bleibt ursprünglich ordinal.</p>}
  {p.reference?.basis==='ranks'&&<p className="context-note">Der R-Aufruf bildet zuerst dieselben mittleren Ränge wie die geöffnete Formel. Die Originalspalten in atlas bleiben erhalten.</p>}
  {problems.length>0?<div className="r-problems" role="status"><strong>Spaltenauswahl anpassen</strong><ul>{problems.map(x=><li key={x}>{x}</li>)}</ul>{entry.existing&&<p>Nutze die Spaltenauswahl oberhalb der Formel. Die R-Funktion benötigt numerisch interpretierbare Eingänge.</p>}</div>:<><pre className="r-code"><code>{code}</code></pre><div className="r-actions"><button onClick={copy}><Copy size={14}/>Aufruf kopieren</button><button onClick={()=>downloadText(`Statistikatlas-${variant.fn}.R`,scriptFor(entry,s,p.reference?.basis==='ranks'))}><Download size={14}/>R-Skript</button></div></>}
  {feedback&&<p role="status" className="small-copy">{feedback}</p>}
  {!p.embedded&&<details className="r-start"><summary>Die 200 Befragten in R verwenden</summary><p>Lade den Lehrdatensatz als SPSS-Datei und das R-Skript in denselben Ordner. Die Datei enthält die aktuellen Werte, auch deine Änderungen. read_spss() liest sie zusammen mit Fragetexten und Antwortlabels ein.</p><div className="r-actions">{p.rows&&<><button className="primary" onClick={()=>downloadText(SAV_NAME,writeSav(p.rows!),'application/x-spss-sav')}><Download size={14}/>Lehrdatensatz als SPSS-Datei (.sav)</button><button onClick={()=>downloadText('Statistikatlas-200-Befragte-synthetisch.csv',surveyCsv(p.rows!),'text/csv;charset=utf-8')}>auch als CSV</button></>}<button onClick={()=>downloadText('Statistikatlas-Codebuch.json',codebookJson(),'application/json')}>Codebuch</button>{p.onData&&<button onClick={p.onData}>Datensatz ansehen<ArrowUpRight size={14}/></button>}</div><p>Jeder Aufruf beginnt mit diesen Zeilen:</p><pre className="r-code"><code>{startBlock()}</code></pre><p>Der Atlasdatensatz mit 200 Personen ist ein eigener Lehrdatensatz. Die mariposa-Paketdaten survey_data, longitudinal_data und longitudinal_data_wide sind andere Beispiele.</p></details>}
  {!p.embedded&&<details className="r-help"><summary>Weitere Funktionen und Hilfe</summary><p>{[...new Set(entry.variants.map(v=>v.fn))].map(fn=><code key={fn}>?mariposa::{fn}<br/></code>)}</p><p>Bei Analyseobjekten zeigt <code>print(ergebnis)</code> die kompakte Ausgabe und <code>summary(ergebnis)</code> die ausführliche Darstellung. Diese S3-Methoden gehören zum jeweiligen Ergebnisobjekt.</p>{['linear_regression','logistic_regression'].includes(entry.id)&&<p><code>anova(kleines_modell, grosses_modell)</code> vergleicht verschachtelte Modelle mit denselben Fällen. Optional bietet broom <code>tidy()</code>, <code>glance()</code> und <code>augment()</code> für diese Ergebnisobjekte.</p>}</details>}
 </section>;
}
