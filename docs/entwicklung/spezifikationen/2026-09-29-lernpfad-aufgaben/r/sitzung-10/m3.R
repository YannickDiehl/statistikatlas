suppressMessages({library(mariposa); library(dplyr)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
allbus <- allbus %>%
  mutate(
    waehlen   = rec(pv01, rules = "1:90=1 [würde wählen]; 91=0 [würde nicht wählen]; else=NA"),
    pflicht   = rec(pe09, rules = "rev"),
    interesse = rec(pa02a, rules = "rev"),
    abitur    = rec(educ, rules = "4:5=1 [(Fach-)Abitur]; 1:3=0 [kein Abitur]; else=NA"),
    ost       = rec(eastwest, rules = "2=1 [Ost]; 1=0 [West]")
  )
print(summary(allbus %>% crosstab(pflicht, waehlen, percentages = "row", weights = wghtpew)))
print(summary(allbus %>% crosstab(interesse, waehlen, percentages = "row", weights = wghtpew)))
suppressWarnings({
m <- allbus %>% logistic_regression(waehlen ~ pflicht + interesse + age, weights = wghtpew)
})
print(summary(m))
print(summary(marginal_effects(m)))
suppressWarnings({ m2 <- allbus %>% logistic_regression(waehlen ~ pflicht + interesse + age + ost, weights = wghtpew) })
print(m2$coef_table[,c(1,2,3,6,7)]); print(unlist(m2$model_summary))
suppressWarnings({ mu <- allbus %>% logistic_regression(waehlen ~ pflicht + interesse + age) })
print(mu$coef_table[,c(1,2,3,6,7)])
