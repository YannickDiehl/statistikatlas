import type { ColumnRole } from './mariposaCatalog';
import type { SurveyColumn } from './survey';
export function eligible(role:ColumnRole,c:SurveyColumn,likertMetric=true){switch(role.kind){
 case 'quantitative':return c.scale==='metric'||c.kind==='binary'||c.kind==='likert'&&likertMetric;
 case 'ordered':return c.scale!=='nominal'||c.kind==='binary';
 case 'category':case 'factors':return !!c.categories;
 case 'twoGroups':return c.categories?.length===2;
 case 'binary':return c.kind==='binary';
 case 'continuous':return c.scale==='metric'&&c.kind==='continuous';
 case 'items':return /^methoden[1-5]$/.test(c.id)&&likertMetric;
 case 'repeated':return ['wissenstest','wissenstest_t2','wissenstest_t3'].includes(c.id);
 case 'pairedBinary':return ['kurs_vor','kurs_nach'].includes(c.id);
 case 'multiple':return c.id.startsWith('quelle_');
 case 'likert':return c.kind==='likert';
 case 'predictor':case 'interaction':return c.kind!=='likert'||likertMetric;
 }}
