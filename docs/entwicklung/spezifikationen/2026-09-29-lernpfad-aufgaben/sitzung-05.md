# Sitzung 5 · Gewichtung und Zusammenhang: Aufgabenkonzepte

Datenbasis: ALLBUScompact 2023 (ZA8831 v1.3.0), mariposa 0.7.3. Alle Zahlen sind aggregiert und mit `Rscript` auf der lokalen Datei nachgerechnet. Hilfsskripte liegen in `konzepte/tmp-05/`; sie enthalten keine Einzelfälle.

---

## 1 · Drei Konzepte (Kurzskizzen)

### A · „Zwei Mandate, eine Datei“ (der Entwurf, weitergedacht)

**Rolle:** Datenberater:in der fiktiven Agentur „Kurvenlage“. **Kernidee:** Zwei fiktive Initiativen geben gegensätzliche Aufträge. Die eine will „Der Osten ist abgehängt“, die andere „Ost und West sind sich einig“, beide zur Demokratiezufriedenheit (ps03) oder zum Vertrauen in den Bundestag (pt03). Erlaubt sind nur echte, mit mariposa reproduzierbare Zahlen. Gewicht, Prozentbasis, Item und Zusammenhangsmaß wählt man selbst. **Neu gegenüber dem Entwurf:** Die Partner tauschen ihre Zahlen und rekonstruieren in R, welche Stellschrauben die andere Seite gedreht hat. Die Spanne entsteht so im Raum, nicht in einem Spiegel wie in Sitzung 4. Für dieselbe Ost-West-Frage lassen sich belegen: Phi 0,19 ungewichtet, 0,15 gewichtet, |Gamma| 0,40. Der Ost-Anteil an den stark Misstrauenden liegt bei 41,8 % ungewichtet und 23,4 % gewichtet. **Die Studierenden entscheiden** am Ende, welche Stellschrauben legitim waren. **Schwäche:** Das Konzept liegt nah an Sitzung 4 (Behauptung, Auswertungswege).

### B · „Die Gewichtswerkstatt“

**Rolle:** neu im Methodenteam eines fiktiven Umfrageinstituts, dessen Stichprobe den Osten absichtlich überrepräsentiert. **Kernidee:** Die Studierenden bauen das Gewicht selbst. Sie teilen den Sollanteil (Ost etwa 17 % der Erwachsenen) durch den Istanteil (32,0 %) und erhalten Faktoren von etwa 0,53 und 1,22. Die Faktoren kodieren sie per `rec(eastwest, rules = "1=1.22; 2=0.53")` als eigene Variable und legen sie neben `wghtpew` (Ost 0,50–0,55, West 1,20–1,25). Mit dem eigenen Gewicht prüfen sie sechs Sätze einer fiktiven Pressemitteilung: Welche kippen? Der Anteil der Zufriedenen in Deutschland steigt von 70,7 auf 73,6 %, die Werte innerhalb West und Ost bleiben gleich. r(Alter, ps03) verdoppelt sich von −0,03 auf −0,06, V(Ost/West) sinkt von 0,23 auf 0,19, Gamma bleibt bei 0,35. **Die Studierenden erschaffen** ein eigenes Gewicht und eine Faustregel, wann Gewichtung wirkt. **Plenum:** Faktoren im Raum und eine Strichliste „kippt / kippt nicht“. **Schwäche:** Zusammenhangsmaße kommen nur am Rand vor.

### C · „Die Treiber-Rangliste“ (Empfehlung)

**Rolle:** Analyst:in im fiktiven Beratungsbüro „Querschnitt“. **Kernidee:** Ein fiktiver Förderfonds bestellt eine Rangliste: Was hängt am stärksten mit der Demokratiezufriedenheit zusammen? Jede:r zieht einen von zwölf Kandidaten, etwa Wirtschaftslage, Alter, Konfession oder Wohnort. Man wählt ein Maß, das zum Skalenniveau passt, rechnet gewichtet, prüft West und Ost getrennt und liefert einen Eintrag „Maß = Wert · Stempel“. An der Tafel entsteht die Rangliste. Sie kippt, sobald klar wird, dass V, Gamma, Tau-b und r verschiedene Währungen sind. Bei der Wirtschaftslage ergibt V 0,28 und Gamma 0,54; beim Alter ist V = 0,16 reines Tabellenrauschen. **Die Studierenden entscheiden** über Maß, Stempel und Wortwahl. Am Ende empfehlen sie dem Fonds, wie eine faire Rangliste aussieht und ob das Wort „Treiber“ passt.

---

## 2 · Empfehlung ausgearbeitet: „Die Treiber-Rangliste“

Das Konzept verbindet Gewicht, Drittvariable und die Wahl des Maßes in einer einzigen Handlung. Weil alle dieselbe abhängige Variable haben, ist das Ergebnis im Plenum von selbst vergleichbar. Der Streit, ob Gamma 0,54 ein V von 0,28 „schlägt“, ist der Lerngegenstand. Es gibt keine Behauptung, keinen Faktencheck und kein Multiversum.

### 2.1 Rollenauftrag (so lesen ihn die Studierenden)

> **Dein neuer Job: Analyst:in im Beratungsbüro „Querschnitt“ (fiktiv)**
>
> Der Förderfonds „Gemeinsinn“ (fiktiv) vergibt nächstes Jahr 1,5 Millionen Euro an Projekte. Er will das Geld dorthin lenken, wo die Zufriedenheit mit der Demokratie „entsteht“, und bestellt bei uns eine Rangliste: **Welche Merkmale hängen am stärksten mit der Demokratiezufriedenheit in Deutschland zusammen?** Grundlage ist der ALLBUS 2023, `ps03` (1 = sehr zufrieden … 6 = sehr unzufrieden).
>
> Du bekommst einen Kandidaten zugelost und lieferst genau einen Eintrag. Was du beachten musst:
> - Die Rangliste soll für Deutschland gelten. Der ALLBUS hat Ostdeutsche absichtlich überrepräsentiert: 32 % der Befragten statt rund 17 % der Bevölkerung.
> - Wähle das Maß, das zu deinen Variablen passt, und steh dafür ein.
> - Der Fonds fördert in West und Ost. Prüfe, ob dein Zusammenhang in beiden Landesteilen hält.
>
> **Eintrag:** Maß = Wert · Richtung in Worten · Stempel (*trägt* / *schrumpft* / *nur in einem Landesteil* / *kehrt sich um*) · ein Satz für den Fonds. Der Fonds nennt die Kandidaten „Treiber“. Ob das Wort stimmt, entscheidest du.

### 2.2 Ablauf (40 Minuten)

| Min. | Schritt |
|---|---|
| 0–3 | Browser: Auftrag lesen, Kandidat ziehen (jeder Kandidat geht absichtlich an zwei Personen) |
| 3–8 | R: `codebook()`, Skalenniveau festlegen, Sonderkodes mit `rec()` entfernen |
| 8–16 | R: `crosstab()` gewichtet ansehen, Maß wählen und gewichtet rechnen |
| 16–20 | R: dasselbe ohne Gewicht – ändert sich etwas, und warum? |
| 20–27 | R: `group_by(eastwest)`, Stempel wählen |
| 27–32 | Browser: Eintrag, Prüfung gegen die Datei |
| 32–40 | Browser: Enthüllung „Rangliste in vier Währungen“, dann Empfehlung an den Fonds (2–3 Sätze) |

### 2.3 R-Teil (Beispielkarte „Wirtschaftslage“, ausgeführt)

```r
library(mariposa)
library(dplyr)
allbus <- read_spss("ZA8831_v1-3-0.sav")

allbus %>%
  crosstab(ep01, ps03, percentages = "row", weights = wghtpew) %>%
  summary()

allbus %>% goodman_gamma(ps03, ep01, weights = wghtpew)   # 0.544 (ohne Gewicht 0.553)
allbus %>%
  unlabel(ps03, ep01, wghtpew) %>%                         # macht kendall_tau() schnell
  kendall_tau(ps03, ep01, weights = wghtpew)               # tau-b = 0.387

allbus %>%
  unlabel(ps03, ep01) %>%
  group_by(eastwest) %>%
  kendall_tau(ps03, ep01)                                  # West 0.367 · Ost 0.436
```

Andere Karten, zum Beispiel diese:

```r
allbus <- allbus %>%
  mutate(konf = rec(rd01, rules = "1:2=1 [evangelisch]; 3=2 [katholisch]; 4:5=3 [andere]; 6=4 [keine]; else=NA"))
allbus %>% cramers_v(ps03, konf, weights = wghtpew)         # 0.105
allbus %>% pearson_cor(ps03, age, weights = wghtpew)        # -0.059 (ohne Gewicht -0.031)
allbus %>% group_by(eastwest) %>% pearson_cor(ps03, age)    # West -0.095 · Ost +0.045
```

Der bekannte `crosstab()`-Abbruch tritt hier nicht auf, weil `wghtpew` keine NA hat. Mit künstlichen NA ließ er sich nachstellen. Beide Workarounds funktionieren: `filter(!is.na(wghtpew))` oder `unlabel(wghtpew)`.

### 2.4 Echte Ergebnisse der zwölf Karten (gewichtet, n ≈ 3.450–3.620)

| Kandidat | V | Gamma | Tau-b | r | West / Ost | Stempel |
|---|---|---|---|---|---|---|
| ep01 Wirtschaftslage D (ord.) | .277 | .544 | .387 | .463 | τ .367 / .436 | trägt |
| ep03 eigene Lage (ord.) | .167 | .364 | .249 | .290 | τ .246 / .244 | trägt |
| ls01 Lebenszufriedenheit (0–10) | .158 | −.285 | −.221 | −.265 | τ −.225 / −.190 | trägt |
| id02 Schicht (ord.) | .140 | −.313 | −.216 | −.246 | τ −.198 / −.172 | trägt |
| eastwest (nominal) | .186 (ungew. .229) | .350 (ungew. .350) | .189 | .183 | γ je ep01-Gruppe .32 / .37 / .30 | trägt |
| educ Schulabschluss (ord.) | .117 | −.195 | −.143 | −.172 | τ −.143 / −.147 | trägt |
| pa01 Links-rechts (1–10) | .146 | .186 | .146 | .193 | τ .145 / .224 | trägt |
| rp01 Kirchgang (ord.) | .082 | .191 | .136 | .147 | τ .109 / .076 | schrumpft |
| konf Konfession (nominal) | .105 (Zufall .038) | +.147 / −.135 / −.043 je Reihenfolge | – | – | V .090 / .088 | schrumpft leicht |
| gs01 Wohnort (ord.) | .059 | .078 | .057 | .064 | τ .063 / .136 | nur im Osten |
| age Alter (metrisch) | .158 (**Zufall .154**) | −.058 | −.039 | −.059 | r −.095 / +.045 | kehrt sich um |
| pa02a Interesse (ord.) | .096 (Zufall .036) | .043 | .028 | .013 | τ .040 / −.005 | U-Form* |

\* Zufrieden sind 68,5 % der sehr stark und 65,2 % der überhaupt nicht Interessierten, aber 75,4 % der mittel Interessierten. Das Vorzeichen folgt der Kodierung (ps03: 1 = zufrieden). **Rangwechsel:** Alter steht bei V auf Platz 4–5 von 12, bei Gamma, Tau-b und r auf Platz 11. Schicht steigt von Platz 7 auf Platz 4. Nur die Wirtschaftslage bleibt überall auf Platz 1.

### 2.5 Was der Browser prüft

- **Wertedetektor:** Aus der geladenen .sav rechnet der Browser für die Karte alle Varianten: Maß × Gewicht × gesamt/West/Ost × Umkodierung. Den Eingabewert ordnet er der nächstgelegenen Variante zu, etwa „0,553 ist Gamma **ohne** Gewicht“. Er meldet auch: „`spearman_rho()` ignoriert Gewichte, deshalb sind deine beiden Werte gleich.“
- **Passung** (Denkanstoß, keine Bewertung): Wer V für Alter wählt, sieht das Zufalls-V ≈ 0,15 (√(df / (n · min(r−1, c−1))) und den Satz „Dein V ist fast nur Tabellengröße.“ Wer Gamma für Konfession wählt, sieht drei Reihenfolgen mit drei Vorzeichen. Wer Gamma wählt, erfährt, dass Gamma Bindungen übergeht und deshalb hier über Tau-b liegt.
- **Stempel und Satz:** Der Browser nennt seine Lesart der Werte für West und Ost nach einer offengelegten Regel. Weicht der Stempel ab, fragt er nach; die Entscheidung bleibt bei den Studierenden. Bei „Treiber“, „bewirkt“ oder „weil“ stellt er eine Gegenfrage zur Drittvariablen.
- **Überraschung:** Die „Rangliste in vier Währungen“ ist ein Rangverlaufsdiagramm aller zwölf Kandidaten aus der eigenen Datei (V | Gamma | Tau-b | r), die eigene Karte ist markiert. Umschalter: *ohne Gewicht*, *nur West*, *nur Ost*. Hinweise wie: „Alter fällt von Platz 5 auf 11.“ „Mit Gewicht verdoppelt sich r für Alter: In West und Ost zeigt der Zusammenhang in entgegengesetzte Richtungen, und die Ost-Überquote rechnet das ungewichtet gegeneinander auf.“ „Gamma für Ost/West bleibt mit Gewicht gleich, V nicht.“ Danach folgt die Empfehlung an den Fonds, exportierbar mit R-Skript.

**TypeScript-Bedarf** (alles aus Kreuztabellen, unter 50 ms):
- gewichtete R×C-Tabelle
- mehrstufiges `rec()`
- χ² und Gamma auf **gerundeten** gewichteten Zellen (wie mariposa), daraus V und Phi
- Tau-b über Zellsummen von √w und w: Das reproduziert mariposas Paargewicht √(wᵢwⱼ) exakt (in R geprüft: 0,3550522 = 0,3550522)
- gewichteter Pearson, Spearman ohne Gewicht, Zufalls-V
- SVG-Diagramm und Codegenerator je Karte

### 2.6 Gestufte R-Hilfe (Beispiel ep01)

1. **Denkanstoß:** „Geordnete Stufen ohne gleiche Abstände: Welche Maße nutzen nur die Reihenfolge? Wie nimmst du die Ost-Überquote aus dem Spiel?“
2. **Verweis:** Begriffskarten *Tau-b*, *Gamma*, *Gewichte*, *Drittvariable*. R-Workshop [7.2 Über Gewichtung](https://rloesung.github.io/RWorkshop/07-Uni-Bivariate-Analyse.html#über-gewichtung) und [7.5.3 Korrelation](https://rloesung.github.io/RWorkshop/07-Uni-Bivariate-Analyse.html#korrelation).
3. **Gerüst:** `allbus %>% unlabel(ps03, ____, wghtpew) %>% kendall_tau(ps03, ____, weights = ____)` und dasselbe mit `group_by(____)`.
4. **Vollständiger Code** wie in 2.3, vom Browser je Karte erzeugt. Die Aufgabe zählt trotzdem, denn Stempel, Satz und Empfehlung entscheiden die Studierenden selbst.

### 2.7 Plenum, Partnervariante, allein

- **Plenum (5–10 Min.):** Ein Tafelraster mit zwölf Zeilen, jede:r trägt „Maß = Wert · Stempel“ ein. Durch die Doppelvergabe steht zum Beispiel „ep01: Gamma 0,54“ neben „ep01: V 0,28“. Dann wird sortiert und gestritten: Ist das eine Rangliste? Was hält in beiden Landesteilen? Welche Währung soll der Fonds nehmen?
- **Partnervariante:** A ist *Analyst:in*: Maß wählen, gewichtet rechnen, Satz. B ist *Gegenleser:in des Fonds*: rechnet eine zweite Währung und ohne Gewicht, macht den Ost/West-Test und hat ein Veto gegen „Treiber“. Beide einigen sich auf einen Eintrag.
- **Allein:** Der Browser führt nacheinander durch beide Rollen. Die Enthüllung zeigt alle zwölf Kandidaten und die anderen Währungen der eigenen Karte, also die Unterschiede, die sonst im Raum entstehen.

### 2.8 Begriffe und Missverständnis

**Abgedeckt:** Gewichte, Drittvariable und Confounding (schrumpft / moderiert / kehrt sich um), Phi, Cramér-V, Gamma, Tau-b, Spearman, Pearson.

**Angegriffene Missverständnisse:** „Alle Maße liegen auf derselben Skala; der höhere Wert ist der stärkere Zusammenhang.“ Außerdem „Gewichtung ändert alles“ bzw. „nichts“ und „Ein starker Zusammenhang ist ein Treiber.“

### 2.9 Aufwand und Risiken

**Aufwand: M.** Etwa ein Tag für den Rechenkern samt R-Referenztests (Referenzwerte in `tmp-05/deck_results.csv`) und ein bis zwei Tage für die Oberfläche.

**Risiken:**
- **Kritisch:** `kendall_tau()` ist auf gelabelten Vektoren etwa 400-mal langsamer. Gemessen unter Last: n = 800 brauchte 66 s mit Labels und 0,17 s nach `unlabel()`; die volle Stichprobe läuft mit Labels über 20 Minuten, ohne in 3,4 s. Ursache ist eine R-Doppelschleife mit vctrs-Arithmetik. Workaround: `unlabel()`. Besser wäre ein Fix in mariposa.
- `spearman_rho()` ignoriert `weights`.
- Warnungen „expected count < 5“ verunsichern.
- Vorzeichenlesart (ps03: 1 = zufrieden).
- ps03 ist ein Split-Item (69 %).
- Die Karten sind unterschiedlich schwer (konf, educ, age brauchen `rec()`).

## 3 · Offene Fragen an den Dozenten

1. Soll der `kendall_tau()`-Fix (Labels intern entfernen oder Zellsummen-Algorithmus) vor dem Semester in mariposa, oder bleibt `unlabel()` im Code und in den Hilfen?
2. Bleibt es bei zwölf festen Karten mit Doppelvergabe, oder darf man zusätzlich einen eigenen Kandidaten suchen? Soll `pt03` (Vertrauen in den Bundestag: Tau-b −0,49, fast dasselbe Konstrukt) als bewusst „zu guter“ Joker dabei sein?
3. Sollen alle zuerst ps03 umpolen (`rec(ps03, rules = "rev")`, geprüft), damit ein positives Vorzeichen „zufriedener“ heißt, oder bleibt die Vorzeichenlesart ein Lerngegenstand?
