import {Component} from '@angular/core';

import {PhotoService} from '../album/photo.service';
import {NavController, NavParams} from 'ionic-angular';

declare var Caman;
declare function require(name: string);
@Component({
    selector: 'onePic',
    templateUrl: 'onePic.html'
})

export class OnePic {
    private pic: string;
    private title: string;

    //private Canvas = require('canvas');

    constructor(private photoService: PhotoService,
        public navCtrl: NavController,
        public params:NavParams) {
        
        this.pic = photoService.getSelected();
        this.title = params.get("title");
        if (!this.title) this.title = "Album";
    };

    private addFilter() {
        new Caman('#myImage', function () {
            console.log()
            this.lomo();
            this.render();

        });
    }
    
    exit(){
        this.navCtrl.pop({animation: 'fade-transition', direction: 'back'});
    }
    
    getSquareSize(){
        if (window.innerWidth > window.innerHeight){
            return window.innerWidth/2;
        }
        return window.innerWidth;
    }
    
    getBackground(){
        return "url(" +this.pic+")";
    }
}
