/**
 * In R erfasste Ausgabe aller 110 Katalogbeispiele auf den Ausgangsdaten (scripts/capture-r-output.R,
 * mariposa 0.7.4). Schlüssel `${entryId}:${variant}`; `code` ist der vollständige analysisCode() mit Startblock,
 * damit eine Ansicht prüfen kann, ob die Ausgabe zur aktuellen Auswahl gehört. `output` ist leer, wenn R nichts
 * Sichtbares druckt (Zuweisungen, Schreibfunktionen) oder der Aufruf eine fremde Datei braucht (POR, SAS).
 * Eigenes Modul (rund 84 KB JSON), damit die Druckfunktionen in rOutput.ts es nicht mitbündeln; bei Bedarf
 * per `await import('./catalogOutput')` nachladen.
 */
import catalog from './fixtures/r-output/catalog.json';

export const CATALOG_OUTPUT: Record<string, { code: string; output: string }> = catalog;
