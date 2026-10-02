suppressMessages({library(mariposa); library(dplyr)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
d <- allbus %>% to_dummy(dg03, ref = 4)
x <- data.frame(y = as.numeric(d$ps03), d1 = as.numeric(d$dg03_1), d2 = as.numeric(d$dg03_2), d3 = as.numeric(d$dg03_3), w = as.numeric(d$wghtpew))
x <- x[complete.cases(x), ]
f <- lm(y ~ d1 + d2 + d3, data = x, weights = w)
cat("coef check:", round(coef(f),3), " n=", nrow(x), "\n")
db <- dfbeta(f)
for (term in c("d2","d3")) {
  up <- order(db[, term], decreasing = TRUE)[1:5]; dn <- order(db[, term])[1:5]
  cat(term, "full", round(coef(f)[term],3),
      "| ohne 5 stärkste Aufwärts-Fälle", round(coef(lm(y ~ d1+d2+d3, data = x[-up,], weights = w))[term],3),
      "| ohne 5 stärkste Abwärts-Fälle", round(coef(lm(y ~ d1+d2+d3, data = x[-dn,], weights = w))[term],3), "\n")
}
cat("group n:", table(x$d1 + 2*x$d2 + 3*x$d3), "\n")
