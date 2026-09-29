library(mariposa)
library(dplyr)

allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")

# 1 · Wer ist umgezogen? (dg03: Jugend Ost/West × Interview Ost/West)
allbus %>% frequency(dg03, weights = wghtpew) %>% summary()

# 2 · Dummies mit selbst gewählter Referenzgruppe (hier 4 = im Westen aufgewachsen und geblieben)
allbus <- allbus %>%
  to_dummy(dg03, ref = 4)

allbus %>%
  linear_regression(ps03 ~ dg03_1 + dg03_2 + dg03_3, weights = wghtpew) %>%
  summary(anova_table = FALSE, descriptives = FALSE)

# 3 · Wer zieht um? Selektion prüfen
allbus <- allbus %>%
  mutate(
    abi  = rec(educ, rules = "1:3=0 [kein Abitur]; 4:5=1 [(Fach-)Abitur]; else=NA"),
    frau = rec(sex, rules = "1=0 [Mann]; 2=1 [Frau]; else=NA")
  )

allbus %>%
  crosstab(dg03, abi, percentages = "row", weights = wghtpew) %>% summary()

# 4 · Modell mit gemeinsamen Ursachen (vor dem Umzug festgelegt)
allbus %>%
  linear_regression(ps03 ~ dg03_1 + dg03_2 + dg03_3 + age + abi + frau, weights = wghtpew) %>%
  summary(anova_table = FALSE, descriptives = FALSE)
