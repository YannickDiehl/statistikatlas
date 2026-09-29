# Statistikatlas – interaktiver Baukasten

Stand: 29. September 2026 · Lernpfad nach dem Sitzungsplan Statistik Ib: jede Sitzung eine eigene Aufgabe auf echten ALLBUS-Daten, dazu die freie Karte zur Orientierung.

Der Reiter **Lernpfad** ist die Startansicht. Zehn Sitzungen folgen dem Sitzungsplan „Statistik im WiSe 24/25“; die dort gestrichene Faktorenanalyse entfällt. Jede Sitzung nennt ihre politische Leitfrage, die Begriffe zur Wiederholung und die neuen Begriffe und bekommt eine eigene Aufgabe (Einzelanfertigung, `src/tasks/`): eine neue Rolle mit echtem Auftrag, eigenes Rechnen in RStudio mit mariposa, eine eigene Entscheidung und ein Ergebnis für das Plenum. Jede Aufgabe ist der Kern einer 30–45-minütigen Arbeitsphase und trägt auch allein; eine gestufte Hilfe führt bis zum vollständigen R-Code, eine Partnervariante verteilt die Rollen.

Gebaut sind Sitzung 1 „Schon gefragt?“ (Referent:in in einem fiktiven Abgeordnetenbüro prüft mit `find_var()` und `codebook()`, welche Frageideen der ALLBUS schon beantwortet), Sitzung 2 „Erster Tag in der Datenerfassung“ (drei nachgestellte Papierbögen codieren, Regeln für mehrdeutige Kreuze, Doppelerfassung) und Sitzung 3 „Deutschland in 100 Stühlen“ (die Wahlabsicht als Saal mit 100 Stühlen, die Arbeitsstunden als Stuhlreihe). Sitzung 4 enthält bis zu ihrem Umbau die Mission „Belege es!“ („Wer Politikern misstraut, geht gar nicht mehr wählen“); für die Sitzungen 5–10 folgen die Aufgaben nach der Spezifikation `docs/superpowers/specs/2026-09-29-lernpfad-zehn-aufgaben-design.md`. Die `.sav`-Datei wird nur im Browser gelesen und nicht gespeichert; gespeichert werden ausschließlich eigene Entscheidungen und Texte (`statistikatlas.aufgaben.v1`, für die Mission `statistikatlas.missionen.v1`).

Der zweite Reiter **Freie Karte** ergänzt den Lernpfad als Orientierungshilfe. „Zurück zu Sitzung N“ führt in dieselbe Sitzung zurück; der Stand der Aufgabe bleibt erhalten. `?ansicht=karte` öffnet direkt das Netz. Prüfung: `pnpm test` (synthetische Testdateien aus `scripts/make-sandbox-fixture.R`); mit der eigenen Datei `ALLBUS_SAV=/pfad/ZA8831_v1-3-0.sav pnpm test` für alle Referenzwerte; `scripts/export-task-scripts.ts` mit `scripts/verify-task-scripts.R` führt die Lösungsskripte der Aufgaben in R aus, `scripts/export-sandbox-grid.ts` mit `scripts/verify-sandbox-r.R` gleicht den R-Code der Mission ab.

Die organische Karte besitzt 24 hervorgehobene Grundbegriffe, insgesamt 144 sichtbare Begriffspunkte und 15 Rechenbegriffe in der Detailansicht. 24 echte Begriffe bilden ein redaktionell angeordnetes, verbundenes Grundgerüst. Rechenwege verzweigen sich; der statistische Schluss wird über Stichprobe, Schätzung, Stichprobenverteilung und Unsicherheit ebenfalls sichtbar. Organische Kurven verbinden die tatsächlichen Endpunkte. Durchgehende Linien stehen für Aufbau, gestrichelte für Voraussetzungen, gepunktete für Einordnung. Die Anordnung ist weder eine historische Zeitleiste noch eine vorgeschriebene Lernfolge.

Alle 144 statistischen Punkte bleiben auf der Karte. Große Begriffe werden zuerst beschriftet; weitere Namen erscheinen beim Zoomen, Überfahren und Auswählen. Beschriftungen behalten ihre Schriftgröße auf dem Bildschirm und weichen einander aus. Wo der Platz nicht reicht, bleibt der Punkt sichtbar und sein Name ist durch Auswahl erreichbar. Es gibt keine Themenflächen, Kategoriezentren oder Verfahrensreiter. Alle 159 Begriffe und alle 80 öffentlichen mariposa-Funktionen bleiben über Erklärungen und Suche erreichbar.

## Farben lesen

Beim Überfahren oder Auswählen beziehen sich die Farben auf den in der Legende genannten Begriff: **Blau** kennzeichnet eingehende, **Orange** ausgehende Bezüge; **Violett** markiert den aktuellen Fokus. Knoten mit Bezügen in beide Richtungen sind zweifarbig. Weiter zurückliegende Eingänge erscheinen schwächer blau. Pfeile behalten ihre Richtung; Linienarten unterscheiden weiterhin Aufbau, Voraussetzungen und Einordnung. Gegenläufige und parallele Verbindungen laufen leicht versetzt, damit sie einander nicht verdecken. Die Farben bilden keine Themenkategorien.

## Erkunden

1. Einen Begriffspunkt oder Namen anklicken. Beim Darüberfahren oder Tastaturfokus erscheinen der Name, unmittelbare Bezüge und schwächer die weiter zurückliegenden Eingänge. Kanten erklären ihre Beziehung in einem kurzen Satz. Ein normaler Klick erhält den Zoom und verschiebt die Kamera nur, wenn der ausgewählte Punkt sonst vom Inspector verdeckt wäre.
2. Im Inspector passende Spalten für X und gegebenenfalls Y wählen. Ungeeignete Spalten sind mit Begründung deaktiviert. Fragewortlaut, Einheit, Messniveau, Antwortkategorien und Kodierung stehen direkt darunter. Beim Wechsel des Verfahrens bleiben passende Spalten erhalten; nötige Ersatzzuordnungen werden erklärt.
3. Formelzeichen öffnen die jeweilige Erklärung. Statistische Bausteine bleiben mit ihrer Stelle in der Karte verbunden; Grundrechenoperationen und einzelne Zwischenstufen werden ausschließlich rechts erläutert. **Rechenschritte & Zeichen verstehen** listet die zugehörigen Schritte auf. X/Y, Verfahrensvariante und Rangkontext bleiben erhalten.
4. Eine Befragten-ID eingeben, mit den Pfeilen zur nächsten Person gehen oder eine Diagrammmarkierung auswählen. Formeln, Gruppen, Rangtabellen und Dateneditor beziehen sich auf dieselbe stabile ID.
5. **Datensatz · 200** öffnet alle 28 Spalten und 200 Befragten in einer Tabelle mit 20 Zeilen je Seite. Spaltenköpfe öffnen ihre Erklärung. Eine Zelle auswählen und ihre Originalantwort im Editor ändern. Der Dialog startet auf der Seite der aktuellen Person; ein CSV-Download enthält den ganzen Datensatz.
6. **Mit den Daten experimentieren** zeigt Verteilungen beziehungsweise das Streudiagramm und einen Editor für die gewählte Person. Punkte lassen sich in zulässigen Werteschritten bewegen. Kategorien werden mit Auswahlfeldern bearbeitet; Transformationen bleiben auf geeignete Spalten beschränkt.
7. **Zurück / Vorwärts** stellt Begriff, Verwendung, Spaltenzuordnung, Rechenweg, Befragte, Voraussetzungsspur und Kartenausschnitt wieder her. Der Datensatz selbst wird dabei nicht zurückgesetzt. **Ganze Karte** stellt den Überblick wieder her und bewahrt eine selbst verschobene Anordnung.
8. **Bezüge heranziehen** rückt die aktiven Bezüge einmal um die Auswahl zusammen. Weitere Klicks und Hover ändern die Anordnung nicht. Am Griff neben dem überfahrenen Punkt lassen sich einzelne Knoten verschieben; direkte Nachbarn geben je nach Verbindungsart nach. **Anordnung zurücksetzen** stellt die Grundanordnung wieder her. Zurück/Vorwärts bewahrt die eigenen Anordnungen und den Kartenausschnitt. Reduzierte Bewegung wird berücksichtigt.


## mariposa erkunden

Die Suche akzeptiert deutsche Begriffe und R-Funktionsnamen. Jede Funktionskarte erklärt Bedeutung, Voraussetzungen, formale Bausteine und Ausgabe. Innerhalb der Karte lassen sich passende Aufrufvarianten und Datenspalten wählen. Formelpfade berücksichtigen die gewählte Variante; Verlaufseinträge bewahren auch die R-Auswahl.

R-Aufrufe lassen sich kopieren oder zusammen mit dem passenden CSV-Startskript herunterladen. Die aktuellen 200 Befragten und ein maschinenlesbares Codebuch können direkt daneben heruntergeladen werden. Komplexe mariposa-Verfahren laufen in R; der Atlas berechnet dafür keine vorgetäuschten Ergebnisse. Die bestehenden interaktiven Basisrechnungen bleiben unmittelbar nutzbar.

Die vollständige Abdeckung und Prüfung ist in [MARIPOSA-ABDECKUNG.md](MARIPOSA-ABDECKUNG.md) dokumentiert. Der R-Generator prüft den Namespace auf neu hinzugekommene oder entfernte Exporte.

## Grundlagen im Zusammenhang verstehen

55 zusätzliche Bausteine erklären Wahrscheinlichkeiten und Verteilungen, Stichproben und Inferenz sowie Modell- und Messkonzepte. Alle besitzen verknüpfte Formeln, fachliche Quellen und ein passendes interaktives Experiment. Verteilungen lassen sich als Dichte bzw. Einzelwahrscheinlichkeiten oder als kumulierte Wahrscheinlichkeit betrachten. Weitere Experimente zeigen Stichprobenmittelwerte, wiederholte Konfidenzintervalle, p-Werte und Power, Selektionsverzerrung, Regression, Überanpassung, Konfundierung und die Bildung von Messmodellen.

143 zusätzliche Verbindungen vom Typ **Einordnung** erschließen die Bedeutung berichteter Ergebnisse und Anwendungen. Sie sind gepunktet und werden direkt hervorgehoben; sie erzeugen keine rekursiven Rechenvoraussetzungen. Die Auswahl einer Grundlage bewahrt die Spalten, den Rechenweg und die Verfahrensvariante für den Rückweg. Eigenständige Modellsimulationen sind vom veränderbaren Lehrdatensatz getrennt gekennzeichnet.

Die vollständige Liste, Experimente und fachlichen Grenzen stehen in [GRUNDLAGEN-ABDECKUNG.md](GRUNDLAGEN-ABDECKUNG.md).

## Lehrdatensatz

Die 200 Erwachsenen P001–P200 werden mit einem festen Zufallsstartwert erzeugt. Es handelt sich ausschließlich um synthetische, vollständige Antworten. Die konstruierten Verteilungen und Zusammenhänge sind nicht repräsentativ; die Zustimmungsitems sind eigene Lehrbeispiele und keine validierten psychologischen Skalen.

| Bereich | Spalten |
|---|---|
| Nominale Kategorien | Geschlechtseintrag; zuletzt erworbener Berufs-/Hochschulabschluss |
| Ordinale Kategorien | Höchster allgemeinbildender Schulabschluss; finanzielle Lage |
| Binäre Indikatoren | Erwerbstätigkeit; Weiterbildung (je 0 = Nein, 1 = Ja) |
| Metrische Werte | Haushaltsnettoeinkommen, Alter, Haushaltsgröße, Erwerbsarbeitszeit, Lernzeit, Schlafdauer, Wissenstest |
| Likert-Einzelitems | Lernplanung 1–5, Lernzuversicht 1–7, Statistikinteresse 1–10 |
| Gemeinsamer Itemblock | Fünf gleichgerichtete 7-stufige Methoden-Zuversichtsitems |
| Messwiederholung | Wissenstest zu drei Zeitpunkten; dieselbe binäre Kursfrage vor/nachher |
| Mehrfachauswahl | Lernquelle Buch, Video, Kurs (je 0/1) |

Geschlecht und Berufsabschluss haben keine numerische Rangfolge. Schul- und Berufsabschlüsse sind getrennt; Meister, Techniker und Bachelor werden nicht als künstliche Rangfolge codiert. Grundlage der didaktischen Kategorien: [GESIS Schulabschluss](https://pretest.gesis.org/frage/showFrage?frage=1149&lang=de&selectedProj=123), [GESIS Ausbildungsabschluss](https://pretest.gesis.org/frage/showFrage?frage=1150&lang=de&selectedProj=123) und [DQR-FAQ](https://www.dqr.de/dqr/de/der-dqr/faq/deutscher-qualifikationsrahmen-faq.html).

Likert-Items bleiben als geordnete Kategorien beschrieben. Wie gewünscht werden ihre Abstände standardmäßig für metrische Verfahren als gleich groß angenommen; diese Annahme ist sichtbar und kann ausgeschaltet werden. Die 10er-Skala läuft von 1 bis 10 und besitzt keine neutrale Mittelkategorie. Zur Gestaltung: [GESIS Ratingskalen](https://www.gesis.org/fileadmin/admin/Dateikatalog/pdf/guidelines/gestaltung_ratingskalen_frageboegen_menold_bogner_2015.pdf).

## Verfahren und fachliche Konventionen

- **Häufigkeiten:** Kategorienzählung oder bei vielen metrischen Werten zehn gleich breite Klassen; absolute und relative Häufigkeiten verwenden dieselben 200 Fälle.
- **Median:** Bei geradem n werden die beiden mittleren metrischen Werte gemittelt. Für ordinale Kategorien werden gegebenenfalls beide Mittelkategorien genannt; Kategoriencodes werden nicht zu einer erfundenen Antwort gemittelt.
- **Spearman:** Pearson auf den mittleren Rängen, einschließlich Gleichständen. Die interaktive Rechnung führt in einen ausdrücklich gekennzeichneten Rangkontext. Die einfache Differenzenformel ohne Gleichstandskorrektur wird nicht verwendet. [Rangdefinition](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.rankdata.html), [Spearman](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.spearmanr.html).
- **Kreuztabellen:** Kategoriale X/Y-Spalten; absolute Zellenhäufigkeiten, Zeilenprozente oder Gesamtprozente mit konsistenten Randsummen. Kein Signifikanztest.
- **Mittelwert und Streuung:** Metrische Spalten, binäre 0/1-Indikatoren und Likert unter der gewählten Annahme. Der Mittelwert einer 0/1-Variable ist der Anteil der 1. Für Haushaltseinkommen wird kein persönliches Pro-Kopf-Einkommen behauptet.
- Stichprobenvarianz und Stichprobenkovarianz verwenden n − 1. Standardabweichung einer konstanten Reihe ist 0; z und Korrelation mit dieser Reihe sind nicht definiert.
- Pearson besitzt weiterhin beide Rechenwege: Kovarianz geteilt durch Streuungsprodukt oder Summe der z-Produkte geteilt durch n − 1. Nominale Mehrkategoriencodes und ordinale Abschlüsse werden dafür nicht freigegeben.
- Einheiten stammen aus den gewählten Spalten. Ränge, z-Werte und standardisierte Größen werden passend gekennzeichnet. Zahlen werden intern ungerundet berechnet.
- Lange Formeln zeigen wenige verknüpfte Beiträge einschließlich der aktuellen Person und eine Auslassungsmarke; die Rechnung verwendet alle 200 Fälle. Diagramme aggregieren Verteilungen, statt 200 beschriftete Einzelbalken zu zeichnen.

## Entwicklung und Offline-Fassung

```sh
pnpm install
pnpm dev
pnpm test
pnpm build
```

`pnpm build` berechnet die deterministische Grundanordnung vorab, prüft TypeScript, erstellt `dist/` und schreibt eine eigenständige HTML-Datei nach `Statistikatlas-Prototyp.html` und `dist/Statistikatlas-offline.html`. Die Anwendung funktioniert damit ohne Server und Netzwerk. Datenänderungen werden auf diesem Gerät gespeichert. Bestehende Eingaben des bisherigen 16-Spalten-Datensatzes werden beibehalten; die zwölf neuen Spalten werden deterministisch ergänzt. Die vorherige Speicherung des Fünf-Personen-Beispiels wird nicht überschrieben.

Erweiterung: `mariposaCatalog.ts` enthält den geprüften Katalog und die verlinkten Formeln, `mariposa.ts` erzeugt rollenabhängige R-Aufrufe. `PackageInspector` und `MariposaPanel` ergänzen die Erklärungen. `domain/foundations` enthält Grundlagenkatalog, numerische Modelle und unabhängige R-Referenzen; `components/foundations` enthält die dazugehörigen Experimente.

Aktive Kernmodule: `survey.ts` (Codebuch, Datensatz, Auswahlregeln), `descriptive.ts` (Ränge, Median, Häufigkeiten), `learning.ts` und `formulas.ts` (Baukasten und Formeln), `network.ts`, `visibleNetwork.ts`, `organicStructure.ts`, `organicLayout.ts`, `mapLayout.ts` und `exploration.ts` (Beziehungsprojektion, organische Grundstruktur, Beschriftung, gezielte Anziehung und Verlauf). `NetworkMap`, `ConceptInspector`, `ColumnPicker`, `SurveyData`, `SurveyAnalysis` und `SurveyExperiment` bilden die Oberfläche. Frühere Komponenten und Fünf-Fall-Referenztests bleiben als Bestand erhalten.

Die Karte aktualisiert beim Zoomen die sichtbare Größe der Knoten und Pfeile über eine CSS-Variable. Die Beschriftungsplanung folgt nach Ende der Geste beziehungsweise 100 ms ohne Zoomänderung. Nur versetzte parallele Kanten abonnieren den laufenden Zoom für ihren konstanten Spurabstand. Beim Ziehen bleiben die Beschriftungspositionen bis zum Loslassen stabil. Unveränderte Knoten und Kanten behalten ihre Objektidentität; Hover und Suche lösen keine erneuten Simulationen im Erklärungsbereich aus. Beziehungsprojektionen besitzen einen begrenzten Cache mit vollständigem X/Y-, Rang-, Varianten- und Ankerkontext; Beschriftungskollisionen werden über ein räumliches Raster geprüft.

`node --import tsx scripts/benchmark-map.ts` misst die reine CPU-Vorbereitung von Kontextwechseln, Hover und Detailbeschriftung mit aufgewärmtem Cache. Das ist keine Browser-FPS-Messung. Referenzen vor dieser Optimierung sichern 48 Beziehungskontexte und zwölf Beschriftungsansichten; Tests prüfen außerdem schnelle Zoomfolgen, Timerbereinigung und die Wiederverwendung unveränderter Graphobjekte.

Der aktuelle Prüfstand steht in `UMSETZUNG-Pruefstand.md`. Frühere Browserberichte unter `artifacts/` beziehen sich auf ältere Oberflächen.
