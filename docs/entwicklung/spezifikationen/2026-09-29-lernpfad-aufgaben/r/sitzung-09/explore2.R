suppressMessages({library(mariposa); library(dplyr)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
nz <- function(...) { d <- allbus %>% select(...) ; sum(complete.cases(as.data.frame(lapply(d, as.numeric)))) }
cat("ps03&pt03", nz(ps03,pt03), " ps03&pe01", nz(ps03,pe01), " ps03&lp05", nz(ps03,lp05), " ps03&ps01", nz(ps03,ps01), " ps03&pa01", nz(ps03, pa01), " ps03&di08c", nz(ps03,di08c), " ps03&dw18", nz(ps03,dw18),"\n")
d <- allbus %>% mutate(
  ost = rec(eastwest, rules = "1=0 [West]; 2=1 [Ost]"),
  frau = rec(sex, rules = "1=0 [Mann]; 2=1 [Frau]; else=NA"),
  abi = rec(educ, rules = "1:3=0 [kein Abitur]; 4:5=1 [(Fach-)Abitur]; else=NA"),
  unzufr = ps03
)
m <- function(f, data = d) { r <- linear_regression(data, f, weights = wghtpew); ct <- r$coef_table; cat(deparse(f), " | n =", round(r$n), " R2 =", round(r$model_summary$R_squared,3), "\n"); print(ct %>% select(any_of(c("Term","term","B","Beta","p","VIF"))), n=30) }
print(names(linear_regression(d, unzufr ~ ost)$coef_table))
m(unzufr ~ ost)
m(unzufr ~ ost + age + frau + abi)
m(unzufr ~ ost + age + frau + abi + di08c)
m(unzufr ~ ost + age + frau + abi + di08c + ep03)
m(unzufr ~ ost + age + frau + abi + di08c + ep03 + ep01)
m(unzufr ~ ost + age + frau + abi + id02)
m(unzufr ~ ost + ps01)
m(unzufr ~ ost + pt03)
m(unzufr ~ ost + pt03 + pt12)
m(unzufr ~ ost + pe01)
m(unzufr ~ ost + pa01)
