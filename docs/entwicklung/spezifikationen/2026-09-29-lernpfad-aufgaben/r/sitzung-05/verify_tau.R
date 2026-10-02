suppressPackageStartupMessages({library(mariposa); library(dplyr)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
source("tau_fast.R")
sub <- allbus %>% filter(!is.na(ps03), !is.na(ep01))
s8 <- sub[1:800,]
cat("tau_fast weighted n=800:", tau_fast(s8$ps03, s8$ep01, s8$wghtpew), " (mariposa: 0.3550522)\n")
s3 <- allbus[1:300,] %>% filter(!is.na(ps03), !is.na(ep01))
cat("tau_fast unweighted first300:", tau_fast(s3$ps03, s3$ep01), " (mariposa: 0.3672881)\n")
s2 <- sub[1:200,]
t <- system.time(k <- s2 %>% kendall_tau(ps03, ep01, weights = wghtpew))
cat("mariposa weighted n=200:", k$correlations$tau, "secs", t[3], " fast:", tau_fast(s2$ps03, s2$ep01, s2$wghtpew), "\n")
