import { writeFileSync } from 'node:fs';
import { mapIds, visibleRelations } from '../src/domain/visibleNetwork';
import { solveGravity } from '../src/domain/gravitySolver';
const positions=solveGravity([...mapIds],visibleRelations(null,'covariance'));
writeFileSync(new URL('../src/domain/gravityPlaces.json',import.meta.url),JSON.stringify(positions,null,2)+'\n');
console.log(`Weighted network: ${mapIds.size} statistical nodes, settled before rendering.`);
