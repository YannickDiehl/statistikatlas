suppressMessages({library(haven); library(dplyr)})
d <- read_sav("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav", user_na = TRUE)
num <- d[, sapply(d, is.numeric)]
M <- sapply(num, function(x) as.numeric(x) == -42)
M[is.na(M)] <- FALSE
per_resp <- rowSums(M)
m <- as.numeric(d$mode)
cat("cells -42 total:", sum(M), "\n")
cat("vars with any -42:", sum(colSums(M) > 0), "\n")
cat("vars with -42 label:", sum(sapply(num, function(x) any(attr(x,'labels') == -42))), "\n")
cat("MAIL resp with >=1 -42:", sum(per_resp > 0 & m == 4), "of", sum(m == 4), "\n")
cat("max -42 per resp:", max(per_resp), "\n")
print(table(pmin(per_resp[m == 4], 5)))
# -11 and -15 cells by mode
for (code in c(-11, -15, -10)) { Mc <- sapply(num, function(x) as.numeric(x) == code); Mc[is.na(Mc)] <- FALSE; cat(code, ": ", tapply(rowSums(Mc), m, sum), "\n") }
# valid mean pa01
x <- as.numeric(d$pa01); cat("pa01 valid mean:", mean(x[x > 0]), " raw mean incl codes:", mean(x), "\n")
# st01 by split within MAIL
print(table(st01 = as.numeric(d$st01)[m==4], split = as.numeric(d$splt23_1)[m==4]))
print(table(pt03 = as.numeric(d$pt03)[m==4], split = as.numeric(d$splt23_1)[m==4]))
