# Sitzung 4 · Kreuztabellen – „Belege es!“ mit R neu gedacht

Konzept, Stand 29.09.2026. Alle Zahlen: ALLBUScompact 2023 (ZA8831 v1.3.0), mariposa 0.7.3, mit `Rscript` auf der lokalen Datei gerechnet (Skripte: `konzepte/tmp-04/`, nur Aggregatausgabe). Ungewichtet, wenn nicht anders angegeben.

## 1. Drei Varianten

**A · Nenner-Check (empfohlen).** Die fiktive Pressemitteilung liefert zur Behauptung eine Zahl: „87 % der Nichtwähler sagen, Politiker kümmern sich nicht um Leute wie sie.“ Drei Prüfaufträge, jeder ein kleiner Schritt in R: (1) Zahl nachbauen: zwei Dummys mit `rec()`, dann `crosstab(percentages = "col")`; (2) Eine Zelle, drei Nenner: dieselbe Tabelle mit `"all"`; (3) Deine Lesart: Gegenprobe mit `pe05` (umpolen) und „weiß nicht“ (`untag_na()`). Der Browser rechnet nichts vor. Er erkennt aus Prozentwert und Zellenhäufigkeit, welchen Weg jemand gerechnet hat, und sagt in Worten, wer die 100 % sind. Überraschung: Die Zahl stimmt – und dieselben 127 Menschen ergeben 6,5 %. Werkbank und Live-Tabelle entfallen, der Spiegel schrumpft zum Streifen. Ergebnis fürs Plenum: ein Faktencheck-Satz mit zwei Zahlen und das Urteil.

**B · Das Umkodier-Los.** Der Raum wird zum Robustheitsspiegel. Jede Person zieht im Browser eine von zwölf Lesart-Karten (pe01/pa35/pe05 × Grenze × Nichtwahl mit/ohne „weiß nicht“) und setzt sie in R exakt um; pe05-Karten verlangen Umpolen. Sie trägt Zeilen- und Spaltenprozente ein. Der Browser prüft gegen die Karte und nennt die abweichende Regel, wenn die Zahl zu einer anderen Karte passt. Im Plenum trägt jede:r zwei Punkte in ein Tafel-Koordinatensystem ein; wer allein arbeitet, sieht danach die übrigen elf Karten im Browser. Überraschung: Die Zeilenprozente bleiben zwischen 6,5 und 24 %, die Spaltenprozente springen je nach Grenze zwischen 20 und 87 %. Sie zeigen vor allem, wie verbreitet die Zustimmung ist. Die Variante ist stark beim Umkodieren als Handwerk, aber weniger selbstwirksam, weil die Lesart zugeteilt ist. Die Werkbank entfällt ganz.

**C · Die Misstrauens-Treppe.** Schwerpunkt: Dummys und Rechnen innerhalb einer Person. Drei Misstrauens-Dummys (pe01, pa35, pe05 umgepolt). `row_sums()` zählt je Person, wie vielen der drei Aussagen sie zustimmt (0–3); diese Zahl wird mit der Nichtwahl gekreuzt (4×2-Tabelle). Der Browser prüft die vier Zeilenprozente und zeichnet daraus eine Treppe; vergessenes Umpolen erkennt er an einer gekippten Stufe. Überraschung: Die Treppe steigt (1,2 → 4,4 → 5,6 → 8,8 %), doch auch von denen, die allen drei Aussagen zustimmen, wollen 91 % wählen. Deckt fast alle neuen Begriffe ab, braucht aber eher 50 Minuten; die Prozentbasis kommt nur am Rand vor. Ergebnis fürs Plenum: der Wert der obersten Stufe.

## 2. Empfehlung: „Nenner-Check“

### 2.1 Rollenauftrag (Wortlaut)

> **Faktencheck-Redaktion „Nachgezählt“ (fiktiv) · dein Auftrag**
> Auf deinem Tisch liegt die Pressemitteilung eines Parteivorstands (fiktiv): „Wer Politikern misstraut, geht gar nicht mehr wählen. Die Zahlen sind eindeutig: 87 Prozent der Nichtwähler sagen, dass sich Politiker nicht darum kümmern, was Leute wie sie denken. (Quelle: ALLBUS 2023)“
> Die Chefredaktion will bis zur Konferenz zwei Dinge wissen: **Stimmt die Zahl? Und trägt sie die Behauptung?** Rechne in RStudio nach, rechne gegen und liefere einen Faktencheck-Satz mit zwei Zahlen und dein Urteil. Hier im Atlas trägst du deine Ergebnisse ein und bekommst Rückmeldung.

### 2.2 Ablauf (40 Minuten)

| Min. | Schritt | Inhalt |
|---|---|---|
| 0–3 | Auftrag | Lesen; ein freier Satz „Die 87 % beziehen sich auf alle, die …“ (ungeprüft, erscheint später auf der Karte) |
| 3–15 | **P1 · Zahl nachbauen** | zwei Dummys, Spaltenprozente; eintragen: Prozentwert und Zellen-n |
| 15–21 | **P2 · Eine Zelle, drei Nenner** | `percentages = "all"`; eintragen: Zeilenprozent der Misstrauenden und der Übrigen, Zellenprozent; danach das Nenner-Bild |
| 21–33 | **P3 · Deine Lesart** | Item (pe01, pa35, Gegenprobe pe05), Grenze, „weiß nicht“ selbst festlegen, mindestens eine Entscheidung anders als der Parteivorstand; eintragen: beide Zeilenprozente, Zellen-n; danach Wegkürzel und Streifen |
| 33–40 | Urteil und Satz | fünf Stufen mit Begründung; „Von denen, die …, wollen … % nicht wählen, von den übrigen … %.“; höchstens drei Gegenfragen; Karte |

### 2.3 R-Teil (geprüft)

```r
library(dplyr)
library(mariposa)   # zuletzt laden, sonst überdeckt haven::read_spss() die mariposa-Funktion

allbus <- read_spss("ZA8831_v1-3-0.sav")

# P1 · Zahl nachbauen: zwei Dummyvariablen (Kategorien zusammenfassen)
allbus <- allbus %>%
  mutate(
    misstrauen = rec(pe01, rules = "1:2=1 [misstraut]; 3:4=0 [misstraut nicht]; else=NA"),
    nichtwahl  = rec(pv01, rules = "91=1 [würde nicht wählen]; 1:90=0 [würde wählen]; else=NA")
  )
allbus %>% crosstab(misstrauen, nichtwahl, percentages = "col") %>% summary()

# P2 · Eine Zelle, drei Nenner
allbus %>% crosstab(misstrauen, nichtwahl, percentages = "all") %>% summary()
allbus %>% chi_square(misstrauen, nichtwahl)   # Wiederholung, freiwillig

# P3 · Beispiel-Lesart: Gegenprobe pe05 (umpolen), „weiß nicht“ zählt als Nichtwahl
allbus <- allbus %>%
  mutate(
    pe05_r      = rec(pe05, rules = "rev"),   # jetzt 1 = stimme gar nicht zu, wie bei pe01: 1 = Misstrauen
    misstrauen3 = rec(pe05_r, rules = "1:2=1 [misstraut]; 3:4=0 [misstraut nicht]; else=NA"),
    nichtwahl3  = rec(untag_na(pv01),
                      rules = "91=1 [würde nicht wählen]; -8=1; 1:90=0 [würde wählen]; else=NA")
  )
allbus %>% crosstab(misstrauen3, nichtwahl3, percentages = "row") %>% summary()
```

Echte Ergebnisse (N = 2.785; −50 „nicht wahlberechtigt“ fällt über `else=NA` heraus):
- **P1:** 87,0 % (127 von 146 Nichtwählenden), gewichtet 86,5 %. Von den Wählenden stimmen ebenfalls 69,3 % zu, von allen 70,2 %.
- **P2:** 6,5 % (127 von 1.956 Misstrauenden) gegenüber 2,3 % (19 von 829); Zellenprozent 4,6 % (127 von 2.785). χ²(1) = 20,7, p < .001, V = .086.
- **P3:** Beispiel 21,5 % (386 von 1.794) gegenüber 11,7 %. In allen 18 vorbereiteten Lesarten (3 Items × 2 Grenzen × Nichtwahl {91; +weiß nicht; +verweigert}) liegen die Misstrauenden höher (6,5–29,2 % gegenüber 2,3–20,3 %), in keiner über 50 % (gewichtet höchstens 31,3 %). pe01, pa35 und pe05 stammen aus demselben Split (3.650 Befragte, 69,6 %).
- **Stolperwege:** pe05 ohne Umpolen ergibt 3,2 % gegenüber 6,9 % – die Richtung kippt. `else=0` nach `untag_na()` zählt Nicht-Wahlberechtigte als Wählende: 19,8 % statt 23,0 %.

### 2.4 Was der Browser prüft

**Eingabe:** die Prozentwerte, wie R sie zeigt, dazu die Häufigkeit derselben Zelle (Komma oder Punkt egal). **Toleranz:** ±0,1 Punkte, bei ganzzahliger Eingabe ±0,55; n exakt, bei gewichteten Tabellen ±1 (mariposa rundet gewichtete Häufigkeiten).

**Rückwärtssuche statt Werkbank:** Beim Laden rechnet der Browser alle Zweiteilungen von pe01, pa35 und pe05 (58) × alle Nichtwahl-Definitionen (91 plus jede Teilmenge von −8/−7/−9, jeweils auch mit dem Stolperweg `else=0`) × gewichtet/ungewichtet. Das sind 1.856 Vierfeldertafeln mit je zwölf Prozentwerten, 11.136 verschiedene Bedeutungen. Laut R-Probe sind 91,5 % der Paare aus Prozentwert und n eindeutig; sonst fragt der Browser nach oder nennt bis zu drei Kandidaten. Die Rückmeldung ist ein Bedeutungssatz, egal wie die Tabelle gedreht ist: „Deine 87,0 % sind der Anteil der Misstrauenden (pe01 1–2) unter den 146 Nichtwählenden – genau so hat der Parteivorstand gerechnet.“ Bei gedrehter Tabelle kommt dazu: „Bei dir heißen sie Zeilenprozente; entscheidend ist, wer die 100 % sind.“

**Vier Fälle:** (1) *erwartet*: bestätigt. (2) *Vertretbar anders* (gewichtet 86,5 %; jede der 18 Lesarten): angenommen, die Entscheidungen werden benannt, dazu ein Wegkürzel wie `pe05↺ 1–2 · 91+wn`. (3) *Stolperweg*: gezielte Rückfrage – Gegenzelle 93,5 % („das sind die Wählenden“), Nenner vertauscht, Zellenprozent 4,6 % („Anteil an allen 2.785“), pe05 nicht umgepolt („Bei dir wählen Misstrauende seltener – lies pe05 noch einmal“), `else=0` („186 Nicht-Wahlberechtigte zählen bei dir als Wählende“). (4) *Nicht gefunden*: Checkliste und Hilfeleiter. Der Knopf „Das wollte ich anders“ öffnet typische Ursachen (z. B. `untag_na()` vergessen: `rec()` lässt getaggte NAs stehen).

**Nenner-Bild (nach P2):** Drei Balken, so lang wie ihr Nenner (146, 1.956, 2.785); in allen ist dasselbe Segment mit 127 Menschen eingefärbt. **Streifen (nach P3):** die 18 Lesarten auf einer Skala von 0 bis 100 %, die 50-%-Linie, der eigene Punkt und die 87 % als Fähnchen „anderer Nenner“.

**Überraschungen:** Der Faktencheck beginnt mit einer Bestätigung; dann dieselben 127 Menschen mit drei Nennern; wer die pe01-Regel für pe05 kopiert, sieht die Richtung kippen.

**Gegenfragen** (höchstens drei, bestehende Regeln): „weiß nicht“, Kausalsprache, Fallzahl (146), Absicht ≠ Verhalten.

### 2.5 Gestufte Hilfe (ohne Bewertung)

| Stufe | P1 | P3 |
|---|---|---|
| 1 Denkanstoß | „Zwei Merkmale mit je zwei Ausprägungen: Du brauchst zwei Variablen mit 0 und 1. Wer ist in der Pressemitteilung 100 %?“ | „Wer pe05 zustimmt, vertraut – oder misstraut?“ · „−8 ist ein getaggtes NA; `rec()` sieht es nicht.“ |
| 2 Verweis | Atlas `recode`, `dummy`, `crosstab`; R-Workshop Kap. 5 und 7 | Atlas `recode`, `missing_tools`; R-Workshop Kap. 4 |
| 3 Gerüst | `rec(pe01, rules = "___=1 [misstraut]; ___=0 [misstraut nicht]; else=NA")`, dasselbe für pv01; `percentages = "___"` | `rec(pe05, rules = "___")`; `rec(untag_na(pv01), rules = "91=1; ___=1; 1:90=0; else=NA")` |
| 4 Lösung | Code aus 2.3; gilt als bearbeitet | Code der eigenen Lesart (`rcode.ts`) |

P2: Stufe 3 genügt (`percentages = "___"`).

### 2.6 Plenum, Partnervariante, allein

**Plenum:** An der Tafel steht eine Skala von 0 bis 100 %. Jede Person oder jedes Paar klebt zwei verbundene Punkte (Misstrauende, Übrige) mit Wegkürzel und Urteil auf; oben hängt das Fähnchen „87 %“. Die Punkte streuen zwischen etwa 6 und 30 %, alle Linien steigen zu den Misstrauenden hin an, keine kommt in die Nähe von 50 %. Impulse: Ist „weiß nicht“ Nichtwahl? Wer hat die Richtung kippen sehen? „Falsch“ oder „irreführend“? Den Zusammenhang gibt es (je nach Lesart Faktor 1,4 bis 2,8), „gar nicht mehr“ trägt nicht.

**Partner:** A, die *Nachrechnerin*, übernimmt P1, B, der *Gegenrechner*, P2. Beim Vergleich zeigt sich dasselbe Zellen-n 127. In P3 unterscheiden sich die beiden Lesarten in mindestens einer Entscheidung; am Ende stehen ein gemeinsamer Satz und ein Urteil oder ein festgehaltener Dissens. **Allein:** P1 bis P3 nacheinander. Der Streifen ersetzt die zweite Lesart, die Gegenfragen ersetzen das Gespräch; jede Zahl bekommt eine Rückmeldung, die Hilfeleiter reicht bis zur Lösung. **Zusatz für Schnelle:** der Misstrauens-Zähler aus C (`row_sums()`); geprüft wird die oberste Stufe (8,8 %).

### 2.7 Begriffe und Missverständnis

Abgedeckt: Kreuztabelle, alle drei Prozentbasen, Rekodieren, Umpolen, Dummys, `untag_na`; wiederholt: AV/UV, Kausalität, Stichprobe, Chi². „Rechnen innerhalb einer Person“ nur im Zusatz. **Angegriffen wird die Verwechslung der Bedingungsrichtung:** Der Anteil der Misstrauenden unter den Nichtwählenden gilt als Anteil der Nichtwählenden unter den Misstrauenden. Nebenbei: „Zeilenprozente sind immer richtig“, „Umkodieren ist bloße Technik“.

### 2.8 Bestehender Code

- **Entfällt:** Zerlegen, die Werkbank (`Workbench`, `LiveTable`, Variablensuche, Gewichtungsschalter), Spiegel-Gewichtsbalken, acht der elf Gegenfragen. Bekommen auch die Sitzungen 3 und 5 neue Formate, fallen diese Dateien und die Behauptungen jugend/osten ganz weg.
- **Unverändert:** `readSav.ts`, `allbus.ts`, `DataDrop`, `format.ts`, `Verdict`, `Questions`, das Speichermuster in `state.ts`.
- **Erweitert:** `analysis.ts` (Zellenprozent, Modus für `else=0`), `claims.ts` (Item pe05), `multiverse.ts` (18 Lesarten), `questions.ts`, `rcode.ts` (Gerüst, Lösung).
- **Neu:** `lookup.ts` (Rückwärtssuche; Tests gegen ein R-Raster wie `verify-sandbox-r.R`), Eingabekarte, Nenner-Bild, Streifen, Hilfeleiter (gemeinsam mit den anderen Sitzungen).

### 2.9 Aufwand und Risiken

**Aufwand M** (etwa 2–3 Tage mit Tests). **Risiken:**
- P1 ist für Anfänger:innen knapp. Gegenmittel: `rec()` im Input einmal vorführen, das Gerüst früh freigeben.
- Wird **haven nach mariposa geladen**, überdeckt `haven::read_spss()` die mariposa-Funktion; die fehlenden Werte sind dann weg (beim Prüfen selbst passiert). Der Hinweis steht deshalb in Checkliste und Kommentar.
- Etwa 8 % der Zahlpaare sind mehrdeutig; dann fragt der Browser nach.
- Die Streuung im Raum kann klein bleiben. Dann verteilt der Dozent Lesarten (Karten aus Variante B).
- Wer die Lösung abtippt, bekommt auch eine Bestätigung. Das ist gewollt, denn es gibt keine Bewertung.

## 3. Offene Fragen an den Dozenten

1. Darf die Pressemitteilung zusätzlich zur Behauptung die konkrete Zahl „87 %“ nennen? Der ganze Aufbau hängt daran.
2. Soll die Gegenprobe mit pe05 in P3 Pflicht sein (dann kommt Umpolen sicher bei allen vor) oder ein Angebot neben pe01/pa35?
3. Sollen Werkbank, Live-Tabelle, Zerlegen und Variablensuche endgültig aus dem Code verschwinden, wenn auch die Sitzungen 3 und 5 neue Formate bekommen?
