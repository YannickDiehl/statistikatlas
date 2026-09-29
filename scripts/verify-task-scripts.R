# Führt die Lösungsskripte der Lernpfad-Aufgaben aus und meldet Fehler. Aufruf:
#   Rscript --vanilla scripts/verify-task-scripts.R <ordner>
args <- commandArgs(trailingOnly = TRUE)
files <- if (length(args)) list.files(args[1], pattern = "\\.R$", full.names = TRUE) else character(0)
if (!length(files)) { cat("Keine R-Skripte gefunden – Ordner angeben.\n"); quit(status = 1) }
failures <- 0
for (f in files) {
  env <- new.env()
  res <- tryCatch({
    invisible(capture.output(suppressMessages(suppressWarnings(source(f, local = env, print.eval = TRUE)))))
    "ok"
  }, error = function(e) conditionMessage(e))
  cat(basename(f), ":", res, "\n")
  if (res != "ok") failures <- failures + 1
}
cat(length(files) - failures, "von", length(files), "Skripten laufen fehlerfrei.\n")
if (failures > 0) quit(status = 1)
