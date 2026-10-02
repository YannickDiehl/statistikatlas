# Freie Karte: Lehrdatensatz und R lesen (Pilot) – Designspezifikation

Stand: 1. Oktober 2026. Grundlage: Vorschläge A bis F vom 1. Oktober 2026 und ein klickbares Beispiel (Standardabweichung mit den Reitern „Verstehen“, „Mit 200 Befragten“, „In R“, „Weiter“), das der Dozent mit „Perfekt“ gebilligt hat, mit einer Änderung: Daten werden mit `read_spss()` eingelesen. Die Zahlen des Beispiels stammen aus den 200 synthetischen Befragten des Atlas (`createSurvey()`), die R-Ausgabe ist mit mariposa 0.7.3 auf genau diesen Daten erzeugt; `read_spss()` auf einer daraus geschriebenen `.sav`-Datei liefert dieselbe Ausgabe.

Vorgänger: `2026-09-30-freie-karte-formelwerkstatt-pilot-design.md` (Formelwerkstatt) und die Werkbank vom 1. Oktober 2026 (angedockter, zweispaltiger Inspector). Diese Spezifikation baut auf beiden auf und ändert sie nicht.

## 1. Ziel

Was die Formelwerkstatt für die fünf Beispielpersonen leistet, soll auch für den Lehrdatensatz und für R gelten: Studierende sehen dieselbe Formel mit 200 Befragten arbeiten, lesen einen mariposa-Aufruf Zeichen für Zeichen wie eine Formel und erkennen in der R-Ausgabe die Zahlen wieder, die sie im Atlas berechnet haben. Fachbegriffe bleiben, jede Erklärung bekommt ein „Kurz gesagt“, und der Sandbox-Charakter bleibt: Daten verändern, vorher vermuten, dann ausprobieren.

## 2. Ausgangslage (Befund vom 1. Oktober 2026)

- **Zwei Welten.** Die Werkstatt rechnet mit Politik-Beispielen, der Lernpfad mit dem echten ALLBUS, der Lehrdatensatz darunter mit Lernzeit, Lernplanung und Weiterbildung. Ein Übergang fehlt.
- **Ergebnis ohne Deutung.** Beispiel Standardabweichung: „3,238 h. Die Streuung von X beträgt 3,238 h. Sie ist kein durchschnittlicher absoluter Abstand.“ Kein „Kurz gesagt“, „X“ statt Variablenname, drei statt zwei Nachkommastellen, kein Bezug zu den Schritten der Werkstatt.
- **R-Code nicht im mariposa-Stil.** Die 110 Codevorlagen in `mariposaCatalog.ts` arbeiten mit `d <- atlas`, `fn(d, …)`, `d$gruppe <- factor(…)`, `d$gewicht <- rep(1, nrow(d))`; das Startskript liest mit `utils::read.csv2()` und prüft mit `stopifnot()`. Überall steht „mariposa 0.7.2“ (Referenz ist 0.7.4).
- **Entwicklertexte im Studierenden-UI**, etwa „Geprüft an mariposa 0.7.2: öffentlicher Namespace, Funktionscode und Paketdokumentation …“ und „Der Atlas erklärt den Rechenweg. Diesen Aufruf führst du in R aus; hier wird kein mariposa-Ergebnis berechnet.“
- **Keine R-Ausgabe.** Niemand sieht, was R antwortet; ein Abgleich Atlas gegen R ist nicht vorgesehen.
- **Sandbox versteckt, Inspector sehr lang.** „Mit den Daten experimentieren“ liegt zugeklappt ganz unten, davor eine Bezugsliste mit Doppelungen (z-Standardisierung und Pearson je zweimal, dreimal „liefert einen Baustein“). Der Inspector der Standardabweichung ist rund 6.800 px hoch.
- **Kleinfehler:** „Lernplanung · 5 Stufen · 5 Stufen“; die Personenauswahl „P002 ← →“ ohne Erklärung; Rollenbeschreibungen in Fachjargon („Metrische Werte, 0/1-Indikatoren oder Likert-Items mit der sichtbaren Abstandsannahme“).

## 3. Entscheidungen des Dozenten

| Frage | Entscheidung |
|---|---|
| Richtung | Vorschläge A bis E, wie im Beispiel gezeigt. |
| Einlesen | `read_spss()`. Der Atlas stellt den Lehrdatensatz dafür als `.sav`-Datei bereit. |
| Codestil | mariposa-Idiom: `library(dplyr)` und `library(mariposa)`, Pipe `%>%`, Umkodieren mit `rec()` in `mutate()`, kein Basis-R-Umkodieren (`ifelse`, `factor()` mit `d$`). |
| Fachsprache | Wie bei der Werkstatt: Fachbegriff immer, dazu „Kurz gesagt“; kein Mittelpunkt „·“ als Trenner neben Zahlen oder Formeln. |
| mariposa | Referenzversion 0.7.4. |
| Mini-ALLBUS (Vorschlag F) | Nicht Teil dieses Pilots (Annahme, beim Review zu bestätigen; Abschnitt 13). |

## 4. Umfang

Die Arbeit hat zwei Teile.

**Teil 1, global für alle Begriffe:** Codestil und Einlesen (Abschnitt 7), `.sav`-Export (Abschnitt 8), Versionsangabe 0.7.4, Entwicklertexte entfernen, Kleinfehler, doppelte Bezüge zusammenführen. Diese Änderungen betreffen jede R-Vorlage und jeden Inspector und lassen sich vollständig maschinell prüfen.

**Teil 2, Pilot an den Begriffen der Formelwerkstatt:**

| Begriff | Reiter „Verstehen“ | Reiter „Mit 200 Befragten“ | Leitaufruf im Reiter „In R“ |
|---|---|---|---|
| `mean` | Werkstatt Mittel | Schritte 1 und 2 | `describe(x, show = "mean")` |
| `variance` | Werkstatt Streuung | Schritte 1 bis 5 | `describe(x, show = c("mean", "var"))` |
| `sd` | Werkstatt Streuung | Schritte 1 bis 6 | `describe(x, show = c("mean", "sd", "var"))` |
| `covariance` | Werkstatt Zusammenhang | Schritte 1 bis 5 | `summarise(kovarianz = cov(x, y))` (mariposa hat keine Kovarianzfunktion) |
| `pearson` | Werkstatt Zusammenhang | Schritte 1 bis 6 | `pearson_cor(x, y)` |
| `se` | Formel als Satz | Satz mit s und n der 200 | `describe(x, show = c("mean", "sd", "se"))` |
| `recode` | Werkzeug | – (das Werkzeug zeigt schon echte ALLBUS-Häufigkeiten) | `mutate(… = rec(…))` und `frequency()` |

Die bisherigen Funktionen des Katalogs (`w_mean`, `w_var`, `w_sd`, `w_se`, die Varianten von `pearson_cor` und `rec`) bleiben im Reiter „In R“ unter „Anderer Aufruf“ wählbar.

**Nicht Teil dieser Spezifikation:** Mini-ALLBUS als Lehrdatensatz und die Anbindung der Karte an die ALLBUS-Datei des Lernpfads (Vorschlag F); Reiter für Begriffe außerhalb des Pilots; das Umschreiben aller Bezugs-Labels und aller Katalognotizen außerhalb des Pilots; der Lernpfad.

## 5. Aufbau im Inspector (Pilotbegriffe)

### 5.1 Reiter

Oben im Inspector, unter Titel und „Kurz gesagt“, steht eine Reiterleiste aus vier Schaltflächen:

1. „Verstehen (5 Personen)“
2. „Mit 200 Befragten“
3. „In R“
4. „Weiter“

Für `se` heißt der erste Reiter „Verstehen“, für `recode` „Werkzeug“; `recode` hat keinen Reiter „Mit 200 Befragten“.

- Reiter nach dem ARIA-Muster „Tabs“: `role="tablist"`, Pfeiltasten wechseln, Pos1/Ende springen; das Panel ist per Tab erreichbar.
- Alle Reiter bleiben eingehängt und werden nur verborgen (`hidden`), damit Eingaben, Schritt, gewählte Person und Vorhersagen beim Wechsel erhalten bleiben.
- Der gewählte Reiter gilt je Begriff für die laufende Sitzung (nicht gespeichert); beim ersten Öffnen „Verstehen“. Am Ende von „Verstehen“ führt „Weiter mit 200 Befragten“ in den nächsten Reiter und setzt dort denselben Schritt.
- Kompakt und Ausführlich zeigen dieselben Reiter; Kompakt kürzt die Inhalte wie heute. Auf dem Telefon lässt sich die Leiste seitlich schieben.
- Jeder Reiter soll in der Werkbank (1440 × 900) ohne langes Scrollen erfassbar sein: Zielhöhe etwa ein bis zwei Bildschirme.

### 5.2 Was aus den heutigen Teilen wird

| Heute | Neu |
|---|---|
| Formelwerkstatt | Reiter „Verstehen“, unverändert |
| „Mit dem Lehrdatensatz (200 Befragte)“, `ColumnPicker` („Mit welchen Variablen?“) | Reiter „Mit 200 Befragten“, oben: „Mit welcher Variable?“ |
| `CasePicker` („Befragte P002 ← →“) | „Vorgerechnet für Person“ mit einem erklärenden Satz |
| `Formula`/`CalculationSteps`-Ergebnis („√ 10,482 ≈ 3,238“) | Formel mit 200 (5.3) |
| Bedingungen („Mindestens zwei Beobachtungen vorhanden.“) | als „Voraussetzung“ beim Ergebnis |
| `SurveyAnalysis`/`SurveyExperiment` (Rechenbeiträge, Streudiagramm) | Bild im Reiter, die Rechenbeiträge bei Schritt 4 |
| `Experiment` („Alle X + 1“, „X konstant setzen“, „P002 bearbeiten“) | „Erst tippen, dann ausprobieren“ (5.4) |
| `Recipe` („Die Rechnung als Baukasten entfalten“) | unverändert, zugeklappt am Ende von „Mit 200 Befragten“ |
| `MariposaPanel` | Reiter „In R“ (5.5) |
| `MeaningLinks`, „Von hier aus weiter“, „Einordnung & Anwendungen“ | Reiter „Weiter“ (5.6) |

### 5.3 Reiter „Mit 200 Befragten“

- **Kurz gesagt:** „Dieselbe Formel wie mit fünf Personen, jetzt mit allen 200 Befragten des Lehrdatensatzes.“ Darunter Variable mit Fragetext und Einheit.
- **Kennzahlen** wie in der Werkstatt (n, Mittelwert, Ergebnis), zwei Nachkommastellen, Einheit der Variable.
- **Formel** symbolisch und eingesetzt, mit denselben Schrittknöpfen wie die Werkstatt. Die eingesetzte Formel ist gekürzt: erster Term, der Term der gewählten Person (umrahmt), letzter Term, dazwischen „…“; darunter die Zwischenergebnisse (Beispiel `sd`: „= √( 2.085,82 / 199 ) = √10,48 ≈ 3,24 h“).
- **Je Schritt** zwei Zeilen: „Schritt k für alle 200“ (zum Beispiel Summe aller 200 Werte, Abweichungen ergeben zusammen 0, Quadratsumme mit größtem Einzelbeitrag) und „Vorgerechnet für P002“ (Wert, Abweichung, Quadrat, Anteil an der Quadratsumme). Wortlaut je Begriff in `src/explain/content/`, Zahlen aus den aktuellen Daten.
- **Person wählen:** Auswahlliste mit Pfeilen und dem Satz „Ihr Beitrag ist in Formel und Bild markiert.“ Klick auf einen Punkt im Bild wählt die Person ebenfalls.
- **Bild:** Reihe: Punktdiagramm der 200 Werte mit x̄ (gestrichelt), gewählte Person hervorgehoben, ab Schritt 2 ihre Abweichung als Strecke, ab Schritt 6 das Band x̄ ± s. Paare: Streudiagramm mit Achsenkreuz und Plus- und Minusflächen wie in der Werkstatt. Die bisherigen Rechenbeiträge erscheinen bei Schritt 4.
- **Was heißt das Ergebnis?** Kurz gesagt, Fachlich, eine datenwahre Zusatzaussage (Beispiel `sd`: „141 von 200 Befragten lernen zwischen 4,51 und 10,99 Stunden.“), Voraussetzung.

### 5.4 Erst tippen, dann ausprobieren

Je Pilotbegriff zwei bis drei Vorhersagefragen. Ablauf: Frage, drei Antworten, Rückmeldung mit Begründung und Verweis auf den Formelschritt, dann „Ausprobieren“: Die Änderung wird auf den Lehrdatensatz angewandt, Formel, Bild und Kennzahlen zeigen die neuen Daten, darunter „vorher … jetzt …“. „Ausgangsdaten wiederherstellen“ setzt zurück.

Die Änderungen nutzen die vorhandenen Datenoperationen (`Alle X + 1`, `X konstant setzen`, Person bearbeiten) und eine neue (`Alle X mal 2`). Sie wirken wie heute auf den gemeinsamen Lehrdatensatz; solange er verändert ist, steht im Reiter ein Hinweis mit Rücksetzknopf.

Beispiele `sd`: alle eine Stunde mehr (s bleibt, Schritt 2), alle doppelt so lange (s verdoppelt sich, Varianz vervierfacht sich, Schritte 3 und 6), eine Person mit 40 Stunden (s steigt deutlich, Schritte 3 und 4). Für `pearson`: Y um eine Konstante verschieben (r bleibt), Y umpolen (r wechselt das Vorzeichen), ein Ausreißer.

### 5.5 Reiter „In R“

1. **Kurz gesagt:** „In R rechnet mariposa dieselbe Zahl. Tippe ein Zeichen im Code an, um zu lesen, was es tut.“
2. **Daten holen:** Knopf „Lehrdatensatz als SPSS-Datei (.sav)“; kleiner Zusatz „auch als CSV“.
3. **Der Aufruf** (Abschnitt 7) mit antippbaren Zeichen: `library()`, `<-`, `read_spss()`, `%>%`, die Funktion, die Variable, Argumente wie `show = …`. Ein Tipp markiert alle Vorkommen und zeigt eine kleine Lernkarte: Zeichen, Fachbegriff (mit Aussprache, wo nötig: `<-` „bekommt“, `%>%` „und dann“), Kurz gesagt, typischer Fehler (zum Beispiel: ohne `library(dplyr)` meldet R „konnte Funktion "%>%" nicht finden“).
4. **So antwortet R:** die Ausgabe des Aufrufs für die aktuellen Daten, Zeichen für Zeichen im Format von mariposa 0.7.4 (Abschnitt 6). Die Zahlen sind antippbar und mit dem Atlas verbunden („SD 3.238 ↔ s ≈ 3,24 h, Schritt 6“). Hinweis: „R schreibt Punkt statt Komma und drei Nachkommastellen.“
5. **Kurz prüfen:** „Welche Zahl in der Ausgabe ist s? Tippe sie an.“ Diagnosen für naheliegende Fehlgriffe (Varianz: „noch vor der Wurzel, Schritt 5“).
6. **Anderer Aufruf:** die bisherigen Katalogvarianten mit ihrem Code (Abschnitt 7) und „Aufruf kopieren“, „R-Skript“.
7. **Weitere Funktionen und Hilfe:** `?mariposa::w_sd` und verwandte Funktionen, ohne Entwicklertexte.

### 5.6 Reiter „Weiter“

- **Als Nächstes** (ein Eintrag, hervorgehoben) mit einem Satz, warum (Beispiel `sd`: „Standardfehler: Wie genau kennt man den Mittelwert? Teile s durch die Wurzel aus n: 3,24 / √200 ≈ 0,23 h.“).
- **Das geht voraus** und **Daraus entsteht**: je Ziel ein Eintrag mit Fachbegriff und einem Satz; doppelte Ziele zusammengeführt. Wortlaut für die Pilotbegriffe von Hand.
- Weitere Verwendungen und Rechenwege zugeklappt darunter.

## 6. R-Ausgabe im Atlas

Der Atlas kann R nicht ausführen. Die Ausgabe in „So antwortet R“ wird deshalb im Browser aus den aktuellen Daten im Druckformat von mariposa erzeugt, damit sie auch nach „Ausprobieren“ oder einer Datenänderung stimmt.

- Modul `src/explain/rOutput.ts` mit je einer Funktion für die Leitaufrufe des Pilots: `describe()` (Kennwerte mean, sd, var, se, n, missing), `pearson_cor()`, `summarise(cov())` (Tibble-Druck 1 × 1) und `frequency()`.
- **Referenzausgaben** erzeugt ein R-Skript `scripts/capture-r-output.R` mit mariposa 0.7.4 (Quellstand per `pkgload::load_all`, wie `verify-mariposa.R`) für den Ausgangsdatensatz und zwei veränderte Fassungen (alle + 1, eine Person mit 40 Stunden). Sie liegen als Textdateien unter `src/explain/fixtures/r-output/` und werden per Test zeichengenau mit `rOutput.ts` verglichen.
- Weicht das Format einer künftigen mariposa-Version ab, schlägt der Test nach erneutem Erfassen fehl; das ist gewollt.

## 7. Codestil und Einlesen (global)

**Startblock** jedes Aufrufs und des R-Skripts:

```r
library(dplyr)
library(mariposa)

atlas <- read_spss("Statistikatlas-200-Befragte.sav")
```

Das bisherige Startskript (Versionsprüfung, `read.csv2()`, `stopifnot()`, Hinweise auf den Quellstand) entfällt. Das heruntergeladene R-Skript enthält den Startblock, den gewählten Aufruf und kurze Kommentare in Klartext.

**Aufrufe** im Pipe-Stil:

```r
atlas %>%
  describe(lernzeit, show = c("mean", "sd", "var"))

atlas %>%
  t_test(lernzeit, group = weiterbildung)

atlas %>%
  mutate(gewicht = 1) %>%
  w_mean(lernzeit, weights = gewicht)

atlas %>%
  mutate(differenz = wissenstest_t2 - wissenstest) %>%
  t_test(differenz, mu = 0)
```

- Alle 110 Codevorlagen in `mariposaCatalog.ts` werden umgestellt: `d` wird `atlas`, `fn(d, …)` wird `atlas %>% fn(…)`, Zuweisungen auf Spalten werden `mutate()`.
- Gruppen und kategoriale Prädiktoren nutzen die Wertelabels der `.sav`-Datei. Wo eine Funktion einen Faktor braucht, wandelt `rec(…, as_factor = TRUE)` in `mutate()` um; `factorCode()` mit `d$… <- factor(…)` entfällt. Welche Funktionen das brauchen, zeigt die R-Prüfung (Abschnitt 11).
- Rang-Varianten (`rank()`) werden `mutate(x = rank(x, ties.method = "average"))`.
- Ergebnisobjekte bleiben erlaubt, wo eine zweite Ausgabe folgt (`a <- atlas %>% oneway_anova(…)` und dann `summary(a)`).
- Die Einheitsgewichte-Varianten werden `mutate(gewicht = 1)` mit dem Satz „Gewichte von 1 ändern nichts. So sieht der Aufruf mit Gewicht aus; im ALLBUS heißt das Gewicht wghtpew.“

**Version:** `mariposaVersion = '0.7.4'`; alle sichtbaren Angaben und die Prüfskripte nennen 0.7.4.

**Entwicklertexte** entfallen im Studierenden-UI: „Geprüft an mariposa …“, „Der Atlas erklärt den Rechenweg … hier wird kein mariposa-Ergebnis berechnet“, Hinweise auf Namespace, Quellstand und Implementierungsunterschiede. Was davon für Lehrende wichtig ist, steht in `MARIPOSA-ABDECKUNG.md`.

## 8. Lehrdatensatz als SPSS-Datei (global)

- Neues Modul `src/domain/savWriter.ts` schreibt eine SPSS-Systemdatei (unkomprimiert) im Browser: Kopfsatz, eine Variable je Spalte (`id` als Zeichenkette, 28 numerische), lange Variablennamen, Variablenlabels (Fragetext oder Titel), Wertelabels für kategoriale und Likert-Spalten aus den Spaltenmetadaten, Messniveau, Zeichenkodierung UTF-8.
- Die Datei entsteht aus den **aktuellen** Daten, enthält also auch eigene Änderungen. Dateiname `Statistikatlas-200-Befragte.sav`.
- Download im Datensatz-Dialog (statt „CSV“ als Hauptknopf: „SPSS-Datei (.sav)“, daneben „CSV“) und im Reiter „In R“.
- Die Prüfstrecke `scripts/generate-mariposa-check.ts` legt künftig die `.sav`-Datei statt der CSV als Eingabe an.

## 9. Kleinfehler und Texte (global)

- „Lernplanung · 5 Stufen · 5 Stufen“: Skalenangabe nur einmal.
- Ergebnissätze nennen die Variable mit Namen statt „X“ und runden auf zwei Nachkommastellen.
- Rollenbeschreibungen (`roleExplanation`) bekommen ein „Kurz gesagt“ in einfachen Worten; der Fachtext bleibt darunter.
- Doppelte Bezugsziele werden zu einem Eintrag zusammengeführt.

## 10. Architektur

```
src/explain/
  rOutput.ts               Druckformat der Leitaufrufe (6)
  fixtures/r-output/*.txt  Referenzausgaben aus R
  sample.ts                Kennzahlen, Schrittzeilen und Bildlogik für 200 Befragte (rein, testbar)
  content/datensatz/*.ts   Texte je Pilotbegriff: Schrittzeilen, Deutung, Vorhersagen, Codelegende, Weiter
  tabs.ts                  Reiterzustand je Begriff
src/domain/
  savWriter.ts             SPSS-Systemdatei (8)
  mariposa.ts              Startblock, Pipe-Stil, kein factorCode (7)
  mariposaCatalog.ts       110 Codevorlagen umgestellt, Version 0.7.4
src/components/explain/
  ExplainTabs.tsx          Reiterleiste und Panels
  SampleTab.tsx            Reiter „Mit 200 Befragten“
  RTab.tsx                 Reiter „In R“ (Codelegende, Ausgabe, Kurz prüfen)
  NextTab.tsx              Reiter „Weiter“
scripts/
  capture-r-output.R       Referenzausgaben (6)
  verify-sav.R             liest die .sav mit read_spss() und haven, vergleicht mit der CSV
```

`ConceptInspector` rendert für Pilotbegriffe `ExplainTabs` und reicht die vorhandenen Teile (Werkstatt, `Recipe`, Katalogvarianten) hinein; für alle übrigen Begriffe bleibt der Aufbau, mit den globalen Änderungen aus Teil 1.

## 11. Prüfung

- **Einheitstests:** `rOutput.ts` zeichengenau gegen die Referenzausgaben; `savWriter.ts` per Rundreise (eigener kleiner Leser im Test: Kopf, Variablen, Labels, Werte); `sample.ts` gegen Handrechnungen (Summe 1.550,3, Quadratsumme 2.085,82, s 3,24, 141 von 200); Codegenerierung: jeder Aufruf beginnt mit dem Startblock, enthält kein `d$`, kein `factor(`, kein `read.csv2`, keine Versionsangabe außer 0.7.4.
- **R-Prüfung:** alle 110 Vorlagen laufen mit `verify-mariposa.R` gegen den mariposa-Quellstand 0.7.4 auf der geschriebenen `.sav`-Datei, ohne Fehler; Warnungen werden gesichtet. `verify-sav.R` bestätigt Werte und Labels.
- **Render-Tests:** Reiter, verborgene Panels, Kompakt und Ausführlich.
- **Browser:** Reiterwechsel per Maus und Tastatur ohne Zustandsverlust; Schritte und Person im Reiter „Mit 200 Befragten“; Vorhersage, Ausprobieren, Rücksetzen; Codelegende und Kurz prüfen in „In R“; `.sav`-Download; Größen 1920, 1440, 1280, 1024, 390; keine Schrift unter 13 px; keine Konsolenfehler; die Browser-Prüfungen von Formelwerkstatt und Werkbank bleiben grün.
- **Unabhängige Prüfung** durch einen Agenten nach der Umsetzung, Befunde einarbeiten, Nachprüfung.

## 12. Pilot-Auswertung

Mit Studierenden ausprobieren, zusammen mit der Formelwerkstatt: Finden sie in der R-Ausgabe die Zahl aus dem Atlas? Nutzen sie die Reiter oder bleiben sie in „Verstehen“? Helfen die Vorhersagen? Danach Entscheidung über den Ausbau auf weitere Begriffe und über Vorschlag F.

## 13. Zur Bestätigung beim Review

1. Mini-ALLBUS (F) bleibt außerhalb dieses Pilots.
2. `describe()` ist der Leitaufruf für Mittelwert, Varianz, Standardabweichung und Standardfehler; die `w_*`-Funktionen bleiben als „Anderer Aufruf“.
3. Kovarianz: `summarise(kovarianz = cov(x, y))` mit dem Hinweis, dass mariposa dafür keine eigene Funktion hat.
4. Die CSV bleibt als zweiter Download erhalten.
5. Die Einheitsgewichte-Varianten bleiben (als `mutate(gewicht = 1)` mit erklärendem Satz) statt sie zu streichen.
6. Reiternamen: „Verstehen (5 Personen)“, „Mit 200 Befragten“, „In R“, „Weiter“.
