suppressMessages(library(mariposa)); suppressMessages(library(dplyr)); library(haven)
a <- haven::read_sav("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav", user_na = TRUE)
for (v in c("pv01","pe09","pa02a","pe01","pp18","sm03","sm01","german","educ","eastwest","sex","incc","mode","agec","ps03","isced97","pa01","pe02","pe04","pe06","lp05","work","mstat","hs01","ls01","id02")) {
  x <- a[[v]]
  cat("\n==", v, "-", attr(x,"label"), "\n")
  tb <- table(as.numeric(x), useNA="ifany")
  lb <- attr(x,"labels")
  nm <- names(tb); labs <- sapply(nm, function(k) { m <- names(lb)[lb==as.numeric(k)]; if(length(m)) m[1] else "" })
  print(data.frame(code=nm, n=as.integer(tb), label=substr(labs,1,40)), row.names=FALSE)
}
cat("\nage summary\n"); print(summary(as.numeric(a$age)))
