# Sitzung 10 · Logistische Regression – Aufgabenkonzept

Alle Zahlen: ALLBUScompact 2023, v1.3.0, mariposa 0.7.3, gewichtet mit `wghtpew`, geprüft per `Rscript` auf der lokalen Datei. Es sind nur aggregierte Werte angegeben. Die Hilfsskripte liegen in `konzepte/tmp-10/` (`loesung.R`, `varianten.R`, `k2k3.R`) und enthalten keine Daten.

---

## 1. Drei Konzepte als Kurzskizze

### K1 · Dolmetschen für den Bürgerrat *(Empfehlung)*
**Rolle:** Statistik-Dolmetscher:in eines fiktiven, per Los besetzten Bürgerrats zur Wahlbeteiligung.
**Kernidee:** Ein Sachverständiger hat dem Rat nur „Pflichtgefühl: Exp(B) = 3,77“ hinterlassen. Zwei Ratsmitglieder mit sehr unterschiedlicher Ausgangslage fragen: „Was heißt das für jemanden wie mich?“ Die Studierenden rechnen das Modell nach und übersetzen dieselbe Zahl in drei Sprachen: Logit, Chance und Wahrscheinlichkeit. Dabei stoßen sie auf den Kern der logistischen Regression. In Chancen wirkt der Prädiktor bei beiden Personen gleich (×3,77), in Prozentpunkten bei der einen fünfeinhalbmal so stark wie bei der anderen (+16,0 gegenüber +2,9).
**Entscheiden/erschaffen:** eine eigene Antwort auf die Frage „Bei wem bewirkt die Kampagne mehr?“ und die *eine* Zahl, die im Abschlussbericht des Rats stehen soll, jeweils mit einem Satz für Laien.

### K2 · Die 95-%-Maschine
**Rolle:** Prüfer:in einer fiktiven Prüfstelle für Vorhersagemodelle.
**Kernidee:** Ein fiktives Start-up bietet ein „Nichtwahl-Radar“ an: „95 % Trefferquote!“ Die Studierenden bauen das Modell in R nach. Das Radar erkennt nur 12,8 % der Nichtwählenden. Die Regel „alle wählen“ läge schon bei 94,8 % richtig. Danach legen sie selbst eine Schwelle fest: vorhergesagte Wahrscheinlichkeiten mit `rec()` klassieren, dann `crosstab()` (Rückgriff auf Sitzung 4). Die Schwellen haben ihren Preis. Bei p(wählen) < 0,90 wären 12,6 % aller Personen markiert, 63 % der Nichtwählenden erreicht, und nur jede vierte Markierung träfe. Am Ende entscheiden sie, ob das Radar eine Freigabe erhält.
**Plenum:** Jede Person trägt ihre Schwelle als Punkt ein (Markierte, Erreichte). Zusammen ergibt der Raum die Abwägungskurve.

### K3 · Casting: „der typische Nichtwähler“
**Rolle:** Rechercheur:in einer fiktiven Dokumentarreihe.
**Kernidee:** Die Produzentin will „den typischen Nichtwähler“ porträtieren. Mit dem Logit finden die Studierenden das Profil mit der höchsten Nichtwahl-Wahrscheinlichkeit. Dann merken sie, dass die meisten Nichtwählenden gar nicht aus dieser Gruppe kommen: Wer sich überhaupt nicht für Politik interessiert, will zu 29,5 % nicht wählen, stellt aber nur 13 % aller Nichtwählenden. Die Mittel-Interessierten (5,5 %) stellen 40 %. Das ist das Präventionsparadox, und es unterscheidet P(Nichtwahl | Profil) von P(Profil | Nichtwahl).
**Entscheiden/erschaffen:** Besetzung von vier Porträts und ein Vorspann-Satz. Fürs Plenum: der Anteil der Nichtwählenden, der auf das „Hochrisikoprofil“ entfällt.

*(K1 und K3 unterscheiden sich grundlegend vom Planspiel-Entwurf. K2 hat ebenfalls eine andere Mechanik, nämlich Schwelle und Klassifikation statt Budget und Personas.)*

---

## 2. Empfohlenes Konzept: „Dolmetschen für den Bürgerrat“

### Rollenauftrag (so lesen ihn die Studierenden)

> **Dein neuer Job: Statistik-Dolmetscher:in.**
> Ein per Los besetzter Bürgerrat *(fiktiv)* berät, wie mehr Menschen wählen gehen. Gestern hat ein Sachverständiger *(fiktiv)* ein Modell aus dem ALLBUS 2023 vorgestellt: Die Wahlabsicht wird erklärt durch die Zustimmung zu „Wahlbeteiligung ist Bürgerpflicht“ (`pe09`) und durch politisches Interesse (`pa02a`). Auf seiner Folie stand nur: **„Pflichtgefühl: Exp(B) = 3,77 \*\*\*“**. Dann musste er zum Zug.
> Der Rat plant eine Kampagne „Wählen ist Ehrensache“. Zwei Mitglieder melden sich *(fiktive Personen)*:
> **Jana, 24:** „Bürgerpflicht? Stimme eher nicht zu. Politik interessiert mich wenig.“
> **Herr Brandt, 67:** „Bürgerpflicht – stimme eher zu. Politik interessiert mich stark.“
> Die Moderatorin sammelt vier Fragen:
> 1. „Heißt 3,77, dass Menschen mit einer Stufe mehr Pflichtgefühl 3,77-mal so wahrscheinlich wählen gehen?“
> 2. „Wie wahrscheinlich geht jemand wie Jana wählen, wie wahrscheinlich jemand wie Herr Brandt – und was ändert jeweils eine Stufe mehr Pflichtgefühl?“
> 3. „Bei wem bewirkt unsere Kampagne mehr?“
> 4. „Für den Abschlussbericht brauchen wir **eine** Zahl. Welche?“
>
> Du hast die Datei des Sachverständigen nicht, aber denselben ALLBUS. Rechne nach, bevor du übersetzt. Der Rat verlässt sich auf deine Worte. Eine Musterantwort gibt es nicht, wohl aber falsche Zahlen.
> *Hinweis: Die Pflichtfrage wurde nur einer Split-Hälfte gestellt (Modell: 2.758 Befragte). Es geht um die geäußerte Absicht, nicht um tatsächliches Wählen.*

### Ablauf (40 Min., optional +10)

| Min. | Station | R | Browser |
|---|---|---|---|
| 0–3 | Auftrag, Ratsmitglieder notieren | – | Geschichte, Profile |
| 3–13 | **1 Nachrechnen** | `rec()` ×3, `logistic_regression()` | prüft Exp(B) beider Prädiktoren |
| 13–19 | **2 Jana von Hand übersetzen** | Logit → Chance → p | prüft alle drei Zahlen |
| 19–23 | **3 Frage 1 beantworten** (Text) | – | Gegenfrage mit Janas Zahlen |
| 23–31 | **4 Eine Stufe mehr** | `predict()` für 4 Profile | S-Kurve; Frage 3 beantworten, dann **Dolmetscher-Tafel** |
| 31–38 | **5 Die eine Zahl** | `marginal_effects()` | erkennt die Größe hinter der Zahl, Ratskarte |
| +10 | *6 „95 % richtig?“ (optional)* | Klassifikation, −2LL | Likelihood gegen Trefferquote |

### R-Teil (vollständige Lösung, ausgeführt)

```r
library(mariposa)
library(dplyr)

allbus <- read_spss("ZA8831_v1-3-0.sav")

# Station 1: Variablen vorbereiten und das Modell nachrechnen
allbus <- allbus %>%
  mutate(
    waehlen   = rec(pv01, rules = "1:90=1 [würde wählen]; 91=0 [würde nicht wählen]; else=NA"),
    pflicht   = rec(pe09, rules = "rev"),   # 1 = stimme gar nicht zu … 4 = stimme voll zu
    interesse = rec(pa02a, rules = "rev")   # 1 = überhaupt nicht … 5 = sehr stark
  )

allbus %>% crosstab(pflicht, waehlen, percentages = "row", weights = wghtpew) %>% summary()

modell <- allbus %>%
  logistic_regression(waehlen ~ pflicht + interesse, weights = wghtpew)
summary(modell)

# Station 2: Jana von Hand übersetzen – Logit → Chance → Wahrscheinlichkeit
b <- coef(modell)
logit_jana  <- b[["(Intercept)"]] + b[["pflicht"]] * 2 + b[["interesse"]] * 2
chance_jana <- exp(logit_jana)
p_jana      <- chance_jana / (1 + chance_jana)
c(logit = logit_jana, chance = chance_jana, p = p_jana)

# Station 4: beide Ratsmitglieder, jeweils mit einer Stufe mehr Pflichtgefühl
profile <- tibble(
  person    = c("Jana", "Jana, eine Stufe mehr", "Herr Brandt", "Herr Brandt, eine Stufe mehr"),
  pflicht   = c(2, 3, 3, 4),
  interesse = c(2, 2, 4, 4)
)
profile %>%
  mutate(
    p_waehlen = predict(modell, newdata = profile, type = "response"),
    chance    = p_waehlen / (1 - p_waehlen)
  )

# Station 5: durchschnittlicher marginaler Effekt
modell %>% marginal_effects() %>% summary()
```

**Echte Ergebnisse:**
- Kreuztabelle: Wahlabsicht steigt mit `pflicht` von 61,4 % über 78,2 % und 94,8 % auf 98,8 %. Die S-Kurve ist schon hier sichtbar.
- Modell (n = 2.758): Konstante −2,154; `pflicht` B = 1,326, **Exp(B) = 3,765** [3,15; 4,50]; `interesse` B = 0,340, Exp(B) = 1,405; −2LL 856,4 (Nullmodell 1.122,3), Nagelkerke 0,275.
- Jana (2 | 2): Logit 1,18 → Chance 3,25 → **76,4 %**; eine Stufe mehr: **92,4 % (+16,0 Pp.)**. Herr Brandt (3 | 4): **96,0 %**; eine Stufe mehr: **98,9 % (+2,9 Pp.)**.
- AME `pflicht` = **0,054** (+5,4 Pp.), `interesse` = 0,014. Mit Alter, Abitur und Ost als Kontrollen bleibt Exp(B) stabil (3,85); das eignet sich als Erweiterung für Schnelle.

### Was der Browser prüft und wie

**Rechnung in TypeScript:** eine gewichtete Logit-Schätzung per Newton-Raphson/IRLS (drei Parameter, ca. 60 Zeilen). Daraus folgen B, Exp(B), −2LL, das Nullmodell, vorhergesagte p und die AME (Σ w·p(1−p)·β / Σ w). Alles wird live aus der geladenen Datei berechnet. Sechs **Abweichungsvarianten** ordnen falsche Eingaben einem Weg zu:

| Eingabe Exp(B) pflicht / interesse | Rückmeldung |
|---|---|
| 3,70 / 1,40 | „Ungewichtet? Mit `wghtpew` ergibt sich 3,77.“ |
| 0,27 / 0,71 | „Gegenrichtung: Nichtwahl als 1 kodiert oder Skalen nicht umgedreht? 1/0,27 = 3,77.“ |
| 0,27 / 1,41 | „`pe09` läuft von ‚voll zu‘ (1) bis ‚gar nicht zu‘ (4).“ |
| 1,80 / 1,69 | „‚Weiß nicht‘ als Nichtwahl gezählt? (Sitzung 4)“ |

- **Station 2:** Toleranz ±0,005 für p. Wer 3,25 als Wahrscheinlichkeit einträgt, liest: „Das ist die Chance. Wahrscheinlichkeiten liegen zwischen 0 und 1.“
- **Station 3:** Regelbasierte Gegenfragen zum Antworttext (Muster wie `questions.ts`, `CAUSAL_WORDS` wiederverwendbar). Bei „-mal so wahrscheinlich“: „Probier es an Jana: 76 % × 3,77 = 288 %?“ Bei Kausalsprache: „Das Modell vergleicht Menschen. Was eine Kampagne bewirkt, zeigt es nicht“ (Sitzung 9). Bei „Jana wird wählen“: „Von 100 Menschen, die wie Jana antworten, …“
- **Station 4, Überraschungsmoment:** Erst nach der Antwort auf Frage 3 erscheint die **Dolmetscher-Tafel**:

| | Logit | Chance | Wahrscheinlichkeit |
|---|---|---|---|
| Jana | 1,18 → 2,50 (+1,33) | 3,25 → 12,2 (×3,77) | 76,4 → 92,4 % (**+16,0 Pp.**) |
| Herr Brandt | 3,18 → 4,51 (+1,33) | 24,1 → 90,8 (×3,77) | 96,0 → 98,9 % (**+2,9 Pp.**) |

Zwei Spalten sagen „gleich“, eine sagt „fünfeinhalbmal so viel“. Der Browser erkennt an Schlüsselwörtern, in welcher Sprache geantwortet wurde, zeigt die anderen und bietet an, die Antwort zu ergänzen. Dazu kommt die S-Kurve mit beiden Schritten.
- **Station 5:** Zahl, Einheit und Satz. Ein Größenabgleich erkennt die gewählte Größe: 3,77 · 1,33 · 5,4 Pp. · 16,0/2,9 Pp. · 0,27 · −68 %/−73 % Nichtwahlrisiko. Der Browser sagt, was die Zahl zeigt und was sie verschweigt, und erstellt die **Ratskarte**.
- **Station 6 (optional):** „Das Modell liegt zu 95 % richtig.“ Das Modell erreicht 95,1 %, die Regel „alle wählen“ 94,8 %; von 143 Nichtwählenden erkennt es 18. −2LL sinkt dagegen um 24 %. Die Likelihood misst, wie wahrscheinlich das Modell das Beobachtete macht, nicht die Trefferquote.

### Gestufte Hilfen (Beispiel Station 1)

1. **Denkanstoß:** „`pv01` ist keine 0/1-Variable. Welche Codes heißen ‚würde wählen‘? In welche Richtung laufen `pe09` und `pa02a`?“
2. **Verweis:** Begriffskarten *Logistische Regression* und *Wahrscheinlichkeit, Odds & Logit*; R-Workshop Kap. 9.8 (https://rloesung.github.io/RWorkshop/09-Erklaerungsmodelle.html), zu `rec()` Kap. 5.
3. **Gerüst:**
   ```r
   allbus <- allbus %>%
     mutate(
       waehlen   = rec(pv01, rules = "___=1 [würde wählen]; ___=0 [würde nicht wählen]; else=NA"),
       pflicht   = rec(pe09, rules = "___"),
       interesse = rec(pa02a, rules = "___")
     )
   modell <- allbus %>% logistic_regression(___ ~ ___ + ___, weights = ___)
   summary(modell)
   ```
4. **Vollständiger Code** (oben). Die Station zählt trotzdem als bearbeitet.

Die anderen Stationen sind genauso gestuft, z. B. Station 2: „Logit = Konstante + B × Wert; Chance = exp(Logit).“

### Ergebnis fürs Plenum, Partnervariante, allein

- **Ratskarte:** (a) ein Satz zu Frage 3 und (b) die Berichtszahl mit Einheit. An der Tafel stehen eine Strichliste („Jana“, „gleich“, „kommt auf die Skala an“) und die Liste der Zahlen. Erwartet: 3,77 · 1,33 · 5,4 Pp. · 16 Pp. · −68 %, alle aus *einem* Modell, alle richtig. Anschlussfragen: Welche Zahl versteht eine Zeitung falsch? Welche ist für Jana ehrlich? Schluss: In Wahrscheinlichkeiten hat das Logit eine eingebaute Interaktion (Brücke zu Sitzung 9).
- **Partnervariante:** A übersetzt in *Chancen* (Jana von Hand, die „+1“-Profile nur durch ×3,77, ohne R), B in *Wahrscheinlichkeiten* (`predict()`, `marginal_effects()`). A wird „gleich“ sagen, B „bei Jana“. Der Konflikt entsteht aus den Rollen, und beide müssen sich auf *einen* Satz einigen.
- **Allein:** Der Browser führt nacheinander durch beide Sprachen und fragt dann nach dem gemeinsamen Satz. Am Ende: kurzes Nachwort, Ratskarte als Markdown, R-Skript.

### Abgedeckte Begriffe, angegriffene Missverständnisse

- **Begriffe:** Wahrscheinlichkeit · Odds & Logit (von Hand) · logistische Regression (gewichtet) · marginale Effekte (AME als Mittel profilabhängiger Effekte) · Likelihood (−2LL, Station 6). Wiederholt werden `rec()`, Gewichtung, Split, fehlende Werte und Kausalität.
- **Missverständnisse:** (1) „Exp(B) = 3,77 heißt 3,77-mal so wahrscheinlich.“ (2) „Ein Effekt hat überall dieselbe Größe in Prozentpunkten“ (lineares Denken aus Sitzung 8). (3, optional) „Hohe Trefferquote heißt gutes Modell.“

### Aufwand: **M**

Wiederverwendet werden SPSS-Leser, `variableOf`/`WEIGHT_VARIABLE`, Speicherung, Begriffslinks und die Gegenfragen-Muster. Neu sind `logit.ts` (IRLS, Tests gegen die R-Werte oben), `variants.ts`, `answerRules.ts`, der Größenabgleich, S-Kurve, Tafel und Ratskarte.

**Risiken:**
- `pe09` stammt aus einem Split.
- Die Wahlabsicht liegt bei 94,8 % (Overreporting, Deckeneffekt).
- Interesse wirkt nicht monoton: „sehr stark“ 94,2 %, „stark“ 97,5 %.
- Die Textregeln sind fehlbar und deshalb als Fragen formuliert.
- **mariposa-Befund:** In deutscher Locale erscheint bei gewichteten Modellen die Warnung „Nicht-ganzzahlige #Erfolge in einem binomial-GLM“, weil der Filter (`R/logistic_regression.R:325`) nur den englischen Text prüft. Das sollte vor dem Semester behoben oder im Auftrag erklärt werden.

---

## 3. Offene Fragen an den Dozenten

1. Ist `pe09` (Split, n = 2.758) als Kernprädiktor in Ordnung? Ohne Split, nur mit `pa02a`, wird die S-Kurve deutlich flacher (70,5–97,5 %), und der Überraschungsmoment wird schwächer.
2. Reicht `predict(modell, newdata = …, type = "response")` (Base-R-Generikum) für die Profile, oder soll mariposa eine eigene Funktion für vorhergesagte Wahrscheinlichkeiten erhalten? Und soll die Locale-Warnung vorher in mariposa behoben werden?
3. Soll Station 6 (Trefferquote gegen Likelihood) in die Kernzeit (dann ca. 45–50 Min.) oder bleibt sie Zusatz bzw. Hausaufgabe?
