# Sitzung 6 · Mittelwerte vergleichen – Aufgabenkonzept

Leitfrage: „Unterscheiden sich Gruppen im Mittel?“ · Neue Begriffe: t-Test, einfaktorielle ANOVA, Korrelationsmatrix · Wiederholung: Normalverteilung
Alle Zahlen: eigene Rechnung mit mariposa 0.7.3 auf ZA8831 v1.3.0 (nur Aggregate).

**Codebuch-Klärung zum Experiment (`splt23_3`, `xr21`):** Das Codebuch nennt es „Splitexperiment ‚Incentivierung‘“. Selbstausfüller:innen (CAWI, MAIL) wurden gefragt, ob sie zu Befragungen von „GESIS Puls“ eingeladen werden dürfen. Variiert wurde:
- **Betrag:** 5 € bei Teilnahme vs. 10 € (5 € für die Zustimmung + 5 € bei Teilnahme).
- **„mit/ohne“ = Wiederholung des Anreizes:** „ohne“ = das Geld wird erst am Schluss des Fragetexts erwähnt; „mit“ = am Anfang genannt und am Ende wiederholt.

Die Gruppen sind ungleich groß, weil es „aus Kostengründen“ auf Papier nur A1 und B1 gab. Online sind alle vier Fassungen etwa gleich häufig (419/370/371/427; χ²-Test auf Gleichverteilung p = .07), auf Papier gab es nur A1/B1 (858/798). Das Wort „zufällig“ steht beim Split nicht ausdrücklich im Codebuch. Das Alter ist online aber über die vier Gruppen ausgeglichen (ANOVA p = .15). Die Zuweisung ist also plausibel zufällig, **aber nur innerhalb eines Modus.**

Zusatzbefund: Der Betrag deckt sich vollständig mit der Fragebogenhälfte `splt23_1`: A1/A2 = Split A, B1/B2 = Split B.

---

## 1 · Drei Konzepte (Kurzskizzen)

### K1 „Die letzte Frage“ *(empfohlen; nutzt das Experiment aus dem Entwurf, aber mit anderer Mechanik)*
**Rolle:** Leitung Panelaufbau eines fiktiven Umfrageinstituts. **Kernidee:** Am Ende der Online-Jahresbefragung steht die Frage „Dürfen wir Sie wieder einladen?“. Welche der vier ALLBUS-Fassungen wird programmiert, und welche Zusagequote verspricht man der Geschäftsführung? Die naheliegende Auswertung ergibt: Wiederholung des Anreizes = +15 Prozentpunkte. Ein Zufallscheck mit der **Korrelationsmatrix** entlarvt das als Artefakt: Wiederholung korreliert mit „Papier“ zu r = −.58. Online bleiben +1 Punkt. **Studierende entscheiden** über Fassung, versprochene Quote und den Satz, den sie *nicht* behaupten. Dazu rechnen sie t-Tests und eine ANOVA mit Tukey über die vier Fassungen.

### K2 „Zehn Institute, eine Wahrheit“
**Rolle:** Leitung eines von zehn fiktiven Kleininstituten. Jedes hat nur ein Zehntel des ALLBUS gekauft, festgelegt über die letzte Ziffer von `respid`. **Kernidee:** Alle erhalten denselben Kundenauftrag: „Ist der Westen zufriedener als der Osten?“ (ls01). Jede Person rechnet t-Test und ANOVA auf ihrem Los und schreibt eine Schlagzeile. Im Plenum entsteht an der Tafel aus den Differenzen die **Stichprobenverteilung** (Wiederholung Normalverteilung). Echte Zahlen: Die Differenzen reichen von −0,01 bis +0,57. Nur 3 von 10 Losen sind signifikant, die Gesamtstichprobe zeigt +0,26 [0,15; 0,37] mit p < .001. **Erschaffen:** eine Schlagzeile, die auch bei den anderen neun Losen noch stimmt.

### K3 „Der Moduswechsel“
**Rolle:** Methodenbeirat eines fiktiven Bürgerbarometers, das aus Kostengründen vom Interview auf Online/Papier umstellen will. **Kernidee:** Der ALLBUS hat Interview (CAPI) vs. Selbstausfüllen **per Los** zugewiesen, die Wahl zwischen Online und Papier dagegen selbst getroffen. ANOVA über drei Modi: Die Lebenszufriedenheit liegt bei 7,81 (CAPI), 7,01 (CAWI) und 7,12 (MAIL). Das Alter ist bei CAPI vs. Selbstausfüllen gleich (52,3 vs. 52,7), bei CAWI vs. MAIL nicht (46,8 vs. 58,3). Ist das ein Moduseffekt (Erwünschtheit) oder Selektion? Eine Korrelationsmatrix je Modus zeigt: Zusammenhänge bleiben stabil (mm01×mm05: −.47/−.57/−.53), Mittelwerte nicht. **Entscheiden:** Umstellung ja, nein oder mit Brückenstudie, und welche Zeitreihe bricht.

---

## 2 · Ausarbeitung K1 „Die letzte Frage“

### Rollenauftrag (Wortlaut im Browser)
> **Neuer Job: Panelaufbau beim Institut Lahnblick** *(fiktive Organisation)*
> Morgen um 9 Uhr geht unsere Jahresbefragung online. Ganz am Ende steht eine Frage, von der unser Institut lebt: „Dürfen wir Sie zu weiteren Befragungen einladen?“ Wer Ja sagt, wird unser Panel. Offen ist noch, *wie* wir fragen: Versprechen wir 5 € oder 10 € (5 € fürs Ja, 5 € bei Teilnahme)? Nennen wir das Geld erst am Schluss der Frage, oder gleich am Anfang und am Ende noch einmal?
> Raten musst du nicht. Der ALLBUS 2023 hat genau diese Frage als Experiment gestellt: Wer den Fragebogen selbst ausfüllte, bekam eine von vier Fassungen (`splt23_3`). Die Antwort steht in `xr21`.
> Bis 9 Uhr brauche ich von dir die Fassung, die wir programmieren, und die Zusagequote, die du der Geschäftsführung versprichst. **Deine Unterschrift steht unter der Freigabe.**

### Ablauf (40 min)
| Min | Station | Tätigkeit |
|---|---|---|
| 0–4 | Auftrag | lesen; Bauchgefühl notieren (Fassung + Quote, bleibt als Vergleich gespeichert) |
| 4–13 | 1 Erste Auswertung | in R Variablen bilden, zwei t-Tests über alle Selbstausfüller:innen; Anteile und Differenzen in den Browser eintragen |
| 13–22 | 2 Zufallscheck | vorher im Browser markieren, welche Korrelationen bei echter Auslosung ≈ 0 sein müssten; dann Matrix in R; ein Satz: „Die 15 Punkte kommen nicht von der Wiederholung, weil …“ |
| 22–33 | 3 Sauberer Vergleich | nur online (das Institut befragt ausschließlich online): t-Tests, ANOVA über vier Fassungen, Tukey |
| 33–40 | 4 Freigabe | Fassung, Quote mit Spanne, Betragseffekt, „Was wir nicht behaupten“ → Freigabe-Karte + Skript |

### R-Teil (ausgeführt, Stil verbindlich)
```r
library(mariposa)
library(dplyr)
allbus <- read_spss("ZA8831_v1-3-0.sav")

# Station 1: nur Selbstausfüller:innen waren im Experiment
exp <- allbus %>%
  filter(mode != 2) %>%
  mutate(
    zusage       = rec(xr21, rules = "1=1 [ja]; 2=0 [nein]; else=NA"),
    betrag       = rec(splt23_3, rules = "1:2=5 [5 Euro]; 3:4=10 [10 Euro]; else=NA"),
    wiederholung = rec(splt23_3, rules = "1=0 [ohne]; 3=0 [ohne]; 2=1 [mit]; 4=1 [mit]; else=NA"),
    papier       = rec(mode, rules = "3=0 [online]; 4=1 [Papier]; else=NA")
  )
exp %>% t_test(zusage, group = wiederholung) %>% summary()
exp %>% t_test(zusage, group = betrag) %>% summary()

# Station 2: Zufallscheck
exp %>% pearson_cor(wiederholung, betrag, papier, age, zusage) %>%
  summary(pvalue_matrix = FALSE, n_matrix = FALSE)
exp %>% crosstab(splt23_3, mode, percentages = "none") %>% summary()   # optional

# Station 3: der saubere Vergleich
online <- exp %>% filter(mode == 3)
online %>% t_test(zusage, group = wiederholung) %>% summary()
online %>% t_test(zusage, group = betrag) %>% summary()
online %>% oneway_anova(zusage, group = splt23_3) %>% tukey_test() %>% summary()
```
**Echte Ergebnisse (ungewichtet; Zusagequote = Mittelwert der 0/1-Variable):**

| Vergleich | Gruppen | Differenz [95-%-KI] | Test |
|---|---|---|---|
| Wiederholung, alle | ohne 52,7 % (n 2357) · mit 67,7 % (759) | **+15,1 Pp.** [11,2; 19,0] | t = 7,59, p < .001, g = .31 |
| Wiederholung, online | ohne 66,8 % (764) · mit 67,7 % (759) | **+1,0** [−3,8; 5,7] | t = 0,40, p = .69 |
| Betrag, alle | 5 € 54,1 % (1581) · 10 € 58,6 % (1535) | +4,4 [0,9; 7,9] | t = 2,49, p = .013 |
| Betrag, online | 65,0 % · 69,5 % | +4,5 [−0,2; 9,3] | t = 1,89, p = .059 |
| Betrag, Papier | 44,2 % · 47,7 % | +3,6 [−1,3; 8,5] | p = .15 |
| Modus (nicht ausgelost) | online 67,2 % · Papier 45,9 % | −21,3 | Papier-Befragte 11,4 Jahre älter |

- **ANOVA online:** A1 67,0 · A2 62,6 · B1 66,5 · B2 72,2 %. F(3, 1519) = 2,68, p = .046, η² = .005. Tukey: nur B2–A2 ist signifikant (+9,6 Pp., p = .026). B2–A1 (+5,2, p = .40) und B2–B1 (+5,7, p = .34) sind es nicht. Zum Vergleich die verzerrte ANOVA über alle: F = 20,7, p < .001.
- **Matrix (alle):** wiederholung×papier −.58, wiederholung×age −.20, papier×age .31, papier×zusage −.22, age×zusage −.30. Beim Betrag dagegen: betrag×papier −.02, betrag×age −.00.
- **Matrix (online):** wiederholung×age −.03, betrag×age .02.
- **Gewichtet (`wghtpew`):** Wiederholung online +0,2 (p = .93), Betrag online +3,8 (p = .11), ANOVA online p = .063. Die Signifikanz der ANOVA kippt also.

### Was der Browser prüft
- **Liest** `splt23_3`, `xr21`, `mode`, `age`, `wghtpew` aus der eigenen .sav und rechnet alle plausiblen Wege vor (alle/online/Papier × gewichtet/ungewichtet). Jede Eingabe wird einem Weg zugeordnet, wie beim Multiversum: „Das ist die gewichtete Online-Zahl – auch gültig.“
- **Toleranzen:** Anteile ±0,5 Pp., t ±0,02, r ±0,005. Das Vorzeichen ist frei (mariposa rechnet „5 vs. 10“); der Browser erklärt die Richtung. Tukey-p wird nicht nachgerechnet, nur die Paardifferenzen.
- **Erkannte Fehler:** Mittelwert > 1 → „xr21 noch 1/2 statt 0/1?“; `t_test(group = splt23_3)` mit vier Gruppen → Hinweis auf die ANOVA.
- **Gegenfragen:** Wer B2 wählt: „B2 schlägt nur A2 signifikant. Was sagst du, wenn B2 bei uns nicht besser läuft als das billigere A1?“ Wer eine Quote ohne Spanne angibt: „Wie breit ist dein Intervall?“
- **Überraschungsmoment:** Die eigenen Balken werden animiert. „mit“ bleibt bei 67,7 % stehen, „ohne“ springt von 52,7 auf 66,8 %: *Nicht die Wiederholung hat sich verändert, sondern die Vergleichsgruppe.*
- **Optional „Zufallsmaschine“:** Die Fassungs-Etiketten der Online-Fälle werden 1.000-mal gemischt. Das Histogramm der Differenzen unter H0 ist eine Glockenkurve um 0; die eigenen Werte werden markiert (+1,0 mittendrin, +4,5 am Rand). Das wiederholt Normal- und Stichprobenverteilung.
- **Nötige TypeScript-Rechnung:** gewichtete k×2-Anteile (vorhandenen 2×2-Kern verallgemeinern); Welch-t und ANOVA mit t- bzw. F-Verteilung über die regularisierte unvollständige Betafunktion; paarweise Pearson-Matrix; Gewichtung exakt nach mariposa, gegen R abgeglichen; optional Permutation; kein ptukey.

### Gestufte Hilfen (Beispiel Station 3; Stationen 1–2 analog)
1. **Denkanstoß:** „Unser Institut befragt nur online. In welcher ALLBUS-Teilgruppe gab es alle vier Fassungen?“
2. **Verweis:** Begriffskarten t-Test, Einfaktorielle ANOVA, Korrelationsmatrix, Confounding. R-Workshop Kap. 5 (Transformation) und Kap. 7.6 Mittelwertvergleiche (`…/07-Uni-Bivariate-Analyse.html#sec-mvc`).
3. **Gerüst:**
   ```r
   online <- exp %>% filter(mode == ___)
   online %>% t_test(zusage, group = ___) %>% summary()
   online %>% oneway_anova(zusage, group = ___) %>% tukey_test() %>% summary()
   ```
4. **Vollständiger Code** (Block oben). Die Station gilt als bearbeitet und wird nur neutral als „mit Lösung“ vermerkt.

Station 2, Denkanstoß: „Das Los weiß nichts über Alter oder Papier. Welche Zellen der Matrix müssten also nahe 0 liegen?“

### Plenum, Partnervariante, allein
- **Freigabe-Karte:** Fassung · versprochene Online-Quote mit Spanne · „10 € bringen … Pp.“ · „Was wir nicht behaupten: …“. An der Tafel: Strichliste der Fassungen, Zahlenstrahl der Betragseffekte.
- **Erwartbare Unterschiede** (Lerngegenstand): gepoolt vs. online (15 vs. 1); gewichtet vs. ungewichtet (p = .046 vs. .063); „höchster Balken“ B2 vs. „billigste gleichwertige“ A1 vs. B1.
- **Auflösung durch den Dozenten:** Der Betragseffekt zeigt sich in beiden Modi ähnlich (+4,5/+3,6), eine Replikation in den Daten. Ob er signifikant ist, hängt an n.
- **Partnervariante:** A = Panelaufbau (Stationen 1, 3a: t-Tests; will eine starke Zahl), B = Qualitätssicherung (Stationen 2, 3b: Matrix, ANOVA/Tukey; hat ein Vetorecht). Die Freigabe braucht zwei Unterschriften mit je einem Satz.
- **Allein:** beide Rollenkarten nacheinander; die Abschlusskarte zeigt Auflösung und typische Entscheidungen, alles lokal gespeichert.

### Begriffe und Missverständnis
- **Abgedeckt:** t-Test (Welch, Mittelwertdifferenz, KI, p, g; Mittelwert einer 0/1-Variable = Anteil); ANOVA (F, η², Welch) mit Tukey; Korrelationsmatrix als Balance-Check (paarweises n); Wiederholung Normalverteilung („zusage kennt nur 0 und 1 – warum trägt der t-Test trotzdem?“ → Stichprobenverteilung); Confounding (S. 5), Kausalität (S. 4).
- **Angegriffenes Missverständnis:** *„Steht Experiment drauf, ist jeder Gruppenunterschied kausal.“* Das Los schützt nur den Vergleich, der tatsächlich ausgelost wurde. Nebenbei: „höchster Balken = Sieger“, „signifikant = groß“ (η² = .005), „t-Test verlangt normalverteilte Daten“.

### Aufwand und Risiken
**Aufwand M:** neue Rechenkerne (t/F-Verteilung, ANOVA, Matrix, k×2) mit R-Abgleich, dazu eine Stationen-Oberfläche mit Matrix-Markierung, Freigabe-Karte und Skriptgenerator.

**Risiken:**
1. **mariposa-Fehler:** `exp %>% group_by(mode) %>% t_test(zusage, group = wiederholung)` bricht in 0.7.3 mit einer kryptischen `data.frame`-Meldung ab, weil es auf Papier kein „mit“ gibt. Gerade wer schichten will, läuft hinein. Der Browser muss darauf hinweisen, oder mariposa bekommt eine sprechende Meldung.
2. **Betrag = Fragebogenhälfte (`splt23_1`):** Ein Teil des 10-€-Effekts könnte vom Frageprogramm stammen. Das sollte als Profi-Frage auf die Karte.
3. **Nebenkorrelation:** wiederholung×betrag online r = .07 (p = .008), weil die Zellen ungleich groß sind. Eine Erklärung dafür sollte bereitliegen.
4. **t-Test auf 0/1** braucht eine Brücke zu Kreuztabelle/χ², denn die Schlussfolgerung ist dieselbe.
5. **Zeit:** Die Planung ist knapp. Notfalls wandert Station 2 ins Plenum.

---

## 3 · Offene Fragen an den Dozenten
1. Ist ein 0/1-Ausgang als „Mittelwert“ für Sitzung 6 in Ordnung, oder soll ein metrischer Vergleich hinzu (z. B. Moduseffekt ls01 aus K3 als Bonus)?
2. Soll im Experiment ungewichtet (bei Experimenten üblich) oder gewichtet (Anschluss an S. 5) der Standard sein? Die ANOVA kippt zwischen p = .046 und .063.
3. Wird der `group_by`-Fehler in mariposa vorher behoben, oder soll der Browser ihn nur abfangen?
