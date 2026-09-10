# Umsetzung und Prüfstand

10. September 2026 · Umsetzung von `KONZEPT-Weiterentwicklung.md` im vorhandenen React-Projekt.

## Enthalten

Vier gleichberechtigte Einstiege; alle 29 Begriffe; Gesamtkarte und Begriffssuche; aufklappbare direkte Recheneingänge; kompakte Operationen mit konkreter Verwendung; getrennte X/Y-Verwendungen und gemeinsam genutzte Größen; gesetzte interaktive Formeln; numerische Einsetzungen; gemeinsame Fallauswahl; bedingungsbezogene Hinweise; beide Pearson-Rechenwege; fünf Diagrammfamilien plus Beispiele für Skalenniveau und allgemeine Operationen; veränderbare Daten und bewegliche Punkte; lokale Speicherung; Navigation mit Verlauf und Kartenausschnitt; mobile Ansicht mit direkten Eingängen; Offline-Export.

## Automatisiert geprüft

- TypeScript-Prüfung und Produktionsbuild.
- 24 Tests: Referenzdaten und `n − 1`, Verschiebung/Skalierung, abnehmende und gekrümmte Zusammenhänge, konstante Dezimalwerte, kleine echte Streuung, leere/einzelne Fälle, numerische Grenzen, beide Pearson-Rechenwege und ihre Grenzen, X/Y- und Fallzuordnung, z-Skalierung gegenüber roher Skalierung, Einheiten und Operationsverwendungen, Referenzen sämtlicher Formeln, geteilte Voraussetzungen beim Zuklappen, gerundete Einsetzungen sowie Zahleneingabe und gespeicherte Fälle.
- Serverseitiges Rendern von Formel und Experiment für alle 29 Begriffe, beide Variablen und Standard-/Einzelfall-/Konstantdaten; keine NaN- oder Infinity-Ausgabe.
- Selbstständiger Export mit eingebetteten Skripten und Stilen.

## Durch Quelltextprüfung korrigiert

Falsche Streuung konstanter Dezimalreihen; Einheiten und undefinierte Ergebnisse der z-Produkte; fehlende Operationsverwendungen; Variable beim Vertiefen; Einstieg beim Öffnen aus der Sammlung; Verwendungen in Experimenten; lokale mobile Liste; Zurücksetzen ungültiger Eingabeentwürfe; Drag-/Pfeiltastenbedienung für Punkte; Wiederherstellung der Kartenpositionen zusammen mit dem Ausschnitt.

## Noch nicht als geprüft behauptet

Diese neue Oberfläche wurde in diesem Umsetzungslauf nicht mit automatisierten Browserklicks, Screenshots oder Nutzertests geprüft. Serverseitiges Rendern ersetzt weder einen visuellen Test auf realen Geräten noch einen Test mit Screenreader. Die vorherigen Prüfberichte im Ordner `artifacts/` beziehen sich auf die ältere Oberfläche.

Die endgültige Gestaltung und ein kurzer Erprobungsdurchlauf mit Studierenden bleiben sinnvolle nächste Schritte. Die Kursinhalte außerhalb dieses Atlas-Ausschnitts wurden nicht erweitert.
