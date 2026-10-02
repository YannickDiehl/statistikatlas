# Freie Karte: Ausbau auf alle Knoten – Designspezifikation

Stand: 1. Oktober 2026. Grundlage: das Tonbeispiel „Standardabweichung, Neu gegen Bisher“, vom Dozenten mit „Perfekt! So für alles umsetzen“ gebilligt; die Entscheidungen vom selben Tag (Fundament zuerst, Begriffskarte für Knoten ohne Rechenformel, alles in einem Durchgang, Abschnitt 13 der Spezifikation `2026-10-01-freie-karte-lehrdatensatz-und-r-pilot-design.md` bestätigt).

Diese Spezifikation baut auf zwei Vorgängern auf und gilt zusammen mit ihnen:

- `2026-09-30-freie-karte-formelwerkstatt-pilot-design.md` (Formelwerkstatt, Formel als Satz, Werkzeug, Inhaltsmodell)
- `2026-10-01-freie-karte-lehrdatensatz-und-r-pilot-design.md` (Reiter, Lehrdatensatz mit 200 Befragten, R lesen, `read_spss()`, Codestil)

Wo diese Spezifikation den Vorgängern widerspricht, gilt sie (vor allem beim Aufbau der Lernkarte, Abschnitt 3).

## 1. Ziel und Publikum

Alle 144 Begriffe der freien Karte und die Rechenbausteine der Detailansicht werden nach dem gebilligten Muster erklärt. Publikum sind Bachelorstudierende der Politikwissenschaft, viele davon mit Angst vor Mathematik. Sie sollen sich abgeholt fühlen, ohne dass Fachbegriffe oder Genauigkeit verloren gehen.

## 2. Sprachleitfaden (verbindlich für alle Texte)

Regeln mit [Test] prüft ein automatischer Test; die übrigen prüft die fachlich-sprachliche Begutachtung.

1. **Erst die Handlung, dann der Name.** Schritte heißen nach dem, was man tut („Die Mitte finden“, „Abstände messen“, „Gerecht teilen“), nicht nach ihrem Zeichen. Der Fachbegriff folgt als „Das nennt man …“ mit Zeichen und Aussprache. [Test: jeder Schritt hat Titel, Fachbegriff, Zeichen oder ausdrücklich keins, Aussprache bei Zeichen]
2. **Fachbegriffe bleiben vollständig.** Jeder Schritt und jede Karte nennt den Fachbegriff so, wie der Begriff in `concepts.ts` heißt, und einen Satz „In der Fachsprache: …“. [Test: Fachbegriff = Kartentitel des verlinkten Begriffs]
3. **Kurz gesagt** in höchstens zwei Sätzen, in Alltagswörtern. [Test]
4. **Kurze Sätze, du-Form, aktive Verben, ein Gedanke pro Satz.** Richtwert höchstens 20 Wörter je Satz in „Was passiert“, „Kurz gesagt“ und „Warum?“. [Test: höchstens 25 Wörter]
5. **Keine Abwertung des Schwierigen.** Nicht „einfach“, „offensichtlich“, „trivial“, „natürlich“, „bekanntlich“, „leicht zu sehen“. [Test]
6. **Mut statt Prüfungsgefühl.** Zu Beginn jeder Werkstatt ein Satz, der die Formel in kleine bekannte Handlungen zerlegt und daran erinnert, dass R rechnet. Unterwegs Fortschritt („Schritt 2 von 6, noch 4 kleine Schritte“). Fehler heißen „Aufgepasst“, Rückmeldungen auf erkennbare Fehler beginnen mit „Fast!“, allgemeine mit „Noch nicht ganz.“; richtige mit „Genau, …“.
7. **Zeichen erst, wenn sie gebraucht werden.** Kein Zeichenblock vor dem ersten Schritt; die Übersicht aller Zeichen steht zugeklappt am Ende („Alle Zeichen auf einen Blick“).
8. **Konkret vor abstrakt.** Erst Menschen und Zahlen (fünf Beispielpersonen, Lehrdatensatz, ALLBUS-Häufigkeiten), dann Bild, dann Zeichen, dann Fachbegriff.
9. **Ergebnisse als Aussage über Menschen** („Dort sind sich fast alle einig“), mit Einheit und höchstens zwei Nachkommastellen.
10. **Genauigkeit nach hinten, nicht weg.** Feinheiten (Erwartungstreue, Annahmen, Grenzfälle) stehen unter „Genau genommen“.
11. **Kein Mittelpunkt „·“ als Trenner** neben Zahlen oder Formeln; „·“ nur als Malzeichen. Echtes Minus „−“. [Test]
12. **Beispiele aus der Lebenswelt** der Studierenden und aus der Politik (Wahlabsicht, Vertrauen in den Bundestag, Lernzeit, Miete), keine Würfel- oder Urnenbeispiele, wo ein Beispiel aus den Daten passt.

## 3. Aufbau der Erklärung (ersetzt Lernkarte und Einstieg der Vorgänger)

**Einstieg** jeder Erklärung: Wofür (Situation und Frage), Kurz gesagt, bei Werkstätten der Mut-Satz (Regel 6), Beispieldaten.

**Lernkarte je Schritt** mit fünf Teilen statt sieben:

1. Kopf: „Schritt k von n“, Fortschritt, Titel als Handlung.
2. **Was passiert?** ein bis zwei Sätze.
3. **Rechnung** für die gewählte Person, groß und in Serifenschrift.
4. **Das nennt man …** Fachbegriff, Zeichen, Aussprache; darunter klein „In der Fachsprache: …“. Links zum Begriff in der Karte wie bisher.
5. **Warum?** und **Aufgepasst** (der typische Fehler, ermutigend formuliert).

„Wie im Alltag“ ist optional und erscheint nur, wo ein Vergleich wirklich hilft. Die Kontrollfrage heißt „Probier es selbst“ mit dem Knopf „Nachsehen“; Fragen in Alltagssprache („Wo liegt die Mitte dieser Gruppe?“).

## 4. Vier Vorlagen

| Vorlage | Wann | Kern |
|---|---|---|
| **Werkstatt** | Rechnung mit höchstens etwa sechs Schritten auf kleinen Beispieldaten (5 bis 8 Werte oder eine kleine Tabelle) | Formel als Navigator, Lernkarte je Schritt, Rechentabelle, Bild, Ausprobieren |
| **Formel als Satz** | Formel, die man besser als Satz liest und mit Reglern erkundet (Intervalle, Prüfgrößen, Effektmaße) | Satz mit antippbaren Teilen, ein Regler je Zeichen, Vorgerechnet in Mini-Schritten |
| **Werkzeug** | Datenoperation mit mariposa (Labels, Umkodieren, Dummys, fehlende Werte, Import) | Vorher und nachher an einer kleinen Tabelle, Regel oder Aufruf zum Verändern |
| **Begriffskarte** (neu) | Begriff ohne Rechenkern (Kausalität, Validität, Fehlerarten, p-Wert-Deutung, Skalenniveaus) | siehe unten |

**Begriffskarte:** Wofür; Kurz gesagt; „Stell dir vor …“ (ein konkretes Beispiel mit Zahlen aus dem Lehrdatensatz oder aus ALLBUS-Aggregaten); Das nennt man …; zwei bis vier Bausteine im Lernkartenformat (Was passiert, Warum?, Aufgepasst; ohne Rechnung, wenn es keine gibt); Ausprobieren (Denkfragen mit Vorhersage, wo möglich ein Regler oder Schalter); Probier es selbst (Auswahl- oder Zahlfrage mit „Fast!“-Diagnosen); Was heißt das für dich?; Genau genommen.

**Werkzeug allgemein:** Neben dem bestehenden Rekodieren gibt es eine allgemeine Tabellenvorlage: eine kleine Tabelle mit fünf Personen vorher, die Operation in Schritten, die Tabelle nachher, der mariposa-Aufruf; Eingaben verändern die Tabelle.

**Zuordnung:** Der Bereichsagent ordnet jeden Begriff nach dieser Tabelle zu und begründet Grenzfälle in einem Satz in seinem Bericht.

## 5. Reiter für alle Begriffe

Jeder Begriff bekommt die Reiterleiste der Lehrdatensatz-Spezifikation:

- **Verstehen** (Name nach Vorlage: „Verstehen (5 Personen)“ für Werkstätten, sonst „Verstehen“; „Werkzeug“ für Werkzeuge) – immer.
- **Mit 200 Befragten** – wenn der Lehrdatensatz eine passende Variable hat. Werkstätten bekommen die volle Brücke (Formel mit 200, Schritte, Person, Bild, Vorhersagen); andere Begriffe die bisherigen Auswertungen des Atlas im neuen Ton: Kurz gesagt, Ergebnis mit Deutung, Voraussetzung, mindestens eine Vorhersagefrage.
- **In R** – wenn der Katalog einen mariposa-Aufruf hat (oder ein dplyr-Aufruf sinnvoll ist): Codelegende, „So antwortet R“, Kurz prüfen. Live erzeugte Ausgabe für die Leitaufrufe der Lehrdatensatz-Spezifikation; für alle anderen Aufrufe die in R erfasste Ausgabe für die Ausgangsdaten mit dem Hinweis, dass sie nach Datenänderungen abweicht, und Zuordnungen „Zahl in der Ausgabe ↔ Begriff im Atlas“.
- **Weiter** – immer: Als Nächstes, Das geht voraus, Daraus entsteht, jeweils mit einem Satz; doppelte Ziele zusammengeführt.

## 6. Bereiche

| Agent | Bereich | Begriffe (`id`) |
|---|---|---|
| B1 | Messen und Skalen | series, pairs, metric, nominal, ordinal, operationalization, measurement_error, validity, missing, missing_mechanisms, weights |
| B2 | Datenwerkzeuge | codebook, labels, conversion, missing_tools, data_import, data_export, sorting |
| B3 | Lage und Verteilung | validn, frequency, median, quantile, range, mode, shape, describe, multiple_response |
| B4 | Umformen | ss, centering, scaling, z, ranks, pomps, row_operations, item_score |
| B5 | Zusammenhang | linear, spearman, crosstab, expected, concordance, phi, cramers_v, goodman_gamma, kendall_tau, partial_cor, correlation_matrix |
| B6 | Wahrscheinlichkeit | probability, conditional_probability, stochastic_independence, random_variable, empirical_distribution, theoretical_distribution, discrete_continuous, probability_mass, density_function, cumulative_probability, theoretical_quantile, expectation, population_variance |
| B7 | Verteilungsfamilien | normal_distribution, standard_normal, t_distribution, chi_square_distribution, f_distribution, bernoulli_distribution, binomial_distribution, hypergeometric_distribution |
| B8 | Stichprobe und Schätzen | sampling, population_parameter, estimator, sampling_distribution, sampling_bias, law_large_numbers, central_limit, random_sampling, confidence, prediction_interval |
| B9 | Testlogik | hypothesis, test_statistic, null_distribution, test_sides, alpha_level, critical_value, type_errors, power, general_df, exact_asymptotic, multiplicity, effect |
| B10 | Mittelwerte vergleichen | t_test, paired_design, paired_difference, oneway_anova, factorial_anova, ancova, group_variation, variance_assumption, levene_test, normality_test |
| B11 | Rangtests und Paarvergleiche | mann_whitney, kruskal_wallis, wilcoxon_test, friedman_test, dunn_test, tukey_test, scheffe_test, pairwise_wilcoxon |
| B12 | Kategoriale Tests, Design, Rechenbausteine | binomial_test, chi_square, chisq_gof, fisher_test, mcnemar_test, confounding, causality, random_assignment; Detailbegriffe count, add, subtract, multiply, divide, square, sqrt, positive_sd |
| B13 | Regression | prediction, residuals, interaction, logit, likelihood, linear_regression, logistic_regression, marginal_effects, explained_variance, outliers_influence, multicollinearity, overfitting |
| B14 | Skalen und Faktorenanalyse | reliability, efa, factor_model, dimensionality, loadings, eigenvalues, communality, rotation |

Das Fundament setzt drei Begriffe als Muster um und nimmt sie aus ihren Bereichen heraus: `p_value` (Begriffskarte), `dummy` (Werkzeug als Tabellenvorlage) und die sieben Pilotbegriffe (Ton und Reiter). Zusammen mit den 137 offenen Begriffen und den acht übrigen Detailbegriffen sind danach alle Knoten erklärt.

## 7. Ablauf

1. **Fundament F1 (Ton und Vorlagen)**, parallel zu **F2 (R global)**:
   - F1: Inhaltsmodell mit der neuen Lernkarte, Einstieg, Fortschritt, Rückmeldeton; Werkstätten mit beliebiger Kennung und Bild-Baukasten; Begriffskarte und Tabellen-Werkzeug als Vorlagen mit je einem Muster (`p_value`, `dummy`); Umstellung der sieben Pilotbegriffe auf den neuen Ton; Sprachtests; Autorenleitfaden `src/explain/AUTHORING.md`.
   - F2: Teil 1 der Lehrdatensatz-Spezifikation (110 Vorlagen im Pipe-Stil, `read_spss()`, `.sav`-Export, Version 0.7.4, Entwicklertexte, Kleinfehler), R-Ausgabe live für die Leitaufrufe, in R erfasste Ausgaben für alle Katalogaufrufe, allgemeine Codelegende.
2. **Fundament F3 (Reiter):** Reiterleiste, die vier Reiter, Inhalte der Reiter für die Pilotbegriffe und die Muster; Bereichsordner `src/explain/content/<bereich>/` mit leerem Index, den die Zuordnung automatisch einliest.
3. **Prüfung des Fundaments** durch zwei Agenten (Fachlichkeit und Sprache; Code, Barrierefreiheit, Browser), Befunde einarbeiten.
4. **Bereichsagenten B1 bis B14** parallel, je in einem eigenen Arbeitsverzeichnis. Sie ändern nur Dateien ihres Bereichsordners, ihrer Bilder und ihrer Tests; gemeinsame Dateien nicht.
5. **Prüfung der Bereiche** durch Begutachtungsagenten (je mehrere Bereiche), Befunde einarbeiten, Nachprüfung.
6. **Zusammenführen** auf einen Integrationszweig, Gesamtprüfung (alle Tests, R-Prüfstrecke, Browser über alle Knoten), dann nach `main`.

## 8. Qualität

- **Jede Zahl** in Texten, Beispielen und Kontrollfragen ist in R nachgerechnet (Basis-R oder mariposa 0.7.4 aus dem Quellstand) und als Test festgehalten. ALLBUS nur als Aggregat (Häufigkeiten, Mittelwerte), nie Mikrodaten.
- **Inhaltstests** laufen automatisch über alle registrierten Erklärungen: keine `NaN`, `undefined`, `Infinity`; Sprachregeln mit [Test]; jede Kontrollfrage hat eine richtige Antwort ohne Diagnose und mindestens eine Fehlantwort mit „Fast!“-Diagnose; Rundung und Schreibweise.
- **Browser:** jede Erklärung öffnet ohne Konsolenfehler, alle Reiter erreichbar, keine Schrift unter 13 px, kein seitliches Überlaufen bei 1440 und 390 px.
- **Begutachtung** nach Abschnitt 7.

## 9. Nicht Teil dieser Spezifikation

Mini-ALLBUS als Lehrdatensatz (Vorschlag F), der Lernpfad, die Karte selbst (Anordnung, Beschriftungen), neue Begriffe.
