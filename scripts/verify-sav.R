# Prüft die SPSS-Datei des Atlas (src/domain/savWriter.ts): liest sie mit mariposa::read_spss() und
# haven::read_sav(), vergleicht alle 200 × 29 Werte mit der CSV und prüft Variablen- und Wertelabels.
#   node --import tsx scripts/generate-mariposa-check.ts <prüfverzeichnis>
#   Rscript --vanilla scripts/verify-sav.R <mariposa-quellbaum> <prüfverzeichnis>
args <- commandArgs(trailingOnly = TRUE)
stopifnot(length(args) == 2L)
pkgload::load_all(normalizePath(args[1]), export_all = FALSE, helpers = FALSE, compile = FALSE, quiet = TRUE)
setwd(normalizePath(args[2]))
sav <- "Statistikatlas-200-Befragte.sav"
csv <- utils::read.csv2("Statistikatlas-200-Befragte-synthetisch.csv", fileEncoding = "UTF-8-BOM",
                        colClasses = c("character", rep("numeric", 28)), check.names = FALSE)
codebook <- jsonlite::fromJSON("codebook-check.json", simplifyVector = FALSE)
problems <- character()
check <- function(ok, text) if (!isTRUE(ok)) problems <<- c(problems, text)

compare <- function(data, reader) {
  check(identical(dim(data), c(200L, 29L)), sprintf("%s: %s statt 200 × 29", reader, paste(dim(data), collapse = " × ")))
  check(identical(names(data), names(csv)), sprintf("%s: Spaltennamen weichen ab", reader))
  check(identical(as.character(data$id), csv$id), sprintf("%s: id weicht ab", reader))
  cells <- 200L
  for (m in codebook) {
    x <- data[[m$id]]
    values <- as.numeric(unclass(x))
    attributes(values) <- NULL
    check(identical(values, csv[[m$id]]), sprintf("%s: Werte von %s weichen ab", reader, m$id))
    cells <- cells + sum(values == csv[[m$id]], na.rm = TRUE)
    check(identical(attr(x, "label", exact = TRUE), m$label), sprintf("%s: Variablenlabel von %s weicht ab", reader, m$id))
    labels <- attr(x, "labels", exact = TRUE)
    expected <- if (length(m$categories)) stats::setNames(vapply(m$categories, function(k) as.numeric(k$value), 1), vapply(m$categories, function(k) k$label, "")) else NULL
    check(identical(unclass(labels), expected) || (is.null(labels) && is.null(expected)), sprintf("%s: Wertelabels von %s weichen ab", reader, m$id))
  }
  cat(sprintf("%s: %d von %d Zellen gleich der CSV (200 × 29), Labels von %d Variablen geprüft\n", reader, cells, 200L * 29L, length(codebook)))
}

compare(read_spss(sav), "mariposa::read_spss()")
compare(haven::read_sav(sav), "haven::read_sav()")
first <- haven::read_sav(sav)
cat("Beispiel:", first$id[1], "lernzeit =", first$lernzeit[1], "|", attr(first$lernplanung5, "label"), "|",
    names(attr(first$lernplanung5, "labels"))[1], "\n")
if (length(problems)) {
  cat("Abweichungen:\n", paste("-", problems, collapse = "\n"), "\n")
  quit(status = 1)
}
cat("verify-sav: alle Werte und Labels stimmen.\n")
