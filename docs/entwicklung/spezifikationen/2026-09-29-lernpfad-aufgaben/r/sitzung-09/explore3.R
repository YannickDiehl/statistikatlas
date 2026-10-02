suppressMessages({library(mariposa); library(dplyr)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
d <- allbus %>% mutate(
  ost = rec(eastwest, rules = "1=0 [West]; 2=1 [Ost]"),
  frau = rec(sex, rules = "1=0 [Mann]; 2=1 [Frau]; else=NA"),
  abi = rec(educ, rules = "1:3=0 [kein Abitur]; 4:5=1 [(Fach-)Abitur]; else=NA"),
  ostjugend = rec(dg03, rules = "1:2=1 [Jugend Ost]; 3:4=0 [Jugend West]"),
  unzufr = ps03
)
cat("dg03 x ps03 counts\n"); print(table(as.numeric(d$dg03), is.na(d$ps03)))
m <- function(f, data = d) { r <- linear_regression(data, f, weights = wghtpew); ct <- r$coef_table; cat("\n", deparse(f), " | n =", round(r$n), " R2 =", round(r$model_summary$R_squared,3), "\n"); print(ct %>% select(Term,B,Beta,p,VIF), n=30) }
m(unzufr ~ ost + ostjugend)
m(unzufr ~ ostjugend)
m(unzufr ~ ost * age)
m(unzufr ~ ost * abi)
m(unzufr ~ ost * frau)
d2 <- d %>% mutate(jahrgang_ddr = rec(age, rules = "18:47=0 [nach 1975 geboren]; 48:max=1 [bis 1975 geboren]"))
m(unzufr ~ ost * jahrgang_ddr, d2)
# group means
cat("\nGroup means ps03 by eastwest (weighted)\n")
print(d %>% group_by(eastwest) %>% describe(unzufr, weights = wghtpew))
