import { performance } from 'node:perf_hooks';
import { visibleRelations,mapIds } from '../src/domain/visibleNetwork';
import { incomingPaths,referenceInMap } from '../src/domain/network';
import { ref,titleFor } from '../src/domain/learning';
import { restingPlaces } from '../src/domain/mapLayout';
import { placeLabels } from '../src/domain/organicLayout';
import { coreLabelOrder,overviewTitles } from '../src/domain/organicStructure';
import { mapEmphasis,relationLanes } from '../src/domain/mapEmphasis';
const ids=['mean','pearson','p_value','t_test','se','sampling_distribution','frequency','variance','linear_regression','sd'];
const titles=Object.fromEntries([...mapIds].map(id=>[id,overviewTitles[id]||titleFor(ref(id))]));
let checksum=0;
function measure(name:string,run:(i:number)=>void){for(let i=0;i<30;i++)run(i);const times=[];for(let i=0;i<300;i++){const start=performance.now();run(i);times.push(performance.now()-start);}times.sort((a,b)=>a-b);return {name,median_ms:+times[150].toFixed(3),p95_ms:+times[285].toFixed(3)};}
const results=[
 measure('graph_context',i=>{checksum+=visibleRelations(ref(ids[i%ids.length],i%2?'x':'y'),i%3?'covariance':'z').length;}),
 measure('hover_preparation',i=>{const r=ref(ids[i%ids.length]),edges=visibleRelations(r,'covariance'),path=incomingPaths(r.id,edges),emphasis=mapEmphasis(r.id,edges,path.edges);checksum+=path.nodes.size+relationLanes(edges).size;for(const id of mapIds){checksum+=referenceInMap(id,r,'covariance').id.length+emphasis.nodeRole(id).length;}checksum+=Object.keys(placeLabels(restingPlaces,.625,titles,[r.id,...coreLabelOrder],[r.id])).length;}),
 measure('detail_label_layout',i=>{checksum+=Object.keys(placeLabels(restingPlaces,.9+(i%120)*.001,titles,[...mapIds])).length;})
];
console.log(JSON.stringify({kind:'Node CPU benchmark, not browser FPS',nodes:mapIds.size,iterations:300,results,checksum},null,2));
