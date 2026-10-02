suppressPackageStartupMessages({library(mariposa); library(dplyr)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
d <- allbus %>% mutate(demo = as.numeric(rec(ps03, rules = "rev")))
wsd <- function(x, w) sqrt(sum(w*(x-weighted.mean(x,w))^2)/sum(w))
row <- function(x) {
  xx <- as.numeric(d[[x]]); yy <- d$demo; ww <- as.numeric(d$wghtpew)
  ok <- !is.na(xx) & !is.na(yy); xx <- xx[ok]; yy <- yy[ok]; ww <- ww[ok]
  m <- lm(yy ~ xx, weights = ww); r <- residuals(m); f <- fitted(m); mu <- weighted.mean(yy, ww)
  g <- data.frame(x = xx, r = r, w = ww) %>% group_by(x) %>% summarise(n = n(), sd = wsd(r, w), mr = weighted.mean(r, w)) %>% filter(n >= 30)
  u <- lm(yy ~ xx)
  data.frame(x = x, n = sum(ok), a = coef(m)[1], b = coef(m)[2], r2 = summary(m)$r.squared,
             a_unw = coef(u)[1], b_unw = coef(u)[2], r2_unw = summary(u)$r.squared,
             hit_auto = weighted.mean(abs(yy - f) <= 1, ww), hit_faul = weighted.mean(abs(yy - mu) <= 1, ww),
             sdmin = min(g$sd), sdmin_at = g$x[which.min(g$sd)], sdmax = max(g$sd), sdmax_at = g$x[which.max(g$sd)],
             maxabs_meanres = max(abs(g$mr)), minpred = min(f), maxpred = max(f), row.names = NULL)
}
tab <- bind_rows(lapply(c("age","pa01","pa02a","ls01","id02","ep03","hs01","pe01","ep01","pt03","pt12"), row))
print(tab %>% mutate(across(where(is.numeric), ~round(.x, 3))), width = 250)
# reverse regression pt03 on demo, weighted
ok <- !is.na(d$pt03) & !is.na(d$demo)
rv <- lm(as.numeric(pt03) ~ demo, data = d[ok,], weights = wghtpew)
cat("\nX-Y vertauscht (pt03 ~ demo): a =", round(coef(rv)[1],3), " b =", round(coef(rv)[2],3), " R2 =", round(summary(rv)$r.squared,3), "\n")
nr <- lm(as.numeric(ps03) ~ as.numeric(pt03), data = d[ok,], weights = wghtpew)
cat("nicht umgepolt (ps03 ~ pt03): a =", round(coef(nr)[1],3), " b =", round(coef(nr)[2],3), "\n")
# SD line slope for concept A (weighted)
sx <- wsd(as.numeric(d$pt03[ok]), d$wghtpew[ok]); sy <- wsd(d$demo[ok], d$wghtpew[ok])
cat("SD-Linie Steigung:", round(sy/sx,3), " OLS:", round(coef(lm(demo ~ as.numeric(pt03), data = d[ok,], weights = wghtpew))[2],3), " umgekehrte Gerade im selben Bild:", round(1/coef(rv)[2],3), "\n")
# age centered constant
agem <- weighted.mean(as.numeric(d$age), d$wghtpew, na.rm = TRUE)
cat("gewichteter Altersmittelwert:", round(agem, 2), "\n")
