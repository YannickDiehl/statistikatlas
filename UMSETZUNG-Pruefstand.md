# Umsetzung und Prüfstand

10. September 2026 · Revision „Karte zuerst“ nach dem Feedback zur zu statischen Umsetzung.

## Enthalten

Die Netzkarte ist die Start- und Arbeitsfläche. Keine Verfahrensreiter. Alle 29 Begriffe behalten ihre räumliche Position und bleiben beim Auswählen in der Karte vorhanden. Direkte Bezüge, Voraussetzungsspuren, eingehende und ausgehende Links sowie Formelzeichen ermöglichen die Navigation. Ein Inspector zeigt Erklärungen, formale und numerische Formeln, den aufklappbaren Rechenbaum und Experimente. Auf Mobilgeräten bleibt die Karte über dem Inspector bedienbar.

Kontextbezogene Verbindungen unterscheiden z-Produkte von unstandardisierten Abweichungsprodukten und aktuelle Rechnungen von weiteren Verwendungen. Beide Pearson-Rechenwege bleiben verfügbar. Zurück und Vorwärts stellen den Ausschnitt und den fachlichen Kontext wieder her; Datenänderungen bleiben bestehen. Die Beispielbearbeitung wird gezielt ins Sichtfeld gescrollt. Suche, Minikarte, Zoom, schließbare Einführung und ein lesbarer Mindestzoom unterstützen die Orientierung.

## Automatisiert geprüft

- TypeScript-Prüfung und Produktionsbuild einschließlich selbstständiger Offline-Datei.
- 32 Tests, davon acht zusätzliche Prüfungen für die Revision: 29 eindeutige kollisionsfreie Kartenpositionen; Erhalt aller 53 Grundbeziehungen; Navigation in beide Richtungen; Verwendung und X/Y-Kontext; fachlich korrekte z-Produkt-Verbindungen; Voraussetzungsspuren für beide Pearson-Rechenwege; Rechenweg beim Übergang zu Pearson; Wiederherstellung von Verlauf und Ausschnitt einschließlich inzwischen gelöschter Fälle; initiale Oberfläche ohne Verfahrensreiter und alle 29 Inspector-Ansichten.
- Bestehende Prüfungen für Referenzdaten, Randfälle, Invarianzen, Einheiten, Operationsverwendungen, Formelziele, geteilte Recheneingänge, Rundungskennzeichnung, Dezimalkommas und gespeicherte Fälle bleiben erhalten.
- Serverseitiges Rendern von Formel und Experiment für alle Begriffe, beide Variablen und Standard-/Einzelfall-/Konstantdaten; keine NaN- oder Infinity-Ausgabe.

## Durch Quelltextprüfung korrigiert

Falsche Zuordnung der z-Produktsumme zur Rohdatenkovarianz; Voraussetzungsspur beim z-Rechenweg; unpassende X/Y-Schalter für gemeinsame Größen; Datenbearbeitung außerhalb des Sichtfelds; verdeckte Auswahl beim Öffnen des Inspectors; zu kleiner Auswahlzoom; nicht schließbare mobile Einführung; aktuelle Kameraaufnahme während schneller Navigation.

## Grenzen der Prüfung

Diese Revision wurde nicht mit automatisierten Browserklicks, Screenshots oder Nutzertests geprüft. Serverseitiges Rendern und Quelltextprüfung ersetzen keine Prüfung auf realen Geräten oder mit Screenreader. Frühere Prüfberichte unter `artifacts/` gehören zu älteren Oberflächen. Die endgültige Gestaltung und eine Erprobung mit Studierenden stehen noch aus. Die Kursinhalte außerhalb dieses Atlas-Ausschnitts wurden nicht erweitert.
