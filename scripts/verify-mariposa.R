# Führt alle Katalogaufrufe gegen den mariposa-Quellstand 0.7.4 auf der SPSS-Datei des Atlas aus.
#   node --import tsx scripts/generate-mariposa-check.ts <prüfverzeichnis> <mariposa-quellbaum>
#   Rscript --vanilla scripts/verify-mariposa.R <mariposa-quellbaum> <prüfverzeichnis>
# Jeder Aufruf beginnt mit dem Startblock (library(dplyr), library(mariposa), read_spss()).
options(warn = 1, cli.num_colors = 1, crayon.enabled = FALSE)
args <- commandArgs(trailingOnly = TRUE)
stopifnot(length(args) == 2L)
source_dir <- normalizePath(args[1])
setwd(normalizePath(args[2]))
pkgload::load_all(source_dir, export_all = FALSE, helpers = FALSE, compile = FALSE, quiet = TRUE)
stopifnot(as.character(utils::packageVersion("mariposa")) == "0.7.4")
# Der Startblock muss allein laufen; library(mariposa) behält den geladenen Quellstand.
source("start.R")
stopifnot(as.character(utils::packageVersion("mariposa")) == "0.7.4", nrow(atlas) == 200L, ncol(atlas) == 29L)
examples <- jsonlite::fromJSON("examples.json", simplifyVector = FALSE)
results <- list()
for (ex in examples) {
  warns <- character(); status <- "ok"; detail <- ""
  tryCatch({
    expr <- parse(text = ex$code)
    if (ex$fn %in% c("read_por", "read_sas")) {
      status <- "parsed_external_file_required"
    } else {
      env <- new.env(parent = globalenv())
      invisible(capture.output(withCallingHandlers(
        for (e in expr) eval(e, envir = env),
        warning = function(w) { warns <<- c(warns, conditionMessage(w)); invokeRestart("muffleWarning") },
        message = function(m) invokeRestart("muffleMessage")
      )))
    }
  }, error = function(e) { status <<- "failed"; detail <<- conditionMessage(e) })
  results[[length(results) + 1]] <- list(id = ex$id, key = ex$key, fn = ex$fn, label = ex$label, status = status, detail = detail, warnings = unique(warns))
  cat(ex$key, ex$fn, status, if (nzchar(detail)) detail else "", if (length(warns)) paste0("[", length(unique(warns)), " Warnung(en)]") else "", "\n")
}
jsonlite::write_json(results, "results.json", pretty = TRUE, auto_unbox = TRUE)
status <- vapply(results, function(x) x$status, character(1))
cat(sprintf("\n%d Aufrufe: %d ok, %d nur geparst, %d fehlgeschlagen, %d mit Warnungen\n", length(status), sum(status == "ok"), sum(status == "parsed_external_file_required"), sum(status == "failed"), sum(vapply(results, function(x) length(x$warnings) > 0, logical(1)))))
if (any(status == "failed")) quit(status = 1)
