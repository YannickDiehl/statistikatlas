# Statistikatlas – interaktiver Baukasten

Stand: 10. September 2026, Revision „Karte zuerst“. Die große, durchgängig sichtbare Netzkarte ist der Ausgangspunkt. Alle 29 Begriffe behalten beim Erkunden ihre Position. Die 53 Grundbeziehungen werden durch passende Verbindungen für die aktuelle Verwendung ergänzt. Die Oberfläche besitzt keine Reiter für einzelne Verfahren. Die vorhandene Seminarlandkarte im Nachbarordner bleibt unberührt.

## Ausprobieren

`Statistikatlas-Prototyp.html` enthält die gesamte Anwendung einschließlich Skripten und Stilen. Die Datei lässt sich ohne Server oder Internet öffnen. Die gehostete Fassung bietet dieselbe Datei über „Offline öffnen“ an.

1. Einen Begriff **direkt in der Karte** anklicken oder über **Begriff finden** suchen. Ziehen bewegt die Karte; die Zoomsteuerung und die kleine Übersicht helfen bei der Orientierung. Die Einführung ist schließbar.
2. Die Auswahl bleibt in der Karte sichtbar. Ihre direkten Beziehungen werden hervorgehoben; der Inspector erklärt den Begriff daneben, auf kleinen Bildschirmen darunter. Beim Auswählen wird eine lesbare Mindestgröße hergestellt, ohne die Knoten neu anzuordnen.
3. Unter **Von hier aus weiter** zu einem vorausgehenden oder nachfolgenden Begriff springen. Auch Kartenknoten, Verbindungslinien und Formelzeichen sind Navigationsziele. **Bezüge in der Karte heranholen** richtet den Ausschnitt aus; **Alle Voraussetzungen** verfolgt den aktuellen Rechenweg rückwärts.
4. Die unterstrichenen Zeichen der gesetzten Formel anklicken. Zähler, Nenner, Summe, Potenz, Wurzel und Rechenzeichen führen zur passenden Verwendung desselben Begriffs in der Karte. Beispielsweise bleibt ein Klick auf sᵧ bei der Standardabweichung von Y.
5. Unter **Die Rechnung als Baukasten entfalten** weitere Eingänge mit + öffnen. Der lokale Rechenbaum ergänzt die große Karte. Jeder Eingang führt wieder zu seinem Platz im Netz.
6. **Beispieldaten** springt direkt zur Datenbearbeitung. Die Person bei **i =**, ein Punkt oder ein Balken bestimmt den aktuellen Fall. Formel, Einsetzung, Diagramm und Tabellenzeile beziehen sich auf dieselbe Person; Σ summiert alle Fälle. Es sind ein bis acht vollständige Fälle möglich; Dezimalkommas werden akzeptiert.
7. Bei Pearson im Inspector zwischen **Über die Kovarianz** und **Über z-Werte** wechseln. Formel, Baukasten und hervorgehobene Voraussetzungen wechseln zusammen. Bei z-Produkten werden die Rohdatenkovarianz und weitere Verwendungen ausdrücklich als andere Rechenwege gekennzeichnet.
8. **Zurück / Vorwärts** stellt Auswahl, Verwendung, Rechenweg, Variable, Person, Voraussetzungsspur und Kartenausschnitt wieder her. Datenänderungen bleiben bestehen. **Ganze Karte** führt zum Gesamtüberblick; das Schließen der Erklärung lässt die aktuelle Auswahl im Netz bestehen.
9. **Zurücksetzen** stellt die fünf Beispielpaare wieder her und leert ungültige Eingabeentwürfe.

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
- `src/domain/network.ts`: feste Kartenpositionen, kontextbezogene Beziehungen und Voraussetzungsspuren.
- `src/domain/exploration.ts`: Navigation und Wiederherstellung des Kartenausschnitts.
- `src/components/NetworkMap.tsx`: ständig sichtbare Netzkarte mit Zoom, Übersicht und verknüpfter Auswahl.
- `src/components/ConceptInspector.tsx`: Erklärung, Formeln, Beziehungen und Experimente zur Auswahl.
- `src/components/Recipe.tsx`: ergänzender aufklappbarer Rechenbaum.
- `src/components/Experiment.tsx`: gekoppelte Diagramme, Punktbewegung und gemeinsame Datentabelle.
- `src/App.tsx`: Suche, Kartennavigation mit Verlauf, Inspector und gemeinsame lokale Daten.
- `src/styles.css`: gemeinsame Gestaltung und Anpassung an kleine Bildschirme.

Die älteren Komponenten `LearningGraph`, `ConceptNode`, `ConceptEdge` und `ExamplePanel` sowie `readings.ts` und `lib/graph.ts` bleiben als Bestand des ersten Prototyps erhalten; die neue Oberfläche verwendet die oben genannten Komponenten. React, TypeScript, React Flow und Dagre sowie die vorhandenen Paketversionen wurden beibehalten.
