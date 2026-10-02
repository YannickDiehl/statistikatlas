suppressMessages({library(mariposa); library(dplyr)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
for (v in c("ps03","ps01","eastwest","dg03","ep01","ep03","id02","di08c","incc","dw18","educ","isced97","lp05","pe01","pe05","pa01","ls01","sex","age","pt03","pt12","german","hs01")) {
  x <- allbus[[v]]
  cat("\n==", v, ":", attr(x,"label"), "| valid n =", sum(!is.na(x)), "\n")
  lab <- attr(x,"labels"); if(!is.null(lab) && length(lab) < 30) print(lab)
}
