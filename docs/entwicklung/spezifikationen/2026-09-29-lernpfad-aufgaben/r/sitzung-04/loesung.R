# Sitzung 4 · Nenner-Check – Musterlösung der R-Schritte (nur Aggregatausgabe)
library(dplyr)
library(mariposa)

allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")

# Schritt 1: zwei Dummyvariablen bauen
allbus <- allbus %>%
  mutate(
    misstrauen = rec(pe01, rules = "1:2=1 [misstraut]; 3:4=0 [misstraut nicht]; else=NA"),
    nichtwahl  = rec(pv01, rules = "91=1 [wuerde nicht waehlen]; 1:90=0 [wuerde waehlen]; else=NA")
  )

# Kontrolle: stimmt das Umkodieren?
allbus %>% crosstab(pe01, misstrauen, percentages = "none")
allbus %>% frequency(nichtwahl)

# Prüfauftrag 1: die Zahl der Pressemitteilung (Spaltenprozente)
allbus %>% crosstab(misstrauen, nichtwahl, percentages = "col") %>% summary()

# Prüfauftrag 2: derselbe Tisch, anderer Nenner (Zeilen- und Zellenprozente)
allbus %>% crosstab(misstrauen, nichtwahl, percentages = "all") %>% summary()
