suppressPackageStartupMessages({library(mariposa); library(dplyr)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
items <- paste0("pa", 29:35)
facet <- c(pa29="V", pa30="E", pa31="E", pa32="H", pa33="V", pa34="H", pa35="E")
X <- as.data.frame(lapply(allbus[items], function(x) as.numeric(unclass(haven::zap_missing(x)))))
X[] <- lapply(X, function(x) {x[!(x %in% 1:5)] <- NA; x})
w <- as.numeric(allbus$wghtpew)
cc <- complete.cases(X)
cat("listwise n:", sum(cc), "\n")
long <- rowMeans(X)
alpha <- function(M) { k <- ncol(M); C <- cov(M); k/(k-1) * (1 - sum(diag(C))/sum(C)) }
# external criteria
crit <- list(
  ps03 = allbus$ps03, pt03 = allbus$pt03, pt12 = allbus$pt12, pe01 = allbus$pe01, pa01 = allbus$pa01)
for (nm in names(crit)) { v <- as.numeric(unclass(haven::zap_missing(crit[[nm]]))); v[v < 0] <- NA; crit[[nm]] <- v }
print(sapply(crit, function(v) table(v)[1:3]))
cmb <- combn(items, 3)
res <- data.frame()
for (j in 1:ncol(cmb)) {
  s <- cmb[, j]; rest <- setdiff(items, s)
  M <- X[cc, s]
  short <- rowMeans(X[, s])
  restm <- rowMeans(X[, rest])
  a <- alpha(M)
  r_long <- cor(short[cc], long[cc])
  r_rest <- cor(short[cc], restm[cc])
  facets <- length(unique(facet[s]))
  ext <- sapply(crit, function(v) cor(short[cc], v[cc], use = "pairwise"))
  res <- rbind(res, data.frame(set = paste(s, collapse = "+"), fac = paste(facet[s], collapse=""), nfac = facets,
     alpha = round(a, 3), r_long = round(r_long, 3), r_rest = round(r_rest, 3), t(round(ext, 3))))
}
ext_long <- sapply(crit, function(v) cor(long[cc], v[cc], use = "pairwise"))
cat("long-scale external r:\n"); print(round(ext_long, 3))
res <- res %>% arrange(desc(alpha))
res$rank_alpha <- rank(-res$alpha, ties.method = "min")
res$rank_long <- rank(-res$r_long, ties.method = "min")
res$rank_rest <- rank(-res$r_rest, ties.method = "min")
print(res, row.names = FALSE)
cat("\nrange alpha", range(res$alpha), " range r_long", range(res$r_long), " range r_rest", range(res$r_rest), "\n")
cat("cor(alpha, r_long) over 35 triples:", round(cor(res$alpha, res$r_long), 3), "\n")
cat("cor(alpha, r_rest):", round(cor(res$alpha, res$r_rest), 3), "\n")
