suppressPackageStartupMessages({library(mariposa); library(dplyr)})
options(warn = -1)
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
allbus <- allbus %>% mutate(
  zufrieden = rec(ps03, rules = "1:3=1 [zufrieden]; 4:6=0 [unzufrieden]; else=NA"),
  konf = rec(rd01, rules = "1:2=1 [evangelisch]; 3=2 [katholisch]; 4:5=3 [andere]; 6=4 [keine]; else=NA"),
  konf_b = rec(rd01, rules = "6=1 [keine]; 1:2=2 [evangelisch]; 3=3 [katholisch]; 4:5=4 [andere]; else=NA"),
  konf_c = rec(rd01, rules = "3=1 [katholisch]; 6=2 [keine]; 4:5=3 [andere]; 1:2=4 [evangelisch]; else=NA"),
  altersgruppe = rec(age, rules = "18:29=1 [18-29]; 30:44=2 [30-44]; 45:59=3 [45-59]; 60:74=4 [60-74]; 75:max=5 [75+]; else=NA")
)
cat("\n## Anteil zufrieden (1-3), gesamt und nach Region\n")
d <- allbus %>% filter(!is.na(zufrieden))
cat("ungewichtet gesamt:", round(100*mean(d$zufrieden),1), " gewichtet gesamt:", round(100*weighted.mean(d$zufrieden, d$wghtpew),1), "\n")
print(d %>% group_by(eastwest) %>% summarise(n = n(), unw = round(100*mean(zufrieden),1), w = round(100*weighted.mean(zufrieden, as.numeric(wghtpew)),1)))
cat("Ostanteil ungewichtet:", round(100*mean(d$eastwest==2),1), " gewichtet:", round(100*sum(d$wghtpew[d$eastwest==2])/sum(d$wghtpew),1), "\n")

cat("\n## pa02a x ps03 Zeilenprozente (gewichtet), zufrieden-Anteil\n")
print(allbus %>% filter(!is.na(zufrieden), !is.na(pa02a)) %>% group_by(pa02a) %>% summarise(n=n(), zufr = round(100*weighted.mean(zufrieden, as.numeric(wghtpew)),1), sehr = round(100*weighted.mean(as.numeric(ps03)==1, as.numeric(wghtpew)),1), sehrunz = round(100*weighted.mean(as.numeric(ps03)==6, as.numeric(wghtpew)),1)))

cat("\n## Alter: V gewichtet (Einzeljahre) vs. Zufallsbaseline; Altersgruppen\n")
da <- allbus %>% filter(!is.na(ps03), !is.na(age))
cat("V_w age:", cramers_v(da, ps03, age, weights = wghtpew), "\n")
set.seed(2023); perm <- replicate(20, { dd <- da; dd$ps03 <- sample(dd$ps03); cramers_v(dd, ps03, age, weights = wghtpew) })
cat("V_w bei zufaellig vertauschter Zufriedenheit (20 Laeufe): Mittel", round(mean(perm),3), " Spanne", round(min(perm),3), "-", round(max(perm),3), "\n")
cat("V_w altersgruppe:", cramers_v(allbus, ps03, altersgruppe, weights = wghtpew), " gamma_w:", goodman_gamma(allbus, ps03, altersgruppe, weights = wghtpew), "\n")
print(allbus %>% filter(!is.na(zufrieden), !is.na(altersgruppe)) %>% group_by(altersgruppe) %>% summarise(n=n(), zufr=round(100*weighted.mean(zufrieden, as.numeric(wghtpew)),1)))
dk <- allbus %>% filter(!is.na(ps03), !is.na(konf))
set.seed(7); permk <- replicate(20, { dd <- dk; dd$ps03 <- sample(dd$ps03); cramers_v(dd, ps03, konf, weights = wghtpew) })
cat("Konf V_w Zufallsbaseline Mittel:", round(mean(permk),3), "\n")

cat("\n## Konfession: gamma je nach (willkuerlicher) Reihenfolge\n")
for (v in c("konf","konf_b","konf_c")) cat(v, " gamma_w:", round(goodman_gamma(allbus, ps03, !!sym(v), weights = wghtpew),3), " V_w:", round(cramers_v(allbus, ps03, !!sym(v), weights = wghtpew),3), "\n")
print(allbus %>% filter(!is.na(zufrieden), !is.na(konf)) %>% group_by(eastwest, konf) %>% summarise(n=n(), zufr=round(100*weighted.mean(zufrieden, as.numeric(wghtpew)),1), .groups="drop"))

cat("\n## eastwest x zufrieden: phi/V/gamma gewichtet und ungewichtet\n")
cat("phi_w:", phi(allbus, eastwest, zufrieden, weights = wghtpew), " phi_u:", phi(allbus, eastwest, zufrieden), "\n")
cat("gamma_w:", goodman_gamma(allbus, eastwest, zufrieden, weights = wghtpew), " gamma_u:", goodman_gamma(allbus, eastwest, zufrieden), "\n")

cat("\n## Kirchgang rp01: zufrieden-Anteil nach Region\n")
allbus <- allbus %>% mutate(kirche = rec(rp01, rules = "1:3=1 [mind. monatlich]; 4:5=2 [seltener]; 6=3 [nie]; else=NA"))
print(allbus %>% filter(!is.na(zufrieden), !is.na(kirche)) %>% group_by(eastwest, kirche) %>% summarise(n=n(), zufr=round(100*weighted.mean(zufrieden, as.numeric(wghtpew)),1), .groups="drop"))
print(allbus %>% filter(!is.na(kirche)) %>% group_by(eastwest) %>% summarise(nie = round(100*mean(kirche==3),1)))

cat("\n## gs01 Wohnort: tau nach Region, zufrieden-Anteil\n")
print(allbus %>% filter(!is.na(zufrieden), !is.na(gs01)) %>% group_by(eastwest, gs01) %>% summarise(n=n(), zufr=round(100*weighted.mean(zufrieden, as.numeric(wghtpew)),1), .groups="drop"), n = 20)
