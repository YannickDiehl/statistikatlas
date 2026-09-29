suppressMessages({library(mariposa); library(dplyr); library(haven)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
x <- allbus$pv01
print(names(attributes(x)))
print(attr(x, "na_tag_map"))
print(class(x))
print(head(na_frequencies(x)))
u <- untag_na(x); print(table(u, useNA="ifany"))
