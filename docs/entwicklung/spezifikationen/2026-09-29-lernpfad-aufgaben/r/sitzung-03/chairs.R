suppressPackageStartupMessages({library(mariposa); library(dplyr)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
code <- untag_na(allbus$pv01)
w <- as.numeric(allbus$wghtpew)
lr <- function(counts, seats=100) { q <- counts/sum(counts)*seats; s <- floor(q); r <- seats - sum(s); s[order(q - s, decreasing=TRUE)[seq_len(r)]] <- s[order(q - s, decreasing=TRUE)[seq_len(r)]] + 1; s }
labs <- c("1"="CDU/CSU","2"="SPD","3"="FDP","4"="Gruene","6"="Linke","42"="AfD","90"="andere","91"="nicht waehlen","-8"="weiss nicht","-7"="verweigert","-9"="k.A.","-42"="Datenfehler","-50"="nicht wahlber.")
rules <- list(
  R1_nur_klare = c(1,2,3,4,6,42,90,91),
  R3_plus_weissnicht = c(1,2,3,4,6,42,90,91,-8),
  R5_plus_wn_verw = c(1,2,3,4,6,42,90,91,-8,-7),
  R4_alle_wahlber = c(1,2,3,4,6,42,90,91,-8,-7,-9,-42),
  R2_alle = c(1,2,3,4,6,42,90,91,-8,-7,-9,-42,-50))
out <- data.frame(kat = labs)
for (nm in names(rules)) {
  keep <- rules[[nm]]
  cnt <- sapply(as.numeric(names(labs)), function(k) if (k %in% keep) sum(code==k, na.rm=TRUE) else 0)
  cntw <- sapply(as.numeric(names(labs)), function(k) if (k %in% keep) sum(w[code==k], na.rm=TRUE) else 0)
  out[[paste0(nm,"_n")]] <- lr(cnt); out[[paste0(nm,"_w")]] <- lr(cntw)
  cat(nm, "base n =", sum(cnt), " weighted base =", round(sum(cntw)), "\n")
}
print(out)
cat("\nRaw % naive (parties from Raw %, rounded):\n"); tab <- table(code); print(round(tab/sum(tab)*100, 1))
cat("sum of rounded raw % for 8 valid:", sum(round(tab[c("1","2","3","4","6","42","90","91")]/5246*100)), "\n")
# check exact percentages for R3
k3 <- rules$R3_plus_weissnicht; n3 <- sum(code %in% k3); cat("R3 exact %:\n"); print(round(table(code[code %in% k3])/n3*100,2))
