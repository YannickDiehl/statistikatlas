# Sitzung 8 · Lineare Regression – Aufgabenkonzepte

Stand 29.09.2026. Alle Zahlen stammen aus dem ALLBUScompact 2023 v1.3.0 und wurden mit mariposa 0.7.3 per `Rscript` gerechnet (Hilfsskripte ohne Mikrodaten in `tmp-08/`). „Zufriedenheit“ meint `ps03` umgepolt (6 = sehr zufrieden). Wo nichts anderes steht, ist mit `wghtpew` gewichtet.

## 1 Drei Konzepte

### A · „Nach Augenmaß“ – Grafikredaktion (geschärfter Entwurf)

Die Chefredaktion eines fiktiven Wochenmagazins will die Grafik „Vertrauen in den Bundestag und Demokratiezufriedenheit“ mit einer Trendlinie. Die Studierenden legen die Linie zuerst von Hand in eine Blasenwolke (Blasengröße = Fallzahl je Zelle). Dann rechnen sie die Regressionsgerade in R, und der Browser vergleicht die Residuenquadratsummen. Neu gegenüber dem Entwurf ist die Wendung: Fast alle zeichnen zu steil. Das Auge legt die „SD-Linie“ (Steigung 0,79), die Regression verläuft viel flacher (0,47), und die umgekehrte Regression ergäbe im selben Bild 1,35. Die Studierenden bauen die Grafik mit Bildunterschrift und entscheiden, welche Linie gedruckt wird. Im Plenum kommen alle Handsteigungen als Punktreihe an die Tafel, daneben die eine OLS-Steigung. Das führt zum Gespräch über die Regression zur Mitte.

### B · „Der Automat im Foyer“ – Ausstellungstechnik (Empfehlung)

Eine fiktive Wanderausstellung will am Eingang einen Automaten aufstellen. Besucher:innen beantworten eine Frage über sich, und der Automat zeigt, wie zufrieden „Menschen wie du“ im Schnitt mit der Demokratie sind. Die Studierenden entscheiden, welche Frage der Automat stellt. Sie stellen ihn in R mit `linear_regression()` ein (Konstante, Steigung). Im Browser tritt er dann gegen echte Befragte an und gegen einen „Faulpelz-Automaten“, der allen den Durchschnitt zeigt. Danach prüfen sie in R, ob der Automat für alle gleich genau ist, und schreiben das Schild, das neben ihm hängt. Am Ende steht eine Entscheidung: freigeben, nur mit Schild freigeben oder eine andere Frage vorschlagen. Im Plenum entsteht eine „Automaten-Parade“ mit Steigung, R² und Trefferquote je Eingabefrage.

### C · „Zwei Zahlen, ein Streit“ – Schlichtungsstelle

Zwei fiktive Bündnisse streiten öffentlich. „Vertrauen zuerst“ sagt: „Jede Stufe mehr Vertrauen in den Bundestag bringt fast einen halben Punkt mehr Demokratiezufriedenheit (b = 0,47).“ „Zufriedenheit zuerst“ hält dagegen: „Jeder Punkt mehr Zufriedenheit bringt drei Viertel Stufen mehr Vertrauen (b = 0,74). Unser Effekt ist größer.“ Beide werfen einander vor, die Zahlen gefälscht zu haben. Als Schlichter:in rechnen die Studierenden beide Regressionen nach. Ergebnis: Beide Zahlen stimmen, R² ist beide Male 0,346, und 0,465 · 0,743 = 0,346. Die Studierenden schreiben einen Schlichterspruch in zwei Sätzen: welche Frage jede Zahl beantwortet und warum keine von beiden eine Wirkungsrichtung belegt. In der Partnervariante vertritt jede Person ein Bündnis und muss die Zahl der Gegenseite selbst rechnen.

## 2 Empfehlung ausgearbeitet: „Der Automat im Foyer“

Warum B: Alle fünf neuen Begriffe sind hier Teile einer Maschine. Die Rolle kommt in keiner anderen Sitzung vor, die Daten liefern mehrere echte Überraschungen, und das Ergebnis lässt sich im Raum sofort vergleichen.

### 2.1 Rollenauftrag (Wortlaut im Browser)

> **Dein neuer Job: Ausstellungstechnik**
> Die Wanderausstellung „Stimmungsbild Demokratie“ (fiktiv) zieht ab März durch Rathäuser und Stadtbibliotheken. Am Eingang soll ein Automat stehen. Besucher:innen tippen eine einzige Antwort über sich ein, und der Automat zeigt an: „Menschen wie du sind im Schnitt so zufrieden mit der Demokratie in Deutschland: …“ Die Zahlen kommen aus dem ALLBUS 2023.
>
> Die Kuratorin Mira Lindqvist (fiktiv) schreibt dir: „Du baust den Automaten. Welche Frage er stellt, entscheidest du. Bis Freitag brauche ich drei Dinge: die Formel, mit der er rechnet, eine Probe, wie weit er danebenliegt, und das Schild, das neben ihm hängt. Das Schild muss ehrlich sein, es lesen auch Schulklassen. Und der Automat soll für alle funktionieren, nicht nur für manche.“

### 2.2 Ablauf (40 Minuten)

| Min | Schritt |
|---|---|
| 0–4 | Eingabefrage wählen (zehn Vorschläge oder Variablensuche) und begründen. Tipp vorab: „Um wie viel Prozent genauer als der Faulpelz?“ |
| 4–15 | **Einstellen** (R): umpolen, Regression rechnen, Konstante, Steigung und R² eintragen |
| 15–22 | **Testen** (Browser): Anzeige von Hand rechnen, Besucherprobe, Auflösung, optional Knöpfe |
| 22–31 | **Gleich gut für alle?** (R): Residuen bilden, Streuung je Eingabewert eintragen |
| 31–40 | **Schild und Entscheidung** (Browser): Schild, Gegenfragen, Entscheidung, Plenumskarte |

### 2.3 R-Teil (Beispiel: Eingabe `pt03`, Vertrauen in den Bundestag)

Der Browser erzeugt den Code für die gewählte Frage. Bei Fragen mit vielen Werten fügt er eine Gruppierung hinzu, etwa `rec(age, rules = "18:29=1 [18-29]; 30:44=2 [30-44]; 45:59=3 [45-59]; 60:74=4 [60-74]; 75:max=5 [75+]")`.

```r
library(mariposa)
library(dplyr)

allbus <- read_spss("ZA8831_v1-3-0.sav")

# 1 Automat einstellen: hohe Werte sollen "zufrieden" heißen
allbus <- allbus %>%
  mutate(demo = rec(ps03, rules = "rev"))

automat <- allbus %>%
  linear_regression(demo ~ pt03, weights = wghtpew)
summary(automat)

# 2 Was zeigt der Automat an, und wie weit liegt er daneben?
allbus <- allbus %>%
  mutate(
    anzeige = 2.288 + 0.465 * pt03,   # Konstante + Steigung x Eingabe
    daneben = demo - anzeige          # Residuum
  )

allbus %>%
  filter(!is.na(daneben)) %>%
  describe(demo, daneben, weights = wghtpew)

# 3 Gleich gut für alle?
allbus %>%
  filter(!is.na(daneben)) %>%
  group_by(pt03) %>%
  describe(daneben, weights = wghtpew, show = c("mean", "sd"))

# Profi: Test der Voraussetzung
allbus %>%
  levene_test(daneben, group = pt03, weights = wghtpew)
```

**Echte Ergebnisse:**
- n = 3.577 (beides Split-Items).
- Konstante 2,288, Steigung 0,465, R² = 0,346, Standardfehler 1,031.
- Laut `describe()`: SD der Zufriedenheit 1,274, SD der Residuen 1,031. Daraus folgt 1 − (1,031/1,274)² = 0,345, also fast genau R².
- SD der Residuen je Eingabewert von 1 bis 7: 1,325 · 1,25 · 1,17 · 0,99 · 0,85 · 0,713 · 0,95.
- Levene: F(6; 3.568) = 74,9, p < 0,001.
- Profi-Zusatz `center(age, weights = wghtpew, suffix = "_c")`: Die Konstante des Altersautomaten wird von 3,95 (Neugeborenes) zu 4,16 (durchschnittliche Besucherin).

**Automaten-Parade** (gewichtet; der Faulpelz trifft auf ±1 genau bei 65 %):

| Eingabefrage | b | R² | Treffer ±1 | Residuen-SD je Wert |
|---|---|---|---|---|
| Alter `age` | 0,004 | 0,003 | 65 % | 1,09–1,35 (5 Gruppen) |
| Politisches Interesse `pa02a` | −0,018 | 0,000 | 65 % | 1,19–1,55 |
| Gesundheit `hs01` | −0,238 | 0,035 | 64 % | 1,18–1,41 |
| Links-Rechts `pa01` | −0,140 | 0,037 | 63 % | 1,03–1,52 |
| Schicht `id02` | 0,412 | 0,060 | 63 % | 1,04–1,41 |
| Lebenszufriedenheit `ls01` | 0,177 | 0,070 | 63 % | 1,14–1,38 |
| Eigene Wirtschaftslage `ep03` | −0,461 | 0,084 | 61 % | 1,05–1,60 |
| „Politiker kümmern sich nicht“ `pe01` | 0,691 | 0,196 | 66 % | 0,81–1,43 |
| Wirtschaftslage Deutschland `ep01` | −0,746 | 0,215 | 67 % | 0,86–1,39 |
| Vertrauen Bundestag `pt03` | 0,465 | 0,346 | 71 % | 0,71–1,33 |

### 2.4 Browser: Prüfung und Rückmeldung

**Neue TypeScript-Rechnung:** gewichtete bivariate OLS (SSE, SST, R²) mit Diagnosevarianten, Residuen-SD je Wert mit der mariposa-Formel (Nenner Σw − 1), Trefferquoten, ein reproduzierbarer Zufallsgenerator mit Gruppencode und die SSE für beliebige Knopfstellungen. Getestet wird gegen R wie bei der Kreuztabelle.

1. **Formel:** Der Browser vergleicht Konstante, Steigung und R² mit der eigenen Rechnung. Passt eine andere Variante, gibt er eine Diagnose:
   - *ungewichtet* (2,168 / 0,479 / 0,354): „Der Osten ist überquotiert. Soll dein Automat für ganz Deutschland sprechen?“ Beides gilt, die Karte vermerkt die Wahl.
   - *nicht umgepolt* (4,712 / −0,465): „Mehr Vertrauen, kleinere Anzeige? Bei ps03 heißt 1 ‚sehr zufrieden‘.“
   - *Achsen vertauscht* (b = 0,743, gleiches R²): „Das ist die Gerade von der Zufriedenheit zum Vertrauen, eine andere Gerade und nicht dieselbe rückwärts gelesen.“
2. **Anzeige von Hand:** Bei Eingabe 2 zeigt der Automat 3,22 (linearer Prädiktor). Bei Eingabe 0 zeigt er die Konstante, aber Eingabe 0 gibt es bei `pt03` gar nicht.
3. **Besucherprobe:** Die Besuchergruppe (Code, z. B. 417, auf allen Rechnern gleich) zieht 20 Befragte aus der eigenen Datei. Gezeigt werden nur Eingabe und Antwort, jedes Residuum erscheint als Strich. Mitgezählt werden Fehlerquadrate und Treffer für Automat und Faulpelz. Die Auflösung über alle Befragten: 3.797 gegen 5.804 Fehlerquadratpunkte, also 35 % weniger. Das ist R², und es steht neben dem eigenen Tipp.
4. **Knöpfe (optional):** Keine Stellung von Konstante und Steigung unterbietet die Fehlerquadratsumme aus R, das sind kleinste Quadrate zum Anfassen. Mehr Treffer lassen sich aber holen.
5. **Gleich gut für alle?** Die Studierenden tragen die kleinste und die größte Residuen-SD ein (Toleranz 0,01; Rundung der Koeffizienten ändert die SD innerhalb eines Werts nicht). Der Browser zeigt Balken je Wert mit einer Bezugslinie bei 1,031, darunter die Residuenmittel als Linearitätsblick.
6. **Schild:** Regelbasierte Gegenfragen mit Zahl, wie in „Belege es!“:
   - Keine Fehlerangabe: „Wie weit liegt er typischerweise daneben?“
   - „weiß“, „genau“, „du bist“: „Er zeigt einen Durchschnitt.“
   - Kausalwörter: „Macht Vertrauen zufrieden, oder geht es auch umgekehrt?“
   - SD-Verhältnis über 1,5 und keine Gruppe genannt: „Für wen liegt er weiter daneben?“

**Überraschungsmomente:**
- Der beste Automat macht 35 % weniger Fehlerquadrate, trifft auf ±1 aber nur bei 71 % statt 65 %. Bei fünf von zehn Fragen trifft der Automat sogar *seltener* als der Faulpelz.
- Am weitesten daneben liegt er bei Menschen ohne Vertrauen (±1,33 statt ±0,71), also genau beim Publikum, das die Ausstellung erreichen will.
- Steilste Gerade ≠ bester Automat: `id02` hat fast die Steigung von `pt03`, aber ein Sechstel des R². Alter ist signifikant (p < 0,001), hat aber R² = 0,003 (Anzeige 4,02 für 18-Jährige, 4,35 für 99-Jährige).
- Links-Rechts: Beide Ränder sind unzufriedener (Residuenmittel −0,85 und −0,92), doch die Gerade gibt den ganz Linken den höchsten Wert.

### 2.5 Gestufte Hilfen

**Schritt „Automat einstellen“**
1. *Denkanstoß:* Du brauchst die Anzeige bei Eingabe 0 und die Änderung pro Stufe. Beide stehen in der Koeffiziententabelle. Was bedeutet bei ps03 die 1?
2. *Verweis:* Begriffskarte „Lineare Regression“ und „Linearer Prädiktor“, `rec()` aus Sitzung 4, R-Workshop (https://rloesung.github.io/RWorkshop/), Abschnitt Regression.
3. *Gerüst:*
   ```r
   allbus <- allbus %>%
     mutate(demo = rec(____, rules = "____"))
   automat <- allbus %>%
     linear_regression(____ ~ ____, weights = ____)
   ```
4. *Vollständiger Code.*

**Schritt „Gleich gut für alle?“**
1. *Denkanstoß:* Residuum = Antwort minus Anzeige. Vergleiche seine Streuung je Eingabewert.
2. *Verweis:* „Residuen & kleinste Quadrate“, „Gleiche Fehlervarianz“, `describe()` aus Sitzung 3.
3. *Gerüst:*
   ```r
   allbus <- allbus %>%
     mutate(anzeige = ____ + ____ * pt03,
            daneben = ____ - ____)
   allbus %>%
     filter(!is.na(daneben)) %>%
     group_by(____) %>%
     describe(daneben, weights = wghtpew, show = c("mean", "sd"))
   ```
4. *Vollständiger Code.* Die Aufgabe zählt danach als bearbeitet.

### 2.6 Plenum, Partnervariante, allein

**Plenumskarte:** „Eingabe: Vertrauen Bundestag · gewichtet · b = 0,465 · R² = 0,346 · Treffer 71 % (Faulpelz 65 %) · daneben ±0,71 bis ±1,33 · Entscheidung: nur mit Schild · Schild: …“

An der Tafel entsteht die Parade. Neben den Überraschungen oben tragen zwei Fragen das Gespräch: Warum hat dieselbe Eingabe im Raum verschiedene Zahlen (Gewicht, Umpolung)? Und ist der beste Automat der richtige, wenn `pt03` fast dasselbe fragt, was er vorhersagt? Der Dozent kann die Fragen nach Sitzreihen verteilen und einen gemeinsamen Gruppencode ausgeben.

**Partnervariante:** A („Technik“) rechnet in R. B („Kuratorin“) gibt erst frei, wenn sie zwei Anzeigen selbst nachgerechnet hat, führt die Besucherprobe durch und schreibt das Schild. Beim zweiten R-Schritt tauschen die beiden, die Entscheidung unterschreiben beide.

**Allein:** Der Browser führt nacheinander durch beide Rollen. Danach rechnet er die Parade für alle zehn Fragen aus der eigenen Datei; im Seminar erscheint sie erst nach dem Plenum.

### 2.7 Begriffe und Missverständnis

Abgedeckt sind alle fünf Begriffe: der Automat als lineare Regression, die Anzeige als linearer Prädiktor, Besucherprobe und Knöpfe für Residuen und kleinste Quadrate, der Faulpelz-Vergleich für R², die SD je Eingabewert für gleiche Fehlervarianz. Dazu kommen die Konstante, „signifikant ≠ brauchbar“ und die Linearität.

Angegriffenes Missverständnis: „Die Gerade sagt, was ein Mensch denkt – und je steiler, desto besser.“

### 2.8 Aufwand und Risiken

**Aufwand M.** Vorhanden sind SPSS-Leser, Variablensuche, Codegenerator, Gegenfragen-Regelwerk und Speicherung. Neu sind die oben genannten Rechnungen, Automatenanzeige und Balken als SVG, Parade und Schildregeln.

**Risiken:**
1. Die Zeit ist knapp. Knöpfe und Levene sind optional, Stufe 4 sichert den Abschluss.
2. `ps03` ist ein Ordinalitem mit sechs Stufen und gesplittet. Der Browser warnt bei weniger als 200 gemeinsamen Fällen.
3. Die Treffer-Wendung verwirrt vielleicht. Grund: Der Faulpelz steht mit 4,16 zwischen den häufigsten Antworten 4 und 5. Der Browser erklärt das.
4. Der Tipp vorab ähnelt der versiegelten Vorhersage aus Sitzung 6 und lässt sich streichen.
5. Die Besucherprobe zeigt Einzelantworten nur aus der eigenen Datei, nur zwei Werte, ohne Speicherung. Die ungleiche Streuung ist teils ein Deckeneffekt der Skala.

## 3 Offene Fragen an den Dozenten

1. Soll die Eingabefrage frei (Variablensuche) oder aus den zehn kuratierten Items gewählt werden? Und sollen die Fragen im Seminar nach Sitzreihen verteilt werden, damit die Parade vollständig wird?
2. Soll der Levene-Test auf die Residuen je Eingabewert als „Test der Voraussetzung“ Pflicht sein (mariposa hat keinen Breusch-Pagan-Test) oder Profi-Zusatz bleiben?
3. Gehört die Treffer-Wendung (der Automat trifft seltener als der Faulpelz) in den Kern oder nur ins Plenum und in den Zusatz?
