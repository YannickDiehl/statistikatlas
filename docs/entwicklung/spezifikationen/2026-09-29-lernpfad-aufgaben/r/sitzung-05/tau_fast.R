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
