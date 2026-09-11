import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ReactFlowProvider } from '@xyflow/react';
import { concepts,connections } from './concepts';
import { arrangeOverviewLabels,focusPath,detailLevel,overviewEdges,explorationGuides,type FocusMode } from './prototypeMap';
import { mapRelations } from './network';
import { topicAreas,restingPlaces } from './mapLayout';
import { ref,lessonContext,titleFor } from './learning';
import { createSurvey,defaultSelection,projectPairs } from './survey';
import { initialExploration,visit,step } from './exploration';
import { CompactInspector } from '../components/explore/CompactInspector';
import { ExplorerNode } from '../components/explore/ExplorationMap';
import App from '../App';
const survey=createSurvey(),context=lessonContext(projectPairs(survey,defaultSelection),'P002','covariance');
const noop=()=>{};

test('focus distinguishes dependencies from applications without changing the map geography',()=>{
 const initial=JSON.stringify(restingPlaces),edges=mapRelations(ref('p_value'),'covariance');
 const before=focusPath('p_value',edges,'before'),after=focusPath('p_value',edges,'after'),hover=focusPath('p_value',edges,'near',true);
 assert.ok(before.nodes.has('test_statistic'));assert.ok(!before.nodes.has('t_test'));assert.ok(after.nodes.has('t_test'));assert.ok(after.nodes.has('fisher_test'));assert.ok(hover.nodes.has('normality_test'));assert.ok(!hover.edges.has('oneway_anova--tukey_test'));
 const paired=focusPath('t_test',mapRelations(ref('t_test','x','v2'),'covariance'),'after');assert.ok(!paired.nodes.has('effect'));
 for(const mode of ['near','before','after'] as FocusMode[])focusPath('linear_regression',mapRelations(ref('linear_regression'),'covariance'),mode);
 assert.equal(JSON.stringify(restingPlaces),initial);assert.equal(Object.keys(restingPlaces).length,159);
});
test('overview reduces edge drawing using real active connections',()=>{
 const all=mapRelations(null,'covariance'),reduced=overviewEdges(all);assert.ok(reduced.length>10&&reduced.length<all.length/3);for(const edge of reduced){assert.ok(all.includes(edge));assert.equal(edge.alternative,undefined);}
});
test('every concept remains an accessible button at each semantic zoom level',()=>{
 assert.equal(detailLevel(.15),'overview');assert.equal(detailLevel(.5),'names');assert.equal(detailLevel(1),'detail');
 for(const c of concepts)for(const level of ['overview','names','detail'] as const){const data={reference:ref(c.id),title:titleFor(ref(c.id)),note:c.short,value:'',level,active:false,related:true,hovered:false,visited:false,onSelect:noop,onHover:noop};const html=renderToStaticMarkup(createElement(ReactFlowProvider,null,createElement(ExplorerNode,{id:c.id,type:'explorer',data,dragging:false,isConnectable:false,zIndex:2,selected:false,selectable:false,deletable:false,draggable:false,positionAbsoluteX:0,positionAbsoluteY:0})));assert.match(html,/<button/);assert.match(html,/aria-label=".+ erkunden"/);assert.doesNotMatch(html,/NaN|Infinity/);}
});
test('the proposed learning paths consist entirely of existing directed relations',()=>{
 const edges=new Set(connections.map(e=>e.id));for(const guide of explorationGuides){for(let i=1;i<guide.path.length;i++)assert.ok(edges.has(`${guide.path[i-1]}--${guide.path[i]}`),guide.title);assert.ok(guide.note.length>50);}
});
test('history restores compactness, focus mode, question and procedure variant together',()=>{
 let history=initialExploration('P002');const a={...history.present,selected:ref('t_test','x','v2'),columns:{x:'einkommen',y:'lernzeit',likertMetric:true},detailOpen:false,panelOpen:true,focusMode:'before' as const,guideId:'sample-size'};
 history=visit(history,a);history=visit(history,{...a,selected:ref('p_value'),contextAnchor:a.selected,focusMode:'after',detailOpen:true,guideId:undefined});
 const back=step(history,'back',{x:2,y:3,zoom:.4},survey.map(r=>r.id));assert.equal(back.present.selected?.use,'v2');assert.equal(back.present.detailOpen,false);assert.equal(back.present.focusMode,'before');assert.equal(back.present.guideId,'sample-size');assert.equal(back.present.columns.x,'einkommen');assert.equal(back.present.layout,undefined);
 const forward=step(back,'forward',undefined,survey.map(r=>r.id));assert.equal(forward.present.detailOpen,true);assert.equal(forward.present.contextAnchor?.use,'v2');
});
test('prototype is opt-in and all compact explanations render without replacing full content',()=>{
 const baseline=renderToStaticMarkup(createElement(ReactFlowProvider,null,createElement(App,{}))),prototype=renderToStaticMarkup(createElement(ReactFlowProvider,null,createElement<{prototype?:boolean}>(App,{prototype:true})));
 assert.ok(!baseline.includes('prototype-badge'));assert.ok(prototype.includes('prototype-badge'));assert.ok(prototype.includes(explorationGuides[0].title));
 for(const concept of concepts){const html=renderToStaticMarkup(createElement(CompactInspector,{selected:ref(concept.id),context,mode:'near',onMode:noop,onSelect:noop,onHover:noop,onExpand:noop,onClose:noop,onFocus:noop}));assert.ok(html.includes('Formeln &amp; Experimente öffnen'));assert.doesNotMatch(html,/NaN|Infinity/);}
});

test('overview label boxes remain separated at mobile and desktop scales',()=>{
 for(const zoom of [.045,.05,.075,.1,.15,.2,.3])for(const id of [undefined,'chi_square','quantile','p_value','normal_distribution']){const labels=arrangeOverviewLabels(zoom,restingPlaces,topicAreas(restingPlaces),id,'mean');assert.ok(labels.nodes.mean);if(id)assert.ok(labels.nodes[id]);for(let i=0;i<labels.boxes.length;i++)for(let j=i+1;j<labels.boxes.length;j++){const a=labels.boxes[i],b=labels.boxes[j];assert.ok(a.x+a.width<=b.x||b.x+b.width<=a.x||a.y+a.height<=b.y||b.y+b.height<=a.y,`${zoom}: ${a.id} / ${b.id}`);}}
});
