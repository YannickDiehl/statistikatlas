suppressMessages({library(mariposa); library(dplyr)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
allbus <- allbus %>%
  mutate(
    waehlen   = rec(pv01, rules = "1:90=1 [würde wählen]; 91=0 [würde nicht wählen]; else=NA"),
    abitur    = rec(educ, rules = "4:5=1 [(Fach-)Abitur]; 1:3=0 [kein Abitur]; else=NA"),
    ost       = rec(eastwest, rules = "2=1 [Ost]; 1=0 [West]"),
    interesse = rec(pa02a, rules = "rev"),
    pflicht   = rec(pe09, rules = "rev"),
    frau      = rec(sex, rules = "2=1 [Frau]; 1=0 [Mann]; else=NA"),
    misstrauen = rec(pe01, rules = "rev")
  )
# weighted shares
allbus %>% crosstab(interesse, waehlen, percentages = "row", weights = wghtpew) %>% print()
allbus %>% crosstab(pflicht, waehlen, percentages = "row", weights = wghtpew) %>% print()
allbus %>% crosstab(abitur, waehlen, percentages = "row", weights = wghtpew) %>% print()
fit <- function(f) { m <- allbus %>% logistic_regression(f, weights = wghtpew); print(m$coef_table[,c(1,2,6,7)]); print(unlist(m$model_summary)); print(m$n); print(marginal_effects(m)); m }
suppressWarnings({
mA <- fit(waehlen ~ interesse + abitur + age + ost)
mB <- fit(waehlen ~ interesse + pflicht + abitur + age + ost)
mC <- fit(waehlen ~ interesse + abitur + age + frau + ost)
mD <- fit(waehlen ~ interesse + misstrauen + abitur + age + ost)
})
