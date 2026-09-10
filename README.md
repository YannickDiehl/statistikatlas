# Statistikatlas – interaktiver Baukasten

Stand: 10. September 2026 · Netzkarte mit 200 synthetischen Befragten.

Die große Karte ist die Start- und Arbeitsfläche. Alle 36 Begriffe behalten ihre Position. 70 Grundbeziehungen werden durch Verbindungen zur aktuellen Verwendung ergänzt. Es gibt keine Verfahrensreiter. Die Kurslandkarte außerhalb dieses Projekts bleibt unberührt.

## Erkunden

1. Eine Karte an beliebiger Stelle anklicken. Beim Darüberfahren oder Tastaturfokus werden sämtliche eingehenden Pfade hervorgehoben; beim Verlassen kehrt die bisherige Auswahl zurück.
2. Im Inspector passende Spalten für X und gegebenenfalls Y wählen. Ungeeignete Spalten sind mit Begründung deaktiviert. Fragewortlaut, Einheit, Messniveau, Antwortkategorien und Kodierung stehen direkt darunter. Beim Wechsel des Verfahrens bleiben passende Spalten erhalten; nötige Ersatzzuordnungen werden erklärt.
3. Formelzeichen und eingehende oder ausgehende Bezüge führen zu denselben Bausteinen in der Karte. Im zusätzlichen Rechenbaum lassen sich weitere Voraussetzungen öffnen. X/Y und der Rangkontext bleiben erhalten.
4. Eine Befragten-ID eingeben, mit den Pfeilen zur nächsten Person gehen oder eine Diagrammmarkierung auswählen. Formeln, Gruppen, Rangtabellen und Dateneditor beziehen sich auf dieselbe stabile ID.
5. **Datensatz · 200** öffnet alle 16 Spalten und 200 Befragten in einer Tabelle mit 20 Zeilen je Seite. Spaltenköpfe öffnen ihre Erklärung. Eine Zelle auswählen und ihre Originalantwort im Editor ändern. Der Dialog startet auf der Seite der aktuellen Person; ein CSV-Download enthält den ganzen Datensatz.
6. **Mit den Daten experimentieren** zeigt Verteilungen beziehungsweise das Streudiagramm und einen Editor für die gewählte Person. Punkte lassen sich in zulässigen Werteschritten bewegen. Kategorien werden mit Auswahlfeldern bearbeitet; Transformationen bleiben auf geeignete Spalten beschränkt.
7. **Zurück / Vorwärts** stellt Begriff, Verwendung, Spaltenzuordnung, Rechenweg, Befragte, Voraussetzungsspur und Kartenausschnitt wieder her. Der Datensatz selbst wird dabei nicht zurückgesetzt. **Ganze Karte** öffnet den Überblick.

## Lehrdatensatz

Die 200 Erwachsenen P001–P200 werden mit einem festen Zufallsstartwert erzeugt. Es handelt sich ausschließlich um synthetische, vollständige Antworten. Die konstruierten Verteilungen und Zusammenhänge sind nicht repräsentativ; die Zustimmungsitems sind eigene Lehrbeispiele und keine validierten psychologischen Skalen.

| Bereich | Spalten |
|---|---|
| Nominale Kategorien | Geschlechtseintrag; zuletzt erworbener Berufs-/Hochschulabschluss |
| Ordinale Kategorien | Höchster allgemeinbildender Schulabschluss; finanzielle Lage |
| Binäre Indikatoren | Erwerbstätigkeit; Weiterbildung (je 0 = Nein, 1 = Ja) |
| Metrische Werte | Haushaltsnettoeinkommen, Alter, Haushaltsgröße, Erwerbsarbeitszeit, Lernzeit, Schlafdauer, Wissenstest |
| Likert-Items | Lernplanung 1–5, Lernzuversicht 1–7, Statistikinteresse 1–10 |

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

`pnpm build` prüft TypeScript, erstellt `dist/` und schreibt eine eigenständige HTML-Datei nach `Statistikatlas-Prototyp.html` und `dist/Statistikatlas-offline.html`. Die Anwendung funktioniert damit ohne Server und Netzwerk. Datenänderungen werden auf diesem Gerät gespeichert. Die vorherige Speicherung des Fünf-Personen-Beispiels wird nicht überschrieben.

Aktive Kernmodule: `survey.ts` (Codebuch, Datensatz, Auswahlregeln), `descriptive.ts` (Ränge, Median, Häufigkeiten), `learning.ts` und `formulas.ts` (Baukasten und Formeln), `network.ts` und `exploration.ts` (Karte und Verlauf). `NetworkMap`, `ConceptInspector`, `ColumnPicker`, `SurveyData`, `SurveyAnalysis` und `SurveyExperiment` bilden die Oberfläche. Frühere Komponenten und Fünf-Fall-Referenztests bleiben als Bestand erhalten.

Der aktuelle Prüfstand steht in `UMSETZUNG-Pruefstand.md`. Frühere Browserberichte unter `artifacts/` beziehen sich auf ältere Oberflächen.
