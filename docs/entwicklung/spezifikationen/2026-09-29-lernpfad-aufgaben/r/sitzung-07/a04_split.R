suppressPackageStartupMessages({library(mariposa); library(dplyr)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
num <- function(x, ok) { v <- as.numeric(unclass(haven::zap_missing(x))); v[!(v %in% ok)] <- NA; v }
alpha <- function(M) { k <- ncol(M); C <- cov(M); k/(k-1) * (1 - sum(diag(C))/sum(C)) }
splits <- function(items, ok) {
  X <- as.data.frame(lapply(allbus[items], num, ok = ok)); X <- X[complete.cases(X), ]
  cat("\nItems:", items, " n =", nrow(X), " alpha =", round(alpha(X), 3), "\n")
  first <- items[1]; others <- items[-1]
  cm <- combn(others, 2)
  out <- data.frame()
  for (j in 1:ncol(cm)) {
    A <- c(first, cm[, j]); B <- setdiff(items, A)
    a <- rowSums(X[, A]); b <- rowSums(X[, B])
    r <- cor(a, b); sb <- 2*r/(1+r); rulon <- 2*(1 - (var(a)+var(b))/var(a+b))
    out <- rbind(out, data.frame(A = paste(A, collapse="+"), B = paste(B, collapse="+"), r = round(r,3), sb = round(sb,3), rulon = round(rulon,3)))
  }
  print(out, row.names = FALSE)
  cat("mean SB:", round(mean(out$sb),3), " mean Rulon:", round(mean(out$rulon),3), " range SB:", range(out$sb), "\n")
}
splits(c("pt02","pt03","pt08","pt12","pt14","pt15"), 1:7)
splits(c("pa30","pa31","pa32","pa33","pa34","pa35"), 1:5)
splits(c("pt03","pt12","pt15","pt19","pt20","pt02"), 1:7)
