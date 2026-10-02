import { mariposaEntries } from './mariposaCatalog';
import { mapConcepts, mapIds } from './visibleNetwork';

/**
 * Notiz unten in der Karte. Die mariposa-Funktionen sind keine eigenen Punkte: Sie stecken in den Begriffen mit eigenem
 * Aufruf. Gezählt werden nur Begriffe im Netz, die mindestens einen Aufruf haben (die Grundlagen des Katalogs haben keinen),
 * und die Funktionen, die diese Aufrufe zusammen abdecken. Alle Zahlen kommen aus den Daten.
 */
export function mapNoteCounts(){
 const withCalls=mariposaEntries.filter(e=>mapIds.has(e.id)&&e.variants.length);
 return {concepts:mapConcepts.length,withCalls:withCalls.length,functions:new Set(withCalls.flatMap(e=>e.variants.map(v=>v.fn))).size};
}
export function mapNote(){const n=mapNoteCounts();return `${n.concepts} Begriffe im Netz; ${n.withCalls} davon mit eigenem mariposa-Aufruf (${n.functions} Funktionen)`;}
export const MAP_NOTE=mapNote();
