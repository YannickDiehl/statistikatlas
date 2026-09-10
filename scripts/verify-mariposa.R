options(warn=1)
args <- commandArgs(trailingOnly=TRUE)
stopifnot(length(args)==2L)
source_dir <- normalizePath(args[1])
setwd(normalizePath(args[2]))
pkgload::load_all(source_dir, export_all=FALSE, helpers=FALSE, compile=FALSE, quiet=TRUE)
stopifnot(as.character(utils::packageVersion('mariposa'))=='0.7.2')
source('start.R')
examples <- jsonlite::fromJSON('examples.json', simplifyVector=FALSE)
results <- list()
# Writers run first to make actual input fixtures for SAV, DTA, XPT, and XLSX.
order <- order(vapply(examples, function(x) if(startsWith(x$fn,'write_')) 0 else if(startsWith(x$fn,'read_')) 2 else 1, numeric(1)))
for(i in order){
 ex <- examples[[i]]; warns<-character(); status<-'ok'; detail<-''
 tryCatch({
  expr <- parse(text=ex$code)
  if(ex$fn %in% c('read_por','read_sas')){status<-'parsed_external_file_required'} else {
   env<-new.env(parent=globalenv());env$atlas<-atlas
   invisible(capture.output(withCallingHandlers(eval(expr,envir=env),warning=function(w){warns<<-c(warns,conditionMessage(w));invokeRestart('muffleWarning')})))
  }
 },error=function(e){status<<-'failed';detail<<-conditionMessage(e)})
 results[[length(results)+1]]<-list(id=ex$id,fn=ex$fn,label=ex$label,status=status,detail=detail,warnings=unique(warns))
 cat(ex$fn, ex$label, status, if(nzchar(detail)) detail else '', '\n')
}
jsonlite::write_json(results,'results.json',pretty=TRUE,auto_unbox=TRUE)
if(any(vapply(results,function(x)x$status=='failed',logical(1))))quit(status=1)
