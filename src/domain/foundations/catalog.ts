import type { AtlasEntry } from '../mariposaCatalog';
export const foundationEntries:AtlasEntry[]=[
  {
    "id": "probability",
    "title": "Ereignis & Wahrscheinlichkeit",
    "region": "probability_foundations",
    "intro": "Ein Ereignis fasst mögliche Ergebnisse zusammen, etwa „eine befragte Person nimmt an Weiterbildung teil“. Eine Modellwahrscheinlichkeit beschreibt, wie oft es bei wiederholtem Zufallsexperiment langfristig auftreten würde.",
    "formula": "0 ≤ P(A) ≤ 1; P(nicht A) = 1 − P(A)",
    "requires": [],
    "notes": [
      "Ein beobachteter Anteil ist eine relative Häufigkeit in diesen Daten. Eine Modellwahrscheinlichkeit gehört zum angenommenen Zufallsmodell.",
      "Ein Zufallsmodell muss zum Auswahl- oder Entstehungsprozess passen."
    ],
    "output": "Die Gegenwahrscheinlichkeit ergänzt die Ereigniswahrscheinlichkeit zu 1.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "Penn State · Ereignisse und Wahrscheinlichkeit",
        "url": "https://online.stat.psu.edu/stat414/Lesson02"
      }
    ]
  },
  {
    "id": "conditional_probability",
    "title": "Bedingte Wahrscheinlichkeit",
    "region": "probability_foundations",
    "intro": "Wenn wir bereits wissen, dass B eingetreten ist, betrachten wir nur die Fälle innerhalb von B. Der Nenner bestimmt, auf welche Teilgruppe sich der Anteil bezieht.",
    "formula": "P(A | B) = [[P(A ∩ B)|probability|Wahrscheinlichkeit beider Ereignisse]] / P(B), für P(B) > 0",
    "requires": [],
    "notes": [
      "P(A | B) ist im Allgemeinen nicht P(B | A).",
      "In einer Kreuztabelle beantworten Zeilen- und Spaltenprozente unterschiedliche bedingte Fragen. Ein empirischer bedingter Anteil ist eine Schätzung der Modellwahrscheinlichkeit."
    ],
    "output": "„Unter der Nullhypothese“ legt die Bedingung fest; daraus folgt keine Wahrscheinlichkeit für die Wahrheit der Hypothese.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "Princeton · Bedingte Wahrscheinlichkeit",
        "url": "https://www.cs.princeton.edu/courses/archive/fall04/cos341/probability.pdf#page=2"
      }
    ]
  },
  {
    "id": "stochastic_independence",
    "title": "Stochastische Unabhängigkeit",
    "region": "probability_foundations",
    "intro": "Zwei Ereignisse sind unabhängig, wenn Wissen über das eine die Wahrscheinlichkeit des anderen nicht verändert. Unabhängige Beobachtungen sind eine Annahme über den Entstehungsprozess.",
    "formula": "[[P(A | B)|conditional_probability|Bedingte Wahrscheinlichkeit]] = [[P(A)|probability|Unbedingte Wahrscheinlichkeit]], für P(B) > 0; P(A ∩ B) = P(A)P(B)",
    "requires": [],
    "notes": [
      "Unkorreliert bedeutet nur fehlende lineare Kovariation, sofern die Momente existieren. Ein nichtlinearer Zusammenhang kann trotz Korrelation 0 bestehen.",
      "Zufallsvariablen sind unabhängig, wenn sich alle gemeinsamen Ereigniswahrscheinlichkeiten entsprechend zerlegen."
    ],
    "output": "Wiederholte Antworten derselben Person, Klassen oder Haushalte können Abhängigkeiten erzeugen.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "Princeton · Unabhängigkeit",
        "url": "https://www.cs.princeton.edu/courses/archive/fall04/cos341/probability.pdf#page=3"
      }
    ]
  },
  {
    "id": "random_variable",
    "title": "Zufallsvariable & beobachteter Wert",
    "region": "probability_foundations",
    "intro": "Eine Zufallsvariable ordnet möglichen Ergebnissen Zahlen zu. Vor der Beobachtung ist ihr Wert ungewiss; nach der Beobachtung liegt ein konkreter Wert vor.",
    "formula": "X: Ergebnis → Zahl; [[P(X ≤ x)|probability|Wahrscheinlichkeit eines Ereignisses]]",
    "requires": [],
    "notes": [
      "Großes X bezeichnet die Zufallsvariable, kleines x einen möglichen oder beobachteten Wert.",
      "Ein Zahlencode allein begründet noch keine inhaltlich interpretierbaren Abstände."
    ],
    "output": "Das Zufallsmodell beschreibt mögliche Werte; die Datenreihe enthält die tatsächlich beobachteten Werte.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "Princeton · Zufallsvariablen",
        "url": "https://www.cs.princeton.edu/courses/archive/fall04/cos341/probability.pdf#page=3"
      }
    ]
  },
  {
    "id": "empirical_distribution",
    "title": "Empirische Verteilung",
    "region": "probability_foundations",
    "intro": "Die empirische Verteilung beschreibt die beobachteten Werte. Jede der n Beobachtungen erhält bei gleicher Gewichtung Masse 1/n; gleiche Werte sammeln mehrere dieser Anteile.",
    "formula": "Fₙ(x) = [[Anzahl xᵢ ≤ x|frequency|Kumulierte beobachtete Häufigkeit]] / [[n|validn|Zahl verwendeter Beobachtungen]]",
    "requires": [],
    "notes": [
      "Ein Histogramm fasst numerische Werte in Klassen zusammen. Eine andere Klassenbreite verändert sein Aussehen, aber nicht die Originaldaten.",
      "Bei nominalen Kategorien sind einzelne Anteile sinnvoll; eine kumulierte Kurve braucht eine begründete Ordnung."
    ],
    "output": "Die empirische Kurve steigt in Stufen. Sie ist von einer glatten theoretischen Modellverteilung zu unterscheiden.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "NIST · Wahrscheinlichkeitsverteilungen",
        "url": "https://www.itl.nist.gov/div898/handbook/eda/section3/eda36.htm"
      }
    ]
  },
  {
    "id": "theoretical_distribution",
    "title": "Theoretische Verteilung",
    "region": "probability_foundations",
    "intro": "Eine theoretische Verteilung ordnet allen möglichen Werten einer Zufallsvariable Wahrscheinlichkeiten zu. Ihre Parameter bestimmen die konkrete Form.",
    "formula": "[[X|random_variable|Zufallsvariable]] ∼ Modell(θ); [[P(X ∈ A)|probability|Wahrscheinlichkeit eines Wertebereichs]]",
    "requires": [],
    "notes": [
      "Das Modell beschreibt auch Werte, die in der vorliegenden Stichprobe nicht vorkamen.",
      "Eine Normalverteilung ist ein mögliches Modell; viele Datenprozesse brauchen andere Verteilungen."
    ],
    "output": "Eine Modellverteilung lässt sich mit der empirischen Verteilung vergleichen und für Simulationen verwenden.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "NIST · Wahrscheinlichkeitsverteilungen",
        "url": "https://www.itl.nist.gov/div898/handbook/eda/section3/eda36.htm"
      }
    ]
  },
  {
    "id": "discrete_continuous",
    "title": "Diskret & stetig",
    "region": "probability_foundations",
    "intro": "Diskrete Zufallsvariablen haben endlich oder abzählbar viele mögliche Werte. Bei einer stetigen Verteilung verteilen sich Wahrscheinlichkeiten über Wertebereiche.",
    "formula": "[[X|random_variable|Mögliche Werte]] ∈ {0, 1, 2, …} oder Werteintervalle",
    "requires": [],
    "notes": [
      "Diskret/stetig und nominal/ordinal/metrisch beantworten unterschiedliche Fragen. Eine Personenzahl ist beispielsweise diskret und metrisch.",
      "Gerundete Messwerte können diskret aufgezeichnet sein, obwohl ein stetiges Modell den zugrunde liegenden Prozess beschreibt."
    ],
    "output": "Für diskrete Modelle addieren wir Punktwahrscheinlichkeiten; bei Dichten berechnen wir Flächen.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "NIST · Diskrete Masse und stetige Dichte",
        "url": "https://www.itl.nist.gov/div898/handbook/eda/section3/eda361.htm"
      }
    ]
  },
  {
    "id": "probability_mass",
    "title": "Wahrscheinlichkeitsmasse",
    "region": "probability_foundations",
    "intro": "Eine diskrete Verteilung kann jedem einzelnen möglichen Wert eine positive Wahrscheinlichkeit zuweisen. Die Summe über alle möglichen Werte beträgt 1.",
    "formula": "p(k) = [[P(X = k)|probability|Punktwahrscheinlichkeit]]; Σₖp(k) = 1",
    "requires": [
      {
        "id": "discrete_continuous",
        "reason": "unterscheidet diskrete Werte von stetigen Bereichen"
      }
    ],
    "notes": [
      "Balkenhöhen zeigen hier die Wahrscheinlichkeit eines einzelnen Werts, keine Häufigkeit von Personen."
    ],
    "output": "Bernoulli, Binomial und Hypergeometrie werden durch Wahrscheinlichkeitsmassen beschrieben.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "NIST · Diskrete Masse und stetige Dichte",
        "url": "https://www.itl.nist.gov/div898/handbook/eda/section3/eda361.htm"
      }
    ]
  },
  {
    "id": "density_function",
    "title": "Dichte & Fläche",
    "region": "probability_foundations",
    "intro": "Eine Dichte beschreibt, wie sich Wahrscheinlichkeit über eine kontinuierliche Skala verteilt. Die Wahrscheinlichkeit eines Intervalls ist die Fläche unter der Kurve in diesem Intervall.",
    "formula": "[[P(a ≤ X ≤ b)|probability|Intervallwahrscheinlichkeit]] = ∫ₐᵇ f(x) dx",
    "requires": [
      {
        "id": "discrete_continuous",
        "reason": "begründet die Betrachtung von Werteintervallen"
      }
    ],
    "notes": [
      "Eine Dichtehöhe darf größer als 1 sein. Entscheidend ist: Die gesamte Fläche ist 1.",
      "Bei einer Verteilung mit Dichte hat ein einzelner exakter Wert Wahrscheinlichkeit 0. Das ist keine Aussage über ein gerundetes Messintervall."
    ],
    "output": "Schmale Bereiche können hohe Dichten und trotzdem kleine Wahrscheinlichkeiten haben.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "NIST · Diskrete Masse und stetige Dichte",
        "url": "https://www.itl.nist.gov/div898/handbook/eda/section3/eda361.htm"
      }
    ]
  },
  {
    "id": "cumulative_probability",
    "title": "Kumulierte Wahrscheinlichkeit",
    "region": "probability_foundations",
    "intro": "Die Verteilungsfunktion sammelt die Wahrscheinlichkeit bis zu einem Grenzwert x. Sie steigt von 0 auf 1 und kann bei diskreten Verteilungen Sprünge haben.",
    "formula": "F(x) = [[P(X ≤ x)|probability|Wahrscheinlichkeit bis einschließlich x]]",
    "requires": [
      {
        "id": "theoretical_distribution",
        "reason": "liefert die Verteilung des Modells"
      }
    ],
    "notes": [
      "Bei stetigen Verteilungen ist F(b) − F(a) die Wahrscheinlichkeit zwischen a und b.",
      "Diskret gilt für ganze Grenzen: P(a ≤ X ≤ b) = F(b) − F(a−1). „Größer als“ und „größer oder gleich“ unterscheiden sich."
    ],
    "output": "Die empirische Verteilungsfunktion schätzt diese Modellfunktion aus beobachteten Daten.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "NIST · Verteilungsfunktion und Quantile",
        "url": "https://www.itl.nist.gov/div898/handbook/eda/section3/eda362.htm"
      }
    ]
  },
  {
    "id": "theoretical_quantile",
    "title": "Theoretisches Quantil",
    "region": "probability_foundations",
    "intro": "Ein theoretisches p-Quantil ist die kleinste Grenze, bis zu der mindestens der Anteil p der Modellwahrscheinlichkeit liegt. Es wird aus dem Modell berechnet.",
    "formula": "qₚ = inf{x: [[F(x)|cumulative_probability|Verteilungsfunktion]] ≥ p}",
    "requires": [],
    "notes": [
      "Bei diskreten Verteilungen sind nicht alle Zielwahrscheinlichkeiten exakt erreichbar.",
      "Empirische Quantile werden aus endlichen Beobachtungen bestimmt; dafür existieren verschiedene Interpolationsregeln."
    ],
    "output": "Kritische Werte für Tests und Intervalle sind passende Quantile der Referenzverteilung.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "NIST · Verteilungsfunktion und Quantile",
        "url": "https://www.itl.nist.gov/div898/handbook/eda/section3/eda362.htm"
      }
    ]
  },
  {
    "id": "normal_distribution",
    "title": "Normalverteilung",
    "region": "probability_foundations",
    "intro": "Die Normalverteilung ist eine symmetrische, glockenförmige Modellverteilung. Ihr Mittelwert μ verschiebt sie; ihre Standardabweichung σ bestimmt die Breite.",
    "formula": "f(x) = exp(−(x−[[μ|expectation|Erwartungswert]])²/(2[[σ²|population_variance|Populationsvarianz]])) / (σ√(2π))",
    "requires": [
      {
        "id": "density_function",
        "reason": "deutet die Kurvenfläche als Wahrscheinlichkeit"
      }
    ],
    "notes": [
      "Die Normalverteilung ist ein Modell mit unbeschränktem Wertebereich. Bei begrenzten Skalen ist ihre Eignung eine Näherungsfrage.",
      "z-Standardisierung verändert Lage und Skala, macht eine beliebige Verteilung aber nicht normal."
    ],
    "output": "Die Parameter steuern die Kurve. Die schattierte Fläche beschreibt die Wahrscheinlichkeit bis zur gewählten Grenze.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "NIST · Normalverteilung",
        "url": "https://www.itl.nist.gov/div898/handbook/eda/section3/eda3661.htm"
      }
    ]
  },
  {
    "id": "standard_normal",
    "title": "Standardnormalverteilung",
    "region": "probability_foundations",
    "intro": "Die Standardnormalverteilung hat Mittelwert 0 und Standardabweichung 1. Ist X normalverteilt, führt Zentrieren und Teilen durch die Populationsstandardabweichung zu dieser Verteilung.",
    "formula": "Z = (X − μ) / σ ∼ N(0,1)",
    "requires": [
      {
        "id": "normal_distribution",
        "reason": "liefert das Normalmodell"
      }
    ],
    "notes": [
      "Stichproben-z-Werte mit geschätztem Mittelwert und s sind eine Datenstandardisierung. Sie sind nicht automatisch unabhängige Standardnormalvariablen."
    ],
    "output": "Standardnormalquantile werden unter passenden Annahmen als Referenzwerte für Tests und Intervalle verwendet.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "NIST · Normalverteilung",
        "url": "https://www.itl.nist.gov/div898/handbook/eda/section3/eda3661.htm"
      }
    ]
  },
  {
    "id": "t_distribution",
    "title": "t-Verteilung",
    "region": "probability_foundations",
    "intro": "Die t-Verteilung ist symmetrisch um 0 und hat bei wenigen Freiheitsgraden schwerere Ränder als die Standardnormalverteilung. Sie berücksichtigt in klassischen Normalmodellen Unsicherheit durch geschätzte Streuung.",
    "formula": "T = Z / √(U/ν); Z ∼ [[N(0,1)|standard_normal|Standardnormalverteilung]], U ∼ χ²ν",
    "requires": [
      {
        "id": "general_df",
        "reason": "beschreibt die freien Informationen des Modells"
      }
    ],
    "notes": [
      "Z und U müssen unabhängig sein. Bei großen ν nähert sich die t-Verteilung der Standardnormalverteilung.",
      "Im klassischen Einstichproben-t-Test unter unabhängigen normalverteilten Beobachtungen ist ν = n−1. Welch verwendet andere, oft nicht ganzzahlige Freiheitsgrade."
    ],
    "output": "Eine gleiche absolute Prüfgröße ergibt bei wenigen Freiheitsgraden einen größeren zweiseitigen p-Wert.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "NIST · t-Verteilung",
        "url": "https://www.itl.nist.gov/div898/handbook/eda/section3/eda3664.htm"
      }
    ]
  },
  {
    "id": "chi_square_distribution",
    "title": "χ²-Verteilung",
    "region": "probability_foundations",
    "intro": "Eine χ²-verteilte Größe entsteht als Summe quadrierter, unabhängiger Standardnormalvariablen. Sie ist nicht negativ und bei wenigen Freiheitsgraden stark rechtsschief.",
    "formula": "U = Σⱼ [[Zⱼ²|square|Quadrierte Standardnormalgrößen]]; Zⱼ ∼ [[N(0,1)|standard_normal|Standardnormalverteilung]]",
    "requires": [
      {
        "id": "general_df",
        "reason": "bestimmt hier die Anzahl unabhängiger Beiträge"
      }
    ],
    "notes": [
      "Bei Kreuztabellen ist die χ²-Verteilung gewöhnlich eine asymptotische Referenz. Ausreichend geeignete erwartete Zellbesetzungen sind entscheidend."
    ],
    "output": "Die Freiheitsgrade verändern Form und kritische Werte; ein gewöhnlicher Pearson-χ²-Test betrachtet den rechten Rand.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "NIST · Chi-Quadrat-Verteilung",
        "url": "https://www.itl.nist.gov/div898/handbook/eda/section3/eda3666.htm"
      }
    ]
  },
  {
    "id": "f_distribution",
    "title": "F-Verteilung",
    "region": "probability_foundations",
    "intro": "Die F-Verteilung beschreibt das Verhältnis zweier unabhängiger χ²-Größen, jeweils geteilt durch ihre Freiheitsgrade. Sie besitzt zwei Freiheitsgradparameter.",
    "formula": "F = (U₁/ν₁)/(U₂/ν₂); U₁,U₂ ∼ [[χ²|chi_square_distribution|Unabhängige Chi-Quadrat-Größen]]",
    "requires": [],
    "notes": [
      "Bei klassischer ANOVA vergleicht die Prüfgröße erklärte und unerklärte mittlere Quadratsummen unter dem Nullmodell.",
      "Zähler- und Nennerfreiheitsgrade übernehmen verschiedene Rollen."
    ],
    "output": "Große F-Werte sprechen gegen das jeweilige Nullmodell; die rechte Randfläche liefert den p-Wert.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "NIST · F-Verteilung",
        "url": "https://www.itl.nist.gov/div898/handbook/eda/section3/eda3665.htm"
      }
    ]
  },
  {
    "id": "bernoulli_distribution",
    "title": "Bernoulli-Verteilung",
    "region": "probability_foundations",
    "intro": "Ein einzelner Versuch hat zwei kodierte Ausgänge: 1 für das Ereignis und 0 für sein Ausbleiben. Der Parameter p ist die Ereigniswahrscheinlichkeit.",
    "formula": "[[P(X=1)|probability_mass|Punktwahrscheinlichkeit]] = p; P(X=0) = 1−p",
    "requires": [],
    "notes": [
      "Der Erwartungswert einer Bernoulli-Variable ist p; ihre Varianz ist p(1−p).",
      "In logistischer Regression darf p zwischen Personen variieren."
    ],
    "output": "Der Mittelwert vieler 0/1-Antworten ist der Anteil der Einsen.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "R stats · Binomialverteilung",
        "url": "https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Binomial.html"
      }
    ]
  },
  {
    "id": "binomial_distribution",
    "title": "Binomialverteilung",
    "region": "probability_foundations",
    "intro": "Die Binomialverteilung zählt Erfolge in n unabhängigen Bernoulli-Versuchen mit derselben Erfolgswahrscheinlichkeit p.",
    "formula": "P(X=k) = C(n,k) pᵏ(1−p)ⁿ⁻ᵏ",
    "requires": [
      {
        "id": "bernoulli_distribution",
        "reason": "beschreibt jeden einzelnen Versuch"
      },
      {
        "id": "stochastic_independence",
        "reason": "begründet unabhängige Versuche"
      }
    ],
    "notes": [
      "C(n,k) zählt die möglichen Anordnungen von k Erfolgen.",
      "Verschiedene Erfolgswahrscheinlichkeiten oder abhängige Antworten passen nicht zu diesem einfachen Binomialmodell."
    ],
    "output": "Erwartungswert np und Varianz np(1−p) verändern sich mit n und p.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "R stats · Binomialverteilung",
        "url": "https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Binomial.html"
      }
    ]
  },
  {
    "id": "hypergeometric_distribution",
    "title": "Hypergeometrische Verteilung",
    "region": "probability_foundations",
    "intro": "Aus N Objekten, darunter K Erfolge, werden n ohne Zurücklegen gezogen. X zählt, wie viele Erfolge in der Auswahl liegen.",
    "formula": "[[P(X=k)|probability_mass|Diskrete Erfolgswahrscheinlichkeit]] = C(K,k) C(N−K,n−k) / C(N,n)",
    "requires": [],
    "notes": [
      "Ohne Zurücklegen sind die einzelnen Ziehungen abhängig. Die Erfolgswahrscheinlichkeit ändert sich nach jeder Ziehung.",
      "Beim Fisher-Test einer 2×2-Tabelle wird auf die Randsummen bedingt. Die freie Zellzahl besitzt dann eine hypergeometrische Nullverteilung."
    ],
    "output": "Die möglichen Erfolgszahlen liegen zwischen max(0,n−(N−K)) und min(n,K).",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "R stats · Hypergeometrische Verteilung",
        "url": "https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Hypergeometric.html"
      }
    ]
  },
  {
    "id": "population_parameter",
    "title": "Grundgesamtheit & Parameter",
    "region": "inference_foundations",
    "intro": "Die Grundgesamtheit umfasst die Personen oder möglichen Beobachtungen, über die du etwas wissen möchtest. Ein Parameter beschreibt diese Zielgröße, etwa den mittleren Wert μ oder den Anteil π. Eine Stichprobe liefert dazu beobachtete Daten.",
    "formula": "Grundgesamtheit: θ, zum Beispiel μ oder π; Stichprobe: [[x₁, …, xₙ|series|Beobachtete Werte einzelner Personen]]",
    "requires": [
      {
        "id": "sampling",
        "reason": "unterscheidet Zielpopulation und erhobene Stichprobe"
      }
    ],
    "notes": [
      "Lege Personenkreis, Ort und Zeitraum fest. Der Mittelwert aller Erstsemester ist eine andere Zielgröße als der aller Studierenden.",
      "Im frequentistischen Modell ist der Parameter fest, aber unbekannt. Die zufällig ausgewählten Daten variieren.",
      "Die 200 synthetischen Befragten stehen für ein Lehrbeispiel, nicht für eine reale Zielpopulation."
    ],
    "output": "Erst eine klare Zielgröße macht deutlich, worauf sich eine Schätzung oder Hypothese bezieht.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "Penn State STAT 200: Confidence Intervals",
        "url": "https://online.stat.psu.edu/stat200/Lesson04"
      }
    ]
  },
  {
    "id": "estimator",
    "title": "Schätzer & Schätzung",
    "region": "inference_foundations",
    "intro": "Ein Schätzer ist eine Rechenregel, die Stichprobendaten in eine Schätzung für einen Parameter übersetzt. Vor der Datenerhebung ist sein Ergebnis zufällig; mit den beobachteten Daten entsteht ein bestimmter Zahlenwert.",
    "formula": "θ̂ = g([[X₁, …, Xₙ|random_variable|Zufällige Stichprobenwerte]]); Beispiel: μ̂ = [[X̄|mean|Die Mittelwertregel schätzt den Populationsmittelwert]]",
    "requires": [
      {
        "id": "population_parameter",
        "reason": "legt fest, welche Zielgröße geschätzt wird"
      }
    ],
    "notes": [
      "Große Buchstaben betonen hier die Zufälligkeit vor der Ziehung; x̄ bezeichnet das aus den beobachteten Werten berechnete Mittel.",
      "Verschiedene Regeln können denselben Parameter schätzen. Ihre Genauigkeit hängt auch von Verteilung und Erhebungsdesign ab."
    ],
    "output": "Unterscheide die unbekannte Zielgröße θ, die Regel θ̂ und den tatsächlich berechneten Schätzwert.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "Penn State STAT 200: Confidence Intervals",
        "url": "https://online.stat.psu.edu/stat200/Lesson04"
      }
    ]
  },
  {
    "id": "expectation",
    "title": "Erwartungswert",
    "region": "inference_foundations",
    "intro": "Der Erwartungswert ist der mit Wahrscheinlichkeiten gewichtete Mittelpunkt einer Zufallsvariable. Er beschreibt eine Eigenschaft des Modells und muss kein Wert sein, der bei einer einzelnen Beobachtung auftreten kann.",
    "formula": "μ = E([[X|random_variable|Zufallsvariable]]) = Σ x · [[P(X=x)|probability|Wahrscheinlichkeit des jeweiligen Werts]]  (diskret)",
    "requires": [],
    "notes": [
      "Bei einem fairen Würfel ist E(X)=3,5, obwohl kein Wurf 3,5 zeigt.",
      "Bei stetigen Verteilungen ersetzt ein Integral über x mal Dichte die Summe. Nicht jede Verteilung besitzt einen endlichen Erwartungswert.",
      "Der Erwartungswert gehört zum Modell; der beobachtete Mittelwert gehört zur Stichprobe."
    ],
    "output": "Werte mit höherer Wahrscheinlichkeit tragen stärker zum theoretischen Mittel bei.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "Penn State STAT 414: Mathematical Expectation",
        "url": "https://online.stat.psu.edu/stat414/Lesson08"
      },
      {
        "title": "Penn State STAT 500: Probability Distributions",
        "url": "https://online.stat.psu.edu/stat500/Lesson03"
      }
    ]
  },
  {
    "id": "population_variance",
    "title": "Populationsvarianz",
    "region": "inference_foundations",
    "intro": "Die Populationsvarianz ist die erwartete quadrierte Entfernung einer Zufallsvariable von ihrem Erwartungswert. Sie beschreibt Streuung im Modell; ihre Wurzel ist die Populationsstandardabweichung σ.",
    "formula": "σ² = E[(X − [[μ|expectation|Erwartungswert]])²]; σ = √σ²",
    "requires": [
      {
        "id": "random_variable",
        "reason": "unterscheidet mögliche Werte und tatsächlich beobachtete Daten"
      }
    ],
    "notes": [
      "Die Varianz hat die quadrierte Einheit, σ die ursprüngliche Einheit. Eine endliche Varianz setzt ein endliches zweites Moment voraus.",
      "Für eine vollständig bekannte Population mit N gleich gewichteten Werten gilt σ² = Σ(xᵢ−μ)²/N.",
      "Der Nenner n−1 der korrigierten Stichprobenvarianz gehört zur Schätzung einer unbekannten Varianz, nicht zu dieser Populationsdefinition."
    ],
    "output": "σ² beschreibt die Zielstreuung; s² ist eine mögliche Schätzung aus einer Stichprobe.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "Penn State STAT 500: Probability Distributions",
        "url": "https://online.stat.psu.edu/stat500/Lesson03"
      }
    ]
  },
  {
    "id": "sampling_distribution",
    "title": "Stichprobenverteilung",
    "region": "inference_foundations",
    "intro": "Denke dir viele neue Stichproben desselben Umfangs aus demselben Modell oder Erhebungsdesign. Berechne jedes Mal denselben Schätzer. Die Verteilung seiner möglichen Ergebnisse heißt Stichprobenverteilung.",
    "formula": "Bei i.i.d. Beobachtungen: E([[X̄|estimator|Mittelwert als zufälliger Schätzer]]) = [[μ|expectation|Erwartungswert einer Beobachtung]]; Var(X̄) = [[σ²|population_variance|Varianz einer Beobachtung]] / n",
    "requires": [
      {
        "id": "random_sampling",
        "reason": "legt fest, wie neue Stichproben entstehen"
      }
    ],
    "notes": [
      "Hier werden Ergebnisse ganzer Stichproben verglichen, nicht die Einzelwerte innerhalb einer Stichprobe.",
      "Die dargestellten Formeln gelten bei unabhängigen, identisch verteilten Beobachtungen und endlicher Varianz. Bei Ziehen ohne Zurücklegen aus einer endlichen Population ändert sich die Varianzformel.",
      "Die Standardabweichung einer Stichprobenverteilung ist der Standardfehler. Ihre Form ist nicht automatisch normal."
    ],
    "output": "Eine Stichprobenverteilung zeigt, wie stark eine Schätzung allein durch die Zufallsauswahl schwanken kann.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "Penn State STAT 500: Sampling Distributions",
        "url": "https://online.stat.psu.edu/stat500/Lesson04"
      }
    ]
  },
  {
    "id": "sampling_bias",
    "title": "Verzerrung & Zufallsfehler",
    "region": "inference_foundations",
    "intro": "Zufallsfehler lassen Schätzungen zwischen Stichproben schwanken. Verzerrung bedeutet, dass die Schätzregel unter dem tatsächlichen Auswahl- und Datenmodell im Mittel an der Zielgröße vorbeiliegt.",
    "formula": "Bias(θ̂) = [[E(θ̂)|expectation|Mittel der Schätzungen über mögliche Stichproben]] − [[θ|population_parameter|Zu schätzender Parameter]]",
    "requires": [
      {
        "id": "estimator",
        "reason": "liefert die betrachtete Schätzregel"
      }
    ],
    "notes": [
      "Ursachen können eine ungeeignete Schätzregel, unvollständige Erreichbarkeit oder systematische Nichtteilnahme sein.",
      "Eine größere Stichprobe kann Zufallsschwankungen verkleinern, behebt aber systematische Verzerrung nicht automatisch.",
      "Erwartungstreu heißt Bias = 0 unter den getroffenen Annahmen. Es garantiert keinen kleinen Fehler in jeder einzelnen Stichprobe."
    ],
    "output": "Präzision und Verzerrung sind verschiedene Fragen: Eine sehr stabile Schätzung kann systematisch falsch liegen.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "Penn State STAT 509: Bias, Allocation, and Randomization",
        "url": "https://online.stat.psu.edu/stat509/Lesson04"
      },
      {
        "title": "Penn State STAT 200: Collecting Data",
        "url": "https://online.stat.psu.edu/stat200/Lesson01"
      }
    ]
  },
  {
    "id": "law_large_numbers",
    "title": "Gesetz der großen Zahlen",
    "region": "inference_foundations",
    "intro": "Bei unabhängigen, identisch verteilten Beobachtungen mit endlichem Erwartungswert stabilisiert sich der Stichprobenmittelwert um diesen Erwartungswert, wenn der Umfang wächst.",
    "formula": "Für jedes ε > 0: [[P|probability|Wahrscheinlichkeit]](|[[X̄ₙ|estimator|Mittel aus n Beobachtungen]] − [[μ|expectation|Erwartungswert]]| > ε) → 0",
    "requires": [
      {
        "id": "random_sampling",
        "reason": "ordnet die Annahmen über wiederholte Beobachtungen ein"
      }
    ],
    "notes": [
      "Die Formel zeigt die schwache Form: Die Wahrscheinlichkeit einer festgelegten Abweichung geht gegen null.",
      "Ein zusätzlicher Fall muss den bisherigen Mittelwert nicht näher an μ bringen. Zufallsschwankungen bleiben möglich.",
      "Das Gesetz behauptet keine Normalverteilung und heilt keine systematische Auswahlverzerrung."
    ],
    "output": "Mit wachsendem n werden feste Abweichungen des Mittels vom Modellmittel immer unwahrscheinlicher.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "Penn State STAT 100: Understanding Uncertainty",
        "url": "https://online.stat.psu.edu/stat100/Lesson07"
      }
    ]
  },
  {
    "id": "central_limit",
    "title": "Zentraler Grenzwertsatz",
    "region": "inference_foundations",
    "intro": "Der zentrale Grenzwertsatz beschreibt die Form der Schwankungen eines Mittelwerts. Bei unabhängigen, identisch verteilten Beobachtungen mit endlicher positiver Varianz nähert sich der passend standardisierte Mittelwert einer Standardnormalverteilung.",
    "formula": "Zₙ = √n · ([[X̄|estimator|Stichprobenmittel]] − [[μ|expectation|Erwartungswert]]) / [[σ|population_variance|Positive Populationsstandardabweichung]]  →  N(0,1) in Verteilung",
    "requires": [
      {
        "id": "sampling_distribution",
        "reason": "betrachtet Mittelwerte über wiederholte Stichproben"
      }
    ],
    "notes": [
      "Der Satz betrifft Mittelwerte beziehungsweise Summen, nicht die Form der Rohdaten. Auch viele Beobachtungen machen schiefe Einzelwerte nicht normal.",
      "Es gibt keine universelle Grenze wie n=30. Wie gut die Näherung ist, hängt besonders von Schiefe, Randbereichen und extremen Werten ab.",
      "Die Formel verwendet die wahre Standardabweichung σ. Ihr Ersatz durch eine Schätzung benötigt eine zusätzliche Begründung."
    ],
    "output": "Eine Normalnäherung wird unter passenden Bedingungen möglich; ihre Güte für den konkreten Zweck bleibt zu prüfen.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "Penn State STAT 414: The Central Limit Theorem",
        "url": "https://online.stat.psu.edu/stat414/Lesson27"
      }
    ]
  },
  {
    "id": "null_distribution",
    "title": "Nullverteilung",
    "region": "inference_foundations",
    "intro": "Die Nullverteilung beschreibt, welche Werte eine Prüfgröße bei wiederholten Daten unter der Nullhypothese und den weiteren Modellannahmen annehmen würde. An ihr wird der beobachtete Wert gemessen.",
    "formula": "F₀(t) = [[P|probability|Wahrscheinlichkeit unter dem Nullmodell]]([[T|test_statistic|Zufällige Prüfgröße]] ≤ t unter [[H₀|hypothesis|Nullhypothese]])",
    "requires": [
      {
        "id": "sampling_distribution",
        "reason": "erklärt die Verteilung einer Statistik über mögliche Stichproben"
      }
    ],
    "notes": [
      "Die Nullverteilung ist keine Verteilung der beobachteten Rohwerte und keine Wahrscheinlichkeitsverteilung darüber, ob H₀ wahr ist.",
      "Je nach Prüfgröße kommen beispielsweise t-, F-, χ²- oder Binomialverteilungen infrage. Dieselbe Hypothese kann unterschiedliche Prüfgrößen zulassen.",
      "Bei einer zusammengesetzten Nullhypothese muss ein Test für die zulässigen Nullparameter korrekt kalibriert sein; gegebenenfalls bleiben weitere Parameter zu berücksichtigen."
    ],
    "output": "Erst Prüfgröße, Nullhypothese und Modell gemeinsam bestimmen, welche Referenz sinnvoll ist.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "NIST/SEMATECH: Quantitative Techniques",
        "url": "https://itl.nist.gov/div898/handbook/eda/section3/eda35.htm"
      }
    ]
  },
  {
    "id": "test_sides",
    "title": "Einseitig & zweiseitig testen",
    "region": "inference_foundations",
    "intro": "Die Alternative legt vor der Auswertung fest, welche Abweichungen gegen die Nullhypothese sprechen: nur kleinere, nur größere oder Abweichungen in beide Richtungen.",
    "formula": "Rechts: P₀([[T|test_statistic|Prüfgröße]] ≥ t_beob); links: P₀(T ≤ t_beob); symmetrisch zweiseitig: P₀(|T| ≥ |t_beob|)",
    "requires": [
      {
        "id": "hypothesis",
        "reason": "legt die inhaltliche Richtung der Alternative fest"
      },
      {
        "id": "null_distribution",
        "reason": "liefert die Wahrscheinlichkeiten der extremen Ergebnisse"
      }
    ],
    "notes": [
      "Die Betragsformel gilt für eine um 0 symmetrische Referenz und einen entsprechend definierten zweiseitigen Test.",
      "Bei stetiger symmetrischer Referenz ist der zweiseitige p-Wert zweimal die kleinere Randwahrscheinlichkeit. Diese Verdopplung gilt nicht allgemein für diskrete oder asymmetrische Tests.",
      "Die Richtung erst nach Sichtung der Daten auszuwählen verändert die Fehlerrate."
    ],
    "output": "„Mindestens so extrem“ bekommt seine Bedeutung aus der vorab festgelegten Alternative und der Prüfgröße.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "NIST/SEMATECH: Tests of Individual Regression Parameters",
        "url": "https://itl.nist.gov/div898/handbook/pmd/section4/pmd447.htm"
      }
    ]
  },
  {
    "id": "alpha_level",
    "title": "Signifikanzniveau α",
    "region": "inference_foundations",
    "intro": "Das Signifikanzniveau begrenzt, wie oft ein korrekt kalibrierter Test eine wahre Nullhypothese bei wiederholter Anwendung höchstens verwerfen soll. Es wird vor der Auswertung festgelegt.",
    "formula": "Für jeden zulässigen Nullparameter: [[P|probability|Wahrscheinlichkeit über wiederholte Daten]]([[H₀|hypothesis|Nullhypothese]] verwerfen, obwohl H₀ gilt) ≤ α",
    "requires": [
      {
        "id": "null_distribution",
        "reason": "ermöglicht die Kalibrierung des Tests unter H₀"
      }
    ],
    "notes": [
      "α=0,05 bedeutet eine Fehlerratengrenze von 5 % unter H₀ und den Modellannahmen. Es ist keine Wahrscheinlichkeit dafür, dass diese konkrete Entscheidung falsch ist.",
      "Bei diskreten Tests kann die tatsächliche Fehlerrate unter α liegen. Bei asymptotischen Tests ist die Kalibrierung zunächst eine Näherung.",
      "Das Niveau muss zu den Folgen möglicher Fehlentscheidungen und zur geplanten Familie von Tests passen."
    ],
    "output": "α ist eine vorab gewählte Regel für langfristige Fehlerraten, kein Maß für die Größe eines Effekts.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "NIST/SEMATECH: Quantitative Techniques",
        "url": "https://itl.nist.gov/div898/handbook/eda/section3/eda35.htm"
      }
    ]
  },
  {
    "id": "critical_value",
    "title": "Kritischer Wert & Ablehnungsbereich",
    "region": "inference_foundations",
    "intro": "Ein kritischer Wert markiert die Grenze zwischen Prüfgrößen, bei denen H₀ verworfen wird, und solchen, bei denen sie nicht verworfen wird. Lage und Anzahl dieser Grenzen hängen von der Alternative ab.",
    "formula": "Rechtsseitig bei stetiger Referenz: c = [[F₀⁻¹|cumulative_probability|Quantil der Nullverteilung]](1−[[α|alpha_level|Signifikanzniveau]]); H₀ verwerfen, falls T > c",
    "requires": [
      {
        "id": "null_distribution",
        "reason": "liefert die passende Referenzverteilung"
      },
      {
        "id": "test_sides",
        "reason": "bestimmt den oder die betrachteten Ränder"
      }
    ],
    "notes": [
      "Bei einem symmetrischen zweiseitigen Test liegen je α/2 in beiden Rändern. Die Grenzen sind dann die Quantile zu α/2 und 1−α/2.",
      "Diskrete Prüfgrößen verlangen eine passende Auswahl erreichbarer Randwerte; die Fehlerrate trifft α häufig nicht genau.",
      "Diese Quantile stammen aus dem Nullmodell. Sie sind etwas anderes als Quartile der beobachteten Daten."
    ],
    "output": "Der Ablehnungsbereich übersetzt das gewählte Niveau in eine konkrete Entscheidungsregel.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "NIST/SEMATECH: Confidence Intervals",
        "url": "https://www.itl.nist.gov/div898/handbook/prc/section1/prc14.htm"
      },
      {
        "title": "NIST/SEMATECH: Tests of Individual Regression Parameters",
        "url": "https://itl.nist.gov/div898/handbook/pmd/section4/pmd447.htm"
      }
    ]
  },
  {
    "id": "type_errors",
    "title": "Fehler erster & zweiter Art",
    "region": "inference_foundations",
    "intro": "Eine Testentscheidung kann sich auf zwei Arten irren: Eine wahre Nullhypothese wird verworfen, oder eine falsche wird nicht verworfen. Welche Situation wirklich vorliegt, ist bei einer einzelnen Untersuchung meist unbekannt.",
    "formula": "Fehler I: [[H₀|hypothesis|Nullhypothese]] wahr und verworfen; Fehler II: H₀ falsch und nicht verworfen; β(θ) = Pθ(H₀ nicht verwerfen), θ unter H₁",
    "requires": [
      {
        "id": "alpha_level",
        "reason": "begrenzt die Wahrscheinlichkeit eines Fehlers erster Art"
      },
      {
        "id": "population_parameter",
        "reason": "bestimmt, welche Alternative tatsächlich gilt"
      }
    ],
    "notes": [
      "β bezieht sich auf eine konkrete Alternative: kleine und große tatsächliche Abweichungen haben unterschiedliche Übersehenswahrscheinlichkeiten.",
      "Nicht verwerfen ist keine Bestätigung der Nullhypothese. Eine Gleichheitsaussage lässt sich daraus nicht ableiten.",
      "Ein Fehler erster Art ist auch bei korrekt erhobenen Daten und korrekt angewandtem Test möglich."
    ],
    "output": "Die beiden Fehlerarten trennen eine falsche Entdeckung von einem übersehenen tatsächlichen Unterschied.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "Penn State STAT 200: Hypothesis Testing, Part 2",
        "url": "https://online.stat.psu.edu/stat200/Lesson06"
      }
    ]
  },
  {
    "id": "power",
    "title": "Teststärke (Power)",
    "region": "inference_foundations",
    "intro": "Die Teststärke ist die Wahrscheinlichkeit, unter einer bestimmten tatsächlichen Alternative die Nullhypothese zu verwerfen. Sie beschreibt, wie gut ein geplantes Testverfahren einen relevanten Effekt erkennen kann.",
    "formula": "Power(θ) = 1 − [[β(θ)|type_errors|Wahrscheinlichkeit, die konkrete Alternative zu übersehen]] = Pθ(H₀ verwerfen), θ unter H₁",
    "requires": [
      {
        "id": "alpha_level",
        "reason": "legt die Fehlerratengrenze fest"
      },
      {
        "id": "effect",
        "reason": "benennt einen inhaltlich relevanten Effekt"
      },
      {
        "id": "se",
        "reason": "beschreibt die Schwankung der Schätzung"
      }
    ],
    "notes": [
      "Für eine Planung müssen Effekt, Stichprobenumfang, Streuung, Design, Test und Niveau zusammen festgelegt werden.",
      "Bei sonst gleichem Aufbau erhöhen mehr unabhängige Fälle oder ein größerer tatsächlicher Effekt üblicherweise die Power. Ein höheres α erhöht sie ebenfalls, lässt aber mehr Fehler erster Art zu.",
      "Power ist keine nachträgliche Wahrscheinlichkeit, dass H₀ oder H₁ wahr ist. Der beobachtete Effekt ersetzt keine begründete Planungsannahme."
    ],
    "output": "Plane n anhand eines relevanten Effekts und einer gewünschten Entdeckungswahrscheinlichkeit.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "Penn State STAT 200: Power",
        "url": "https://online.stat.psu.edu/stat200/lesson/6/6.5"
      }
    ]
  },
  {
    "id": "general_df",
    "title": "Freiheitsgrade im Modell",
    "region": "inference_foundations",
    "intro": "Freiheitsgrade beschreiben, wie viel unabhängige Information nach passenden Restriktionen oder Parameterschätzungen übrig bleibt. Die konkrete Zählregel hängt vom Modell und von der Prüfgröße ab.",
    "formula": "Streuung um ein geschätztes Mittel: [[n−1|df|Bekannter Spezialfall]]; lineares Modell: df_Residuen = n − r, r = Rang der Designmatrix",
    "requires": [],
    "notes": [
      "Im linearen Modell ist r die Zahl linear unabhängiger Modellspalten einschließlich eines vorhandenen Achsenabschnitts; es ist keine Zahl von Rangplätzen.",
      "Beispiele: einfache Regression mit Achsenabschnitt n−2; klassische ANOVA k−1 und N−k; r×c-Kreuztabelle (r−1)(c−1).",
      "Approximative Freiheitsgrade, etwa bei Welch, können nicht ganzzahlig sein. n−1 ist keine allgemeine Formel für jeden Test."
    ],
    "output": "Prüfgröße und passendes Modell bestimmen gemeinsam die Freiheitsgrade der Referenzverteilung.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "NIST Statistical Reference Datasets: Linear Least Squares Definitions",
        "url": "https://www.itl.nist.gov/div898/strd/lls/data/LINKS/PARTS/textedit.20723"
      }
    ]
  },
  {
    "id": "exact_asymptotic",
    "title": "Exakte Verteilung & Näherung",
    "region": "inference_foundations",
    "intro": "Ein exakter Test verwendet eine für den endlichen Stichprobenumfang gültige Nullverteilung. Ein asymptotischer Test ersetzt sie durch eine Grenzverteilung, deren Näherung für den konkreten Datensatz hinreichend gut sein muss.",
    "formula": "Rechtsseitig: p_exakt = [[P₀(T ≥ t_beob)|null_distribution|Wahrscheinlichkeit in der endlichen Nullverteilung]]; p_asym ≈ 1 − [[F_Grenz(t_beob)|cumulative_probability|Kumulierte Grenzverteilung bei stetiger Referenz]]",
    "requires": [],
    "notes": [
      "Exakt bedeutet nicht annahmefrei und nicht frei von Rechenrundung. Die Aussage gilt nur unter dem jeweiligen Nullmodell und Erhebungsdesign.",
      "Bei diskreten exakten Tests liegt die Fehlerrate häufig unter dem gewählten Niveau. Die Näherungsgüte asymptotischer Tests hängt auch von Zellbesetzungen, Bindungen und Verteilungsform ab.",
      "Monte-Carlo-Berechnung ist eine weitere Unterscheidung: Sie kann eine passende Nullverteilung durch Simulation auswerten und bringt Simulationsunsicherheit mit."
    ],
    "output": "Frage getrennt, ob die Nullverteilung passend ist, ob sie angenähert wird und wie ihre Wahrscheinlichkeiten berechnet werden.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "R Core: Exact Binomial Test",
        "url": "https://www.stat.ethz.ch/R-manual/R-devel/library/stats/html/binom.test.html"
      },
      {
        "title": "R Core: Test of Equal or Given Proportions",
        "url": "https://www.stat.ethz.ch/R-manual/R-devel/library/stats/html/prop.test.html"
      },
      {
        "title": "R Core: Fisher’s Exact Test for Count Data",
        "url": "https://www.stat.ethz.ch/R-manual/R-devel/library/stats/html/fisher.test.html"
      }
    ]
  },
  {
    "id": "random_sampling",
    "title": "Zufallsauswahl",
    "region": "inference_foundations",
    "intro": "Eine Wahrscheinlichkeitsstichprobe verwendet ein festgelegtes Zufallsverfahren mit bekannten positiven Auswahlwahrscheinlichkeiten. Bei einfacher Zufallsauswahl ohne Zurücklegen sind alle Teilmengen des festgelegten Umfangs gleich wahrscheinlich.",
    "formula": "Bei einfacher Zufallsauswahl: [[P|probability|Auswahlwahrscheinlichkeit]](S=s) = 1/C(N,n); N = Populationsumfang, n = Stichprobenumfang",
    "requires": [
      {
        "id": "sampling",
        "reason": "verknüpft Auswahlverfahren und Zielpopulation"
      }
    ],
    "notes": [
      "Gleiche Auswahlwahrscheinlichkeiten einzelner Personen allein definieren noch keine einfache Zufallsauswahl; auch die möglichen Stichprobenkombinationen zählen.",
      "Ohne Zurücklegen sind Ziehungen abhängig. Das i.i.d.-Modell ist eine andere Annahme oder gegebenenfalls eine Näherung bei kleinem Auswahlanteil.",
      "Zufallsauswahl von Personen und zufällige Zuweisung zu Versuchsgruppen erfüllen verschiedene Aufgaben. Nichtteilnahme kann auch eine Zufallsstichprobe verzerren."
    ],
    "output": "Das Auswahlverfahren ermöglicht Aussagen über Zufallsschwankungen; es garantiert keine perfekte Abbildung der Population in jeder einzelnen Stichprobe.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "Penn State STAT 506: Estimating Population Mean and Total under SRS",
        "url": "https://online.stat.psu.edu/stat506/Lesson01"
      },
      {
        "title": "Penn State STAT 200: Collecting Data",
        "url": "https://online.stat.psu.edu/stat200/Lesson01"
      }
    ]
  },
  {
    "id": "variance_assumption",
    "title": "Gleiche Fehlervarianz",
    "region": "model_foundations",
    "intro": "Bei gleicher Fehlervarianz streuen die Modellfehler über die Prädiktorwerte hinweg gleich stark. Diese Annahme heißt Homoskedastizität.",
    "formula": "Var(εᵢ gegeben X) = [[σ²|population_variance|Gemeinsame Varianz der Modellfehler]]",
    "requires": [],
    "notes": [
      "Gemeint sind Fehler um die modellierten Mittelwerte, nicht gleiche Mittelwerte oder gleiche Streuung aller Rohvariablen.",
      "Ein Trichter im Residuenplot kann auf ungleiche Fehlervarianzen hinweisen. Die unbeobachteten Modellfehler werden dabei anhand ihrer geschätzten Residuen beurteilt.",
      "Bei korrekt modelliertem bedingtem Mittelwert kann OLS trotz ungleicher Varianzen unverzerrt bleiben; klassische Standardfehler, Tests und Intervalle können jedoch unpassend sein. Robuste Standardfehler reparieren keine falsche Modellform."
    ],
    "output": "Prüfe die Fehlerstreuung dort, wo du das Modell interpretieren oder Vorhersagen treffen möchtest.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "Penn State STAT 501 · Multicollinearity & Other Regression Pitfalls, §12.9",
        "url": "https://online.stat.psu.edu/stat501/Lesson12"
      },
      {
        "title": "NIST · Detecting Non-Constant Variation",
        "url": "https://itl.nist.gov/div898/handbook/pmd/section4/pmd442.htm"
      }
    ]
  },
  {
    "id": "outliers_influence",
    "title": "Ausreißer & Einfluss",
    "region": "model_foundations",
    "intro": "Ein ungewöhnlicher Wert ist nicht automatisch ein einflussreicher Fall. Einfluss bedeutet, dass sich das geschätzte Modell deutlich verändert, wenn ein Fall weggelassen wird.",
    "formula": "Dᵢ = Σⱼ([[ŷⱼ − ŷⱼ(−i)|prediction|Vorhersagen mit und ohne Fall i]])² / (p · MSE)",
    "requires": [
      {
        "id": "residuals",
        "reason": "erklärt Abweichungen vom Modell und die Fehlerquadratsumme"
      }
    ],
    "notes": [
      "Die Formel zeigt Cooks Distanz für eine lineare OLS-Regression: p zählt alle geschätzten Koeffizienten einschließlich Achsenabschnitt; MSE = SSE/(n−p).",
      "Große Residuen betreffen ungewöhnliche Zielwerte; hohe Hebelwerte ungewöhnliche Kombinationen der Prädiktoren. Gemeinsam können sie starken Einfluss erzeugen.",
      "Prüfe auffällige Fälle auf Erfassungsfehler und inhaltliche Besonderheiten. Gültige Beobachtungen werden nicht allein wegen eines Schwellenwerts gelöscht; vergleiche Ergebnisse mit und ohne sie."
    ],
    "output": "Unterscheide ungewöhnliche Beobachtungen von instabilen Schlussfolgerungen.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "Penn State STAT 501 · Influential Points",
        "url": "https://online.stat.psu.edu/stat501/Lesson11"
      }
    ]
  },
  {
    "id": "multicollinearity",
    "title": "Multikollinearität",
    "region": "model_foundations",
    "intro": "Prädiktoren können sich gegenseitig so gut vorhersagen, dass sich ihre einzelnen Beiträge kaum trennen lassen. Dann reagieren Koeffizienten empfindlich auf kleine Änderungen der Daten oder des Modells.",
    "formula": "VIFⱼ = 1 / (1 − [[Rⱼ²|explained_variance|Bestimmtheitsmaß einer Regression von Prädiktor j auf alle übrigen Prädiktoren]])",
    "requires": [
      {
        "id": "prediction",
        "reason": "ordnet Koeffizienten den Prädiktoren im gemeinsamen Modell zu"
      }
    ],
    "notes": [
      "Bei perfekter linearer Abhängigkeit sind einzelne OLS-Koeffizienten nicht eindeutig schätzbar. Starke, unvollständige Abhängigkeit erhöht ihre Unsicherheit.",
      "Die Formel gilt für einen einzelnen numerischen Prädiktor beziehungsweise eine einzelne Spalte der Modellmatrix. Mehrstufige Faktoren benötigen eine passende gemeinsame Diagnose.",
      "Kleine paarweise Korrelationen schließen Abhängigkeiten zwischen mehreren Prädiktoren nicht aus. Für Vorhersagen innerhalb des beobachteten Bereichs kann ein Modell trotzdem brauchbar sein."
    ],
    "output": "Ein hoher VIF weist auf schwer trennbare Beiträge hin; er beweist weder einen falschen Prädiktor noch Kausalität.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "Penn State STAT 501 · Multicollinearity & Other Regression Pitfalls, §12.9",
        "url": "https://online.stat.psu.edu/stat501/Lesson12"
      }
    ]
  },
  {
    "id": "explained_variance",
    "title": "Erklärter Varianzanteil (R²)",
    "region": "model_foundations",
    "intro": "R² vergleicht die Fehler eines linearen Modells mit der Streuung der Zielwerte um ihren Mittelwert. Es beschreibt, wie viel dieser Streuung das angepasste Modell rechnerisch erfasst.",
    "formula": "R² = 1 − [[SSE|residuals|Quadratsumme der Modellresiduen]] / [[SST|ss|Quadratsumme der Zielwerte um ihren Mittelwert]]",
    "requires": [],
    "notes": [
      "Bei OLS mit Achsenabschnitt liegt R² auf den zur Anpassung verwendeten Daten zwischen 0 und 1, sofern die Zielvariable streut. R² = .40 bedeutet dort 40 % erfasste Streuung.",
      "Zusätzliche Prädiktoren können dieses Trainings-R² auf derselben Fallbasis nicht verkleinern. Das macht sie noch nicht inhaltlich sinnvoll.",
      "Außerhalb dieser Bedingungen, etwa auf neuen Testdaten, kann 1−SSE/SST negativ sein. Pseudo-R² einer logistischen Regression ist kein entsprechender Varianzanteil."
    ],
    "output": "Ein hohes R² belegt weder gute Vorhersagen für neue Personen noch eine kausale Erklärung.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "Penn State STAT 501 · Multiple Linear Regression",
        "url": "https://online.stat.psu.edu/stat501/Lesson05"
      }
    ]
  },
  {
    "id": "overfitting",
    "title": "Überanpassung",
    "region": "model_foundations",
    "intro": "Ein Modell kann Besonderheiten seiner Trainingsdaten mitlernen, die bei neuen Personen nicht wiederkehren. Dann sieht die Anpassung gut aus, während die Vorhersage außerhalb dieser Daten enttäuscht.",
    "formula": "MSE_Test = (1/n_Test) · Σᵢ([[yᵢ|series|Zielwert einer zurückgehaltenen Person]] − [[ŷᵢ|prediction|Vorhersage eines ohne diese Testperson angepassten Modells]])²",
    "requires": [],
    "notes": [
      "Beurteile Vorhersagen an zurückgehaltenen Daten oder mit geeigneter Kreuzvalidierung. Auch Variablenauswahl, Imputation und Standardisierung werden innerhalb der jeweiligen Trainingsdaten bestimmt.",
      "Messungen derselben Person gehören gemeinsam in einen Trainings- oder Testteil. Bei zeitlichen Vorhersagen muss auch die zeitliche Reihenfolge berücksichtigt werden.",
      "Ein größeres Trainings-R² allein zeigt keine bessere Vorhersage. Der Testfehler schwankt ebenfalls und hängt davon ab, für welche neuen Fälle das Modell gedacht ist."
    ],
    "output": "Trenne die Daten, mit denen ein Modell ausgewählt wird, von einer unabhängigen abschließenden Bewertung.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "Penn State STAT 501 · Model Building",
        "url": "https://online.stat.psu.edu/stat501/Lesson10"
      },
      {
        "title": "scikit-learn · Common Pitfalls and Recommended Practices",
        "url": "https://scikit-learn.org/stable/common_pitfalls.html"
      },
      {
        "title": "scikit-learn · Cross-validation: Evaluating Estimator Performance",
        "url": "https://scikit-learn.org/stable/modules/cross_validation.html"
      }
    ]
  },
  {
    "id": "prediction_interval",
    "title": "Vorhersageintervall",
    "region": "model_foundations",
    "intro": "Ein Vorhersageintervall gibt einen Bereich für den Wert einer neuen Person bei festgelegten Prädiktorwerten an. Es berücksichtigt die Unsicherheit der geschätzten Mitte und die zusätzliche Streuung einzelner Personen.",
    "formula": "[[ŷ₀|prediction|Vorhergesagter Zielwert]] ± [[t₁₋α/₂,ₙ₋ₚ|t_distribution|Quantil der t-Verteilung]] · sₑ√(1+h₀)",
    "requires": [
      {
        "id": "variance_assumption",
        "reason": "begründet die gemeinsame Fehlervarianz in dieser klassischen Formel"
      },
      {
        "id": "sampling",
        "reason": "begründet unabhängige Beobachtungen und eine unabhängige neue Person"
      }
    ],
    "notes": [
      "Die Formel gilt für ein korrekt spezifiziertes lineares OLS-Modell mit normalverteilten Fehlern und voller Rangzahl der Modellmatrix. p zählt die Koeffizienten einschließlich Achsenabschnitt; sₑ² = SSE/(n−p).",
      "h₀ = x₀ᵀ(XᵀX)⁻¹x₀ beschreibt die Unsicherheit am neuen Prädiktorpunkt; x₀ enthält auch die 1 für den Achsenabschnitt. Das zusätzliche 1 unter der Wurzel steht für die neue individuelle Fehlerstreuung.",
      "Das entsprechende Konfidenzintervall für den bedingten Mittelwert enthält √h₀ statt √(1+h₀). Ein nominelles 95-%-Vorhersageverfahren deckt unter dem Modell langfristig 95 % solcher neuen Werte ab."
    ],
    "output": "Für eine einzelne neue Person ist der Bereich breiter als für den geschätzten Mittelwert vergleichbarer Personen.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "Penn State STAT 462 · Prediction Interval for a New Response",
        "url": "https://online.stat.psu.edu/stat462/node/151/"
      },
      {
        "title": "Penn State STAT 415 · A Prediction Interval for a New Y",
        "url": "https://online.stat.psu.edu/stat415/lesson/8/8.2"
      }
    ]
  },
  {
    "id": "confounding",
    "title": "Confounding (gemeinsame Ursachen)",
    "region": "model_foundations",
    "intro": "Ein beobachteter Zusammenhang kann durch gemeinsame Ursachen mitentstehen. Die verglichenen Gruppen unterscheiden sich dann bereits in ihrer Ausgangslage für das Ergebnis.",
    "formula": "A ← [[C|causality|Angenommene gemeinsame Ursache]] → Y",
    "requires": [],
    "notes": [
      "A ist der untersuchte Einfluss, Y das Ergebnis und C eine gemeinsame Ursache. Beispielsweise könnte Motivation sowohl Lernzeit als auch Testergebnis beeinflussen; diese Pfeile sind inhaltliche Annahmen.",
      "Geeignete Kontrolle gemessener gemeinsamer Ursachen kann helfen. Wahlloses Aufnehmen weiterer Variablen kann dagegen neue Verzerrungen erzeugen.",
      "Eine veränderte Regressionssteigung allein beweist kein Confounding; ein Regressionsmodell kann unbeobachtete Ursachen nicht automatisch ausgleichen."
    ],
    "output": "Begründe Kontrollvariablen mit Wissen über Entstehung und zeitliche Reihenfolge der Merkmale.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "Hernán & Robins · Causal Inference: What If",
        "url": "https://miguelhernan.org/whatifbook"
      },
      {
        "title": "Penn State STAT 100 · Good Sample Surveys and Comparative Studies",
        "url": "https://online.stat.psu.edu/stat100/Lesson02"
      }
    ]
  },
  {
    "id": "causality",
    "title": "Kausalität: Was würde sich ändern?",
    "region": "model_foundations",
    "intro": "Eine kausale Frage vergleicht, was unter zwei klar beschriebenen Handlungen geschehen würde. Ein bloßer Unterschied zwischen beobachteten Gruppen beantwortet diese Frage noch nicht.",
    "formula": "ATE = [[E|expectation|Erwartungswert: Mittel in der Zielpopulation]][Y(1) − Y(0)]",
    "requires": [],
    "notes": [
      "Y(1) und Y(0) sind die potenziellen Ergebnisse derselben Person unter zwei Bedingungen. Beobachtet wird nur das Ergebnis der tatsächlich eingetretenen Bedingung.",
      "Für kausale Schlüsse braucht es ein begründetes Design und Identifikationsannahmen, etwa Vergleichbarkeit, klar definierte Bedingungen und ausreichende Überlappung.",
      "Die 200 synthetischen Atlasfälle veranschaulichen Rechnungen; aus ihren Zusammenhängen folgt keine Wirkung realer Lernangebote."
    ],
    "output": "Formuliere zuerst Handlung, Vergleich, Ergebnis, Zeitpunkt und Zielpopulation.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "Hernán & Robins · Causal Inference: What If",
        "url": "https://miguelhernan.org/whatifbook"
      }
    ]
  },
  {
    "id": "random_assignment",
    "title": "Zufällige Zuweisung",
    "region": "model_foundations",
    "intro": "Bei zufälliger Zuweisung entscheidet ein Zufallsverfahren, welche Versuchsbedingung eine Person erhält. Dadurch wird die Zuteilung von ihren vorbestehenden Eigenschaften entkoppelt.",
    "formula": "A ⟂ ([[Y(0), Y(1)|causality|Potenzielle Ergebnisse unter beiden Bedingungen]])",
    "requires": [],
    "notes": [
      "Die Formel beschreibt einfache zufällige Zuweisung: A ist unabhängig von den potenziellen Ergebnissen. Bei stratifizierter Randomisierung gilt die entsprechende Aussage innerhalb der Strata.",
      "Randomisierung erzeugt Vergleichbarkeit im Zuweisungsverfahren, aber nicht zwingend exakt gleiche Gruppen in einer konkreten kleinen Stichprobe.",
      "Zufällige Stichprobenziehung betrifft die Auswahl aus einer Population; zufällige Zuweisung betrifft Versuchsbedingungen. Ausfälle oder Abweichungen von der Zuweisung verlangen zusätzliche Überlegungen."
    ],
    "output": "Ein Zuweisungseffekt bezieht sich auf die angebotene Bedingung; er ist nicht automatisch der Effekt der tatsächlich erhaltenen Behandlung.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "Penn State STAT 100 · Good Sample Surveys and Comparative Studies",
        "url": "https://online.stat.psu.edu/stat100/Lesson02"
      },
      {
        "title": "Hernán & Robins · Causal Inference: What If",
        "url": "https://miguelhernan.org/whatifbook"
      }
    ]
  },
  {
    "id": "operationalization",
    "title": "Operationalisierung",
    "region": "measurement_foundations",
    "intro": "Operationalisieren heißt, einen inhaltlichen Begriff in konkrete Beobachtungs- und Auswertungsregeln zu übersetzen. Erst diese Regeln legen fest, was eine Zahl im Datensatz bedeutet.",
    "formula": "Konstrukt → Frage oder Beobachtung → Antwortregel → [[Messwert|series|Dokumentierter Wert je Person]]",
    "requires": [],
    "notes": [
      "Dokumentiere den genauen Wortlaut, Bezugszeitraum, Antwortanker, Einheit, Kodierung und Regeln zur Bildung eines Skalenwerts.",
      "„Methodensicherheit“ könnte etwa durch bestimmte Selbstauskünfte erfasst werden. Sie wird dadurch nicht automatisch mit tatsächlich gezeigter Methodenkompetenz gleichgesetzt.",
      "Die fünf gleichgerichteten 7-stufigen Methodenitems des Atlas sind synthetische Lehrbeispiele. Zahlenabstände und eine gemeinsame Zusammenfassung bleiben begründungspflichtig."
    ],
    "output": "Eine passende Messregel verbindet die Forschungsfrage mit den tatsächlich verfügbaren Daten.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "Schmidt & Lechner (2020) · Documenting Measurement Instruments",
        "url": "https://www.gesis.org/fileadmin/admin/Dateikatalog/pdf/guidelines/documenting_measurement_instruments_schmidt_2020.pdf"
      }
    ]
  },
  {
    "id": "measurement_error",
    "title": "Messfehler",
    "region": "measurement_foundations",
    "intro": "Ein beobachteter Messwert kann von zufälligen Störungen und systematischen Einflüssen geprägt sein. Das klassische Messmodell trennt einen erwarteten Messwert und einen zufälligen Fehleranteil.",
    "formula": "[[X|series|Beobachteter Messwert]] = T + E; [[Var(X)|population_variance|Streuung der beobachteten Messwerte]] = Var(T) + Var(E)",
    "requires": [],
    "notes": [
      "Die Varianzzerlegung setzt Cov(T,E)=0 voraus. Im klassischen Modell ist T der Erwartungswert einer Person über gedachte Wiederholungen derselben Messung; E hat Erwartungswert 0.",
      "Dieser „wahre Wert“ ist keine Garantie, dass das beabsichtigte Konstrukt korrekt getroffen wird: gleichbleibende Verzerrungen können in T enthalten sein.",
      "Unabhängiger klassischer Messfehler kann einfache Korrelationen abschwächen. Für systematische Fehler oder mehrere fehlerbehaftete Prädiktoren gibt es keine allgemeine Abschwächungsregel."
    ],
    "output": "Mehr Personen vermindern Stichprobenunsicherheit, beseitigen aber nicht automatisch Fehler des Messverfahrens.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "Danner (2016) · Reliability – The Precision of a Measurement",
        "url": "https://www.gesis.org/fileadmin/admin/Dateikatalog/pdf/guidelines/reliability_precision_measurement_danner_2016.pdf"
      }
    ]
  },
  {
    "id": "validity",
    "title": "Validität",
    "region": "measurement_foundations",
    "intro": "Validität betrifft die Frage, ob eine bestimmte Interpretation von Messwerten durch Theorie und Befunde gerechtfertigt ist. Sie wird für einen Zweck und einen Anwendungskontext begründet.",
    "formula": "[[Konstrukt & Messregel|operationalization|Was soll wie erfasst werden?]] → Evidenz → begründete Interpretation",
    "requires": [],
    "notes": [
      "Prüfe unter anderem den Inhalt der Items, das Verständnis der Fragen, die interne Struktur und erwartete Beziehungen zu anderen Merkmalen.",
      "Ein hoher Reliabilitätskoeffizient allein belegt keine Validität: sehr präzise Antworten können den falschen Inhalt erfassen.",
      "Befunde aus einer Population oder Anwendung übertragen sich nicht automatisch auf andere Gruppen oder Zwecke. Der synthetische Methodenblock ist nicht validiert."
    ],
    "output": "Validität ist ein begründetes Gesamturteil zur Interpretation, kein einzelner bestandener Kennwert.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "Repke, Birkenmaier & Lechner (2024) · Validity in Survey Research",
        "url": "https://www.gesis.org/fileadmin/admin/Dateikatalog/pdf/guidelines/validity_in_survey_research_repke_birkenmaier_lechner_2024.pdf"
      }
    ]
  },
  {
    "id": "dimensionality",
    "title": "Dimensionalität",
    "region": "measurement_foundations",
    "intro": "Dimensionalität beschreibt, wie viele gemeinsame Merkmale benötigt werden, um die Struktur eines Itemblocks angemessen zu beschreiben. Das hängt von der inhaltlichen Frage und dem gewählten Messmodell ab.",
    "formula": "[[Zusammenhangsmuster der Items|correlation_matrix|Gemeinsam betrachtete Itemkorrelationen]] → Modell mit m gemeinsamen Dimensionen",
    "requires": [
      {
        "id": "operationalization",
        "reason": "klärt, welche inhaltlichen Merkmale der Itemblock erfassen soll"
      }
    ],
    "notes": [
      "Ein gemeinsamer Faktor und mehrere unterscheidbare Faktoren sind konkurrierende Beschreibungen. Die Anzahl wird durch Inhalt, Modellpassung und Stabilität gemeinsam begründet.",
      "Hohe interne Konsistenz beweist keine Eindimensionalität. Ähnliche Formulierungen oder Antwortstile können zusätzliche gemeinsame Variation erzeugen.",
      "Die Zahl von PCA-Komponenten ist nicht automatisch die Zahl latenter Merkmale. Ein großer erster Eigenwert oder die Eigenwert-über-1-Regel entscheidet die Frage nicht allein."
    ],
    "output": "Fasse Items nur dann zu einem Gesamtwert zusammen, wenn dieser Gesamtwert inhaltlich und empirisch vertretbar ist.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "Repke, Birkenmaier & Lechner (2024) · Validity in Survey Research",
        "url": "https://www.gesis.org/fileadmin/admin/Dateikatalog/pdf/guidelines/validity_in_survey_research_repke_birkenmaier_lechner_2024.pdf"
      },
      {
        "title": "R Core · Factor Analysis",
        "url": "https://stat.ethz.ch/R-manual/R-devel/library/stats/html/factanal.html"
      }
    ]
  },
  {
    "id": "correlation_matrix",
    "title": "Korrelationsmatrix",
    "region": "measurement_foundations",
    "intro": "Eine Korrelationsmatrix stellt die paarweisen Zusammenhänge mehrerer Variablen nebeneinander. Zeilen und Spalten bezeichnen dieselben Variablen in derselben Reihenfolge.",
    "formula": "Rⱼₖ = [[r(Xⱼ,Xₖ)|pearson|Pearson-Korrelation der beiden Variablen]]; Rⱼₖ = Rₖⱼ; Rⱼⱼ = 1",
    "requires": [],
    "notes": [
      "Die Diagonale ist bei streuenden Variablen 1. Für konstante Variablen ist die Korrelation nicht definiert.",
      "Hier steht R für Pearson-Korrelationen. Rangkorrelationsmatrizen sind eine andere mögliche Wahl; die metrische Näherung für Likert-Items muss zum Auswertungsziel passen.",
      "Mit gemeinsamer vollständiger Fallbasis ist R positiv semidefinit. Paarweiser Ausschluss kann diese Eigenschaft verletzen; eine benötigte Matrixinverse kann außerdem bei linearer Abhängigkeit fehlen."
    ],
    "output": "Eine einzelne auffällige Korrelation beschreibt noch nicht die Struktur des ganzen Itemblocks.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "R Core · Correlation, Variance and Covariance (Matrices)",
        "url": "https://stat.ethz.ch/R-manual/R-devel/library/stats/html/cor.html"
      }
    ]
  },
  {
    "id": "loadings",
    "title": "Ladungen",
    "region": "measurement_foundations",
    "intro": "Ladungen verbinden beobachtete Items mit den gemeinsamen Faktoren eines Messmodells. Vorzeichen und Größe zeigen, wie ein Item im gewählten Modell zu einem Faktor gehört.",
    "formula": "[[Zⱼ|z|Standardisiertes Item]] = λⱼ₁F₁ + … + λⱼₘFₘ + εⱼ",
    "requires": [
      {
        "id": "dimensionality",
        "reason": "legt fest, wie viele gemeinsame Faktoren im Modell unterschieden werden"
      }
    ],
    "notes": [
      "Die Formel verwendet zentrierte, standardisierte Items und Faktoren mit Varianz 1. Sind die Faktoren untereinander und mit den Restanteilen unkorreliert, entsprechen die Ladungen den Item-Faktor-Korrelationen.",
      "Bei korrelierten Faktoren unterscheiden sich Musterladungen und Strukturkorrelationen: Struktur = ΛΦ, mit der Faktorkorrelationsmatrix Φ. Musterladungen müssen nicht im Bereich −1 bis 1 liegen.",
      "Ladungen sind nicht automatisch Gewichte für die Berechnung von Faktorwerten. Ein gleichzeitiger Vorzeichenwechsel eines Faktors und seiner Ladungen ändert das dargestellte Modell nicht."
    ],
    "output": "Lies die Ladungen gemeinsam mit Iteminhalten und Faktorkorrelationen; eine Schwelle wie .40 ist keine universelle Gütegrenze.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "R Core · Factor Analysis",
        "url": "https://stat.ethz.ch/R-manual/R-devel/library/stats/html/factanal.html"
      },
      {
        "title": "UCLA OARC · A Practical Introduction to Factor Analysis",
        "url": "https://stats.oarc.ucla.edu/spss/seminars/introduction-to-factor-analysis/a-practical-introduction-to-factor-analysis/"
      },
      {
        "title": "NIST · Principal Components: Numerical Example",
        "url": "https://www.itl.nist.gov/div898/handbook/pmc/section5/pmc552.htm"
      }
    ]
  },
  {
    "id": "eigenvalues",
    "title": "Eigenwerte",
    "region": "measurement_foundations",
    "intro": "Bei einer PCA gibt ein Eigenwert an, wie viel Varianz eine zugehörige Komponente aufnimmt. Große Eigenwerte kennzeichnen Richtungen, in denen die Daten stärker streuen.",
    "formula": "[[R|correlation_matrix|Korrelationsmatrix]]vₖ = dₖvₖ; PCA-Anteilₖ = dₖ / Σⱼdⱼ",
    "requires": [],
    "notes": [
      "vₖ ist ein Eigenvektor mit Länge 1; dₖ ist der zugehörige Eigenwert. Bei PCA aus einer Korrelationsmatrix mit p streuenden Variablen gilt Σdₖ = p.",
      "Die Aussage über Varianzanteile betrifft PCA. Die Eigenwerte der ursprünglichen Korrelationsmatrix sind nicht einfach die erklärten Varianzen eines beliebigen gemeinsamen Faktorenmodells.",
      "Die Regel dₖ > 1 ist eine Heuristik, keine automatische Bestimmung der Dimensionalität. Negative Eigenwerte einer vermeintlichen Korrelationsmatrix können auf eine inkonsistente Matrix hinweisen."
    ],
    "output": "Beurteile Größe und Verlauf der Eigenwerte gemeinsam mit dem Analyseziel.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "NIST · Properties of Principal Components",
        "url": "https://www.itl.nist.gov/div898/handbook/pmc/section5/pmc551.htm"
      }
    ]
  },
  {
    "id": "communality",
    "title": "Kommunalität",
    "region": "measurement_foundations",
    "intro": "Die Kommunalität beschreibt, welcher Anteil der Varianz eines standardisierten Items durch die gemeinsamen Faktoren erfasst wird. Der übrige Anteil ist seine Einzigartigkeit.",
    "formula": "Orthogonal: hⱼ² = Σₖ[[λⱼₖ²|loadings|Quadrierte Ladungen des Items]]; allgemein: hⱼ² = (ΛΦΛ′)ⱼⱼ",
    "requires": [],
    "notes": [
      "Bei korrelierten Faktoren müssen ihre Korrelationen Φ mitgerechnet werden; die bloße Summe quadrierter Musterladungen genügt dann nicht.",
      "Im standardisierten gemeinsamen Faktorenmodell gilt 1 = hⱼ² + ψⱼ. Die Einzigartigkeit ψⱼ umfasst itemspezifische Variation und Messfehler; sie ist nicht ausschließlich Messfehler.",
      "Bei PCA bedeutet die entsprechende Kommunalität den durch die behaltenen Komponenten dargestellten Anteil der gesamten Itemvarianz. Sie ist kein Reliabilitätskoeffizient des einzelnen Items."
    ],
    "output": "Eine geringe Kommunalität zeigt begrenzte Darstellung durch diese Lösung; sie rechtfertigt nicht allein das Entfernen eines Items.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "UCLA OARC · A Practical Introduction to Factor Analysis",
        "url": "https://stats.oarc.ucla.edu/spss/seminars/introduction-to-factor-analysis/a-practical-introduction-to-factor-analysis/"
      },
      {
        "title": "R Core · Factor Analysis",
        "url": "https://stat.ethz.ch/R-manual/R-devel/library/stats/html/factanal.html"
      }
    ]
  },
  {
    "id": "rotation",
    "title": "Rotation",
    "region": "measurement_foundations",
    "intro": "Eine Rotation stellt dieselbe mehrdimensionale Lösung anders dar, damit ihre inhaltliche Struktur leichter erkennbar wird. Sie erzeugt keine zusätzlichen Informationen aus den Daten.",
    "formula": "[[Λ|loadings|Ladungsmatrix]]ΦΛ′ = Λ*Φ*(Λ*)′",
    "requires": [],
    "notes": [
      "Das Sternchen kennzeichnet die rotierte Darstellung. Bei passender Transformation von Ladungen und Faktorkorrelationen bleibt die modellierte gemeinsame Kovarianz gleich.",
      "Varimax hält die Faktoren unkorreliert. Oblimin und Promax erlauben Korrelationen; unkorreliert bedeutet ohne weitere Annahmen nicht unabhängig.",
      "Kommunalitäten bleiben bei äquivalenter Rotation gleich. Einzelne Ladungen, die Zuordnung von Varianz zu Faktoren und die inhaltliche Interpretation können sich ändern; bei nur einem Faktor entfällt eine solche Achsendrehung."
    ],
    "output": "Wähle die Rotationsannahme inhaltlich; erzwungene Unkorreliertheit kann eine unpassende Beschreibung liefern.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "UCLA OARC · A Practical Introduction to Factor Analysis",
        "url": "https://stats.oarc.ucla.edu/spss/seminars/introduction-to-factor-analysis/a-practical-introduction-to-factor-analysis/"
      }
    ]
  },
  {
    "id": "missing_mechanisms",
    "title": "Warum fehlen Angaben?",
    "region": "measurement_foundations",
    "intro": "Für den Umgang mit fehlenden Werten ist entscheidend, wovon das Fehlen abhängt. MCAR, MAR und MNAR bezeichnen unterschiedliche Annahmen über diesen Zusammenhang.",
    "formula": "MCAR: P([[M|missing|Muster fehlender Angaben]] gegeben Y_obs,Y_mis) = P(M); MAR: P(M gegeben Y_obs,Y_mis) = P(M gegeben Y_obs)",
    "requires": [],
    "notes": [
      "M bezeichnet das Fehlmuster; Y_obs alle beobachteten und Y_mis alle fehlenden Angaben. MCAR bedeutet Unabhängigkeit von beiden; unter MAR darf das Fehlen von den beobachteten Angaben abhängen.",
      "MNAR liegt vor, wenn das Fehlen auch nach Berücksichtigung der beobachteten Angaben von fehlenden Werten abhängt. Beispiel: Fehlendes Einkommen hängt zusätzlich von der nicht angegebenen Einkommenshöhe ab.",
      "MAR und MNAR lassen sich aus den beobachteten Daten allein im Allgemeinen nicht unterscheiden. MAR rechtfertigt weder pauschal vollständige Fälle noch einfaches Ersetzen durch den Mittelwert; passende Modelle und Sensitivitätsanalysen bleiben nötig."
    ],
    "output": "Dokumentiere Gründe und Muster des Fehlens und mache die Annahmen der gewählten Behandlung sichtbar.",
    "variants": [],
    "roles": [],
    "existing": false,
    "sources": [
      {
        "title": "National Research Council (2010) · Drawing Inferences from Incomplete Data",
        "url": "https://www.ncbi.nlm.nih.gov/books/NBK209900/"
      }
    ]
  }
];
export const foundationLinks:{source:string;target:string;label:string;variants?:number[]}[]=[
  {
    "source": "population_parameter",
    "target": "hypothesis",
    "label": "Hypothesen beziehen sich auf Zielgrößen der Grundgesamtheit"
  },
  {
    "source": "estimator",
    "target": "mean",
    "label": "Der Mittelwert ist ein Beispiel einer Schätzregel"
  },
  {
    "source": "expectation",
    "target": "mean",
    "label": "Theoretisches Mittel und beobachtetes Stichprobenmittel unterscheiden"
  },
  {
    "source": "population_variance",
    "target": "variance",
    "label": "Populationsstreuung und ihre Stichprobenschätzung unterscheiden"
  },
  {
    "source": "sampling_distribution",
    "target": "se",
    "label": "Der Standardfehler beschreibt die Streuung der Schätzungen"
  },
  {
    "source": "sampling_distribution",
    "target": "confidence",
    "label": "Schwankungen der Schätzungen begründen die Intervallkonstruktion"
  },
  {
    "source": "sampling_bias",
    "target": "missing",
    "label": "Systematische Nichtteilnahme oder fehlende Angaben können Schätzungen verzerren"
  },
  {
    "source": "random_sampling",
    "target": "weights",
    "label": "Ungleiche Auswahlwahrscheinlichkeiten verlangen designgerechte Schätzungen"
  },
  {
    "source": "law_large_numbers",
    "target": "central_limit",
    "label": "Stabilisierung des Mittels und Form seiner standardisierten Schwankungen unterscheiden"
  },
  {
    "source": "central_limit",
    "target": "standard_normal",
    "label": "Die Standardnormalverteilung ist hier die Grenzverteilung"
  },
  {
    "source": "null_distribution",
    "target": "p_value",
    "label": "Die Nullverteilung liefert die Wahrscheinlichkeit extremer Prüfgrößen"
  },
  {
    "source": "null_distribution",
    "target": "t_distribution",
    "label": "Referenz für geeignete standardisierte Mittelwertprüfgrößen"
  },
  {
    "source": "null_distribution",
    "target": "chi_square_distribution",
    "label": "Referenz für geeignete Quadratsummen- und Häufigkeitsprüfgrößen"
  },
  {
    "source": "null_distribution",
    "target": "f_distribution",
    "label": "Referenz für geeignete Verhältnisse von Streuungsgrößen"
  },
  {
    "source": "null_distribution",
    "target": "binomial_distribution",
    "label": "Endliche Nullverteilung einer Erfolgsanzahl bei festgelegtem p₀"
  },
  {
    "source": "test_sides",
    "target": "p_value",
    "label": "Die Alternative bestimmt, welche Ergebnisse als mindestens so extrem zählen"
  },
  {
    "source": "critical_value",
    "target": "confidence",
    "label": "Ein passendes Referenzquantil bestimmt die Breite eines modellbasierten Intervalls"
  },
  {
    "source": "critical_value",
    "target": "quantile",
    "label": "Theoretisches Referenzquantil und empirisches Datenquantil unterscheiden"
  },
  {
    "source": "type_errors",
    "target": "multiplicity",
    "label": "Einzelne Fehlerraten und Fehlerraten einer Testfamilie unterscheiden"
  },
  {
    "source": "power",
    "target": "confidence",
    "label": "Stichprobenplanung betrifft sowohl Erkennbarkeit von Effekten als auch Präzision"
  },
  {
    "source": "general_df",
    "target": "t_distribution",
    "label": "Die Freiheitsgrade bestimmen die Referenzform"
  },
  {
    "source": "general_df",
    "target": "chi_square_distribution",
    "label": "Die Freiheitsgrade bestimmen die Referenzform"
  },
  {
    "source": "general_df",
    "target": "f_distribution",
    "label": "Zähler und Nenner haben eigene Freiheitsgrade"
  },
  {
    "source": "exact_asymptotic",
    "target": "binomial_test",
    "label": "Die diskrete Nullverteilung ermöglicht einen exakten Anteiltest"
  },
  {
    "source": "exact_asymptotic",
    "target": "chi_square",
    "label": "Der übliche p-Wert verwendet eine asymptotische χ²-Referenz"
  },
  {
    "source": "variance_assumption",
    "target": "levene_test",
    "label": "Prüft bestimmte Unterschiede der Gruppenstreuung; kein allgemeiner Nachweis aller Regressionsannahmen."
  },
  {
    "source": "variance_assumption",
    "target": "residuals",
    "label": "Residuenbilder helfen bei der Diagnose der Fehlerstreuung."
  },
  {
    "source": "variance_assumption",
    "target": "linear_regression",
    "label": "Die klassische Inferenz und Vorhersageintervalle benötigen passende Varianzannahmen."
  },
  {
    "source": "outliers_influence",
    "target": "linear_regression",
    "label": "Einflussdiagnostik gehört zur Interpretation eines angepassten Modells."
  },
  {
    "source": "multicollinearity",
    "target": "linear_regression",
    "label": "Gemeinsam verwendete Prädiktoren können schwer trennbare Beiträge haben."
  },
  {
    "source": "multicollinearity",
    "target": "interaction",
    "label": "Produktterme können die Abhängigkeit zwischen Modellspalten erhöhen."
  },
  {
    "source": "explained_variance",
    "target": "linear_regression",
    "label": "R² beschreibt die Anpassung einer linearen Regression."
  },
  {
    "source": "explained_variance",
    "target": "overfitting",
    "label": "Ein höheres Trainings-R² belegt keine bessere Vorhersage."
  },
  {
    "source": "prediction_interval",
    "target": "confidence",
    "label": "Unterscheide den Bereich für eine neue Person vom Intervall für ihren bedingten Mittelwert."
  },
  {
    "source": "overfitting",
    "target": "prediction",
    "label": "Vorhersagen sollen für den vorgesehenen Einsatz mit neuen Daten bewertet werden."
  },
  {
    "source": "confounding",
    "target": "partial_cor",
    "label": "Statistische Kontrolle ist nicht gleichbedeutend mit kausaler Identifikation."
  },
  {
    "source": "confounding",
    "target": "causality",
    "label": "Gemeinsame Ursachen können den beobachteten Vergleich verzerren."
  },
  {
    "source": "random_assignment",
    "target": "sampling",
    "label": "Zuweisung zu Bedingungen und Auswahl aus einer Population sind verschiedene Vorgänge."
  },
  {
    "source": "operationalization",
    "target": "item_score",
    "label": "Die Bildung eines Gesamtwerts ist Teil der dokumentierten Messregel."
  },
  {
    "source": "measurement_error",
    "target": "reliability",
    "label": "Reliabilitätsmodelle beschreiben die Präzision von Messwerten unter ihren Annahmen."
  },
  {
    "source": "validity",
    "target": "reliability",
    "label": "Präzision und begründete Interpretation sind verschiedene Gütefragen."
  },
  {
    "source": "validity",
    "target": "dimensionality",
    "label": "Die interne Struktur kann Evidenz für eine bestimmte Interpretation liefern."
  },
  {
    "source": "dimensionality",
    "target": "factor_model",
    "label": "Ein- und Mehrfaktorenmodelle sind mögliche Beschreibungen des Zusammenhangsmusters."
  },
  {
    "source": "dimensionality",
    "target": "efa",
    "label": "Explorative Faktorenanalyse untersucht mögliche Strukturen; sie ersetzt keine inhaltliche Begründung."
  },
  {
    "source": "correlation_matrix",
    "target": "factor_model",
    "label": "Die gemeinsame Matrix ist Ausgangspunkt der hier behandelten Komponenten- und Faktorenmodelle."
  },
  {
    "source": "loadings",
    "target": "factor_model",
    "label": "Ladungen sind Parameter des gemeinsamen Faktorenmodells."
  },
  {
    "source": "eigenvalues",
    "target": "efa",
    "label": "Eigenwerte unterstützen die Wahl einer Komponenten- oder Faktorzahl, entscheiden sie aber nicht allein."
  },
  {
    "source": "communality",
    "target": "factor_model",
    "label": "Kommunalitäten beschreiben die modellierte gemeinsame Itemvarianz."
  },
  {
    "source": "rotation",
    "target": "efa",
    "label": "Das gewählte Rotationsverfahren prägt die Interpretation der ausgegebenen Lösung."
  },
  {
    "source": "missing_mechanisms",
    "target": "missing_tools",
    "label": "Technische Missing-Codes und die Ursachen fehlender Angaben sind unterschiedliche Fragen."
  },
  {
    "source": "empirical_distribution",
    "target": "frequency",
    "label": "Beobachtete Einzelanteile ergeben die empirische Verteilung"
  },
  {
    "source": "empirical_distribution",
    "target": "median",
    "label": "Die Mitte anhand der beobachteten Verteilung bestimmen"
  },
  {
    "source": "empirical_distribution",
    "target": "quantile",
    "label": "Datenquantile fassen die geordnete Verteilung zusammen"
  },
  {
    "source": "empirical_distribution",
    "target": "describe",
    "label": "Kennwerte gemeinsam mit der Verteilung lesen"
  },
  {
    "source": "empirical_distribution",
    "target": "shape",
    "label": "Asymmetrie und Randverhalten beschreiben"
  },
  {
    "source": "empirical_distribution",
    "target": "theoretical_distribution",
    "label": "Beobachtete Verteilung und Modell vergleichen"
  },
  {
    "source": "conditional_probability",
    "target": "crosstab",
    "label": "Zeilen- und Spaltenprozente verwenden unterschiedliche Bezugsgruppen"
  },
  {
    "source": "stochastic_independence",
    "target": "expected",
    "label": "Unter Unabhängigkeit gemeinsame Zellbesetzungen erwarten"
  },
  {
    "source": "stochastic_independence",
    "target": "sampling",
    "label": "Unabhängigkeit der Personen im Erhebungsdesign begründen"
  },
  {
    "source": "stochastic_independence",
    "target": "pearson",
    "label": "Unabhängigkeit und fehlende lineare Korrelation unterscheiden"
  },
  {
    "source": "probability",
    "target": "logit",
    "label": "Ereigniswahrscheinlichkeiten in Odds und Logits übersetzen"
  },
  {
    "source": "normal_distribution",
    "target": "z",
    "label": "Standardisierung verändert nicht die Verteilungsform"
  },
  {
    "source": "normal_distribution",
    "target": "normality_test",
    "label": "Die angenommene Normalform mit Daten vergleichen"
  },
  {
    "source": "normal_distribution",
    "target": "residuals",
    "label": "Normalitätsannahmen betreffen im Regressionsmodell die Fehler"
  },
  {
    "source": "t_distribution",
    "target": "t_test",
    "label": "Eine passende t-Referenz für den gewählten Test verwenden"
  },
  {
    "source": "t_distribution",
    "target": "pearson",
    "label": "Unter passenden Annahmen r über eine t-Prüfgröße testen"
  },
  {
    "source": "chi_square_distribution",
    "target": "chi_square",
    "label": "Asymptotische Referenz der Unabhängigkeitsprüfung"
  },
  {
    "source": "chi_square_distribution",
    "target": "chisq_gof",
    "label": "Asymptotische Referenz der Anpassungsprüfung"
  },
  {
    "source": "f_distribution",
    "target": "oneway_anova",
    "label": "Das Verhältnis mittlerer Quadratsummen einordnen"
  },
  {
    "source": "f_distribution",
    "target": "factorial_anova",
    "label": "F-Tests einzelner Modellterme einordnen"
  },
  {
    "source": "f_distribution",
    "target": "ancova",
    "label": "F-Tests adjustierter Gruppenunterschiede einordnen"
  },
  {
    "source": "bernoulli_distribution",
    "target": "likelihood",
    "label": "Die Bernoulli-Log-Likelihood erklärt das logistische Schätzprinzip"
  },
  {
    "source": "binomial_distribution",
    "target": "binomial_test",
    "label": "Die Erfolgszahl unter festgelegtem p₀ prüfen"
  },
  {
    "source": "binomial_distribution",
    "target": "mcnemar_test",
    "label": "Exakte Variante: Richtungen unter den Wechslern prüfen"
  },
  {
    "source": "hypergeometric_distribution",
    "target": "fisher_test",
    "label": "Bei 2×2 auf die Randsummen bedingen"
  },
  {
    "source": "theoretical_quantile",
    "target": "quantile",
    "label": "Modellquantile und Quantile endlicher Daten unterscheiden"
  },
  {
    "source": "theoretical_quantile",
    "target": "critical_value",
    "label": "Eine Entscheidungsgrenze als Modellquantil bestimmen"
  },
  {
    "source": "probability_mass",
    "target": "binomial_distribution",
    "label": "Einzelwahrscheinlichkeiten der möglichen Erfolgszahlen"
  },
  {
    "source": "cumulative_probability",
    "target": "p_value",
    "label": "Eine Randwahrscheinlichkeit aus der Referenzverteilung berechnen"
  },
  {
    "source": "alpha_level",
    "target": "p_value",
    "label": "Vorab festgelegte Schwelle und beobachteten p-Wert unterscheiden"
  },
  {
    "source": "general_df",
    "target": "df",
    "label": "n−1 ist ein spezieller Fall gebundener Information"
  },
  {
    "source": "random_sampling",
    "target": "random_assignment",
    "label": "Zufallsauswahl und zufällige Zuweisung unterscheiden"
  },
  {
    "source": "sampling_bias",
    "target": "missing_mechanisms",
    "label": "Selektive fehlende Angaben können Schätzungen verzerren"
  },
  {
    "source": "loadings",
    "target": "reliability",
    "label": "Ladungen und Fehlervarianzen gehen in Omega ein"
  },
  {
    "source": "communality",
    "target": "efa",
    "label": "Den dargestellten Varianzanteil eines Items lesen"
  },
  {
    "source": "dimensionality",
    "target": "item_score",
    "label": "Prüfen, ob ein gemeinsamer Score die Struktur angemessen erfasst"
  },
  {
    "source": "overfitting",
    "target": "linear_regression",
    "label": "Anpassungsgüte und Vorhersage neuer Fälle unterscheiden"
  },
  {
    "source": "t_test",
    "target": "p_value",
    "label": "Den berichteten p-Wert im jeweiligen Nullmodell interpretieren"
  },
  {
    "source": "oneway_anova",
    "target": "p_value",
    "label": "Den berichteten p-Wert im jeweiligen Nullmodell interpretieren"
  },
  {
    "source": "factorial_anova",
    "target": "p_value",
    "label": "Den berichteten p-Wert im jeweiligen Nullmodell interpretieren"
  },
  {
    "source": "ancova",
    "target": "p_value",
    "label": "Den berichteten p-Wert im jeweiligen Nullmodell interpretieren"
  },
  {
    "source": "levene_test",
    "target": "p_value",
    "label": "Den berichteten p-Wert im jeweiligen Nullmodell interpretieren"
  },
  {
    "source": "normality_test",
    "target": "p_value",
    "label": "Den berichteten p-Wert im jeweiligen Nullmodell interpretieren"
  },
  {
    "source": "mann_whitney",
    "target": "p_value",
    "label": "Den berichteten p-Wert im jeweiligen Nullmodell interpretieren"
  },
  {
    "source": "kruskal_wallis",
    "target": "p_value",
    "label": "Den berichteten p-Wert im jeweiligen Nullmodell interpretieren"
  },
  {
    "source": "wilcoxon_test",
    "target": "p_value",
    "label": "Den berichteten p-Wert im jeweiligen Nullmodell interpretieren"
  },
  {
    "source": "friedman_test",
    "target": "p_value",
    "label": "Den berichteten p-Wert im jeweiligen Nullmodell interpretieren"
  },
  {
    "source": "dunn_test",
    "target": "p_value",
    "label": "Den berichteten p-Wert im jeweiligen Nullmodell interpretieren"
  },
  {
    "source": "tukey_test",
    "target": "p_value",
    "label": "Den berichteten p-Wert im jeweiligen Nullmodell interpretieren"
  },
  {
    "source": "scheffe_test",
    "target": "p_value",
    "label": "Den berichteten p-Wert im jeweiligen Nullmodell interpretieren"
  },
  {
    "source": "pairwise_wilcoxon",
    "target": "p_value",
    "label": "Den berichteten p-Wert im jeweiligen Nullmodell interpretieren"
  },
  {
    "source": "binomial_test",
    "target": "p_value",
    "label": "Den berichteten p-Wert im jeweiligen Nullmodell interpretieren"
  },
  {
    "source": "chi_square",
    "target": "p_value",
    "label": "Den berichteten p-Wert im jeweiligen Nullmodell interpretieren"
  },
  {
    "source": "chisq_gof",
    "target": "p_value",
    "label": "Den berichteten p-Wert im jeweiligen Nullmodell interpretieren"
  },
  {
    "source": "fisher_test",
    "target": "p_value",
    "label": "Den berichteten p-Wert im jeweiligen Nullmodell interpretieren"
  },
  {
    "source": "mcnemar_test",
    "target": "p_value",
    "label": "Den berichteten p-Wert im jeweiligen Nullmodell interpretieren"
  },
  {
    "source": "pearson",
    "target": "p_value",
    "label": "Den berichteten p-Wert im jeweiligen Nullmodell interpretieren"
  },
  {
    "source": "spearman",
    "target": "p_value",
    "label": "Den berichteten p-Wert im jeweiligen Nullmodell interpretieren"
  },
  {
    "source": "kendall_tau",
    "target": "p_value",
    "label": "Den berichteten p-Wert im jeweiligen Nullmodell interpretieren"
  },
  {
    "source": "partial_cor",
    "target": "p_value",
    "label": "Den berichteten p-Wert im jeweiligen Nullmodell interpretieren"
  },
  {
    "source": "linear_regression",
    "target": "p_value",
    "label": "Den berichteten p-Wert im jeweiligen Nullmodell interpretieren"
  },
  {
    "source": "logistic_regression",
    "target": "p_value",
    "label": "Den berichteten p-Wert im jeweiligen Nullmodell interpretieren"
  },
  {
    "source": "marginal_effects",
    "target": "p_value",
    "label": "Den berichteten p-Wert im jeweiligen Nullmodell interpretieren"
  },
  {
    "source": "efa",
    "target": "p_value",
    "label": "Bartlett-Test; bei ML zusätzlich Modellanpassung einordnen"
  },
  {
    "source": "t_test",
    "target": "confidence",
    "label": "Die Unsicherheit der berichteten Schätzung einordnen"
  },
  {
    "source": "oneway_anova",
    "target": "confidence",
    "label": "Intervalle der einzelnen Gruppenmittel einordnen"
  },
  {
    "source": "ancova",
    "target": "confidence",
    "label": "Intervalle von Parametern und adjustierten Mitteln einordnen"
  },
  {
    "source": "tukey_test",
    "target": "confidence",
    "label": "Die Unsicherheit der berichteten Schätzung einordnen"
  },
  {
    "source": "scheffe_test",
    "target": "confidence",
    "label": "Die Unsicherheit der berichteten Schätzung einordnen"
  },
  {
    "source": "binomial_test",
    "target": "confidence",
    "label": "Die Unsicherheit der berichteten Schätzung einordnen"
  },
  {
    "source": "pearson",
    "target": "confidence",
    "label": "Die Unsicherheit der berichteten Schätzung einordnen"
  },
  {
    "source": "linear_regression",
    "target": "confidence",
    "label": "Die Unsicherheit der berichteten Schätzung einordnen"
  },
  {
    "source": "logistic_regression",
    "target": "confidence",
    "label": "Intervalle der Odds Ratios interpretieren"
  },
  {
    "source": "marginal_effects",
    "target": "confidence",
    "label": "Die Unsicherheit der berichteten Schätzung einordnen"
  },
  {
    "source": "t_test",
    "target": "effect",
    "label": "Die Größe des Unterschieds oder Zusammenhangs interpretieren",
    "variants": [
      0,
      1,
      4,
      5
    ]
  },
  {
    "source": "oneway_anova",
    "target": "effect",
    "label": "Die Größe des Unterschieds oder Zusammenhangs interpretieren"
  },
  {
    "source": "factorial_anova",
    "target": "effect",
    "label": "Die Größe des Unterschieds oder Zusammenhangs interpretieren"
  },
  {
    "source": "ancova",
    "target": "effect",
    "label": "Die Größe des Unterschieds oder Zusammenhangs interpretieren"
  },
  {
    "source": "mann_whitney",
    "target": "effect",
    "label": "Die Größe des Unterschieds oder Zusammenhangs interpretieren"
  },
  {
    "source": "wilcoxon_test",
    "target": "effect",
    "label": "Die Größe des Unterschieds oder Zusammenhangs interpretieren"
  },
  {
    "source": "kruskal_wallis",
    "target": "effect",
    "label": "Die Größe des Unterschieds oder Zusammenhangs interpretieren"
  },
  {
    "source": "friedman_test",
    "target": "effect",
    "label": "Die Größe des Unterschieds oder Zusammenhangs interpretieren"
  },
  {
    "source": "chi_square",
    "target": "effect",
    "label": "Die Größe des Unterschieds oder Zusammenhangs interpretieren"
  },
  {
    "source": "pearson",
    "target": "effect",
    "label": "Die Größe des Unterschieds oder Zusammenhangs interpretieren"
  },
  {
    "source": "spearman",
    "target": "effect",
    "label": "Die Größe des Unterschieds oder Zusammenhangs interpretieren"
  },
  {
    "source": "kendall_tau",
    "target": "effect",
    "label": "Die Größe des Unterschieds oder Zusammenhangs interpretieren"
  },
  {
    "source": "partial_cor",
    "target": "effect",
    "label": "Die Größe des Unterschieds oder Zusammenhangs interpretieren"
  },
  {
    "source": "linear_regression",
    "target": "effect",
    "label": "Die Größe des Unterschieds oder Zusammenhangs interpretieren"
  },
  {
    "source": "logistic_regression",
    "target": "effect",
    "label": "Die Größe des Unterschieds oder Zusammenhangs interpretieren"
  },
  {
    "source": "marginal_effects",
    "target": "effect",
    "label": "Die Größe des Unterschieds oder Zusammenhangs interpretieren"
  },
  {
    "source": "phi",
    "target": "effect",
    "label": "Die Größe des Unterschieds oder Zusammenhangs interpretieren"
  },
  {
    "source": "cramers_v",
    "target": "effect",
    "label": "Die Größe des Unterschieds oder Zusammenhangs interpretieren"
  },
  {
    "source": "goodman_gamma",
    "target": "effect",
    "label": "Die Größe des Unterschieds oder Zusammenhangs interpretieren"
  },
  {
    "source": "tukey_test",
    "target": "effect",
    "label": "Mittelwertdifferenz in Originaleinheiten einordnen"
  },
  {
    "source": "scheffe_test",
    "target": "effect",
    "label": "Mittelwertdifferenz in Originaleinheiten einordnen"
  }
];
