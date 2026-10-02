suppressPackageStartupMessages({library(mariposa); library(dplyr)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
for (v in c("pa02a","educ","pt11","ls01","ps03","pa01","isced97","hs01","xs17","pt03","pt12","lp05","pe05")) { cat("\n==", v, "\n"); print(attr(allbus[[v]], "labels")); print(table(as.numeric(allbus[[v]]), useNA="ifany")) }
