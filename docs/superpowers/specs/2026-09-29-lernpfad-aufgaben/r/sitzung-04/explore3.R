suppressMessages({library(haven)})
f <- "/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav"
d <- read_sav(f, user_na = TRUE, col_select = c("pv01","pe01"))
print(class(d$pv01)); print(attr(d$pv01,"na_values")); print(attr(d$pv01,"na_range"))
print(table(as.numeric(d$pv01), useNA="ifany"))
print(table(as.numeric(d$pe01), useNA="ifany"))
