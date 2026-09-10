import { useState } from 'react';
import { normalPDF,normalTest } from '../../domain/foundations/probability';
import { LabFrame,Plot,Slider,fmt } from './Charts';
export function InferenceLab(){
 const [observed,setObserved]=useState(.3),[n,setN]=useState(40),[sigma,setSigma]=useState(1),[alpha,setAlpha]=useState(.05),[side,setSide]=useState<'two'|'greater'|'less'>('two'),[effect,setEffect]=useState(.3);
 const validAlternative=side==='two'?effect!==0:side==='greater'?effect>0:effect<0;
 const r=normalTest(observed,n,sigma,alpha,side,effect),points=Array.from({length:241},(_,i)=>({x:-6+i*.05,y:normalPDF(-6+i*.05)}));
 return <LabFrame title="Vom beobachteten Unterschied zum p-Wert" description="Lehrmodell: unabhängige normalverteilte Beobachtungen mit bekannter Populationsstreuung σ. H₀: μ = 0. Hier gilt ein z-Test; bei geschätzter Streuung benötigt der klassische t-Test eine t-Referenz.">
 <Slider label="Beobachteter Mittelwert x̄" min={-1} max={1} step={.02} value={observed} onChange={setObserved}/><Slider label="Stichprobenumfang n" min={5} max={300} step={5} value={n} onChange={setN}/><Slider label="Bekannte Streuung σ" min={.5} max={3} step={.1} value={sigma} onChange={setSigma}/>
 <label className="foundation-select">Vorab gewählte Alternative<select value={side} onChange={e=>setSide(e.target.value as typeof side)}><option value="two">μ ≠ 0 · zweiseitig</option><option value="greater">μ &gt; 0 · rechtsseitig</option><option value="less">μ &lt; 0 · linksseitig</option></select></label>
 <Slider label="Signifikanzniveau α" min={.01} max={.1} step={.01} value={alpha} onChange={setAlpha}/>
 <Plot points={points} title="Nullverteilung: schattierte Fläche ergibt den p-Wert" xLabel="Prüfgröße z unter H₀" shade={x=>side==='two'?Math.abs(x)>=Math.abs(r.z):side==='greater'?x>=r.z:x<=r.z} markers={[{x:r.z,label:'beobachtet'}]}/>
 <div className="lab-result" aria-live="polite"><span>SE = σ / √n = {fmt(r.se)}</span><span>z = (x̄ − 0) / SE = {fmt(r.z)}</span><strong>p = {r.p<.0001?'< 0,0001':fmt(r.p,4)}</strong><span>{r.p<=alpha?'H₀ nach dieser Regel verwerfen':'H₀ nach dieser Regel nicht verwerfen'}</span></div>
 <p>Kritischer Bereich: {side==='two'?`|z| ≥ ${fmt(r.critical)}`:side==='greater'?`z ≥ ${fmt(r.critical)}`:`z ≤ ${fmt(-r.critical)}`}. Der beobachtete p-Wert und die vorab gewählte Schwelle α haben verschiedene Rollen.</p>
 <p>Zweiseitiges {fmt((1-alpha)*100,0)}-%-Intervall: <strong>[{fmt(r.low)}; {fmt(r.high)}]</strong>. {side!=='two'&&'Dieses zweiseitige Intervall ist nicht die zum einseitigen Test gehörende Grenze.'}</p>
 <details><summary>Fehlerwahrscheinlichkeiten und Power</summary><Slider label="Angenommener wahrer Mittelwert μ" min={-1} max={1} step={.02} value={effect} onChange={setEffect}/><div className="lab-result"><strong>{validAlternative?'Power':'Ablehnungswahrscheinlichkeit'} = {fmt(r.power*100,1)} %</strong>{validAlternative&&<span>β = {fmt((1-r.power)*100,1)} %</span>}{!validAlternative&&<span>{effect===0?'Hier gilt die Nullhypothese. Die Ablehnungswahrscheinlichkeit ist α.':'Dieser Wert liegt außerhalb der gewählten Alternative; hier bezeichnen wir das Ergebnis nicht als Power oder β.'}</span>}</div><p>Die Power bezieht sich auf den hier angenommenen wahren Effekt, nicht auf den beobachteten Mittelwert. Unter μ = 0 beträgt die Ablehnungswahrscheinlichkeit α = {fmt(alpha*100,0)} %.</p><table className="foundation-table"><thead><tr><th>Entscheidung</th><th>H₀ gilt</th><th>Gewählte Alternative gilt</th></tr></thead><tbody><tr><th>Verwerfen</th><td>Fehler I: α</td><td>Power: 1−β</td></tr><tr><th>Nicht verwerfen</th><td>1−α</td><td>Fehler II: β</td></tr></tbody></table></details>
 <p>Ein großes p bestätigt H₀ nicht. Ein kleines p misst weder Effektgröße noch praktische Bedeutung.</p>
 </LabFrame>;
}
