# Machbarkeit der Rückwärtssuche: Wie eindeutig ist das Paar (Prozent, Zellen-n)?
suppressMessages({library(dplyr); library(mariposa)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
pv <- untag_na(allbus$pv01); w <- as.numeric(allbus$wghtpew)
items <- list(pe01 = 1:4, pa35 = 1:5, pe05 = 1:4)
subsets <- function(k) { out <- list(); for (m in 1:(2^length(k)-2)) out[[length(out)+1]] <- k[bitwAnd(m, 2^(seq_along(k)-1)) > 0]; out }
extra <- list(c(), -8, -7, -9, c(-8,-7), c(-8,-9), c(-7,-9), c(-8,-7,-9))
cand <- list()
for (it in names(items)) {
  x <- untag_na(allbus[[it]])
  for (s in subsets(items[[it]])) {
    g <- ifelse(x %in% s, 1, ifelse(x %in% items[[it]], 0, NA))   # nur interne Machbarkeitsrechnung, kein Studierenden-Code
    for (e in seq_along(extra)) for (else0 in c(FALSE, TRUE)) {
      pos <- c(91, extra[[e]])
      y <- ifelse(pv %in% pos, 1, ifelse(pv %in% c(1,2,3,4,6,42,90), 0, if (else0) 0 else NA))
      if (else0) y[is.na(pv)] <- NA
      for (wt in c(FALSE, TRUE)) {
        ok <- !is.na(g) & !is.na(y); ww <- if (wt) w[ok] else rep(1, sum(ok))
        tab <- tapply(ww, list(g[ok], y[ok]), sum); tab[is.na(tab)] <- 0
        N <- sum(tab)
        for (r in c("0","1")) for (cc in c("0","1")) {
          n <- tab[r, cc]
          cand[[length(cand)+1]] <- data.frame(item = it, set = paste(s, collapse=","), extra = paste(extra[[e]], collapse=","), else0, wt,
            cell = paste0(r, cc), n = n, row = 100*n/sum(tab[r,]), col = 100*n/sum(tab[,cc]), tot = 100*n/N)
        }
      }
    }
  }
}
cand <- do.call(rbind, cand)
long <- rbind(transform(cand, base="row", p=row), transform(cand, base="col", p=col), transform(cand, base="tot", p=tot))
cat("Kandidaten:", nrow(long), "\n")
# Kollisionen: gleiche Prozentzahl (±0,1) und gleiches n (±1), aber anderer Weg
long$pr <- round(long$p, 1); long$nr <- round(long$n)
key <- paste(long$pr, long$nr)
dups <- table(key); cat("Eindeutige (Prozent, n)-Paare:", sum(dups == 1), "von", length(dups), "Schlüsseln\n")
cat("Anteil Kandidaten mit exakt eindeutigem Paar:", round(mean(dups[key] == 1), 3), "\n")
# Nur Prozent: wie viele Kandidaten teilen sich eine Prozentzahl?
cat("Mittlere Zahl von Wegen je Prozentzahl (ohne n):", round(mean(table(long$pr)[as.character(long$pr)]), 1), "\n")
# Die Referenzwege: wie viele Treffer bei Toleranz ±0,1 / ±1?
hit <- function(p, n) { m <- long[abs(long$p - p) <= 0.1 & abs(long$n - n) <= 1, c("item","set","extra","else0","wt","cell","base","pr","nr")]; m }
cat("\n87,0 / 127:\n"); print(hit(87.0, 127), row.names=FALSE)
cat("\n6,5 / 127:\n"); print(hit(6.5, 127), row.names=FALSE)
cat("\n21,5 / 386:\n"); print(hit(21.5, 386), row.names=FALSE)
cat("\n3,2 / 41:\n"); print(hit(3.2, 41), row.names=FALSE)
cat("\n87,0 ohne n (±0,05):", sum(abs(long$p - 87) <= 0.05), "Kandidaten\n")

# Kanonisieren: Spiegelzwillinge (Menge s mit Zeile 0 = Komplement mit Zeile 1) zusammenlegen
long$grp <- mapply(function(it, s, r) {
  k <- items[[it]]; ss <- as.numeric(strsplit(s, ",")[[1]])
  paste(if (r == "1") ss else setdiff(k, ss), collapse = ",")
}, long$item, long$set, substr(long$cell, 1, 1))
long$out <- substr(long$cell, 2, 2)
long$meaning <- paste(long$item, long$grp, long$extra, long$else0, long$wt, long$out, long$base)
u <- long[!duplicated(long$meaning), ]
cat("\nKanonische Bedeutungen:", nrow(u), "\n")
key <- paste(u$pr, u$nr)
per <- table(key)
cat("Schlüssel (Prozent, n) mit genau 1 Bedeutung:", round(mean(per == 1), 3), "; im Mittel", round(mean(per[key]), 2), "Bedeutungen je Kandidat\n")
# dieselben, aber else0 ignorieren, wenn Zahl identisch
u$m2 <- paste(u$item, u$grp, u$extra, u$wt, u$out, u$base, u$pr, u$nr)
u2 <- u[!duplicated(u$m2), ]; key2 <- paste(u2$pr, u2$nr); per2 <- table(key2)
cat("Nach Zusammenlegen zahlengleicher else0-Varianten: eindeutig", round(mean(per2 == 1), 3), "; Mittel", round(mean(per2[key2]), 2), "\n")
# Nur vertretbares Raster (36 Wege x Zeilenprozente der Zelle misstraut/nicht waehlen)
