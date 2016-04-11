#!/usr/bin/env node
"use strict";
var sh = require('shelljs');
var fs = require('fs');
var Rx = require('@reactivex/rxjs');
var program = require('commander');
var isWin = /^win/.test(process.platform);
var isCygwin = /^cygwin/.test(process.env.OS);
var stat = Rx.Observable.bindNodeCallback(fs.stat);
var readdir = Rx.Observable.bindNodeCallback(fs.readdir);
if (isCygwin) {
    console.log("Cygwin Environment: will apply path normalization");
}
console.log("Process arguments: ", process.argv);
program
    .version("0.0.1")
    .usage('[filesOrDirs...]')
    .parse(process.argv);
console.log("program args length =", program.args.length);
var args = process.argv.slice(2);
if (!args.length) {
    program.outputHelp();
    process.exit(1);
}
var pathStream = Rx.Observable.fromArray(args)
    .bufferCount(10)
    .map(function (a) { return isCygwin ? cygwinToWinPaths(a) : a; })
    .map(function (p) { console.log("chunked paths=", p); return p; })
    .flatMap(function (a) { return Rx.Observable.fromArray(a); });
var statStream = pathStream.flatMap(function (p) { return stat(p); });
Rx.Observable.zip(pathStream, statStream).subscribe(console.log);
function cygwinToWinPaths(paths) {
    var arg = paths.join(" ");
    return sh.exec("cygpath -am " + arg).output.trim().split(/\r?\n/);
}
function normalizePath(p) {
    if (isCygwin) {
        p = sh.exec("cygpath -aw " + p).output.trim();
        return p;
    }
    else {
        return p;
    }
}
//# sourceMappingURL=walk.js.map