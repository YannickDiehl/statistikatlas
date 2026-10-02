# Grundlagen im Statistikatlas

Stand: 10. September 2026. Alle 55 vorgeschlagenen neuen Bausteine sind umgesetzt. Insgesamt 159 Kartenknoten und 486 Verbindungen, davon 143 direkte Einordnungsverbindungen, in zwölf transparenten Themenbereichen. Bestehende Grundlagen wie p-Wert, Konfidenzintervall, Standardfehler, Effektgröße, Likelihood, Residuen und multiples Testen bleiben erhalten und sind enger mit den Verfahren verbunden.

## Interaktionen und Zusammenhang

Jede neue Karte enthält eine Erklärung, verknüpfte Formeln, fachliche Hinweise, Quellen und ein Experiment. Einordnungskanten führen direkt von einem Verfahren zu seiner Ergebnisdeutung und zurück. Sie sind keine rekursiven Recheneingänge. Spalten, Route, Rangbasis und Verfahrensvariante bleiben beim Erkunden der Grundlagen für die Rückkehr erhalten. Hover verändert keine Anordnung; optionale Gravitation und Verlauf bleiben nutzbar.

## Abdeckung

### Wahrscheinlichkeit und Verteilungen

| Baustein | ID |
|---|---|
| Ereignis & Wahrscheinlichkeit | `probability` |
| Bedingte Wahrscheinlichkeit | `conditional_probability` |
| Stochastische Unabhängigkeit | `stochastic_independence` |
| Zufallsvariable & beobachteter Wert | `random_variable` |
| Empirische Verteilung | `empirical_distribution` |
| Theoretische Verteilung | `theoretical_distribution` |
| Diskret & stetig | `discrete_continuous` |
| Wahrscheinlichkeitsmasse | `probability_mass` |
| Dichte & Fläche | `density_function` |
| Kumulierte Wahrscheinlichkeit | `cumulative_probability` |
| Theoretisches Quantil | `theoretical_quantile` |
| Normalverteilung | `normal_distribution` |
| Standardnormalverteilung | `standard_normal` |
| t-Verteilung | `t_distribution` |
| χ²-Verteilung | `chi_square_distribution` |
| F-Verteilung | `f_distribution` |
| Bernoulli-Verteilung | `bernoulli_distribution` |
| Binomialverteilung | `binomial_distribution` |
| Hypergeometrische Verteilung | `hypergeometric_distribution` |

### Stichproben und Inferenz

| Baustein | ID |
|---|---|
| Grundgesamtheit & Parameter | `population_parameter` |
| Schätzer & Schätzung | `estimator` |
| Erwartungswert | `expectation` |
| Populationsvarianz | `population_variance` |
| Stichprobenverteilung | `sampling_distribution` |
| Verzerrung & Zufallsfehler | `sampling_bias` |
| Gesetz der großen Zahlen | `law_large_numbers` |
| Zentraler Grenzwertsatz | `central_limit` |
| Nullverteilung | `null_distribution` |
| Einseitig & zweiseitig testen | `test_sides` |
| Signifikanzniveau α | `alpha_level` |
| Kritischer Wert & Ablehnungsbereich | `critical_value` |
| Fehler erster & zweiter Art | `type_errors` |
| Teststärke (Power) | `power` |
| Freiheitsgrade im Modell | `general_df` |
| Exakte Verteilung & Näherung | `exact_asymptotic` |
| Zufallsauswahl | `random_sampling` |

### Modelle, Voraussetzungen und Kausalität

| Baustein | ID |
|---|---|
| Gleiche Fehlervarianz | `variance_assumption` |
| Ausreißer & Einfluss | `outliers_influence` |
| Multikollinearität | `multicollinearity` |
| Erklärter Varianzanteil (R²) | `explained_variance` |
| Überanpassung | `overfitting` |
| Vorhersageintervall | `prediction_interval` |
| Confounding (gemeinsame Ursachen) | `confounding` |
| Kausalität: Was würde sich ändern? | `causality` |
| Zufällige Zuweisung | `random_assignment` |

### Messung und Skalenbildung

| Baustein | ID |
|---|---|
| Operationalisierung | `operationalization` |
| Messfehler | `measurement_error` |
| Validität | `validity` |
| Dimensionalität | `dimensionality` |
| Korrelationsmatrix | `correlation_matrix` |
| Ladungen | `loadings` |
| Eigenwerte | `eigenvalues` |
| Kommunalität | `communality` |
| Rotation | `rotation` |
| Warum fehlen Angaben? | `missing_mechanisms` |

## Interaktive Experimente

- Verteilungen: acht Familien mit veränderbaren Parametern, Masse bzw. Dichte, kumulierter Wahrscheinlichkeit, Quantilen und Momenten. Eine veränderbare Vierfeldertafel zeigt gemeinsame und bedingte Wahrscheinlichkeiten.
- Stichproben: Histogramme der Einzelwerte und der Mittelwerte, laufender Mittelwert, Standardfehler und wiederholte Konfidenzintervalle. Anzahl Fälle, Wiederholungen und Ausgangsverteilung sind veränderbar.
- Inferenz: p-Werte, ein- und zweiseitige Ablehnungsbereiche, α, Konfidenzintervall, Fehlerarten und Power. Exakte Binomial-Randwahrscheinlichkeiten lassen sich mit einer Normalnäherung vergleichen.
- Datenverteilung und Selektionsverzerrung: veränderbare Klassen und ein Beispiel für selektives Fehlen anhand des aktuellen Lehrdatensatzes.
- Regression: veränderbare Streuung und einflussreicher Punkt, OLS, R², Konfidenz- und Vorhersageintervalle. Ein Polynomexperiment vergleicht Trainingsfehler und Fehler an unabhängigen Testfällen.
- Konfundierung: veränderbare Zusammensetzung zweier Gruppen aus zwei Schichten und Vergleich aggregierter mit schichtspezifischen Ergebnissen.
- Messung: zufälliger Fehler, systematische Verschiebung und Zuverlässigkeit. Eine analytische Zwei-Variablen-PCA zeigt Dimensionen, Ladungen, Rotation, Eigenwerte, Kommunalitäten und VIF.

## Fachliche Grenzen

- Modellverteilungen und künstliche Experimente sind ausdrücklich von den 200 synthetischen Befragten getrennt. Nur empirische Verteilung und Selektionssimulation verwenden den aktuellen Lehrdatensatz; die Simulation ändert die Originaldaten nicht.
- Dichtehöhe ist keine Wahrscheinlichkeit. Diskrete CDFs enthalten die Masse am Grenzwert; ein diskretes Quantil kann den gesuchten Anteil überschreiten. Kurven zeigen einen begrenzten Ausschnitt, Wahrscheinlichkeiten verwenden das vollständige Modell.
- Das Inferenzexperiment verwendet einen Normaltest mit bekannter Populationsstreuung gegen μ₀ = 0. Die Intervalle sind immer zweiseitig. Es ist kein berechnetes mariposa-Ergebnis. Power verwendet eine vorgegebene wahre Alternative, nicht den beobachteten Effekt; außerhalb von H₁ wird die Ablehnungswahrscheinlichkeit entsprechend beschriftet.
- Wiederholte Mittelwertintervalle sind im Normalmodell mit bekannter Streuung exakt, sonst Normalnäherungen. Mehr Wiederholungen verbessern die Simulation; mehr Fälle pro Stichprobe verringern den Standardfehler. Das Gesetz der großen Zahlen garantiert keinen monotonen einzelnen Verlauf.
- Die klassischen OLS-t-Intervalle setzen die genannten Modellannahmen voraus. Bei bewusst eingeschalteter Heteroskedastizität oder einflussreichen Fällen sind sie keine verlässlich kalibrierten Intervalle.
- Das Faktorenexperiment zeigt PCA mit zwei standardisierten Variablen und orthogonaler Rotation; es führt keine EFA aus. Bei einer Komponente ist die dargestellte Matrix eine Approximation der ursprünglichen Korrelationsmatrix. Ihre Diagonalen sind die Kommunalitäten und nicht zwingend 1.
- Die Zuverlässigkeit im Messbeispiel ist weder berechnetes Alpha noch Omega. Hohe Zuverlässigkeit beweist keine Validität.
- Die Missing-Simulation zeigt selektives Fehlen nach dem Wert selbst (MNAR). MCAR und MAR sind als Konzepte erklärt; ein beobachteter Datensatz allein identifiziert den Missing-Mechanismus nicht.

## Prüfung

71 Tests prüfen Numerik, Quellen- und Formelziele, azyklische Voraussetzungen, direkte Einordnungskanten, Variantenkontext, überlappungsfreie Positionen und serverseitiges Rendern aller 55 Experimente. Die unabhängige R-4.5.3-Referenz umfasst 85 Dichte-/Masse-/CDF-Punkte und 99 Quantile über acht Verteilungsfamilien sowie 74 Normaltest-Power-Fälle. TypeScript, Produktionsbuild und eigenständiger Offline-Export gehören zum Abschluss. Keine Browser-Interaktions- oder visuelle Geräteprüfung in diesem Umsetzungslauf.

Quellen stehen in den Karten unter „Fachlich nachlesen“. Die Referenzwerte in `src/domain/foundations/r-reference.json` stammen aus R stats und verwenden keine Atlas-Funktion.
