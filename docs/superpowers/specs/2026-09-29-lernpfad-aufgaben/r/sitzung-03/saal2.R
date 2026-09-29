suppressPackageStartupMessages({library(mariposa); library(dplyr)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
allbus %>% describe(dw15)
na_frequencies(allbus$dw15)
allbus %>% group_by(work) %>% describe(dw15)
allbus %>% filter(dw15 > 37.89) %>% nrow()
x <- allbus$dw15[!is.na(allbus$dw15)]
cat("n", length(x), " type7 q:", quantile(x, c(.25,.5,.75)), " type6:", quantile(x, c(.25,.5,.75), type=6), "\n")
cat("mean", mean(x), " share>mean", mean(x>mean(x)), " share<mean", mean(x<mean(x)), "\n")
q1 <- quantile(x,.25); q3 <- quantile(x,.75); iq <- q3-q1
cat("whisker lo", q1-1.5*iq, " hi", q3+1.5*iq, " n below", sum(x < q1-1.5*iq), " n above", sum(x > q3+1.5*iq), "\n")
bs <- boxplot.stats(x); cat("boxplot.stats:", bs$stats, " n out", length(bs$out), " out<Q1:", sum(bs$out < bs$stats[3]), "\n")
# including non-employed as 0
y <- untag_na(allbus$dw15); y0 <- y; y0[y0 == -10] <- 0; y0[y0 < 0] <- NA
cat("with TNZ=0: n", sum(!is.na(y0)), " mean", mean(y0, na.rm=TRUE), " median", median(y0, na.rm=TRUE), "\n")
# weighted
cat("weighted mean", w_mean(allbus, dw15, weights = wghtpew)$results$weighted_mean %||% NA, "\n")
