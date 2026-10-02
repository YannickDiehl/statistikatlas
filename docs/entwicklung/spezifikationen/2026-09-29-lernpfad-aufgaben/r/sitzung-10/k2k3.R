suppressMessages({library(mariposa); library(dplyr)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
allbus <- allbus %>% mutate(
  waehlen = rec(pv01, rules = "1:90=1; 91=0; else=NA"),
  pflicht = rec(pe09, rules = "rev"), interesse = rec(pa02a, rules = "rev"))
m <- suppressWarnings(allbus %>% logistic_regression(waehlen ~ pflicht + interesse, weights = wghtpew))
mf <- model.frame(m); w <- model.weights(mf); y <- model.response(mf); p <- fitted(m)
for (s in c(0.5, 0.8, 0.9, 0.95)) {
  flag <- p < s
  cat(sprintf("Schwelle p(wählen) < %.2f: markiert %.1f %% aller; erreicht %.1f %% der Nichtwählenden; Treffer unter Markierten %.1f %%\n",
    s, 100*sum(w[flag])/sum(w), 100*sum(w[flag & y==0])/sum(w[y==0]), 100*sum(w[flag & y==0])/sum(w[flag])))
}
# K3: column shares of non-voters by interest
print(summary(allbus %>% crosstab(interesse, waehlen, percentages = "col", weights = wghtpew)))
# beta/4 and Kipppunkt
cat("beta/4 =", round(coef(m)[["pflicht"]]/4, 3), "\n")
