suppressPackageStartupMessages({library(mariposa); library(dplyr)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
res <- list()
for (v in names(allbus)) {
  nf <- tryCatch(na_frequencies(allbus[[v]]), error=function(e) NULL)
  if (is.null(nf) || nrow(nf)==0) next
  nf <- nf[!is.na(nf$code),]
  get <- function(code) sum(nf$n[nf$code==code])
  res[[v]] <- data.frame(var=v, miss=sum(is.na(allbus[[v]])), dk=get("-8"), ref=get("-7"), na9=get("-9"), filt=get("-10")+get("-11")+get("-50"), split=get("-11"), stringsAsFactors=FALSE)
}
df <- bind_rows(res)
lab <- sapply(allbus, function(x) {l <- attr(x,"label"); if (is.null(l)) "" else l})
df$label <- substr(lab[df$var],1,40)
cat("Top 'weiss nicht':\n"); print(head(df %>% arrange(desc(dk)), 25))
cat("\nTop verweigert:\n"); print(head(df %>% arrange(desc(ref)), 12))
# all codes used
codes <- list()
for (v in names(allbus)) { nf <- tryCatch(na_frequencies(allbus[[v]]), error=function(e) NULL); if (!is.null(nf) && nrow(nf)>0) codes[[v]] <- nf[!is.na(nf$code), c("code","label")] }
allc <- bind_rows(codes) %>% count(code, label, sort=TRUE)
print(as.data.frame(allc)[1:40,])
