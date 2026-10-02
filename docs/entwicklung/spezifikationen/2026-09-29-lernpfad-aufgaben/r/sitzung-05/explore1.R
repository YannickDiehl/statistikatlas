suppressPackageStartupMessages({library(mariposa); library(dplyr)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
vars <- c("ps03","ps01","pd12","pt03","eastwest","sex","rd01","educ","age","incc","ep01","ep03","pa02a","pa01","pt09","st01","id02","gs01","rp01","lp05","hs01","ls01","pe01","pa35","pr04","pr10","rb08","dg03","wghtpew","iscd11","di08c","xr20","pn16","pd11")
for (v in vars) {
  x <- allbus[[v]]
  lab <- attr(x, "label")
  vl <- attr(x, "labels")
  cat("\n==", v, ":", lab, "| class:", class(x)[1], "| valid n:", sum(!is.na(x)), "\n")
  if (!is.null(vl) && length(vl) < 30) print(vl[vl > -100 & vl > -1 | TRUE][1:min(length(vl), 25)])
  if (v %in% c("age","wghtpew","ls01")) print(summary(as.numeric(x)))
}
