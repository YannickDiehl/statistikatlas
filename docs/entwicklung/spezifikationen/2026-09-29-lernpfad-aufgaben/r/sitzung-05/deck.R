suppressPackageStartupMessages({library(mariposa); library(dplyr)})
options(warn = -1)
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
allbus <- allbus %>% mutate(
  sex2 = rec(sex, rules = "1=1 [Mann]; 2=2 [Frau]; else=NA"),
  konf = rec(rd01, rules = "1:2=1 [evangelisch]; 3=2 [katholisch]; 4:5=3 [andere]; 6=4 [keine]; else=NA"),
  educ5 = rec(educ, rules = "1:5=copy; else=NA")
)
# fast weighted tau-b replicating mariposa (pair weight sqrt(wi*wj)) via cell sums
tau_fast <- function(x, y, w = NULL) {
  ok <- !is.na(x) & !is.na(y); if (!is.null(w)) ok <- ok & !is.na(w) & w > 0
  x <- as.numeric(x[ok]); y <- as.numeric(y[ok]); w <- if (is.null(w)) rep(1, length(x)) else as.numeric(w[ok])
  xs <- sort(unique(x)); ys <- sort(unique(y))
  xi <- match(x, xs); yi <- match(y, ys)
  S <- matrix(0, length(xs), length(ys)); W <- S
  s <- sqrt(w)
  for (k in seq_along(x)) { S[xi[k], yi[k]] <- S[xi[k], yi[k]] + s[k]; W[xi[k], yi[k]] <- W[xi[k], yi[k]] + w[k] }
  tot <- (sum(S)^2 - sum(W)) / 2
  rs <- rowSums(S); rw <- rowSums(W); cs <- colSums(S); cw <- colSums(W)
  tx_all <- sum((rs^2 - rw) / 2)          # pairs tied on x (incl both)
  ty_all <- sum((cs^2 - cw) / 2)
  tb <- sum((S^2 - W) / 2)                # tied on both
  C <- 0; D <- 0; R <- nrow(S); K <- ncol(S)
  for (i in 1:R) for (j in 1:K) {
    if (i < R && j < K) C <- C + S[i,j] * sum(S[(i+1):R, (j+1):K])
    if (i < R && j > 1) D <- D + S[i,j] * sum(S[(i+1):R, 1:(j-1)])
  }
  (C - D) / sqrt((tot - tx_all) * (tot - ty_all))
}
getr <- function(res) res$correlations[[intersect(c("correlation","rho","tau"), names(res$correlations))[1]]][1]
deck <- list(
  eastwest = "nominal", sex2 = "nominal", konf = "nominal", rb08 = "nominal/ordinal",
  ep01 = "ordinal", ep03 = "ordinal", pa02a = "ordinal", id02 = "ordinal", gs01 = "ordinal",
  rp01 = "ordinal", hs01 = "ordinal", educ5 = "ordinal", xr20 = "ordinal", pt03 = "ordinal(7)", pt09 = "ordinal(7)",
  pa01 = "quasi-metrisch(10)", ls01 = "quasi-metrisch(11)", di08c = "ordinal/metr.(25)", age = "metrisch")
out <- list()
for (v in names(deck)) {
  d <- allbus %>% filter(!is.na(ps03), !is.na(.data[[v]]))
  row <- data.frame(var = v, niveau = deck[[v]], n = nrow(d))
  row$V_w <- cramers_v(d, ps03, !!sym(v), weights = wghtpew)
  row$V_u <- cramers_v(d, ps03, !!sym(v))
  row$g_w <- goodman_gamma(d, ps03, !!sym(v), weights = wghtpew)
  row$g_u <- goodman_gamma(d, ps03, !!sym(v))
  row$tau_u <- tau_fast(d$ps03, d[[v]])
  row$tau_w <- tau_fast(d$ps03, d[[v]], d$wghtpew)
  row$rho <- getr(spearman_rho(d, ps03, !!sym(v)))
  row$r_w <- getr(pearson_cor(d, ps03, !!sym(v), weights = wghtpew))
  row$r_u <- getr(pearson_cor(d, ps03, !!sym(v)))
  gW <- d %>% filter(eastwest == 1); gO <- d %>% filter(eastwest == 2)
  if (v != "eastwest") {
    row$V_West <- cramers_v(gW, ps03, !!sym(v)); row$V_Ost <- cramers_v(gO, ps03, !!sym(v))
    row$tau_West <- tau_fast(gW$ps03, gW[[v]]); row$tau_Ost <- tau_fast(gO$ps03, gO[[v]])
    row$g_West <- goodman_gamma(gW, ps03, !!sym(v)); row$g_Ost <- goodman_gamma(gO, ps03, !!sym(v))
  }
  out[[v]] <- row
}
res <- bind_rows(out)
num <- sapply(res, is.numeric); res[num & names(res) != "n"] <- round(res[num & names(res) != "n"], 3)
print(res, row.names = FALSE, width = 250)
write.csv(res, "deck_results.csv", row.names = FALSE)
