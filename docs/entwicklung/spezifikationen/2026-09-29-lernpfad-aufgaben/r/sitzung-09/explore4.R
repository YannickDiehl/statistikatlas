suppressMessages({library(mariposa); library(dplyr)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
d <- allbus %>% mutate(
  frau = rec(sex, rules = "1=0 [Mann]; 2=1 [Frau]; else=NA"),
  abi = rec(educ, rules = "1:3=0 [kein Abitur]; 4:5=1 [(Fach-)Abitur]; else=NA"),
  unzufr = ps03
) %>% to_dummy(dg03, ref = 4)
print(names(d)[grepl("dg03", names(d))])
m <- function(f, data = d) { r <- linear_regression(data, f, weights = wghtpew); ct <- r$coef_table; cat("\n", deparse(f), " | n =", round(r$n), " R2 =", round(r$model_summary$R_squared,3), "\n"); print(ct %>% select(Term,B,Std.Error,p,CI_lower,CI_upper,VIF), n=30) }
m(unzufr ~ dg03_1 + dg03_2 + dg03_3)
m(unzufr ~ dg03_1 + dg03_2 + dg03_3 + age + abi + frau)
# mover characteristics
print(d %>% group_by(dg03) %>% describe(age, abi, weights = wghtpew))
