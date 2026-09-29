suppressPackageStartupMessages({library(mariposa); library(dplyr)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
allbus <- allbus %>% mutate(demo = rec(ps03, rules = "rev"))

# Schritt 3: Was zeigt der Automat an – und wie weit liegt er daneben?
allbus <- allbus %>%
  mutate(
    anzeige = 2.288 + 0.465 * pt03,   # Konstante + Steigung × Eingabe
    daneben = demo - anzeige          # Residuum
  )

# Wie weit daneben – insgesamt und im Vergleich zur Streuung der Zufriedenheit?
allbus %>%
  filter(!is.na(daneben)) %>%
  describe(demo, daneben, weights = wghtpew)

# Schritt 4: Gleich gut für alle Besucher:innen?
allbus %>%
  filter(!is.na(daneben)) %>%
  group_by(pt03) %>%
  describe(daneben, weights = wghtpew, show = c("mean", "sd"))

allbus %>%
  levene_test(daneben, group = pt03, weights = wghtpew)
