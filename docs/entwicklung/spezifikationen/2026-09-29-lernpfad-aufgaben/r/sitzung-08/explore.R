suppressPackageStartupMessages({library(mariposa); library(dplyr)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
cat("mariposa", as.character(packageVersion("mariposa")), "\n")
vars <- c("ps03","ls01","pa01","pt03","pt12","pt02","pt14","age","ep03","ep01","pa02a","hhincc","incc","di08c","educ","id02","st01","dw15","xt10","hs01","pe01","lp05","splt23_1","splt23_2")
for (v in vars) {
  x <- allbus[[v]]
  lab <- attr(x, "labels")
  cat("\n==", v, attr(x,"label"), "\n")
  vals <- as.numeric(x)
  cat("valid n:", sum(!is.na(vals)), " range:", range(vals, na.rm=TRUE), "\n")
  if (!is.null(lab) && length(lab) < 30) print(lab)
  if (length(unique(vals)) <= 15) print(table(vals, useNA="ifany"))
}
