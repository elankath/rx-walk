#!/usr/bin/env node
import path = require('path');
import Rx = require('@reactivex/rxjs');
import glob = require('glob');
import mm = require('minimatch');
//const go = Rx.Observable.bindNodeCallback(glob);
////console.log("ok..commencing globbinb..");
//
//go("c:/temp/*.pdf").subscribe((f: Array<String>) => console.log(f.length));

export class RxWalk {
    root: string;
    options: mm.Options;

    //public RxWalk(root)
    public foo() {
        console.log("RxWalk's foo!");
    }

}
