suppressPackageStartupMessages({library(mariposa); library(dplyr)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
d <- allbus %>% mutate(institut = as.numeric(respid) %% 10, ost = rec(eastwest, rules = "1=0 [West]; 2=1 [Ost]"))
print(summary(as.numeric(d$respid)))
d %>% t_test(ls01, pa01, group = ost)
# per institute (aggregate only)
res <- d %>% group_by(institut) %>% summarise(n = n(), n_ost = sum(ost == 1), 
  diff = mean(ls01[ost==0], na.rm=TRUE) - mean(ls01[ost==1], na.rm=TRUE),
  p = t.test(ls01 ~ ost)$p.value,
  diff_pa = mean(pa01[ost==1], na.rm=TRUE) - mean(pa01[ost==0], na.rm=TRUE),
  p_pa = t.test(pa01 ~ ost)$p.value)
print(res, n = 10)
# balance of institute digit: age mean by digit
print(d %>% group_by(institut) %>% summarise(age = mean(as.numeric(age), na.rm=TRUE), capi = mean(as.numeric(mode)==2)))
