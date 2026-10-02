suppressMessages({library(mariposa); library(dplyr)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
d <- allbus %>% to_dummy(dg03, ref = 4) %>% mutate(
  ost = rec(eastwest, rules = "1=0 [West]; 2=1 [Ost]"),
  abi = rec(educ, rules = "1:3=0 [kein Abitur]; 4:5=1 [(Fach-)Abitur]; else=NA"))
r <- linear_regression(d, ps03 ~ dg03_1 + dg03_2 + dg03_3, weights = wghtpew)
# Wackeltest: influence on dg03_2 / dg03_3 via dfbeta (aggregate only)
db <- dfbeta(r)
for (term in c("dg03_2","dg03_3")) {
  o <- order(abs(db[, term]), decreasing = TRUE)[1:5]
  mf <- model.frame(r); keep <- setdiff(seq_len(nrow(mf)), o)
  idx <- as.integer(rownames(mf))[keep]
  r2 <- lm(ps03 ~ dg03_1 + dg03_2 + dg03_3, data = zap <- as.data.frame(lapply(d[idx, c("ps03","dg03_1","dg03_2","dg03_3","wghtpew")], as.numeric)), weights = wghtpew)
  cat(term, ": full =", round(coef(r)[term],3), " ohne 5 einflussreichste =", round(coef(r2)[term],3), "\n")
}
# Cook's D max
cd <- cooks.distance(r); cat("max Cook's D =", signif(max(cd),3), " n > 4/n:", sum(cd > 4/length(cd)), "of", length(cd), "\n")
# Concept C: ost*age raw vs centered
m <- function(f, data) { r <- linear_regression(data, f, weights = wghtpew); print(as.data.frame(r$coef_table %>% select(Term,B,p,VIF)) %>% mutate(across(where(is.numeric), ~round(.x,4)))); invisible(r) }
cat("\nraw age\n"); r1 <- m(ps03 ~ ost * age + abi, d)
dc <- d %>% center(age, weights = wghtpew, suffix = "_c")
cat("\ncentered age\n"); r2 <- m(ps03 ~ ost * age_c + abi, dc)
cat("mean age weighted:", round(w_mean(d, age, weights = wghtpew)$weighted_mean %||% NA, 2), "\n")
nd <- data.frame(ost = 1, age = 60, abi = 0)
cat("Prediction 60y East no Abi (raw):", round(predict(r1, newdata = nd),3), "\n")
