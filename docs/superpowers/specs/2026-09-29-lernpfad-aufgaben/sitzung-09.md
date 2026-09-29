# Sitzung 9 · Regression vertiefen – Aufgabenkonzepte

Datenbasis aller Zahlen: ALLBUScompact 2023 (ZA8831 v1.3.0), gewichtet mit `wghtpew`, gerechnet mit mariposa 0.7.3 (`Rscript`). AV durchgehend `ps03` Demokratiezufriedenheit (Split, 1 = sehr zufrieden … 6 = sehr unzufrieden; positiver Koeffizient = unzufriedener). Nur aggregierte Werte.

## 1 · Drei Konzepte

### A · „Mitgenommen“: Datenrecherche für einen Dokumentarfilm (Empfehlung)

**Rolle:** Rechercheur:in einer fiktiven Doku-Redaktion. **Kernidee:** Menschen, die umgezogen sind, als natürliches Quasi-Experiment. `dg03` teilt die Befragten in vier Gruppen: im Osten oder Westen aufgewachsen × heute im Osten oder Westen wohnend. In der Redaktion streiten zwei Lager: „Prägung“ (man nimmt die Stimmung mit) und „Ort“ (man übernimmt die Stimmung der neuen Nachbarn). Die Studierenden bauen Dummies und wählen die Referenzgruppe selbst. Sie prüfen, wer umzieht (Selektion), und entscheiden, welche Kontrollen gemeinsame Ursachen sind und welche Folgen des Umzugs. Am Ende schreiben sie den **Off-Text-Satz**, den die Sprecherin sagen darf. **Überraschung:** Keine der beiden Hypothesen passt. Beide Umzugsgruppen ähneln den West-Bleibenden (+0,17 und +0,03, die Ost-Bleibenden liegen bei +0,71). Kontrolliert man Bildung, verfünffacht sich der West→Ost-Wert. **Im Plenum:** Die Koeffizienten unterscheiden sich je nach Referenz, die Vorhersagen nicht.

### B · „Die Schrumpfprobe“: Red Team vor der Veröffentlichung

**Rolle:** Red Team eines fiktiven Umfrageinstituts. Das Institut will den Befund „Ostdeutsche sind unzufriedener mit der Demokratie“ veröffentlichen (+0,62 Skalenpunkte). **Auftrag:** Den Befund mit höchstens drei Kontrollvariablen zu Fall bringen. Für jede Variable braucht es einen Satz, warum sie eine gemeinsame Ursache ist. **Echte Zahlen:** Alter, Geschlecht, Abitur und Äquivalenzeinkommen lassen die Lücke stehen (0,62 → 0,63). Mit der eigenen Wirtschaftslage sind es 0,615, mit der Wirtschaftslage Deutschlands 0,55. Nur Einstellungen drücken die Lücke: Vertrauen in den Bundestag 0,42, Regierungszufriedenheit 0,36 (R² 0,41). **Im Plenum:** eine Schrumpf-Rangliste, dann die Umkehr. Die „Sieger:innen“ haben meist Folgen oder Fast-Doubletten der AV kontrolliert (Bundestag + Regierung: VIF 2,7). **Ergebnis:** Rest-Koeffizient + Urteil „Befund hält / hält nicht“. **Risiko:** Die Mechanik („Zahl durch Drittvariablen bewegen“) liegt nah am Spin-Doktor aus Sitzung 5.

### C · „Eine Tabelle, vier Wahrheiten“: Statistik-Dolmetscherdienst

**Rolle:** Dolmetscher:in, die eine Regressionstabelle für eine fiktive Bürgerzeitung übersetzt. **Kernidee:** Der Raum rechnet dasselbe Modell (`ps03 ~ ost * age + abi`) in verteilten Codierungen: Ost oder West als Referenz, `eastwest` roh (1/2), Alter roh oder mit `center()` zentriert. Die Tabellen widersprechen sich scheinbar. Mit rohem Alter ist der Ost-Koeffizient 0,11 und „nicht signifikant“ (p = 0,53; VIF 9,9), zentriert 0,60 (p < 0,001; VIF 1,0). Trotzdem finden alle für dieselbe Persona (60 Jahre, Ost, ohne Abitur) denselben Vorhersagewert, 3,60. Dazu kommt ein Satz in Bürgersprache, etwa: Im Westen sind Ältere zufriedener (−0,011 pro Jahr), im Osten nicht. **Ergebnis:** Vorhersagewert + Satz. **Missverständnis:** „Ein Koeffizient ist eine feste Eigenschaft der Welt.“

*Den Entwurf „Gutachten mit Fehlern reparieren“ habe ich bewusst nicht übernommen. Eingebaute Fehler zu finden läuft auf eine versteckte Checkliste mit einer richtigen Lösung hinaus. Die Studierenden entscheiden dabei wenig selbst.*

## 2 · Ausgearbeitet: „Mitgenommen“

### Rollenauftrag (so lesen ihn die Studierenden)

> **Neuer Job: Datenrecherche für einen Dokumentarfilm**
> Die Doku-Redaktion „Zwischenhalt“ (fiktiv) dreht einen Film mit dem Arbeitstitel „Mitgenommen“. Er handelt von Menschen, die zwischen Ost- und Westdeutschland umgezogen sind. Redakteurin Mara Lindqvist (fiktiv) schreibt dir:
> „Dass Ostdeutsche im Schnitt unzufriedener mit der Demokratie sind, wissen alle. Uns interessiert: Was nehmen Menschen mit, wenn sie umziehen? In der Redaktion gibt es zwei Lager. Die einen sagen: Es ist die Prägung. Wer im Osten aufwuchs, bleibt unzufriedener, egal wo er heute lebt. Die anderen sagen: Es ist der Ort. Wer in den Osten zieht, wird so unzufrieden wie die neuen Nachbarn. Am Ende des Films sagt unsere Sprecherin einen Satz dazu. Du schreibst ihn. Er muss stimmen und darf nicht mehr behaupten, als die Daten tragen. Der Film läuft im Fernsehen.“
> **Du lieferst:** einen Off-Text-Satz (höchstens 30 Wörter) und eine Schnittplan-Karte mit deinen Zahlen.

### Ablauf (40 Minuten)

| Min. | Schritt | R |
|---|---|---|
| 0–5 | Auftrag lesen, die Lager in Vergleiche übersetzen: „Welche Gruppe entscheidet den Streit?“ (ein Satz). Die Schablone zeigt, wie die vier Gruppen unter „Prägung“ und unter „Ort“ aussehen müssten. | – |
| 5–10 | Wie viele Umgezogene tragen den Film? Zahl eintragen. | `frequency()` |
| 10–20 | Referenzgruppe wählen und begründen („Mit wem vergleicht der Film?“), Modell rechnen, Konstante und drei B eintragen. | `to_dummy()`, `linear_regression()` |
| 20–28 | Wer zieht um? Kontrollkarten sortieren („stand vor dem Umzug fest“ / „kann Folge des Umzugs sein“), Modell mit Kontrollen rechnen, eintragen. | `rec()`, `crosstab()`, `linear_regression()` |
| 28–36 | Off-Text schreiben, Gegenfragen und Wackeltest lesen, überarbeiten. | – |
| 36–40 | Schnittplan-Karte fertigstellen. | – |

Profi-Schritt für Schnelle oder zu Hause: dieselbe Frage als Interaktion.

### R-Teil (verifiziert)

```r
library(mariposa)
library(dplyr)
allbus <- read_spss("ZA8831_v1-3-0.sav")

allbus %>% frequency(dg03, weights = wghtpew) %>% summary()

# Vier Dummies – die weggelassene Gruppe ist die Referenz
allbus <- allbus %>% to_dummy(dg03)
allbus %>%
  linear_regression(ps03 ~ dg03_1 + dg03_2 + dg03_3, weights = wghtpew) %>%  # Referenz: dg03_4
  summary()

allbus <- allbus %>%
  mutate(
    abi  = rec(educ, rules = "1:3=0 [kein Abitur]; 4:5=1 [(Fach-)Abitur]; else=NA"),
    frau = rec(sex, rules = "1=0 [Mann]; 2=1 [Frau]; else=NA")
  )
allbus %>% crosstab(dg03, abi, percentages = "row", weights = wghtpew) %>% summary()

allbus %>%
  linear_regression(ps03 ~ dg03_1 + dg03_2 + dg03_3 + age + abi + frau, weights = wghtpew) %>%
  summary()

# Profi: Interaktion
allbus <- allbus %>%
  mutate(
    ost       = rec(eastwest, rules = "1=0 [West]; 2=1 [Ost]"),
    ostjugend = rec(dg03, rules = "1:2=1 [Jugend Ost]; 3:4=0 [Jugend West]")
  )
allbus %>% linear_regression(ps03 ~ ost + ostjugend, weights = wghtpew) %>% summary()
allbus %>% linear_regression(ps03 ~ ost * ostjugend, weights = wghtpew) %>% summary()
```

**Echte Ergebnisse** (n = ungewichtete Fälle mit `ps03`):

| Gruppe | Referenz West-Bleibende | Referenz Ost-Bleibende | vorhergesagt (invariant) | + Alter, Abitur, Frau (Ref. West) |
|---|---|---|---|---|
| Konstante | 2,76 | 3,46 | – | 3,57 |
| Ost-Bleibende (n = 1.003) | +0,71 [0,59; 0,82] | Referenz | 3,46 | +0,69 |
| Ost→West (n = 91) | +0,17 [−0,07; 0,40] | −0,54 | 2,92 | +0,17 |
| West→Ost (n = 97) | +0,03 [−0,32; 0,39] | −0,67 | 2,79 | +0,155 [−0,19; 0,50] |
| West-Bleibende (n = 2.063) | Referenz | −0,71 | 2,76 | Referenz |
| R² | 0,041 | 0,041 | | 0,094 (Abitur −0,57; Alter −0,010/Jahr) |

- `dg03` gewichtet: 762 / 170 / 67 / 3.698. West→Ost umfasst ungewichtet 128 Personen und zählt wegen der Ost-Überquote gewichtet nur etwa halb. Mit Referenz West→Ost: Ost→West +0,13.
- Abitur-Anteil: 40,5 / 44,1 / **78,0** (West→Ost) / 50,0 %. Das ist die Selektion.
- Kontrollen, die Folgen sein können (zusätzlich zu Alter, Abitur, Frau; Ost-Bleibende / Ost→West / West→Ost): Einkommen heute (`di08c`) 0,69 / 0,18 / 0,18; eigene Wirtschaftslage (`ep03`) 0,645 / 0,19 / 0,15; Vertrauen Bundestag (`pt03`) **0,49** / 0,10 / 0,19.
- Fehler `dg03` als Zahl: B = −0,22. Ungewichtet: 0,708 / 0,166 / 0,037.
- Profi: `ost + ostjugend` ergibt 0,36 / 0,32 bei VIF 3,3 (r = 0,87; 94 % deckungsgleich). `ost * ostjugend` ergibt 0,03 / 0,17 / Interaktion **0,51** (p = 0,023), VIF bis 13,6; mit R² 0,041 dasselbe Modell wie die vier Gruppen.

### Was der Browser prüft

- **Rechenkern (neu, TypeScript, ca. 200 Zeilen):** gewichtete OLS über Normalgleichungen (k ≤ 8), listwise, Missing-Codes als NA; Standardfehler mit Frequenzgewicht-df wie mariposa; t-Quantil, KI, R², Gruppenvorhersagen, DFBETA. Tests gegen die R-Werte oben.
- **Variantenabgleich:** Im Hintergrund laufen rund 40 Varianten (4 Referenzen × gewichtet/ungewichtet × 5 Kontrollsätze, dazu `dg03` als Zahl und `eastwest` allein). Der Browser ordnet die Eingaben einer Variante zu (±0,01):
  - Treffer: „Stimmt. 2,76 ist die mittlere Unzufriedenheit deiner Referenzgruppe, der West-Bleibenden.“
  - Ungewichtet: „Warum ändert das Gewicht die Koeffizienten kaum, die Unsicherheit bei West→Ost aber deutlich?“
  - `dg03` als Zahl: „Eine Zahl für vier Gruppen behandelt sie wie eine Skala von 1 bis 4.“
  - Alle vier Dummies: Hinweis auf die Dummyfalle.
- **Schablone (Überraschungsmoment):** Vier Balken mit KI aus den eigenen Zahlen, darüber „Prägung“ und „Ort“ als Geisterlinien. Keines passt: „Prägung“ verlangt für Ost→West etwa +0,7 (KI endet bei 0,40), „Ort“ für West→Ost etwa +0,7 (KI endet bei 0,39). Die Lücke sitzt bei denen, die im Osten aufwuchsen *und* blieben. Das Bild ist bei jeder Referenzwahl dasselbe.
- **Kontrollkarten:** Alter, Geschlecht, Abitur, Einkommen heute, eigene Wirtschaftslage, Vertrauen Bundestag. Der Browser rechnet die gewählte Kombination. Zweite Überraschung: Kontrolle kann einen Abstand vergrößern (West→Ost 0,03 → 0,155).
- **Wackeltest (Einfluss):** ohne die 5 Fälle, die den Wert am stärksten nach oben bzw. unten ziehen. Ost→West schwankt zwischen −0,02 und 0,26, West→Ost zwischen −0,12 und 0,13; beide bleiben weit unter 0,7.
- **Off-Text-Gegenfragen** (Regelwerk aus „Belege es!“), als Denkanstöße ohne Bewertung: Kausalwörter (macht, prägt, weil) → Selektion („78 % Abitur“); Pauschalwörter → n = 91/97; nur eine Richtung → „Und die andere Gruppe?“; Folge kontrolliert → Wert ohne sie; keine Unsicherheit → Wackeltest-Spanne.

### Gestufte Hilfen (Beispiel Modellschritt)

1. **Denkanstoß:** „Vier Gruppen: Wie viele 0/1-Variablen brauchst du, damit jede Gruppe erkennbar ist? Woran erkennt man die Gruppe, bei der alle null sind?“
2. **Verweis:** Begriffskarten „Dummyvariablen“ und „Multikollinearität“ (Dummyfalle); R-Workshop https://rloesung.github.io/RWorkshop/ (Regression).
3. **Gerüst:** `allbus <- allbus %>% to_dummy(___)` und dann `allbus %>% linear_regression(ps03 ~ ___ + ___ + ___, weights = ___) %>% summary()`
4. **Vollständiger Code** wie oben, mit Kommentar, welche Gruppe weggelassen ist. Die Aufgabe zählt trotzdem als bearbeitet.

Für den Kontrollschritt analog; Denkanstoß: „Was stand fest, bevor jemand umzog?“

### Plenum, Partnervariante, allein

- **Schnittplan-Karte:** Referenzgruppe · Koeffizient Ost→West · vorhergesagter Wert Ost→West · was kontrolliert wurde und was bewusst nicht · Off-Text.
- **Tafel:**
  1. Die Koeffizienten streuen (+0,17 / −0,54 / +0,13 / „Referenz“), die Vorhersage nicht (2,92). „Wer hat recht?“
  2. Wer Vertrauen konstant hielt, drückt die Ost-Lücke auf 0,49. Legitim?
  3. Off-Texte nach Stärke ordnen; der Raum entscheidet, welcher gesendet wird.
- **Partner:** „Schnittplatz Ost“ (Referenz Ost-Bleibende) und „Schnittplatz West“ (Referenz West-Bleibende) gleichen ihre Vorhersagen ab; sie müssen übereinstimmen. Danach prüft A Selektion und Kontrollen, B die Gegenprobe mit `pt03` (−0,49 / −0,25 / +0,30; ähnliches Muster). Den Off-Text schreiben beide gemeinsam.
- **Allein:** Beide Referenzen nacheinander rechnen (nur die Formel ändern). Danach zeigt der Browser die „Tafel der anderen Schnittplätze“ mit allen vier Referenztabellen. Auftrag, Hilfen und Gegenfragen tragen ohne Dozent.

### Begriffe und Missverständnisse

- **Abgedeckt:** Dummyvariablen (Kern: Referenzkategorie) · Confounding/gemeinsame Ursachen (Selektion; Ursache oder Folge?) · Interaktion (Herkunft × Wohnort; Profi-Modell) · Multikollinearität (Dummyfalle; `ost`/`ostjugend` mit VIF 3,3; nur 188 Umgezogene tragen die Information) · Ausreißer & Einfluss (Wackeltest).
- **Angegriffene Missverständnisse:** „Ein Koeffizient ist der Wert einer Gruppe“ (er ist der Abstand zur Referenz). „Mehr Kontrollen bringen einen näher an die Wahrheit“ (wer Folgen herausrechnet, nimmt weg, was er messen will). „Kontrolle macht Effekte kleiner.“
- **Abgrenzung:** keine versiegelte Vorhersage (Sitzung 6), die Hypothesen kommen von der Redaktion; kein Drehen auf ein Wunschergebnis (Sitzung 5).

### Aufwand und Risiken

**Aufwand M:** OLS-Kern mit DFBETA (S–M), Variantenabgleich (S), Schablone, Karten, Regeln, R-Generator (M, vieles aus „Belege es!“ wiederverwendbar).

**Risiken:**
- Kleine Gruppen (91/97): genau der Lerngegenstand, kann aber frustrieren.
- Ost→West mischt Übersiedlung vor 1989 mit Umzügen danach; die Berlin-Zuordnung der Jugend ist im compact-Codebuch nicht dokumentiert.
- Vorzeichen: `ps03` beginnt bei 1 = sehr zufrieden.
- `to_dummy()` zweimal mit verschiedenem `ref` erzeugt Namenskonflikte (`dg03_2...581`). Deshalb einmal alle vier Dummies anlegen; Referenz ist die weggelassene.
- **mariposa-Fehler:** Bei der Dummyfalle zeigt `summary()` negative Riesen-VIF (etwa −3·10¹³), weil `.lm_collinearity()` die ausgeschlossene Spalte mitrechnet (auch im Quelltext 0.7.4). Vor dem Einsatz beheben oder im Browser abfangen.

## 3 · Offene Fragen

1. Bei `ps03` bleiben (Split, 91/97 Umgezogene, politisch) oder eine Nicht-Split-AV mit mehr Fällen nehmen? Bei `ls01` sieht das Muster anders aus: Dort ähneln die Ost→West-Umgezogenen den Ost-Bleibenden.
2. Referenzgruppen im Raum zuteilen (z. B. nach Sitzreihe), damit die Streuung an der Tafel sicher entsteht, oder frei wählen lassen?
3. Einfluss nur als Wackeltest im Browser zeigen, oder soll mariposa eine Einflussdiagnose bekommen (und den VIF-Fehler bei der Dummyfalle behoben)?
