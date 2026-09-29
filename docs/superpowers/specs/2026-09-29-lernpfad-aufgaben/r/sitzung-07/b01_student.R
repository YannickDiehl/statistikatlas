library(mariposa)
library(dplyr)

allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")

# 1 · Die ganze Batterie: Wie stimmig sind alle sieben Fragen?
allbus %>%
  reliability(pa29, pa30, pa31, pa32, pa33, pa34, pa35) %>%
  summary()

# 2 · Deine Kurzskala (hier: pa31, pa32, pa33)
allbus %>%
  reliability(pa31, pa32, pa33)

# 3 · Zwei Werte pro Person: Kurzwert und Restwert
allbus <- allbus %>%
  mutate(
    kurz = row_means(., pa31, pa32, pa33, min_valid = 3),
    rest = row_means(., pa29, pa30, pa34, pa35, min_valid = 4)
  )

# 4 · Stellvertreter-Test
allbus %>%
  pearson_cor(kurz, rest)
