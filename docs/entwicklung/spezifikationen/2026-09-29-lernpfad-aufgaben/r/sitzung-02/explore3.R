suppressMessages({library(haven); library(dplyr)})
d <- read_sav("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav", user_na = TRUE)
for (v in c("pa02a","pa01","pv01","pt03","ls01","st01","sex","rb08","pe01","ps03","hs01","id02","splt23_2","splt23_1")) {
  cat("\n=====", v, ":", attr(d[[v]], "label"), "\n")
  print(attr(d[[v]], "labels"))
  cat("na_values:", attr(d[[v]], "na_values"), " na_range:", attr(d[[v]], "na_range"), "\n")
  print(table(value = as.numeric(d[[v]]), mode = as.numeric(d$mode)))
}
