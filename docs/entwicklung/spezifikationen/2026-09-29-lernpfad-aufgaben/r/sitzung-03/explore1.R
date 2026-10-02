suppressPackageStartupMessages({library(mariposa); library(dplyr)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
cat(packageVersion("mariposa") |> as.character(), "\n")
for (v in c("pv01","incc","hhincc","di07c","di08c","xt10","dw15","dh04","dk11","xs15","pa01","ls01","age","pa02a")) {
  cat("\n=====", v, "=====\n")
  print(na_frequencies(allbus[[v]]))
  x <- allbus[[v]]
  cat("valid n:", sum(!is.na(x)), " range:", range(x, na.rm=TRUE), "\n")
}
