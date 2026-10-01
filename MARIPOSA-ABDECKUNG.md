# mariposa im Statistikatlas

Stand: 1. Oktober 2026, Referenzversion **mariposa 0.7.4** (lokaler Paketquellstand). Erste Fassung: 10. September 2026 mit 0.7.2.

Alle **80 öffentlichen Exporte** sind genau einem fachlichen Kartenknoten zugeordnet. 0.7.4 exportiert zusätzlich den Pipe-Operator `%>%` (Re-Export aus dplyr) und die Ersetzungsform `var_label<-`; beide zählen nicht als eigene Funktionen (`scripts/mariposa-public-api.json`). Der Atlas enthält **159 Bausteine** und **486 kanonische Verbindungen** in zwölf räumlichen Bereichen. Ein Alias oder Dateiformat benötigt keine eigene isolierte Verfahrenskarte. Varianten ergänzen die Formel- und Aufrufauswahl innerhalb einer Karte.

55 neue Grundlagen und 143 direkte Einordnungsverbindungen ergänzen die Verfahren. Der aktuelle Gesamtprüfstand umfasst 71 Tests. Details: [GRUNDLAGEN-ABDECKUNG.md](GRUNDLAGEN-ABDECKUNG.md). Die 80 Exporte und ihre 110 Aufrufvarianten bleiben unverändert.

## Abdeckungsmatrix

| Öffentlicher Export | Erklärung im Atlas | Karten-ID |
|---|---|---|
| `ancova` | Kovarianzanalyse · ANCOVA | `ancova` |
| `binomial_test` | Binomialtest | `binomial_test` |
| `center` | Zentrieren | `centering` |
| `chi_square` | Chi-Quadrat · Unabhängigkeit | `chi_square` |
| `chisq_gof` | Chi-Quadrat · Anpassung | `chisq_gof` |
| `codebook` | Codebuch & Variablensuche | `codebook` |
| `copy_labels` | Variablen- & Wertelabels | `labels` |
| `cramers_v` | Cramér-V | `cramers_v` |
| `crosstab` | Kreuztabelle | `crosstab` |
| `describe` | Deskriptiver Überblick | `describe` |
| `drop_labels` | Variablen- & Wertelabels | `labels` |
| `dunn_test` | Dunn-Vergleiche | `dunn_test` |
| `efa` | Komponenten- & Faktorenanalyse | `efa` |
| `factorial_anova` | Mehrfaktorielle ANOVA | `factorial_anova` |
| `find_var` | Codebuch & Variablensuche | `codebook` |
| `fisher_test` | Fisher · exakter Test | `fisher_test` |
| `fre` | Häufigkeiten | `frequency` |
| `frequency` | Häufigkeiten | `frequency` |
| `friedman_test` | Friedman | `friedman_test` |
| `goodman_gamma` | Goodman–Kruskal-Gamma | `goodman_gamma` |
| `kendall_tau` | Kendall Tau-b | `kendall_tau` |
| `kruskal_wallis` | Kruskal–Wallis | `kruskal_wallis` |
| `levene_test` | Levene & Brown–Forsythe | `levene_test` |
| `linear_regression` | Lineare Regression | `linear_regression` |
| `logistic_regression` | Logistische Regression | `logistic_regression` |
| `mann_whitney` | Mann–Whitney-U | `mann_whitney` |
| `marginal_effects` | Marginale Effekte | `marginal_effects` |
| `mcnemar_test` | McNemar | `mcnemar_test` |
| `multiple_response` | Mehrfachantworten | `multiple_response` |
| `na_frequencies` | Missing-Codes aufbereiten | `missing_tools` |
| `normality_test` | Normalverteilung prüfen | `normality_test` |
| `oneway_anova` | Einfaktorielle ANOVA | `oneway_anova` |
| `pairwise_wilcoxon` | Paarweiser Wilcoxon | `pairwise_wilcoxon` |
| `partial_cor` | Partielle Korrelation | `partial_cor` |
| `pearson_cor` | Pearson-Korrelation | `pearson` |
| `phi` | Phi | `phi` |
| `pomps` | POMPS · Skalen auf 0–100 | `pomps` |
| `read_por` | Daten nach R einlesen | `data_import` |
| `read_sas` | Daten nach R einlesen | `data_import` |
| `read_spss` | Daten nach R einlesen | `data_import` |
| `read_stata` | Daten nach R einlesen | `data_import` |
| `read_xlsx` | Daten nach R einlesen | `data_import` |
| `read_xpt` | Daten nach R einlesen | `data_import` |
| `rec` | Rekodieren & Umpolen | `recode` |
| `reliability` | Reliabilität · Alpha & Omega | `reliability` |
| `row_count` | Rechnen innerhalb einer Person | `row_operations` |
| `row_means` | Rechnen innerhalb einer Person | `row_operations` |
| `row_sums` | Rechnen innerhalb einer Person | `row_operations` |
| `scheffe_test` | Scheffé-Paarvergleiche | `scheffe_test` |
| `set_na` | Missing-Codes aufbereiten | `missing_tools` |
| `spearman_rho` | Spearman-Korrelation | `spearman` |
| `std` | Standardisieren | `z` |
| `strip_tags` | Missing-Codes aufbereiten | `missing_tools` |
| `t_test` | t-Test | `t_test` |
| `to_character` | Datentypen umwandeln | `conversion` |
| `to_dummy` | Dummyvariablen | `dummy` |
| `to_label` | Datentypen umwandeln | `conversion` |
| `to_labelled` | Datentypen umwandeln | `conversion` |
| `to_numeric` | Datentypen umwandeln | `conversion` |
| `tukey_test` | Tukey-Paarvergleiche | `tukey_test` |
| `unlabel` | Variablen- & Wertelabels | `labels` |
| `untag_na` | Missing-Codes aufbereiten | `missing_tools` |
| `val_labels` | Variablen- & Wertelabels | `labels` |
| `var_label` | Variablen- & Wertelabels | `labels` |
| `w_iqr` | Quantile & Interquartilsabstand | `quantile` |
| `w_kurtosis` | Schiefe & Kurtosis | `shape` |
| `w_mean` | Mittelwert | `mean` |
| `w_median` | Median | `median` |
| `w_modus` | Modus | `mode` |
| `w_quantile` | Quantile & Interquartilsabstand | `quantile` |
| `w_range` | Spannweite | `range` |
| `w_sd` | Standardabweichung | `sd` |
| `w_se` | Standardfehler | `se` |
| `w_skew` | Schiefe & Kurtosis | `shape` |
| `w_var` | Varianz | `variance` |
| `wilcoxon_test` | Wilcoxon · verbunden | `wilcoxon_test` |
| `write_spss` | Daten & Ergebnisse weitergeben | `data_export` |
| `write_stata` | Daten & Ergebnisse weitergeben | `data_export` |
| `write_xlsx` | Daten & Ergebnisse weitergeben | `data_export` |
| `write_xpt` | Daten & Ergebnisse weitergeben | `data_export` |

## Prüfung

Stand 1. Oktober 2026, mariposa-Quellstand 0.7.4, R 4.5.3, der Paketquellbaum mit pkgload geladen (ohne Installation; installiert ist 0.7.3).

Alle 110 Aufrufvarianten beginnen mit dem Startblock `library(dplyr)`, `library(mariposa)`, `atlas <- read_spss("Statistikatlas-200-Befragte.sav")` und laufen auf der SPSS-Datei, die der Atlas selbst schreibt (`src/domain/savWriter.ts`): 108 ausgeführt ohne Fehler, zwei Importbeispiele (POR und native SAS-Datei) nur geparst, weil mariposa diese Formate nicht schreiben kann. Fünf Zusatzwege, die die Voreinstellungen nicht erreichen, liefen ebenfalls fehlerfrei: Pearson auf mittleren Rängen (von Spearman aus) sowie lineare und logistische Regression und marginale Effekte mit kategorialen Prädiktoren. Warnungen: nur Cramér-V und Gamma (kleine erwartete Zellhäufigkeiten im intern berechneten χ²-Test).

`scripts/verify-sav.R` liest die SPSS-Datei mit `read_spss()` und `haven::read_sav()`: alle 200 × 29 Werte stimmen mit der CSV überein, Variablenlabels (Fragetexte) und Wertelabels (Antwortkategorien) sind vollständig.

SAV, DTA, XPT und XLSX werden in den Importbeispielen geschrieben und wieder eingelesen. Das Dateilabel der SPSS-Datei hat höchstens 40 Zeichen, weil `write_xpt()` es als Label des Datensatzes übernimmt und haven längere ablehnt.

Cramér-V und Gamma rufen intern auch den χ²-Test auf. In den synthetischen Beispieltabellen entstehen erwartete Warnungen wegen kleiner erwarteter Zellhäufigkeiten. Diese betreffen die asymptotische Testnäherung, nicht die deskriptive Berechnung der Zusammenhangsmaße.

Die Ausgaben aller 110 Aufrufe auf den Ausgangsdaten erfasst `scripts/capture-r-output.R` in `src/explain/fixtures/r-output/catalog.json` (geladen über `src/explain/catalogOutput.ts`); für die Leitaufrufe (`describe()`, `pearson_cor()`, `summarise(cov())`, `frequency()`) erzeugt `src/explain/rOutput.ts` die Ausgabe im Browser aus den aktuellen Daten, zeichengenau gegen die Referenzausgaben geprüft: drei Datenstände, Zusatzfälle (ungerade Summe, fehlende Werte, breite Tabellen, p-Sterne) und die Kennwertzeile von `frequency(lernplanung5)` für alle 348 Einzeländerungen um ±1.

**Plattform der Referenzausgaben.** `mean()` rechnet in R in zwei Durchgängen (Summe / n, dann Korrektur um Σ(x − Mittel) / n), in `long double`, wo es das gibt. Bei 200 ganzzahligen Antworten mit ungerader Summe liegt der Mittelwert genau auf x.xx5, und die zweite Nachkommastelle in `frequency()` hängt von dieser Rechnung ab (Beispiel: Summe 653, R druckt `mean=3.26`, die einfache Summe / n ergäbe 3.27). Die Referenz ist R 4.5.3 auf Apple Silicon (aarch64, ohne `long double`); `rOutput.ts` rechnet genauso. Auf x86_64 summiert R in 80 Bit und kann an solchen Grenzen auf der anderen Seite landen; Studierende mit Intel- oder Windows-Rechnern sehen dann vereinzelt eine um 0,01 abweichende Kennwertzeile.

## Codestil der Aufrufe

- Pipe-Stil nach dem Startblock: `atlas %>% fn(…)`; Spalten entstehen mit `mutate()`, Umkodieren mit `rec()` in `mutate()`. Kein `d$`, kein `factor()`, kein `ifelse()`, kein `read.csv2()`.
- Gruppen (`t_test`, `oneway_anova`, `levene_test`, `mann_whitney`, `kruskal_wallis` und die Post-hoc-Tests) und Faktoren (`factorial_anova`, `ancova`) nutzen die Wertelabels der `.sav`-Datei direkt; die R-Prüfung zeigt dieselben Freiheitsgrade wie mit Faktoren. Die erste Gruppe ist der kleinere Code.
- Nur kategoriale Prädiktoren mit mehr als zwei Stufen in `linear_regression()`, `logistic_regression()` und `marginal_effects()` werden zu Faktoren: `mutate(x = rec(x, rules = "else=copy", as_factor = TRUE))`. Ohne diesen Schritt gehen gelabelte Prädiktoren wie in SPSS REGRESSION mit ihren Zahlencodes ein (mariposa weist in `summary()` darauf hin). 0/1-Indikatoren bleiben Zahlen; die Koeffizienten sind dieselben.
- Einheitsgewichte: `mutate(gewicht = 1)` mit dem Hinweis „Gewichte von 1 ändern nichts. So sieht der Aufruf mit Gewicht aus; im ALLBUS heißt das Gewicht wghtpew.“
- `binomial_test()`: Gruppe 1 ist wie in SPSS die Kategorie der ersten Person mit gültigem Wert (im Lehrdatensatz P001, Weiterbildung = Ja).

## Hinweise für Lehrende (nicht im Studierenden-UI)

- Die Karten nennen keine Paketinterna mehr („Geprüft an mariposa …“, Namespace, Quellstand). Der Atlas rechnet die Basiskennwerte selbst; komplexe Verfahren laufen in R, ihre Ausgabe für die Ausgangsdaten stammt aus `catalog.json`.
- Kendalls Tau gewichtet: Der Kernel verwendet √(wᵢwⱼ) als Paargewicht; die Paketdokumentation beschrieb das (Stand 0.7.2) nicht durchgängig so.
- Mann-Whitney mit `mu ≠ 0`: In 0.7.2 passten berichtete unverschobene U/Z und der verschobene p-Wert nicht durchgängig zusammen. In 0.7.4 stimmen U und p mit `wilcox.test(…, mu = 1, exact = FALSE, correct = FALSE)` überein (U = 4062, p = 0,054 für Lernzeit nach Weiterbildung). Die Beispiele verwenden `mu = 0`.
- `codebook()` in der Pipe meldet „Codebook: .“, weil der Datensatzname aus dem Aufruf gelesen wird; mit `codebook(atlas)` steht dort „atlas“.
- `write_xpt()` übernimmt das Label des Datensatzes (`attr(data, "label")`) und bricht bei mehr als 40 Zeichen ab (haven). Eine `.sav`-Datei mit langem Dateilabel lässt sich daher nicht ohne Weiteres als XPT schreiben.

## Prüfung wiederholen

```sh
node --import tsx scripts/generate-mariposa-check.ts /tmp/atlas-check /pfad/zu/mariposa
Rscript --vanilla scripts/verify-mariposa.R /pfad/zu/mariposa /tmp/atlas-check
Rscript --vanilla scripts/verify-sav.R /pfad/zu/mariposa /tmp/atlas-check
Rscript --vanilla scripts/capture-r-output.R /pfad/zu/mariposa /tmp/atlas-check src/explain/fixtures/r-output
```

Der Generator vergleicht den tatsächlichen NAMESPACE mit dem katalogisierten öffentlichen API und schreibt die SPSS-Datei über `writeSav()`, die CSV, eine Labelreferenz und `start.R` (= Startblock). Die Ergebnisse stehen im Prüfverzeichnis als results.json. Nach Änderungen an den Codevorlagen `capture-r-output.R` erneut ausführen; `src/explain/rOutput.test.ts` meldet veraltete Katalogausgaben. Voraussetzung: pkgload, jsonlite, haven, dplyr und die Imports bzw. benötigten Suggests des Pakets.

## Fachliche Abgrenzungen

- R-Aufrufe werden im Atlas nur erzeugt. Die bestehenden Basisrechnungen laufen im Browser; er zeigt keine erfundenen Ergebnisse komplexer mariposa-Verfahren.
- Formelvarianten, Gewichte und Fallauswahl folgen dem geprüften Quellcode. Abweichungen zur Dokumentation stehen oben unter „Hinweise für Lehrende“, nicht in den Karten.
- Numerische Originalcodes bleiben erhalten; die Wertelabels der `.sav`-Datei tragen die Kategorien. Kategoriale Regressionsprädiktoren mit mehr als zwei Stufen werden mit `rec(…, as_factor = TRUE)` zu ungeordneten Faktoren in Codebuchreihenfolge (Treatment-Kontraste, erste Stufe als Referenz); Typ-III-ANOVA/ANCOVA bestimmen ihre Kontraste selbst.
- Die fünf Methodenitems sind ein gemeinsamer synthetischer Lehrblock, keine validierte Skala. Die bisherigen Einzelitems mit 5, 7 und 10 Stufen bleiben eigenständig.
- 140 registrierte S3-Methoden werden bei den zugehörigen Ergebnisobjekten erläutert; optional kommen sechs broom-Methoden hinzu. Sie werden nicht als zusätzliche öffentliche Exporte gezählt.
- Paketdatensätze survey_data und longitudinal_data(_wide) sind vom Atlasdatensatz mit 200 Personen getrennt.
