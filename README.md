# Statistikatlas – interaktiver Baukasten

Stand: 10. September 2026. Die vier Einstiege Mittelwert, Streuung, z-Standardisierung und Korrelation erschließen dieselben 29 Begriffe. Die Gesamtkarte bewahrt ihre 53 konzeptionellen Beziehungen. Die vorhandene Seminarlandkarte im Nachbarordner bleibt unberührt.

## Ausprobieren

`Statistikatlas-Prototyp.html` enthält die gesamte Anwendung einschließlich Skripten und Stilen. Die Datei lässt sich ohne Server oder Internet öffnen. Die gehostete Fassung bietet dieselbe Datei über „Offline-Version herunterladen“ an.

1. Einen der vier Einstiege auswählen.
2. Im Bauplan einen Baustein erklären lassen oder mit **Woraus entsteht das?** seine direkten Eingänge öffnen. Rechenschritte erscheinen kompakt zwischen Eingängen und Ergebnis.
3. Die unterstrichenen Zeichen der gesetzten Formel anklicken. Zähler, Nenner, Summe, Potenz, Wurzel und Rechenzeichen führen zur passenden Verwendung des Bausteins. X und Y bleiben unterscheidbar.
4. Die Person bei **i =** auswählen oder einen Punkt beziehungsweise Balken anklicken. Formel, Einsetzung, Diagramm und Tabellenzeile beziehen sich auf dieselbe Person. Bei Σ werden weiterhin alle Fälle summiert.
5. Die Beispieldaten verändern, eine Person ergänzen oder entfernen. Die Zahlenfelder akzeptieren Dezimalkommas; bei ungültiger Eingabe bleibt der letzte gültige Wert mit Hinweis erhalten. Es sind ein bis acht vollständige Fälle möglich.
6. Bei Korrelation zwischen **Über die Kovarianz** und **Über z-Werte** wechseln. Formel und Bauplan wechseln gemeinsam; Daten und Ergebnis bleiben erhalten.
7. **Zurück** stellt Auswahl, Einstieg, Rechenweg, Variable, Person, offene Zweige und Kartenausschnitt wieder her. Datenänderungen bleiben bestehen. **Zurücksetzen** stellt die fünf Beispielpaare wieder her und leert ungültige Eingabeentwürfe.
8. **Alle 29 Bausteine** öffnet Gesamtkarte und durchsuchbare Sammlung. Auf Mobilgeräten ersetzt eine lokale Liste aus Auswahl und direkten Eingängen die große verschiebbare Karte.

Im Streudiagramm lassen sich Punkte ziehen. Fokussierte Punkte reagieren außerdem auf Pfeiltasten (Schrittweite 0,1); Zahlenfelder bieten eine weitere Eingabemöglichkeit. Alle Experimente verwenden dieselben Fälle. Daten werden ausschließlich im aktuellen Browser gespeichert. Bei blockiertem Speicher bleibt die Anwendung für die Sitzung nutzbar.

## Fachliche Konventionen

- Stichprobenvarianz und Stichprobenkovarianz verwenden `n − 1`. Ein Mittelwert benötigt mindestens einen Wert, die korrigierte Stichprobenstreuung mindestens zwei.
- Die Fallauswahl bleibt in diesem Beispiel gemeinsam und vollständig. Univariate Rechnungen benötigen inhaltlich keine zweite Variable.
- Standardabweichung und Varianz einer konstanten Reihe sind 0; deren z-Werte und Pearson-Korrelation sind nicht definiert. Für z von X ist die Streuung von Y unerheblich.
- Die allgemeine Skalierung zeigt `uᵢ / a`, lokal mit `a = s`. Ihr eigenständiges Beispiel verwendet ursprüngliche Werte, der z-Weg bereits zentrierte Werte.
- Kovarianz und Abweichungsprodukte tragen Produkteinheiten, Varianzen quadrierte Einheiten, Standardabweichungen ursprüngliche Einheiten; z, z-Produkte und r sind einheitenlos.
- Intern wird mit ungerundeten Zahlen gerechnet; numerische Einsetzungen sind mit `≈` gekennzeichnet. Extremwerte außerhalb ±1.000.000 werden in der Eingabe zurückgewiesen.
- Metrisches Skalenniveau und Fallzuordnung erscheinen als inhaltliche Annahmen. Sie werden nicht aus einer Zahlenliste automatisch bestätigt. Linearität wird als Interpretationsfrage erklärt.
- Standardisieren erzeugt keine Normalverteilung. Für die deskriptive Berechnung von r ist keine Normalverteilung nötig. Korrelation belegt keine Kausalität.

## Gestaltung

Die Oberfläche übernimmt die angenommene Richtung der beiden Demonstrationen: warmes Papierweiß `#FAF8F3`, Georgia, Bordeaux `#8B2E2E` und Dunkelgrün `#1A4D3E`, kurze Einführungen und sichtbar gesetzte Formeln. Systemschriften halten die Offline-Datei unabhängig von externen Schriftanbietern. Die abschließende gestalterische Abstimmung bleibt ein eigener nächster Schritt.

## Entwicklung und Prüfung

```sh
pnpm install
pnpm dev
pnpm test
pnpm build
```

Vite startet auf der ausgegebenen lokalen Adresse, regulär `127.0.0.1:5173`. `pnpm build` prüft TypeScript, erstellt `dist/` und schreibt die eigenständige HTML-Datei sowohl ins Projekt als auch nach `dist/Statistikatlas-offline.html`.

Die automatisierten Prüfungen decken Referenzwerte, Randfälle, Invarianzen, X/Y-Kontexte, Formelziele, Operationsverwendungen, Einheiten, geteilte Voraussetzungen, Eingabeprüfung und das serverseitige Rendern aller 29 Begriffe ab. Der aktuelle Prüfstand ist in `UMSETZUNG-Pruefstand.md` dokumentiert. Frühere Browserprüfungen und Screenshots unter `artifacts/` gehören zum vorherigen Prototyp und sind kein Nachweis für diese neue Oberfläche.

## Aktive Bausteine im Quelltext

- `src/domain/concepts.ts`: 29 fachliche Begriffe und 53 Beziehungen der Gesamtkarte.
- `src/domain/statistics.ts`: unabhängige numerische Berechnung.
- `src/domain/learning.ts`: Begriff plus Verwendung, X/Y-Kontext, echte Recheneingänge, Werte, Bedingungen und kurze Texte.
- `src/domain/formulas.ts`: strukturierte Ausdrücke und ihre kontextbezogenen Navigationsziele.
- `src/domain/data.ts`: Zahleneingabe und Prüfung gespeicherter Fälle.
- `src/components/Formula.tsx`: interaktive Brüche, Summen, Potenzen, Wurzeln und Einsetzungen.
- `src/components/LearningGraph.tsx`: lokaler Bauplan, geteilte Knoten, Gesamtkarte und mobile Eingangsliste.
- `src/components/Experiment.tsx`: gekoppelte Diagramme, Punktbewegung und gemeinsame Datentabelle.
- `src/App.tsx`: Einstiege, Navigation mit Verlauf, Rechenwege, Sammlung und lokale Speicherung.
- `src/styles.css`: gemeinsame Gestaltung und Anpassung an kleine Bildschirme.

Die älteren Komponenten `ConceptNode`, `ConceptEdge` und `ExamplePanel` sowie `readings.ts` und `lib/graph.ts` bleiben als Bestand des ersten Prototyps erhalten; die neue Oberfläche verwendet die oben genannten Komponenten. React, TypeScript, React Flow und Dagre sowie die vorhandenen Paketversionen wurden beibehalten.
