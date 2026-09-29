suppressPackageStartupMessages({library(mariposa); library(dplyr)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
allbus %>% describe(xt10, show = "all") %>% print()
allbus %>% group_by(mode) %>% describe(xt10, show="all") %>% print()
allbus %>% group_by(mode) %>% summarise(n=n(), miss=sum(is.na(xt10)), q=list(quantile(xt10, c(.01,.05,.1,.25,.5,.75,.9,.95,.99), na.rm=TRUE))) %>% as.data.frame() %>% print()
for (m in c(2,3,4)) {cat(m, "\n"); print(round(quantile(allbus$xt10[allbus$mode==m], c(.01,.05,.1,.25,.5,.75,.9,.95,.99), na.rm=TRUE),1))}
cat("n>180:", sum(allbus$xt10>180, na.rm=TRUE), " n>600:", sum(allbus$xt10>600, na.rm=TRUE), " n>1440:", sum(allbus$xt10>1440, na.rm=TRUE),"\n")
print(table(allbus$mode, allbus$xt10>180, useNA="ifany"))
print(table(allbus$mode, is.na(allbus$xt10)))
