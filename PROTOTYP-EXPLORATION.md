# Explorationsprototyp

11. September 2026. Aufruf: `?ansicht=prototyp`. Die Hauptadresse und `?ansicht=atlas` zeigen weiterhin den vorherigen Atlas. Alle 159 Konzepte, der Lehrdatensatz, mariposa-Varianten und ausführlichen Formeln bleiben gemeinsam nutzbar.

## Verhalten

- Feste Geografie ohne Gravitationsberechnung oder Kartenbewegung. Fokus verändert Hervorhebung und auf Wunsch den sichtbaren Ausschnitt.
- Semantischer Zoom: unter 0,32 Übersicht, bis 0,75 Begriffsnamen, darüber vollständige Karten. Alle Knoten bleiben repräsentiert und auswählbar. Die Übersicht zeichnet 38 echte repräsentative Verbindungen; hervorgehobene Pfade ergänzen diese Auswahl vollständig.
- Übersichtsbeschriftungen werden in groben Zoomintervallen auf freien Platz geprüft. Auswahl und Hover erhalten Vorrang, danach Themen und Orientierungspunkte. Unbeschriftete Themen behalten einen anklickbaren Pfeil mit zugänglichem Namen. Auf sehr kleinen Gesamtansichten sind Themen und Suche die praktikablen Einstiege.
- Hover startet nach 140 ms. Direkte eingehende Bezüge sind kräftig, entfernte Voraussetzungen feiner. Einordnungskanten behalten ihre eigene Darstellung und werden nicht als rekursive Rechenvoraussetzung verfolgt. Pfeile kennzeichnen hervorgehobene Richtungen.
- Auswahl öffnet die kompakte Erklärung. Eine Aktion erweitert denselben Bereich zur vorhandenen Formel-/Verfahrensansicht. Schließen oder Escape reduziert sie wieder. Die kompakte Erklärung belegt mobil höchstens 43 % der Kartenhöhe und lässt ihren Inhalt scrollen.
- Der Fokus unterscheidet direkte Bezüge, rekursive Voraussetzungen und direkte Anwendungen. Eingehende Einordnungskanten von Verfahren zählen bei Grundlagen wie p-Wert zu Anwendungen. Bei vielen Anschlüssen ist die Linkliste nach Themen aufklappbar.
- Frage-Einstiege: Stichprobengröße → Standardfehler → Teststatistik → p-Wert sowie Varianz → Standardabweichung → Streuungsprodukt → Pearson. Die begleitenden Texte benennen die für die jeweilige Aussage nötigen Einschränkungen.
- Verlaufseinträge bewahren Frageweg, Fokus, kompakte/ausführliche Erklärung, Kameraposition, Spalten, Rangbasis und Verfahrensvarianten.

## Darstellung und Performance

Die neue Karte verwendet dieselbe Kartenbibliothek und dieselben Inhalte. Knotenkomponenten vergleichen ihre tatsächlich sichtbaren Eigenschaften. Beziehungen und fachliche Referenzen werden zwischengespeichert. Bewegung aktualisiert vorwiegend die Kameratransformation und eine CSS-Zoomvariable; Karten ändern ihre Inhalte an den Detailgrenzen und Beschriftungsintervallen. Außerhalb des Ausschnitts liegende Elemente muss React Flow nicht zeichnen. Die neue Ansicht ruft keine Gravitationsberechnung auf.

Dies sind gezielte technische Änderungen, keine gemessene Bildratenzusage. Keine Browser-Interaktionsprüfung oder visuelle Geräteprüfung in diesem Lauf. Das lokale Hot Reload meldete bei Komponentenwechseln zeitweilig geänderte Knotentypen; die endgültigen Typdefinitionen stehen außerhalb der Komponente.

## Prüfung

78 automatisierte Tests einschließlich der bisherigen fachlichen Referenzen. Neue Tests prüfen die Trennung von Voraussetzungen und Anwendungen, echte Übersichtskanten, zugängliche Knotenschaltflächen auf allen drei Detailstufen, gültige Fragepfade, zusammenhängenden Verlauf, alle kompakten Erklärungen und überschneidungsfreie berechnete Beschriftungsrechtecke bei mobilen und größeren Zoomfaktoren. TypeScript, Produktionsbuild und beide Offline-Fassungen gehören zum Abschluss.

Die neue Offline-Datei `Statistikatlas-Exploration-Prototyp.html` startet den Prototyp ohne Server. Die normale Offline-Fassung startet weiterhin den bisherigen Atlas. Beide verwenden dieselbe lokale Datenspeicherung.
