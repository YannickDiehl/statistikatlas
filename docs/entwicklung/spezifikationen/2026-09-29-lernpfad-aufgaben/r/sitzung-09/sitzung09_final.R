library(mariposa)
library(dplyr)

allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")

# 1 · Wer ist umgezogen?
allbus %>% frequency(dg03, weights = wghtpew) %>% summary()

# 2 · Vier Dummies – die weggelassene Gruppe ist die Referenz
allbus <- allbus %>% to_dummy(dg03)

allbus %>%
  linear_regression(ps03 ~ dg03_1 + dg03_2 + dg03_3, weights = wghtpew) %>%   # Referenz: dg03_4
  summary()

# 3 · Wer zieht um?
allbus <- allbus %>%
  mutate(
    abi  = rec(educ, rules = "1:3=0 [kein Abitur]; 4:5=1 [(Fach-)Abitur]; else=NA"),
    frau = rec(sex, rules = "1=0 [Mann]; 2=1 [Frau]; else=NA")
  )
allbus %>% crosstab(dg03, abi, percentages = "row", weights = wghtpew) %>% summary()

# 4 · Nur gemeinsame Ursachen kontrollieren (standen vor dem Umzug fest)
allbus %>%
  linear_regression(ps03 ~ dg03_1 + dg03_2 + dg03_3 + age + abi + frau, weights = wghtpew) %>%
  summary()

# Profi · Dieselbe Frage als Interaktion
allbus <- allbus %>%
  mutate(
    ost       = rec(eastwest, rules = "1=0 [West]; 2=1 [Ost]"),
    ostjugend = rec(dg03, rules = "1:2=1 [Jugend Ost]; 3:4=0 [Jugend West]")
  )
allbus %>% linear_regression(ps03 ~ ost + ostjugend, weights = wghtpew) %>% summary()
allbus %>% linear_regression(ps03 ~ ost * ostjugend, weights = wghtpew) %>% summary()
