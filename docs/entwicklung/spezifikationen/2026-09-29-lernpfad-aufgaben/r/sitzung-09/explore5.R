suppressMessages({library(mariposa); library(dplyr)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
d <- allbus %>% mutate(
  frau = rec(sex, rules = "1=0 [Mann]; 2=1 [Frau]; else=NA"),
  abi = rec(educ, rules = "1:3=0 [kein Abitur]; 4:5=1 [(Fach-)Abitur]; else=NA"),
  ost = rec(eastwest, rules = "1=0 [West]; 2=1 [Ost]"),
  ostjugend = rec(dg03, rules = "1:2=1 [Jugend Ost]; 3:4=0 [Jugend West]")
) %>% to_dummy(dg03, suffix = "val")
m <- function(f, data = d, w = TRUE) { r <- if (w) linear_regression(data, f, weights = wghtpew) else linear_regression(data, f); ct <- r$coef_table; cat("\n", deparse(f), if(!w) "[UNGEWICHTET]", " | n =", round(r$n), " R2 =", round(r$model_summary$R_squared,4), "\n"); print(as.data.frame(ct %>% select(Term,B,Std.Error,p,CI_lower,CI_upper,VIF)) %>% mutate(across(where(is.numeric), ~round(.x,3)))) }
cat("### Referenz Ost-Ost (dg03_1)\n")
m(ps03 ~ dg03_2 + dg03_3 + dg03_4)
cat("### Fehler: dg03 als Zahl\n")
m(ps03 ~ dg03)
cat("### ungewichtet, Ref W-W\n")
m(ps03 ~ dg03_1 + dg03_2 + dg03_3, w = FALSE)
cat("### Folge-Kontrollen\n")
m(ps03 ~ dg03_1 + dg03_2 + dg03_3 + age + abi + frau + di08c)
m(ps03 ~ dg03_1 + dg03_2 + dg03_3 + age + abi + frau + ep03)
m(ps03 ~ dg03_1 + dg03_2 + dg03_3 + age + abi + frau + pt03)
cat("### Interaktion ost * ostjugend\n")
m(ps03 ~ ost * ostjugend)
m(ps03 ~ ost + ostjugend)
cat("### Gegenprobe andere AV\n")
m(pt03 ~ dg03_1 + dg03_2 + dg03_3)
m(pe01 ~ dg03_1 + dg03_2 + dg03_3)
m(ls01 ~ dg03_1 + dg03_2 + dg03_3)
cat("### overlap ost/ostjugend\n")
print(round(prop.table(table(as.numeric(d$ost), as.numeric(d$ostjugend))),3))
print(cor(as.numeric(d$ost), as.numeric(d$ostjugend), use="complete.obs"))
