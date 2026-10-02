suppressPackageStartupMessages({library(mariposa); library(dplyr)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
d <- allbus %>% mutate(ja = rec(xr21, rules = "1=1 [ja]; 2=0 [nein]"),
                       m = as.numeric(mode), s = as.numeric(splt23_3), a = as.numeric(age))
# aggregate only
agg <- function(df) df %>% summarise(n = sum(!is.na(ja)), p_ja = mean(ja, na.rm=TRUE), wp = weighted.mean(ja, wghtpew, na.rm=TRUE), age_mean = mean(a, na.rm=TRUE))
cat("\n== by split (all selfadmin)\n"); print(d %>% filter(!is.na(s)) %>% group_by(s) %>% agg())
cat("\n== by split x mode\n"); print(d %>% filter(!is.na(s)) %>% group_by(m, s) %>% agg())
cat("\n== by mode\n"); print(d %>% filter(!is.na(s)) %>% group_by(m) %>% agg())
cat("\n== ja NA by split x mode (item nonresponse)\n"); print(d %>% filter(!is.na(s)) %>% group_by(m,s) %>% summarise(na = sum(is.na(ja)), n=n(), .groups="drop"))
print(attr(allbus$age,"labels")); print(summary(d$a))
