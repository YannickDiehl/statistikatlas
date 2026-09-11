import type { NetworkEdge, Point } from './network';

// Actual statistical concepts, not topic containers. Coordinates are editorial:
// branches express selected relationships, never a universal order of learning.
export const corePlaces:Record<string,Point>={
 sampling:{x:60,y:190}, population_parameter:{x:90,y:760},
 series:{x:340,y:340}, validn:{x:600,y:55}, mean:{x:620,y:310},
 centering:{x:890,y:180}, variance:{x:1140,y:120}, sd:{x:1400,y:300},
 covariance:{x:1100,y:460}, pearson:{x:1420,y:540},
 frequency:{x:570,y:640}, empirical_distribution:{x:865,y:680},
 probability:{x:340,y:1030}, theoretical_distribution:{x:850,y:1010},
 estimator:{x:560,y:850}, sampling_distribution:{x:1160,y:885}, se:{x:1530,y:780},
 test_statistic:{x:1790,y:560}, p_value:{x:2070,y:730}, t_test:{x:2040,y:405},
 prediction:{x:1380,y:-35}, residuals:{x:1680,y:75}, linear_regression:{x:1960,y:200},
 confidence:{x:1880,y:1030},
};
export const coreIds=new Set(Object.keys(corePlaces));
export const coreLabelOrder=[...new Set(['series','mean','variance','sd','covariance','pearson','se','p_value',...coreIds])];
export const overviewTitles:Record<string,string>={
 sampling:'Stichprobenziehung',population_parameter:'Population & Parameter',series:'Beobachtete Daten',
 validn:'Stichprobengröße n',mean:'Mittelwert',centering:'Zentrieren',variance:'Varianz',sd:'Standardabweichung',
 covariance:'Kovarianz',pearson:'Pearson-Korrelation',frequency:'Häufigkeiten',empirical_distribution:'Empirische Verteilung',
 probability:'Wahrscheinlichkeit',theoretical_distribution:'Verteilungsmodelle',estimator:'Schätzen',
 sampling_distribution:'Stichprobenverteilung',se:'Standardfehler',test_statistic:'Prüfgröße',p_value:'p-Wert',t_test:'t-Test',
 prediction:'Vorhersage',residuals:'Residuen',linear_regression:'Lineare Regression',confidence:'Konfidenzintervall',
};
type SpineLink={source:string;target:string;label:string;kind:NetworkEdge['kind'];supplement?:boolean};
export const spineLinks:SpineLink[]=[
 {source:'sampling',target:'population_parameter',label:'Stichprobe und Zielpopulation unterscheiden',kind:'meaning'},
 {source:'population_parameter',target:'estimator',label:'Legt fest, welche Größe geschätzt wird',kind:'meaning'},
 {source:'sampling',target:'series',label:'Die erhobene Stichprobe liefert die beobachteten Werte',kind:'meaning',supplement:true},
 {source:'series',target:'mean',label:'Die Einzelwerte gehen in den Mittelwert ein',kind:'build'},
 {source:'validn',target:'mean',label:'Die Summe wird durch n geteilt',kind:'build'},
 {source:'mean',target:'centering',label:'Der Mittelwert wird von jedem Einzelwert abgezogen',kind:'build'},
 {source:'centering',target:'variance',label:'Zentrierte Werte liefern über die Quadratsumme die Varianz',kind:'build',supplement:true},
 {source:'centering',target:'covariance',label:'Zentrierte X- und Y-Werte liefern gemeinsame Abweichungsprodukte',kind:'build',supplement:true},
 {source:'variance',target:'sd',label:'Die Wurzel der Varianz ergibt die Standardabweichung',kind:'build'},
 {source:'covariance',target:'pearson',label:'Liefert die gemeinsame Streuung im Zähler',kind:'build'},
 {source:'sd',target:'pearson',label:'Die Streuungen von X und Y standardisieren die Kovarianz',kind:'build'},
 {source:'series',target:'frequency',label:'Die beobachteten Ausprägungen werden gezählt',kind:'build'},
 {source:'frequency',target:'empirical_distribution',label:'Beobachtete Anteile beschreiben die empirische Verteilung',kind:'build'},
 {source:'empirical_distribution',target:'theoretical_distribution',label:'Beobachtete Verteilung und angenommenes Modell vergleichen',kind:'meaning'},
 {source:'probability',target:'theoretical_distribution',label:'Ein Verteilungsmodell ordnet möglichen Werten Wahrscheinlichkeiten zu',kind:'meaning'},
 {source:'estimator',target:'sampling_distribution',label:'Dieselbe Schätzregel ergibt bei neuen Stichproben andere Werte',kind:'meaning'},
 {source:'sampling_distribution',target:'se',label:'Ihre Standardabweichung ist der Standardfehler des Schätzers',kind:'meaning'},
 {source:'sd',target:'se',label:'Beim Mittelwert geht die geschätzte Streuung in s / √n ein',kind:'build'},
 {source:'se',target:'test_statistic',label:'Beim t-Beispiel skaliert der Standardfehler die Abweichung vom Nullwert',kind:'build'},
 {source:'test_statistic',target:'p_value',label:'Beobachtete Prüfgröße und Nullverteilung bestimmen den p-Wert',kind:'build'},
 {source:'test_statistic',target:'t_test',label:'Der t-Test ordnet seine Prüfgröße in die passende t-Verteilung ein',kind:'meaning'},
 {source:'series',target:'prediction',label:'Liefert die beobachteten Prädiktorwerte für das Modell',kind:'build'},
 {source:'prediction',target:'residuals',label:'Die Vorhersage wird vom beobachteten Zielwert abgezogen',kind:'build'},
 {source:'residuals',target:'linear_regression',label:'Minimierung ihrer Quadratsumme bestimmt die Schätzung',kind:'build'},
 {source:'linear_regression',target:'confidence',label:'Liefert unter Modellannahmen Intervalle für geschätzte Parameter',kind:'meaning'},
 {source:'se',target:'confidence',label:'Skaliert die Unsicherheit des symmetrischen Intervalls',kind:'build'},
];
export function spineFor(edge:NetworkEdge){return spineLinks.find(e=>e.source===edge.source&&e.target===edge.target);}

// Keep active variants and alternative derivations from the underlying graph.
// Only the three explicitly reviewed missing links are supplemented.
export function explainRelations(edges:NetworkEdge[]):NetworkEdge[]{
 const result=edges.filter(e=>!(e.source==='series'&&e.target==='sampling')).map(e=>{
  const spine=spineFor(e);return spine&&!e.alternative&&!(e.kind==='condition'&&spine.kind==='build')?{...e,kind:spine.kind,label:spine.label}:e;
 });
 for(const link of spineLinks.filter(e=>e.supplement))result.push({...link,id:`organic--${link.source}--${link.target}`,alternative:false});
 const seen=new Set<string>();return result.filter(e=>{const key=`${e.source}/${e.target}/${e.kind}/${!!e.alternative}`;if(seen.has(key))return false;seen.add(key);return true;});
}
