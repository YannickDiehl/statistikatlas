# Sitzung 3 · Erste Auszählung – Aufgabenkonzepte

Alle Zahlen: ALLBUScompact 2023 (ZA8831, v1.3.0, n = 5.246), ungewichtet, gerechnet mit mariposa 0.7.3 per `Rscript` auf der lokalen Datei. Nur aggregierte Werte.

## 1. Drei Konzepte (Kurzskizzen)

### A · „Deutschland in 100 Stühlen“ (Empfehlung)

**Rolle:** Szenograf:in einer fiktiven Wanderausstellung. **Kernidee:** Zwei Säle machen je eine Verteilung begehbar. In Saal 1 stehen 100 Stühle, beschriftet mit der Wahlabsicht (`pv01`). Wer bekommt einen Stuhl: Unentschlossene, Verweigernde, Nicht-Wahlberechtigte? Saal 2 ist eine Reihe aus 100 Stühlen, sortiert nach Wochenarbeitsstunden (`dw15`). Darüber hängt ein Schild „Hier arbeitet man im Mittel __ Stunden“. **Die Studierenden entscheiden** über die Basis (wer Teil des Saals ist), erstellen einen Sitzplan und legen die Zahl für das Schild fest. Der Browser baut daraus den Saal. Stimmt die Summe nicht, fehlen sichtbar Stühle. Der Durchschnitt steht dann nicht in der Mitte der Reihe: 66 von 100 Stühlen stehen rechts davon.

### B · „Der Einladungsbrief“

**Rolle:** Feldleitung eines fiktiven Umfrageinstituts, das die nächste Welle vorbereitet. **Kernidee:** Im Anschreiben steht der Satz „Das Interview dauert etwa __ Minuten; die meisten brauchen __ bis __ Minuten.“ Grundlage ist die Paradaten-Variable `xt10` (Bearbeitungsdauer). Die erste Auszählung schockiert: Im Mittel dauert ein Interview 652 Minuten, der Median liegt bei 65. Online-Befragte mit Unterbrechungen treiben den Mittelwert auf bis zu 61.895 Minuten. Nach Modus getrennt liegen die Mediane bei 70 (CAPI), 49 (CAWI) und 75 Minuten (Post). Die 220 fehlenden Werte stammen alle aus der Postbefragung. **Die Studierenden entscheiden** über Maß, Fallauswahl und Ausreißerregel. Sie verantworten eine Zahl, die über Teilnahme und informierte Einwilligung entscheidet.

### C · „Fundbüro für verlorene Antworten“

**Rolle:** Sachbearbeiter:in im fiktiven Fundbüro eines Umfrageinstituts. **Kernidee:** Jede fehlende Antwort ist ein Fundstück mit Etikett (−7, −8, −9, −10, −11, −42, −50). Die Studierenden sortieren die Fundstücke aus sechs Variablen in drei Regale: „wirklich verloren“, „nie gefragt“ und „eigentlich eine Antwort“. Beispiele: 251-mal „kein Einkommen“ (−50) bei `incc` ist ein echter Wert 0. 2.263-mal „TNZ: Filter“ bei `dw15` betrifft Nicht-Erwerbstätige. 1.596-mal „Split“ bei `pt03` wurde nie gefragt. 603-mal „weiß nicht“ bei `pv01` ist Information. **Sie erschaffen** für jede Variable eine „echte Verlustquote“ und entscheiden, welche Frage die nächste Welle reparieren muss.

Alle drei Konzepte unterscheiden sich grundlegend vom Entwurf „Quizredaktion“.

## 2. Ausgearbeitet: „Deutschland in 100 Stühlen“

### Rollenauftrag (so lesen ihn die Studierenden)

> **Neuer Job: Szenografie.** Die Wanderausstellung „Deutschland in 100 Stühlen“ (fiktiv) braucht deine Baupläne. Die Kuratorin schreibt:
> „Im ersten Saal stehen 100 Stühle. Jeder steht für ein Prozent – nur wovon? Auf jede Lehne kommt eine Antwort auf die Frage, welche Partei man wählen würde, wenn am Sonntag Bundestagswahl wäre. Besucher:innen sollen ihren Stuhl finden können, auch wenn sie keine Partei nennen würden. Im zweiten Saal stellen wir 100 Stühle in eine Reihe, sortiert nach Wochenarbeitsstunden. Darüber hängt ein Schild: ‚Hier arbeitet man im Mittel __ Stunden.‘ Grundlage ist der ALLBUS 2023. Wer einen Stuhl bekommt und was auf dem Schild steht, entscheidest du. Am Freitag gehen die Pläne in die Schreinerei; gebaut wird, was du einträgst.“

### Ablauf (40 Minuten)

| Min. | Schritt |
|---|---|
| 0–3 | Auftrag lesen, `.sav` ist im Browser geladen, RStudio offen. |
| 3–10 | **Saal 1 · Lücken sichten:** `fre(pv01)`, `na_frequencies()`. Im Browser zu jeder Lückenart einen Halbsatz schreiben: Wer ist das? |
| 10–20 | **Stuhlregel:** Für jeden Missing-Code entscheiden, ob er einen Stuhl bekommt. Zu −8 und −50 je ein Satz Begründung. In R filtern und den Sitzplan eintragen. Der Browser prüft und baut den Saal. |
| 20–24 | **Saaltext** (höchstens zwei Sätze). Er muss sagen, wofür ein Stuhl steht. |
| 24–36 | **Saal 2:** `describe(dw15)` und Fallauswahl. Dann Schild und Zahl eintragen: Wie viele Stühle stehen rechts vom Durchschnitt? Der Browser baut die Reihe. |
| 36–40 | Ergebniskarte fürs Plenum. |

### R-Teil (geprüft)

```r
library(mariposa)
library(dplyr)
allbus <- read_spss(file.choose())

# Saal 1: Welche Lücken gibt es?
allbus %>% fre(pv01) %>% summary()
na_frequencies(allbus$pv01)

# Stuhlregel, hier Beispiel: Unentschlossene bekommen Stühle,
# Nicht-Wahlberechtigte, Datenfehler, keine Angabe und Verweigerung nicht
saal <- allbus %>%
  mutate(wahl = untag_na(pv01)) %>%        # Missing-Codes zurückholen
  filter(wahl != -50, wahl != -42, wahl != -9, wahl != -7)
saal %>% fre(wahl) %>% summary()           # Valid % = Stühle

# Saal 2: Wer wurde überhaupt gefragt?
na_frequencies(allbus$dw15)
allbus %>% describe(dw15)
allbus %>% filter(dw15 > 37.89) %>% nrow()     # rechts vom Durchschnitt
allbus %>% filter(work == 1) %>% describe(dw15) # nur Vollzeit
```

**Echte Ergebnisse, Saal 1:** 24,1 % der Befragten fehlen: 603 „weiß nicht“ (11,5 %), 306 „verweigert“ (5,8 %), 186 nicht wahlberechtigt, 149 ohne Angabe und 18 Datenfehler. Je nach Regel sieht der Saal so aus (größte Reste):

| Regel (Basis) | CDU/CSU | SPD | Grüne | AfD | FDP | Linke | weiß nicht | verweigert | nicht wahlber. |
|---|---|---|---|---|---|---|---|---|---|
| nur klare Antworten (3.984) | 25 | 20 | 19 | 12 | 8 | 6 | – | – | – |
| + weiß nicht (4.587) | 22 | 17 | 16 | 10 | 7 | 6 | **13** | – | – |
| alle Befragten (5.246) | 19 | 15 | 14 | 9 | 6 | 5 | 11 | 6 | 4 |

Mit „weiß nicht“ sind die Unentschlossenen der viertgrößte Block, vor AfD, FDP und Linke. Mit Rohprozenten verteilen die acht gültigen Kategorien nur 75 Stühle, normal gerundete gültige Prozente ergeben 101. Der Kopf von `fre(pv01)` zeigt `mean = 16.14`, einen Mittelwert aus Parteicodes.

**Echte Ergebnisse, Saal 2:** Gefragt wurden nur Voll- und Teilzeitbeschäftigte; 2.263-mal steht −10 „TNZ: Filter“ (Nicht-Erwerbstätige, nebenher Beschäftigte). Unter den 2.945 Gültigen: Mittel 37,9 Stunden, Median 40 (Q1 35, Q3 41,5, SD 9,9, Schiefe −0,25). 1.950 Personen, also **66,2 %, arbeiten mehr als der Durchschnitt**. Nur Vollzeit: Mittel 41,7, Median 40, Schiefe +0,97, die Richtung der Schiefe dreht sich. Zählen Nicht-Erwerbstätige mit 0 Stunden, sinkt das Mittel auf 21,4 und der Median auf 25 (n = 5.208; `rec(untag_na(dw15), rules = "-10=0; -9=NA; -41=NA; else=copy")`).

### Was der Browser prüft

- **Sitzplan:** Eingetragen werden die Stuhlregel (je Code „Stuhl ja/nein“) und die Stühle pro Kategorie. Der Browser zählt die Codes aus der `.sav`, verteilt 100 Stühle nach größten Resten und vergleicht mit ±1 Toleranz. Er prüft alle 32 möglichen Regeln darauf, welche zu den Zahlen passt:
  - „Deine Zahlen passen zu ‚alle Befragten‘, angekreuzt hast du ‚ohne Verweigerung‘. Hast du vor `fre()` gefiltert?“
  - Bei rund 75 Stühlen: „Du hast Rohprozente abgelesen. 24 Stühle fehlen – wo sitzen diese Menschen?“
  - Bei 101 Stühlen: „Einer muss aufstehen. Nach größten Resten wäre es die Linke (6,53 %). Parlamente streiten über solche Verfahren.“
- **Schild:** Eingetragen werden Zahl, Maß, Fallauswahl und die Stühle rechts vom Durchschnitt. Der Browser rechnet für vier Fallauswahlen Mittel, Median, Quartile (Typ 7, wie `describe()`) und den Anteil über dem Mittel und benennt die Zahl: „40 ist der Median aller Voll- und Teilzeitbeschäftigten.“
- **Überraschung:** Der Saal erscheint als 10×10-Raster, die grauen „weiß nicht“-Stühle als großer Block. Die Stuhlreihe markiert Q1, Median und Q3 (Stuhl 25, 50, 75): ein Boxplot von oben. Die Stühle 47 bis 72 zeigen alle genau 40 Stunden, das Durchschnittsschild hängt zwischen Stuhl 33 und 34. Denkfrage: Die Boxplot-Regel macht 357 Personen unter 25,25 Stunden zu „Ausreißern“ – sind sie das?
- **Nötige TypeScript-Rechnung:** Zählung der Rohcodes mit Missing-Codes (Reader vorhanden), Verteilung nach größten Resten (etwa 20 Zeilen), Regel-Diagnose über 32 Teilmengen, univariate Kennwerte mit Filter auf eine zweite Variable und Option −10 → 0, zwei SVG-Ansichten; Ergebniskarte und Codegenerator als vorhandene Bausteine.

### Gestufte Hilfen

| Stufe | Saal 1 | Saal 2 |
|---|---|---|
| 1 Denkanstoß | „`fre()` hat zwei Prozentspalten. Welche verteilt 100 Stühle nur auf gültige Antworten? Lücken sind nicht weg, sie tragen einen Code.“ | „Wer bekam die Stundenfrage gar nicht? Wo steht in der Reihe der Mensch in der Mitte?“ |
| 2 Verweis | Atlas: *Häufigkeiten*, *Fehlende Angaben*, *Missing-Codes aufbereiten*. R-Workshop 4.8 „Fehlende Werte deklarieren“, 4.5.2 „Fälle filtern“, 7.4.1 `frequency()` | Atlas: *Deskriptiver Überblick*, *Median*, *Schiefe*. R-Workshop 7.4.2 `describe()`, 4.5.2 |
| 3 Gerüst | `allbus %>% mutate(wahl = untag_na(___)) %>% filter(wahl != ___, ...) %>% fre(___)` | `allbus %>% filter(___ == 1) %>% describe(___)`, `allbus %>% filter(dw15 > ___) %>% nrow()` |
| 4 Lösung | Vollständiger Code für die **eigene** Regel, vom Codegenerator erzeugt | Vollständiger Code inklusive Anteil über dem Mittel |

Wer Stufe 4 nutzt, schließt den Saal trotzdem ab; die Entscheidungen bleiben die eigenen.

### Plenum, Partnervariante, allein

**Ergebniskarte:** Stuhlregel, Stühle für CDU/CSU, „weiß nicht“ und AfD, Schildzahl mit Maß und Basis, Stühle rechts vom Durchschnitt. **An der Tafel:** eine Tabelle „Regel | CDU/CSU | weiß nicht | AfD“ (zu erwarten: 19–25 und 0–13 Stühle) und ein Zahlenstrahl von 20 bis 42 Stunden. Leitfrage: „Alle haben richtig gerechnet – welche Zahl gehört an die Wand, und was ins Kleingedruckte?“ Optional stellt der Raum den Saal nach.

**Partnervariante:** A ist Kuratorin „Saal der Vielen“ (alle Befragten bekommen einen Stuhl), B Kurator „Saal der Stimmen“ (nur klare Antworten). Beide rechnen ihren Plan, gebaut wird ein Saal: Sie einigen sich und schreiben den Saaltext gemeinsam. In Saal 2 rechnet A „wie gefragt“, B „nur Vollzeit“; gemeinsam klären sie, warum sich die Schiefe umdreht. **Allein** baut man beide Pläne nacheinander und entscheidet selbst; Rückmeldung und Hilfen stehen vollständig im Browser.

### Abgedeckte Begriffe und Missverständnisse

Neu: Fehlende Angaben, Missing-Codes aufbereiten (`na_frequencies`, `untag_na`), Fälle auswählen (`filter`), Deskriptiver Überblick (`describe`). Wiederholt: Häufigkeiten, nominal gegenüber metrisch (Mittelwert aus Parteicodes), Mittel, Median, Standardabweichung, Balkendiagramm (Stuhlraster), Boxplot (Stuhlreihe), Schiefe. **Angegriffene Missverständnisse:** „Prozent steht in der Tabelle, fertig“, „Fehlende Werte sind Müll“ und „Der Durchschnitt ist die Mitte“.

### Aufwand und Risiken

**Aufwand M** (etwa 1,5–2 Tage mit Tests; Reader, Speicherung und Codegenerator gibt es schon).

Risiken:
- Parteien im Saal sind politisch sensibel; mit Gewichtung verschieben sich bis zu 2 Stühle (AfD 12 → 10 bei „nur klare Antworten“).
- `untag_na()` entfernt die Wertelabels; der Browser liefert die Legende. `mutate()` kommt im Plan erst in Sitzung 4, hier genügt eine Zeile.
- `group_by(work) %>% describe(dw15)` zeigt in 0.7.3 zusätzliche NA-Zeilen (getaggte NAs in `work`), daher `filter()`.
- Zwei Säle werden für langsame Gruppen knapp; Saal 2 kann nach Hause wandern.
- Nur 3,5 % sind nicht wahlberechtigt, vermutlich deutlich unter dem Bevölkerungsanteil (Interviews auf Deutsch; vor dem Einsatz prüfen). Gute Plenumsfrage, führt aber Richtung Sitzung 5.

## 3. Offene Fragen an den Dozenten

1. **Gewichtung in Saal 1:** ungewichtet mit einem Ausblick auf Sitzung 5 („Mit Gewicht verliert die AfD 2 Stühle – warum?“) oder `weights = wghtpew` als Vorgabe?
2. **Parteien als Saalthema:** in Ordnung? `pv01` ist mit Abstand die Variable mit den meisten „weiß nicht“ und Verweigerungen. Eine Alternative wie `vm21` (Sterbehilfe) wäre durch den Split komplizierter.
3. **Umfang:** beide Säle als Kern der 40 Minuten oder Saal 2 als Zusatz? Und ist `untag_na()` in `mutate()` vor Sitzung 4 recht?
