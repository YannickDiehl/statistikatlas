suppressPackageStartupMessages({library(mariposa); library(dplyr)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
d <- allbus %>% mutate(demo = as.numeric(rec(ps03, rules = "rev")))
spread <- function(x, w = TRUE) {
  xx <- as.numeric(d[[x]]); yy <- d$demo; ww <- if (w) as.numeric(d$wghtpew) else rep(1, nrow(d))
  ok <- !is.na(xx) & !is.na(yy)
  m <- lm(yy[ok] ~ xx[ok], weights = ww[ok])
  r <- yy[ok] - fitted(m)
  tab <- data.frame(x = xx[ok], r = r, w = ww[ok], y = yy[ok]) %>% group_by(x) %>%
    summarise(n = n(), mean_y = weighted.mean(y, w), pred = coef(m)[1] + coef(m)[2]*first(x), mean_res = weighted.mean(r, w), rms_res = sqrt(weighted.mean(r^2, w)), sd_y = sqrt(weighted.mean((y-weighted.mean(y,w))^2, w)), mae = weighted.mean(abs(r), w), hit05 = weighted.mean(abs(r) <= .5, w))
  cat("\n== X =", x, " a =", round(coef(m)[1],3), " b =", round(coef(m)[2],3), "\n"); print(as.data.frame(tab) %>% mutate(across(where(is.numeric), ~round(.x, 3))))
  cat("overall rms:", round(sqrt(weighted.mean(r^2, ww[ok])),3), " MAE:", round(weighted.mean(abs(r), ww[ok]),3), " mean-model MAE:", round(weighted.mean(abs(yy[ok]-weighted.mean(yy[ok],ww[ok])), ww[ok]),3), "\n")
  cat("share |res|<=0.5:", round(weighted.mean(abs(r)<=.5, ww[ok]),3), " share |res|<=1:", round(weighted.mean(abs(r)<=1, ww[ok]),3), " faulpelz <=1:", round(weighted.mean(abs(yy[ok]-weighted.mean(yy[ok],ww[ok]))<=1, ww[ok]),3), "\n")
}
for (x in c("pt03","ep01","pa01","id02","ls01","ep03","pe01")) spread(x)
# age binned
d2 <- d %>% mutate(ageg = cut(as.numeric(age), c(17,24,29,34,39,44,49,54,59,64,69,74,79,99)))
cat("\n demo by age group\n")
print(d2 %>% filter(!is.na(demo), !is.na(ageg)) %>% group_by(ageg) %>% summarise(n = n(), m = weighted.mean(demo, wghtpew)) %>% as.data.frame() %>% mutate(m = round(m, 2)))
cat("\n ls01 by age group\n")
print(d2 %>% filter(!is.na(ls01), !is.na(ageg)) %>% group_by(ageg) %>% summarise(n = n(), m = weighted.mean(as.numeric(ls01), wghtpew)) %>% as.data.frame() %>% mutate(m = round(m, 2)))
