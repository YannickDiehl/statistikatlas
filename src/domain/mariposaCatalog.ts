import { foundationEntries } from './foundations/catalog';
// Audited against the local mariposa 0.7.4 source and NAMESPACE (scripts/verify-mariposa.R), 2026-10-01.
// Code templates use the pipe style of the start block (src/domain/mariposa.ts): atlas %>% fn(…).
// Formula tokens link to the same permanent concepts as the map edges.
export type RoleKind='quantitative'|'ordered'|'category'|'twoGroups'|'binary'|'continuous'|'items'|'repeated'|'pairedBinary'|'multiple'|'predictor'|'factors'|'interaction'|'likert';
export type ColumnRole={key:string;label:string;kind:RoleKind;default:string[];many:boolean};
export type MethodVariant={label:string;fn:string;code:string;roles?:ColumnRole[];formula?:string;note?:string;external?:boolean};
export type AtlasEntry={id:string;title:string;region:string;intro:string;formula:string;requires:{id:string;reason:string}[];notes:string[];output:string;variants:MethodVariant[];roles:ColumnRole[];existing:boolean;lab?:string;inputExclusions?:string[];sources?:{title:string;url:string}[]};
export const mariposaVersion='0.7.4';
export const mariposaExports:string[]=["ancova", "binomial_test", "center", "chi_square", "chisq_gof", "codebook", "copy_labels", "cramers_v", "crosstab", "describe", "drop_labels", "dunn_test", "efa", "factorial_anova", "find_var", "fisher_test", "fre", "frequency", "friedman_test", "goodman_gamma", "kendall_tau", "kruskal_wallis", "levene_test", "linear_regression", "logistic_regression", "mann_whitney", "marginal_effects", "mcnemar_test", "multiple_response", "na_frequencies", "normality_test", "oneway_anova", "pairwise_wilcoxon", "partial_cor", "pearson_cor", "phi", "pomps", "read_por", "read_sas", "read_spss", "read_stata", "read_xlsx", "read_xpt", "rec", "reliability", "row_count", "row_means", "row_sums", "scheffe_test", "set_na", "spearman_rho", "std", "strip_tags", "t_test", "to_character", "to_dummy", "to_label", "to_labelled", "to_numeric", "tukey_test", "unlabel", "untag_na", "val_labels", "var_label", "w_iqr", "w_kurtosis", "w_mean", "w_median", "w_modus", "w_quantile", "w_range", "w_sd", "w_se", "w_skew", "w_var", "wilcoxon_test", "write_spss", "write_stata", "write_xlsx", "write_xpt"];
export const mariposaEntries:AtlasEntry[]=[
 {
  "id": "sampling",
  "title": "Stichprobe & Unabhängigkeit",
  "region": "inference",
  "intro": "Eine Stichprobe liefert Informationen über eine größere Grundgesamtheit. Das Erhebungsdesign bestimmt, welche Schlüsse tragfähig sind. Unabhängig bedeutet: Eine Person liefert keine Information über den Zufallsfehler einer anderen.",
  "formula": "[[X₁, …, Xₙ|series|Beobachtungen aus der Grundgesamtheit]]",
  "requires": [],
  "notes": [
   "200 synthetische Personen sind ein Lehrbeispiel; sie sind keine Zufallsstichprobe einer realen Bevölkerung.",
   "Cluster, Strata und Auswahlwahrscheinlichkeiten erfordern passende Designverfahren. Ein weights-Argument allein berücksichtigt sie nicht."
  ],
  "output": "Das Studiendesign lässt sich nicht mit einem einzigen Test aus der Datentabelle beweisen.",
  "variants": [],
  "roles": [],
  "existing": false
 },
 {
  "id": "hypothesis",
  "title": "Null- & Alternativhypothese",
  "region": "inference",
  "intro": "Formuliere vor der Rechnung, welche Aussage geprüft wird. Die Nullhypothese legt den Vergleich fest; die Alternative beschreibt die Abweichung, die dich interessiert.",
  "formula": "H₀: μ = μ₀; H₁: μ ≠ μ₀; [[x̄|mean|Schätzer für den Populationsmittelwert μ]]",
  "requires": [
   {
    "id": "sampling",
    "reason": "begründet die Zufallsannahmen"
   }
  ],
  "notes": [
   "Eine gerichtete Alternative (größer/kleiner) sollte inhaltlich vor der Analyse feststehen.",
   "Die Nullhypothese wird verworfen oder nicht verworfen; ein großer p-Wert bestätigt sie nicht."
  ],
  "output": "Bei Gruppenvergleichen kann die Nullhypothese gleiche Mittelwerte oder gleiche Verteilungen betreffen. Das ist nicht dieselbe Aussage.",
  "variants": [],
  "roles": [],
  "existing": false
 },
 {
  "id": "se",
  "title": "Standardfehler",
  "region": "inference",
  "intro": "Die Standardabweichung beschreibt einzelne Personen. Der Standardfehler beschreibt, wie eine Schätzung zwischen wiederholten Stichproben schwanken würde.",
  "formula": "SE(x̄) = [[s|sd|Streuung der Einzelwerte]] / √[[n|validn|Anzahl unabhängiger Fälle]]",
  "requires": [
   {
    "id": "sampling",
    "reason": "trägt die Formel für unabhängige Fälle"
   }
  ],
  "notes": [
   "Diese Formel gilt für den ungewichteten Mittelwert unabhängiger, gleich verteilter Beobachtungen.",
   "Bei Gewichten, Abhängigkeiten oder Modellen muss der Standardfehler zum Schätzverfahren passen."
  ],
  "output": "Viermal so viele unabhängige Fälle halbieren bei gleichem s den Standardfehler.",
  "variants": [
   {
    "label": "Standardfehler des Mittels",
    "fn": "w_se",
    "code": "atlas %>%\n  w_se({x})"
   },
   {
    "label": "Einheitsgewichte",
    "fn": "w_se",
    "code": "atlas %>%\n  mutate(gewicht = 1) %>%\n  w_se({x}, weights = gewicht)",
    "note": "Gewichte von 1 ändern nichts. So sieht der Aufruf mit Gewicht aus; im ALLBUS heißt das Gewicht wghtpew."
   }
  ],
  "roles": [
   {
    "key": "x",
    "label": "Zielvariable",
    "kind": "quantitative",
    "default": [
     "lernzeit"
    ],
    "many": false
   }
  ],
  "existing": false,
  "lab": "se"
 },
 {
  "id": "test_statistic",
  "title": "Prüfgröße & Referenzverteilung",
  "region": "inference",
  "intro": "Eine Prüfgröße fasst zusammen, wie weit die Daten von der Nullhypothese abweichen. Ihre Referenzverteilung beschreibt Werte, die unter der Nullhypothese und dem Modell zu erwarten wären.",
  "formula": "t = ([[x̄|mean|Geschätzter Mittelwert]] − [[μ₀|hypothesis|Vergleichswert unter H₀]]) / [[SE|se|Standardfehler]]",
  "requires": [
   {
    "id": "hypothesis",
    "reason": "legt den Vergleich fest"
   }
  ],
  "notes": [
   "t-, F- und χ²-Verteilungen sind verschiedene Referenzen; ihre Freiheitsgrade hängen vom jeweiligen Modell ab.",
   "n − 1 ist kein universeller Freiheitsgrad: etwa n − 2 bei einem Pearson-Test, (r − 1)(c − 1) bei Kreuztabellen."
  ],
  "output": "Eine große absolute t-Prüfgröße liegt weiter von der Null entfernt; bei F und χ² ist typischerweise der rechte Rand relevant.",
  "variants": [],
  "roles": [],
  "existing": false
 },
 {
  "id": "p_value",
  "title": "p-Wert",
  "region": "inference",
  "intro": "Der p-Wert ist unter der Nullhypothese und den Modellannahmen die Wahrscheinlichkeit einer mindestens ebenso extremen Prüfgröße. Er sagt nicht, wie wahrscheinlich die Nullhypothese wahr ist.",
  "formula": "p = P([[T|test_statistic|Prüfgröße unter H₀]] mindestens so extrem wie beobachtet | [[H₀|hypothesis|Nullhypothese]])",
  "requires": [],
  "notes": [
   "Ein kleines p beschreibt Unvereinbarkeit mit dem Nullmodell. Es misst weder die Effektstärke noch die praktische Bedeutung.",
   "Die Entscheidungsschwelle α wird vor der Analyse festgelegt. Viele Tests benötigen eine gemeinsame Fehlerkontrolle."
  ],
  "output": "Berichte möglichst den p-Wert gemeinsam mit Effekt, Unsicherheit und inhaltlicher Bedeutung.",
  "variants": [],
  "roles": [],
  "existing": false
 },
 {
  "id": "confidence",
  "title": "Konfidenzintervall",
  "region": "inference",
  "intro": "Ein Konfidenzintervall zeigt einen Bereich, den ein Schätzverfahren mit festgelegter langfristiger Überdeckungsrate erzeugt. Bei 95 % überdecken 95 % solcher Intervalle den festen Parameter, wenn Modell und Verfahren stimmen.",
  "formula": "[[Schätzung|mean|Punktschätzung]] ± [[kritischer Wert|test_statistic|Passende Referenzverteilung]] · [[SE|se|Standardfehler der Schätzung]]",
  "requires": [],
  "notes": [
   "Das konkrete frequentistische Intervall gibt dem festen Parameter keine nachträgliche 95-%-Wahrscheinlichkeit.",
   "Symmetrische Intervalle sind nur eine Form; exakte Binomial- und transformierte Intervalle können asymmetrisch sein."
  ],
  "output": "Breite bedeutet Unsicherheit. Ein enger Bereich kann trotzdem inhaltlich klein oder groß sein.",
  "variants": [],
  "roles": [],
  "existing": false
 },
 {
  "id": "effect",
  "title": "Effektgröße",
  "region": "inference",
  "intro": "Effektgrößen beschreiben, wie stark ein Unterschied oder Zusammenhang ist. Sie ergänzen den p-Wert und brauchen eine inhaltliche Interpretation.",
  "formula": "d = ([[x̄₁ − x̄₂|mean|Mittelwertunterschied]]) / [[sₚ|sd|Gepoolte Standardabweichung]]",
  "requires": [],
  "notes": [
   "Cohen-d ist ein standardisierter Mittelwertunterschied; Hedges-g korrigiert dessen kleinen Stichprobenbias.",
   "r, Cramér-V, partielles η² und Odds Ratios messen verschiedene Aspekte. Es gibt keine universell passenden Stärkeschwellen."
  ],
  "output": "Die passende Effektgröße folgt aus Fragestellung und Verfahren.",
  "variants": [],
  "roles": [],
  "existing": false
 },
 {
  "id": "multiplicity",
  "title": "Mehrere Vergleiche",
  "region": "inference",
  "intro": "Wer viele Hypothesen prüft, schafft mehrere Gelegenheiten für Fehlentscheidungen. Lege die Familie der Vergleiche fest und wähle die passende Fehlerkontrolle.",
  "formula": "p_Bonferroni = min(1, m · [[p|p_value|Unkorrigierter p-Wert]])",
  "requires": [],
  "notes": [
   "Bonferroni und Holm kontrollieren die Wahrscheinlichkeit mindestens eines Fehlers erster Art in der Familie. Holm ist schrittweise und oft weniger konservativ.",
   "BH/FDR kontrolliert einen anderen Fehlerbegriff: den erwarteten Anteil falscher Entdeckungen unter den verworfenen Hypothesen.",
   "Ein signifikanter Omnibustest ist keine mathematische Pflicht für jeden bereits angemessen korrigierten Vergleich."
  ],
  "output": "Dunn und paarweiser Wilcoxon verwenden standardmäßig Bonferroni; die Beispiele wählen sichtbar Holm.",
  "variants": [],
  "roles": [],
  "existing": false
 },
 {
  "id": "missing",
  "title": "Fehlende Angaben",
  "region": "prepare",
  "intro": "Ein fehlender Wert ist keine Null. Lege fest, welche Codes fehlende Antworten markieren und welche Fälle die jeweilige Rechnung verwendet.",
  "formula": "[[n gültig|validn|Verwendete Fälle]] = [[n erhoben|count|Alle befragten Personen]] − n ausgeschlossen",
  "requires": [],
  "notes": [
   "Listwise: gemeinsame vollständige Fälle über alle benötigten Variablen. Pairwise: je Variablenpaar eigene vollständige Fälle.",
   "Paarweiser Ausschluss kann eine Korrelationsmatrix erzeugen, die sich nicht als gemeinsame Datenmatrix interpretieren lässt.",
   "Der Lehrdatensatz startet vollständig. Missing-Beispiele im R-Code verändern ausdrücklich eine Kopie."
  ],
  "output": "Der Ausschluss kann Ergebnisse verzerren, wenn die fehlenden Angaben systematisch mit dem untersuchten Merkmal zusammenhängen.",
  "variants": [],
  "roles": [],
  "existing": false
 },
 {
  "id": "weights",
  "title": "Gewichte",
  "region": "describe",
  "intro": "Gewichte bestimmen, wie stark Fälle in eine Rechnung eingehen. mariposa verwendet je nach Verfahren unterschiedliche Gewichtskonventionen; sie sind keine automatische Korrektur eines komplexen Erhebungsdesigns.",
  "formula": "[[x̄w|mean|Gewichteter Mittelwert]] = Σ(wᵢ · [[xᵢ|series|Messwert der Person]]) / Σwᵢ",
  "requires": [],
  "notes": [
   "Bei w_var gilt der Häufigkeitsgewichtsnenner Σw − 1, bei w_se die Wurzel aus Σw.",
   "Die R-Beispiele beginnen mit Einheitsgewichten. Damit kann die Schnittstelle ohne erfundene Repräsentativitätsgewichte erkundet werden.",
   "Spearman nutzt Gewichte nur zum Ausschluss ungültiger Fälle; Kendall verwendet Paargewichte √(wᵢwⱼ). Gewichtete Tests nicht pauschal gleichsetzen."
  ],
  "output": "Gewichte skalieren kann Standardfehler und Tests ändern; eine Normalisierung ist keine folgenlose Formatierung.",
  "variants": [],
  "roles": [],
  "existing": false,
  "lab": "weights"
 },
 {
  "id": "paired_design",
  "title": "Verbundene Messungen",
  "region": "groups",
  "intro": "Wiederholte Messungen derselben Person gehören zusammen. Beim Vergleich darf diese Zuordnung nicht verloren gehen. Unabhängig sein sollen die Personen beziehungsweise Blöcke.",
  "formula": "[[Person i|pairs|Feste Fallzuordnung]]: xᵢ₁, xᵢ₂, xᵢ₃",
  "requires": [],
  "notes": [
   "Verschiedene Fragen an dieselbe Person sind nicht automatisch vergleichbare Messzeitpunkte.",
   "Die zusätzlichen Wissenstests sind fiktive, gleich skalierte Parallelformen; die binäre Kursfrage wird identisch vor und nach dem Kurs gestellt."
  ],
  "output": "Gepaarte Verfahren nutzen die Veränderung innerhalb derselben Person.",
  "variants": [],
  "roles": [],
  "existing": false
 },
 {
  "id": "paired_difference",
  "title": "Gepaarte Differenzen",
  "region": "groups",
  "intro": "Bilde pro Person den späteren minus den früheren Wert. Für Wilcoxon werden Nulldifferenzen entfernt, Beträge geordnet und ihre Ränge wieder mit dem Vorzeichen verbunden.",
  "formula": "dᵢ = [[yᵢ − xᵢ|paired_design|Zwei Messungen derselben Person]]",
  "requires": [
   {
    "id": "paired_design",
    "reason": "sichert vergleichbare verbundene Messungen"
   }
  ],
  "notes": [
   "Differenzbeträge brauchen eine sinnvolle Vergleichsskala. Für die Lageinterpretation des Vorzeichen-Rang-Tests wird eine symmetrische Differenzverteilung angenommen."
  ],
  "output": "Eine Differenz beschreibt die Veränderung einer Person. Der gepaarte t-Test verwendet die ursprünglichen Differenzen; Wilcoxon ordnet zusätzlich deren Beträge.",
  "variants": [],
  "roles": [],
  "existing": false
 },
 {
  "id": "expected",
  "title": "Erwartete Zellhäufigkeit",
  "region": "categorical",
  "intro": "Unter Unabhängigkeit ergibt sich die erwartete Zellbesetzung aus den Randhäufigkeiten. Vergleiche diese Modellzahl mit der beobachteten Häufigkeit.",
  "formula": "Eⱼₖ = ([[nⱼ·|crosstab|Zeilensumme]] · [[n·ₖ|crosstab|Spaltensumme]]) / [[n|validn|Gesamtzahl]]",
  "requires": [],
  "notes": [
   "Die Güte der χ²-Näherung hängt von erwarteten Zellzahlen ab. Eine feste Grenze für jede beobachtete Zelle ist kein passendes Kriterium."
  ],
  "output": "Erwartete Zahlen können Dezimalwerte sein, obwohl beobachtete Personen ganzzahlig gezählt werden.",
  "variants": [],
  "roles": [],
  "existing": false
 },
 {
  "id": "concordance",
  "title": "Konkordante & diskordante Paare",
  "region": "categorical",
  "intro": "Vergleiche zwei Personen in beiden geordneten Merkmalen. Passt die Reihenfolge zusammen, ist das Paar konkordant; widerspricht sie sich, diskordant. Gleiche Werte bilden Bindungen.",
  "formula": "C − D = gleichgerichtete − entgegengesetzte [[Paarvergleiche|pairs|Zwei Personen anhand ihrer X- und Y-Werte vergleichen]]",
  "requires": [
   {
    "id": "ordinal",
    "reason": "begründet die Ordnung"
   }
  ],
  "notes": [
   "Bei n Personen gibt es n(n − 1)/2 ungeordnete Personenpaare. Das sind andere Paare als die X/Y-Werte einer einzelnen Tabellenzeile.",
   "Gamma lässt Bindungen aus dem Nenner weg; Kendall Tau-b berücksichtigt sie."
  ],
  "output": "Viele Bindungen können Gamma groß erscheinen lassen; die Unterschiede zwischen den Maßen sind inhaltlich relevant.",
  "variants": [],
  "roles": [],
  "existing": false
 },
 {
  "id": "group_variation",
  "title": "Streuung zwischen & innerhalb",
  "region": "groups",
  "intro": "Gruppenmittel können auseinanderliegen, während Personen innerhalb der Gruppen streuen. Die ANOVA vergleicht diese beiden Quellen der Variation.",
  "formula": "SS_B = Σ nⱼ([[x̄ⱼ − x̄|mean|Gruppenmittel minus Gesamtmittel]])²; SS_W = ΣΣ([[xᵢⱼ − x̄ⱼ|deviation|Abstand zum eigenen Gruppenmittel]])²",
  "requires": [],
  "notes": [
   "Bei der klassischen einfaktoriellen ANOVA gilt SS_Total = SS_B + SS_W. Bei Typ-III-Termtests geht diese Summe nicht auf."
  ],
  "output": "Die mittleren Quadratsummen entstehen nach Division durch k − 1 beziehungsweise N − k.",
  "variants": [],
  "roles": [],
  "existing": false
 },
 {
  "id": "prediction",
  "title": "Linearer Prädiktor",
  "region": "models",
  "intro": "Ein Modell setzt Variablen mit Koeffizienten zusammen. Der Achsenabschnitt beschreibt den Ausgangspunkt, jeder Koeffizient den Beitrag seines Prädiktors im Modell.",
  "formula": "ηᵢ = b₀ + Σ bⱼ · [[xᵢⱼ|series|Prädiktorwert der Person]]",
  "requires": [
   {
    "id": "dummy",
    "reason": "repräsentiert kategoriale Prädiktoren"
   }
  ],
  "notes": [
   "Ein Koeffizient beschreibt einen bedingten Zusammenhang bei festgehaltenen übrigen Modellvariablen.",
   "Die lineare Regression setzt ŷ = η. Die logistische Regression transformiert η in eine Wahrscheinlichkeit."
  ],
  "output": "Kategoriencodes müssen als Faktoren oder Dummys ins Modell eingehen, wenn keine metrische Wirkung gemeint ist.",
  "variants": [],
  "roles": [],
  "existing": false
 },
 {
  "id": "residuals",
  "title": "Residuen & kleinste Quadrate",
  "region": "models",
  "intro": "Das Residuum ist die Differenz zwischen beobachtetem und vorhergesagtem Wert. Kleinste Quadrate wählt Koeffizienten so, dass die Summe der quadrierten Residuen möglichst klein wird.",
  "formula": "eᵢ = [[yᵢ|series|Beobachteter Zielwert]] − [[ŷᵢ|prediction|Vorhersage des Modells]]; SSE = Σ[[eᵢ²|square|Quadrierter Vorhersagefehler]]",
  "requires": [],
  "notes": [
   "Die Residuen helfen, Form und Streuung der Fehler zu untersuchen. Normalität in der Regression betrifft Modellfehler, nicht pauschal alle Rohvariablen."
  ],
  "output": "Ein Modell mit mehr Prädiktoren passt die Trainingsdaten meist besser an; das garantiert keine bessere Vorhersage neuer Fälle.",
  "variants": [],
  "roles": [],
  "existing": false
 },
 {
  "id": "interaction",
  "title": "Interaktion",
  "region": "models",
  "intro": "Eine Interaktion erlaubt, dass der Zusammenhang einer Variable von einer anderen abhängt. Zwei Haupteffekte allein können diesen Unterschied nicht ausdrücken.",
  "formula": "[[η|prediction|Linearer Prädiktor]] = b₀ + b₁X + b₂Z + b₃[[XZ|multiply|Produkt der Prädiktoren]]",
  "requires": [],
  "notes": [
   "Bei einer Interaktion hängt die X-Steigung von Z ab: b₁ + b₃Z. Haupteffekte gelten beim Referenzwert der jeweils anderen Variable."
  ],
  "output": "In der R-Formel erweitert X * Z zu X + Z + X:Z.",
  "variants": [],
  "roles": [],
  "existing": false
 },
 {
  "id": "logit",
  "title": "Wahrscheinlichkeit, Odds & Logit",
  "region": "models",
  "intro": "Eine Wahrscheinlichkeit liegt zwischen 0 und 1. Odds setzen Ereignis zu Nicht-Ereignis ins Verhältnis; ihr Logarithmus ist der Logit.",
  "formula": "Odds = p / (1 − p); logit(p) = log(Odds); p = 1 / (1 + exp(−[[η|prediction|Linearer Prädiktor]]))",
  "requires": [],
  "notes": [
   "Eine Odds Ratio von 2 verdoppelt die Odds, nicht allgemein die Wahrscheinlichkeit.",
   "Ein numerischer 0/1-Prädiktor und ein Faktor können in marginal_effects unterschiedliche Änderungsbegriffe auslösen."
  ],
  "output": "Die inverse Logitfunktion hält Modellvorhersagen zwischen 0 und 1.",
  "variants": [],
  "roles": [],
  "existing": false,
  "lab": "logit"
 },
 {
  "id": "likelihood",
  "title": "Likelihood",
  "region": "models",
  "intro": "Die Likelihood betrachtet die beobachteten Daten als fest und fragt, welche Parameter sie im Modell plausibel machen. Die logistische Regression maximiert die Bernoulli-Log-Likelihood.",
  "formula": "ℓ = Σ [yᵢ log([[pᵢ|logit|Vorhergesagte Ereigniswahrscheinlichkeit]]) + (1−yᵢ) log(1−pᵢ)]",
  "requires": [],
  "notes": [
   "Vollständige oder beinahe vollständige Separation kann endliche stabile Logitkoeffizienten verhindern.",
   "Likelihood-Ratio-Tests vergleichen verschachtelte Modelle auf derselben Fallbasis."
  ],
  "output": "Pseudo-R² der Logitregression ist kein gewöhnlicher Anteil erklärter Varianz.",
  "variants": [],
  "roles": [],
  "existing": false
 },
 {
  "id": "factor_model",
  "title": "Komponenten & Faktoren",
  "region": "scales",
  "intro": "PCA verdichtet die gesamte standardisierte Variation zu Komponenten. Ein gemeinsames Faktorenmodell trennt geteilte Variation und spezifische Fehleranteile.",
  "formula": "PCA: R = V D V′; Faktoren: [[Z|z|Standardisierte Itemwerte]] = ΛF + ε; R ≈ ΛΦΛ′ + Ψ",
  "requires": [
   {
    "id": "pearson",
    "reason": "liefert die Korrelationsmatrix"
   }
  ],
  "notes": [
   "Ladungen verbinden Items mit Komponenten oder Faktoren. Bei PCA beschreibt die Kommunalität den durch behaltene Komponenten dargestellten Varianzanteil; im Faktorenmodell den durch die Faktoren erklärten Anteil.",
   "Rotation erleichtert die Interpretation: Varimax hält Achsen orthogonal; Oblimin/Promax erlauben korrelierte Faktoren."
  ],
  "output": "PCA und gemeinsame Faktorenanalyse sind verschiedene Modelle; beide werden über efa() angeboten.",
  "variants": [],
  "roles": [],
  "existing": false
 },
 {
  "id": "item_score",
  "title": "Skalenwert pro Person",
  "region": "scales",
  "intro": "Mehrere inhaltlich zusammengehörige Items können zu einem Summen- oder Mittelwert verbunden werden. Dafür müssen Richtung, Antwortmaßstab und Umgang mit fehlenden Items feststehen.",
  "formula": "Scoreᵢ = [[Σⱼ xᵢⱼ|sum|Summe über Items einer Person]] / [[kᵢ gültig|count|Anzahl beantworteter Items]]",
  "requires": [
   {
    "id": "metric",
    "reason": "begründet das Rechnen mit Abständen"
   },
   {
    "id": "missing",
    "reason": "legt die Mindestzahl gültiger Items fest"
   }
  ],
  "notes": [
   "Die fünf zusätzlichen 7-stufigen Items sind gemeinsam synthetisch erzeugt und gleichgerichtet. Das macht sie zu einem Rechenbeispiel, nicht zu einer validierten Skala.",
   "Die ursprünglichen drei Einzelitems mit 5, 7 und 10 Stufen werden dafür nicht vermischt."
  ],
  "output": "Hohe interne Konsistenz ersetzt weder Inhaltsvalidität noch Prüfung der Dimensionalität.",
  "variants": [],
  "roles": [],
  "existing": false
 },
 {
  "id": "mean",
  "title": "Mittelwert",
  "region": "basics",
  "intro": "Die Rechnung aus der Karte in mariposa anwenden.",
  "formula": "",
  "requires": [],
  "notes": [
   "Ohne weights entspricht die Funktion dem ungewichteten Kennwert.",
   "Gewichtete Varianz: Σwᵢ(xᵢ−x̄w)² / (Σwᵢ−1). Gewichteter Median: 50-%-Quantil nach Type 6/HAVERAGE."
  ],
  "output": "Die Ausgabe enthält den Kennwert und Angaben zur verwendeten Fallzahl.",
  "variants": [
   {
    "label": "Ohne Gewichte",
    "fn": "w_mean",
    "code": "atlas %>%\n  w_mean({x})"
   },
   {
    "label": "Mit Einheitsgewichten",
    "fn": "w_mean",
    "code": "atlas %>%\n  mutate(gewicht = 1) %>%\n  w_mean({x}, weights = gewicht)",
    "note": "Gewichte von 1 ändern nichts. So sieht der Aufruf mit Gewicht aus; im ALLBUS heißt das Gewicht wghtpew."
   }
  ],
  "roles": [
   {
    "key": "x",
    "label": "Zielvariable",
    "kind": "quantitative",
    "default": [
     "lernzeit"
    ],
    "many": false
   }
  ],
  "existing": true
 },
 {
  "id": "variance",
  "title": "Varianz",
  "region": "basics",
  "intro": "Die Rechnung aus der Karte in mariposa anwenden.",
  "formula": "",
  "requires": [],
  "notes": [
   "Ohne weights entspricht die Funktion dem ungewichteten Kennwert.",
   "Gewichtete Varianz: Σwᵢ(xᵢ−x̄w)² / (Σwᵢ−1). Gewichteter Median: 50-%-Quantil nach Type 6/HAVERAGE."
  ],
  "output": "Die Ausgabe enthält den Kennwert und Angaben zur verwendeten Fallzahl.",
  "variants": [
   {
    "label": "Ohne Gewichte",
    "fn": "w_var",
    "code": "atlas %>%\n  w_var({x})"
   },
   {
    "label": "Mit Einheitsgewichten",
    "fn": "w_var",
    "code": "atlas %>%\n  mutate(gewicht = 1) %>%\n  w_var({x}, weights = gewicht)",
    "note": "Gewichte von 1 ändern nichts. So sieht der Aufruf mit Gewicht aus; im ALLBUS heißt das Gewicht wghtpew."
   }
  ],
  "roles": [
   {
    "key": "x",
    "label": "Zielvariable",
    "kind": "quantitative",
    "default": [
     "lernzeit"
    ],
    "many": false
   }
  ],
  "existing": true
 },
 {
  "id": "sd",
  "title": "Standardabweichung",
  "region": "basics",
  "intro": "Die Rechnung aus der Karte in mariposa anwenden.",
  "formula": "",
  "requires": [],
  "notes": [
   "Ohne weights entspricht die Funktion dem ungewichteten Kennwert.",
   "Gewichtete Varianz: Σwᵢ(xᵢ−x̄w)² / (Σwᵢ−1). Gewichteter Median: 50-%-Quantil nach Type 6/HAVERAGE."
  ],
  "output": "Die Ausgabe enthält den Kennwert und Angaben zur verwendeten Fallzahl.",
  "variants": [
   {
    "label": "Ohne Gewichte",
    "fn": "w_sd",
    "code": "atlas %>%\n  w_sd({x})"
   },
   {
    "label": "Mit Einheitsgewichten",
    "fn": "w_sd",
    "code": "atlas %>%\n  mutate(gewicht = 1) %>%\n  w_sd({x}, weights = gewicht)",
    "note": "Gewichte von 1 ändern nichts. So sieht der Aufruf mit Gewicht aus; im ALLBUS heißt das Gewicht wghtpew."
   }
  ],
  "roles": [
   {
    "key": "x",
    "label": "Zielvariable",
    "kind": "quantitative",
    "default": [
     "lernzeit"
    ],
    "many": false
   }
  ],
  "existing": true
 },
 {
  "id": "median",
  "title": "Median",
  "region": "basics",
  "intro": "Die Rechnung aus der Karte in mariposa anwenden.",
  "formula": "",
  "requires": [],
  "notes": [
   "Ohne weights entspricht die Funktion dem ungewichteten Kennwert.",
   "Gewichtete Varianz: Σwᵢ(xᵢ−x̄w)² / (Σwᵢ−1). Gewichteter Median: 50-%-Quantil nach Type 6/HAVERAGE."
  ],
  "output": "Die Ausgabe enthält den Kennwert und Angaben zur verwendeten Fallzahl.",
  "variants": [
   {
    "label": "Ohne Gewichte",
    "fn": "w_median",
    "code": "atlas %>%\n  w_median({x})"
   },
   {
    "label": "Mit Einheitsgewichten",
    "fn": "w_median",
    "code": "atlas %>%\n  mutate(gewicht = 1) %>%\n  w_median({x}, weights = gewicht)",
    "note": "Gewichte von 1 ändern nichts. So sieht der Aufruf mit Gewicht aus; im ALLBUS heißt das Gewicht wghtpew."
   }
  ],
  "roles": [
   {
    "key": "x",
    "label": "Zielvariable",
    "kind": "quantitative",
    "default": [
     "lernzeit"
    ],
    "many": false
   }
  ],
  "existing": true
 },
 {
  "id": "frequency",
  "title": "Häufigkeiten",
  "region": "basics",
  "intro": "Zähle Ausprägungen und wähle die richtige Prozentbasis.",
  "formula": "",
  "requires": [],
  "notes": [
   "fre() ist ein Alias von frequency().",
   "Mit Missing-Werten unterscheiden sich Prozent aller Fälle und gültige Prozent. Kumulierte Prozent sind inhaltlich nur bei geordneten Kategorien sinnvoll."
  ],
  "output": "Eine Zeile je Ausprägung, Häufigkeiten und Prozentangaben.",
  "variants": [
   {
    "label": "Häufigkeitstabelle",
    "fn": "frequency",
    "code": "atlas %>%\n  frequency({x}, show_unused = TRUE)"
   },
   {
    "label": "Kurzname fre",
    "fn": "fre",
    "code": "atlas %>%\n  fre({x})"
   }
  ],
  "roles": [
   {
    "key": "x",
    "label": "Kategorien",
    "kind": "category",
    "default": [
     "schulabschluss"
    ],
    "many": false
   }
  ],
  "existing": true
 },
 {
  "id": "crosstab",
  "title": "Kreuztabelle",
  "region": "basics",
  "intro": "Zwei Merkmale derselben Personen kreuzen.",
  "formula": "",
  "requires": [],
  "notes": [
   "Zeilenprozente: Verteilung der Spaltenkategorien innerhalb einer Zeilenkategorie. Spaltenprozente drehen die Bezugsrichtung um."
  ],
  "output": "Zellzahlen, Randzahlen und die gewählte Prozentbasis.",
  "variants": [
   {
    "label": "Zeilenprozente",
    "fn": "crosstab",
    "code": "atlas %>%\n  crosstab(row = {x}, col = {y}, percentages = \"row\")"
   },
   {
    "label": "Spaltenprozente",
    "fn": "crosstab",
    "code": "atlas %>%\n  crosstab(row = {x}, col = {y}, percentages = \"col\")"
   }
  ],
  "roles": [
   {
    "key": "x",
    "label": "Kategorien",
    "kind": "category",
    "default": [
     "schulabschluss"
    ],
    "many": false
   },
   {
    "key": "y",
    "label": "Spaltenkategorien",
    "kind": "category",
    "default": [
     "weiterbildung"
    ],
    "many": false
   }
  ],
  "existing": true
 },
 {
  "id": "pearson",
  "title": "Pearson-Korrelation",
  "region": "basics",
  "intro": "Pearson in mariposa berechnet Korrelation, Test und Konfidenzintervall.",
  "formula": "",
  "requires": [],
  "notes": [
   "Der Paketkernel verlangt mindestens drei vollständige Paare; mathematisch ist r schon mit zwei streuenden Paaren definiert.",
   "r braucht keine Normalverteilung. Der klassische Test und das Fisher-z-Intervall benötigen zusätzliche Modellannahmen."
  ],
  "output": "r beschreibt Richtung und lineare Stärke. Mit mehr als zwei Variablen entsteht eine Korrelationsmatrix.",
  "variants": [
   {
    "label": "Gemeinsame vollständige Fälle",
    "fn": "pearson_cor",
    "code": "atlas %>%\n  pearson_cor({x}, {y}, use = \"listwise\", conf.level = .95)"
   },
   {
    "label": "Paarweiser Ausschluss",
    "fn": "pearson_cor",
    "code": "atlas %>%\n  pearson_cor({x}, {y}, use = \"pairwise\")"
   }
  ],
  "roles": [
   {
    "key": "x",
    "label": "Zielvariable",
    "kind": "quantitative",
    "default": [
     "lernzeit"
    ],
    "many": false
   },
   {
    "key": "y",
    "label": "Zweite Variable",
    "kind": "quantitative",
    "default": [
     "wissenstest"
    ],
    "many": false
   }
  ],
  "existing": true
 },
 {
  "id": "spearman",
  "title": "Spearman-Korrelation",
  "region": "basics",
  "intro": "Ränge statt ursprünglicher Abstände vergleichen.",
  "formula": "",
  "requires": [],
  "notes": [
   "Gleichstände erhalten mittlere Ränge. mariposa nutzt einen approximativen t-Test mit n − 2 Freiheitsgraden.",
   "Gewichte filtern nur Fälle mit fehlenden oder nichtpositiven Gewichten; danach rechnet das Paket ungewichtet."
  ],
  "output": "Ein monotoner Zusammenhang kann auch gekrümmt sein.",
  "variants": [
   {
    "label": "Rangkorrelation",
    "fn": "spearman_rho",
    "code": "atlas %>%\n  spearman_rho({x}, {y}, use = \"listwise\")"
   }
  ],
  "roles": [
   {
    "key": "x",
    "label": "Geordnete Zielvariable",
    "kind": "ordered",
    "default": [
     "finanzlage"
    ],
    "many": false
   },
   {
    "key": "y",
    "label": "Zweites geordnetes Merkmal",
    "kind": "ordered",
    "default": [
     "schulabschluss"
    ],
    "many": false
   }
  ],
  "existing": true
 },
 {
  "id": "centering",
  "title": "Zentrieren",
  "region": "basics",
  "intro": "Zentrieren zieht den Mittelwert ab.",
  "formula": "",
  "requires": [],
  "notes": [
   "Ein Suffix legt neue Spalten an; ohne Suffix ersetzt center die ausgewählten Spalten im zurückgegebenen Dataframe."
  ],
  "output": "Abstände und Streuung bleiben gleich.",
  "variants": [
   {
    "label": "Neue zentrierte Spalte",
    "fn": "center",
    "code": "atlas %>%\n  center({x}, suffix = \"_zentriert\") %>%\n  describe({x}, {x}_zentriert, show = c(\"mean\", \"sd\"))"
   }
  ],
  "roles": [
   {
    "key": "x",
    "label": "Zielvariable",
    "kind": "quantitative",
    "default": [
     "lernzeit"
    ],
    "many": false
   }
  ],
  "existing": true
 },
 {
  "id": "z",
  "title": "Standardisieren",
  "region": "basics",
  "intro": "std bietet mehrere Maßstäbe für standardisierte Werte.",
  "formula": "",
  "requires": [],
  "notes": [
   "Standardisieren erzeugt keine Normalverteilung. Gewichte sind nur für sd und 2sd unterstützt.",
   "Die Karte rechnet mit Mittelwert und korrigierter SD. MAD und GMD sind andere Maßstäbe; ihre R-Varianten sind hier ausdrücklich benannt."
  ],
  "output": "Der Suffix bewahrt die Originalspalte.",
  "variants": [
   {
    "label": "z-Werte · Standardabweichung",
    "fn": "std",
    "code": "atlas %>%\n  std({x}, method = \"sd\", suffix = \"_z\") %>%\n  describe({x}, {x}_z, show = c(\"mean\", \"sd\"))"
   },
   {
    "label": "Zwei Standardabweichungen",
    "fn": "std",
    "code": "atlas %>%\n  std({x}, method = \"2sd\", suffix = \"_2sd\") %>%\n  describe({x}, {x}_2sd, show = c(\"mean\", \"sd\"))",
    "formula": "uᵢ = ([[xᵢ|series|Einzelwert]] − [[x̄|mean|Mittelwert]]) / (2·[[s|sd|Standardabweichung]])"
   },
   {
    "label": "MAD · robuste Skalierung",
    "fn": "std",
    "code": "atlas %>%\n  std({x}, method = \"mad\", suffix = \"_mad\") %>%\n  describe({x}, {x}_mad, show = c(\"mean\", \"sd\"))",
    "formula": "uᵢ = ([[xᵢ|series|Einzelwert]] − [[Median|median|Median der Reihe]]) / MAD; MAD = 1,4826 · Median(|xᵢ−Median(X)|)"
   },
   {
    "label": "Gini-Mitteldifferenz",
    "fn": "std",
    "code": "atlas %>%\n  std({x}, method = \"gmd\", suffix = \"_gmd\") %>%\n  describe({x}, {x}_gmd, show = c(\"mean\", \"sd\"))",
    "formula": "uᵢ = ([[xᵢ|series|Einzelwert]] − [[x̄|mean|Mittelwert]]) / GMD; GMD = ΣᵢΣⱼ|xᵢ−xⱼ| / n²"
   }
  ],
  "roles": [
   {
    "key": "x",
    "label": "Zielvariable",
    "kind": "quantitative",
    "default": [
     "lernzeit"
    ],
    "many": false
   }
  ],
  "existing": true
 },
 {
  "id": "t_test",
  "title": "t-Test",
  "region": "groups",
  "intro": "Vergleiche einen Mittelwert mit einem vorgegebenen Wert oder die Mittelwerte zweier unabhängiger Gruppen. Die Differenz wird durch ihren Standardfehler geteilt.",
  "formula": "t = ([[x̄₁ − x̄₂|mean|Unterschied der Gruppenmittel]]) / √([[s₁²/n₁ + s₂²/n₂|se|Varianz der Mittelwertdifferenz nach Welch]])",
  "requires": [
   {
    "id": "sampling",
    "reason": "erfordert unabhängige Fälle"
   },
   {
    "id": "metric",
    "reason": "begründet Mittelwertunterschiede"
   },
   {
    "id": "test_statistic",
    "reason": "liefert die t-Referenz"
   }
  ],
  "notes": [
   "Standard ist Welch. Student und Welch werden beide berechnet; var.equal wählt das primäre Ergebnis.",
   "Student nimmt gleiche Populationsvarianzen an. Für exakte kleine Stichproben gelten zusätzliche Normalitätsannahmen.",
   "Kein paired-Argument: Für verbundene Mittelwerte zuerst eine Differenzspalte bilden und diese gegen 0 testen."
  ],
  "output": "Mittelwertdifferenz, t, Freiheitsgrade, p-Wert, Intervall und Effektgrößen.",
  "variants": [
   {
    "label": "Welch · zwei unabhängige Gruppen",
    "fn": "t_test",
    "code": "atlas %>%\n  t_test({x}, group = {group}, var.equal = FALSE)",
    "roles": [
     {
      "key": "x",
      "label": "Zielvariable",
      "kind": "quantitative",
      "default": [
       "lernzeit"
      ],
      "many": false
     },
     {
      "key": "group",
      "label": "Zwei unabhängige Gruppen",
      "kind": "twoGroups",
      "default": [
       "weiterbildung"
      ],
      "many": false
     }
    ]
   },
   {
    "label": "Student · gleiche Varianzen",
    "fn": "t_test",
    "code": "atlas %>%\n  t_test({x}, group = {group}, var.equal = TRUE)",
    "roles": [
     {
      "key": "x",
      "label": "Zielvariable",
      "kind": "quantitative",
      "default": [
       "lernzeit"
      ],
      "many": false
     },
     {
      "key": "group",
      "label": "Zwei unabhängige Gruppen",
      "kind": "twoGroups",
      "default": [
       "weiterbildung"
      ],
      "many": false
     }
    ],
    "formula": "sₚ² = [(n₁−1)s₁²+(n₂−1)s₂²]/(n₁+n₂−2); t = ([[x̄₁−x̄₂|mean|Mittelwertdifferenz]]) / (sₚ√(1/n₁+1/n₂)); df = n₁+n₂−2"
   },
   {
    "label": "Eine Stichprobe · gegen 7",
    "fn": "t_test",
    "code": "atlas %>%\n  t_test({x}, mu = 7, alternative = \"two.sided\")",
    "roles": [
     {
      "key": "x",
      "label": "Messwert · Vergleichswert 7",
      "kind": "quantitative",
      "default": [
       "schlafdauer"
      ],
      "many": false
     }
    ],
    "formula": "t = ([[x̄|mean|Mittelwert]] − 7) / [[SE|se|Standardfehler des Mittelwerts]]"
   },
   {
    "label": "Verbundene Mittelwerte · Differenz gegen 0",
    "fn": "t_test",
    "code": "atlas %>%\n  mutate(differenz = {y} - {x}) %>%\n  t_test(differenz, mu = 0)",
    "roles": [
     {
      "key": "x",
      "label": "Ausgangsmessung X",
      "kind": "repeated",
      "default": [
       "wissenstest"
      ],
      "many": false
     },
     {
      "key": "y",
      "label": "Vergleichsmessung Y",
      "kind": "repeated",
      "default": [
       "wissenstest_t2"
      ],
      "many": false
     }
    ],
    "formula": "t = Mittelwert([[y − x|paired_difference|Differenzen derselben Personen]]) / SE(y − x)"
   },
   {
    "label": "Erste Gruppe kleiner · einseitig",
    "fn": "t_test",
    "code": "atlas %>%\n  t_test({x}, group = {group}, alternative = \"less\")",
    "roles": [
     {
      "key": "x",
      "label": "Zielvariable",
      "kind": "quantitative",
      "default": [
       "lernzeit"
      ],
      "many": false
     },
     {
      "key": "group",
      "label": "Zwei unabhängige Gruppen",
      "kind": "twoGroups",
      "default": [
       "weiterbildung"
      ],
      "many": false
     }
    ],
    "note": "Die erste Gruppe ist der kleinere Code aus dem Codebuch, bei Weiterbildung also 0 = Nein. Die Richtung legst du fest, bevor du die Daten ansiehst."
   },
   {
    "label": "Erste Gruppe größer · einseitig",
    "fn": "t_test",
    "code": "atlas %>%\n  t_test({x}, group = {group}, alternative = \"greater\")",
    "roles": [
     {
      "key": "x",
      "label": "Zielvariable",
      "kind": "quantitative",
      "default": [
       "lernzeit"
      ],
      "many": false
     },
     {
      "key": "group",
      "label": "Zwei unabhängige Gruppen",
      "kind": "twoGroups",
      "default": [
       "weiterbildung"
      ],
      "many": false
     }
    ],
    "note": "Die erste Gruppe ist der kleinere Code aus dem Codebuch, bei Weiterbildung also 0 = Nein. Die Richtung legst du fest, bevor du die Daten ansiehst."
   }
  ],
  "roles": [
   {
    "key": "x",
    "label": "Zielvariable",
    "kind": "quantitative",
    "default": [
     "lernzeit"
    ],
    "many": false
   },
   {
    "key": "group",
    "label": "Zwei unabhängige Gruppen",
    "kind": "twoGroups",
    "default": [
     "weiterbildung"
    ],
    "many": false
   }
  ],
  "existing": false
 },
 {
  "id": "oneway_anova",
  "title": "Einfaktorielle ANOVA",
  "region": "groups",
  "intro": "Vergleiche Mittelwerte mehrerer unabhängiger Gruppen. Die klassische ANOVA setzt Streuung zwischen Gruppen zu Streuung innerhalb der Gruppen ins Verhältnis.",
  "formula": "F = ([[SS_B|group_variation|Quadratsumme zwischen Gruppen]] / (k−1)) / ([[SS_W|group_variation|Quadratsumme innerhalb Gruppen]] / (N−k))",
  "requires": [
   {
    "id": "sampling",
    "reason": "erfordert unabhängige Fälle"
   },
   {
    "id": "metric",
    "reason": "begründet Mittelwerte"
   },
   {
    "id": "test_statistic",
    "reason": "liefert die F-Referenz"
   }
  ],
  "notes": [
   "mariposa berechnet immer klassische und Welch-ANOVA. var.equal=FALSE schaltet nicht auf Welch um und ist veraltet.",
   "Welch berücksichtigt ungleiche Varianzen. Tukey/Scheffé beruhen auf dem klassischen Modell und sind keine Welch-Post-hocs."
  ],
  "output": "Omnibustests zeigen, ob das Modell gleicher Mittelwerte zu den Daten passt; sie lokalisieren keinen einzelnen Gruppenunterschied.",
  "variants": [
   {
    "label": "Klassischen Rechenweg erklären",
    "fn": "oneway_anova",
    "code": "a <- atlas %>%\n  oneway_anova({x}, group = {group})\n\nsummary(a)"
   },
   {
    "label": "Welch-Rechenweg erklären",
    "fn": "oneway_anova",
    "code": "a <- atlas %>%\n  oneway_anova({x}, group = {group})\n\nsummary(a)",
    "formula": "wⱼ = nⱼ/[[sⱼ²|variance|Gruppenvarianz]]; W=Σwⱼ; x̄w=Σwⱼx̄ⱼ/W; B=Σ(1−wⱼ/W)²/(nⱼ−1); F_W=[Σwⱼ(x̄ⱼ−x̄w)²/(k−1)]/[1+2(k−2)B/(k²−1)]; df₂=(k²−1)/(3B)",
    "note": "Beide Rechenwege stehen in derselben R-Ausgabe. Der Welch-Weg braucht in jeder Gruppe eine Varianz größer als null und genügend Fälle. Die Freiheitsgrade im Zähler sind die Zahl der Gruppen minus eins."
   }
  ],
  "roles": [
   {
    "key": "x",
    "label": "Zielvariable",
    "kind": "quantitative",
    "default": [
     "lernzeit"
    ],
    "many": false
   },
   {
    "key": "group",
    "label": "Gruppen",
    "kind": "category",
    "default": [
     "schulabschluss"
    ],
    "many": false
   }
  ],
  "existing": false
 },
 {
  "id": "factorial_anova",
  "title": "Mehrfaktorielle ANOVA",
  "region": "groups",
  "intro": "Untersuche mehrere Gruppierungsmerkmale und ihre Interaktionen gemeinsam. mariposa erlaubt zwei bis drei Faktoren und berechnet Typ-III-Tests.",
  "formula": "Y = μ + A + B + [[A×B|interaction|Interaktion der Faktoren]] + ε; F_Term = (SS_Term / df_Term) / [[MSE|residuals|Mittlere Fehlerquadratsumme]]",
  "requires": [
   {
    "id": "sampling",
    "reason": "erfordert unabhängige Fälle"
   },
   {
    "id": "group_variation",
    "reason": "erklärt Quadratsummen"
   }
  ],
  "notes": [
   "Nur Typ III ist implementiert. Typ II löst eine Warnung aus und fällt auf III zurück.",
   "Zellen müssen besetzt und Effekte schätzbar sein. Typ-III-Quadratsummen ergeben zusammen nicht unbedingt die Modellquadratsumme."
  ],
  "output": "Termtests, Parameter, Modellgüte und partielle Effektgrößen.",
  "variants": [
   {
    "label": "Zwei Faktoren mit Interaktion",
    "fn": "factorial_anova",
    "code": "atlas %>%\n  factorial_anova(dv = {x}, between = c({factors}), ss_type = 3)"
   }
  ],
  "roles": [
   {
    "key": "x",
    "label": "Zielvariable",
    "kind": "quantitative",
    "default": [
     "lernzeit"
    ],
    "many": false
   },
   {
    "key": "factors",
    "label": "Zwei oder drei Faktoren",
    "kind": "factors",
    "default": [
     "schulabschluss",
     "weiterbildung"
    ],
    "many": true
   }
  ],
  "existing": false
 },
 {
  "id": "ancova",
  "title": "Kovarianzanalyse (ANCOVA)",
  "region": "groups",
  "intro": "Verbinde Gruppenvergleiche mit metrischen Kovariaten. Adjustierte Mittel sind Modellvorhersagen bei festgelegten Kovariatenwerten.",
  "formula": "Y = μ + A + βX + ε → [[adjustierte Mittel|prediction|Vorhersage bei Kovariatenmittelwerten]]",
  "requires": [
   {
    "id": "linear_regression",
    "reason": "liefert die lineare Modellidee"
   },
   {
    "id": "factorial_anova",
    "reason": "liefert Faktor- und Typ-III-Tests"
   }
  ],
  "notes": [
   "Nur Typ III. Das Paket enthält Faktorinteraktionen, aber keine Faktor×Kovariate-Interaktionen. Es setzt damit gemeinsame Kovariatensteigungen voraus.",
   "Kovariatenbereiche sollten sich über Gruppen überlappen. Adjustierung begründet keine Kausalität."
  ],
  "output": "Typ-III-Tabelle, Parameter und vorhergesagte Zellmittel.",
  "variants": [
   {
    "label": "Ein Faktor plus Kovariaten",
    "fn": "ancova",
    "code": "atlas %>%\n  ancova(dv = {x}, between = {group}, covariate = c({controls}), ss_type = 3)"
   },
   {
    "label": "Mehrere Faktoren plus Kovariaten",
    "fn": "ancova",
    "code": "atlas %>%\n  ancova(dv = {x}, between = c({factors}), covariate = c({controls}), ss_type = 3)",
    "roles": [
     {
      "key": "x",
      "label": "Metrische Zielvariable",
      "kind": "quantitative",
      "default": [
       "wissenstest"
      ],
      "many": false
     },
     {
      "key": "factors",
      "label": "Zwei oder drei Faktoren",
      "kind": "factors",
      "default": [
       "schulabschluss",
       "weiterbildung"
      ],
      "many": true
     },
     {
      "key": "controls",
      "label": "Metrische Kovariaten",
      "kind": "quantitative",
      "default": [
       "lernzeit",
       "alter"
      ],
      "many": true
     }
    ]
   }
  ],
  "roles": [
   {
    "key": "x",
    "label": "Metrische Zielvariable",
    "kind": "quantitative",
    "default": [
     "wissenstest"
    ],
    "many": false
   },
   {
    "key": "group",
    "label": "Gruppen",
    "kind": "category",
    "default": [
     "schulabschluss"
    ],
    "many": false
   },
   {
    "key": "controls",
    "label": "Metrische Kovariaten",
    "kind": "quantitative",
    "default": [
     "lernzeit",
     "alter"
    ],
    "many": true
   }
  ],
  "existing": false
 },
 {
  "id": "levene_test",
  "title": "Levene & Brown–Forsythe",
  "region": "groups",
  "intro": "Prüfe, ob Gruppen unterschiedliche Streuungen zeigen. Dafür werden absolute Abstände zum jeweiligen Gruppenzentrum verglichen.",
  "formula": "zᵢⱼ = |[[xᵢⱼ|series|Messwert]] − [[Zⱼ|mean|Gruppenzentrum: Mittel oder Median]]| → [[ANOVA|oneway_anova|Gruppenvergleich der Abstände]]",
  "requires": [
   {
    "id": "sampling",
    "reason": "erfordert unabhängige Gruppen"
   }
  ],
  "notes": [
   "Standard center=\"mean\". center=\"median\" wählt Brown–Forsythe.",
   "Ein nichtsignifikantes Ergebnis beweist keine gleichen Varianzen. Levene ist kein automatischer Schalter zur Auswahl zwischen Student und Welch."
  ],
  "output": "F-Test der transformierten Abstände.",
  "variants": [
   {
    "label": "Brown–Forsythe · Median",
    "fn": "levene_test",
    "code": "atlas %>%\n  levene_test({x}, group = {group}, center = \"median\")",
    "formula": "zᵢⱼ = |[[xᵢⱼ|series|Messwert]] − [[Medianⱼ|median|Median der jeweiligen Gruppe]]| → [[ANOVA|oneway_anova|Gruppenvergleich der absoluten Abstände]]"
   },
   {
    "label": "Levene · Mittelwert",
    "fn": "levene_test",
    "code": "atlas %>%\n  levene_test({x}, group = {group}, center = \"mean\")"
   }
  ],
  "roles": [
   {
    "key": "x",
    "label": "Zielvariable",
    "kind": "quantitative",
    "default": [
     "lernzeit"
    ],
    "many": false
   },
   {
    "key": "group",
    "label": "Gruppen",
    "kind": "category",
    "default": [
     "schulabschluss"
    ],
    "many": false
   }
  ],
  "existing": false
 },
 {
  "id": "normality_test",
  "title": "Normalverteilung prüfen",
  "region": "inference",
  "intro": "Vergleiche eine kontinuierliche Messreihe mit der Form einer Normalverteilung. mariposa berichtet Shapiro–Wilk und den Lilliefors-korrigierten KS-Test.",
  "formula": "W = (Σ aᵢ[[x₍ᵢ₎|sorting|Sortierte ursprüngliche Messwerte, keine Rangzahlen]])² / [[SS|ss|Quadratsumme um den Mittelwert]]; D = max|Fₙ − Φ̂|",
  "requires": [
   {
    "id": "sd",
    "reason": "eine konstante Reihe ist ungeeignet"
   },
   {
    "id": "p_value",
    "reason": "ordnet Testergebnisse ein"
   }
  ],
  "notes": [
   "Shapiro–Wilk: 3 bis 5000 Fälle; Lilliefors: mindestens 4. Keine Gewichte.",
   "Bei Gruppenmodellen sind Gruppenverteilungen beziehungsweise Modellfehler relevant, nicht die ungegliederte Rohverteilung.",
   "Ein großes p bestätigt keine Normalverteilung; nutze zusätzlich die Form der Verteilung."
  ],
  "output": "Zwei unterschiedliche Abstandsprüfungen mit jeweiligen p-Werten.",
  "variants": [
   {
    "label": "Beide Normalitätstests",
    "fn": "normality_test",
    "code": "atlas %>%\n  normality_test({x})"
   }
  ],
  "roles": [
   {
    "key": "x",
    "label": "Kontinuierliche Variable",
    "kind": "continuous",
    "default": [
     "schlafdauer"
    ],
    "many": false
   }
  ],
  "existing": false
 },
 {
  "id": "mann_whitney",
  "title": "Mann–Whitney-U",
  "region": "groups",
  "intro": "Vergleiche zwei unabhängige Gruppen anhand gemeinsamer Ränge. Es geht allgemein um Verteilungsunterschiede, nicht automatisch um einen reinen Medianunterschied.",
  "formula": "U₁ = [[R₁|ranks|Rangsumme der ersten Gruppe]] − n₁(n₁+1)/2; U₂ = n₁n₂ − U₁",
  "requires": [
   {
    "id": "sampling",
    "reason": "erfordert unabhängige Gruppen"
   },
   {
    "id": "ordinal",
    "reason": "braucht eine sinnvolle Ordnung"
   }
  ],
  "notes": [
   "Das Paket berichtet min(U₁,U₂). Ungewichtet: Normalapproximation mit Bindungskorrektur, ohne Kontinuitätskorrektur.",
   "Die Mediandeutung benötigt zusätzliche Annahmen über die Form der Gruppenverteilungen.",
   "Die Beispiele verwenden mu=0."
  ],
  "output": "U, Z, p und Ranginformationen.",
  "variants": [
   {
    "label": "Zweiseitiger Rangvergleich",
    "fn": "mann_whitney",
    "code": "atlas %>%\n  mann_whitney({x}, group = {group}, mu = 0, alternative = \"two.sided\")"
   },
   {
    "label": "Erste Gruppe kleiner · einseitig",
    "fn": "mann_whitney",
    "code": "atlas %>%\n  mann_whitney({x}, group = {group}, alternative = \"less\")",
    "roles": [
     {
      "key": "x",
      "label": "Geordnete Zielvariable",
      "kind": "ordered",
      "default": [
       "finanzlage"
      ],
      "many": false
     },
     {
      "key": "group",
      "label": "Zwei unabhängige Gruppen",
      "kind": "twoGroups",
      "default": [
       "weiterbildung"
      ],
      "many": false
     }
    ],
    "note": "Die erste Gruppe ist der kleinere Code aus dem Codebuch, bei Weiterbildung also 0 = Nein. Die Richtung legst du fest, bevor du die Daten ansiehst."
   },
   {
    "label": "Erste Gruppe größer · einseitig",
    "fn": "mann_whitney",
    "code": "atlas %>%\n  mann_whitney({x}, group = {group}, alternative = \"greater\")",
    "roles": [
     {
      "key": "x",
      "label": "Geordnete Zielvariable",
      "kind": "ordered",
      "default": [
       "finanzlage"
      ],
      "many": false
     },
     {
      "key": "group",
      "label": "Zwei unabhängige Gruppen",
      "kind": "twoGroups",
      "default": [
       "weiterbildung"
      ],
      "many": false
     }
    ],
    "note": "Die erste Gruppe ist der kleinere Code aus dem Codebuch, bei Weiterbildung also 0 = Nein. Die Richtung legst du fest, bevor du die Daten ansiehst."
   }
  ],
  "roles": [
   {
    "key": "x",
    "label": "Geordnete Zielvariable",
    "kind": "ordered",
    "default": [
     "finanzlage"
    ],
    "many": false
   },
   {
    "key": "group",
    "label": "Zwei unabhängige Gruppen",
    "kind": "twoGroups",
    "default": [
     "weiterbildung"
    ],
    "many": false
   }
  ],
  "existing": false
 },
 {
  "id": "kruskal_wallis",
  "title": "Kruskal–Wallis",
  "region": "groups",
  "intro": "Vergleiche mehrere unabhängige Gruppen anhand ihrer gemeinsamen Rangverteilung. Bei Gleichständen korrigiert das Verfahren seine Prüfgröße.",
  "formula": "H₀ = 12/[N(N+1)] · Σ([[Rⱼ|ranks|Rangsumme einer Gruppe]]²/nⱼ) − 3(N+1)",
  "requires": [
   {
    "id": "sampling",
    "reason": "erfordert unabhängige Gruppen"
   },
   {
    "id": "ordinal",
    "reason": "begründet Ränge"
   }
  ],
  "notes": [
   "H₀ in dieser Formel bezeichnet die unkorrigierte Prüfgröße, nicht die Nullhypothese. Geteilt wird durch 1 − Σ(t³−t)/(N³−N).",
   "Asymptotische χ²-Referenz mit k−1 Freiheitsgraden. Ein Unterschied muss kein reiner Medianunterschied sein."
  ],
  "output": "Der Omnibustest kann durch Dunn-Vergleiche ergänzt werden.",
  "variants": [
   {
    "label": "Gruppen über Ränge vergleichen",
    "fn": "kruskal_wallis",
    "code": "kw <- atlas %>%\n  kruskal_wallis({x}, group = {group})\n\nsummary(kw)"
   }
  ],
  "roles": [
   {
    "key": "x",
    "label": "Geordnete Zielvariable",
    "kind": "ordered",
    "default": [
     "finanzlage"
    ],
    "many": false
   },
   {
    "key": "group",
    "label": "Gruppen",
    "kind": "category",
    "default": [
     "schulabschluss"
    ],
    "many": false
   }
  ],
  "existing": false
 },
 {
  "id": "wilcoxon_test",
  "title": "Wilcoxon, verbunden",
  "region": "groups",
  "intro": "Vergleiche zwei Messungen derselben Personen mit dem Vorzeichen-Rang-Test. Entscheidend sind die geordneten absoluten Differenzen und ihre Vorzeichen.",
  "formula": "dᵢ = [[yᵢ−xᵢ|paired_difference|Differenzen derselben Personen]]; V = W⁺ = Σ [[R(|dᵢ|)|ranks|Mittlere Ränge der Differenzbeträge]] für dᵢ > 0",
  "requires": [
   {
    "id": "paired_design",
    "reason": "verlangt vergleichbare Messungen derselben Personen"
   }
  ],
  "notes": [
   "mariposa bildet y−x, entfernt Nulldifferenzen und korrigiert Gleichstände.",
   "Immer zweiseitige Normalapproximation ohne Kontinuitätskorrektur. Keine exact-/alternative-Option.",
   "Für eine Lageinterpretation: symmetrische Differenzverteilung; sinnvolle Differenzbeträge."
  ],
  "output": "V, Z, p und Rangstatistiken; conf.level erzeugt hier kein ausgegebenes Intervall.",
  "variants": [
   {
    "label": "Messung X gegen Messung Y",
    "fn": "wilcoxon_test",
    "code": "atlas %>%\n  wilcoxon_test({x}, {y})"
   }
  ],
  "roles": [
   {
    "key": "x",
    "label": "Erste Messung",
    "kind": "repeated",
    "default": [
     "wissenstest"
    ],
    "many": false
   },
   {
    "key": "y",
    "label": "Zweite Messung",
    "kind": "repeated",
    "default": [
     "wissenstest_t2"
    ],
    "many": false
   }
  ],
  "existing": false
 },
 {
  "id": "friedman_test",
  "title": "Friedman",
  "region": "groups",
  "intro": "Vergleiche mindestens drei verbundene Messungen. Jede Person bildet ihren eigenen Block; die Werte werden innerhalb dieser Person geordnet.",
  "formula": "Q₀ = 12/[Nk(k+1)] · Σ[[Rⱼ²|ranks|Quadrate der Messungsrangsummen]] − 3N(k+1)",
  "requires": [
   {
    "id": "paired_design",
    "reason": "hält die Messungen einer Person zusammen"
   }
  ],
  "notes": [
   "Ränge entstehen hier innerhalb der Zeile, nicht spaltenweise wie bei Spearman. Gleichstände werden innerhalb der Personen korrigiert.",
   "Mindestens drei Messungen und zwei vollständige Personen. Listwise über alle ausgewählten Messungen."
  ],
  "output": "χ²-Approximation mit k−1 Freiheitsgraden und Kendall-W = Q/[N(k−1)].",
  "variants": [
   {
    "label": "Drei Testzeitpunkte",
    "fn": "friedman_test",
    "code": "fr <- atlas %>%\n  friedman_test({times})\n\nsummary(fr)"
   }
  ],
  "roles": [
   {
    "key": "times",
    "label": "Messungen derselben Personen",
    "kind": "repeated",
    "default": [
     "wissenstest",
     "wissenstest_t2",
     "wissenstest_t3"
    ],
    "many": true
   }
  ],
  "existing": false
 },
 {
  "id": "dunn_test",
  "title": "Dunn-Vergleiche",
  "region": "groups",
  "intro": "Untersuche gezielt, welche Paare sich unterscheiden, und berücksichtige die gemeinsame Familie der Vergleiche.",
  "formula": "Zᵢⱼ = ([[R̄ᵢ − R̄ⱼ|ranks|Unterschied mittlerer Ränge]]) / [[SEᵢⱼ|se|Standardfehler mit Bindungskorrektur]]",
  "requires": [
   {
    "id": "kruskal_wallis",
    "reason": "liefert Daten und Modell des Ausgangsverfahrens"
   },
   {
    "id": "multiplicity",
    "reason": "kontrolliert mehrere Vergleiche"
   }
  ],
  "notes": [
   "Dunn verwendet die gemeinsamen Ränge aller Gruppen. Das ist nicht derselbe Test wie separat je Paar neu berechnete Mann–Whitney-Ränge."
  ],
  "output": "Vergleichspaare und korrigierte p-Werte; Tukey und Scheffé ergänzen simultane Intervalle.",
  "variants": [
   {
    "label": "Paarvergleiche",
    "fn": "dunn_test",
    "code": "atlas %>%\n  kruskal_wallis({x}, group = {group}) %>%\n  dunn_test(p_adjust = \"holm\")"
   }
  ],
  "roles": [
   {
    "key": "x",
    "label": "Geordnete Zielvariable",
    "kind": "ordered",
    "default": [
     "finanzlage"
    ],
    "many": false
   },
   {
    "key": "group",
    "label": "Gruppen",
    "kind": "category",
    "default": [
     "schulabschluss"
    ],
    "many": false
   }
  ],
  "existing": false
 },
 {
  "id": "tukey_test",
  "title": "Tukey-Paarvergleiche",
  "region": "groups",
  "intro": "Untersuche gezielt, welche Paare sich unterscheiden, und berücksichtige die gemeinsame Familie der Vergleiche.",
  "formula": "q = |[[x̄ᵢ − x̄ⱼ|mean|Mittelwertdifferenz]]| / √[(MSE/2)(1/nᵢ+1/nⱼ)]",
  "requires": [
   {
    "id": "oneway_anova",
    "reason": "liefert Daten und Modell des Ausgangsverfahrens"
   },
   {
    "id": "multiplicity",
    "reason": "kontrolliert mehrere Vergleiche"
   }
  ],
  "notes": [
   "Klassische gemeinsame Fehlervarianz; studentisierte Spannweitenverteilung. Kein Welch-Post-hoc.",
   "Nach factorial_anova passt die ungewichtete Paketmethode pro Faktor ein eigenes One-way-Modell an; keine adjustierten Randmittel und keine bedingten Effekte innerhalb einer Interaktion."
  ],
  "output": "Vergleichspaare und korrigierte p-Werte; Tukey und Scheffé ergänzen simultane Intervalle.",
  "variants": [
   {
    "label": "Paarvergleiche",
    "fn": "tukey_test",
    "code": "atlas %>%\n  oneway_anova({x}, group = {group}) %>%\n  tukey_test()"
   }
  ],
  "roles": [
   {
    "key": "x",
    "label": "Zielvariable",
    "kind": "quantitative",
    "default": [
     "lernzeit"
    ],
    "many": false
   },
   {
    "key": "group",
    "label": "Gruppen",
    "kind": "category",
    "default": [
     "schulabschluss"
    ],
    "many": false
   }
  ],
  "existing": false
 },
 {
  "id": "scheffe_test",
  "title": "Scheffé-Paarvergleiche",
  "region": "groups",
  "intro": "Untersuche gezielt, welche Paare sich unterscheiden, und berücksichtige die gemeinsame Familie der Vergleiche.",
  "formula": "F_S = ([[x̄ᵢ − x̄ⱼ|mean|Mittelwertdifferenz]])² / [(k−1)MSE(1/nᵢ+1/nⱼ)]",
  "requires": [
   {
    "id": "oneway_anova",
    "reason": "liefert Daten und Modell des Ausgangsverfahrens"
   },
   {
    "id": "multiplicity",
    "reason": "kontrolliert mehrere Vergleiche"
   }
  ],
  "notes": [
   "Die Korrektur schützt theoretisch eine ganze Kontrastfamilie; die mariposa-API bietet Paarvergleiche, keine frei eingegebenen Kontrastvektoren.",
   "Nach factorial_anova werden Rohgruppenmittel mit dem MSE des Gesamtmodells verwendet. Keine ANCOVA-Methode."
  ],
  "output": "Vergleichspaare und korrigierte p-Werte; Tukey und Scheffé ergänzen simultane Intervalle.",
  "variants": [
   {
    "label": "Paarvergleiche",
    "fn": "scheffe_test",
    "code": "atlas %>%\n  oneway_anova({x}, group = {group}) %>%\n  scheffe_test()"
   }
  ],
  "roles": [
   {
    "key": "x",
    "label": "Zielvariable",
    "kind": "quantitative",
    "default": [
     "lernzeit"
    ],
    "many": false
   },
   {
    "key": "group",
    "label": "Gruppen",
    "kind": "category",
    "default": [
     "schulabschluss"
    ],
    "many": false
   }
  ],
  "existing": false
 },
 {
  "id": "pairwise_wilcoxon",
  "title": "Paarweiser Wilcoxon",
  "region": "groups",
  "intro": "Untersuche gezielt, welche Paare sich unterscheiden, und berücksichtige die gemeinsame Familie der Vergleiche.",
  "formula": "Messpaare → [[Vorzeichenränge|wilcoxon_test|Gepaarter Wilcoxon je Messpaar]] → [[p-Korrektur|multiplicity|Gemeinsame Vergleichsfamilie]]",
  "requires": [
   {
    "id": "friedman_test",
    "reason": "liefert Daten und Modell des Ausgangsverfahrens"
   },
   {
    "id": "multiplicity",
    "reason": "kontrolliert mehrere Vergleiche"
   }
  ],
  "notes": [
   "Akzeptiert ein Friedman-Ergebnis. Alle Messpaare werden zweiseitig asymptotisch getestet; Standardkorrektur wäre Bonferroni."
  ],
  "output": "Vergleichspaare und korrigierte p-Werte; Tukey und Scheffé ergänzen simultane Intervalle.",
  "variants": [
   {
    "label": "Paarvergleiche",
    "fn": "pairwise_wilcoxon",
    "code": "atlas %>%\n  friedman_test({times}) %>%\n  pairwise_wilcoxon(p_adjust = \"holm\")"
   }
  ],
  "roles": [
   {
    "key": "times",
    "label": "Messungen derselben Personen",
    "kind": "repeated",
    "default": [
     "wissenstest",
     "wissenstest_t2",
     "wissenstest_t3"
    ],
    "many": true
   }
  ],
  "existing": false
 },
 {
  "id": "binomial_test",
  "title": "Binomialtest",
  "region": "categorical",
  "intro": "Prüfe den Anteil einer binären Antwort gegen einen festgelegten Wert. Das Beispiel vergleicht den Anteil mit 50 %.",
  "formula": "P(K=k) = C(n,k) [[p₀|hypothesis|Vorgegebener Anteil]]ᵏ (1−p₀)ⁿ⁻ᵏ",
  "requires": [
   {
    "id": "frequency",
    "reason": "zählt Erfolge und alle Fälle"
   },
   {
    "id": "sampling",
    "reason": "erfordert unabhängige binäre Beobachtungen"
   }
  ],
  "notes": [
   "Wie in SPSS ist Gruppe 1 die Kategorie der ersten Person mit gültigem Wert. Bei p = .5 ist der Test zweiseitig, bei anderen Werten einseitig.",
   "Das Paket verlangt zwei beobachtete Kategorien. Gewichte werden gerundet; Standardbeispiel ungewichtet."
  ],
  "output": "Exakter p-Wert und exaktes Konfidenzintervall für den Anteil.",
  "variants": [
   {
    "label": "Ja-Anteil gegen 50 %",
    "fn": "binomial_test",
    "code": "atlas %>%\n  binomial_test({x}, p = .5)"
   }
  ],
  "roles": [
   {
    "key": "x",
    "label": "Binäre Antwort · Ereignis = 1",
    "kind": "binary",
    "default": [
     "weiterbildung"
    ],
    "many": false
   }
  ],
  "existing": false
 },
 {
  "id": "chi_square",
  "title": "Chi-Quadrat (Unabhängigkeit)",
  "region": "categorical",
  "intro": "Prüfe, ob die gemeinsame Verteilung zweier kategorialer Merkmale mit Unabhängigkeit vereinbar ist.",
  "formula": "χ² = Σ ([[Oⱼₖ|crosstab|Beobachtete Zellzahl]] − [[Eⱼₖ|expected|Erwartete Zellzahl]])² / Eⱼₖ",
  "requires": [
   {
    "id": "sampling",
    "reason": "erfordert unabhängige Fälle"
   }
  ],
  "notes": [
   "df = (Zeilenzahl−1)(Spaltenzahl−1). Die Näherung braucht ausreichend geeignete erwartete Zellbesetzungen.",
   "Standard correct=FALSE; bei 2×2 kann die Kontinuitätskorrektur gewählt werden. Gamma in der Ausgabe ist nur bei sinnvoll geordneten Kategorien interpretierbar."
  ],
  "output": "χ², Freiheitsgrade, p sowie mehrere Zusammenhangsmaße.",
  "variants": [
   {
    "label": "Ohne Kontinuitätskorrektur",
    "fn": "chi_square",
    "code": "atlas %>%\n  chi_square({x}, {y}, correct = FALSE)"
   },
   {
    "label": "Kontinuitätskorrektur bei 2×2",
    "fn": "chi_square",
    "code": "atlas %>%\n  chi_square({x}, {y}, correct = TRUE)",
    "roles": [
     {
      "key": "x",
      "label": "Binäre Antwort · Ereignis = 1",
      "kind": "binary",
      "default": [
       "weiterbildung"
      ],
      "many": false
     },
     {
      "key": "y",
      "label": "Zweites binäres Merkmal",
      "kind": "binary",
      "default": [
       "erwerbstaetig"
      ],
      "many": false
     }
    ],
    "formula": "χ²Y = Σ max(0, |[[Oⱼₖ|crosstab|Beobachtete Zellzahl]]−[[Eⱼₖ|expected|Erwartete Zellzahl]]|−0,5)² / Eⱼₖ"
   }
  ],
  "roles": [
   {
    "key": "x",
    "label": "Kategorien",
    "kind": "category",
    "default": [
     "schulabschluss"
    ],
    "many": false
   },
   {
    "key": "y",
    "label": "Zweites kategoriales Merkmal",
    "kind": "category",
    "default": [
     "weiterbildung"
    ],
    "many": false
   }
  ],
  "existing": false
 },
 {
  "id": "chisq_gof",
  "title": "Chi-Quadrat (Anpassung)",
  "region": "categorical",
  "intro": "Vergleiche eine beobachtete Kategorienverteilung mit einer vorab festgelegten Verteilung. Ohne expected nimmt mariposa gleiche Wahrscheinlichkeiten an.",
  "formula": "χ² = Σ ([[Oⱼ|frequency|Beobachtete Häufigkeit]] − n p₀ⱼ)² / (n p₀ⱼ)",
  "requires": [
   {
    "id": "hypothesis",
    "reason": "legt die erwartete Verteilung fest"
   },
   {
    "id": "sampling",
    "reason": "erfordert unabhängige Fälle"
   }
  ],
  "notes": [
   "Erwartete Anteile müssen positiv sein und zur Kategorienreihenfolge passen. Die Gleichverteilung ist hier nur eine Lehrhypothese.",
   "Fisher für Kreuztabellen ist kein allgemeiner Ersatz für diesen eindimensionalen Anpassungstest."
  ],
  "output": "χ²-Test mit k−1 Freiheitsgraden für die vorgegebene Verteilung.",
  "variants": [
   {
    "label": "Gleichverteilung als Lehrhypothese",
    "fn": "chisq_gof",
    "code": "atlas %>%\n  chisq_gof({x})"
   },
   {
    "label": "Vorgegebene Bildungsanteile",
    "fn": "chisq_gof",
    "code": "atlas %>%\n  chisq_gof(schulabschluss, expected = c(.1, .2, .3, .2, .2))",
    "roles": [],
    "note": "Lehrhypothese in Codebuchreihenfolge 0–4: 10 %, 20 %, 30 %, 20 %, 20 %. Keine Behauptung über eine reale Bildungsbevölkerung."
   }
  ],
  "roles": [
   {
    "key": "x",
    "label": "Kategorien",
    "kind": "category",
    "default": [
     "schulabschluss"
    ],
    "many": false
   }
  ],
  "existing": false
 },
 {
  "id": "fisher_test",
  "title": "Exakter Test nach Fisher",
  "region": "categorical",
  "intro": "Prüfe Unabhängigkeit anhand der möglichen Kreuztabellen bei festen Randhäufigkeiten. Das funktioniert auch bei kleinen Zellzahlen.",
  "formula": "P(Tabelle | Ränder) → [[p exakt|p_value|Summe mindestens ebenso ungewöhnlicher Tabellen]]",
  "requires": [
   {
    "id": "crosstab",
    "reason": "liefert die beobachtete Tabelle"
   },
   {
    "id": "sampling",
    "reason": "erfordert unabhängige Fälle"
   }
  ],
  "notes": [
   "Bei 2×2 folgt die Zellzahl einer hypergeometrischen Verteilung. Auch größere Tabellen werden unterstützt.",
   "mariposa reicht ... nicht an fisher.test weiter. Keine wirksamen Schalter für alternative oder Simulation anbieten.",
   "Ganzzahlige Häufigkeiten; gewichtete Zellzahlen werden im Paket gerundet."
  ],
  "output": "Zweiseitiger exakter p-Wert.",
  "variants": [
   {
    "label": "Feste Ränder · zweiseitig",
    "fn": "fisher_test",
    "code": "atlas %>%\n  fisher_test(row = {x}, col = {y})"
   }
  ],
  "roles": [
   {
    "key": "x",
    "label": "Binäre Antwort · Ereignis = 1",
    "kind": "category",
    "default": [
     "weiterbildung"
    ],
    "many": false
   },
   {
    "key": "y",
    "label": "Zweites binäres Merkmal",
    "kind": "category",
    "default": [
     "erwerbstaetig"
    ],
    "many": false
   }
  ],
  "existing": false
 },
 {
  "id": "mcnemar_test",
  "title": "McNemar",
  "region": "categorical",
  "intro": "Prüfe, ob sich eine binäre Antwort bei denselben Personen verändert. Dafür zählen nur Personen, deren Antwort zwischen den Messungen wechselt.",
  "formula": "χ² = (|[[b − c|crosstab|Wechsel Nein→Ja minus Ja→Nein]]| − 1)² / (b+c)",
  "requires": [
   {
    "id": "paired_design",
    "reason": "verlangt dieselbe dichotome Frage zu zwei Zeitpunkten"
   }
  ],
  "notes": [
   "Standard: Kontinuitätskorrektur. Zusätzlich liefert mariposa den exakten Binomialtest für b von b+c Wechseln mit p₀=.5.",
   "Identische Kategorienreihenfolge in beiden Messungen. Ohne Wechsel ist der exakte p-Wert 1; der asymptotische Paketwert kann nicht definiert sein.",
   "Die implementierte Korrektur wird nicht bei 0 abgeschnitten; bei b=c>0 entsteht ein kleiner positiver χ²-Wert."
  ],
  "output": "Gerichtete Wechselzahlen, asymptotischer und exakter p-Wert.",
  "variants": [
   {
    "label": "Mit Kontinuitätskorrektur",
    "fn": "mcnemar_test",
    "code": "atlas %>%\n  mcnemar_test({x}, {y}, correct = TRUE)"
   },
   {
    "label": "Ohne Kontinuitätskorrektur",
    "fn": "mcnemar_test",
    "code": "atlas %>%\n  mcnemar_test({x}, {y}, correct = FALSE)",
    "formula": "χ² = ([[b − c|crosstab|Unterschied der Wechselzahlen]])² / (b+c)"
   }
  ],
  "roles": [
   {
    "key": "x",
    "label": "Vor dem Kurs",
    "kind": "pairedBinary",
    "default": [
     "kurs_vor"
    ],
    "many": false
   },
   {
    "key": "y",
    "label": "Nach dem Kurs",
    "kind": "pairedBinary",
    "default": [
     "kurs_nach"
    ],
    "many": false
   }
  ],
  "existing": false
 },
 {
  "id": "phi",
  "title": "Phi",
  "region": "categorical",
  "intro": "Beschreibe Stärke und Richtung des Zusammenhangs zweier binärer Merkmale. Bei einer 2×2-Tabelle liefert mariposa φ mit Vorzeichen.",
  "formula": "|φ| = √([[χ²|chi_square|Unkorrigierte Chi-Quadrat-Prüfgröße]] / [[n|validn|Anzahl Fälle]])",
  "requires": [],
  "notes": [
   "Bei 2×2 ist φ die Pearson-Korrelation zweier 0/1-Indikatoren, mit dem Vorzeichen von ad − bc (Produkt der Diagonale minus Produkt der Gegendiagonale). Positiv heißt: Wer bei dem einen Merkmal eine 1 hat, hat eher auch bei dem anderen eine 1. Das Vorzeichen hängt also an der Kodierung.",
   "Das Paket erzwingt 2×2 nicht; bei größeren Tabellen ist Phi √(χ²/n) ohne Vorzeichen und kann über 1 liegen. Der Atlas bietet dafür Cramér-V."
  ],
  "output": "Einheitenfreie Stärke des binären Zusammenhangs, bei 2×2 mit Richtung zwischen −1 und +1.",
  "variants": [
   {
    "label": "Zwei binäre Merkmale",
    "fn": "phi",
    "code": "atlas %>%\n  phi({x}, {y})"
   }
  ],
  "roles": [
   {
    "key": "x",
    "label": "Binäre Antwort · Ereignis = 1",
    "kind": "binary",
    "default": [
     "weiterbildung"
    ],
    "many": false
   },
   {
    "key": "y",
    "label": "Zweites binäres Merkmal",
    "kind": "binary",
    "default": [
     "erwerbstaetig"
    ],
    "many": false
   }
  ],
  "existing": false
 },
 {
  "id": "cramers_v",
  "title": "Cramér-V",
  "region": "categorical",
  "intro": "Normiere den χ²-Zusammenhang auf Stichprobengröße und Tabellendimension. So entsteht ein Maß für zwei kategoriale Merkmale.",
  "formula": "V = √([[χ²|chi_square|Chi-Quadrat-Prüfgröße]] / ([[n|validn|Fallzahl]] · min(r−1,c−1)))",
  "requires": [],
  "notes": [
   "V liegt bei nichtleeren Randverteilungen zwischen 0 und 1 und besitzt keine Richtung.",
   "Vergleiche die Stärke im inhaltlichen Kontext; starre universelle Schwellen sind wenig hilfreich."
  ],
  "output": "Zusammenhangsstärke auch für Tabellen größer als 2×2. Der Hilfsaufruf berechnet intern auch χ²; bei seltenen Kategorien kann er vor dessen asymptotischer Testnäherung warnen.",
  "variants": [
   {
    "label": "Kategoriale Zusammenhangsstärke",
    "fn": "cramers_v",
    "code": "atlas %>%\n  cramers_v({x}, {y})"
   }
  ],
  "roles": [
   {
    "key": "x",
    "label": "Kategorien",
    "kind": "category",
    "default": [
     "schulabschluss"
    ],
    "many": false
   },
   {
    "key": "y",
    "label": "Zweites kategoriales Merkmal",
    "kind": "category",
    "default": [
     "geschlecht"
    ],
    "many": false
   }
  ],
  "existing": false
 },
 {
  "id": "goodman_gamma",
  "title": "Goodman–Kruskal-Gamma",
  "region": "categorical",
  "intro": "Vergleiche gleichgerichtete und entgegengesetzte Personenpaare. Bindungen werden im Nenner nicht mitgezählt.",
  "formula": "γ = ([[C − D|concordance|Konkordante minus diskordante Paare]]) / (C+D)",
  "requires": [
   {
    "id": "ordinal",
    "reason": "braucht die richtige Kategorienordnung"
   }
  ],
  "notes": [
   "Bei ausschließlich gebundenen Paaren ist der Nenner null. Viele Bindungen können Gamma gegenüber Tau-b vergrößern."
  ],
  "output": "Gerichteter ordinaler Zusammenhang zwischen −1 und +1. Eine Warnung des intern zusätzlich berechneten χ²-Tests kann kleine erwartete Zellzahlen betreffen.",
  "variants": [
   {
    "label": "Geordnete Kategorien",
    "fn": "goodman_gamma",
    "code": "atlas %>%\n  goodman_gamma({x}, {y})"
   }
  ],
  "roles": [
   {
    "key": "x",
    "label": "Geordnete Zielvariable",
    "kind": "ordered",
    "default": [
     "finanzlage"
    ],
    "many": false
   },
   {
    "key": "y",
    "label": "Zweites geordnetes Merkmal",
    "kind": "ordered",
    "default": [
     "schulabschluss"
    ],
    "many": false
   }
  ],
  "existing": false
 },
 {
  "id": "kendall_tau",
  "title": "Kendall Tau-b",
  "region": "categorical",
  "intro": "Kendall vergleicht Personenpaare und berücksichtigt Bindungen im Nenner. mariposa implementiert Tau-b.",
  "formula": "τb = ([[C − D|concordance|Übereinstimmende minus widersprechende Paare]]) / √((N₀−Tₓ)(N₀−Tᵧ))",
  "requires": [
   {
    "id": "ordinal",
    "reason": "begründet die Reihenfolge"
   }
  ],
  "notes": [
   "N₀=n(n−1)/2. Tₓ beziehungsweise Tᵧ zählen alle in X beziehungsweise Y gebundenen Personenpaare, einschließlich beidseitiger Bindungen.",
   "Gewichtet verwendet mariposa √(wᵢwⱼ) als Paargewicht. Die Beispiele bleiben ungewichtet."
  ],
  "output": "Tau-b und approximativer p-Wert; die Testapproximation hängt von Umfang und Bindungen ab.",
  "variants": [
   {
    "label": "Tau-b ohne Gewichte",
    "fn": "kendall_tau",
    "code": "atlas %>%\n  kendall_tau({x}, {y}, use = \"listwise\")"
   }
  ],
  "roles": [
   {
    "key": "x",
    "label": "Geordnete Zielvariable",
    "kind": "ordered",
    "default": [
     "finanzlage"
    ],
    "many": false
   },
   {
    "key": "y",
    "label": "Zweites geordnetes Merkmal",
    "kind": "ordered",
    "default": [
     "schulabschluss"
    ],
    "many": false
   }
  ],
  "existing": false
 },
 {
  "id": "partial_cor",
  "title": "Partielle Korrelation",
  "region": "models",
  "intro": "Untersuche den linearen Zusammenhang zweier Merkmale nach linearer Kontrolle weiterer Variablen. Anschaulich korrelierst du die verbleibenden Residuen.",
  "formula": "rXY·Z = ([[rXY|pearson|Unkontrollierte Pearson-Korrelation]] − rXZ rYZ) / √((1−rXZ²)(1−rYZ²))",
  "requires": [
   {
    "id": "residuals",
    "reason": "erklärt den nach Kontrolle verbleibenden Anteil"
   }
  ],
  "notes": [
   "Die Formel zeigt eine Kontrollvariable. Mehrere Kontrollen verwendet das Paket über die inverse Kontrollkorrelationsmatrix.",
   "Immer listwise über alle ausgewählten Variablen. Kein use-/alternative-Argument. Kontrollmatrix muss invertierbar sein; df=n−k−2.",
   "Kontrollieren stellt keine Kausalität her."
  ],
  "output": "Partielle und unkontrollierte Pearson-Korrelation zum Vergleich.",
  "variants": [
   {
    "label": "Lineare Kontrolle",
    "fn": "partial_cor",
    "code": "atlas %>%\n  partial_cor({x}, {y}, controls = c({controls}))"
   }
  ],
  "roles": [
   {
    "key": "x",
    "label": "Zielvariable",
    "kind": "quantitative",
    "default": [
     "lernzeit"
    ],
    "many": false
   },
   {
    "key": "y",
    "label": "Zweite Variable",
    "kind": "quantitative",
    "default": [
     "wissenstest"
    ],
    "many": false
   },
   {
    "key": "controls",
    "label": "Kontrollvariablen",
    "kind": "quantitative",
    "default": [
     "alter",
     "schlafdauer"
    ],
    "many": true
   }
  ],
  "existing": false
 },
 {
  "id": "linear_regression",
  "title": "Lineare Regression",
  "region": "models",
  "intro": "Erkläre eine quantitative Zielgröße durch einen oder mehrere Prädiktoren. Das Modell wählt Koeffizienten nach dem Prinzip kleinster Quadrate.",
  "formula": "[[ŷᵢ|prediction|Vorhergesagter Zielwert]] = b₀ + Σ bⱼxᵢⱼ; R² = 1 − [[SSE|residuals|Restliche Quadratsumme]] / [[SST|ss|Gesamte Quadratsumme]]",
  "requires": [
   {
    "id": "sampling",
    "reason": "erfordert ein passendes Stichproben-/Fehlermodell"
   },
   {
    "id": "metric",
    "reason": "begründet die Zielskala"
   }
  ],
  "notes": [
   "Keine perfekte Multikollinearität. Klassische Tests benötigen geeignete unabhängige Fehler und Varianzannahmen; Normalität betrifft die Fehler.",
   "Default standardized=TRUE liefert zusätzlich standardisierte Koeffizienten. Numerische Kategoriencodes werden nicht automatisch zu Faktoren.",
   "use=\"pairwise\" ist eine separate Matrixmethode, nur für additive numerische Prädiktoren. Die Beispiele verwenden listwise."
  ],
  "output": "Koeffizienten, Intervalle, Tests und R². predict liefert Vorhersagen; anova vergleicht verschachtelte Modelle auf gleicher Fallbasis.",
  "variants": [
   {
    "label": "Additives Modell",
    "fn": "linear_regression",
    "code": "modell <- atlas %>%\n  linear_regression({x} ~ {predictors_formula}, use = \"listwise\", standardized = TRUE)\n\nsummary(modell)\n\npredict(modell)"
   },
   {
    "label": "Interaktion zweier Prädiktoren",
    "fn": "linear_regression",
    "code": "modell <- atlas %>%\n  linear_regression({x} ~ {predictors_interaction}, use = \"listwise\")\n\nsummary(modell)",
    "roles": [
     {
      "key": "x",
      "label": "Quantitative Zielgröße",
      "kind": "quantitative",
      "default": [
       "wissenstest"
      ],
      "many": false
     },
     {
      "key": "predictors",
      "label": "Genau zwei Prädiktoren",
      "kind": "interaction",
      "default": [
       "lernzeit",
       "weiterbildung"
      ],
      "many": true
     }
    ],
    "formula": "[[ŷ|prediction|Modellvorhersage]] = b₀ + b₁X + b₂Z + [[b₃XZ|interaction|Interaktion]]", "note": "Der Aufruf rechnet mit genau zwei Prädiktoren und ihrem Interaktionsterm, dem Produkt beider. Hat ein Prädiktor mehr als zwei Stufen, entstehen mehrere Indikatorspalten (mit 0 und 1) und entsprechend mehrere Interaktionsterme."
   }
  ],
  "roles": [
   {
    "key": "x",
    "label": "Quantitative Zielgröße",
    "kind": "quantitative",
    "default": [
     "wissenstest"
    ],
    "many": false
   },
   {
    "key": "predictors",
    "label": "Prädiktoren",
    "kind": "predictor",
    "default": [
     "lernzeit",
     "alter"
    ],
    "many": true
   }
  ],
  "existing": false
 },
 {
  "id": "logistic_regression",
  "title": "Logistische Regression",
  "region": "models",
  "intro": "Modelliere die Wahrscheinlichkeit eines binären Ereignisses. Der lineare Prädiktor wirkt auf den Logit; die inverse Logitfunktion liefert Wahrscheinlichkeiten.",
  "formula": "[[pᵢ|logit|Ereigniswahrscheinlichkeit]] = 1 / (1 + exp(−[[ηᵢ|prediction|Linearer Prädiktor]])); ORⱼ = exp(bⱼ)",
  "requires": [
   {
    "id": "likelihood",
    "reason": "liefert das Schätzprinzip"
   },
   {
    "id": "sampling",
    "reason": "begründet unabhängige Beobachtungen"
   }
  ],
  "notes": [
   "0 = kein Ereignis, 1 = Ereignis. Bei einem Faktor nimmt das Paket die erste Stufe als 0 und die zweite als 1.",
   "Immer listwise, kein use-Argument. Beide Klassen müssen vorhanden sein; Separation und instabile Schätzungen prüfen.",
   "Ohne Zusatzterme hängen kontinuierliche Prädiktoren linear mit dem Logit zusammen. Ein großer Hosmer–Lemeshow-p-Wert beweist keine gute Passung."
  ],
  "output": "Logitkoeffizienten, Odds Ratios und Modellgüte; Pseudo-R² nicht als erklärten Varianzanteil deuten.",
  "variants": [
   {
    "label": "Binäres Logitmodell",
    "fn": "logistic_regression",
    "code": "modell <- atlas %>%\n  logistic_regression({x} ~ {predictors_formula}, factors = \"dummy\")\n\nsummary(modell)\n\npredict(modell, type = \"response\")"
   }
  ],
  "roles": [
   {
    "key": "x",
    "label": "Binäre Antwort · Ereignis = 1",
    "kind": "binary",
    "default": [
     "weiterbildung"
    ],
    "many": false
   },
   {
    "key": "predictors",
    "label": "Prädiktoren",
    "kind": "predictor",
    "default": [
     "lernzeit",
     "alter"
    ],
    "many": true
   }
  ],
  "existing": false
 },
 {
  "id": "marginal_effects",
  "title": "Marginale Effekte",
  "region": "models",
  "intro": "Übersetze ein Logitmodell in Änderungen der vorhergesagten Wahrscheinlichkeit. Mittlere marginale Effekte fassen diese Änderungen über die Personen zusammen.",
  "formula": "AMEⱼ = [[Mittelwert|mean|Mittel über Personen]](bⱼ [[pᵢ(1−pᵢ)|logit|Lokale Logit-Ableitung]])",
  "requires": [
   {
    "id": "logistic_regression",
    "reason": "liefert das geschätzte Modell"
   }
  ],
  "notes": [
   "Die Formel gilt für einen numerischen additiven Prädiktor ohne Interaktion. Das Paket nutzt numerische Ableitungen und die Delta-Methode.",
   "Faktoren erzeugen diskrete Vergleiche mit der Referenzstufe. Deshalb werden kategoriale Prädiktoren im Code ausdrücklich in Faktoren umgewandelt.",
   "Nur logistische Modelle; lineare Regressionsobjekte werden abgewiesen. AME=.03 bedeutet 3 Prozentpunkte."
  ],
  "output": "Durchschnittliche lokale Ableitungen oder diskrete Faktorunterschiede mit Unsicherheit.",
  "variants": [
   {
    "label": "Effekte eines Logitmodells",
    "fn": "marginal_effects",
    "code": "atlas %>%\n  logistic_regression({x} ~ {predictors_formula}) %>%\n  marginal_effects()"
   }
  ],
  "roles": [
   {
    "key": "x",
    "label": "Binäre Antwort · Ereignis = 1",
    "kind": "binary",
    "default": [
     "weiterbildung"
    ],
    "many": false
   },
   {
    "key": "predictors",
    "label": "Prädiktoren",
    "kind": "predictor",
    "default": [
     "lernzeit",
     "alter"
    ],
    "many": true
   }
  ],
  "existing": false
 },
 {
  "id": "reliability",
  "title": "Reliabilität: Alpha und Omega",
  "region": "scales",
  "intro": "Beschreibe die interne Konsistenz zusammengehöriger Items. Alpha verwendet Item- und Summenvarianzen; Omega verwendet ein Einfaktor-Modell.",
  "formula": "α = k/(k−1) · (1 − Σ[[sⱼ²|variance|Varianz einzelner Items]] / [[s²Summe|item_score|Varianz des Summenwerts]]); ω = (Σλⱼ)² / ((Σλⱼ)² + Σθⱼ)",
  "requires": [
   {
    "id": "factor_model",
    "reason": "erklärt Ladungen λ und Fehlervarianzen θ"
   }
  ],
  "notes": [
   "Alpha: mindestens zwei numerische Items. Omega: mindestens drei; Einfaktor-ML-Modell. Listwise über alle ausgewählten Items.",
   "Rohes und standardisiertes Alpha werden unterschieden. Umpolen erfolgt nicht automatisch.",
   "Eine Reliabilitätsdeutung von Alpha benötigt Annahmen wie essentielle Tau-Äquivalenz und passende Fehlerstruktur. Hoher Alpha-Wert beweist weder Eindimensionalität noch Validität."
  ],
  "output": "Rohes/standardisiertes Alpha und Omega, Itemkennwerte und Werte nach Itemausschluss. Der synthetische Itemblock ist keine validierte Skala.",
  "variants": [
   {
    "label": "Fünf gleichgerichtete Lehritems",
    "fn": "reliability",
    "code": "rel <- atlas %>%\n  reliability({items}, na.rm = TRUE)\n\nsummary(rel)"
   }
  ],
  "roles": [
   {
    "key": "items",
    "label": "Zusammengehörige Items",
    "kind": "items",
    "default": [
     "methoden1",
     "methoden2",
     "methoden3",
     "methoden4",
     "methoden5"
    ],
    "many": true
   }
  ],
  "existing": false
 },
 {
  "id": "efa",
  "title": "Komponenten- & Faktorenanalyse",
  "region": "scales",
  "intro": "Untersuche die gemeinsame Struktur mehrerer Items. Wähle ausdrücklich zwischen Hauptkomponenten (PCA) und einem gemeinsamen Faktorenmodell (ML).",
  "formula": "[[R|pearson|Korrelationsmatrix]] → [[Extraktion|factor_model|Komponenten oder gemeinsame Faktoren]] → Ladungen → Rotation",
  "requires": [],
  "notes": [
   "Default extraction=\"pca\", rotation=\"varimax\". Eine PCA ist keine gemeinsame Faktorenanalyse.",
   "Ohne Faktorzahl gilt Eigenwert >1, mindestens eine Komponente. ML begrenzt zusätzlich nach Identifizierbarkeit.",
   "use=\"complete\" bedeutet vollständige Fälle; pairwise kann eine nicht positiv definite Matrix erzeugen.",
   "Oblimin benötigt GPArotation. KMO, Bartlett und Eigenwertregeln sind Hilfen, keine automatische Skalenvalidierung.",
   "Bei genau drei Items und einem ML-Faktor ist das Modell gerade identifiziert; ein informativer globaler Modelltest entsteht daraus nicht. Die ML-Schätzung und ihr klassischer Modelltest beruhen auf multivariater Normalität. Die metrische Näherung der 7-stufigen Items garantiert diese Annahme nicht. PCA benötigt keine Normalverteilung."
  ],
  "output": "Ladungen, Kommunalitäten, Eigenwerte und Diagnostik; blank=.40 blendet nur kleine Ladungen in der Ausgabe aus.",
  "variants": [
   {
    "label": "Eine Hauptkomponente · PCA",
    "fn": "efa",
    "code": "atlas %>%\n  efa({items}, extraction = \"pca\", n_factors = 1, rotation = \"none\", use = \"complete\")"
   },
   {
    "label": "Ein gemeinsamer Faktor · ML",
    "fn": "efa",
    "code": "atlas %>%\n  efa({items}, extraction = \"ml\", n_factors = 1, rotation = \"none\", use = \"complete\")"
   },
   {
    "label": "Zwei Komponenten · Varimax",
    "fn": "efa",
    "code": "atlas %>%\n  efa({items}, extraction = \"pca\", n_factors = 2, rotation = \"varimax\", use = \"complete\")"
   },
   {
    "label": "Zwei Komponenten · Oblimin",
    "fn": "efa",
    "code": "atlas %>%\n  efa({items}, extraction = \"pca\", n_factors = 2, rotation = \"oblimin\", use = \"complete\")"
   },
   {
    "label": "Zwei Komponenten · Promax",
    "fn": "efa",
    "code": "atlas %>%\n  efa({items}, extraction = \"pca\", n_factors = 2, rotation = \"promax\", use = \"complete\")"
   }
  ],
  "roles": [
   {
    "key": "items",
    "label": "Zusammengehörige Items",
    "kind": "items",
    "default": [
     "methoden1",
     "methoden2",
     "methoden3",
     "methoden4",
     "methoden5"
    ],
    "many": true
   }
  ],
  "existing": false
 },
 {
  "id": "describe",
  "title": "Deskriptiver Überblick",
  "region": "describe",
  "intro": "Fasse Lage, Streuung und Verteilungsform mehrerer numerischer Variablen zusammen. Die Übersicht ist ein Ausgangspunkt für gezielte Fragen in der Karte.",
  "formula": "[[Mittelwert|mean|Lage]] + [[Median|median|Geordnete Mitte]] + [[SD|sd|Streuung]] + [[Quantile|quantile|Positionen der Verteilung]]",
  "requires": [],
  "notes": [
   "Zahlencodes nominaler Kategorien sind keine metrischen Messwerte. Likert-Items werden hier gemäß der gewählten Näherung behandelt."
  ],
  "output": "Kennwerte und Fallzahlen nebeneinander; show=\"all\" erweitert die Ausgabe.",
  "variants": [
   {
    "label": "Alle Kennwerte",
    "fn": "describe",
    "code": "atlas %>%\n  describe({variables}, show = \"all\")"
   }
  ],
  "roles": [
   {
    "key": "variables",
    "label": "Numerische Merkmale",
    "kind": "quantitative",
    "default": [
     "lernzeit",
     "einkommen"
    ],
    "many": true
   }
  ],
  "existing": false
 },
 {
  "id": "quantile",
  "title": "Quantile & Interquartilsabstand",
  "region": "describe",
  "intro": "Quantile markieren Positionen in einer geordneten Verteilung. Der Interquartilsabstand umfasst den Abstand zwischen dem 25-%- und 75-%-Quantil.",
  "formula": "h = (N+1)p; [[Qp|sorting|Zwischen benachbarten geordneten Werten interpolieren]]; IQR = Q.75 − Q.25",
  "requires": [],
  "notes": [
   "w_quantile verwendet Type 6/HAVERAGE, auch ohne Gewichte. Das weicht vom Standard Type 7 in stats::quantile ab.",
   "Randpositionen werden auf das beobachtete Minimum und Maximum begrenzt. Mit Gewichten richtet sich die Interpolation nach kumulierten Gewichten."
  ],
  "output": "Quantile in der Einheit der Variable; IQR als robuste Breite der mittleren Hälfte.",
  "variants": [
   {
    "label": "Quartile nach Type 6",
    "fn": "w_quantile",
    "code": "atlas %>%\n  w_quantile({x}, probs = c(.25, .5, .75))"
   },
   {
    "label": "Interquartilsabstand",
    "fn": "w_iqr",
    "code": "atlas %>%\n  w_iqr({x})"
   }
  ],
  "roles": [
   {
    "key": "x",
    "label": "Zielvariable",
    "kind": "quantitative",
    "default": [
     "lernzeit"
    ],
    "many": false
   }
  ],
  "existing": false
 },
 {
  "id": "range",
  "title": "Spannweite",
  "region": "describe",
  "intro": "Die Spannweite misst den Abstand zwischen dem größten und dem kleinsten beobachteten Wert.",
  "formula": "Spannweite = max([[x|series|Beobachtete Werte]]) − min(x)",
  "requires": [],
  "notes": [
   "Nur die beiden Extrema bestimmen den Wert. Einzelne Ausreißer und der Stichprobenumfang können ihn stark beeinflussen.",
   "Gewichte ändern die Größe beobachteter Extrema nicht."
  ],
  "output": "Breite vom Minimum bis zum Maximum.",
  "variants": [
   {
    "label": "Beobachtete Spannweite",
    "fn": "w_range",
    "code": "atlas %>%\n  w_range({x})"
   }
  ],
  "roles": [
   {
    "key": "x",
    "label": "Zielvariable",
    "kind": "quantitative",
    "default": [
     "lernzeit"
    ],
    "many": false
   }
  ],
  "existing": false
 },
 {
  "id": "mode",
  "title": "Modus",
  "region": "describe",
  "intro": "Der Modus ist die am häufigsten beobachtete Ausprägung. Dazu braucht es keine metrischen Abstände.",
  "formula": "Modus = argmaxⱼ [[nⱼ|frequency|Häufigkeit einer Ausprägung]]",
  "requires": [],
  "notes": [
   "Bei Gleichstand liefert w_modus nur einen Modus, nicht die vollständige Menge gleich häufiger Ausprägungen.",
   "Für stetige Daten ist ein Klassenmodus oft anschaulicher als der Modus einzelner Dezimalwerte."
  ],
  "output": "Die häufigste beobachtete Ausprägung.",
  "variants": [
   {
    "label": "Häufigste Ausprägung",
    "fn": "w_modus",
    "code": "atlas %>%\n  w_modus({x})"
   }
  ],
  "roles": [
   {
    "key": "x",
    "label": "Kategorien",
    "kind": "category",
    "default": [
     "schulabschluss"
    ],
    "many": false
   }
  ],
  "existing": false
 },
 {
  "id": "shape",
  "title": "Schiefe & Kurtosis",
  "region": "describe",
  "intro": "Schiefe beschreibt Asymmetrie, Kurtosis die Form über standardisierte vierte Abweichungsmomente. Beide reagieren stark auf extreme Werte.",
  "formula": "Schiefe ∝ Σ[[dᵢ³|deviation|Kubische Abweichungen]] / [[s³|sd|Skalierung durch Streuung]]; Exzess = korrigiertes 4. Moment − 3",
  "requires": [],
  "notes": [
   "mariposa verwendet Stichprobenkorrekturen. w_kurtosis berichtet standardmäßig Exzess; eine Normalverteilung hat Exzess 0.",
   "Kurtosis ist nicht bloß die Höhe eines Gipfels. Kleine Stichproben und Ausreißer machen die Kennwerte instabil."
  ],
  "output": "Formkennwerte ergänzen die Verteilungsansicht, ersetzen sie aber nicht.",
  "variants": [
   {
    "label": "Schiefe",
    "fn": "w_skew",
    "code": "atlas %>%\n  w_skew({x})",
    "formula": "mᵣ = Σ([[xᵢ−x̄|deviation|Abweichungen]])ʳ/n; G₁ = √(n(n−1))/(n−2) · m₃/m₂^(3/2)"
   },
   {
    "label": "Kurtosis · Exzess",
    "fn": "w_kurtosis",
    "code": "atlas %>%\n  w_kurtosis({x}, excess = TRUE)",
    "formula": "mᵣ = Σ([[xᵢ−x̄|deviation|Abweichungen]])ʳ/n; g₂=m₄/m₂²−3; G₂=((n+1)g₂+6)(n−1)/((n−2)(n−3))"
   },
   {
    "label": "Kurtosis · ohne Abzug 3",
    "fn": "w_kurtosis",
    "code": "atlas %>%\n  w_kurtosis({x}, excess = FALSE)",
    "formula": "mᵣ = Σ([[xᵢ−x̄|deviation|Abweichungen]])ʳ/n; g₂=m₄/m₂²−3; G₂=((n+1)g₂+6)(n−1)/((n−2)(n−3)); Kurtosis = G₂+3"
   }
  ],
  "roles": [
   {
    "key": "x",
    "label": "Zielvariable",
    "kind": "quantitative",
    "default": [
     "lernzeit"
    ],
    "many": false
   }
  ],
  "existing": false
 },
 {
  "id": "multiple_response",
  "title": "Mehrfachantworten",
  "region": "describe",
  "intro": "Eine Person kann mehrere Lernquellen wählen. Zähle die gewählten Antworten und unterscheide Anteile an Personen von Anteilen an allen Nennungen.",
  "formula": "% Fälle = 100 · [[Nennungenⱼ|frequency|Ausgewählte Antworten je Option]] / n gültige Fälle; % Antworten = 100 · Nennungenⱼ / ΣNennungen",
  "requires": [],
  "notes": [
   "Die drei Lernquellen sind Teil derselben Mehrfachauswahlfrage; counted=1 markiert eine gewählte Option.",
   "Fallprozente können sich über 100 % summieren. Personen ohne ausgewählte Option sind trotzdem Fälle."
  ],
  "output": "Nennungen, Antwortprozente und Fallprozente.",
  "variants": [
   {
    "label": "Lernquellen · Mehrfachauswahl",
    "fn": "multiple_response",
    "code": "atlas %>%\n  multiple_response({items}, counted = 1)"
   }
  ],
  "roles": [
   {
    "key": "items",
    "label": "Optionen derselben Mehrfachfrage",
    "kind": "multiple",
    "default": [
     "quelle_buch",
     "quelle_video",
     "quelle_kurs"
    ],
    "many": true
   }
  ],
  "existing": false
 },
 {
  "id": "codebook",
  "title": "Codebuch & Variablensuche",
  "region": "prepare",
  "intro": "Verbinde Datenspalten mit ihrer Bedeutung. Ein Codebuch erklärt Fragen, Codes, Datentypen, Häufigkeiten und fehlende Angaben.",
  "formula": "[[Variable|series|Eine Datenspalte]] + [[Labels|labels|Fragen und Antworttexte]] + [[Häufigkeiten|frequency|Beobachtete Ausprägungen]]",
  "requires": [],
  "notes": [
   "find_var kann Namen, Labels oder beides durchsuchen. codebook(view=FALSE) erzeugt die Ausgabe ohne einen externen Viewer zu öffnen."
  ],
  "output": "Metadaten und Werteübersicht beziehungsweise passende Variablennamen.",
  "variants": [
   {
    "label": "Codebuch erzeugen",
    "fn": "codebook",
    "code": "atlas %>%\n  codebook(view = FALSE)"
   },
   {
    "label": "Lernvariablen finden",
    "fn": "find_var",
    "code": "atlas %>%\n  find_var(\"lern\", search = \"name_label\")"
   }
  ],
  "roles": [],
  "existing": false
 },
 {
  "id": "labels",
  "title": "Variablen- & Wertelabels",
  "region": "prepare",
  "intro": "Labels bewahren die Bedeutung der Daten: Eine Variable bekommt den Fragetext, einzelne Antwortcodes bekommen ihre Kategoriennamen.",
  "formula": "[[Code 0/1|nominal|Numerische Kategoriencodes]] ↔ „Nein/Ja“",
  "requires": [],
  "notes": [
   "Labels ändern weder den Messwert noch das Skalenniveau. Setter geben ein verändertes Objekt zurück; weise es zu, um die Änderung zu behalten.",
   "copy_labels übernimmt Metadaten gleichnamiger Variablen. drop_labels entfernt nur Labels nicht mehr beobachteter Werte; unlabel entfernt Label-Metadaten insgesamt."
  ],
  "output": "Lesbare Daten mit bewahrten numerischen Codes.",
  "variants": [
   {
    "label": "Fragetext setzen",
    "fn": "var_label",
    "code": "atlas <- atlas %>%\n  var_label(lernzeit = \"Lernzeit in den letzten sieben Tagen\")"
   },
   {
    "label": "Antworttexte setzen",
    "fn": "val_labels",
    "code": "atlas <- atlas %>%\n  val_labels(erwerbstaetig = c(\"Nein\" = 0, \"Ja\" = 1))"
   },
   {
    "label": "Labels kopieren",
    "fn": "copy_labels",
    "code": "kopie <- atlas %>%\n  unlabel() %>%\n  copy_labels(atlas)"
   },
   {
    "label": "Unbenutzte Labels entfernen",
    "fn": "drop_labels",
    "code": "erwerbstaetige <- atlas %>%\n  filter(erwerbstaetig == 1) %>%\n  drop_labels()"
   },
   {
    "label": "Labels entfernen",
    "fn": "unlabel",
    "code": "ohne_labels <- atlas %>%\n  unlabel()"
   }
  ],
  "roles": [],
  "existing": false
 },
 {
  "id": "conversion",
  "title": "Datentypen umwandeln",
  "region": "prepare",
  "intro": "R unterscheidet Zahlen, Zeichenketten, Faktoren und gelabelte Werte. Wähle die Darstellung passend zum nächsten Analyseschritt.",
  "formula": "[[Zahlencode|nominal|Gespeicherter Wert]] ↔ Label ↔ Faktor ↔ Text",
  "requires": [
   {
    "id": "labels",
    "reason": "bewahrt die Bedeutung"
   }
  ],
  "notes": [
   "to_numeric macht eine nominale Variable nicht metrisch. Bei Faktoren können Stufennummern und ursprüngliche Zahlencodes auseinanderfallen.",
   "Für gewöhnliche Gruppenvergleiche und Referenzgruppenregressionen nutze ungeordnete Faktoren; ordered-Faktoren bekommen in R häufig polynomiale Kontraste."
  ],
  "output": "Gleiche Inhalte in einer gezielt gewählten R-Darstellung.",
  "variants": [
   {
    "label": "Labels zu Faktoren",
    "fn": "to_label",
    "code": "atlas %>%\n  to_label(erwerbstaetig) %>%\n  frequency(erwerbstaetig)"
   },
   {
    "label": "Gelabelter Vektor",
    "fn": "to_labelled",
    "code": "atlas %>%\n  mutate(erwerbstaetig = to_labelled(erwerbstaetig, labels = c(\"Nein\" = 0, \"Ja\" = 1), label = \"Erwerbstätig\")) %>%\n  frequency(erwerbstaetig)"
   },
   {
    "label": "Labels zu Text",
    "fn": "to_character",
    "code": "atlas %>%\n  to_character(erwerbstaetig) %>%\n  frequency(erwerbstaetig)"
   },
   {
    "label": "Numerische Werte",
    "fn": "to_numeric",
    "code": "atlas %>%\n  to_numeric(erwerbstaetig) %>%\n  frequency(erwerbstaetig)"
   }
  ],
  "roles": [],
  "existing": false
 },
 {
  "id": "missing_tools",
  "title": "Missing-Codes aufbereiten",
  "region": "prepare",
  "intro": "Sondercodes wie −9 sollen nicht versehentlich als Einkommen in eine Rechnung eingehen. mariposa kann solche Codes in markierte fehlende Werte umwandeln.",
  "formula": "−9 → [[NA|missing|Fehlende Angabe]] → gültige Fallauswahl",
  "requires": [],
  "notes": [
   "Die Beispiele setzen nur innerhalb des Aufrufs bei P001 den Lehr-Missing-Code −9. atlas selbst bleibt vollständig.",
   "untag_na stellt geeignete ursprüngliche Codes wieder her. strip_tags erhält den Missing-Status und vereinheitlicht zu gewöhnlichem NA."
  ],
  "output": "Bereinigte Werte oder eine Häufigkeitstabelle der Missing-Typen.",
  "variants": [
   {
    "label": "Code als fehlend markieren",
    "fn": "set_na",
    "code": "atlas %>%\n  mutate(einkommen = replace(einkommen, id == \"P001\", -9)) %>%\n  set_na(einkommen = -9) %>%\n  describe(einkommen, show = c(\"mean\", \"sd\"))"
   },
   {
    "label": "Fehlende Angaben zählen",
    "fn": "na_frequencies",
    "code": "atlas %>%\n  mutate(einkommen = replace(einkommen, id == \"P001\", -9)) %>%\n  set_na(einkommen = -9) %>%\n  pull(einkommen) %>%\n  na_frequencies()"
   },
   {
    "label": "Missing-Code zurückholen",
    "fn": "untag_na",
    "code": "atlas %>%\n  mutate(einkommen = replace(einkommen, id == \"P001\", -9)) %>%\n  set_na(einkommen = -9) %>%\n  pull(einkommen) %>%\n  untag_na() %>%\n  head(3)"
   },
   {
    "label": "Missing-Tags entfernen",
    "fn": "strip_tags",
    "code": "atlas %>%\n  mutate(einkommen = replace(einkommen, id == \"P001\", -9)) %>%\n  set_na(einkommen = -9) %>%\n  pull(einkommen) %>%\n  strip_tags() %>%\n  head(3)"
   }
  ],
  "roles": [],
  "existing": false
 },
 {
  "id": "recode",
  "title": "Rekodieren & Umpolen",
  "region": "prepare",
  "intro": "Lege eine nachvollziehbare Zuordnung alter zu neuer Werte fest. Beim Umpolen wird die Richtung einer Antwortskala umgekehrt.",
  "formula": "x_neu = [[Minimum + Maximum|pomps|Theoretische Skalenendpunkte]] − [[x|series|Ursprünglicher Wert]]",
  "requires": [],
  "notes": [
   "Umpolen ist eine inhaltliche Entscheidung: Erst die Frage entscheidet, welche Richtung „mehr“ bedeutet.",
   "Eine neue Spalte bewahrt die ursprünglichen Werte. Kategorien zusammenfassen verändert die verfügbare Information."
  ],
  "output": "Eine neue Spalte mit expliziter Rekodierregel.",
  "variants": [
   {
    "label": "Itemrichtung umkehren",
    "fn": "rec",
    "code": "atlas %>%\n  mutate({x}_umgepolt = rec({x}, rules = \"{reverse_rules}\")) %>%\n  frequency({x}_umgepolt)"
   }
  ],
  "roles": [
   {
    "key": "x",
    "label": "Likert-Item",
    "kind": "likert",
    "default": [
     "lernplanung5"
    ],
    "many": false
   }
  ],
  "existing": false
 },
 {
  "id": "dummy",
  "title": "Dummyvariablen",
  "region": "prepare",
  "intro": "Eine Dummyvariable zeigt, ob eine Person zu einer bestimmten Kategorie gehört. Für k Kategorien und einen Achsenabschnitt genügen k−1 Indikatoren.",
  "formula": "Dᵢⱼ = 1, wenn [[Kategorieᵢ|nominal|Kategorie der Person]] = j; sonst 0",
  "requires": [],
  "notes": [
   "Eine ausgelassene Referenzkategorie verhindert zusammen mit dem Achsenabschnitt perfekte Multikollinearität.",
   "Referenzwechsel verändert die Interpretation einzelner Koeffizienten, aber nicht die Modellvorhersagen."
  ],
  "output": "Neue 0/1-Spalten für die ausgewählten Kategorien.",
  "variants": [
   {
    "label": "Indikatoren mit Referenzkategorie",
    "fn": "to_dummy",
    "code": "atlas %>%\n  to_dummy({x}, ref = {lo}) %>%\n  select(starts_with(\"{x}_\"))"
   }
  ],
  "roles": [
   {
    "key": "x",
    "label": "Kategorien",
    "kind": "category",
    "default": [
     "schulabschluss"
    ],
    "many": false
   }
  ],
  "existing": false
 },
 {
  "id": "pomps",
  "title": "POMPS (Skalen auf 0–100)",
  "region": "scales",
  "intro": "Rechne eine Antwort anhand ihrer theoretischen Skalenendpunkte in Prozent des möglichen Wertebereichs um.",
  "formula": "POMP = 100 · ([[x|series|Beobachteter Wert]] − min) / (max − min)",
  "requires": [],
  "notes": [
   "Nutze theoretische Endpunkte, nicht zufälliges Minimum und Maximum der Stichprobe.",
   "Ein gemeinsamer Bereich 0–100 begründet weder gleiche Messqualität noch eine gemeinsame Skala."
  ],
  "output": "0 entspricht dem theoretischen Minimum, 100 dem Maximum.",
  "variants": [
   {
    "label": "Theoretische Skalenbreite",
    "fn": "pomps",
    "code": "atlas %>%\n  mutate(pomp = pomps({x}, scale_min = {lo}, scale_max = {hi})) %>%\n  describe({x}, pomp, show = c(\"mean\", \"min\", \"max\"))"
   }
  ],
  "roles": [
   {
    "key": "x",
    "label": "Likert-Item",
    "kind": "likert",
    "default": [
     "lernplanung5"
    ],
    "many": false
   }
  ],
  "existing": false,
  "lab": "pomps"
 },
 {
  "id": "row_operations",
  "title": "Rechnen innerhalb einer Person",
  "region": "scales",
  "intro": "Zeilenfunktionen fassen mehrere Spalten derselben Person zusammen. Das ist eine andere Richtung als der Mittelwert einer ganzen Datenspalte.",
  "formula": "[[Zeilensumme|item_score|Summe der Itemantworten]] / Anzahl gültiger Items = Zeilenmittel",
  "requires": [],
  "notes": [
   "min_valid legt eine Mindestzahl beantworteter Items fest; die Beispiele verlangen alle fünf.",
   "row_count zählt einen vorgegebenen Wert, etwa gewählte Lernquellen. Eine Auswahl mehrerer Spalten begründet allein keine inhaltliche Skala."
  ],
  "output": "Ein Vektor mit einem Ergebnis je Person, den du als neue Spalte speichern kannst.",
  "variants": [
   {
    "label": "Itemmittel pro Person",
    "fn": "row_means",
    "code": "atlas %>%\n  mutate(methoden_mittel = row_means(pick({items}), min_valid = {item_count})) %>%\n  describe(methoden_mittel, show = c(\"mean\", \"sd\", \"min\", \"max\"))",
    "roles": [
     {
      "key": "items",
      "label": "Zusammengehörige Items",
      "kind": "items",
      "default": [
       "methoden1",
       "methoden2",
       "methoden3",
       "methoden4",
       "methoden5"
      ],
      "many": true
     }
    ]
   },
   {
    "label": "Itemsumme pro Person",
    "fn": "row_sums",
    "code": "atlas %>%\n  mutate(methoden_summe = row_sums(pick({items}), min_valid = {item_count})) %>%\n  describe(methoden_summe, show = c(\"mean\", \"sd\", \"min\", \"max\"))",
    "roles": [
     {
      "key": "items",
      "label": "Zusammengehörige Items",
      "kind": "items",
      "default": [
       "methoden1",
       "methoden2",
       "methoden3",
       "methoden4",
       "methoden5"
      ],
      "many": true
     }
    ]
   },
   {
    "label": "Anzahl gewählter Lernquellen",
    "fn": "row_count",
    "code": "atlas %>%\n  mutate(quellen_anzahl = row_count(pick({items}), count = 1)) %>%\n  frequency(quellen_anzahl)",
    "roles": [
     {
      "key": "items",
      "label": "Lernquellen",
      "kind": "multiple",
      "default": [
       "quelle_buch",
       "quelle_video",
       "quelle_kurs"
      ],
      "many": true
     }
    ]
   }
  ],
  "roles": [
   {
    "key": "items",
    "label": "Zusammengehörige Items",
    "kind": "items",
    "default": [
     "methoden1",
     "methoden2",
     "methoden3",
     "methoden4",
     "methoden5"
    ],
    "many": true
   }
  ],
  "existing": false
 },
 {
  "id": "data_import",
  "title": "Daten nach R einlesen",
  "region": "prepare",
  "intro": "Lies Daten mit ihren Formaten und Metadaten ein. Den Lehrdatensatz liest der Startblock mit read_spss() als SPSS-Datei ein, zusammen mit Variablen- und Wertelabels.",
  "formula": "Datei → [[Datentabelle|series|Werte je Person]] + [[Codebuch|codebook|Variablen und Labels]]",
  "requires": [],
  "notes": [
   "Damit die Beispiele ohne fremde Datei laufen, schreiben sie den Lehrdatensatz zuerst in das Format und lesen ihn dann als daten wieder ein.",
   "SAV, DTA, POR, SAS und XPT nutzen haven; Excel nutzt openxlsx2. POR- und native SAS-Dateien kann mariposa nicht schreiben; dafür brauchst du eine Datei aus einer anderen Quelle."
  ],
  "output": "Ein Dataframe als Grundlage der weiteren Analyse.",
  "variants": [
   {
    "label": "SPSS · SAV",
    "fn": "read_spss",
    "code": "atlas %>%\n  write_spss(\"atlas.sav\")\n\ndaten <- read_spss(\"atlas.sav\")",
    "external": true
   },
   {
    "label": "SPSS Portable · POR",
    "fn": "read_por",
    "code": "daten <- read_por(\"atlas.por\")",
    "external": true
   },
   {
    "label": "Stata · DTA",
    "fn": "read_stata",
    "code": "atlas %>%\n  write_stata(\"atlas.dta\")\n\ndaten <- read_stata(\"atlas.dta\")",
    "external": true
   },
   {
    "label": "SAS · native Datei",
    "fn": "read_sas",
    "code": "daten <- read_sas(\"atlas.sas7bdat\", catalog_file = \"atlas.sas7bcat\")",
    "external": true
   },
   {
    "label": "SAS Transport · XPT",
    "fn": "read_xpt",
    "code": "atlas %>%\n  write_xpt(\"atlas.xpt\", version = 8, name = \"atlas\")\n\ndaten <- read_xpt(\"atlas.xpt\")",
    "external": true
   },
   {
    "label": "Excel · XLSX",
    "fn": "read_xlsx",
    "code": "atlas %>%\n  write_xlsx(\"atlas.xlsx\")\n\ndaten <- read_xlsx(\"atlas.xlsx\")",
    "external": true
   }
  ],
  "roles": [],
  "existing": false
 },
 {
  "id": "data_export",
  "title": "Daten & Ergebnisse weitergeben",
  "region": "prepare",
  "intro": "Exportiere Daten oder unterstützte Ergebnisobjekte. Prüfe, welche Metadaten das Zielformat erhalten kann.",
  "formula": "[[Datentabelle|series|Messwerte]] + [[Labels|labels|Metadaten]] → Datei",
  "requires": [],
  "notes": [
   "Diese R-Aufrufe schreiben Dateien im R-Arbeitsverzeichnis. Der Atlas zeigt den Code; der Download des Analyseskripts führt ihn nicht aus.",
   "XPT bewahrt keine Wertelabels. Version 8 ist für die langen Atlas-Spaltennamen erforderlich.",
   "write_xlsx unterstützt unter anderem Daten, Häufigkeitstabellen und Codebücher."
  ],
  "output": "Eine Datei für die weitere Arbeit oder Dokumentation.",
  "variants": [
   {
    "label": "SPSS · SAV",
    "fn": "write_spss",
    "code": "atlas %>%\n  write_spss(\"atlas.sav\")",
    "external": true
   },
   {
    "label": "Stata · DTA",
    "fn": "write_stata",
    "code": "atlas %>%\n  write_stata(\"atlas.dta\")",
    "external": true
   },
   {
    "label": "SAS Transport · XPT",
    "fn": "write_xpt",
    "code": "atlas %>%\n  write_xpt(\"atlas.xpt\", version = 8, name = \"atlas\")",
    "external": true
   },
   {
    "label": "Excel · Daten",
    "fn": "write_xlsx",
    "code": "atlas %>%\n  write_xlsx(\"atlas.xlsx\")",
    "external": true
   },
   {
    "label": "Excel · Codebuch",
    "fn": "write_xlsx",
    "code": "atlas %>%\n  codebook(view = FALSE) %>%\n  write_xlsx(\"codebuch.xlsx\")",
    "external": true
   }
  ],
  "roles": [],
  "existing": false
 },
 {
  "id": "sorting",
  "title": "Sortieren & Ordnungsstatistiken",
  "region": "describe",
  "intro": "Ordne die ursprünglichen Messwerte nach Größe. x₍ᵢ₎ bezeichnet den Wert an der i-ten Position; es ist keine Rangzahl.",
  "formula": "[[x₁, …, xₙ|series|Ursprüngliche Messwerte]] → x₍₁₎ ≤ … ≤ x₍ₙ₎",
  "requires": [
   {
    "id": "ordinal",
    "reason": "begründet die Reihenfolge"
   }
  ],
  "notes": [
   "Beim Sortieren bleiben die ursprünglichen Werte erhalten. Beim Ranken werden sie durch ihre Positionen ersetzt.",
   "Sortiere für Zusammenhangsanalysen nie die beiden Spalten unabhängig; die Personenpaare würden verloren gehen."
  ],
  "output": "Ordnungsstatistiken sind Eingänge für Median, Quantile und Shapiro–Wilk.",
  "variants": [],
  "roles": [],
  "existing": false
 }
];

// Result interpretation is represented by non-recursive meaning edges.
for(const entry of mariposaEntries)if(['normality_test','fisher_test'].includes(entry.id))entry.requires=entry.requires.filter(r=>r.id!=='p_value');
mariposaEntries.find(entry=>entry.id==='fisher_test')!.inputExclusions=['p_value'];
mariposaEntries.push(...foundationEntries);
export const entryById:Record<string,AtlasEntry>=Object.fromEntries(mariposaEntries.map(e=>[e.id,e]));
export const functionToConcept:Record<string,string>=Object.fromEntries(mariposaEntries.flatMap(e=>e.variants.map(v=>[v.fn,e.id])));
export function formulaParts(text:string):{text:string;target?:string;hint?:string}[]{return text.split(/(\[\[[^\]]+\]\])/g).filter(Boolean).map(s=>{if(!s.startsWith('[['))return {text:s};const parts=s.slice(2,-2).split('|'),hint=parts.pop(),target=parts.pop(),text=parts.join('|');return {text,target,hint};});}
export const formulaTargets=(text:string)=>[...new Set(formulaParts(text).flatMap(p=>p.target?[p.target]:[]))];
