suppressPackageStartupMessages({library(mariposa); library(dplyr)})
cat("mariposa", as.character(packageVersion("mariposa")), "\n")
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
cat(nrow(allbus), "\n")
for (v in c("pa29","pa30","pa31","pa32","pa33","pa34","pa35","va01","va02","va03","va04","ingle")) {
  x <- allbus[[v]]
  cat("\n==", v, attr(x, "label"), "\n")
  print(attr(x, "labels"))
  print(table(haven::na_tag(x), useNA = "ifany"))
  print(table(unclass(x), useNA="ifany"))
}
