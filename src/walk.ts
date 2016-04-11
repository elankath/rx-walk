#!/usr/bin/env node
import sh = require('shelljs');
import fs = require('fs');
import path = require('path')
import Rx = require('@reactivex/rxjs');
import program = require('commander');

const isWin = /^win/.test(process.platform);
const isCygwin = /^cygwin/.test(process.env.OS);
const stat = Rx.Observable.bindNodeCallback(fs.stat);
const readdir = Rx.Observable.bindNodeCallback(fs.readdir);

if (isCygwin) {
    console.log("Cygwin Environment: will apply path normalization")
}
console.log("Process arguments: ", process.argv);
program
    .version("0.0.1")
    .usage('[filesOrDirs...]')
    .parse(process.argv)
console.log("program args length =", program.args.length);

const args = process.argv.slice(2);
if (!args.length) {
    program.outputHelp();
    process.exit(1);
}

const pathStream:Rx.Observable<string> = Rx.Observable.fromArray(args)
    .bufferCount(10) //call cygwinToWinPaths in chunks for performance
    .map((a: Array<string>) => isCygwin ? cygwinToWinPaths(a) : a)
    .map(p => {console.log("chunked paths=", p); return p})
    .flatMap(a => Rx.Observable.fromArray(a));
const statStream = pathStream.flatMap(p => stat(p));

//this version doesn't recurse into directories.
Rx.Observable.zip(pathStream, statStream).subscribe(console.log);


//.map((p:string) => {
//    stat(p).subscribe((stats: fs.Stats) => {
//        return new Info(p, stats);
//    });
//})
//.map()
//.flatMap((s: fs.Stats) => {
//    if (s.isDirectory()) {
//        readdir(s.)
//    }
//})
//.subscribe(s => console.log("please be individual: ", s));
// .map(p => {console.log("paths=", p); return p})
// .flatMap(f => stat(f))

function cygwinToWinPaths(paths: Array<string>): Array<string> {
    const arg = paths.join(" ");
    return sh.exec(`cygpath -am ${arg}`).output.trim().split(/\r?\n/);
}

function normalizePath(p: string) {
    if (isCygwin) {
        p = sh.exec("cygpath -aw " + p).output.trim()
        return p;
    } else {
        return p
    }
}

// const nargs = process.argv.length;
// console.log("Process arguments: ", nargs)
// if (nargs < 3) {
//     console.error("clbkfn: please specify files");
//     process.exit(1);
// }
// process.argv.splice(1, process.argv.length - 1).forEach(val=> {
//     console.log("argument: ", val);
//     let p = path.resolve(normalizePath(val));
//     stat(p).subscribe(s => console.log(s));
//     console.log("tringo");
// })
