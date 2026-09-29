# Führt die vom Sandbox-Generator erzeugten mariposa-Skripte aus und vergleicht
# die Zeilenprozente mit dem Rechenkern. Aufruf:
#   Rscript --vanilla scripts/verify-sandbox-r.R <grid.json>
suppressMessages({ library(mariposa); library(dplyr); library(jsonlite) })
args <- commandArgs(trailingOnly = TRUE)
grid <- fromJSON(args[1], simplifyDataFrame = FALSE)
cache <- new.env()
cached_read <- function(path) {
  if (is.null(cache[[path]])) cache[[path]] <- mariposa::read_spss(path)
  cache[[path]]
}
failures <- 0
for (entry in grid) {
  env <- new.env()
  env$read_spss <- cached_read
  suppressMessages(eval(parse(text = entry$setup), envir = env))
  ct <- suppressWarnings(eval(parse(text = entry$table), envir = env))
  got <- c(ct$row_pct["1", "1"], ct$row_pct["2", "1"])
  want <- c(entry$target, entry$comparison)
  if (any(abs(got - want) > 0.05)) {
    failures <- failures + 1
    cat("ABWEICHUNG", entry$claim, paste(entry$levels, collapse = " / "), ": R", round(got, 2), "Sandbox", round(want, 2), "\n")
  }
}
cat(length(grid) - failures, "von", length(grid), "Wegen stimmen überein.\n")
if (failures > 0) quit(status = 1)
