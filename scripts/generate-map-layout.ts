import { writeFileSync } from 'node:fs';
import { mapIds, visibleRelations } from '../src/domain/visibleNetwork';
import { organicLayout } from '../src/domain/organicLayout';
const positions=organicLayout([...mapIds],visibleRelations(null,'covariance'));
writeFileSync(new URL('../src/domain/gravityPlaces.json',import.meta.url),JSON.stringify(positions,null,2)+'\n');
console.log(`Organic network: ${mapIds.size} statistical points, stable before rendering.`);
