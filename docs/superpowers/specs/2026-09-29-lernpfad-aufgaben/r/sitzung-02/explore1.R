suppressMessages({library(haven); library(dplyr)})
d <- read_sav("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav", user_na = TRUE)
cat("n =", nrow(d), " vars =", ncol(d), "\n")
# collect all negative value labels across dataset
labs <- lapply(d, function(x) attr(x, "labels"))
neg <- unlist(lapply(names(labs), function(v) { l <- labs[[v]]; if (is.null(l)) return(NULL); l <- l[l < 0]; if (!length(l)) return(NULL); paste(unname(l), names(l), sep=" = ") }))
print(sort(table(neg), decreasing = TRUE)[1:40])
