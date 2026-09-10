# mariposa im Statistikatlas

Stand: 10. September 2026, lokaler Paketquellstand **0.7.2**.

Alle **80 öffentlichen Exporte** sind genau einem fachlichen Kartenknoten zugeordnet. Der Atlas enthält **104 Bausteine** und **236 kanonische Verbindungen** in acht räumlichen Bereichen. Ein Alias oder Dateiformat benötigt keine eigene isolierte Verfahrenskarte. Varianten ergänzen die Formel- und Aufrufauswahl innerhalb einer Karte.

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

110 auswählbare Aufrufvarianten: 108 am Quellstand 0.7.2 ausgeführt, zwei Importbeispiele (POR und native SAS-Datei) geparst; diese benötigen externe Quelldateien. Zusätzlich wurde der von Spearman aus erreichbare Pearson-Aufruf auf mittleren Rängen ausgeführt: insgesamt 109 erfolgreiche Ausführungen und zwei reine Syntaxprüfungen.

SAV, DTA, XPT und XLSX wurden in einem temporären Verzeichnis geschrieben und wieder eingelesen. R 4.5.3; der Paketquellbaum wurde mit pkgload ohne Installation oder Änderungen geladen. Die vorhandene mariposa-Installation 0.6.0 wurde nicht ersetzt.

Cramér-V und Gamma rufen intern auch den χ²-Test auf. In den synthetischen Beispieltabellen entstehen erwartete Warnungen wegen kleiner erwarteter Zellhäufigkeiten. Diese betreffen die asymptotische Testnäherung, nicht die deskriptive Berechnung der Zusammenhangsmaße.

55 automatisierte TypeScript-/SSR-Tests prüfen insbesondere Datenmigration, Skalenniveaus, alle Formelreferenzen, Variantenpfade, kollisionsfreie feste Positionen, X/Y- und Rangkontext in den R-Aufrufen sowie vollständige Verlaufseinträge. Kein Browser-Interaktionstest wurde durchgeführt. Die optionale WebMCP-Registrierung wurde mit einem Testkontext geprüft; eine unterstützte reale Browser-WebMCP-Umgebung war nicht verfügbar.

## Prüfung wiederholen

```sh
node --import tsx scripts/generate-mariposa-check.ts /tmp/atlas-check /pfad/zu/mariposa
Rscript --vanilla scripts/verify-mariposa.R /pfad/zu/mariposa /tmp/atlas-check
```

Der Generator vergleicht den tatsächlichen NAMESPACE mit dem katalogisierten öffentlichen API. Die Ergebnisse stehen im Prüfverzeichnis als results.json. Voraussetzung: pkgload, jsonlite und die Imports bzw. benötigten Suggests des Pakets.

## Fachliche Abgrenzungen

- R-Aufrufe werden im Atlas nur erzeugt. Die bestehenden Basisrechnungen laufen im Browser; er zeigt keine erfundenen Ergebnisse komplexer mariposa-Verfahren.
- Formelvarianten, Gewichte und Fallauswahl folgen dem geprüften Quellcode. Abweichungen zur Dokumentation werden in den betreffenden Karten benannt.
- Numerische Originalcodes bleiben erhalten. Gruppen und kategoriale Modellprädiktoren werden gezielt als ungeordnete Faktoren mit Codebuchreihenfolge erzeugt. Regressionen setzen Treatment-Kontraste ausdrücklich; Typ-III-ANOVA/ANCOVA bestimmen ihre Kontraste selbst.
- Die fünf Methodenitems sind ein gemeinsamer synthetischer Lehrblock, keine validierte Skala. Die bisherigen Einzelitems mit 5, 7 und 10 Stufen bleiben eigenständig.
- 140 registrierte S3-Methoden werden bei den zugehörigen Ergebnisobjekten erläutert; optional kommen sechs broom-Methoden hinzu. Sie werden nicht als zusätzliche öffentliche Exporte gezählt.
- Paketdatensätze survey_data und longitudinal_data(_wide) sind vom Atlasdatensatz mit 200 Personen getrennt.
