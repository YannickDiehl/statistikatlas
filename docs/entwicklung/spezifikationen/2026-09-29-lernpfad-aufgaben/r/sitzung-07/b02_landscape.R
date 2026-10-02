suppressPackageStartupMessages({library(mariposa); library(dplyr)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
items <- paste0("pa", 29:35)
X <- as.data.frame(lapply(allbus[items], function(x) { v <- as.numeric(unclass(haven::zap_missing(x))); v[!(v %in% 1:5)] <- NA; v }))
cc <- complete.cases(X)
alpha <- function(M) { M <- M[complete.cases(M), ]; k <- ncol(M); C <- cov(M); c(k/(k-1) * (1 - sum(diag(C))/sum(C)), nrow(M)) }
long <- rowMeans(X)
cmb <- combn(items, 3); res <- data.frame()
for (j in 1:ncol(cmb)) {
  s <- cmb[, j]; rest <- setdiff(items, s)
  a <- alpha(X[, s])
  kurz <- rowMeans(X[, s]); restm <- rowMeans(X[, rest])
  kurz_any <- rowMeans(X[, s], na.rm = TRUE); rest_any <- rowMeans(X[, rest], na.rm = TRUE)
  res <- rbind(res, data.frame(set = paste(s, collapse = "+"), alpha = a[1], n_alpha = a[2],
    r_rest = cor(kurz, restm, use = "complete.obs"),
    r_rest_any = cor(kurz_any, rest_any, use = "complete.obs"),
    r_long = cor(kurz, long, use = "complete.obs")))
}
res$rank_alpha <- rank(-res$alpha); res$rank_rest <- rank(-res$r_rest)
res <- res %>% arrange(desc(alpha))
res[, 2:6] <- round(res[, 2:6], 3)
print(res, row.names = FALSE)
cat("cor(alpha, r_rest) =", round(cor(res$alpha, res$r_rest), 3), "\n")
cat("max diff r_rest vs r_rest_any:", max(abs(res$r_rest - res$r_rest_any)), "\n")
cat("triples alpha>=.70:", sum(res$alpha >= .70), " with pa29 max alpha:", max(res$alpha[grepl("pa29", res$set)]), "\n")
cat("pa29 agree (1-2) share unweighted:", round(mean(X$pa29 <= 2, na.rm=TRUE), 3), "\n")
# agreement shares all items weighted
w <- as.numeric(allbus$wghtpew)
print(round(sapply(X, function(v) { ok <- !is.na(v); sum(w[ok] * (v[ok] <= 2)) / sum(w[ok]) }), 3))
