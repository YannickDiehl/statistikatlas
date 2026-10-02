suppressMessages({library(haven); library(dplyr)})
d <- read_sav("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav", user_na = TRUE)
m <- as.numeric(d$mode)
cat("xr19 -15 by mode:", tapply(as.numeric(d$xr19) == -15, m, sum), "\n")
cat("kh9sex -15 by mode:", tapply(as.numeric(d$kh9sex) == -15, m, sum), "\n")
cat("xs07 -15 by mode:", tapply(as.numeric(d$xs07) == -15, m, sum), "\n")
cat("xs17 -15 by mode:", tapply(as.numeric(d$xs17) == -15, m, sum), "\n")
# uniqueness shares for successive keys
keys <- c("yborn","sex","eastwest","educ","dh04","rd01")
for (k in seq_along(keys)) {
  g <- d %>% mutate(across(all_of(keys[1:k]), as.numeric)) %>% count(across(all_of(keys[1:k])))
  cat(paste(keys[1:k], collapse="+"), ": unique persons =", sum(g$n == 1), " share =", round(mean(rep(g$n, g$n) == 1)*100,1), "%\n")
}
