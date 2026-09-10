import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { foundationEntries } from './foundations/catalog';
import { density,cumulative,distributionQuantile,normalTest,initialParameters,samplingExperiment,type Family } from './foundations/probability';
import { linearFit,polynomialExample,rotatedLoadings } from './foundations/models';
import { concepts,connections } from './concepts';
import { inputs,ref } from './learning';
import { mapRelations,incomingPaths,relatedIds,referenceInMap } from './network';
import { gravityLayout,restingPlaces } from './mapLayout';
import { createSurvey,defaultSelection } from './survey';
import { FoundationLab } from '../components/foundations/FoundationLab';
const fixture=JSON.parse(readFileSync(new URL('./foundations/r-reference.json',import.meta.url),'utf8'));
const near=(actual:number,expected:number,label:string)=>assert.ok(Math.abs(actual-expected)<=1e-10+Math.abs(expected)*1e-8,`${label}: ${actual} ≠ ${expected}`);

test('all eight distribution families match independent R density, CDF and quantile references',()=>{
 for(const [id,data] of Object.entries(fixture.distributions) as [string,any][]){
  const p=data.parameters,family:Family=id==='bernoulli'?'bernoulli':id.startsWith('normal_')?'normal':id.startsWith('t_')?'t':id.startsWith('f_')?'f':id.startsWith('chisq_')?'chi_square':id.startsWith('binomial_')?'binomial':id.startsWith('hypergeometric_')?'hypergeometric':'standard_normal',a={...initialParameters,mu:p.mean??0,sigma:p.sd??1,df:p.df??p.df1??5,df2:p.df2??20,n:p.size??p.draws??10,p:p.prob??.3,population:p.population??30,successes:p.successes??12};
  for(const point of data.points){near(density(family,point.x,a),(point.density??point.mass),id+' density');near(cumulative(family,point.x,a),point.cdf,id+' CDF');if(point.upper_inclusive!==undefined)near(1-cumulative(family,point.x-1,a),point.upper_inclusive,id+' inclusive right tail');}
  for(const point of data.quantiles)near(distributionQuantile(family,point.p,a),point.x,id+' quantile');
 }
});
test('normal test power matches 74 R references and retains the observed-versus-assumed effect distinction',()=>{
 for(const item of fixture.normal_z_power.cases){const side=item.alternative==='two.sided'?'two':item.alternative;near(normalTest(.7,1,1,item.alpha,side,item.shift).power,item.power,JSON.stringify(item));}
 const a=normalTest(.1,100,1,.05,'two',.3),b=normalTest(.8,100,1,.05,'two',.3);assert.equal(a.power,b.power);assert.ok(a.p>b.p);near(normalTest(0,100,1,.05,'two',0).power,.05,'type I error');
});
test('discrete probabilities normalize, respect support, and retain inclusive cutoffs at parameter boundaries',()=>{
 for(const family of ['bernoulli','binomial','hypergeometric'] as Family[])for(const p of [0,.05,.5,.95,1])for(const n of [1,5,20]){const a={...initialParameters,p,n,successes:1},total=Array.from({length:31},(_,k)=>density(family,k,a)).reduce((s,x)=>s+x,0);near(total,1,`${family} total`);assert.equal(density(family,-1,a),0);assert.equal(cumulative(family,-1,a),0);near(cumulative(family,100,a),1,'upper support');}
 assert.equal(density('chi_square',0,{...initialParameters,df:1}),Infinity);assert.equal(density('f',0,{...initialParameters,df:1}),Infinity);
});
test('sampling is reproducible and the mean distribution narrows with sample size',()=>{
 const a=samplingExperiment(5,2000,'skewed',73),b=samplingExperiment(100,2000,'skewed',73),sd=(x:number[])=>Math.sqrt(x.reduce((s,v)=>s+v*v,0)/x.length);assert.deepEqual(a,samplingExperiment(5,2000,'skewed',73));assert.ok(sd(b.means)<sd(a.means)/3);assert.notDeepEqual(a,samplingExperiment(5,2000,'skewed',74));
});
test('model examples preserve OLS, rotation and out-of-sample meanings',()=>{
 const fit=linearFit([{x:0,y:1},{x:1,y:3},{x:2,y:5},{x:3,y:7}]);near(fit.a,1,'intercept');near(fit.b,2,'slope');near(fit.r2,1,'R²');
 for(const r of [0,.3,.95])for(const angle of [-90,-25,0,45,90]){const f=rotatedLoadings(r,angle,2);near(f.reproducedCorrelation,r,'rotated correlation');f.communalities.forEach(x=>near(x,1,'communality'));}
 const errors=Array.from({length:8},(_,i)=>polynomialExample(i+1,.6));for(let i=1;i<errors.length;i++)assert.ok(errors[i].trainError<=errors[i-1].trainError+1e-10);assert.ok(errors[7].testError>Math.min(...errors.map(e=>e.testError)));
});
test('all 55 foundations resolve through an acyclic dependency graph',()=>{
 assert.equal(foundationEntries.length,55);const done=new Set<string>(),known=new Set(concepts.map(c=>c.id));
 function walk(id:string,path:string[]=[]){assert.ok(known.has(id),id);assert.ok(!path.includes(id),[...path,id].join(' → '));if(done.has(id))return;for(const child of inputs(ref(id),'covariance'))walk(child.id,[...path,id]);done.add(id);}
 for(const entry of foundationEntries){walk(entry.id);assert.ok(entry.sources?.length,entry.id);}
 for(const e of connections)assert.ok(known.has(e.source)&&known.has(e.target),e.id);
});
test('meaning edges are direct explanations, never recursive computational inputs',()=>{
 const edges=mapRelations(ref('p_value'),'covariance'),path=incomingPaths('p_value',edges);assert.ok(path.nodes.has('t_test'));assert.ok(path.nodes.has('normality_test'));assert.ok(!path.nodes.has('sorting'));
 assert.ok(!inputs(ref('fisher_test'),'covariance').some(r=>r.id==='p_value'));
 assert.ok(!inputs(ref('p_value'),'covariance').some(r=>r.id==='t_test'));
 const t2=mapRelations(ref('t_test','x','v2'),'covariance').find(e=>e.source==='t_test'&&e.target==='effect');assert.equal(t2?.alternative,true);
 const t0=mapRelations(ref('t_test','x','v0'),'covariance').find(e=>e.source==='t_test'&&e.target==='effect');assert.equal(t0?.alternative,false);
 assert.ok(!connections.some(e=>e.source==='fisher_test'&&e.target==='confidence'));
 assert.ok(relatedIds(ref('confidence'),false).has('linear_regression'));
});
test('gravity and home positions remain finite and separate with all foundation areas',()=>{
 for(const layout of [restingPlaces,gravityLayout(ref('p_value'),'covariance'),gravityLayout(ref('normal_distribution'),'covariance',true)]){const entries=Object.entries(layout);assert.equal(entries.length,159);for(let i=0;i<entries.length;i++){const [id,p]=entries[i];assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y),id);for(let j=i+1;j<entries.length;j++){const [other,q]=entries[j];assert.ok(Math.abs(p.x-q.x)>=226||Math.abs(p.y-q.y)>=146,`${id}/${other}`);}}}
});
test('every foundation renders its experiment with accessible controls and finite geometry',()=>{
 const rows=createSurvey();for(const entry of foundationEntries){const html=renderToStaticMarkup(createElement(FoundationLab,{id:entry.id,rows,selection:defaultSelection}));assert.ok(html.includes('foundation-lab'),entry.id);assert.doesNotMatch(html,/NaN|Infinity|height="-/);assert.match(html,/input|select|button/,entry.id);}
});

test('an excursion into interpretation preserves the active variant in hover paths',()=>{
 const remembered=ref('t_test','x','v2'),hover=referenceInMap('t_test',ref('p_value'),'covariance',remembered);assert.deepEqual(hover,remembered);
 const edges=mapRelations(hover,'covariance',remembered);assert.equal(edges.find(e=>e.source==='t_test'&&e.target==='effect')?.alternative,true);
 const path=incomingPaths('p_value',mapRelations(ref('p_value'),'covariance'));assert.ok(!path.edges.has('oneway_anova--tukey_test'));assert.ok(!path.edges.has('pearson--spearman'));
});
