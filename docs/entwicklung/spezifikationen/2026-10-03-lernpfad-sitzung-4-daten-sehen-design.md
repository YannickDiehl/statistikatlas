# Lernpfad: Sitzung 4 „Daten sehen“ – Designspezifikation

Stand: 3. Oktober 2026 · Neue Sitzung zwischen „Erste Auszählung“ (3) und „Kreuztabellen“ (bisher 4, jetzt 5). Alle Zahlen: ZA8831 v1.3.0, ungewichtet, in R mit mariposa und ggplot2 nachgerechnet; die Lösungsskripte laufen mit `scripts/verify-task-scripts.R` fehlerfrei. Gebaut in `src/tasks/grafik-erst-zeichnen/`.

## 1. Ziel

Studierende bekommen eine Intuition dafür, wie Verteilungen aussehen und was eine Grafik zeigt oder verschweigt, und setzen Grafiken mit ggplot2 auf mariposa-Daten um (`read_spss()`, `to_label()`, `filter(!is.na(…))`). Der Sitzungsplan nennt Visualisierungen in Sitzung 3 nur als Wiederholung („Balkendiagramm, Boxplots“); die neue Sitzung macht daraus einen eigenen Schritt vor der Kreuztabelle.

## 2. Aufgabe · „Erst zeichnen, dann zeigen“

**Rolle:** Grafikredaktion des Schulbuchverlags „Kreidestrich“ (Name vor Einsatz auf Verwechslung prüfen). Doppelseite „Wie geht es Deutschland?“ für ein Politikbuch der Oberstufe. Regel der Lektorin: Vor jeder Grafik wird skizziert, was man erwartet; keine Grafik verspricht mehr als die Daten.

| Teil | Studierende | Browser | Lernziel |
|---|---|---|---|
| 1 · Erst zeichnen (ca. 12 Min.) | Verteilung von `ls01` (0–10) mit Maus, Finger oder Pfeiltasten skizzieren, abgeben; in R `geom_bar()` plotten, Gipfel und Höhe des höchsten Balkens ablesen | prüft Gipfel (Modus) und Höhe (±10 %, erkennt Prozent statt Anzahl und den Gipfel der eigenen Skizze); legt dann Skizze und Daten in Prozent übereinander, nennt „x von 100 Befragten an anderer Stelle“ (Totalvariationsabstand), Gipfel, Mittel, Linksschiefe | Form vor Zahl, Modus, Schiefe, Ablesen an der y-Achse |
| 2 · Rätselkasten (ca. 8 Min.) | vier unbeschriftete Silhouetten echter Verteilungen fünf Fragen zuordnen (eine bleibt übrig), mit `codebook()` und Plots prüfen, auflösen | Silhouetten aus der geladenen Datei; nach dem Auflösen je Form die Begründung (Stufenzahl, Gipfelort, Heaping, Altersgrenze) | Skalenniveau und Form lesen; Köder `pa02a` gegen `hs01` |
| 3 · Bauplan (ca. 12 Min.) | Leitfrage wählen, Form (`geom_bar`, `position = "dodge"`/`"fill"`, `geom_histogram`, `geom_boxplot`, `geom_point`, `geom_jitter`) und Rollen (`x`, `fill`/`y`) festlegen, in R bauen, Bildunterschrift mit n und Quelle | zeichnet sofort, was ggplot2 aus dem Bauplan macht, und gibt die Meldungen von R wieder (Fehler, fallengelassenes `fill`, `bins = 30`); kommentiert Anzahl gegen Anteil, vertauschte Rollen, kleine Gruppen, Überplotten; prüft n in der Bildunterschrift | Grammatik der Grafik: Variable → sichtbare Eigenschaft |
| 4 · Achse (ca. 8 Min.) | Mittel West/Ost in R (`group_by()`, `summarise()`), Achsenbeginn am Regler wählen, Antwort an die Chefredaktion | prüft beide Mittel; Balkenbild mit `coord_cartesian(ylim = c(start, 7,5))`; Bildfaktor (Verhältnis der Balkenhöhen) neben dem Datenverhältnis | ehrliche Achsen, Bildfaktor |

**Leitfragen in Teil 3:** Demokratie Ost/West (`eastwest` × `ps03`, passend: Balken auf 100 %), Arbeitsstunden nach Geschlecht (`sex` × `dw15`, passend: Boxplot), Alter und Lebenszufriedenheit (`age` × `ls01`, passend: gestreute Punkte).

**Plenum:** Gipfel Skizze · Grafik (Strichliste an der Tafel gegen den echten Gipfel 8), „x von 100 an anderer Stelle“, Silhouetten richtig, Leitfrage · Bauplan, Bildunterschrift, Achsenbeginn · Bildfaktor. **Partner:** A skizziert, B tippt verdeckt auf die Silhouetten, dann Tausch; im Bauplan dieselbe Leitfrage mit verschiedenen Formen, gemeinsame Entscheidung. **Hilfen:** vier Stufen je Teil, Verweise auf R-Workshop Kapitel 6 „Visualisierung – Grundlagen“ (6.2, 6.3, 6.4, 6.7) und 4.4.2 `codebook()`, Stufe 4 in Teil 3 mit dem vollständigen Skript zum eigenen Bauplan.

**Karte:** Begriffe der Sitzung verlinken `nominal`, `ordinal`, `metric`, `frequency`, `mode`, `mean`, `median`, `quantile`, `shape`, `missing`, `empirical_distribution`, `discrete_continuous`, `conversion`; in der Aufgabe zusätzlich `codebook`, `crosstab`, `labels`. Balkendiagramm, Histogramm, Boxplot, Streudiagramm und „Grafiken mit ggplot2“ haben noch keinen Knoten (gestrichelt).

## 3. Referenzwerte (ungewichtet)

- `ls01`: 26, 29, 81, 120, 174, 413, 416, 998, 1.506, 868, 533 (n = 5.164); Modus und Median 8, Mittel 7,36, Schiefe −1,07; 76 % bei 7 oder mehr.
- Silhouetten: `hs01` 864, 2.071, 1.470, 616, 188; `pa01` Gipfel bei 5 (1.381); `dw15` 742-mal genau 40 Stunden, 60,9 % Vielfache von 5; `age` 18–99. Köder `pa02a` 527, 1.542, 2.303, 663, 190.
- Bauplan: `eastwest` × `ps03` n = 3.621 (1.596 „TNZ: Split“); `sex` × `dw15` n = 2.943, Quartile (Typ 7 wie ggplot2) Mann 39/40/45 (1.491), Frau 30/37,5/40 (1.442), divers 32,1/40/43,8 (10); `age` × `ls01` n = 5.142, 663 verschiedene Punkte.
- Achse: West 7,4387, Ost 7,1790 (1,04-mal); Achse ab 7,1 bis 7,5: Bildfaktor 4,29.

## 4. Festlegungen

- **Speicherschlüssel:** Die neue Aufgabe heißt intern `grafik`. Die bestehenden Schlüssel `s04`–`s10` bleiben, damit gespeicherte Arbeit erhalten bleibt; die Sitzungsnummern stehen nur in `curriculum.ts` (jetzt 1–11). Textverweise auf Sitzungen in den Aufgaben 8 und 11 sind angepasst.
- **R-Code:** `library(dplyr)`, `library(ggplot2)`, `library(mariposa)` zuletzt; Pipe `%>%` wie in den übrigen Aufgaben (der R-Workshop nutzt `|>`); Kategorien über `to_label()` in `mutate()`, fehlende Angaben per `filter(!is.na(…))`. Ungewichtet; Gewichte erst in Sitzung 6.
- **Vorschau statt R:** Der Browser zeichnet nur nach, was ggplot2 zeichnen würde (Histogramm mit 30 Klassen, Boxplot-Quartile Typ 7, Streuung reproduzierbar). Die eigentliche Grafik entsteht in RStudio.

## 5. Offen

1. Karte: Knoten für Balkendiagramm, Histogramm, Boxplot und Streudiagramm ergänzen (mit Erklärung nach `src/explain/AUTHORING.md`)?
2. Sollen die Speicherschlüssel und Ordner `s04`–`s10` doch auf die neuen Nummern umbenannt werden (bricht gespeicherte Stände)?
3. Name des Verlags vor Einsatz prüfen; Pilot mit Studierenden: Reicht die Zeit für vier Teile, oder wandert Teil 2 ins Selbststudium?
