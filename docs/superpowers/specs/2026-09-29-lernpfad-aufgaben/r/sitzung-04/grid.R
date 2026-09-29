suppressMessages({library(dplyr); library(mariposa)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")

items <- list(
  pe01_voll = "1=1 [misstraut]; 2:4=0 [uebrige]; else=NA",
  pe01_weit = "1:2=1 [misstraut]; 3:4=0 [uebrige]; else=NA",
  pa35_voll = "1=1 [misstraut]; 2:5=0 [uebrige]; else=NA",
  pa35_weit = "1:2=1 [misstraut]; 3:5=0 [uebrige]; else=NA",
  pe05_voll = "4=1 [misstraut]; 1:3=0 [uebrige]; else=NA",        # umgepolt: gar nicht zu
  pe05_weit = "3:4=1 [misstraut]; 1:2=0 [uebrige]; else=NA",      # umgepolt: eher nicht/gar nicht
  pe05_FALSCH = "1:2=1 [misstraut]; 3:4=0 [uebrige]; else=NA"     # Stolperweg: nicht umgepolt
)
nw <- list(
  n91      = list(src = "pv01", rules = "91=1 [nicht]; 1:90=0 [waehlen]; else=NA"),
  n91wn    = list(src = "u",    rules = "91=1 [nicht]; -8=1; 1:90=0 [waehlen]; else=NA"),
  n91wnvw  = list(src = "u",    rules = "91=1 [nicht]; -8:-7=1; 1:90=0 [waehlen]; else=NA"),
  FALSCH_else0 = list(src = "u", rules = "91=1 [nicht]; -8=1; else=0")   # Stolperweg: -50/-9/-7/-42 als Waehler
)
allbus$pv01_u <- untag_na(allbus$pv01)
out <- list()
for (i in names(items)) for (o in names(nw)) for (w in c(FALSE, TRUE)) {
  d <- allbus %>% mutate(m = rec(!!sym(sub("_.*", "", i)), rules = items[[i]]),
                         y = rec(if (nw[[o]]$src == "u") pv01_u else pv01, rules = nw[[o]]$rules))
  ct <- if (w) suppressWarnings(crosstab(d, m, y, percentages = "all", weights = wghtpew)) else crosstab(d, m, y, percentages = "all")
  tab <- ct$table
  out[[length(out)+1]] <- data.frame(item = i, nichtwahl = o, gew = w,
     row_nw = ct$row_pct["1","1"], row_rest = ct$row_pct["0","1"],
     col = ct$col_pct["1","1"], total = ct$total_pct["1","1"],
     zelle = tab["1","1"], zeile = sum(tab["1",]), spalte = sum(tab[,"1"]), N = sum(tab))
}
res <- do.call(rbind, out)
res[,4:7] <- round(res[,4:7], 1); res[,8:11] <- round(res[,8:11], 1)
options(width = 200); print(res, row.names = FALSE)
write.csv(res, "grid-aggregat.csv", row.names = FALSE)
