suppressPackageStartupMessages({library(mariposa); library(dplyr)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
x <- allbus$dw15
cat("dw15 missing types by work:\n")
print(table(work = untag_na(allbus$work), dw15 = ifelse(is.na(x), as.character(untag_na(x)), "valid"), useNA="ifany"))
cat("share > mean among valid:", mean(x > mean(x, na.rm=TRUE), na.rm=TRUE), " share >= 40:", mean(x>=40, na.rm=TRUE), " share < 40:", mean(x<40,na.rm=TRUE), "\n")
cat("share == 40:", mean(x==40,na.rm=TRUE), "\n")
l <- allbus$ls01
cat("ls01 share > mean:", mean(l > mean(l,na.rm=TRUE), na.rm=TRUE), " mean", mean(l,na.rm=TRUE), "\n")
print(round(prop.table(table(l))*100,1))
