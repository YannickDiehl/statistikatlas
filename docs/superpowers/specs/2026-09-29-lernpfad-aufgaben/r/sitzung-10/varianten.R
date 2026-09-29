suppressMessages({library(mariposa); library(dplyr)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
allbus <- allbus %>%
  mutate(
    waehlen   = rec(pv01, rules = "1:90=1 [würde wählen]; 91=0 [würde nicht wählen]; else=NA"),
    nichtwahl = rec(pv01, rules = "91=1; 1:90=0; else=NA"),
    waehlen_wn = rec(untag_na(pv01), rules = "1:90=1; 91=0; -8=0; else=NA"),
    pflicht   = rec(pe09, rules = "rev"),
    interesse = rec(pa02a, rules = "rev"),
    abitur    = rec(educ, rules = "4:5=1; 1:3=0; else=NA"),
    ost       = rec(eastwest, rules = "2=1; 1=0")
  )
or <- function(m) round(m$coef_table$`Exp(B)`[-1], 3)
suppressWarnings({
cat("gewichtet        ", or(allbus %>% logistic_regression(waehlen ~ pflicht + interesse, weights = wghtpew)), "\n")
mu <- allbus %>% logistic_regression(waehlen ~ pflicht + interesse)
cat("ungewichtet      ", or(mu), " B:", round(coef(mu),3), "\n")
cat("AV Nichtwahl     ", or(allbus %>% logistic_regression(nichtwahl ~ pflicht + interesse, weights = wghtpew)), "\n")
cat("pe09/pa02a roh   ", or(allbus %>% logistic_regression(waehlen ~ pe09 + pa02a, weights = wghtpew)), "\n")
cat("pe09 roh         ", or(allbus %>% logistic_regression(waehlen ~ pe09 + interesse, weights = wghtpew)), "\n")
mw <- allbus %>% logistic_regression(waehlen_wn ~ pflicht + interesse, weights = wghtpew)
cat("weiss nicht = 0  ", or(mw), " n=", mw$n, "\n")
mk <- allbus %>% logistic_regression(waehlen ~ pflicht + interesse + age + abitur + ost, weights = wghtpew)
print(mk$coef_table[, c(1,2,5,6)]); print(marginal_effects(mk))
})
# Null model accuracy and -2LL
m <- suppressWarnings(allbus %>% logistic_regression(waehlen ~ pflicht + interesse, weights = wghtpew))
mf <- model.frame(m); w <- model.weights(mf); y <- model.response(mf)
cat("gewichteter Anteil Wählende im Modell-Sample:", round(sum(w*y)/sum(w),4), " sum w:", round(sum(w),1), "\n")
cat("-2LL null:", round(m$null.deviance,3), " -2LL model:", round(m$deviance,3), "\n")
# Observed weighted shares in profile cells (aggregate)
allbus %>% filter(!is.na(waehlen), !is.na(pflicht), !is.na(interesse)) %>%
  group_by(pflicht, interesse) %>%
  summarise(n = n(), anteil_waehlen = round(sum(wghtpew * waehlen) / sum(wghtpew), 3), .groups = "drop") %>%
  mutate(p_modell = round(predict(m, newdata = data.frame(pflicht = pflicht, interesse = interesse), type = "response"), 3)) %>%
  print(n = 30)
