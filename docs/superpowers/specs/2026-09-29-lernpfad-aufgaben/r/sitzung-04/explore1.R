suppressMessages({library(dplyr); library(mariposa)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
cat("mariposa", as.character(packageVersion("mariposa")), "\n")
for (v in c("pv01","pe01","pe05","pa35","pa30","pp18","pe09","splt23_1","splt23_2")) {
  cat("\n====", v, attr(allbus[[v]], "label") , "\n")
  x <- allbus[[v]]
  print(attr(x, "labels"))
  print(table(untag_na(x), useNA="ifany"))
}
# split overlap
cat("\npe01 asked vs pa35 asked vs pe05\n")
a <- untag_na(allbus$pe01); b <- untag_na(allbus$pa35); c5 <- untag_na(allbus$pe05)
print(table(pe01_asked = a != -11, pa35_asked = b != -11))
print(table(pe01_asked = a != -11, pe05_asked = c5 != -11))
print(table(pe01_asked = a != -11, split=untag_na(allbus$splt23_1)))
print(table(pa35_asked = b != -11, split=untag_na(allbus$splt23_1)))
