suppressMessages({library(mariposa); library(dplyr)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
allbus <- allbus %>%
  mutate(
    nichtwahl = rec(pv01, rules = "91=1 [würde nicht wählen]; 1:90=0 [würde wählen]; else=NA"),
    abitur    = rec(educ, rules = "4:5=1 [(Fach-)Abitur]; 1:3=0 [kein Abitur]; else=NA"),
    ost       = rec(eastwest, rules = "2=1 [Ost]; 1=0 [West]"),
    interesse = rec(pa02a, rules = "rev"),
    wenig_int = rec(pa02a, rules = "4:5=1 [wenig/überhaupt nicht]; 1:3=0 [mittel bis sehr stark]; else=NA"),
    frau      = rec(sex, rules = "2=1 [Frau]; 1=0 [Mann]; else=NA"),
    pflicht   = rec(pe09, rules = "1=1 [stimme voll zu]; 2:4=0 [nicht voll]; else=NA")
  )
print(class(allbus$nichtwahl)); print(table(allbus$interesse, allbus$pa02a))
allbus %>% frequency(nichtwahl, weights = wghtpew)
m1 <- allbus %>% logistic_regression(nichtwahl ~ abitur + ost + interesse + age, weights = wghtpew)
print(summary(m1))
print(marginal_effects(m1))
m0 <- allbus %>% logistic_regression(nichtwahl ~ abitur + ost + interesse + age)
print(m0$coef_table)
